import re

with open("src/App.tsx", "r") as f:
    content = f.read()

new_content = """  // Admin and UI state
  const [selectedRecord, setSelectedRecord] = useState<FormRecord | null>(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [statsModalTitle, setStatsModalTitle] = useState('');
  const [statsModalData, setStatsModalData] = useState<FormRecord[]>([]);
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null);"""

pattern = re.compile(r'  // Admin and UI state\n  const \[selectedRecord.*?const \[deletingRecordId, setDeletingRecordId\] = useState<string \| null>\(null\);', re.DOTALL)
updated_content = pattern.sub(new_content, content)

with open("src/App.tsx", "w") as f:
    f.write(updated_content)
