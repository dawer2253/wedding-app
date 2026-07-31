import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

// Panel new/edit sterowany query-paramami (?new=1, ?edit=<id>) — deep-linki
// i refresh działają, a filtry listy w URL przeżywają otwarcie/zamknięcie.
// Funkcje używają updatera setSearchParams, więc są stabilne referencyjnie
// (bezpieczne dla memoizowanych wierszy tabel).
export function useSheetParams() {
   const [searchParams, setSearchParams] = useSearchParams();
   const isNew = searchParams.has("new");
   const editId = searchParams.get("edit");

   const openNew = useCallback(() => {
      setSearchParams((prev) => {
         const next = new URLSearchParams(prev);
         next.delete("edit");
         next.set("new", "1");
         return next;
      });
   }, [setSearchParams]);

   const openEdit = useCallback(
      (id) => {
         setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.delete("new");
            next.set("edit", id);
            return next;
         });
      },
      [setSearchParams],
   );

   // replace — back po zamknięciu panelu nie otwiera go ponownie
   const close = useCallback(() => {
      setSearchParams(
         (prev) => {
            const next = new URLSearchParams(prev);
            next.delete("new");
            next.delete("edit");
            return next;
         },
         { replace: true },
      );
   }, [setSearchParams]);

   return { isNew, editId, openNew, openEdit, close };
}

// String query do <Link to={{ search }}> — zachowuje pozostałe parametry
// (filtry), podmieniając tylko new/edit
export function withSheetParam(searchParams, key, value = "1") {
   const next = new URLSearchParams(searchParams);
   next.delete("new");
   next.delete("edit");
   next.set(key, value);
   return `?${next.toString()}`;
}
