import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ListMusic, Plus, Printer, RotateCcw } from "lucide-react";
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
import { useSheetParams } from "@/hooks/useSheetParams";
import { plural } from "@/lib/plural";
import PlaylistSection from "../components/PlaylistSection";
import TrackSearchDialog from "../components/TrackSearchDialog";
import TrackSheet from "../components/TrackSheet";
import { fetchPlaylistItems, removePlaylistItem, updatePlaylistItem } from "../api";
import {
   maxSortOrderIn,
   selectPlaylistByCategory,
   selectPlaylistCount,
   selectPlaylistError,
   selectPlaylistLoading,
} from "../selectors";
import { CATEGORIES, CATEGORY_LABELS } from "../constants";

export default function PlaylistPage() {
   const dispatch = useAppDispatch();
   const { openEdit } = useSheetParams();
   const sections = useAppSelector(selectPlaylistByCategory);
   const totalCount = useAppSelector(selectPlaylistCount);
   const loading = useAppSelector(selectPlaylistLoading);
   const error = useAppSelector(selectPlaylistError);
   const weddingId = useAppSelector((state) => state.wedding.activeWedding?.id);
   const [itemToDelete, setItemToDelete] = useState(null);
   const [searchOpen, setSearchOpen] = useState(false);
   const [searchCategory, setSearchCategory] = useState(CATEGORIES[0]);

   function handleAdd(category) {
      setSearchCategory(category);
      setSearchOpen(true);
   }

   async function handleChangeCategory(item, category) {
      if (item.category === category) return;
      // utwór ląduje na końcu docelowej sekcji, a nie w środku cudzej kolejności
      const sortOrder = maxSortOrderIn(sections[category]) + 1;
      try {
         await dispatch(
            updatePlaylistItem({ id: item.id, changes: { category, sortOrder } }),
         ).unwrap();
         toast.success(`Przeniesiono do „${CATEGORY_LABELS[category]}"`);
      } catch (err) {
         toast.error(err);
      }
   }

   async function handleDelete() {
      try {
         await dispatch(removePlaylistItem(itemToDelete.id)).unwrap();
         toast.success("Usunięto utwór");
      } catch (err) {
         toast.error(err);
      } finally {
         setItemToDelete(null);
      }
   }

   const addButton = (
      <Button onClick={() => handleAdd(CATEGORIES[0])}>
         <Plus />
         Dodaj utwór
      </Button>
   );

   if (loading && totalCount === 0) {
      return (
         <div className="space-y-6">
            <PageHeader title="Muzyka" />
            <div className="space-y-4">
               {Array.from({ length: 3 }, (_, i) => (
                  <Skeleton key={i} className="h-32 rounded-xl" />
               ))}
            </div>
         </div>
      );
   }

   if (error) {
      return (
         <div className="space-y-6">
            <PageHeader title="Muzyka" />
            <div className="flex items-center justify-between rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
               <p>Nie udało się pobrać playlisty: {error}</p>
               <Button
                  variant="outline"
                  size="sm"
                  onClick={() => dispatch(fetchPlaylistItems(weddingId))}
               >
                  <RotateCcw />
                  Spróbuj ponownie
               </Button>
            </div>
         </div>
      );
   }

   const blacklistCount = sections.do_not_play.length;

   return (
      <div className="space-y-6">
         <PageHeader
            title="Muzyka"
            subtitle={`${totalCount} ${plural(totalCount, [
               "utwór",
               "utwory",
               "utworów",
            ])} dla DJ-a, w tym ${blacklistCount} na czarnej liście`}
            action={
               <div className="flex gap-2">
                  {totalCount > 0 && (
                     <Button asChild variant="outline">
                        <Link to="/playlist/print">
                           <Printer />
                           <span className="hidden sm:inline">
                              Wersja do druku
                           </span>
                        </Link>
                     </Button>
                  )}
                  {addButton}
               </div>
            }
         />

         {totalCount === 0 ? (
            <Empty>
               <EmptyHeader>
                  <EmptyMedia variant="icon">
                     <ListMusic />
                  </EmptyMedia>
                  <EmptyTitle>Playlista jest pusta</EmptyTitle>
                  <EmptyDescription>
                     Zbierz tu utwory, które muszą zabrzmieć, i te, których DJ
                     ma nie grać. Na koniec wydrukujesz gotową listę.
                  </EmptyDescription>
               </EmptyHeader>
               <EmptyContent>{addButton}</EmptyContent>
            </Empty>
         ) : (
            <div className="space-y-8">
               {CATEGORIES.map((category) => (
                  <PlaylistSection
                     key={category}
                     category={category}
                     items={sections[category]}
                     onAdd={handleAdd}
                     onEdit={(item) => openEdit(item.id)}
                     onDelete={setItemToDelete}
                     onChangeCategory={handleChangeCategory}
                  />
               ))}
            </div>
         )}

         <TrackSearchDialog
            open={searchOpen}
            onOpenChange={setSearchOpen}
            category={searchCategory}
            onCategoryChange={setSearchCategory}
         />
         <TrackSheet />

         <ConfirmDialog
            isOpen={!!itemToDelete}
            onClose={() => setItemToDelete(null)}
            onConfirm={handleDelete}
            title="Usunąć utwór?"
            message={
               itemToDelete
                  ? `„${itemToDelete.title}" zniknie z listy dla DJ-a.`
                  : ""
            }
            confirmLabel="Usuń"
         />
      </div>
   );
}
