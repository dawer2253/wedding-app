import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import {
   Card,
   CardContent,
   CardFooter,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { selectGuestHeadcounts } from "@/features/guests/selectors";
import { formatPLN } from "@/lib/currency";
import { formatDate, todayISO } from "@/lib/date";
import { addPayment, removePayment } from "../api";
import {
   expensePaidGrosze,
   expenseTotalGrosze,
   fromGrosze,
} from "../money";

export default function PaymentsSection({ expense }) {
   const dispatch = useAppDispatch();
   const headcounts = useAppSelector(selectGuestHeadcounts);
   const [amount, setAmount] = useState("");
   const [paidAt, setPaidAt] = useState(todayISO());
   const [note, setNote] = useState("");
   const [saving, setSaving] = useState(false);
   const [paymentToDelete, setPaymentToDelete] = useState(null);

   const paidGrosze = expensePaidGrosze(expense);
   const totalGrosze = expenseTotalGrosze(expense, headcounts);

   async function handleAdd(event) {
      event.preventDefault();
      const value = Number(amount);
      if (!amount || Number.isNaN(value) || value <= 0) {
         toast.error("Podaj prawidłową kwotę płatności");
         return;
      }
      setSaving(true);
      try {
         await dispatch(
            addPayment({
               expenseId: expense.id,
               weddingId: expense.weddingId,
               amount: value,
               paidAt: paidAt || todayISO(),
               note: note.trim(),
            }),
         ).unwrap();
         // kwota i notatka się czyszczą, data zostaje — przy wpisywaniu
         // kilku płatności wstecz zwykle dotyczą podobnego okresu
         setAmount("");
         setNote("");
      } catch (err) {
         toast.error(err);
      } finally {
         setSaving(false);
      }
   }

   async function handleDelete() {
      try {
         await dispatch(
            removePayment({
               expenseId: expense.id,
               paymentId: paymentToDelete.id,
            }),
         ).unwrap();
         toast.success("Usunięto płatność");
      } catch (err) {
         toast.error(err);
      } finally {
         setPaymentToDelete(null);
      }
   }

   return (
      <Card className="max-w-xl">
         <CardHeader>
            <CardTitle>Płatności</CardTitle>
         </CardHeader>
         <CardContent className="space-y-4">
            {expense.payments.length === 0 ? (
               <p className="text-sm text-muted-foreground">
                  Brak zarejestrowanych płatności.
               </p>
            ) : (
               <div className="divide-y">
                  {expense.payments.map((payment) => (
                     <div
                        key={payment.id}
                        className="flex items-center gap-3 py-2"
                     >
                        <span className="w-24 shrink-0 text-sm font-medium">
                           {formatPLN(payment.amount)}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                           {formatDate(payment.paidAt)}
                        </span>
                        {payment.note && (
                           <span className="truncate text-xs text-muted-foreground">
                              {payment.note}
                           </span>
                        )}
                        <Button
                           variant="ghost"
                           size="icon"
                           className="ml-auto"
                           aria-label="Usuń płatność"
                           onClick={() => setPaymentToDelete(payment)}
                        >
                           <Trash2 />
                        </Button>
                     </div>
                  ))}
               </div>
            )}

            {/* Dwa stałe rzędy zamiast flex-wrap — na wąskim sheecie pola
                nie łamią się w przypadkowych miejscach */}
            <form onSubmit={handleAdd} className="space-y-2">
               <div className="flex gap-2">
                  <Input
                     type="number"
                     step="0.01"
                     min="0"
                     placeholder="Kwota (zł)"
                     className="min-w-0 flex-1"
                     value={amount}
                     onChange={(event) => setAmount(event.target.value)}
                  />
                  <Input
                     type="date"
                     className="min-w-0 flex-1"
                     value={paidAt}
                     onChange={(event) => setPaidAt(event.target.value)}
                  />
               </div>
               <div className="flex gap-2">
                  <Input
                     placeholder="Notatka (np. zaliczka)"
                     className="min-w-0 flex-1"
                     value={note}
                     onChange={(event) => setNote(event.target.value)}
                  />
                  <Button type="submit" variant="outline" disabled={saving}>
                     {saving ? <Spinner /> : <Plus />}
                     Dodaj
                  </Button>
               </div>
            </form>
         </CardContent>
         <CardFooter className="text-sm text-muted-foreground">
            Zapłacono łącznie:&nbsp;
            <span className="font-medium text-foreground">
               {formatPLN(fromGrosze(paidGrosze))}
            </span>
            &nbsp;z {formatPLN(fromGrosze(totalGrosze))}
         </CardFooter>

         <ConfirmDialog
            isOpen={!!paymentToDelete}
            onClose={() => setPaymentToDelete(null)}
            onConfirm={handleDelete}
            title="Usunąć płatność?"
            message={
               paymentToDelete
                  ? `Płatność ${formatPLN(paymentToDelete.amount)} z ${formatDate(
                       paymentToDelete.paidAt,
                    )} zostanie trwale usunięta.`
                  : ""
            }
            confirmLabel="Usuń"
         />
      </Card>
   );
}
