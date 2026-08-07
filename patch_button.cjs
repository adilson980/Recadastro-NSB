const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldButton = `                  <button
                    onClick={() => openExportModal("PriorityPDF")}
                    className="px-4 py-2 bg-rose-700 hover:bg-rose-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-lg"
                  >
                    <Download className="h-4 w-4 text-rose-300" />
                    <span>PDF (PRIORIDADE)</span>
                  </button>`;

const newButtons = `                  <button
                    onClick={() => openExportModal("PriorityPDF")}
                    className="px-4 py-2 bg-rose-700 hover:bg-rose-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-lg"
                  >
                    <Download className="h-4 w-4 text-rose-300" />
                    <span>PDF (PRIORIDADE)</span>
                  </button>
                  <button
                    onClick={() => openExportModal("BankPDF")}
                    className="px-4 py-2 bg-amber-700 hover:bg-amber-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-lg"
                  >
                    <Download className="h-4 w-4 text-amber-300" />
                    <span>PDF (BANCÁRIO)</span>
                  </button>`;

content = content.replace(oldButton, newButtons);

fs.writeFileSync('src/App.tsx', content);
