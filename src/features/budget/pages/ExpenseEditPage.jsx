import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ReceiptText } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
   Empty,
   EmptyContent,
   EmptyDescription,
   EmptyHeader,
   EmptyMedia,
   EmptyTitle,
} from "@/components/ui/empty";
import ExpenseForm from "../components/ExpenseForm";
import PaymentsSection from "../components/PaymentsSection";
import { updateExpense } from "../api";
import { selectBudgetLoading, selectExpenseById } from "../selectors";
import { EXPENSE_FORM_EMPTY_VALUES } from "../constants";

export default function ExpenseEditPage() {
   const { id } = useParams();
   const dispatch = useAppDispatch();
   const navigate = useNavigate();
   const expense = useAppSelector((state) => selectExpenseById(state, id));
   const loading = useAppSelector(selectBudgetLoading);

   async function handleSubmit(data) {
      try {
         await dispatch(updateExpense({ id, changes: data })).unwrap();
         toast.success("Zapisano zmiany");
         navigate("/budget/list");
      } catch (err) {
         toast.error(err);
      }
   }

   if (!expense && loading) {
      return (
         <div className="space-y-6">
            <PageHeader title="Edytuj wydatek" />
            <Skeleton className="h-96 max-w-xl rounded-xl" />
         </div>
      );
   }

   if (!expense) {
      return (
         <Empty>
            <EmptyHeader>
               <EmptyMedia variant="icon">
                  <ReceiptText />
               </EmptyMedia>
               <EmptyTitle>Nie znaleziono wydatku</EmptyTitle>
               <EmptyDescription>
                  Wydatek mógł zostać usunięty albo link jest nieaktualny.
               </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
               <Button asChild>
                  <Link to="/budget/list">Wróć do listy</Link>
               </Button>
            </EmptyContent>
         </Empty>
      );
   }

   return (
      <div className="space-y-6">
         <PageHeader title="Edytuj wydatek" subtitle={expense.name} />
         <Card className="max-w-xl">
            <CardContent>
               <ExpenseForm
                  key={id}
                  defaultValues={Object.fromEntries(
                     Object.keys(EXPENSE_FORM_EMPTY_VALUES).map((field) => [
                        field,
                        // null-e z bazy (np. totalCost przy per_unit) wracają
                        // do pustych wartości formularza
                        expense[field] ?? EXPENSE_FORM_EMPTY_VALUES[field],
                     ]),
                  )}
                  onSubmit={handleSubmit}
                  submitLabel="Zapisz zmiany"
                  cancelTo="/budget/list"
               />
            </CardContent>
         </Card>
         <PaymentsSection expense={expense} />
      </div>
   );
}
