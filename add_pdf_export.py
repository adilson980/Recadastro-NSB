import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Imports
if "import jsPDF from 'jspdf';" not in content:
    content = content.replace(
        "import { parseCSVData,",
        "import jsPDF from 'jspdf';\nimport autoTable from 'jspdf-autotable';\nimport { parseCSVData,"
    )

pdf_func = """  const handleExportPriorityPDF = async () => {
    triggerNotification('Gerando PDF de prioridades...', 'info');
    
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
        // Add image (x, y, width, height) - adjusting size
        // The logo will be placed at the top center
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
      const title2 = "RELAÇÃO DE PRÉ-CANDIDATOS - PRIORIDADES";
      
      // Calculate text widths to center
      const t1Width = doc.getStringUnitWidth(title1) * doc.getFontSize() / doc.internal.scaleFactor;
      const t2Width = doc.getStringUnitWidth(title2) * doc.getFontSize() / doc.internal.scaleFactor;
      
      const centerX = 29.7 / 2;
      const startYText = marginTop + 2.5; // below logo

      doc.text(title1, centerX - (t1Width/2), startYText);
      doc.text(title2, centerX - (t2Width/2), startYText + 0.6);

      // Table Data
      const tableColumn = ["Ord", "Nome Completo", "CPF", "Telefone", "UF", "Cargo a Disputar em 2026", "Prioridade"];
      const tableRows: any[] = [];

      sortedCandidates.forEach((r, index) => {
        const rowData = [
          index + 1,
          (r.nomeCompleto || '').trim().toUpperCase(),
          (r.cpf || '').trim().toUpperCase(),
          (r.telefone || '').trim().toUpperCase(),
          (r.estado || '').trim().toUpperCase(),
          (r.cargoPretendido2026 || 'NÃO ESPECIFICADO').trim().toUpperCase(),
          (r.prioridade || 'NÃO DEFINIDA').trim().toUpperCase()
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
          fontSize: 10,
          cellPadding: 0.15,
        },
        headStyles: {
          fillColor: [200, 200, 200],
          textColor: [0, 0, 0],
          fontStyle: 'bold'
        }
      });

      doc.save('nsb_candidatos_prioridades.pdf');
      triggerNotification('PDF gerado com sucesso!', 'success');
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      triggerNotification('Erro ao gerar o PDF.', 'error');
    }
  };
"""

content = content.replace("  const handleExportPriorityXLSX = () => {", pdf_func + "\n  const handleExportPriorityXLSX = () => {")

button_code = """                  <button
                    onClick={handleExportPriorityPDF}
                    className="px-4 py-2 bg-rose-700 hover:bg-rose-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-lg"
                  >
                    <Download className="h-4 w-4 text-rose-300" />
                    <span>PDF (PRIORIDADE)</span>
                  </button>
"""

# Insert button after the Prioridade XLSX button
content = content.replace(
    """                    <ListOrdered className="h-4 w-4 text-indigo-300" />
                    <span>(PRIORIDADE)</span>
                  </button>""",
    """                    <ListOrdered className="h-4 w-4 text-indigo-300" />
                    <span>XLSX (PRIORIDADE)</span>
                  </button>
""" + button_code
)

with open("src/App.tsx", "w") as f:
    f.write(content)
