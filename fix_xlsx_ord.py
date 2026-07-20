import re

with open("src/App.tsx", "r") as f:
    content = f.read()

content = content.replace(
    """      const maxLens = [18, 14, 15, 5, 25, 12];
      dataToExport.forEach(row => {
        maxLens[0] = Math.max(maxLens[0], row['NOME COMPLETO'].length);
        maxLens[2] = Math.max(maxLens[2], row['CPF'].length);
        maxLens[3] = Math.max(maxLens[3], row['TELEFONE'].length);
        maxLens[4] = Math.max(maxLens[4], row['UF'].length);
        maxLens[5] = Math.max(maxLens[5], row['CARGO A DISPUTAR EM 2026'].length);
        maxLens[6] = Math.max(maxLens[6], row['PRIORIDADE'].length);
      });""",
    """      const maxLens = [5, 25, 15, 15, 5, 25, 15];
      dataToExport.forEach(row => {
        maxLens[0] = Math.max(maxLens[0], String(row['Ord']).length);
        maxLens[1] = Math.max(maxLens[1], row['NOME COMPLETO'].length);
        maxLens[2] = Math.max(maxLens[2], row['CPF'].length);
        maxLens[3] = Math.max(maxLens[3], row['TELEFONE'].length);
        maxLens[4] = Math.max(maxLens[4], row['UF'].length);
        maxLens[5] = Math.max(maxLens[5], row['CARGO A DISPUTAR EM 2026'].length);
        maxLens[6] = Math.max(maxLens[6], row['PRIORIDADE'].length);
      });"""
)

with open("src/App.tsx", "w") as f:
    f.write(content)
