import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import VendorForm from "../components/VendorForm";
import { useSelectedVendorGuard } from "../components/useSelectedVendorGuard";
import { addVendor } from "../api";
import { ROLE_LABELS, ROLES } from "../constants";

export default function VendorNewPage() {
   const dispatch = useAppDispatch();
   const navigate = useNavigate();
   const [searchParams] = useSearchParams();
   const weddingId = useAppSelector(
      (state) => state.wedding.activeWedding?.id,
   );
   const guard = useSelectedVendorGuard();

   // ?role=... przychodzi z przycisku „Dodaj dostawcę na [rolę]" na liście
   const roleParam = searchParams.get("role");
   const role = ROLES.includes(roleParam) ? roleParam : "";

   async function handleSubmit(data) {
      const gate = await guard.ensureSingleSelected(data);
      if (!gate.ok) return;
      try {
         await dispatch(addVendor({ ...data, weddingId })).unwrap();
         toast.success("Dodano dostawcę");
         navigate("/vendors");
      } catch (err) {
         // zapis padł — poprzedni wybrany wraca na swoje miejsce
         await gate.undo?.();
         toast.error(err);
      }
   }

   return (
      <div className="space-y-6">
         <Button asChild variant="ghost" size="sm" className="-ml-2">
            <Link to="/vendors">
               <ArrowLeft />
               Dostawcy
            </Link>
         </Button>
         <PageHeader
            title="Nowy dostawca"
            subtitle={
               role ? `Rola: ${ROLE_LABELS[role]}` : "Uzupełnij dane i zapisz."
            }
         />
         <Card className="max-w-3xl p-4 sm:p-6">
            <VendorForm
               defaultValues={{ role }}
               onSubmit={handleSubmit}
               onCancel={() => navigate("/vendors")}
               submitLabel="Dodaj dostawcę"
            />
         </Card>
         {guard.dialog}
      </div>
   );
}
