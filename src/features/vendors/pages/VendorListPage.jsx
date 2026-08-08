import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeftRight, Plus, RotateCcw, Users } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import PageHeader from "@/components/PageHeader";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
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
import { plural } from "@/lib/plural";
import VendorCard from "../components/VendorCard";
import VendorFilters from "../components/VendorFilters";
import { fetchVendors, removeVendor } from "../api";
import {
   selectVendorSections,
   selectVendorsCount,
   selectVendorsError,
   selectVendorsLoading,
} from "../selectors";
import { ROLE_ICONS, ROLE_LABELS } from "../constants";

export default function VendorListPage() {
   const dispatch = useAppDispatch();
   const [searchParams] = useSearchParams();
   const statusParam = searchParams.get("status") || "";
   const sections = useAppSelector((state) =>
      selectVendorSections(state, statusParam),
   );
   const totalCount = useAppSelector(selectVendorsCount);
   const loading = useAppSelector(selectVendorsLoading);
   const error = useAppSelector(selectVendorsError);
   const weddingId = useAppSelector((state) => state.wedding.activeWedding?.id);
   const [vendorToDelete, setVendorToDelete] = useState(null);

   async function handleDelete() {
      try {
         await dispatch(removeVendor(vendorToDelete.id)).unwrap();
         toast.success("Usunięto dostawcę");
      } catch (err) {
         toast.error(err);
      } finally {
         setVendorToDelete(null);
      }
   }

   const addButton = (
      <Button asChild>
         <Link to="/vendors/new">
            <Plus />
            Dodaj dostawcę
         </Link>
      </Button>
   );

   if (loading && totalCount === 0) {
      return (
         <div className="space-y-6">
            <PageHeader title="Dostawcy" />
            <Skeleton className="h-9 w-80 rounded-lg" />
            <div className="space-y-4">
               {Array.from({ length: 3 }, (_, i) => (
                  <Skeleton key={i} className="h-40 rounded-xl" />
               ))}
            </div>
         </div>
      );
   }

   if (error) {
      return (
         <div className="space-y-6">
            <PageHeader title="Dostawcy" />
            <div className="flex items-center justify-between rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
               <p>Nie udało się pobrać dostawców: {error}</p>
               <Button
                  variant="outline"
                  size="sm"
                  onClick={() => dispatch(fetchVendors(weddingId))}
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
            title="Dostawcy"
            subtitle={`${totalCount} ${plural(totalCount, [
               "dostawca",
               "dostawcy",
               "dostawców",
            ])} w ${sections.length} ${
               sections.length === 1 ? "roli" : "rolach"
            }`}
            action={addButton}
         />
         <VendorFilters />

         {totalCount === 0 ? (
            <Empty>
               <EmptyHeader>
                  <EmptyMedia variant="icon">
                     <Users />
                  </EmptyMedia>
                  <EmptyTitle>Brak dostawców</EmptyTitle>
                  <EmptyDescription>
                     Zbieraj tu kontakty do sal, DJ-ów i fotografów. Porównasz
                     oferty i oznaczysz tych, z którymi bierzecie ślub.
                  </EmptyDescription>
               </EmptyHeader>
               <EmptyContent>{addButton}</EmptyContent>
            </Empty>
         ) : (
            <div className="space-y-8">
               {sections.map((section) => {
                  const Icon = ROLE_ICONS[section.role];
                  return (
                     <section key={section.role} className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                           <Icon className="size-4.5 shrink-0 text-muted-foreground" />
                           <span className="font-medium">
                              {ROLE_LABELS[section.role]}
                           </span>
                           <Badge variant="secondary">{section.total}</Badge>
                           <div className="ml-auto flex items-center gap-1">
                              {section.total >= 2 && (
                                 <Button asChild variant="ghost" size="sm">
                                    <Link
                                       to={`/vendors/compare/${section.role}`}
                                    >
                                       <ArrowLeftRight />
                                       Porównaj
                                    </Link>
                                 </Button>
                              )}
                              <Button asChild variant="ghost" size="sm">
                                 <Link to={`/vendors/new?role=${section.role}`}>
                                    <Plus />
                                    <span className="hidden sm:inline">
                                       Dodaj na {ROLE_LABELS[section.role]}
                                    </span>
                                    <span className="sm:hidden">Dodaj</span>
                                 </Link>
                              </Button>
                           </div>
                        </div>
                        {section.vendors.length === 0 ? (
                           <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                              Żaden dostawca w tej roli nie pasuje do wybranych
                              filtrów.
                           </p>
                        ) : (
                           // dwie kolumny dopiero od lg — przy sidebarze 512px
                           // treści na md tnie nazwy i plusy w karcie
                           <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
                              {section.vendors.map((vendor) => (
                                 <VendorCard
                                    key={vendor.id}
                                    vendor={vendor}
                                    onDelete={setVendorToDelete}
                                 />
                              ))}
                           </div>
                        )}
                     </section>
                  );
               })}
            </div>
         )}

         <ConfirmDialog
            isOpen={!!vendorToDelete}
            onClose={() => setVendorToDelete(null)}
            onConfirm={handleDelete}
            title="Usunąć dostawcę?"
            message={
               vendorToDelete
                  ? `„${vendorToDelete.name}" zostanie trwale usunięty.`
                  : ""
            }
            confirmLabel="Usuń"
         />
      </div>
   );
}
