// Scrape From https://www.ditatompel.com/proxy/country/ir

const pup = require('puppeteer');

// --- URL ---
const URL = 'https://www.ditatompel.com/proxy/country/ir';

const USER_AGENT =  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
// create an async function
async function scrapeDitatomper() {
    let browser;
    try {
        //configure  browser
        browser = await pup.launch({
            headless: true, // Switch to true in production
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage'
            ],
            timeout: 60000
        });
        //create a page
        const page = await browser.newPage();
        await page.setUserAgent(USER_AGENT)
        console.log('we are scraping from ' + URL + ":");
        //go to the page
        await page.goto(URL, {
            waitUntil: 'domcontentloaded', // Changed from array to string
            timeout: 45000
        });;
        // //get the table/tr/td/strong/span and... test
        //changing select
        await page.waitForSelector('select#rowsPerPage', {
            timeout: 10000
        })
        await page.select('select#rowsPerPage', '100');
        //wait for changes
        await page.waitForNetworkIdle();
        let table = await page.evaluate(() => {
            let tableData = Array.from(document.querySelectorAll('td  strong'), (strong) => strong.textContent);
            return tableData
        })
     
        const proxies = [];
        for (let i = 0; i < table.length; i++) {
            let [ip, port] = table[i].split(':');
            proxies.push(`${ip}:${port}`)
        }
        console.log(proxies)
        return proxies
    } catch (error) {
        console.log('scrape failed: ', error);
    } finally {
        await browser.close();
    }
}

scrapeDitatomper()