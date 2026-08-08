import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Minus, Pencil, Plus } from "lucide-react";
import { useAppSelector } from "@/app/hooks";
import PageHeader from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import {
   Empty,
   EmptyContent,
   EmptyDescription,
   EmptyHeader,
   EmptyTitle,
} from "@/components/ui/empty";
import { formatPLN } from "@/lib/currency";
import { plural } from "@/lib/plural";
import StarRating from "../components/StarRating";
import { selectVendorsForRole } from "../selectors";
import {
   ROLE_ICONS,
   ROLE_LABELS,
   ROLES,
   STATUS_COLORS,
   STATUS_LABELS,
} from "../constants";

const EMPTY = <span className="text-muted-foreground">—</span>;

// stała referencja — inline [] w useAppSelector re-renderowałoby stronę
// przy każdej zmianie store'a
const NO_VENDORS = [];

// Lista plusów/minusów w komórce — na mobile te same dane lądują w kartach
function ProsCons({ items, tone }) {
   if (items.length === 0) return EMPTY;
   const Icon = tone === "pros" ? Plus : Minus;
   const color =
      tone === "pros"
         ? "text-green-700 dark:text-green-400"
         : "text-red-700 dark:text-red-400";
   return (
      <ul className="space-y-1">
         {items.map((item, index) => (
            <li key={index} className="flex items-start gap-1.5">
               <Icon className={`mt-0.5 size-3 shrink-0 ${color}`} />
               <span>{item}</span>
            </li>
         ))}
      </ul>
   );
}

function Contacts({ vendor }) {
   const lines = [
      vendor.phone,
      vendor.email,
      vendor.website,
      vendor.instagram,
   ].filter(Boolean);
   if (lines.length === 0) return EMPTY;
   return (
      <div className="space-y-0.5">
         {lines.map((line) => (
            <p key={line} className="truncate">
               {line}
            </p>
         ))}
      </div>
   );
}

export default function VendorComparePage() {
   const { role } = useParams();
   const isKnownRole = ROLES.includes(role);
   const vendors = useAppSelector((state) =>
      isKnownRole ? selectVendorsForRole(state, role) : NO_VENDORS,
   );

   const backLink = (
      <Button asChild variant="ghost" size="sm" className="-ml-2">
         <Link to="/vendors">
            <ArrowLeft />
            Dostawcy
         </Link>
      </Button>
   );

   if (!isKnownRole || vendors.length === 0) {
      return (
         <div className="space-y-6">
            {backLink}
            <Empty>
               <EmptyHeader>
                  <EmptyTitle>Nie ma czego porównywać</EmptyTitle>
                  <EmptyDescription>
                     {isKnownRole
                        ? `Brak dostawców na rolę „${ROLE_LABELS[role]}".`
                        : "Nieznana rola dostawcy."}
                  </EmptyDescription>
               </EmptyHeader>
               <EmptyContent>
                  <Button asChild>
                     <Link to="/vendors">Wróć do listy</Link>
                  </Button>
               </EmptyContent>
            </Empty>
         </div>
      );
   }

   const Icon = ROLE_ICONS[role];
   // Wybrany dostawca dostaje podświetloną kolumnę / kartę
   const highlight = (vendor) =>
      vendor.status === "selected" ? "bg-green-50 dark:bg-green-500/10" : "";

   const ROWS = [
      {
         label: "Status",
         render: (vendor) => (
            <Badge className={STATUS_COLORS[vendor.status]}>
               {STATUS_LABELS[vendor.status]}
            </Badge>
         ),
      },
      {
         label: "Cena",
         render: (vendor) =>
            vendor.price === null ? (
               EMPTY
            ) : (
               <span className="font-medium">{formatPLN(vendor.price)}</span>
            ),
      },
      {
         label: "Ocena",
         render: (vendor) =>
            vendor.rating ? <StarRating value={vendor.rating} /> : EMPTY,
      },
      {
         label: "Plusy",
         render: (vendor) => <ProsCons items={vendor.pros} tone="pros" />,
      },
      {
         label: "Minusy",
         render: (vendor) => <ProsCons items={vendor.cons} tone="cons" />,
      },
      { label: "Kontakt", render: (vendor) => <Contacts vendor={vendor} /> },
      {
         label: "Notatki",
         render: (vendor) =>
            vendor.notes ? (
               <span className="whitespace-pre-line">{vendor.notes}</span>
            ) : (
               EMPTY
            ),
      },
      {
         label: "",
         render: (vendor) => (
            <Button asChild variant="ghost" size="sm">
               <Link to={`/vendors/${vendor.id}/edit`}>
                  <Pencil />
                  Edytuj
               </Link>
            </Button>
         ),
      },
   ];

   return (
      <div className="space-y-6">
         {backLink}
         <PageHeader
            title={`Porównanie: ${ROLE_LABELS[role]}`}
            subtitle={`${vendors.length} ${plural(vendors.length, [
               "dostawca",
               "dostawcy",
               "dostawców",
            ])} do porównania`}
         />

         {/* Poniżej md tabela nie mieści się na ekranie — te same atrybuty
             lecą jako stos kart, jedna karta = jeden dostawca */}
         <div className="hidden lg:block">
            <Card className="p-0">
               {/* table-fixed — kolumny dostawców równej szerokości, bo
                   porównanie z kolumnami rozjeżdżonymi długością treści
                   przestaje się skanować wzrokiem. min-w wymusza poziomy
                   scroll kontenera, gdy sidebar zabiera miejsce */}
               <Table className="min-w-[640px] table-fixed">
                  <TableHeader>
                     <TableRow>
                        <TableHead className="sticky left-0 z-10 w-36 border-r bg-card">
                           <span className="flex items-center gap-2">
                              <Icon className="size-4" />
                              Atrybut
                           </span>
                        </TableHead>
                        {vendors.map((vendor) => (
                           <TableHead
                              key={vendor.id}
                              className={`font-medium wrap-anywhere whitespace-normal text-foreground ${highlight(vendor)}`}
                           >
                              {vendor.name}
                           </TableHead>
                        ))}
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {ROWS.map((row, index) => (
                        <TableRow key={row.label || index}>
                           <TableCell className="sticky left-0 z-10 border-r bg-card align-top font-medium text-muted-foreground">
                              {row.label}
                           </TableCell>
                           {vendors.map((vendor) => (
                              <TableCell
                                 key={vendor.id}
                                 className={`align-top wrap-anywhere whitespace-normal ${highlight(vendor)}`}
                              >
                                 {row.render(vendor)}
                              </TableCell>
                           ))}
                        </TableRow>
                     ))}
                  </TableBody>
               </Table>
            </Card>
         </div>

         <div className="space-y-3 lg:hidden">
            {vendors.map((vendor) => (
               <Card
                  key={vendor.id}
                  className={`gap-3 p-4 ${
                     vendor.status === "selected" ? "border-green-500/60" : ""
                  }`}
               >
                  <p className="font-medium">{vendor.name}</p>
                  <dl className="space-y-2 text-sm">
                     {ROWS.filter((row) => row.label).map((row) => (
                        <div key={row.label} className="flex gap-3">
                           <dt className="w-24 shrink-0 text-muted-foreground">
                              {row.label}
                           </dt>
                           <dd className="min-w-0 flex-1">
                              {row.render(vendor)}
                           </dd>
                        </div>
                     ))}
                  </dl>
                  <Button asChild variant="outline" size="sm" className="w-fit">
                     <Link to={`/vendors/${vendor.id}/edit`}>
                        <Pencil />
                        Edytuj
                     </Link>
                  </Button>
               </Card>
            ))}
         </div>
      </div>
   );
}
