export const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=Syne:wght@400;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:       #191724;
    --surface:  #1f1d2e;
    --panel:    #26233a;
    --border:   #312f44;
    --border2:  #403d52;
    --accent:   #9ccfd8;
    --accent2:  #f6c177;
    --accent3:  #ebbcba;
    --ok:       #31748f;
    --warn:     #f6c177;
    --error:    #eb6f92;
    --text:     #e0def4;
    --muted:    #908caa;
    --muted2:   #6e6a86;
    --mono:     'IBM Plex Mono', monospace;
    --sans:     'Syne', sans-serif;
  }

  @media (prefers-color-scheme: light) {
    :root {
      --bg:       #faf4ed;
      --surface:  #fffaf3;
      --panel:    #f2e9e1;
      --border:   #dfdad9;
      --border2:  #cecacd;
      --accent:   #56949f;
      --accent2:  #ea9d34;
      --accent3:  #d7827e;
      --ok:       #286983;
      --warn:     #ea9d34;
      --error:    #b4637a;
      --text:     #575279;
      --muted:    #797593;
      --muted2:   #9893a5;
    }
  }

  html, body, #root { height: 100%; background: radial-gradient(circle at top, var(--panel) 0%, var(--bg) 42%, color-mix(in srgb, var(--bg) 92%, #000 8%) 100%); color: var(--text); font-family: var(--mono); overflow: hidden; }

  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }

  .shell { display: grid; grid-template-rows: 44px 1fr; height: 100vh; }
  .topbar { display: flex; align-items: center; gap: 0; border-bottom: 1px solid var(--border); background: rgba(31, 29, 46, 0.92); backdrop-filter: blur(18px); padding: 0 16px; z-index: 100; }
  .body   { display: grid; grid-template-columns: 200px 1fr; overflow: hidden; }
  .sidebar { border-right: 1px solid var(--border); background: linear-gradient(180deg, rgba(31, 29, 46, 0.98) 0%, rgba(25, 23, 36, 0.96) 100%); display: flex; flex-direction: column; overflow-y: auto; }
  .main   { overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 20px; }

  .logo { font-family: var(--sans); font-weight: 800; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; color: var(--accent2); margin-right: 24px; white-space: nowrap; }
  .logo span { color: var(--muted); }
  .topbar-divider { width: 1px; height: 24px; background: var(--border); margin: 0 12px; }
  .status-pill { display: flex; align-items: center; gap: 6px; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; color: var(--muted); padding: 4px 10px; border: 1px solid var(--border); border-radius: 2px; }
  .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--ok); animation: pulse 2s infinite; flex-shrink: 0; }
  .dot.warn { background: var(--warn); }
  .dot.error { background: var(--error); }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }

  .topbar-right { margin-left: auto; display: flex; align-items: center; gap: 10px; }
  .avatar { width: 26px; height: 26px; border-radius: 50%; background: var(--accent3); display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 600; color: #fff; }
  .badge { font-size: 9px; background: var(--error); color: var(--surface); border-radius: 2px; padding: 1px 5px; letter-spacing: 0.5px; }
  .env-tag { font-size: 10px; padding: 3px 8px; border: 1px solid var(--accent2); color: var(--accent2); border-radius: 2px; letter-spacing: 1px; }

  .nav-section { padding: 16px 12px 8px; font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: var(--muted2); font-weight: 600; }
  .nav-item { display: flex; align-items: center; gap: 10px; padding: 8px 14px; font-size: 11px; color: var(--muted); cursor: pointer; border-left: 2px solid transparent; transition: all 0.15s; letter-spacing: 0.5px; }
  .nav-item:hover { color: var(--text); background: var(--panel); }
  .nav-item.active { color: var(--accent); border-left-color: var(--accent); background: rgba(196,167,231,0.10); }
  .nav-icon { font-size: 13px; width: 16px; text-align: center; flex-shrink: 0; }
  .nav-count { margin-left: auto; font-size: 9px; background: var(--border2); color: var(--muted); padding: 1px 6px; border-radius: 10px; }
  .nav-count.alert { background: rgba(235,111,146,0.16); color: var(--error); }
  .sidebar-footer { margin-top: auto; padding: 12px; border-top: 1px solid var(--border); }
  .ws-status { display: flex; align-items: center; gap: 6px; font-size: 10px; color: var(--muted); }

  .card { background: var(--panel); border: 1px solid var(--border); border-radius: 4px; }
  .card-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid var(--border); }
  .card-title { font-family: var(--sans); font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: var(--muted); }
  .card-body { padding: 16px; }

  .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
  .stat-card { background: var(--panel); border: 1px solid var(--border); padding: 14px 16px; border-radius: 4px; position: relative; overflow: hidden; }
  .stat-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; }
  .stat-card.ok::before { background: var(--ok); }
  .stat-card.warn::before { background: var(--warn); }
  .stat-card.accent::before { background: var(--accent); }
  .stat-card.purple::before { background: var(--accent3); }
  .stat-label { font-size: 9px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--muted); margin-bottom: 8px; }
  .stat-value { font-family: var(--sans); font-size: 26px; font-weight: 800; line-height: 1; margin-bottom: 4px; }
  .stat-sub { font-size: 10px; color: var(--muted); }
  .stat-delta { font-size: 10px; }
  .stat-delta.up { color: var(--ok); }
  .stat-delta.down { color: var(--error); }

  .data-table { width: 100%; border-collapse: collapse; font-size: 11px; }
  .data-table th { font-size: 9px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--muted2); padding: 8px 12px; text-align: left; border-bottom: 1px solid var(--border); font-weight: 600; }
  .data-table td { padding: 9px 12px; border-bottom: 1px solid var(--border); color: var(--text); vertical-align: middle; }
  .data-table tr:last-child td { border-bottom: none; }
  .data-table tr:hover td { background: rgba(224,222,244,0.03); }

  .method { font-size: 9px; padding: 2px 6px; border-radius: 2px; font-weight: 600; letter-spacing: 0.5px; }
  .method.GET    { background: rgba(49,116,143,0.14); color: var(--ok); border: 1px solid rgba(49,116,143,0.28); }
  .method.POST   { background: rgba(196,167,231,0.12); color: var(--accent); border: 1px solid rgba(196,167,231,0.24); }
  .method.PUT    { background: rgba(246,193,119,0.12); color: var(--warn); border: 1px solid rgba(246,193,119,0.24); }
  .method.DELETE { background: rgba(235,111,146,0.12); color: var(--error); border: 1px solid rgba(235,111,146,0.24); }
  .method.PATCH  { background: rgba(235,188,186,0.14); color: var(--accent3); border: 1px solid rgba(235,188,186,0.24); }

  .status-badge { font-size: 9px; padding: 2px 7px; border-radius: 2px; letter-spacing: 0.5px; font-weight: 600; }
  .status-badge.healthy  { background: rgba(49,116,143,0.14); color: var(--ok); }
  .status-badge.degraded { background: rgba(246,193,119,0.14); color: var(--warn); }
  .status-badge.down     { background: rgba(235,111,146,0.14); color: var(--error); }

  .bar-chart { display: flex; align-items: flex-end; gap: 2px; height: 32px; }
  .bar { flex: 1; background: var(--accent); opacity: 0.4; border-radius: 1px 1px 0 0; transition: opacity 0.2s; }
  .bar:hover { opacity: 1; }
  .bar.error-bar { background: var(--error); }

  .route-path { font-family: var(--mono); font-size: 11px; color: var(--accent); }
  .route-path span { color: var(--muted); }

  .toggle { width: 28px; height: 16px; border-radius: 8px; background: var(--border2); cursor: pointer; position: relative; transition: background 0.2s; flex-shrink: 0; }
  .toggle.on { background: var(--ok); }
  .toggle::after { content: ''; position: absolute; top: 2px; left: 2px; width: 12px; height: 12px; border-radius: 50%; background: var(--surface); transition: transform 0.2s; }
  .toggle.on::after { transform: translateX(12px); }

  .section-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .section-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }

  .log-stream { font-size: 10px; line-height: 1.7; max-height: 180px; overflow-y: auto; }
  .log-line { display: flex; gap: 10px; padding: 1px 0; }
  .log-time { color: var(--muted2); flex-shrink: 0; }
  .log-level { flex-shrink: 0; width: 42px; }
  .log-level.INFO  { color: var(--accent); }
  .log-level.WARN  { color: var(--warn); }
  .log-level.ERROR { color: var(--error); }
  .log-msg  { color: var(--text); opacity: 0.8; }
  .log-new { animation: logFade 0.4s ease; }
  @keyframes logFade { from { background: rgba(196,167,231,0.10); } to { background: transparent; } }

  .node-grid { display: flex; flex-wrap: wrap; gap: 8px; padding: 4px 0; }
  .node-chip { display: flex; align-items: center; gap: 7px; padding: 6px 10px; background: var(--surface); border: 1px solid var(--border); border-radius: 3px; font-size: 10px; }
  .node-chip.ok    { border-color: rgba(49,116,143,0.30); }
  .node-chip.warn  { border-color: rgba(246,193,119,0.30); }
  .node-chip.error { border-color: rgba(235,111,146,0.30); }

  .role-pill { font-size: 9px; padding: 2px 8px; border-radius: 10px; font-weight: 600; letter-spacing: 0.5px; }
  .role-pill.admin   { background: rgba(235,188,186,0.16); color: var(--accent3); }
  .role-pill.ops     { background: rgba(196,167,231,0.12); color: var(--accent); }
  .role-pill.readonly { background: var(--border); color: var(--muted); }

  .tabs { display: flex; gap: 0; border-bottom: 1px solid var(--border); margin-bottom: 16px; }
  .tab { padding: 8px 14px; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; cursor: pointer; color: var(--muted); border-bottom: 2px solid transparent; margin-bottom: -1px; transition: all 0.15s; }
  .tab.active { color: var(--accent); border-bottom-color: var(--accent); }
  .tab:hover:not(.active) { color: var(--text); }

  .btn { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; cursor: pointer; border-radius: 2px; transition: all 0.15s; font-family: var(--mono); font-weight: 500; border: 1px solid transparent; }
  .btn-primary { background: var(--accent); color: var(--bg); border-color: var(--accent); }
  .btn-primary:hover { opacity: 0.85; }
  .btn-ghost { background: transparent; color: var(--muted); border-color: var(--border); }
  .btn-ghost:hover { color: var(--text); border-color: var(--border2); }
  .btn-danger { background: transparent; color: var(--error); border-color: rgba(235,111,146,0.32); }
  .btn-danger:hover { background: rgba(235,111,146,0.10); }

  .sparkline { width: 60px; height: 20px; }

  .progress { height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; }
  .progress-fill { height: 100%; border-radius: 2px; transition: width 0.5s; }
  .progress-fill.ok { background: var(--ok); }
  .progress-fill.warn { background: var(--warn); }
  .progress-fill.error { background: var(--error); }
  .progress-fill.accent { background: var(--accent); }

  .code-tag { background: var(--surface); border: 1px solid var(--border); padding: 1px 5px; border-radius: 2px; font-size: 10px; color: var(--accent); }

  @keyframes slideIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  .fade-in { animation: slideIn 0.3s ease; }

  @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0.2; } }
  .ws-blink { animation: blink 1.2s infinite; }

  .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .flex { display: flex; }
  .items-center { align-items: center; }
  .gap-8 { gap: 8px; }
  .gap-6 { gap: 6px; }
  .ml-auto { margin-left: auto; }
  .text-muted { color: var(--muted); font-size: 10px; }
  .text-ok { color: var(--ok); }
  .text-error { color: var(--error); }
  .text-warn { color: var(--warn); }
  .text-accent { color: var(--accent); }
  .mono { font-family: var(--mono); }
`;
