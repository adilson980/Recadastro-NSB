const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const replacement = `              </div>
            </div>

            {/* Top Scorers */}
            <div className="p-4 bg-slate-950/80 rounded-3xl border border-slate-800 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Medal className="h-4 w-4 text-emerald-400" />
                <span>Destaques das Lideranças (Top 3)</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.topScorers.map((scorer, i) => (
                  <motion.div
                    key={scorer.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center text-xs border border-emerald-500/20">
                          #{i + 1}
                        </span>
                        <span className="text-xl font-black text-emerald-400 font-mono tracking-tighter">
                          {scorer.pontuacao} pts
                        </span>
                      </div>
                      <h4 className="font-extrabold text-sm text-white line-clamp-2">{(scorer.nomeCompleto || 'Sem Nome').toUpperCase()}</h4>
                      <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase">{scorer.cargoNsb || 'Sem cargo'}</p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setSelectedRecord(scorer)}
                        className="flex-1 py-2 bg-slate-800 text-emerald-400 font-bold rounded-xl text-xs hover:bg-slate-700 transition-colors"
                      >
                        Ver detalhes
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Modal - Detail Record View */}`;

// Let's replace everything from the previous card until `      {/* Modal - Detail Record View */}`
const startMatch = "              </div>\n            </div>\n\n            {/* Top Scorers */";
const endMatch = "      {/* Modal - Detail Record View */}";

const startIndex = code.indexOf("              </div>\n            </div>\n\n            {/* Top Scorers */");
const endIndex = code.indexOf(endMatch);

if (startIndex !== -1 && endIndex !== -1) {
  code = code.substring(0, startIndex) + replacement + code.substring(endIndex + endMatch.length);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Fixed block!");
} else {
  console.log("Could not find blocks");
}
