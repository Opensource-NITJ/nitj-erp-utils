module.exports = {
  manifest_version: 3,

  name: "NITJ ERP Utils",

  version: "1.1",

  description:
    "An accessibility add-on to aid people and add more features on NITJ ERP website",

  host_permissions: ["https://v1.nitj.ac.in/erp/*"],

  browser_specific_settings: {
    gecko: {
      id: "nitj-erp-utils@opensourcenitj.com",
      data_collection_permissions: {
        required: ["none"],
      },
    },
  },

  icons: {
    48: "icons/48.png",
    96: "icons/96.png",
  },

  content_scripts: [
    {
      matches: ["https://v1.nitj.ac.in/erp/*"],

      js: ["packages/content/darkmode.js"],

      run_at: "document_start",
    },

    {
      matches: ["https://v1.nitj.ac.in/erp/login*"],

      js: ["packages/content/login.js"],

      run_at: "document_idle",
    },

    {
      matches: ["https://v1.nitj.ac.in/erp/attendance_report*"],

      js: ["packages/content/attendance.js"],

      run_at: "document_idle",
    },

    {
      matches: ["https://v1.nitj.ac.in/erp/attendance_report_detail.php*"],

      js: ["packages/content/calender_view.js"],

      run_at: "document_idle",
    },
  ],

  web_accessible_resources: [
    {
      resources: ["captcha.png"],
      matches: ["https://v1.nitj.ac.in/*"],
    },
  ],
};
