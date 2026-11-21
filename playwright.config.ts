import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests',timeout:30000,use:{baseURL:'http://localhost:4173',launchOptions:{executablePath:process.env.CHROMIUM_PATH},viewport:{width:1440,height:900}},webServer:{command:'npm run preview',url:'http://localhost:4173',reuseExistingServer:true},workers:2,reporter:'list'});
