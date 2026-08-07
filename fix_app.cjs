const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldStr = `      // Margins
      const marginTop = 1.5;
      const marginBottom = 1.5;
      const marginLeft = 1.5;
      const marginRight = 1.5;
      const centerX = 29.7 / 2; // A4 landscape width is 29.7cm

      let title1Y = 3.8;

      // Add NSB Logo
      try {
        const img = new Image();
        img.src = '/logo.png';
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        // Add image (x, y, width, height) - adjusting size
        // The logo will be placed at the top center above the title
        const imgWidth = 2.2; // cm
        const imgHeight = (img.height * imgWidth) / img.width; // maintain aspect ratio
        const logoY = 0.8; // cm from top

        // Render logo via high-DPI canvas for maximum sharpness in PDF
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 1520;
        canvas.height = img.naturalHeight || 1872;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const highResDataUrl = canvas.toDataURL('image/png', 1.0);
          doc.addImage(highResDataUrl, 'PNG', centerX - (imgWidth / 2), logoY, imgWidth, imgHeight, undefined, 'NONE');
        } else {
          doc.addImage(img, 'PNG', centerX - (imgWidth / 2), logoY, imgWidth, imgHeight);
        }

        title1Y = logoY + imgHeight + 0.35;
      } catch (e) {
        console.warn('Could not load logo for PDF', e);
      }

      // Title
      doc.setFont('arial', 'bold');
      doc.setFontSize(11);
      
      const title1 = "NEGRITUDE SOCIALISTA BRASILEIRA-NSB";
      const title2 = "RELAÇÃO DE PRÉ-CANDIDATOS - PRIORIDADES";

      // Calculate text widths to center
      const t1Width = doc.getStringUnitWidth(title1) * doc.getFontSize() / doc.internal.scaleFactor;
      
      doc.text(title1, centerX - (t1Width/2), title1Y);
      
      doc.setFontSize(10);
      const t2Width = doc.getStringUnitWidth(title2) * doc.getFontSize() / doc.internal.scaleFactor;
      doc.text(title2, centerX - (t2Width/2), title1Y + 0.55);

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
        startY: title1Y + 1.0,
        margin: { top: marginTop, right: marginRight, bottom: marginBottom, left: marginLeft },`;

const newStr = `      // Margins
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
        margin: { top: marginTop, right: marginRight, bottom: marginBottom, left: marginLeft },`;

// replace by removing all spaces to match
const strippedOldStr = oldStr.replace(/\s+/g, '');
const strippedNewStr = newStr;

let found = false;
let startIdx = 0;
let endIdx = 0;

// doing a simple regex match might fail, let's just find the start and end of the block
const startMarker = '// Margins';
const endMarker = 'margin: { top: marginTop, right: marginRight, bottom: marginBottom, left: marginLeft },';

const start = content.indexOf(startMarker);
const end = content.indexOf(endMarker, start) + endMarker.length;

if (start !== -1 && end !== -1) {
    const block = content.substring(start, end);
    content = content.replace(block, newStr);
    fs.writeFileSync('src/App.tsx', content);
    console.log("Replaced block");
} else {
    console.log("Not found");
}

