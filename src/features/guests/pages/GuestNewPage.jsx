import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import GuestForm from "../components/GuestForm";
import { addGuest } from "../api";

export default function GuestNewPage() {
   const dispatch = useAppDispatch();
   const navigate = useNavigate();
   const weddingId = useAppSelector(
      (state) => state.wedding.activeWedding?.id,
   );

   async function handleSubmit(data) {
      try {
         await dispatch(addGuest({ ...data, weddingId })).unwrap();
         toast.success("Dodano gościa");
         navigate("/guests");
      } catch (err) {
         toast.error(err);
      }
   }

   return (
      <div className="space-y-6">
         <PageHeader title="Nowy gość" />
         <Card className="max-w-xl">
            <CardContent>
               <GuestForm onSubmit={handleSubmit} submitLabel="Dodaj gościa" />
            </CardContent>
         </Card>
      </div>
   );
}
