const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const bankPdfFunction = `
  const generateExportBankPDF = async () => {
    setShowPDFModal(false);
    triggerNotification('Gerando PDF bancário...', 'info');
    
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
    if (pdfCargoFilter !== 'Todos') {
      baseList = baseList.filter(r => r.cargoPretendido2026 === pdfCargoFilter);
    }

    const sortedCandidates = baseList
      .sort((a, b) => {
        const cA = cargoOrder[a.cargoPretendido2026 || ''] || 99;
        const cB = cargoOrder[b.cargoPretendido2026 || ''] || 99;
        if (cA !== cB) return cA - cB;
        
        const pA = priorityOrder[a.prioridade || ''] || 99;
        const pB = priorityOrder[b.prioridade || ''] || 99;
        if (pA !== pB) return pA - pB;
        
        const nomeA = (a.nomeCompleto || '').trim().toLowerCase();
        const nomeB = (b.nomeCompleto || '').trim().toLowerCase();
        if (nomeA < nomeB) return -1;
        if (nomeA > nomeB) return 1;
        
        const ufA = (a.estado || '').trim().toLowerCase();
        const ufB = (b.estado || '').trim().toLowerCase();
        if (ufA < ufB) return -1;
        if (ufA > ufB) return 1;
        return 0;
      });

    if (sortedCandidates.length === 0) {
      triggerNotification('Nenhum registro encontrado para gerar o PDF.', 'info');
      return;
    }

    try {
      // Create jsPDF instance in landscape A4
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'cm',
        format: 'a4'
      });
      
      // Margins
      const marginTop = 2.5;
      const marginBottom = 2.5;
      const marginLeft = 2.5;
      const marginRight = 2.0;

      // Add NSB Logo
      try {
        const img = new Image();
        img.src = '/logo.png';
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        const imgWidth = 2; // cm
        const imgHeight = (img.height * imgWidth) / img.width; // maintain aspect ratio
        const centerX = 29.7 / 2; // A4 landscape width is 29.7cm
        doc.addImage(img, 'PNG', centerX - (imgWidth / 2), marginTop, imgWidth, imgHeight);
      } catch (e) {
        console.warn('Could not load logo for PDF', e);
      }

      // Title
      doc.setFont('arial', 'bold');
      doc.setFontSize(10);
      
      const title1 = "NEGRITUDE SOCIALISTA BRASILEIRA-NSB";
      const title2 = "RELAÇÃO DE PRÉ-CANDIDATOS - DADOS BANCÁRIOS";

      // Calculate text widths to center
      const t1Width = doc.getStringUnitWidth(title1) * doc.getFontSize() / doc.internal.scaleFactor;
      const t2Width = doc.getStringUnitWidth(title2) * doc.getFontSize() / doc.internal.scaleFactor;
      
      const centerX = 29.7 / 2;
      const startYText = marginTop + 2.5; // below logo
      doc.text(title1, centerX - (t1Width/2), startYText);
      doc.text(title2, centerX - (t2Width/2), startYText + 0.6);

      // Table Data
      // Ord, Nome Completo, Cargo, UF, Nome Urna, Banco, Agência, Nº Conta, Chave PIX
      const tableColumn = ["Ord", "Nome Completo", "Cargo", "UF", "Nome Urna", "Banco", "Agência", "Nº Conta", "Chave PIX"];
      const tableRows: any[] = [];

      sortedCandidates.forEach((r, index) => {
        const rowData = [
          index + 1,
          (r.nomeCompleto || '').trim().toUpperCase(),
          (r.cargoPretendido2026 || 'NÃO ESPECIFICADO').trim().toUpperCase(),
          (r.estado || '').trim().toUpperCase(),
          (r.nomeUrna || '').trim().toUpperCase(),
          (r.bancoConta1 || '').trim().toUpperCase(),
          (r.agenciaConta1 || '').trim().toUpperCase(),
          (r.numeroConta1 || '').trim().toUpperCase(),
          (r.chavePix || '').trim().toUpperCase()
        ];
        tableRows.push(rowData);
      });

      // Add autoTable
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: startYText + 1.2,
        margin: { top: marginTop, right: marginRight, bottom: marginBottom, left: marginLeft },
        theme: 'grid',
        styles: {
          font: 'arial',
          fontSize: 8,
          cellPadding: 0.15,
          lineWidth: 0.01,
          lineColor: [0, 0, 0],
          textColor: [0, 0, 0]
        },
        headStyles: {
          fillColor: [220, 220, 220],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          halign: 'center'
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 1.0 },
          3: { halign: 'center', cellWidth: 1.2 },
          5: { cellWidth: 3.5 },
          6: { cellWidth: 2.0 },
          7: { cellWidth: 2.5 },
          8: { cellWidth: 3.5 }
        }
      });

      doc.save('nsb_candidatos_bancarios.pdf');
      triggerNotification('PDF Bancário gerado com sucesso!', 'success');
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      triggerNotification('Erro ao gerar o PDF.', 'error');
    }
  };
`;

content = content.replace('  const generateExportPriorityXLSX = () => {', bankPdfFunction + '\n  const generateExportPriorityXLSX = () => {');

// Replace exportAction.replace logic so BankPDF looks nice
content = content.replace("Exportar ${exportAction.replace('Priority', 'Prioridade ')}", "Exportar ${exportAction === 'BankPDF' ? 'Dados Bancários' : exportAction.replace('Priority', 'Prioridade ')}");

fs.writeFileSync('src/App.tsx', content);
