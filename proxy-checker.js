//import 
const fs = require('fs').promises;
const net = require('net');
const { SocksClient } = require('socks');

// --- Configuration ---
const CHUNK_SIZE = 50; // chunk size and print status every 50 proxies
const TIMEOUT = 5000;

//function for checking a single proxy
/**
 * Check proxy with checking if it listening for TCP connection.
 * @param {String} proxyString - a proxy string e.g '127.0.0.1:1080' or '[http,https,socks4,socks5]://127.0.0.1:1080'
 * @returns {Promise<any>} - returns a Promise that resolves with an object describing the proxy’s status.
 */
function checkSingleProxy(proxyString) {
    //return a promise 
    return new Promise((resolve) => {
        //create a new date for further latency
        const startTime = Date.now();
        let protocol, host, port;

        try {
            //check proxy format and convert it
            if (proxyString.includes('://')) {
                //create a new url of proxy and extract protocol,host,port
                const url = new URL(proxyString);
                protocol = url.protocol.replace(':', '');
                host = url.hostname;
                port = parseInt(url.port, 10);
            } else {
                protocol = 'http';
                [host, portStr] = proxyString.split(':');
                port = parseInt(portStr, 10);
            }
            if (!host || isNaN(port)) throw new Error('Invalid format');
        } catch (err) {
            resolve({ proxy: proxyString, status: 'dead' });
            return;
        }
        //check for protocol to perfoem a connection
        if (protocol === 'http') {
            //create a connection through socked channel 
            const socket = net.connect({ host, port, timeout: TIMEOUT });
            //socket returns an event, so check the event that emitted
            socket.on('connect', () => {
                //if event is connect then check the latency and resolve with working status
                const latency = Date.now() - startTime;
                socket.destroy(); //destroy if proxy is reachble
                resolve({ proxy: proxyString, status: 'working', protocol: 'HTTP', latency });
            });
            //if event status is error or timeout or close, destroy connection and resolve as dead
            socket.on('error', () => socket.destroy());
            socket.on('timeout', () => socket.destroy());
            socket.on('close', () => resolve({ proxy: proxyString, status: 'dead' }));
        } else if (protocol === 'socks4' || protocol === 'socks5') {
            //for socks4/5 protocols, use socksclient to create connection
            SocksClient.createConnection({
                proxy: { host, port, type: parseInt(protocol.slice(-1)) },
                command: 'connect',
                destination: { host: '1.1.1.1', port: 80 }, // Cloudflare’s DNS server listening on port 80 (HTTP).
                timeout: TIMEOUT
            }).then(info => {
                const latency = Date.now() - startTime;
                info.socket.destroy();
                resolve({ proxy: proxyString, status: 'working', protocol: protocol.toUpperCase(), latency });
            }).catch(() => resolve({ proxy: proxyString, status: 'dead' }));
        } else {
            resolve({ proxy: proxyString, status: 'dead' });
        }
    });
}

/**
 * The main function to read proxies from a file and check them.
 * @param {String} filePath - Expects a .txt file Path which contains proxies. 
 * 
 */
async function checkProxiesFromFile(filePath) {
    console.log(`Starting proxy check from file: ${filePath}`);
    const startTime = Date.now();
    let proxies;

    try {
        //read proxies file line by line
        const rawData = await fs.readFile(filePath, 'utf-8');
        //use Boolean to only true values(not empty lines)
        proxies = rawData.split('\n').map(p => p.trim()).filter(Boolean);
        if (proxies.length === 0) {
            console.log('⚠️ Warning: Proxy file is empty.');
            return [];
        }
    } catch (error) {
        console.error(`❌ Error: Could not read the proxy file at '${filePath}'.`);
        return [];
    }

    const totalProxies = proxies.length;
    console.log(`Loaded ${totalProxies} proxies. Starting check in chunks of ${CHUNK_SIZE}...`);

    const allWorkingProxies = [];
    // declare working and dead counters to show in console
    let workingCount = 0;
    let deadCount = 0;
    //loop through proxies in chunk (50 each)
    for (let i = 0; i < totalProxies; i += CHUNK_SIZE) {
        // get desired numbers of proxies (base on chunk size)
        const chunk = proxies.slice(i, i + CHUNK_SIZE);
        // check proxies with checkSingleProxy function - map over them
        const checkPromises = chunk.map(p => checkSingleProxy(p));
        //resolve all returning promises 
        const results = await Promise.allSettled(checkPromises);
        
        //check status and increment values 
        for (const result of results) {
            if (result.status === 'fulfilled' && result.value.status === 'working') {
                allWorkingProxies.push(result.value);
                workingCount++;
            } else {
                deadCount++;
            }
        }

        // format output status 
        const processedCount = Math.min(i + CHUNK_SIZE, totalProxies);
        console.log(`   ...Checked ${processedCount}/${totalProxies} (Working: ${workingCount}, Dead: ${deadCount})`);
    }
    //finish test
    const duration = (Date.now() - startTime) / 1000;
    console.log(`\n✅ Check complete in ${duration.toFixed(2)} seconds.`);
    console.log(`Found ${allWorkingProxies.length} working proxies.`);

    return allWorkingProxies;
}


async function runTest() {
    // Make sure you have file in the same directory.
    const working = await checkProxiesFromFile('proxies-socks5.txt');

    if (working.length > 0) {
        console.log("\n--- Working Proxies (with details) ---");
        console.table(working);
    }
}

runTest();



// export module
module.exports = { checkProxiesFromFile };
