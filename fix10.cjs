const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const startIndex = code.indexOf("{activeTab === 'export' && (\n          !isAdminLoggedIn ? (");
const endIndex = code.indexOf("          ) : (\n            <motion.div", startIndex);
if (startIndex !== -1 && endIndex !== -1) {
  code = code.substring(0, startIndex) + "{activeTab === 'export' && (\n            <motion.div" + code.substring(endIndex + "          ) : (\n            <motion.div".length);
}

fs.writeFileSync('src/App.tsx', code);
console.log("Done");
