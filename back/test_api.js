const http = require('http');

const data = JSON.stringify({
    category: null,
    selections: {},
    price: null,
    search: ""
});

const options = {
    hostname: 'localhost',
    port: 5007,
    path: '/products/filter',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, res => {
    console.log('Status Code:', res.statusCode);
    console.log('Headers:', JSON.stringify(res.headers, null, 2));
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
        console.log('Got response body length:', body.length);
        console.log('First 100 chars:', body.substring(0, 100));
    });
});

req.on('error', error => {
    console.error(error);
});

req.write(data);
req.end();
