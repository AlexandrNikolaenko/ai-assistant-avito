import type { ItemGetOut } from "@/shared/types/items";
import { Button, Flex, Typography } from "antd";
import { useNavigate } from "react-router-dom";

function formatDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.valueOf())) return iso;
  return date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ItemHeader({
  data,
  id,
}: {
  data?: ItemGetOut;
  id: number;
}) {
  const navigate = useNavigate();

  return (
    <Flex vertical gap={12} style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <Typography.Title level={4} style={{ margin: 0 }}>
          {data?.title}
        </Typography.Title>
        <Typography.Title level={5} style={{ margin: 0 }}>
          {data && data.price !== null
            ? data.price.toLocaleString("ru-RU")
            : "—"}{" "}
          ₽
        </Typography.Title>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <Flex gap={12} style={{ marginTop: 8 }}>
          <Button onClick={() => navigate("/ads")}>Назад к списку</Button>
          <Button
            type="primary"
            style={{ borderRadius: "8px" }}
            onClick={() => navigate(`/ads/${id}/edit`)}
          >
            Редактировать
            <img src="/EditIcon.svg" alt="edit icon" />
          </Button>
        </Flex>

        <Flex vertical gap={0} style={{ alignItems: "flex-start" }}>
          <Typography.Text type="secondary">
            Опубликовано: {data ? formatDate(data.createdAt) : ""}
          </Typography.Text>
          <Typography.Text type="secondary">
            Отредактировано: {data ? formatDate(data.updatedAt) : ""}
          </Typography.Text>
        </Flex>
      </div>
    </Flex>
  );
}
