const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const badStart = `                    ) : (            {/* Advanced CSV Management Tools */}            {isUserAdmin && (`;
const goodStart = `                    ) : (
                      <div className="text-center text-xs text-slate-500 pt-8">
                        Nenhuma liderança com prioridade definida.
                      </div>
                    )}
                  </div>
                </div>
            </div>

            {/* Advanced CSV Management Tools */}
            {isUserAdmin && (`;

code = code.replace(badStart, goodStart);

const badEnd = `            )}          </motion.div>olors flex items-center justify-center gap-1.5"                  >                    <Trash2 className="h-3.5 w-3.5" />                    <span>Limpar Base</span>                  </button>                </div>              </div>            </div>          </motion.div>`;
const goodEnd = `            )}
          </motion.div>`;

code = code.replace(badEnd, goodEnd);
fs.writeFileSync('src/App.tsx', code);
