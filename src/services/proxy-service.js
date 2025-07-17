// Run scrapers and check,add to database

//--- IMPORTS ---

const { fetchFromTxtFile } = require('../scrapers/free-proxy-update-scraper');
const { scrapingProxySpider } = require('../scrapers/proxy-spider-scraper');
const { scrapeDitatompel } = require('../scrapers/ditatompel-scraper');
const { checkProxiesFromFile } = require('../utils/proxy-checker');
//a run function for all scrapers
async function run() {
    //All proxies
    let proxies = [];
    console.log('Starting the scraping and validation process...');
    try {
        //collect all proxes with promise
        const results = await Promise.allSettled([
            fetchFromTxtFile(),
            scrapeDitatompel(),
            scrapingProxySpider(),
        ]);
        //make seperate arrays into one using flatMap
        const rawProxies = results.filter(result => result.status === 'fulfilled').flatMap(result => result.value)
        console.log(`Collected a total of ${rawProxies.length} raw proxies.`);
        //check proxies
        const workingProxies = await checkProxiesFromFile(rawProxies);
        console.log(`Found ${workingProxies.length} working proxies. Saving to database...`);
    } catch (error) {
        console.error('An error occurred during the orchestration process:', error);
    }

}



module.exports = { run }