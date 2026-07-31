import { useId } from "react";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input as UIInput } from "@/components/ui/input";

export default function Input({ label, id, error, ...props }) {
   const generatedId = useId();
   const fieldId = id ?? generatedId;

   return (
      <Field data-invalid={!!error}>
         {label && <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>}
         <UIInput id={fieldId} aria-invalid={!!error} {...props} />
         {error && <FieldError>{error}</FieldError>}
      </Field>
   );
}
