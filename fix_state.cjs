const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldState = `  // PDF Cargo filter modal
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [pdfCargoFilter, setPdfCargoFilter] = useState('Todos');`;

const newState = `  // Export Cargo filter modal
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [pdfCargoFilter, setPdfCargoFilter] = useState('Todos');
  const [exportAction, setExportAction] = useState<string>('');`;

content = content.replace(oldState, newState);

fs.writeFileSync('src/App.tsx', content);
