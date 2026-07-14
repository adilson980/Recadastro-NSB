import re

with open("src/App.tsx", "r") as f:
    content = f.read()

new_content = """                {/* Federal Total */}
                <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="w-10 h-10 rounded-2xl bg-slate-800/50 text-slate-300 flex items-center justify-center border border-slate-700 mb-3">
                      <Users className="h-5 w-5" />
                    </div>
                    <h3 className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase pt-2">DEP. FEDERAL (TOTAL)</h3>
                    <p className="text-3xl font-black text-white">
                      {stats.totalDepFederal}
                      {stats.totalDepFederalNaoDecl > 0 && <span className="text-sm font-normal text-slate-500 ml-2">(+{stats.totalDepFederalNaoDecl} s/gênero)</span>}
                    </p>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2">Candidatos a Dep. Federal.</p>
                </div>"""

pattern = re.compile(r'\{\/\* Federal Total \*\/\}.*?Candidatos a Dep\. Federal\.\<\/p\>\n                \<\/div\>', re.DOTALL)
content = pattern.sub(new_content, content)


new_content_est = """                {/* Estadual Total */}
                <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="w-10 h-10 rounded-2xl bg-slate-800/50 text-slate-300 flex items-center justify-center border border-slate-700 mb-3">
                      <Users className="h-5 w-5" />
                    </div>
                    <h3 className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase pt-2">DEP. ESTADUAL (TOTAL)</h3>
                    <p className="text-3xl font-black text-white">
                      {stats.totalDepEstadual}
                      {stats.totalDepEstadualNaoDecl > 0 && <span className="text-sm font-normal text-slate-500 ml-2">(+{stats.totalDepEstadualNaoDecl} s/gênero)</span>}
                    </p>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2">Candidatos a Dep. Estadual.</p>
                </div>"""

pattern_est = re.compile(r'\{\/\* Estadual Total \*\/\}.*?Candidatos a Dep\. Estadual\.\<\/p\>\n                \<\/div\>', re.DOTALL)
content = pattern_est.sub(new_content_est, content)


with open("src/App.tsx", "w") as f:
    f.write(content)
