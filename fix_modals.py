import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Fix Print Preview
content = content.replace(
    '        {showPrintPreview && selectedRecord && (\n          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4 print:hidden">',
    '        {showPrintPreview && selectedRecord && (\n          <motion.div key="print-preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4 print:hidden">'
)

# Fix Detail Record View
content = content.replace(
    '        {selectedRecord && (\n          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">',
    '        {selectedRecord && (\n          <motion.div key="detail-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">'
)

# Fix Confirm Delete
content = content.replace(
    '        {deletingRecordId && (\n          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4 print:hidden">',
    '        {deletingRecordId && (\n          <motion.div key="confirm-delete" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4 print:hidden">'
)

# Fix Photo Requirements Popup
content = content.replace(
    '        {showPhotoPopup && (\n          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">',
    '        {showPhotoPopup && (\n          <motion.div key="photo-popup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">'
)

# Fix Stats List Modal
content = content.replace(
    '        {isStatsModalOpen && (\n          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm">',
    '        {isStatsModalOpen && (\n          <motion.div key="stats-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm">'
)

# Ensure the closing tags are changed to </motion.div>
# For this, it's easier to use regex
def replace_closing_div(match):
    return match.group(0).replace('          </div>', '          </motion.div>')

content = re.sub(r'          </div>\n        \)}\n      </AnimatePresence>', replace_closing_div, content)

with open("src/App.tsx", "w") as f:
    f.write(content)
