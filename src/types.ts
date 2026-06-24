export interface FormRecord {
  id: string;
  timestamp: string; // Carimbo de data/hora
  filiadoNsb: string; // É FILIADO(A) A NEGRITUDE SOCIALISTA BRASILEIRA (NSB)?
  cargoNsb: string; // Cargo NSB
  delegado: string; // DELGADO
  nomeCompleto: string; // NOME COMPLETO
  dataNascimento: string; // DATA DE NASCIMENTO
  rg: string; // RG
  cpf: string; // CPF
  sexo: string; // SEXO
  corRaca: string; // COR OU RAÇA
  tituloEleitorial: string; // TÍTULO ELEITORAL
  zona: string; // ZONA
  secao: string; // SEÇÃO
  endereco: string; // ENDEREÇO (Rua Xxxxx, nº xxx, (Bairro)
  cidade: string; // CIDADE
  estado: string; // QUAL SEU ESTADO?
  aeroportoOrigem: string; // AEROPORTO DE ORIGEM
  telefone: string; // Telefone (XX) XXXX-XXXX
  cep: string; // CEP
  email: string; // e-mail
  jaFoiCandidato: string; // JÁ FOI CANDIDATO(A) EM OUTRAS ELEIÇÕES?
  cargoDisputado: string; // CARGO DISPUTADO
  anoUltimaEleicao: string; // ANO QUE DISPUTOU A ÚLTIMA ELEIÇÃO
  votacao: string; // VOTAÇÃO
  possuiMandato: string; // POSSIU MANDATO?
  qualCargoEletivo: string; // QUAL CARGO ELETIVO (MARCAR SOMENTE SE POSSUIR CARGO)
  cargoEleicao2024: string; // SE FOR CONCORRER A ELEIÇÃO DE 2024, INDIQUE O CARGO.
  pontuacao: string; // Pontuação
  vicePrefeito: string; // Vice-prefeito(a)

  // 2026 Update Fields
  pretendeConcorrer2026?: string; // Se pretende concorrer em 2026 (Sim, Não, Em estudo)
  cargoPretendido2026?: string; // Cargo pretendido para 2026
  mandatoVigente2026?: string; // Se possui mandato vigente em 2026 (Sim, Não)
  cargoMandato2026?: string; // Cargo eletivo exercido em 2026
  observacoes2026?: string; // Notas de revisão adicionais para 2026
  revisadoPara2026?: boolean; // Flag indicando que foi revisado
  dataAtualizacao2026?: string; // Data e hora que os dados foram confirmados para 2026
}

export type TabType = 'form' | 'records' | 'export';

export interface FilterOptions {
  search: string;
  estado: string;
  filiado: string;
  delegado: string;
}
