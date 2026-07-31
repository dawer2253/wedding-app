import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { UserX } from "lucide-react";
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
import GuestForm from "../components/GuestForm";
import { updateGuest } from "../api";
import { selectGuestById, selectGuestsLoading } from "../selectors";
import { GUEST_FORM_EMPTY_VALUES } from "../constants";

export default function GuestEditPage() {
   const { id } = useParams();
   const dispatch = useAppDispatch();
   const navigate = useNavigate();
   const guest = useAppSelector((state) => selectGuestById(state, id));
   const loading = useAppSelector(selectGuestsLoading);

   async function handleSubmit(data) {
      try {
         await dispatch(updateGuest({ id, changes: data })).unwrap();
         toast.success("Zapisano zmiany");
         navigate("/guests");
      } catch (err) {
         toast.error(err);
      }
   }

   if (!guest && loading) {
      return (
         <div className="space-y-6">
            <PageHeader title="Edytuj gościa" />
            <Skeleton className="h-96 max-w-xl rounded-xl" />
         </div>
      );
   }

   if (!guest) {
      return (
         <Empty>
            <EmptyHeader>
               <EmptyMedia variant="icon">
                  <UserX />
               </EmptyMedia>
               <EmptyTitle>Nie znaleziono gościa</EmptyTitle>
               <EmptyDescription>
                  Gość mógł zostać usunięty albo link jest nieaktualny.
               </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
               <Button asChild>
                  <Link to="/guests">Wróć do listy</Link>
               </Button>
            </EmptyContent>
         </Empty>
      );
   }

   return (
      <div className="space-y-6">
         <PageHeader
            title="Edytuj gościa"
            subtitle={`${guest.firstName} ${guest.lastName}`}
         />
         <Card className="max-w-xl">
            <CardContent>
               <GuestForm
                  key={id}
                  defaultValues={Object.fromEntries(
                     Object.keys(GUEST_FORM_EMPTY_VALUES).map((field) => [
                        field,
                        guest[field],
                     ]),
                  )}
                  onSubmit={handleSubmit}
                  submitLabel="Zapisz zmiany"
               />
            </CardContent>
         </Card>
      </div>
   );
}
