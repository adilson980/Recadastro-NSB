import re

with open("src/FichaA4.tsx", "r") as f:
    content = f.read()

replacement = """                <div className="border-b-2 border-[#d1d5db] pb-1">
                  <span className="font-bold uppercase text-[10px] text-[#6b7280] block mb-1">Cargo Disputado</span>
                  <span className="font-semibold text-lg uppercase">{selectedRecord.cargoPretendido2026 && selectedRecord.cargoPretendido2026 !== 'N/A' && selectedRecord.cargoPretendido2026 !== 'Não especificado' ? selectedRecord.cargoPretendido2026 : (selectedRecord.cargoDisputado || '-')}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 border-b-2 border-[#d1d5db] pb-1">
                  <div>
                    <span className="font-bold uppercase text-[10px] text-[#6b7280] block mb-1">Ano da Última Eleição</span>
                    <span className="font-semibold text-lg uppercase">{selectedRecord.anoUltimaEleicao || '-'}</span>
                  </div>
                  <div>
                    <span className="font-bold uppercase text-[10px] text-[#6b7280] block mb-1">Total de Votos na Eleição</span>
                    <span className="font-semibold text-lg uppercase">{selectedRecord.votacao || '-'}</span>
                  </div>
                </div>"""

content = content.replace("""                <div className="border-b-2 border-[#d1d5db] pb-1">
                  <span className="font-bold uppercase text-[10px] text-[#6b7280] block mb-1">Cargo Disputado</span>
                  <span className="font-semibold text-lg uppercase">{selectedRecord.cargoPretendido2026 && selectedRecord.cargoPretendido2026 !== 'N/A' && selectedRecord.cargoPretendido2026 !== 'Não especificado' ? selectedRecord.cargoPretendido2026 : (selectedRecord.cargoDisputado || '-')}</span>
                </div>""", replacement)

with open("src/FichaA4.tsx", "w") as f:
    f.write(content)
