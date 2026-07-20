import re

with open("src/App.tsx", "r") as f:
    content = f.read()

content = content.replace(
    '            </motion.div>\n          </div>\n        )}\n        {deletingRecordId && (',
    '            </motion.div>\n          </motion.div>\n        )}\n        {deletingRecordId && ('
)

with open("src/App.tsx", "w") as f:
    f.write(content)
