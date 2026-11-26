// components-detail.jsx — Transaction Detail page (clicked from list/kanban)
// Layout: header → progress tracker → (map 1/3 + assets 2/3) → alerts/updates → activity sections.
import React, { useState, useMemo } from "react";
import {
  Box, Stack, Typography, Button, IconButton, Tooltip, Chip, Avatar,
  Divider, TextField, InputAdornment, Menu, MenuItem,
} from "@mui/material";

await new Promise(r => {
  if (window.__craneReady?.views) return r();
  window.addEventListener("crane:views", () => r(), { once: true });
});

const T = window.CRANE_TOKENS;
const I = window.I;
const SCHEMAS = window.CRANE_DATA.CLIENT_SCHEMAS;
const STAGE_LABELS = window.CRANE_DATA.STAGE_LABELS;
const STATUS = window.CRANE_DATA.STATUS_LABEL;

// ─── Header strip (replaces Topbar in detail mode) ───────────────────────
function DetailHeader({ tx, onBack }) {
  const schema = SCHEMAS[tx.clientKey];
  const v = tx.values;
  return (
    <Stack sx={{ borderBottom:`1px solid ${T.border}`, bgcolor:"#fff" }}>
      <Stack direction="row" alignItems="center" gap={2} sx={{ px:2, py:1.25, minHeight:56 }}>
        <Tooltip title="Back to Transactions" arrow disableInteractive>
          <IconButton size="small" onClick={onBack}><I.ChevronL size={18}/></IconButton>
        </Tooltip>

        <Stack direction="row" alignItems="center" gap={1}>
          <Typography sx={{ fontSize:13, color:T.fg3, fontWeight:500 }}>{schema.ref}:</Typography>
          <Box sx={{
            fontSize:14, fontWeight:600, color:T.fg, bgcolor:T.surface2,
            border:`1px solid ${T.border}`, px:1.1, py:0.35, borderRadius:"5px",
            fontVariantNumeric:"tabular-nums",
          }}>{v.ref}</Box>
          {tx.priority && (
            <Box sx={{ fontSize:9, fontWeight:700,
              color: tx.priority==="HVL" ? T.error : T.warning,
              bgcolor: tx.priority==="HVL" ? T.errorBg : T.warningBg,
              px:0.6, py:0.25, borderRadius:"3px",
            }}>{tx.priority.toUpperCase()}</Box>
          )}
        </Stack>

        <Divider orientation="vertical" flexItem sx={{ my:0.5 }}/>

        <MetaItem icon={<I.Pin size={14}/>}  label={schema.destination} value={v.destination}/>
        <MetaItem icon={<I.Calendar size={14}/>} label={schema.delivery} value={v.delivery}/>
        <MetaItem icon={<I.Check size={14}/>} label="Activity Status" value={v.activity}/>

        <Box sx={{ flex:1 }}/>

        <Stack direction="row" gap={0.25}>
          <Tooltip title="Gallery"    arrow disableInteractive><IconButton size="small"><I.Box1 size={17}/></IconButton></Tooltip>
          <Tooltip title="Full screen" arrow disableInteractive><IconButton size="small"><I.Expand size={17}/></IconButton></Tooltip>
          <Tooltip title="Refresh"    arrow disableInteractive><IconButton size="small"><I.Refresh size={17}/></IconButton></Tooltip>
          <Tooltip title="Call driver" arrow disableInteractive><IconButton size="small"><I.Phone size={17}/></IconButton></Tooltip>
          <Tooltip title="Video call" arrow disableInteractive><IconButton size="small"><I.Video size={17}/></IconButton></Tooltip>
          <Tooltip title="Chat"       arrow disableInteractive><IconButton size="small"><I.Chat size={17}/></IconButton></Tooltip>
        </Stack>
      </Stack>
    </Stack>
  );
}

function MetaItem({ icon, label, value }) {
  return (
    <Stack direction="row" alignItems="center" gap={0.85} sx={{ minWidth:0 }}>
      <Box sx={{ color:T.fg3, display:"inline-flex" }}>{icon}</Box>
      <Box sx={{ minWidth:0 }}>
        <Typography sx={{ fontSize:10, color:T.fg3, fontWeight:500, lineHeight:1.1, textTransform:"uppercase", letterSpacing:"0.04em" }}>{label}</Typography>
        <Typography sx={{ fontSize:12.5, color:T.fg, fontWeight:500, lineHeight:1.25, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:240 }}>{value}</Typography>
      </Box>
    </Stack>
  );
}

// ─── Progress Tracker (compact strip — sits directly below the header) ──
function ProgressTracker({ tx }) {
  const stages = STAGE_LABELS[tx.clientKey];
  const cur = tx.stageIdx;
  return (
    <Box sx={{
      bgcolor:"#fff", borderBottom:`1px solid ${T.border}`,
      px:2.5, height:40, display:"flex", alignItems:"center", gap:0,
    }}>
      {stages.map((s, i) => {
        const state = i < cur ? "done" : i === cur ? "active" : "future";
        const dotColor = state === "future" ? T.fg5 : T.accent;
        const connColor = i < cur ? T.accent : T.borderStrong;
        return (
          <React.Fragment key={i}>
            <Stack direction="row" alignItems="center" gap={0.85}>
              <Box sx={{
                width: state === "active" ? 12 : 9,
                height: state === "active" ? 12 : 9,
                borderRadius:999,
                bgcolor: dotColor,
                boxShadow: state === "active" ? `0 0 0 3px ${T.accentRing}` : "none",
                display:"inline-flex", alignItems:"center", justifyContent:"center",
                color:"#fff", flexShrink:0,
              }}>
                {state === "done" && <I.Check size={6} strokeWidth={3}/>}
              </Box>
              <Typography sx={{
                fontSize:11.5, lineHeight:1.1, whiteSpace:"nowrap",
                color: state === "future" ? T.fg4 : T.fg2,
                fontWeight: state === "active" ? 600 : 500,
              }}>{s}</Typography>
            </Stack>
            {i < stages.length - 1 && (
              <Box sx={{ flex:1, height:2, mx:1.25, borderRadius:1, bgcolor: connColor }}/>
            )}
          </React.Fragment>
        );
      })}
    </Box>
  );
}

// ─── Live Tracking + Assets + Activity row (3 columns) ──────────────────
function TopRow({ tx }) {
  return (
    <Box sx={{ display:"grid", gridTemplateColumns:"minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)", gap:1.5, mb:1.5, height: 350 }}>
      <LiveTrackingCard tx={tx}/>
      <AssetsCard tx={tx}/>
      <ActivityFeed tx={tx}/>
    </Box>
  );
}

function LiveTrackingCard({ tx }) {
  const d = tx.driver;
  return (
    <Box sx={{ bgcolor:"#fff", border:`1px solid ${T.border}`, borderRadius:"10px", overflow:"hidden", display:"flex", flexDirection:"column", height:"100%" }}>
      <Stack direction="row" alignItems="center" gap={1} sx={{ px:1.5, py:0.85, borderBottom:`1px solid ${T.borderSoft}`, minHeight:40 }}>
        <I.Pin size={14} color={T.fg3}/>
        <Typography sx={{ fontSize:13, fontWeight:600, color:T.fg }}>Live Tracking</Typography>
        <Box sx={{ flex:1 }}/>
        <Typography sx={{ fontSize:10.5, color:T.fg4 }}>6s ago</Typography>
        <IconButton size="small" sx={{ p:0.25 }}><I.Refresh size={13}/></IconButton>
      </Stack>

      {/* Map fills available space */}
      <Box sx={{ position:"relative", flex:1, minHeight:0, bgcolor:"#EEF2F7", overflow:"hidden" }}>
        <MapPlaceholder onRoute={d.onRoute}/>
      </Box>

      {/* Slim driver strip — just name, vehicle, status. No stats. */}
      <Stack direction="row" alignItems="center" gap={1} sx={{ borderTop:`1px solid ${T.borderSoft}`, p:1 }}>
        <Avatar sx={{ width:26, height:26, bgcolor: d.onRoute ? T.accentSoft : T.warningBg, color: d.onRoute ? T.accent : T.warning, fontSize:10 }}>
          {d.name.split(" ").map(s=>s[0]).join("").slice(0,2)}
        </Avatar>
        <Box sx={{ flex:1, minWidth:0 }}>
          <Typography sx={{ fontSize:12, fontWeight:600, color:T.fg, lineHeight:1.2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{d.name}</Typography>
          <Typography sx={{ fontSize:10.5, color:T.fg3, lineHeight:1.2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{d.vehicle}</Typography>
        </Box>
        <Box sx={{
          display:"inline-flex", alignItems:"center", gap:0.4,
          px:0.75, py:0.25, borderRadius:"999px",
          bgcolor: d.onRoute ? T.successBg : T.warningBg,
          color: d.onRoute ? T.success : T.warning,
          fontSize:10, fontWeight:600,
        }}>
          <Box sx={{ width:5, height:5, borderRadius:999, bgcolor: d.onRoute ? T.success : T.warning }}/>
          {d.onRoute ? "On Route" : "Delayed"}
        </Box>
      </Stack>
    </Box>
  );
}

// SVG map placeholder with grid + curving route + pins
function MapPlaceholder({ onRoute=true }) {
  return (
    <svg width="100%" height="100%" viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" style={{ display:"block" }}>
      <defs>
        <pattern id="mapGrid" width="22" height="22" patternUnits="userSpaceOnUse">
          <path d="M 22 0 L 0 0 0 22" fill="none" stroke="#D8DFE7" strokeWidth="0.6"/>
        </pattern>
        <linearGradient id="water" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#D8E4F2"/>
          <stop offset="100%" stopColor="#C7D7EB"/>
        </linearGradient>
      </defs>
      <rect width="400" height="260" fill="#F2F5F9"/>
      <rect width="400" height="260" fill="url(#mapGrid)"/>
      {/* Faux roads */}
      <path d="M 0 90 C 80 110 160 60 240 100 S 380 130 400 110" stroke="#E5EAF1" strokeWidth="8" fill="none"/>
      <path d="M 0 170 C 100 160 200 200 320 175 S 400 160 400 170" stroke="#E5EAF1" strokeWidth="6" fill="none"/>
      <path d="M 80 0 C 100 80 120 160 140 260" stroke="#E5EAF1" strokeWidth="5" fill="none"/>
      <path d="M 280 0 C 290 80 270 180 290 260" stroke="#E5EAF1" strokeWidth="5" fill="none"/>
      {/* Water shape */}
      <path d="M 320 0 C 360 50 380 80 400 100 L 400 0 Z" fill="url(#water)"/>
      <path d="M 0 230 C 80 240 200 260 400 240 L 400 260 L 0 260 Z" fill="url(#water)" opacity="0.6"/>
      {/* Route */}
      <path
        d="M 60 200 C 120 160 180 120 240 100 S 320 60 340 50"
        stroke="#1957FF" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="0"
      />
      {/* Origin pin */}
      <g transform="translate(60, 200)">
        <circle r="10" fill="#01803E" stroke="#fff" strokeWidth="2.5"/>
        <text x="0" y="3.5" fontSize="10" fontWeight="700" fill="#fff" textAnchor="middle">A</text>
      </g>
      {/* Destination pin */}
      <g transform="translate(340, 50)">
        <circle r="10" fill="#D63A3A" stroke="#fff" strokeWidth="2.5"/>
        <text x="0" y="3.5" fontSize="10" fontWeight="700" fill="#fff" textAnchor="middle">B</text>
      </g>
      {/* Driver location */}
      <g transform="translate(220, 110)">
        <circle r="14" fill={onRoute ? "rgba(25,87,255,0.18)" : "rgba(215,122,26,0.18)"}/>
        <circle r="9"  fill={onRoute ? "#1957FF" : "#D77A1A"} stroke="#fff" strokeWidth="2.5"/>
        <path d="M -3 -1 L 0 -4 L 3 -1 L 3 3 L -3 3 Z" fill="#fff"/>
      </g>
    </svg>
  );
}

// ─── Assets card ─────────────────────────────────────────────────────────
function AssetsCard({ tx }) {
  return (
    <Box sx={{ bgcolor:"#fff", border:`1px solid ${T.border}`, borderRadius:"10px", overflow:"hidden", display:"flex", flexDirection:"column", height:"100%" }}>
      <Stack direction="row" alignItems="center" gap={1} sx={{ px:1.5, py:0.85, borderBottom:`1px solid ${T.borderSoft}`, minHeight:40 }}>
        <I.Folder size={14} color={T.fg3}/>
        <Typography sx={{ fontSize:13, fontWeight:600, color:T.fg }}>Assets</Typography>
        <Box sx={{ fontSize:11, color:T.fg3, bgcolor:T.surface3, px:0.7, py:0.05, borderRadius:"4px", fontWeight:500 }}>{tx.assets.length}</Box>
        <Box sx={{ flex:1 }}/>
        <Typography sx={{ fontSize:10.5, color:T.fg4 }}>All files</Typography>
      </Stack>

      {/* Scrollable tile grid */}
      <Box sx={{ flex:1, minHeight:0, overflow:"auto", p:1 }}>
        <Box sx={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(96px, 1fr))", gap:0.75 }}>
          {tx.assets.map(a => <AssetTile key={a.id} asset={a}/>)}
        </Box>
      </Box>
    </Box>
  );
}

const KIND_COLORS = {
  image: { bg:"linear-gradient(135deg,#E8EFFF 0%,#D6DEEF 100%)", fg:"#1957FF", chip:"IMG" },
  pdf:   { bg:"linear-gradient(135deg,#FCE8E8 0%,#F5D6D6 100%)", fg:"#D63A3A", chip:"PDF" },
  doc:   { bg:"linear-gradient(135deg,#E5EEFD 0%,#D0DDF3 100%)", fg:"#2F6FE8", chip:"DOC" },
  sheet: { bg:"linear-gradient(135deg,#E1F5EB 0%,#CDEEDA 100%)", fg:"#0E9F5E", chip:"XLS" },
  video: { bg:"linear-gradient(135deg,#1F2937 0%,#374151 100%)", fg:"#fff",    chip:"MP4" },
};

function AssetTile({ asset }) {
  const c = KIND_COLORS[asset.kind] || KIND_COLORS.doc;
  const hasPhoto = !!asset.thumb;
  return (
    <Tooltip
      arrow disableInteractive placement="top"
      title={`${asset.name} · Uploaded ${asset.uploadedAt} by ${asset.uploadedBy}`}
    >
      <Box sx={{
        border:`1px solid ${T.border}`, borderRadius:"8px", overflow:"hidden",
        cursor:"pointer", transition:"all 100ms",
        "&:hover": { borderColor: T.borderStrong, boxShadow:"0 2px 6px rgba(15,23,42,.08)", transform:"translateY(-1px)" },
        display:"flex", flexDirection:"column", bgcolor:"#fff",
      }}>
        {/* Thumbnail — real photo when available, colored placeholder otherwise */}
        <Box sx={{ position:"relative", height:80, overflow:"hidden",
          background: hasPhoto ? "#F2F4F8" : c.bg,
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>
          {hasPhoto ? (
            <Box component="img" src={asset.thumb} alt={asset.name}
              sx={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}/>
          ) : (
            <Box sx={{ color:c.fg }}>
              {asset.kind === "pdf"   && <I.Folder size={22}/>}
              {asset.kind === "doc"   && <I.Folder size={22}/>}
              {asset.kind === "sheet" && <I.Folder size={22}/>}
              {asset.kind === "video" && <I.Eye size={22}/>}
              {asset.kind === "image" && <I.Box1 size={22}/>}
            </Box>
          )}
          <Box sx={{
            position:"absolute", top:5, left:5,
            fontSize:9, fontWeight:700, px:0.55, py:0.15, borderRadius:"3px",
            bgcolor:"rgba(255,255,255,0.95)", color:c.fg, letterSpacing:"0.05em",
            boxShadow:"0 1px 2px rgba(15,23,42,.08)",
          }}>{c.chip}</Box>
        </Box>
        {/* Meta — filename + step */}
        <Stack sx={{ px:0.85, py:0.65, gap:0.15 }}>
          <Typography sx={{ fontSize:11, fontWeight:600, color:T.fg, lineHeight:1.25,
            overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {asset.name}
          </Typography>
          <Typography sx={{ fontSize:10, color:T.fg3, fontWeight:500, lineHeight:1.2,
            overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {asset.step}
          </Typography>
        </Stack>
      </Box>
    </Tooltip>
  );
}

// ─── Activity feed (alerts + updates, clean white card) ─────────────────
function ActivityFeed({ tx }) {
  const hasAlerts = tx.alerts && tx.alerts.length > 0;
  const hasNotifs = tx.notifications && tx.notifications.length > 0;

  const items = [
    ...(tx.alerts || []).map(text => ({ text, tone: "warning" })),
    ...(tx.notifications || []).map(text => ({ text, tone: "info" })),
  ];

  return (
    <Box sx={{ bgcolor:"#fff", border:`1px solid ${T.border}`, borderRadius:"10px", overflow:"hidden", display:"flex", flexDirection:"column", height:"100%" }}>
      <Stack direction="row" alignItems="center" gap={0.85} sx={{ px:1.5, py:0.85, borderBottom:`1px solid ${T.borderSoft}`, minHeight:40 }}>
        <Typography sx={{ fontSize:13, fontWeight:600, color:T.fg }}>Activity</Typography>
        {hasAlerts && (
          <Stack direction="row" alignItems="center" gap={0.4} sx={{
            bgcolor: T.warningBg, color: T.warning,
            px:0.75, py:0.2, borderRadius:"999px",
            fontSize:11, fontWeight:600,
          }}>
            <I.Alert size={11}/>
            <Box>{tx.alerts.length}</Box>
          </Stack>
        )}
        {hasNotifs && (
          <Stack direction="row" alignItems="center" gap={0.4} sx={{
            bgcolor: T.infoBg, color: T.info,
            px:0.75, py:0.2, borderRadius:"999px",
            fontSize:11, fontWeight:600,
          }}>
            <I.Info size={11}/>
            <Box>{tx.notifications.length}</Box>
          </Stack>
        )}
        <Box sx={{ flex:1 }}/>
        <IconButton size="small" sx={{ p:0.25 }}><I.Refresh size={13}/></IconButton>
      </Stack>

      <Box sx={{ flex:1, minHeight:0, overflow:"auto" }}>
        {items.length === 0 ? (
          <Box sx={{ p:2.5, textAlign:"center" }}>
            <Typography sx={{ fontSize:12, color:T.fg4 }}>No alerts or updates</Typography>
          </Box>
        ) : items.map((it, idx) => {
          const isAlert = it.tone === "warning";
          return (
            <Stack key={idx} direction="row" alignItems="flex-start" gap={1} sx={{
              px:1.5, py:0.7,
              borderTop: idx === 0 ? 0 : `1px solid ${T.borderSoft}`,
              "&:hover": { bgcolor: T.surface2 },
            }}>
              <Box sx={{
                display:"inline-flex", alignItems:"center", justifyContent:"center",
                width:18, height:18, borderRadius:"4px", flexShrink:0, mt:0.15,
                bgcolor: isAlert ? T.warningBg : T.infoBg,
                color: isAlert ? T.warning : T.info,
              }}>
                {isAlert ? <I.Alert size={11}/> : <I.Info size={11}/>}
              </Box>
              <Typography sx={{ flex:1, fontSize:12, color:T.fg, fontWeight:500, lineHeight:1.4, minWidth:0 }}>
                {it.text}
              </Typography>
              <Typography sx={{ fontSize:10.5, color:T.fg4, flexShrink:0, whiteSpace:"nowrap", mt:0.25 }}>
                {(["just now","8m","32m","1h","2h","3h"])[idx % 6]}
              </Typography>
            </Stack>
          );
        })}
      </Box>
    </Box>
  );
}

// ─── Activity section card ───────────────────────────────────────────────
// Multi-value field (e.g. "List of assets for location 1", Count: 16).
function ListFieldValue({ values }) {
  return (
    <Box sx={{
      mt:0.4, maxHeight:168, overflow:"auto",
      border:`1px solid ${T.border}`, borderRadius:"6px",
      bgcolor:T.surface2, px:1, py:0.6,
    }}>
      <Stack gap={0.2}>
        {values.map((v, i) => (
          <Typography key={i} sx={{
            fontSize:12.5, color:T.accent, fontWeight:500, lineHeight:1.5,
            fontVariantNumeric:"tabular-nums",
          }}>{v}</Typography>
        ))}
      </Stack>
    </Box>
  );
}

// Image-upload field (PPE verification photo, POD copy). The live page
// renders a thumbnail; here the upload is named instead of previewed.
function PhotoFieldValue({ title, previousValues }) {
  return (
    <Stack gap={0.5} sx={{ alignItems:"flex-start" }}>
      <Typography
        role="button"
        onClick={e => e.stopPropagation()}
        sx={{
          fontSize:13, color:T.accent, fontWeight:500, lineHeight:1.35,
          cursor:"pointer", textDecoration:"underline",
          textUnderlineOffset:"2px", textDecorationColor:"rgba(25,87,255,.35)",
          "&:hover": { color:T.accentHover, textDecorationColor:"currentColor" },
        }}>
        {title || "Photo"}
      </Typography>
      {previousValues > 0 && <PreviousValuesChip count={previousValues}/>}
    </Stack>
  );
}

// The amber "PREVIOUS VALUE(S)" disclosure the live form puts under a
// field that has been edited.
function PreviousValuesChip({ count }) {
  return (
    <Stack direction="row" alignItems="center" gap={0.5} sx={{
      bgcolor:T.warningBg, color:T.warning,
      border:`1px solid ${T.warning}`, borderLeftWidth:3,
      borderRadius:"4px", px:0.75, py:0.3, cursor:"pointer",
      fontSize:9.5, fontWeight:700, letterSpacing:"0.05em", textTransform:"uppercase",
      "&:hover": { filter:"brightness(0.98)" },
    }}>
      <Box>{count > 1 ? `Previous values (${count})` : "Previous value"}</Box>
      <I.ChevronD size={11}/>
    </Stack>
  );
}

function ActivityField({ f }) {
  const isList  = f.kind === "list";
  const isPhoto = f.kind === "photo";

  return (
    <Box sx={{ gridColumn: f.colSpan ? `span ${f.colSpan}` : "auto", minWidth:0 }}>
      <Stack direction="row" alignItems="baseline" gap={0.75} sx={{ mb:0.3 }}>
        <Typography sx={{ fontSize:11, color:T.fg3, fontWeight:500, lineHeight:1.25, flex:1, minWidth:0 }}>
          {f.label}
        </Typography>
        {f.count != null && (
          <Typography sx={{ fontSize:10.5, color:T.accent, fontWeight:700, whiteSpace:"nowrap", flexShrink:0 }}>
            Count: {f.count}
          </Typography>
        )}
      </Stack>

      {isList  && <ListFieldValue values={f.values}/>}
      {isPhoto && <PhotoFieldValue title={f.title} previousValues={f.previousValues || 0}/>}

      {!isList && !isPhoto && (
        f.boxed ? (
          <Box sx={{
            border:`1px solid ${T.accent}`, borderRadius:"5px",
            bgcolor:T.surface2, px:1, py:0.65,
          }}>
            <Typography sx={{ fontSize:13, color:T.fg, fontWeight:500, lineHeight:1.35, wordBreak:"break-word" }}>
              {f.value}
            </Typography>
          </Box>
        ) : (
          <Typography sx={{ fontSize:13, color:T.fg, fontWeight:500, lineHeight:1.35, wordBreak:"break-word" }}>
            {f.value}
          </Typography>
        )
      )}

      {!isPhoto && f.previousValues > 0 && (
        <Box sx={{ mt:0.5 }}><PreviousValuesChip count={f.previousValues}/></Box>
      )}
    </Box>
  );
}

function ActivitySection({ section }) {
  // Open by default — user can collapse manually.
  const [collapsed, setCollapsed] = useState(false);
  const Icon = I[section.icon] || I.Box1;
  const fields = section.fields || [];

  const stateChip = {
    done:    { label:"Complete",    fg:T.success, bg:T.successBg },
    current: { label:"In Progress", fg:T.info,    bg:T.infoBg    },
    pending: { label:"Pending",     fg:T.fg3,     bg:T.surface3  },
  }[section.state || "pending"];

  return (
    <Box sx={{ bgcolor:"#fff", border:`1px solid ${T.border}`, borderRadius:"10px", overflow:"hidden", mb:1.25 }}>
      <Stack
        direction="row" alignItems="center" gap={1}
        onClick={() => setCollapsed(!collapsed)}
        sx={{
          px:1.75, py:1.1, cursor:"pointer",
          borderBottom: collapsed ? 0 : `1px solid ${T.borderSoft}`,
          "&:hover": { bgcolor: T.surface2 },
        }}>
        <Box sx={{ width:24, height:24, borderRadius:"5px", bgcolor:T.surface2, color:T.fg2, display:"inline-flex", alignItems:"center", justifyContent:"center" }}>
          <Icon size={14}/>
        </Box>
        <Typography sx={{ fontSize:14, fontWeight:600, color:T.fg }}>{section.title}</Typography>

        {/* Step reference badge (e.g. 533) carried by the live platform */}
        {section.badge && (
          <Box sx={{
            fontSize:10.5, fontWeight:600, color:T.fg2, bgcolor:T.surface3,
            borderRadius:999, px:0.9, py:0.15, fontVariantNumeric:"tabular-nums",
          }}>{section.badge}</Box>
        )}

        {/* AI-processed marker */}
        {section.ai && (
          <Stack direction="row" alignItems="center" gap={0.4} sx={{
            fontSize:10, fontWeight:700, color:T.success, bgcolor:T.successBg,
            borderRadius:999, px:0.75, py:0.2, letterSpacing:"0.04em",
          }}>
            <Box sx={{ width:5, height:5, borderRadius:999, bgcolor:T.success }}/>
            AI
          </Stack>
        )}

        <Box sx={{
          display:"inline-flex", alignItems:"center", gap:0.5,
          px:0.75, py:0.15, borderRadius:"4px",
          bgcolor: stateChip.bg, color: stateChip.fg,
          fontSize:10.5, fontWeight:600,
        }}>
          {section.state === "done" && <I.Check size={11}/>}
          {section.state === "current" && <Box sx={{ width:5, height:5, borderRadius:999, bgcolor: stateChip.fg }}/>}
          {stateChip.label}
        </Box>

        <Box sx={{ flex:1 }}/>

        <Stack alignItems="flex-end" sx={{ minWidth:0 }}>
          <Typography sx={{ fontSize:10.5, color:T.fg3, lineHeight:1.2 }}>
            Updated by <Box component="span" sx={{ color:T.fg2, fontWeight:500 }}>{section.updatedBy}</Box>
            {section.updatedByRole && (
              <Box component="span" sx={{ color:T.fg4 }}> ({section.updatedByRole})</Box>
            )}
          </Typography>
          <Typography sx={{ fontSize:10.5, color:T.fg4, lineHeight:1.2 }}>{section.updatedAt}</Typography>
        </Stack>
        <Stack direction="row" gap={0.25} sx={{ ml:1 }} onClick={e => e.stopPropagation()}>
          <Tooltip title="Edit"    arrow disableInteractive><IconButton size="small"><I.Edit size={14}/></IconButton></Tooltip>
          <Tooltip title="Refresh" arrow disableInteractive><IconButton size="small"><I.Refresh size={14}/></IconButton></Tooltip>
          <Tooltip title={collapsed ? "Expand" : "Collapse"} arrow disableInteractive>
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); setCollapsed(!collapsed); }}>
              <Box sx={{ transform: collapsed ? "rotate(-90deg)" : "rotate(0)", transition:"transform 150ms", display:"inline-flex" }}>
                <I.ChevronD size={14}/>
              </Box>
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {!collapsed && (
        <Box>
          {fields.length > 0 ? (
            <Box sx={{ p:1.75, display:"grid", gridTemplateColumns:"repeat(4, minmax(0,1fr))", gap:1.5, alignItems:"start" }}>
              {fields.map((f, i) => <ActivityField key={i} f={f}/>)}
            </Box>
          ) : (
            <Box sx={{ px:1.75, py:1.4 }}>
              <Typography sx={{ fontSize:12, color:T.fg4 }}>No values recorded for this step.</Typography>
            </Box>
          )}

          {/* AI detection disclosure, as the live POD step renders it */}
          {section.aiDetectionCount > 0 && (
            <Box sx={{ px:1.75, pb:1.4, mt:-0.5 }}>
              <Stack direction="row" alignItems="center" gap={0.5} role="button" sx={{
                color:T.accent, fontSize:11.5, fontWeight:600, cursor:"pointer",
                letterSpacing:"0.03em", textTransform:"uppercase",
                "&:hover": { textDecoration:"underline" },
              }}>
                <I.ChevronR size={12}/>
                <Box>AI Detection ({section.aiDetectionCount})</Box>
              </Stack>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}

// ─── The page itself ─────────────────────────────────────────────────────
function TransactionDetail({ tx, onBack }) {
  return (
    <Stack sx={{ flex:1, minWidth:0 }}>
      <DetailHeader tx={tx} onBack={onBack}/>
      <ProgressTracker tx={tx}/>
      <Box sx={{ flex:1, overflow:"auto", bgcolor: T.pageBg, px:2, py:1.5 }}>
        <TopRow tx={tx}/>

        {/* Activity sections title row */}
        <Stack direction="row" alignItems="center" gap={1} sx={{ mb:1, mt:0.5 }}>
          <Typography sx={{ fontSize:13, fontWeight:600, color:T.fg, letterSpacing:"-0.005em" }}>
            Activity Log
          </Typography>
          <Box sx={{ fontSize:11, color:T.fg3, bgcolor:T.surface3, px:0.7, py:0.2, borderRadius:"4px", fontWeight:500 }}>{tx.activities.length}</Box>
          <Box sx={{ flex:1 }}/>
          <Typography sx={{ fontSize:11, color:T.fg3 }}>
            {tx.activities.filter(a => a.state === "done").length} complete · {tx.activities.filter(a => a.state === "current").length} in progress · {tx.activities.filter(a => a.state === "pending").length} pending
          </Typography>
        </Stack>

        {tx.activities.map(s => <ActivitySection key={s.id} section={s}/>)}
        <Box sx={{ height: 24 }}/>
      </Box>
    </Stack>
  );
}

window.TransactionDetail = TransactionDetail;
window.__craneReady = { ...(window.__craneReady||{}), detail: true };
window.dispatchEvent(new Event("crane:detail"));
