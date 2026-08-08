import { useForm } from "react-hook-form";
import Input from "@/components/Input";
import Select from "@/components/Select";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { CATEGORIES, CATEGORY_LABELS, PLAYLIST_FORM_EMPTY_VALUES } from "../constants";

// Formularz oddaje tylko pola edytowalne ręcznie — metadane z iTunes
// (okładka, próbka, trackId) zostają nietknięte przy edycji
const normalize = (data) => ({
   title: data.title.trim(),
   artist: data.artist.trim(),
   category: data.category,
   note: data.note.trim(),
});

export default function TrackForm({
   defaultValues,
   onSubmit,
   submitLabel,
   onCancel,
}) {
   const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
   } = useForm({
      defaultValues: { ...PLAYLIST_FORM_EMPTY_VALUES, ...defaultValues },
   });

   return (
      <form
         onSubmit={handleSubmit((data) => onSubmit(normalize(data)))}
         className="space-y-4 pt-4"
      >
         <Input
            label="Tytuł"
            placeholder="np. Perfect"
            {...register("title", { required: "Tytuł wymagany" })}
            error={errors.title?.message}
         />
         <Input
            label="Wykonawca"
            placeholder="np. Ed Sheeran"
            {...register("artist")}
            error={errors.artist?.message}
         />
         <Select
            label="Kategoria"
            options={CATEGORIES.map((category) => ({
               value: category,
               label: CATEGORY_LABELS[category],
            }))}
            {...register("category", { required: "Kategoria wymagana" })}
            error={errors.category?.message}
         />
         <Input
            label="Notatka dla DJ-a"
            placeholder="np. tylko refren, koniecznie po północy"
            {...register("note")}
            error={errors.note?.message}
         />

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
