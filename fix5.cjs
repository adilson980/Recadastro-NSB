const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Remove the "Sair" button and the conditional wrapper around tabs
code = code.replace(
  /{isAdminLoggedIn && \(\s*<>\s*<button/g,
  '<button'
);
code = code.replace(
  /<\/button>\s*<button\s*onClick={handleAdminLogout}[^>]+>\s*Sair\s*<\/button>\s*<\/>\s*\)}/g,
  '</button>'
);

// 2. Remove LGPD block in records tab
const lgpdRecordsMatch = `        {activeTab === 'records' && (
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
                  Para garantir a segurança, privacidade e conformidade com as normas da <strong>LGPD (Lei Geral de Proteção de Dados)</strong>, esta seção que contém dados pessoais de lideranças é restrita a administradores do sistema.
                </p>
              </div>

              <div className="space-y-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-850 text-xs text-slate-300">
                <p className="font-bold text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Diretrizes de Segurança LGPD:</span>
                </p>
                <ul className="space-y-1.5 list-disc pl-4 text-slate-400">
                  <li><strong>Finalidade:</strong> Acesso limitado exclusivamente a membros autorizados para gestão e coordenação.</li>
                  <li><strong>Sigilo:</strong> Todos os dados exibidos são protegidos e não devem ser distribuídos.</li>
                  <li><strong>Auditoria:</strong> O acesso é registrado via Autenticação Google.</li>
                </ul>
              </div>
              
              <div className="pt-2">
                {adminError && (
                  <p className="text-rose-400 text-xs mb-3 text-center bg-rose-950/40 p-2 rounded-lg border border-rose-500/20">
                    {adminError}
                  </p>
                )}

                <form onSubmit={handleAdminLoginGoogle}>
                  <button
                    type="submit"
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg"
                  >
                    <Unlock className="h-4 w-4 text-emerald-400" />
                    <span>Entrar com Conta Google</span>
                  </button>
                </form>
              </div>
            </motion.div>
          ) : (
            <motion.div`;
code = code.replace(lgpdRecordsMatch, `        {activeTab === 'records' && (
            <motion.div`);

// Remove closing parenthesis of the records ternary
const lgpdRecordsEndMatch = `                  </tbody>
                </table>
              </div>
              <div className="py-3.5 px-5 bg-slate-900 font-mono text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-800">
                <span>Total exibidos: {filteredList.length} registros</span>
                <span>Base total: {csvRecords.length + savedRecords.filter(r => !csvRecords.some(c => sanitizeCPF(c.cpf) === sanitizeCPF(r.cpf))).length}</span>
              </div>
            </div>
          </motion.div>
        ))}`;
code = code.replace(lgpdRecordsEndMatch, `                  </tbody>
                </table>
              </div>
              <div className="py-3.5 px-5 bg-slate-900 font-mono text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-800">
                <span>Total exibidos: {filteredList.length} registros</span>
                <span>Base total: {csvRecords.length + savedRecords.filter(r => !csvRecords.some(c => sanitizeCPF(c.cpf) === sanitizeCPF(r.cpf))).length}</span>
              </div>
            </div>
          </motion.div>
        )}`);

// 3. Remove LGPD block in export tab
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
code = code.replace(lgpdExportMatch, `        {activeTab === 'export' && (
            <motion.div`);

// Remove closing parenthesis of the export ternary
const lgpdExportEndMatch = `                </div>
              </div>
            </div>
          </motion.div>
        ) )}`;
code = code.replace(lgpdExportEndMatch, `                </div>
              </div>
            </div>
          </motion.div>
        )}`);

// Fix priority hide block
const priorityHideMatch = `              {isAdminLoggedIn ? (
                <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col min-h-[300px]">
                  <div>
                    <h3 className="font-bold text-white text-base">Prioridade</h3>
                    <p className="text-xs text-slate-400">Distribuição de níveis de prioridade.</p>
                  </div>
                  <div className="flex-1 mt-6 overflow-y-auto max-h-[220px] pr-2 space-y-2">
                    {stats.priorityList.length > 0 ? (
                      stats.priorityList.map((item, idx) => (
                        <div key={idx} className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-white truncate pr-2" title={item.nome}>{item.nome}</span>
                            <span className={\`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap \${
                              item.prioridade === 'Alta' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                              item.prioridade === 'Média' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                              'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            }\`}>{item.prioridade}</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                            <span>UF: {item.uf}</span>
                            <span>Cor: {item.cor}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-xs text-slate-500 pt-8">
                        Nenhuma liderança com prioridade definida.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col items-center justify-center min-h-[300px] opacity-60">
                  <Lock className="h-8 w-8 text-slate-600 mb-3" />
                  <h3 className="font-bold text-slate-500 text-sm">Prioridade Oculta</h3>
                  <p className="text-[10px] text-slate-600 mt-1 text-center">Somente administradores têm<br/>acesso a esta informação.</p>
                </div>
              )}`;
code = code.replace(priorityHideMatch, `                <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col min-h-[300px]">
                  <div>
                    <h3 className="font-bold text-white text-base">Prioridade</h3>
                    <p className="text-xs text-slate-400">Distribuição de níveis de prioridade.</p>
                  </div>
                  <div className="flex-1 mt-6 overflow-y-auto max-h-[220px] pr-2 space-y-2">
                    {stats.priorityList.length > 0 ? (
                      stats.priorityList.map((item, idx) => (
                        <div key={idx} className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-white truncate pr-2" title={item.nome}>{item.nome}</span>
                            <span className={\`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap \${
                              item.prioridade === 'Alta' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                              item.prioridade === 'Média' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                              'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            }\`}>{item.prioridade}</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                            <span>UF: {item.uf}</span>
                            <span>Cor: {item.cor}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-xs text-slate-500 pt-8">
                        Nenhuma liderança com prioridade definida.
                      </div>
                    )}
                  </div>
                </div>`);

fs.writeFileSync('src/App.tsx', code);
console.log("Fixed block!");
