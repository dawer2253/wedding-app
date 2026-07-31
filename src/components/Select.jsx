import { useId } from "react";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
   NativeSelect,
   NativeSelectOption,
} from "@/components/ui/native-select";

export default function Select({
   label,
   id,
   options,
   placeholder,
   error,
   ...props
}) {
   const generatedId = useId();
   const fieldId = id ?? generatedId;

   return (
      <Field data-invalid={!!error}>
         {label && <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>}
         <NativeSelect
            className="w-full"
            id={fieldId}
            aria-invalid={!!error}
            {...props}
         >
            {placeholder && (
               <NativeSelectOption value="">{placeholder}</NativeSelectOption>
            )}
            {options?.map((option) => (
               <NativeSelectOption key={option.value} value={option.value}>
                  {option.label}
               </NativeSelectOption>
            ))}
         </NativeSelect>
         {error && <FieldError>{error}</FieldError>}
      </Field>
   );
}
