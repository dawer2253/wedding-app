export default function Input({ label, id, error, required, ...props }) {
   return (
      <div className="flex flex-col gap-1">
         <label className="text-sm font-medium text-slate-700" htmlFor={id}>
            {label}
            {required && <span className="text-red-500 ml-0.5"></span>}
         </label>
         <input
            className={`${error ? "border-red-500" : "border-slate-300"} w-full border border-solid py-2 px-3 rounded-md  focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors placeholder:text-slate-400`}
            {...props}
         />
         {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
   );
}
