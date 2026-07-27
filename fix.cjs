const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regexBadBlock = /\) : \(\s*\{\/\* Advanced CSV Management Tools \*\/\}\s*\{isUserAdmin && \(/g;
const replaceGoodStart = `) : (
                      <div className="text-center text-xs text-slate-500 pt-8">
                        Nenhuma liderança com prioridade definida.
                      </div>
                    )}
                  </div>
                </div>
            </div>

            {/* Advanced CSV Management Tools */}
            {isUserAdmin && (`;

code = code.replace(regexBadBlock, replaceGoodStart);

const regexBadEnd = /\)\}\s*<\/motion\.div>olors flex items-center justify-center gap-1\.5"\s*>\s*<Trash2 className="h-3\.5 w-3\.5" \/>\s*<span>Limpar Base<\/span>\s*<\/button>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/motion\.div>/g;
const replaceGoodEnd = `)}
          </motion.div>`;

code = code.replace(regexBadEnd, replaceGoodEnd);

fs.writeFileSync('src/App.tsx', code);
console.log("Replaced!");
