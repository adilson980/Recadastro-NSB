const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add states
const stateInjection = `  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  // PDF Cargo filter modal
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [pdfCargoFilter, setPdfCargoFilter] = useState('Todos');`;

content = content.replace(
  /  const \[importMessage, setImportMessage\] = useState<string \| null>\(null\);\n  const \[notification, setNotification\] = useState<\{ message: string; type: 'success' \| 'error' \| 'info' \} \| null>\(null\);/,
  stateInjection
);

// 2. Change handleExportPriorityPDF
const oldExportPDF = `  const handleExportPriorityPDF = async () => {
    triggerNotification('Gerando PDF de prioridades...', 'info');
    
    const cargoOrder: Record<string, number> = {
      'PRESIDENTE DA REPÚBLICA': 1,
      'SENADOR(A) DA REPÚBLICA': 2,
      'DEPUTADO(A) FEDERAL': 3,
      'GOVERNADOR(A)': 4,
      'DEPUTADO(A) ESTADUAL': 5
    };
    
    const priorityOrder: Record<string, number> = {
      'Alta': 1,
      'Média': 2,
      'Baixa': 3
    };

    const sortedCandidates = [...filteredList]
      .filter(r => r.pretendeConcorrer2026 === 'Sim')
      .sort((a, b) => {`;

const newExportPDF = `  const handleExportPriorityPDF = () => {
    setShowPDFModal(true);
  };

  const generateExportPriorityPDF = async () => {
    setShowPDFModal(false);
    triggerNotification('Gerando PDF de prioridades...', 'info');
    
    const cargoOrder: Record<string, number> = {
      'PRESIDENTE DA REPÚBLICA': 1,
      'SENADOR(A) DA REPÚBLICA': 2,
      'DEPUTADO(A) FEDERAL': 3,
      'GOVERNADOR(A)': 4,
      'DEPUTADO(A) ESTADUAL': 5
    };
    
    const priorityOrder: Record<string, number> = {
      'Alta': 1,
      'Média': 2,
      'Baixa': 3
    };

    let baseList = [...filteredList].filter(r => r.pretendeConcorrer2026 === 'Sim');
    if (pdfCargoFilter !== 'Todos') {
      baseList = baseList.filter(r => r.cargoPretendido2026 === pdfCargoFilter);
    }

    const sortedCandidates = baseList
      .sort((a, b) => {`;

content = content.replace(oldExportPDF, newExportPDF);

// 3. Inject Modal at the bottom, near </AnimatePresence>
const oldAnimateEnd = `        )}
      </AnimatePresence>

      {/* Modal - Detail Record View */}`;

const modalInjection = `        )}
      </AnimatePresence>

      {/* Modal - PDF Cargo Filter */}
      <AnimatePresence>
        {showPDFModal && (
          <motion.div key="pdf-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 rounded-3xl border border-slate-800 w-full max-w-sm overflow-hidden flex flex-col text-left text-slate-100 shadow-2xl"
            >
              <div className="p-5 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
                <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <Download className="h-5 w-5 text-rose-500" />
                  Gerar PDF (Prioridades)
                </h3>
                <button onClick={() => setShowPDFModal(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase mb-2">Filtrar por Cargo</label>
                  <select 
                    value={pdfCargoFilter} 
                    onChange={(e) => setPdfCargoFilter(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="Todos">Todos os Cargos</option>
                    <option value="PRESIDENTE DA REPÚBLICA">Presidente da República</option>
                    <option value="SENADOR(A) DA REPÚBLICA">Senador(a) da República</option>
                    <option value="DEPUTADO(A) FEDERAL">Deputado(a) Federal</option>
                    <option value="GOVERNADOR(A)">Governador(a)</option>
                    <option value="DEPUTADO(A) ESTADUAL">Deputado(a) Estadual</option>
                    <option value="VEREADOR(A)">Vereador(a)</option>
                    <option value="PREFEITO(A)">Prefeito(a)</option>
                  </select>
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    onClick={() => setShowPDFModal(false)}
                    className="px-4 py-2 bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors hover:bg-slate-700"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={generateExportPriorityPDF}
                    className="px-4 py-2 bg-rose-600 text-white font-bold rounded-xl text-xs transition-colors hover:bg-rose-500 shadow-lg shadow-rose-900/20"
                  >
                    Gerar PDF
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal - Detail Record View */}`;

content = content.replace(oldAnimateEnd, modalInjection);

fs.writeFileSync('src/App.tsx', content);
