import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { resolvePreviewUrl } from "../music";

// Jeden element audio na cały moduł: start kolejnej próbki przerywa
// poprzednią, bez przekazywania stanu między wierszami. Komponenty
// subskrybują się do zmiany, żeby przełączyć ikonę play/pause.
let audio = null;
let currentId = null;
const subscribers = new Set();

function notify() {
   for (const subscriber of subscribers) subscriber(currentId);
}

function stop() {
   if (audio) {
      audio.pause();
      audio = null;
   }
   currentId = null;
   notify();
}

function play(id, url) {
   stop();
   audio = new Audio(url);
   audio.addEventListener("ended", stop);
   // przeglądarka może zablokować odtwarzanie (autoplay policy) —
   // wtedy wracamy do stanu spoczynku zamiast zostawiać wciśnięty pause
   audio.play().catch(stop);
   currentId = id;
   notify();
}

export default function PreviewButton({ previewUrl, externalId, source, title }) {
   const [playingId, setPlayingId] = useState(currentId);
   const [loading, setLoading] = useState(false);

   // rozróżniamy utwory po id, bo ten sam kawałek bywa i na liście,
   // i w wynikach wyszukiwania, a link Deezera do niego się różni
   const id = externalId ? `${source}:${externalId}` : previewUrl;

   useEffect(() => {
      subscribers.add(setPlayingId);
      return () => subscribers.delete(setPlayingId);
   }, []);

   // utwór zniknął z listy w trakcie odtwarzania — cisza zamiast grania w tle
   useEffect(() => {
      return () => {
         if (currentId === id) stop();
      };
   }, [id]);

   // Deezer zawsze da się odtworzyć (link dociągamy na żądanie),
   // reszta tylko jeśli ma zapisany link
   const canPlay = Boolean(previewUrl) || (source === "deezer" && externalId);
   if (!canPlay) return null;

   const isPlaying = playingId === id;

   async function handleClick() {
      if (isPlaying) return stop();
      if (previewUrl) return play(id, previewUrl);

      setLoading(true);
      try {
         play(id, await resolvePreviewUrl(externalId));
      } catch (err) {
         toast.error(err.message);
      } finally {
         setLoading(false);
      }
   }

   return (
      <Button
         type="button"
         variant="ghost"
         size="icon"
         className="shrink-0 text-muted-foreground"
         disabled={loading}
         aria-label={
            isPlaying ? `Zatrzymaj: ${title}` : `Odtwórz fragment: ${title}`
         }
         onClick={handleClick}
      >
         {loading ? <Spinner /> : isPlaying ? <Pause /> : <Play />}
      </Button>
   );
}
