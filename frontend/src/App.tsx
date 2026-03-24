import { useMemo } from "react";
import { Navigate, Route, Routes, BrowserRouter } from "react-router-dom";
// import AppBar from "@mui/material/AppBar";
// import Toolbar from "@mui/material/Toolbar";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material/styles";
// import Container from "@mui/material/Container";
// import { ThemeToggle } from "./components/toggle/ThemeToggle";
import { useAppSelector } from "./store/hooks";
import { AdsListPage } from "./pages/AdsListPage";
import { AdsItemPage } from "./pages/AdsItemPage";
import { AdsEditPage } from "./pages/AdsEditPage";

function App() {
  const mode = useAppSelector((state) => state.theme.mode);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          primary: {
            main: "#1890FF", // твой основной цвет
          },
          mode,
        },
      }),
    [mode],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        {/* <AppBar color="transparent" elevation={0} position="static">
          <Toolbar sx={{ gap: 2, justifyContent: "end" }}>
            <ThemeToggle />
          </Toolbar>
        </AppBar> */}

        <Routes>
          <Route path="/" element={<Navigate to="/ads" replace />} />
          <Route path="/ads" element={<AdsListPage />} />
          <Route path="/ads/:id" element={<AdsItemPage />} />
          <Route path="/ads/:id/edit" element={<AdsEditPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
