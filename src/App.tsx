import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, 
  MapPin, 
  FileText, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  Smartphone, 
  Sparkles, 
  Filter, 
  Download, 
  Trash2, 
  BarChart2, 
  ClipboardList, 
  UserCheck, 
  BookOpen, 
  Eye, 
  X,
  PlusCircle,
  FolderSync,
  Lock,
  Unlock,
  ShieldCheck,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { FormRecord, TabType, FilterOptions } from './types';
import { parseCSVData, sanitizeCPF, formatCPF, formatPhone } from './csvParser';
import { fallbackCSVRecords } from './csvFallbackData';
// @ts-ignore
import dadosRaw from './dados.csv?raw';
import { db, getAuthInstance, googleProvider } from './lib/firebase';
import { collection, doc, setDoc, getDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { signInWithPopup, onAuthStateChanged, signOut, User } from 'firebase/auth';

// Safe LocalStorage wrapper to prevent sandbox SecurityError in iframes
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window && window.localStorage !== null) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      console.warn('LocalStorage item reading is denied or unsupported:', e);
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window && window.localStorage !== null) {
        window.localStorage.setItem(key, value);
      }
    } catch (e) {
      console.warn('LocalStorage item writing is denied or unsupported:', e);
    }
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window && window.localStorage !== null) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn('LocalStorage item removal is denied or unsupported:', e);
    }
  }
};

// Brazilian States List for Dropdowns
const BRAZIL_STATES = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' }
];

const INITIAL_RECORD_STATE = (cpfValue = ''): Omit<FormRecord, 'id'> => ({
  timestamp: '',
  filiadoNsb: 'Não',
  cargoNsb: '',
  delegado: '',
  nomeCompleto: '',
  dataNascimento: '',
  rg: '',
  cpf: cpfValue,
  sexo: 'Masculino',
  corRaca: 'Não especificada',
  tituloEleitorial: '',
  zona: '',
  secao: '',
  endereco: '',
  cidade: '',
  estado: '',
  aeroportoOrigem: '',
  telefone: '',
  cep: '',
  email: '',
  jaFoiCandidato: 'NÃO',
  cargoDisputado: '',
  anoUltimaEleicao: '',
  votacao: '0',
  possuiMandato: 'Não',
  qualCargoEletivo: '',
  cargoEleicao2024: '',
  pontuacao: '',
  vicePrefeito: '',

  // 2026 update expansions
  pretendeConcorrer2026: 'Em estudo',
  cargoPretendido2026: '',
  mandatoVigente2026: 'Não',
  cargoMandato2026: '',
  observacoes2026: '',
  revisadoPara2026: false,
  dataAtualizacao2026: '',
  prioridade: '',
});

interface SafeResponsiveContainerProps {
  children: (width: number, height: number) => React.ReactNode;
}

const SafeResponsiveContainer: React.FC<SafeResponsiveContainerProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });

    resizeObserver.observe(containerRef.current);
    
    // Set initial size
    const rect = containerRef.current.getBoundingClientRect();
    setDimensions({ width: rect.width || 300, height: rect.height || 220 });

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[220px]">
      {dimensions.width > 0 && dimensions.height > 0 && children(dimensions.width, dimensions.height)}
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('form');
  const [csvRecords, setCsvRecords] = useState<FormRecord[]>(fallbackCSVRecords);
  const [savedRecords, setSavedRecords] = useState<FormRecord[]>([]);
  
  // CPF Search flow state
  const [cpfSearch, setCpfSearch] = useState('');
  const [searchCompleted, setSearchCompleted] = useState(false);
  const [isPreExisting, setIsPreExisting] = useState(false);
  const [wasAlreadyUpdated, setWasAlreadyUpdated] = useState(false);
  
  // Interactive Form Step State
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Omit<FormRecord, 'id'>>(INITIAL_RECORD_STATE());
  const [lastSavedId, setLastSavedId] = useState<string | null>(null);

  // Admin Login States (compliant with LGPD)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [adminError, setAdminError] = useState<string | null>(null);

  useEffect(() => {
    // If running in a sandboxed iframe, delay loading of Firebase Auth's session-checking background iframe
    // until the user actually leaves the 'form' tab (such as clicking 'records' or 'export').
    const isInIframe = typeof window !== 'undefined' && window.self !== window.top;
    if (isInIframe && activeTab === 'form') {
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(getAuthInstance(), (user) => {
      if (user) {
        setIsAdminLoggedIn(true);
        setAdminUser(user);
      } else {
        setIsAdminLoggedIn(false);
        setAdminUser(null);
      }
    });
    return () => unsubscribeAuth();
  }, [activeTab]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setAdminError('Iniciando login...');
      await signInWithPopup(getAuthInstance(), googleProvider);
      setAdminError(null);
      triggerNotification('Acesso de administrador concedido com sucesso!', 'success');
    } catch (error: any) {
      console.error("Auth error details:", error);
      const isIframe = typeof window !== 'undefined' && window.self !== window.top;
      let msg = error.message;
      if (error.code) {
        msg += ` (Code: ${error.code})`;
      }
      if (isIframe) {
        msg += ' [Você está no modo de visualização. Tente abrir em uma nova guia.]';
      }
      setAdminError('Erro de autenticação: ' + msg);
      triggerNotification('Falha na autenticação.', 'error');
    }
  };

  const handleAdminLogout = async () => {
    try {
      await signOut(getAuthInstance());
      triggerNotification('Sessão encerrada com sucesso.', 'info');
    } catch (error) {
      console.error("Error logging out", error);
    }
  };

  // Filters for Admin View
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    estado: 'Todos',
    filiado: 'Todos',
    delegado: 'Todos'
  });

  // Admin and UI state
  const [selectedRecord, setSelectedRecord] = useState<FormRecord | null>(null);
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null);
  const [errorCSV, setErrorCSV] = useState<string | null>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Load baseline CSV and Firebase records
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
          console.error('Error fetching records from Firebase', error);
        }
      );
    } else {
      setSavedRecords([]);
    }

    // 2. Parse original full CSV from the imported raw asset and merge
    try {
      let csvTextToParse = '';
      if (typeof dadosRaw === 'string') {
        csvTextToParse = dadosRaw;
      } else if (dadosRaw && typeof dadosRaw === 'object' && 'default' in dadosRaw && typeof (dadosRaw as any).default === 'string') {
        csvTextToParse = (dadosRaw as any).default;
      }

      if (csvTextToParse && csvTextToParse.trim().length > 0) {
        const parsed = parseCSVData(csvTextToParse);
        if (parsed && parsed.length > 0) {
          setCsvRecords(prev => {
            const merged = [...parsed];
            prev.forEach(p => {
              if (!merged.some(m => sanitizeCPF(m.cpf) === sanitizeCPF(p.cpf))) {
                merged.push(p);
              }
            });
            return merged;
          });
          console.log(`Loaded ${parsed.length} database entries from imported dados.csv`);
        }
      }
    } catch (err: any) {
      console.warn('Could not parse imported dados.csv asset, using fallback dataset.', err.message);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isAdminLoggedIn]);

  // Set transient notification helper
  const triggerNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Run the CPF search
  const handleCpfCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSearch = sanitizeCPF(cpfSearch);
    if (cleanSearch.length < 11) {
      triggerNotification('Digite um CPF válido com 11 dígitos', 'error');
      return;
    }

    // 1. Fetch directly from Firebase using CPF as ID
    try {
      const docRef = doc(db, 'records', cleanSearch);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const savedMatch = { id: docSnap.id, ...docSnap.data() } as FormRecord;
        setFormData({
          ...savedMatch,
          revisadoPara2026: true,
          dataAtualizacao2026: savedMatch.dataAtualizacao2026 || new Date().toLocaleString('pt-BR')
        });
        setIsPreExisting(true);
        setWasAlreadyUpdated(true);
        setSearchCompleted(true);
        setCurrentStep(1);
        triggerNotification('Você já preencheu a revisão para 2026! Pode editar suas respostas.', 'info');
        return;
      }
    } catch (err) {
      console.error("Error fetching record:", err);
      // Fallback if there's an error, it will just proceed to checking CSV
    }

    // 2. Fall back to search in standard CSV entries (the baseline)
    const csvMatch = csvRecords.find(r => sanitizeCPF(r.cpf) === cleanSearch);
    if (csvMatch) {
      // Load pre-existing data, prefilled questions for 2026
      setFormData({
        ...csvMatch,
        pretendeConcorrer2026: csvMatch.cargoEleicao2024 ? 'Sim' : 'Em estudo',
        cargoPretendido2026: csvMatch.cargoEleicao2024 || '',
        mandatoVigente2026: csvMatch.possuiMandato || 'Não',
        cargoMandato2026: csvMatch.qualCargoEletivo || '',
        revisadoPara2026: true,
        dataAtualizacao2026: new Date().toLocaleString('pt-BR')
      });
      setIsPreExisting(true);
      setWasAlreadyUpdated(false);
      setSearchCompleted(true);
      setCurrentStep(1);
      triggerNotification('Registro encontrado com sucesso. Revise e confirme abaixo!', 'success');
    } else {
      // Create new record with pre-initialized CPF
      setFormData({
        ...INITIAL_RECORD_STATE(formatCPF(cleanSearch)),
        revisadoPara2026: true,
        dataAtualizacao2026: new Date().toLocaleString('pt-BR')
      });
      setIsPreExisting(false);
      setWasAlreadyUpdated(false);
      setSearchCompleted(true);
      setCurrentStep(1);
      triggerNotification('CPF não encontrado. Preencha um novo formulário de inscrição!', 'info');
    }
  };

  // Handle Form input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    let processedValue = value;
    if (name === 'telefone') {
      processedValue = formatPhone(value);
    } else if (name === 'cpf') {
      processedValue = formatCPF(value);
    }

    if (processedValue && typeof processedValue === 'string') {
      if (type === 'text' || type === 'email' || type === 'textarea' || (e.target && e.target.tagName === 'TEXTAREA')) {
        processedValue = processedValue.toUpperCase();
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  // Safe manual selection for radio buttons/custom selects
  const handleManualSelect = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Step validation
  const validateStep = (step: number): boolean => {
    if (step === 1) {
      return (formData.nomeCompleto || '').trim().length > 3 && sanitizeCPF(formData.cpf || '').length === 11;
    }
    if (step === 2) {
      return (formData.cidade || '').trim().length > 2 && (formData.estado || '').trim().length === 2 && (formData.telefone || '').trim().length >= 10;
    }
    return true;
  };

  // Transition to next form step
  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    } else {
      triggerNotification('Por favor, preencha corretamente os campos obrigatórios em destaque.', 'error');
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  // Reset/Restart form lookup
  const handleResetSearch = () => {
    setCpfSearch('');
    setSearchCompleted(false);
    setIsPreExisting(false);
    setWasAlreadyUpdated(false);
    setCurrentStep(1);
    setFormData(INITIAL_RECORD_STATE());
  };

  // Submit and Save record to Firebase
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(1) || !validateStep(2)) {
      triggerNotification('Incomplete fields. Please check previous steps.', 'error');
      return;
    }

    const cleanCpf = sanitizeCPF(formData.cpf);
    const recordId = cleanCpf;
    const recordToSave: FormRecord = {
      ...formData,
      id: recordId,
      timestamp: formData.timestamp || new Date().toLocaleString('pt-BR'),
      dataAtualizacao2026: new Date().toLocaleString('pt-BR'),
      revisadoPara2026: true
    };

    try {
      await setDoc(doc(db, 'records', recordId), recordToSave, { merge: true });
      setLastSavedId(recordId);
      setCurrentStep(6); // Success Step!
      triggerNotification('Dados salvos com sucesso!', 'success');
    } catch (err) {
      console.error('Error saving document: ', err);
      triggerNotification('Erro ao salvar os dados. Tente novamente.', 'error');
    }
  };

  // Restart after submission success
  const handleStartOver = () => {
    handleResetSearch();
  };

  // Admin utilities
  const handleDeleteRecord = (id: string) => {
    setDeletingRecordId(id);
  };

  const confirmDeleteRecord = async () => {
    if (deletingRecordId) {
      const id = deletingRecordId;
      try {
        await deleteDoc(doc(db, 'records', id));
        triggerNotification('Registro deletado.', 'info');
        if (selectedRecord && selectedRecord.id === id) {
          setSelectedRecord(null);
        }
        setDeletingRecordId(null);
      } catch (err) {
        console.error('Error deleting document: ', err);
        triggerNotification('Erro ao deletar registro.', 'error');
      }
    }
  };

  // Filtered lists for Admin database
  const filteredList = useMemo(() => {
    // Combine saved records and non-duplicate original (unrevised) records so admins see a unified database
    const combined: FormRecord[] = [...savedRecords];
    
    csvRecords.forEach(csvRec => {
      const isAlreadyInSaved = savedRecords.some(s => sanitizeCPF(s.cpf) === sanitizeCPF(csvRec.cpf));
      if (!isAlreadyInSaved) {
        combined.push({
          ...csvRec,
          revisadoPara2026: false
        });
      }
    });

    return combined.filter(record => {
      const nome = record.nomeCompleto || '';
      const cpf = record.cpf || '';
      const cidade = record.cidade || '';
      const estado = record.estado || '';
      const filiado = record.filiadoNsb || '';
      const delegadoStr = record.delegado || '';

      // 1. Search filter (Name or CPF or City)
      const matchesSearch = 
        nome.toLowerCase().includes(filters.search.toLowerCase()) ||
        sanitizeCPF(cpf).includes(sanitizeCPF(filters.search)) ||
        cidade.toLowerCase().includes(filters.search.toLowerCase());
        
      // 2. State filter
      const matchesEstado = filters.estado === 'Todos' || estado === filters.estado;

      // 3. Filiation status
      const matchesFiliado = filters.filiado === 'Todos' || 
        (filters.filiado === 'Sim' && filiado.toLowerCase() === 'sim') ||
        (filters.filiado === 'Não' && filiado.toLowerCase() !== 'sim');

      // 4. Delegado status
      const matchesDelegado = filters.delegado === 'Todos' || 
        (filters.delegado === 'Sim' && delegadoStr.trim() !== '') ||
        (filters.delegado === 'Não' && delegadoStr.trim() === '');

      return matchesSearch && matchesEstado && matchesFiliado && matchesDelegado;
    });
  }, [savedRecords, csvRecords, filters]);

  // Export Unified Database as a pristine CSV file
  const handleExportCSV = () => {
    const combined: FormRecord[] = [...savedRecords];
    csvRecords.forEach(csvRec => {
      const exists = savedRecords.some(s => sanitizeCPF(s.cpf) === sanitizeCPF(csvRec.cpf));
      if (!exists) {
        combined.push({
          ...csvRec,
          revisadoPara2026: false
        });
      }
    });

    const headers = [
      'ID', 'Carimbo de data/hora', 'Nome Completo', 'CPF', 'Data Nascimento', 'Sexo', 'Cor ou Raça', 'Filiado NSB', 
      'Cargo NSB', 'Delegado', 'Telefone', 'E-mail', 'Endereço', 'Cidade', 'Estado', 'CEP', 
      'RG', 'Título Eleitoral', 'Zona', 'Seção', 'Candidato Anterior', 'Cargo Disputado', 
      'Votação', 'Possui Mandato 2024', 'Cargo Mandato 2024', 'Revisado para 2026', 'Data Atualização 2026',
      'Pretensão 2026', 'Cargo Pretendido 2026', 'Mandato 2026', 'Cargo Atuante 2026', 'Observações 2026', 'Prioridade'
    ];

    const rows = combined.map(r => [
      r.id,
      r.timestamp || '',
      r.nomeCompleto || '',
      r.cpf || '',
      r.dataNascimento || '',
      r.sexo || '',
      r.corRaca || '',
      r.filiadoNsb || '',
      r.cargoNsb || '',
      r.delegado || '',
      r.telefone || '',
      r.email || '',
      `"${r.endereco?.replace(/"/g, '""') || ''}"`,
      r.cidade || '',
      r.estado || '',
      r.cep || '',
      r.rg || '',
      r.tituloEleitorial || '',
      r.zona || '',
      r.secao || '',
      r.jaFoiCandidato || '',
      r.cargoDisputado || '',
      r.votacao || '',
      r.possuiMandato || '',
      r.qualCargoEletivo || '',
      r.revisadoPara2026 ? 'Sim' : 'Não',
      r.dataAtualizacao2026 || '',
      r.pretendeConcorrer2026 || '',
      r.cargoPretendido2026 || '',
      r.mandatoVigente2026 || '',
      r.cargoMandato2026 || '',
      `"${r.observacoes2026?.replace(/"/g, '""') || ''}"`,
      r.prioridade || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'nsb_cadastro_unificado_atualizado_2026.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerNotification('Base de dados exportada com sucesso!', 'success');
  };

  // Admin CSV import fallback lookup handler
  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      try {
        const parsed = parseCSVData(text);
        if (parsed.length > 0) {
          setCsvRecords(parsed);
          setImportMessage(`Sucesso! Carregados ${parsed.length} registros como base de pesquisa.`);
          triggerNotification(`${parsed.length} cadastros importados na pesquisa!`, 'success');
        } else {
          setErrorCSV('Nenhum registro válido pôde ser extraído do arquivo CSV enviado.');
        }
      } catch (err) {
        setErrorCSV('Formato de CSV inválido.');
      }
    };
    reader.readAsText(file);
  };

  // Numerical indicators for dashboard statistics
  const stats = useMemo(() => {
    const totalLocalUpdates = savedRecords.length;
    const totalRepresented = csvRecords.length + savedRecords.filter(r => !csvRecords.some(c => sanitizeCPF(c.cpf) === sanitizeCPF(r.cpf))).length;
    const nsbMembers = savedRecords.filter(r => r.filiadoNsb?.toLowerCase() === 'sim').length;
    
    // States distribution
    const statesMap: { [key: string]: number } = {};
    savedRecords.forEach(r => {
      if (r.estado) statesMap[r.estado] = (statesMap[r.estado] || 0) + 1;
    });
    
    // Candidacy goals for 2026
    const candidate2026Intents = {
      sim: savedRecords.filter(r => r.pretendeConcorrer2026 === 'Sim').length,
      estudo: savedRecords.filter(r => r.pretendeConcorrer2026 === 'Em estudo').length,
      nao: savedRecords.filter(r => r.pretendeConcorrer2026 === 'Não').length,
    };

    const intentionsChartData = [
      { name: 'Sim', value: candidate2026Intents.sim },
      { name: 'Em Estudo', value: candidate2026Intents.estudo },
      { name: 'Não', value: candidate2026Intents.nao },
    ];

    const statesChartData = Object.keys(statesMap)
      .map(key => ({ name: key, count: statesMap[key] }))
      .sort((a, b) => b.count - a.count);

    const genderMap: Record<string, number> = {};
    const colorMap: Record<string, number> = {};
    const priorityMap: Record<string, number> = {};
    const priorityList: Array<{nome: string, uf: string, cor: string, prioridade: string}> = [];

    savedRecords.forEach(r => {
      const g = r.sexo || 'Não especificada';
      const c = r.corRaca || 'Não especificada';
      const p = r.prioridade || 'Sem prioridade';
      
      genderMap[g] = (genderMap[g] || 0) + 1;
      colorMap[c] = (colorMap[c] || 0) + 1;
      priorityMap[p] = (priorityMap[p] || 0) + 1;

      if (r.prioridade && r.prioridade !== 'Sem prioridade' && r.prioridade !== '') {
        priorityList.push({
          nome: r.nomeCompleto || 'Sem Nome',
          uf: r.estado || 'N/A',
          cor: r.corRaca || 'N/A',
          prioridade: r.prioridade
        });
      }
    });

    priorityList.sort((a, b) => {
      const order: Record<string, number> = { 'Alta': 1, 'Média': 2, 'Baixa': 3 };
      return (order[a.prioridade] || 4) - (order[b.prioridade] || 4);
    });

    const genderChartData = Object.keys(genderMap).map(k => ({ name: k, value: genderMap[k] }));
    const colorChartData = Object.keys(colorMap).map(k => ({ name: k, value: colorMap[k] })).sort((a,b) => b.value - a.value);
    const priorityChartData = Object.keys(priorityMap).map(k => ({ name: k, value: priorityMap[k] }));

    return {
      totalLocalUpdates,
      totalRepresented,
      nsbMembers,
      statesMap,
      candidate2026Intents,
      intentionsChartData,
      statesChartData,
      genderChartData,
      colorChartData,
      priorityChartData,
      priorityList
    };
  }, [savedRecords, csvRecords]);

  return (
    <div id="app-container" className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col antialiased">
      
      {/* Dynamic Pop-up Notification Banner */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 max-w-sm md:max-w-md backdrop-blur-md border text-sm font-medium ${
              notification.type === 'success' 
                ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300' 
                : notification.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/30 text-rose-300'
                : 'bg-indigo-950/90 border-indigo-500/30 text-indigo-300'
            }`}
          >
            <CheckCircle className={`h-5 w-5 ${notification.type === 'success' ? 'text-emerald-400' : notification.type === 'error' ? 'text-rose-400' : 'text-indigo-400'}`} />
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Layout */}
      <header id="app-header" className="border-b border-slate-800 bg-slate-950/60 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-700/20 text-emerald-400 rounded-xl border border-emerald-500/20 shadow-inner">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight text-white flex items-center gap-2">
                Ficha de Cadastro NSB 2026
              </h1>
              <p className="text-xs text-slate-400 font-mono tracking-tight">Negritude Socialista Brasileira</p>
            </div>
          </div>

          {/* Tab Selection */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {isAdminLoggedIn && (
              <div className="flex items-center gap-2 px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                <span>Admin Autenticado (LGPD)</span>
                <button
                  onClick={() => {
                    handleAdminLogout();
                    setActiveTab('form');
                  }}
                  className="ml-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[9px] px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                >
                  Sair
                </button>
              </div>
            )}
            <nav id="app-nav" className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                id="btn-tab-form"
                onClick={() => setActiveTab('form')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                  activeTab === 'form' 
                    ? 'bg-emerald-700 text-white shadow-md shadow-emerald-950/30' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span>Formulário</span>
              </button>
              <button
                id="btn-tab-records"
                onClick={() => setActiveTab('records')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                  activeTab === 'records' 
                    ? 'bg-emerald-700 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {isAdminLoggedIn ? (
                  <ClipboardList className="h-3.5 w-3.5" />
                ) : (
                  <Lock className="h-3.5 w-3.5 text-rose-400/85" />
                )}
                <span>Registros ({savedRecords.length})</span>
              </button>
              <button
                id="btn-tab-export"
                onClick={() => setActiveTab('export')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                  activeTab === 'export' 
                    ? 'bg-emerald-700 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {isAdminLoggedIn ? (
                  <BarChart2 className="h-3.5 w-3.5" />
                ) : (
                  <Lock className="h-3.5 w-3.5 text-rose-400/85" />
                )}
                <span>Métricas & Exportar</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Body Component */}
      <main id="app-main" className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-start">
        
        {activeTab === 'form' && (
          <div id="form-tab-container" className="flex-1 flex flex-col xl:flex-row items-center xl:items-start justify-center gap-8 py-4">
            
            {/* Visual Phone Mockup Wrapper */}
            <div id="phone-container" className="w-full max-w-md bg-slate-950/95 rounded-[40px] p-4 border-4 border-slate-800 shadow-2xl relative overflow-hidden flex flex-col justify-between aspect-auto min-h-[700px] shadow-emerald-950/10 self-center">
              
              {/* Phone Speaker & Notch bar */}
              <div id="phone-notch" className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-4 bg-slate-800 rounded-b-2xl z-20 flex items-center justify-center">
                <span className="w-8 h-1 bg-slate-900 rounded-full"></span>
              </div>

              {/* Internal phone screen */}
              <div id="phone-inner-screen" className="flex-1 flex flex-col justify-between pt-6 px-1 h-full">
                
                {/* 1. CPF Verification Entry Point */}
                {!searchCompleted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex-1 flex flex-col justify-between py-6"
                  >
                    <div className="space-y-6 pt-4 text-center">
                      <div className="mx-auto w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-950/40">
                        <UserCheck className="h-8 w-8 text-white" />
                      </div>
                      
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20 inline-block font-bold">
                          Recadastramento 2026
                        </span>
                        <h2 className="text-xl font-extrabold tracking-tight text-white px-2">
                          Portal de Atualização NSB
                        </h2>
                        <p className="text-xs text-slate-400 px-4 leading-relaxed">
                          Bem-vindo! Forneça seu CPF para recuperar seu cadastro na base e atualizá-lo para a mobilização política de 2026.
                        </p>
                      </div>

                      {/* CPF Search Bar Card */}
                      <form onSubmit={handleCpfCheck} className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-4 text-left">
                        <label htmlFor="cpf-search-input" className="block text-xs font-semibold text-slate-300 font-mono">
                          SEU CPF (APENAS NÚMEROS)
                        </label>
                        <div className="relative">
                          <input
                            id="cpf-search-input"
                            type="text"
                            placeholder="000.000.000-00"
                            maxLength={14}
                            value={cpfSearch}
                            onChange={(e) => setCpfSearch(formatCPF(e.target.value))}
                            autoFocus
                            className="w-full text-center tracking-widest text-lg font-bold font-mono bg-slate-950 text-white rounded-xl py-3 pl-4 pr-11 border border-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                          />
                          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        </div>
                        <button
                          id="btn-verify-cpf"
                          type="submit"
                          className="w-full py-3 bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-colors"
                        >
                          <span>Verificar CPF</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </form>

                      {/* Quick hints for testing */}
                      <div className="px-3 py-2 bg-slate-900/30 rounded-xl border border-slate-800/50 text-left">
                        <p className="text-[10px] text-slate-400 font-mono leading-relaxed">
                          💡 <strong className="text-slate-300">Dica do sistema:</strong> Digite seu CPF para revisar seus dados prontamente, ou utilize CPFs teste como: <code className="text-emerald-400 bg-emerald-900/10 px-1 py-0.5 rounded font-bold whitespace-nowrap">493.066.692-91</code> (José Adilson) ou <code className="text-emerald-400 bg-emerald-900/10 px-1 py-0.5 rounded font-bold whitespace-nowrap">309.174.988-60</code>.
                        </p>
                      </div>
                    </div>

                    <div className="text-center pt-4">
                      <p className="text-[10px] text-slate-500">
                        Os dados fornecidos são armazenados com segurança localmente em seu navegador.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  
                  /* 2. Form Wizard Step Area */
                  <div className="flex-1 flex flex-col justify-between h-full">
                    
                    {/* Compact Step Progress Bar */}
                    <div id="step-indicator" className="mb-4">
                      <div className="flex items-center justify-between text-[10px] font-bold font-mono text-slate-400 mb-1.5 px-1.5">
                        <span className="text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle className="h-3 w-3" />
                          <span>Etapa {currentStep} de 5</span>
                        </span>
                        <span>
                          {currentStep === 1 && 'Identificação'}
                          {currentStep === 2 && 'Contato'}
                          {currentStep === 3 && 'Eleitoral'}
                          {currentStep === 4 && 'Histórico'}
                          {currentStep === 5 && 'Atualização 2026'}
                        </span>
                      </div>
                      <div className="h-1 bg-slate-800 rounded-full overflow-hidden flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <div
                            key={s}
                            className={`flex-1 h-full rounded-full transition-all duration-350 ${
                              s <= currentStep ? 'bg-emerald-500' : 'bg-slate-800'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Pre-fill alerts */}
                    {currentStep === 1 && (
                      <div className="mb-3 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2.5">
                        <div className="p-1 bg-emerald-500/10 text-emerald-400 rounded-lg">
                          <CheckCircle className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1">
                          <span className="text-[10px] font-bold text-emerald-400">
                            {isPreExisting ? 'CADASTRO ENCONTRADO!' : 'FICHA EM BRANCO'}
                          </span>
                          <p className="text-[10px] text-slate-400 leading-tight">
                            {isPreExisting 
                              ? `Ficha recuperada para: ${formData.nomeCompleto || 'Candidato'}. Por favor revise atentamente e complete as perguntas para 2026.`
                              : 'CPF sem cadastro anterior. Insira todos os dados solicitados de forma completa.'
                            }
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Interactive Steps Form Fields */}
                    <div className="flex-1 overflow-y-auto pr-1 max-h-[460px] space-y-4 py-2">
                      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                        
                        {/* STEP 1: PERSONAL INFORMATION */}
                        {currentStep === 1 && (
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-3.5"
                          >
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">CPF</label>
                              <input
                                type="text"
                                value={formData.cpf}
                                disabled
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold font-mono text-slate-500 focus:outline-none"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">Nome Completo *</label>
                              <input
                                type="text"
                                name="nomeCompleto"
                                placeholder="Insira o nome oficial completo"
                                value={formData.nomeCompleto}
                                onChange={handleChange}
                                required
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3.5">
                              <div className="space-y-1">
                                <label className="block text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">Nascimento</label>
                                <input
                                  type="text"
                                  name="dataNascimento"
                                  placeholder="DD/MM/AAAA"
                                  value={formData.dataNascimento}
                                  onChange={handleChange}
                                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="block text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">Sexo</label>
                                <select
                                  name="sexo"
                                  value={formData.sexo}
                                  onChange={handleChange}
                                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                                >
                                  <option value="Masculino">Masculino</option>
                                  <option value="Feminino">Feminino</option>
                                  <option value="Outros">Outro / ND</option>
                                </select>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">Cor ou Raça</label>
                              <select
                                name="corRaca"
                                value={formData.corRaca}
                                onChange={handleChange}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                              >
                                <option value="Preta">Preta</option>
                                <option value="Parda">Parda</option>
                                <option value="Indígena">Indígena</option>
                                <option value="Amarela">Amarela</option>
                                <option value="Branca">Branca</option>
                                <option value="Não especificada">Prefiro não declarar</option>
                              </select>
                            </div>
                          </motion.div>
                        )}

                        {/* STEP 2: ADDRESS AND RECENT CHANNELS */}
                        {currentStep === 2 && (
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-3.5"
                          >
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">Telefone de Contato *</label>
                              <input
                                type="text"
                                name="telefone"
                                placeholder="(XX) XXXXX-XXXX"
                                value={formData.telefone}
                                onChange={handleChange}
                                autoComplete="tel"
                                required
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">Endereço de E-mail</label>
                              <input
                                type="email"
                                name="email"
                                placeholder="usuario@email.com"
                                value={formData.email}
                                onChange={handleChange}
                                autoComplete="email"
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                              />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                              <div className="col-span-2 space-y-1">
                                <label className="block text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">Cidade *</label>
                                <input
                                  type="text"
                                  name="cidade"
                                  placeholder="Nome da Cidade"
                                  value={formData.cidade}
                                  onChange={handleChange}
                                  required
                                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="block text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">Estado *</label>
                                <select
                                  name="estado"
                                  value={formData.estado || ''}
                                  onChange={handleChange}
                                  required
                                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                                >
                                  <option value="">UF</option>
                                  {BRAZIL_STATES.map((s) => (
                                    <option key={s.value} value={s.value}>{s.value}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                              <div className="col-span-1 space-y-1">
                                <label className="block text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">CEP</label>
                                <input
                                  type="text"
                                  name="cep"
                                  placeholder="00000-000"
                                  value={formData.cep}
                                  onChange={handleChange}
                                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-2 text-xs text-white focus:outline-none font-mono"
                                />
                              </div>

                              <div className="col-span-2 space-y-1">
                                <label className="block text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">Bairro, Logradouro</label>
                                <input
                                  type="text"
                                  name="endereco"
                                  placeholder="Rua, Número, Complemento"
                                  value={formData.endereco}
                                  onChange={handleChange}
                                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {/* STEP 3: ELECTORAL AND SECONDARY INFO */}
                        {currentStep === 3 && (
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-3.5"
                          >
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">RG</label>
                              <input
                                type="text"
                                name="rg"
                                placeholder="Registro Geral"
                                value={formData.rg}
                                onChange={handleChange}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">Título de Eleitor</label>
                              <input
                                type="text"
                                name="tituloEleitorial"
                                placeholder="Inscrição eleitoral"
                                value={formData.tituloEleitorial}
                                onChange={handleChange}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3.5">
                              <div className="space-y-1">
                                <label className="block text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">Zona Eleitoral</label>
                                <input
                                  type="text"
                                  name="zona"
                                  placeholder="Nº Zona"
                                  value={formData.zona}
                                  onChange={handleChange}
                                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="block text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">Seção Eleitoral</label>
                                <input
                                  type="text"
                                  name="secao"
                                  placeholder="Nº Seção"
                                  value={formData.secao}
                                  onChange={handleChange}
                                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">Aeroporto de Origem mais próximo</label>
                              <input
                                type="text"
                                name="aeroportoOrigem"
                                placeholder="CGB, GRU, GIG ou Nome da Cidade"
                                value={formData.aeroportoOrigem}
                                onChange={handleChange}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                              />
                            </div>
                          </motion.div>
                        )}

                        {/* STEP 4: HISTORIC POLITICAL ACTIVITY */}
                        {currentStep === 4 && (
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-3.5"
                          >
                            <div className="pt-1 select-none space-y-1">
                              <label className="block text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">Filiado(a) à NSB?</label>
                              <div className="grid grid-cols-2 gap-2 mt-1">
                                {['Sim', 'Não'].map(op => (
                                  <button
                                    key={op}
                                    type="button"
                                    onClick={() => handleManualSelect('filiadoNsb', op)}
                                    className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                                      formData.filiadoNsb === op
                                        ? 'bg-emerald-950/55 border-emerald-500 text-emerald-300 shadow-inner'
                                        : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:bg-slate-800'
                                    }`}
                                  >
                                    {op}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {formData.filiadoNsb === 'Sim' && (
                              <div className="space-y-1">
                                <label className="block text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">Cargo na NSB</label>
                                <input
                                  type="text"
                                  name="cargoNsb"
                                  placeholder="Membro, Diretor, Secretário"
                                  value={formData.cargoNsb}
                                  onChange={handleChange}
                                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                                />
                              </div>
                            )}

                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">Selecione se for Delegado(a)</label>
                              <select
                                name="delegado"
                                value={formData.delegado}
                                onChange={handleChange}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                              >
                                <option value="">Não sou Delgado(a)</option>
                                <option value="Delegado(a) Nato(a)">Delegado(a) Nato(a)</option>
                                <option value="Delegado(a) Eleita(a)">Delegado(a) Eleito(a)</option>
                              </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3.5">
                              <div className="space-y-1">
                                <label className="block text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">Já disputou eleição?</label>
                                <select
                                  name="jaFoiCandidato"
                                  value={formData.jaFoiCandidato}
                                  onChange={handleChange}
                                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                                >
                                  <option value="SIM">Sim</option>
                                  <option value="NÃO">Não</option>
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="block text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase font-bold">Votos da última disputa</label>
                                <input
                                  type="text"
                                  name="votacao"
                                  placeholder="0"
                                  value={formData.votacao}
                                  onChange={handleChange}
                                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                                />
                              </div>
                            </div>

                            {formData.jaFoiCandidato === 'SIM' && (
                              <div className="grid grid-cols-2 gap-3.5">
                                <div className="space-y-1">
                                  <label className="block text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">Último cargo disputado</label>
                                  <input
                                    type="text"
                                    name="cargoDisputado"
                                    placeholder="Vereador, Deputado"
                                    value={formData.cargoDisputado}
                                    onChange={handleChange}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <label className="block text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">Último ano disputado</label>
                                  <input
                                    type="text"
                                    name="anoUltimaEleicao"
                                    placeholder="2020, 2022"
                                    value={formData.anoUltimaEleicao}
                                    onChange={handleChange}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                                  />
                                </div>
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-3.5">
                              <div className="space-y-1">
                                <label className="block text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">Possui mandato hoje?</label>
                                <select
                                  name="possuiMandato"
                                  value={formData.possuiMandato}
                                  onChange={handleChange}
                                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                                >
                                  <option value="Sim">Sim</option>
                                  <option value="Não">Não</option>
                                </select>
                              </div>

                              {formData.possuiMandato === 'Sim' && (
                                <div className="space-y-1">
                                  <label className="block text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">Qual cargo eletivo?</label>
                                  <input
                                    type="text"
                                    name="qualCargoEletivo"
                                    placeholder="Qual cargo ocupa"
                                    value={formData.qualCargoEletivo}
                                    onChange={handleChange}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                                  />
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}

                        {/* STEP 5: 2026 MOBILIZATION AND INTENTIONS (CRITICAL SECTION) */}
                        {currentStep === 5 && (
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-4"
                          >
                            <div className="p-3 bg-emerald-950/25 border border-emerald-500/20 rounded-2xl">
                              <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
                                <Sparkles className="h-4 w-4" />
                                <span>Planejamiento Eleitoral 2026</span>
                              </h3>
                              <p className="text-[10px] text-slate-300 leading-normal">
                                Estas perguntas são cruciais para mapear o nosso alinhamento regional de lideranças de igualdade racial para 2026.
                              </p>
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold font-mono tracking-wider text-emerald-400 uppercase">Pretende se candidatar em 2026? *</label>
                              <div className="grid grid-cols-3 gap-2 mt-1">
                                {['Sim', 'Não', 'Em estudo'].map(op => (
                                  <button
                                    key={op}
                                    type="button"
                                    onClick={() => handleManualSelect('pretendeConcorrer2026', op)}
                                    className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                                      formData.pretendeConcorrer2026 === op
                                        ? 'bg-emerald-700 border-emerald-500 text-white shadow-md'
                                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                                    }`}
                                  >
                                    {op}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {formData.pretendeConcorrer2026 === 'Sim' && (
                              <div className="space-y-1 animate-fadeIn">
                                <label className="block text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">Qual Cargo?</label>
                                <select
                                  name="cargoPretendido2026"
                                  value={formData.cargoPretendido2026 || ''}
                                  onChange={handleChange}
                                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                                >
                                  <option value="">Selecione o cargo</option>
                                  <option value="PRESIDENTE DA REPÚBLICA">PRESIDENTE DA REPÚBLICA</option>
                                  <option value="SENADOR(A) DA REPÚBLICA">SENADOR(A) DA REPÚBLICA</option>
                                  <option value="DEPUTADO(A) FEDERAL">DEPUTADO(A) FEDERAL</option>
                                  <option value="GOVERNADOR(A)">GOVERNADOR(A)</option>
                                  <option value="DEPUTADO(A) ESTADUAL">DEPUTADO(A) ESTADUAL</option>
                                </select>
                              </div>
                            )}

                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">Exerce mandato político em 2026?</label>
                              <select
                                name="mandatoVigente2026"
                                value={formData.mandatoVigente2026 || 'Não'}
                                onChange={handleChange}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                              >
                                <option value="Não">Não possuo mandato vigente</option>
                                <option value="Sim">Sim, exerço mandato eletivo</option>
                              </select>
                            </div>

                            {formData.mandatoVigente2026 === 'Sim' && (
                              <div className="space-y-1">
                                <label className="block text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">Qual cargo exercido em 2026?</label>
                                <input
                                  type="text"
                                  name="cargoMandato2026"
                                  placeholder="Ex: Vereador titular"
                                  value={formData.cargoMandato2026 || ''}
                                  onChange={handleChange}
                                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                                />
                              </div>
                            )}

                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">Observações e Informações Adicionais</label>
                              <textarea
                                name="observacoes2026"
                                placeholder="Alguma observação importante sobre sua base, seu partido regional ou necessidades locais..."
                                rows={3}
                                value={formData.observacoes2026 || ''}
                                onChange={handleChange}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none text-slate-300 placeholder-slate-600 focus:border-emerald-500"
                              />
                            </div>

                            {isAdminLoggedIn && (
                              <div className="space-y-1 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl mt-4">
                                <label className="block text-[10px] font-bold font-mono tracking-wider text-rose-400 uppercase flex items-center gap-1.5">
                                  <Lock className="h-3 w-3" />
                                  Prioridade da Liderança
                                </label>
                                <select
                                  name="prioridade"
                                  value={formData.prioridade || ''}
                                  onChange={handleChange}
                                  className="w-full bg-slate-900 border border-rose-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                                >
                                  <option value="">Sem prioridade definida</option>
                                  <option value="Alta">Alta</option>
                                  <option value="Média">Média</option>
                                  <option value="Baixa">Baixa</option>
                                </select>
                                <p className="text-[9px] text-slate-400 font-mono mt-1">Este campo é visível apenas para administradores logados.</p>
                              </div>
                            )}
                          </motion.div>
                        )}

                      </form>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between gap-3">
                      {currentStep > 1 ? (
                        <button
                          id="btn-form-prev"
                          onClick={handlePrevStep}
                          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs flex items-center gap-2 border border-slate-800 cursor-pointer transition-all"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          <span>Voltar</span>
                        </button>
                      ) : (
                        <button
                          id="btn-form-cancel"
                          onClick={handleResetSearch}
                          className="px-4 py-2.5 bg-slate-900/60 hover:bg-slate-950 text-slate-400 font-bold rounded-xl text-xs flex items-center gap-2 border border-slate-850 cursor-pointer transition-all"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          <span>Mudar CPF</span>
                        </button>
                      )}

                      {currentStep < 5 ? (
                        <button
                          id="btn-form-next"
                          onClick={handleNextStep}
                          disabled={!validateStep(currentStep)}
                          className={`px-5 py-2.5 font-bold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer ${
                            validateStep(currentStep)
                              ? 'bg-emerald-700 hover:bg-emerald-600 text-white shadow-md'
                              : 'bg-slate-900 text-slate-600 border border-slate-850 cursor-not-allowed'
                          }`}
                        >
                          <span>Avançar</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          id="btn-form-submit"
                          onClick={handleFormSubmit}
                          className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 cursor-pointer transition-all"
                        >
                          <CheckCircle className="h-4 top-0.5 relative w-4" />
                          <span>Finalizar Ficha</span>
                        </button>
                      )}
                    </div>

                  </div>
                )}

                {/* 3. CONFIRMATION SUCCESS STEP */}
                {currentStep === 6 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex-1 flex flex-col justify-between py-8 text-center"
                  >
                    <div className="space-y-6 pt-6">
                      <div className="mx-auto w-20 h-20 rounded-full bg-emerald-950 border-2 border-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-950/50">
                        <CheckCircle className="h-10 w-10 text-emerald-400 animate-pulse" />
                      </div>

                      <div className="space-y-2">
                        <h2 className="text-xl font-extrabold text-white">Ficha Confirmada!</h2>
                        <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 inline-block font-bold">
                          Atualizado para 2026
                        </span>
                      </div>

                      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-left space-y-2">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-800 text-xs text-slate-400">
                          <span>Nome Completo</span>
                          <span className="font-bold text-white max-w-[210px] truncate">{formData.nomeCompleto}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-slate-400">
                          <span>CPF Registrado</span>
                          <span className="font-mono text-slate-200">{formData.cpf}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-slate-400">
                          <span>Cidade / UF</span>
                          <span className="text-slate-200">{formData.cidade} / {formData.estado}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-slate-400">
                          <span>Opção 2026</span>
                          <span className="font-bold text-emerald-400">{formData.pretendeConcorrer2026}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed px-2">
                        Seu registro foi atualizado e salvo automaticamente no armazenamento local deste aparelho. Você pode exportar o arquivo consolidado de respostas a qualquer momento.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <button
                        id="btn-form-new-search"
                        onClick={handleStartOver}
                        className="w-full py-3 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-colors"
                      >
                        <RotateCcw className="h-4.5 w-4.5" />
                        <span>Novo Recadastramento</span>
                      </button>
                      <button
                        id="btn-goto-records"
                        onClick={() => { setActiveTab('records'); handleResetSearch(); }}
                        className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs cursor-pointer transition-colors"
                      >
                        Ver Banco de Dados Consolidados
                      </button>
                    </div>
                  </motion.div>
                )}

              </div>

            </div>

            {/* Desktop Side Info Column */}
            <div id="desktop-info-col" className="hidden lg:flex flex-col gap-6 w-full max-w-sm self-stretch pt-4 text-left">
              
              {/* NSB Welcome Board */}
              <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 space-y-4">
                <div className="inline-flex py-1 px-3 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-400 font-mono font-bold tracking-wider">
                  SISTEMA OFICIAL DE MOBILIZAÇÃO
                </div>
                <h3 className="text-base font-bold text-white tracking-tight">Negritude Socialista Brasileira</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Este aplicativo é voltado para a atualização de quadros políticos em todo o território nacional. Através dele, lideranças revisam dados cadastrais históricos coletados e respondem suas intenções políticas imediatas para as eleições estaduais e federais de <strong className="text-emerald-400">2026</strong>.
                </p>
                <div className="space-y-2 pt-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Recuperação automática por CPF</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Salvamento local automático</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Exportação instantânea para CSV</span>
                  </div>
                </div>
              </div>

              {/* Quick statistics for local work */}
              <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 space-y-3.5">
                <h4 className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase">Seu Dispositivo</h4>
                <div className="space-y-3">
                  <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800/60 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                        <FolderSync className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] font-mono text-slate-400 font-medium leading-none">RECORDS LOCAL</p>
                        <p className="text-xs font-black text-white mt-0.5">{savedRecords.length}</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20">Ativo</span>
                  </div>

                  <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800/60 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] font-mono text-slate-400 font-medium leading-none">BASE ORIGINAL</p>
                        <p className="text-xs font-black text-white mt-0.5">{csvRecords.length}</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded border border-teal-500/20">CSV Carregado</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Tab 2: Banco de Dados completo */}
        {activeTab === 'records' && (
          !isAdminLoggedIn ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto my-12 p-8 bg-slate-950/80 rounded-3xl border border-slate-800 text-left space-y-6 shadow-2xl"
            >
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20 mx-auto">
                  <Lock className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-extrabold text-white tracking-tight text-center">Acesso Restrito - LGPD</h2>
                <p className="text-xs text-slate-300 leading-relaxed text-center">
                  Para garantir a segurança, privacidade e conformidade com as normas da <strong>LGPD (Lei Geral de Proteção de Dados)</strong>, esta seção que contém dados pessoais de lideranças é restrita a administradores do sistema.
                </p>
              </div>

              <div className="space-y-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-850 text-xs text-slate-300">
                <p className="font-bold text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Diretrizes de Segurança LGPD:</span>
                </p>
                <ul className="space-y-1.5 list-disc pl-4 text-slate-400">
                  <li><strong>Finalidade:</strong> Acesso limitado para atualização e verificação cadastral.</li>
                  <li><strong>Confidencialidade:</strong> É proibido compartilhar ou expor dados a terceiros.</li>
                  <li><strong>Controle de Sessão:</strong> Use a opção "Sair" na barra superior para revogar o acesso.</li>
                </ul>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-4">
                {adminError && (
                  <p className="text-rose-400 text-[11px] font-semibold flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-rose-500" />
                    {adminError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg"
                >
                  <Unlock className="h-4 w-4 text-emerald-400" />
                  <span>Entrar com Conta Google</span>
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6 py-4 text-left"
            >
            {/* Admin filters header card */}
            <div className="p-4 bg-slate-950/80 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-emerald-400" />
                    <span>Painel de Registros Consolidado</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Veja tanto os registros originais carregados do CSV base quanto os atualizados localmente para 2026.
                  </p>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    id="btn-panel-export-top"
                    onClick={handleExportCSV}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold font-mono tracking-tight flex items-center gap-2 transition-all shadow-lg shadow-emerald-950/40 cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    <span>EXPORTAR BANCO ATUALIZADO</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Filter Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-850">
                
                {/* Search Term */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Filtrar por nome, CPF ou cidade"
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value.toUpperCase() }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-3 pr-9 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>

                {/* State selector */}
                <select
                  value={filters.estado}
                  onChange={(e) => setFilters(prev => ({ ...prev, estado: e.target.value }))}
                  className="bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Todos">Todos os Estados</option>
                  {BRAZIL_STATES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label} ({s.value})</option>
                  ))}
                </select>

                {/* Member filter */}
                <select
                  value={filters.filiado}
                  onChange={(e) => setFilters(prev => ({ ...prev, filiado: e.target.value }))}
                  className="bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Todos">Filiação NSB (Todos)</option>
                  <option value="Sim">Apenas Filiados</option>
                  <option value="Não">Não Filiados</option>
                </select>

                {/* Delegado filter */}
                <select
                  value={filters.delegado}
                  onChange={(e) => setFilters(prev => ({ ...prev, delegado: e.target.value }))}
                  className="bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Todos">Status Delegado (Todos)</option>
                  <option value="Sim">Apenas Delegados</option>
                  <option value="Não">Não Delegados</option>
                </select>

              </div>
            </div>

            {/* Main records grid / table */}
            <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800 text-[10px] font-bold font-mono tracking-wider text-slate-300">
                      <th className="py-3 px-4">Status 2026</th>
                      <th className="py-3 px-4">Nome completo</th>
                      <th className="py-3 px-4">CPF</th>
                      <th className="py-3 px-4">Cidade / UF</th>
                      <th className="py-3 px-4">Filiação NSB</th>
                      <th className="py-3 px-4">Cargo NSB</th>
                      <th className="py-3 px-4">Pretensão 2026</th>
                      <th className="py-3 px-4">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/60 text-xs">
                    {filteredList.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-500">
                          Nenhum registro encontrado para os filtros selecionados.
                        </td>
                      </tr>
                    ) : (
                      filteredList.map((record) => {
                        const isUpdated = !!record.revisadoPara2026;
                        return (
                          <tr 
                            key={record.id}
                            className={`group hover:bg-slate-900/40 transition-colors ${
                              isUpdated ? 'bg-emerald-950/10' : ''
                            }`}
                          >
                            <td className="py-3.5 px-4 font-mono">
                              {isUpdated ? (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold font-sans bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                  Atualizado 2026
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold font-sans bg-slate-800 text-slate-400 border border-slate-700">
                                  Original CSV
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 font-bold text-white max-w-xs truncate">
                              {record.nomeCompleto}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-300">
                              {record.cpf}
                            </td>
                            <td className="py-3.5 px-4 text-slate-300">
                              {record.cidade ? `${record.cidade} / ${record.estado || ''}` : record.estado || '-'}
                            </td>
                            <td className="py-3.5 px-4 font-semibold">
                              {record.filiadoNsb?.toLowerCase() === 'sim' ? (
                                <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/15">Sim</span>
                              ) : (
                                <span className="text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">Não</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px] truncate max-w-[150px]">
                              {record.cargoNsb || record.delegado || 'Nenhum'}
                            </td>
                            <td className="py-3.5 px-4">
                              {isUpdated ? (
                                <div className="space-y-0.5">
                                  <span className="font-bold text-white">{record.pretendeConcorrer2026}</span>
                                  {record.cargoPretendido2026 && (
                                    <p className="text-[10px] text-emerald-400">{record.cargoPretendido2026}</p>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-500 font-mono italic">-</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2">
                                <button
                                  id={`btn-view-${record.id}`}
                                  onClick={() => setSelectedRecord(record)}
                                  className="p-1 px-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer text-xs"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  <span>Visualizar</span>
                                </button>
                                {record.id.startsWith('custom') && (
                                  <button
                                    id={`btn-delete-${record.id}`}
                                    onClick={() => handleDeleteRecord(record.id)}
                                    className="p-1.5 bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 rounded-lg border border-slate-800 hover:border-rose-900/50 transition-colors cursor-pointer"
                                    title="Excluir salvamento"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <div className="py-3.5 px-5 bg-slate-900 font-mono text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-800">
                <span>Total exibidos: {filteredList.length} registros</span>
                <span>Base total: {csvRecords.length + savedRecords.filter(r => !csvRecords.some(c => sanitizeCPF(c.cpf) === sanitizeCPF(r.cpf))).length}</span>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Tab 3: Metrics & Export panel */}
        {activeTab === 'export' && (
          !isAdminLoggedIn ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto my-12 p-8 bg-slate-950/80 rounded-3xl border border-slate-800 text-left space-y-6 shadow-2xl"
            >
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20 mx-auto">
                  <Lock className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-extrabold text-white tracking-tight text-center">Acesso Restrito - LGPD</h2>
                <p className="text-xs text-slate-300 leading-relaxed text-center">
                  Para garantir a segurança, privacidade e conformidade com as normas da <strong>LGPD (Lei Geral de Proteção de Dados)</strong>, esta seção com métricas e exportações avançadas do banco de dados é restrita a administradores do sistema.
                </p>
              </div>

              <div className="space-y-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-850 text-xs text-slate-300">
                <p className="font-bold text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Diretrizes de Segurança LGPD:</span>
                </p>
                <ul className="space-y-1.5 list-disc pl-4 text-slate-400">
                  <li><strong>Finalidade:</strong> Acesso limitado para auditoria e relatórios estatísticos.</li>
                  <li><strong>Confidencialidade:</strong> É proibido compartilhar relatórios com dados individuais sem anonimização prévia.</li>
                  <li><strong>Controle de Sessão:</strong> Use a opção "Sair" na barra superior para revogar o acesso.</li>
                </ul>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-4">
                {adminError && (
                  <p className="text-rose-400 text-[11px] font-semibold flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-rose-500" />
                    {adminError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg"
                >
                  <Unlock className="h-4 w-4 text-emerald-400" />
                  <span>Entrar com Conta Google</span>
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6 py-4 text-left"
            >
            {/* Bento-grid counters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                    <BarChart2 className="h-5 w-5" />
                  </div>
                  <h3 className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase pt-2">ATUALIZAÇÕES LOCAIS</h3>
                  <p className="text-3xl font-black text-white">{stats.totalLocalUpdates}</p>
                </div>
                <p className="text-xs text-slate-400 mt-2">Registros de lideranças atualizados com as pretensões eleitorais para 2026 neste navegador.</p>
              </div>

              <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <h3 className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase pt-2">FILIADOS NSB ATUALIZADOS</h3>
                  <p className="text-3xl font-black text-white">{stats.nsbMembers}</p>
                </div>
                <p className="text-xs text-slate-400 mt-2">Dos novos cadastros/atualizados, o número total que possuem filiação confirmada.</p>
              </div>

              <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <h3 className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase pt-2">BASE INTEGRAL</h3>
                  <p className="text-3xl font-black text-white">{stats.totalRepresented}</p>
                </div>
                <p className="text-xs text-slate-400 mt-2">A base combinada unificada de dados disponíveis para consulta.</p>
              </div>

            </div>

            {/* Dashboard Graphs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Candidates Intentions distribution */}
              <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col min-h-[350px]">
                <div>
                  <h3 className="font-bold text-white text-base">Intenção de Candidatura (2026)</h3>
                  <p className="text-xs text-slate-400">Distribuição das respostas coletadas para a pergunta: "Pretende se candidatar em 2026?".</p>
                </div>
                <div className="flex-1 mt-6 relative min-h-[220px]">
                  <SafeResponsiveContainer>
                    {(width, height) => (
                      <PieChart width={width} height={height}>
                        <Pie
                          data={stats.intentionsChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {stats.intentionsChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.name === 'Sim' ? '#10b981' : entry.name === 'Em Estudo' ? '#eab308' : '#334155'} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', fontSize: '12px' }}
                          itemStyle={{ color: '#f8fafc' }}
                        />
                        <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                      </PieChart>
                    )}
                  </SafeResponsiveContainer>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-800 text-[11px] text-slate-400 mt-4">
                  <p>⚠️ Baseada em <strong className="text-white">{stats.totalLocalUpdates}</strong> registros atualizados localmente.</p>
                </div>
              </div>

              {/* State Distribution */}
              <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col min-h-[350px]">
                <div>
                  <h3 className="font-bold text-white text-base">Distribuição por Estado</h3>
                  <p className="text-xs text-slate-400">Quantidade de lideranças registradas por UF.</p>
                </div>
                <div className="flex-1 mt-6 relative min-h-[220px]">
                  <SafeResponsiveContainer>
                    {(width, height) => (
                      <BarChart width={width} height={height} data={stats.statesChartData} layout="vertical" margin={{ top: 0, right: 30, left: -10, bottom: 0 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} width={40} />
                        <Tooltip 
                          cursor={{ fill: '#1e293b' }}
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', fontSize: '12px', color: '#f8fafc' }}
                          itemStyle={{ color: '#10b981' }}
                        />
                        <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]}>
                          {stats.statesChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#059669'} />
                          ))}
                        </Bar>
                      </BarChart>
                    )}
                  </SafeResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Gender Distribution */}
              <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col min-h-[300px]">
                <div>
                  <h3 className="font-bold text-white text-base">Gênero</h3>
                  <p className="text-xs text-slate-400">Distribuição por sexo / gênero.</p>
                </div>
                <div className="flex-1 mt-6 relative min-h-[220px]">
                  <SafeResponsiveContainer>
                    {(width, height) => (
                      <PieChart width={width} height={height}>
                        <Pie
                          data={stats.genderChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {stats.genderChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#8b5cf6', '#06b6d4', '#f43f5e', '#10b981'][index % 4]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', fontSize: '12px' }}
                          itemStyle={{ color: '#f8fafc' }}
                        />
                        <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                      </PieChart>
                    )}
                  </SafeResponsiveContainer>
                </div>
              </div>

              {/* Color/Race Distribution */}
              <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col min-h-[300px]">
                <div>
                  <h3 className="font-bold text-white text-base">Cor / Raça</h3>
                  <p className="text-xs text-slate-400">Distribuição racial declarada.</p>
                </div>
                <div className="flex-1 mt-6 relative min-h-[220px]">
                  <SafeResponsiveContainer>
                    {(width, height) => (
                      <BarChart width={width} height={height} data={stats.colorChartData} layout="vertical" margin={{ top: 0, right: 30, left: -10, bottom: 0 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} width={70} />
                        <Tooltip 
                          cursor={{ fill: '#1e293b' }}
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', fontSize: '12px', color: '#f8fafc' }}
                          itemStyle={{ color: '#f59e0b' }}
                        />
                        <Bar dataKey="value" fill="#f59e0b" radius={[0, 4, 4, 0]}>
                          {stats.colorChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? '#f59e0b' : '#d97706'} />
                          ))}
                        </Bar>
                      </BarChart>
                    )}
                  </SafeResponsiveContainer>
                </div>
              </div>

              {/* Priority Distribution */}
              {isAdminLoggedIn ? (
                <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col min-h-[300px]">
                  <div>
                    <h3 className="font-bold text-white text-base">Prioridade</h3>
                    <p className="text-xs text-slate-400">Distribuição de níveis de prioridade.</p>
                  </div>
                  <div className="flex-1 mt-6 overflow-y-auto max-h-[220px] pr-2 space-y-2">
                    {stats.priorityList.length > 0 ? (
                      stats.priorityList.map((item, idx) => (
                        <div key={idx} className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-white truncate pr-2" title={item.nome}>{item.nome}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                              item.prioridade === 'Alta' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                              item.prioridade === 'Média' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                              'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            }`}>{item.prioridade}</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                            <span>UF: {item.uf}</span>
                            <span>Cor: {item.cor}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-xs text-slate-500 pt-8">
                        Nenhuma liderança com prioridade definida.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col items-center justify-center min-h-[300px] opacity-60">
                  <Lock className="h-8 w-8 text-slate-600 mb-3" />
                  <h3 className="font-bold text-slate-500 text-sm">Prioridade Oculta</h3>
                  <p className="text-[10px] text-slate-600 mt-1 text-center">Somente administradores têm<br/>acesso a esta informação.</p>
                </div>
              )}
            </div>

            {/* Advanced CSV Management Tools */}
            <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 space-y-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <FolderSync className="h-5 w-5 text-emerald-400" />
                <span>Gerenciamento de Arquivo CSV</span>
              </h3>
              <p className="text-xs text-slate-400">
                Se você tiver um novo arquivo .csv com outros dados de origem no mesmo layout, você pode importá-lo abaixo para carregar como a nova base de busca no formulário.
              </p>

              <div className="space-y-4 pt-2">
                {/* File Input Box */}
                <div className="border border-dashed border-slate-800 hover:border-slate-700 p-4 rounded-2xl bg-slate-900/40 text-center space-y-2 cursor-pointer relative group">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCSVUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Download className="h-6 w-6 mx-auto text-slate-400 group-hover:text-emerald-400 transition-colors" />
                  <p className="text-xs font-semibold text-slate-200">Selecionar ou Soltar arquivo .csv</p>
                  <p className="text-[10px] text-slate-500 font-mono">Deve seguir as mesmas colunas estruturantes da base</p>
                </div>

                {importMessage && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 text-xs rounded-xl">
                    {importMessage}
                  </div>
                )}

                {errorCSV && (
                  <div className="p-3 bg-rose-950/40 border border-rose-500/20 text-rose-300 text-xs rounded-xl">
                    {errorCSV}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    id="btn-export-csv-action"
                    onClick={handleExportCSV}
                    className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Download className="h-4.5 w-4.5" />
                    <span>Exportar Dados</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

      </main>

      {/* Modal - Detail Record View */}
      <AnimatePresence>
        {selectedRecord && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 rounded-3xl border border-slate-800 w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col text-left text-slate-100 shadow-2xl"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-white">{selectedRecord.nomeCompleto}</h3>
                    {selectedRecord.revisadoPara2026 ? (
                      <span className="text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">Atualizado 2026</span>
                    ) : (
                      <span className="text-[9px] font-bold bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full">Original</span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">CPF: {selectedRecord.cpf}</span>
                </div>
                <button
                  id="btn-close-modal"
                  onClick={() => setSelectedRecord(null)}
                  className="p-1 px-1.5 bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white border border-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body Scroll Space */}
              <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
                
                {/* 2026 Specific Block */}
                {selectedRecord.revisadoPara2026 && (
                  <div className="p-4 bg-emerald-950/15 border border-emerald-500/20 rounded-2xl space-y-2">
                    <h4 className="text-emerald-400 font-extrabold flex items-center gap-1">
                      <Sparkles className="h-4 w-4" />
                      <span>CONSOLIDAÇÃO PARA 2026</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-4 pt-1.5">
                      <div>
                        <p className="text-[10px] font-mono uppercase text-slate-400 font-bold">Pretende concorrer em 2026?</p>
                        <p className="text-white font-semibold text-xs mt-0.5">{selectedRecord.pretendeConcorrer2026 || 'Em estudo'}</p>
                      </div>
                      {selectedRecord.pretendeConcorrer2026 === 'Sim' && (
                        <div>
                          <p className="text-[10px] font-mono uppercase text-slate-400 font-bold">Cargo Alvo 2026</p>
                          <p className="text-emerald-300 font-bold text-xs mt-0.5">{selectedRecord.cargoPretendido2026 || 'Não especificado'}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-[10px] font-mono uppercase text-slate-400 font-bold">Exerce mandato político em 2026?</p>
                        <p className="text-white font-semibold text-xs mt-0.5">{selectedRecord.mandatoVigente2026 || 'Não'}</p>
                      </div>
                      {selectedRecord.mandatoVigente2026 === 'Sim' && (
                        <div>
                          <p className="text-[10px] font-mono uppercase text-slate-400 font-bold">Qual cargo exercido em 2026?</p>
                          <p className="text-white font-semibold text-xs mt-0.5">{selectedRecord.cargoMandato2026 || ''}</p>
                        </div>
                      )}
                    </div>
                    {selectedRecord.observacoes2026 && (
                      <div className="pt-2 border-t border-emerald-500/10">
                        <p className="text-[10px] font-mono uppercase text-slate-400 font-bold">Observações de Mobilização</p>
                        <p className="text-xs text-slate-200 bg-slate-950/40 p-2.5 rounded-xl border border-slate-900 mt-1 leading-relaxed">{selectedRecord.observacoes2026}</p>
                      </div>
                    )}
                    {isAdminLoggedIn && selectedRecord.prioridade && (
                      <div className="pt-2 border-t border-emerald-500/10">
                        <p className="text-[10px] font-mono uppercase text-rose-400 font-bold flex items-center gap-1">
                          <Lock className="h-3 w-3" />
                          Prioridade da Liderança
                        </p>
                        <p className="text-xs text-rose-300 bg-rose-950/20 p-2.5 rounded-xl border border-rose-500/20 mt-1 font-bold">
                          {selectedRecord.prioridade}
                        </p>
                      </div>
                    )}
                    <p className="text-[9px] text-slate-400 font-mono pt-1 text-right">Confirmado em: {selectedRecord.dataAtualizacao2026}</p>
                  </div>
                )}

                {/* Standard Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* Personal */}
                  <div className="space-y-2.5">
                    <h5 className="font-bold text-white border-b border-slate-800 pb-1.5 font-mono text-[10px] uppercase text-emerald-400">DADOS PESSOAIS</h5>
                    <div className="space-y-1.5">
                      <p><span className="text-slate-400 font-medium">Nome:</span> <span className="text-white">{selectedRecord.nomeCompleto}</span></p>
                      <p><span className="text-slate-400 font-medium">Nascimento:</span> <span>{selectedRecord.dataNascimento || '-'}</span></p>
                      <p><span className="text-slate-400 font-medium">Sexo:</span> <span>{selectedRecord.sexo || '-'}</span></p>
                      <p><span className="text-slate-400 font-medium">Cor ou Raça:</span> <span>{selectedRecord.corRaca || '-'}</span></p>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="space-y-2.5">
                    <h5 className="font-bold text-white border-b border-slate-800 pb-1.5 font-mono text-[10px] uppercase text-emerald-400">CONTATO E ENDEREÇO</h5>
                    <div className="space-y-1.5">
                      <p><span className="text-slate-400 font-medium">Telefone:</span> <span className="font-mono text-white">{selectedRecord.telefone || '-'}</span></p>
                      <p><span className="text-slate-400 font-medium">E-mail:</span> <span className="text-white">{selectedRecord.email || '-'}</span></p>
                      <p><span className="text-slate-400 font-medium">Localização:</span> <span>{selectedRecord.cidade ? `${selectedRecord.cidade} / ${selectedRecord.estado}` : selectedRecord.estado || '-'}</span></p>
                      <p><span className="text-slate-400 font-medium">Endereço:</span> <span className="line-clamp-1">{selectedRecord.endereco || '-'}</span></p>
                    </div>
                  </div>

                  {/* Historic background */}
                  <div className="space-y-2.5">
                    <h5 className="font-bold text-white border-b border-slate-800 pb-1.5 font-mono text-[10px] uppercase text-emerald-400">ATUACÃO POLÍTICA HISTÓRICA</h5>
                    <div className="space-y-1.5">
                      <p><span className="text-slate-400 font-medium">Filiado NSB:</span> <span>{selectedRecord.filiadoNsb || '-'}</span></p>
                      <p><span className="text-slate-400 font-medium">Cargo NSB:</span> <span>{selectedRecord.cargoNsb || 'Sem cargo específico'}</span></p>
                      <p><span className="text-slate-400 font-medium font-bold">Delegado NSB:</span> <span>{selectedRecord.delegado || 'Não'}</span></p>
                      <p><span className="text-slate-400 font-medium">Candidato Anterior:</span> <span>{selectedRecord.jaFoiCandidato || 'Não'}</span></p>
                      {selectedRecord.jaFoiCandidato === 'SIM' && (
                        <>
                          <p><span className="text-slate-400 font-medium">Cargo Disputado:</span> <span>{selectedRecord.cargoDisputado || '-'} ({selectedRecord.anoUltimaEleicao})</span></p>
                          <p><span className="text-slate-400 font-medium">Votos Obtenção:</span> <span className="font-mono">{selectedRecord.votacao || '0'}</span></p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Electoral details */}
                  <div className="space-y-2.5">
                    <h5 className="font-bold text-white border-b border-slate-800 pb-1.5 font-mono text-[10px] uppercase text-emerald-400">ADMINISTRATIVO E ELEITORAL</h5>
                    <div className="space-y-1.5">
                      <p><span className="text-slate-400 font-medium">RG:</span> <span className="font-mono">{selectedRecord.rg || '-'}</span></p>
                      <p><span className="text-slate-400 font-medium">Título Eleitor:</span> <span className="font-mono">{selectedRecord.tituloEleitorial || '-'}</span></p>
                      <p><span className="text-slate-400 font-medium">Zona / Seção:</span> <span className="font-mono">{selectedRecord.zona || '-'} / {selectedRecord.secao || '-'}</span></p>
                      <p><span className="text-slate-400 font-medium">Aeroporto Origem:</span> <span>{selectedRecord.aeroportoOrigem || '-'}</span></p>
                    </div>
                  </div>

                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between">
                <p className="text-[10px] font-mono text-slate-500">ID Ficha: {selectedRecord.id}</p>
                <div className="flex gap-2">
                  {/* Let them edit if they have searched for it */}
                  <button
                    id="btn-edit-from-modal"
                    onClick={() => {
                      setFormData(selectedRecord);
                      setCpfSearch(selectedRecord.cpf);
                      setSearchCompleted(true);
                      setIsPreExisting(true);
                      setCurrentStep(1);
                      setActiveTab('form');
                      setSelectedRecord(null);
                    }}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    Editar / Revisar
                  </button>
                  <button
                    id="btn-close-modal-footer"
                    onClick={() => setSelectedRecord(null)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-bold cursor-pointer border border-slate-800 transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}

        {deletingRecordId && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-md p-6 text-left text-slate-100 shadow-2xl space-y-4"
            >
              <h3 className="font-extrabold text-lg text-white">Confirmar Exclusão</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Tem certeza que deseja remover este registro local? Esta ação é irreversível e excluirá o salvamento atual.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setDeletingRecordId(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteRecord}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Humble Footer */}
      <footer id="app-footer" className="py-6 mt-8 border-t border-slate-850 text-center font-mono text-[10px] text-slate-500 select-none bg-slate-950/30">
        <p>Negritude Socialista Brasileira © 2026 • Coleta & Revisão Eleitoral Segura</p>
        <p className="text-slate-600 mt-1">Armazenamento Local • 100% Client-Side • Desenvolvido com Estilo e Precisão</p>
      </footer>

    </div>
  );
}
