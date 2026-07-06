const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Also remove `isAdminLoggedIn && ` from modal
code = code.replace(
  /{isAdminLoggedIn && selectedRecord\.prioridade && \(/g,
  '{selectedRecord.prioridade && ('
);

// Remove the LGPD status badge in header
const headerBadgeMatch = `            {isAdminLoggedIn && (
              <div className="flex items-center gap-2 px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                <span>Admin Autenticado (LGPD)</span>
              </div>
            )}`;
code = code.replace(headerBadgeMatch, '');

// Clean up unused state (optional, but good)
// code = code.replace(/const \[isAdminLoggedIn, setIsAdminLoggedIn\] = useState\(false\);/, '');

fs.writeFileSync('src/App.tsx', code);
console.log("Fixed block 2!");
