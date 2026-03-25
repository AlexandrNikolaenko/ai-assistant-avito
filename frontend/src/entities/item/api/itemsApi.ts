import { http } from "@/shared/api/httpClient";
import type {
  ItemGetOut,
  ItemsGetOut,
  ItemCategory,
  ItemSortColumn,
  SortDirection,
  ItemUpdateIn,
} from "../model/items";

export type ItemsQuery = {
  q?: string;
  limit?: number;
  skip?: number;
  needsRevision?: boolean;
  categories?: ItemCategory[];
  sortColumn?: ItemSortColumn;
  sortDirection?: SortDirection;
};

export type ItemsUpdateOut =
  | { success: true }
  | { success: false; error: string };

export async function getItems(query: ItemsQuery): Promise<ItemsGetOut> {
  const { data } = await http.get<ItemsGetOut>("/items", {
    params: {
      ...(query.q !== undefined ? { q: query.q } : {}),
      ...(query.limit !== undefined ? { limit: query.limit } : {}),
      ...(query.skip !== undefined ? { skip: query.skip } : {}),
      ...(query.needsRevision !== undefined
        ? { needsRevision: query.needsRevision }
        : {}),
      ...(query.categories?.length
        ? { categories: query.categories.join(",") }
        : {}),
      ...(query.sortColumn ? { sortColumn: query.sortColumn } : {}),
      ...(query.sortDirection ? { sortDirection: query.sortDirection } : {}),
    },
  });

  return data;
}

export async function getItem(id: number): Promise<ItemGetOut> {
  const { data } = await http.get<ItemGetOut>(`/items/${id}`);
  return data;
}

export async function updateItem(
  id: number,
  payload: ItemUpdateIn,
): Promise<ItemsUpdateOut> {
  const { data } = await http.put<ItemsUpdateOut>(`/items/${id}`, payload);
  return data;
}
