const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  `          </motion.div>\n        )}\n      </main>`,
  `          </motion.div>\n        ) )}\n      </main>`
);

fs.writeFileSync('src/App.tsx', code);
console.log("Fixed block!");
