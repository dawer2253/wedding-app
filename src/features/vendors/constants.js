import {
   Cake,
   Camera,
   CarFront,
   CircleEllipsis,
   Disc3,
   Flower2,
   Guitar,
   Sparkles,
   Video,
} from "lucide-react";

// Kolejność zgodna z enumem vendor_role w bazie
export const ROLES = [
   "dj",
   "band",
   "photographer",
   "videographer",
   "florist",
   "baker",
   "transport",
   "decorator",
   "other",
];

export const ROLE_LABELS = {
   dj: "DJ",
   band: "Zespół",
   photographer: "Fotograf",
   videographer: "Kamerzysta",
   florist: "Kwiaciarnia",
   baker: "Tort / cukiernia",
   transport: "Transport",
   decorator: "Dekorator",
   other: "Inne",
};

export const ROLE_ICONS = {
   dj: Disc3,
   band: Guitar,
   photographer: Camera,
   videographer: Video,
   florist: Flower2,
   baker: Cake,
   transport: CarFront,
   decorator: Sparkles,
   other: CircleEllipsis,
};

// Kolejność zgodna z enumem vendor_status w bazie
export const STATUSES = [
   "to_check",
   "contacted",
   "quoted",
   "selected",
   "rejected",
];

export const STATUS_LABELS = {
   to_check: "Do sprawdzenia",
   contacted: "Kontakt",
   quoted: "Wycena",
   selected: "Wybrany",
   rejected: "Odrzucony",
};

export const STATUS_COLORS = {
   to_check:
      "bg-slate-100 text-slate-800 dark:bg-slate-500/20 dark:text-slate-300",
   contacted:
      "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400",
   quoted: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400",
   selected:
      "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400",
   rejected: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400",
};

// Jedyne pola, które formularz dostawcy zna i może zapisywać — edycja buduje
// defaultValues WYŁĄCZNIE z tej listy, żeby submit nie przemycał pól spoza
// formularza i nie nadpisywał ich stanem sprzed otwarcia
export const VENDOR_FORM_EMPTY_VALUES = {
   name: "",
   role: "",
   status: "to_check",
   price: "",
   rating: 0,
   phone: "",
   email: "",
   website: "",
   instagram: "",
   pros: [],
   cons: [],
   notes: "",
};
