import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  // Checkbox,
  CircularProgress,
  Container,
  FormControlLabel,
  FormGroup,
  Grid,
  Paper,
  Stack,
  // Switch,
  Typography,
} from "@mui/material";
import { Checkbox, Switch } from "antd";
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
    <Container
      maxWidth={false}
      sx={{ py: 3, backgroundColor: "#f7f5f8", minHeight: "100vh" }}
    >
      <Stack spacing={2}>
        <Stack
          direction="column"
          spacing={1}
          paddingLeft={"8px"}
          alignItems="start"
        >
          <Typography
            variant="h5"
            sx={{ flexGrow: 1, fontWeight: 500, fontSize: "22px" }}
          >
            Мои объявления
          </Typography>
          <Typography
            variant="h5"
            sx={{ flexGrow: 1, color: "#848388", fontSize: "18px" }}
          >
            {total} объявления
          </Typography>
        </Stack>
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
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <Box sx={{ width: { xs: "100%", md: 280 } }}>
            {/* фильтр */}

            <Stack spacing={2.5} sx={{ position: { md: "sticky" }, top: 16 }}>
              <Paper
                elevation={0}
                sx={{
                  padding: "16px",
                  borderRadius: "8px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontSize: "16px",
                    fontWeight: "700",
                    textAlign: "left",
                  }}
                >
                  Фильтры
                </Typography>
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
                  Категории
                  <img
                    src="/ArrowDown.svg"
                    style={{
                      transform: isCategoryOpen
                        ? "rotate(0)"
                        : "rotate(180deg)",
                    }}
                  ></img>
                </button>
                <FormGroup
                  sx={{
                    height: isCategoryOpen ? "auto" : "0px",
                    overflow: "hidden",
                    gap: "8px",
                  }}
                >
                  {(Object.keys(CATEGORY_LABELS) as ItemCategory[]).map(
                    (category) => (
                      <FormControlLabel
                        sx={{ fontSize: "14px", margin: 0, padding: 0 }}
                        key={category}
                        control={
                          <Checkbox
                            checked={selectedCategories.includes(category)}
                            onChange={() => toggleCategory(category)}
                          >
                            {CATEGORY_LABELS[category]}
                          </Checkbox>
                        }
                        label={""}
                      />
                    ),
                  )}
                </FormGroup>
                <div className="separator"></div>
                <FormControlLabel
                  sx={{
                    textAlign: "left",
                    flexDirection: "row-reverse",
                    gap: 0,
                    textWrap: "wrap",
                    maxWidth: "224px",
                    margin: 0,
                    padding: 0,
                    fontWeight: 700,
                  }}
                  control={
                    <Switch
                      checked={needsRevisionOnly}
                      onChange={() => {
                        setPage(0);
                        setNeedsRevisionOnly((prev) => !prev);
                      }}
                    />
                  }
                  label="Только требующие доработок"
                />
              </Paper>

              <Button
                style={{
                  width: "100%",
                  backgroundColor: "#FFFFFF",
                  borderRadius: "8px",
                  border: "none",
                  padding: "12px auto",
                  textTransform: "none",
                  color: "#848388",
                }}
                onClick={resetFilters}
              >
                Сбросить фильтры
              </Button>
            </Stack>
          </Box>

          <Box
            sx={{
              flexGrow: 1,
              gap: "10px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {isLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : isError ? (
              <Alert severity="error">{errorMessage}</Alert>
            ) : (
              <>
                <Grid
                  container
                  spacing={2}
                  sx={{
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
                </Grid>

                {/* пагинация */}

                <Pagination
                  page={page}
                  totalPages={totalPages}
                  setPage={setPage}
                />

                {isFetching ? (
                  <Typography
                    variant="body2"
                    sx={{ mt: 1, textAlign: "center" }}
                  >
                    Обновляем данные...
                  </Typography>
                ) : null}
              </>
            )}
          </Box>
        </Stack>
      </Stack>
    </Container>
  );
}
