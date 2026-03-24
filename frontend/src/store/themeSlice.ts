import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type ThemeMode = "light" | "dark";

const getInitialMode = (): ThemeMode => {
  try {
    const raw = window.localStorage.getItem("theme");
    return raw === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
};

const themeSlice = createSlice({
  name: "theme",
  initialState: {
    mode: getInitialMode(),
  },
  reducers: {
    setMode: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload;
    },
  },
});

export const { setMode } = themeSlice.actions;
export default themeSlice.reducer;
