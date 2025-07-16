// Scrape From https://freeproxyupdate.com/iran-ir

// --- IMPORTS ---
const axios = require('axios');
const cheerio = require('cheerio');

// --- Configuration ---
const scrapeConfig = {
    url: 'https://freeproxyupdate.com/iran-ir',
    axiosOptions: {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        },
    }
}


/**
 * Scrapes proxy data from FreeProxyUpdate
 * @returns {Promise<string[]>}  A promise that resolves to an array of proxy strings (e.g., ['1.2.3.4:8080']).
 * @throws {Error}  If the scraping process fails.
 */
async function scrapeFreeProxyUpdate() {
    try {
        //fetch the site
        const res = await axios.get(scrapeConfig.url, scrapeConfig.axiosOptions);
        //lead html to cheerio
        const $ = cheerio.load(res.data);
        //extract some text 
        const $proxyTable = $('tbody').children('tr');
        let proxyList = [];
        $proxyTable.map((i, row) => {
            let ip = $(row).children().eq(0).text().trim();
            let port = $(row).children().eq(1).text().trim();
            //push valid ip and port
            if (ip && port) {
                proxyList.push(`${ip}:${port}`);
            }

        })
        console.log(`[Scraper: FreeProxyUpdate] Found ${proxyList.length} proxies.`);
        return proxyList
    } catch (error) {
        console.error(`[Scraper: FreeProxyUpdate] An error occurred: ${error.message}`);
        throw new Error('Failed to scrape proxies from FreeProxyUpdate.');
    }
}

scrapeFreeProxyUpdate() 

// --- Module Export ---
module.exports = {
    scrapeFreeProxyUpdate
}