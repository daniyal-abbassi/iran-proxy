const express = require("express");
const app = express();
//set view engine
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
//require axios
const axios = require('axios');
//require cheerio
const cheerio = require('cheerio');

//example site
let siteProxy = 'https://freeproxyupdate.com/iran-ir';
let siteProxy1 = 'https://proxy-spider.com/proxies/locations/ir-iran-islamic-republic-of';
//axios config options
const config = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    },
};
const FinalproxyList = [];
//async function
async function scraping() {
    try {
        //fetch the site
        const res = await axios.get(siteProxy, config);
        //lead html to cheerio
        const $ = cheerio.load(res.data);
        //extract some text 
        const $proxyTable = $('tbody').children('tr');
        let proxyList = [];
        $proxyTable.map((i, row) => {
            let ip = $(row).children().eq(0).text();
            let port = $(row).children().eq(1).text();
            let protocol = $(row).children().eq(3).text();
            // let date = $(row).children().eq(-1).text();
            if (!protocol) {
                return
            }
            // proxyList.push({
            //     ipAddress: ip,
            //     port: port,
            //     protocol: protocol,
            // })
            proxyList.push(`${ip}:${port}`)
        })
        console.log(proxyList)
        FinalproxyList.push(...proxyList)
    } catch (error) {
        console.error('Error: %s', error)
    }
}

// scraping()
async function scraping1() {
    try {
        const res = await axios.get(siteProxy1, config);
        const $ = cheerio.load(res.data);
        const $testIp = $('td > abbr');
        let proxyList = [];
        $testIp.map((i, el) => {
            proxyList.push($(el).attr('title'))
        })
        let proxyList1 = []
        for (let i = 0; i < proxyList.length; i += 2) {
            // proxyList1.push({ ipAddress: proxyList[i], port: proxyList[i + 1] })
            let ip = proxyList[i];
            let port = proxyList[i + 1]
            proxyList1.push(`${ip}:${port}`)
        }
        console.log(proxyList1)
        FinalproxyList.push(...proxyList1)
    } catch (error) {
        console.error('ERROR: %s', error)
    }
}

//DYNAMIC JAVASCRIPT    


const pup = require('puppeteer');
const url = 'https://www.ditatompel.com/proxy/country/ir';
const newURL = 'https://proxyhub.me/en/ir-free-proxy-list.html'
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
        await page.goto(newURL);
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

const monsterUrl = "https://getfreeproxy.com/db/country/IR?page=1&protocol=http&country_code=IR&country_name=Iran%2C+Islamic+Republic+of"
//with puppetter methode
async function scrapeMonster() {
    //create a browser
    const browser = await pup.launch({ headless: true });
    //create a page
    const page = await browser.newPage();

    //create timeout 
    const PAGE_LOAD_TIMEOUT = 30000; // 30 seconds
    const DELAY_BETWEEN_PAGES = Math.floor(Math.random() * 5000) + 2000; // 2-7s; 
    try {
        console.log('we are scraping from ' + monsterUrl + ":");
        //go to the page
        await page.goto(monsterUrl);
        //get the total page number to rotate
        let totalPageNumber = await page.$eval('span.font-medium:nth-child(4)', el => el.textContent)
        //loop through pages
        for (let i = 1; i < 10; i++) {
            console.log(`\nSCRAPING FROM PAGE ${i}...`)
            //go to desired page number
            await page.goto(`https://getfreeproxy.com/db/country/IR?page=${i}&protocol=http&country_code=IR&country_name=Iran%2C+Islamic+Republic+of`, {
                waitUntil: 'domcontentloaded',
                timeout: PAGE_LOAD_TIMEOUT
            }).catch(() => { throw new Error(`Timeout loading page ${i}`); });
            //get the proxies
            let table = await page.evaluate(() => {
                let tableData = Array.from(document.querySelectorAll('tr td a'), (a) => {
                    let line = a.textContent;
                    return line.trim()
                }
                ).filter(str => str !== '').map(url => url.replace(/^https?:\/\//i, ''));
                return tableData
            })
            console.log(`PROXIES OF PAGE ${i}: `)
            console.log(table)
            //wait 5s before goes to next page
            console.log(`Waiting ${DELAY_BETWEEN_PAGES / 1000}s...`);
            for (let j = Math.round(DELAY_BETWEEN_PAGES / 1000); j > 0; j--) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                process.stdout.write(`${j}...`)
            }
            console.log('\n')
        }

        await browser.close()
    } catch (error) {
        console.error('scraping failed: ', error)
    }
};
//scrape from https://getfreeproxy.com
//import requirements
const fs = require('fs');
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
    try {
        //declare url and log the status
        const url = `https://getfreeproxy.com/db/country/IR?protocol=${protocol}`;
        console.log(`🔎 Checking total pages for '${protocol}'...`);
        //make the request with axios
        const response = await axios.get(url, {
            headers: { 'User-Agent': USER_AGENTS[0] },
            timeout: 30000
        });
        //initiate cheerio
        const $ = cheerio.load(response.date);
        //extract the total number page
        const pageTotalNumberTxt = $('span.font-medium:nth-child(4)').text();
        //convert Num string to number type
        const pageTotalNumber = parseInt(pageTotalNumberTxt, 10);
        //safty return a number for page
        console.log('total page number is', pageTotalNumber)
        return isNaN(pageTotalNumber) ? 1 : pageTotalNumber; // if scrape fails - return 1
    } catch (error) {
        //log the status and return 1 if get page failed
        console.warn(`⚠️ Could not determine total pages for '${protocol}'. Defaulting to 1. Error: ${error.message}`);
        return 1; //if encounter error - return 1 default
    }
}

//main function to scrape
async function scrapeInterleaved() {
    console.log('🚀 Initializing advanced interleaved scraper...');

    //declare objects for storing proxies AND page number for each
    const allProxies = {}
    const protocolPageCounts = {}
    try {
        //loop through protocols and create txt files 
        for (const protocol of PROTOCOLS) {
            //add each protocol array to master json file
            allProxies[protocol] = []
            //get txt file path and create it
            const txtFile = path.join(__dirname, `proxies-${protocol}.txt`)
            await fs.writeFile(txtFile, '', 'utf8')
            //get that protocol page number - store it
            protocolPageCounts[protocol] = await getTotalPage(protocol);
            console.log(`✅ Protocol '${protocol}' has ${protocolPageCounts[protocol]} pages. File 'proxies-${protocol}.txt' is ready.`);
            //small delay
            await sleep(1000)
        }
        //get total page of all protocol
        const maxOfAllPages = Math.max(...Object.values(protocolPageCounts))
        console.log(`\n📈 Maximum pages to scrape across all protocols is ${maxOverallPages}. Starting main loop...`);

        //loop through pages interleaved by chunks
        for (let pageChunkStart = 1; pageChunkStart <= maxOfAllPages; pageChunkStart += SCRAPE_CHUNK_SIZE) {
            //declare end of page chuck
            const pageChunkEnd = pageChunkStart + SCRAPE_CHUNK_SIZE - 1;
            //loop through each protocol we are in
            for (const protocol of PROTOCOLS) {
                //maximull page number of this protocol
                const protocolMaxPage = protocolPageCounts[protocol]
                //declare an end page for this protocol
                const chunkEnd = Math.min(pageChunkEnd, protocolMaxPage)
                //check to see if this chuck is over
                if (pageChunkStart > protocolMaxPage) {
                    continue //skip the chunk
                }
                console.log(`\n--- Cycling to protocol '${protocol}', pages ${pageChunkStart}-${effectiveChunkEnd} ---`);

                //loop through this chunck and scrape
                for (let page = pageChunkStart; page <= chunkEnd; page++) {
                    //declare url
                    const url = `https://getfreeproxy.com/db/country/IR?protocol=${protocol}&page=${page}`;
                    console.log(`[Scraping page ${page} of ${protocolMaxPage} for ${protocol} protocol]`);
                    try {
                        //get some random user agent
                        const randomUserAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
                        //make a get request
                        const response = await axios.get(url, {
                            headers: { 'User-Agent': randomUserAgent },
                            timeout: 12000
                        })
                        //load cheerio
                        const $ = cheerio.load(response.data)
                        //page proxy list
                        const pageProxies = [];
                        //extract the proxies from page
                        $('tr td a').each((_, element) => {
                            const proxyURL = $(element).text().trim().split('://')[1];
                            if (proxyURL) {
                                pageProxies.push(proxyURL)
                            }
                        })
                        //add to master json file
                        if (pageProxies.length > 0) {
                            //add to txt file (each protocol - seperate)
                            allProxies[protocol].push(...pageProxies);
                            const txtFile = path.join(__dirname, `proxies-${protocol}.txt`)
                            await fs.appendFile(txtFile, pageProxies.join('\n') + '\n', 'utf8');
                        }
                    } catch (error) {
                        console.warn(`   - ⚠️ Failed to scrape page ${page} for ${protocol}: ${pageError.message}`);

                    } finally {
                        //a random delay
                        const delay = Math.floor(Math.random() * 3000) + 2000 //2-5 sec
                        await sleep(delay)
                    }
                } //each chuck for ecah protocl
            } //each protocol
        } //page chuck loop

        //add master object in a JSON way
        await fs.writeFile(PROXIES_JSON_FILE, JSON.stringify(allProxies, null, 2), 'utf8');
        console.log('\n\n🎉 All scraping tasks completed successfully!');
        console.log('Find your files in the current directory:');
        for (const protocol of PROTOCOLS) {
            console.log(`   - Text file: proxies-${protocol}.txt (${allProxies[protocol].length} proxies)`);
        }
        console.log(`   - JSON file: ${PROXIES_JSON_FILE}`);
    } catch (error) {
        console.error('\n❌ A critical error occurred during the main process:', error.message);

    }
} //main func





// scraping();
// scraping1();
// scrape();
// scrapeMonster()


app.get("/", (req, res) => {

    // res.render('list', { FinalproxyList })
    res.send('Hello world!!')
})

app.listen(3001, () => { console.log("Server is Running on Port: 3001") })

