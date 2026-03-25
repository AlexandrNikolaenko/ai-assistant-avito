import { CATEGORY_LABELS } from "@/shared/constants/categories";
import type { ItemCategory } from "@/shared/types/items";
import {
  Button,
  Checkbox,
  Divider,
  Flex,
  Form,
  Switch,
  Typography,
} from "antd";
import { useState } from "react";

export default function Filter({
  resetFilters,
  toggleCategory,
  selectedCategories,
  needsRevisionOnly,
  handleToggleRevisionOnly,
}: {
  resetFilters: () => void;
  toggleCategory: (category: ItemCategory) => void;
  selectedCategories: ItemCategory[];
  needsRevisionOnly: boolean;
  handleToggleRevisionOnly: () => void;
}) {
  const [isCategoryOpen, setIsCategoryOpen] = useState<boolean>(true);

  const handleCategoryOpen = () => {
    setIsCategoryOpen(!isCategoryOpen);
  };

  return (
    <Flex style={{ width: "100%", maxWidth: "256px" }}>
      <Flex vertical gap={10} style={{ position: "sticky", top: 16 }}>
        <Flex
          vertical
          gap={10}
          style={{
            padding: "16px",
            borderRadius: "8px",
            backgroundColor: "white",
          }}
        >
          <Typography.Text
            style={{
              fontSize: "16px",
              fontWeight: "700",
              textAlign: "left",
              margin: 0,
            }}
          >
            Фильтры
          </Typography.Text>
          <Button
            type="text"
            style={{
              padding: 0,
              background: "none",
              border: "none",
              color: "#000000",
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "14px",
            }}
            onClick={handleCategoryOpen}
          >
            <Typography.Text style={{ margin: 0 }}>Категории</Typography.Text>
            <img
              src="/ArrowDown.svg"
              style={{
                transform: isCategoryOpen ? "rotate(0)" : "rotate(180deg)",
              }}
            ></img>
          </Button>
          <Form
            style={{
              height: isCategoryOpen ? "auto" : "0px",
              overflow: "hidden",
              gap: "8px",
              alignItems: "start",
            }}
          >
            {(Object.keys(CATEGORY_LABELS) as ItemCategory[]).map(
              (category) => (
                <Form.Item
                  style={{
                    fontSize: "14px",
                    margin: 0,
                    padding: 0,
                    width: "min-content",
                  }}
                  key={category}
                >
                  <Checkbox
                    style={{ width: "min-content" }}
                    checked={selectedCategories.includes(category)}
                    onChange={() => toggleCategory(category)}
                  >
                    {CATEGORY_LABELS[category]}
                  </Checkbox>
                </Form.Item>
              ),
            )}
          </Form>
          <Divider style={{ width: "100%", height: "1px", margin: 0 }} />
          <Form.Item
            style={{
              textAlign: "left",
              flexDirection: "row-reverse",
              gap: 0,
              textWrap: "wrap",
              maxWidth: "224px",
              margin: 0,
              padding: 0,
              fontWeight: 700,
            }}
          >
            Только требующие доработок
            <Switch
              checked={needsRevisionOnly}
              onChange={handleToggleRevisionOnly}
            />
          </Form.Item>
        </Flex>

        <Button
          type="text"
          style={{
            width: "100%",
            backgroundColor: "#FFFFFF",
            borderRadius: "8px",
            border: "none",
            padding: "12px 0",
            height: "auto",
            textTransform: "none",
            color: "#848388",
          }}
          onClick={resetFilters}
        >
          Сбросить фильтры
        </Button>
      </Flex>
    </Flex>
  );
}
