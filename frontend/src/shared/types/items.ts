export type ItemCategory = "auto" | "real_estate" | "electronics";

export type AutoTransmission = "automatic" | "manual";

export type AutoParams = {
  brand?: string;
  model?: string;
  yearOfManufacture?: number | string;
  transmission?: AutoTransmission;
  mileage?: number | string;
  enginePower?: number | string;
};

export type RealEstateParams = {
  type?: "flat" | "house" | "room";
  address?: string;
  area?: number | string;
  floor?: number | string;
};

export type ElectronicsParams = {
  type?: "phone" | "laptop" | "misc";
  brand?: string;
  model?: string;
  condition?: "new" | "used";
  color?: string;
};

export type ItemParams = AutoParams | RealEstateParams | ElectronicsParams;

export type Item = {
  id: number;
  category: ItemCategory;
  title: string;
  description?: string;
  price: number | null;
  createdAt: string;
  updatedAt: string;
  params: ItemParams;
};

export type AdListItem = {
  id: number;
  category: ItemCategory;
  title: string;
  price: number;
  needsRevision: boolean;
};

export type ItemsGetOut = {
  items: AdListItem[];
  total: number;
};

export type ItemGetOut = Item & {
  needsRevision: boolean;
};

export type ItemUpdateIn = {
  category: ItemCategory;
  title: string;
  description?: string;
  price: number;
  params: Partial<ItemParams>;
};

export type ItemSortColumn = "title" | "createdAt";
export type SortDirection = "asc" | "desc";

export type DraftState = {
  category: ItemCategory;
  title: string;
  description: string;
  price: number;
  params: Partial<ItemParams>;
};
