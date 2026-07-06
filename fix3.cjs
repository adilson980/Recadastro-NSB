const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const replacement = `              <div className="flex gap-3">
                  <button
                    onClick={restoreDefaultCSV}
                    className="flex-1 py-2 bg-slate-800 text-emerald-400 font-bold rounded-xl text-xs hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Restaurar Base Padrão</span>
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm("Isso irá apagar todos os registros da base local atual (não afetará o que você já salvou via formulário). Continuar?")) {
                        setCsvRecords([]);
                        setImportMessage("Base apagada. Faça upload de um novo CSV ou restaure a base padrão.");
                      }
                    }}
                    className="flex-1 py-2 bg-slate-800/80 text-rose-400 font-bold rounded-xl text-xs hover:bg-rose-950 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Limpar Base</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Modal - Detail Record View */}`;

const startIndex = code.indexOf('                <div className="flex gap-3">\n                <form onSubmit={handleAdminLoginGoogle}>');
const endIndex = code.indexOf('      {/* Modal - Detail Record View */}');

if (startIndex !== -1 && endIndex !== -1) {
  code = code.substring(0, startIndex) + replacement + code.substring(endIndex + '      {/* Modal - Detail Record View */}'.length);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Fixed block!");
} else {
  console.log("Could not find blocks");
}
