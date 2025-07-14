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
            await page.goto(`https://getfreeproxy.com/db/country/IR?page=${i}&protocol=http&country_code=IR&country_name=Iran%2C+Islamic+Republic+of`,{
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
            for(let j =DELAY_BETWEEN_PAGES / 1000;j>0;j--) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                process.stdout.write(`${j}...`)
            }
            console.log('\n')
        }
        
        await browser.close()
    } catch (error) {
        console.error('scraping failed: ',error)
    }
};
// scraping();
// scraping1();
// scrape();
scrapeMonster()


app.get("/", (req, res) => {

    // res.render('list', { FinalproxyList })
    res.send('Hello world!!')
})

app.listen(3001, () => { console.log("Server is Running on Port: 3001") })

