const express = require("express");
const app = express();
//require axios
const axios = require('axios');
//requre cheerio
const cheerio = require('cheerio');
//example site
let siteImdb = 'https://www.imdb.com/title/tt1392170/';
let siteWiki = 'https://en.wikipedia.org/wiki/Web_scraping';
let siteProxy = 'https://freeproxyupdate.com/iran-ir';
//axios config options
const config = { 
	headers: { 
	'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36', 
	}, 
}; 
 
//async function
async function scraping() {
    try {
        //fetch the site
        const res = await axios.get(siteProxy,config);
        //lead html to cheerio
        const $ = cheerio.load(res.data);
        //extract some text 
        const $proxyTable = $('tbody').children('tr');
        // console.log('Number of Proxies: ',$proxyTable.length)
        // console.log('Childrens:   ',$proxyTable.text())
        $proxyTable.map((i,row) => {
            let $ip = $(row).children().eq(0).text();
            let $port = $(row).children().eq(1).text();
            console.log('ip is: ',$ip,'  and port is: ',$port)
        })
    } catch (error) {
        console.error('Error: %s',error)
    }
}

scraping()






app.get("/", (req, res) => {
    res.send("Hello World!")
})

app.listen(3001, () => { console.log("Server is Running on Port: 3001") })

