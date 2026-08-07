const fs = require('fs');
let content = fs.readFileSync('src/FichaA4.tsx', 'utf8');

const oldHeader = `      </div>

      {/* Section 1: Dados Pessoais */}`;

const newHeader = `      </div>

      <div className="flex-1 flex flex-col justify-around py-4">
      {/* Section 1: Dados Pessoais */}`;


const oldFooter = `      {/* Footer Signature */}
      <div className="pt-12 mt-auto flex justify-center pb-8">`;

const newFooter = `      </div>
      
      {/* Footer Signature */}
      <div className="pt-12 mt-auto flex justify-center pb-8">`;

content = content.replace(oldHeader, newHeader);
content = content.replace(oldFooter, newFooter);

fs.writeFileSync('src/FichaA4.tsx', content);
