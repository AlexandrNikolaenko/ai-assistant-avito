import { useMemo, useState } from "react";
import {
  Checkbox,
  Divider,
  Flex,
  Form,
  Layout,
  Switch,
  Typography,
  Button,
  Space,
  Spin,
  Alert,
} from "antd";
import { useQuery } from "@tanstack/react-query";
import { CATEGORY_LABELS } from "../constants/categories";
import type {
  ItemCategory,
  ItemSortColumn,
  SortDirection,
} from "../types/items";
import { getItems } from "../api/itemsApi";
import { ListItemCard, ItemCard } from "../components/item-card.tsx/item-card";
import Sort from "../components/sort/sort";
import Pagination from "../components/pagination/pagination";

const PAGE_SIZE = 10;

const { Content } = Layout;

export function AdsListPage() {
  const [q, setQ] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<ItemCategory[]>(
    [],
  );
  const [needsRevisionOnly, setNeedsRevisionOnly] = useState(false);

  const [sortColumn, setSortColumn] = useState<ItemSortColumn>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [isCategoryOpen, setIsCategoryOpen] = useState<boolean>(true);

  const [page, setPage] = useState(0);
  const [layout, setLayout] = useState<"grid" | "list">("grid");

  const query = useMemo(
    () => ({
      q,
      limit: PAGE_SIZE,
      skip: page * PAGE_SIZE,
      needsRevision: needsRevisionOnly,
      categories: selectedCategories,
      sortColumn,
      sortDirection,
    }),
    [q, page, needsRevisionOnly, selectedCategories, sortColumn, sortDirection],
  );

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["items", query],
    queryFn: () => getItems(query),
  });

  const errorMessage =
    isError && error instanceof Error
      ? error.message
      : "Ошибка загрузки данных";

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const toggleCategory = (category: ItemCategory) => {
    setPage(0);
    setSelectedCategories((prev) => {
      if (prev.includes(category)) return prev.filter((c) => c !== category);
      return [...prev, category];
    });
  };

  const resetFilters = () => {
    setPage(0);
    setQ("");
    setSelectedCategories([]);
    setNeedsRevisionOnly(false);
    setSortColumn("createdAt");
    setSortDirection("desc");
  };

  const handleCategoryOpen = () => {
    setIsCategoryOpen(!isCategoryOpen);
  };

  const handleSearch = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement, Element>,
  ) => {
    setPage(0);
    setQ(e.target.value);
  };

  const handleByList = () => {
    setLayout("list");
  };

  const handleByGrid = () => {
    setLayout("grid");
  };

  const handleSortCol = (value: string) => {
    setPage(0);
    setSortColumn(value as ItemSortColumn);
  };

  const handleSortDir = (value: string) => {
    setPage(0);
    setSortDirection(value as SortDirection);
  };

  return (
    <Layout
      style={{
        padding: "12px 32px",
        backgroundColor: "#f7f5f8",
        minHeight: "100vh",
      }}
    >
      <Content>
        <Flex vertical gap={16}>
          <Flex
            vertical
            gap={0}
            style={{ padding: "12px 8px", alignItems: "start" }}
          >
            <Typography.Title
              level={4}
              style={{
                flexGrow: 1,
                fontWeight: 500,
                fontSize: "22px",
                margin: 0,
              }}
            >
              Мои объявления
            </Typography.Title>
            <Typography.Text
              style={{
                flexGrow: 1,
                color: "#848388",
                fontSize: "18px",
                margin: 0,
              }}
            >
              {total} объявления
            </Typography.Text>
          </Flex>
          <Sort
            q={q}
            layout={layout}
            handleSearch={handleSearch}
            handleByList={handleByList}
            handleByGrid={handleByGrid}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            handleSortCol={handleSortCol}
            handleSortDir={handleSortDir}
          />
          <Flex gap={24}>
            <Flex style={{ width: "100%", maxWidth: "256px" }}>
              {/* фильтр */}

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
                  <button
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
                    <Typography.Text style={{ margin: 0 }}>
                      Категории
                    </Typography.Text>
                    <img
                      src="/ArrowDown.svg"
                      style={{
                        transform: isCategoryOpen
                          ? "rotate(0)"
                          : "rotate(180deg)",
                      }}
                    ></img>
                  </button>
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
                  <Divider
                    style={{ width: "100%", height: "1px", margin: 0 }}
                  />
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
                      onChange={() => {
                        setPage(0);
                        setNeedsRevisionOnly((prev) => !prev);
                      }}
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

            <Flex
              style={{
                flexGrow: 1,
                gap: "10px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {isLoading ? (
                <Space
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    padding: "24px 0",
                  }}
                >
                  <Spin />
                </Space>
              ) : isError ? (
                <Alert description={errorMessage} type="error"></Alert>
              ) : (
                <>
                  <div
                    style={{
                      gap: "16px",
                      display: "grid",
                      gridTemplateColumns:
                        layout === "grid"
                          ? "repeat(auto-fill, minmax(200px, 1fr))"
                          : "1fr",
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

                  <Pagination
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
              )}
            </Flex>
          </Flex>
        </Flex>
      </Content>
    </Layout>
  );
}
