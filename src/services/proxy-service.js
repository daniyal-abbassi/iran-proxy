// Run scrapers and check,add to database
 
//--- IMPORTS ---
const {fetchFromTxtFile} = require('../scrapers/free-proxy-update-scraper');

//a run function for all scrapers
async function run() {
    // Scrape From https://freeproxyupdate.com/iran-ir
    console.log('Scrape From https://freeproxyupdate.com/iran-ir')
    const proxies = await fetchFromTxtFile();
}