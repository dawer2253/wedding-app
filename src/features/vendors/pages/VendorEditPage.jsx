import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Trash2, UserSearch } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import ConfirmDialog from "@/components/ConfirmDialog";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
   Empty,
   EmptyContent,
   EmptyDescription,
   EmptyHeader,
   EmptyMedia,
   EmptyTitle,
} from "@/components/ui/empty";
import VendorForm from "../components/VendorForm";
import { useSelectedVendorGuard } from "../components/useSelectedVendorGuard";
import { removeVendor, updateVendor } from "../api";
import { selectVendorById, selectVendorsLoading } from "../selectors";
import { ROLE_LABELS, VENDOR_FORM_EMPTY_VALUES } from "../constants";

export default function VendorEditPage() {
   const { id } = useParams();
   const dispatch = useAppDispatch();
   const navigate = useNavigate();
   const vendor = useAppSelector((state) => selectVendorById(state, id));
   const loading = useAppSelector(selectVendorsLoading);
   const guard = useSelectedVendorGuard();
   const [confirmingDelete, setConfirmingDelete] = useState(false);

   const backLink = (
      <Button asChild variant="ghost" size="sm" className="-ml-2">
         <Link to="/vendors">
            <ArrowLeft />
            Dostawcy
         </Link>
      </Button>
   );

   if (!vendor) {
      return (
         <div className="space-y-6">
            {backLink}
            {loading ? (
               <Skeleton className="h-96 rounded-xl" />
            ) : (
               <Empty>
                  <EmptyHeader>
                     <EmptyMedia variant="icon">
                        <UserSearch />
                     </EmptyMedia>
                     <EmptyTitle>Nie znaleziono dostawcy</EmptyTitle>
                     <EmptyDescription>
                        Dostawca mógł zostać usunięty albo link jest
                        nieaktualny.
                     </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                     <Button asChild>
                        <Link to="/vendors">Wróć do listy</Link>
                     </Button>
                  </EmptyContent>
               </Empty>
            )}
         </div>
      );
   }

   async function handleSubmit(data) {
      const gate = await guard.ensureSingleSelected(data, id);
      if (!gate.ok) return;
      try {
         await dispatch(updateVendor({ id, changes: data })).unwrap();
         toast.success("Zapisano zmiany");
         navigate("/vendors");
      } catch (err) {
         // zapis padł — poprzedni wybrany wraca na swoje miejsce
         await gate.undo?.();
         toast.error(err);
      }
   }

   async function handleDelete() {
      try {
         await dispatch(removeVendor(id)).unwrap();
         toast.success("Usunięto dostawcę");
         navigate("/vendors");
      } catch (err) {
         toast.error(err);
      } finally {
         setConfirmingDelete(false);
      }
   }

   return (
      <div className="space-y-6">
         {backLink}
         <PageHeader
            title="Edytuj dostawcę"
            subtitle={`${ROLE_LABELS[vendor.role]} · ${vendor.name}`}
         />
         <Card className="max-w-3xl p-4 sm:p-6">
            {/* key — zmiana :id w tej samej trasie nie remountuje strony,
                a react-hook-form czyta defaultValues tylko przy montowaniu */}
            <VendorForm
               key={id}
               defaultValues={Object.fromEntries(
                  Object.keys(VENDOR_FORM_EMPTY_VALUES).map((field) => [
                     field,
                     // null-e z bazy (np. brak ceny) wracają do pustych
                     // wartości formularza
                     vendor[field] ?? VENDOR_FORM_EMPTY_VALUES[field],
                  ]),
               )}
               onSubmit={handleSubmit}
               onCancel={() => navigate("/vendors")}
               submitLabel="Zapisz zmiany"
            />
         </Card>
         <Button
            variant="outline"
            className="w-full text-destructive hover:text-destructive sm:w-auto"
            onClick={() => setConfirmingDelete(true)}
         >
            <Trash2 />
            Usuń dostawcę
         </Button>
         {guard.dialog}
         <ConfirmDialog
            isOpen={confirmingDelete}
            onClose={() => setConfirmingDelete(false)}
            onConfirm={handleDelete}
            title="Usunąć dostawcę?"
            message={`„${vendor.name}" zostanie trwale usunięty.`}
            confirmLabel="Usuń"
         />
      </div>
   );
}
