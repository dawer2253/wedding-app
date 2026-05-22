import { format, parseISO, isBefore, startOfDay } from "date-fns";
import { pl } from "date-fns/locale";

export function formatDate(iso) {
   return format(parseISO(iso), "d MMM yyyy", { locale: pl });
}

export function isOverdue(dueDate) {
   return isBefore(startOfDay(parseISO(dueDate)), startOfDay(new Date()));
}

export function todayISO() {
   return format(new Date(), "yyyy-MM-dd");
}
