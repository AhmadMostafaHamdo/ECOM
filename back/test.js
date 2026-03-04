// using native fetch

async function run() {
    const req = await fetch('http://localhost:5007/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            fname: "test",
            email: "test_new@test.com",
            mobile: "9998887776",
            password: "password123",
            cpassword: "password123"
        })
    });
    const res = await req.text();
    console.log("RESPONSE:", req.status, res);
}

run();
