// Run scrapers and check,add to database

//--- IMPORTS ---
const fs = require('fs').promises;
const path = require('path');

const { PrismaClient } = require('../generated/prisma');
const { fetchFromTxtFile } = require('../scrapers/free-proxy-update-scraper');
const { scrapingProxySpider } = require('../scrapers/proxy-spider-scraper');
const { scrapeDitatompel } = require('../scrapers/ditatompel-scraper');
const { checkProxiesFromFile } = require('../utils/proxy-checker');

//create a prisma client
const prisma = new PrismaClient();

//a run function for all scrapers
async function run() {
    //All proxies
    let proxies = [];
    console.log('Starting the scraping and validation process...');
    try {
        //collect all proxes with promise
        const results = await Promise.allSettled([
            fetchFromTxtFile(),
            scrapeDitatompel(),
            scrapingProxySpider(),
        ]);

        //make seperate arrays into one using flatMap
        const rawProxies = results.filter(result => result.status === 'fulfilled').flatMap(result => result.value)
        console.log(`Collected a total of ${rawProxies.length} raw proxies.`);

        //check proxies
        const workingProxies = await checkProxiesFromFile(rawProxies);
        console.log(`Found ${workingProxies.length} working proxies. Saving to database...`);

        //loop through working proxies and save each to database(or update)
        for (const proxy of workingProxies) {
            let [host,port] = proxy['proxy'].split(':')
            port = parseInt(port,10)
            await prisma.proxy.upsert({
                where: {
                    host_port: {
                        host: host,
                        port: port
                    }
                },
                update: {
                    status: 'working',
                    protocol: proxy.protocol,
                    latency: proxy.latency,
                },
                create: {
                    host: host,
                    port: port,
                    status: 'working',
                    protocol: proxy.protocol,
                    latency: proxy.latency,
                }
            }) //prisma upsert
        }// for loop
        console.log('Database has been updated.');
        
        console.log('Generating JSON file for the frontend...');
        //query the database to get final update
        const workingProxiesFromDb = await prisma.proxy.findMany({
            where: {
                status: 'working',
            },
            orderBy: {
                latency: 'asc' //fastest first
            }
        });
        //path to output file
        const outputFile = path.join(__dirname, '..','..','public','proxies.json');
        //wirte to proxies.json
        await fs.writeFile(outputFile, JSON.stringify(workingProxiesFromDb,null,2));
        console.log(`Successfully created proxies.json at ${outputPath}`);
       
    } catch (error) {
        console.error('An error occurred during the orchestration process:', error);
    } finally {
        await prisma.$disconnect();
        console.log('Process finished and disconnected from database.');
    }

}



module.exports = { run }