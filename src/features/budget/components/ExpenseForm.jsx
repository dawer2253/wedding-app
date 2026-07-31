import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Input from "@/components/Input";
import Select from "@/components/Select";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useAppSelector } from "@/app/hooks";
import { selectGuestHeadcounts } from "@/features/guests/selectors";
import { formatPLN } from "@/lib/currency";
import {
   CATEGORIES,
   CATEGORY_LABELS,
   CHILDREN_COUNTING_LABELS,
   CHILDREN_COUNTING_OPTIONS,
   EXPENSE_FORM_EMPTY_VALUES,
   PRICING_TYPES,
   PRICING_TYPE_LABELS,
   QUANTITY_SOURCES,
   QUANTITY_SOURCE_LABELS,
} from "../constants";
import {
   expenseQuantity,
   expenseTotalGrosze,
   formatQuantity,
   fromGrosze,
   toGrosze,
} from "../money";

const toNumber = (value) =>
   value === "" || value === null || value === undefined ? 0 : Number(value);

// Formularz trzyma kwoty jako stringi z inputów — normalizacja do liczb
// (i null-owanie pól nieaktywnego trybu wyceny, żeby przełączenie
// fixed ↔ per_unit zostawiało w bazie spójne kolumny) dzieje się tu
const normalize = (data, withInitialPayment) => ({
   name: data.name.trim(),
   category: data.category,
   pricingType: data.pricingType,
   totalCost: data.pricingType === "fixed" ? Number(data.totalCost) : null,
   unitPrice: data.pricingType === "per_unit" ? Number(data.unitPrice) : null,
   quantitySource:
      data.pricingType === "per_unit" ? data.quantitySource : null,
   quantity:
      data.pricingType === "per_unit" && data.quantitySource === "manual"
         ? Number(data.quantity)
         : null,
   childrenCounting:
      data.pricingType === "per_unit" && data.quantitySource !== "manual"
         ? data.childrenCounting
         : "full",
   dueDate: data.dueDate,
   vendorName: data.vendorName,
   notes: data.notes,
   ...(withInitialPayment
      ? { initialPayment: toNumber(data.initialPayment) }
      : {}),
});

export default function ExpenseForm({
   defaultValues,
   onSubmit,
   submitLabel,
   withInitialPayment = false,
   cancelTo = "/budget",
}) {
   const navigate = useNavigate();
   const headcounts = useAppSelector(selectGuestHeadcounts);
   const {
      register,
      handleSubmit,
      control,
      watch,
      formState: { errors, isSubmitting },
   } = useForm({
      defaultValues: {
         ...EXPENSE_FORM_EMPTY_VALUES,
         initialPayment: "",
         ...defaultValues,
      },
   });

   const pricingType = watch("pricingType");
   const quantitySource = watch("quantitySource");
   const unitPrice = watch("unitPrice");
   const quantity = watch("quantity");
   const childrenCounting = watch("childrenCounting");

   const isPerUnit = pricingType === "per_unit";
   const isManualQuantity = quantitySource === "manual";

   const previewExpense = {
      pricingType,
      quantitySource,
      childrenCounting,
      unitPrice: toNumber(unitPrice),
      quantity: toNumber(quantity),
   };
   const previewQuantity = expenseQuantity(previewExpense, headcounts);
   const previewTotal = expenseTotalGrosze(previewExpense, headcounts);

   const validateMoney = (value, { required, label }) => {
      if (value === "") return required ? `${label} wymagana` : true;
      const amount = Number(value);
      if (Number.isNaN(amount)) return "Nieprawidłowa kwota";
      if (amount < 0) return `${label} nie może być ujemna`;
      return true;
   };

   const validateInitialPayment = (value, formValues) => {
      const check = validateMoney(value, { required: false, label: "Kwota" });
      if (check !== true) return check;
      const total = expenseTotalGrosze(
         {
            pricingType: formValues.pricingType,
            quantitySource: formValues.quantitySource,
            childrenCounting: formValues.childrenCounting,
            totalCost: toNumber(formValues.totalCost),
            unitPrice: toNumber(formValues.unitPrice),
            quantity: toNumber(formValues.quantity),
         },
         headcounts,
      );
      if (toGrosze(toNumber(value)) > total) {
         return "Zaliczka nie może przekraczać kwoty wydatku";
      }
      return true;
   };

   const submit = (data) => onSubmit(normalize(data, withInitialPayment));

   return (
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
         <Input
            label="Nazwa"
            placeholder="np. Sala, Fotograf, Tort"
            {...register("name", { required: "Nazwa wymagana" })}
            error={errors.name?.message}
         />
         <div className="grid gap-4 sm:grid-cols-2">
            <Select
               label="Kategoria"
               placeholder="Wybierz kategorię"
               options={CATEGORIES.map((category) => ({
                  value: category,
                  label: CATEGORY_LABELS[category],
               }))}
               {...register("category", { required: "Kategoria wymagana" })}
               error={errors.category?.message}
            />
            <Input
               label="Termin płatności"
               type="date"
               {...register("dueDate")}
            />
         </div>

         <Controller
            control={control}
            name="pricingType"
            render={({ field }) => (
               <Field>
                  <FieldLabel>Sposób wyceny</FieldLabel>
                  <ToggleGroup
                     type="single"
                     variant="outline"
                     spacing={0}
                     className="w-full"
                     value={field.value}
                     onValueChange={(value) => value && field.onChange(value)}
                  >
                     {PRICING_TYPES.map((type) => (
                        <ToggleGroupItem
                           key={type}
                           value={type}
                           className="flex-1"
                        >
                           {PRICING_TYPE_LABELS[type]}
                        </ToggleGroupItem>
                     ))}
                  </ToggleGroup>
               </Field>
            )}
         />

         {!isPerUnit && (
            <Input
               label="Kwota (zł)"
               type="number"
               step="0.01"
               min="0"
               placeholder="0,00"
               {...register("totalCost", {
                  validate: (value, formValues) =>
                     formValues.pricingType !== "fixed" ||
                     validateMoney(value, { required: true, label: "Kwota" }),
               })}
               error={errors.totalCost?.message}
            />
         )}

         {isPerUnit && (
            <>
               <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                     label="Cena za sztukę (zł)"
                     type="number"
                     step="0.01"
                     min="0"
                     placeholder="0,00"
                     {...register("unitPrice", {
                        validate: (value, formValues) =>
                           formValues.pricingType !== "per_unit" ||
                           validateMoney(value, {
                              required: true,
                              label: "Cena",
                           }),
                     })}
                     error={errors.unitPrice?.message}
                  />
                  <Select
                     label="Liczba sztuk"
                     options={QUANTITY_SOURCES.map((source) => ({
                        value: source,
                        label: QUANTITY_SOURCE_LABELS[source],
                     }))}
                     {...register("quantitySource")}
                  />
               </div>
               <div className="grid gap-4 sm:grid-cols-2">
                  {isManualQuantity ? (
                     <Input
                        label="Ilość"
                        type="number"
                        step="any"
                        min="0"
                        placeholder="np. 25"
                        {...register("quantity", {
                           validate: (value, formValues) =>
                              formValues.pricingType !== "per_unit" ||
                              formValues.quantitySource !== "manual" ||
                              validateMoney(value, {
                                 required: true,
                                 label: "Ilość",
                              }),
                        })}
                        error={errors.quantity?.message}
                     />
                  ) : (
                     <Select
                        label="Dzieci"
                        options={CHILDREN_COUNTING_OPTIONS.map((option) => ({
                           value: option,
                           label: CHILDREN_COUNTING_LABELS[option],
                        }))}
                        {...register("childrenCounting")}
                     />
                  )}
               </div>
               <p className="text-sm text-muted-foreground">
                  {formatQuantity(previewQuantity)}{" "}
                  {isManualQuantity ? "szt." : "os."} ×{" "}
                  {formatPLN(toNumber(unitPrice))} ={" "}
                  <span className="font-medium text-foreground">
                     {formatPLN(fromGrosze(previewTotal))}
                  </span>
               </p>
            </>
         )}

         {withInitialPayment && (
            <Input
               label="Wpłacona zaliczka (zł) — opcjonalnie"
               type="number"
               step="0.01"
               min="0"
               placeholder="0,00"
               {...register("initialPayment", {
                  validate: validateInitialPayment,
               })}
               error={errors.initialPayment?.message}
            />
         )}

         <Input
            label="Dostawca"
            placeholder="np. nazwa firmy"
            {...register("vendorName")}
         />
         <Field>
            <FieldLabel htmlFor="notes">Notatki</FieldLabel>
            <Textarea id="notes" {...register("notes")} />
         </Field>

         <div className="flex justify-end gap-2 pt-2">
            <Button
               type="button"
               variant="outline"
               onClick={() => navigate(cancelTo)}
            >
               Anuluj
            </Button>
            <Button type="submit" disabled={isSubmitting}>
               {isSubmitting && <Spinner />}
               {submitLabel}
            </Button>
         </div>
      </form>
   );
}
