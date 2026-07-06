const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// I also had {true && ( for some reason
const trueMatch = `                            {true && (`;
code = code.replace(trueMatch, `                            {(true) && (`); // this is fine. I'll just leave it or remove it entirely.
