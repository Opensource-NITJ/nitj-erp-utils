(function () {
  "use strict";

  if (location.pathname.startsWith("/erp/library_seating")) return;

  const CSS = `
    html { background: #08111F !important; }
    body {
      background-color: #08111F !important;
      color: #E2EAF4 !important;
      visibility: visible !important;
      opacity: 1 !important;
    }

    /*  CSS Variables  */
    :root {
      --bg-base:        #08111F;
      --bg-surface:     #0D1B2E;
      --bg-panel:       #111E30;
      --bg-raised:      #162436;
      --bg-hover:       #1C2E44;
      --bg-input:       #0F1E30;
      --border:         #1F3352;
      --border-strong:  #2A4570;
      --text-primary:   #E2EAF4;
      --text-secondary: #94A8C0;
      --text-muted:     #5A7A99;
      --accent-blue:    #3B82F6;
      --accent-blue-2:  #1D4ED8;
      --accent-glow:    rgba(59,130,246,0.18);
      --success:        #10B981;
      --warning:        #F59E0B;
      --danger:         #EF4444;
      color-scheme: dark;
    }

    /*  Scrollbar  */
    ::-webkit-scrollbar { width: 7px; height: 7px; }
    ::-webkit-scrollbar-track { background: var(--bg-base); }
    ::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--accent-blue); }

    /*  Base  */
    html, body {
      background-color: var(--bg-base) !important;
      color: var(--text-primary) !important;
    }

    .container, .container-fluid, .row, [class*="col-"] {
      background-color: transparent !important;
    }

    /*  Login Page  */
    body[style*="background-color:#e9ecef"],
    body[style*="background-color: #e9ecef"] {
      background-color: var(--bg-base) !important;
    }

    .login-card {
      background: var(--bg-panel) !important;
      border: 1px solid var(--border-strong) !important;
      box-shadow: 0 20px 60px rgba(0,0,0,0.7) !important;
      border-radius: 14px !important;
    }

    .login-heading, h1.login-heading {
      color: #93C5FD !important;
    }

    /*  Top Header  */
    div[style*="background-color:#003A6A"],
    div[style*="background-color: #003A6A"],
    .container-fluid[style*="background-color:#003A6A"] {
      background: linear-gradient(135deg, #071527 0%, #0B1E38 100%) !important;
      border-bottom: 1px solid var(--border) !important;
    }

    .row[style*="background-color:#FECD0B"],
    div[style*="background-color:#FECD0B"] {
      background-color: #F59E0B !important;
    }

    .logo2 p, .logo2 span, .logo2 a { color: #C8DCF4 !important; }

    /*  Navbar  */
    .navbar, .navbar-inverse {
      background: linear-gradient(90deg, #071527 0%, #0B2040 100%) !important;
      border-bottom: 1px solid var(--border) !important;
      box-shadow: 0 2px 12px rgba(0,0,0,0.5) !important;
    }

    .navbar-inverse .navbar-brand,
    .navbar-inverse .navbar-nav > li > a,
    .navbar-inverse .navbar-text { color: var(--text-secondary) !important; }

    .navbar-inverse .navbar-nav > li > a:hover,
    .navbar-inverse .navbar-nav > li > a:focus {
      color: #60A5FA !important;
      background-color: var(--bg-hover) !important;
    }

    .navbar-inverse .navbar-nav > li.open > a {
      background-color: var(--bg-hover) !important;
      color: #93C5FD !important;
    }

    font[color="#F7DC6F"] { color: #FDE68A !important; }

    /*  Dropdown  */
    .dropdown-menu {
      background: var(--bg-raised) !important;
      border: 1px solid var(--border-strong) !important;
      box-shadow: 0 8px 32px rgba(0,0,0,0.7) !important;
      border-radius: 6px !important;
    }

    .dropdown-menu > li > a { color: var(--text-secondary) !important; }
    .dropdown-menu > li > a:hover, .dropdown-menu > li > a:focus {
      background-color: var(--bg-hover) !important;
      color: #93C5FD !important;
    }

    .dropdown-menu > .active > a {
      background-color: var(--accent-blue-2) !important;
      color: white !important;
    }

    /*  Panels  */
    .panel, .card {
      background: var(--bg-panel) !important;
      border: 1px solid var(--border) !important;
      box-shadow: 0 4px 20px rgba(0,0,0,0.4) !important;
      border-radius: 8px !important;
    }

    .panel-body, .card-body, .tab-content, .tab-pane, .tab-content > .tab-pane, .tab-pane.active {
      background-color: var(--bg-panel) !important;
      color: var(--text-primary) !important;
    }

    .panel-heading, .panel-head, .panel-title {
      background: linear-gradient(90deg, #0F2D5E 0%, #163566 100%) !important;
      color: #E0EFFF !important;
      border-bottom: 1px solid var(--border-strong) !important;
      font-weight: 600 !important;
      letter-spacing: 0.3px !important;
    }

    .panel-footer, .card-footer {
      background-color: var(--bg-surface) !important;
      border-top: 1px solid var(--border) !important;
      color: var(--text-secondary) !important;
    }

    /*  Tables  */
    .table-responsive {
      overflow-x: auto !important;
      -webkit-overflow-scrolling: touch !important;
    }

    .table, table {
      background-color: transparent !important;
      color: var(--text-primary) !important;
    }

    .table > thead > tr > th, table th {
      background-color: #0F2447 !important;
      color: #93C5FD !important;
      border-color: var(--border-strong) !important;
      font-size: 0.82em !important;
      text-transform: uppercase !important;
      letter-spacing: 0.4px !important;
      padding: 9px 10px !important;
    }

    .table > tbody > tr > td, .table > tfoot > tr > td, table td {
      background-color: var(--bg-panel) !important;
      color: var(--text-primary) !important;
      border-color: var(--border) !important;
      vertical-align: middle !important;
    }

    .table-striped > tbody > tr:nth-of-type(odd) > td {
      background-color: var(--bg-raised) !important;
    }

    .table > tbody > tr:hover > td {
      background-color: var(--bg-hover) !important;
    }

    .table > tbody > tr:hover > td span:not([class*="label-"]) {
      color: var(--text-primary) !important;
    }

    [style*="background-color: white"],
    [style*="background-color:white"],
    [style*="background-color:#fff"],
    [style*="background-color: #fff"],
    [style*="background-color:#FFF"],
    [style*="background-color:#ffffff"],
    [style*="background-color: #ffffff"],
    [style*="background-color:#FFFFFF"],
    [style*="background-color: #FFFFFF"],
    [style*="background:#fff"],
    [style*="background:white"],
    [style*="background: white"],
    [style*="background-color:#eee" i],
    [style*="background-color: #eee" i],
    [style*="background-color:#f5" i],
    [style*="background-color: #f5" i],
    [style*="background-color:#f8" i],
    [style*="background-color: #f8" i],
    [style*="background-color:#f9" i],
    [style*="background-color: #f9" i],
    [style*="background-color:#e9" i],
    [style*="background-color: #e9" i],
    [style*="background-color:#ddd" i],
    [style*="background-color: #ddd" i],
    [style*="background-color:#faf" i],
    [style*="background-color: #faf" i],
    [style*="background-color:#f0" i],
    [style*="background-color: #f0" i],
    [style*="background-color:#f1" i],
    [style*="background-color: #f1" i],
    [style*="background-color:whitesmoke" i],
    [style*="background-color: whitesmoke" i],
    [style*="background:#eee" i],
    [style*="background: #eee" i],
    [style*="background:#f5" i],
    [style*="background: #f5" i],
    [style*="background:#f8" i],
    [style*="background: #f8" i],
    [style*="background:#f9" i],
    [style*="background: #f9" i] {
      background-color: var(--bg-panel) !important;
      color: var(--text-primary) !important;
    }

    [style*="color:#000000"], [style*="color: #000000"],
    [style*="color:black"], [style*="color: black"],
    font[color="#000000"] {
      color: var(--text-primary) !important;
    }

    /*  Sidebar Menu (Academic)  */
    .panel .nav > li > a {
      color: var(--text-secondary) !important;
      border-bottom: 1px solid var(--border) !important;
    }

    .panel .nav > li > a:hover,
    .panel .nav > li > a:focus {
      color: #93C5FD !important;
      background: var(--bg-hover) !important;
    }

    .panel .nav > li > a:active {
      color: white !important;
      background: var(--bg-raised) !important;
    }

    .panel .nav > li.active > a,
    .panel .nav > li.active > a:hover,
    .panel .nav > li.active > a:focus,
    .panel .nav > li.active > a:active {
      background: linear-gradient(90deg, var(--accent-blue-2), var(--accent-blue)) !important;
      color: white !important;
      border-color: var(--accent-blue) !important;
    }

    /*  Guest House: Custom Classes  */
    .menu-container {
      background: var(--bg-panel) !important;
      border: 1px solid var(--border) !important;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3) !important;
    }

    .menu-header {
      background: linear-gradient(90deg, #0F2D5E, #163566) !important;
      color: #93C5FD !important;
      border-bottom: 1px solid var(--border-strong) !important;
    }

    .menu-item {
      color: var(--text-secondary) !important;
      border-bottom: 1px solid var(--border) !important;
    }

    .menu-item i { color: #60A5FA !important; }

    .menu-item:hover {
      background: var(--bg-hover) !important;
      color: #93C5FD !important;
    }

    .menu-item.active {
      background: linear-gradient(90deg, var(--accent-blue-2), var(--accent-blue)) !important;
      color: white !important;
    }

    .menu-item.active i { color: white !important; }

    .gh-card, .gh-card2, [class*="gh-card"], .room-card, .gh-room {
      background: var(--bg-raised) !important;
      border: 1px solid var(--border) !important;
      color: var(--text-primary) !important;
      border-radius: 8px !important;
    }

    .gh-card2:hover, [class*="gh-card"]:hover, .room-card:hover {
      border-color: var(--accent-blue) !important;
      box-shadow: 0 8px 24px rgba(59,130,246,0.2) !important;
    }

    .gh-title { color: #93C5FD !important; }
    .gh-sub { color: var(--text-secondary) !important; }
    .gh-price, [style*="color:#003a6a"], [style*="color: #003a6a"],
    [style*="color:#3371b7"], [style*="color: #3371b7"] {
      color: #60A5FA !important;
    }

    .facilities li { color: var(--text-secondary) !important; }

    /* All Custom Forms & Booking Forms */
    .custom-form,
    .custom-form1,
    .custom-form2,
    .custom-form3,
    [class*="custom-form"],
    .gh-booking-form,
    .booking-form {
      background: var(--bg-panel) !important;
      border: 1px solid var(--border) !important;
      box-shadow: 0 3px 10px rgba(0,0,0,0.3) !important;
      color: var(--text-primary) !important;
      border-radius: 8px !important;
    }

    /* All Section Titles */
    .section-title,
    .section-title1,
    .section-title2,
    .section-title3,
    [class*="section-title"] {
      background: linear-gradient(90deg, #0F2D5E, #163566) !important;
      color: #93C5FD !important;
      border-left: 4px solid var(--accent-blue) !important;
      border-right: 1px solid var(--border-strong) !important;
      border-top: 1px solid var(--border-strong) !important;
      border-bottom: 1px solid var(--border-strong) !important;
      box-shadow: 1px 1px 5px 1px rgba(59,130,246,0.3) !important;
      border-radius: 6px !important;
      padding: 10px 14px !important;
    }

    .gh-card, .gh-card2, [class*="gh-card"], .custom-form2, [class*="custom-form"], .menu-container {
      --card: var(--bg-raised);
      --border: #1F3352;
    }

    /*  Tabs & Nav  */
    .nav-tabs { border-bottom: 2px solid var(--border-strong) !important; }

    .nav-tabs > li > a,
    .nav-pills > li > a,
    .nav > li > a,
    .nav-stacked > li > a,
    [role="tab"],
    [data-toggle="tab"],
    [data-toggle="pill"] {
      color: var(--text-secondary) !important;
      background: transparent !important;
      border: 1px solid transparent !important;
    }

    .nav-tabs > li > a:hover,
    .nav-tabs > li > a:focus,
    .nav-pills > li > a:hover,
    .nav-pills > li > a:focus,
    .nav > li > a:hover,
    .nav > li > a:focus,
    .nav-stacked > li > a:hover,
    .nav-stacked > li > a:focus,
    [role="tab"]:hover,
    [role="tab"]:focus,
    [data-toggle="tab"]:hover,
    [data-toggle="tab"]:focus,
    [data-toggle="pill"]:hover,
    [data-toggle="pill"]:focus {
      color: #93C5FD !important;
      border-color: var(--border) !important;
      background-color: var(--bg-hover) !important;
    }

    .nav-tabs > li > a:active,
    .nav-pills > li > a:active,
    .nav > li > a:active,
    .nav-stacked > li > a:active,
    [role="tab"]:active,
    [data-toggle="tab"]:active,
    [data-toggle="pill"]:active {
      color: white !important;
      background-color: var(--bg-raised) !important;
    }

    .nav-tabs > li.active > a,
    .nav-tabs > li.active > a:hover,
    .nav-tabs > li.active > a:focus,
    .nav-tabs > li.active > a:active,
    .nav-pills > li.active > a,
    .nav-pills > li.active > a:hover,
    .nav-pills > li.active > a:focus,
    .nav-pills > li.active > a:active,
    .nav > li.active > a,
    .nav > li.active > a:hover,
    .nav > li.active > a:focus,
    .nav > li.active > a:active,
    .nav-stacked > li.active > a,
    .nav-stacked > li.active > a:hover,
    .nav-stacked > li.active > a:focus,
    .nav-stacked > li.active > a:active,
    [role="tab"][aria-selected="true"],
    [data-toggle="tab"].active,
    [data-toggle="tab"].active:hover,
    [data-toggle="tab"].active:focus,
    [data-toggle="tab"].active:active,
    [data-toggle="pill"].active,
    [data-toggle="pill"].active:hover,
    [data-toggle="pill"].active:focus,
    [data-toggle="pill"].active:active {
      background: linear-gradient(180deg, #0F2D5E 0%, #0B2447 100%) !important;
      background-color: #0F2D5E !important;
      color: white !important;
      border-color: var(--border-strong) !important;
      border-bottom-color: transparent !important;
    }

    /*  Sidebar Navigation / Tabs (/html/body/div[2]/div/div[1]/div/div[2])  */
    body > div:nth-of-type(2) > div > div:first-child > div > div:nth-of-type(2),
    body > div:nth-child(2) > div > div:first-child > div > div:nth-child(2) {
      background-color: var(--bg-panel) !important;
      color: var(--text-primary) !important;
      border-color: var(--border) !important;
    }

    body > div:nth-of-type(2) > div > div:first-child > div > div:nth-of-type(2) a,
    body > div:nth-of-type(2) > div > div:first-child > div > div:nth-of-type(2) li > a,
    body > div:nth-of-type(2) > div > div:first-child > div > div:nth-of-type(2) button,
    body > div:nth-child(2) > div > div:first-child > div > div:nth-child(2) a,
    body > div:nth-child(2) > div > div:first-child > div > div:nth-child(2) li > a,
    body > div:nth-child(2) > div > div:first-child > div > div:nth-child(2) button {
      color: var(--text-secondary) !important;
      background-color: transparent;
    }

    body > div:nth-of-type(2) > div > div:first-child > div > div:nth-of-type(2) a:hover,
    body > div:nth-of-type(2) > div > div:first-child > div > div:nth-of-type(2) a:focus,
    body > div:nth-of-type(2) > div > div:first-child > div > div:nth-of-type(2) li > a:hover,
    body > div:nth-of-type(2) > div > div:first-child > div > div:nth-of-type(2) li > a:focus,
    body > div:nth-of-type(2) > div > div:first-child > div > div:nth-of-type(2) button:hover,
    body > div:nth-of-type(2) > div > div:first-child > div > div:nth-of-type(2) button:focus,
    body > div:nth-child(2) > div > div:first-child > div > div:nth-child(2) a:hover,
    body > div:nth-child(2) > div > div:first-child > div > div:nth-child(2) a:focus,
    body > div:nth-child(2) > div > div:first-child > div > div:nth-child(2) li > a:hover,
    body > div:nth-child(2) > div > div:first-child > div > div:nth-child(2) li > a:focus,
    body > div:nth-child(2) > div > div:first-child > div > div:nth-child(2) button:hover,
    body > div:nth-child(2) > div > div:first-child > div > div:nth-child(2) button:focus {
      color: #93C5FD !important;
      background-color: var(--bg-hover) !important;
    }

    body > div:nth-of-type(2) > div > div:first-child > div > div:nth-of-type(2) a:active,
    body > div:nth-of-type(2) > div > div:first-child > div > div:nth-of-type(2) li > a:active,
    body > div:nth-of-type(2) > div > div:first-child > div > div:nth-of-type(2) button:active,
    body > div:nth-child(2) > div > div:first-child > div > div:nth-child(2) a:active,
    body > div:nth-child(2) > div > div:first-child > div > div:nth-child(2) li > a:active,
    body > div:nth-child(2) > div > div:first-child > div > div:nth-child(2) button:active {
      color: white !important;
      background-color: var(--bg-raised) !important;
    }

    body > div:nth-of-type(2) > div > div:first-child > div > div:nth-of-type(2) .active,
    body > div:nth-of-type(2) > div > div:first-child > div > div:nth-of-type(2) .active > a,
    body > div:nth-of-type(2) > div > div:first-child > div > div:nth-of-type(2) a.active,
    body > div:nth-of-type(2) > div > div:first-child > div > div:nth-of-type(2) .active > a:hover,
    body > div:nth-of-type(2) > div > div:first-child > div > div:nth-of-type(2) .active > a:focus,
    body > div:nth-of-type(2) > div > div:first-child > div > div:nth-of-type(2) .active > a:active,
    body > div:nth-of-type(2) > div > div:first-child > div > div:nth-of-type(2) a.active:hover,
    body > div:nth-of-type(2) > div > div:first-child > div > div:nth-of-type(2) a.active:focus,
    body > div:nth-of-type(2) > div > div:first-child > div > div:nth-of-type(2) a.active:active,
    body > div:nth-child(2) > div > div:first-child > div > div:nth-child(2) .active,
    body > div:nth-child(2) > div > div:first-child > div > div:nth-child(2) .active > a,
    body > div:nth-child(2) > div > div:first-child > div > div:nth-child(2) a.active,
    body > div:nth-child(2) > div > div:first-child > div > div:nth-child(2) .active > a:hover,
    body > div:nth-child(2) > div > div:first-child > div > div:nth-child(2) .active > a:focus,
    body > div:nth-child(2) > div > div:first-child > div > div:nth-child(2) .active > a:active,
    body > div:nth-child(2) > div > div:first-child > div > div:nth-child(2) a.active:hover,
    body > div:nth-child(2) > div > div:first-child > div > div:nth-child(2) a.active:focus,
    body > div:nth-child(2) > div > div:first-child > div > div:nth-child(2) a.active:active {
      background: linear-gradient(180deg, #0F2D5E 0%, #0B2447 100%) !important;
      background-color: #0F2D5E !important;
      color: white !important;
      border-color: var(--border-strong) !important;
    }

    /*  Buttons  */
    .btn-default {
      background-color: var(--bg-raised) !important;
      color: var(--text-secondary) !important;
      border-color: var(--border-strong) !important;
    }

    .btn-default:hover {
      background-color: var(--bg-hover) !important;
      color: var(--text-primary) !important;
      border-color: var(--accent-blue) !important;
    }

    .btn-primary {
      background: linear-gradient(135deg, #1D4ED8, #2563EB) !important;
      border-color: #1D4ED8 !important;
      color: white !important;
    }

    .btn-primary:hover {
      background: linear-gradient(135deg, #2563EB, #3B82F6) !important;
      box-shadow: 0 4px 12px rgba(59,130,246,0.35) !important;
    }

    .btn-primary:focus {
      outline: none !important;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.4) !important; /* subtle focus ring */
    }

    .btn-primary:active {
      background: linear-gradient(135deg, #1E40AF, #1D4ED8) !important; /* darker pressed blue */
      transform: scale(0.98);
      box-shadow: none !important;
    }

    .btn-success {
      background: linear-gradient(135deg, #059669, #10B981) !important;
      border-color: #059669 !important;
      color: white !important;
    }

    .btn-danger {
      background: linear-gradient(135deg, #B91C1C, #EF4444) !important;
      border-color: #B91C1C !important;
      color: white !important;
    }

    .btn-info {
      background: linear-gradient(135deg, #0369A1, #0EA5E9) !important;
      border-color: #0369A1 !important;
      color: white !important;
    }

    button[style*="background-color:red"],
    button[style*="background-color: red"],
    input[type="button"][style*="background-color:red"] {
      background: linear-gradient(135deg, #B91C1C, #EF4444) !important;
      border-color: #B91C1C !important;
      color: white !important;
    }

    /*  Forms  */
    .form-control, input, select, textarea {
      background-color: var(--bg-input) !important;
      color: var(--text-primary) !important;
      border: 1px solid var(--border-strong) !important;
      border-radius: 5px !important;
    }

    .form-control:focus, input:focus, select:focus, textarea:focus {
      background-color: var(--bg-raised) !important;
      border-color: var(--accent-blue) !important;
      box-shadow: 0 0 0 3px var(--accent-glow) !important;
      outline: none !important;
    }

    select option {
      background-color: var(--bg-raised) !important;
      color: var(--text-primary) !important;
    }

    .input-group-addon {
      background-color: var(--bg-raised) !important;
      border: 1px solid var(--border-strong) !important;
      color: var(--text-secondary) !important;
    }

    legend {
      color: var(--text-primary) !important;
      border-bottom-color: var(--border-strong) !important;
    }

    .help-block {
      color: var(--text-muted) !important;
    }

    /* Content & Form Containers */
    .form-group,
    form > div,
    .panel-body form > div,
    .panel-body > div > div > div {
      border-color: var(--border) !important;
      color: var(--text-primary) !important;
    }

    #captchaImage {
      border-color: var(--border-strong) !important;
      border-radius: 8px !important;
      filter: contrast(1.1) brightness(0.95) !important;
    }

    /*  Labels & Badges  */
    .label-success {
      background: linear-gradient(135deg, #059669, #10B981) !important;
      color: white !important;
    }

    .label-primary {
      background: linear-gradient(135deg, #1D4ED8, #3B82F6) !important;
      color: white !important;
    }

    .label-danger {
      background: linear-gradient(135deg, #B91C1C, #EF4444) !important;
      color: white !important;
    }

    .label-warning {
      background: linear-gradient(135deg, #B45309, #F59E0B) !important;
      color: white !important;
    }

    .label-info {
      background: linear-gradient(135deg, #0369A1, #06B6D4) !important;
      color: white !important;
    }

    .label-default {
      background-color: var(--bg-raised) !important;
      border: 1px solid var(--border-strong) !important;
      color: var(--text-primary) !important;
    }

    .table > tbody > tr:hover > td .label-default {
      background-color: var(--border-strong) !important;
      color: #FFFFFF !important;
    }

    /*  Links  */
    a { color: #60A5FA !important; }
    a:hover { color: #93C5FD !important; text-decoration: none !important; }

    /* Button Links */
    a.btn-primary, a.btn-success, a.btn-danger, a.btn-info {
      color: white !important;
    }
    a.btn-default {
      color: var(--text-primary) !important;
    }

    /*  Text  */
    label { color: var(--text-secondary) !important; }
    .text-danger { color: #F87171 !important; }
    .text-success { color: #34D399 !important; }
    .text-muted { color: var(--text-muted) !important; }
    h1,h2,h3,h4,h5,h6 { color: var(--text-primary) !important; }

    /*  Well / Alert  */
    .well {
      background-color: var(--bg-raised) !important;
      border-color: var(--border) !important;
    }

    .alert-info {
      background-color: #0C2340 !important;
      border-color: #1D4ED8 !important;
      color: #93C5FD !important;
    }

    .alert-success {
      background-color: #052E1C !important;
      border-color: #059669 !important;
      color: #6EE7B7 !important;
    }

    .alert-danger {
      background-color: #2D0A0A !important;
      border-color: #B91C1C !important;
      color: #FCA5A5 !important;
    }

    .alert-warning {
      background-color: #2D1A00 !important;
      border-color: #B45309 !important;
      color: #FDE68A !important;
    }

    .badge {
      background-color: var(--border-strong) !important;
      color: #FFFFFF !important;
    }

    /*  Breadcrumb & Page Header  */
    .breadcrumb {
      background-color: var(--bg-raised) !important;
      border: 1px solid var(--border) !important;
      color: var(--text-secondary) !important;
      border-radius: 6px !important;
    }

    .breadcrumb > li,
    .breadcrumb > li + li:before {
      color: var(--text-muted) !important;
    }

    .breadcrumb > .active {
      color: var(--text-primary) !important;
    }

    .page-header {
      border-bottom-color: var(--border-strong) !important;
      color: var(--text-primary) !important;
    }

    /*  List Group  */
    .list-group-item {
      background-color: var(--bg-panel) !important;
      border-color: var(--border) !important;
      color: var(--text-primary) !important;
    }

    .list-group-item:hover, .list-group-item:focus,
    a.list-group-item:hover, a.list-group-item:focus,
    button.list-group-item:hover, button.list-group-item:focus {
      background-color: var(--bg-hover) !important;
      color: #93C5FD !important;
    }

    .list-group-item:active,
    a.list-group-item:active,
    button.list-group-item:active {
      background-color: var(--bg-raised) !important;
      color: white !important;
    }

    .list-group-item.active,
    .list-group-item.active:hover,
    .list-group-item.active:focus,
    .list-group-item.active:active,
    a.list-group-item.active,
    a.list-group-item.active:hover,
    a.list-group-item.active:focus,
    a.list-group-item.active:active,
    button.list-group-item.active,
    button.list-group-item.active:hover,
    button.list-group-item.active:focus,
    button.list-group-item.active:active {
      background-color: var(--accent-blue-2) !important;
      border-color: var(--accent-blue) !important;
      color: white !important;
    }

    /*  Callouts  */
    .bs-callout, .callout {
      background-color: var(--bg-raised) !important;
      border: 1px solid var(--border-strong) !important;
      border-left-width: 5px !important;
      color: var(--text-primary) !important;
      border-radius: 4px !important;
    }

    .bs-callout-info, .callout-info { border-left-color: var(--accent-blue) !important; }
    .bs-callout-success, .callout-success { border-left-color: var(--success) !important; }
    .bs-callout-warning, .callout-warning { border-left-color: var(--warning) !important; }
    .bs-callout-danger, .callout-danger { border-left-color: var(--danger) !important; }

    /*  Connect Program & Request Portal  */
    [class*="connect-"],
    [class*="connect_"],
    .connect-request,
    .connect-program,
    .connect-card,
    .connect-box {
      border-color: var(--border) !important;
      color: var(--text-primary) !important;
    }

    .checkbox label, .radio label {
      color: var(--text-primary) !important;
    }

    input[type="file"] {
      color: var(--text-secondary) !important;
    }

    /*  Modal  */
    .modal-content {
      background-color: var(--bg-panel) !important;
      border: 1px solid var(--border-strong) !important;
      box-shadow: 0 20px 60px rgba(0,0,0,0.8) !important;
      border-radius: 10px !important;
    }

    .modal-header {
      background: linear-gradient(90deg, #0F2D5E, #163566) !important;
      border-bottom: 1px solid var(--border-strong) !important;
      color: white !important;
    }

    .modal-footer {
      background-color: var(--bg-surface) !important;
      border-top: 1px solid var(--border) !important;
    }

    /*  Equipment Booking & Thumbnails  */
    .thumbnail,
    .equipment-card,
    .equipment-box,
    [class*="equipment"] {
      background-color: var(--bg-panel) !important;
      border: 1px solid var(--border) !important;
      border-radius: 8px !important;
      box-shadow: 0 4px 14px rgba(0,0,0,0.3) !important;
      color: var(--text-primary) !important;
    }

    .thumbnail:hover,
    .equipment-card:hover {
      border-color: var(--accent-blue) !important;
      box-shadow: 0 8px 24px rgba(59,130,246,0.2) !important;
    }

    .thumbnail .caption,
    .thumbnail h3,
    .thumbnail h4,
    .thumbnail p {
      color: var(--text-primary) !important;
    }

    .thumbnail .caption p {
      color: var(--text-secondary) !important;
    }

    /* Equipment Action Links / Buttons (e.g. form div > div > div > a) */
    form [class*="col-"] > div > div > a,
    .thumbnail .caption a {
      display: inline-block;
      text-decoration: none !important;
      border-radius: 6px !important;
      font-weight: 600 !important;
    }

    form [class*="col-"] > div > div > a:not(.btn-default):not(.btn-danger):not(.btn-warning),
    .thumbnail .caption a:not(.btn-default):not(.btn-danger):not(.btn-warning) {
      background: linear-gradient(135deg, #1D4ED8, #2563EB) !important;
      border: 1px solid #1D4ED8 !important;
      color: white !important;
      padding: 6px 16px !important;
      box-shadow: 0 2px 8px rgba(29,78,216,0.35) !important;
    }

    form [class*="col-"] > div > div > a:not(.btn-default):not(.btn-danger):not(.btn-warning):hover,
    .thumbnail .caption a:not(.btn-default):not(.btn-danger):not(.btn-warning):hover {
      background: linear-gradient(135deg, #2563EB, #3B82F6) !important;
      border-color: #3B82F6 !important;
      color: white !important;
      box-shadow: 0 4px 14px rgba(59,130,246,0.45) !important;
    }

    /* Datepicker / Calendar Popups */
    .datepicker,
    .ui-datepicker,
    .bootstrap-datetimepicker-widget,
    .daterangepicker {
      background-color: var(--bg-panel) !important;
      border: 1px solid var(--border-strong) !important;
      color: var(--text-primary) !important;
      box-shadow: 0 10px 30px rgba(0,0,0,0.6) !important;
      border-radius: 8px !important;
    }

    .datepicker table tr td,
    .datepicker table tr th,
    .ui-datepicker table td,
    .ui-datepicker table th,
    .daterangepicker td,
    .daterangepicker th {
      color: var(--text-primary) !important;
    }

    .datepicker table tr td.day:hover,
    .datepicker table tr td.focused,
    .ui-datepicker td:hover,
    .daterangepicker td.available:hover {
      background-color: var(--bg-hover) !important;
      color: #93C5FD !important;
    }

    .datepicker table tr td.active,
    .datepicker table tr td.active:hover,
    .ui-datepicker .ui-state-active,
    .daterangepicker td.active {
      background: linear-gradient(135deg, #1D4ED8, #2563EB) !important;
      color: white !important;
    }

    .datepicker table tr td.old,
    .datepicker table tr td.new,
    .daterangepicker td.off {
      color: var(--text-muted) !important;
    }

    /*  Misc  */
    hr { border-color: var(--border) !important; }

    .pagination > li > a, .pagination > li > span {
      background-color: var(--bg-raised) !important;
      border-color: var(--border) !important;
      color: var(--text-secondary) !important;
    }

    .pagination > li > a:hover {
      background-color: var(--bg-hover) !important;
      color: #93C5FD !important;
    }

    .pagination > .active > a {
      background-color: var(--accent-blue-2) !important;
      border-color: var(--accent-blue) !important;
      color: white !important;
    }

    .footer, footer {
      background: var(--bg-surface) !important;
      color: var(--text-secondary) !important;
      border-top: 1px solid var(--border) !important;
    }

    /* Homepage: Tiles & Marquee */
    .tiles .link-tiles {
      background: var(--bg-raised) !important;
      border: 1px solid var(--border) !important;
    }

    .tiles .link-tiles a {
      color: var(--text-secondary) !important;
    }

    .tiles .link-tiles:hover {
      background: var(--bg-hover) !important;
      border-color: var(--accent-blue) !important;
    }

    .tiles .link-tiles:hover a {
      color: #93C5FD !important;
    }

    .counselling-marquee {
      background: var(--bg-surface) !important;
      border-bottom-color: var(--border-strong) !important;
      animation: none !important;
    }

    .counselling-marquee:hover {
      background: var(--bg-hover) !important;
    }

    .marquee-text {
      color: #60A5FA !important;
    }

    .counselling-marquee:hover .marquee-text {
      color: #93C5FD !important;
    }

    @media print {
      :root { color-scheme: light; }
      body { background: white !important; color: black !important; }
    }
  `;

  function inject() {
    const el = document.createElement("style");
    el.id = "nitj-dark-v3";
    el.textContent = CSS;
    (document.head || document.documentElement).appendChild(el);
  }

  inject();

  document.addEventListener("DOMContentLoaded", () => {
    if (!document.getElementById("nitj-dark-v3")) inject();
  });

  const observer = new MutationObserver(() => {
    if (!document.getElementById("nitj-dark-v3")) inject();
  });

  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: false });
  } else {
    document.addEventListener("DOMContentLoaded", () => {
      observer.observe(document.body, { childList: true, subtree: false });
    });
  }
})();
