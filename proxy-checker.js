// final-checker-v2.js

const fs = require('fs').promises;
const net = require('net');
const { SocksClient } = require('socks');

// --- Configuration ---
const CHUNK_SIZE = 50;
const TIMEOUT = 5000;

/**
 * Checks a single proxy.
 * This function is unchanged.
 */
function checkSingleProxy(proxyString) {
    return new Promise((resolve) => {
        const startTime = Date.now();
        let protocol, host, port;

        try {
            if (proxyString.includes('://')) {
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

        if (protocol === 'http') {
            const socket = net.connect({ host, port, timeout: TIMEOUT });
            socket.on('connect', () => {
                const latency = Date.now() - startTime;
                socket.destroy();
                resolve({ proxy: proxyString, status: 'working', protocol: 'HTTP', latency });
            });
            socket.on('error', () => socket.destroy());
            socket.on('timeout', () => socket.destroy());
            socket.on('close', () => resolve({ proxy: proxyString, status: 'dead' }));
        } else if (protocol === 'socks4' || protocol === 'socks5') {
            SocksClient.createConnection({
                proxy: { host, port, type: parseInt(protocol.slice(-1)) },
                command: 'connect',
                destination: { host: '1.1.1.1', port: 80 },
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
 * Now includes live status updates for working/dead counts.
 */
async function checkProxiesFromFile(filePath) {
    console.log(`🚀 Starting proxy check from file: ${filePath}`);
    const startTime = Date.now();
    let proxies;

    try {
        const rawData = await fs.readFile(filePath, 'utf-8');
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
    // --- NEW: Initialize counters for the live status ---
    let workingCount = 0;
    let deadCount = 0;

    for (let i = 0; i < totalProxies; i += CHUNK_SIZE) {
        const chunk = proxies.slice(i, i + CHUNK_SIZE);
        const checkPromises = chunk.map(p => checkSingleProxy(p));
        const results = await Promise.allSettled(checkPromises);
        
        // --- NEW: Tally results from the chunk ---
        for (const result of results) {
            if (result.status === 'fulfilled' && result.value.status === 'working') {
                allWorkingProxies.push(result.value);
                workingCount++;
            } else {
                deadCount++;
            }
        }

        // --- UPDATED: Enhanced status message ---
        const processedCount = Math.min(i + CHUNK_SIZE, totalProxies);
        console.log(`   ...Checked ${processedCount}/${totalProxies} (Working: ${workingCount}, Dead: ${deadCount})`);
    }

    const duration = (Date.now() - startTime) / 1000;
    console.log(`\n✅ Check complete in ${duration.toFixed(2)} seconds.`);
    console.log(`Found ${allWorkingProxies.length} working proxies.`);

    return allWorkingProxies;
}

// --- How to Use This Script ---
module.exports = { checkProxiesFromFile };


async function runTest() {
    // Make sure you have a `proxies.txt` file in the same directory.
    const working = await checkProxiesFromFile('proxies-socks5.txt');

    if (working.length > 0) {
        console.log("\n--- Working Proxies (with details) ---");
        console.table(working);
    }
}

runTest();
