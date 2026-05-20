export default function EmptyState({ icon, title, description, action }) {
   return (
      <div className="flex flex-col items-center text-center gap-4 py-12">
         {icon}
         <h2>{title}</h2>
         {description && (
            <p className="text-sm text-slate-500 max-w-sm">{description}</p>
         )}
         {action && <div className="mt-2">{action}</div>}
      </div>
   );
}
