import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Update import
content = content.replace(
    "import { parseCSVData, sanitizeCPF, isValidCPF, formatCPF, formatPhone } from './csvParser';",
    "import { parseCSVData, sanitizeCPF, isValidCPF, formatCPF, formatPhone, formatDate, formatVoterID } from './csvParser';"
)

# Update handleChange
new_handle_change = """
    if (name === 'telefone') {
      processedValue = formatPhone(value);
    } else if (name === 'cpf') {
      processedValue = formatCPF(value);
    } else if (name === 'dataNascimento') {
      processedValue = formatDate(value);
    } else if (name === 'tituloEleitorial') {
      processedValue = formatVoterID(value);
    }
"""

content = content.replace(
    """    if (name === 'telefone') {\n      processedValue = formatPhone(value);\n    } else if (name === 'cpf') {\n      processedValue = formatCPF(value);\n    }""",
    """    if (name === 'telefone') {
      processedValue = formatPhone(value);
    } else if (name === 'cpf') {
      processedValue = formatCPF(value);
    } else if (name === 'dataNascimento') {
      processedValue = formatDate(value);
    } else if (name === 'tituloEleitorial') {
      processedValue = formatVoterID(value);
    }"""
)

with open("src/App.tsx", "w") as f:
    f.write(content)
