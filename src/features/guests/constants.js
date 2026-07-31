export const RSVP_STATUSES = ["pending", "confirmed", "declined"];

export const RSVP_LABELS = {
   pending: "Oczekuje",
   confirmed: "Potwierdzony",
   declined: "Odmowa",
};

export const RSVP_BADGE_CLASSES = {
   pending:
      "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400",
   confirmed:
      "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400",
   declined: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400",
};

export const NO_GROUP_LABEL = "Bez grupy";

// Jedyne pola, które formularz gościa zna i może zapisywać — edycja buduje
// defaultValues WYŁĄCZNIE z tej listy, żeby submit nie przemycał pól spoza
// formularza (np. sortOrder) i nie nadpisywał ich stanem sprzed otwarcia
export const GUEST_FORM_EMPTY_VALUES = {
   firstName: "",
   lastName: "",
   group: "",
   rsvpStatus: "pending",
   hasPlusOne: false,
   plusOneName: "",
   isChild: false,
   dietaryNotes: "",
   phone: "",
   email: "",
   notes: "",
};
