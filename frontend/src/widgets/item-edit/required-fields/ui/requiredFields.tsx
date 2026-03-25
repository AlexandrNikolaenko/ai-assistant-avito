import { CATEGORY_LABELS, CATEGORY_OPTIONS } from "@/shared/constants/categories";
import type { DraftState, ItemCategory } from "@/shared/types/items";
import { Flex, Typography, Select, Divider, Input, Button } from "antd";
import { useState } from "react";

const {Text } = Typography

export default function RequiredFields({draft, startAiPrice, aiLoading, checkError, setDraft, handleChange, setProposedPrice}: {
  draft: DraftState,
  startAiPrice: () => Promise<void>,
  aiLoading: "description" | "price" | null,
  checkError: (field: string, value: string | number) => void,
  setDraft: React.Dispatch<React.SetStateAction<DraftState | null>>,
  handleChange: () => void,
  setProposedPrice: React.Dispatch<React.SetStateAction<number | null>>
}) {
  const [focusedFields, setFocusedFields] = useState<string[]>([]);
  
  const handleFocusedField = (field: string) => {
    if (focusedFields.includes(field))  setFocusedFields(focusedFields.filter((elem) => elem != field));
    else setFocusedFields(focusedFields.concat([field]));
  };

  return (
    <>
      <Flex
        vertical
        gap={8}
        style={{ width: "100%", alignItems: "start" }}
      >
        <Text>Категория</Text>
        <Select
          onFocus={() => handleFocusedField("category")}
          onBlur={() => handleFocusedField("category")}
          style={{ width: "256px", textAlign: "left" }}
          value={draft.category}
          status={
            (draft.category.length == 0 || !draft.category) &&
            !focusedFields.includes("title")
              ? "error"
              : ""
          }
          options={CATEGORY_OPTIONS.map((category) => ({
            value: category,
            label: CATEGORY_LABELS[category],
          }))}
          onChange={(value) => {
            const next = value as ItemCategory;
            checkError("category", value);
            handleChange();
            setDraft((prev) =>
              prev ? { ...prev, category: next, params: {} } : prev,
            );
          }}
        />
        {((draft.category.length == 0 || !draft.category) &&
          !focusedFields.includes("title")) ?? (
          <Text style={{ color: "#EC221F" }}>
            Категория должна быть выбрана
          </Text>
        )}
      </Flex>

      <Divider style={{ width: "100%", height: "1px", margin: 0 }} />

      <Flex
        vertical
        gap={8}
        style={{ width: "100%", alignItems: "start" }}
      >
        <Text>Название</Text>
        <Input
          onFocus={() => handleFocusedField("title")}
          onBlur={() => handleFocusedField("title")}
          style={{ width: "100%", maxWidth: "456px" }}
          status={
            (draft.title.length == 0 || !draft.title) &&
            !focusedFields.includes("title")
              ? "error"
              : ""
          }
          value={draft.title}
          onChange={(e) => {
            const next = e.target.value;
            checkError("title", e.target.value);
            handleChange();
            setDraft((prev) =>
              prev ? { ...prev, title: next } : prev,
            );
          }}
        />
        {(draft.title.length == 0 || !draft.title) &&
          !focusedFields.includes("title") && (
            <Text style={{ color: "#EC221F" }}>
              Название должно быть заполнено
            </Text>
          )}
      </Flex>

      <Divider style={{ width: "100%", height: "1px", margin: 0 }} />

      <Flex
        gap={12}
        align="end"
        style={{
          width: "100%",
          alignItems: "end",
          maxWidth: "675px",
        }}
      >
        <Flex
          vertical
          gap={8}
          style={{ width: "100%", alignItems: "start" }}
        >
          <Text>Цена</Text>
          <Input
            onFocus={() => handleFocusedField("price")}
            onBlur={() => handleFocusedField("price")}
            status={
              (draft.price == 0 || !draft.price) &&
              !focusedFields.includes("price")
                ? "error"
                : ""
            }
            style={{ width: "100%", maxWidth: "456px" }}
            value={String(draft.price)}
            onChange={(e) => {
              const next = Number(e.target.value);
              checkError("price", e.target.value);
              setProposedPrice(null);
              handleChange();
              setDraft((prev) =>
                prev ? { ...prev, price: next } : prev,
              );
            }}
          />
          {(draft.price == 0 || !draft.price) &&
            !focusedFields.includes("price") && (
              <Text style={{ color: "#EC221F" }}>
                Цена должна быть указана
              </Text>
            )}
        </Flex>
        <Button
          variant="solid"
          color="gold"
          style={{ backgroundColor: "#F9F1E6", color: "#FFA940" }}
          onClick={startAiPrice}
          disabled={aiLoading !== null}
        >
          <img src="/BulbIcon.svg" />
          {aiLoading === "price"
            ? "Оценка..."
            : "Узнать рыночную цену"}
        </Button>
      </Flex>

      <Divider style={{ width: "100%", height: "1px", margin: 0 }} />
    </>
  )
}