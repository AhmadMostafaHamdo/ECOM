const http = require('http');

const data = JSON.stringify({
    category: undefined,
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
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
        const resData = JSON.parse(body);
        console.log('Count:', resData.products ? resData.products.length : (Array.isArray(resData) ? resData.length : 'unknown'));
        if (resData.products && resData.products.length > 0) {
            console.log('First product ID:', resData.products[0].id);
        }
    });
});

req.on('error', error => {
    console.error(error);
});

req.write(data);
req.end();
