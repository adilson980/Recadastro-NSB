import re

with open("src/App.tsx", "r") as f:
    content = f.read()

content = content.replace("  const renderAdminGuard = (children: React.ReactNode) => {\n    if (isUserAdmin) {\n    if (isUserAdmin) {", "  const renderAdminGuard = (children: React.ReactNode) => {\n    if (isUserAdmin) {")

with open("src/App.tsx", "w") as f:
    f.write(content)
