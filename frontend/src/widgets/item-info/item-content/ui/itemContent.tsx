import type { ItemGetOut } from "@/shared/types/items";
import { Alert, Flex, Space, Typography } from "antd";
import { getMissingRevisionFields } from "@/shared/lib/revision";
import Params from "../../item-params/ui/itemParams";

export default function ItemContent({data}: {data?: ItemGetOut}) {
  return (
    <>
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
          <Typography.Title level={5} style={{ margin: 0 }}>
            Характеристики
          </Typography.Title>
          {data ? <Params item={data}/> : null}
        </Flex>
      </div>

      <Flex
        vertical
        gap={12}
        style={{ alignItems: "flex-start", maxWidth: "480px" }}
      >
        <Typography.Title level={5} style={{ margin: 0 }}>
          Описание
        </Typography.Title>
        <Typography.Text
          style={{
            textAlign: "start",
            whiteSpace: "pre-wrap",
            display: "block",
          }}
        >
          {data?.description?.trim()
            ? data.description
            : "Описание отсутствует"}
        </Typography.Text>
      </Flex>
    </>
  )
}