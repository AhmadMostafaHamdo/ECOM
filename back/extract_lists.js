const fs = require('fs');
const lines = fs.readFileSync('routes/router.js', 'utf8').split('\n');
const endpoints = [];
let current = null;

for(let i=0; i<lines.length; i++) {
  const l = lines[i];
  if(l.match(/router\.(get|post|put|delete)\(/)) {
    if(current) endpoints.push(current);
    current={start:i+1, code:l};
  } else if(current) {
    current.code += '\n' + l;
  }
}
if(current) endpoints.push(current);

endpoints.forEach(e => {
  const m = e.code.match(/router\.(get|post|put|delete)\(['"]([^'"]+)['"]/);
  if(m) {
    const isGetList = ['get', 'post'].includes(m[1]) && e.code.includes('.find') && !m[2].includes('/:id') && !m[2].includes('count');
    if(isGetList || m[2].includes('filter')) {
      console.log(`\n\n=== ${m[1].toUpperCase()} ${m[2]} (Line ${e.start}) ===`);
      console.log(e.code.split('\n').slice(0, 50).join('\n'));
    }
  }
});
