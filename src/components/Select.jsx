export default function Select({
   label,
   id,
   options,
   placeholder,
   error,
   ...props
}) {
   return (
      <div className="flex flex-col gap-1">
         <label className="text-sm font-medium text-slate-700" htmlFor={id}>
            {label}
         </label>
         <select
            className={`${error ? "border-red-500" : "border-slate-300"} bg-white w-full border py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors`}
            id={id}
            {...props}
         >
            {placeholder && <option value="">{placeholder}</option>}
            {options?.map((option) => (
               <option key={option.value} value={option.value}>
                  {option.label}
               </option>
            ))}
         </select>
         {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
   );
}
