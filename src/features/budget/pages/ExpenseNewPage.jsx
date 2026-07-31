import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import ExpenseForm from "../components/ExpenseForm";
import { addExpense } from "../api";

export default function ExpenseNewPage() {
   const dispatch = useAppDispatch();
   const navigate = useNavigate();
   const weddingId = useAppSelector(
      (state) => state.wedding.activeWedding?.id,
   );

   async function handleSubmit(data) {
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
         navigate("/budget");
      } catch (err) {
         toast.error(err);
      }
   }

   return (
      <div className="space-y-6">
         <PageHeader title="Nowy wydatek" />
         <Card className="max-w-xl">
            <CardContent>
               <ExpenseForm
                  onSubmit={handleSubmit}
                  submitLabel="Dodaj wydatek"
                  withInitialPayment
               />
            </CardContent>
         </Card>
      </div>
   );
}
