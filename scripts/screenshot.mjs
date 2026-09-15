import {chromium} from '@playwright/test';
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1100}});
await page.goto('http://127.0.0.1:5173/');
await page.screenshot({path:'tmp/dashboard.png',fullPage:true});
console.log(await page.title());
await browser.close();
