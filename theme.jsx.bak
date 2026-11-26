// theme.jsx — MUI global theme aligned to Crane Worldwide design tokens
import { createTheme } from "@mui/material";

const CRANE = {
  accent:        "#1957FF",
  accentHover:   "#1146D4",
  accentSoft:    "#E8EFFF",
  craneNavy:     "#132D76",
  craneGreen:    "#01803E",
  pageBg:        "#F6F7F9",
  surface:       "#FFFFFF",
  surface2:      "#F7F8FA",
  surface3:      "#F1F2F4",
  border:        "#E6E8EC",
  borderSoft:    "#EFF0F3",
  borderStrong:  "#D5D9E0",
  fg:            "#0F1626",
  fg2:           "#475467",
  fg3:           "#667085",
  fg4:           "#98A2B3",
  fg5:           "#BDC3CC",
  success:       "#0E9F5E",
  successBg:     "#E1F5EB",
  warning:       "#D77A1A",
  warningBg:     "#FCF0DA",
  error:         "#D63A3A",
  errorBg:       "#FBE4E4",
  info:          "#2F6FE8",
  infoBg:        "#E5EEFD",
  neutral:       "#667085",
  neutralBg:     "#EEF0F3",
};

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: CRANE.accent, dark: CRANE.accentHover, contrastText: "#fff" },
    secondary: { main: CRANE.craneNavy, contrastText: "#fff" },
    success: { main: CRANE.success, light: CRANE.successBg, contrastText: "#fff" },
    warning: { main: CRANE.warning, light: CRANE.warningBg, contrastText: "#fff" },
    error:   { main: CRANE.error,   light: CRANE.errorBg,   contrastText: "#fff" },
    info:    { main: CRANE.info,    light: CRANE.infoBg,    contrastText: "#fff" },
    background: { default: CRANE.pageBg, paper: CRANE.surface },
    text: { primary: CRANE.fg, secondary: CRANE.fg2, disabled: CRANE.fg4 },
    divider: CRANE.border,
    grey: { 50: CRANE.surface2, 100: CRANE.surface3, 200: CRANE.border, 300: CRANE.borderStrong, 500: CRANE.fg3, 700: CRANE.fg2, 900: CRANE.fg },
  },
  shape: { borderRadius: 6 },
  typography: {
    fontFamily: '"Inter","Helvetica Neue",Helvetica,system-ui,-apple-system,sans-serif',
    fontSize: 13,
    htmlFontSize: 16,
    h1: { fontSize: 22, fontWeight: 700, letterSpacing: "-0.014em", lineHeight: 1.15 },
    h2: { fontSize: 18, fontWeight: 600, letterSpacing: "-0.01em",  lineHeight: 1.25 },
    h3: { fontSize: 16, fontWeight: 600, lineHeight: 1.3 },
    subtitle1: { fontSize: 14, fontWeight: 600 },
    subtitle2: { fontSize: 12, fontWeight: 500, color: CRANE.fg3 },
    body1: { fontSize: 13, lineHeight: 1.45 },
    body2: { fontSize: 12, lineHeight: 1.4 },
    caption: { fontSize: 11, color: CRANE.fg3, lineHeight: 1.2 },
    overline: { fontSize: 10, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: CRANE.fg3, lineHeight: 1.2 },
    button: { textTransform: "none", fontWeight: 500, fontSize: 13, letterSpacing: "-0.003em" },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFeatureSettings: '"tnum","lnum","cv11"',
          letterSpacing: "-0.012em",
          WebkitFontSmoothing: "antialiased",
          background: CRANE.pageBg,
          color: CRANE.fg,
        },
        "*": { boxSizing: "border-box" },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true, disableRipple: false, size: "small" },
      styleOverrides: {
        root: {
          borderRadius: 6, minHeight: 28, paddingInline: 12, fontWeight: 500,
          boxShadow: "none",
        },
        sizeSmall: { minHeight: 28, padding: "0 12px", fontSize: 13 },
        sizeMedium: { minHeight: 32, padding: "0 14px" },
        containedPrimary: { "&:hover": { backgroundColor: CRANE.accentHover } },
        outlinedPrimary: { borderColor: CRANE.border, color: CRANE.fg, "&:hover": { backgroundColor: CRANE.surface2, borderColor: CRANE.border } },
        textPrimary: { color: CRANE.fg2, "&:hover": { backgroundColor: CRANE.surface2 } },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: { borderRadius: 6, color: CRANE.fg2, padding: 6, "&:hover": { backgroundColor: CRANE.surface2 } },
        sizeSmall: { padding: 4 },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: { background: "#fff", border: `1px solid ${CRANE.border}`, borderRadius: 6, padding: 1, height: 30 },
        grouped: { border: 0, margin: 0, "&:not(:first-of-type)": { borderRadius: 5 }, "&:first-of-type": { borderRadius: 5 } },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          textTransform: "none", color: CRANE.fg3, padding: "2px 10px", border: 0,
          fontWeight: 500, fontSize: 12, minHeight: 26,
          "&.Mui-selected": { background: CRANE.accentSoft, color: CRANE.accent, "&:hover": { background: CRANE.accentSoft } },
          "&:hover": { background: CRANE.surface2 },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          fontSize: 13, background: "#fff", borderRadius: 6,
          "& fieldset": { borderColor: CRANE.border },
          "&:hover fieldset": { borderColor: CRANE.borderStrong },
          "&.Mui-focused fieldset": { borderColor: CRANE.accent, borderWidth: 1 },
        },
        input: { padding: "6px 10px", height: 18 },
        inputSizeSmall: { padding: "5px 10px" },
      },
    },
    MuiInputLabel: { styleOverrides: { root: { fontSize: 12, color: CRANE.fg3 } } },
    MuiSelect: { defaultProps: { size: "small" } },
    MuiTextField: { defaultProps: { size: "small" } },
    MuiMenuItem: { styleOverrides: { root: { fontSize: 13, minHeight: 30, paddingTop: 5, paddingBottom: 5 } } },
    MuiMenu: { styleOverrides: { paper: { border: `1px solid ${CRANE.border}`, boxShadow: "0 8px 24px rgba(15,23,42,.10)", borderRadius: 8, marginTop: 4 } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" }, elevation0: { boxShadow: "none" } } },
    MuiCard: { styleOverrides: { root: { border: `1px solid ${CRANE.border}`, borderRadius: 8, boxShadow: "0 1px 2px rgba(15,23,42,.03)" } } },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 5, height: 22, fontSize: 11, fontWeight: 500, paddingInline: 2 },
        sizeSmall: { height: 20, fontSize: 11 },
        label: { paddingInline: 8 },
        deleteIcon: { color: "currentColor", opacity: 0.6, "&:hover": { opacity: 1 } },
      },
    },
    MuiTooltip: { styleOverrides: { tooltip: { fontSize: 11, background: CRANE.fg, borderRadius: 4, padding: "4px 8px" }, arrow: { color: CRANE.fg } } },
    MuiDivider: { styleOverrides: { root: { borderColor: CRANE.borderSoft } } },
    MuiAvatar: { styleOverrides: { root: { fontSize: 11, fontWeight: 600, width: 26, height: 26 } } },
    MuiSwitch: {
      styleOverrides: {
        root: { width: 32, height: 18, padding: 0, marginRight: 6 },
        switchBase: { padding: 2, "&.Mui-checked": { transform: "translateX(14px)", color: "#fff", "& + .MuiSwitch-track": { backgroundColor: CRANE.success, opacity: 1 } } },
        thumb: { width: 14, height: 14, boxShadow: "0 1px 2px rgba(0,0,0,.2)" },
        track: { borderRadius: 999, backgroundColor: CRANE.fg5, opacity: 1 },
      },
    },
    MuiDrawer: { styleOverrides: { paper: { borderLeft: `1px solid ${CRANE.border}`, boxShadow: "0 8px 24px rgba(15,23,42,.10)" } } },
    MuiTabs: { styleOverrides: { root: { minHeight: 36, borderBottom: `1px solid ${CRANE.borderSoft}` }, indicator: { height: 2, background: CRANE.accent } } },
    MuiTab: { styleOverrides: { root: { textTransform: "none", minHeight: 36, fontSize: 13, fontWeight: 500, color: CRANE.fg3, "&.Mui-selected": { color: CRANE.accent } } } },
    MuiBadge: { styleOverrides: { badge: { fontSize: 10, height: 16, minWidth: 16, padding: "0 4px", fontWeight: 600 } } },
  },
});

window.CRANE_TOKENS = CRANE;
window.craneTheme = theme;
window.__craneReady = { ...(window.__craneReady||{}), theme: true };
window.dispatchEvent(new Event("crane:theme"));
