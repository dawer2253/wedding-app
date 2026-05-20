export default function Badge({ color = "blue", children }) {
   const baseClass = "inline-flex px-2 py-0.5 rounded-full text-xs font-medium";

   const colors = {
      gray: "bg-slate-200 text-slate-800",
      green: "bg-green-200 text-green-800",
      red: "bg-red-200 text-red-800",
      amber: "bg-amber-200 text-amber-800",
      blue: "bg-blue-200 text-blue-800",
   };

   return <span className={`${baseClass} ${colors[color]}`}>{children}</span>;
}
