import re

with open("src/App.tsx", "r") as f:
    content = f.read()

content = content.replace(
    "{selectedRecord.tituloEleitorial || '-'}",
    "{formatVoterID(selectedRecord.tituloEleitorial || '') || '-'}"
)

content = content.replace(
    "{selectedRecord.dataNascimento || '-'}",
    "{formatDate(selectedRecord.dataNascimento || '') || '-'}"
)

# Replace in export view too, if there are table cells
content = content.replace(
    "<td>{record.dataNascimento}</td>",
    "<td>{formatDate(record.dataNascimento || '')}</td>"
)
content = content.replace(
    "<td>{record.tituloEleitorial}</td>",
    "<td>{formatVoterID(record.tituloEleitorial || '')}</td>"
)

with open("src/App.tsx", "w") as f:
    f.write(content)
