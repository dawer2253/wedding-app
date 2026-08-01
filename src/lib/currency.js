export function formatPLN(amount) {
   const formattedAmount = new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
      // okrągłe kwoty bez ",00" — pełne stringi walutowe nie mieszczą się
      // w kafelkach i nagłówkach kategorii na wąskich ekranach
      trailingZeroDisplay: "stripIfInteger",
   }).format(amount);
   return formattedAmount;
}
