import type {
  AutoParams,
  ElectronicsParams,
  Item,
  RealEstateParams,
} from "../types/items";

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const isPositiveNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0;

const isPositiveInteger = (value: unknown): value is number =>
  typeof value === "number" &&
  Number.isFinite(value) &&
  Number.isInteger(value) &&
  value > 0;

const autoLabels: Record<
  keyof AutoParams,
  { label: string; isFilled: (params: AutoParams) => boolean }
> = {
  brand: {
    label: "Бренд",
    isFilled: (params) => isNonEmptyString(params.brand),
  },
  model: {
    label: "Модель",
    isFilled: (params) => isNonEmptyString(params.model),
  },
  yearOfManufacture: {
    label: "Год выпуска",
    isFilled: (params) => isPositiveInteger(params.yearOfManufacture),
  },
  transmission: {
    label: "Тип коробки",
    isFilled: (params) =>
      params.transmission === "automatic" || params.transmission === "manual",
  },
  mileage: {
    label: "Пробег",
    isFilled: (params) => isPositiveNumber(params.mileage),
  },
  enginePower: {
    label: "Мощность двигателя",
    isFilled: (params) => isPositiveInteger(params.enginePower),
  },
};

const realEstateLabels: Record<
  keyof RealEstateParams,
  { label: string; isFilled: (params: RealEstateParams) => boolean }
> = {
  type: {
    label: "Тип",
    isFilled: (params) =>
      params.type === "flat" ||
      params.type === "house" ||
      params.type === "room",
  },
  address: {
    label: "Адрес",
    isFilled: (params) => isNonEmptyString(params.address),
  },
  area: {
    label: "Площадь",
    isFilled: (params) => isPositiveNumber(params.area),
  },
  floor: {
    label: "Этаж",
    isFilled: (params) => isPositiveInteger(params.floor),
  },
};

const electronicsLabels: Record<
  keyof ElectronicsParams,
  { label: string; isFilled: (params: ElectronicsParams) => boolean }
> = {
  type: {
    label: "Тип",
    isFilled: (params) =>
      params.type === "phone" ||
      params.type === "laptop" ||
      params.type === "misc",
  },
  brand: {
    label: "Бренд",
    isFilled: (params) => isNonEmptyString(params.brand),
  },
  model: {
    label: "Модель",
    isFilled: (params) => isNonEmptyString(params.model),
  },
  condition: {
    label: "Состояние",
    isFilled: (params) =>
      params.condition === "new" || params.condition === "used",
  },
  color: {
    label: "Цвет",
    isFilled: (params) => isNonEmptyString(params.color),
  },
};

export function getMissingRevisionFields(item: Item): string[] {
  const missing: string[] = [];

  if (!isNonEmptyString(item.description)) missing.push("Описание");

  if (item.category === "auto") {
    const params = item.params as AutoParams;
    for (const key of Object.keys(autoLabels) as (keyof AutoParams)[]) {
      const { label, isFilled } = autoLabels[key];
      if (!isFilled(params)) missing.push(label);
    }
  }

  if (item.category === "real_estate") {
    const params = item.params as RealEstateParams;
    for (const key of Object.keys(
      realEstateLabels,
    ) as (keyof RealEstateParams)[]) {
      const { label, isFilled } = realEstateLabels[key];
      if (!isFilled(params)) missing.push(label);
    }
  }

  if (item.category === "electronics") {
    const params = item.params as ElectronicsParams;
    for (const key of Object.keys(
      electronicsLabels,
    ) as (keyof ElectronicsParams)[]) {
      const { label, isFilled } = electronicsLabels[key];
      if (!isFilled(params)) missing.push(label);
    }
  }

  return missing;
}
