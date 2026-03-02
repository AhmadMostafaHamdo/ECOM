const http = require('http');

async function testEndpoint(path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5007,
            path: path,
            method: 'GET'
        };

        const req = http.request(options, res => {
            let body = '';
            res.on('data', d => body += d);
            res.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    resolve({ path, status: res.statusCode, count: Array.isArray(data) ? data.length : 'not array' });
                } catch (e) {
                    resolve({ path, status: res.statusCode, error: 'JSON parse error' });
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

async function run() {
    const results = await Promise.all([
        testEndpoint('/products/top-rated?limit=8'),
        testEndpoint('/products/trending?limit=8'),
        testEndpoint('/products/discounted?limit=8')
    ]);
    console.log(JSON.stringify(results, null, 2));
}

run();
