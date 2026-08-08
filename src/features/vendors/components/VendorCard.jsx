import { Link } from "react-router-dom";
import {
   AtSign,
   Globe,
   Mail,
   Minus,
   Pencil,
   Phone,
   Plus,
   Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatPLN } from "@/lib/currency";
import StarRating from "./StarRating";
import { STATUS_COLORS, STATUS_LABELS } from "../constants";

export default function VendorCard({ vendor, onDelete }) {
   const { pros, cons } = vendor;

   // zielony = wybrany, ten sam sygnał co podświetlona kolumna w porównaniu —
   // jeden kolor niesie tę samą informację w obu widokach
   return (
      <Card
         className={`gap-3 p-4 ${
            vendor.status === "selected"
               ? "border-green-500/60 bg-green-50/60 dark:bg-green-500/5"
               : ""
         } ${vendor.status === "rejected" ? "opacity-60" : ""}`}
      >
         <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1 space-y-1">
               <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate font-medium">{vendor.name}</span>
                  <Badge className={STATUS_COLORS[vendor.status]}>
                     {STATUS_LABELS[vendor.status]}
                  </Badge>
               </div>
               {/* rola nie wraca w karcie — sekcja listy już nią jest */}
               <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  {vendor.price !== null && (
                     <span className="font-medium text-foreground">
                        {formatPLN(vendor.price)}
                     </span>
                  )}
                  {vendor.rating ? <StarRating value={vendor.rating} /> : null}
               </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
               <Button asChild variant="ghost" size="icon" aria-label="Edytuj">
                  <Link to={`/vendors/${vendor.id}/edit`}>
                     <Pencil />
                  </Link>
               </Button>
               <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Usuń"
                  onClick={() => onDelete(vendor)}
               >
                  <Trash2 />
               </Button>
            </div>
         </div>

         {(pros.length > 0 || cons.length > 0) && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
               {pros.length > 0 && (
                  <span className="flex min-w-0 items-center gap-1 text-green-700 dark:text-green-400">
                     <Plus className="size-3 shrink-0" />
                     <span className="truncate">{pros[0]}</span>
                     {pros.length > 1 && (
                        <span className="shrink-0 text-muted-foreground">
                           +{pros.length - 1}
                        </span>
                     )}
                  </span>
               )}
               {cons.length > 0 && (
                  <span className="flex min-w-0 items-center gap-1 text-red-700 dark:text-red-400">
                     <Minus className="size-3 shrink-0" />
                     <span className="truncate">{cons[0]}</span>
                     {cons.length > 1 && (
                        <span className="shrink-0 text-muted-foreground">
                           +{cons.length - 1}
                        </span>
                     )}
                  </span>
               )}
            </div>
         )}

         {(vendor.phone ||
            vendor.email ||
            vendor.instagram ||
            vendor.website) && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
               {vendor.phone && (
                  <a
                     href={`tel:${vendor.phone}`}
                     className="flex items-center gap-1 hover:text-foreground"
                  >
                     <Phone className="size-3" />
                     {vendor.phone}
                  </a>
               )}
               {vendor.email && (
                  <a
                     href={`mailto:${vendor.email}`}
                     className="flex min-w-0 items-center gap-1 hover:text-foreground"
                  >
                     <Mail className="size-3 shrink-0" />
                     <span className="truncate">{vendor.email}</span>
                  </a>
               )}
               {vendor.instagram && (
                  <span className="flex items-center gap-1">
                     <AtSign className="size-3" />
                     {vendor.instagram}
                  </span>
               )}
               {vendor.website && (
                  <a
                     href={vendor.website}
                     target="_blank"
                     rel="noreferrer"
                     className="flex min-w-0 items-center gap-1 hover:text-foreground"
                  >
                     <Globe className="size-3 shrink-0" />
                     <span className="truncate">
                        {vendor.website.replace(/^https?:\/\//, "")}
                     </span>
                  </a>
               )}
            </div>
         )}
      </Card>
   );
}
