const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// replace functions
content = content.replace('const handleExportCSV = () => {', 'const generateExportCSV = () => {');
content = content.replace('const handleExportXLSX = () => {', 'const generateExportXLSX = () => {');
content = content.replace('const handleExportPriorityXLSX = () => {', 'const generateExportPriorityXLSX = () => {');

// button onClicks
content = content.replace('onClick={handleExportCSV}', 'onClick={() => openExportModal("CSV")}');
content = content.replace('onClick={handleExportXLSX}', 'onClick={() => openExportModal("XLSX")}');
content = content.replace('onClick={handleExportPriorityXLSX}', 'onClick={() => openExportModal("PriorityXLSX")}');
content = content.replace('onClick={handleExportPriorityPDF}', 'onClick={() => openExportModal("PriorityPDF")}');

fs.writeFileSync('src/App.tsx', content);
