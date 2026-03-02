const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // useHistory to useNavigate
    content = content.replace(/useHistory\b/g, 'useNavigate');
    content = content.replace(/const\s+(?:history|nav)\s*=\s*useNavigate\(\)/g, 'const navigate = useNavigate()');
    content = content.replace(/(?:history|nav)\.push\(/g, 'navigate(');
    content = content.replace(/(?:history|nav)\.replace\((.*?)\)/g, 'navigate($1, { replace: true })');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated:', filePath);
    }
}

function traverse(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            traverse(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            replaceInFile(fullPath);
        }
    }
}

traverse(path.join(__dirname, 'src'));
