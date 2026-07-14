import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# I will replace the first line of the card with the clickable version.

content = content.replace(
    '                <div className="p-4 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between relative overflow-hidden">',
    '                <div onClick={() => openStatsModal("Deputados Federais (Homens)", stats.listDepFederalMasc)} className="p-4 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between relative overflow-hidden cursor-pointer hover:border-slate-500 transition-colors">',
    1
)

content = content.replace(
    '                <div className="p-4 rounded-3xl bg-emerald-950/20 border border-emerald-500/20 flex flex-col justify-between relative overflow-hidden">',
    '                <div onClick={() => openStatsModal("Deputadas Federais (Mulheres)", stats.listDepFederalFem)} className="p-4 rounded-3xl bg-emerald-950/20 border border-emerald-500/20 flex flex-col justify-between relative overflow-hidden cursor-pointer hover:border-emerald-500/50 transition-colors">',
    1
)

content = content.replace(
    '                <div className="p-4 rounded-3xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between relative overflow-hidden">',
    '                <div onClick={() => openStatsModal("Dep. Federais (Não Declarado)", stats.listDepFederalNaoDecl)} className="p-4 rounded-3xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between relative overflow-hidden cursor-pointer hover:border-slate-500 transition-colors">',
    1
)

content = content.replace(
    '                <div className="p-4 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">',
    '                <div onClick={() => openStatsModal("Deputados Federais (Total)", stats.listDepFederal)} className="p-4 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between cursor-pointer hover:border-slate-500 transition-colors">',
    1
)

# For row 2 (Estadual)
content = content.replace(
    '                <div className="p-4 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between relative overflow-hidden">',
    '                <div onClick={() => openStatsModal("Deputados Estaduais (Homens)", stats.listDepEstadualMasc)} className="p-4 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between relative overflow-hidden cursor-pointer hover:border-slate-500 transition-colors">',
    1
)

content = content.replace(
    '                <div className="p-4 rounded-3xl bg-emerald-950/20 border border-emerald-500/20 flex flex-col justify-between relative overflow-hidden">',
    '                <div onClick={() => openStatsModal("Deputadas Estaduais (Mulheres)", stats.listDepEstadualFem)} className="p-4 rounded-3xl bg-emerald-950/20 border border-emerald-500/20 flex flex-col justify-between relative overflow-hidden cursor-pointer hover:border-emerald-500/50 transition-colors">',
    1
)

content = content.replace(
    '                <div className="p-4 rounded-3xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between relative overflow-hidden">',
    '                <div onClick={() => openStatsModal("Dep. Estaduais (Não Declarado)", stats.listDepEstadualNaoDecl)} className="p-4 rounded-3xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between relative overflow-hidden cursor-pointer hover:border-slate-500 transition-colors">',
    1
)

content = content.replace(
    '                <div className="p-4 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">',
    '                <div onClick={() => openStatsModal("Deputados Estaduais (Total)", stats.listDepEstadual)} className="p-4 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between cursor-pointer hover:border-slate-500 transition-colors">',
    1
)

content = content.replace(
    '                <div className="p-4 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">',
    '                <div onClick={() => openStatsModal("Candidaturas em Estudo", stats.listEmEstudo)} className="p-4 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between cursor-pointer hover:border-slate-500 transition-colors">',
    1
)


with open("src/App.tsx", "w") as f:
    f.write(content)
