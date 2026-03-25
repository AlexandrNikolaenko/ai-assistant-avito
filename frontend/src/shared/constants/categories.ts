import type { ItemCategory } from "../types/items";

export const CATEGORY_LABELS: Record<ItemCategory, string> = {
  auto: "Транспорт",
  real_estate: "Недвижимость",
  electronics: "Электроника",
};

export const CATEGORY_OPTIONS: ItemCategory[] = [
  "auto",
  "real_estate",
  "electronics",
];
