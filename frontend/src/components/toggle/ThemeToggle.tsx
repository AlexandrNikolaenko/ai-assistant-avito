import { useEffect } from "react";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setMode, type ThemeMode } from "../../store/themeSlice";

const storageKey = "theme";

export function ThemeToggle() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.theme?.mode);

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, mode);
    } catch {
      // ignore storage errors
    }
  }, [mode]);

  const nextMode: ThemeMode = mode === "dark" ? "light" : "dark";

  return (
    <FormControlLabel
      control={
        <Switch
          checked={mode === "dark"}
          onChange={() => dispatch(setMode(nextMode))}
        />
      }
      label={mode === "dark" ? "Темная тема" : "Светлая тема"}
    />
  );
}
