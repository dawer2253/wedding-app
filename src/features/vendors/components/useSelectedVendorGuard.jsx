import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import ConfirmDialog from "@/components/ConfirmDialog";
import { updateVendor } from "../api";
import { selectVendorsByRole } from "../selectors";
import { ROLE_LABELS } from "../constants";

const NO_CONFLICT = { ok: true, undo: null };

// Reguła biznesowa: na jedną rolę może być tylko jeden dostawca ze statusem
// `selected`. Strony new/edit wołają ensureSingleSelected PRZED zapisem —
// dostają Promise<{ ok, undo }>, który rozwiązuje dopiero decyzja użytkownika
// w dialogu (ok = można zapisywać, poprzedni jest już „odrzucony").
//
// Degradacja poprzedniego i zapis bieżącego to dwa osobne requesty — bez
// transakcji. Gdy zapis padnie, strona woła `undo`, które przywraca
// poprzedniemu status `selected`; inaczej rola zostałaby bez nikogo wybranego
export function useSelectedVendorGuard() {
   const dispatch = useAppDispatch();
   const byRole = useAppSelector(selectVendorsByRole);
   const [conflict, setConflict] = useState(null);
   const resolveRef = useRef(null);

   const ensureSingleSelected = useCallback(
      (data, currentId = null) => {
         if (data.status !== "selected") return Promise.resolve(NO_CONFLICT);
         const previous = (byRole[data.role] ?? []).find(
            (vendor) =>
               vendor.status === "selected" && vendor.id !== currentId,
         );
         if (!previous) return Promise.resolve(NO_CONFLICT);
         setConflict(previous);
         return new Promise((resolve) => {
            resolveRef.current = resolve;
         });
      },
      [byRole],
   );

   function settle(value) {
      resolveRef.current?.(value);
      resolveRef.current = null;
   }

   async function handleConfirm() {
      const previous = conflict;
      setConflict(null);
      try {
         await dispatch(
            updateVendor({ id: previous.id, changes: { status: "rejected" } }),
         ).unwrap();
         settle({
            ok: true,
            undo: async () => {
               try {
                  await dispatch(
                     updateVendor({
                        id: previous.id,
                        changes: { status: "selected" },
                     }),
                  ).unwrap();
               } catch {
                  toast.error(
                     `Nie udało się przywrócić statusu „${previous.name}" — sprawdź go ręcznie`,
                  );
               }
            },
         });
      } catch (err) {
         toast.error(err);
         settle({ ok: false, undo: null });
      }
   }

   function handleCancel() {
      setConflict(null);
      settle({ ok: false, undo: null });
   }

   const dialog = (
      <ConfirmDialog
         isOpen={!!conflict}
         onClose={handleCancel}
         onConfirm={handleConfirm}
         title="Jest już wybrany dostawca"
         message={
            conflict
               ? `Na rolę „${ROLE_LABELS[conflict.role]}" wybrany jest już „${conflict.name}". Zmienić go na „odrzucony"?`
               : ""
         }
         confirmLabel="Zmień i zapisz"
         variant="default"
      />
   );

   return { ensureSingleSelected, dialog };
}
