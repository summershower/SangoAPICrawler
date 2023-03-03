import { defineConfig } from "umi";

export default defineConfig({
  routes: [
    { path: "/", component: "index" },
  ],
  npmClient: 'pnpm',
  proxy: {
    '/api':{
      target : 'http://192.168.11.185:40001',
      changeOrigin: true,
    }
  }
});
