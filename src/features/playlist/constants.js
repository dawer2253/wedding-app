import { Heart, Music, DoorOpen, CakeSlice, PartyPopper, Ban } from "lucide-react";

// Kolejność zgodna z enumem playlist_category w bazie — steruje też kolejnością
// sekcji na stronie i na wydruku dla DJ-a
export const CATEGORIES = [
   "must_play",
   "first_dance",
   "entrance",
   "cake",
   "bouquet_toss",
   "do_not_play",
];

export const CATEGORY_LABELS = {
   must_play: "Koniecznie zagrać",
   first_dance: "Pierwszy taniec",
   entrance: "Wejście pary młodej",
   cake: "Tort",
   bouquet_toss: "Oczepiny",
   do_not_play: "Absolutnie nie grać",
};

export const CATEGORY_DESCRIPTIONS = {
   must_play: "Utwory, które muszą zabrzmieć w trakcie zabawy",
   first_dance: "Utwór na pierwszy taniec — możesz dodać kilka do wyboru",
   entrance: "Muzyka na wejście pary młodej na salę",
   cake: "Wyniesienie i krojenie tortu",
   bouquet_toss: "Rzucanie bukietem i oczepiny",
   do_not_play: "Czarna lista — tych utworów DJ ma nie grać",
};

export const CATEGORY_ICONS = {
   must_play: Music,
   first_dance: Heart,
   entrance: DoorOpen,
   cake: CakeSlice,
   bouquet_toss: PartyPopper,
   do_not_play: Ban,
};

// Czarna lista dostaje inny kolor niż reszta — na wydruku i na liście ma się
// od razu rzucać w oczy, że to sekcja „nie grać"
export const CATEGORY_COLORS = {
   must_play: "bg-primary/10 text-primary",
   first_dance: "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300",
   entrance: "bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300",
   cake: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
   bouquet_toss:
      "bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-300",
   do_not_play:
      "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive",
};

// Pola edytowalne w formularzu — podwójnie jako wartości domyślne
export const PLAYLIST_FORM_EMPTY_VALUES = {
   title: "",
   artist: "",
   category: "must_play",
   note: "",
};
