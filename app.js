const express = require("express");
const app = express();
//set view engine
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
//require axios
const axios = require('axios');
//require cheerio
const cheerio = require('cheerio');


//axios config options
const config = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    },
};
const FinalproxyList = [];



//DYNAMIC JAVASCRIPT    





//scrape from https://getfreeproxy.com
//import requirements
const fs = require('fs').promises;
const path = require('path');

// --- configurations ---
const PROTOCOLS = ['http', 'https', 'socks4', 'socks5'];
const SCRAPE_CHUNK_SIZE = 10; //10 pages per protocol to scrape
const PROXIES_JSON_FILE = path.join(__dirname, 'proxies.json') //had a json file for furhter api calls (all protocols)
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/109.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
]; //use multi agents for anti-block approach

//declare a delay function types
/**
 * create a delay for polite scraping
 * @param {number} ms - milliseconds to wait
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

//a function to get the total page number
/**
 * function will scrape the page and get the totalPage number for that protocol
 * @param {String} protocol - proxy protocol[http,https,socks4,socks5]
 * @returns {Promise<number>} - total page Number
 */

async function getTotalPage(protocol) {
    let browser;
    try {
        browser = await pup.launch({
            headless: true, // Switch to true in production
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage'
            ],
            timeout: 60000
        });

        const page = await browser.newPage();
        
        // 1. Set browser configuration (preserved your settings)
        await page.setUserAgent(USER_AGENTS[0]);
        await page.setDefaultNavigationTimeout(60000);
        await page.setViewport({ width: 1366, height: 768 });

        // 2. Add request interception (NEW - based on network analysis)
        await page.setRequestInterception(true);
        page.on('request', req => {
            // Block ads, tracking, and non-essential resources
            if (['image', 'font', 'stylesheet', 'media', 'script']
                .includes(req.resourceType()) &&
                !req.url().includes('htmx.min.js')) {
                req.abort();
            } else {
                req.continue();
            }
        });

        // 3. Navigation with your original URL and logging
        const url = `https://getfreeproxy.com/db/country/IR?protocol=${protocol}&region=&city=&asn=&page=1`;
        console.log(`🔎 Checking total pages for '${protocol}'...`);
        
        await page.goto(url, {
            waitUntil: 'domcontentloaded', // Changed from array to string
            timeout: 45000
        });

        // 4. Add DOM readiness check (NEW)
        await page.waitForSelector('span.font-medium:nth-child(4)', {
            timeout: 10000
        });

        // 5. Preserved your original extraction logic
        const pageTotalNumberTxt = await page.$eval('span.font-medium:nth-child(4)', num => num.textContent);
        const pageTotalNumber = parseInt(pageTotalNumberTxt, 10);
        
        console.log('total page number is', pageTotalNumber);
        return isNaN(pageTotalNumber) ? 1 : pageTotalNumber;

    } catch (error) {
        console.warn(`⚠️ Could not determine total pages for '${protocol}'. Defaulting to 1. Error: ${error.message}`);
        return 1;
    } finally {
        // 6. Enhanced browser cleanup
        if (browser) {
            await browser.close().catch(e => console.debug('Browser cleanup warning:', e.message));
        }
    }
}


async function scrapeInterleaved() {
    console.log('🚀 Initializing advanced interleaved scraper...');
    const allProxies = {};
    const protocolPageCounts = {};
    let browser;

    try {
        // 1. Enhanced browser launch configuration
        browser = await pup.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--single-process'
            ],
            timeout: 60000
        });

        // 2. Protocol initialization (unchanged)
        for (const protocol of PROTOCOLS) {
            allProxies[protocol] = [];
            const txtFile = path.join(__dirname, `proxies-${protocol}.txt`);
            await fs.writeFile(txtFile, '', 'utf8');
            protocolPageCounts[protocol] = await getTotalPage(protocol);
            console.log(`✅ Protocol '${protocol}' has ${protocolPageCounts[protocol]} pages. File 'proxies-${protocol}.txt' is ready.`);
            await sleep(1000);
        }

        const maxOfAllPages = Math.max(...Object.values(protocolPageCounts));
        console.log(`\n📈 Maximum pages to scrape across all protocols is ${maxOfAllPages}. Starting main loop...`);

        // 3. Main scraping loop with optimizations
        for (let pageChunkStart = 1; pageChunkStart <= maxOfAllPages; pageChunkStart += SCRAPE_CHUNK_SIZE) {
            for (const protocol of PROTOCOLS) {
                const protocolMaxPage = protocolPageCounts[protocol];
                const chunkEnd = Math.min(pageChunkStart + SCRAPE_CHUNK_SIZE - 1, protocolMaxPage);

                if (pageChunkStart > protocolMaxPage) continue;

                console.log(`\n--- Cycling to protocol '${protocol}', pages ${pageChunkStart}-${chunkEnd} ---`);

                for (let page = pageChunkStart; page <= chunkEnd; page++) {
                    const url = `https://getfreeproxy.com/db/country/IR?protocol=${protocol}&page=${page}`;
                    console.log(`[Scraping page ${page} of ${protocolMaxPage} for ${protocol} protocol]`);
                    
                    const pageInstance = await browser.newPage();
                    try {
                        // 4. Configure page with enhanced settings
                        await pageInstance.setUserAgent(USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]);
                        await pageInstance.setDefaultNavigationTimeout(30000);
                        await pageInstance.setViewport({ width: 1366, height: 768 });

                        // 5. Advanced request interception
                        await pageInstance.setRequestInterception(true);
                        pageInstance.on('request', req => {
                            if (['image', 'stylesheet', 'font', 'media', 'script']
                                .includes(req.resourceType()) && 
                                !req.url().includes('htmx.min.js')) {
                                req.abort();
                            } else {
                                req.continue();
                            }
                        });

                        // 6. Navigation with improved reliability
                        await pageInstance.goto(url, {
                            waitUntil: 'domcontentloaded',
                            timeout: 45000
                        });

                        // 7. Proxy extraction with error handling
                        const pageProxies = await pageInstance.evaluate(() =>
                            Array.from(document.querySelectorAll('tr td a'))
                                .map(a => a.textContent.trim().split('://')[1])
                                .filter(Boolean)
                        );

                        if (pageProxies.length > 0) {
                            allProxies[protocol].push(...pageProxies);
                            const txtFile = path.join(__dirname, `proxies-${protocol}.txt`);
                            await fs.appendFile(txtFile, pageProxies.join('\n') + '\n', 'utf8');
                        }

                    } catch (error) {
                        console.warn(`   - ⚠️ Failed to scrape page ${page} for ${protocol}: ${error.message}`);
                    } finally {
                        // 8. Proper cleanup with delay
                        await pageInstance.close();
                        const delay = Math.floor(Math.random() * 3000) + 2000;
                        await sleep(delay);
                    }
                }
            }
        }

        // 9. Final output (unchanged)
        await fs.writeFile(PROXIES_JSON_FILE, JSON.stringify(allProxies, null, 2), 'utf8');
        console.log('\n\n🎉 All scraping tasks completed successfully!');
        console.log('Find your files in the current directory:');
        for (const protocol of PROTOCOLS) {
            console.log(`   - Text file: proxies-${protocol}.txt (${allProxies[protocol].length} proxies)`);
        }
        console.log(`   - JSON file: ${PROXIES_JSON_FILE}`);

    } catch (error) {
        console.error('\n❌ A critical error occurred during the main process:', error.message);
    } finally {
        // 10. Browser cleanup with safety check
        if (browser) {
            await browser.close().catch(e => console.debug('Browser close warning:', e.message));
        }
    }
}

// scrapeInterleaved();
scraping();
scraping1();
scrape();
// scrapeMonster()


app.get("/", (req, res) => {

    // res.render('list', { FinalproxyList })
    res.send('Hello world!!')
})

app.listen(3001, () => { console.log("Server is Running on Port: 3001") })

