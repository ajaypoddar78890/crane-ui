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

// Label placement depends on the client filter. With one client selected
// every row shares the same field names, so the labels are lifted into a
// single header row. With "All clients" the names differ row by row, so the
// header is dropped and each cell carries its own label instead.

function ListView({ rows, onOpen, clientKey = "all" }) {
  // Single density only (cozy ~58px min). Rows can grow to fit alert lists.
  const MIN_W = 1210;
  const schema = clientKey !== "all" ? SCHEMAS[clientKey] : null;

  return (
    <Box sx={{
      bgcolor:"#fff", border:`1px solid ${T.border}`, borderRadius:"8px",
      overflow:"hidden", boxShadow:"0 1px 2px rgba(15,23,42,.03)",
    }}>
     <Box sx={{ overflowX:"auto" }}>
      {/* Header carries the selected client's own field names. */}
      {schema && (
        <Stack direction="row" alignItems="center" gap={1.5} sx={{
          px:1.75, py:0.7, bgcolor:T.surface2, borderBottom:`1px solid ${T.border}`,
          borderLeft:"3px solid transparent",
          fontSize:10, color:T.fg3, fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase",
          minWidth: MIN_W,
        }}>
          <Box sx={{ width: 170 }}>{schema.ref}</Box>
          <Box sx={{ width: 120 }}>{schema.delivery}</Box>
          <Box sx={{ width: 200 }}>{schema.destination}</Box>
          <Box sx={{ width: 150 }}>{schema.stage}</Box>
          <Box sx={{ width: 130 }}>Status</Box>
          <Box sx={{ width: 130 }}>{schema.updatedBy}</Box>
          <Box sx={{ flex:1, minWidth: 220 }}>Alerts & Updates</Box>
          <Box sx={{ width: 56 }}/>
        </Stack>
      )}

      {rows.map((r, i) => (
        <ListRow
          key={r.id} row={r}
          minWidth={MIN_W}
          onOpen={onOpen}
          last={i === rows.length-1}
          showLabels={!schema}
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

function ListRow({ row, minWidth=1210, onOpen, last, showLabels=true }) {
  const schema = SCHEMAS[row.clientKey];
  const v = row.values;
  const stageLabel = STAGE_LABELS[row.clientKey][row.stageIdx];
  const hasAlerts = row.alerts && row.alerts.length > 0;
  const hasNotifs = row.notifications && row.notifications.length > 0;

  // Row edge priority: alerts (red, matching the board card) > notifications
  // (info blue) > none. Alert rows carry no fill — the red edge is the signal.
  const tint = hasAlerts
    ? { border: T.error,          bg: "transparent", bgHover: T.rowHover }
    : hasNotifs
    ? { border: T.info,           bg: "#F1F6FE", bgHover: T.rowHover }
    : { border: "transparent",    bg: "transparent", bgHover: T.rowHover };

  // Field cell: tiny client-specific label on top of value (handles mixed labels).
  const Cell = ({ k, value, label, sx, mono=false, wrap=false }) => (
    <Box sx={{ display:"flex", flexDirection:"column", minWidth:0, lineHeight: 1.15, ...sx }}>
      {showLabels && (
        <Typography sx={{ fontSize: 10, color:T.fg4, lineHeight:1.1, fontWeight:500, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", textTransform:"uppercase", letterSpacing:"0.04em" }}>
          {label || schema[k]}
        </Typography>
      )}
      <Typography sx={{
        fontSize: 13, color:T.fg, fontWeight: mono ? 600 : 500, lineHeight: 1.3, mt: 0.2,
        fontVariantNumeric: mono ? "tabular-nums" : "normal",
        ...(wrap
          ? { whiteSpace:"normal", wordBreak:"break-word" }
          : { whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }),
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
        transition:"background 180ms ease",
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

      {/* Who touched the record last */}
      <Cell k="updatedBy" sx={{ width: 130, pt:0.25 }} wrap/>

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
// The board renders the REAL production board (window.CRANE_BOARD), not the
// generated TRANSACTIONS mock. `rows` is accepted for signature parity with
// ListView but deliberately unused — the live board carries its own columns,
// counts and card payloads.
function KanbanView({ rows, onOpen }) {
  const { COLUMNS, CARDS } = window.CRANE_BOARD;

  const cols = useMemo(() => COLUMNS.map((c, i) => ({
    ...c, idx: i, cards: CARDS.filter(card => card.col === i),
  })), [COLUMNS, CARDS]);

  return (
    <Box sx={{
      display:"grid",
      gridTemplateColumns:`repeat(${cols.length}, minmax(236px, 1fr))`,
      gap:1.25, alignItems:"stretch",
      flex:1, minHeight:360,
    }}>
      {cols.map(col => <KanbanColumn key={col.key} col={col} onOpen={onOpen}/>)}
    </Box>
  );
}

function KanbanColumn({ col, onOpen }) {
  const hidden = Math.max(0, col.count - col.cards.length);

  return (
    <Stack gap={0.75} sx={{ minWidth:0, height:"100%" }}>
      {/* Column body — a discrete panel holding header + its own card track */}
      <Box sx={{
        bgcolor:"#fff", border:`1px solid ${T.border}`,
        borderRadius:"10px", p:0.75, display:"flex", flexDirection:"column", gap:0.75,
        minWidth:0, flex:1, minHeight:0,
      }}>

      {/* Column header — label + alert count + total count pill */}
      <Stack direction="row" alignItems="center" gap={0.75} sx={{
        bgcolor:"#fff", border:`1px solid ${T.border}`,
        borderTop:`2px solid ${T.boardGreen}`,
        borderRadius:"6px", px:1, py:0.85, minHeight:34,
      }}>
        <Tooltip title={col.label} placement="top-start" arrow disableInteractive>
          <Typography sx={{
            flex:1, minWidth:0, fontSize:11.5, fontWeight:700, color:T.fg,
            textTransform:"uppercase", letterSpacing:"0.01em",
            whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
          }}>{col.label}</Typography>
        </Tooltip>
        {col.alertCount > 0 && (
          <Stack direction="row" alignItems="center" gap={0.3} sx={{
            height:20, px:0.6, borderRadius:"5px", flexShrink:0,
            bgcolor:T.alertBadgeBg, color:T.alertBadgeFg,
            border:`1px solid ${T.alertLine}`,
            fontSize:11, fontWeight:700, fontVariantNumeric:"tabular-nums",
          }}>
            <I.AlertTri size={11}/><span>{col.alertCount}</span>
          </Stack>
        )}
        <Box sx={{
          bgcolor:T.boardGreen, color:"#fff", fontSize:11, fontWeight:700,
          borderRadius:"5px", px:0.8, py:"1px", minWidth:24, textAlign:"center",
          fontVariantNumeric:"tabular-nums", flexShrink:0,
        }}>{col.count}</Box>
      </Stack>

      {/* Cards — each column scrolls on its own, like the live board */}
      <Stack gap={1} sx={{
        minWidth:0, flex:1, minHeight:0,
        overflowY:"auto", overflowX:"hidden", pr:0.25,
        "&::-webkit-scrollbar": { width:6 },
        "&::-webkit-scrollbar-thumb": { bgcolor:T.borderStrong, borderRadius:999 },
        "&::-webkit-scrollbar-track": { bgcolor:"transparent" },
      }}>
        {col.cards.map(c => <KanbanCard key={c.id} card={c} onOpen={onOpen}/>)}

        {col.cards.length === 0 && (
          <Box sx={{
            fontSize:11, color:T.fg4, textAlign:"center", py:2.5,
            border:`1px dashed ${T.border}`, borderRadius:"8px", bgcolor:"#fff",
          }}>No transactions</Box>
        )}

        {hidden > 0 && col.cards.length > 0 && (
          <Box role="button" sx={{
            fontSize:11, color:T.fg3, textAlign:"center", py:0.75, cursor:"pointer",
            "&:hover": { color:T.accent },
          }}>+ {hidden.toLocaleString()} more</Box>
        )}
      </Stack>
      </Box>
    </Stack>
  );
}

// Alert reasons, notification reasons and AI matches share one scroll region
// inside the card, so they can never push the card's own fields off the
// bottom of the column. The card's basic info always stays visible below it.
const CARD_SCROLL = {
  maxHeight: 164, overflowY: "auto", overflowX: "hidden", pr: 0.5,
  "&::-webkit-scrollbar": { width: 5 },
  "&::-webkit-scrollbar-thumb": { bgcolor: T.borderStrong, borderRadius: 999 },
  "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
};

// Alert / notification count badge that sits on the card title row.
function CountBadge({ tone, count }) {
  const isAlert = tone === "alert";
  return (
    <Box sx={{ position:"relative", flexShrink:0, mt:0.1 }}>
      <Box sx={{
        width:20, height:20, borderRadius:"5px",
        bgcolor: isAlert ? T.alertBadgeBg : T.notifBadgeBg,
        color:   isAlert ? T.alertBadgeFg : T.notifBadgeFg,
        display:"inline-flex", alignItems:"center", justifyContent:"center",
      }}>
        {isAlert ? <I.AlertTri size={13}/> : <I.BellFill size={13}/>}
      </Box>
      {count > 0 && (
        <Box sx={{
          position:"absolute", top:-6, right:-6, minWidth:15, height:15, px:"2px",
          borderRadius:999, border:"1.5px solid #fff",
          bgcolor: isAlert ? T.alertLine : T.notifBadgeFg, color:"#fff",
          fontSize:9, fontWeight:700, lineHeight:1,
          display:"inline-flex", alignItems:"center", justifyContent:"center",
          fontVariantNumeric:"tabular-nums",
        }}>{count}</Box>
      )}
    </Box>
  );
}

// Numbered reason panel. Alerts render unboxed — the card's own red outline
// carries the signal; notifications keep the mint fill the live board uses.
// The acknowledge tick sits in the bottom-right corner.
function ReasonPanel({ tone, title, items }) {
  const isAlert = tone === "alert";
  const bg   = isAlert ? "transparent"  : T.notifPanelBg;
  const fg   = isAlert ? T.fg2          : T.notifPanelFg;
  const head = isAlert ? T.fg2          : T.notifHeadFg;

  return (
    <Box sx={{ position:"relative", bgcolor:bg, borderRadius:"6px", px:1, pt:0.75, pb:2.4 }}>
      <Stack direction="row" alignItems="center" gap={0.5} sx={{ mb:0.5 }}>
        <Box sx={{ color:head, display:"inline-flex" }}>
          {isAlert ? <I.AlertTri size={11}/> : <I.BellFill size={11}/>}
        </Box>
        <Typography sx={{
          fontSize:10, fontWeight:700, color:head,
          textTransform:"uppercase", letterSpacing:"0.05em",
        }}>{title}</Typography>
      </Stack>

      <Stack gap={0.3}>
        {items.map((t, i) => (
          <Stack key={i} direction="row" gap={0.5} sx={{ minWidth:0 }}>
            <Typography sx={{
              fontSize:11, color:fg, lineHeight:1.35, fontWeight:600,
              flexShrink:0, fontVariantNumeric:"tabular-nums",
            }}>{i + 1}.</Typography>
            <Typography sx={{ fontSize:11, color:fg, lineHeight:1.35, fontWeight:500, minWidth:0 }}>
              {t}
            </Typography>
          </Stack>
        ))}
      </Stack>

      <Tooltip title="Acknowledge" arrow disableInteractive>
        <Box role="button" onClick={e => e.stopPropagation()} sx={{
          position:"absolute", right:6, bottom:6, width:17, height:17,
          borderRadius:999, bgcolor:T.ackGreen, color:"#fff",
          display:"inline-flex", alignItems:"center", justifyContent:"center",
          cursor:"pointer", "&:hover": { filter:"brightness(1.1)" },
        }}><I.Tick size={11} strokeWidth={2.6}/></Box>
      </Tooltip>
    </Box>
  );
}

// AI document-match panel.
function AiPanel({ items, more }) {
  return (
    <Box sx={{ bgcolor:T.aiPanelBg, borderRadius:"6px", px:1, py:0.75 }}>
      <Typography sx={{
        fontSize:10, fontWeight:700, color:T.aiPanelFg, mb:0.45,
        textTransform:"uppercase", letterSpacing:"0.05em",
      }}>AI Detection</Typography>

      <Stack gap={0.3}>
        {items.map((t, i) => (
          <Stack key={i} direction="row" alignItems="center" gap={0.6} sx={{ minWidth:0 }}>
            <Box sx={{ width:5, height:5, borderRadius:999, bgcolor:T.ackGreen, flexShrink:0 }}/>
            <Tooltip title={`Match — ${t}`} placement="top-start" arrow disableInteractive>
              <Typography sx={{
                fontSize:11, color:T.fg2, lineHeight:1.3, fontWeight:500, minWidth:0,
                whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
              }}>Match — {t}</Typography>
            </Tooltip>
          </Stack>
        ))}
      </Stack>

      {more > 0 && (
        <Typography sx={{ fontSize:10.5, color:T.fg4, mt:0.45, ml:1.4 }}>+{more} more</Typography>
      )}
    </Box>
  );
}

// Two-up label/value row at the foot of a card.
function CardFieldPair({ a, b }) {
  const Cell = ({ label, value }) => (
    <Box sx={{ minWidth:0 }}>
      <Typography sx={{
        fontSize:9, color:T.fg4, fontWeight:600, lineHeight:1.2,
        textTransform:"uppercase", letterSpacing:"0.05em",
      }}>{label}</Typography>
      <Typography sx={{ fontSize:11.5, color:T.fg, fontWeight:500, lineHeight:1.3, mt:0.15 }}>
        {value || "—"}
      </Typography>
    </Box>
  );
  return (
    <Box sx={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:1, minWidth:0 }}>
      <Cell {...a}/>{b ? <Cell {...b}/> : <Box/>}
    </Box>
  );
}

function KanbanCard({ card, onOpen }) {
  const hasAlerts = card.alerts.length > 0;
  const hasNotifs = card.notifications.length > 0;
  const hasAi     = card.ai.length > 0;

  // Alert cards are outlined in red all round; notification-only cards keep
  // the green left edge; everything else is a plain card.
  const edge = !hasAlerts && hasNotifs ? T.notifLine : null;

  return (
    <Box
      onClick={() => onOpen && onOpen(card)}
      sx={{
        bgcolor:"#fff",
        border: hasAlerts ? `2px solid ${T.error}` : `1px solid ${T.border}`,
        ...(edge ? { borderLeft:`3px solid ${edge}` } : null),
        borderRadius:"8px",
        p:1, display:"flex", flexDirection:"column", gap:0.75,
        boxShadow:"0 1px 2px rgba(15,23,42,.04)", cursor:"pointer",
        transition:"box-shadow 110ms, transform 110ms",
        "&:hover": { boxShadow:"0 2px 8px rgba(15,23,42,.08)", transform:"translateY(-1px)" },
      }}>

      {/* Title · copy · badge */}
      <Stack direction="row" alignItems="flex-start" gap={0.75}>
        <Box sx={{ flex:1, minWidth:0 }}>
          <Typography sx={{
            fontSize:12.5, fontWeight:700, color:T.fg, lineHeight:1.2,
            letterSpacing:"-0.004em",
            whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
          }}>{card.title}</Typography>
          {card.parent && (
            <Typography sx={{ fontSize:10, color:T.fg4, lineHeight:1.3, mt:0.3, letterSpacing:"0.03em" }}>
              PARENT:{" "}
              <Box component="span" sx={{ color:T.fg2, fontWeight:600 }}>{card.parent}</Box>
            </Typography>
          )}
        </Box>

        <Tooltip title="Copy reference" arrow disableInteractive>
          <Box role="button" onClick={e => e.stopPropagation()} sx={{
            color:T.fg5, display:"inline-flex", flexShrink:0, mt:0.15,
            cursor:"pointer", "&:hover": { color:T.fg3 },
          }}><I.Copy size={13}/></Box>
        </Tooltip>

        {hasAlerts && <CountBadge tone="alert" count={card.alertCount}/>}
        {!hasAlerts && hasNotifs && <CountBadge tone="notif" count={card.notifCount}/>}
      </Stack>

      {(hasAlerts || hasNotifs || hasAi) && (
        <Stack gap={0.75} sx={{ minWidth:0, ...CARD_SCROLL }}>
          {hasAlerts && <ReasonPanel tone="alert" title="Alert Reasons"        items={card.alerts}/>}
          {hasNotifs && <ReasonPanel tone="notif" title="Notification Reasons" items={card.notifications}/>}
          {hasAi     && <AiPanel items={card.ai} more={card.aiMore}/>}
        </Stack>
      )}

      {/* Basic info — present on every card, never scrolled away */}
      <CardFieldPair
        a={{ label:"Delivery Date", value:card.deliveryDate }}
        b={{ label:"Status",        value:card.status }}
      />
      <CardFieldPair
        a={{ label:"Activity",        value:card.activity }}
        b={{ label:"Last Updated At", value:card.updatedAt }}
      />
      <CardFieldPair a={{ label:"Last Updated By", value:card.updatedBy }}/>
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
