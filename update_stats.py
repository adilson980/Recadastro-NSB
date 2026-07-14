import re

with open("src/App.tsx", "r") as f:
    content = f.read()

new_content = """    const genderChartData = Object.keys(genderMap).map(k => ({ name: k, value: genderMap[k] }));
    const colorChartData = Object.keys(colorMap).map(k => ({ name: k, value: colorMap[k] })).sort((a,b) => b.value - a.value);
    const priorityChartData = Object.keys(priorityMap).map(k => ({ name: k, value: priorityMap[k] }));

    let totalDepFederal = 0;
    let totalDepEstadual = 0;
    let totalDepFederalMasc = 0;
    let totalDepFederalFem = 0;
    let totalDepFederalNaoDecl = 0;
    let totalDepEstadualMasc = 0;
    let totalDepEstadualFem = 0;
    let totalDepEstadualNaoDecl = 0;

    const listDepFederalMasc: FormRecord[] = [];
    const listDepFederalFem: FormRecord[] = [];
    const listDepFederalNaoDecl: FormRecord[] = [];
    const listDepFederal: FormRecord[] = [];
    const listDepEstadualMasc: FormRecord[] = [];
    const listDepEstadualFem: FormRecord[] = [];
    const listDepEstadualNaoDecl: FormRecord[] = [];
    const listDepEstadual: FormRecord[] = [];
    const listEmEstudo: FormRecord[] = [];

    combined.forEach(r => {
      if (r.pretendeConcorrer2026 === 'Sim') {
        const cargo = (r.cargoPretendido2026 || '').toUpperCase();
        if (cargo === 'DEPUTADO(A) FEDERAL') {
          totalDepFederal++;
          listDepFederal.push(r);
          if (r.sexo === 'Masculino') { totalDepFederalMasc++; listDepFederalMasc.push(r); }
          else if (r.sexo === 'Feminino') { totalDepFederalFem++; listDepFederalFem.push(r); }
          else { totalDepFederalNaoDecl++; listDepFederalNaoDecl.push(r); }
        } else if (cargo === 'DEPUTADO(A) ESTADUAL') {
          totalDepEstadual++;
          listDepEstadual.push(r);
          if (r.sexo === 'Masculino') { totalDepEstadualMasc++; listDepEstadualMasc.push(r); }
          else if (r.sexo === 'Feminino') { totalDepEstadualFem++; listDepEstadualFem.push(r); }
          else { totalDepEstadualNaoDecl++; listDepEstadualNaoDecl.push(r); }
        }
      } else if (r.pretendeConcorrer2026 === 'Em estudo') {
          listEmEstudo.push(r);
      }
    });

    return {
      totalLocalUpdates,
      totalRepresented,
      nsbMembers,
      statesMap,
      candidate2026Intents,
      candidates2026List,
      intentionsChartData,
      statesChartData,
      genderChartData,
      colorChartData,
      priorityChartData,
      priorityList,
      totalDepFederal,
      totalDepEstadual,
      totalDepFederalMasc,
      totalDepFederalFem,
      totalDepFederalNaoDecl,
      totalDepEstadualMasc,
      totalDepEstadualFem,
      totalDepEstadualNaoDecl,
      listDepFederalMasc,
      listDepFederalFem,
      listDepFederalNaoDecl,
      listDepFederal,
      listDepEstadualMasc,
      listDepEstadualFem,
      listDepEstadualNaoDecl,
      listDepEstadual,
      listEmEstudo
    };"""

pattern = re.compile(r'    const genderChartData = Object\.keys\(genderMap\)\.map.*?    \};\n', re.DOTALL)
updated_content = pattern.sub(new_content + '\n', content)

with open("src/App.tsx", "w") as f:
    f.write(updated_content)
