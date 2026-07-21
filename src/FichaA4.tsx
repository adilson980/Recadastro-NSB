import React from 'react';
import { FormRecord } from './types';

export const FichaA4 = ({ selectedRecord }: { selectedRecord: FormRecord }) => {
  return (
    <div className="mx-auto bg-white text-black h-full relative print-no-padding flex flex-col justify-between" style={{ 
      width: '210mm', 
      height: '297mm', // strict A4 height for single page
      paddingTop: '1.0cm',
      paddingRight: '1.0cm',
      paddingBottom: '1.0cm',
      paddingLeft: '1.0cm',
      fontFamily: "'Inter', sans-serif",
      boxSizing: 'border-box'
    }}>
      {/* Header Block */}
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
         <div className="flex flex-col flex-1">
           <div className="flex items-center gap-4">
             <img src="/logo.png" alt="NSB Logo" className="w-16 h-16 object-contain" />
             <div>
               <h1 className="text-[14pt] font-bold uppercase tracking-tight text-slate-900">Negritude Socialista Brasileira</h1>
               <h2 className="text-[12pt] uppercase tracking-widest text-slate-500 font-semibold">Ficha Individual de Atualização 2026</h2>
             </div>
           </div>
         </div>
         {selectedRecord.foto1 && (
           <div className="ml-4 flex-shrink-0">
             <img src={selectedRecord.foto1} alt="Foto do Filiado" className="w-20 h-28 object-cover border border-slate-200 shadow-sm rounded-sm" referrerPolicy="no-referrer" />
           </div>
         )}
      </div>

      {/* Section 1: Dados Pessoais */}
      <div className="flex flex-col">
        <h3 className="font-bold text-[14pt] uppercase bg-slate-900 px-3 text-[#fbfbff] flex items-center mb-3" style={{ width: '100%', height: '40px' }}>
          Dados Pessoais
        </h3>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-[12pt]">
          <div className="col-span-2 grid grid-cols-3 gap-6 border-b border-slate-200 pb-2">
            <div className="col-span-2">
              <span className="font-bold uppercase text-[14pt] text-slate-900 block mb-1">Nome Completo</span>
              <span className="text-[12pt] uppercase text-slate-800 font-medium">{selectedRecord.nomeCompleto || '-'}</span>
            </div>
            <div>
              <span className="font-bold uppercase text-[14pt] text-slate-900 block mb-1">Data de Inscrição</span>
              <span className="text-[12pt] text-slate-800 font-medium">{selectedRecord.timestamp ? selectedRecord.timestamp.split(',')[0] : '-'}</span>
            </div>
          </div>

          <div className="border-b border-slate-200 pb-2">
            <span className="font-bold uppercase text-[14pt] text-slate-900 block mb-1">CPF</span>
            <span className="text-[12pt] text-slate-800 font-medium">{selectedRecord.cpf || '-'}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 border-b border-slate-200 pb-2">
            <div>
              <span className="font-bold uppercase text-[14pt] text-slate-900 block mb-1">Nascimento</span>
              <span className="text-[12pt] text-slate-800 font-medium">{selectedRecord.dataNascimento || '-'}</span>
            </div>
            <div>
              <span className="font-bold uppercase text-[14pt] text-slate-900 block mb-1">Sexo</span>
              <span className="text-[12pt] text-slate-800 font-medium">{selectedRecord.sexo || '-'}</span>
            </div>
          </div>

          <div className="border-b border-slate-200 pb-2">
            <span className="font-bold uppercase text-[14pt] text-slate-900 block mb-1">Telefone</span>
            <span className="text-[12pt] text-slate-800 font-medium">{selectedRecord.telefone || '-'}</span>
          </div>

          <div className="border-b border-slate-200 pb-2">
            <span className="font-bold uppercase text-[14pt] text-slate-900 block mb-1">E-mail</span>
            <span className="text-[12pt] text-slate-800 font-medium break-all block">{selectedRecord.email || '-'}</span>
          </div>

          <div className="col-span-2 border-b border-slate-200 pb-2">
            <span className="font-bold uppercase text-[14pt] text-slate-900 block mb-1">Endereço</span>
            <span className="text-[12pt] uppercase text-slate-800 font-medium">{selectedRecord.endereco || '-'}</span>
          </div>

          <div className="border-b border-slate-200 pb-2">
            <span className="font-bold uppercase text-[14pt] text-slate-900 block mb-1">CEP</span>
            <span className="text-[12pt] text-slate-800 font-medium">{selectedRecord.cep || '-'}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 border-b border-slate-200 pb-2">
            <div>
              <span className="font-bold uppercase text-[14pt] text-slate-900 block mb-1">Cidade</span>
              <span className="text-[12pt] uppercase text-slate-800 font-medium">{selectedRecord.cidade || '-'}</span>
            </div>
            <div>
              <span className="font-bold uppercase text-[14pt] text-slate-900 block mb-1">UF</span>
              <span className="text-[12pt] uppercase text-slate-800 font-medium">{selectedRecord.estado || '-'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Dados Eleitorais */}
      <div className="flex flex-col">
        <h3 className="font-bold text-[14pt] uppercase bg-slate-900 px-3 text-[#fbfbff] flex items-center mb-3" style={{ width: '100%', height: '40px' }}>
          Dados Eleitorais e Prioridade
        </h3>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-[12pt]">
          <div className="col-span-2 grid grid-cols-3 gap-6 border-b border-slate-200 pb-2">
            <div>
              <span className="font-bold uppercase text-[14pt] text-slate-900 block mb-1">Título Eleitoral</span>
              <span className="text-[12pt] text-slate-800 font-medium">{selectedRecord.tituloEleitorial || '-'}</span>
            </div>
            <div>
              <span className="font-bold uppercase text-[14pt] text-slate-900 block mb-1">Zona</span>
              <span className="text-[12pt] text-slate-800 font-medium">{selectedRecord.zona || '-'}</span>
            </div>
            <div>
              <span className="font-bold uppercase text-[14pt] text-slate-900 block mb-1">Seção</span>
              <span className="text-[12pt] text-slate-800 font-medium">{selectedRecord.secao || '-'}</span>
            </div>
          </div>

          <div className="border-b border-slate-200 pb-2">
            <span className="font-bold uppercase text-[14pt] text-slate-900 block mb-1">Cargo Disputado (2026)</span>
            <span className="text-[12pt] uppercase text-slate-800 font-medium break-words block">
              {selectedRecord.cargoPretendido2026 && selectedRecord.cargoPretendido2026 !== 'N/A' && selectedRecord.cargoPretendido2026 !== 'Não especificado' 
                ? selectedRecord.cargoPretendido2026 
                : (selectedRecord.cargoDisputado || '-')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 border-b border-slate-200 pb-2">
            <div>
              <span className="font-bold uppercase text-[14pt] text-slate-900 block mb-1">Prioridade</span>
              <span className="text-[12pt] uppercase text-slate-800 font-medium">{selectedRecord.prioridade || '-'}</span>
            </div>
            <div>
              <span className="font-bold uppercase text-[14pt] text-slate-900 block mb-1">CNPJ (Candidatura)</span>
              <span className="text-[12pt] text-slate-800 font-medium">{selectedRecord.cnpjCandidatura || '-'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-b border-slate-200 pb-2 col-span-2">
            <div>
              <span className="font-bold uppercase text-[14pt] text-slate-900 block mb-1">Ano da Última Eleição</span>
              <span className="text-[12pt] uppercase text-slate-800 font-medium">{selectedRecord.anoUltimaEleicao || '-'}</span>
            </div>
            <div>
              <span className="font-bold uppercase text-[14pt] text-slate-900 block mb-1">Votação Obtida</span>
              <span className="text-[12pt] uppercase text-slate-800 font-medium">{selectedRecord.votacao || '-'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Dados Bancários */}
      <div className="flex flex-col">
        <h3 className="font-bold text-[14pt] uppercase bg-slate-900 px-3 text-[#fbfbff] flex items-center mb-3" style={{ width: '100%', height: '40px' }}>
          Dados Bancários
        </h3>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-[12pt]">
          <div className="col-span-2 grid grid-cols-3 gap-6 border-b border-slate-200 pb-2">
            <div>
              <span className="font-bold uppercase text-[14pt] text-slate-900 block mb-1">Banco</span>
              <span className="text-[12pt] uppercase text-slate-800 font-medium">{selectedRecord.bancoConta1 || '-'}</span>
            </div>
            <div>
              <span className="font-bold uppercase text-[14pt] text-slate-900 block mb-1">Agência</span>
              <span className="text-[12pt] text-slate-800 font-medium">{selectedRecord.agenciaConta1 || '-'}</span>
            </div>
            <div>
              <span className="font-bold uppercase text-[14pt] text-slate-900 block mb-1">Conta</span>
              <span className="text-[12pt] text-slate-800 font-medium">{selectedRecord.numeroConta1 || '-'}</span>
            </div>
          </div>

          {selectedRecord.bancoConta2 && (
            <div className="col-span-2 grid grid-cols-3 gap-6 border-b border-slate-200 pb-2">
              <div>
                <span className="font-bold uppercase text-[14pt] text-slate-900 block mb-1">Banco (Conta 2)</span>
                <span className="text-[12pt] uppercase text-slate-800 font-medium">{selectedRecord.bancoConta2 || '-'}</span>
              </div>
              <div>
                <span className="font-bold uppercase text-[14pt] text-slate-900 block mb-1">Agência (Conta 2)</span>
                <span className="text-[12pt] text-slate-800 font-medium">{selectedRecord.agenciaConta2 || '-'}</span>
              </div>
              <div>
                <span className="font-bold uppercase text-[14pt] text-slate-900 block mb-1">Conta 2</span>
                <span className="text-[12pt] text-slate-800 font-medium">{selectedRecord.numeroConta2 || '-'}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Signature */}
      <div className="pt-4 flex justify-center">
         <div className="w-2/3 border-t-2 border-slate-900 text-center pt-2">
            <span className="font-bold uppercase text-[14pt] text-slate-900 block">Assinatura do Filiado(a)</span>
         </div>
      </div>
    </div>
  );
};
