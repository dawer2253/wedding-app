import { toast } from "sonner";
import { ReceiptText } from "lucide-react";
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
import ExpenseForm from "./ExpenseForm";
import PaymentsSection from "./PaymentsSection";
import { addExpense, updateExpense } from "../api";
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

   return (
      <Sheet open={open} onOpenChange={(value) => !value && close()}>
         <SheetContent className="w-full gap-0 sm:max-w-xl">
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
      </Sheet>
   );
}
