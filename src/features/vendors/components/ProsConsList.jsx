import { useFieldArray } from "react-hook-form";
import { Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input as UIInput } from "@/components/ui/input";

// useFieldArray wymaga, żeby pozycje były obiektami — stąd { value: "..." };
// spłaszczenie z powrotem do tablicy stringów robi normalize() w VendorForm
export default function ProsConsList({ control, register, name, label, tone }) {
   const { fields, append, remove } = useFieldArray({ control, name });
   const isPros = tone === "pros";
   const Icon = isPros ? Plus : Minus;

   return (
      <Field>
         <FieldLabel>{label}</FieldLabel>
         <div className="space-y-2">
            {fields.map((field, index) => (
               <div key={field.id} className="flex items-center gap-2">
                  <Icon
                     className={`size-4 shrink-0 ${
                        isPros
                           ? "text-green-600 dark:text-green-400"
                           : "text-red-600 dark:text-red-400"
                     }`}
                  />
                  <UIInput
                     placeholder={
                        isPros ? "np. świetne portfolio" : "np. wysoka cena"
                     }
                     {...register(`${name}.${index}.value`)}
                  />
                  <Button
                     type="button"
                     variant="ghost"
                     size="icon"
                     aria-label="Usuń pozycję"
                     onClick={() => remove(index)}
                  >
                     <X />
                  </Button>
               </div>
            ))}
            <Button
               type="button"
               variant="outline"
               size="sm"
               onClick={() => append({ value: "" })}
            >
               <Plus />
               {isPros ? "Dodaj plus" : "Dodaj minus"}
            </Button>
         </div>
      </Field>
   );
}
