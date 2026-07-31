import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Banknote, Plus, RotateCcw } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import PageHeader from "@/components/PageHeader";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
   Empty,
   EmptyContent,
   EmptyDescription,
   EmptyHeader,
   EmptyMedia,
   EmptyTitle,
} from "@/components/ui/empty";
import { withSheetParam } from "@/hooks/useSheetParams";
import BudgetFilters from "../components/BudgetFilters";
import CategorySection from "../components/CategorySection";
import ExpenseSheet from "../components/ExpenseSheet";
import { fetchExpenses, removeExpense } from "../api";
import {
   selectBudgetError,
   selectBudgetLoading,
   selectExpensesByCategory,
   selectExpensesCount,
} from "../selectors";

export default function BudgetListPage() {
   const dispatch = useAppDispatch();
   const [searchParams] = useSearchParams();
   const status = searchParams.get("status") || "all";
   const category = searchParams.get("category") || "";
   const sections = useAppSelector((state) =>
      selectExpensesByCategory(state, { status, category }),
   );
   const totalCount = useAppSelector(selectExpensesCount);
   const loading = useAppSelector(selectBudgetLoading);
   const error = useAppSelector(selectBudgetError);
   const weddingId = useAppSelector(
      (state) => state.wedding.activeWedding?.id,
   );
   const [expenseToDelete, setExpenseToDelete] = useState(null);

   async function handleDelete() {
      try {
         await dispatch(removeExpense(expenseToDelete.id)).unwrap();
         toast.success("Usunięto wydatek");
      } catch (err) {
         toast.error(err);
      } finally {
         setExpenseToDelete(null);
      }
   }

   const addButton = (
      <Button asChild>
         <Link to={{ search: withSheetParam(searchParams, "new") }}>
            <Plus />
            Dodaj wydatek
         </Link>
      </Button>
   );

   if (loading && totalCount === 0) {
      return (
         <div className="space-y-6">
            <PageHeader title="Lista wydatków" />
            <Skeleton className="h-9 w-80 rounded-lg" />
            <div className="space-y-4">
               {Array.from({ length: 4 }, (_, i) => (
                  <Skeleton key={i} className="h-28 rounded-xl" />
               ))}
            </div>
         </div>
      );
   }

   if (error) {
      return (
         <div className="space-y-6">
            <PageHeader title="Lista wydatków" />
            <div className="flex items-center justify-between rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
               <p>Nie udało się pobrać wydatków: {error}</p>
               <Button
                  variant="outline"
                  size="sm"
                  onClick={() => dispatch(fetchExpenses(weddingId))}
               >
                  <RotateCcw />
                  Spróbuj ponownie
               </Button>
            </div>
         </div>
      );
   }

   const visibleCount = sections.reduce(
      (sum, section) => sum + section.expenses.length,
      0,
   );

   return (
      <div className="space-y-6">
         <PageHeader
            title="Lista wydatków"
            subtitle={`${totalCount} wydatków w budżecie`}
            action={addButton}
         />
         <BudgetFilters />

         {totalCount === 0 ? (
            <Empty>
               <EmptyHeader>
                  <EmptyMedia variant="icon">
                     <Banknote />
                  </EmptyMedia>
                  <EmptyTitle>Brak wydatków</EmptyTitle>
                  <EmptyDescription>
                     Dodaj pierwszy wydatek, aby zacząć planować budżet.
                  </EmptyDescription>
               </EmptyHeader>
               <EmptyContent>{addButton}</EmptyContent>
            </Empty>
         ) : visibleCount === 0 ? (
            <Empty>
               <EmptyHeader>
                  <EmptyTitle>Brak wyników</EmptyTitle>
                  <EmptyDescription>
                     Żaden wydatek nie pasuje do wybranych filtrów.
                  </EmptyDescription>
               </EmptyHeader>
            </Empty>
         ) : (
            <div className="space-y-4">
               {sections.map((section) => (
                  <CategorySection
                     key={section.category}
                     category={section.category}
                     expenses={section.expenses}
                     onDelete={setExpenseToDelete}
                  />
               ))}
            </div>
         )}

         <ExpenseSheet />
         <ConfirmDialog
            isOpen={!!expenseToDelete}
            onClose={() => setExpenseToDelete(null)}
            onConfirm={handleDelete}
            title="Usunąć wydatek?"
            message={
               expenseToDelete
                  ? `„${expenseToDelete.name}" zostanie trwale usunięty razem z historią płatności.`
                  : ""
            }
            confirmLabel="Usuń"
         />
      </div>
   );
}
