const fs = require('fs');
const lines = fs.readFileSync('routes/router.js', 'utf8').split('\n');

const endpoints = [];
let current = null;

for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  if (l.match(/router\.(get|post|put|delete)\(/)) {
    if (current) endpoints.push(current);
    current = { start: i, code: l };
  } else if (current) {
    current.code += '\n' + l;
  }
}
if (current) endpoints.push(current);

endpoints.forEach(e => {
  const code = e.code;
  if (!code.includes('limit') && !code.includes('skip') && code.includes('.find(')) {
    const m = code.match(/router\.(get|post|put|delete)\(['"]([^'"]+)['"]/);
    if (m) {
      console.log(`MISSING: ${m[1]} ${m[2]} (Line: ${e.start + 1})`);
    } else {
      console.log(`MISSING: UNKNOWN (Line: ${e.start + 1})`);
    }
  }
});
