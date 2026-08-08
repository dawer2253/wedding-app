import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Music } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
   Sheet,
   SheetContent,
   SheetDescription,
   SheetHeader,
   SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
   Empty,
   EmptyDescription,
   EmptyHeader,
   EmptyMedia,
   EmptyTitle,
} from "@/components/ui/empty";
import { useSheetParams } from "@/hooks/useSheetParams";
import TrackForm from "./TrackForm";
import { addPlaylistItem, updatePlaylistItem } from "../api";
import {
   maxSortOrderIn,
   selectPlaylistByCategory,
   selectPlaylistItemById,
   selectPlaylistLoading,
} from "../selectors";
import {
   CATEGORIES,
   CATEGORY_LABELS,
   PLAYLIST_FORM_EMPTY_VALUES,
} from "../constants";

// Panel ręcznego dodawania i edycji utworu, sterowany parametrami
// ?new=1 / ?edit=<id>. Ścieżką domyślną jest wyszukiwarka — tu trafiają
// kawałki, których w iTunes nie ma (wolne wnioski, granie lokalne)
export default function TrackSheet() {
   const dispatch = useAppDispatch();
   const { isNew, editId } = useSheetParams();
   const [searchParams, setSearchParams] = useSearchParams();
   const weddingId = useAppSelector((state) => state.wedding.activeWedding?.id);
   const item = useAppSelector((state) =>
      editId ? selectPlaylistItemById(state, editId) : null,
   );
   const loading = useAppSelector(selectPlaylistLoading);
   const sections = useAppSelector(selectPlaylistByCategory);
   const open = isNew || Boolean(editId);

   // sekcja, z której otwarto panel — walidowana, bo leci z URL-a
   const categoryParam = searchParams.get("category");
   const category = CATEGORIES.includes(categoryParam)
      ? categoryParam
      : PLAYLIST_FORM_EMPTY_VALUES.category;

   // własne zamknięcie zamiast close() z hooka — trzeba sprzątnąć też
   // parametr category, żeby nie został w URL-u po zamknięciu panelu
   const close = useCallback(() => {
      setSearchParams(
         (prev) => {
            const next = new URLSearchParams(prev);
            next.delete("new");
            next.delete("edit");
            next.delete("category");
            return next;
         },
         { replace: true },
      );
   }, [setSearchParams]);

   async function handleCreate(data) {
      try {
         await dispatch(
            addPlaylistItem({ ...data, source: "manual", weddingId }),
         ).unwrap();
         toast.success("Dodano utwór");
         close();
      } catch (err) {
         toast.error(err);
      }
   }

   async function handleUpdate(data) {
      // Zmiana kategorii z formularza musi dokleić utwór na koniec docelowej
      // listy — inaczej zostaje ze starym sortOrder i ląduje w środku cudzej
      // kolejności. Przeniesienie z menu wiersza robi dokładnie to samo
      const changes =
         data.category === item.category
            ? data
            : {
                 ...data,
                 sortOrder: maxSortOrderIn(sections[data.category]) + 1,
              };
      try {
         await dispatch(
            updatePlaylistItem({ id: editId, changes }),
         ).unwrap();
         toast.success("Zapisano zmiany");
         close();
      } catch (err) {
         toast.error(err);
      }
   }

   return (
      <Sheet open={open} onOpenChange={(value) => !value && close()}>
         {/* w-full! — bazowe data-[side=right]:w-3/4 sheeta ma wyższą
             specyficzność niż zwykłe w-full */}
         <SheetContent className="w-full! gap-0 sm:max-w-xl">
            <SheetHeader>
               <SheetTitle>{editId ? "Edytuj utwór" : "Nowy utwór"}</SheetTitle>
               <SheetDescription>
                  {editId && item
                     ? [item.title, item.artist].filter(Boolean).join(" — ")
                     : `Dodasz go do kategorii „${CATEGORY_LABELS[category]}".`}
               </SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-4 pb-4">
               {isNew && (
                  <TrackForm
                     defaultValues={{ category }}
                     onSubmit={handleCreate}
                     onCancel={close}
                     submitLabel="Dodaj utwór"
                  />
               )}
               {editId && item && (
                  <TrackForm
                     key={editId}
                     defaultValues={Object.fromEntries(
                        Object.keys(PLAYLIST_FORM_EMPTY_VALUES).map((field) => [
                           field,
                           item[field] ?? PLAYLIST_FORM_EMPTY_VALUES[field],
                        ]),
                     )}
                     onSubmit={handleUpdate}
                     onCancel={close}
                     submitLabel="Zapisz zmiany"
                  />
               )}
               {editId && !item && loading && (
                  <Skeleton className="h-80 rounded-xl" />
               )}
               {editId && !item && !loading && (
                  <Empty>
                     <EmptyHeader>
                        <EmptyMedia variant="icon">
                           <Music />
                        </EmptyMedia>
                        <EmptyTitle>Nie znaleziono utworu</EmptyTitle>
                        <EmptyDescription>
                           Utwór mógł zostać usunięty albo link jest
                           nieaktualny.
                        </EmptyDescription>
                     </EmptyHeader>
                  </Empty>
               )}
            </div>
         </SheetContent>
      </Sheet>
   );
}
