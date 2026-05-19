// Work to be done in the future to add a dark mode to the website. For now, this file is just a placeholder.
const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
if (isDarkMode) {

  (function () {
    const style = document.createElement("style");
    style.textContent =
      `body {
        background-color: #0B1220;
        color: #E5E7EB;
      }

      .logo {
        margin: 10px auto;
      }

      .logo2 {
        display: none;
      }

      .panel-head,
      .dropdown-header {
        font-family: verdana;
        color: #E5E7EB;
      }

      .panel-head {
        font-size: 18px;
      }

      .nav-tabs > li > a {
        color: #93C5FD;
        font-family: verdana;
        font-size: 13px;
        font-weight: bold;
      }

      .nav-tabs > li.active > a,
      .nav-tabs > li.active > a:hover,
      .nav-tabs > li.active > a:focus {
        background-color: #1E3A8A;
        color: #E5E7EB;
      }

      .tab-content > .tab-pane {
        background-color: #121A2B;
        border-top: 1px solid #1F2937;
        min-height: 220px;
        padding-top: 10px;
        color: #E5E7EB;
      }

      .tab-content > .tab-pane > ul > li,
      .tab-content > .tab-pane > ul > li > a {
        text-indent: -5px;
        color: #60A5FA;
        font-family: verdana;
        font-size: 13px;
        padding: 5px;
      }

      .tab-content > .tab-pane > ul > li > a:hover {
        color: #F87171;
      }

      .panels-contents table tbody tr td,
      table,
      table td {
        color: #E5E7EB !important;
        background-color: #1F2937 !important;
        font-family: verdana;
        font-size: 13px;
      }

      table {
        background-color: #121A2B;
      }

      table th {
        background-color: #1F2937;
        color: #F9FAFB;
      }

      table tr:nth-child(even) {
        background-color: #0F172A;
      }

      .panels-contents table tbody tr td a {
        color: #38BDF8;
      }

      .panels-contents table tbody tr td a:hover {
        color: #FFFFFF;
      }

      .dropdown-menu {
        background-color: #111827;
      }

      .dropdown-menu.columns-2 {
        min-width: 400px;
      }

      .dropdown-menu.columns-3 {
        min-width: 600px;
      }

      .dropdown-menu li a,
      .multi-column-dropdown li a {
        padding: 5px 15px;
        font-weight: 300;
        font-family: verdana;
        font-size: 12px;
        color: #D1D5DB;
        display: block;
        clear: both;
        line-height: 1.428571429;
        white-space: normal;
      }

      .dropdown-menu li a:hover,
      .multi-column-dropdown li a:hover {
        color: #FFFFFF;
        background-color: #1E3A8A;
        text-decoration: none;
      }

      .multi-column-dropdown {
        list-style: none;
      }

      .navbar-inverse {
        background-color: #0F172A;
        border-color: #1F2937;
      }

      .navbar-inverse .navbar-nav > li > a {
        font-family: verdana;
        font-size: 13px;
        color: #D1D5DB;
      }

      .navbar-inverse .navbar-nav > li > a:hover {
        color: #3B82F6;
      }

      .panel,
      .card,
      .link-tiles {
        background-color: #121A2B !important;
        border: 1px solid #1F2937;
        border-radius: 8px;
      }

      .panel-heading {
        background-color: #1E3A8A !important;
        color: #FFFFFF !important;
      }

      a {
        color: #FFFFFF !important;
      }

      a:hover {
        color: #3B82F6 !important;
      }

      label,
      .text-danger {
        color: #F87171 !important;
      }

      select,
      input {
        background-color: #1F2937 !important;
        color: #E5E7EB !important;
      }

      * {
        transition: background-color 0.3s ease, color 0.3s ease;
      }

      @media (max-width: 767px) {
        .dropdown-menu.multi-column {
          min-width: 240px !important;
          overflow-x: hidden;
        }

        .multi-column-dropdown li a {
          color: #D1D5DB;
          font-family: verdana;
        }

        .multi-column-dropdown li a:hover {
          color: #FFFFFF;
          background-color: transparent;
          text-decoration: none;
        }

        .dropdown-header {
          color: #E5E7EB;
        }
}
      `;
    document.documentElement.appendChild(style);
  })();
}
