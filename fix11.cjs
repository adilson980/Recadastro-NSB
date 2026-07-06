const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Remove isAdminLoggedIn from Firebase useEffect
const fbEffectMatch = `  // Load baseline CSV and Firebase records
  useEffect(() => {
    // 1. Subscribe to Firebase records ONLY if Admin
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
          console.error("Error fetching records:", error);
        }
      );
    } else {
      setSavedRecords([]);
    }`;
const fbEffectReplace = `  // Load baseline CSV and Firebase records
  useEffect(() => {
    // 1. Subscribe to Firebase records
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
        console.error("Error fetching records:", error);
      }
    );`;
code = code.replace(fbEffectMatch, fbEffectReplace);

// 2. Remove isAdminLoggedIn from the dependency array of this useEffect
code = code.replace(/}, \[isAdminLoggedIn\]\);/, '}, []);');

// 3. Remove isAdminLoggedIn completely from the file
// Find the first part of the state
code = code.replace(/const \[isAdminLoggedIn, setIsAdminLoggedIn\] = useState\(false\);\n/, '');

// 4. Find the auth state change and remove it
const authStateMatch = `    const unsubscribeAuth = onAuthStateChanged(getAuth(app), (user) => {
      if (user) {
        const envEmails = import.meta.env.VITE_ALLOWED_EMAILS;
        const defaultEmails = ['j.adilson_bezerra@hotmail.com', 'euclides.vs@gmail.com'];
        const allowedEmails = envEmails ? envEmails.split(',').map((e: string) => e.trim().toLowerCase()) : defaultEmails;
        if (user.email && allowedEmails.includes(user.email.toLowerCase())) {
          setIsAdminLoggedIn(true);
          setAdminUser(user);
        } else {
          signOut(getAuth(app));
          setAdminError('Acesso negado: Email não autorizado.');
        }
      } else {
        if (!isAdminLoggedIn) {
          setIsAdminLoggedIn(false);
          setAdminUser(null);
        }
      }
    });
    return () => unsubscribeAuth();`;
code = code.replace(authStateMatch, '');

// 5. Remove it from the dependency array of the first useEffect
code = code.replace(/}, \[activeTab, isAdminLoggedIn\]\);/, '}, [activeTab]);');

fs.writeFileSync('src/App.tsx', code);
console.log("Done");
