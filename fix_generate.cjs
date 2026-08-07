const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/const generateExportCSV = \(\) => {[\s\S]*?const rows = combined\.map\(r => \[/m, function(match) {
  // Let's not modify CSV for now, wait CSV export uses combined which doesn't seem to be filtered by UI.
  return match;
});

// For XLSX:
//     const dataToExport = filteredList.map(r => ({
const oldXLSX = `  const generateExportXLSX = () => {
    // Only with NOME COMPLETO, CPF, TELEFONE, UF, PRETENSÃO DE CANDIDATURA EM 2026, CARGO A DISPUTAR EM 2026 (all in UPPERCASE)
    const dataToExport = filteredList.map(r => ({`;

const newXLSX = `  const generateExportXLSX = () => {
    // Only with NOME COMPLETO, CPF, TELEFONE, UF, PRETENSÃO DE CANDIDATURA EM 2026, CARGO A DISPUTAR EM 2026 (all in UPPERCASE)
    let baseList = [...filteredList];
    if (exportCargoFilter !== 'Todos') {
      baseList = baseList.filter(r => r.cargoPretendido2026 === exportCargoFilter);
    }
    const dataToExport = baseList.map(r => ({`;
content = content.replace(oldXLSX, newXLSX);

const oldPriorityXLSX = `  const generateExportPriorityXLSX = () => {
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

const newPriorityXLSX = `  const generateExportPriorityXLSX = () => {
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
    if (exportCargoFilter !== 'Todos') {
      baseList = baseList.filter(r => r.cargoPretendido2026 === exportCargoFilter);
    }

    const sortedCandidates = baseList
      .sort((a, b) => {`;

content = content.replace(oldPriorityXLSX, newPriorityXLSX);

const oldGenerateCSV = `  const generateExportCSV = () => {
    const combined: FormRecord[] = [...savedRecords];
    csvRecords.forEach(csvRec => {
      const exists = savedRecords.some(s => sanitizeCPF(s.cpf) === sanitizeCPF(csvRec.cpf));
      if (!exists) {
        combined.push({
          ...csvRec,
          revisadoPara2026: false
        });
      }
    });

    const headers = [`;

const newGenerateCSV = `  const generateExportCSV = () => {
    let combined: FormRecord[] = [...savedRecords];
    csvRecords.forEach(csvRec => {
      const exists = savedRecords.some(s => sanitizeCPF(s.cpf) === sanitizeCPF(csvRec.cpf));
      if (!exists) {
        combined.push({
          ...csvRec,
          revisadoPara2026: false
        });
      }
    });

    if (exportCargoFilter !== 'Todos') {
      combined = combined.filter(r => r.cargoPretendido2026 === exportCargoFilter);
    }

    const headers = [`;

content = content.replace(oldGenerateCSV, newGenerateCSV);

fs.writeFileSync('src/App.tsx', content);
