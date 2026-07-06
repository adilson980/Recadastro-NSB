const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const fbEffectMatch = `    // 1. Subscribe to Firebase records ONLY if Admin
    let unsubscribe: (() => void) | undefined;
    if (isAdminLoggedIn) {
      unsubscribe = onSnapshot(
        collection(db, 'records'),
        (snapshot) => {
          const records: FormRecord[] = [];
          snapshot.forEach((doc) => {
            records.push({ id: doc.id, ...doc.data() } as FormRecord);
          });
          setSavedRecords(records);
        },
        (error) => {
          console.error('Error fetching records from Firebase', error);
        }
      );
    } else {
      setSavedRecords([]);
    }`;

const fbEffectReplace = `    // 1. Subscribe to Firebase records
    const unsubscribe = onSnapshot(
      collection(db, 'records'),
      (snapshot) => {
        const records: FormRecord[] = [];
        snapshot.forEach((doc) => {
          records.push({ id: doc.id, ...doc.data() } as FormRecord);
        });
        setSavedRecords(records);
      },
      (error) => {
        console.error('Error fetching records from Firebase', error);
      }
    );`;

code = code.replace(fbEffectMatch, fbEffectReplace);

// Also let's check line 1476
const otherMatch = `                            {isAdminLoggedIn && (`;
code = code.replace(otherMatch, `                            {true && (`);

fs.writeFileSync('src/App.tsx', code);
console.log("Done");
