module.exports = {
  manifest_version: 3,

  name: "NITJ ERP Utils",

  version: "1.0",

  description:
    "An accessibility add-on to aid people and add more features on NITJ ERP website",

  host_permissions: ["https://v1.nitj.ac.in/erp/*"],

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
  ],
};
