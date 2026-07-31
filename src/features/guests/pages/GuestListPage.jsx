import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Plus, RotateCcw, Users } from "lucide-react";
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
import GuestStatsBar from "../components/GuestStatsBar";
import GuestFilters from "../components/GuestFilters";
import GuestTable from "../components/GuestTable";
import { fetchGuests, removeGuest } from "../api";
import {
   selectAllGuests,
   selectFilteredGuests,
   selectGuestsCount,
   selectGuestsError,
   selectGuestsLoading,
} from "../selectors";

export default function GuestListPage() {
   const dispatch = useAppDispatch();
   const guests = useAppSelector(selectFilteredGuests);
   const allGuests = useAppSelector(selectAllGuests);
   const totalCount = useAppSelector(selectGuestsCount);
   const loading = useAppSelector(selectGuestsLoading);
   const error = useAppSelector(selectGuestsError);
   const weddingId = useAppSelector(
      (state) => state.wedding.activeWedding?.id,
   );
   const [guestToDelete, setGuestToDelete] = useState(null);

   async function handleDelete() {
      try {
         await dispatch(removeGuest(guestToDelete.id)).unwrap();
         toast.success("Usunięto gościa");
      } catch (err) {
         toast.error(err);
      } finally {
         setGuestToDelete(null);
      }
   }

   const addButton = (
      <Button asChild>
         <Link to="/guests/new">
            <Plus />
            Dodaj gościa
         </Link>
      </Button>
   );

   if (loading && totalCount === 0) {
      return (
         <div className="space-y-6">
            <PageHeader title="Goście" />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
               {Array.from({ length: 6 }, (_, i) => (
                  <Skeleton key={i} className="h-18 rounded-xl" />
               ))}
            </div>
            <div className="space-y-2">
               {Array.from({ length: 8 }, (_, i) => (
                  <Skeleton key={i} className="h-10 rounded-lg" />
               ))}
            </div>
         </div>
      );
   }

   if (error) {
      return (
         <div className="space-y-6">
            <PageHeader title="Goście" />
            <div className="flex items-center justify-between rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
               <p>Nie udało się pobrać gości: {error}</p>
               <Button
                  variant="outline"
                  size="sm"
                  onClick={() => dispatch(fetchGuests(weddingId))}
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
            title="Goście"
            subtitle={`${totalCount} gości na liście`}
            action={addButton}
         />
         <GuestStatsBar />
         <GuestFilters />

         {totalCount === 0 ? (
            <Empty>
               <EmptyHeader>
                  <EmptyMedia variant="icon">
                     <Users />
                  </EmptyMedia>
                  <EmptyTitle>Brak gości</EmptyTitle>
                  <EmptyDescription>
                     Dodaj pierwszego gościa, aby zacząć planować listę.
                  </EmptyDescription>
               </EmptyHeader>
               <EmptyContent>{addButton}</EmptyContent>
            </Empty>
         ) : guests.length === 0 ? (
            <Empty>
               <EmptyHeader>
                  <EmptyTitle>Brak wyników</EmptyTitle>
                  <EmptyDescription>
                     Żaden gość nie pasuje do wybranych filtrów.
                  </EmptyDescription>
               </EmptyHeader>
            </Empty>
         ) : (
            <GuestTable
               guests={guests}
               allGuests={allGuests}
               onDelete={setGuestToDelete}
            />
         )}

         <ConfirmDialog
            isOpen={!!guestToDelete}
            onClose={() => setGuestToDelete(null)}
            onConfirm={handleDelete}
            title="Usunąć gościa?"
            message={
               guestToDelete
                  ? `${guestToDelete.firstName} ${guestToDelete.lastName} zostanie trwale usunięty z listy.`
                  : ""
            }
            confirmLabel="Usuń"
         />
      </div>
   );
}
