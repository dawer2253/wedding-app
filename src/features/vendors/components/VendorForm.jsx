import { Controller, useForm } from "react-hook-form";
import Input from "@/components/Input";
import Select from "@/components/Select";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import ProsConsList from "./ProsConsList";
import StarRating from "./StarRating";
import {
   ROLES,
   ROLE_LABELS,
   STATUSES,
   STATUS_LABELS,
   VENDOR_FORM_EMPTY_VALUES,
} from "../constants";

// Formularz trzyma pros/cons jako obiekty (wymóg useFieldArray) i cenę jako
// string z inputu — spłaszczenie i normalizacja do kształtu z bazy jest tutaj
const normalize = (data) => ({
   name: data.name.trim(),
   role: data.role,
   status: data.status,
   price: data.price === "" ? null : Number(data.price),
   rating: Number(data.rating) || null,
   phone: data.phone.trim(),
   email: data.email.trim(),
   website: data.website.trim(),
   instagram: data.instagram.trim(),
   pros: data.pros.map((item) => item.value.trim()).filter(Boolean),
   cons: data.cons.map((item) => item.value.trim()).filter(Boolean),
   notes: data.notes,
});

const toFieldArray = (values) =>
   (values ?? []).map((value) => ({ value }));

export default function VendorForm({
   defaultValues,
   onSubmit,
   submitLabel,
   onCancel,
}) {
   const {
      register,
      handleSubmit,
      control,
      formState: { errors, isSubmitting },
   } = useForm({
      defaultValues: {
         ...VENDOR_FORM_EMPTY_VALUES,
         ...defaultValues,
         pros: toFieldArray(defaultValues?.pros),
         cons: toFieldArray(defaultValues?.cons),
      },
   });

   return (
      <form
         onSubmit={handleSubmit((data) => onSubmit(normalize(data)))}
         className="space-y-4"
      >
         <Input
            label="Nazwa"
            placeholder="np. Studio Foto Kowalski"
            {...register("name", { required: "Nazwa wymagana" })}
            error={errors.name?.message}
         />

         <div className="grid gap-4 sm:grid-cols-2">
            <Select
               label="Rola"
               placeholder="Wybierz rolę"
               options={ROLES.map((role) => ({
                  value: role,
                  label: ROLE_LABELS[role],
               }))}
               {...register("role", { required: "Rola wymagana" })}
               error={errors.role?.message}
            />
            <Select
               label="Status"
               options={STATUSES.map((status) => ({
                  value: status,
                  label: STATUS_LABELS[status],
               }))}
               {...register("status")}
            />
         </div>

         <div className="grid gap-4 sm:grid-cols-2">
            <Input
               label="Cena (zł)"
               type="number"
               step="0.01"
               min="0"
               placeholder="0,00"
               {...register("price", {
                  validate: (value) => {
                     if (value === "") return true;
                     const amount = Number(value);
                     if (Number.isNaN(amount)) return "Nieprawidłowa kwota";
                     if (amount < 0) return "Cena nie może być ujemna";
                     return true;
                  },
               })}
               error={errors.price?.message}
            />
            <Controller
               control={control}
               name="rating"
               render={({ field }) => (
                  <Field>
                     <FieldLabel>Ocena</FieldLabel>
                     <StarRating
                        value={field.value}
                        onChange={field.onChange}
                     />
                  </Field>
               )}
            />
         </div>

         <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Telefon" type="tel" {...register("phone")} />
            <Input
               label="E-mail"
               type="email"
               {...register("email", {
                  pattern: {
                     value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                     message: "Nieprawidłowy e-mail",
                  },
               })}
               error={errors.email?.message}
            />
            <Input
               label="Strona www"
               placeholder="https://"
               {...register("website")}
            />
            <Input
               label="Instagram"
               placeholder="@nazwa"
               {...register("instagram")}
            />
         </div>

         {/* plusy i minusy obok siebie dopiero od lg — w dwóch kolumnach na
             węższym ekranie input zostaje ~65px i tekst znika */}
         <div className="grid gap-4 lg:grid-cols-2">
            <ProsConsList
               control={control}
               register={register}
               name="pros"
               label="Plusy"
               tone="pros"
            />
            <ProsConsList
               control={control}
               register={register}
               name="cons"
               label="Minusy"
               tone="cons"
            />
         </div>

         <Field>
            <FieldLabel htmlFor="notes">Notatki</FieldLabel>
            <Textarea id="notes" {...register("notes")} />
         </Field>

         <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>
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
