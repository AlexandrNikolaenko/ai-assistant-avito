import { useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  Alert,
  Divider,
  Flex,
  Layout,
  Spin,
} from "antd";
import { useQuery } from "@tanstack/react-query";
import { getItem } from "@/entities/item/api/itemsApi";
import { Content } from "antd/es/layout/layout";
import ItemContent from "@/widgets/item-info/item-content/ui/itemContent";
import ItemHeader from "@/widgets/item-info/item-header/ui/itemHeader";


export function AdsItemPage() {
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
        backgroundColor: "#ffffff",
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
              <ItemHeader data={data} id={id}/>

              <Divider />

              <ItemContent data={data}/>
            </>
          )}
        </Flex>
      </Content>
    </Layout>
  );
}
