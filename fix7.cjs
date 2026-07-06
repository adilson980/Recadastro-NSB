const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Remove LGPD block in export tab
const lgpdExportMatch = `        {activeTab === 'export' && (
          !isAdminLoggedIn ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto my-12 p-8 bg-slate-950/80 rounded-3xl border border-slate-800 text-left space-y-6 shadow-2xl"
            >
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20 mx-auto">
                  <Lock className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-extrabold text-white tracking-tight text-center">Acesso Restrito - LGPD</h2>
                <p className="text-xs text-slate-300 leading-relaxed text-center">
                  Para garantir a segurança, privacidade e conformidade com as normas da <strong>LGPD (Lei Geral de Proteção de Dados)</strong>, esta seção com métricas e exportações avançadas do banco de dados é restrita a administradores do sistema.
                </p>
              </div>

              <div className="space-y-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-850 text-xs text-slate-300">
                <p className="font-bold text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Diretrizes de Segurança LGPD:</span>
                </p>
                <ul className="space-y-1.5 list-disc pl-4 text-slate-400">
                  <li><strong>Finalidade:</strong> Acesso limitado para auditoria e relatórios estatísticos.</li>
                  <li><strong>Exportação:</strong> Qualquer dado exportado nesta seção deve ser tratado com sigilo e sob as regras da LGPD.</li>
                  <li><strong>Auditoria:</strong> O acesso é registrado e monitorado via Google Auth.</li>
                </ul>
              </div>
              
              <div className="pt-2">
                {adminError && (
                  <p className="text-rose-400 text-xs mb-3 text-center bg-rose-950/40 p-2 rounded-lg border border-rose-500/20">
                    {adminError}
                  </p>
                )}

                <form onSubmit={handleAdminLoginGoogle}>
                  <button type="submit" className="w-full py-3 bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2">
                    <Unlock className="h-4 w-4" />
                    <span>Entrar com Conta Google</span>
                  </button>
                </form>
              </div>
            </motion.div>
          ) : (
            <motion.div`;

const startIndex = code.indexOf(`        {activeTab === 'export' && (\n          !isAdminLoggedIn ? (`);
const endIndexMatch = `                </div>\n              </div>\n            </div>\n          </motion.div>\n        ) )}`;

if (startIndex !== -1) {
  const endIndex = code.indexOf(endIndexMatch, startIndex);
  if (endIndex !== -1) {
    code = code.substring(0, startIndex) + `        {activeTab === 'export' && (\n            <motion.div` + code.substring(startIndex + lgpdExportMatch.length, endIndex) + `                </div>\n              </div>\n            </div>\n          </motion.div>\n        )}` + code.substring(endIndex + endIndexMatch.length);
    console.log("Export LGPD replaced!");
  } else {
    console.log("Could not find end match for export");
  }
} else {
  console.log("Could not find start match for export");
}

fs.writeFileSync('src/App.tsx', code);
