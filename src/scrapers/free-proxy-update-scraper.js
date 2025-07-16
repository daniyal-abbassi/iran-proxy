// Scrape From https://freeproxyupdate.com/iran-ir


// --- URL ---
const siteProxy = 'https://freeproxyupdate.com/iran-ir';
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