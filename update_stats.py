import re

with open("src/App.tsx", "r") as f:
    content = f.read()

new_content = """            {/* Deputados Stats */}
            <div className="grid grid-cols-1 gap-6">
              {/* Row 1: Deputado Federal */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Federal Masc */}
                <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -ml-10 -mt-10"></div>
                  <div className="space-y-1 relative z-10">
                    <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 mb-3">
                      <UserIcon className="h-5 w-5" />
                    </div>
                    <h3 className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase pt-2">DEP. FED (MASC)</h3>
                    <p className="text-3xl font-black text-white">{stats.totalDepFederalMasc}</p>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 relative z-10">Homens (Dep. Federal).</p>
                </div>
                {/* Federal Fem */}
                <div className="p-5 rounded-3xl bg-emerald-950/20 border border-emerald-500/20 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                  <div className="space-y-1 relative z-10">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 mb-3">
                      <UserIcon className="h-5 w-5" />
                    </div>
                    <h3 className="text-xs font-mono font-bold tracking-wider text-emerald-400/80 uppercase pt-2">DEP. FED (FEM)</h3>
                    <p className="text-3xl font-black text-emerald-400">{stats.totalDepFederalFem}</p>
                  </div>
                  <p className="text-[10px] text-emerald-500/70 mt-2 relative z-10">Mulheres (Dep. Federal).</p>
                </div>
                {/* Federal Total */}
                <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="w-10 h-10 rounded-2xl bg-slate-800/50 text-slate-300 flex items-center justify-center border border-slate-700 mb-3">
                      <Users className="h-5 w-5" />
                    </div>
                    <h3 className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase pt-2">DEP. FEDERAL (TOTAL)</h3>
                    <p className="text-3xl font-black text-white">{stats.totalDepFederal}</p>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2">Candidatos a Dep. Federal.</p>
                </div>
              </div>

              {/* Row 2: Deputado Estadual */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Estadual Masc */}
                <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -ml-10 -mt-10"></div>
                  <div className="space-y-1 relative z-10">
                    <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 mb-3">
                      <UserIcon className="h-5 w-5" />
                    </div>
                    <h3 className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase pt-2">DEP. EST (MASC)</h3>
                    <p className="text-3xl font-black text-white">{stats.totalDepEstadualMasc}</p>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 relative z-10">Homens (Dep. Estadual).</p>
                </div>
                {/* Estadual Fem */}
                <div className="p-5 rounded-3xl bg-emerald-950/20 border border-emerald-500/20 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                  <div className="space-y-1 relative z-10">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 mb-3">
                      <UserIcon className="h-5 w-5" />
                    </div>
                    <h3 className="text-xs font-mono font-bold tracking-wider text-emerald-400/80 uppercase pt-2">DEP. EST (FEM)</h3>
                    <p className="text-3xl font-black text-emerald-400">{stats.totalDepEstadualFem}</p>
                  </div>
                  <p className="text-[10px] text-emerald-500/70 mt-2 relative z-10">Mulheres (Dep. Estadual).</p>
                </div>
                {/* Estadual Total */}
                <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="w-10 h-10 rounded-2xl bg-slate-800/50 text-slate-300 flex items-center justify-center border border-slate-700 mb-3">
                      <Users className="h-5 w-5" />
                    </div>
                    <h3 className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase pt-2">DEP. ESTADUAL (TOTAL)</h3>
                    <p className="text-3xl font-black text-white">{stats.totalDepEstadual}</p>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2">Candidatos a Dep. Estadual.</p>
                </div>
              </div>

              {/* Row 3: Em Estudo */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 mb-3">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <h3 className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase pt-2">EM ESTUDO</h3>
                    <p className="text-3xl font-black text-white">{stats.candidate2026Intents.estudo}</p>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2">Candidaturas em estudo.</p>
                </div>
              </div>
            </div>"""

pattern = re.compile(r'\{\/\* Deputados Stats \*\/\}.*?\{\/\* Dashboard Graphs \*\/\}', re.DOTALL)
updated_content = pattern.sub(new_content + '\n\n            {/* Dashboard Graphs */}', content)

with open("src/App.tsx", "w") as f:
    f.write(updated_content)
