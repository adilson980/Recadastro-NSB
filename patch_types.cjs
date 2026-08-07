const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf8');
content = content.replace('numeroConta2?: string;', 'numeroConta2?: string;\n  chavePix?: string;');
fs.writeFileSync('src/types.ts', content);
