import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Input from "@/components/Input";
import Select from "@/components/Select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
   GUEST_FORM_EMPTY_VALUES,
   RSVP_LABELS,
   RSVP_STATUSES,
} from "../constants";

export default function GuestForm({ defaultValues, onSubmit, submitLabel }) {
   const navigate = useNavigate();
   const {
      register,
      handleSubmit,
      control,
      watch,
      formState: { errors, isSubmitting },
   } = useForm({
      defaultValues: { ...GUEST_FORM_EMPTY_VALUES, ...defaultValues },
   });

   const hasPlusOne = watch("hasPlusOne");

   return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
         <div className="grid gap-4 sm:grid-cols-2">
            <Input
               label="Imię"
               {...register("firstName", { required: "Imię wymagane" })}
               error={errors.firstName?.message}
            />
            <Input
               label="Nazwisko"
               {...register("lastName", { required: "Nazwisko wymagane" })}
               error={errors.lastName?.message}
            />
         </div>
         <div className="grid gap-4 sm:grid-cols-2">
            <Input
               label="Grupa"
               placeholder="np. Rodzina, Znajomi"
               {...register("group")}
            />
            <Select
               label="Status RSVP"
               options={RSVP_STATUSES.map((status) => ({
                  value: status,
                  label: RSVP_LABELS[status],
               }))}
               {...register("rsvpStatus")}
            />
         </div>

         <Controller
            control={control}
            name="hasPlusOne"
            render={({ field }) => (
               <Field orientation="horizontal">
                  <Checkbox
                     id="hasPlusOne"
                     checked={field.value}
                     onCheckedChange={field.onChange}
                  />
                  <FieldLabel htmlFor="hasPlusOne" className="font-normal">
                     Z osobą towarzyszącą
                  </FieldLabel>
               </Field>
            )}
         />
         {hasPlusOne && (
            <Input
               label="Imię i nazwisko osoby towarzyszącej"
               {...register("plusOneName")}
            />
         )}
         <Controller
            control={control}
            name="isChild"
            render={({ field }) => (
               <Field orientation="horizontal">
                  <Checkbox
                     id="isChild"
                     checked={field.value}
                     onCheckedChange={field.onChange}
                  />
                  <FieldLabel htmlFor="isChild" className="font-normal">
                     Dziecko
                  </FieldLabel>
               </Field>
            )}
         />

         <Field>
            <FieldLabel htmlFor="dietaryNotes">
               Preferencje żywieniowe
            </FieldLabel>
            <Textarea
               id="dietaryNotes"
               placeholder="np. dieta wegetariańska, bez glutenu"
               {...register("dietaryNotes")}
            />
         </Field>
         <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Telefon" type="tel" {...register("phone")} />
            <Input label="E-mail" type="email" {...register("email")} />
         </div>
         <Field>
            <FieldLabel htmlFor="notes">Notatki</FieldLabel>
            <Textarea id="notes" {...register("notes")} />
         </Field>

         <div className="flex justify-end gap-2 pt-2">
            <Button
               type="button"
               variant="outline"
               onClick={() => navigate("/guests")}
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
