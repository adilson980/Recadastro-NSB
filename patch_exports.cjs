const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldHandle = `  const handleExportPriorityPDF = () => {
    setShowPDFModal(true);
  };`;

const newHandlers = `  const openExportModal = (action: string) => {
    setExportAction(action);
    setPdfCargoFilter('Todos');
    setShowPDFModal(true);
  };

  const executeExport = () => {
    setShowPDFModal(false);
    if (exportAction === 'CSV') generateExportCSV();
    else if (exportAction === 'XLSX') generateExportXLSX();
    else if (exportAction === 'PriorityXLSX') generateExportPriorityXLSX();
    else if (exportAction === 'PriorityPDF') generateExportPriorityPDF();
    else if (exportAction === 'BankPDF') generateExportBankPDF();
  };`;

content = content.replace(oldHandle, newHandlers);

fs.writeFileSync('src/App.tsx', content);
