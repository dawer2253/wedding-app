import { memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, MoreHorizontal, Music, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuRadioGroup,
   DropdownMenuRadioItem,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PreviewButton from "./PreviewButton";
import { formatDuration } from "../music";
import { CATEGORIES, CATEGORY_LABELS } from "../constants";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

// Wiersz jest memoizowany: dnd-kit re-renderuje rodzeństwo przy każdym
// ruchu myszy w trakcie przeciągania
const TrackRow = memo(function TrackRow({
   item,
   position,
   onEdit,
   onDelete,
   onChangeCategory,
}) {
   const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
   } = useSortable({ id: item.id });
   const reduceMotion = useMediaQuery(REDUCED_MOTION_QUERY);

   const duration = formatDuration(item.durationMs);

   return (
      <li
         ref={setNodeRef}
         // dnd-kit podaje transition stylem inline, więc klasa motion-reduce
         // nie miałaby jak go nadpisać — wygaszamy go tutaj
         style={{
            transform: CSS.Translate.toString(transform),
            transition: reduceMotion ? undefined : transition,
         }}
         className={`flex items-center gap-2 rounded-xl border bg-card p-2 pr-1 ${
            isDragging ? "relative z-10 shadow-lg" : ""
         }`}
      >
         <button
            type="button"
            {...attributes}
            {...listeners}
            aria-label={`Zmień kolejność: ${item.title}`}
            className="flex shrink-0 cursor-grab items-center justify-center rounded p-1 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 active:cursor-grabbing"
         >
            <GripVertical className="size-4" />
         </button>

         <span className="w-5 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
            {position}
         </span>

         {item.artworkUrl ? (
            <img
               src={item.artworkUrl}
               alt=""
               loading="lazy"
               className="size-10 shrink-0 rounded-md object-cover"
            />
         ) : (
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
               <Music className="size-4" />
            </div>
         )}

         <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{item.title}</p>
            <p className="truncate text-sm text-muted-foreground">
               {[item.artist, item.album].filter(Boolean).join(" · ") ||
                  "Bez wykonawcy"}
            </p>
            {item.note && (
               <p className="truncate text-xs italic text-muted-foreground">
                  {item.note}
               </p>
            )}
         </div>

         {duration && (
            <span className="hidden shrink-0 text-sm tabular-nums text-muted-foreground sm:inline">
               {duration}
            </span>
         )}

         <PreviewButton
            previewUrl={item.previewUrl}
            externalId={item.externalId}
            source={item.source}
            title={item.title}
         />

         <DropdownMenu>
            <DropdownMenuTrigger asChild>
               <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-muted-foreground"
                  aria-label={`Akcje: ${item.title}`}
               >
                  <MoreHorizontal />
               </Button>
            </DropdownMenuTrigger>
            {/* domyślne min-w-32 shadcn łamie „Wejście pary młodej"
                i „Absolutnie nie grać" na dwie linie */}
            <DropdownMenuContent align="end" className="min-w-48">
               <DropdownMenuLabel>Przenieś do</DropdownMenuLabel>
               <DropdownMenuRadioGroup
                  value={item.category}
                  onValueChange={(category) => onChangeCategory(item, category)}
               >
                  {CATEGORIES.map((category) => (
                     <DropdownMenuRadioItem key={category} value={category}>
                        {CATEGORY_LABELS[category]}
                     </DropdownMenuRadioItem>
                  ))}
               </DropdownMenuRadioGroup>
               <DropdownMenuSeparator />
               <DropdownMenuItem onSelect={() => onEdit(item)}>
                  <Pencil />
                  Edytuj
               </DropdownMenuItem>
               <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => onDelete(item)}
               >
                  <Trash2 />
                  Usuń
               </DropdownMenuItem>
            </DropdownMenuContent>
         </DropdownMenu>
      </li>
   );
});

export default TrackRow;
