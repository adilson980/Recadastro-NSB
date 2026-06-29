import { sanitizeCPF, formatCPF } from './src/csvParser';

const cpf = "123.456.789-01";
const sanitized = sanitizeCPF(cpf);
console.log(sanitized);
console.log(sanitized.length);
