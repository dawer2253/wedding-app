# wedding-app

Aplikacja do organizacji wesela: lista gości, budżet z harmonogramem płatności, dostawcy i playlista dla DJ-a. Wszystko w jednym miejscu, z dostępem dla obojga narzeczonych po kodzie zaproszenia.

Wersja live: https://dawer2253.github.io/wedding-app/

## Moduły

**Goście** (`/guests`)
Tabela z filtrami i wyszukiwarką, drag and drop kolejności, szybkie dodawanie wiersza na dole listy, wirtualizacja przy długich listach. Każdy gość ma status RSVP (oczekuje / potwierdzony / odmowa), opcjonalną osobę towarzyszącą, oznaczenie dziecka, uwagi dietetyczne i kontakt. Pasek statystyk liczy osoby, a nie rekordy (osoba towarzysząca liczy się jako druga osoba).

**Budżet** (`/budget`, `/budget/list`)
Wydatki w 16 kategoriach, każdy z kwotą stałą albo ceną za sztukę. Przy cenie za sztukę liczba sztuk może być pobierana automatycznie z listy gości (wszyscy albo tylko potwierdzeni), z osobnym przelicznikiem dla dzieci (pełna stawka, połowa albo bez dzieci). Do wydatku podpina się rejestr wpłat, dzięki czemu widać kwoty zapłacone, pozostałe do zapłaty i zaległe terminy. Strona podsumowania pokazuje sumy per kategoria i najbliższe płatności.

**Dostawcy** (`/vendors`)
Karty dostawców w podziale na role (DJ, zespół, fotograf, kamerzysta, kwiaciarnia, cukiernia, transport, dekorator, inne) ze statusem procesu: do sprawdzenia, kontakt, wycena, wybrany, odrzucony. Do każdego można zapisać cenę, ocenę, kontakt, listę plusów i minusów. Widok porównania (`/vendors/compare/:role`) zestawia obok siebie wszystkich kandydatów na jedną rolę.

**Muzyka** (`/playlist`)
Playlista w sekcjach: koniecznie zagrać, pierwszy taniec, wejście pary młodej, tort, oczepiny i czarna lista. Utwory dodaje się przez wyszukiwarkę, która odpytuje równolegle Deezera i iTunes (patrz [supabase/functions/music-search](supabase/functions/music-search/index.ts)), z odsłuchem próbki utworu. Strona `/playlist/print` generuje wersję do druku dla DJ-a.

**Wesele i konto**
Rejestracja, logowanie i reset hasła przez Supabase Auth. Po pierwszym logowaniu onboarding: zakładasz wesele albo dołączasz do istniejącego kodem zaproszenia. Ustawienia wesela (nazwa, data, kod) są pod `/settings`.

Interfejs jest po polsku i responsywny: na desktopie boczny sidebar, na mobile dolna nawigacja i pełnoekranowe panele formularzy.

## Stack

- React 19 + Vite 8, JavaScript (bez TypeScriptu, alias `@` na `src/`)
- Redux Toolkit + React Redux, dane pobierane thunkami z Supabase
- React Router 7 (`createBrowserRouter`)
- Tailwind CSS 4 + shadcn/ui na Radix UI, ikony lucide, toasty sonner
- react-hook-form do formularzy, dnd-kit do przeciągania, @tanstack/react-virtual do wirtualizacji
- Supabase: Postgres + Auth + Edge Functions (Deno)

## Szybki start

Wymagany Node 22 (taka wersja leci na CI).

```bash
npm install
cp .env.example .env
npm run dev
```

W `.env` uzupełnij dane projektu Supabase:

```
VITE_SUPABASE_URL=https://<projekt>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Klucz publishable jest z założenia jawny, trafia do bundla JS. Dostęp do danych pilnuje RLS po stronie bazy, nie ukrywanie klucza.

Dev server startuje na 5173. Zmienna `PORT` pozwala podnieść drugą instancję na innym porcie.

## Skrypty

| Komenda | Opis |
| --- | --- |
| `npm run dev` | serwer deweloperski Vite z HMR |
| `npm run build` | build produkcyjny do `dist/` |
| `npm run preview` | podgląd zbudowanej paczki |
| `npm run lint` | ESLint po całym repo |

## Struktura

```
src/
  app/            store Redux i typowane hooki (useAppDispatch, useAppSelector)
  components/     wspólne komponenty + components/ui z shadcn/ui
  features/       moduły domenowe: auth, wedding, guests, budget, vendors, playlist
  hooks/          useMediaQuery, useSheetParams
  lib/            klient Supabase i helpery (daty, waluta, liczba mnoga, id)
  routes/         router i layouty (Auth, Protected, Root, 404)
supabase/
  functions/      Edge Functions (music-search)
```

Każdy moduł w `features/` trzyma się tego samego układu:

- `api.js` to thunki gadające z Supabase (jedyne miejsce, gdzie leci zapytanie do bazy)
- `*Slice.js` to stan i reducery
- `mappers.js` tłumaczy `snake_case` z bazy na `camelCase` w aplikacji i z powrotem
- `selectors.js` to selektory, w tym liczenie podsumowań
- `constants.js` to słowniki wartości z enumów bazy razem z polskimi etykietami i ikonami
- `components/` i `pages/` to warstwa widoku

Dwie konwencje, które warto znać przed pierwszą zmianą:

1. Panele dodawania i edycji są sterowane query-paramami (`?new=1`, `?edit=<id>`) przez `useSheetParams`, więc deep-linki i odświeżenie strony działają, a filtry listy w URL przeżywają otwarcie panelu.
2. Formularze budują `defaultValues` wyłącznie z `*_FORM_EMPTY_VALUES` w `constants.js`. Chodzi o to, żeby submit nie przemycał pól spoza formularza (np. `sortOrder` czy `payments`) i nie nadpisywał ich stanem sprzed otwarcia panelu.

Komentarze w kodzie są po polsku i opisują "dlaczego", nie "co". Warto trzymać ten sam styl.

## Backend

Schemat w Supabase (migracje trzymane po stronie projektu Supabase, nie w repo):

- `weddings` i `wedding_members` to wesele i jego uczestnicy, dostęp przez kod zaproszenia
- `guests`, `vendors`, `playlist_items` to dane modułów
- `expenses` plus `expense_payments` to wydatki i rejestr wpłat
- funkcje RPC: `generate_invite_code`, `join_wedding_by_code`
- enumy: `expense_category`, `vendor_role`, `vendor_status`, `playlist_category` (kolejność wartości musi zgadzać się z listami w `constants.js`)

Edge Function `music-search` proxuje wyszukiwanie utworów. Jest potrzebna z dwóch powodów: `api.deezer.com` nie odsyła nagłówka CORS, więc przeglądarka nie zawoła go bezpośrednio, a żadne pojedyncze źródło nie pokrywa polskiego repertuaru weselnego (Deezer zna współczesny polski pop i rap, iTunes lepiej trafia w disco polo po nazwie zespołu). Wdrożenie:

```bash
supabase functions deploy music-search
```

## Deploy

Push na `main` uruchamia [workflow](.github/workflows/deploy.yml), który buduje paczkę i publikuje ją na GitHub Pages. Dwie rzeczy specyficzne dla Pages:

- appka żyje pod `/wedding-app/`, więc build dostaje `DEPLOY_BASE=/wedding-app/`, a router bierze basename z `import.meta.env.BASE_URL`
- Pages nie zna routingu SPA, więc `dist/index.html` jest kopiowany na `dist/404.html` i to router po stronie klienta przejmuje nieznane ścieżki
