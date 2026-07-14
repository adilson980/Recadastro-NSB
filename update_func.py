import re

with open("src/App.tsx", "r") as f:
    content = f.read()

new_content = """  const openStatsModal = (title: string, data: FormRecord[]) => {
    setStatsModalTitle(title);
    setStatsModalData(data);
    setIsStatsModalOpen(true);
  };

  const renderAdminGuard = (children: React.ReactNode) => {"""

pattern = re.compile(r'  const renderAdminGuard = \(children: React\.ReactNode\) => \{', re.DOTALL)
updated_content = pattern.sub(new_content + "\n    if (isUserAdmin) {", content)

with open("src/App.tsx", "w") as f:
    f.write(updated_content)
