import { FormRecord } from './src/types';
import { sanitizeCPF, formatCPF } from './src/csvParser';

const INITIAL_RECORD_STATE = (cpfValue = ''): Omit<FormRecord, 'id'> => ({
  cpf: cpfValue,
  nomeCompleto: 'João da Silva',
  // etc
});

const cpfSearch = "12345678901";
const cleanSearch = sanitizeCPF(cpfSearch);
console.log("cleanSearch", cleanSearch, cleanSearch.length);
const formData = {
  ...INITIAL_RECORD_STATE(formatCPF(cleanSearch)),
  revisadoPara2026: true
};
console.log("formData.cpf", formData.cpf);
console.log("validate step 1", (formData.nomeCompleto || '').trim().length >= 3 && sanitizeCPF(formData.cpf || '').length === 11);
