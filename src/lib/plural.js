// Polska odmiana przez liczbę: [1, 2–4, 5+] — np.
// plural(3, ["dostawca", "dostawcy", "dostawców"]) → "dostawcy"
export function plural(count, [one, few, many]) {
   if (count === 1) return one;
   const mod10 = count % 10;
   const mod100 = count % 100;
   if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
   return many;
}
