// Mock data with dynamic per-client field schemas
// Each client can name the same logical field differently — and the same
// transactions view can contain transactions from multiple clients,
// resulting in mixed labels on the same screen. The renderer always shows
// label-with-value pairs so this is handled gracefully.

window.CRANE_DATA = (() => {
  // Logical field keys we know about. Labels are per-client.
  // Order matters — controls which fields are shown in list / kanban cards.
  const CLIENT_SCHEMAS = {
    indemni: {
      name: "Indemni",
      ref:        "Shipment # (Pro)",
      pickup:     "Pickup Date",
      delivery:   "Delivery Date",
      origin:     "Origin",
      destination:"Destination",
      driver:     "Driver",
      site:       "Site Code",
      eta:        "ETA",
      stage:      "Stage",
      activity:   "Activity",
    },
    fedex: {
      name: "FedEx Custom",
      ref:        "Tracking #",
      pickup:     "Pickup Window",
      delivery:   "Promised By",
      origin:     "From",
      destination:"To",
      driver:     "Courier",
      site:       "Hub",
      eta:        "ETA",
      stage:      "Scan Status",
      activity:   "Last Scan",
    },
    bmw: {
      name: "BMW Logistics",
      ref:        "Order #",
      pickup:     "Collection",
      delivery:   "Drop",
      origin:     "Plant",
      destination:"Dealer",
      driver:     "Operator",
      site:       "Dealer Code",
      eta:        "ETA",
      stage:      "Phase",
      activity:   "Update",
    },
  };

  // 5 dynamic stages — these names can vary per client too.
  // For the kanban view, we group by stage. Each client defines its own
  // stage labels. The header for a column shows the dominant client's
  // label or a fallback.
  const STAGE_LABELS = {
    indemni:  ["Planning",   "Rally / Loading", "In Transit",     "Returning",      "Offload"],
    fedex:    ["Tendered",   "Pickup Scan",     "In Network",     "Out for Delivery","Delivered"],
    bmw:      ["Scheduled",  "Plant Loading",   "On Route",       "At Dealer",      "Confirmed"],
  };

  const DRIVERS = [
    "Ronald Cox","Shaun Askew","Maria Delgado","Jamie O'Brien","Kim Park",
    "Eli Hartman","Priya Shah","Dimitri Volkov","Lena Wallace","Andre Bouchard"
  ];

  const ORIGINS = [
    ["Dulles ISH","Sterling, VA"], ["Memphis Hub","Memphis, TN"],
    ["Spartanburg Plant","Spartanburg, SC"], ["Newark Air","Newark, NJ"],
    ["LAX Cargo","Los Angeles, CA"],
  ];
  const DESTS = [
    ["IAD451","Aldie, VA"], ["IAD452","Sterling, VA"], ["IAD453","Reston, VA"],
    ["BWI201","Baltimore, MD"], ["DCA112","Arlington, VA"], ["RIC301","Richmond, VA"],
    ["BMW-12","Tysons, VA"], ["BMW-19","Bethesda, MD"],
  ];

  const STATUS = ["in_progress","alert","completed","planning","delayed","draft"];
  const STATUS_LABEL = {
    in_progress: "In Progress",
    alert:       "Alert",
    completed:   "Completed",
    planning:    "Planning",
    delayed:     "Delayed",
    draft:       "Draft",
  };
  const STATUS_TONE = {
    in_progress: "info",
    alert:       "warning",
    completed:   "success",
    planning:    "neutral",
    delayed:     "error",
    draft:       "neutral",
  };

  // Deterministic PRNG so the mock data is stable across reloads
  function mulberry32(a) {
    return function() {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  const rand = mulberry32(20260520);
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];

  const ALERT_REASONS = [
    "Missing Assets",
    "Assets Rejection (VADs)",
    "Assets Rejected (VADs)",
    "Pre Offload Checklist — VADs has not received the keys",
    "Pre Offload Checklist — Truck not switched off",
    "Pre Offload Checklist — POC contact not initiated",
    "Expected delay in loading",
    "Driver paused — site security check",
    "Geofence breach near destination",
    "Photo evidence rejected by reviewer",
    "BOL not yet signed at pickup",
    "ETA breach: 32m over",
  ];

  const NOTIFICATION_REASONS = [
    "Driver requested re-route",
    "ETA updated — now 12m later",
    "POC checkin completed",
    "Photo evidence uploaded",
    "Customer confirmed delivery window",
    "Trailer arrived early at ISH",
    "BOL scanned successfully",
    "VADS Crew accepted assignment",
    "Geofence entry detected",
    "Driver completed PPE checklist",
  ];

  // Assets attached to each transaction. Mix of image evidence + PDF
  // documents + supporting files. Images use real photo thumbnails from
  // assets/photos/; non-image files use kind-coloured placeholder cards.
  const ASSET_POOL = [
    { kind:"image", name:"BOL_Signed_Front.jpg",      ext:"JPG", thumb:"assets/photos/BOL_Form.png" },
    { kind:"image", name:"License_Plate_Trailer.jpg", ext:"JPG", thumb:"assets/photos/Truck_Front.png" },
    { kind:"image", name:"VADS_Crew_Selfie.jpg",      ext:"JPG", thumb:"assets/photos/PPE_Worker.png" },
    { kind:"image", name:"Driver_ID_Badge.jpg",       ext:"JPG", thumb:"assets/photos/Security_ID.png" },
    { kind:"image", name:"Tools_Pre_Departure.jpg",   ext:"JPG", thumb:"assets/photos/Tools_Layout.png" },
    { kind:"image", name:"PPE_Hardhat_Vest.jpg",      ext:"JPG", thumb:"assets/photos/PPE_Worker.png" },
    { kind:"image", name:"Tractor_Front_View.jpg",    ext:"JPG", thumb:"assets/photos/Truck_Front.png" },
    { kind:"image", name:"Site_Survey_East.jpg",      ext:"JPG", thumb:"assets/photos/Tools_Layout.png" },
    { kind:"image", name:"Yard_Map_Annotated.jpg",    ext:"JPG", thumb:"assets/photos/BOL_Form.png" },
    { kind:"image", name:"Crew_Lead_Badge.jpg",       ext:"JPG", thumb:"assets/photos/Security_ID.png" },
    { kind:"pdf",   name:"BOL_Final.pdf",             ext:"PDF" },
    { kind:"pdf",   name:"PreDeparture_Checklist.pdf",ext:"PDF" },
    { kind:"pdf",   name:"Driver_PPE_Form.pdf",       ext:"PDF" },
    { kind:"pdf",   name:"Site_Survey_Report.pdf",    ext:"PDF" },
    { kind:"pdf",   name:"Customer_Confirmation.pdf", ext:"PDF" },
    { kind:"pdf",   name:"Checklist_Template.pdf",    ext:"PDF", thumb:"assets/photos/Checklist_Form.png" },
    { kind:"doc",   name:"Customer_Instructions.docx",ext:"DOCX" },
    { kind:"sheet", name:"Asset_List.xlsx",           ext:"XLSX" },
    { kind:"video", name:"Loading_Walkthrough.mp4",   ext:"MP4" },
  ];

  // pickAssetsForStep: returns 0-3 assets attached to a single activity.
  function pickAssetsForStep(stepTitle, i, rand) {
    const n = Math.floor(rand() * 4); // 0..3
    const out = [];
    const used = new Set();
    while (out.length < n) {
      const idx = Math.floor(rand() * ASSET_POOL.length);
      if (used.has(idx)) continue;
      used.add(idx);
      const base = ASSET_POOL[idx];
      out.push({
        ...base,
        id: `${i}-${stepTitle}-${idx}`,
        uploadedAt: `${1 + Math.floor(rand()*15)} May 2026`,
        uploadedBy: ["Ileana Marroquin","Greg Robinson","Joselyn Wright","Ronald Cox"][Math.floor(rand()*4)],
        step: stepTitle,
      });
    }
    return out;
  }

  // Activity sections — workflow stages, each with its own fields.
  // Field labels vary per client per the dynamic-schema reality.
  // state: "done" | "current" | "pending"
  function buildActivities(client, i, rand) {
    const cur = i % 6;
    const stateFor = (idx) => idx < cur ? "done" : idx === cur ? "current" : "pending";
    const titles = [
      "Driver Assignment",
      "Vehicle Booking",
      "VADS Assignment",
      "Booking with Operations",
      "Pre Departure Tools / PPE Validation",
      "Pre Departure Review SOP",
    ];
    const assetsByStep = titles.map(t => pickAssetsForStep(t, i, rand));

    return [
      {
        id:"driver",   icon:"Truck",    title:titles[0], state: stateFor(0),
        updatedBy:"Ileana Marroquin",  updatedAt:"30 Apr 2026, 02:30 PM",
        assets: assetsByStep[0],
        fields:[
          { label:"Pick Up Date",   value:`${15 + (i%10)} May 2026, 09:00 AM` },
          { label:"Driver Name",    value:"Ronald Cox · 904-562-8158" },
          { label:"QTR Pro Number", value:`37083${(i%10)}` },
        ],
      },
      {
        id:"vehicle",  icon:"Truck",    title:titles[1], state: stateFor(1),
        updatedBy:"Ileana Marroquin",  updatedAt:"30 Apr 2026, 02:30 PM",
        assets: assetsByStep[1],
        fields:[
          { label:"Truck Type",          value:"53ft FTL Dryvan" },
          { label:"Truck Number",        value:"261234" },
          { label:"Trailer Number",      value:"26159" },
          { label:"License Plate Number",value:"IN3762026" },
        ],
      },
      {
        id:"vads",     icon:"Users",    title:titles[2], state: stateFor(2),
        updatedBy:"Ileana Marroquin",  updatedAt:"30 Apr 2026, 02:30 PM",
        assets: assetsByStep[2],
        fields:[
          { label:"VADS Lead",       value:"Greg Robinson · 5714222199" },
          { label:"Labor Pro Number",value:"370836" },
          { label:"VADS Crew",       value:"Joselyn Wright · Deirmon Riddick", colSpan:2 },
        ],
      },
      {
        id:"ops",      icon:"Phone",    title:titles[3], state: stateFor(3),
        updatedBy:"Ileana Marroquin",  updatedAt:"30 Apr 2026, 02:30 PM",
        assets: assetsByStep[3],
        fields:[
          { label:"POC Name",                     value:"Angela Cheang" },
          { label:"POC Phone Number",             value:"703-309-4740" },
          { label:"Truck Size",                   value:"NA" },
          { label:"Delivery Information",         value:"NA" },
          { label:"Floor Protection Required",    value:"NA" },
          { label:"VAD Information",              value:"Must be in Avetta / Avetta Trained" },
          { label:"Lift Gate Required",           value:"NA" },
          { label:"Rally Point Information",      value:"Home Depot, 6315 Eastern Ave, Baltimore MD" },
        ],
      },
      {
        id:"validation", icon:"Check",  title:titles[4], state: stateFor(4),
        updatedBy:"Ileana Marroquin",  updatedAt:"19 May 2026, 12:11 AM",
        assets: assetsByStep[4],
        fields:[
          { label:"Are Pre Departure Tools Validated?", value:"Yes" },
          { label:"Required Tools Present?",            value:"Yes" },
          { label:"Required PPE Present?",              value:"Yes" },
        ],
      },
      {
        id:"sop",      icon:"Check",    title:titles[5], state: stateFor(5),
        updatedBy:"Ileana Marroquin",  updatedAt:"19 May 2026, 12:10 AM",
        assets: assetsByStep[5],
        fields:[
          { label:"Pre Departure SOP Validated?", value:"Yes" },
        ],
      },
    ];
  }

  const TRANSACTIONS = Array.from({ length: 48 }, (_, i) => {
    const clientKey = ["indemni","fedex","bmw"][i % 3];
    const status = pick(STATUS);
    const stageIdx = status === "completed" ? 4
                   : status === "alert" ? 2
                   : status === "delayed" ? 2
                   : status === "planning" || status === "draft" ? 0
                   : Math.floor(rand()*3) + 1;
    const dateMay = 1 + (i % 14);
    const origin = pick(ORIGINS);
    const dest = pick(DESTS);

    // ~38% of rows have alerts. Of those, 1-4 reasons (skewed toward 1-2).
    let alerts = [];
    const r = rand();
    if (r < 0.38) {
      const n = r < 0.05 ? 4 : r < 0.13 ? 3 : r < 0.25 ? 2 : 1;
      const used = new Set();
      while (alerts.length < n) {
        const reason = pick(ALERT_REASONS);
        if (used.has(reason)) continue;
        used.add(reason); alerts.push(reason);
      }
    }
    // If the row was already flagged as alert/delayed by status, force >=1 alert
    if ((status === "alert" || status === "delayed") && alerts.length === 0) {
      alerts = [pick(ALERT_REASONS)];
    }

    // ~30% of rows have informational notifications, independent of alerts.
    let notifications = [];
    const rn = rand();
    if (rn < 0.30) {
      const n = rn < 0.06 ? 3 : rn < 0.16 ? 2 : 1;
      const used = new Set();
      while (notifications.length < n) {
        const reason = pick(NOTIFICATION_REASONS);
        if (used.has(reason)) continue;
        used.add(reason); notifications.push(reason);
      }
    }

    // For demo purposes, ensure the first few rows have BOTH alerts and
    // notifications so the detail page always demonstrates the dual banner.
    if (i < 8 && alerts.length === 0) alerts = [pick(ALERT_REASONS)];
    if (i < 8 && notifications.length === 0) notifications = [pick(NOTIFICATION_REASONS)];

    return {
      id: 1000 + i,
      clientKey,
      status,
      stageIdx,
      alerts,
      notifications,
      priority: rand() > 0.85 ? "HVL" : (rand() > 0.7 ? "Priority" : null),
      driver: {
        name: pick(DRIVERS),
        phone: "904-562-8158",
        vehicle: "53ft FTL Dryvan",
        plate: "IN3762026",
        eta: `${Math.floor(rand()*4)+1}h ${Math.floor(rand()*60)}m`,
        distance: (1 + rand() * 8).toFixed(1) + " mi",
        onRoute: status !== "alert" && status !== "delayed",
      },
      values: {
        ref:         (i % 3 === 1 ? "TRK" : "") + String(1920340 + i).padStart(8,"0"),
        pickup:      `${String(dateMay).padStart(2,"0")} May 2026`,
        delivery:    `${String(Math.min(dateMay+1,30)).padStart(2,"0")} May 2026`,
        origin:      `${origin[0]} · ${origin[1]}`,
        destination: `${dest[0]} · ${dest[1]}`,
        driver:      pick(DRIVERS),
        site:        dest[0],
        eta:         `${Math.floor(rand()*9)+1}h ${Math.floor(rand()*60)}m`,
        stage:       STAGE_LABELS[clientKey][stageIdx],
        activity:    pick([
          "Driver Assignment Completed","VADS Crew Loading",
          "BOL Signed at Pickup","Photo Evidence Pending",
          "En route — geofence OK","Stalled — see alert"
        ]),
      },
      activities: null, // filled below
      assets: null,     // filled below
    };
  });

  // Build activities then derive top-level assets by flattening.
  TRANSACTIONS.forEach((t, i) => {
    const localRand = mulberry32(20260520 + i);
    t.activities = buildActivities(t.clientKey, i, localRand);
    t.assets = t.activities.flatMap(a => a.assets);
  });

  return {
    CLIENT_SCHEMAS, STAGE_LABELS, TRANSACTIONS, DRIVERS,
    STATUS_LABEL, STATUS_TONE,
  };
})();

// Alerts feed for the slide-over drawer
window.CRANE_ALERTS = {
  missedCalls: [
    { id:"c1", driver:"Ronald Cox",    shipment:"01920341", time:"2m ago",  duration:"38s", priority:"high" },
    { id:"c2", driver:"Maria Delgado", shipment:"01920347", time:"14m ago", duration:"12s", priority:"normal" },
    { id:"c3", driver:"Shaun Askew",   shipment:"01920354", time:"32m ago", duration:"01:04", priority:"high" },
    { id:"c4", driver:"Jamie O'Brien", shipment:"01920358", time:"1h ago",  duration:"22s", priority:"normal" },
    { id:"c5", driver:"Andre Bouchard",shipment:"01920362", time:"2h ago",  duration:"45s", priority:"normal" },
  ],
  unreadChats: [
    { id:"t1", driver:"Priya Shah",    shipment:"01920343", time:"just now", preview:"Stuck at gate — security needs the BOL", unread:3 },
    { id:"t2", driver:"Eli Hartman",   shipment:"01920349", time:"5m ago",   preview:"Loaded. Heading out.", unread:1 },
    { id:"t3", driver:"Dimitri Volkov",shipment:"01920351", time:"22m ago",  preview:"Detour — accident on 95N", unread:2 },
    { id:"t4", driver:"Lena Wallace",  shipment:"01920355", time:"48m ago",  preview:"Need a re-route, dealer is closed early", unread:1 },
  ],
};
