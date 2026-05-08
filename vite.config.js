const { defineConfig } = require("vite");
const { crx } = require("@crxjs/vite-plugin");

module.exports = defineConfig(({ mode }) => {
  const isFirefox = mode === "firefox";

  const manifest = isFirefox
    ? require("./manifest.firefox.js")
    : require("./manifest.chromium.js");

  return {
    plugins: [crx({ manifest })],

    build: {
      outDir: isFirefox ? "dist/firefox" : "dist/chromium",

      emptyOutDir: true,
    },
  };
});
