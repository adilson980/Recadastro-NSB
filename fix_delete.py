import re

with open("src/App.tsx", "r") as f:
    content = f.read()

content = content.replace(
    '        {deletingRecordId && (\n          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">',
    '        {deletingRecordId && (\n          <motion.div key="confirm-delete" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">'
)

content = content.replace(
    '              </div>\n            </motion.div>\n          </div>\n        )}\n      </AnimatePresence>\n\n      {/* Modal - Photo Requirements Popup */}\n      <AnimatePresence>',
    '              </div>\n            </motion.div>\n          </motion.div>\n        )}\n      </AnimatePresence>\n\n      {/* Modal - Photo Requirements Popup */}\n      <AnimatePresence>'
)

with open("src/App.tsx", "w") as f:
    f.write(content)
