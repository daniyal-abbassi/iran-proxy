// Run scrapers and check,add to database

//--- IMPORTS ---

const { fetchFromTxtFile } = require('../scrapers/free-proxy-update-scraper');
const { scrapingProxySpider } = require('../scrapers/proxy-spider-scraper');
const { checkProxiesFromFile } = require('../utils/proxy-checker');
const {scrapeDitatompel} = require('../scrapers/ditatompel-scraper');
//a run function for all scrapers
async function run() {
    //All proxies
    let proxies = [];

    // Scrape From freeproxyupdate.com/iran-ir
    console.log('Scrape From https://freeproxyupdate.com/iran-ir...')
    const freeProxiesUpdateproxies = await fetchFromTxtFile();
    proxies.push(...freeProxiesUpdateproxies)
    //TEST
    console.log('first fetch, length is: ', proxies.length)
    //Scraping From proxy-spider.com
    console.log('Scraping From https://proxy-spider.com...')
    const spiderProxies = await scrapingProxySpider();
    proxies.push(...spiderProxies)
    //TEST
    console.log('second fetch, length is: ', proxies.length)
    //Scraping From ditatopel.com
    console.log('Scraping From https://www.ditatompel.com/proxy/country/ir...')
    const ditaTompelProxies = await scrapeDitatompel() 
    //Check Proxies 
    console.log('Checking proxies...')
    const workingProxies = checkProxiesFromFile(proxies)
    // console.log(workingProxies)
    return workingProxies
}

console.log(run())