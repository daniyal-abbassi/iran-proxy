// Scrape From https://www.ditatompel.com/proxy/country/ir


// --- URL ---
const URL = 'https://www.ditatompel.com/proxy/country/ir';
//axios config options
const config = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    },
};
const FinalproxyList = [];

const pup = require('puppeteer');
// create an async function
async function scrape() {
    try {
        //create a browser
        const browser = await pup.launch({ args: ['--proxy-server=http://65.108.145.212:8084'], headless: false });
        //create a page
        const page = await browser.newPage();
        console.log('we are scraping from ' + url + ":");
        //go to the page
        // await page.goto(url);
        await page.goto(url);
        // //get the table/tr/td/strong/span and... test
        //changing select
        await page.select('select#rowsPerPage', '100');
        //wait for changes
        await page.waitForNetworkIdle();
        let table = await page.evaluate(() => {
            let tableData = Array.from(document.querySelectorAll('td  strong'), (strong) => strong.textContent);
            return tableData
        })
        //convert array to object => {ipAddress,port}
        // console.log(table)
        const proxyList = [];
        for (let i = 0; i < table.length; i++) {
            let [ip, port] = table[i].split(':');
            // proxyList.push({ ipAddress: ip, port: port })
            proxyList.push(`${ip}:${port}`)
        }
        console.log(proxyList)
        FinalproxyList.push(...proxyList)
        await browser.close();
    } catch (error) {
        console.log('scrape failed: ', error);
    }
}