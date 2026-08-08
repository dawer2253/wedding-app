import { useMemo } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import {
   DndContext,
   PointerSensor,
   closestCenter,
   useSensor,
   useSensors,
} from "@dnd-kit/core";
import {
   SortableContext,
   verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useAppDispatch } from "@/app/hooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import TrackRow from "./TrackRow";
import { updatePlaylistItem } from "../api";
import {
   CATEGORY_DESCRIPTIONS,
   CATEGORY_ICONS,
   CATEGORY_LABELS,
} from "../constants";

export default function PlaylistSection({
   category,
   items,
   onAdd,
   onEdit,
   onDelete,
   onChangeCategory,
}) {
   const dispatch = useAppDispatch();
   const sensors = useSensors(
      useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
   );
   const Icon = CATEGORY_ICONS[category];

   // Stabilna tożsamość listy id — nowa tablica powstaje tylko przy zmianie
   // składu sekcji, a nie przy edycji pola utworu
   const itemIdsKey = items.map((item) => item.id).join("\n");
   const itemIds = useMemo(
      () => (itemIdsKey ? itemIdsKey.split("\n") : []),
      [itemIdsKey],
   );

   // Zapis kolejności "ułamkowo": przeciągnięty utwór dostaje wartość między
   // celem a jego sąsiadem — jeden UPDATE, bez przenumerowania całej sekcji
   function handleDragEnd({ active, over }) {
      if (!over || active.id === over.id) return;
      const fromIndex = items.findIndex((item) => item.id === active.id);
      const toIndex = items.findIndex((item) => item.id === over.id);
      if (fromIndex === -1 || toIndex === -1) return;

      // ciągnięcie w dół = ląduje ZA celem, w górę = PRZED celem
      const placeAfter = fromIndex < toIndex;
      const overOrder = items[toIndex].sortOrder;
      if (overOrder == null) return;

      const neighbor = placeAfter ? items[toIndex + 1] : items[toIndex - 1];
      if (neighbor?.id === active.id) return;

      let sortOrder;
      if (!neighbor || neighbor.sortOrder == null) {
         sortOrder = placeAfter ? overOrder + 1 : overOrder - 1;
      } else {
         sortOrder = (overOrder + neighbor.sortOrder) / 2;
      }

      dispatch(updatePlaylistItem({ id: active.id, changes: { sortOrder } }))
         .unwrap()
         .catch((err) => toast.error(err));
   }

   return (
      <section className="space-y-3">
         <div className="flex flex-wrap items-center gap-2">
            <Icon className="size-4.5 shrink-0 text-muted-foreground" />
            <span className="font-medium">{CATEGORY_LABELS[category]}</span>
            <Badge variant="secondary">{items.length}</Badge>
            <Button
               variant="ghost"
               size="sm"
               className="ml-auto"
               onClick={() => onAdd(category)}
            >
               <Plus />
               Dodaj
            </Button>
         </div>

         {items.length === 0 ? (
            <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
               {CATEGORY_DESCRIPTIONS[category]}
            </p>
         ) : (
            <DndContext
               sensors={sensors}
               collisionDetection={closestCenter}
               onDragEnd={handleDragEnd}
            >
               <SortableContext
                  items={itemIds}
                  strategy={verticalListSortingStrategy}
               >
                  {/* ol, nie ul — numeracja niesie informację, bo to
                      kolejność, w jakiej DJ ma zagrać */}
                  <ol className="space-y-2">
                     {items.map((item, index) => (
                        <TrackRow
                           key={item.id}
                           item={item}
                           position={index + 1}
                           onEdit={onEdit}
                           onDelete={onDelete}
                           onChangeCategory={onChangeCategory}
                        />
                     ))}
                  </ol>
               </SortableContext>
            </DndContext>
         )}
      </section>
   );
}
