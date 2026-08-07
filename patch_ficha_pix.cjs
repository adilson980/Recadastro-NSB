const fs = require('fs');
let content = fs.readFileSync('src/FichaA4.tsx', 'utf8');

const oldConta = `            <div>
              <span className="font-bold uppercase text-[14pt] text-slate-900 block mb-1">Conta</span>
              <span className="text-[12pt] text-slate-800 font-medium">{selectedRecord.numeroConta1 || '-'}</span>
            </div>
          </div>`;

const newConta = `            <div>
              <span className="font-bold uppercase text-[14pt] text-slate-900 block mb-1">Conta</span>
              <span className="text-[12pt] text-slate-800 font-medium">{selectedRecord.numeroConta1 || '-'}</span>
            </div>
          </div>
          <div className="col-span-2 border-b border-slate-200 pb-4">
            <span className="font-bold uppercase text-[14pt] text-slate-900 block mb-1">Chave PIX</span>
            <span className="text-[12pt] text-slate-800 font-medium">{selectedRecord.chavePix || '-'}</span>
          </div>`;

content = content.replace(oldConta, newConta);
fs.writeFileSync('src/FichaA4.tsx', content);
