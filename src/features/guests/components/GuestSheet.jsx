import { useState } from "react";
import { toast } from "sonner";
import { Trash2, UserX } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
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
import GuestForm from "./GuestForm";
import { addGuest, removeGuest, updateGuest } from "../api";
import { selectGuestById, selectGuestsLoading } from "../selectors";
import { GUEST_FORM_EMPTY_VALUES } from "../constants";

// Panel dodawania/edycji gościa wysuwany nad bieżącą stroną,
// sterowany parametrami ?new=1 / ?edit=<id>
export default function GuestSheet() {
   const dispatch = useAppDispatch();
   const { isNew, editId, close } = useSheetParams();
   const weddingId = useAppSelector(
      (state) => state.wedding.activeWedding?.id,
   );
   const guest = useAppSelector((state) =>
      editId ? selectGuestById(state, editId) : null,
   );
   const loading = useAppSelector(selectGuestsLoading);
   const open = isNew || Boolean(editId);
   const [confirmingDelete, setConfirmingDelete] = useState(false);

   async function handleCreate(data) {
      try {
         await dispatch(addGuest({ ...data, weddingId })).unwrap();
         toast.success("Dodano gościa");
         close();
      } catch (err) {
         toast.error(err);
      }
   }

   async function handleUpdate(data) {
      try {
         await dispatch(updateGuest({ id: editId, changes: data })).unwrap();
         toast.success("Zapisano zmiany");
         close();
      } catch (err) {
         toast.error(err);
      }
   }

   // Na mobile tabela nie ma kolumny akcji — usuwanie musi być
   // dostępne z poziomu sheeta edycji
   async function handleDelete() {
      try {
         await dispatch(removeGuest(editId)).unwrap();
         toast.success("Usunięto gościa");
         close();
      } catch (err) {
         toast.error(err);
      } finally {
         setConfirmingDelete(false);
      }
   }

   return (
      <Sheet open={open} onOpenChange={(value) => !value && close()}>
         {/* w-full! — bazowe data-[side=right]:w-3/4 sheeta ma wyższą
             specyficzność niż zwykłe w-full; na mobile sheet ma być
             pełnoekranowy, szerokość i tak ogranicza sm:max-w-xl */}
         <SheetContent className="w-full! gap-0 sm:max-w-xl">
            <SheetHeader>
               <SheetTitle>
                  {editId ? "Edytuj gościa" : "Nowy gość"}
               </SheetTitle>
               <SheetDescription>
                  {editId && guest
                     ? `${guest.firstName} ${guest.lastName}`
                     : "Uzupełnij dane i zapisz."}
               </SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-4 pb-4">
               {isNew && (
                  <GuestForm
                     onSubmit={handleCreate}
                     onCancel={close}
                     submitLabel="Dodaj gościa"
                  />
               )}
               {editId && guest && (
                  <>
                     <GuestForm
                        key={editId}
                        defaultValues={Object.fromEntries(
                           Object.keys(GUEST_FORM_EMPTY_VALUES).map((field) => [
                              field,
                              guest[field],
                           ]),
                        )}
                        onSubmit={handleUpdate}
                        onCancel={close}
                        submitLabel="Zapisz zmiany"
                     />
                     <div className="mt-6 border-t pt-4">
                        <Button
                           variant="outline"
                           className="w-full text-destructive hover:text-destructive"
                           onClick={() => setConfirmingDelete(true)}
                        >
                           <Trash2 />
                           Usuń gościa
                        </Button>
                     </div>
                  </>
               )}
               {editId && !guest && loading && (
                  <Skeleton className="h-96 rounded-xl" />
               )}
               {editId && !guest && !loading && (
                  <Empty>
                     <EmptyHeader>
                        <EmptyMedia variant="icon">
                           <UserX />
                        </EmptyMedia>
                        <EmptyTitle>Nie znaleziono gościa</EmptyTitle>
                        <EmptyDescription>
                           Gość mógł zostać usunięty albo link jest
                           nieaktualny.
                        </EmptyDescription>
                     </EmptyHeader>
                  </Empty>
               )}
            </div>
         </SheetContent>
         <ConfirmDialog
            isOpen={confirmingDelete}
            onClose={() => setConfirmingDelete(false)}
            onConfirm={handleDelete}
            title="Usunąć gościa?"
            message={
               guest
                  ? `${guest.firstName} ${guest.lastName} zostanie trwale usunięty z listy.`
                  : ""
            }
            confirmLabel="Usuń"
         />
      </Sheet>
   );
}
