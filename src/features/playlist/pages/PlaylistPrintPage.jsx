import { Link } from "react-router-dom";
import { ArrowLeft, Printer } from "lucide-react";
import { useAppSelector } from "@/app/hooks";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/date";
import { plural } from "@/lib/plural";
import { selectPlaylistByCategory, selectPlaylistCount } from "../selectors";
import {
   CATEGORIES,
   CATEGORY_DESCRIPTIONS,
   CATEGORY_LABELS,
} from "../constants";

// Dokument do wręczenia DJ-owi: Ctrl+P → „Zapisz jako PDF".
// Bez okładek i bez kolorowych teł — to ma się dobrze wydrukować
export default function PlaylistPrintPage() {
   const activeWedding = useAppSelector((state) => state.wedding.activeWedding);
   const sections = useAppSelector(selectPlaylistByCategory);
   const totalCount = useAppSelector(selectPlaylistCount);

   // puste sekcje tylko zaśmiecałyby wydruk
   const filledCategories = CATEGORIES.filter(
      (category) => sections[category].length > 0,
   );

   return (
      <div className="mx-auto max-w-3xl space-y-6">
         <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
            <Button asChild variant="ghost" size="sm" className="-ml-2">
               <Link to="/playlist">
                  <ArrowLeft />
                  Wróć do playlisty
               </Link>
            </Button>
            <Button onClick={() => window.print()}>
               <Printer />
               Drukuj lub zapisz PDF
            </Button>
         </div>

         <article className="space-y-8 rounded-xl border p-6 print:rounded-none print:border-0 print:p-0">
            <header className="space-y-1 border-b pb-4">
               <h1 className="text-2xl font-bold print:text-black">
                  Lista muzyczna dla DJ-a
               </h1>
               <p className="text-muted-foreground print:text-black">
                  {activeWedding?.name}
                  {activeWedding?.weddingDate &&
                     ` · ${formatDate(activeWedding.weddingDate)}`}
               </p>
               <p className="text-sm text-muted-foreground print:text-black">
                  {totalCount}{" "}
                  {plural(totalCount, ["utwór", "utwory", "utworów"])} w{" "}
                  {filledCategories.length}{" "}
                  {plural(filledCategories.length, [
                     "kategorii",
                     "kategoriach",
                     "kategoriach",
                  ])}
               </p>
            </header>

            {filledCategories.length === 0 ? (
               <p className="text-sm text-muted-foreground">
                  Playlista jest pusta — nie ma czego drukować.
               </p>
            ) : (
               filledCategories.map((category) => (
                  <section key={category} className="space-y-2">
                     <div className="break-after-avoid space-y-0.5 border-b pb-1">
                        <h2 className="text-lg font-semibold print:text-black">
                           {CATEGORY_LABELS[category]}
                        </h2>
                        {/* czarna lista dostaje jednozdaniową instrukcję —
                            sam nagłówek łatwo przeoczyć w biegu na weselu */}
                        {category === "do_not_play" && (
                           <p className="text-sm text-muted-foreground print:text-black">
                              {CATEGORY_DESCRIPTIONS[category]}
                           </p>
                        )}
                     </div>
                     <ol className="space-y-1">
                        {sections[category].map((item, index) => (
                           <li
                              key={item.id}
                              className="flex break-inside-avoid gap-2 text-sm print:text-black"
                           >
                              <span className="w-6 shrink-0 text-right tabular-nums text-muted-foreground print:text-black">
                                 {index + 1}.
                              </span>
                              <span className="min-w-0">
                                 <span className="font-medium">
                                    {item.title}
                                 </span>
                                 {item.artist && (
                                    <span className="text-muted-foreground print:text-black">
                                       {" "}
                                       — {item.artist}
                                    </span>
                                 )}
                                 {item.note && (
                                    <span className="italic text-muted-foreground print:text-black">
                                       {" "}
                                       ({item.note})
                                    </span>
                                 )}
                              </span>
                           </li>
                        ))}
                     </ol>
                  </section>
               ))
            )}
         </article>
      </div>
   );
}
