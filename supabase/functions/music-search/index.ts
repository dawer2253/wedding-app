// Wyszukiwarka utworów dla playlisty weselnej.
//
// Odpytuje Deezera i iTunes RÓWNOLEGLE i przeplata wyniki, bo żadne z tych
// źródeł samo nie pokrywa polskiego repertuaru weselnego:
//   - Deezer zna współczesny polski rap i pop (np. „CALIFORNIA LOVE" White 2115),
//     którego iTunes w ogóle nie ma w katalogu,
//   - iTunes trafia w disco polo po samej nazwie zespołu („Toples", „After Party"),
//     gdzie Deezer wyrzuca przypadkowych zagranicznych wykonawców.
//
// Proxy jest konieczne, bo api.deezer.com nie odsyła Access-Control-Allow-Origin,
// więc przeglądarka nie może go zawołać bezpośrednio.

const CORS = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
   "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const LIMIT = 15;
const MIN_QUERY_LENGTH = 2;

const json = (body: unknown, status = 200) =>
   new Response(JSON.stringify(body), {
      status,
      headers: { ...CORS, "Content-Type": "application/json" },
   });

type Track = {
   externalId: string;
   source: "deezer" | "itunes";
   title: string;
   artist: string;
   album: string;
   artworkUrl: string;
   previewUrl: string;
   durationMs: number | null;
};

// Klucz do odsiewania duplikatów między źródłami — bez diakrytyków,
// interpunkcji i wielkości liter. Wersje utworu („- Radio Edit") zostają
// osobno, bo to realnie różne nagrania
const dedupeKey = (artist: string, title: string) =>
   `${artist}|${title}`
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9|]+/g, "");

async function searchDeezer(term: string): Promise<Track[]> {
   const res = await fetch(
      `https://api.deezer.com/search?q=${encodeURIComponent(term)}&limit=${LIMIT}`,
   );
   if (!res.ok) return [];
   const data = await res.json();
   return (data.data ?? [])
      .filter((t: any) => t.id && t.title)
      .map((t: any) => ({
         externalId: String(t.id),
         source: "deezer" as const,
         title: t.title,
         artist: t.artist?.name ?? "",
         album: t.album?.title ?? "",
         artworkUrl: t.album?.cover_medium ?? "",
         // UWAGA: link Deezera wygasa po ok. 15 minutach (token exp w URL-u),
         // więc klient go NIE zapisuje — przy odtwarzaniu z listy prosi
         // o świeży przez action: "preview"
         previewUrl: t.preview ?? "",
         durationMs: t.duration ? t.duration * 1000 : null,
      }));
}

async function searchItunes(term: string): Promise<Track[]> {
   const res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&country=PL&limit=${LIMIT}`,
   );
   if (!res.ok) return [];
   const data = await res.json();
   return (data.results ?? [])
      .filter((t: any) => t.trackId && t.trackName)
      .map((t: any) => ({
         externalId: String(t.trackId),
         source: "itunes" as const,
         title: t.trackName,
         artist: t.artistName ?? "",
         album: t.collectionName ?? "",
         artworkUrl: (t.artworkUrl100 ?? "").replace("100x100", "200x200"),
         // próbki iTunes nie wygasają — ten link można trzymać w bazie
         previewUrl: t.previewUrl ?? "",
         durationMs: t.trackTimeMillis ?? null,
      }));
}

const normalize = (text: string) =>
   text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();

// Oba źródła przy braku trafienia dosypują dopasowania po pojedynczym słowie:
// na „california love white 2115" iTunes potrafi zwrócić „Sweater Weather"
// (bo w albumie jest „I Love You"), a Deezer na „Cleo" — francuski zespół.
// Liczymy więc, jaka część słów z zapytania faktycznie występuje w wyniku,
// odsiewamy poniżej połowy i sortujemy malejąco
const MIN_SCORE = 0.5;

// Album celowo poza dopasowaniem: przy zapytaniu „milosc w zakopanem"
// wpuszczał całą płytę o tym tytule, łącznie z utworami bez związku
function score(track: Track, tokens: string[]): number {
   if (!tokens.length) return 1;
   const haystack = normalize(`${track.artist} ${track.title}`);
   const hits = tokens.filter((token) => haystack.includes(token)).length;
   return hits / tokens.length;
}

function rank(tracks: Track[], tokens: string[]): Track[] {
   return tracks
      .map((track, index) => ({ track, index, s: score(track, tokens) }))
      .filter((x) => x.s >= MIN_SCORE)
      // przy równym wyniku zostaje kolejność źródła (jego własny ranking)
      .sort((x, y) => y.s - x.s || x.index - y.index)
      .map((x) => x.track);
}

// Przeplot, nie sklejenie: gdyby jedno źródło szło w całości pierwsze,
// trafny wynik z drugiego spadałby poza widok
function interleave(a: Track[], b: Track[]): Track[] {
   const seen = new Set<string>();
   const out: Track[] = [];
   for (let i = 0; i < Math.max(a.length, b.length); i++) {
      for (const track of [a[i], b[i]]) {
         if (!track) continue;
         const key = dedupeKey(track.artist, track.title);
         if (seen.has(key)) continue;
         seen.add(key);
         out.push(track);
      }
   }
   return out;
}

Deno.serve(async (req) => {
   if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

   let payload: any;
   try {
      payload = await req.json();
   } catch {
      return json({ error: "Nieprawidłowe żądanie." }, 400);
   }

   const { action = "search", term = "", trackId = "" } = payload;

   if (action === "preview") {
      const id = String(trackId);
      if (!/^\d+$/.test(id)) {
         return json({ error: "Nieprawidłowy identyfikator utworu." }, 400);
      }
      try {
         const res = await fetch(`https://api.deezer.com/track/${id}`);
         if (!res.ok) throw new Error("deezer");
         const track = await res.json();
         return json({ previewUrl: track.preview ?? "" });
      } catch {
         return json({ error: "Nie udało się pobrać próbki." }, 502);
      }
   }

   const query = String(term).trim();
   if (query.length < MIN_QUERY_LENGTH) return json({ tracks: [] });

   // jedno źródło może paść — drugie i tak ma sens pokazać
   const [deezer, itunes] = await Promise.all([
      searchDeezer(query).catch(() => [] as Track[]),
      searchItunes(query).catch(() => [] as Track[]),
   ]);

   // słowa krótsze niż 3 znaki („do", „w") pasują wszędzie i tylko psują wynik
   const tokens = normalize(query)
      .split(" ")
      .filter((token) => token.length >= 3);

   return json({
      tracks: interleave(rank(deezer, tokens), rank(itunes, tokens)),
   });
});
