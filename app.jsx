// app.jsx — Wires everything together
import React, { useState, useMemo, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  ThemeProvider, CssBaseline, Box, Stack, Typography,
} from "@mui/material";

await new Promise(r => {
  if (window.__craneReady?.detail) return r();
  window.addEventListener("crane:detail", () => r(), { once: true });
});

const theme = window.craneTheme;
const T = window.CRANE_TOKENS;
const I = window.I;
const { TRANSACTIONS } = window.CRANE_DATA;
const { Sidebar, Topbar, KpiStrip, FilterBar, ListView, KanbanView, AlertsDrawer, TransactionDetail } = window;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "view": "list",
  "showKpis": true,
  "sidebarPinned": false,
  "accent": "#1957FF"
}/*EDITMODE-END*/;

function App() {
  const [tweaks, setTweaks] = useState(TWEAK_DEFAULTS);
  const setTweak = (k, v) => {
    const next = typeof k === "object" ? { ...tweaks, ...k } : { ...tweaks, [k]: v };
    setTweaks(next);
    window.parent.postMessage({ type: "__edit_mode_set_keys", edits: typeof k === "object" ? k : { [k]: v } }, "*");
  };

  // local UI state — view/density/sidebarPinned live in tweaks
  const [search, setSearch] = useState("");
  const [clientFilter, setClientFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [active, setActive] = useState("transactions");
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [tweaksOpen, setTweaksOpen] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);

  // Tweaks panel host protocol
  useEffect(() => {
    const handler = (e) => {
      if (!e.data || typeof e.data !== "object") return;
      if (e.data.type === "__activate_edit_mode") setTweaksOpen(true);
      if (e.data.type === "__deactivate_edit_mode") setTweaksOpen(false);
    };
    window.addEventListener("message", handler);
    window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    return () => window.removeEventListener("message", handler);
  }, []);

  // Filter rows
  const rows = useMemo(() => {
    return TRANSACTIONS.filter(r => {
      if (clientFilter !== "all" && r.clientKey !== clientFilter) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const hay = [r.values.ref, r.values.driver, r.values.destination, r.values.origin, r.values.site].join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [clientFilter, statusFilter, search]);

  const totalAlerts = window.CRANE_ALERTS.missedCalls.length + window.CRANE_ALERTS.unreadChats.reduce((s,c)=>s+c.unread,0);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <Box sx={{ minHeight:"100vh", bgcolor:T.pageBg }}>
        <Box sx={{
          minHeight:"100vh", display:"flex", overflow:"hidden", bgcolor:"#fff",
        }}>
          <Sidebar
            active={active}
            pinned={tweaks.sidebarPinned}
            onTogglePin={() => setTweak("sidebarPinned", !tweaks.sidebarPinned)}
            alertCount={totalAlerts}
            onNav={(id) => {
              setActive(id);
              if (id === "alerts") setAlertsOpen(true);
            }}
          />

          <Box sx={{ flex:1, minWidth:0, display:"flex", flexDirection:"column" }}>
            {selectedTxn ? (
              <TransactionDetail tx={selectedTxn} onBack={() => setSelectedTxn(null)}/>
            ) : (
              <React.Fragment>
                <Topbar
                  title="Current Transactions"
                  totalCount={rows.length}
                  search={search} onSearch={setSearch}
                  clientFilter={clientFilter} onClientFilter={setClientFilter}
                  statusFilter={statusFilter} onStatusFilter={setStatusFilter}
                  view={tweaks.view} onView={(v) => setTweak("view", v)}
                  onExport={() => {}}
                  onAdd={() => {}}
                />

                <Box sx={{ flex:1, px:2, py:1.5, overflow:"auto", bgcolor: T.pageBg }}>
                  {tweaks.showKpis && <KpiStrip/>}

                  {/* Active filter chips (when something is filtered) */}
                  {(clientFilter !== "all" || statusFilter !== "all" || search) && (
                    <Stack direction="row" alignItems="center" gap={0.75} sx={{ mb:1.25, flexWrap:"wrap" }}>
                      <Typography sx={{ fontSize:11, color:T.fg3, fontWeight:500 }}>Filters:</Typography>
                      {clientFilter !== "all" && (
                        <FilterChip label={`Client: ${window.CRANE_DATA.CLIENT_SCHEMAS[clientFilter].name}`} onRemove={() => setClientFilter("all")}/>
                      )}
                      {statusFilter !== "all" && (
                        <FilterChip label={`Status: ${window.CRANE_DATA.STATUS_LABEL[statusFilter]}`} onRemove={() => setStatusFilter("all")}/>
                      )}
                      {search && (
                        <FilterChip label={`Search: "${search}"`} onRemove={() => setSearch("")}/>
                      )}
                      <Box
                        role="button"
                        onClick={() => { setClientFilter("all"); setStatusFilter("all"); setSearch(""); }}
                        sx={{ fontSize:11, color:T.accent, fontWeight:500, cursor:"pointer", "&:hover": { textDecoration:"underline" } }}
                      >Clear all</Box>
                    </Stack>
                  )}

                  {tweaks.view === "list"
                    ? <ListView rows={rows} onOpen={setSelectedTxn}/>
                    : <KanbanView rows={rows} onOpen={setSelectedTxn}/>
                  }
                </Box>
              </React.Fragment>
            )}
          </Box>
        </Box>

        <AlertsDrawer open={alertsOpen} onClose={() => setAlertsOpen(false)}/>

        {tweaksOpen && <TweaksPanel tweaks={tweaks} setTweak={setTweak} onClose={() => {
          setTweaksOpen(false);
          window.parent.postMessage({ type: "__edit_mode_dismissed" }, "*");
        }}/>}
      </Box>
    </ThemeProvider>
  );
}

function FilterChip({ label, onRemove }) {
  return (
    <Box sx={{
      display:"inline-flex", alignItems:"center", gap:0.5,
      bgcolor:T.accentSoft, color:T.accent, borderRadius:"5px",
      pl:1, pr:0.5, py:0.25, fontSize:11, fontWeight:500,
    }}>
      <span>{label}</span>
      <Box role="button" onClick={onRemove} sx={{
        width:14, height:14, borderRadius:999, display:"inline-flex", alignItems:"center", justifyContent:"center", cursor:"pointer", "&:hover": { bgcolor:"rgba(0,0,0,.06)" }
      }}><I.Close size={10}/></Box>
    </Box>
  );
}

// Lightweight inline tweaks panel
function TweaksPanel({ tweaks, setTweak, onClose }) {
  return (
    <Box sx={{
      position:"fixed", bottom:16, right:16, width:280,
      bgcolor:"#fff", border:`1px solid ${T.border}`, borderRadius:"10px",
      boxShadow:"0 8px 24px rgba(15,23,42,.10)", zIndex:1300,
      display:"flex", flexDirection:"column", overflow:"hidden",
    }}>
      <Stack direction="row" alignItems="center" sx={{ px:1.5, py:1, borderBottom:`1px solid ${T.borderSoft}` }}>
        <Typography sx={{ fontSize:13, fontWeight:600 }}>Tweaks</Typography>
        <Box sx={{ flex:1 }}/>
        <Box role="button" onClick={onClose} sx={{ cursor:"pointer", color:T.fg3, "&:hover":{ color:T.fg } }}><I.Close size={14}/></Box>
      </Stack>
      <Stack gap={1.25} sx={{ p:1.5 }}>
        <TweakRow label="Show KPI strip">
          <TweakSwitch checked={tweaks.showKpis} onChange={v => setTweak("showKpis", v)}/>
        </TweakRow>
        <TweakRow label="Pin sidebar">
          <TweakSwitch checked={tweaks.sidebarPinned} onChange={v => setTweak("sidebarPinned", v)}/>
        </TweakRow>
        <TweakRow label="View">
          <TweakSegment value={tweaks.view} onChange={v => setTweak("view", v)}
            options={[{value:"list",label:"List"},{value:"kanban",label:"Kanban"}]}/>
        </TweakRow>
      </Stack>
    </Box>
  );
}
function TweakRow({ label, children }) {
  return (
    <Stack direction="row" alignItems="center" gap={1}>
      <Typography sx={{ fontSize:12, color:T.fg2, flex:1 }}>{label}</Typography>
      {children}
    </Stack>
  );
}
function TweakSwitch({ checked, onChange }) {
  return (
    <Box
      role="button" onClick={() => onChange(!checked)}
      sx={{
        width:30, height:18, bgcolor: checked ? T.success : T.fg5, borderRadius:999, position:"relative", cursor:"pointer", transition:"background 150ms",
      }}>
      <Box sx={{
        position:"absolute", top:2, left: checked ? 14 : 2,
        width:14, height:14, bgcolor:"#fff", borderRadius:999,
        boxShadow:"0 1px 2px rgba(0,0,0,.2)", transition:"left 150ms",
      }}/>
    </Box>
  );
}
function TweakSegment({ value, onChange, options }) {
  return (
    <Stack direction="row" sx={{ bgcolor:T.surface2, border:`1px solid ${T.border}`, borderRadius:"6px", overflow:"hidden", height:24 }}>
      {options.map(o => (
        <Box key={o.value} role="button" onClick={() => onChange(o.value)}
          sx={{
            px:1, fontSize:11, fontWeight:500, cursor:"pointer",
            display:"inline-flex", alignItems:"center",
            bgcolor: value === o.value ? "#fff" : "transparent",
            color: value === o.value ? T.accent : T.fg3,
            boxShadow: value === o.value ? "0 0 0 1px rgba(0,0,0,.04)" : "none",
            transition:"all 100ms",
          }}>
          {o.label}
        </Box>
      ))}
    </Stack>
  );
}

createRoot(document.getElementById("root")).render(<App/>);
