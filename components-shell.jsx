// components.jsx — All UI components for the Transactions page
// Uses MUI via importmap. Shares with app.jsx via window globals.
import React, { useState, useMemo, useEffect } from "react";
import {
  Box, Stack, Typography, Button, IconButton, Tooltip, Chip, Avatar, Badge,
  Divider, Drawer, Tabs, Tab, TextField, InputAdornment,
  Select, MenuItem, Menu, ListItemIcon, ListItemText,
  ToggleButton, ToggleButtonGroup, Switch,
} from "@mui/material";

// Wait for theme.jsx to finish so window.CRANE_TOKENS exists
await new Promise(r => {
  if (window.__craneReady?.theme) return r();
  window.addEventListener("crane:theme", () => r(), { once: true });
});

const T = window.CRANE_TOKENS;

// Lightweight segmented control — replaces MUI's ToggleButtonGroup which
// fails to recognize its children when @mui/material is loaded via CDN
// (different module identity than the internal isMuiElement check expects).
function Segmented({ value, onChange, options, height = 30, sx }) {
  return (
    <Box sx={{
      display:"inline-flex", height, bgcolor:"#fff",
      border:`1px solid ${T.border}`, borderRadius:"6px", p:"1px",
      ...sx,
    }}>
      {options.map(o => {
        const isSel = value === o.value;
        return (
          <Box
            key={o.value}
            role="button"
            aria-pressed={isSel}
            onClick={() => !isSel && onChange(o.value)}
            sx={{
              display:"inline-flex", alignItems:"center", justifyContent:"center",
              px: o.iconOnly ? 1 : 1.25, gap:0.5,
              fontSize: 12, fontWeight:500, cursor:"pointer", borderRadius:"5px",
              minWidth: o.iconOnly ? 28 : "auto",
              color: isSel ? T.accent : T.fg3,
              bgcolor: isSel ? T.accentSoft : "transparent",
              transition: "background 100ms, color 100ms",
              "&:hover": { bgcolor: isSel ? T.accentSoft : T.surface2, color: isSel ? T.accent : T.fg },
            }}
          >
            {o.icon}
            {o.label && <span>{o.label}</span>}
          </Box>
        );
      })}
    </Box>
  );
}

// ─── Icons (Iconsax-aligned, hand-traced for prototype) ──────────────────
const Ic = (props) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.6"
       strokeLinecap="round" strokeLinejoin="round" {...props} />
);
const I = {
  Box1:    (p) => <Ic {...p}><path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/></Ic>,
  List:    (p) => <Ic {...p}><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></Ic>,
  Grid:    (p) => <Ic {...p}><rect x="3" y="3"  width="8" height="8" rx="1.5"/><rect x="13" y="3"  width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></Ic>,
  Truck:   (p) => <Ic {...p}><path d="M3 7h11v10H3zM14 10h4l3 3v4h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></Ic>,
  Users:   (p) => <Ic {...p}><circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="8" r="2.5"/><path d="M21 19c0-2.5-1.5-5-4-5"/></Ic>,
  Chart:   (p) => <Ic {...p}><path d="M3 3v18h18"/><path d="M7 14l3-3 4 4 6-7"/></Ic>,
  Folder:  (p) => <Ic {...p}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/></Ic>,
  Tree:    (p) => <Ic {...p}><rect x="9" y="3" width="6" height="4" rx="1"/><rect x="3" y="17" width="6" height="4" rx="1"/><rect x="15" y="17" width="6" height="4" rx="1"/><path d="M12 7v4M6 17v-2h12v2"/></Ic>,
  Settings:(p) => <Ic {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3 1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8 1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></Ic>,
  Help:    (p) => <Ic {...p}><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 4.5 1.5c-.5.5-2 1-2 2.5M12 17h0"/></Ic>,
  Bell:    (p) => <Ic {...p}><path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 21a2 2 0 0 0 4 0"/></Ic>,
  Search:  (p) => <Ic {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></Ic>,
  Calendar:(p) => <Ic {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></Ic>,
  Pin:     (p) => <Ic {...p}><path d="M12 22s7-7.5 7-13a7 7 0 0 0-14 0c0 5.5 7 13 7 13z"/><circle cx="12" cy="9" r="2.5"/></Ic>,
  Clock:   (p) => <Ic {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Ic>,
  Check:   (p) => <Ic {...p}><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></Ic>,
  Alert:   (p) => <Ic {...p}><path d="M10.3 3.7 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h0"/></Ic>,
  Info:    (p) => <Ic {...p}><circle cx="12" cy="12" r="9"/><path d="M12 8h0M11 12h1v4h1"/></Ic>,
  Plus:    (p) => <Ic {...p}><path d="M12 5v14M5 12h14"/></Ic>,
  Download:(p) => <Ic {...p}><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></Ic>,
  Filter:  (p) => <Ic {...p}><path d="M3 6h18M6 12h12M10 18h4"/></Ic>,
  Phone:   (p) => <Ic {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></Ic>,
  PhoneMissed: (p) => <Ic {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/><path d="m22 2-6 6M22 8l-6-6"/></Ic>,
  Chat:    (p) => <Ic {...p}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></Ic>,
  Dots:    (p) => <Ic {...p}><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></Ic>,
  Star:    (p) => <Ic {...p}><path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1z"/></Ic>,
  Eye:     (p) => <Ic {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></Ic>,
  ChevronD:(p) => <Ic {...p}><path d="m6 9 6 6 6-6"/></Ic>,
  ChevronL:(p) => <Ic {...p}><path d="m15 6-6 6 6 6"/></Ic>,
  ChevronR:(p) => <Ic {...p}><path d="m9 6 6 6-6 6"/></Ic>,
  Globe:   (p) => <Ic {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></Ic>,
  Expand:  (p) => <Ic {...p}><path d="M9 4H5a1 1 0 0 0-1 1v4M15 4h4a1 1 0 0 1 1 1v4M9 20H5a1 1 0 0 1-1-1v-4M15 20h4a1 1 0 0 0 1-1v-4"/></Ic>,
  Refresh: (p) => <Ic {...p}><path d="M3 12a9 9 0 0 1 15.5-6.3L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15.5 6.3L3 16"/><path d="M3 21v-5h5"/></Ic>,
  Video:   (p) => <Ic {...p}><rect x="2" y="6" width="14" height="12" rx="2"/><path d="m22 8-6 4 6 4V8z"/></Ic>,
  Edit:    (p) => <Ic {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></Ic>,
  Copy:    (p) => <Ic {...p}><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></Ic>,
  Tick:    (p) => <Ic {...p}><path d="m5 13 4 4 10-10"/></Ic>,
  AlertTri:(p) => <Ic {...p}><path d="M10.3 3.7 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0z" fill="currentColor" stroke="none"/><path d="M12 9.2v4.1M12 16.6h.01" stroke="#fff" strokeWidth="2.2"/></Ic>,
  BellFill:(p) => <Ic {...p}><path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8z" fill="currentColor" stroke="none"/><path d="M10 20.5a2 2 0 0 0 4 0"/></Ic>,
  Close:   (p) => <Ic {...p}><path d="M6 6l12 12M18 6 6 18"/></Ic>,
};
window.I = I;

const STATUS_COLORS = {
  success: { fg: T.success, bg: T.successBg },
  warning: { fg: T.warning, bg: T.warningBg },
  error:   { fg: T.error,   bg: T.errorBg },
  info:    { fg: T.info,    bg: T.infoBg },
  neutral: { fg: T.neutral, bg: T.neutralBg },
};

function StatusPill({ tone="neutral", children, dot=false }) {
  const c = STATUS_COLORS[tone] || STATUS_COLORS.neutral;
  return (
    <Box sx={{
      display:"inline-flex", alignItems:"center", gap:0.5, height:20,
      px:0.9, borderRadius:"5px", bgcolor:c.bg, color:c.fg,
      fontSize:11, fontWeight:500, lineHeight:1, whiteSpace:"nowrap",
    }}>
      {dot && <Box sx={{ width:6, height:6, borderRadius:999, bgcolor:c.fg }}/>}
      {children}
    </Box>
  );
}

// ─── Sidebar (Outlook-style: collapsed rail, hover/pin to expand) ────────
// Brand at top, nav in middle, language selector + user profile at bottom.
// Expanded state overlays page content so it doesn't reflow on hover.
function Sidebar({ active, onNav, alertCount=8, pinned, onTogglePin }) {
  const items = [
    { id:"analytics",    label:"Analytics",    Icon:I.Chart },
    { id:"transactions", label:"Transactions", Icon:I.List, badge: 13 },
    { id:"alerts",       label:"Alerts Inbox", Icon:I.Bell, badge: alertCount, isAlert:true },
    { id:"drivers",      label:"Drivers",      Icon:I.Truck },
    { id:"users",        label:"Users",        Icon:I.Users },
    { id:"processes",    label:"Processes",    Icon:I.Tree },
    { id:"reports",      label:"Reports",      Icon:I.Chart },
    { id:"resources",    label:"Resources",    Icon:I.Folder },
  ];

  const RAIL = 56;
  const PANE = 232;

  const [hovered, setHovered] = useState(false);
  const expanded = pinned || hovered;

  return (
    // Outer slot reserves rail width in the flex layout. The inner card
    // overlays adjacent content when expanded so nothing reflows on hover.
    <Box sx={{
      position:"relative", width: pinned ? PANE : RAIL, flexShrink:0,
      transition: "width 180ms cubic-bezier(.22,1,.36,1)",
    }}>
      <Box
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        sx={{
          position:"absolute", inset:0,
          width: expanded ? PANE : RAIL,
          transition:"width 180ms cubic-bezier(.22,1,.36,1), box-shadow 180ms",
          bgcolor: T.surface2,
          borderRight: `1px solid ${T.border}`,
          boxShadow: (expanded && !pinned) ? "8px 0 20px rgba(15,23,42,.06)" : "none",
          zIndex: 20,
          display:"flex", flexDirection:"column", overflow:"hidden",
        }}
      >
        {/* Brand */}
        <Stack direction="row" alignItems="center" sx={{ px:1.5, py:1.25, minHeight:56, borderBottom:`1px solid ${T.borderSoft}` }}>
          <Box component="img" src="assets/crane-mark.png" sx={{ width:26, height:26, borderRadius:"5px", flexShrink:0 }} alt="Crane"/>
          {expanded && (
            <Box sx={{ ml:1.25, minWidth:0 }}>
              <Typography sx={{ fontSize:13, fontWeight:700, lineHeight:1.15, color:T.fg, letterSpacing:"-0.01em", whiteSpace:"nowrap" }}>
                Crane Worldwide
              </Typography>
              <Typography sx={{ fontSize:10, color:T.fg3, lineHeight:1.15, letterSpacing:"0.04em" }}>LOGISTICS · QUIKSTEP</Typography>
            </Box>
          )}
        </Stack>

        {/* Search (only when expanded) */}
        {expanded && (
          <Stack direction="row" alignItems="center" gap={0.75}
            sx={{ mx:1.25, mt:1, px:1.25, py:0.75, bgcolor:"#fff", border:`1px solid ${T.border}`, borderRadius:"6px", fontSize:12, color:T.fg4 }}>
            <I.Search size={13}/>
            <Box sx={{ flex:1 }}>Search…</Box>
            <Box sx={{ fontSize:10, color:T.fg4, border:`1px solid ${T.border}`, borderRadius:"4px", px:0.5 }}>⌘K</Box>
          </Stack>
        )}

        {/* Nav */}
        <Stack gap={0.25} sx={{ flex:1, px: expanded ? 1.25 : 0.75, py:1, overflow:"auto" }}>
          {items.map(it => {
            const Icon = it.Icon;
            const isActive = active === it.id;
            const isAlertBadge = it.isAlert && it.badge > 0;
            return (
              <Tooltip key={it.id} title={expanded ? "" : it.label} placement="right" arrow disableInteractive>
                <Box
                  role="button"
                  onClick={() => onNav && onNav(it.id)}
                  sx={{
                    position:"relative",
                    display:"flex", alignItems:"center", gap:1.25,
                    height:34, px: expanded ? 1.25 : 0,
                    borderRadius:"6px", cursor:"pointer", fontSize:13, fontWeight:500,
                    color: isActive ? T.accent : T.fg2,
                    bgcolor: isActive ? T.accentSoft : "transparent",
                    transition: "background 100ms",
                    "&:hover": { bgcolor: isActive ? T.accentSoft : T.surface3, color: isActive ? T.accent : T.fg },
                    justifyContent: expanded ? "flex-start" : "center",
                  }}
                >
                  <Box sx={{ position:"relative", display:"inline-flex" }}>
                    <Icon size={18}/>
                    {!expanded && isAlertBadge && (
                      <Box sx={{ position:"absolute", top:-3, right:-4, width:8, height:8, bgcolor:T.error, borderRadius:999, border:"1.5px solid " + T.surface2 }}/>
                    )}
                  </Box>
                  {expanded && <Box sx={{ flex:1, whiteSpace:"nowrap" }}>{it.label}</Box>}
                  {expanded && it.badge ? (
                    <Box sx={{
                      fontSize:10, fontWeight:600,
                      bgcolor: isAlertBadge ? T.error : (isActive ? "#fff" : T.surface3),
                      color: isAlertBadge ? "#fff" : (isActive ? T.accent : T.fg2),
                      px:0.8, borderRadius:999, minWidth:18, textAlign:"center",
                    }}>{it.badge}</Box>
                  ) : null}
                </Box>
              </Tooltip>
            );
          })}
        </Stack>

        {/* Language selector */}
        <Box sx={{ px: expanded ? 1.25 : 0.75, pb: 0.75 }}>
          {expanded ? (
            <Box sx={{
              display:"flex", alignItems:"center", gap:0.75,
              height:32, px:1, borderRadius:"6px", cursor:"pointer",
              border:`1px solid ${T.border}`, bgcolor:"#fff",
              "&:hover": { borderColor: T.borderStrong },
            }}>
              <I.Globe size={14} color={T.fg2}/>
              <Box sx={{ flex:1, fontSize:12, color:T.fg }}>English</Box>
              <I.ChevronD size={12} color={T.fg3}/>
            </Box>
          ) : (
            <Tooltip title="Language: English" placement="right" arrow disableInteractive>
              <IconButton size="small" sx={{ width:"100%", borderRadius:"6px", height:32 }}>
                <I.Globe size={16}/>
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Divider sx={{ borderColor: T.borderSoft }}/>

        {/* User profile */}
        <Box sx={{ px: expanded ? 1.25 : 0.75, py:1 }}>
          <Stack direction="row" alignItems="center" gap={1.25} sx={{ cursor:"pointer", borderRadius:"6px", "&:hover": { bgcolor: T.surface3 }, py:0.5, px: expanded ? 0.5 : 0, justifyContent: expanded ? "flex-start" : "center" }}>
            <Avatar sx={{ width:32, height:32, bgcolor:T.craneGreen, fontSize:12 }}>SB</Avatar>
            {expanded && (
              <Box sx={{ flex:1, minWidth:0 }}>
                <Typography sx={{ fontSize:13, fontWeight:600, color:T.fg, lineHeight:1.2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>Suraj B</Typography>
                <Typography sx={{ fontSize:11, color:T.fg3, lineHeight:1.2 }}>Quikstep · Dispatcher</Typography>
              </Box>
            )}
            {expanded && <I.ChevronD size={12} color={T.fg3}/>}
          </Stack>
        </Box>

        {/* Pin toggle — only visible when expanded (hover or pinned) */}
        {expanded && (
          <Tooltip title={pinned ? "Collapse sidebar" : "Pin sidebar"} placement="right" arrow disableInteractive>
            <IconButton
              size="small"
              onClick={onTogglePin}
              sx={{
                position:"absolute", top:14, right:8,
                width:20, height:20, borderRadius:"4px",
                bgcolor: pinned ? T.accentSoft : "transparent",
                color: pinned ? T.accent : T.fg3,
                "&:hover": { bgcolor: pinned ? T.accentSoft : T.surface3 },
              }}>
              {pinned ? <I.ChevronL size={12}/> : <I.ChevronR size={12}/>}
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
}

// ─── Topbar (two rows: title + view/actions, filters) ────────────────────
function Topbar({
  // row 1
  title, totalCount,
  // row 2 — filters
  search, onSearch,
  clientFilter, onClientFilter,
  statusFilter, onStatusFilter,
  // view + actions (row 1, right side)
  view, onView,
  fullscreen, onFullscreen,
  onExport, onAdd,
}) {
  const { CLIENT_SCHEMAS, STATUS_LABEL } = window.CRANE_DATA;
  const hasFilters = clientFilter !== "all" || statusFilter !== "all" || !!search;
  const clearAll = () => { onClientFilter("all"); onStatusFilter("all"); onSearch(""); };

  return (
    <Stack sx={{ borderBottom: `1px solid ${T.border}`, bgcolor:"#fff" }}>
      {/* Row 1 — title + view toggle + actions */}
      <Stack direction="row" alignItems="center" gap={1.5} sx={{ px:2, py:1.25, minHeight:52, borderBottom:`1px solid ${T.borderSoft}` }}>
        <Box sx={{ width:32, height:32, borderRadius:"8px", bgcolor:T.surface2, display:"inline-flex", alignItems:"center", justifyContent:"center", color:T.fg2 }}>
          <I.Box1 size={17}/>
        </Box>
        <Stack direction="row" alignItems="baseline" gap={1}>
          <Typography sx={{ fontSize:18, fontWeight:600, color:T.fg, letterSpacing:"-0.014em", lineHeight:1.15 }}>
            {title}
          </Typography>
          {typeof totalCount === "number" && (
            <Box sx={{ fontSize:11, fontWeight:500, bgcolor:T.surface3, color:T.fg2, px:0.8, py:"1px", borderRadius:"4px" }}>
              {totalCount.toLocaleString()}
            </Box>
          )}
        </Stack>

        <Box sx={{ flex:1 }}/>

        {/* View toggle */}
        <Segmented
          value={view} onChange={onView}
          options={[
            { value:"list",   iconOnly:true, icon:<I.List size={14}/> },
            { value:"kanban", iconOnly:true, icon:<I.Grid size={14}/> },
          ]}
        />

        <ViewMenu fullscreen={fullscreen} onFullscreen={onFullscreen}/>

        <Button variant="outlined" color="primary" startIcon={<I.Download size={13}/>} sx={{ minHeight:30 }} onClick={onExport}>
          Export
        </Button>
        <Button variant="contained" color="primary" startIcon={<I.Plus size={13}/>} sx={{ minHeight:30 }} onClick={onAdd}>
          Add Transaction
        </Button>
      </Stack>

      {/* Row 2 — filters */}
      <Stack direction="row" alignItems="center" gap={1} sx={{ px:2, py:1, flexWrap:"wrap" }}>
        <TextField
          placeholder="Search reference, destination, site…"
          value={search}
          onChange={e => onSearch(e.target.value)}
          InputProps={{
            startAdornment: (<InputAdornment position="start"><I.Search size={14} color={T.fg4}/></InputAdornment>),
            sx: { bgcolor:"#fff", height:30, width:300 },
          }}
        />

        <FieldSelect label="Client" value={clientFilter} onChange={onClientFilter} options={[
          { value:"all", label:"All Clients" },
          ...Object.entries(CLIENT_SCHEMAS).map(([k,v])=>({ value:k, label:v.name })),
        ]}/>

        <FieldSelect label="Status" value={statusFilter} onChange={onStatusFilter} options={[
          { value:"all", label:"All Statuses" },
          ...Object.entries(STATUS_LABEL).map(([k,v])=>({ value:k, label:v })),
        ]}/>

        <FieldSelect label="Pickup" value="any" onChange={()=>{}} options={[
          { value:"any", label:"Any Date" },
          { value:"today", label:"Today" },
          { value:"week", label:"This Week" },
        ]}/>

        <FieldSelect label="Alerts" value="any" onChange={()=>{}} options={[
          { value:"any", label:"Any" },
          { value:"with", label:"With Alerts" },
          { value:"clean", label:"Clean" },
        ]}/>

        <Button startIcon={<I.Filter size={13}/>} variant="text" sx={{ color:T.fg2, minHeight:30, ml:-0.5 }}>
          More Filters
        </Button>

        {/* Active filters — chips live here rather than in a strip of their own */}
        {hasFilters && (
          <React.Fragment>
            <Box sx={{ width:"1px", height:20, bgcolor:T.border, mx:0.25 }}/>
            {clientFilter !== "all" && (
              <FilterChip label={`Client: ${CLIENT_SCHEMAS[clientFilter].name}`} onRemove={() => onClientFilter("all")}/>
            )}
            {statusFilter !== "all" && (
              <FilterChip label={`Status: ${STATUS_LABEL[statusFilter]}`} onRemove={() => onStatusFilter("all")}/>
            )}
            {search && (
              <FilterChip label={`Search: "${search}"`} onRemove={() => onSearch("")}/>
            )}
            <Box role="button" onClick={clearAll} sx={{
              fontSize:11, color:T.fg3, fontWeight:500, cursor:"pointer",
              "&:hover": { color:T.fg, textDecoration:"underline" },
            }}>Clear all</Box>
          </React.Fragment>
        )}
      </Stack>
    </Stack>
  );
}

// "More views" dropdown — carries the full-screen canvas mode, where the
// sidebar, topbar and KPI strip step aside and only the board / list shows.
function ViewMenu({ fullscreen, onFullscreen }) {
  const [anchor, setAnchor] = useState(null);
  return (
    <React.Fragment>
      <Button
        variant="outlined" color="primary"
        endIcon={<I.ChevronD size={13}/>}
        sx={{ minHeight:30, color:T.fg2, borderColor:T.border }}
        onClick={e => setAnchor(e.currentTarget)}
      >More views</Button>
      <Menu
        anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical:"bottom", horizontal:"right" }}
        transformOrigin={{ vertical:"top", horizontal:"right" }}
      >
        <MenuItem onClick={() => { setAnchor(null); onFullscreen && onFullscreen(!fullscreen); }}>
          <ListItemIcon sx={{ color:T.fg2, minWidth:"auto", mr:1 }}><I.Expand size={14}/></ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize:13 }}>
            {fullscreen ? "Exit Full Screen" : "Full Screen"}
          </ListItemText>
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
}

// Removable chip for one active filter.
function FilterChip({ label, onRemove }) {
  return (
    <Box sx={{
      display:"inline-flex", alignItems:"center", gap:0.5,
      bgcolor:T.surface3, color:T.fg2, border:`1px solid ${T.border}`,
      borderRadius:"5px", pl:1, pr:0.5, py:0.2, fontSize:11, fontWeight:500,
      whiteSpace:"nowrap",
    }}>
      <span>{label}</span>
      <Box role="button" onClick={onRemove} sx={{
        width:14, height:14, borderRadius:999, display:"inline-flex",
        alignItems:"center", justifyContent:"center", cursor:"pointer",
        "&:hover": { bgcolor:"rgba(0,0,0,.08)" },
      }}><I.Close size={10}/></Box>
    </Box>
  );
}

function FieldSelect({ label, value, onChange, options }) {
  return (
    <Box sx={{
      display:"flex", alignItems:"center",
      bgcolor:"#fff", border:`1px solid ${T.border}`, borderRadius:"6px",
      height:30, px:1, gap:0.5, minWidth:0,
    }}>
      <Typography sx={{ fontSize:11, color:T.fg3, fontWeight:500 }}>{label}:</Typography>
      <Select
        value={value} onChange={e => onChange(e.target.value)}
        variant="standard" disableUnderline
        sx={{ fontSize:12, color:T.fg, "& .MuiSelect-select": { py:0, pl:0, pr:"18px !important" } }}
      >
        {options.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
      </Select>
    </Box>
  );
}

// ─── KPI Strip (slim, one-line) ──────────────────────────────────────────
function KpiStrip() {
  const items = [
    { label:"Open Transactions", value:"128" },
    { label:"Active Alerts",     value:"7"   },
    { label:"On-Time Rate",      value:"95%" },
    { label:"Avg Cycle Time",    value:"4.2h"},
    { label:"Completed Today",   value:"47"  },
  ];
  return (
    <Stack direction="row" gap={1} sx={{ mb:1.5 }}>
      {items.map(it => (
        <Box key={it.label} sx={{
          flex:1, bgcolor:"#fff", border:`1px solid ${T.border}`, borderRadius:"8px",
          px:1.75, py:1.25, display:"flex", flexDirection:"column", justifyContent:"center",
          gap:0.5, minWidth:0, minHeight:64,
        }}>
          <Typography sx={{
            fontSize:10.5, color:T.fg3, fontWeight:500,
            textTransform:"uppercase", letterSpacing:"0.05em",
          }}>{it.label}</Typography>
          <Typography sx={{
            fontSize:22, fontWeight:600, color:T.fg, lineHeight:1,
            letterSpacing:"-0.018em", fontVariantNumeric:"tabular-nums",
          }}>
            {it.value}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
}

window.Sidebar = Sidebar;
window.Topbar = Topbar;
window.Segmented = Segmented;
window.KpiStrip = KpiStrip;
window.StatusPill = StatusPill;
window.CRANE_STATUS_COLORS = STATUS_COLORS;
window.__craneReady = { ...(window.__craneReady||{}), shell: true };
window.dispatchEvent(new Event("crane:shell"));
