// Scrape From https://proxy-spider.com/proxies/locations/ir-iran-islamic-republic-of

const axios = require('axios');
const cheerio = require('cheerio');
// --- URL ---
const URL = 'https://proxy-spider.com/proxies/locations/ir-iran-islamic-republic-of';
//axios config options
const config = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    },
};

/**
 * 
 * @returns {Promise<string[]>} A promise that resolves to an array of proxy strings.
 * @throws {Error} If the network request fails. 
 */
async function scrapingProxySpider() {
    try {
        const res = await axios.get(URL, config);
        const $ = cheerio.load(res.data);
        const $testIp = $('td > abbr');
        let proxyList = [];
        $testIp.map((i, el) => {
            proxyList.push($(el).attr('title'))
        })
        let proxies = []
        for (let i = 0; i < proxyList.length; i += 2) {
            // proxies.push({ ipAddress: proxyList[i], port: proxyList[i + 1] })
            let ip = proxyList[i];
            let port = proxyList[i + 1]
            proxies.push(`${ip}:${port}`)
        }
        console.log(proxies)
        return proxies
    } catch (error) {
        console.error('ERROR: %s', error.message)
    }
}
module.exports = {
    scrapingProxySpider
}