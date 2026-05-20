export default function PageHeader({ title, subtitle, action }) {
   return (
      <div className="items-center flex justify-between">
         <div className="space-y-2">
            <h1>{title}</h1>
            {subtitle && (
               <p className="text-slate-500 text-sm font-medium">{subtitle}</p>
            )}
         </div>
         {action}
      </div>
   );
}
