import { FormRecord } from './types';

// Helper to parse a single line of CSV respecting quotes
export function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export function parseCSVData(csvText: string): FormRecord[] {
  const lines = csvText.split('\n');
  if (lines.length <= 1) return [];

  const records: FormRecord[] = [];
  
  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = parseCSVLine(line);
    if (cols.length < 5) continue; // Invalid line

    // Create a FormRecord with fallback values where undefined
    const record: FormRecord = {
      id: `csv-${i}`,
      timestamp: cols[0] || '',
      filiadoNsb: cols[1] || '',
      cargoNsb: cols[2] || '',
      delegado: cols[3] || '',
      nomeCompleto: cols[4] || '',
      dataNascimento: cols[5] || '',
      rg: cols[6] || '',
      cpf: cols[7] || '',
      sexo: cols[8] || '',
      corRaca: cols[9] || '',
      tituloEleitorial: cols[10] || '',
      zona: cols[11] || '',
      secao: cols[12] || '',
      endereco: cols[13] || '',
      cidade: cols[14] || '',
      estado: cols[15] || '',
      aeroportoOrigem: cols[16] || '',
      telefone: cols[17] || '',
      cep: cols[18] || '',
      email: cols[19] || '',
      jaFoiCandidato: cols[20] || '',
      cargoDisputado: cols[21] || '',
      anoUltimaEleicao: cols[22] || '',
      votacao: cols[23] || '',
      possuiMandato: cols[24] || '',
      qualCargoEletivo: cols[25] || '',
      cargoEleicao2024: cols[26] || '',
      pontuacao: cols[27] || '',
      vicePrefeito: cols[28] || '',
    };

    records.push(record);
  }

  return records;
}

// Re-format CPF standard string to let search be robust (removes dots, dashes, spaces)
export function sanitizeCPF(cpf: string): string {
  if (!cpf) return '';
  return cpf.toString().toUpperCase().replace(/O/g, '0').replace(/\D/g, '');
}

export function isValidCPF(cpf: string): boolean {
  const sanitized = sanitizeCPF(cpf);
  if (sanitized.length !== 11) return false;
  
  // check for all same digits
  if (/^(\d)\1{10}$/.test(sanitized)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(sanitized.charAt(i)) * (10 - i);
  }
  
  let remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  
  if (remainder !== parseInt(sanitized.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(sanitized.charAt(i)) * (11 - i);
  }
  
  remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  
  if (remainder !== parseInt(sanitized.charAt(10))) return false;

  return true;
}

// Format CPF visually as 000.000.000-00
export function formatCPF(cpf: string): string {
  const sanitized = sanitizeCPF(cpf);
  if (sanitized.length <= 3) return sanitized;
  if (sanitized.length <= 6) return `${sanitized.slice(0, 3)}.${sanitized.slice(3)}`;
  if (sanitized.length <= 9) return `${sanitized.slice(0, 3)}.${sanitized.slice(3, 6)}.${sanitized.slice(6)}`;
  return `${sanitized.slice(0, 3)}.${sanitized.slice(3, 6)}.${sanitized.slice(6, 9)}-${sanitized.slice(9, 11)}`;
}

// Format Phone visually as (00) 00000-0000
export function formatPhone(phone: string): string {
  const sanitized = phone.replace(/\D/g, '');
  if (sanitized.length <= 2) return sanitized;
  if (sanitized.length <= 6) return `(${sanitized.slice(0, 2)}) ${sanitized.slice(2)}`;
  if (sanitized.length <= 10) return `(${sanitized.slice(0, 2)}) ${sanitized.slice(2, 6)}-${sanitized.slice(6)}`;
  return `(${sanitized.slice(0, 2)}) ${sanitized.slice(2, 7)}-${sanitized.slice(7, 11)}`;
}
