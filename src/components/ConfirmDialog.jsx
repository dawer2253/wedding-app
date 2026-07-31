import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ConfirmDialog({
   isOpen,
   onClose,
   onConfirm,
   title,
   message,
   confirmLabel = "Potwierdź",
   variant = "destructive",
}) {
   return (
      <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
         <AlertDialogContent>
            <AlertDialogHeader>
               <AlertDialogTitle>{title}</AlertDialogTitle>
               <AlertDialogDescription>{message}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
               <AlertDialogCancel>Anuluj</AlertDialogCancel>
               <AlertDialogAction variant={variant} onClick={onConfirm}>
                  {confirmLabel}
               </AlertDialogAction>
            </AlertDialogFooter>
         </AlertDialogContent>
      </AlertDialog>
   );
}
