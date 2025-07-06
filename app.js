const express = require("express");
const app = express();
//require cheerio and axios
const cheerio = require("cheerio");
const axios = require("axios");


app.get("/",(req,res)=>{
    res.send("Hello World!")
})

app.listen(3001,()=>{console.log("Server is Running on Port: 3001")})

