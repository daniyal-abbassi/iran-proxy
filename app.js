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
            proxyList.push({
                ipAddress: ip,
                port: port,
                protocol: protocol,
            })
        })
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
            proxyList1.push({ ipAddress: proxyList[i], port: proxyList[i + 1] })
        }
        FinalproxyList.push(...proxyList1)
    } catch (error) {
        console.error('ERROR: %s', error)
    }
}
scraping()
scraping1()




app.get("/", (req, res) => {
    res.render('list',{FinalproxyList})
    // res.send('Hello world!!')
})

app.listen(3001, () => { console.log("Server is Running on Port: 3001") })

