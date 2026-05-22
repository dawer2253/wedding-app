export function formatPLN(amount) {
   const formattedAmount = new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
   }).format(amount);
   return formattedAmount;
}
