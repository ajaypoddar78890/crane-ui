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

  // ── Activity Log sections ────────────────────────────────────────────
  // REAL workflow steps, transcribed from production screenshots of the
  // Crane Worldwide transaction detail page for TRUCK 3-462772.
  //
  // Field order, labels (including their original casing and question
  // marks) and values are exactly what the live platform rendered.
  // Fields whose value was "NA" are dropped, per the capture brief.
  //
  // Field extras:
  //   boxed:true      value rendered in the inset/highlighted box the
  //                   live UI uses for edited values
  //   kind:"list"     multi-value field; `values` + `count`
  //   kind:"photo"    image upload; shown as `title` + optional `previousValues`
  //   colSpan:n       spans n of the 4 grid columns
  const REAL_ACTIVITIES = [
    {
      id:"job-creation", icon:"Box1", title:"Job Creation",
      updatedBy:"Jaron Ruth", updatedByRole:"Control Tower",
      updatedAt:"20 Nov 2026, 02:58 AM (IST)",
      fields:[
        { label:"Shipment number (pro number)", value:"TRUCK 3-462772" },
        { label:"Pick up date",                 value:"20 Nov 2026" },
        { label:"Delivery date",                value:"20 Nov 2026" },
        { label:"Pick up site code",            value:"ISH-IAD5" },
        { label:"Cargo type",                   value:"Racks" },
        { label:"location 1 site code",         value:"IAD245- 3220 Digital Dr, Adamstown, Maryland, 21710", boxed:true, colSpan:2 },
        {
          label:"List of assets for location 1", kind:"list", count:16, colSpan:2,
          values:[
            "1704443314","1704579829","1704589705","1704603859",
            "1704604044","1704819643","1780235172","1780235224",
            "3539197694","3539199749","3539200547","3539201153",
            "3539204342","3539204764","3539205045","3549022526",
          ],
        },
        { label:"Total quantity of assets for location 1", value:"16" },
        { label:"Original eta for location 1",             value:"2026-11-20, 08:15 AM" },
      ],
    },
    {
      id:"booking-ops", icon:"Phone", title:"Booking to Operations",
      updatedBy:"Jaron Ruth", updatedByRole:"Control Tower",
      updatedAt:"20 Nov 2026, 02:58 AM (IST)",
      fields:[
        { label:"Truck size",              value:"53ft FTL Dryvan" },
        { label:"Lift gate requirements",  value:"tbd" },
      ],
    },
    {
      id:"delivery-planning", icon:"Tree", title:"Delivery Planning",
      updatedBy:"Jaron Ruth", updatedByRole:"Control Tower",
      updatedAt:"20 Nov 2026, 02:58 AM (IST)",
      fields:[
        { label:"Does a crate have to be returned?", value:"Yes" },
        { label:"Delivery plan",   value:"ISH>Rally>IAD245>ISH", count:1 },
        { label:"Location 1",      value:"IAD245- 3220 Digital Dr, Adamstown, Maryland, 21710", boxed:true, colSpan:2 },
        { label:"Destination site code", value:"IAD245" },
      ],
    },
    {
      id:"doc-compliance", icon:"Folder", title:"Documentation & Compliance (VADS Lead)",
      updatedBy:"Subhan Kiani", updatedByRole:"VADS Lead",
      updatedAt:"20 Nov 2026, 06:21 PM (IST)",
      fields:[
        { label:"Is a government id and yellow badge present for all crew members?", value:"Yes", colSpan:2 },
        { label:"Are there any compliance issues, or is the crew missing any required items?", value:"No", colSpan:2 },
      ],
    },
    {
      id:"vads-crew", icon:"Users", title:"VADS, Crew, Drivers & Vehicles",
      updatedBy:"Jaron Ruth", updatedByRole:"Control Tower",
      updatedAt:"20 Nov 2026, 02:58 AM (IST)",
      fields:[
        { label:"Team lead information (enter vads team lead details)", value:"Karianne- Jackson- 3016752749", boxed:true, colSpan:2 },
        { label:"Driver information (enter driver name and phone number)", value:"Daveunce - Leonard- 9365461122", boxed:true, colSpan:2 },
        { label:"Truck number",   value:"244011" },
        { label:"Trailer number", value:"879127" },
        { label:"Trailer type (e.g. 53 ft ftl dry van)", value:"53ft FTL Dryvan" },
        { label:"Team reference number", value:"2" },
        { label:"Rtf – roll to floor (identify who will perform rtf activities)", value:"VADS Lead", colSpan:2 },
      ],
    },
    {
      id:"ppe-checklist", icon:"Check", title:"PPE Checklist",
      updatedBy:"Subhan Kiani", updatedByRole:"VADS Lead",
      updatedAt:"20 Nov 2026, 09:00 PM (IST)",
      fields:[
        { label:"Composite toed shoes",   value:"Yes" },
        { label:"Crush resistant gloves", value:"Yes" },
        { label:"Safety vest",            value:"Yes" },
        { label:"Hard hat",               value:"Yes" },
        { label:"Hearing protection",     value:"Yes" },
        { label:"Safety glasses",         value:"Yes" },
        {
          label:"Ppe verification photo (upload an image showing all ppe items confirmed as present)",
          kind:"photo", title:"Photo", previousValues:2, colSpan:2,
        },
        { label:"Add extra ppe", value:"[]", previousValues:1, colSpan:2 },
      ],
    },
    {
      id:"stop-ish-loading", icon:"Clock", title:"Stop ISH Loading",
      updatedBy:"Subhan Kiani", updatedByRole:"VADS Lead",
      updatedAt:"20 Nov 2026, 06:24 PM (IST)",
      fields:[
        { label:"Loading end time", value:"2026-11-20, 07:27 AM" },
      ],
    },
    {
      id:"start-ish-loading", icon:"Clock", title:"Start ISH Loading",
      updatedBy:"Subhan Kiani", updatedByRole:"VADS Lead",
      updatedAt:"20 Nov 2026, 06:23 PM (IST)",
      fields:[
        { label:"Loading start time", value:"2026-11-20, 06:15 AM" },
      ],
    },
    {
      // Both fields ("Expected loading delay", "Delay reason") read NA and
      // were dropped, so this step records only its timestamp.
      id:"ish-loading", icon:"Truck", title:"ISH Loading",
      updatedBy:"Subhan Kiani", updatedByRole:"VADS Lead",
      updatedAt:"20 Nov 2026, 06:23 PM (IST)",
      fields:[],
    },
    {
      id:"arrival-at-ish", icon:"Pin", title:"Arrival at ISH",
      updatedBy:"Subhan Kiani", updatedByRole:"VADS Lead",
      updatedAt:"20 Nov 2026, 06:23 PM (IST)",
      fields:[
        { label:"Confirm the time you have arrived at the ish", value:"2026-11-20, 06:00 AM", colSpan:2 },
      ],
    },
    {
      id:"return-to-ish", icon:"Refresh", title:"Return to ISH (New)",
      updatedBy:"Karianne Jackson", updatedByRole:"VADS Lead",
      updatedAt:"25 Nov 2026, 01:27 AM (IST)",
      fields:[
        { label:"Eta to ish", value:"2026-11-24, 03:20 PM" },
      ],
    },
    {
      id:"next-stop", icon:"Pin", title:"Next Stop?", badge:"533",
      updatedBy:"Karianne Jackson", updatedByRole:"VADS Lead",
      updatedAt:"25 Nov 2026, 01:11 AM (IST)",
      fields:[
        { label:"Next stop?", value:"Return to ISH" },
      ],
    },
    {
      id:"upload-pod-copy", icon:"Folder", title:"Upload POD Copy", badge:"533", ai:true,
      updatedBy:"Karianne Jackson", updatedByRole:"VADS Lead",
      updatedAt:"25 Nov 2026, 01:11 AM (IST)",
      aiDetectionCount:3,
      fields:[
        { label:"Upload pod copy", kind:"photo", title:"Photo", colSpan:2 },
      ],
    },
  ];

  // Clone the real step list per transaction and stamp a workflow state on
  // each step. Attached files stay randomised — the detail screenshots
  // don't expose them, and the Assets card depends on them.
  function buildActivities(client, i, rand) {
    const cur = i % REAL_ACTIVITIES.length;
    const stateFor = (idx) => idx < cur ? "done" : idx === cur ? "current" : "pending";

    return REAL_ACTIVITIES.map((s, idx) => ({
      ...s,
      fields: s.fields.map(f => ({ ...f })),
      state: stateFor(idx),
      assets: pickAssetsForStep(s.title, i, rand),
    }))
    // Newest step first, matching the live platform's ordering.
    .reverse();
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

/* ======================================================================
 * CRANE_BOARD — REAL board data, transcribed from production screenshots
 * of the Crane Worldwide · Transactions kanban (captured 25 Nov 2026).
 *
 * This is NOT generated mock data. Column names, counts, card titles,
 * alert reasons, notification reasons, AI-detection matches, dates,
 * activities and timestamps are exactly what the live platform showed.
 *
 * Where a screenshot clipped a value it is marked CLIPPED rather than
 * invented.
 * ==================================================================== */
window.CRANE_BOARD = (() => {
  const D = window.CRANE_DATA;

  // Column header label + the real total count + the alert-count pill
  // that floats above the column in the live board.
  const COLUMNS = [
    { key:"planning", label:"1. PLANNING / READY TO BOOK",         count:19,  alertCount:6  },
    { key:"rally",    label:"2. RALLY / LOADING AT ISH",           count:0,   alertCount:0  },
    { key:"delivery", label:"3. DELIVERY IN PROGRESS",             count:1,   alertCount:1  },
    { key:"return",   label:"4. RETURN TO ISH",                    count:0,   alertCount:0  },
    { key:"offload",  label:"5. ISH OFFLOAD / DELIVERY COMPLETED", count:205, alertCount:46 },
    { key:"none",     label:"NO STATUS",                           count:0,   alertCount:0  },
  ];

  const PLANNING  = "1. PLANNING / READY TO BOOK";
  const DELIVERY  = "3. DELIVERY IN PROGRESS";
  const OFFLOAD   = "5. ISH OFFLOAD / DELIVERY COMPLETED";
  const VADS_DONE = "VADS, Crew, Drivers & Vehicles Completed";

  // Pre-departure tool / PPE alert set — identical text on both trucks
  // that carry it in the screenshots.
  const TOOL_ALERTS = [
    "J Bar Missing",
    "Socket Toolset Missing",
    "Power Ratchet Missing",
    "Standard Hand Tools Safety Tip Box Cutter Missing",
    "18\" Bolt Cutters Missing",
    "Wheel Chocks Missing",
    "Pallet Jack Missing",
    "Missing Assets",
  ];

  const VADS_REJECT = ["Assets Rejection (VADs)", "Assets Rejected (VADs)"];

  const SCRAPED = [
    // ── Column 1 · PLANNING / READY TO BOOK (19 total, 10 captured) ────
    { col:0, title:"TRUCK 13-465325", deliveryDate:"25 Nov 2026", status:PLANNING, activity:VADS_DONE, updatedAt:"Nov 25, 2026, 03:53 AM" },
    { col:0, title:"TRUCK 12-465324", deliveryDate:"25 Nov 2026", status:PLANNING, activity:VADS_DONE, updatedAt:"Nov 25, 2026, 03:53 AM" },
    { col:0, title:"TRUCK 11-465323", deliveryDate:"25 Nov 2026", status:PLANNING, activity:VADS_DONE, updatedAt:"Nov 25, 2026, 03:53 AM" },
    { col:0, title:"TRUCK 10-465322", deliveryDate:"25 Nov 2026", status:PLANNING, activity:VADS_DONE, updatedAt:"Nov 25, 2026, 03:52 AM" },
    { col:0, title:"TRUCK 9-465321",  deliveryDate:"25 Nov 2026", status:PLANNING, activity:VADS_DONE, updatedAt:"Nov 25, 2026, 03:52 AM" },
    { col:0, title:"TRUCK 8-465320",  deliveryDate:"25 Nov 2026", status:PLANNING, activity:VADS_DONE, updatedAt:"Nov 25, 2026, 03:52 AM" },
    // CLIPPED: TRUCK 7 timestamp not visible; follows the 03:52 run above.
    { col:0, title:"TRUCK 7-465319",  deliveryDate:"25 Nov 2026", status:PLANNING, activity:VADS_DONE, updatedAt:"Nov 25, 2026, 03:52 AM" },
    { col:0, title:"TRUCK 3-465315",  deliveryDate:"25 Nov 2026", status:PLANNING, activity:VADS_DONE, updatedAt:"Nov 25, 2026, 03:52 AM" },
    { col:0, title:"TRUCK 2-465314",  deliveryDate:"25 Nov 2026", status:PLANNING, activity:VADS_DONE, updatedAt:"Nov 25, 2026, 03:52 AM" },
    { col:0, title:"TRUCK 1-465313",  deliveryDate:"25 Nov 2026", status:PLANNING, activity:VADS_DONE, updatedAt:"Nov 25, 2026, 03:51 AM" },

    // ── Column 3 · DELIVERY IN PROGRESS (1 total, 1 captured) ──────────
    {
      col:2, title:"TRUCK 3-462772", status:DELIVERY,
      alertCount:9,
      alerts: TOOL_ALERTS.concat(["Missed Delivery Due Date"]),
    },

    // ── Column 5 · ISH OFFLOAD / DELIVERY COMPLETED (205, 6 captured) ──
    {
      col:4, title:"TRUCK 14-464628", status:OFFLOAD,
      alertCount:8,
      alerts: TOOL_ALERTS,
    },
    {
      col:4, title:"TRUCK 13-464627",
      // AI strings are CLIPPED by the live UI's own truncation.
      ai: [
        "The Signature of Shippe",
        "The image shows a Cra",
        "The bill of lading's Spec",
      ],
      aiMore: 3,
      deliveryDate:"24 Nov 2026", status:OFFLOAD,
      activity:"Return to ISH (New) Completed", updatedAt:"Nov 24, 2026, 11:42 PM",
    },
    {
      col:4, title:"TRUCK 12-464626",
      alertCount:2, alerts: VADS_REJECT,
      ai: [
        "The Signature of Shipp",
        "The image is a Crane W",
        "The Bill of Lading conta",
      ],
      deliveryDate:"24 Nov 2026", status:OFFLOAD,
    },
    {
      col:4, title:"TRUCK 9-464623", status:OFFLOAD,
      // Badge reads 6; the screenshot exposes 5 before the card is cut off.
      alertCount:6,
      alerts: VADS_REJECT.concat([
        "Pre Offload Checklist - Truck not switched off",
        "Pre Offload Checklist - VADs has not received the keys",
        "Pre Offload Checklist - POC contact not initiated",
      ]),
    },
    {
      col:4, title:"TRUCK 4-464618",
      notifCount:2,
      notifications: ["Safety Glasses Missing", "J Bar Missing"],
      ai: [
        "The Signature of Shipp",
        "The image is a Crane W",
        "The Crane Worldwide L",
      ],
      deliveryDate:"24 Nov 2026", status:OFFLOAD,
    },
    {
      col:4, title:"TRUCK 3-464617", status:OFFLOAD,
      alertCount:2, alerts: VADS_REJECT,
      ai: [
        "The Shipper Signature/",
        "The document is a Cran",
        "The legible text on the",
      ],
    },

    // ── Column 6 · NO STATUS (header count reads 0, 2 cards present) ───
    { col:5, title:"TEST-P1-2", parent:"TEST-P1", activity:"TBD", updatedAt:"Nov 20, 2026, 05:18 PM" },
    { col:5, title:"TEST-P1-1", parent:"TEST-P1", activity:"TBD", updatedAt:"Nov 20, 2026, 05:18 PM" },
  ];

  // Register Crane as a first-class client schema + stage set so the
  // detail page, progress tracker and client filter all understand a
  // board card the same way they understand a generated transaction.
  D.CLIENT_SCHEMAS.crane = {
    name:        "Crane Worldwide",
    ref:         "Truck",
    pickup:      "Pickup Date",
    delivery:    "Delivery Date",
    origin:      "Origin",
    destination: "Destination",
    driver:      "Driver",
    site:        "Site Code",
    eta:         "ETA",
    stage:       "Status",
    activity:    "Activity",
  };
  D.STAGE_LABELS.crane = COLUMNS.map(c => c.label);

  // Hydrate each scraped card into a transaction-shaped object so a click
  // still opens the existing detail page. Activity sections are cloned
  // from the mock template — the board screenshots don't expose them.
  const template = D.TRANSACTIONS[0];
  const CARDS = SCRAPED.map((c, i) => {
    const alerts        = c.alerts        || [];
    const notifications = c.notifications || [];
    const activities = JSON.parse(JSON.stringify(template.activities)).map(a => ({
      ...a,
      id: c.title + "-" + a.id,
      assets: a.assets.map(x => ({ ...x, id: c.title + "-" + x.id })),
    }));

    return {
      id: 9000 + i,
      clientKey: "crane",
      col: c.col,
      stageIdx: c.col,
      title: c.title,
      parent: c.parent || null,

      alerts,
      alertCount: c.alertCount != null ? c.alertCount : alerts.length,
      notifications,
      notifCount: c.notifCount != null ? c.notifCount : notifications.length,
      ai: c.ai || [],
      aiMore: c.aiMore || 0,

      deliveryDate: c.deliveryDate || "",
      status:       c.status || "",
      activity:     c.activity || "",
      updatedAt:    c.updatedAt || "",

      priority: null,
      driver: { ...template.driver, onRoute: alerts.length === 0 },
      values: {
        ref:         c.title,
        pickup:      "",
        delivery:    c.deliveryDate || "",
        origin:      "",
        destination: "",
        driver:      "",
        site:        "",
        eta:         "",
        stage:       c.status || "",
        activity:    c.activity || "",
      },
      activities,
      assets: activities.flatMap(a => a.assets),
    };
  });

  return { COLUMNS, CARDS };
})();
