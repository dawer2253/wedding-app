import LoadingSpinner from "./LoadingSpinner";

export default function Button({
   children,
   variant = "primary",
   disabled,
   ...props
}) {
   const baseClass = "px-4 py-2 font-medium rounded-md transition-colors";

   const variants = {
      primary: "bg-rose-600 hover:bg-rose-700 text-white",
      secondary: "bg-slate-200 hover:bg-slate-300 text-slate-800",
      danger: "bg-red-600 hover:bg-red-700 text-white",
   };

   const disabledClasses = "opacity-50 cursor-not-allowed";

   return (
      <button
         disabled={disabled}
         className={`${baseClass} ${variants[variant]} ${disabled ? disabledClasses : ""}`}
         {...props}
      >
         {children}
      </button>
   );
}
