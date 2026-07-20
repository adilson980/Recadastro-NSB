import re

with open("src/csvParser.ts", "r") as f:
    content = f.read()

content = content.replace(
    "dataNascimento: cols[5] || '',",
    "dataNascimento: formatDate(cols[5] || ''),"
)
content = content.replace(
    "tituloEleitorial: cols[10] || '',",
    "tituloEleitorial: formatVoterID(cols[10] || ''),"
)

with open("src/csvParser.ts", "w") as f:
    f.write(content)
