import { toast } from "sonner";
import { UserX } from "lucide-react";
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
import GuestForm from "./GuestForm";
import { addGuest, updateGuest } from "../api";
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

   return (
      <Sheet open={open} onOpenChange={(value) => !value && close()}>
         <SheetContent className="w-full gap-0 sm:max-w-xl">
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
      </Sheet>
   );
}
