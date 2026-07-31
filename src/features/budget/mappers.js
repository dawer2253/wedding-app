// Płatności trzymamy posortowane po dacie zapłaty, potem po utworzeniu
export const sortPayments = (a, b) => {
   if (a.paidAt !== b.paidAt) return a.paidAt.localeCompare(b.paidAt);
   return (a.createdAt ?? "").localeCompare(b.createdAt ?? "");
};

// Postgres zwraca numeric jako string — stąd Number() na kwotach
export const mapPaymentFromDb = (row) => ({
   id: row.id,
   expenseId: row.expense_id,
   weddingId: row.wedding_id,
   amount: Number(row.amount),
   paidAt: row.paid_at,
   note: row.note ?? "",
   createdAt: row.created_at,
});

export const mapExpenseFromDb = (row) => ({
   id: row.id,
   weddingId: row.wedding_id,
   name: row.name,
   category: row.category,
   pricingType: row.pricing_type,
   totalCost: row.total_cost === null ? null : Number(row.total_cost),
   unitPrice: row.unit_price === null ? null : Number(row.unit_price),
   quantitySource: row.quantity_source,
   quantity: row.quantity === null ? null : Number(row.quantity),
   childrenCounting: row.children_counting,
   dueDate: row.due_date ?? "",
   vendorName: row.vendor_name ?? "",
   vendorId: row.vendor_id,
   notes: row.notes ?? "",
   createdAt: row.created_at,
   updatedAt: row.updated_at,
   payments: (row.expense_payments ?? [])
      .map(mapPaymentFromDb)
      .sort(sortPayments),
});

const EXPENSE_FIELD_TO_COLUMN = {
   weddingId: "wedding_id",
   name: "name",
   category: "category",
   pricingType: "pricing_type",
   totalCost: "total_cost",
   unitPrice: "unit_price",
   quantitySource: "quantity_source",
   quantity: "quantity",
   childrenCounting: "children_counting",
   dueDate: "due_date",
   vendorName: "vendor_name",
   vendorId: "vendor_id",
   notes: "notes",
};

const PAYMENT_FIELD_TO_COLUMN = {
   expenseId: "expense_id",
   weddingId: "wedding_id",
   amount: "amount",
   paidAt: "paid_at",
   note: "note",
};

// Mapuje tylko obecne pola (działa też dla częściowego patcha w updateExpense).
// payments/initialPayment nie są w mapie kolumn, więc nigdy nie trafią do wiersza.
const mapToDb = (fieldToColumn) => (record) => {
   const row = {};
   for (const [field, column] of Object.entries(fieldToColumn)) {
      if (record[field] === undefined) continue;
      row[column] = record[field] === "" ? null : record[field];
   }
   return row;
};

export const mapExpenseToDb = mapToDb(EXPENSE_FIELD_TO_COLUMN);
export const mapPaymentToDb = mapToDb(PAYMENT_FIELD_TO_COLUMN);
