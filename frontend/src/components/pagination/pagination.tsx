import { Pagination, PaginationItem } from "@mui/material";

export default function PaginationRounded({
  page,
  totalPages,
  setPage,
}: {
  page: number;
  totalPages: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}) {
  const handleChange = (
    _: React.ChangeEvent<unknown, Element>,
    value: number,
  ) => {
    setPage(value - 1);
  };

  return (
    <Pagination
      count={totalPages}
      variant="outlined"
      shape="rounded"
      color="primary"
      page={page + 1}
      onChange={handleChange}
      renderItem={(item) => (
        <PaginationItem
          style={{ backgroundColor: "white", borderRadius: "8px" }}
          {...item}
        />
      )}
    />
  );
}
