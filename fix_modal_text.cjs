const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldModalHeader = `<h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <Download className="h-5 w-5 text-rose-500" />
                  Gerar PDF (Prioridades)
                </h3>`;

const newModalHeader = `<h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <Download className="h-5 w-5 text-rose-500" />
                  {exportAction === 'PriorityPDF' ? 'Gerar PDF (Prioridades)' : \`Exportar \${exportAction.replace('Priority', 'Prioridade ')}\`}
                </h3>`;

content = content.replace(oldModalHeader, newModalHeader);

const oldModalButton = `<button
                    onClick={generateExportPriorityPDF}
                    className="px-4 py-2 bg-rose-600 text-white font-bold rounded-xl text-xs transition-colors hover:bg-rose-500 shadow-lg shadow-rose-900/20"
                  >
                    Gerar PDF
                  </button>`;

const newModalButton = `<button
                    onClick={executeExport}
                    className="px-4 py-2 bg-rose-600 text-white font-bold rounded-xl text-xs transition-colors hover:bg-rose-500 shadow-lg shadow-rose-900/20"
                  >
                    Exportar
                  </button>`;

content = content.replace(oldModalButton, newModalButton);

fs.writeFileSync('src/App.tsx', content);
