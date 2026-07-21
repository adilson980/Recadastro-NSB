import re

with open("src/FichaA4.tsx", "r") as f:
    content = f.read()

# Make it look more modern and structured
replacement = """import React from 'react';
import { FormRecord } from './types';

export const FichaA4 = ({ selectedRecord }: { selectedRecord: FormRecord }) => {
  return (
    <div className="mx-auto bg-white text-black h-full relative print-no-padding flex flex-col" style={{ 
      width: '210mm', 
      height: '297mm', // strict A4 height for single page
      paddingTop: '0.5cm', // moved up 2cm from 2.5cm
      paddingRight: '2.0cm',
      paddingBottom: '1.0cm',
      paddingLeft: '2.5cm',
      fontFamily: "'Inter', sans-serif",
      boxSizing: 'border-box'
    }}>
             {/* Header */}
             <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3 mb-5">
                <div className="flex flex-col flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <img src="/logo.png" alt="NSB Logo" className="w-16 h-16 object-contain" />
                    <div>
                      <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">Negritude Socialista Brasileira</h1>
                      <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">Ficha Individual de Atualização 2026</h2>
                    </div>
                  </div>
                </div>
                {selectedRecord.foto1 && (
                  <div className="ml-4 flex-shrink-0">
                    <img src={selectedRecord.foto1} alt="Foto do Filiado" className="w-20 h-28 object-cover border border-slate-200 shadow-sm rounded-sm" referrerPolicy="no-referrer" />
                  </div>
                )}
             </div>
             
             {/* Fields Grid */}
             <div className="grid grid-cols-2 gap-x-6 gap-y-4 flex-1 content-start text-sm">
                
                {/* Personal Info */}
                <div className="col-span-2 mt-1">
                  <h3 className="font-black text-xs uppercase bg-slate-100 py-1 px-2 mb-2 text-slate-800 border-l-2 border-slate-900">Dados Pessoais</h3>
                </div>

                <div className="col-span-2 grid grid-cols-3 gap-4 border-b border-slate-200 pb-1">
                  <div className="col-span-2">
                    <span className="font-bold uppercase text-[9px] text-slate-500 block">Nome Completo</span>
                    <span className="font-bold text-base uppercase text-slate-900">{selectedRecord.nomeCompleto || '-'}</span>
                  </div>
                  <div>
                    <span className="font-bold uppercase text-[9px] text-slate-500 block">Data de Inscrição</span>
                    <span className="font-semibold text-sm text-slate-800">{selectedRecord.timestamp ? selectedRecord.timestamp.split(',')[0] : '-'}</span>
                  </div>
                </div>
                
                <div className="border-b border-slate-200 pb-1">
                  <span className="font-bold uppercase text-[9px] text-slate-500 block">CPF</span>
                  <span className="font-semibold text-sm text-slate-800">{selectedRecord.cpf || '-'}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 border-b border-slate-200 pb-1">
                  <div>
                    <span className="font-bold uppercase text-[9px] text-slate-500 block">Data de Nascimento</span>
                    <span className="font-semibold text-sm text-slate-800">{selectedRecord.dataNascimento || '-'}</span>
                  </div>
                  <div>
                    <span className="font-bold uppercase text-[9px] text-slate-500 block">Sexo</span>
                    <span className="font-semibold text-sm text-slate-800">{selectedRecord.sexo || '-'}</span>
                  </div>
                </div>
                
                <div className="border-b border-slate-200 pb-1">
                  <span className="font-bold uppercase text-[9px] text-slate-500 block">Telefone</span>
                  <span className="font-semibold text-sm text-slate-800">{selectedRecord.telefone || '-'}</span>
                </div>
                
                <div className="border-b border-slate-200 pb-1">
                  <span className="font-bold uppercase text-[9px] text-slate-500 block">E-mail</span>
                  <span className="font-semibold text-sm text-slate-800 truncate block">{selectedRecord.email || '-'}</span>
                </div>
                
                <div className="col-span-2 border-b border-slate-200 pb-1">
                  <span className="font-bold uppercase text-[9px] text-slate-500 block">Endereço</span>
                  <span className="font-semibold text-sm uppercase text-slate-800">{selectedRecord.endereco || '-'}</span>
                </div>
                
                <div className="border-b border-slate-200 pb-1">
                  <span className="font-bold uppercase text-[9px] text-slate-500 block">CEP</span>
                  <span className="font-semibold text-sm text-slate-800">{selectedRecord.cep || '-'}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 border-b border-slate-200 pb-1">
                  <div>
                    <span className="font-bold uppercase text-[9px] text-slate-500 block">Cidade</span>
                    <span className="font-semibold text-sm uppercase text-slate-800">{selectedRecord.cidade || '-'}</span>
                  </div>
                  <div>
                    <span className="font-bold uppercase text-[9px] text-slate-500 block">UF</span>
                    <span className="font-semibold text-sm uppercase text-slate-800">{selectedRecord.estado || '-'}</span>
                  </div>
                </div>

                {/* Electoral Info */}
                <div className="col-span-2 mt-4">
                  <h3 className="font-black text-xs uppercase bg-slate-100 py-1 px-2 mb-2 text-slate-800 border-l-2 border-slate-900">Dados Eleitorais e Prioridade</h3>
                </div>

                <div className="col-span-2 grid grid-cols-3 gap-4 border-b border-slate-200 pb-1">
                  <div>
                    <span className="font-bold uppercase text-[9px] text-slate-500 block">Título Eleitoral</span>
                    <span className="font-semibold text-sm text-slate-800">{selectedRecord.tituloEleitoral || '-'}</span>
                  </div>
                  <div>
                    <span className="font-bold uppercase text-[9px] text-slate-500 block">Zona Eleitoral</span>
                    <span className="font-semibold text-sm text-slate-800">{selectedRecord.zona || '-'}</span>
                  </div>
                  <div>
                    <span className="font-bold uppercase text-[9px] text-slate-500 block">Seção</span>
                    <span className="font-semibold text-sm text-slate-800">{selectedRecord.secao || '-'}</span>
                  </div>
                </div>
                
                <div className="border-b border-slate-200 pb-1">
                  <span className="font-bold uppercase text-[9px] text-slate-500 block">Cargo Disputado (2026)</span>
                  <span className="font-semibold text-sm uppercase text-slate-800">{selectedRecord.cargoPretendido2026 && selectedRecord.cargoPretendido2026 !== 'N/A' && selectedRecord.cargoPretendido2026 !== 'Não especificado' ? selectedRecord.cargoPretendido2026 : (selectedRecord.cargoDisputado || '-')}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 border-b border-slate-200 pb-1">
                  <div>
                    <span className="font-bold uppercase text-[9px] text-slate-500 block">Prioridade</span>
                    <span className="font-semibold text-sm uppercase text-slate-800">{selectedRecord.prioridade || '-'}</span>
                  </div>
                  <div>
                    <span className="font-bold uppercase text-[9px] text-slate-500 block">CNPJ (Candidatura)</span>
                    <span className="font-semibold text-sm text-slate-800">{selectedRecord.cnpjCandidatura || '-'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-b border-slate-200 pb-1 col-span-2">
                  <div>
                    <span className="font-bold uppercase text-[9px] text-slate-500 block">Ano da Última Eleição</span>
                    <span className="font-semibold text-sm uppercase text-slate-800">{selectedRecord.anoUltimaEleicao || '-'}</span>
                  </div>
                  <div>
                    <span className="font-bold uppercase text-[9px] text-slate-500 block">Total de Votos na Eleição</span>
                    <span className="font-semibold text-sm uppercase text-slate-800">{selectedRecord.votacao || '-'}</span>
                  </div>
                </div>

                {/* Bank Info */}
                <div className="col-span-2 mt-4">
                  <h3 className="font-black text-xs uppercase bg-slate-100 py-1 px-2 mb-2 text-slate-800 border-l-2 border-slate-900">Dados Bancários</h3>
                </div>

                <div className="col-span-2 grid grid-cols-3 gap-4 border-b border-slate-200 pb-1">
                  <div>
                    <span className="font-bold uppercase text-[9px] text-slate-500 block">Banco</span>
                    <span className="font-semibold text-sm uppercase text-slate-800">{selectedRecord.bancoConta1 || '-'}</span>
                  </div>
                  <div>
                    <span className="font-bold uppercase text-[9px] text-slate-500 block">Agência</span>
                    <span className="font-semibold text-sm text-slate-800">{selectedRecord.agenciaConta1 || '-'}</span>
                  </div>
                  <div>
                    <span className="font-bold uppercase text-[9px] text-slate-500 block">Número da Conta</span>
                    <span className="font-semibold text-sm text-slate-800">{selectedRecord.numeroConta1 || '-'}</span>
                  </div>
                </div>
                
                {selectedRecord.bancoConta2 && (
                  <div className="col-span-2 grid grid-cols-3 gap-4 border-b border-slate-200 pb-1 mt-1">
                    <div>
                      <span className="font-bold uppercase text-[9px] text-slate-500 block">Banco (Conta 2)</span>
                      <span className="font-semibold text-sm uppercase text-slate-800">{selectedRecord.bancoConta2 || '-'}</span>
                    </div>
                    <div>
                      <span className="font-bold uppercase text-[9px] text-slate-500 block">Agência (Conta 2)</span>
                      <span className="font-semibold text-sm text-slate-800">{selectedRecord.agenciaConta2 || '-'}</span>
                    </div>
                    <div>
                      <span className="font-bold uppercase text-[9px] text-slate-500 block">Número da Conta 2</span>
                      <span className="font-semibold text-sm text-slate-800">{selectedRecord.numeroConta2 || '-'}</span>
                    </div>
                  </div>
                )}
             </div>

             {/* Footer Signature */}
             <div className="mt-auto pt-6 flex justify-center pb-8">
                <div className="w-2/3 border-t border-slate-800 text-center pt-2">
                   <span className="font-bold uppercase text-[10px] text-slate-600">Assinatura do Filiado(a)</span>
                </div>
             </div>
    </div>
  );
};
"""

with open("src/FichaA4.tsx", "w") as f:
    f.write(replacement)
