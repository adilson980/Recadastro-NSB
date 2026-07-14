import re

with open("src/App.tsx", "r") as f:
    content = f.read()

new_content = """            {/* Deputados Stats */}
            <div className="grid grid-cols-1 gap-4">
              {/* Row 1: Deputado Federal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Federal Masc */}
                <div className="p-4 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -ml-10 -mt-10"></div>
                  <div className="space-y-1 relative z-10">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 mb-2">
                      <UserIcon className="h-4 w-4" />
                    </div>
                    <h3 className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase pt-1">DEP. FED (MASC)</h3>
                    <p className="text-2xl font-black text-white">{stats.totalDepFederalMasc}</p>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 relative z-10">Homens (Dep. Federal).</p>
                </div>
                {/* Federal Fem */}
                <div className="p-4 rounded-3xl bg-emerald-950/20 border border-emerald-500/20 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                  <div className="space-y-1 relative z-10">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 mb-2">
                      <UserIcon className="h-4 w-4" />
                    </div>
                    <h3 className="text-[10px] font-mono font-bold tracking-wider text-emerald-400/80 uppercase pt-1">DEP. FED (FEM)</h3>
                    <p className="text-2xl font-black text-emerald-400">{stats.totalDepFederalFem}</p>
                  </div>
                  <p className="text-[10px] text-emerald-500/70 mt-1 relative z-10">Mulheres (Dep. Federal).</p>
                </div>
                {/* Federal Nao Declarado */}
                <div className="p-4 rounded-3xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between relative overflow-hidden">
                  <div className="space-y-1 relative z-10">
                    <div className="w-8 h-8 rounded-xl bg-slate-800/50 text-slate-400 flex items-center justify-center border border-slate-700 mb-2">
                      <UserIcon className="h-4 w-4" />
                    </div>
                    <h3 className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase pt-1">DEP. FED (N/ DECL.)</h3>
                    <p className="text-2xl font-black text-slate-300">{stats.totalDepFederalNaoDecl}</p>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 relative z-10">Não informaram sexo.</p>
                </div>
                
                {/* Federal Total */}
                <div className="p-4 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="w-8 h-8 rounded-xl bg-slate-800/50 text-slate-300 flex items-center justify-center border border-slate-700 mb-2">
                      <Users className="h-4 w-4" />
                    </div>
                    <h3 className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase pt-1">DEP. FEDERAL (TOTAL)</h3>
                    <p className="text-2xl font-black text-white">
                      {stats.totalDepFederal}
                    </p>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Candidatos a Dep. Federal.</p>
                </div>
              </div>

              {/* Row 2: Deputado Estadual */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Estadual Masc */}
                <div className="p-4 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -ml-10 -mt-10"></div>
                  <div className="space-y-1 relative z-10">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 mb-2">
                      <UserIcon className="h-4 w-4" />
                    </div>
                    <h3 className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase pt-1">DEP. EST (MASC)</h3>
                    <p className="text-2xl font-black text-white">{stats.totalDepEstadualMasc}</p>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 relative z-10">Homens (Dep. Estadual).</p>
                </div>
                {/* Estadual Fem */}
                <div className="p-4 rounded-3xl bg-emerald-950/20 border border-emerald-500/20 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                  <div className="space-y-1 relative z-10">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 mb-2">
                      <UserIcon className="h-4 w-4" />
                    </div>
                    <h3 className="text-[10px] font-mono font-bold tracking-wider text-emerald-400/80 uppercase pt-1">DEP. EST (FEM)</h3>
                    <p className="text-2xl font-black text-emerald-400">{stats.totalDepEstadualFem}</p>
                  </div>
                  <p className="text-[10px] text-emerald-500/70 mt-1 relative z-10">Mulheres (Dep. Estadual).</p>
                </div>
                {/* Estadual Nao Declarado */}
                <div className="p-4 rounded-3xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between relative overflow-hidden">
                  <div className="space-y-1 relative z-10">
                    <div className="w-8 h-8 rounded-xl bg-slate-800/50 text-slate-400 flex items-center justify-center border border-slate-700 mb-2">
                      <UserIcon className="h-4 w-4" />
                    </div>
                    <h3 className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase pt-1">DEP. EST (N/ DECL.)</h3>
                    <p className="text-2xl font-black text-slate-300">{stats.totalDepEstadualNaoDecl}</p>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 relative z-10">Não informaram sexo.</p>
                </div>
                
                {/* Estadual Total */}
                <div className="p-4 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="w-8 h-8 rounded-xl bg-slate-800/50 text-slate-300 flex items-center justify-center border border-slate-700 mb-2">
                      <Users className="h-4 w-4" />
                    </div>
                    <h3 className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase pt-1">DEP. ESTADUAL (TOTAL)</h3>
                    <p className="text-2xl font-black text-white">
                      {stats.totalDepEstadual}
                    </p>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Candidatos a Dep. Estadual.</p>
                </div>
              </div>

              {/* Row 3: Em Estudo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 mb-2">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <h3 className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase pt-1">EM ESTUDO</h3>
                    <p className="text-2xl font-black text-white">{stats.candidate2026Intents.estudo}</p>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Candidaturas em estudo.</p>
                </div>
              </div>
            </div>"""

pattern = re.compile(r'\{\/\* Deputados Stats \*\/\}.*?\{\/\* Dashboard Graphs \*\/\}', re.DOTALL)
updated_content = pattern.sub(new_content + '\n\n            {/* Dashboard Graphs */}', content)

with open("src/App.tsx", "w") as f:
    f.write(updated_content)
