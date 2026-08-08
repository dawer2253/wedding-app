import { Star } from "lucide-react";

const STARS = [1, 2, 3, 4, 5];

// Bez onChange to zwykły podgląd oceny; z onChange — 5 klikalnych gwiazdek,
// ponowny klik w aktualną ocenę ją czyści (rating w bazie jest nullowalny)
export default function StarRating({ value = 0, onChange, className = "" }) {
   const rating = value ?? 0;

   if (!onChange) {
      return (
         <span
            className={`inline-flex items-center gap-0.5 ${className}`}
            aria-label={`Ocena: ${rating} z 5`}
         >
            {STARS.map((star) => (
               <Star
                  key={star}
                  className={`size-3.5 ${
                     star <= rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/40"
                  }`}
               />
            ))}
         </span>
      );
   }

   return (
      <div className={`flex items-center gap-1 ${className}`}>
         {STARS.map((star) => (
            <button
               key={star}
               type="button"
               aria-label={`Oceń na ${star}`}
               aria-pressed={star <= rating}
               onClick={() => onChange(star === rating ? 0 : star)}
               className="rounded p-0.5 transition-transform hover:scale-110"
            >
               <Star
                  className={`size-6 ${
                     star <= rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/40"
                  }`}
               />
            </button>
         ))}
      </div>
   );
}
