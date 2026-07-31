import {
   Building2,
   Cake,
   Camera,
   CarFront,
   Church,
   CircleEllipsis,
   Flower2,
   Gem,
   Gift,
   Landmark,
   Music,
   Shirt,
   Sparkles,
   UtensilsCrossed,
   Video,
   Wine,
} from "lucide-react";

// Kolejność zgodna z enumem expense_category w bazie
export const CATEGORIES = [
   "venue",
   "catering",
   "music",
   "photo",
   "video",
   "flowers",
   "attire",
   "rings",
   "church",
   "usc",
   "alcohol",
   "cake",
   "transport",
   "decor",
   "gifts",
   "other",
];

export const CATEGORY_LABELS = {
   venue: "Sala weselna",
   catering: "Catering",
   music: "Muzyka",
   photo: "Fotograf",
   video: "Kamerzysta",
   flowers: "Kwiaty",
   attire: "Stroje",
   rings: "Obrączki",
   church: "Kościół",
   usc: "USC",
   alcohol: "Alkohol",
   cake: "Tort",
   transport: "Transport",
   decor: "Dekoracje",
   gifts: "Podziękowania",
   other: "Inne",
};

export const CATEGORY_ICONS = {
   venue: Building2,
   catering: UtensilsCrossed,
   music: Music,
   photo: Camera,
   video: Video,
   flowers: Flower2,
   attire: Shirt,
   rings: Gem,
   church: Church,
   usc: Landmark,
   alcohol: Wine,
   cake: Cake,
   transport: CarFront,
   decor: Sparkles,
   gifts: Gift,
   other: CircleEllipsis,
};

export const STATUS_FILTERS = ["all", "unpaid", "paid", "overdue"];

export const STATUS_FILTER_LABELS = {
   all: "Wszystkie",
   unpaid: "Do zapłaty",
   paid: "Zapłacone",
   overdue: "Zaległe",
};

export const PRICING_TYPES = ["fixed", "per_unit"];

export const PRICING_TYPE_LABELS = {
   fixed: "Kwota stała",
   per_unit: "Cena za sztukę",
};

export const QUANTITY_SOURCES = ["all_guests", "confirmed_guests", "manual"];

export const QUANTITY_SOURCE_LABELS = {
   all_guests: "Wszyscy goście",
   confirmed_guests: "Potwierdzeni goście",
   manual: "Ręczna liczba sztuk",
};

export const CHILDREN_COUNTING_OPTIONS = ["full", "half", "none"];

export const CHILDREN_COUNTING_LABELS = {
   full: "Dzieci normalnie",
   half: "Dzieci ×0,5",
   none: "Bez dzieci",
};

export const CHILDREN_FACTORS = {
   full: 1,
   half: 0.5,
   none: 0,
};

// Jedyne pola, które formularz wydatku zna i może zapisywać — edycja buduje
// defaultValues WYŁĄCZNIE z tej listy, żeby submit nie przemycał pól spoza
// formularza (np. payments) i nie nadpisywał ich stanem sprzed otwarcia
export const EXPENSE_FORM_EMPTY_VALUES = {
   name: "",
   category: "",
   pricingType: "fixed",
   totalCost: "",
   unitPrice: "",
   quantitySource: "all_guests",
   quantity: "",
   childrenCounting: "full",
   dueDate: "",
   vendorName: "",
   notes: "",
};
