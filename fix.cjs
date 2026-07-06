const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
const startMatch = "                  {/* Electoral details */}";
const endMatch = "      {/* Modal - Photo Requirements Popup */}";
const startIndex = code.indexOf(startMatch);
const endIndex = code.indexOf(endMatch);
if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `                  {/* Electoral details */}
                  <div className="space-y-2.5">
                    <h5 className="font-bold text-white border-b border-slate-800 pb-1.5 font-mono text-[10px] uppercase text-emerald-400">ADMINISTRATIVO E ELEITORAL</h5>
                    <div className="space-y-1.5">
                      <p><span className="text-slate-400 font-medium">RG:</span> <span className="font-mono">{selectedRecord.rg || '-'}</span></p>
                      <p><span className="text-slate-400 font-medium">Título Eleitor:</span> <span className="font-mono">{selectedRecord.tituloEleitorial || '-'}</span></p>
                      <p><span className="text-slate-400 font-medium">Zona / Seção:</span> <span className="font-mono">{selectedRecord.zona || '-'} / {selectedRecord.secao || '-'}</span></p>
                      <p><span className="text-slate-400 font-medium">Aeroporto Origem:</span> <span>{selectedRecord.aeroportoOrigem || '-'}</span></p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between">
                <p className="text-[10px] font-mono text-slate-500">ID Ficha: {selectedRecord.id}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (window.confirm("Ao editar, você irá recarregar estes dados para a tela de preenchimento. Você perderá qualquer preenchimento não salvo atual na tela de formulário. Deseja continuar?")) {
                        handleEditRecord(selectedRecord);
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition-colors"
                  >
                    Editar / Revisar Dados
                  </button>
                  <button
                    onClick={() => setSelectedRecord(null)}
                    className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {deletingRecordId && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-md p-6 text-left text-slate-100 shadow-2xl space-y-4"
            >
              <h3 className="font-extrabold text-lg text-white">Confirmar Exclusão</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Tem certeza que deseja remover este registro local? Esta ação é irreversível e excluirá o salvamento atual.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setDeletingRecordId(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs transition-colors hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (deletingRecordId) handleDeleteRecord(deletingRecordId);
                    setDeletingRecordId(null);
                  }}
                  className="px-4 py-2 bg-rose-600 text-white font-bold rounded-xl text-xs transition-colors hover:bg-rose-500 shadow-lg shadow-rose-900/20"
                >
                  Sim, Excluir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

`;
  code = code.substring(0, startIndex) + replacement + code.substring(endIndex);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Fixed block!");
} else {
  console.log("Could not find blocks");
}
