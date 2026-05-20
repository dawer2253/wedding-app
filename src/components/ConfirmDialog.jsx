import Modal from "./Modal";
import Button from "./Button";

export default function ConfirmDialog({
   isOpen,
   onClose,
   onConfirm,
   title,
   message,
   confirmLabel,
}) {
   return (
      <Modal isOpen={isOpen} onClose={onClose} title={title}>
         <p>{message}</p>
         <div className="flex justify-end gap-2 mt-6">
            <Button variant="secondary" onClick={onClose}>
               Anuluj
            </Button>
            <Button variant="primary" onClick={onConfirm}>
               {confirmLabel}
            </Button>
         </div>
      </Modal>
   );
}
