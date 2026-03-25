import type { ItemGetOut } from "@/shared/types/items";
import { Alert, Flex, Space, Typography } from "antd";
import { getMissingRevisionFields } from "@/shared/lib/revision";
import Params from "../../item-params/ui/itemParams";
import "../style/itemContent.css";

export default function ItemContent({ data }: { data?: ItemGetOut }) {
  return (
    <>
      <div
        style={{
          display: "flex",
          gap: "32px",
          alignItems: "flex-start",
        }}
      >
        <Space style={{ backgroundColor: "#FAFAFA" }}>
          <img src="/placeholder.png" width={480} alt="item preview" />
        </Space>

        <Flex
          vertical
          gap={36}
          style={{ width: "100%", alignItems: "flex-start" }}
        >
          {data?.needsRevision && (
            <Alert
              type="warning"
              title="Требуются доработки"
              showIcon
              description={
                <div>
                  <div style={{ marginTop: 4, textAlign: "start" }}>
                    У объявления не заполнены поля:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: "20px" }}>
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
                border: "none",
              }}
            ></Alert>
          )}
          <Typography.Title level={5} style={{ margin: 0, fontSize: "22px" }}>
            Характеристики
          </Typography.Title>
          {data ? <Params item={data} /> : null}
        </Flex>
      </div>

      <Flex
        vertical
        gap={16}
        style={{ alignItems: "flex-start", maxWidth: "480px" }}
      >
        <Typography.Title level={5} style={{ margin: 0, fontSize: "22px" }}>
          Описание
        </Typography.Title>
        <Typography.Text
          style={{
            fontSize: "16px",
            textAlign: "start",
            whiteSpace: "pre-wrap",
            display: "block",
          }}
        >
          {data?.description?.trim() ? data.description : "Отсутствует"}
        </Typography.Text>
      </Flex>
    </>
  );
}
