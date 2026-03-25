import type { Item } from "@/shared/types/items";
import { Typography } from "antd";

export default function Params({item}: {item: Item}) {
  const params = item.params as Record<string, unknown>;

  const rows = Object.entries(params).filter(
    ([, value]) => value !== undefined,
  );

  if (!rows.length) return <Typography.Text type="secondary">Нет данных</Typography.Text>;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "148px auto",
        columnGap: 16,
        rowGap: 8,
        width: "fit-content",
      }}
    >
      {rows.map(([key, value]) => (
        <div key={key} style={{ display: "contents" }}>
          <Typography.Text
            style={{ fontWeight: 600, color: "#00000073", textAlign: "left" }}
          >
            {key}
          </Typography.Text>
          <Typography.Text style={{ textAlign: "left" }}>{String(value)}</Typography.Text>
        </div>
      ))}
    </div>
  );
}