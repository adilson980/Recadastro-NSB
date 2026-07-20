import re

with open("src/App.tsx", "r") as f:
    content = f.read()

content = content.replace(
    '        {notification && (\n          <motion.div\n            initial={{ opacity: 0, y: -50 }}',
    '        {notification && (\n          <motion.div key="notification"\n            initial={{ opacity: 0, y: -50 }}'
)

with open("src/App.tsx", "w") as f:
    f.write(content)
