// Run scrapers and check,add to database
 
//--- IMPORTS ---
const {fetchFromTxtFile} = require('../scrapers/free-proxy-update-scraper');
const {checkProxiesFromFile} = require('../utils/proxy-checker');

//a run function for all scrapers
async function run() {
    // Scrape From https://freeproxyupdate.com/iran-ir
    console.log('Scrape From https://freeproxyupdate.com/iran-ir...')
    const proxies = await fetchFromTxtFile();

    //Check Proxies 
    console.log('Checking proxies...')
    const workingProxies = checkProxiesFromFile(proxies)
    console.log(workingProxies)
    return workingProxies
}

console.log(run())