// Scrape From https://proxy-spider.com/proxies/locations/ir-iran-islamic-republic-of


// --- URL ---
const URL = 'https://proxy-spider.com/proxies/locations/ir-iran-islamic-republic-of';
//axios config options
const config = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    },
};
const FinalproxyList = [];

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