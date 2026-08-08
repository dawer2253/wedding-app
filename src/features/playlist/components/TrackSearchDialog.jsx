import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Check, Music, Plus, SearchX } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import Input from "@/components/Input";
import Select from "@/components/Select";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
} from "@/components/ui/dialog";
import PreviewButton from "./PreviewButton";
import { searchTracks, formatDuration } from "../music";
import { addPlaylistItem } from "../api";
import { selectAddedExternalIds } from "../selectors";
import { CATEGORIES, CATEGORY_LABELS } from "../constants";

const MIN_QUERY_LENGTH = 2;
// Każde wpisane zapytanie to dwa zewnętrzne odpytania (Deezer + iTunes)
// przez Edge Function — bez debounce'u strzelalibyśmy przy każdym znaku
const DEBOUNCE_MS = 400;

// Deezer i iTunes numerują utwory niezależnie, więc identyfikator
// musi zawierać źródło
const trackKey = (track) => `${track.source}:${track.externalId}`;

export default function TrackSearchDialog({
   open,
   onOpenChange,
   category,
   onCategoryChange,
}) {
   return (
      <Dialog open={open} onOpenChange={onOpenChange}>
         <DialogContent className="flex max-h-[85dvh] flex-col gap-4 sm:max-w-2xl">
            <DialogHeader>
               <DialogTitle>Dodaj utwór</DialogTitle>
               <DialogDescription>
                  Wyszukaj po tytule lub wykonawcy. Okno zostaje otwarte, więc
                  możesz dodać kilka utworów pod rząd.
               </DialogDescription>
            </DialogHeader>
            {/* Panel jest osobnym komponentem, bo Radix odmontowuje zawartość
                po zamknięciu — stan wyszukiwania zeruje się sam */}
            <SearchPanel
               category={category}
               onCategoryChange={onCategoryChange}
               onOpenChange={onOpenChange}
            />
         </DialogContent>
      </Dialog>
   );
}

function SearchPanel({ category, onCategoryChange, onOpenChange }) {
   const dispatch = useAppDispatch();
   const navigate = useNavigate();
   const weddingId = useAppSelector((state) => state.wedding.activeWedding?.id);
   const addedIds = useAppSelector(selectAddedExternalIds);
   const [term, setTerm] = useState("");
   const [addingId, setAddingId] = useState(null);
   const [result, setResult] = useState({
      query: "",
      status: "done",
      tracks: [],
      error: "",
   });

   const query = term.trim();
   const isQueryValid = query.length >= MIN_QUERY_LENGTH;

   // Status wyliczany, nie trzymany: dopóki odpowiedź nie dotyczy aktualnego
   // zapytania, wiadomo że szukanie trwa
   const status = !isQueryValid
      ? "idle"
      : result.query === query
        ? result.status
        : "loading";

   useEffect(() => {
      if (!isQueryValid) return;

      const controller = new AbortController();
      const timer = setTimeout(() => {
         searchTracks(query, { signal: controller.signal })
            .then((tracks) =>
               setResult({ query, status: "done", tracks, error: "" }),
            )
            .catch((err) => {
               // przerwanie to nasza decyzja, nie błąd do pokazania
               if (err.name === "AbortError") return;
               setResult({
                  query,
                  status: "error",
                  tracks: [],
                  error: err.message,
               });
            });
      }, DEBOUNCE_MS);

      return () => {
         clearTimeout(timer);
         controller.abort();
      };
   }, [query, isQueryValid]);

   async function handleAdd(track) {
      setAddingId(trackKey(track));
      try {
         await dispatch(
            addPlaylistItem({
               ...track,
               category,
               note: "",
               weddingId,
               // link Deezera wygasa po ok. 15 minutach, więc go nie zapisujemy —
               // przy odtwarzaniu z listy pobierzemy świeży po externalId
               previewUrl: track.source === "deezer" ? "" : track.previewUrl,
            }),
         ).unwrap();
         toast.success(`Dodano „${track.title}"`);
      } catch (err) {
         toast.error(err);
      } finally {
         setAddingId(null);
      }
   }

   // utwory spoza iTunes (wolne wnioski, granie lokalne) wpisuje się ręcznie
   function handleManualAdd() {
      onOpenChange(false);
      navigate({ search: `?new=1&category=${category}` });
   }

   return (
      <>
         <div className="grid gap-3 sm:grid-cols-[1fr_15rem]">
            <Input
               label="Szukaj"
               autoFocus
               placeholder="np. sanah, Perfect, Kayah"
               value={term}
               onChange={(event) => setTerm(event.target.value)}
            />
            <Select
               label="Dodaj do kategorii"
               options={CATEGORIES.map((value) => ({
                  value,
                  label: CATEGORY_LABELS[value],
               }))}
               value={category}
               onChange={(event) => onCategoryChange(event.target.value)}
            />
         </div>

         <div className="min-h-40 flex-1 overflow-y-auto">
            {status === "idle" && (
               <p className="p-4 text-center text-sm text-muted-foreground">
                  Wpisz co najmniej {MIN_QUERY_LENGTH} znaki, żeby zobaczyć
                  wyniki.
               </p>
            )}

            {status === "loading" && (
               <div className="flex items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
                  <Spinner />
                  Szukam…
               </div>
            )}

            {status === "error" && (
               <p className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
                  {result.error}
               </p>
            )}

            {status === "done" && result.tracks.length === 0 && (
               <div className="flex flex-col items-center gap-2 p-6 text-center text-sm text-muted-foreground">
                  <SearchX className="size-6" />
                  <p>Nic nie znaleziono dla „{query}".</p>
               </div>
            )}

            {status === "done" && result.tracks.length > 0 && (
               <ul className="space-y-1">
                  {result.tracks.map((track) => {
                     const key = trackKey(track);
                     const isAdded = addedIds.has(key);
                     const duration = formatDuration(track.durationMs);
                     return (
                        <li
                           key={key}
                           className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-muted/60"
                        >
                           {track.artworkUrl ? (
                              <img
                                 src={track.artworkUrl}
                                 alt=""
                                 loading="lazy"
                                 className="size-10 shrink-0 rounded-md object-cover"
                              />
                           ) : (
                              <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                 <Music className="size-4" />
                              </div>
                           )}
                           <div className="min-w-0 flex-1">
                              <p className="truncate font-medium">
                                 {track.title}
                              </p>
                              <p className="truncate text-sm text-muted-foreground">
                                 {[track.artist, track.album]
                                    .filter(Boolean)
                                    .join(" · ")}
                              </p>
                           </div>
                           {duration && (
                              <span className="hidden shrink-0 text-sm tabular-nums text-muted-foreground sm:inline">
                                 {duration}
                              </span>
                           )}
                           <PreviewButton
                              previewUrl={track.previewUrl}
                              externalId={track.externalId}
                              source={track.source}
                              title={track.title}
                           />
                           {isAdded ? (
                              <span className="flex shrink-0 items-center gap-1 px-2 text-sm text-muted-foreground">
                                 <Check className="size-4" />
                                 <span className="hidden sm:inline">
                                    Na liście
                                 </span>
                              </span>
                           ) : (
                              <Button
                                 size="sm"
                                 variant="outline"
                                 className="shrink-0"
                                 disabled={addingId === key}
                                 onClick={() => handleAdd(track)}
                              >
                                 {addingId === key ? (
                                    <Spinner />
                                 ) : (
                                    <Plus />
                                 )}
                                 Dodaj
                              </Button>
                           )}
                        </li>
                     );
                  })}
               </ul>
            )}
         </div>

         <p className="border-t pt-3 text-sm text-muted-foreground">
            Nie znajdujesz utworu?{" "}
            <Button
               variant="link"
               className="h-auto p-0"
               onClick={handleManualAdd}
            >
               Dodaj go ręcznie
            </Button>
         </p>
      </>
   );
}
