import { useMemo, useState } from "react";
import { Flex, Layout, Typography, Space, Spin, Alert } from "antd";
import { useQuery } from "@tanstack/react-query";
import type {
  ItemCategory,
  ItemSortColumn,
  SortDirection,
} from "@/shared/types/items";
import { getItems } from "@/entities/item/api/itemsApi";
import Sort from "@/widgets/sort/ui/sort";
import ItemList from "@/widgets/item-list/ui/item-list";
import Filter from "@/widgets/filter/ui/filter";

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

  const handleToggleRevisionOnly = () => {
    setPage(0);
    setNeedsRevisionOnly((prev) => !prev);
  };

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
            <Filter
              resetFilters={resetFilters}
              toggleCategory={toggleCategory}
              selectedCategories={selectedCategories}
              needsRevisionOnly={needsRevisionOnly}
              handleToggleRevisionOnly={handleToggleRevisionOnly}
            />

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
                <ItemList
                  layout={layout}
                  data={data}
                  page={page}
                  totalPages={totalPages}
                  setPage={setPage}
                  isFetching={isFetching}
                />
              )}
            </Flex>
          </Flex>
        </Flex>
      </Content>
    </Layout>
  );
}
