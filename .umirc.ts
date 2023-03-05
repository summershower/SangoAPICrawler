import { defineConfig } from "umi";

export default defineConfig({
  title:"Sango API助手",
  favicons: ['https://cdn.meiqijiacheng.com/h5-deploy/favicon.ico'], 
  routes: [
    { path: "/", component: "index" },
  ],
  npmClient: 'pnpm',
  proxy: {
    '/yapiProxy':{
      target : 'http://192.168.11.185:40001',
      changeOrigin: true,
      pathRewrite: {
        '^/yapiProxy': '/api'
      }
    }
  }
});
