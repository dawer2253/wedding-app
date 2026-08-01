import { Link, useSearchParams } from "react-router-dom";
import { Banknote, List, Plus, RotateCcw } from "lucide-react";
import { withSheetParam } from "@/hooks/useSheetParams";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import PageHeader from "@/components/PageHeader";
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
import BudgetTotals from "../components/BudgetTotals";
import CategorySummary from "../components/CategorySummary";
import ExpenseSheet from "../components/ExpenseSheet";
import UpcomingPayments from "../components/UpcomingPayments";
import { fetchExpenses } from "../api";
import {
   selectBudgetError,
   selectBudgetLoading,
   selectExpensesCount,
} from "../selectors";

export default function BudgetSummaryPage() {
   const dispatch = useAppDispatch();
   const totalCount = useAppSelector(selectExpensesCount);
   const loading = useAppSelector(selectBudgetLoading);
   const error = useAppSelector(selectBudgetError);
   const weddingId = useAppSelector(
      (state) => state.wedding.activeWedding?.id,
   );
   const [searchParams] = useSearchParams();

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
            <PageHeader title="Budżet" />
            <div className="grid grid-cols-3 gap-2 md:gap-3">
               {Array.from({ length: 3 }, (_, i) => (
                  <Skeleton key={i} className="h-18 rounded-xl" />
               ))}
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
               <Skeleton className="h-64 rounded-xl" />
               <Skeleton className="h-64 rounded-xl" />
            </div>
         </div>
      );
   }

   if (error) {
      return (
         <div className="space-y-6">
            <PageHeader title="Budżet" />
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

   return (
      <div className="space-y-6">
         <PageHeader
            title="Budżet"
            subtitle={`${totalCount} wydatków w budżecie`}
            action={
               <div className="flex gap-2">
                  <Button asChild variant="outline">
                     <Link to="/budget/list">
                        <List />
                        Lista wydatków
                     </Link>
                  </Button>
                  {addButton}
               </div>
            }
         />

         {totalCount === 0 ? (
            <Empty>
               <EmptyHeader>
                  <EmptyMedia variant="icon">
                     <Banknote />
                  </EmptyMedia>
                  <EmptyTitle>Brak wydatków</EmptyTitle>
                  <EmptyDescription>
                     Dodaj pierwszy wydatek, aby zobaczyć podsumowanie
                     budżetu.
                  </EmptyDescription>
               </EmptyHeader>
               <EmptyContent>{addButton}</EmptyContent>
            </Empty>
         ) : (
            <>
               <BudgetTotals />
               <div className="grid gap-4 lg:grid-cols-2">
                  <UpcomingPayments />
                  <CategorySummary />
               </div>
            </>
         )}
         <ExpenseSheet />
      </div>
   );
}
