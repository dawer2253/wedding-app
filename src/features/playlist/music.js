import { supabase } from "@/lib/supabase";

// Wyszukiwarka chodzi przez Edge Function „music-search", która odpytuje
// Deezera i iTunes naraz. Powód proxy: api.deezer.com nie odsyła
// Access-Control-Allow-Origin, więc przeglądarka nie zawoła go sama.
// Powód dwóch źródeł: iTunes nie ma współczesnego polskiego rapu,
// a Deezer gubi disco polo przy zapytaniu o samą nazwę zespołu.

export async function searchTracks(term, { signal } = {}) {
   const { data, error } = await supabase.functions.invoke("music-search", {
      body: { action: "search", term },
      signal,
   });

   if (error) {
      // przerwane żądanie (nowy znak w polu) nie jest błędem do pokazania —
      // invoke opakowuje abort we własny błąd, więc rozpoznajemy go po sygnale
      if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
      throw new Error("Nie udało się połączyć z wyszukiwarką.");
   }
   if (data?.error) throw new Error(data.error);

   return data?.tracks ?? [];
}

// Link do próbki Deezera żyje ok. 15 minut, więc utwory z listy mają w bazie
// puste previewUrl i świeży link pobierany jest dopiero przy kliknięciu play.
// Cache trzyma go przez 10 minut, żeby play/pause nie strzelał za każdym razem
const PREVIEW_TTL_MS = 10 * 60 * 1000;
const previewCache = new Map();

export async function resolvePreviewUrl(externalId) {
   const cached = previewCache.get(externalId);
   if (cached && Date.now() - cached.at < PREVIEW_TTL_MS) return cached.url;

   const { data, error } = await supabase.functions.invoke("music-search", {
      body: { action: "preview", trackId: externalId },
   });
   if (error || data?.error || !data?.previewUrl) {
      throw new Error("Nie udało się pobrać próbki.");
   }

   previewCache.set(externalId, { url: data.previewUrl, at: Date.now() });
   return data.previewUrl;
}

// 187000 → "3:07"
export function formatDuration(durationMs) {
   if (!durationMs) return "";
   const totalSeconds = Math.round(durationMs / 1000);
   const minutes = Math.floor(totalSeconds / 60);
   const seconds = String(totalSeconds % 60).padStart(2, "0");
   return `${minutes}:${seconds}`;
}
