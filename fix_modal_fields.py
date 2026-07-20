import re

with open("src/App.tsx", "r") as f:
    content = f.read()

content = content.replace(
    "{record.municipio} - {record.uf}",
    "{record.cidade} - {record.estado}"
)

with open("src/App.tsx", "w") as f:
    f.write(content)
