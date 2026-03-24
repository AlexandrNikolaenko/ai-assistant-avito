import type { ItemCategory } from "../types/items";
import type {
  AutoParams,
  ElectronicsParams,
  RealEstateParams,
} from "../types/items";
import { ollamaGenerate } from "./ollamaClient";

function categoryToLabel(category: ItemCategory) {
  if (category === "auto") return "Транспорт";
  if (category === "real_estate") return "Недвижимость";
  return "Электроника";
}

function stringifyParams(params: unknown) {
  try {
    return JSON.stringify(params, ensureStringifyReplacer, 2);
  } catch {
    return String(params);
  }
}

const ensureStringifyReplacer = (_key: string, value: unknown) => {
  if (typeof value === "number" && !Number.isFinite(value)) return undefined;
  return value;
};

export async function aiImproveDescription(params: {
  category: ItemCategory;
  title: string;
  description?: string;
  params: AutoParams | RealEstateParams | ElectronicsParams;
  signal?: AbortSignal;
}): Promise<string> {
  const prompt = [
    "Ты помощник продавца на Авито.",
    "Твоя задача: улучшить текст описания объявления так, чтобы он был информативным и продающим.",
    "Сохрани смысл, добавь конкретику (без выдуманных фактов), сделай текст структурированным и читаемым. Количество символов не больше 1000.",
    "",
    `Категория: ${categoryToLabel(params.category)}`,
    `Название: ${params.title}`,
    `Исходные параметры: ${stringifyParams(params.params)}`,
    `Текущее описание: ${params.description ?? ""}`,
    "",
    "Верни только улучшенное описание, без заголовков, без пояснений и без JSON.",
  ].join("\n");

  return ollamaGenerate(prompt, params.signal);
}

export async function aiPredictMarketPrice(params: {
  category: ItemCategory;
  title: string;
  description?: string;
  params: AutoParams | RealEstateParams | ElectronicsParams;
  signal?: AbortSignal;
}): Promise<number> {
  const prompt = [
    "Ты аналитик рынка Авито.",
    "Оцени рыночную цену по объявлению и верни ЧИСЛО (одна цена) без валюты и без пояснений.",
    "Если точная оценка невозможна, выбери наиболее разумный диапазон и верни его нижнюю границу или среднее значение.",
    "",
    `Категория: ${categoryToLabel(params.category)}`,
    `Название: ${params.title}`,
    `Исходные параметры: ${stringifyParams(params.params)}`,
    `Описание: ${params.description ?? ""}`,
    "",
    "Верни только число.",
  ].join("\n");

  const raw = await ollamaGenerate(prompt, params.signal);

  // Берём первое число из ответа. Поддерживаем пробелы и запятые.
  const match = raw.replace(/\s+/g, " ").match(/(\d[\d ]*(?:[.,]\d+)?)/);
  if (!match) throw new Error(`Не удалось распознать цену из ответа: ${raw}`);

  const normalized = match[1].replace(/\s+/g, "").replace(",", ".");
  const num = Number(normalized);
  if (!Number.isFinite(num)) throw new Error(`Некорректная цена: ${match[1]}`);

  return num;
}
