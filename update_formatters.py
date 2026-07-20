import re

with open("src/csvParser.ts", "r") as f:
    content = f.read()

new_formatters = """
// Format Date visually as DD/MM/YYYY
export function formatDate(date: string): string {
  const sanitized = date.replace(/\D/g, '');
  if (sanitized.length <= 2) return sanitized;
  if (sanitized.length <= 4) return `${sanitized.slice(0, 2)}/${sanitized.slice(2)}`;
  return `${sanitized.slice(0, 2)}/${sanitized.slice(2, 4)}/${sanitized.slice(4, 8)}`;
}

// Format Voter ID visually as 0000 0000 0000
export function formatVoterID(id: string): string {
  const sanitized = id.replace(/\D/g, '');
  if (sanitized.length <= 4) return sanitized;
  if (sanitized.length <= 8) return `${sanitized.slice(0, 4)} ${sanitized.slice(4)}`;
  return `${sanitized.slice(0, 4)} ${sanitized.slice(4, 8)} ${sanitized.slice(8, 12)}`;
}
"""

if "formatDate" not in content:
    with open("src/csvParser.ts", "a") as f:
        f.write(new_formatters)
