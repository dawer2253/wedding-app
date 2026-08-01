import { useState } from "react";
import { toast } from "sonner";
import { ReceiptText, Trash2 } from "lucide-react";
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
import ExpenseForm from "./ExpenseForm";
import PaymentsSection from "./PaymentsSection";
import { addExpense, removeExpense, updateExpense } from "../api";
import { selectBudgetLoading, selectExpenseById } from "../selectors";
import { EXPENSE_FORM_EMPTY_VALUES } from "../constants";

// Panel dodawania/edycji wydatku wysuwany nad bieżącą stroną
// (lista albo dashboard), sterowany parametrami ?new=1 / ?edit=<id>
export default function ExpenseSheet() {
   const dispatch = useAppDispatch();
   const { isNew, editId, close } = useSheetParams();
   const weddingId = useAppSelector(
      (state) => state.wedding.activeWedding?.id,
   );
   const expense = useAppSelector((state) =>
      editId ? selectExpenseById(state, editId) : null,
   );
   const loading = useAppSelector(selectBudgetLoading);
   const open = isNew || Boolean(editId);
   const [confirmingDelete, setConfirmingDelete] = useState(false);

   async function handleCreate(data) {
      try {
         const { paymentFailed } = await dispatch(
            addExpense({ ...data, weddingId }),
         ).unwrap();
         if (paymentFailed) {
            toast.error(
               "Wydatek zapisany, ale nie udało się zapisać zaliczki",
            );
         } else {
            toast.success("Dodano wydatek");
         }
         close();
      } catch (err) {
         toast.error(err);
      }
   }

   async function handleUpdate(data) {
      try {
         await dispatch(updateExpense({ id: editId, changes: data })).unwrap();
         toast.success("Zapisano zmiany");
         close();
      } catch (err) {
         toast.error(err);
      }
   }

   // Na mobile lista nie ma kolumny akcji — usuwanie musi być
   // dostępne z poziomu sheeta edycji
   async function handleDelete() {
      try {
         await dispatch(removeExpense(editId)).unwrap();
         toast.success("Usunięto wydatek");
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
                  {editId ? "Edytuj wydatek" : "Nowy wydatek"}
               </SheetTitle>
               <SheetDescription>
                  {editId && expense
                     ? expense.name
                     : "Uzupełnij dane i zapisz."}
               </SheetDescription>
            </SheetHeader>
            <div className="flex-1 space-y-6 overflow-y-auto px-4 pb-4">
               {isNew && (
                  <ExpenseForm
                     onSubmit={handleCreate}
                     onCancel={close}
                     submitLabel="Dodaj wydatek"
                     withInitialPayment
                  />
               )}
               {editId && expense && (
                  <>
                     <ExpenseForm
                        key={editId}
                        defaultValues={Object.fromEntries(
                           Object.keys(EXPENSE_FORM_EMPTY_VALUES).map(
                              (field) => [
                                 field,
                                 // null-e z bazy (np. totalCost przy per_unit)
                                 // wracają do pustych wartości formularza
                                 expense[field] ??
                                    EXPENSE_FORM_EMPTY_VALUES[field],
                              ],
                           ),
                        )}
                        onSubmit={handleUpdate}
                        onCancel={close}
                        submitLabel="Zapisz zmiany"
                     />
                     <PaymentsSection expense={expense} />
                     <div className="border-t pt-4">
                        <Button
                           variant="outline"
                           className="w-full text-destructive hover:text-destructive"
                           onClick={() => setConfirmingDelete(true)}
                        >
                           <Trash2 />
                           Usuń wydatek
                        </Button>
                     </div>
                  </>
               )}
               {editId && !expense && loading && (
                  <Skeleton className="h-96 rounded-xl" />
               )}
               {editId && !expense && !loading && (
                  <Empty>
                     <EmptyHeader>
                        <EmptyMedia variant="icon">
                           <ReceiptText />
                        </EmptyMedia>
                        <EmptyTitle>Nie znaleziono wydatku</EmptyTitle>
                        <EmptyDescription>
                           Wydatek mógł zostać usunięty albo link jest
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
            title="Usunąć wydatek?"
            message={
               expense
                  ? `„${expense.name}" zostanie trwale usunięty razem z historią płatności.`
                  : ""
            }
            confirmLabel="Usuń"
         />
      </Sheet>
   );
}
