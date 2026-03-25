import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Button, Divider, Flex, Layout, Space, Spin, Typography } from "antd";
import { useQuery } from "@tanstack/react-query";
import { getItem } from "@/entities/item/api/itemsApi";
import type { Item } from "@/shared/types/items";
import { getMissingRevisionFields } from "@/shared/lib/revision";
import { Content } from "antd/es/layout/layout";
const { Title, Text } = Typography;

function formatDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.valueOf())) return iso;
  return date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function renderParams(item: Item) {
  const params = item.params as Record<string, unknown>;

  const rows = Object.entries(params).filter(
    ([, value]) => value !== undefined,
  );

  if (!rows.length) return <Text type="secondary">Нет данных</Text>;

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
          <Text
            style={{ fontWeight: 600, color: "#00000073", textAlign: "left" }}
          >
            {key}
          </Text>
          <Text style={{ textAlign: "left" }}>{String(value)}</Text>
        </div>
      ))}
    </div>
  );
}

export function AdsItemPage() {
  const navigate = useNavigate();
  const params = useParams();

  const id = useMemo(() => {
    const raw = params.id;
    const parsed = raw ? Number(raw) : NaN;
    return Number.isFinite(parsed) ? parsed : null;
  }, [params.id]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["item", id],
    queryFn: () => {
      if (id === null) throw new Error("Неверный id объявления");
      return getItem(id);
    },
    enabled: id !== null,
  });

  const errorMessage =
    isError && error instanceof Error
      ? error.message
      : "Ошибка загрузки данных";

  if (id === null) {
    return <Alert type="error" message="Неверный id объявления" />;
  }

  return (
    <Layout
      style={{
        padding: "12px 32px",
        backgroundColor: "#f7f5f8",
        minHeight: "100vh",
      }}
    >
      <Content>
        <Flex vertical gap={16} style={{ width: "100%", alignItems: "start" }}>
          {isLoading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "32px 0",
              }}
            >
              <Spin size="large" />
            </div>
          ) : isError ? (
            <Alert type="error" message={errorMessage} />
          ) : (
            <>
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
                  <Title level={4} style={{ margin: 0 }}>
                    {data?.title}
                  </Title>
                  <Title level={5} style={{ margin: 0 }}>
                    {data && data.price !== null
                      ? data.price.toLocaleString("ru-RU")
                      : "—"}{" "}
                    ₽
                  </Title>
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
                    <Button onClick={() => navigate("/ads")}>
                      Назад к списку
                    </Button>
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
                    <Text type="secondary">
                      Опубликовано: {data ? formatDate(data.createdAt) : ""}
                    </Text>
                    <Text type="secondary">
                      Отредактировано: {data ? formatDate(data.updatedAt) : ""}
                    </Text>
                  </Flex>
                </div>
              </Flex>
              <Divider />

              <div
                style={{
                  display: "flex",
                  gap: 32,
                  alignItems: "flex-start",
                }}
              >
                <Space style={{ backgroundColor: "#FAFAFA" }}>
                  <img src="/placeholder.png" width={480} alt="item preview" />
                </Space>

                <Flex
                  vertical
                  gap={12}
                  style={{ width: "100%", alignItems: "flex-start" }}
                >
                  {data?.needsRevision ? (
                    <Alert
                      type="warning"
                      title="Требуются доработки"
                      showIcon
                      description={
                        <div>
                          <div style={{ marginTop: 4, textAlign: "start" }}>
                            У объявления не заполнены поля:
                          </div>
                          <ul>
                            {getMissingRevisionFields(data).map((item) => (
                              <li key={item} style={{ width: "fit-content" }}>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      }
                      style={{
                        padding: "12px 16px",
                        borderRadius: "8px",
                        width: "512px",
                        maxWidth: "512px",
                      }}
                    ></Alert>
                  ) : (
                    <Alert
                      type="success"
                      message="Объявление заполнено корректно."
                    />
                  )}
                  <Title level={5} style={{ margin: 0 }}>
                    Характеристики
                  </Title>
                  {data ? renderParams(data) : null}
                </Flex>
              </div>

              <Flex
                vertical
                gap={12}
                style={{ alignItems: "flex-start", maxWidth: "480px" }}
              >
                <Title level={5} style={{ margin: 0 }}>
                  Описание
                </Title>
                <Text
                  style={{
                    textAlign: "start",
                    whiteSpace: "pre-wrap",
                    display: "block",
                  }}
                >
                  {data?.description?.trim()
                    ? data.description
                    : "Описание отсутствует"}
                </Text>
              </Flex>
            </>
          )}
        </Flex>
      </Content>
    </Layout>
  );
}
