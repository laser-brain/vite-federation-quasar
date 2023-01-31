import { fileURLToPath, URL } from "url";
import { defineConfig } from "vite";
import federation from "@originjs/vite-plugin-federation";
import vue from "@vitejs/plugin-vue";
import { quasar, transformAssetUrls } from "@quasar/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig({
  
    build: {
      target: "esnext",
      minify: false,
      cssCodeSplit: false,
      rollupOptions: {
        external: ["remote/QuasarExample"],
        output: {
          minifyInternalExports: false,
        },
      },
    },
    plugins: [
      vue({
        template: { transformAssetUrls },
      }),
      quasar({
        sassVariables: "src/styles/quasar-variables.sass",
      }),
      federation({
        remotes: {
          remote: {
            external: `Promise.resolve('http://localhost:5337/assets/remote.js')`,
            externalType: "promise",
          },
        },
        shared: {
          vue: {},
          quasar: {},
        },
      }),
    ],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
});
