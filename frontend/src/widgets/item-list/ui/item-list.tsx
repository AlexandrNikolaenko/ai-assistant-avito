import PaginationRounded from "@/shared/ui/pagination/pagination";
import { Typography } from "antd";
import { ListItemCard, ItemCard } from "@/entities/item/ui/item-card/item-card";
import type { ItemsGetOut } from "@/shared/types/items";

export default function ItemList({
  layout,
  data,
  page,
  totalPages,
  setPage,
  isFetching,
}: {
  layout: "grid" | "list";
  data?: ItemsGetOut;
  page: number;
  totalPages: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  isFetching: boolean;
}) {
  return (
    <>
      <div
        style={{
          gap: "16px",
          display: "grid",
          gridTemplateColumns:
            layout === "grid" ? "repeat(auto-fill, minmax(200px, 1fr))" : "1fr",
        }}
      >
        {data?.items.map((item) =>
          layout == "list" ? (
            <ListItemCard {...item} key={item.id} />
          ) : (
            <ItemCard {...item} key={item.id} />
          ),
        )}
      </div>

      {/* пагинация */}

      <PaginationRounded
        page={page}
        totalPages={totalPages}
        setPage={setPage}
      />

      {isFetching ? (
        <Typography.Text
          style={{
            marginTop: 1,
            textAlign: "center",
            marginBottom: 0,
          }}
        >
          Обновляем данные...
        </Typography.Text>
      ) : null}
    </>
  );
}
