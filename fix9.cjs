const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const startIndexRecords = code.indexOf("        {activeTab === 'records' && (\n          !isAdminLoggedIn ? (");
const recordsContentMatch = "          ) : (\n            <motion.div";
if (startIndexRecords !== -1) {
  const endIndexRecords = code.indexOf(recordsContentMatch, startIndexRecords);
  code = code.substring(0, startIndexRecords) + "        {activeTab === 'records' && (\n            <motion.div" + code.substring(endIndexRecords + recordsContentMatch.length);
}

const tableEndMatch = `                  </tbody>
                </table>
              </div>
              <div className="py-3.5 px-5 bg-slate-900 font-mono text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-800">
                <span>Total exibidos: {filteredList.length} registros</span>
                <span>Base total: {csvRecords.length + savedRecords.filter(r => !csvRecords.some(c => sanitizeCPF(c.cpf) === sanitizeCPF(r.cpf))).length}</span>
              </div>
            </div>
          </motion.div>
        ))}`;
const tableEndReplacement = `                  </tbody>
                </table>
              </div>
              <div className="py-3.5 px-5 bg-slate-900 font-mono text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-800">
                <span>Total exibidos: {filteredList.length} registros</span>
                <span>Base total: {csvRecords.length + savedRecords.filter(r => !csvRecords.some(c => sanitizeCPF(c.cpf) === sanitizeCPF(r.cpf))).length}</span>
              </div>
            </div>
          </motion.div>
        )}`;
code = code.replace(tableEndMatch, tableEndReplacement);

fs.writeFileSync('src/App.tsx', code);
console.log("Done");
