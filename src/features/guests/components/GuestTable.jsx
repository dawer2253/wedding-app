import { memo, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
   DndContext,
   PointerSensor,
   closestCenter,
   useSensor,
   useSensors,
} from "@dnd-kit/core";
import {
   SortableContext,
   useSortable,
   verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { addGuest, updateGuest } from "../api";
import { NO_GROUP_LABEL } from "../constants";
import GuestRsvpBadge from "./GuestRsvpBadge";

// Poniżej md tabela składa się do dwóch kolumn (gość + status RSVP),
// a tap w wiersz otwiera sheet edycji — reszta pól jest dostępna tam
const DESKTOP_QUERY = "(min-width: 768px)";

function ToggleCell({ guest, field, label }) {
   const dispatch = useAppDispatch();

   async function handleChange(checked) {
      try {
         await dispatch(
            updateGuest({ id: guest.id, changes: { [field]: checked === true } }),
         ).unwrap();
      } catch (err) {
         toast.error(err);
      }
   }

   return (
      <Checkbox
         checked={guest[field]}
         onCheckedChange={handleChange}
         aria-label={label}
         className="mx-auto"
      />
   );
}

function PhoneCell({ guest }) {
   const dispatch = useAppDispatch();

   async function save(event) {
      const next = event.target.value.trim();
      if (next === guest.phone) return;
      try {
         await dispatch(
            updateGuest({ id: guest.id, changes: { phone: next } }),
         ).unwrap();
      } catch (err) {
         toast.error(err);
      }
   }

   return (
      <Input
         key={guest.phone}
         defaultValue={guest.phone}
         onBlur={save}
         onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
         placeholder="dodaj numer"
         type="tel"
         className="h-7 w-full border-transparent shadow-none hover:border-input"
      />
   );
}

// Ciężka zawartość wiersza (Radixowe checkboxy, dropdown, input) — memo
// na guest/onDelete, więc NIE przerysowuje się podczas przeciągania,
// gdy zmieniają się tylko transformacje sortable
const GuestRowContent = memo(function GuestRowContent({ guest, onDelete }) {
   return (
      <>
         <TableCell className="truncate py-3 font-medium md:py-1">
            <span className="flex items-center gap-1.5">
               <span className="truncate">
                  {guest.firstName} {guest.lastName}
               </span>
               {guest.hasPlusOne && (
                  <span className="shrink-0 rounded-full bg-muted px-1.5 text-[10px] font-semibold text-muted-foreground md:hidden">
                     +1
                  </span>
               )}
            </span>
            {guest.hasPlusOne && guest.plusOneName && (
               <span className="block truncate text-xs font-normal text-muted-foreground">
                  + {guest.plusOneName}
               </span>
            )}
         </TableCell>
         <TableCell className="hidden truncate py-1 text-muted-foreground md:table-cell">
            {guest.group || NO_GROUP_LABEL}
         </TableCell>
         <TableCell className="hidden py-1 md:table-cell">
            <ToggleCell
               guest={guest}
               field="hasPlusOne"
               label="Z osobą towarzyszącą"
            />
         </TableCell>
         <TableCell className="hidden py-1 md:table-cell">
            <ToggleCell guest={guest} field="isChild" label="Dziecko" />
         </TableCell>
         <TableCell className="hidden py-1 md:table-cell">
            <PhoneCell guest={guest} />
         </TableCell>
         <TableCell className="py-3 md:py-1">
            <GuestRsvpBadge guest={guest} />
         </TableCell>
         <TableCell className="hidden py-1 text-right md:table-cell">
            <div className="inline-flex gap-0.5">
               <Button
                  asChild
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Edytuj"
               >
                  <Link to={{ search: `?edit=${guest.id}` }}>
                     <Pencil />
                  </Link>
               </Button>
               <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Usuń"
                  className="text-destructive hover:text-destructive"
                  onClick={() => onDelete(guest)}
               >
                  <Trash2 />
               </Button>
            </div>
         </TableCell>
      </>
   );
});

// Lekka "skorupa" sortable: tylko <tr>, transformacja i uchwyt.
// Re-rendery wywoływane przez dnd-kit w trakcie przeciągania kosztują
// tyle co jeden tr + button — komórki wyżej są odcięte przez memo
const GuestRow = memo(function GuestRow({ guest, onDelete }) {
   const navigate = useNavigate();
   const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
   } = useSortable({ id: guest.id });

   // Na mobile wiersz nie ma kolumny akcji — tap otwiera sheet edycji.
   // Tapnięcia w elementy interaktywne (checkbox, badge, input) pomijamy
   function handleRowClick(event) {
      if (window.matchMedia(DESKTOP_QUERY).matches) return;
      // Dropdown statusu jest portalowany poza wiersz, ale React bąbelkuje
      // zdarzenia przez drzewo komponentów — klik w pozycję menu (div,
      // nie button) nie może otwierać edycji
      if (!event.currentTarget.contains(event.target)) return;
      if (event.target.closest("button, a, input")) return;
      navigate({ search: `?edit=${guest.id}` });
   }

   return (
      <TableRow
         ref={setNodeRef}
         style={{ transform: CSS.Translate.toString(transform), transition }}
         className={isDragging ? "relative z-10 bg-muted" : undefined}
         onClick={handleRowClick}
      >
         <TableCell className="hidden py-1 md:table-cell">
            <button
               type="button"
               {...attributes}
               {...listeners}
               aria-label="Zmień kolejność"
               className="flex cursor-grab items-center justify-center rounded text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 active:cursor-grabbing"
            >
               <GripVertical className="size-4" />
            </button>
         </TableCell>
         <GuestRowContent guest={guest} onDelete={onDelete} />
      </TableRow>
   );
});

// Szybkie dodawanie na dole tabeli: imię + nazwisko, Enter zapisuje
// i wraca focusem na pierwsze pole — można klepać gości seryjnie
function QuickAddRow() {
   const dispatch = useAppDispatch();
   // colSpan musi odpowiadać liczbie WIDOCZNYCH kolumn: przy table-fixed
   // nadmiarowy colspan dokłada kolumny-widma, które zabierają szerokość
   // kolumnie "Gość" (na mobile zostawało jej ~36px)
   const isDesktop = useMediaQuery(DESKTOP_QUERY);
   const weddingId = useAppSelector(
      (state) => state.wedding.activeWedding?.id,
   );
   const [firstName, setFirstName] = useState("");
   const [lastName, setLastName] = useState("");
   const [saving, setSaving] = useState(false);
   const firstNameRef = useRef(null);

   const canSubmit = firstName.trim() && lastName.trim() && !saving;

   async function submit() {
      if (!canSubmit) return;
      setSaving(true);
      try {
         await dispatch(
            addGuest({
               firstName: firstName.trim(),
               lastName: lastName.trim(),
               weddingId,
            }),
         ).unwrap();
         setFirstName("");
         setLastName("");
         firstNameRef.current?.focus();
      } catch (err) {
         toast.error(err);
      } finally {
         setSaving(false);
      }
   }

   function handleKeyDown(e) {
      if (e.key === "Enter") submit();
   }

   return (
      <TableRow className="bg-muted/30 hover:bg-muted/30">
         {/* Jedna komórka przez całą szerokość tabeli — flex układa
             zawartość niezależnie od siatki kolumn */}
         <TableCell className="py-1.5" colSpan={isDesktop ? 8 : 2}>
            <div className="flex flex-wrap items-center gap-2">
               {saving ? (
                  <Spinner className="size-4 shrink-0" />
               ) : (
                  <Plus className="size-4 shrink-0 text-muted-foreground" />
               )}
               {/* readOnly zamiast disabled — disabled input ignoruje .focus(),
                   więc kursor nie wracałby na pole po zapisie Enterem */}
               <Input
                  ref={firstNameRef}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Imię"
                  readOnly={saving}
                  className="h-8 min-w-24 flex-1 md:h-7 md:max-w-40"
               />
               <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Nazwisko"
                  readOnly={saving}
                  className="h-8 min-w-24 flex-1 md:h-7 md:max-w-40"
               />
               <Button
                  variant="outline"
                  size="sm"
                  onClick={submit}
                  disabled={!canSubmit}
               >
                  Dodaj
               </Button>
               <span className="hidden text-xs text-muted-foreground lg:inline">
                  Enter, aby dodać — resztę uzupełnisz w wierszu
               </span>
            </div>
         </TableCell>
      </TableRow>
   );
}

// Desktop: py-1 (~37px); mobile: py-3 + większy touch target (~53px)
const ROW_HEIGHT_DESKTOP = 37;
const ROW_HEIGHT_MOBILE = 53;

export default function GuestTable({ guests, allGuests, onDelete }) {
   const dispatch = useAppDispatch();
   const isDesktop = useMediaQuery(DESKTOP_QUERY);
   const estimatedRowHeight = isDesktop
      ? ROW_HEIGHT_DESKTOP
      : ROW_HEIGHT_MOBILE;
   const sensors = useSensors(
      useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
   );

   // Wirtualizacja: tabela ma własny scroll (max ~70vh, sticky nagłówek),
   // a w DOM istnieje tylko ~20-30 wierszy widocznych w oknie (+ zapas) —
   // wysokość reszty utrzymują wiersze dystansowe. Mount i każdy re-render
   // kosztują tyle samo przy 100 i przy 1000 gości.
   const wrapperRef = useRef(null);
   const virtualizer = useVirtualizer({
      count: guests.length,
      getScrollElement: () => wrapperRef.current,
      estimateSize: () => estimatedRowHeight,
      overscan: 10,
   });

   // Zmiana breakpointu = inna wysokość wiersza — bez tego wirtualizator
   // trzyma zmierzone rozmiary ze starego układu
   useEffect(() => {
      virtualizer.measure();
   }, [estimatedRowHeight, virtualizer]);
   const virtualItems = virtualizer.getVirtualItems();
   const paddingTop = virtualItems.length ? virtualItems[0].start : 0;
   const paddingBottom = virtualItems.length
      ? virtualizer.getTotalSize() - virtualItems[virtualItems.length - 1].end
      : 0;
   const visibleGuests = virtualItems.map((item) => guests[item.index]);

   // Stabilna tożsamość listy id: nowa tablica powstaje tylko gdy zmieni się
   // kolejność/skład, a nie przy każdej edycji pola gościa. Bez tego
   // SortableContext dostawał nową wartość przy każdym kliknięciu i wymuszał
   // re-render wszystkich wierszy z pominięciem memo.
   const itemIdsKey = visibleGuests.map((g) => g.id).join("\n");
   const itemIds = useMemo(
      () => (itemIdsKey ? itemIdsKey.split("\n") : []),
      [itemIdsKey],
   );

   // Zapis kolejności "ułamkowo": przeciągnięty gość dostaje wartość między
   // celem a jego PRAWDZIWYM sąsiadem z pełnej listy (allGuests) — jeden
   // UPDATE, bez kolizji z wierszami ukrytymi przez aktywne filtry
   function handleDragEnd({ active, over }) {
      if (!over || active.id === over.id) return;
      const fromIndex = guests.findIndex((g) => g.id === active.id);
      const toIndex = guests.findIndex((g) => g.id === over.id);
      if (fromIndex === -1 || toIndex === -1) return;

      // ciągnięcie w dół = ląduje ZA celem, w górę = PRZED celem
      const placeAfter = fromIndex < toIndex;
      const fullIndex = allGuests.findIndex((g) => g.id === over.id);
      if (fullIndex === -1) return;
      const overOrder = allGuests[fullIndex].sortOrder;
      if (overOrder == null) return;

      const neighbor = placeAfter
         ? allGuests[fullIndex + 1]
         : allGuests[fullIndex - 1];
      if (neighbor?.id === active.id) return;

      let sortOrder;
      if (!neighbor || neighbor.sortOrder == null) {
         sortOrder = placeAfter ? overOrder + 1 : overOrder - 1;
      } else {
         sortOrder = (overOrder + neighbor.sortOrder) / 2;
      }

      dispatch(updateGuest({ id: active.id, changes: { sortOrder } }))
         .unwrap()
         .catch((err) => toast.error(err));
   }

   return (
      <div
         ref={wrapperRef}
         className="max-h-[65dvh] overflow-auto rounded-xl ring-1 ring-foreground/10 md:max-h-[70vh]"
      >
         <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
         >
            <Table className="w-full table-fixed">
               <TableHeader className="sticky top-0 z-10 bg-background">
                  <TableRow>
                     <TableHead className="hidden w-8 md:table-cell" />
                     <TableHead className="md:w-[22%]">Gość</TableHead>
                     <TableHead className="hidden md:table-cell md:w-[13%]">
                        Grupa
                     </TableHead>
                     <TableHead className="hidden text-center md:table-cell md:w-[8%]">
                        Os. tow.
                     </TableHead>
                     <TableHead className="hidden text-center md:table-cell md:w-[8%]">
                        Dziecko
                     </TableHead>
                     <TableHead className="hidden md:table-cell md:w-[17%]">
                        Telefon
                     </TableHead>
                     <TableHead className="w-30 md:w-[14%]">Status</TableHead>
                     <TableHead className="hidden text-right md:table-cell md:w-[10%]">
                        Akcje
                     </TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {paddingTop > 0 && (
                     <tr aria-hidden="true" style={{ height: paddingTop }} />
                  )}
                  <SortableContext
                     items={itemIds}
                     strategy={verticalListSortingStrategy}
                  >
                     {visibleGuests.map((guest) => (
                        <GuestRow
                           key={guest.id}
                           guest={guest}
                           onDelete={onDelete}
                        />
                     ))}
                  </SortableContext>
                  {paddingBottom > 0 && (
                     <tr aria-hidden="true" style={{ height: paddingBottom }} />
                  )}
                  <QuickAddRow />
               </TableBody>
            </Table>
         </DndContext>
      </div>
   );
}
