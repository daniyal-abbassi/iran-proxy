const express = require("express");
const app = express();
//set view engine
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
//require axios
const axios = require('axios');
//require cheerio
const cheerio = require('cheerio');


//axios config options
const config = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    },
};
const FinalproxyList = [];



//DYNAMIC JAVASCRIPT    







app.get("/", (req, res) => {

    // res.render('list', { FinalproxyList })
    res.send('Hello world!!')
})

app.listen(3001, () => { console.log("Server is Running on Port: 3001") })

