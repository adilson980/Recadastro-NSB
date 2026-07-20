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
  EyeOff,
  Camera,
  Upload,
  RefreshCw,
  Printer,
  ListOrdered,
  User as UserIcon,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LabelList } from 'recharts';
import { FormRecord, TabType, FilterOptions } from './types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { parseCSVData, sanitizeCPF, isValidCPF, formatCPF, formatPhone, formatDate, formatVoterID } from './csvParser';
import { fallbackCSVRecords } from './csvFallbackData';
// @ts-ignore
import dadosRaw from './dados.csv?raw';
import { db, app } from './lib/firebase';
import { collection, doc, setDoc, getDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, User } from 'firebase/auth';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

import { FichaA4 } from './FichaA4';

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
  foto1: '',
  foto2: '',
  foto3: '',
  prioridade: '',
  candidaturaHomologada: '',
  cnpjCandidatura: '',
  nomeUrna: '',
  numeroUrna: '',
  bancoConta1: '',
  agenciaConta1: '',
  numeroConta1: '',
  bancoConta2: '',
  agenciaConta2: '',
  numeroConta2: '',
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
      
      const observedWidth = width || (containerRef.current ? containerRef.current.clientWidth : 0);
      const observedHeight = height || (containerRef.current ? containerRef.current.clientHeight : 0);

      setDimensions({
        width: observedWidth > 50 ? observedWidth : 300,
        height: observedHeight > 50 ? observedHeight : 220
      });
    });

    resizeObserver.observe(containerRef.current);
    
    // Set initial size
    const rect = containerRef.current.getBoundingClientRect();
    setDimensions({
      width: rect.width > 50 ? rect.width : 300,
      height: rect.height > 50 ? rect.height : 220
    });

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const finalWidth = dimensions.width > 50 ? dimensions.width : 300;
  const finalHeight = dimensions.height > 50 ? dimensions.height : 220;

  return (
    <div ref={containerRef} className="w-full h-full min-h-[220px]" style={{ minHeight: '220px' }}>
      {children(finalWidth, finalHeight)}
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
  const [showPhotoPopup, setShowPhotoPopup] = useState(false);
  const [hasSeenPhotoReqs, setHasSeenPhotoReqs] = useState(false);

  // Admin Login States (compliant with LGPD)
    const [adminUser, setAdminUser] = useState<User | null>(null);
  const [adminError, setAdminError] = useState<string | null>(null);

  const ALLOWED_ADMIN_EMAILS = [
    'j.adilson_bezerra@hotmail.com',
    'euclides.vs@gmail.com',
    'valneidepsb40@gmail.com',
    'igorfrederico1@gmail.com'
  ];
  
  const isUserAdmin = adminUser && adminUser.email && ALLOWED_ADMIN_EMAILS.includes(adminUser.email.toLowerCase());

  useEffect(() => {
    // If running in a sandboxed iframe, delay loading of Firebase Auth's session-checking background iframe
    // until the user actually leaves the 'form' tab (such as clicking 'records' or 'export').
    const isInIframe = typeof window !== 'undefined' && window.self !== window.top;
    if (isInIframe && activeTab === 'form') {
      return;
    }

    const unsubscribe = onAuthStateChanged(getAuth(app), (user) => {
      setAdminUser(user);
    });

    return () => unsubscribe();
  }, [activeTab]);

  const handleAdminLoginGoogle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setAdminError('Iniciando login com Google...');
      const authObj = getAuth(app);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(authObj, provider);
      setAdminError(null);
      triggerNotification('Verificando autorização...', 'success');
    } catch (error: any) {
      console.error("Auth error:", error);
      const isIframe = typeof window !== 'undefined' && window.self !== window.top;
      let msg = error.message;
      
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        setAdminError(null);
        triggerNotification('Login cancelado pelo usuário.', 'info');
        return;
      }
      
      if (error.code) {
        msg += ` (Code: ${error.code})`;
      }
      if (isIframe && msg.includes('popup')) {
        msg += ' [Como você está no modo de visualização, o login pode falhar. Tente abrir em uma NOVA GUIA.]';
      }
      setAdminError('Erro de Autenticação: ' + msg);
      triggerNotification('Falha na autenticação.', 'error');
    }
  };

  const handleAdminLogout = async () => {
    try {
      await signOut(getAuth(app));
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
    delegado: 'Todos',
    pretendeConcorrer2026: 'Todos'
  });

  // Admin and UI state
  const [selectedRecord, setSelectedRecord] = useState<FormRecord | null>(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [statsModalTitle, setStatsModalTitle] = useState('');
  const [statsModalData, setStatsModalData] = useState<FormRecord[]>([]);
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null);
  const [errorCSV, setErrorCSV] = useState<string | null>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Load baseline CSV and Firebase records
  useEffect(() => {
    // 1. Subscribe to Firebase records
    const unsubscribe = onSnapshot(
      collection(db, 'records'),
      (snapshot) => {
        const records: FormRecord[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          records.push({ 
            id: doc.id, 
            ...data,
            telefone: formatPhone(data.telefone || '')
          } as FormRecord);
        });
        setSavedRecords(records);
      },
      (error) => {
        console.error('Error fetching records from Firebase', error);
      }
    );

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
  }, []);

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
    if (!isValidCPF(cleanSearch)) {
      triggerNotification('Digite um CPF válido com 11 dígitos corretos', 'error');
      return;
    }

    // 1. Fetch directly from Firebase using CPF as ID
    try {
      const docRef = doc(db, 'records', cleanSearch);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const savedMatch = { 
          id: docSnap.id, 
          ...data,
          telefone: formatPhone(data.telefone || '') 
        } as FormRecord;
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
    } else if (name === 'dataNascimento') {
      processedValue = formatDate(value);
    } else if (name === 'tituloEleitorial') {
      processedValue = formatVoterID(value);
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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, photoKey: 'foto1'|'foto2'|'foto3') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        
        setFormData(prev => ({ ...prev, [photoKey]: dataUrl }));
      };
    };
  };

  // Step validation
  const validateStep = (step: number): boolean => {
    if (step === 1) {
      return (formData.nomeCompleto || '').trim().length >= 3 && isValidCPF(formData.cpf || '');
    }
    if (step === 2) {
      return (formData.cidade || '').trim().length >= 2 && (formData.estado || '').trim().length === 2 && (formData.telefone || '').trim().length >= 10;
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
      telefone: formatPhone(formData.telefone || ''),
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
      const searchTerm = filters.search.toLowerCase();
      const searchCpf = sanitizeCPF(filters.search);
      const matchesSearch = 
        nome.toLowerCase().includes(searchTerm) ||
        (searchCpf !== '' && sanitizeCPF(cpf).includes(searchCpf)) ||
        cidade.toLowerCase().includes(searchTerm);
        
      // 2. State filter
      const matchesEstado = filters.estado === 'Todos' || estado === filters.estado;

      // 3. Filiation status
      const matchesFiliado = filters.filiado === 'Todos' || 
        (filters.filiado === 'Sim' && filiado.toLowerCase() === 'sim') ||
        (filters.filiado === 'Não' && filiado.toLowerCase() !== 'sim');

      // 4. Delegado status
      const matchesDelegado = filters.delegado === 'Todos' || 
        (filters.delegado === 'Sim' && delegadoStr.trim() !== '' && delegadoStr.trim().toLowerCase() !== 'não') ||
        (filters.delegado === 'Não' && (delegadoStr.trim() === '' || delegadoStr.trim().toLowerCase() === 'não'));

      // 5. Candidate 2026 filter (Sim / Em estudo)
      const pretende = (record.pretendeConcorrer2026 || 'Em estudo').toLowerCase();
      const matchesPretende = filters.pretendeConcorrer2026 === 'Todos' ||
        (filters.pretendeConcorrer2026 === 'Sim' && pretende === 'sim') ||
        (filters.pretendeConcorrer2026 === 'Em estudo' && pretende === 'em estudo');

      return matchesSearch && matchesEstado && matchesFiliado && matchesDelegado && matchesPretende;
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

  // Export filtered/selected candidates to a native Excel .xlsx file
  const handleExportXLSX = () => {
    // Only with NOME COMPLETO, CPF, TELEFONE, UF, PRETENSÃO DE CANDIDATURA EM 2026, CARGO A DISPUTAR EM 2026 (all in UPPERCASE)
    const dataToExport = filteredList.map(r => ({
      'NOME COMPLETO': (r.nomeCompleto || '').trim().toUpperCase(),
      'CPF': (r.cpf || '').trim().toUpperCase(),
      'TELEFONE': (r.telefone || '').trim().toUpperCase(),
      'UF': (r.estado || '').trim().toUpperCase(),
      'PRETENSÃO DE CANDIDATURA EM 2026': (r.pretendeConcorrer2026 || 'Em estudo').trim().toUpperCase(),
      'CARGO A DISPUTAR EM 2026': (r.cargoPretendido2026 || 'NÃO ESPECIFICADO').trim().toUpperCase()
    }));

    if (dataToExport.length === 0) {
      triggerNotification('Nenhum registro encontrado para exportar com os filtros atuais.', 'info');
      return;
    }

    try {
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'CANDIDATOS_2026');

      // Auto-fit column widths
      const maxLens = [25, 15, 15, 10, 35, 25];
      dataToExport.forEach(row => {
        maxLens[0] = Math.max(maxLens[0], row['NOME COMPLETO'].length);
        maxLens[1] = Math.max(maxLens[1], row['CPF'].length);
        maxLens[2] = Math.max(maxLens[2], row['TELEFONE'].length);
        maxLens[3] = Math.max(maxLens[3], row['UF'].length);
        maxLens[4] = Math.max(maxLens[4], row['PRETENSÃO DE CANDIDATURA EM 2026'].length);
        maxLens[5] = Math.max(maxLens[5], row['CARGO A DISPUTAR EM 2026'].length);
      });
      worksheet['!cols'] = maxLens.map(w => ({ wch: w + 2 }));

      XLSX.writeFile(workbook, 'nsb_candidatos_filtrados_2026.xlsx');
      triggerNotification('Planilha Excel (.xlsx) exportada com sucesso!', 'success');
    } catch (err) {
      console.error('Erro ao exportar planilha Excel:', err);
      triggerNotification('Erro ao gerar arquivo Excel.', 'error');
    }
  };

  const handleExportPriorityPDF = async () => {
    triggerNotification('Gerando PDF de prioridades...', 'info');
    
    const cargoOrder: Record<string, number> = {
      'PRESIDENTE DA REPÚBLICA': 1,
      'SENADOR(A) DA REPÚBLICA': 2,
      'DEPUTADO(A) FEDERAL': 3,
      'GOVERNADOR(A)': 4,
      'DEPUTADO(A) ESTADUAL': 5
    };
    
    const priorityOrder: Record<string, number> = {
      'Alta': 1,
      'Média': 2,
      'Baixa': 3
    };

    const sortedCandidates = [...filteredList]
      .filter(r => r.pretendeConcorrer2026 === 'Sim')
      .sort((a, b) => {
        const cA = cargoOrder[a.cargoPretendido2026 || ''] || 99;
        const cB = cargoOrder[b.cargoPretendido2026 || ''] || 99;
        if (cA !== cB) return cA - cB;
        
        const pA = priorityOrder[a.prioridade || ''] || 99;
        const pB = priorityOrder[b.prioridade || ''] || 99;
        if (pA !== pB) return pA - pB;
        
        const nomeA = (a.nomeCompleto || '').trim().toLowerCase();
        const nomeB = (b.nomeCompleto || '').trim().toLowerCase();
        if (nomeA < nomeB) return -1;
        if (nomeA > nomeB) return 1;
        
        const ufA = (a.estado || '').trim().toLowerCase();
        const ufB = (b.estado || '').trim().toLowerCase();
        if (ufA < ufB) return -1;
        if (ufA > ufB) return 1;
        return 0;
      });

    if (sortedCandidates.length === 0) {
      triggerNotification('Nenhum registro encontrado para gerar o PDF.', 'info');
      return;
    }

    try {
      // Create jsPDF instance in landscape A4
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'cm',
        format: 'a4'
      });

      // Margins
      const marginTop = 2.5;
      const marginBottom = 2.5;
      const marginLeft = 2.5;
      const marginRight = 2.0;

      // Add NSB Logo
      try {
        const img = new Image();
        img.src = '/logo.png';
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        // Add image (x, y, width, height) - adjusting size
        // The logo will be placed at the top center
        const imgWidth = 2; // cm
        const imgHeight = (img.height * imgWidth) / img.width; // maintain aspect ratio
        const centerX = 29.7 / 2; // A4 landscape width is 29.7cm
        doc.addImage(img, 'PNG', centerX - (imgWidth / 2), marginTop, imgWidth, imgHeight);
      } catch (e) {
        console.warn('Could not load logo for PDF', e);
      }

      // Title
      doc.setFont('arial', 'bold');
      doc.setFontSize(10);
      
      const title1 = "NEGRITUDE SOCIALISTA BRASILEIRA-NSB";
      const title2 = "RELAÇÃO DE PRÉ-CANDIDATOS - PRIORIDADES";
      
      // Calculate text widths to center
      const t1Width = doc.getStringUnitWidth(title1) * doc.getFontSize() / doc.internal.scaleFactor;
      const t2Width = doc.getStringUnitWidth(title2) * doc.getFontSize() / doc.internal.scaleFactor;
      
      const centerX = 29.7 / 2;
      const startYText = marginTop + 2.5; // below logo

      doc.text(title1, centerX - (t1Width/2), startYText);
      doc.text(title2, centerX - (t2Width/2), startYText + 0.6);

      // Table Data
      const tableColumn = ["Ord", "Nome Completo", "CPF", "Telefone", "UF", "Cargo a Disputar em 2026", "Prioridade"];
      const tableRows: any[] = [];

      sortedCandidates.forEach((r, index) => {
        const rowData = [
          index + 1,
          (r.nomeCompleto || '').trim().toUpperCase(),
          (r.cpf || '').trim().toUpperCase(),
          (r.telefone || '').trim().toUpperCase(),
          (r.estado || '').trim().toUpperCase(),
          (r.cargoPretendido2026 || 'NÃO ESPECIFICADO').trim().toUpperCase(),
          (r.prioridade || 'NÃO DEFINIDA').trim().toUpperCase()
        ];
        tableRows.push(rowData);
      });

      // Add autoTable
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: startYText + 1.2,
        margin: { top: marginTop, right: marginRight, bottom: marginBottom, left: marginLeft },
        theme: 'grid',
        styles: {
          font: 'arial',
          fontSize: 10,
          cellPadding: 0.15,
          lineWidth: 0.01,
          lineColor: [0, 0, 0],
        },
        headStyles: {
          fillColor: [200, 200, 200],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          halign: 'center'
        },
        columnStyles: {
          0: { halign: 'center' }
        }
      });

      doc.save('nsb_candidatos_prioridades.pdf');
      triggerNotification('PDF gerado com sucesso!', 'success');
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      triggerNotification('Erro ao gerar o PDF.', 'error');
    }
  };

  const handleExportPriorityXLSX = () => {
    const cargoOrder: Record<string, number> = {
      'PRESIDENTE DA REPÚBLICA': 1,
      'SENADOR(A) DA REPÚBLICA': 2,
      'DEPUTADO(A) FEDERAL': 3,
      'GOVERNADOR(A)': 4,
      'DEPUTADO(A) ESTADUAL': 5
    };
    
    const priorityOrder: Record<string, number> = {
      'Alta': 1,
      'Média': 2,
      'Baixa': 3
    };

    const sortedCandidates = [...filteredList]
      .filter(r => r.pretendeConcorrer2026 === 'Sim')
      .sort((a, b) => {
        // 1. Cargo Eletivo
        const cargoA = a.cargoPretendido2026 || '';
        const cargoB = b.cargoPretendido2026 || '';
        const cA = cargoOrder[cargoA] || 99;
        const cB = cargoOrder[cargoB] || 99;
        if (cA !== cB) return cA - cB;

        // 2. Prioridade
        const pA = priorityOrder[a.prioridade || ''] || 99;
        const pB = priorityOrder[b.prioridade || ''] || 99;
        if (pA !== pB) return pA - pB;

        // 3. Nome
        const nomeA = (a.nomeCompleto || '').trim().toLowerCase();
        const nomeB = (b.nomeCompleto || '').trim().toLowerCase();
        if (nomeA < nomeB) return -1;
        if (nomeA > nomeB) return 1;

        // 4. UF
        const ufA = (a.estado || '').trim().toLowerCase();
        const ufB = (b.estado || '').trim().toLowerCase();
        if (ufA < ufB) return -1;
        if (ufA > ufB) return 1;

        return 0;
      });

    const dataToExport = sortedCandidates.map((r, index) => ({
      'Ord': index + 1,
      'NOME COMPLETO': (r.nomeCompleto || '').trim().toUpperCase(),
      'CPF': (r.cpf || '').trim().toUpperCase(),
      'TELEFONE': (r.telefone || '').trim().toUpperCase(),
      'UF': (r.estado || '').trim().toUpperCase(),
      'CARGO A DISPUTAR EM 2026': (r.cargoPretendido2026 || 'NÃO ESPECIFICADO').trim().toUpperCase(),
      'PRIORIDADE': (r.prioridade || 'NÃO DEFINIDA').trim().toUpperCase()
    }));

    if (dataToExport.length === 0) {
      triggerNotification('Nenhum registro com intenção de candidatura encontrado para exportar.', 'info');
      return;
    }

    try {
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Prioridade');
      
      const maxLens = [5, 25, 15, 15, 5, 25, 15];
      dataToExport.forEach(row => {
        maxLens[0] = Math.max(maxLens[0], String(row['Ord']).length);
        maxLens[1] = Math.max(maxLens[1], row['NOME COMPLETO'].length);
        maxLens[2] = Math.max(maxLens[2], row['CPF'].length);
        maxLens[3] = Math.max(maxLens[3], row['TELEFONE'].length);
        maxLens[4] = Math.max(maxLens[4], row['UF'].length);
        maxLens[5] = Math.max(maxLens[5], row['CARGO A DISPUTAR EM 2026'].length);
        maxLens[6] = Math.max(maxLens[6], row['PRIORIDADE'].length);
      });
      worksheet['!cols'] = maxLens.map(w => ({ wch: w + 2 }));

      XLSX.writeFile(workbook, 'candidatos_prioridade_2026.xlsx');
      triggerNotification('Planilha de Prioridade exportada com sucesso!', 'success');
    } catch (err) {
      console.error('Erro ao exportar planilha Excel:', err);
      triggerNotification('Erro ao gerar arquivo Excel.', 'error');
    }
  };

  const handlePrintAndPDF = async () => {
    if (!selectedRecord) return;
    
    // Mostramos a notificação primeiro
    triggerNotification('Gerando arquivo PDF da ficha...', 'info');
    
    setTimeout(async () => {
      const printElement = document.getElementById('printable-area');
      if (printElement) {
        const originalDisplay = printElement.style.display;
        
        // Remove 'hidden' para o html2canvas renderizar corretamente
        printElement.classList.remove('hidden');
        printElement.style.display = 'block';

        try {
          // 1. Gera o PDF usando html2canvas e jspdf
          const canvas = await html2canvas(printElement, { 
            scale: 2, // Maior qualidade
            useCORS: true,
            logging: false 
          });
          
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
          });
          
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
          
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
          
          // Nome do arquivo PDF
          const safeName = (selectedRecord.nomeCompleto || 'Filiado').replace(/\s+/g, '_');
          pdf.save(`Ficha_NSB_${safeName}.pdf`);
          
          triggerNotification('PDF gerado com sucesso! Abrindo modo de impressão...', 'success');
        } catch (error) {
          console.error('Error generating PDF:', error);
          triggerNotification('Erro ao gerar PDF. Imprimindo apenas...', 'error');
        } finally {
          // Restaura a visualização da tela de impressão
          printElement.classList.add('hidden');
          printElement.style.display = originalDisplay;
          
          // 2. Aciona o diálogo de impressão do navegador na mesma interface original
          setTimeout(() => {
            window.print();
          }, 500);
        }
      } else {
        window.print();
      }
    }, 100);
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

  // Restore the baseline CSV data from raw asset or fallback list
  const restoreDefaultCSV = () => {
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
          setCsvRecords(parsed);
          setImportMessage("Base padrão restaurada com sucesso.");
          triggerNotification("Base padrão restaurada!", "success");
        }
      } else if (fallbackCSVRecords && fallbackCSVRecords.length > 0) {
        setCsvRecords(fallbackCSVRecords);
        setImportMessage("Base padrão restaurada com sucesso (fallback).");
        triggerNotification("Base padrão restaurada!", "success");
      }
    } catch (err: any) {
      setErrorCSV("Erro ao restaurar a base padrão: " + err.message);
    }
  };

  // Load selected record into the form for editing and revision
  const handleEditRecord = (record: FormRecord) => {
    setFormData({
      ...record,
      revisadoPara2026: true,
      dataAtualizacao2026: record.dataAtualizacao2026 || new Date().toLocaleString('pt-BR')
    });
    setIsPreExisting(true);
    setWasAlreadyUpdated(record.revisadoPara2026 || false);
    setSearchCompleted(true);
    setCurrentStep(1);
    setActiveTab('form');
    setSelectedRecord(null);
    triggerNotification('Registro carregado no formulário para edição.', 'info');
  };

  // Numerical indicators for dashboard statistics
  const stats = useMemo(() => {
    // Combine saved records and non-duplicate original (unrevised) records so stats represent the unified database
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

    const totalLocalUpdates = savedRecords.length;
    const totalRepresented = combined.length;
    const nsbMembers = combined.filter(r => r.filiadoNsb?.toLowerCase() === 'sim').length;
    
    // States distribution
    const statesMap: { [key: string]: number } = {};
    combined.forEach(r => {
      if (r.estado) statesMap[r.estado] = (statesMap[r.estado] || 0) + 1;
    });
    
    // Candidacy goals for 2026
    const candidate2026Intents = {
      sim: combined.filter(r => r.pretendeConcorrer2026 === 'Sim').length,
      estudo: combined.filter(r => r.pretendeConcorrer2026 === 'Em estudo').length,
      nao: combined.filter(r => r.pretendeConcorrer2026 === 'Não').length,
    };

    const candidates2026List = combined
      .filter(r => r.pretendeConcorrer2026 === 'Sim')
      .map(r => ({
        record: r,
        nome: (r.nomeCompleto || '').split(' ').slice(0, 3).join(' '),
        uf: r.estado || 'N/A',
        cargo: r.cargoPretendido2026 || 'Não especificado'
      }));

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

    combined.forEach(r => {
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

    let totalDepFederal = 0;
    let totalDepEstadual = 0;
    let totalDepFederalMasc = 0;
    let totalDepFederalFem = 0;
    let totalDepFederalNaoDecl = 0;
    let totalDepEstadualMasc = 0;
    let totalDepEstadualFem = 0;
    let totalDepEstadualNaoDecl = 0;

    const listDepFederalMasc: FormRecord[] = [];
    const listDepFederalFem: FormRecord[] = [];
    const listDepFederalNaoDecl: FormRecord[] = [];
    const listDepFederal: FormRecord[] = [];
    const listDepEstadualMasc: FormRecord[] = [];
    const listDepEstadualFem: FormRecord[] = [];
    const listDepEstadualNaoDecl: FormRecord[] = [];
    const listDepEstadual: FormRecord[] = [];
    const listEmEstudo: FormRecord[] = [];

    combined.forEach(r => {
      if (r.pretendeConcorrer2026 === 'Sim') {
        const cargo = (r.cargoPretendido2026 || '').toUpperCase();
        if (cargo === 'DEPUTADO(A) FEDERAL') {
          totalDepFederal++;
          listDepFederal.push(r);
          if (r.sexo === 'Masculino') { totalDepFederalMasc++; listDepFederalMasc.push(r); }
          else if (r.sexo === 'Feminino') { totalDepFederalFem++; listDepFederalFem.push(r); }
          else { totalDepFederalNaoDecl++; listDepFederalNaoDecl.push(r); }
        } else if (cargo === 'DEPUTADO(A) ESTADUAL') {
          totalDepEstadual++;
          listDepEstadual.push(r);
          if (r.sexo === 'Masculino') { totalDepEstadualMasc++; listDepEstadualMasc.push(r); }
          else if (r.sexo === 'Feminino') { totalDepEstadualFem++; listDepEstadualFem.push(r); }
          else { totalDepEstadualNaoDecl++; listDepEstadualNaoDecl.push(r); }
        }
      } else if (r.pretendeConcorrer2026 === 'Em estudo') {
          listEmEstudo.push(r);
      }
    });

    return {
      totalLocalUpdates,
      totalRepresented,
      nsbMembers,
      statesMap,
      candidate2026Intents,
      candidates2026List,
      intentionsChartData,
      statesChartData,
      genderChartData,
      colorChartData,
      priorityChartData,
      priorityList,
      totalDepFederal,
      totalDepEstadual,
      totalDepFederalMasc,
      totalDepFederalFem,
      totalDepFederalNaoDecl,
      totalDepEstadualMasc,
      totalDepEstadualFem,
      totalDepEstadualNaoDecl,
      listDepFederalMasc,
      listDepFederalFem,
      listDepFederalNaoDecl,
      listDepFederal,
      listDepEstadualMasc,
      listDepEstadualFem,
      listDepEstadualNaoDecl,
      listDepEstadual,
      listEmEstudo
    };
  }, [savedRecords, csvRecords]);

  const openStatsModal = (title: string, data: FormRecord[]) => {
    setStatsModalTitle(title);
    setStatsModalData(data);
    setIsStatsModalOpen(true);
  };

  const renderAdminGuard = (children: React.ReactNode) => {
    if (isUserAdmin) {
      return children;
    }

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-[500px] text-center space-y-6 bg-slate-900/50 rounded-3xl border border-slate-800 p-8 my-8 shadow-2xl"
      >
        <div className="w-20 h-20 bg-slate-950 rounded-full flex items-center justify-center border border-slate-800 shadow-xl shadow-emerald-900/20">
          <Lock className="h-8 w-8 text-emerald-500" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-wider mb-3">Acesso Restrito</h2>
          <p className="text-slate-400 max-w-lg mx-auto">
            A área administrativa é restrita a usuários autorizados (Dirigentes). Faça login com uma conta Google aprovada para visualizar e exportar os registros.
          </p>
          
          {adminUser && !isUserAdmin && (
            <div className="mt-6 bg-red-950/40 border border-red-500/20 rounded-2xl p-5 text-left max-w-md mx-auto">
              <p className="text-red-400 font-bold mb-1 uppercase tracking-wider text-sm flex items-center gap-2">
                Acesso Negado
              </p>
              <p className="text-slate-300 text-sm mt-2">
                A conta <span className="text-white font-mono bg-slate-900 px-2 py-0.5 rounded-md">{adminUser.email}</span> não está autorizada.
              </p>
            </div>
          )}
          
          {adminError && (
            <div className="mt-4 bg-amber-950/40 border border-amber-500/20 rounded-2xl p-5 text-left max-w-md mx-auto">
              <p className="text-amber-400 text-sm">{adminError}</p>
            </div>
          )}
        </div>
        
        <div className="flex gap-4 mt-4">
          {adminUser ? (
            <button 
              onClick={handleAdminLogout} 
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all shadow-lg border border-slate-700"
            >
              Sair da conta e tentar novamente
            </button>
          ) : (
            <button 
              onClick={handleAdminLoginGoogle} 
              className="px-8 py-3.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-emerald-900/40 shadow-xl flex items-center gap-3"
            >
              Fazer login com Google
            </button>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <>
      <div id="app-container" className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col antialiased print:hidden">
      
      {/* Dynamic Pop-up Notification Banner */}
      <AnimatePresence>
        {notification && (
          <motion.div key="notification"
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

            <nav id="app-nav" className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('form')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'form' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                Painel
              </button>
              <button
                    onClick={() => setActiveTab('records')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === 'records' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    Registros
                  </button>
                  <button
                    onClick={() => setActiveTab('export')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === 'export' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    Métricas
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
                      <div className="mx-auto w-32 h-auto flex items-center justify-center">
                        <img src="/logo.png" alt="NSB Logo" className="w-full h-auto object-contain" />
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
                        <button type="submit" className="w-full py-3 bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase shadow-lg flex items-center justify-center gap-2">Verificar CPF</button>
                      </form>
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
                                    onClick={() => handleManualSelect("filiadoNsb", op)}
                                    className={`py-2 rounded-xl text-xs font-semibold border transition-all ${formData.filiadoNsb === op ? "bg-emerald-950/55 border-emerald-500 text-emerald-300 shadow-inner" : "bg-slate-900/60 border-slate-800/80 text-slate-400 hover:bg-slate-800"}`}
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
                                    onClick={() => handleManualSelect("pretendeConcorrer2026", op)}
                                    className={`py-2 rounded-xl text-xs font-semibold border transition-all ${formData.pretendeConcorrer2026 === op ? "bg-emerald-700 border-emerald-500 text-white shadow-md" : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"}`}
                                  >
                                    {op}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {formData.pretendeConcorrer2026 === 'Sim' && (
                              <div className="space-y-4 animate-fadeIn">
                                <div className="space-y-1">
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

                                <div className="space-y-1 mt-4 border-t border-slate-800 pt-4">
                                  <label className="block text-[10px] font-bold font-mono tracking-wider text-amber-400 uppercase">Sua Candidatura foi homologada?</label>
                                  <div className="grid grid-cols-2 gap-2 mt-1">
                                    {['Sim', 'Não'].map(op => (
                                      <button
                                        key={op}
                                        type="button"
                                        onClick={() => handleManualSelect("candidaturaHomologada", op)}
                                        className={`py-2 rounded-xl text-xs font-semibold border transition-all ${formData.candidaturaHomologada === op ? "bg-amber-600 border-amber-500 text-white shadow-md" : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"}`}
                                      >
                                        {op}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {formData.candidaturaHomologada === 'Sim' && (
                                  <div className="p-4 bg-slate-900 border border-amber-500/30 rounded-2xl space-y-4 animate-fadeIn relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-2 opacity-10">
                                      <Sparkles className="h-16 w-16 text-amber-400" />
                                    </div>
                                    <h4 className="text-sm font-bold text-amber-400">Dados da Candidatura Homologada</h4>
                                    
                                    <div className="space-y-1 relative z-10">
                                      <label className="block text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">Nome para Urna</label>
                                      <input
                                        type="text"
                                        name="nomeUrna"
                                        placeholder="Ex: João da Silva"
                                        value={formData.nomeUrna || ''}
                                        onChange={handleChange}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                                      />
                                    </div>

                                    <div className="space-y-1 relative z-10">
                                      <label className="block text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">Número para Urna</label>
                                      <input
                                        type="text"
                                        name="numeroUrna"
                                        placeholder="Ex: 40000"
                                        value={formData.numeroUrna || ''}
                                        onChange={handleChange}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                                      />
                                    </div>

                                    <div className="space-y-1 relative z-10">
                                      <label className="block text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">CNPJ da Candidatura</label>
                                      <input
                                        type="text"
                                        name="cnpjCandidatura"
                                        placeholder="00.000.000/0000-00"
                                        value={formData.cnpjCandidatura || ''}
                                        onChange={handleChange}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                                      />
                                    </div>
                                    
                                    <div className="space-y-3 pt-3 mt-3 border-t border-amber-500/20 relative z-10">
                                      <label className="block text-[10px] font-bold font-mono tracking-wider text-amber-400/80 uppercase">Conta Bancária 1 (Opcional)</label>
                                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        <input
                                          type="text"
                                          name="bancoConta1"
                                          placeholder="Banco"
                                          value={formData.bancoConta1 || ''}
                                          onChange={handleChange}
                                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                                        />
                                        <input
                                          type="text"
                                          name="agenciaConta1"
                                          placeholder="Agência"
                                          value={formData.agenciaConta1 || ''}
                                          onChange={handleChange}
                                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                                        />
                                        <input
                                          type="text"
                                          name="numeroConta1"
                                          placeholder="Número da Conta"
                                          value={formData.numeroConta1 || ''}
                                          onChange={handleChange}
                                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                                        />
                                      </div>
                                    </div>

                                    <div className="space-y-3 relative z-10">
                                      <label className="block text-[10px] font-bold font-mono tracking-wider text-amber-400/80 uppercase">Conta Bancária 2 (Opcional)</label>
                                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        <input
                                          type="text"
                                          name="bancoConta2"
                                          placeholder="Banco"
                                          value={formData.bancoConta2 || ''}
                                          onChange={handleChange}
                                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                                        />
                                        <input
                                          type="text"
                                          name="agenciaConta2"
                                          placeholder="Agência"
                                          value={formData.agenciaConta2 || ''}
                                          onChange={handleChange}
                                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                                        />
                                        <input
                                          type="text"
                                          name="numeroConta2"
                                          placeholder="Número da Conta"
                                          value={formData.numeroConta2 || ''}
                                          onChange={handleChange}
                                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                                        />
                                      </div>
                                    </div>

                                    <div className="pt-2 relative z-10">
                                      <button
                                        type="button"
                                        onClick={handleFormSubmit}
                                        className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-extrabold rounded-xl text-xs uppercase shadow-lg shadow-amber-900/50 hover:shadow-amber-900/80 transition-all"
                                      >
                                        Atualizar Registro (Salvar Candidatura)
                                      </button>
                                      <p className="text-[9px] text-slate-500 mt-2 text-center">Ao clicar aqui, os dados preenchidos serão salvos imediatamente.</p>
                                    </div>
                                  </div>
                                )}

                                <div className="space-y-2 pt-4 border-t border-slate-800">
                                  <label className="block text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">
                                    Fotos para Banca de Heteroidentificação
                                  </label>
                                  {!hasSeenPhotoReqs ? (
                                    <button type="button" onClick={() => setHasSeenPhotoReqs(true)}>Adicionar Fotos</button>
                                  ) : (
                                    <div className="grid grid-cols-3 gap-2 mt-1">
                                      {(["foto1", "foto2", "foto3"] as const).map(photoKey => (
                                        <div key={photoKey}></div>
                                      ))}
                                    </div>
                                  )}
                                </div>
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

                            {true && (
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
                        <button type="button" onClick={handlePrevStep} className="px-4 py-2.5 bg-slate-900 text-slate-300 font-bold rounded-xl text-xs">Voltar</button>
                      ) : (
                        <button type="button" onClick={handleStartOver} className="px-4 py-2.5 bg-slate-900/60 text-slate-400 font-bold rounded-xl text-xs">Cancelar</button>
                      )}
                      {currentStep < 5 ? (
                        <button type="button" onClick={handleNextStep} className="px-5 py-2.5 bg-emerald-700 text-white font-bold rounded-xl text-xs">Avançar</button>
                      ) : (
                        <button type="button" onClick={handleFormSubmit} className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold rounded-xl text-xs uppercase">Salvar NSB 2026</button>
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
                      <button type="button" onClick={handleStartOver} className="w-full py-3 bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase shadow-lg">Novo Recadastramento</button>
                      <button type="button" onClick={() => { setActiveTab("records"); handleResetSearch(); }} className="w-full py-2 bg-slate-900 text-slate-300 font-bold rounded-xl text-xs">Ver Banco de Dados Consolidados</button>
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
        {activeTab === 'records' && renderAdminGuard(
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
                
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={handleExportCSV}
                    className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors border border-slate-750 shadow-md"
                  >
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Exportar CSV Completo</span>
                  </button>
                  <button
                    onClick={handleExportXLSX}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-lg"
                  >
                    <Sparkles className="h-4 w-4 text-emerald-300" />
                    <span>Exportar Candidatos (.xlsx)</span>
                  </button>
                  <button
                    onClick={handleExportPriorityXLSX}
                    className="px-4 py-2 bg-indigo-700 hover:bg-indigo-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-lg"
                  >
                    <ListOrdered className="h-4 w-4 text-indigo-300" />
                    <span>XLSX (PRIORIDADE)</span>
                  </button>
                  <button
                    onClick={handleExportPriorityPDF}
                    className="px-4 py-2 bg-rose-700 hover:bg-rose-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-lg"
                  >
                    <Download className="h-4 w-4 text-rose-300" />
                    <span>PDF (PRIORIDADE)</span>
                  </button>

                </div>
              </div>

              {/* Dynamic Filter Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-850">
                
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

                {/* Candidatura 2026 filter */}
                <select
                  value={filters.pretendeConcorrer2026}
                  onChange={(e) => setFilters(prev => ({ ...prev, pretendeConcorrer2026: e.target.value }))}
                  className="bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Todos">Candidatura 2026 (Todos)</option>
                  <option value="Sim">Apenas Sim</option>
                  <option value="Em estudo">Apenas Em Estudo</option>
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
                              {(record.nomeCompleto || '').toUpperCase()}
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
                                  onClick={() => setSelectedRecord(record)}
                                  className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-emerald-400 transition-colors"
                                  title="Visualizar detalhes"
                                >
                                  <FileText className="h-4 w-4" />
                                </button>
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
        )}

        {/* Tab 3: Metrics & Export panel */}
        {activeTab === 'export' && renderAdminGuard(
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

                                    {/* Deputados Stats */}
            <div className="grid grid-cols-1 gap-4">
              {/* Row 1: Deputado Federal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Federal Masc */}
                <div onClick={() => openStatsModal("Deputados Federais (Homens)", stats.listDepFederalMasc)} className="p-4 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between relative overflow-hidden cursor-pointer hover:border-slate-500 transition-colors">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -ml-10 -mt-10"></div>
                  <div className="space-y-1 relative z-10">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 mb-2">
                      <UserIcon className="h-4 w-4" />
                    </div>
                    <h3 className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase pt-1">DEP. FED (MASC)</h3>
                    <p className="text-2xl font-black text-white">{stats.totalDepFederalMasc}</p>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 relative z-10">Homens (Dep. Federal).</p>
                </div>
                {/* Federal Fem */}
                <div onClick={() => openStatsModal("Deputadas Federais (Mulheres)", stats.listDepFederalFem)} className="p-4 rounded-3xl bg-emerald-950/20 border border-emerald-500/20 flex flex-col justify-between relative overflow-hidden cursor-pointer hover:border-emerald-500/50 transition-colors">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                  <div className="space-y-1 relative z-10">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 mb-2">
                      <UserIcon className="h-4 w-4" />
                    </div>
                    <h3 className="text-[10px] font-mono font-bold tracking-wider text-emerald-400/80 uppercase pt-1">DEP. FED (FEM)</h3>
                    <p className="text-2xl font-black text-emerald-400">{stats.totalDepFederalFem}</p>
                  </div>
                  <p className="text-[10px] text-emerald-500/70 mt-1 relative z-10">Mulheres (Dep. Federal).</p>
                </div>
                {/* Federal Nao Declarado */}
                <div onClick={() => openStatsModal("Dep. Federais (Não Declarado)", stats.listDepFederalNaoDecl)} className="p-4 rounded-3xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between relative overflow-hidden cursor-pointer hover:border-slate-500 transition-colors">
                  <div className="space-y-1 relative z-10">
                    <div className="w-8 h-8 rounded-xl bg-slate-800/50 text-slate-400 flex items-center justify-center border border-slate-700 mb-2">
                      <UserIcon className="h-4 w-4" />
                    </div>
                    <h3 className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase pt-1">DEP. FED (N/ DECL.)</h3>
                    <p className="text-2xl font-black text-slate-300">{stats.totalDepFederalNaoDecl}</p>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 relative z-10">Não informaram sexo.</p>
                </div>
                
                {/* Federal Total */}
                <div onClick={() => openStatsModal("Deputados Federais (Total)", stats.listDepFederal)} className="p-4 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between cursor-pointer hover:border-slate-500 transition-colors">
                  <div className="space-y-1">
                    <div className="w-8 h-8 rounded-xl bg-slate-800/50 text-slate-300 flex items-center justify-center border border-slate-700 mb-2">
                      <Users className="h-4 w-4" />
                    </div>
                    <h3 className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase pt-1">DEP. FEDERAL (TOTAL)</h3>
                    <p className="text-2xl font-black text-white">
                      {stats.totalDepFederal}
                    </p>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Candidatos a Dep. Federal.</p>
                </div>
              </div>

              {/* Row 2: Deputado Estadual */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Estadual Masc */}
                <div onClick={() => openStatsModal("Deputados Estaduais (Homens)", stats.listDepEstadualMasc)} className="p-4 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between relative overflow-hidden cursor-pointer hover:border-slate-500 transition-colors">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -ml-10 -mt-10"></div>
                  <div className="space-y-1 relative z-10">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 mb-2">
                      <UserIcon className="h-4 w-4" />
                    </div>
                    <h3 className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase pt-1">DEP. EST (MASC)</h3>
                    <p className="text-2xl font-black text-white">{stats.totalDepEstadualMasc}</p>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 relative z-10">Homens (Dep. Estadual).</p>
                </div>
                {/* Estadual Fem */}
                <div onClick={() => openStatsModal("Deputadas Estaduais (Mulheres)", stats.listDepEstadualFem)} className="p-4 rounded-3xl bg-emerald-950/20 border border-emerald-500/20 flex flex-col justify-between relative overflow-hidden cursor-pointer hover:border-emerald-500/50 transition-colors">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                  <div className="space-y-1 relative z-10">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 mb-2">
                      <UserIcon className="h-4 w-4" />
                    </div>
                    <h3 className="text-[10px] font-mono font-bold tracking-wider text-emerald-400/80 uppercase pt-1">DEP. EST (FEM)</h3>
                    <p className="text-2xl font-black text-emerald-400">{stats.totalDepEstadualFem}</p>
                  </div>
                  <p className="text-[10px] text-emerald-500/70 mt-1 relative z-10">Mulheres (Dep. Estadual).</p>
                </div>
                {/* Estadual Nao Declarado */}
                <div onClick={() => openStatsModal("Dep. Estaduais (Não Declarado)", stats.listDepEstadualNaoDecl)} className="p-4 rounded-3xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between relative overflow-hidden cursor-pointer hover:border-slate-500 transition-colors">
                  <div className="space-y-1 relative z-10">
                    <div className="w-8 h-8 rounded-xl bg-slate-800/50 text-slate-400 flex items-center justify-center border border-slate-700 mb-2">
                      <UserIcon className="h-4 w-4" />
                    </div>
                    <h3 className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase pt-1">DEP. EST (N/ DECL.)</h3>
                    <p className="text-2xl font-black text-slate-300">{stats.totalDepEstadualNaoDecl}</p>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 relative z-10">Não informaram sexo.</p>
                </div>
                
                {/* Estadual Total */}
                <div onClick={() => openStatsModal("Deputados Estaduais (Total)", stats.listDepEstadual)} className="p-4 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between cursor-pointer hover:border-slate-500 transition-colors">
                  <div className="space-y-1">
                    <div className="w-8 h-8 rounded-xl bg-slate-800/50 text-slate-300 flex items-center justify-center border border-slate-700 mb-2">
                      <Users className="h-4 w-4" />
                    </div>
                    <h3 className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase pt-1">DEP. ESTADUAL (TOTAL)</h3>
                    <p className="text-2xl font-black text-white">
                      {stats.totalDepEstadual}
                    </p>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Candidatos a Dep. Estadual.</p>
                </div>
              </div>

              {/* Row 3: Em Estudo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div onClick={() => openStatsModal("Candidaturas em Estudo", stats.listEmEstudo)} className="p-4 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between cursor-pointer hover:border-slate-500 transition-colors">
                  <div className="space-y-1">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 mb-2">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <h3 className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase pt-1">EM ESTUDO</h3>
                    <p className="text-2xl font-black text-white">{stats.candidate2026Intents.estudo}</p>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Candidaturas em estudo.</p>
                </div>
              </div>
            </div>

            {/* Dashboard Graphs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Candidates Intentions distribution */}
              <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col lg:col-span-2 min-h-[400px] shadow-xl">
                <div>
                  <h3 className="font-bold text-white text-base">Intenção de Candidatura (2026)</h3>
                  <p className="text-xs text-slate-400">Distribuição das respostas coletadas para a pergunta: "Pretende se candidatar em 2026?".</p>
                </div>
                <div className="flex-1 mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                  {/* Left: Chart */}
                  <div className="flex flex-col justify-between h-full">
                    <div className="h-[300px] w-full relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats.intentionsChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                            label={{ fill: '#94a3b8', fontSize: 13, fontWeight: 500 }}
                          >
                            {stats.intentionsChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.name === 'Sim' ? '#10b981' : entry.name === 'Em Estudo' ? '#eab308' : '#334155'} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', fontSize: '12px' }}
                            itemStyle={{ color: '#f8fafc' }}
                          />
                          <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '13px', color: '#94a3b8', paddingTop: '10px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-800 text-[11px] text-slate-400 mt-4 shadow-inner">
                      <p>⚠️ Baseada em <strong className="text-white">{stats.totalLocalUpdates}</strong> registros atualizados localmente.</p>
                    </div>
                  </div>

                  {/* Right: Table */}
                  <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden flex flex-col h-full shadow-inner">
                    <div className="px-4 py-3 border-b border-slate-800 bg-emerald-950/20">
                      <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Lideranças com Intenção ("Sim")</h4>
                    </div>
                    <div className="overflow-y-auto flex-1">
                      <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 text-[10px] uppercase text-slate-500 font-mono shadow-sm z-10">
                          <tr>
                            <th className="py-3 px-4 font-semibold">Nome</th>
                            <th className="py-3 px-4 font-semibold">UF</th>
                            <th className="py-3 px-4 font-semibold">Cargo Eletivo</th>
                          </tr>
                        </thead>
                        <tbody className="text-xs text-slate-300">
                          {stats.candidates2026List.length > 0 ? (
                            stats.candidates2026List.map((cand, idx) => (
                              <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-800/80 transition-colors">
                                <td className="py-2.5 px-4 font-semibold text-white uppercase text-[10px] sm:text-[11px] leading-snug break-words" style={{ minWidth: '160px' }}>
                                  <button onClick={() => setSelectedRecord(cand.record)} className="text-emerald-400 hover:text-emerald-300 hover:underline text-left transition-colors cursor-pointer w-full">
                                    {cand.nome}
                                  </button>
                                </td>
                                <td className="py-2.5 px-4 text-slate-400 font-mono text-[10px] sm:text-[11px]">{cand.uf}</td>
                                <td className="py-2.5 px-4 text-emerald-300 uppercase text-[10px] sm:text-[11px] leading-snug break-words">{cand.cargo}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={3} className="py-8 px-4 text-center text-slate-500 italic">Nenhum registro com intenção confirmada.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* State Distribution */}
              <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col lg:col-span-2 shadow-xl">
                <div>
                  <h3 className="font-bold text-white text-base">Distribuição por Estado</h3>
                  <p className="text-xs text-slate-400">Quantidade de lideranças registradas por UF.</p>
                </div>
                <div 
                  className="w-full mt-6 relative"
                  style={{ height: `${Math.max(350, stats.statesChartData.length * 28)}px` }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.statesChartData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                      <XAxis type="number" hide />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 500 }} 
                        width={50} 
                        interval={0}
                      />
                      <Tooltip 
                        cursor={{ fill: '#1e293b' }}
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', fontSize: '12px', color: '#f8fafc' }}
                        itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                      />
                      <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} barSize={18}>
                        <LabelList dataKey="count" position="right" fill="#cbd5e1" fontSize={13} fontWeight="bold" />
                        {stats.statesChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#059669'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
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
                <div className="h-[220px] w-full mt-6 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.genderChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={5}
                        dataKey="value"
                        label={{ fill: '#94a3b8', fontSize: 12 }}
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
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Color/Race Distribution */}
              <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col min-h-[300px]">
                <div>
                  <h3 className="font-bold text-white text-base">Cor / Raça</h3>
                  <p className="text-xs text-slate-400">Distribuição racial declarada.</p>
                </div>
                <div className="h-[220px] w-full mt-6 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.colorChartData} layout="vertical" margin={{ top: 0, right: 50, left: 0, bottom: 0 }}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} width={80} />
                      <Tooltip 
                        cursor={{ fill: '#1e293b' }}
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', fontSize: '12px', color: '#f8fafc' }}
                        itemStyle={{ color: '#f59e0b' }}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        <LabelList dataKey="value" position="right" fill="#94a3b8" fontSize={12} />
                        {stats.colorChartData.map((entry, index) => {
                          const colorMap: Record<string, string> = {
                            'Branca': '#f8fafc',
                            'Preta': '#334155',
                            'Parda': '#b45309',
                            'Amarela': '#fde047',
                            'Indígena': '#ef4444'
                          };
                          return <Cell key={`cell-${index}`} fill={colorMap[entry.name] || '#64748b'} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Priority Distribution */}
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
                    onClick={restoreDefaultCSV}
                    className="flex-1 py-2 bg-slate-800 text-emerald-400 font-bold rounded-xl text-xs hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Restaurar Base Padrão</span>
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm("Isso irá apagar todos os registros da base local atual (não afetará o que você já salvou via formulário). Continuar?")) {
                        setCsvRecords([]);
                        setImportMessage("Base apagada. Faça upload de um novo CSV ou restaure a base padrão.");
                      }
                    }}
                    className="flex-1 py-2 bg-slate-800/80 text-rose-400 font-bold rounded-xl text-xs hover:bg-rose-950 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Limpar Base</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Modal - Print Preview */}
      <AnimatePresence>
        {showPrintPreview && selectedRecord && (
          <motion.div key="print-preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4 print:hidden">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-700 overflow-hidden shadow-2xl"
            >
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Printer className="h-5 w-5 text-amber-500" />
                  Pré-visualização da Ficha Individual
                </h3>
                <button onClick={() => setShowPrintPreview(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-800 flex justify-center custom-scrollbar">
                <div className="transform scale-[0.6] sm:scale-75 md:scale-[0.85] lg:scale-100 origin-top">
                  <div className="shadow-2xl bg-white">
                     <FichaA4 selectedRecord={selectedRecord} />
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end gap-3 flex-wrap">
                <button onClick={() => setShowPrintPreview(false)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm transition-colors">
                  Voltar
                </button>
                <button onClick={handlePrintAndPDF} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-sm flex items-center gap-2 transition-colors">
                  <Download className="h-4 w-4" />
                  <span>Gerar PDF e Imprimir</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal - Detail Record View */}
      <AnimatePresence>
        {selectedRecord && (
          <motion.div key="detail-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
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
                    <h3 className="font-extrabold text-base text-white">{(selectedRecord.nomeCompleto || '').toUpperCase()}</h3>
                    {selectedRecord.revisadoPara2026 ? (
                      <span className="text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">Atualizado 2026</span>
                    ) : (
                      <span className="text-[9px] font-bold bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full">Original</span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">CPF: {selectedRecord.cpf}</span>
                </div>
                <button onClick={() => setSelectedRecord(null)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body Scroll Space */}
              <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
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
                      {selectedRecord.candidaturaHomologada === 'Sim' && (
                        <>
                          <div className="col-span-1 sm:col-span-2 mt-2 pt-2 border-t border-emerald-500/10">
                            <h4 className="text-[10px] font-mono uppercase text-amber-400 font-bold flex items-center gap-1 mb-2">
                              <Sparkles className="h-3 w-3" />
                              Candidatura Homologada
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <p className="text-[9px] font-mono uppercase text-slate-500">Nome para Urna</p>
                                <p className="text-white font-semibold text-xs">{selectedRecord.nomeUrna || '-'}</p>
                              </div>
                              <div>
                                <p className="text-[9px] font-mono uppercase text-slate-500">Número para Urna</p>
                                <p className="text-white font-mono text-xs">{selectedRecord.numeroUrna || '-'}</p>
                              </div>
                              <div>
                                <p className="text-[9px] font-mono uppercase text-slate-500">CNPJ</p>
                                <p className="text-white font-mono text-xs">{selectedRecord.cnpjCandidatura || '-'}</p>
                              </div>
                            </div>
                            {(selectedRecord.bancoConta1 || selectedRecord.bancoConta2) && (
                              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {selectedRecord.bancoConta1 && (
                                  <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                                    <p className="text-[9px] font-mono uppercase text-amber-500 font-bold mb-1">Conta Bancária 1</p>
                                    <p className="text-xs text-white"><span className="text-slate-500">Banco:</span> {selectedRecord.bancoConta1}</p>
                                    <p className="text-xs text-white"><span className="text-slate-500">Ag:</span> {selectedRecord.agenciaConta1 || '-'} <span className="text-slate-500 ml-1">CC:</span> {selectedRecord.numeroConta1 || '-'}</p>
                                  </div>
                                )}
                                {selectedRecord.bancoConta2 && (
                                  <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                                    <p className="text-[9px] font-mono uppercase text-amber-500 font-bold mb-1">Conta Bancária 2</p>
                                    <p className="text-xs text-white"><span className="text-slate-500">Banco:</span> {selectedRecord.bancoConta2}</p>
                                    <p className="text-xs text-white"><span className="text-slate-500">Ag:</span> {selectedRecord.agenciaConta2 || '-'} <span className="text-slate-500 ml-1">CC:</span> {selectedRecord.numeroConta2 || '-'}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </>
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
                    {selectedRecord.prioridade && (
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
                      <p><span className="text-slate-400 font-medium">Nome:</span> <span className="text-white">{(selectedRecord.nomeCompleto || '').toUpperCase()}</span></p>
                      <p><span className="text-slate-400 font-medium">Nascimento:</span> <span>{formatDate(selectedRecord.dataNascimento || '') || '-'}</span></p>
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
                      <p><span className="text-slate-400 font-medium">Título Eleitor:</span> <span className="font-mono">{formatVoterID(selectedRecord.tituloEleitorial || '') || '-'}</span></p>
                      <p><span className="text-slate-400 font-medium">Zona / Seção:</span> <span className="font-mono">{selectedRecord.zona || '-'} / {selectedRecord.secao || '-'}</span></p>
                      <p><span className="text-slate-400 font-medium">Aeroporto Origem:</span> <span>{selectedRecord.aeroportoOrigem || '-'}</span></p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between">
                <p className="text-[10px] font-mono text-slate-500 hidden sm:block">ID Ficha: {selectedRecord.id}</p>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => setShowPrintPreview(true)}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-colors"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Pré-visualizar Ficha</span>
                  </button>
                  <button
                    onClick={() => handleEditRecord(selectedRecord)}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition-colors"
                  >
                    Editar / Revisar
                  </button>
                  <button
                    onClick={() => setSelectedRecord(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {deletingRecordId && (
          <motion.div key="confirm-delete" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
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
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs transition-colors hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (deletingRecordId) handleDeleteRecord(deletingRecordId);
                    setDeletingRecordId(null);
                  }}
                  className="px-4 py-2 bg-rose-600 text-white font-bold rounded-xl text-xs transition-colors hover:bg-rose-500 shadow-lg shadow-rose-900/20"
                >
                  Sim, Excluir
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal - Photo Requirements Popup */}
      <AnimatePresence>
        {showPhotoPopup && (
          <motion.div key="photo-popup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 rounded-3xl border border-slate-800 w-full max-w-sm overflow-hidden flex flex-col text-left text-slate-100 shadow-2xl"
            >
              <div className="p-5 border-b border-slate-800 bg-slate-950/50 flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                  <Camera className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">Exigências das Fotos</h3>
                  <p className="text-[10px] text-slate-400">Banca de Heteroidentificação</p>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Para o envio das imagens utilizadas no processo de Banca de Heteroidentificação, certifique-se de cumprir os seguintes requisitos:
                </p>
                <ul className="text-xs space-y-2 text-slate-300">
                  <li className="flex gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    Fundo claro ou branco.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    Boa iluminação focada no rosto.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    Rosto totalmente descoberto (sem óculos escuros, boné ou chapéu).
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    Enquadramento do busto para cima.
                  </li>
                </ul>
              </div>
              <div className="p-4 bg-slate-950/50 border-t border-slate-800">
                <button
                  onClick={() => setShowPhotoPopup(false)}
                  className="w-full py-2.5 bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors hover:bg-slate-700"
                >
                  Entendido, Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Humble Footer */}
      <footer id="app-footer" className="py-6 mt-8 border-t border-slate-850 text-center font-mono text-[10px] text-slate-500 select-none bg-slate-950/30">
        <p>Negritude Socialista Brasileira © 2026 • Coleta & Revisão Eleitoral Segura</p>
        <p className="text-slate-600 mt-1">Armazenamento Local • 100% Client-Side • Desenvolvido com Estilo e Precisão</p>
      </footer>

    </div>


      {/* Stats List Modal */}
      <AnimatePresence>
        {isStatsModalOpen && (
          <motion.div key="stats-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl relative"
            >
              <button
                onClick={() => setIsStatsModalOpen(false)}
                className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              
              <h2 className="text-xl font-bold text-white mb-2">{statsModalTitle}</h2>
              <p className="text-sm text-slate-400 mb-6"><span>Total: </span>{statsModalData.length}<span> registros</span> encontrados.</p>
              
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {statsModalData.length === 0 ? (
                  <div className="text-center py-10 text-slate-500">
                    <Filter className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p>Nenhum registro encontrado nesta categoria.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {statsModalData.map((record, i) => (
                      <div key={i} className="bg-slate-950/50 border border-slate-800/80 p-4 rounded-2xl">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold text-white text-sm line-clamp-1">{record.nomeCompleto}</h4>
                            <p className="text-xs text-slate-500">{record.cpf}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            record.prioridade === 'Alta' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                            record.prioridade === 'Média' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}>
                            {record.prioridade}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {record.cidade} - {record.estado}
                          </div>
                          {record.sexo && (
                            <div className="flex items-center gap-1">
                              <UserIcon className="h-3 w-3" />
                              {record.sexo}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Printable Area - Hidden on screen, visible only when printing */}
      <div id="printable-area" className="hidden print:block print:bg-[#ffffff] print:text-[#000000] w-full min-h-screen font-sans">
        {selectedRecord && <FichaA4 selectedRecord={selectedRecord} />}
      </div>
    </>
  );
}
