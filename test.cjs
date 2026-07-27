const fs = require('fs');
console.log(fs.readFileSync('src/App.tsx', 'utf8').includes('Gerenciamento de Arquivo CSV'));
