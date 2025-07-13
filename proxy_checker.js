//PROXY CHECKER
//import dependencies
const axios = require('axios');
const { SocksProxyAgent } = require('socks-proxy-agent');
const { HttpsProxyAgent } = require('https-proxy-agent');

//define proxy-checker class

class ProxyChecker {
    constructor() {
        this.testURL = 'http://httpbin.org/ip' //end point - show requester ip
        this.timeout = 5000; //waits for end-point to responds
    }
    //asynchronous method for checking the proxy
    async checkProxy(proxy) {
        try {
            //create an agent to findout which type our proyx is
            const agent = this._createAgent(proxy);
            //create a start Date for latancy
            const start = Date.now();
            //require to end poit with agent 
            const response = await axios.get(this.testURL, {
                agent,
                timeout: this.timeout
            });
            //calculate latency
            const latency = Date.now() - start;
            //check if the proxy works
            if (!this._verifyProxyResponse(response.data, proxy)) {
                return { working: false, error: 'Proxy not actually used' };
            }
            //if proxy is working return its information
            return {
                working: true,
                latency,
                anonymity: await this.checkAnonymity(proxy),
                protocol: proxy.protocol || 'http'
            }
        } catch (error) {
            return { working: false, error: error.message }
        }
    }
    //defines agent and verify functions
    _createAgent(proxy) {
        //convert to a valid proxy url
        const proxyStr = `${proxy.protocol || 'http'}://${proxy.ip}:${proxy.port}`;
        //check if the proxy is socks or http
        if (proxyStr.startsWith('socks')) {
            return new SocksProxyAgent(proxyStr)
        }
        return new HttpsProxyAgent(proxyStr)
    }
    _verifyProxyResponse(data, proxy) {
        //if returned ip matches proxy' ip , then it works
        return data.origin === proxy.ip
    }
}
const proxies = [
    { ip: '80.253.255.138', port: 3128, protocol: 'http' },
    { ip: '37.27.253.44', port: 8069, protocol: 'http' },
    { ip: '207.166.177.52', port: 3128, protocol: 'http' },
    { ip: '31.14.114.72', port: 1081, protocol: 'socks5' }, // Assuming SOCKS5 for port 1081
    { ip: '207.166.176.73', port: 3128, protocol: 'http' },
    { ip: '207.166.178.72', port: 3128, protocol: 'http' },
    { ip: '207.166.178.107', port: 3128, protocol: 'http' },
    { ip: '207.166.178.29', port: 3128, protocol: 'http' },
    { ip: '114.80.36.171', port: 3081, protocol: 'http' },
    { ip: '207.166.177.156', port: 3128, protocol: 'http' },
    { ip: '3.145.16.157', port: 3128, protocol: 'http' },
    { ip: '72.10.160.91', port: 20549, protocol: 'http' },
    { ip: '2.78.57.90', port: 9696, protocol: 'http' },
    { ip: '116.104.179.15', port: 4003, protocol: 'http' },
    { ip: '103.217.224.75', port: 8082, protocol: 'http' },
    { ip: '157.15.93.82', port: 8080, protocol: 'http' },
    { ip: '67.43.236.20', port: 23745, protocol: 'http' },
    { ip: '3.99.169.87', port: 21629, protocol: 'http' },
    { ip: '72.10.164.178', port: 13673, protocol: 'http' },
    { ip: '185.4.201.49', port: 55443, protocol: 'http' },
    { ip: '45.129.141.143', port: 3128, protocol: 'http' },
    { ip: '194.183.190.10', port: 8080, protocol: 'http' },
    { ip: '161.35.70.249', port: 8080, protocol: 'http' },
    { ip: '136.228.160.250', port: 8080, protocol: 'http' },
    { ip: '129.146.167.15', port: 3128, protocol: 'http' },
    { ip: '37.27.203.159', port: 8015, protocol: 'http' },
    { ip: '207.166.177.186', port: 3128, protocol: 'http' },
    { ip: '148.113.161.83', port: 8118, protocol: 'http' },
    { ip: '77.242.98.39', port: 8080, protocol: 'http' },
    { ip: '52.74.26.202', port: 8080, protocol: 'http' },
    { ip: '209.97.150.167', port: 8080, protocol: 'http' },
    { ip: '138.68.60.8', port: 8080, protocol: 'http' },
    { ip: '38.194.246.34', port: 999, protocol: 'http' },
    { ip: '147.75.49.154', port: 9401, protocol: 'http' },
    { ip: '207.166.177.14', port: 3128, protocol: 'http' },
    { ip: '207.166.177.57', port: 3128, protocol: 'http' },
    { ip: '49.150.55.49', port: 8082, protocol: 'http' },
    { ip: '139.59.1.14', port: 80, protocol: 'http' },
    { ip: '118.178.197.213', port: 3128, protocol: 'http' },
    { ip: '47.129.253.163', port: 3128, protocol: 'http' },
    { ip: '16.78.219.183', port: 3128, protocol: 'http' },
    { ip: '209.97.150.167', port: 80, protocol: 'http' },
    { ip: '207.166.179.93', port: 3128, protocol: 'http' },
    { ip: '103.154.152.104', port: 2020, protocol: 'http' },
    { ip: '147.75.49.154', port: 9400, protocol: 'http' },
    { ip: '61.164.204.130', port: 4999, protocol: 'http' },
    { ip: '59.37.18.243', port: 3128, protocol: 'http' },
    { ip: '72.10.160.94', port: 11997, protocol: 'http' },
    { ip: '13.48.104.92', port: 3128, protocol: 'http' },
    { ip: '67.43.236.22', port: 10945, protocol: 'http' },
    { ip: '35.73.28.87', port: 3128, protocol: 'http' },
    { ip: '101.251.204.174', port: 8080, protocol: 'http' },
    { ip: '115.72.41.168', port: 10002, protocol: 'http' },
    { ip: '116.103.89.65', port: 16000, protocol: 'http' },
    { ip: '172.212.68.37', port: 3128, protocol: 'http' },
    { ip: '183.80.8.243', port: 16000, protocol: 'http' },
    { ip: '115.87.207.186', port: 8080, protocol: 'http' },
    { ip: '37.27.253.44', port: 8032, protocol: 'http' },
    { ip: '207.166.176.52', port: 3128, protocol: 'http' },
    { ip: '23.177.184.218', port: 3128, protocol: 'http' },
    { ip: '38.156.23.66', port: 999, protocol: 'http' },
    { ip: '65.108.145.212', port: 8084, protocol: 'http' },
    { ip: '67.43.228.250', port: 30195, protocol: 'http' },
    { ip: '13.247.90.208', port: 10801, protocol: 'socks5' }, // Assuming SOCKS5
    { ip: '185.239.238.224', port: 3128, protocol: 'http' },
    { ip: '27.79.144.0', port: 16000, protocol: 'http' },
    { ip: '161.35.70.249', port: 80, protocol: 'http' },
    { ip: '43.198.103.235', port: 22514, protocol: 'http' },
    { ip: '118.68.64.134', port: 16000, protocol: 'http' },
    { ip: '65.108.203.35', port: 18080, protocol: 'http' },
    { ip: '3.71.82.144', port: 40752, protocol: 'http' },
    { ip: '80.110.46.203', port: 13001, protocol: 'http' },
    { ip: '42.113.21.1', port: 16000, protocol: 'http' },
    { ip: '207.166.176.61', port: 3128, protocol: 'http' },
    { ip: '42.118.0.53', port: 16000, protocol: 'http' },
    { ip: '42.118.0.105', port: 16000, protocol: 'http' },
    { ip: '51.44.21.233', port: 3128, protocol: 'http' },
    { ip: '57.129.81.201', port: 8081, protocol: 'http' },
    { ip: '37.27.253.44', port: 8005, protocol: 'http' },
    { ip: '213.33.98.123', port: 8080, protocol: 'http' },
    { ip: '58.186.92.253', port: 16000, protocol: 'http' }
];
//test
const checker = new ProxyChecker();

// Test all proxies
proxies.forEach(proxy => {
    checker.checkProxy(proxy)
        .then(result => console.log(`${proxy.ip}:${proxy.port}`, result))
        .catch(err => console.error(err));
});


