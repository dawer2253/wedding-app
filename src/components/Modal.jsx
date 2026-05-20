import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({ isOpen, onClose, title, children }) {
   useEffect(() => {
      if (!isOpen) return;

      const handleEsc = (e) => {
         if (e.key === "Escape") onClose();
      };

      window.addEventListener("keydown", handleEsc);
      return () => window.removeEventListener("keydown", handleEsc);
   }, [isOpen, onClose]);

   if (!isOpen) return null;

   return (
      <div
         className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
         onClick={onClose}
      >
         <div
            className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
         >
            {title && (
               <div className="flex justify-between items-center mb-4">
                  <h2>{title}</h2>
                  <button
                     onClick={onClose}
                     className="text-slate-400 hover:text-slate-600"
                  >
                     <X size={20} />
                  </button>
               </div>
            )}
            {children}
         </div>
      </div>
   );
}
