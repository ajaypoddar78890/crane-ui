// components-views.jsx — FilterBar, ListView, KanbanView, AlertsDrawer
import React, { useState, useMemo } from "react";
import {
  Box, Stack, Typography, Button, IconButton, Tooltip, Chip, Avatar,
  Divider, Drawer, Tabs, Tab, TextField, InputAdornment,
  Select, MenuItem, Menu,
  ToggleButton, ToggleButtonGroup, Switch, FormControlLabel,
} from "@mui/material";

await new Promise(r => {
  if (window.__craneReady?.shell) return r();
  window.addEventListener("crane:shell", () => r(), { once: true });
});

const T = window.CRANE_TOKENS;
const I = window.I;
const StatusPill = window.StatusPill;

const STATUS = window.CRANE_DATA.STATUS_LABEL;
const TONES  = window.CRANE_DATA.STATUS_TONE;
const SCHEMAS = window.CRANE_DATA.CLIENT_SCHEMAS;
const STAGE_LABELS = window.CRANE_DATA.STAGE_LABELS;

// Each row shows label-with-value cells so dynamic per-client labels are
// handled gracefully. No shared column header.

function ListView({ rows, onOpen }) {
  // Single density only (cozy ~58px min). Rows can grow to fit alert lists.
  const MIN_W = 1080;

  return (
    <Box sx={{
      bgcolor:"#fff", border:`1px solid ${T.border}`, borderRadius:"8px",
      overflow:"hidden", boxShadow:"0 1px 2px rgba(15,23,42,.03)",
    }}>
     <Box sx={{ overflowX:"auto" }}>
      {/* hairline header — generic categories so dynamic labels still fit */}
      <Stack direction="row" alignItems="center" gap={1.5} sx={{
        px:1.75, py:0.7, bgcolor:T.surface2, borderBottom:`1px solid ${T.border}`,
        fontSize:10, color:T.fg3, fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase",
        minWidth: MIN_W,
      }}>
        <Box sx={{ width: 170 }}>Reference</Box>
        <Box sx={{ width: 120 }}>Schedule</Box>
        <Box sx={{ width: 200 }}>Destination</Box>
        <Box sx={{ width: 150 }}>Stage</Box>
        <Box sx={{ width: 130 }}>Status</Box>
        <Box sx={{ flex:1, minWidth: 220 }}>Alerts & Updates</Box>
        <Box sx={{ width: 56 }}/>
      </Stack>

      {rows.map((r, i) => (
        <ListRow
          key={r.id} row={r}
          minWidth={MIN_W}
          onOpen={onOpen}
          last={i === rows.length-1}
        />
      ))}
     </Box>

      {/* Footer */}
      <Stack direction="row" alignItems="center" gap={1.5} sx={{
        px:1.5, py:0.8, bgcolor:T.surface2, borderTop:`1px solid ${T.border}`, fontSize:12, color:T.fg3,
      }}>
        <Typography sx={{ fontSize:12, color:T.fg3 }}>Showing 1 – {rows.length} of {rows.length}</Typography>
        <Box sx={{ flex:1 }}/>
        <Stack direction="row" gap={0.25}>
          <Button size="small" variant="text" sx={{ minWidth:26, color:T.fg3 }}>‹</Button>
          <Button size="small" variant="text" sx={{ minWidth:26, bgcolor:T.accentSoft, color:T.accent, fontWeight:600 }}>1</Button>
          <Button size="small" variant="text" sx={{ minWidth:26, color:T.fg3 }}>2</Button>
          <Button size="small" variant="text" sx={{ minWidth:26, color:T.fg3 }}>3</Button>
          <Button size="small" variant="text" sx={{ minWidth:26, color:T.fg3 }}>›</Button>
        </Stack>
      </Stack>
    </Box>
  );
}

function ListRow({ row, minWidth=1080, onOpen, last }) {
  const schema = SCHEMAS[row.clientKey];
  const v = row.values;
  const stageLabel = STAGE_LABELS[row.clientKey][row.stageIdx];
  const hasAlerts = row.alerts && row.alerts.length > 0;
  const hasNotifs = row.notifications && row.notifications.length > 0;

  // Row tint priority: alerts (warning) > notifications (info) > none.
  const tint = hasAlerts
    ? { border: T.warning,        bg: "#FEF8EF", bgHover: "#FCF1DF" }
    : hasNotifs
    ? { border: T.info,           bg: "#F1F6FE", bgHover: "#E5EEFD" }
    : { border: "transparent",    bg: "transparent", bgHover: T.surface2 };

  // Field cell: tiny client-specific label on top of value (handles mixed labels).
  const Cell = ({ k, value, label, sx, mono=false }) => (
    <Box sx={{ display:"flex", flexDirection:"column", minWidth:0, lineHeight: 1.15, ...sx }}>
      <Typography sx={{ fontSize: 10, color:T.fg4, lineHeight:1.1, fontWeight:500, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", textTransform:"uppercase", letterSpacing:"0.04em" }}>
        {label || schema[k]}
      </Typography>
      <Typography sx={{
        fontSize: 13, color:T.fg, fontWeight: mono ? 600 : 500, lineHeight: 1.3, mt: 0.2,
        fontVariantNumeric: mono ? "tabular-nums" : "normal",
        whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
      }}>
        {value !== undefined ? value : v[k]}
      </Typography>
    </Box>
  );

  return (
    <Stack direction="row" alignItems="flex-start" gap={1.5}
      onClick={() => onOpen && onOpen(row)}
      sx={{
        px:1.75, py: 1, minHeight: 58, cursor:"pointer",
        borderBottom: last ? 0 : `1px solid ${T.borderSoft}`,
        borderLeft: `3px solid ${tint.border}`,
        bgcolor: tint.bg,
        transition:"background 100ms",
        "&:hover": { bgcolor: tint.bgHover },
        position:"relative",
        minWidth,
      }}
    >
      {/* Reference */}
      <Box sx={{ width: 170, minWidth:0, display:"flex", alignItems:"flex-start", gap:0.75, pt:0.25 }}>
        <Cell k="ref" sx={{ flex:1, minWidth:0 }} mono/>
      </Box>

      {/* Schedule (delivery date for parity with screenshot) */}
      <Cell k="delivery" sx={{ width: 120, pt:0.25 }}/>

      {/* Destination only — no origin */}
      <Cell k="destination" sx={{ width: 200, pt:0.25 }}/>

      {/* Stage — text only, no progress bar */}
      <Cell k="stage" value={stageLabel} sx={{ width: 150, pt:0.25 }}/>

      {/* Status — dynamic value, but the field name itself isn't client-specific,
          so we skip the inline mini-label and rely on the column header. */}
      <Box sx={{ width: 130, pt:0.5 }}>
        <Box sx={{
          display:"inline-flex", alignItems:"center", gap:0.5,
          px:0.9, py:0.25, borderRadius:"4px",
          bgcolor:T.surface3, color:T.fg2, border:`1px solid ${T.border}`,
          fontSize:11.5, fontWeight:500, lineHeight:1.2, maxWidth:"100%",
        }}>
          <Box sx={{ width:5, height:5, borderRadius:999, bgcolor:T.fg4, flexShrink:0 }}/>
          <Box sx={{ whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
            {STATUS[row.status]}
          </Box>
        </Box>
      </Box>

      {/* Alerts + Notifications — stacked, each item carries its own icon
          color (warning for alerts, info for notifications). */}
      <Box sx={{ flex:1, minWidth: 220, pt: 0.2 }}>
        {(hasAlerts || hasNotifs) ? (
          <Stack gap={0.35}>
            {row.alerts.map((reason, idx) => (
              <AlertLine key={"a"+idx} reason={reason} tone="warning"/>
            ))}
            {row.notifications.map((reason, idx) => (
              <AlertLine key={"n"+idx} reason={reason} tone="info"/>
            ))}
          </Stack>
        ) : (
          <Typography sx={{ fontSize: 11.5, color: T.fg4, mt: 0.5 }}>—</Typography>
        )}
      </Box>

      {/* Row actions */}
      <Stack direction="row" gap={0.25} sx={{ width: 56, justifyContent:"flex-end", flexShrink:0, pt: 0.25 }}
        onClick={e => e.stopPropagation()}>
        <Tooltip title="Open detail" arrow disableInteractive><IconButton size="small"><I.Eye size={14}/></IconButton></Tooltip>
        <Tooltip title="More" arrow disableInteractive><IconButton size="small"><I.Dots size={14}/></IconButton></Tooltip>
      </Stack>
    </Stack>
  );
}

// Single alert / notification line — small leading icon + truncated text + tooltip on overflow.
function AlertLine({ reason, tone = "warning" }) {
  const color = tone === "info" ? T.info : T.warning;
  const Icon = tone === "info" ? I.Info : I.Alert;
  return (
    <Stack direction="row" alignItems="flex-start" gap={0.65} sx={{ minWidth: 0 }}>
      <Box sx={{ color, flexShrink: 0, display:"inline-flex", alignItems:"center", mt: 0.25 }}>
        <Icon size={12}/>
      </Box>
      <Tooltip title={reason} placement="top-start" arrow disableInteractive>
        <Typography sx={{
          fontSize: 11.5, color: T.fg, lineHeight: 1.3, fontWeight: 500,
          overflow:"hidden", display:"-webkit-box", WebkitBoxOrient:"vertical", WebkitLineClamp: 1, textOverflow:"ellipsis",
        }}>
          {reason}
        </Typography>
      </Tooltip>
    </Stack>
  );
}

// ─── KanbanView ──────────────────────────────────────────────────────────
function KanbanView({ rows, onOpen }) {
  // Build columns dynamically from rows. Each column = a stage index.
  // Header label uses the dominant client's label, with a multi-client
  // chip if mixed.
  const cols = useMemo(() => {
    return [0,1,2,3,4].map(stageIdx => {
      const stageRows = rows.filter(r => r.stageIdx === stageIdx);
      const clientCounts = {};
      stageRows.forEach(r => { clientCounts[r.clientKey] = (clientCounts[r.clientKey] || 0) + 1; });
      const clients = Object.keys(clientCounts);
      const dominant = clients.sort((a,b) => clientCounts[b] - clientCounts[a])[0] || "indemni";
      return {
        idx: stageIdx,
        label: STAGE_LABELS[dominant][stageIdx],
        clients,
        rows: stageRows,
      };
    });
  }, [rows]);

  return (
    <Box sx={{ display:"grid", gridTemplateColumns:"repeat(5, minmax(220px, 1fr))", gap:1, alignItems:"flex-start" }}>
      {cols.map(col => (
        <Box key={col.idx} sx={{
          bgcolor:T.surface2, border:`1px solid ${T.borderSoft}`, borderRadius:"8px",
          p:1, display:"flex", flexDirection:"column", gap:1, minHeight:400,
        }}>
          <Stack direction="row" alignItems="center" gap={0.75} sx={{ px:0.5 }}>
            <Box sx={{ width:16, height:16, borderRadius:"4px", bgcolor:T.accentSoft, color:T.accent,
              display:"inline-flex", alignItems:"center", justifyContent:"center",
              fontSize:10, fontWeight:600 }}>{col.idx + 1}</Box>
            <Box sx={{ flex:1, minWidth:0 }}>
              <Typography sx={{ fontSize:12, fontWeight:600, color:T.fg, lineHeight:1.2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                {col.label}
              </Typography>
              {col.clients.length > 1 && (
                <Typography sx={{ fontSize:9.5, color:T.fg4, lineHeight:1.1, mt:0.2 }}>
                  + {col.clients.length - 1} other label{col.clients.length > 2 ? "s" : ""}
                </Typography>
              )}
            </Box>
            <Box sx={{ fontSize:10, color:T.fg3, bgcolor:"#fff", borderRadius:999, px:1, fontWeight:500 }}>
              {col.rows.length}
            </Box>
          </Stack>

          <Stack gap={0.75}>
            {col.rows.slice(0, 6).map(r => <KanbanCard key={r.id} row={r} onOpen={onOpen}/>)}
            {col.rows.length > 6 && (
              <Box sx={{ fontSize:11, color:T.fg3, textAlign:"center", py:0.5, cursor:"pointer", "&:hover":{ color:T.accent } }}>
                + {col.rows.length - 6} more
              </Box>
            )}
            {col.rows.length === 0 && (
              <Box sx={{ fontSize:11, color:T.fg4, textAlign:"center", py:2, border:`1px dashed ${T.border}`, borderRadius:"6px", bgcolor:"#fff" }}>
                No transactions
              </Box>
            )}
          </Stack>
        </Box>
      ))}
    </Box>
  );
}

function KanbanCard({ row, onOpen }) {
  const schema = SCHEMAS[row.clientKey];
  const v = row.values;
  const hasAlerts = row.alerts && row.alerts.length > 0;
  const hasNotifs = row.notifications && row.notifications.length > 0;

  // Border color priority: alerts > notifications > default.
  const borderColor = hasAlerts ? T.warning : hasNotifs ? T.info : T.border;

  const Field = ({ k }) => (
    <Stack direction="row" justifyContent="space-between" alignItems="baseline" gap={1} sx={{ minWidth:0 }}>
      <Typography sx={{ fontSize:10, color:T.fg4, fontWeight:500, flexShrink:0, textTransform:"uppercase", letterSpacing:"0.04em" }}>
        {schema[k]}
      </Typography>
      <Typography sx={{ fontSize:12, color:T.fg, fontWeight:500, textAlign:"right", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", minWidth:0 }}>
        {v[k]}
      </Typography>
    </Stack>
  );

  return (
    <Box
      onClick={() => onOpen && onOpen(row)}
      sx={{
        bgcolor:"#fff", border:`1px solid ${borderColor}`,
        borderRadius:"8px", p:1.1, display:"flex", flexDirection:"column", gap:0.6,
        boxShadow: hasAlerts || hasNotifs ? "0 1px 2px rgba(15,23,42,.04)" : "0 1px 2px rgba(15,23,42,.03)",
        cursor:"pointer", transition:"all 100ms",
        "&:hover": { borderColor: borderColor === T.border ? T.borderStrong : borderColor, transform:"translateY(-1px)", boxShadow:"0 2px 6px rgba(15,23,42,.06)" },
      }}>
      {/* Header — dynamic ref label + ref value, with optional priority pill */}
      <Stack direction="row" alignItems="baseline" gap={0.75}>
        <Typography sx={{ fontSize:10, color:T.fg4, fontWeight:500, textTransform:"uppercase", letterSpacing:"0.04em" }}>
          {schema.ref}
        </Typography>
        <Box sx={{ flex:1 }}/>
        {row.priority && (
          <Box sx={{ fontSize:9, fontWeight:700, color: row.priority==="HVL" ? T.error : T.warning, bgcolor: row.priority==="HVL" ? T.errorBg : T.warningBg, px:0.5, borderRadius:"3px" }}>
            {row.priority.toUpperCase()}
          </Box>
        )}
      </Stack>
      <Typography sx={{ fontSize:15, fontWeight:600, color:T.fg, letterSpacing:"-0.01em", fontVariantNumeric:"tabular-nums", lineHeight:1.1, mt:-0.4 }}>
        {v.ref}
      </Typography>

      <Divider sx={{ my:0.3 }}/>

      <Stack gap={0.45}>
        <Field k="delivery"/>
        <Field k="destination"/>
      </Stack>

      {/* Alerts section — all reasons stacked; icon only on the heading */}
      {hasAlerts && (
        <Box sx={{ bgcolor: T.warningSoft || "#FDF7EC", borderRadius:"6px", p:0.85, mt:0.3 }}>
          <Stack direction="row" alignItems="center" gap={0.5} sx={{ mb:0.45 }}>
            <Box sx={{ color: T.warning, display:"inline-flex" }}><I.Alert size={12}/></Box>
            <Typography sx={{ fontSize:10, color:T.warning, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.04em" }}>
              {row.alerts.length === 1 ? "Alert" : `${row.alerts.length} Alerts`}
            </Typography>
          </Stack>
          <Stack component="ul" gap={0.3} sx={{ pl: 1.75, my: 0, "& li::marker": { color: T.warning } }}>
            {row.alerts.map((reason, idx) => (
              <Box key={idx} component="li" sx={{ fontSize:11.5, color:T.fg, lineHeight:1.35, fontWeight:500 }}>
                {reason}
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      {/* Notifications section — info icon + blue treatment */}
      {hasNotifs && (
        <Box sx={{ bgcolor: T.infoSoft || "#F1F6FE", borderRadius:"6px", p:0.85, mt: hasAlerts ? 0 : 0.3 }}>
          <Stack direction="row" alignItems="center" gap={0.5} sx={{ mb:0.45 }}>
            <Box sx={{ color: T.info, display:"inline-flex" }}><I.Info size={12}/></Box>
            <Typography sx={{ fontSize:10, color:T.info, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.04em" }}>
              {row.notifications.length === 1 ? "Update" : `${row.notifications.length} Updates`}
            </Typography>
          </Stack>
          <Stack component="ul" gap={0.3} sx={{ pl: 1.75, my: 0, "& li::marker": { color: T.info } }}>
            {row.notifications.map((reason, idx) => (
              <Box key={idx} component="li" sx={{ fontSize:11.5, color:T.fg, lineHeight:1.35, fontWeight:500 }}>
                {reason}
              </Box>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
}

// ─── Alerts Drawer (Missed Calls + Unread Chats) ─────────────────────────
function AlertsDrawer({ open, onClose }) {
  const [tab, setTab] = useState(0);
  const { missedCalls, unreadChats } = window.CRANE_ALERTS;

  return (
    <Drawer anchor="right" open={open} onClose={onClose}
      PaperProps={{ sx: { width: 380 } }}
    >
      <Stack direction="row" alignItems="center" sx={{ px:2, py:1.25, borderBottom:`1px solid ${T.borderSoft}` }}>
        <Typography sx={{ fontSize:14, fontWeight:600 }}>Alerts & Messages</Typography>
        <Box sx={{ flex:1 }}/>
        <Button size="small" variant="text" sx={{ color:T.fg2, fontSize:12 }}>Mark all read</Button>
        <IconButton size="small" onClick={onClose}><I.Close size={16}/></IconButton>
      </Stack>

      <Tabs value={tab} onChange={(_,v)=>setTab(v)} variant="fullWidth">
        <Tab label={
          <Stack direction="row" gap={0.75} alignItems="center">
            <I.PhoneMissed size={14}/>
            <span>Missed Calls</span>
            <Box sx={{ fontSize:10, fontWeight:600, bgcolor:T.error, color:"#fff", px:0.75, borderRadius:999, minWidth:18, textAlign:"center" }}>{missedCalls.length}</Box>
          </Stack>
        }/>
        <Tab label={
          <Stack direction="row" gap={0.75} alignItems="center">
            <I.Chat size={14}/>
            <span>Unread Chats</span>
            <Box sx={{ fontSize:10, fontWeight:600, bgcolor:T.accent, color:"#fff", px:0.75, borderRadius:999, minWidth:18, textAlign:"center" }}>
              {unreadChats.reduce((s,c)=>s+c.unread,0)}
            </Box>
          </Stack>
        }/>
      </Tabs>

      <Box sx={{ flex:1, overflow:"auto" }}>
        {tab === 0 && (
          <Stack divider={<Divider/>}>
            {missedCalls.map(c => (
              <Stack key={c.id} direction="row" alignItems="center" gap={1.25} sx={{ p:1.5, cursor:"pointer", "&:hover": { bgcolor: T.surface2 } }}>
                <Box sx={{ position:"relative" }}>
                  <Avatar sx={{ width:32, height:32, bgcolor: c.priority==="high" ? T.errorBg : T.surface3, color: c.priority==="high" ? T.error : T.fg2 }}>
                    {c.driver.split(" ").map(s=>s[0]).join("").slice(0,2)}
                  </Avatar>
                  <Box sx={{ position:"absolute", bottom:-2, right:-2, bgcolor:T.error, borderRadius:999, width:14, height:14, display:"inline-flex", alignItems:"center", justifyContent:"center", border:"2px solid #fff" }}>
                    <I.PhoneMissed size={8} color="#fff"/>
                  </Box>
                </Box>
                <Box sx={{ flex:1, minWidth:0 }}>
                  <Stack direction="row" alignItems="baseline" gap={0.75}>
                    <Typography sx={{ fontSize:13, fontWeight:600, color:T.fg }}>{c.driver}</Typography>
                    {c.priority === "high" && <StatusPill tone="error">High</StatusPill>}
                  </Stack>
                  <Stack direction="row" gap={0.75} alignItems="center" sx={{ mt:0.3 }}>
                    <Typography sx={{ fontSize:11.5, color:T.fg3 }}>Shipment {c.shipment}</Typography>
                    <Box sx={{ width:3, height:3, bgcolor:T.fg5, borderRadius:999 }}/>
                    <Typography sx={{ fontSize:11.5, color:T.fg3 }}>{c.duration}</Typography>
                    <Box sx={{ width:3, height:3, bgcolor:T.fg5, borderRadius:999 }}/>
                    <Typography sx={{ fontSize:11.5, color:T.fg3 }}>{c.time}</Typography>
                  </Stack>
                </Box>
                <Stack direction="row" gap={0.5}>
                  <Tooltip title="Call back"><IconButton size="small" sx={{ color:T.success }}><I.Phone size={14}/></IconButton></Tooltip>
                  <Tooltip title="Open chat"><IconButton size="small"><I.Chat size={14}/></IconButton></Tooltip>
                </Stack>
              </Stack>
            ))}
          </Stack>
        )}

        {tab === 1 && (
          <Stack divider={<Divider/>}>
            {unreadChats.map(c => (
              <Stack key={c.id} direction="row" alignItems="flex-start" gap={1.25} sx={{ p:1.5, cursor:"pointer", "&:hover": { bgcolor: T.surface2 } }}>
                <Avatar sx={{ width:32, height:32, bgcolor:T.accentSoft, color:T.accent }}>
                  {c.driver.split(" ").map(s=>s[0]).join("").slice(0,2)}
                </Avatar>
                <Box sx={{ flex:1, minWidth:0 }}>
                  <Stack direction="row" alignItems="baseline" gap={0.75}>
                    <Typography sx={{ fontSize:13, fontWeight:600, color:T.fg }}>{c.driver}</Typography>
                    <Box sx={{ flex:1 }}/>
                    <Typography sx={{ fontSize:10.5, color:T.fg3 }}>{c.time}</Typography>
                  </Stack>
                  <Typography sx={{ fontSize:11.5, color:T.fg3, mt:0.15 }}>Shipment {c.shipment}</Typography>
                  <Typography sx={{ fontSize:12, color:T.fg2, mt:0.4, lineHeight:1.35, overflow:"hidden", display:"-webkit-box", WebkitBoxOrient:"vertical", WebkitLineClamp:2 }}>
                    {c.preview}
                  </Typography>
                </Box>
                <Box sx={{ fontSize:10, fontWeight:600, bgcolor:T.accent, color:"#fff", px:0.75, py:"1px", borderRadius:999, minWidth:18, textAlign:"center" }}>
                  {c.unread}
                </Box>
              </Stack>
            ))}
          </Stack>
        )}
      </Box>

      <Stack direction="row" gap={1} sx={{ p:1.5, borderTop:`1px solid ${T.borderSoft}` }}>
        <Button variant="outlined" color="primary" fullWidth size="small" sx={{ minHeight:30 }}>
          View All in Alerts Inbox
        </Button>
      </Stack>
    </Drawer>
  );
}

window.ListView = ListView;
window.KanbanView = KanbanView;
window.AlertsDrawer = AlertsDrawer;
window.__craneReady = { ...(window.__craneReady||{}), views: true };
window.dispatchEvent(new Event("crane:views"));
