const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `name="cnpjCandidatura"
                                        placeholder="00.000.000/0000-00"
                                        value={formData.cnpjCandidatura || ''}`;

const replacement = `name="cnpjCandidatura"
                                        placeholder="00.000.000/0000-00"
                                        maxLength={18}
                                        value={formData.cnpjCandidatura || ''}`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('src/App.tsx', content);
  console.log('Successfully patched cnpjCandidatura input');
} else {
  console.log('Target not found in App.tsx');
}
