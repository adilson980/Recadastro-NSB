import re

with open("src/App.tsx", "r") as f:
    content = f.read()

modal_code = """
      {/* Stats List Modal */}
      <AnimatePresence>
        {isStatsModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl relative"
            >
              <button
                onClick={() => setIsStatsModalOpen(false)}
                className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              
              <h2 className="text-xl font-bold text-white mb-2">{statsModalTitle}</h2>
              <p className="text-sm text-slate-400 mb-6">Total: {statsModalData.length} registros encontrados.</p>
              
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {statsModalData.length === 0 ? (
                  <div className="text-center py-10 text-slate-500">
                    <Filter className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p>Nenhum registro encontrado nesta categoria.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {statsModalData.map((record, i) => (
                      <div key={i} className="bg-slate-950/50 border border-slate-800/80 p-4 rounded-2xl">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold text-white text-sm line-clamp-1">{record.nomeCompleto}</h4>
                            <p className="text-xs text-slate-500">{record.cpf}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            record.prioridade === 'Alta' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                            record.prioridade === 'Média' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}>
                            {record.prioridade}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {record.municipio} - {record.uf}
                          </div>
                          {record.sexo && (
                            <div className="flex items-center gap-1">
                              <UserIcon className="h-3 w-3" />
                              {record.sexo}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
"""

content = content.replace("      {/* Printable Area - Hidden on screen, visible only when printing */}", modal_code + "\n      {/* Printable Area - Hidden on screen, visible only when printing */}")

with open("src/App.tsx", "w") as f:
    f.write(content)
