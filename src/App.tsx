/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Building2, 
  User, 
  MapPin, 
  Layers, 
  FileText, 
  ClipboardCheck, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle,
  Clock,
  Timer,
  Euro,
  FileBadge,
  Clipboard,
  Trash2,
  Bookmark,
  Upload,
  FileUp,
  X,
  Download,
  FileCode,
  Files,
  FileJson,
  Calculator,
  Plus,
  Edit2,
  Info,
  Settings2,
  Hammer,
  CheckSquare,
  Square,
  Circle,
  Eye,
  EyeOff,
  Briefcase,
  SunMoon,
  Sun,
  Moon,
  Lock,
  PlusCircle,
  BarChart3,
  Wrench,
  ShieldAlert,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import mammoth from 'mammoth';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/views/DashboardView';
import { ClientsView } from './components/views/ClientsView';
import { ProjectsView } from './components/views/ProjectsView';
import { calculateFinancialModel, composeMasterData } from './lib/financialEngine';
import { analyzeStudioStyle } from './lib/styleEngine';
import { getLegalBlocksForDocument } from './lib/legalCompliance';
import { 
  DocumentType, 
  ClientData, 
  ProjectData, 
  OfficeData,
  EstimationType,
  EstimationOptions,
  MemoriaDescritivaType,
  TechnicalOptions,
  ProjectLevelStatus,
  ProjectFinancialModel,
  ProjectMasterData,
  ProjectTemplate,
  ServiceDefinition,
  ServicePhase,
  Client,
  NavigationView,
  ProjectTypology,
  CommerceTechnicalData,
  TourismTechnicalData,
  LoteamentoTechnicalData
} from './types';
import { 
  SYSTEM_PROMPT, 
  DEFAULT_SERVICES, 
  DEFAULT_OFFICE_SERVICES,
  PROJECT_PHASES,
  TECHNICAL_BRIEF_QUESTIONS
} from './constants';

const STYLE_PRESETS = [
  {
    name: "Técnico Contemporâneo",
    snippet: "A presente memória descritiva refere-se ao projeto de arquitetura para a construção de uma habitação unifamiliar, assente em princípios de sustentabilidade e integração paisagística. A estrutura será em betão armado, com vãos generosos e proteção solar passiva."
  },
  {
    name: "Minimalista Executivo",
    snippet: "Proposta metodológica rigorosa focada na otimização de custos e prazos. Os materiais selecionados privilegiam a durabilidade e a baixa manutenção, respondendo às exigências programáticas do promotor com soluções de design depurado."
  },
  {
    name: "Reabilitação Tradicional",
    snippet: "A intervenção proposta visa a salvaguarda do património edificado, mantendo a traça original e utilizando materiais tradicionais como a cal hidráulica e a madeira de pinho nacional, adaptando os espaços às exigências de conforto atual."
  }
];

const GET_DEFAULT_PROJECT = (): ProjectData => ({
  id: Math.random().toString(36).substr(2, 9),
  name: 'Novo Projeto',
  clientName: '',
  clientEmail: '',
  location: 'Tavira',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  status: 'active',
  base: {
    projectName: 'Novo Projeto',
    client: {
      name: '',
      email: '',
      nif: '',
      address: '',
      phone: '',
    },
    interventionType: 'Construção nova',
    mainGoal: 'Habitação própria',
    location: {
      municipality: 'Tavira',
      parish: '',
      address: ''
    },
    propertySituation: 'Terreno urbano',
    currentProcessPhase: 'Apenas intenção de projeto',
    preferredArea: {
      areaM2: 0,
      typology: 'T3',
      floors: 1
    },
    features: {
      pool: false,
      basement: false,
      garage: false,
      flatRoof: false,
      largeGlazing: false,
      tourismAL: false,
      energyEfficiency: false
    },
    topography: 'Plana',
    financialGoals: {
      predictedBudget: 0,
      bankFinancing: false,
      maxInvestmentLimit: 0
    },
    documentation: {
      cadernetaPredial: false,
      levantamentoTopografico: false,
      plantaLoteamento: false,
      photos: false,
      previousProject: false,
      none: false
    },
    status: ProjectLevelStatus.NOT_STARTED,
  },
  operational: {
    contractedPhases: [],
    complementaryServices: [],
    automatedDeliverables: [],
    technicalCoordination: 'Não',
    projectComplexity: 'Standard',
    projectExigency: 'Médio',
    deadlineType: 'Normal',
    constructionModel: 'Ainda não definido',
    foreseenSpecialties: [],
    clientType: 'Particular',
    clientTraits: [],
    technicalInfoStatus: [],
    status: ProjectLevelStatus.NOT_STARTED,
  },
  commercial: {
    feeModel: 'Percentagem sobre obra',
    feeValue: 0,
    constructionCostBasis: 0,
    excludedCosts: [
      'Taxas camarárias', 
      'Impressões / Cópias', 
      'Levantamentos topográficos', 
      'Ensaios de solo / laboratório', 
      'Certificados energéticos (ADENE)', 
      'Projetos de especialidades (Engenharias)', 
      'IVA à taxa legal em vigor', 
      'Deslocações fora do concelho', 
      'Custos de registos e notariado'
    ],
    paymentStructure: 'Percentagem por fase',
    paymentPhases: [],
    useDefaultDistribution: true,
    revisionPolicy: {
      maxRevisions: 2,
      description: 'Revisões incluídas por fase de projeto'
    },
    changeManagementPolicy: 'Alterações relevantes serão faturadas adicionalmente',
    suspensionPolicy: {
      enabled: true,
      reasons: [
        'Atrasos camarários', 
        'Falta de documentação do cliente', 
        'Pareceres de entidades externas',
        'Falta de pagamento de honorários'
      ]
    },
    signatureType: 'Assinatura digital qualificada',
    proposalValidity: '30 dias',
    commercialNotes: '',
    status: ProjectLevelStatus.NOT_STARTED,
  },
  technical: {
    typology: 'Housing',
    implantation: {
      implantationArea: 0,
      implantationType: 'isolada',
      hasAnnex: false,
      hasParking: false,
      preferredSolarOrientation: 'Sul',
      solarOrientationFeatures: [],
    },
    functionalOrganization: {
      rooms: [],
      functionalNotes: '',
      additionalSpaces: [],
      projectPriority: 'Área social',
      integrationLevel: 'Elevado',
      integrationFeatures: [],
      housing: {
        numBedrooms: 3,
        numSuites: 1,
        numBathrooms: 2,
        hasCloset: true,
        isOpenSpace: true,
        hasMasterSuite: true,
        hasGarage: true,
        hasLaundry: true,
        hasStorage: true,
      }
    },
    architecturalLanguage: {
      language: 'Contemporânea',
      architecturalNotes: '',
    },
    constructionSystems: {
      structure: 'Betão armado',
      roof: 'Plana',
      facades: [],
      frames: 'Alumínio',
      performanceLevel: 'Elevado',
      performanceFeatures: [],
    },
    energyEfficiency: [],
    infrastructure: [],
    accessibility: {
      subject: 'Não',
      hasAccessibleRoute: false,
      hasAccessibleBathroom: false,
      hasElevator: false,
    },
    fireSafety: {
      usageType: 'Habitação',
      riskCategory: '1ª',
    },
    landscapeIntegration: {
      maintainVegetation: true,
      newGardenZones: true,
      walls: false,
      exteriorPavements: false,
      landscapeStrategy: '',
    },
    technicalConstraints: [],
    config: {
      type: MemoriaDescritivaType.LICENSING,
      constructionSystem: 'Betão Armado',
      roofType: 'Plana (Terraço)',
      exteriorFinish: 'ETICS (Capoto)'
    },
    status: ProjectLevelStatus.NOT_STARTED,
  },
  legal: {
    procedureType: 'Licenciamento',
    urbanOperationType: 'Construção Nova',
    propertyIdentification: {
      matricialArticle: '',
      propertyDescription: '',
      conservatory: '',
      permanentCertificateCode: '',
      landArea: 0,
    },
    ownerType: 'Proprietário',
    legalRegime: [],
    coordinationEntity: 'Atelier responsável',
    technicalDeclarations: [],
    liabilityInsurance: {
      policyNumber: '',
      insurer: '',
      validity: '',
    },
    signatureType: 'Digital qualificada',
    deliveredElements: [],
    status: ProjectLevelStatus.NOT_STARTED,
  },
  legalRiskLevel: 'high' as const,
});

const migrateProject = (parsed: any): ProjectData => {
  const defaultProject = GET_DEFAULT_PROJECT();
  return {
    ...defaultProject,
    ...parsed,
    id: parsed.id || Math.random().toString(36).substr(2, 9),
    commercial: {
      ...defaultProject.commercial,
      ...(parsed.commercial || {}),
      paymentPhases: (parsed.commercial?.paymentPhases || []).filter((p: any) => PROJECT_PHASES.includes(p.label)),
      useDefaultDistribution: parsed.commercial?.useDefaultDistribution !== undefined ? parsed.commercial.useDefaultDistribution : true
    },
    base: {
      ...defaultProject.base,
      ...(parsed.base || {}),
      location: {
        ...defaultProject.base.location,
        ...(typeof parsed.base?.location === 'object' ? parsed.base.location : {})
      },
      preferredArea: {
        ...defaultProject.base.preferredArea,
        ...(parsed.base?.preferredArea || {})
      },
      features: {
        ...defaultProject.base.features,
        ...(parsed.base?.features || {})
      },
      financialGoals: {
        ...defaultProject.base.financialGoals,
        ...(parsed.base?.financialGoals || {})
      },
      documentation: {
        ...defaultProject.base.documentation,
        ...(parsed.base?.documentation || {})
      }
    },
    operational: {
      ...defaultProject.operational,
      ...(parsed.operational || {})
    },
    technical: {
      ...defaultProject.technical,
      ...(parsed.technical || {}),
      config: {
        ...defaultProject.technical.config,
        ...(parsed.technical?.config || {})
      },
      typology: parsed.technical?.typology || (
        parsed.base?.interventionType === 'Turismo' ? 'Tourism' :
        parsed.base?.interventionType === 'Loteamento' ? 'Loteamento' :
        parsed.base?.interventionType === 'Comércio/Serviços' ? 'Commerce' :
        parsed.base?.propertySituation === 'Apartamento' ? 'Multifamily' : 'Housing'
      ),
      implantation: {
        ...defaultProject.technical.implantation,
        ...(parsed.technical?.implantation || {})
      },
      functionalOrganization: {
        ...defaultProject.technical.functionalOrganization,
        ...(parsed.technical?.functionalOrganization || {}),
        housing: parsed.technical?.functionalOrganization?.housing || 
                 (parsed.technical?.functionalOrganization?.numBedrooms ? {
                   numBedrooms: parsed.technical.functionalOrganization.numBedrooms,
                   numSuites: 0,
                   numBathrooms: parsed.technical.functionalOrganization.numBathrooms || 0,
                   hasCloset: false,
                   isOpenSpace: parsed.technical.functionalOrganization.isOpenSpace || false,
                   hasMasterSuite: parsed.technical.functionalOrganization.hasMasterSuite || false,
                   hasGarage: false,
                   hasLaundry: false,
                   hasStorage: false
                 } : defaultProject.technical.functionalOrganization.housing),
        commerce: parsed.technical?.functionalOrganization?.commerce,
        tourism: parsed.technical?.functionalOrganization?.tourism,
        loteamento: parsed.technical?.functionalOrganization?.loteamento,
      },
      architecturalLanguage: {
        ...defaultProject.technical.architecturalLanguage,
        ...(parsed.technical?.architecturalLanguage || {})
      },
      constructionSystems: {
        ...defaultProject.technical.constructionSystems,
        ...(parsed.technical?.constructionSystems || {})
      },
      accessibility: {
        ...defaultProject.technical.accessibility,
        ...(parsed.technical?.accessibility || {})
      },
      fireSafety: {
        ...defaultProject.technical.fireSafety,
        ...(parsed.technical?.fireSafety || {})
      },
      landscapeIntegration: {
        ...defaultProject.technical.landscapeIntegration,
        ...(parsed.technical?.landscapeIntegration || {})
      }
    },
    legal: {
      ...defaultProject.legal,
      ...(parsed.legal || {}),
      propertyIdentification: {
        ...defaultProject.legal.propertyIdentification,
        ...(parsed.legal?.propertyIdentification || {})
      },
      liabilityInsurance: {
        ...defaultProject.legal.liabilityInsurance,
        ...(parsed.legal?.liabilityInsurance || {})
      }
    },
    legalRiskLevel: parsed.legalRiskLevel || defaultProject.legalRiskLevel
  };
};

export default function App() {
  const [view, setView] = useState<NavigationView>(() => {
    const saved = localStorage.getItem('arqdoc_view');
    return (saved as NavigationView) || 'dashboard';
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('arqdoc_clients');
    return saved ? JSON.parse(saved) : [];
  });

  const [allProjects, setAllProjects] = useState<ProjectData[]>(() => {
    const saved = localStorage.getItem('arqdoc_all_projects');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return parsed.map((p: any) => migrateProject(p));
    } catch (e) {
      return [];
    }
  });

  const [activeProjectId, setActiveProjectId] = useState<string | null>(() => {
    return localStorage.getItem('arqdoc_active_project_id');
  });

  const [step, setStep] = useState(() => {
    const saved = localStorage.getItem('arqdoc_step');
    return saved ? parseInt(saved, 10) : 1;
  });
  const [loading, setLoading] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [project, setProject] = useState<ProjectData>(() => {
    const savedProjectId = localStorage.getItem('arqdoc_active_project_id');
    const savedProjects = localStorage.getItem('arqdoc_all_projects');
    const defaultProject = GET_DEFAULT_PROJECT();

    if (savedProjectId && savedProjects) {
      try {
        const projects = JSON.parse(savedProjects) as ProjectData[];
        const active = projects.find(p => p.id === savedProjectId);
        if (active) return migrateProject(active);
      } catch (e) {
        console.error('Error restoring active project:', e);
      }
    }

    const saved = localStorage.getItem('arqdoc_project');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return migrateProject(parsed);
      } catch (e) {
        return defaultProject;
      }
    }
    return defaultProject;
  });

  const [savedTemplates, setSavedTemplates] = useState<ProjectTemplate[]>(() => {
    const saved = localStorage.getItem('arqdoc_templates');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('arqdoc_templates', JSON.stringify(savedTemplates));
  }, [savedTemplates]);

  const [confirmReset, setConfirmReset] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const resetProject = () => {
    setProject(GET_DEFAULT_PROJECT());
    setConfirmReset(false);
  };

  const [isEditingGlobalOffice, setIsEditingGlobalOffice] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');

  const saveCurrentAsTemplate = () => {
    const nameToUse = templateName || project.base.projectName || 'Projeto Base';
    const newTemplate: ProjectTemplate = {
      id: Math.random().toString(36).substr(2, 9),
      name: nameToUse,
      data: JSON.parse(JSON.stringify(project)),
      createdAt: new Date().toISOString()
    };
    setSavedTemplates(prev => [...prev, newTemplate]);
    setIsSavingTemplate(false);
    setTemplateName('');
  };

  const loadTemplate = (template: ProjectTemplate) => {
    const templateData = JSON.parse(JSON.stringify(template.data));
    setProject({
      ...templateData,
      id: project.id, // Keep the current project ID
      updatedAt: new Date().toISOString()
    });
    setShowTemplates(false);
  };

  const deleteTemplate = (id: string) => {
    setSavedTemplates(prev => prev.filter(t => t.id !== id));
  };

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('arqdoc_theme') as 'light' | 'dark') || 'light';
  });

  const [office, setOffice] = useState<OfficeData>(() => {
    const saved = localStorage.getItem('arqdoc_office');
    const defaultOffice: OfficeData = {
      name: 'Atelier de Arquitetura Regional',
      feeMethod: 'percentage',
      feeValue: 7,
      baseConstructionCost: 1400,
      templateSnippets: '',
      templateFilesContent: [],
      styleConfidenceScore: 0,
      officeLegalIdentity: {
        architectName: '',
        architectRegNumber: '',
        taxId: '',
        address: '',
        email: '',
        phone: '',
        signatureType: 'Assinatura digital qualificada' as any
      },
      servicesLibrary: DEFAULT_OFFICE_SERVICES,
      defaultFeeDistribution: [
        { label: 'Programa Base', percentage: 5 },
        { label: 'Estudo Prévio', percentage: 15 },
        { label: 'Licenciamento', percentage: 35 },
        { label: 'Projeto de Execução', percentage: 30 },
        { label: 'Contratação', percentage: 5 },
        { label: 'Assistência Técnica', percentage: 10 }
      ]
    };

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...defaultOffice,
          ...parsed,
          servicesLibrary: parsed.servicesLibrary || DEFAULT_OFFICE_SERVICES,
          officeLegalIdentity: {
            ...defaultOffice.officeLegalIdentity!,
            ...(parsed.officeLegalIdentity || {})
          }
        };
      } catch (e) {
        return defaultOffice;
      }
    }
    return defaultOffice;
  });

  const [deletedServices, setDeletedServices] = useState<ServiceDefinition[]>(() => {
    const saved = localStorage.getItem('arqdoc_deleted_services');
    return saved ? JSON.parse(saved) : [];
  });

  const [showRestoreList, setShowRestoreList] = useState(false);

  useEffect(() => {
    localStorage.setItem('arqdoc_deleted_services', JSON.stringify(deletedServices));
  }, [deletedServices]);

  // Client Management Handlers
  const addClient = (name: string, details: Partial<Client>) => {
    const newClient: Client = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email: details.email,
      phone: details.phone,
      nif: details.nif,
      address: details.address,
      createdAt: new Date().toISOString()
    };
    setClients(prev => [...prev, newClient]);
    
    return newClient;
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const openClientQuestionnaire = (client: Client) => {
    // We reuse the existing flow by setting a temporary project 
    // focused on collecting client data
    const tempProject = GET_DEFAULT_PROJECT();
    tempProject.name = `Dados de ${client.name}`;
    tempProject.clientName = client.name;
    tempProject.clientEmail = client.email;
    tempProject.base.client = {
      name: client.name,
      email: client.email,
      phone: client.phone,
      nif: client.nif,
      address: client.address
    };
    
    // If client already has baseData, load it
    if (client.baseData) {
      tempProject.base = client.baseData;
    }

    setProject(tempProject);
    setStep(9); // Questionnaire level
    setActiveLevel('base');
    setFormStep(0);
    navigateTo('editor');
    // Store that we are editing a client's base data so we can save it back
    localStorage.setItem('arqdoc_editing_client_id', client.id);
  };

  // Project Management Handlers
  const openNewProjectFlow = (client?: Client) => {
    const newProj = GET_DEFAULT_PROJECT();
    if (client) {
      newProj.clientName = client.name;
      newProj.clientEmail = client.email || '';
      newProj.base.client = {
        name: client.name,
        email: client.email || '',
        phone: client.phone || '',
        nif: client.nif || '',
        address: client.address || ''
      };
    }
    setProject(newProj);
    setActiveProjectId(newProj.id);
    setAllProjects(prev => [...prev, newProj]);
    setStep(1); // Identification step
    navigateTo('editor');
  };

  const openProject = (id: string) => {
    const proj = allProjects.find(p => p.id === id);
    if (proj) {
      setProject(proj);
      setActiveProjectId(id);
      setStep(1); // Identification step
      navigateTo('editor');
    }
  };

  const deleteProject = (id: string) => {
    // 1. Update the projects list
    setAllProjects(prev => prev.filter(p => p.id !== id));
    
    // 2. Handle active project reset if the deleted one was active
    setActiveProjectId(prevActiveId => {
      if (prevActiveId === id) {
        setProject(GET_DEFAULT_PROJECT());
        return null;
      }
      return prevActiveId;
    });
  };

  const navigateTo = (newView: NavigationView) => {
    setView(newView);
    setIsEditingGlobalOffice(false);
  };

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showLegalIdentity, setShowLegalIdentity] = useState(false);
  const [docType, setDocType] = useState<DocumentType>(DocumentType.PROPOSTA_ARQUITETURA);
  const [activeLevel, setActiveLevel] = useState<'base' | 'operational' | 'commercial' | 'technical' | 'legal'>('base');
  const [returnToStep, setReturnToStep] = useState<number | null>(null);
  const [formStep, setFormStep] = useState(0);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('arqdoc_view', view);
    window.scrollTo(0, 0);
  }, [view]);

  useEffect(() => {
    localStorage.setItem('arqdoc_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('arqdoc_all_projects', JSON.stringify(allProjects));
  }, [allProjects]);

  useEffect(() => {
    if (activeProjectId) {
      localStorage.setItem('arqdoc_active_project_id', activeProjectId);
    } else {
      localStorage.removeItem('arqdoc_active_project_id');
    }
  }, [activeProjectId]);

  useEffect(() => {
    localStorage.setItem('arqdoc_project', JSON.stringify(project));
    // Also sync the active project back to the allProjects list if it exists
    if (project.id) {
      setAllProjects(prev => {
        // If it doesn't exist, add it. If it exists, update it.
        const exists = prev.some(p => p.id === project.id);
        if (!exists) {
          return [...prev, { ...project, updatedAt: new Date().toISOString() }];
        }
        return prev.map(p => p.id === project.id ? { ...project, updatedAt: new Date().toISOString() } : p);
      });
    }
  }, [project]);

  useEffect(() => {
    localStorage.setItem('arqdoc_office', JSON.stringify(office));
    
    // When office settings change, we update the financial models of all projects
    // to ensure the changes are reflected globally as requested.
    
    // 1. Update active project
    setProject(current => {
      if (!current) return current;
      const newModel = calculateFinancialModel(current, office);
      const newMasterData = composeMasterData(current, office);
      return { 
        ...current, 
        financialModel: newModel,
        masterData: newMasterData
      };
    });

    // 2. Update all projects in the list
    setAllProjects(prev => prev.map(p => {
      const newModel = calculateFinancialModel(p, office);
      const newMasterData = composeMasterData(p, office);
      return { 
        ...p, 
        financialModel: newModel,
        masterData: newMasterData
      };
    }));
  }, [office]);

  useEffect(() => {
    localStorage.setItem('arqdoc_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('arqdoc_step', step.toString());
    window.scrollTo(0, 0);
  }, [step]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [isEditingGlobalOffice]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [showLegalIdentity]);

  // Office to Project Synchronization Effect
  useEffect(() => {
    if (project) {
      const feeModelMap: Record<'sqm' | 'percentage', any> = {
        'percentage': 'Percentagem sobre obra',
        'sqm': 'Valor por m²'
      };
      
      const targetFeeModel = feeModelMap[office.feeMethod];
      
      const hasChanges = 
        project.commercial.feeModel !== targetFeeModel ||
        project.commercial.feeValue !== office.feeValue;

      if (hasChanges) {
        setProject(prev => {
          const updatedCommercial = {
            ...prev.commercial,
            feeModel: targetFeeModel,
            feeValue: office.feeValue,
          };
          
          return { ...prev, commercial: updatedCommercial };
        });

        // Also update all projects in the list to maintain full synchronization
        setAllProjects(prev => prev.map(p => {
          const updatedCommercial = {
            ...p.commercial,
            feeModel: targetFeeModel,
            feeValue: office.feeValue,
          };
          
          return { ...p, commercial: updatedCommercial };
        }));
      }
    }
  }, [office]);

  // Master Data Synchronization Effect (Single Source of Truth)
  useEffect(() => {
    const master = composeMasterData(project, office);
    // Only update if something meaningful changed to avoid loops
    if (JSON.stringify(project.masterData) !== JSON.stringify(master)) {
      setProject(prev => ({
        ...prev,
        masterData: master,
        financialModel: calculateFinancialModel(prev, office)
      }));
    }
  }, [
    project.base.projectName,
    project.base.client,
    project.base.location,
    project.base.preferredArea,
    project.base.topography,
    project.base.features,
    project.base.financialGoals,
    project.operational.contractedPhases,
    project.operational.technicalCoordination,
    project.operational.projectComplexity,
    project.operational.projectExigency,
    project.operational.deadlineType,
    project.operational.complementaryServices,
    office.name,
    office.feeMethod,
    office.feeValue,
    office.baseConstructionCost,
    office.officeLegalIdentity
  ]);

  useEffect(() => {
    // Logic for commercial/office sync or other side effects
  }, [activeLevel, office.servicesLibrary]);

  const updateProjectLevel = (level: keyof ProjectData, update: any) => {
    setProject(prev => {
      const updatedProject = {
        ...prev,
        [level]: {
          ...(prev[level] as any),
          ...update,
          status: ProjectLevelStatus.PARTIAL
        }
      };

      // Sync back to office if commercial fields change
      if (level === 'commercial') {
        const commercialUpdates: any = {};
        if ('feeMethod' in update) {
          const methodMap: Record<string, 'sqm' | 'percentage'> = {
            'Percentagem sobre custo de obra': 'percentage',
            'Valor por m²': 'sqm',
            'Valor fixo': 'percentage', // default fallback
            'Modelo híbrido': 'percentage'
          };
          commercialUpdates.feeMethod = methodMap[update.feeMethod] || 'percentage';
        }
        if ('feeValue' in update) commercialUpdates.feeValue = update.feeValue;
        if ('constructionCostBase' in update) commercialUpdates.baseConstructionCost = update.constructionCostBase;
        
        if (Object.keys(commercialUpdates).length > 0) {
          setOffice(off => ({ ...off, ...commercialUpdates }));
        }
      }

      return updatedProject;
    });
  };

  const addLibraryService = () => {
    const newService: ServiceDefinition = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Novo Serviço',
      description: 'Descrição do serviço...',
      phase: 'Estudo Prévio',
      isIncludedByDefault: true,
      isOptional: false,
      architectResponsibilities: '',
      clientResponsibilities: '',
      includedItems: [],
      excludedItems: []
    };
    setOffice(prev => ({
      ...prev,
      servicesLibrary: [newService, ...prev.servicesLibrary]
    }));
  };

  const updateLibraryService = (id: string, update: Partial<ServiceDefinition>) => {
    setOffice(prev => ({
      ...prev,
      servicesLibrary: prev.servicesLibrary.map(s => s.id === id ? { ...s, ...update } : s)
    }));
  };

  const deleteLibraryService = (id: string) => {
    const serviceToDelete = office.servicesLibrary.find(s => s.id === id);
    if (serviceToDelete) {
      setDeletedServices(prev => [serviceToDelete, ...prev]);
    }
    setOffice(prev => ({
      ...prev,
      servicesLibrary: prev.servicesLibrary.filter(s => s.id !== id)
    }));
  };

  const restoreLibraryService = (id: string) => {
    const serviceToRestore = deletedServices.find(s => s.id === id);
    if (serviceToRestore) {
      setOffice(prev => ({
        ...prev,
        servicesLibrary: [serviceToRestore, ...prev.servicesLibrary]
      }));
      setDeletedServices(prev => prev.filter(s => s.id !== id));
    }
  };

  const toggleProjectMulti = (level: 'base' | 'commercial' | 'operational' | 'technical' | 'legal', key: string, value: string) => {
    setProject(prev => {
      // Handle nested keys like "implantation.solarOrientationFeatures"
      if (key.includes('.')) {
        const [parentKey, childKey] = key.split('.');
        const parent = (prev[level] as any)[parentKey] || {};
        const current = parent[childKey] || [];
        const updated = current.includes(value)
          ? current.filter((v: string) => v !== value)
          : [...current, value];
        
        return {
          ...prev,
          [level]: {
            ...(prev[level] as any),
            [parentKey]: {
              ...parent,
              [childKey]: updated
            },
            status: ProjectLevelStatus.PARTIAL
          }
        };
      }

      const current = (prev[level] as any)[key] || [];
      const updated = current.includes(value)
        ? current.filter((v: string) => v !== value)
        : [...current, value];
      return {
        ...prev,
        [level]: {
          ...(prev[level] as any),
          [key]: updated,
          status: ProjectLevelStatus.PARTIAL
        }
      };
    });
  };

  const nextStep = () => {
    if (step === 1) {
      setStep(9);
      setActiveLevel('base');
      setFormStep(0);
    } else {
      setStep(s => Math.min(s + 1, 9));
    }
  };
  const prevStep = () => {
    if (step === 9) {
      setStep(1);
    } else {
      setStep(s => Math.max(s - 1, 1));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadedFiles(prev => [...prev, ...files]);
    setLoading(true);

    const newContentsBatch: string[] = [];
    for (const file of files) {
      try {
        if (file.name.endsWith('.docx')) {
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          newContentsBatch.push(`--- FILE: ${file.name} ---\n${result.value}`);
        } else if (file.name.endsWith('.txt')) {
          const text = await file.text();
          newContentsBatch.push(`--- FILE: ${file.name} ---\n${text}`);
        } else {
          // Fallback for other text-like files
          const text = await file.text();
          newContentsBatch.push(`--- FILE: ${file.name} ---\n${text}`);
        }
      } catch (err) {
        console.error(`Error reading file ${file.name}:`, err);
      }
    }

    const newContentsBatchFiltered = newContentsBatch.filter(Boolean);
    if (newContentsBatchFiltered.length === 0) {
      setLoading(false);
      return;
    }

    const newContents: string[] = [...(office.templateFilesContent || []), ...newContentsBatch];
    
    // Trigger Style Learning Engine
    const { profile, confidence } = await analyzeStudioStyle(newContents);

    setOffice(prev => ({
      ...prev,
      templateFilesContent: newContents,
      styleProfile: profile,
      styleConfidenceScore: confidence
    }));
    setLoading(false);
  };

  const removeFile = async (index: number) => {
    const updatedContents = (office.templateFilesContent || []).filter((_, i) => i !== index);
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    
    setLoading(true);
    const { profile, confidence } = await analyzeStudioStyle(updatedContents);
    
    setOffice(prev => ({
      ...prev,
      templateFilesContent: updatedContents,
      styleProfile: profile,
      styleConfidenceScore: confidence
    }));
    setLoading(false);
  };

  const generateDocument = useCallback(async () => {
    // GLOBAL REQUIREMENT: Level 1 and Level 2 must always be completed first
    if (project.base.status !== ProjectLevelStatus.COMPLETED) {
      setStep(9);
      setActiveLevel('base');
      setFormStep(0);
      setError("Complete os Dados Base (Nível 1) antes de prosseguir gradualmente para a geração de documentos.");
      return;
    }

    if (project.operational.status !== ProjectLevelStatus.COMPLETED) {
      setStep(9);
      setActiveLevel('operational');
      setFormStep(0);
      setError("Complete o Perfil Operacional (Nível 2) antes de prosseguir.");
      return;
    }

    // Check level requirements based on document type
    if (docType === DocumentType.PROPOSTA_ARQUITETURA) {
      if (project.commercial.status !== ProjectLevelStatus.COMPLETED) {
        setStep(9);
        setActiveLevel('commercial');
        setFormStep(0);
        setError("Complete os Dados Comerciais antes de gerar a Proposta.");
        return;
      }
    }

    if (docType === DocumentType.ESTIMATIVA_FINANCEIRA) {
      // Estimativa uses Nível 1 and 2, which are already checked above as global requirements.
    }

    if (docType === DocumentType.MEMORIA_DESCRITIVA) {
      // Base project data is NOT strictly required here as per user request
      if (project.technical.status !== ProjectLevelStatus.COMPLETED) {
        setStep(9);
        setActiveLevel('technical');
        setFormStep(0);
        setError("Complete os Dados Técnicos antes de gerar a Memória Descritiva.");
        return;
      }
      // Configure technical options before generation
      if (step !== 10) {
        setStep(10);
        return;
      }
    }

    if (docType === DocumentType.TERMO_RESPONSABILIDADE) {
      // Base project data is NOT strictly required here as per user request
      if (project.legal.status !== ProjectLevelStatus.COMPLETED) {
        setStep(9);
        setActiveLevel('legal');
        setFormStep(0);
        setError("Complete os Dados Legais antes de gerar o Termo de Responsabilidade.");
        return;
      }
    }

    setLoading(true);
    setError(null);

    // Ensure Master Data is ready and fresh
    console.log("Preparing document generation for:", docType);
    
    // Safety check for critical project structure
    if (!project.technical) {
      console.warn("Project.technical is missing! Recovering...");
      project.technical = GET_DEFAULT_PROJECT().technical;
    }
    if (!project.technical.config) {
      console.warn("Project.technical.config is missing! Recovering...");
      project.technical.config = GET_DEFAULT_PROJECT().technical.config;
    }

    const updatedMasterData = composeMasterData(project, office);
    const updatedFinancialModel = calculateFinancialModel(project, office);
    
    // Use fresh data for the AI request
    let currentProject = { 
      ...project, 
      masterData: updatedMasterData,
      financialModel: updatedFinancialModel
    };
    
    // Update state as well
    setProject(currentProject);

    try {
      const inputData = {
        project_master_data: currentProject.masterData,
        office_data: {
          name: office.name,
          legal: office.officeLegalIdentity,
          fee_config: {
            method: office.feeMethod,
            value: office.feeValue,
            base_construction_cost: office.baseConstructionCost
          }
        },
        document_request: {
          type: docType,
          technicalType: currentProject.technical?.config?.type || MemoriaDescritivaType.LICENSING
        },
        studio_style_profile: office.styleProfile,
        style_confidence: office.styleConfidenceScore,
        legal_compliance: {
          risk_level: project.legalRiskLevel || 'high',
          mandatory_blocks: getLegalBlocksForDocument(docType || 'Proposta')
        }
      };

      const response = await fetch("https://hook.eu1.make.com/436eqlnlgltufn25qyy38g8wj6vu9mtk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-make-apikey": "02becc30-b5bd-4965-bd06-f7660a60151a",
        },
        body: JSON.stringify({
          tipo_documento: docType,
          system_instruction: SYSTEM_PROMPT,
          office_info: {
            name: office.name,
            legal: office.officeLegalIdentity,
            fee_config: {
              method: office.feeMethod,
              value: office.feeValue,
              base_construction_cost: office.baseConstructionCost
            }
          },
          client_info: project.base.client,
          project_data: {
            name: project.name,
            base: project.base,
            operational: project.operational,
            commercial: project.commercial,
            technical: project.technical,
            legal: project.legal,
            master_data: currentProject.masterData,
            financial_model: currentProject.financialModel
          },
          input_data: inputData
        }),
      });

      if (!response.ok) {
        const textError = await response.text();
        throw new Error(`Erro na comunicação com o Make.com (${response.status}): ${textError}`);
      }

      const text = await response.text();

      if (text && text.trim().length > 0) {
        setGeneratedDoc(text);
        setStep(5); // Mostrar resultado
      } else {
        throw new Error("O Make.com não devolveu nenhum conteúdo para o documento.");
      }
    } catch (err: any) {
      console.error("Webhook Generation Error:", err);
      setError(err.message || "Ocorreu um erro ao gerar o documento via webhook.");
    } finally {
      setLoading(false);
    }
  }, [project, office, docType, step]);

  const copyToClipboard = () => {
    if (generatedDoc) {
      navigator.clipboard.writeText(generatedDoc);
    }
  };

  const downloadTxt = () => {
    if (!generatedDoc) return;
    const blob = new Blob([generatedDoc], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `${docType.replace(/\//g, '-')}_${project.name || 'documento'}.txt`);
  };

  const downloadDocx = async () => {
    if (!generatedDoc) return;
    
    const doc = new Document({
      sections: [{
        properties: {},
        children: generatedDoc.split('\n').map(line => {
          return new Paragraph({
            children: [
              new TextRun({
                text: line,
                font: "Times New Roman",
                size: 24, // 12pt
              }),
            ],
          });
        }),
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${docType.replace(/\//g, '-')}_${project.name || 'documento'}.docx`);
  };

  const downloadPdf = () => {
    if (!generatedDoc) return;
    
    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.width;
    const lines = doc.splitTextToSize(generatedDoc, pageWidth - margin * 2);
    
    doc.text(lines, margin, margin);
    doc.save(`${docType.replace(/\//g, '-')}_${project.name || 'documento'}.pdf`);
  };

  const reset = () => {
    localStorage.removeItem('arqdoc_project');
    localStorage.removeItem('arqdoc_step');
    window.location.reload();
  };

  const recalculateFinancialModel = () => {
    const model = calculateFinancialModel(project, office);
    setProject(prev => ({
      ...prev,
      financialModel: model
    }));
  };

  return (
    <div className="min-h-screen bg-canvas text-text-primary font-sans selection:bg-border-main flex transition-colors duration-300">
      {view !== 'editor' && <Sidebar currentView={view} onNavigate={navigateTo} />}
      
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {view === 'editor' ? (
          <>
            {/* Editor Navbar */}
            <nav className="border-b border-border-main px-6 py-4 flex justify-between items-center bg-surface sticky top-0 z-50">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => navigateTo('dashboard')}
                  className="p-2 hover:bg-surface-secondary text-text-secondary hover:text-accent rounded-lg transition-all border border-transparent hover:border-border-main"
                  title="Voltar ao Dashboard"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-accent text-canvas flex items-center justify-center rounded-sm font-bold tracking-tighter cursor-pointer" onClick={reset}>
                    AD
                  </div>
                  <span className="font-semibold tracking-tight text-lg cursor-pointer" onClick={reset}>ArqDoc</span>
                </div>
              </div>
              <div className="flex gap-6 text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em]">
                {isEditingGlobalOffice ? (
                  <span className="text-accent flex items-center gap-2">
                    <Settings2 className="w-3 h-3" /> Definições Globais do Gabinete
                  </span>
                ) : (
                  <>
                    <span className={step === 1 ? "text-text-primary" : ""}>01 Cliente</span>
                    <span className={step === 9 ? "text-text-primary" : ""}>02 Questionário</span>
                    <span className={step === 2 ? "text-text-primary" : ""}>03 Gabinete</span>
                    <span className={step === 3 ? "text-text-primary" : ""}>04 Documentos</span>
                  </>
                )}
              </div>
            </nav>

            <main className="max-w-6xl mx-auto px-6 py-12 flex flex-col pointer-events-auto w-full">
              <div className="flex flex-col lg:flex-row gap-12 items-start w-full">
          {/* Main Content Area */}
          <div className="flex-1 min-w-0 w-full max-w-4xl mx-auto lg:mx-0">
            <AnimatePresence mode="wait">
              {showLegalIdentity ? (
                <motion.div
                  key="legal-identity"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="space-y-2">
                    <button 
                      onClick={() => setShowLegalIdentity(false)}
                      className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors text-[10px] font-bold uppercase tracking-widest mb-4"
                    >
                      <ChevronLeft className="w-3 h-3" /> Voltar à Configuração
                    </button>
                    <h2 className="text-4xl font-light tracking-tight text-text-primary font-display">Identificação Profissional</h2>
                    <p className="text-text-secondary text-lg">Dados obrigatórios para a geração do Termo de Responsabilidade e outros documentos legais.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-text-secondary">Nome completo do arquiteto responsável</label>
                        <input 
                          type="text" 
                          value={office.officeLegalIdentity?.architectName || ''}
                          onChange={e => setOffice({
                            ...office, 
                            officeLegalIdentity: { ...office.officeLegalIdentity!, architectName: e.target.value }
                          })}
                          className="w-full px-4 py-3 bg-[var(--surface-bg)] text-[var(--text-color)] border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--text-color)] transition-all"
                          placeholder="Nome conforme Ordem dos Arquitetos"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-text-secondary">Nº de cédula da OA</label>
                          <input 
                            type="text" 
                            value={office.officeLegalIdentity?.architectRegNumber || ''}
                            onChange={e => setOffice({
                              ...office, 
                              officeLegalIdentity: { ...office.officeLegalIdentity!, architectRegNumber: e.target.value }
                            })}
                            className="w-full px-4 py-3 bg-[var(--surface-bg)] text-[var(--text-color)] border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--text-color)] transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-text-secondary">NIF profissional</label>
                          <input 
                            type="text" 
                            value={office.officeLegalIdentity?.taxId || ''}
                            onChange={e => setOffice({
                              ...office, 
                              officeLegalIdentity: { ...office.officeLegalIdentity!, taxId: e.target.value }
                            })}
                            className="w-full px-4 py-3 bg-[var(--surface-bg)] text-[var(--text-color)] border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--text-color)] transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-text-secondary">Morada profissional</label>
                        <input 
                          type="text" 
                          value={office.officeLegalIdentity?.address || ''}
                          onChange={e => setOffice({
                            ...office, 
                            officeLegalIdentity: { ...office.officeLegalIdentity!, address: e.target.value }
                          })}
                          className="w-full px-4 py-3 bg-[var(--surface-bg)] text-[var(--text-color)] border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--text-color)] transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-text-secondary">Email profissional</label>
                        <input 
                          type="email" 
                          value={office.officeLegalIdentity?.email || ''}
                          onChange={e => setOffice({
                            ...office, 
                            officeLegalIdentity: { ...office.officeLegalIdentity!, email: e.target.value }
                          })}
                          className="w-full px-4 py-3 bg-surface border border-border-main rounded-md focus:outline-none focus:ring-1 focus:ring-accent transition-all text-text-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-text-secondary">Telefone</label>
                        <input 
                          type="tel" 
                          value={office.officeLegalIdentity?.phone || ''}
                          onChange={e => setOffice({
                            ...office, 
                            officeLegalIdentity: { ...office.officeLegalIdentity!, phone: e.target.value }
                          })}
                          className="w-full px-4 py-3 bg-surface border border-border-main rounded-md focus:outline-none focus:ring-1 focus:ring-accent transition-all text-text-primary"
                        />
                      </div>

                      <div className="space-y-4 pt-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Tipo de assinatura</label>
                        <div className="grid grid-cols-1 gap-3">
                          {['Assinatura digital qualificada', 'Assinatura manual'].map(type => (
                            <button
                              key={type}
                              onClick={() => setOffice({
                                ...office, 
                                officeLegalIdentity: { ...office.officeLegalIdentity!, signatureType: type as any }
                              })}
                              className={`flex items-center gap-3 p-4 border rounded-md text-left text-sm transition-all ${
                                office.officeLegalIdentity?.signatureType === type 
                                  ? "bg-accent text-canvas border-accent" 
                                  : "bg-surface text-text-primary border-border-main hover:border-text-secondary"
                              }`}
                            >
                              {office.officeLegalIdentity?.signatureType === type ? <CheckCircle2 className="w-4 h-4 text-canvas" /> : <div className="w-4 h-4 border border-border-main rounded-sm" />}
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-border-main flex justify-end">
                    <button 
                      onClick={() => setShowLegalIdentity(false)}
                      className="bg-accent text-canvas px-10 py-3 rounded-md hover:opacity-90 transition-all font-bold"
                    >
                      Guardar e Voltar
                    </button>
                  </div>
                </motion.div>
              ) : step === 1 ? (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h1 className="text-4xl lg:text-5xl font-light tracking-tight text-[var(--text-color)] font-display">Dados do Cliente e Projeto</h1>
                      <p className="text-gray-500 text-lg">Identifique o titular e as características fundamentais da intervenção.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <button 
                          onClick={() => setShowTemplates(!showTemplates)}
                          className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-text-primary hover:bg-surface-secondary rounded-md transition-colors border border-gray-200"
                        >
                          <Bookmark className="w-3 h-3" />
                          Templates
                        </button>

                        <AnimatePresence>
                          {showTemplates && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="absolute right-0 mt-2 w-72 bg-surface border border-border-main rounded-xl shadow-2xl z-50 p-4"
                            >
                              <div className="flex justify-between items-center mb-4 pb-2 border-b border-border-main">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Os Seus Templates</span>
                                <button onClick={() => setShowTemplates(false)}><X className="w-4 h-4 text-text-secondary hover:text-text-primary transition-colors" /></button>
                              </div>
                              
                              <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                                {savedTemplates.length === 0 ? (
                                  <p className="text-xs text-text-secondary italic text-center py-4">Nenhum template guardado.</p>
                                ) : (
                                  savedTemplates.map(template => (
                                    <div key={template.id} className="group flex items-center justify-between p-3 rounded-lg hover:bg-accent/5 transition-colors border border-transparent hover:border-border-main">
                                      <button 
                                        onClick={() => loadTemplate(template)}
                                        className="flex-1 text-left"
                                      >
                                        <p className="text-xs font-bold text-text-primary">{template.name}</p>
                                        <p className="text-[9px] text-text-secondary">{new Date(template.createdAt).toLocaleDateString('pt-PT')}</p>
                                      </button>
                                      <button 
                                        onClick={() => deleteTemplate(template.id)}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 text-text-secondary hover:text-red-500 transition-all"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))
                                )}
                              </div>

                              {isSavingTemplate ? (
                                <div className="space-y-2 p-1">
                                  <input 
                                    type="text"
                                    placeholder="Nome do Template..."
                                    value={templateName}
                                    onChange={e => setTemplateName(e.target.value)}
                                    autoFocus
                                    className="w-full px-3 py-2 text-xs border border-border-main bg-surface rounded-md focus:outline-none focus:ring-1 focus:ring-accent text-text-primary"
                                  />
                                  <div className="flex gap-2">
                                    <button 
                                      onClick={saveCurrentAsTemplate}
                                      className="flex-1 py-2 bg-accent text-canvas rounded-md text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all"
                                    >
                                      Confirmar
                                    </button>
                                    <button 
                                      onClick={() => setIsSavingTemplate(false)}
                                      className="flex-1 py-2 bg-surface text-text-secondary border border-border-main rounded-md text-[10px] font-bold uppercase tracking-widest hover:bg-border-main transition-colors"
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button 
                                  onClick={() => setIsSavingTemplate(true)}
                                  className="w-full py-2.5 bg-accent text-canvas rounded-lg text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2"
                                >
                                  <Plus className="w-3 h-3" />
                                  Guardar como Template
                                </button>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>


                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-text-secondary flex items-center gap-1">
                          Identificação do Projeto (Interno)
                          <span title="O que for escrito neste campo será usado como nome dos documentos juntamente com o nome dos documentos quando transferido." className="cursor-help">
                            <Info className="w-3.5 h-3.5 text-text-secondary/50" />
                          </span>
                        </label>
                        <div className="relative">
                          <Bookmark className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/50" />
                          <input 
                            type="text" 
                            value={project.name || ''}
                            onChange={e => {
                              const val = e.target.value;
                              setProject(prev => ({
                                ...prev,
                                name: val,
                                base: { ...prev.base, projectName: val }
                              }));
                            }}
                            className="w-full pl-10 pr-4 py-3 bg-surface border border-border-main rounded-md focus:outline-none focus:ring-1 focus:ring-accent transition-all text-text-primary placeholder:text-text-secondary/50"
                            placeholder="Ex: Moradia T3 Tavira"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-text-secondary">Localização Base</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/50" />
                          <input 
                            type="text" 
                            value={project.location || ''}
                            onChange={e => {
                              const val = e.target.value;
                              setProject(prev => ({
                                ...prev,
                                location: val,
                                base: { ...prev.base, location: { ...prev.base.location, address: val } }
                              }));
                            }}
                            className="w-full pl-10 pr-4 py-3 bg-surface border border-border-main rounded-md focus:outline-none focus:ring-1 focus:ring-accent transition-all text-text-primary placeholder:text-text-secondary/50"
                            placeholder="Ex: Tavira, Portugal"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="p-6 bg-surface-secondary rounded-xl border border-border-main">
                          <h3 className="text-sm font-bold uppercase tracking-widest text-text-secondary mb-4">Progresso do Ciclo de Projeto</h3>
                          <div className="space-y-3">
                            {[
                                { label: 'Dados Base', level: 'base' as const, icon: Building2 },
                                { label: 'Configuração Operacional', level: 'operational' as const, icon: Settings2 },
                                { label: 'Dados Comerciais', level: 'commercial' as const, icon: Euro },
                                { label: 'Dados Técnicos', level: 'technical' as const, icon: FileText },
                                { label: 'Dados Legais', level: 'legal' as const, icon: FileBadge }
                            ].map((item, idx) => {
                                const Icon = item.icon;
                                const status = (project as any)[item.level].status;
                                return (
                                    <button 
                                      key={idx} 
                                      onClick={() => {
                                        setStep(9);
                                        setActiveLevel(item.level);
                                        setFormStep(0);
                                        setReturnToStep(1);
                                      }}
                                      className="flex items-center justify-between w-full p-2 -mx-2 rounded-lg hover:bg-accent/5 transition-colors text-left"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon className={`w-4 h-4 ${status === ProjectLevelStatus.COMPLETED ? 'text-green-600' : 'text-text-secondary'}`} />
                                            <span className="text-sm font-medium text-text-primary">{item.label}</span>
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${
                                            status === ProjectLevelStatus.COMPLETED ? 'text-green-600' : 
                                            status === ProjectLevelStatus.PARTIAL ? 'text-amber-500' : 'text-text-secondary/50'
                                        }`}>
                                            {status}
                                        </span>
                                    </button>
                                )
                            })}
                          </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-border-main flex justify-end">
                    <button 
                      onClick={() => {
                        // User request: Don't force NÍVEL 1 (BaseData) after project identification. 
                        // Only asked when estimators are generated.
                        setStep(2);
                      }}
                      disabled={!project.name}
                      className="flex items-center gap-2 bg-accent text-canvas px-8 py-3 rounded-md hover:opacity-90 transition-all disabled:opacity-30"
                    >
                      Configuração do Gabinete <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ) : step === 9 ? (
                <motion.div 
                  key="step9"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                          {activeLevel === 'base' && "NÍVEL 1 — DADOS BASE DO PROJETO"}
                          {activeLevel === 'operational' && "NÍVEL 2 — CONFIGURAÇÃO OPERACIONAL"}
                          {activeLevel === 'commercial' && "NÍVEL 3 — DADOS COMERCIAIS"}
                          {activeLevel === 'technical' && "NÍVEL 4 — DADOS TÉCNICOS"}
                          {activeLevel === 'legal' && "NÍVEL 5 — DADOS LEGAIS"}
                        </div>
                        <h2 className="text-3xl font-light tracking-tight text-text-primary font-display">
                          {activeLevel === 'base' && [
                            "Qual o tipo de intervenção?",
                            "Qual o principal objetivo deste projeto?",
                            "Onde se localiza o projeto?",
                            "Qual a situação do imóvel/terreno?",
                            "Em que fase se encontra atualmente o processo?",
                            "Qual a área e programa pretendidos?",
                            "Existem características especiais?",
                            "Qual a topografia do terreno?",
                            "Quais os objetivos financeiros?",
                            "Qual a documentação disponível?"
                          ][formStep]}

                          {activeLevel === 'operational' && [
                            "Fases Contratuais do Projeto",
                            "Serviços Complementares",
                            "Sistema de Entregáveis (Automático)",
                            "Complexidade e Exigência",
                            "Modelo de Construção e Coordenação",
                            "Perfil do Cliente e Documentação"
                          ][formStep]}
                          
                          {activeLevel === 'commercial' && [
                            "Resumo Comercial do Âmbito (Leitura)",
                            "Qual o modelo de honorários para este projeto?",
                            "Definição de parâmetros e valores dos honorários",
                            "Que despesas e serviços ficam exclusivamente excluídos?",
                            "Qual a estrutura e modalidade de pagamentos?",
                            "Como será o faseamento das percentagens de pagamento?",
                            "Política de Revisões e Gestão de Alterações",
                            "Cláusulas de Suspensão de Serviços",
                            "Validade da Proposta e Assinatura",
                            "Observações Finais e Notas Comerciais"
                          ][formStep]}

                          {activeLevel === 'technical' && [
                            "Implantação do Edifício",
                            "Qual a principal orientação solar pretendida para as áreas sociais?",
                            "Organização Funcional",
                            "Que espaços adicionais pretende incluir?",
                            "Qual a prioridade do projeto?",
                            "Qual o nível de integração pretendido entre espaços interiores e exteriores?",
                            "Linguagem Arquitetónica",
                            "Sistemas Construtivos",
                            "Qual o nível de desempenho construtivo pretendido?",
                            "Eficiência Energética",
                            "Infraestruturas",
                            "Acessibilidades",
                            "Segurança Contra Incêndio",
                            "Integração Paisagística",
                            "Condicionantes Técnicas"
                          ][formStep]}

                          {activeLevel === 'legal' && [
                            "Enquadramento Legal & Procedimento",
                            "Identificação Predial do Imóvel",
                            "Titularidade e Qualidade do Requerente",
                            "Regime Legal Aplicável",
                            "Declarações de Conformidade Técnica",
                            "Seguro de Responsabilidade Civil",
                            "Validade da Apólice de Seguro",
                            "Elementos Entregues no processo"
                          ][formStep]}
                        </h2>
                      </div>
                    </div>
                    
                        {(() => {
                        let totalSteps = 1;
                        if (activeLevel === 'base') totalSteps = 10;
                        else if (activeLevel === 'operational') totalSteps = 6;
                        else if (activeLevel === 'commercial') totalSteps = 10;
                        else if (activeLevel === 'technical') totalSteps = 15;
                        else if (activeLevel === 'legal') totalSteps = 8;
                        
                        const progress = ((formStep + 1) / totalSteps) * 100;
                        return (
                          <motion.div 
                            className="bg-accent h-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                          />
                        );
                      })()}
                    </div>

                  <div className="py-8 min-h-[400px]">
                    {activeLevel === 'base' && (
                      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {formStep === 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {[
                              'Construção nova', 'Ampliação', 'Remodelação', 
                              'Reabilitação', 'Legalização', 'Alteração', 
                              'Loteamento', 'Comércio/Serviços', 'Turismo'
                            ].map(opt => (
                              <button
                                key={opt}
                                onClick={() => setProject(prev => {
                                  let typology: ProjectTypology = 'Housing';
                                  if (opt === 'Loteamento') typology = 'Loteamento';
                                  else if (opt === 'Turismo') typology = 'Tourism';
                                  else if (opt === 'Comércio/Serviços') typology = 'Commerce';
                                  
                                  return { 
                                    ...prev, 
                                    base: { ...prev.base, interventionType: opt as any },
                                    technical: { ...prev.technical, typology }
                                  };
                                })}
                                className={`p-6 border rounded-xl text-left transition-all ${
                                  project.base.interventionType === opt ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main hover:border-text-secondary"
                                }`}
                              >
                                <span className="font-bold text-sm block">{opt}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {formStep === 1 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {[
                              'Habitação própria', 'Investimento', 'Revenda', 
                              'Arrendamento', 'Turismo / alojamento local', 
                              'Valorização patrimonial', 'Regularização / legalização', 
                              'Ampliação de imóvel existente', 'Outro'
                            ].map(opt => (
                              <button
                                key={opt}
                                onClick={() => setProject(prev => ({ ...prev, base: { ...prev.base, mainGoal: opt } }))}
                                className={`p-6 border rounded-xl text-left transition-all ${
                                  project.base.mainGoal === opt ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main hover:border-text-secondary"
                                }`}
                              >
                                <span className="font-bold text-sm block">{opt}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {formStep === 2 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Concelho</label>
                              <select 
                                value={project.base.location.municipality}
                                onChange={e => setProject(prev => ({ ...prev, base: { ...prev.base, location: { ...prev.base.location, municipality: e.target.value } } }))}
                                className="w-full px-4 py-3 bg-surface border border-border-main rounded-md focus:outline-none focus:ring-1 focus:ring-accent transition-all text-text-primary"
                              >
                                {['Tavira', 'Loulé', 'Faro', 'Olhão', 'Vila Real de Sto António', 'Castro Marim', 'Alcoutim', 'São Brás'].map(m => (
                                  <option key={m} value={m}>{m}</option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-4">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Freguesia</label>
                              <input 
                                type="text" 
                                value={project.base.location.parish || ''}
                                onChange={e => setProject(prev => ({ ...prev, base: { ...prev.base, location: { ...prev.base.location, parish: e.target.value } } }))}
                                className="w-full px-4 py-3 bg-surface border border-border-main rounded-md focus:outline-none focus:ring-1 focus:ring-accent transition-all text-text-primary"
                                placeholder="Freguesia..."
                              />
                            </div>
                            <div className="space-y-4 md:col-span-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Morada do terreno (opcional)</label>
                              <input 
                                type="text" 
                                value={project.base.location.address || ''}
                                onChange={e => setProject(prev => ({ ...prev, base: { ...prev.base, location: { ...prev.base.location, address: e.target.value } } }))}
                                className="w-full px-4 py-3 bg-surface border border-border-main rounded-md focus:outline-none focus:ring-1 focus:ring-accent transition-all text-text-primary"
                                placeholder="Rua, Lote, Urbanização..."
                              />
                            </div>
                          </div>
                        )}

                        {formStep === 3 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {[
                              'Lote urbano aprovado', 'Terreno urbano', 'Terreno rústico',
                              'Moradia existente', 'Apartamento', 'Edifício existente', 'Não sei'
                            ].map(opt => (
                              <button
                                key={opt}
                                onClick={() => setProject(prev => {
                                  let typology = prev.technical.typology;
                                  if (opt === 'Apartamento') typology = 'Multifamily';
                                  else if (prev.base.interventionType === 'Construção nova' || prev.base.interventionType === 'Ampliação') {
                                    // Keep current unless it's a specific switch
                                  }

                                  return { 
                                    ...prev, 
                                    base: { ...prev.base, propertySituation: opt as any },
                                    technical: { ...prev.technical, typology }
                                  };
                                })}
                                className={`p-6 border rounded-xl text-left transition-all ${
                                  project.base.propertySituation === opt ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main hover:border-text-secondary"
                                }`}
                              >
                                <span className="font-bold text-sm block">{opt}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {formStep === 4 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {[
                              'Apenas intenção de projeto', 'Em análise de viabilidade', 
                              'Terreno/imóvel em aquisição', 'Já existe estudo anterior', 
                              'Já existe projeto desenvolvido', 'Processo camarário em curso', 
                              'Processo indeferido anteriormente', 'Obra iniciada', 
                              'Obra suspensa', 'Outro'
                            ].map(opt => (
                              <button
                                key={opt}
                                onClick={() => setProject(prev => ({ ...prev, base: { ...prev.base, currentProcessPhase: opt } }))}
                                className={`p-6 border rounded-xl text-left transition-all ${
                                  project.base.currentProcessPhase === opt ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main hover:border-text-secondary"
                                }`}
                              >
                                <span className="font-bold text-sm block">{opt}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {formStep === 5 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Área aproximada pretendida (m²)</label>
                              <input 
                                type="number" 
                                value={project.base.preferredArea?.areaM2 || ''}
                                onChange={e => setProject(prev => ({ ...prev, base: { ...prev.base, preferredArea: { ...prev.base.preferredArea, areaM2: Number(e.target.value) } } }))}
                                className="w-full px-4 py-3 bg-surface border border-border-main rounded-md focus:outline-none focus:ring-1 focus:ring-accent transition-all text-text-primary"
                                placeholder="Ex: 200"
                              />
                            </div>
                            <div className="space-y-4">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Tipologia</label>
                              <select 
                                value={project.base.preferredArea.typology}
                                onChange={e => setProject(prev => ({ ...prev, base: { ...prev.base, preferredArea: { ...prev.base.preferredArea, typology: e.target.value } } }))}
                                className="w-full px-4 py-3 bg-surface border border-border-main rounded-md focus:outline-none focus:ring-1 focus:ring-accent transition-all text-text-primary"
                              >
                                {['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'Multifamiliar', 'Comércio', 'Serviços', 'Turismo', 'Outro'].map(t => (
                                  <option key={t} value={t} className="bg-surface text-text-primary">{t}</option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-4">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Nº de pisos</label>
                              <input 
                                type="number" 
                                value={project.base.preferredArea.floors || ''}
                                onChange={e => setProject(prev => ({ ...prev, base: { ...prev.base, preferredArea: { ...prev.base.preferredArea, floors: Number(e.target.value) } } }))}
                                className="w-full px-4 py-3 bg-surface border border-border-main rounded-md focus:outline-none focus:ring-1 focus:ring-accent transition-all text-text-primary"
                                placeholder="Ex: 2"
                              />
                            </div>
                          </div>
                        )}

                        {formStep === 6 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                              { label: 'Piscina', key: 'pool', hideFor: ['Multifamily'] },
                              { label: 'Cave', key: 'basement' },
                              { label: 'Garagem', key: 'garage' },
                              { label: 'Cobertura plana', key: 'flatRoof' },
                              { label: 'Grandes vãos envidraçados', key: 'largeGlazing' },
                              { label: 'Turismo alojamento local', key: 'tourismAL' },
                              { label: 'Elevada eficiência energética', key: 'energyEfficiency' },
                            ].filter(item => !item.hideFor || !item.hideFor.includes(project.technical.typology)).map(item => (
                              <button
                                key={item.key}
                                onClick={() => setProject(prev => ({ 
                                  ...prev, 
                                  base: { 
                                    ...prev.base, 
                                    features: { 
                                      ...prev.base.features, 
                                      [item.key]: !(prev.base.features as any)[item.key] 
                                    } 
                                  } 
                                }))}
                                className={`p-6 border rounded-xl text-left transition-all flex items-center justify-between ${
                                  (project.base.features as any)[item.key] ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main hover:border-text-secondary"
                                }`}
                              >
                                <span className="font-bold text-sm block">{item.label}</span>
                                {(project.base.features as any)[item.key] ? <CheckSquare className="w-4 h-4 text-canvas" /> : <Square className="w-4 h-4 text-text-secondary/30" />}
                              </button>
                            ))}
                          </div>
                        )}

                        {formStep === 7 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {[
                              'Topografia plana', 'Inclinação moderada', 'Inclinação acentuada', 'Não sei'
                            ].map(opt => (
                              <button
                                key={opt}
                                onClick={() => setProject(prev => ({ ...prev, base: { ...prev.base, topography: opt as any } }))}
                                className={`p-6 border rounded-xl text-left transition-all ${
                                  project.base.topography === opt ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main hover:border-text-secondary"
                                }`}
                              >
                                <span className="font-bold text-sm block">{opt}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {formStep === 8 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Qual o orçamento previsto para o investimento?</label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">€</span>
                                <input 
                                  type="number" 
                                  value={project.base.financialGoals.predictedBudget || ''}
                                  onChange={e => setProject(prev => ({ ...prev, base: { ...prev.base, financialGoals: { ...prev.base.financialGoals, predictedBudget: Number(e.target.value) } } }))}
                                  className="w-full pl-8 pr-4 py-3 bg-surface border border-border-main rounded-md focus:outline-none focus:ring-1 focus:ring-accent transition-all text-text-primary"
                                  placeholder="0.00"
                                />
                              </div>
                            </div>
                            <div className="space-y-4">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Existe um limite máximo de investimento?</label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">€</span>
                                <input 
                                  type="number" 
                                  value={project.base.financialGoals.maxInvestmentLimit || ''}
                                  onChange={e => setProject(prev => ({ ...prev, base: { ...prev.base, financialGoals: { ...prev.base.financialGoals, maxInvestmentLimit: Number(e.target.value) } } }))}
                                  className="w-full pl-8 pr-4 py-3 bg-surface border border-border-main rounded-md focus:outline-none focus:ring-1 focus:ring-accent transition-all text-text-primary"
                                  placeholder="Opcional"
                                />
                              </div>
                            </div>
                            <div className="space-y-4 md:col-span-2">
                              <button
                                onClick={() => setProject(prev => ({ 
                                  ...prev, 
                                  base: { 
                                    ...prev.base, 
                                    financialGoals: { 
                                      ...prev.base.financialGoals, 
                                      bankFinancing: !prev.base.financialGoals.bankFinancing 
                                    } 
                                  } 
                                }))}
                                className={`w-full p-6 border rounded-xl text-left transition-all flex items-center justify-between ${
                                  project.base.financialGoals.bankFinancing ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main hover:border-text-secondary"
                                }`}
                              >
                                <span className="font-bold text-sm block">Existe financiamento bancário previsto?</span>
                                {project.base.financialGoals.bankFinancing ? <CheckSquare className="w-4 h-4 text-canvas" /> : <Square className="w-4 h-4 text-text-secondary/30" />}
                              </button>
                            </div>
                          </div>
                        )}

                        {formStep === 9 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                              { label: 'Caderneta predial', key: 'cadernetaPredial' },
                              { label: 'Levantamento topográfico', key: 'levantamentoTopografico' },
                              { label: 'Planta de loteamento', key: 'plantaLoteamento' },
                              { label: 'Fotografias', key: 'photos' },
                              { label: 'Projeto anterior', key: 'previousProject' },
                              { label: 'Nenhum documento', key: 'none' },
                            ].map(item => (
                              <button
                                key={item.key}
                                onClick={() => setProject(prev => ({ 
                                  ...prev, 
                                  base: { 
                                    ...prev.base, 
                                    documentation: { 
                                      ...prev.base.documentation, 
                                      [item.key]: !(prev.base.documentation as any)[item.key] 
                                    } 
                                  } 
                                }))}
                                className={`p-6 border rounded-xl text-left transition-all flex items-center justify-between ${
                                  (project.base.documentation as any)[item.key] ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main hover:border-text-secondary"
                                }`}
                              >
                                <span className="font-bold text-sm block">{item.label}</span>
                                {(project.base.documentation as any)[item.key] ? <CheckSquare className="w-4 h-4 text-canvas" /> : <Square className="w-4 h-4 text-text-secondary/30" />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {activeLevel === 'operational' && (
                      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {formStep === 0 && (
                          <div className="space-y-6">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Fases Contratuais do Projeto</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              {[
                                { id: 'Programa Base', label: 'Programa Base' },
                                { id: 'Estudo Prévio', label: 'Estudo Prévio' },
                                { id: 'Licenciamento', label: 'Licenciamento' },
                                { id: 'Projeto de Execução', label: 'Projeto de Execução' },
                                { id: 'Contratação', label: 'Contratação' },
                                { id: 'Assistência Técnica', label: 'Assistência Técnica' }
                              ].map(opt => (
                                <button
                                  key={opt.id}
                                  onClick={() => toggleProjectMulti('operational', 'contractedPhases', opt.id)}
                                  className={`p-6 border rounded-xl text-left transition-all flex items-center justify-between ${
                                    project.operational.contractedPhases.includes(opt.id) ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main hover:border-text-secondary"
                                  }`}
                                >
                                  <span className="font-bold text-sm block">{opt.label}</span>
                                  {project.operational.contractedPhases.includes(opt.id) ? <CheckSquare className="w-4 h-4 text-canvas" /> : <Square className="w-4 h-4 text-text-secondary/30" />}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {formStep === 1 && (
                          <div className="space-y-6">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Serviços Complementares (Scope Add-ons)</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                              {[
                                'Modelação BIM', 'Imagens 3D', 'Design de Interiores', 'Paisagismo', 
                                'Fiscalização', 'Coordenação de Segurança', 'Consultoria Energética', 'Apoio à escolha de empreiteiro'
                              ].map(opt => (
                                <button
                                  key={opt}
                                  onClick={() => toggleProjectMulti('operational', 'complementaryServices', opt)}
                                  className={`p-6 border rounded-xl text-left transition-all flex items-center justify-between ${
                                    project.operational.complementaryServices?.includes(opt) ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main hover:border-text-secondary"
                                  }`}
                                >
                                  <span className="font-bold text-[11px] block">{opt}</span>
                                  {project.operational.complementaryServices?.includes(opt) ? <CheckSquare className="w-4 h-4 text-canvas" /> : <Square className="w-4 h-4 text-text-secondary/30" />}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {formStep === 2 && (
                          <div className="space-y-6">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Sistema de Entregáveis (Geração Automática)</label>
                              <span className="bg-accent/10 px-2 py-0.5 rounded text-[9px] font-bold text-accent">SISTEMA DINÂMICO</span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {/* Group: Licensing Outputs */}
                              {project.operational.contractedPhases.includes('Licenciamento') && (
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2 text-[10px] font-bold text-text-primary uppercase tracking-wider">
                                    <div className="w-1.5 h-1.5 rounded-full bg-accent" /> Entregáveis de Licenciamento
                                  </div>
                                  <div className="bg-surface border border-border-main rounded-xl p-4 space-y-2">
                                    {['Peças desenhadas (Plantas, Cortes, Alçados)', 'Memória descritiva (RJUE)', 'Termos de Responsabilidade', 'Quadros regulamentares'].map(doc => (
                                      <div key={doc} className="flex items-center gap-2 text-xs text-text-secondary">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-accent" /> {doc}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Group: Execution Outputs */}
                              {project.operational.contractedPhases.includes('Projeto de Execução') && (
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2 text-[10px] font-bold text-text-primary uppercase tracking-wider">
                                    <div className="w-1.5 h-1.5 rounded-full bg-accent" /> Entregáveis de Execução
                                  </div>
                                  <div className="bg-surface border border-border-main rounded-xl p-4 space-y-2">
                                    {['Pormenores construtivos (1:20/1:5/1:2)', 'Mapa de quantidades e medições', 'Caderno de encargos', 'Mapa de Acabamentos'].map(doc => (
                                      <div key={doc} className="flex items-center gap-2 text-xs text-text-secondary">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-accent" /> {doc}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Group: Phase specific outputs */}
                              {['Programa Base', 'Estudo Prévio', 'Contratação', 'Assistência Técnica'].filter(p => project.operational.contractedPhases.includes(p)).map(phase => (
                                <div key={phase} className="space-y-3">
                                  <div className="flex items-center gap-2 text-[10px] font-bold text-text-primary uppercase tracking-wider">
                                    <div className="w-1.5 h-1.5 rounded-full bg-accent" /> Entregáveis: {phase}
                                  </div>
                                  <div className="bg-surface border border-border-main rounded-xl p-4 space-y-2">
                                    {phase === 'Programa Base' && ['Relatório de base', 'Definição de objetivos'].map(doc => <div key={doc} className="flex items-center gap-2 text-xs text-text-secondary"><CheckCircle2 className="w-3.5 h-3.5 text-accent" /> {doc}</div>)}
                                    {phase === 'Estudo Prévio' && ['Plantas gerais', 'Conceito volumétrico', 'Maquete/Esboços'].map(doc => <div key={doc} className="flex items-center gap-2 text-xs text-text-secondary"><CheckCircle2 className="w-3.5 h-3.5 text-accent" /> {doc}</div>)}
                                    {phase === 'Contratação' && ['Análise de propostas de obra', 'Relatório de adjudicação'].map(doc => <div key={doc} className="flex items-center gap-2 text-xs text-text-secondary"><CheckCircle2 className="w-3.5 h-3.5 text-accent" /> {doc}</div>)}
                                    {phase === 'Assistência Técnica' && ['Relatórios de visita de obra', 'Esclarecimentos técnicos'].map(doc => <div key={doc} className="flex items-center gap-2 text-xs text-text-secondary"><CheckCircle2 className="w-3.5 h-3.5 text-accent" /> {doc}</div>)}
                                  </div>
                                </div>
                              ))}

                              {/* Group: Complementary Services Outputs */}
                              {(project.operational.complementaryServices?.length || 0) > 0 && (
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2 text-[10px] font-bold text-text-primary uppercase tracking-wider">
                                    <div className="w-1.5 h-1.5 rounded-full bg-accent" /> Serviços Complementares
                                  </div>
                                  <div className="bg-surface border border-border-main rounded-xl p-4 space-y-2">
                                    {project.operational.complementaryServices?.map(serv => (
                                      <div key={serv} className="flex items-center gap-2 text-xs text-text-secondary">
                                        <Plus className="w-3.5 h-3.5 text-accent" /> Output: {serv}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {project.operational.contractedPhases.length === 0 && (project.operational.complementaryServices?.length || 0) === 0 && (
                              <div className="flex flex-col items-center justify-center p-20 border border-dashed border-border-main rounded-2xl bg-surface-secondary/30">
                                <Info className="w-8 h-8 text-text-secondary/20 mb-4" />
                                <p className="text-sm text-text-secondary font-medium">Selecione fases ou serviços para visualizar os entregáveis.</p>
                              </div>
                            )}
                          </div>
                        )}

                        {formStep === 3 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Complexidade Técnica</label>
                              <div className="grid grid-cols-1 gap-3">
                                {[
                                  { id: 'Simples', label: 'Simples', desc: 'Construção corrente, sem condicionantes.' },
                                  { id: 'Standard', label: 'Standard', desc: 'Projeto equilibrado com soluções standard.' },
                                  { id: 'Complexa', label: 'Complexa', desc: 'Estruturas desafiantes ou terreno difícil.' },
                                  { id: 'Muito Complexa', label: 'Muito Complexa', desc: 'Exigência máxima de engenharia e risco.' }
                                ].map(opt => (
                                  <button
                                    key={opt.id}
                                    onClick={() => updateProjectLevel('operational', { projectComplexity: opt.id as any })}
                                    className={`p-4 border rounded-xl text-left transition-all ${
                                      project.operational.projectComplexity === opt.id ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main hover:border-text-secondary"
                                    }`}
                                  >
                                    <span className="font-bold text-sm block">{opt.label}</span>
                                    <span className={`text-[10px] ${project.operational.projectComplexity === opt.id ? 'text-canvas/70' : 'text-text-secondary'}`}>{opt.desc}</span>
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-6">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Nível de Exigência do Projeto</label>
                              <div className="grid grid-cols-1 gap-3">
                                {[
                                  { id: 'Base', label: 'Base', desc: 'Foco na funcionalidade e custos controlados.' },
                                  { id: 'Médio', label: 'Médio', desc: 'Equilíbrio entre detalhe e economia.' },
                                  { id: 'Elevado', label: 'Elevado', desc: 'Nível de acabamento e detalhe superior.' },
                                  { id: 'Premium', label: 'Premium', desc: 'Exclusividade, detalhe minucioso e ativos de luxo.' }
                                ].map(opt => (
                                  <button
                                    key={opt.id}
                                    onClick={() => updateProjectLevel('operational', { projectExigency: opt.id as any })}
                                    className={`p-4 border rounded-xl text-left transition-all ${
                                      project.operational.projectExigency === opt.id ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main hover:border-text-secondary"
                                    }`}
                                  >
                                    <span className="font-bold text-sm block">{opt.label}</span>
                                    <span className={`text-[10px] ${project.operational.projectExigency === opt.id ? 'text-canvas/70' : 'text-text-secondary'}`}>{opt.desc}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {formStep === 4 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Modelo de Construção</label>
                              <div className="grid grid-cols-1 gap-3">
                                {[
                                  'Empreitada geral', 'Vários empreiteiros', 
                                  'Gestão direta', 'Administração direta', 'Indefinido'
                                ].map(opt => (
                                  <button
                                    key={opt}
                                    onClick={() => updateProjectLevel('operational', { constructionModel: opt })}
                                    className={`p-4 border rounded-xl text-left transition-all ${
                                      project.operational.constructionModel === opt ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main hover:border-text-secondary"
                                    }`}
                                  >
                                    <span className="font-bold text-sm block">{opt}</span>
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-6">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Coordenação e Prazos</label>
                              <div className="p-6 bg-surface-secondary/50 rounded-2xl border border-border-main space-y-6">
                                <div className="space-y-3">
                                  <p className="text-[11px] text-text-secondary font-bold uppercase tracking-wider">Coordenação Geral</p>
                                  <div className="flex gap-2">
                                    {['Sim', 'Não'].map(opt => (
                                      <button
                                        key={opt}
                                        onClick={() => updateProjectLevel('operational', { technicalCoordination: opt as any })}
                                        className={`flex-1 py-3 border rounded-xl font-bold text-sm transition-all ${
                                          project.operational.technicalCoordination === opt ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main hover:border-text-secondary"
                                        }`}
                                      >
                                        {opt}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <p className="text-[11px] text-text-secondary font-bold uppercase tracking-wider">Urgência e Prazo</p>
                                  <div className="grid grid-cols-3 gap-2">
                                    {[
                                      { id: 'Flexível', label: 'Flexível', icon: Clock },
                                      { id: 'Normal', label: 'Normal', icon: Timer },
                                      { id: 'Urgente', label: 'Urgente', icon: AlertCircle }
                                    ].map(opt => (
                                      <button
                                        key={opt.id}
                                        onClick={() => updateProjectLevel('operational', { deadlineType: opt.id as any })}
                                        className={`p-3 border rounded-xl text-center transition-all flex flex-col items-center gap-2 ${
                                          project.operational.deadlineType === opt.id ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main hover:border-text-secondary"
                                        }`}
                                      >
                                        <opt.icon className={`w-4 h-4 ${project.operational.deadlineType === opt.id ? 'text-canvas' : 'text-text-secondary'}`} />
                                        <span className="font-bold text-[10px] block">{opt.label}</span>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {formStep === 5 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Perfil do Cliente</label>
                              <div className="grid grid-cols-2 gap-3">
                                {['Particular', 'Promotor', 'Empresa', 'Investidor', 'Hotelaria', 'Público'].map(opt => (
                                  <button
                                    key={opt}
                                    onClick={() => updateProjectLevel('operational', { clientType: opt as any })}
                                    className={`p-4 border rounded-xl text-left transition-all ${
                                      project.operational.clientType === opt ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main hover:border-text-secondary"
                                    }`}
                                  >
                                    <span className="font-bold text-sm block">{opt}</span>
                                  </button>
                                ))}
                              </div>
                              {project.operational.clientType === 'Investidor' && (
                                <div className="p-4 bg-accent/5 border border-accent/10 rounded-xl flex gap-3 mt-4">
                                  <BarChart3 className="w-5 h-5 text-accent shrink-0" />
                                  <p className="text-[10px] text-text-secondary leading-normal">
                                    <strong className="text-accent uppercase block mb-1">Foco em Rentabilidade</strong>
                                    O sistema priorizará a lógica de otimização de áreas, eficiência de execução e retorno sobre o investimento nos documentos gerados.
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="space-y-6">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Doc. Disponível</label>
                              <div className="grid grid-cols-1 gap-2">
                                {[
                                  'Topografia', 'Geotecnia', 'Certidão', 'Caderneta', 'Planta Localização'
                                ].map(opt => (
                                  <button
                                    key={opt}
                                    onClick={() => toggleProjectMulti('operational', 'technicalInfoStatus', opt)}
                                    className={`p-3 border rounded-xl text-left transition-all flex items-center justify-between ${
                                      project.operational.technicalInfoStatus.includes(opt) ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main hover:border-text-secondary"
                                    }`}
                                  >
                                    <span className="font-bold text-[11px] block">{opt}</span>
                                    {project.operational.technicalInfoStatus.includes(opt) ? <CheckSquare className="w-3.5 h-3.5 text-canvas" /> : <Square className="w-3.5 h-3.5 text-text-secondary/30" />}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {activeLevel === 'commercial' && (
                      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* 1. Commercial Summary (READ-ONLY) */}
                        {formStep === 0 && (
                          <div className="space-y-8">
                            <div className="bg-surface border border-border-main rounded-2xl overflow-hidden">
                              <div className="bg-accent/10 px-6 py-3 border-b border-border-main flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-accent flex items-center gap-2">
                                  <Lock className="w-3 h-3" /> Resumo do Âmbito Definido (Nível 2)
                                </span>
                                <span className="text-[10px] font-bold text-text-secondary italic">Dados Bloqueados Downstream</span>
                              </div>
                              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                  <div className="space-y-1">
                                    <span className="text-[10px] text-text-secondary uppercase font-bold">Fases Contratadas</span>
                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                      {project.operational.contractedPhases.map(phase => (
                                        <span key={phase} className="px-2 py-0.5 bg-accent/10 text-accent rounded text-[9px] font-bold uppercase">{phase}</span>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-[10px] text-text-secondary uppercase font-bold">Serviços Complementares</span>
                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                      {project.operational.complementaryServices.length > 0 ? (
                                        project.operational.complementaryServices.map(service => (
                                          <span key={service} className="px-2 py-0.5 bg-surface-secondary border border-border-main text-text-primary rounded text-[9px] font-bold uppercase">{service}</span>
                                        ))
                                      ) : (
                                        <span className="text-[9px] text-text-secondary italic">Nenhum selecionado</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                      <span className="text-[10px] text-text-secondary uppercase font-bold">Coordenação</span>
                                      <p className="text-xs font-bold text-text-primary">{project.operational.technicalCoordination}</p>
                                    </div>
                                    <div className="space-y-1">
                                      <span className="text-[10px] text-text-secondary uppercase font-bold">Urgência</span>
                                      <p className="text-xs font-bold text-text-primary">{project.operational.deadlineType}</p>
                                    </div>
                                    <div className="space-y-1">
                                      <span className="text-[10px] text-text-secondary uppercase font-bold">Modelo Obra</span>
                                      <p className="text-xs font-bold text-text-primary truncate">{project.operational.constructionModel}</p>
                                    </div>
                                    <div className="space-y-1">
                                      <span className="text-[10px] text-text-secondary uppercase font-bold">Tipo Cliente</span>
                                      <p className="text-xs font-bold text-text-primary">{project.operational.clientType}</p>
                                    </div>
                                    <div className="space-y-1">
                                      <span className="text-[10px] text-text-secondary uppercase font-bold">Complexidade</span>
                                      <p className="text-xs font-bold text-text-primary truncate">{project.operational.projectComplexity}</p>
                                    </div>
                                    <div className="space-y-1">
                                      <span className="text-[10px] text-text-secondary uppercase font-bold">Exigência</span>
                                      <p className="text-xs font-bold text-text-primary truncate">{project.operational.projectExigency}</p>
                                    </div>
                                    <div className="space-y-1">
                                      <span className="text-[10px] text-text-secondary uppercase font-bold">Terreno</span>
                                      <p className="text-xs font-bold text-text-primary">{project.base.topography}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="p-4 bg-accent/5 border border-accent/10 rounded-xl flex gap-3">
                              <Info className="w-5 h-5 text-accent shrink-0" />
                              <p className="text-[11px] text-text-secondary leading-tight italic">
                                Este ecrã é meramente informativo. O âmbito técnico e operacional foi trancado no Nível 2. Caso pretenda alterar as fases ou serviços incluídos, retroceda no fluxo.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* 2. Fee Model */}
                        {formStep === 1 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {['Percentagem sobre obra', 'Valor por m²', 'Valor fixo', 'Modelo híbrido'].map(opt => (
                              <button
                                key={opt}
                                onClick={() => updateProjectLevel('commercial', { feeModel: opt as any })}
                                className={`p-6 border rounded-xl text-left transition-all ${
                                  project.commercial.feeModel === opt ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main hover:border-text-secondary"
                                }`}
                              >
                                <span className="font-bold text-sm block">{opt}</span>
                                <span className={`text-[10px] uppercase tracking-widest mt-1 block ${project.commercial.feeModel === opt ? 'text-canvas/60' : 'text-text-secondary'}`}>
                                  {opt === 'Percentagem sobre obra' && 'Cálculo baseado no custo estimado de construção'}
                                  {opt === 'Valor por m²' && 'Cálculo linear pela área de construção bruta'}
                                  {opt === 'Valor fixo' && 'Honorários fechados independentemente da área'}
                                  {opt === 'Modelo híbrido' && 'Combinação de valor base e variáveis'}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* 3. Fee Parameters */}
                        {formStep === 2 && (
                          <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="space-y-6">
                                <div className="space-y-2">
                                  <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                                    {project.commercial.feeModel === 'Percentagem sobre obra' && "Percentagem (%)"}
                                    {project.commercial.feeModel === 'Valor por m²' && "Valor por m² (€/m²)"}
                                    {project.commercial.feeModel === 'Valor fixo' && "Honorários Globais (€)"}
                                    {project.commercial.feeModel === 'Modelo híbrido' && "Valor de Referência (€)"}
                                  </label>
                                  <div className="relative">
                                    <input 
                                      type="number" 
                                      step={project.commercial.feeModel === 'Percentagem sobre obra' ? "0.1" : "1"}
                                      value={project.commercial.feeValue}
                                      onChange={e => updateProjectLevel('commercial', { feeValue: Number(e.target.value) })}
                                      className="w-full px-4 py-4 bg-surface border border-border-main rounded-xl text-lg font-bold text-text-primary focus:ring-1 focus:ring-accent outline-none"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary font-bold">
                                      {project.commercial.feeModel === 'Percentagem sobre obra' && "%"}
                                      {project.commercial.feeModel === 'Valor por m²' && "€/m²"}
                                      {project.commercial.feeModel === 'Valor fixo' && "€"}
                                      {project.commercial.feeModel === 'Modelo híbrido' && "€"}
                                    </span>
                                  </div>
                                </div>

                                {project.commercial.feeModel === 'Percentagem sobre obra' && (
                                  <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Custo de Obra Estimativa para Cálculo</label>
                                    <div className="relative">
                                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-bold">€</span>
                                      <input 
                                        type="number" 
                                        value={project.commercial.constructionCostBasis}
                                        onChange={e => updateProjectLevel('commercial', { constructionCostBasis: Number(e.target.value) })}
                                        className="w-full pl-8 pr-4 py-4 bg-surface border border-border-main rounded-xl text-lg font-bold text-text-primary focus:ring-1 focus:ring-accent outline-none"
                                      />
                                    </div>
                                    <p className="text-[10px] text-text-secondary italic">
                                      Base do engine: {Math.round(project.financialModel?.constructionCostAverage || 0).toLocaleString()} €
                                    </p>
                                  </div>
                                )}
                              </div>

                              <div className="space-y-6">
                                <div className="p-8 bg-surface-secondary border border-border-main rounded-2xl flex flex-col items-center justify-center text-center">
                                  <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2">Total de Honorários (Estimado)</span>
                                  <span className="text-4xl font-bold text-text-primary">
                                    {(() => {
                                      let total = 0;
                                      if (project.commercial.feeModel === 'Percentagem sobre obra') {
                                        total = (project.commercial.constructionCostBasis || project.financialModel?.constructionCostAverage || 0) * (project.commercial.feeValue / 100);
                                      } else if (project.commercial.feeModel === 'Valor por m²') {
                                        total = (project.base.preferredArea.areaM2 || 0) * project.commercial.feeValue;
                                      } else {
                                        total = project.commercial.feeValue;
                                      }
                                      return Math.round(total).toLocaleString();
                                    })()} €
                                  </span>
                                  <span className="text-[10px] text-text-secondary mt-2">Valor sem IVA aplicado</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 4. Excluded Costs */}
                        {formStep === 3 && (
                          <div className="space-y-6">
                            <p className="text-sm text-text-secondary">Selecione os custos e serviços que estão explicitamente EXCLUÍDOS da presente proposta comercial:</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                              {[
                                'Taxas camarárias', 'Impressões / Cópias', 'Levantamentos topográficos', 
                                'Ensaios de solo / laboratório', 'Certificados energéticos (ADENE)', 
                                'Projetos de especialidades (Engenharias)', 'IVA à taxa legal em vigor', 
                                'Deslocações fora do concelho', 'Custos de registos e notariado'
                              ].map(opt => (
                                <button
                                  key={opt}
                                  onClick={() => toggleProjectMulti('commercial', 'excludedCosts', opt)}
                                  className={`p-4 border rounded-xl text-left transition-all flex items-center justify-between ${
                                    project.commercial.excludedCosts.includes(opt) ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main hover:border-text-secondary"
                                  }`}
                                >
                                  <span className="font-bold text-[11px] uppercase tracking-wider block">{opt}</span>
                                  {project.commercial.excludedCosts.includes(opt) ? <CheckSquare className="w-4 h-4 text-canvas" /> : <Square className="w-4 h-4 text-text-secondary/30" />}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 5. Payment Structure Selection */}
                        {formStep === 4 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {['Percentagem por fase', 'Mensal', 'Entrada + fases', 'Pagamentos fixos'].map(opt => (
                              <button
                                key={opt}
                                onClick={() => updateProjectLevel('commercial', { paymentStructure: opt as any })}
                                className={`p-6 border rounded-xl text-left transition-all ${
                                  project.commercial.paymentStructure === opt ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main hover:border-text-secondary"
                                }`}
                              >
                                <span className="font-bold text-sm block">{opt}</span>
                                <span className={`text-[10px] uppercase tracking-widest mt-1 block ${project.commercial.paymentStructure === opt ? 'text-canvas/60' : 'text-text-secondary'}`}>
                                  {opt === 'Percentagem por fase' && 'Pagamentos após conclusão de cada etapa'}
                                  {opt === 'Mensal' && 'Mensalidades fixas durante o desenvolvimento'}
                                  {opt === 'Entrada + fases' && 'Adiantamento inicial seguido de fases'}
                                  {opt === 'Pagamentos fixos' && 'Calendarização de datas específicas'}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* 6. Payment Percentages (only if by phase or entry+phases) */}
                        {formStep === 5 && (
                          <div className="space-y-6">
                            <div className="p-6 bg-surface border border-border-main rounded-2xl space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                  <span className="text-sm font-bold text-text-primary flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-accent" />
                                    Valores pré-definidos pelo gabinete
                                  </span>
                                  <p className="text-[10px] text-text-secondary italic">Utilizar a estrutura financeira padrão das configurações globais.</p>
                                </div>
                                <button 
                                  onClick={() => updateProjectLevel('commercial', { 
                                    useDefaultDistribution: !project.commercial.useDefaultDistribution,
                                    // If toggling custom, initialize with office defaults if empty
                                    paymentPhases: project.commercial.paymentPhases.length === 0 ? office.defaultFeeDistribution : project.commercial.paymentPhases
                                  })}
                                  className={`w-14 h-8 rounded-full transition-all relative ${project.commercial.useDefaultDistribution ? 'bg-accent' : 'bg-gray-200'}`}
                                >
                                  <div className={`absolute top-1 w-6 h-6 bg-canvas rounded-full transition-all ${project.commercial.useDefaultDistribution ? 'left-7' : 'left-1'}`} />
                                </button>
                              </div>

                              {!project.commercial.useDefaultDistribution && (
                                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3 animate-in fade-in slide-in-from-top-2">
                                  <Edit2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-[11px] font-bold text-amber-900">Personalizar distribuição para este projeto</p>
                                    <p className="text-[10px] text-amber-700">As alterações efetuadas abaixo não afetam as definições globais do gabinete.</p>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <div className="space-y-3">
                              {(project.operational.contractedPhases.length > 0 ? project.operational.contractedPhases : PROJECT_PHASES).map(phase => {
                                // Try to find value in office defaults first
                                const officeDefault = office.defaultFeeDistribution?.find(p => p.label === phase)?.percentage || 0;
                                // Core value depends on whether we use default or custom
                                const currentPercentage = project.commercial.useDefaultDistribution 
                                  ? officeDefault 
                                  : (project.commercial.paymentPhases.find(p => p.label === phase)?.percentage ?? officeDefault);

                                return (
                                  <div key={phase} className={`p-4 border rounded-xl flex items-center justify-between transition-all ${
                                    project.commercial.useDefaultDistribution ? "bg-accent/5 border-accent/20" : "bg-surface border-border-main"
                                  }`}>
                                    <div className="space-y-0.5">
                                      <span className="text-sm font-bold text-text-primary">{phase}</span>
                                      {project.commercial.useDefaultDistribution && (
                                        <span className="text-[9px] font-bold text-accent uppercase tracking-widest block">Herdado do Gabinete</span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <input 
                                        type="number"
                                        disabled={project.commercial.useDefaultDistribution}
                                        value={currentPercentage}
                                        onChange={e => {
                                          const val = Number(e.target.value);
                                          const idx = project.commercial.paymentPhases.findIndex(p => p.label === phase);
                                          const arr = [...project.commercial.paymentPhases];
                                          if (idx > -1) arr[idx] = { ...arr[idx], percentage: val };
                                          else arr.push({ label: phase, percentage: val });
                                          updateProjectLevel('commercial', { paymentPhases: arr });
                                        }}
                                        className={`w-20 px-3 py-2 border rounded-lg text-right font-bold text-sm ${
                                          project.commercial.useDefaultDistribution ? "bg-white/50 border-transparent text-accent cursor-not-allowed" : "bg-surface border-border-main text-text-primary"
                                        }`}
                                      />
                                      <span className="text-xs font-bold text-text-secondary">%</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            <div className="p-6 bg-accent text-canvas rounded-2xl flex items-center justify-between font-bold shadow-lg shadow-accent/10">
                              <span className="text-[10px] uppercase tracking-widest text-canvas/70">Cálculo Total</span>
                              <div className="flex items-center gap-3">
                                <span className={`text-2xl ${
                                  (() => {
                                    const phases = project.operational.contractedPhases.length > 0 ? project.operational.contractedPhases : PROJECT_PHASES;
                                    const total = phases.reduce((acc, phase) => {
                                      const officeDefault = office.defaultFeeDistribution?.find(p => p.label === phase)?.percentage || 0;
                                      const p = project.commercial.useDefaultDistribution 
                                        ? officeDefault 
                                        : (project.commercial.paymentPhases.find(p => p.label === phase)?.percentage ?? officeDefault);
                                      return acc + p;
                                    }, 0);
                                    return total === 100 ? 'text-green-400' : 'text-amber-400';
                                  })()
                                }`}>
                                  {(() => {
                                    const phases = project.operational.contractedPhases.length > 0 ? project.operational.contractedPhases : PROJECT_PHASES;
                                    return phases.reduce((acc, phase) => {
                                      const officeDefault = office.defaultFeeDistribution?.find(p => p.label === phase)?.percentage || 0;
                                      const p = project.commercial.useDefaultDistribution 
                                        ? officeDefault 
                                        : (project.commercial.paymentPhases.find(p => p.label === phase)?.percentage ?? officeDefault);
                                      return acc + p;
                                    }, 0);
                                  })()} %
                                </span>
                                {(() => {
                                  const phases = project.operational.contractedPhases.length > 0 ? project.operational.contractedPhases : PROJECT_PHASES;
                                  const total = phases.reduce((acc, phase) => {
                                    const officeDefault = office.defaultFeeDistribution?.find(p => p.label === phase)?.percentage || 0;
                                    const p = project.commercial.useDefaultDistribution 
                                      ? officeDefault 
                                      : (project.commercial.paymentPhases.find(p => p.label === phase)?.percentage ?? officeDefault);
                                    return acc + p;
                                  }, 0);
                                  return total === 100;
                                })() && <CheckCircle2 className="w-6 h-6 text-green-400" />}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 7. Revision & Change Policy */}
                        {formStep === 6 && (
                          <div className="space-y-10">
                            <div className="space-y-4">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Política de Revisões Incluídas</label>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <span className="text-[10px] text-text-secondary font-bold">Nº de Revisões</span>
                                  <input 
                                    type="number"
                                    value={project.commercial.revisionPolicy.maxRevisions}
                                    onChange={e => updateProjectLevel('commercial', { revisionPolicy: { ...project.commercial.revisionPolicy, maxRevisions: Number(e.target.value) }})}
                                    className="w-full px-4 py-3 bg-surface border border-border-main rounded-xl font-bold"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <span className="text-[10px] text-text-secondary font-bold">Descrição da Política</span>
                                  <input 
                                    type="text"
                                    value={project.commercial.revisionPolicy.description}
                                    onChange={e => updateProjectLevel('commercial', { revisionPolicy: { ...project.commercial.revisionPolicy, description: e.target.value }})}
                                    className="w-full px-4 py-3 bg-surface border border-border-main rounded-xl font-bold"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Gestão de Alterações Solicitadas pelo Cliente</label>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {[
                                  'Incluídas sem limite', 
                                  'Incluídas até número definido de revisões', 
                                  'Alterações relevantes serão faturadas adicionalmente', 
                                  'Todas as alterações após aprovação serão faturadas', 
                                  'Definir em observações'
                                ].map(opt => (
                                  <button
                                    key={opt}
                                    onClick={() => updateProjectLevel('commercial', { changeManagementPolicy: opt as any })}
                                    className={`p-4 border rounded-xl text-left transition-all ${
                                      project.commercial.changeManagementPolicy === opt ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main hover:border-text-secondary"
                                    }`}
                                  >
                                    <span className="font-bold text-[11px] block">{opt}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 8. Suspension Clauses */}
                        {formStep === 7 && (
                          <div className="space-y-8">
                            <div className="flex items-center justify-between p-6 bg-surface border border-border-main rounded-2xl">
                              <div className="space-y-1">
                                <span className="font-bold text-sm text-text-primary">Activar Cláusulas de Suspensão por Motivos Externos?</span>
                                <p className="text-[10px] text-text-secondary italic">Protects the office against delays from city hall, client docs, etc.</p>
                              </div>
                              <button 
                                onClick={() => updateProjectLevel('commercial', { suspensionPolicy: { ...project.commercial.suspensionPolicy, enabled: !project.commercial.suspensionPolicy.enabled }})}
                                className={`w-14 h-8 rounded-full transition-all relative ${project.commercial.suspensionPolicy.enabled ? 'bg-accent' : 'bg-gray-200'}`}
                              >
                                <div className={`absolute top-1 w-6 h-6 bg-canvas rounded-full transition-all ${project.commercial.suspensionPolicy.enabled ? 'left-7' : 'left-1'}`} />
                              </button>
                            </div>

                            {project.commercial.suspensionPolicy.enabled && (
                              <div className="space-y-4 animate-in fade-in duration-500">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Selecione os Motivos de Suspensão Automática:</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                  {[
                                    'atrasos camarários', 'documentação cliente', 'pareceres externos', 
                                    'entidades licenciadoras', 'empreiteiro', 'pagamentos', 'alterações legais'
                                  ].map(opt => (
                                    <button
                                      key={opt}
                                      onClick={() => {
                                        const current = project.commercial.suspensionPolicy.reasons;
                                        const updated = current.includes(opt) ? current.filter(r => r !== opt) : [...current, opt];
                                        updateProjectLevel('commercial', { suspensionPolicy: { ...project.commercial.suspensionPolicy, reasons: updated }});
                                      }}
                                      className={`p-4 border rounded-xl text-left transition-all ${
                                        project.commercial.suspensionPolicy.reasons.includes(opt) ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main"
                                      }`}
                                    >
                                      <span className="font-bold text-[10px] uppercase tracking-widest block">{opt}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* 9. Signature & Validity */}
                        {formStep === 8 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Validade da Proposta</label>
                              <div className="grid grid-cols-2 gap-2">
                                {['15 dias', '30 dias', '60 dias', 'Personalizado'].map(opt => (
                                  <button
                                    key={opt}
                                    onClick={() => updateProjectLevel('commercial', { proposalValidity: opt as any })}
                                    className={`p-4 border rounded-xl text-left transition-all ${
                                      project.commercial.proposalValidity === opt ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main"
                                    }`}
                                  >
                                    <span className="font-bold text-xs block">{opt}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-4">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Tipo de Assinatura Desejada</label>
                              <div className="grid grid-cols-1 gap-2">
                                {['Assinatura digital qualificada', 'Assinatura manual'].map(opt => (
                                  <button
                                    key={opt}
                                    onClick={() => updateProjectLevel('commercial', { signatureType: opt as any })}
                                    className={`p-4 border rounded-xl text-left transition-all ${
                                      project.commercial.signatureType === opt ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main"
                                    }`}
                                  >
                                    <span className="font-bold text-xs block">{opt}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 10. Commercial Notes */}
                        {formStep === 9 && (
                          <div className="space-y-4">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Notas Comerciais Adicionais</label>
                            <textarea 
                              value={project.commercial.commercialNotes}
                              onChange={e => updateProjectLevel('commercial', { commercialNotes: e.target.value })}
                              placeholder="Indique aqui condições específicas, notas de rodapé ou observações contratuais relevantes..."
                              className="w-full h-64 p-6 bg-surface border border-border-main rounded-2xl font-bold text-text-primary focus:ring-1 focus:ring-accent outline-none text-sm leading-relaxed"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {activeLevel === 'technical' && (
                      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {formStep === 0 && (
                          <div className="space-y-8">
                            {/* Inherited Context - Read Only */}
                            <div className="bg-surface border border-border-main rounded-2xl overflow-hidden">
                              <div className="bg-accent/10 px-6 py-3 border-b border-border-main flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-accent flex items-center gap-2">
                                  <Lock className="w-3 h-3" /> Contexto Herdado (Nível 1)
                                </span>
                                <span className="text-[10px] font-bold text-text-secondary italic">Apenas para leitura</span>
                              </div>
                              <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="space-y-1">
                                  <span className="text-[10px] text-text-secondary uppercase font-bold">Tipo de Projeto</span>
                                  <p className="text-sm font-bold text-text-primary">{project.base.interventionType}</p>
                                </div>
                                {project.technical.typology !== 'Multifamily' && (
                                  <>
                                    <div className="space-y-1">
                                      <span className="text-[10px] text-text-secondary uppercase font-bold">Pisos Previstos</span>
                                      <p className="text-sm font-bold text-text-primary">{project.base.preferredArea.floors} Pisos</p>
                                    </div>
                                    <div className="space-y-1">
                                      <span className="text-[10px] text-text-secondary uppercase font-bold">Área Pretendida</span>
                                      <p className="text-sm font-bold text-text-primary">{project.base.preferredArea.areaM2} m²</p>
                                    </div>
                                    <div className="space-y-1">
                                      <span className="text-[10px] text-text-secondary uppercase font-bold">Piscina / Cave</span>
                                      <p className="text-sm font-bold text-text-primary">
                                        {project.base.features.pool ? 'Sim' : 'Não'} / {project.base.features.basement ? 'Sim' : 'Não'}
                                      </p>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="space-y-6">
                                <div className="space-y-2">
                                  <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Área de implantação aproximada (m²)</label>
                                  <input 
                                    type="number" 
                                    value={project.technical.implantation.implantationArea}
                                    onChange={e => updateProjectLevel('technical', { implantation: { ...project.technical.implantation, implantationArea: Number(e.target.value) }})}
                                    className="w-full px-4 py-3 bg-surface border border-border-main rounded-xl font-bold text-text-primary focus:ring-accent focus:border-accent outline-none transition-all"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Tipo de implantação</label>
                                  <div className="grid grid-cols-1 gap-2">
                                    {['isolada', 'geminada', 'banda']
                                      .filter(opt => project.technical.typology !== 'Multifamily' || opt !== 'isolada')
                                      .map(opt => (
                                        <button
                                          key={opt}
                                          onClick={() => updateProjectLevel('technical', { implantation: { ...project.technical.implantation, implantationType: opt as any }})}
                                          className={`p-4 border rounded-xl text-left transition-all ${
                                            project.technical.implantation.implantationType === opt ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main hover:border-text-secondary"
                                          }`}
                                        >
                                          <span className="font-bold text-sm block capitalize">{opt}</span>
                                        </button>
                                      ))}
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-6 p-6 bg-surface border border-border-main rounded-2xl">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Elementos Adicionais da Implantação</label>
                                <div className="grid grid-cols-1 gap-3 mt-4">
                                  {[
                                    { label: 'Anexo / Garagem Exterior', key: 'hasAnnex', hideFor: ['Multifamily'] },
                                    { label: 'Estacionamento descoberto', key: 'hasParking' }
                                  ].filter(item => !item.hideFor || !item.hideFor.includes(project.technical.typology)).map(item => (
                                    <button
                                      key={item.key}
                                      onClick={() => updateProjectLevel('technical', { implantation: { ...project.technical.implantation, [item.key]: !project.technical.implantation[item.key as keyof typeof project.technical.implantation] }})}
                                      className={`p-4 border rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all flex items-center justify-between ${
                                        project.technical.implantation[item.key] ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main"
                                      }`}
                                    >
                                      {item.label}
                                      {project.technical.implantation[item.key] ? <CheckCircle2 className="w-5 h-5" /> : <Plus className="w-5 h-5 text-text-secondary" />}
                                    </button>
                                  ))}
                                </div>

                                <div className="mt-6 p-4 bg-accent/5 border border-accent/10 rounded-xl flex gap-3">
                                  <Info className="w-5 h-5 text-accent shrink-0" />
                                  <p className="text-[10px] text-text-secondary leading-tight italic">
                                    Piscina e Cave foram definidos no Nível 1. Caso pretenda alterar estas características, por favor retroceda ao Nível de Dados Base.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {formStep === 1 && (
                          <div className="space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                              {['Norte', 'Sul', 'Este', 'Oeste', 'Não definido'].map(opt => (
                                <button
                                  key={opt}
                                  onClick={() => updateProjectLevel('technical', { implantation: { ...project.technical.implantation, preferredSolarOrientation: opt } })}
                                  className={`p-6 border rounded-xl text-left transition-all ${
                                    project.technical.implantation.preferredSolarOrientation === opt ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main hover:border-text-secondary"
                                  }`}
                                >
                                  <span className="font-bold text-sm block">{opt}</span>
                                </button>
                              ))}
                            </div>
                            <div className="pt-6 border-t border-border-main">
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                  'Pretende maximizar luz natural', 'Pretende controlo solar passivo', 
                                  'Pretende proteção térmica reforçada', 'Pretende vistas específicas'
                                ].map(opt => (
                                  <button
                                    key={opt}
                                    onClick={() => toggleProjectMulti('technical', 'implantation.solarOrientationFeatures', opt)}
                                    className={`p-4 border rounded-xl text-left transition-all flex items-center justify-between ${
                                      project.technical.implantation.solarOrientationFeatures?.includes(opt) ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main hover:border-text-secondary"
                                    }`}
                                  >
                                    <span className="font-bold text-[10px] uppercase tracking-widest">{opt}</span>
                                    {project.technical.implantation.solarOrientationFeatures?.includes(opt) ? <CheckSquare className="w-4 h-4 text-canvas" /> : <Square className="w-4 h-4 text-text-secondary/30" />}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 2. Organização Funcional (TYPOLOGY ADAPTIVE) */}
                        {formStep === 2 && (
                          <div className="space-y-8">
                            {project.technical.typology === 'Housing' || project.technical.typology === 'Multifamily' || project.technical.typology === 'Tourism' ? (
                              <>
                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
                                  {(project.technical.typology === 'Tourism' 
                                    ? ['Suites', 'Quartos', 'Receção', 'Áreas Comuns', 'Apoio Técnico', 'Zonas de Serviço', 'Lavandaria', 'Arrumos']
                                    : ['Sala', 'Cozinha', 'Suites', 'Quartos', 'Instalações sanitárias', 'Escritório', 'Lavandaria', 'Arrumos']
                                  ).map(room => (
                                    <button
                                      key={room}
                                      onClick={() => {
                                        const current = project.technical.functionalOrganization.rooms;
                                        const updated = current.includes(room) ? current.filter(r => r !== room) : [...current, room];
                                        updateProjectLevel('technical', { functionalOrganization: { ...project.technical.functionalOrganization, rooms: updated }});
                                      }}
                                      className={`p-3 border rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all text-center ${
                                        project.technical.functionalOrganization.rooms.includes(room) ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main"
                                      }`}
                                    >
                                      {room}
                                    </button>
                                  ))}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                                        {project.technical.typology === 'Tourism' ? 'Número de unidades de alojamento' : 'Número de quartos'}
                                      </label>
                                      <input 
                                        type="number" 
                                        value={project.technical.functionalOrganization.housing?.numBedrooms || 0}
                                        onChange={e => updateProjectLevel('technical', { 
                                          functionalOrganization: { 
                                            ...project.technical.functionalOrganization, 
                                            housing: { ...project.technical.functionalOrganization.housing!, numBedrooms: Number(e.target.value) }
                                          }
                                        })}
                                        className="w-full px-4 py-3 bg-surface border border-border-main rounded-xl font-bold text-text-primary focus:ring-accent focus:border-accent outline-none transition-all"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Número de instalações sanitárias</label>
                                      <input 
                                        type="number" 
                                        value={project.technical.functionalOrganization.housing?.numBathrooms || 0}
                                        onChange={e => updateProjectLevel('technical', { 
                                          functionalOrganization: { 
                                            ...project.technical.functionalOrganization, 
                                            housing: { ...project.technical.functionalOrganization.housing!, numBathrooms: Number(e.target.value) }
                                          }
                                        })}
                                        className="w-full px-4 py-3 bg-surface border border-border-main rounded-xl font-bold text-text-primary focus:ring-accent focus:border-accent outline-none transition-all"
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                      <button 
                                        onClick={() => updateProjectLevel('technical', { 
                                          functionalOrganization: { 
                                            ...project.technical.functionalOrganization, 
                                            housing: { ...project.technical.functionalOrganization.housing!, isOpenSpace: !project.technical.functionalOrganization.housing?.isOpenSpace }
                                          }
                                        })}
                                        className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${project.technical.functionalOrganization.housing?.isOpenSpace ? 'bg-accent' : 'border border-border-main'}`}
                                      >
                                        {project.technical.functionalOrganization.housing?.isOpenSpace && <CheckCircle2 className="w-4 h-4 text-canvas" />}
                                      </button>
                                      <span className="text-sm font-bold text-text-primary">Open space?</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <button 
                                        onClick={() => updateProjectLevel('technical', { 
                                          functionalOrganization: { 
                                            ...project.technical.functionalOrganization, 
                                            housing: { ...project.technical.functionalOrganization.housing!, hasMasterSuite: !project.technical.functionalOrganization.housing?.hasMasterSuite }
                                          }
                                        })}
                                        className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${project.technical.functionalOrganization.housing?.hasMasterSuite ? 'bg-accent' : 'border border-border-main'}`}
                                      >
                                        {project.technical.functionalOrganization.housing?.hasMasterSuite && <CheckCircle2 className="w-4 h-4 text-canvas" />}
                                      </button>
                                      <span className="text-sm font-bold">Suite principal?</span>
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Observações funcionais</label>
                                      <textarea 
                                        value={project.technical.functionalOrganization.functionalNotes}
                                        onChange={e => updateProjectLevel('technical', { functionalOrganization: { ...project.technical.functionalOrganization, functionalNotes: e.target.value }})}
                                        className="w-full px-4 py-3 bg-surface border border-border-main rounded-xl text-sm min-h-[80px] text-text-primary focus:ring-1 focus:ring-accent outline-none"
                                        placeholder="Ex: Closet extra, despensa..."
                                      />
                                    </div>
                                  </div>
                                </div>
                              </>
                            ) : project.technical.typology === 'Commerce' ? (
                              <>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                  {[
                                    { label: 'Receção', key: 'hasReception' },
                                    { label: 'Atendimento', key: 'hasPublicArea' },
                                    { label: 'Armazenamento', key: 'hasStorage' },
                                    { label: 'Circulação pública', key: 'hasPublicCirculation' },
                                    { label: 'Áreas técnicas', key: 'hasTechnicalAreas' },
                                    { label: 'Zonas staff', key: 'hasStaffZones' }
                                  ].map(item => (
                                    <button
                                      key={item.key}
                                      onClick={() => updateProjectLevel('technical', { 
                                        functionalOrganization: { 
                                          ...project.technical.functionalOrganization, 
                                          commerce: { 
                                            ...project.technical.functionalOrganization.commerce!, 
                                            [item.key]: !project.technical.functionalOrganization.commerce?.[item.key as keyof CommerceTechnicalData] 
                                          }
                                        }
                                      })}
                                      className={`p-6 border rounded-xl text-left transition-all flex items-center justify-between ${
                                        project.technical.functionalOrganization.commerce?.[item.key as keyof CommerceTechnicalData] ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main hover:border-text-secondary"
                                      }`}
                                    >
                                      <span className="font-bold text-sm block">{item.label}</span>
                                      {project.technical.functionalOrganization.commerce?.[item.key as keyof CommerceTechnicalData] ? <CheckCircle2 className="w-5 h-5" /> : <Plus className="w-5 h-5 text-text-secondary" />}
                                    </button>
                                  ))}
                                </div>
                              </>
                            ) : project.technical.typology === 'Loteamento' ? (
                              <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Número de lotes</label>
                                      <input 
                                        type="number" 
                                        value={project.technical.functionalOrganization.loteamento?.numLots || 0}
                                        onChange={e => updateProjectLevel('technical', { 
                                          functionalOrganization: { 
                                            ...project.technical.functionalOrganization, 
                                            loteamento: { ...project.technical.functionalOrganization.loteamento!, numLots: Number(e.target.value) }
                                          }
                                        })}
                                        className="w-full px-4 py-3 bg-surface border border-border-main rounded-xl font-bold text-text-primary focus:ring-accent focus:border-accent outline-none transition-all"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Observações de Infraestrutura</label>
                                      <textarea 
                                        value={project.technical.functionalOrganization.functionalNotes}
                                        onChange={e => updateProjectLevel('technical', { functionalOrganization: { ...project.technical.functionalOrganization, functionalNotes: e.target.value }})}
                                        className="w-full px-4 py-3 bg-surface border border-border-main rounded-xl text-sm min-h-[80px] text-text-primary focus:ring-1 focus:ring-accent outline-none"
                                        placeholder="Arruamentos, redes, iluminação..."
                                      />
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 gap-3">
                                    {[
                                      { label: 'Infraestruturas', key: 'hasInfrastructures' },
                                      { label: 'Arruamentos', key: 'hasStreets' },
                                      { label: 'Espaços Verdes', key: 'hasGreenSpaces' },
                                      { label: 'Estacionamento Coletivo', key: 'hasCollectiveParking' }
                                    ].map(item => (
                                      <button
                                        key={item.key}
                                        onClick={() => updateProjectLevel('technical', { 
                                          functionalOrganization: { 
                                            ...project.technical.functionalOrganization, 
                                            loteamento: { 
                                              ...project.technical.functionalOrganization.loteamento!, 
                                              [item.key]: !project.technical.functionalOrganization.loteamento?.[item.key as keyof LoteamentoTechnicalData] 
                                            }
                                          }
                                        })}
                                        className={`p-4 border rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all flex items-center justify-between ${
                                          project.technical.functionalOrganization.loteamento?.[item.key as keyof LoteamentoTechnicalData] ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main"
                                        }`}
                                      >
                                        {item.label}
                                        {project.technical.functionalOrganization.loteamento?.[item.key as keyof LoteamentoTechnicalData] ? <CheckCircle2 className="w-5 h-5" /> : <Plus className="w-5 h-5 text-text-secondary" />}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </>
                            ) : null}
                          </div>
                        )}

                        {formStep === 3 && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
                            {[
                              'Closet', 'Despensa', 'Garrafeira', 'Ginásio', 'Cinema', 
                              'Sala jogos', 'Biblioteca', 'Oficina', 'Quarto hóspedes', 
                              'Cozinha exterior', 'Zona barbecue', 'Escritório profissional', 
                              'Área técnica', 'Outro'
                            ].map(opt => (
                              <button
                                key={opt}
                                onClick={() => toggleProjectMulti('technical', 'functionalOrganization.additionalSpaces', opt)}
                                className={`p-4 border rounded-xl text-left transition-all flex flex-col justify-between h-24 ${
                                  project.technical.functionalOrganization.additionalSpaces?.includes(opt) ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main hover:border-text-secondary"
                                }`}
                              >
                                <span className="font-bold text-[10px] uppercase tracking-widest">{opt}</span>
                                <div className="flex justify-end w-full">
                                  {project.technical.functionalOrganization.additionalSpaces?.includes(opt) ? <CheckSquare className="w-4 h-4 text-canvas" /> : <Square className="w-4 h-4 text-text-secondary/30" />}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}

                        {formStep === 4 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                              'Área social', 'Privacidade', 'Relação exterior', 
                              'Eficiência funcional', 'Rentabilidade', 'Flexibilidade futura', 'Luxo/conforto'
                            ].map(opt => (
                              <button
                                key={opt}
                                onClick={() => updateProjectLevel('technical', { functionalOrganization: { ...project.technical.functionalOrganization, projectPriority: opt } })}
                                className={`p-6 border rounded-xl text-left transition-all ${
                                  project.technical.functionalOrganization.projectPriority === opt ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main hover:border-text-secondary"
                                }`}
                              >
                                <span className="font-bold text-sm block">{opt}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {formStep === 5 && (
                          <div className="space-y-8">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {['Reduzido', 'Moderado', 'Elevado', 'Muito elevado'].map(opt => (
                                <button
                                  key={opt}
                                  onClick={() => updateProjectLevel('technical', { functionalOrganization: { ...project.technical.functionalOrganization, integrationLevel: opt } })}
                                  className={`p-6 border rounded-xl text-left transition-all ${
                                    project.technical.functionalOrganization.integrationLevel === opt ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main hover:border-text-secondary"
                                  }`}
                                >
                                  <span className="font-bold text-sm block">{opt}</span>
                                </button>
                              ))}
                            </div>
                            <div className="pt-6 border-t border-border-main">
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                  'Grandes envidraçados', 'Pátios interiores', 'Terraços', 'Varandas', 
                                  'Espaços cobertos exteriores', 'Ligação direta sala/jardim', 
                                  { label: 'Cozinha exterior', hideFor: ['Multifamily'] }, 
                                  { label: 'Piscina integrada', hideFor: ['Multifamily'] }
                                ].map(item => {
                                  const opt = typeof item === 'string' ? item : item.label;
                                  const hide = typeof item === 'object' && item.hideFor?.includes(project.technical.typology);
                                  if (hide) return null;
                                  
                                  return (
                                    <button
                                      key={opt}
                                      onClick={() => toggleProjectMulti('technical', 'functionalOrganization.integrationFeatures', opt)}
                                      className={`p-4 border rounded-xl text-left transition-all flex items-center justify-between ${
                                        project.technical.functionalOrganization.integrationFeatures?.includes(opt) ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main hover:border-text-secondary"
                                      }`}
                                    >
                                      <span className="font-bold text-[10px] uppercase tracking-widest">{opt}</span>
                                      {project.technical.functionalOrganization.integrationFeatures?.includes(opt) ? <CheckSquare className="w-4 h-4 text-canvas" /> : <Square className="w-4 h-4 text-text-secondary/30" />}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 3. Linguagem Arquitetónica */}
                        {formStep === 6 && (
                          <div className="space-y-6">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Estilo predominante</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {['Contemporânea', 'Tradicional', 'Minimalista', 'Vernacular', 'Industrial', 'Mediterrânica', 'Híbrida'].map(opt => (
                                <button
                                  key={opt}
                                  onClick={() => updateProjectLevel('technical', { architecturalLanguage: { ...project.technical.architecturalLanguage, language: opt as any }})}
                                  className={`p-6 border rounded-xl text-left transition-all ${
                                    project.technical.architecturalLanguage.language === opt ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main hover:border-text-secondary"
                                  }`}
                                >
                                  <span className="font-bold text-sm block">{opt}</span>
                                </button>
                              ))}
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Notas arquitetónicas</label>
                              <textarea 
                                value={project.technical.architecturalLanguage.architecturalNotes}
                                onChange={e => updateProjectLevel('technical', { architecturalLanguage: { ...project.technical.architecturalLanguage, architecturalNotes: e.target.value }})}
                                className="w-full px-4 py-3 bg-surface border border-border-main rounded-xl text-sm min-h-[120px] text-text-primary"
                                placeholder="Estratégia estética, inspirações..."
                              />
                            </div>
                          </div>
                        )}

                        {/* 4. Sistemas Construtivos */}
                        {formStep === 7 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Estrutura</label>
                                <div className="grid grid-cols-2 gap-2">
                                  {['Betão armado', 'Aço', 'Madeira', 'Alvenaria portante', 'Mista'].map(opt => (
                                    <button
                                      key={opt}
                                      onClick={() => updateProjectLevel('technical', { constructionSystems: { ...project.technical.constructionSystems, structure: opt as any }})}
                                      className={`p-3 border rounded-xl text-xs font-bold transition-all ${
                                        project.technical.constructionSystems.structure === opt ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main"
                                      }`}
                                    >
                                      {opt}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Cobertura</label>
                                <div className="grid grid-cols-2 gap-2">
                                  {['Inclinada (telha)', 'Plana (acessível)', 'Plana (não acessível)', 'Ajardinada (estratégica)'].map(opt => (
                                    <button
                                      key={opt}
                                      onClick={() => updateProjectLevel('technical', { constructionSystems: { ...project.technical.constructionSystems, roof: opt as any }})}
                                      className={`p-3 border rounded-xl text-xs font-bold transition-all ${
                                        project.technical.constructionSystems.roof === opt ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main"
                                      }`}
                                    >
                                      {opt}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="space-y-6">
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Fachadas</label>
                                <div className="grid grid-cols-2 gap-2">
                                  {['Revestimento ETICS', 'Pedra natural', 'Betão à vista', 'Madeira', 'Cerâmica', 'Metálica'].map(opt => (
                                    <button
                                      key={opt}
                                      onClick={() => {
                                        const current = project.technical.constructionSystems.facades;
                                        const updated = current.includes(opt) ? current.filter(f => f !== opt) : [...current, opt];
                                        updateProjectLevel('technical', { constructionSystems: { ...project.technical.constructionSystems, facades: updated }});
                                      }}
                                      className={`p-3 border rounded-xl text-[10px] font-bold uppercase transition-all ${
                                        project.technical.constructionSystems.facades.includes(opt) ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main"
                                      }`}
                                    >
                                      {opt}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Caixilharia</label>
                                <div className="grid grid-cols-3 gap-2">
                                  {['Alumínio', 'PVC', 'Madeira'].map(opt => (
                                    <button
                                      key={opt}
                                      onClick={() => updateProjectLevel('technical', { constructionSystems: { ...project.technical.constructionSystems, frames: opt as any }})}
                                      className={`p-3 border rounded-xl text-xs font-bold transition-all ${
                                        project.technical.constructionSystems.frames === opt ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main"
                                      }`}
                                    >
                                      {opt}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {formStep === 8 && (
                          <div className="space-y-8">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {['Standard', 'Elevado', 'Muito elevado', 'Passive House / NZEB'].map(opt => (
                                <button
                                  key={opt}
                                  onClick={() => updateProjectLevel('technical', { constructionSystems: { ...project.technical.constructionSystems, performanceLevel: opt } })}
                                  className={`p-6 border rounded-xl text-left transition-all ${
                                    project.technical.constructionSystems.performanceLevel === opt ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main hover:border-text-secondary"
                                  }`}
                                >
                                  <span className="font-bold text-sm block">{opt}</span>
                                </button>
                              ))}
                            </div>
                            <div className="pt-6 border-t border-border-main">
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {[
                                  'Isolamento reforçado', 'Fachada ventilada', 'Estrutura anti-sísmica reforçada', 
                                  'Construção modular', 'Pré-fabricação', 'Soluções bioclimáticas', 
                                  'Materiais naturais', 'Construção sustentável'
                                ].map(opt => (
                                  <button
                                    key={opt}
                                    onClick={() => toggleProjectMulti('technical', 'constructionSystems.performanceFeatures', opt)}
                                    className={`p-4 border rounded-xl text-left transition-all flex items-center justify-between ${
                                      project.technical.constructionSystems.performanceFeatures?.includes(opt) ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main hover:border-text-secondary"
                                    }`}
                                  >
                                    <span className="font-bold text-[10px] uppercase tracking-widest">{opt}</span>
                                    {project.technical.constructionSystems.performanceFeatures?.includes(opt) ? <CheckSquare className="w-4 h-4 text-canvas" /> : <Square className="w-4 h-4 text-text-secondary/30" />}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 5. Eficiência Energética */}
                        {formStep === 9 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {[
                              'Painéis solares', 'Bomba de calor', 'Piso radiante', 
                              'Ventilação mecânica', 'Domótica', 'Reaproveitamento águas pluviais', 
                              'Elevado desempenho térmico'
                            ].map(opt => (
                              <button
                                key={opt}
                                onClick={() => {
                                  const current = project.technical.energyEfficiency;
                                  const updated = current.includes(opt) ? current.filter(o => o !== opt) : [...current, opt];
                                  updateProjectLevel('technical', { energyEfficiency: updated });
                                }}
                                className={`p-6 border rounded-xl text-left transition-all flex items-center justify-between ${
                                  project.technical.energyEfficiency.includes(opt) ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main hover:border-text-secondary"
                                }`}
                              >
                                <span className="font-bold text-sm block">{opt}</span>
                                {project.technical.energyEfficiency.includes(opt) ? <CheckSquare className="w-4 h-4 text-canvas" /> : <Square className="w-4 h-4 text-text-secondary/30" />}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* 6. Infraestruturas */}
                        {formStep === 10 && (
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                              {[
                                'Rede pública água', 'Rede pública saneamento', 'Rede elétrica', 
                                'ITED', 'Gás', 'Fossa séptica', 'PT privado',
                                ...(project.base.features.pool ? ['Filtração Piscina', 'Hidráulica Piscina'] : []),
                                ...(project.base.features.basement ? ['Impermeabilização Cave', 'Drenagem Perimetral'] : [])
                              ].map(opt => (
                                <button
                                  key={opt}
                                  onClick={() => {
                                    const current = project.technical.infrastructure;
                                    const updated = current.includes(opt) ? current.filter(o => o !== opt) : [...current, opt];
                                    updateProjectLevel('technical', { infrastructure: updated });
                                  }}
                                  className={`p-6 border rounded-xl text-left transition-all flex items-center justify-between ${
                                    project.technical.infrastructure.includes(opt) ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main hover:border-text-secondary"
                                  }`}
                                >
                                  <span className="font-bold text-sm block">{opt}</span>
                                  {project.technical.infrastructure.includes(opt) ? <CheckSquare className="w-4 h-4 text-canvas" /> : <Square className="w-4 h-4 text-text-secondary/30" />}
                                </button>
                              ))}
                            </div>
                            {(project.base.features.pool || project.base.features.basement) && (
                              <div className="p-4 bg-accent/5 border border-accent/10 rounded-xl flex gap-3">
                                <Wrench className="w-5 h-5 text-accent shrink-0" />
                                <p className="text-[10px] text-text-secondary leading-normal italic">
                                  {project.base.features.pool && "Foram adicionados requisitos de engenharia para piscina. "}
                                  {project.base.features.basement && "Foram adicionados requisitos de impermeabilização e drenagem para a cave."}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* 7. Acessibilidades */}
                        {formStep === 11 && (
                          <div className="space-y-8">
                            <div className="space-y-4">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">O projeto está sujeito ao DL acessibilidades?</label>
                              <div className="grid grid-cols-3 gap-4">
                                {['Sim', 'Não', 'Parcialmente'].map(opt => (
                                  <button
                                    key={opt}
                                    onClick={() => updateProjectLevel('technical', { accessibility: { ...project.technical.accessibility, subject: opt as any }})}
                                    className={`p-6 border rounded-xl text-left transition-all ${
                                      project.technical.accessibility.subject === opt ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main hover:border-text-secondary"
                                    }`}
                                  >
                                    <span className="font-bold text-sm block">{opt}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-border-main pt-8">
                              {[
                                { label: 'Existe percurso acessível?', key: 'hasAccessibleRoute' },
                                { label: 'Existe instalação sanitária acessível?', key: 'hasAccessibleBathroom' },
                                { label: 'Existe elevador?', key: 'hasElevator' }
                              ].map(item => (
                                <button
                                  key={item.key}
                                  onClick={() => updateProjectLevel('technical', { accessibility: { ...project.technical.accessibility, [item.key]: !project.technical.accessibility[item.key as keyof typeof project.technical.accessibility] }})}
                                  className={`p-6 border rounded-xl text-left transition-all flex items-center justify-between ${
                                    project.technical.accessibility[item.key as keyof typeof project.technical.accessibility] ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main hover:border-text-secondary"
                                  }`}
                                >
                                  <span className="font-bold text-xs">{item.label}</span>
                                  {project.technical.accessibility[item.key as keyof typeof project.technical.accessibility] ? <CheckCircle2 className="w-4 h-4 text-canvas" /> : <Circle className="w-4 h-4 text-text-secondary/30" />}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 8. Segurança Contra Incêndio */}
                        {formStep === 12 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Utilização-tipo</label>
                              <div className="grid grid-cols-1 gap-2">
                                {(project.technical.typology === 'Housing' || project.technical.typology === 'Multifamily' 
                                  ? ['Habitação'] 
                                  : project.technical.typology === 'Commerce' 
                                  ? ['Comércio', 'Serviços', 'Mista']
                                  : project.technical.typology === 'Tourism'
                                  ? ['Turismo', 'Mista']
                                  : ['Habitação', 'Comércio', 'Serviços', 'Turismo', 'Mista']
                                ).map(opt => (
                                  <button
                                    key={opt}
                                    onClick={() => updateProjectLevel('technical', { fireSafety: { ...project.technical.fireSafety, usageType: opt as any }})}
                                    className={`p-4 border rounded-xl text-left transition-all ${
                                      project.technical.fireSafety.usageType === opt ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main hover:border-text-secondary"
                                    }`}
                                  >
                                    <span className="font-bold text-sm block">{opt}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-4">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Categoria de risco</label>
                              <div className="grid grid-cols-1 gap-2">
                                {['1ª', '2ª', '3ª', '4ª', 'Não aplicável'].map(opt => (
                                  <button
                                    key={opt}
                                    onClick={() => updateProjectLevel('technical', { fireSafety: { ...project.technical.fireSafety, riskCategory: opt as any }})}
                                    className={`p-4 border rounded-xl text-left transition-all ${
                                      project.technical.fireSafety.riskCategory === opt ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main hover:border-text-secondary"
                                    }`}
                                  >
                                    <span className="font-bold text-sm block">{opt}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 9. Integração Paisagística */}
                        {formStep === 13 && (
                          <div className="space-y-8">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                              {[
                                { label: 'Manutenção vegetação?', key: 'maintainVegetation' },
                                { label: 'Novas zonas ajardinadas?', key: 'newGardenZones' },
                                { label: 'Muros?', key: 'walls' },
                                { label: 'Pavimentos exteriores?', key: 'exteriorPavements' }
                              ].map(item => (
                                <button
                                  key={item.key}
                                  onClick={() => updateProjectLevel('technical', { landscapeIntegration: { ...project.technical.landscapeIntegration, [item.key]: !project.technical.landscapeIntegration[item.key as keyof typeof project.technical.landscapeIntegration] }})}
                                  className={`p-6 border rounded-xl text-center transition-all ${
                                    project.technical.landscapeIntegration[item.key as keyof typeof project.technical.landscapeIntegration] ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main hover:border-text-secondary"
                                  }`}
                                >
                                  <span className="font-bold text-[10px] uppercase tracking-widest">{item.label}</span>
                                </button>
                              ))}
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Estratégia de integração paisagística</label>
                              <textarea 
                                value={project.technical.landscapeIntegration.landscapeStrategy}
                                onChange={e => updateProjectLevel('technical', { landscapeIntegration: { ...project.technical.landscapeIntegration, landscapeStrategy: e.target.value }})}
                                className="w-full px-6 py-4 bg-surface border border-border-main rounded-xl text-sm min-h-[150px] text-text-primary"
                                placeholder="Descreva a relação com o exterior..."
                              />
                            </div>
                          </div>
                        )}

                        {/* 10. Condicionantes Técnicas */}
                        {formStep === 14 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                              'Declive acentuado', 'REN/RAN', 'Servidões', 
                              'Faixa incêndio', 'Zona histórica', 'Proximidade marítima', 
                              'Lençol freático', 'Nenhuma'
                            ].map(opt => (
                              <button
                                key={opt}
                                onClick={() => {
                                  const current = project.technical.technicalConstraints;
                                  const updated = current.includes(opt) ? current.filter(o => o !== opt) : [...current, opt];
                                  updateProjectLevel('technical', { technicalConstraints: updated });
                                }}
                                className={`p-6 border rounded-xl text-left transition-all flex items-center justify-between ${
                                  project.technical.technicalConstraints.includes(opt) ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main hover:border-text-secondary"
                                }`}
                              >
                                <span className="font-bold text-sm block">{opt}</span>
                                {project.technical.technicalConstraints.includes(opt) ? <CheckSquare className="w-4 h-4 text-canvas" /> : <Square className="w-4 h-4 text-text-secondary/30" />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {activeLevel === 'legal' && (
                      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* 0. Enquadramento Legal & Procedimento */}
                        {formStep === 0 && (
                          <div className="space-y-8">
                            {/* Inherited Context - Read Only */}
                            <div className="bg-surface border border-border-main rounded-2xl overflow-hidden">
                              <div className="bg-accent/10 px-6 py-3 border-b border-border-main flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-accent flex items-center gap-2">
                                  <Lock className="w-3 h-3" /> Contexto Operacional Herdado (Níveis 1 e 2)
                                </span>
                                <span className="text-[10px] font-bold text-text-secondary italic">Apenas para leitura</span>
                              </div>
                              <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="space-y-1">
                                  <span className="text-[10px] text-text-secondary uppercase font-bold">Tipo de Operação</span>
                                  <p className="text-sm font-bold text-text-primary">{project.base.interventionType}</p>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[10px] text-text-secondary uppercase font-bold">Localização</span>
                                  <p className="text-sm font-bold text-text-primary">{project.base.location.municipality}, {project.base.location.parish}</p>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[10px] text-text-secondary uppercase font-bold">Coordenação</span>
                                  <p className="text-sm font-bold text-text-primary">
                                    {project.operational.technicalCoordination === 'Sim' ? 'Gabinete assume coordenação' : 'Apenas arquitetura'}
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[10px] text-text-secondary uppercase font-bold">Âmbito do Projeto</span>
                                  <p className="text-sm font-bold text-text-primary truncate">{project.operational.contractedPhases.join(', ')}</p>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Tipo de Procedimento Administrativo</label>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {['Licenciamento', 'Comunicação Prévia'].map(opt => (
                                  <button
                                    key={opt}
                                    onClick={() => updateProjectLevel('legal', { procedureType: opt as any })}
                                    className={`p-6 border rounded-xl text-left transition-all ${
                                      project.legal.procedureType === opt ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main hover:border-text-secondary"
                                    }`}
                                  >
                                    <span className="font-bold text-lg block">{opt}</span>
                                    <span className={`text-[10px] uppercase tracking-widest mt-1 block ${project.legal.procedureType === opt ? 'text-gray-400' : 'text-gray-500'}`}>
                                      {opt === 'Licenciamento' ? 'Controlo preventivo camarário (RJUE)' : 'Controlo sucessivo com termo de responsabilidade'}
                                    </span>
                                  </button>
                                ))}
                              </div>
                              {project.legal.procedureType === 'Comunicação Prévia' && (
                                <div className="p-4 bg-orange-50/10 border border-orange-500/20 rounded-xl flex gap-3">
                                  <ShieldAlert className="w-5 h-5 text-orange-500 shrink-0" />
                                  <p className="text-[10px] text-text-secondary leading-normal">
                                    <strong className="text-orange-500 uppercase block mb-1">Atenção Jurídica</strong>
                                    A Comunicação Prévia transfere a responsabilidade para os técnicos. O sistema adaptará as cláusulas de responsabilidade e o faseamento de entregas para refletir este regime.
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="space-y-4">
                               <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Tipo de Operação Urbanística</label>
                               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                                 {['Construção Nova', 'Alteração', 'Ampliação', 'Reconstrução', 'Demolição', 'Legalização'].map(opt => (
                                   <button
                                     key={opt}
                                     onClick={() => updateProjectLevel('legal', { urbanOperationType: opt as any })}
                                     className={`p-4 border rounded-xl text-center transition-all ${
                                       project.legal.urbanOperationType === opt ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main hover:border-text-secondary"
                                     }`}
                                   >
                                     <span className="font-bold text-xs block">{opt}</span>
                                   </button>
                                 ))}
                               </div>
                               <div className="p-4 bg-accent/5 border border-accent/10 rounded-xl flex gap-3">
                                 <Info className="w-5 h-5 text-accent shrink-0" />
                                 <p className="text-[10px] text-text-secondary leading-normal italic">
                                   O Tipo de Operação Urbanística é juridicamente distinto do procedimento de Licenciamento ou Comunicação Prévia.
                                 </p>
                               </div>
                             </div>
                          </div>
                        )}

                        {/* 1. Identificação Predial */}
                        {formStep === 1 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Artigo matricial</label>
                                <input 
                                  type="text" 
                                  value={project.legal.propertyIdentification.matricialArticle}
                                  onChange={e => updateProjectLevel('legal', { propertyIdentification: { ...project.legal.propertyIdentification, matricialArticle: e.target.value }})}
                                  className="w-full px-4 py-3 bg-surface border border-border-main rounded-xl font-bold text-text-primary focus:ring-1 focus:ring-accent outline-none"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Descrição predial</label>
                                <input 
                                  type="text" 
                                  value={project.legal.propertyIdentification.propertyDescription}
                                  onChange={e => updateProjectLevel('legal', { propertyIdentification: { ...project.legal.propertyIdentification, propertyDescription: e.target.value }})}
                                  className="w-full px-4 py-3 bg-surface border border-border-main rounded-xl font-bold text-text-primary focus:ring-1 focus:ring-accent outline-none"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Conservatória</label>
                                <input 
                                  type="text" 
                                  value={project.legal.propertyIdentification.conservatory}
                                  onChange={e => updateProjectLevel('legal', { propertyIdentification: { ...project.legal.propertyIdentification, conservatory: e.target.value }})}
                                  className="w-full px-4 py-3 bg-surface border border-border-main rounded-xl font-bold text-text-primary focus:ring-1 focus:ring-accent outline-none"
                                />
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Código certidão permanente</label>
                                <input 
                                  type="text" 
                                  value={project.legal.propertyIdentification.permanentCertificateCode}
                                  onChange={e => updateProjectLevel('legal', { propertyIdentification: { ...project.legal.propertyIdentification, permanentCertificateCode: e.target.value }})}
                                  className="w-full px-4 py-3 bg-surface border border-border-main rounded-xl font-bold text-text-primary focus:ring-1 focus:ring-accent outline-none"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Área do terreno (m²)</label>
                                <input 
                                  type="number" 
                                  value={project.legal.propertyIdentification.landArea}
                                  onChange={e => updateProjectLevel('legal', { propertyIdentification: { ...project.legal.propertyIdentification, landArea: Number(e.target.value) }})}
                                  className="w-full px-4 py-3 bg-surface border border-border-main rounded-xl font-bold text-text-primary focus:ring-1 focus:ring-accent outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 2. Titularidade */}
                        {formStep === 2 && (
                          <div className="space-y-4">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">O requerente é:</label>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                              {['Proprietário', 'Coproprietário', 'Usufrutuário', 'Representante', 'Promotor'].map(opt => (
                                <button
                                  key={opt}
                                  onClick={() => updateProjectLevel('legal', { ownerType: opt as any })}
                                  className={`p-6 border rounded-xl text-center transition-all ${
                                    project.legal.ownerType === opt ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main hover:border-text-secondary"
                                  }`}
                                >
                                  <span className="font-bold text-xs block">{opt}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 3. Regime Legal Aplicável */}
                        {formStep === 3 && (
                          <div className="space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                              {[
                                'RJUE', 'RGEU', 'PDM', 'Regulamento loteamento', 
                                'SCIE', 'Acessibilidades', 'Térmica', 'Acústica'
                              ].map(opt => (
                                <button
                                  key={opt}
                                  onClick={() => {
                                    const current = project.legal.legalRegime;
                                    const updated = current.includes(opt) ? current.filter(o => o !== opt) : [...current, opt];
                                    updateProjectLevel('legal', { legalRegime: updated });
                                  }}
                                  className={`p-6 border rounded-xl text-left transition-all flex items-center justify-between ${
                                    project.legal.legalRegime.includes(opt) ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main hover:border-text-secondary"
                                  }`}
                                >
                                  <span className="font-bold text-sm block">{opt}</span>
                                  {project.legal.legalRegime.includes(opt) ? <CheckSquare className="w-4 h-4 text-canvas" /> : <Square className="w-4 h-4 text-text-secondary/30" />}
                                </button>
                              ))}
                            </div>

                            <div className="space-y-4">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Entidade Coordenadora do Projeto</label>
                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                {['Atelier responsável', 'Técnico externo', 'Empresa coordenadora', 'Não definido'].map(opt => (
                                  <button
                                    key={opt}
                                    onClick={() => updateProjectLevel('legal', { coordinationEntity: opt as any })}
                                    className={`p-6 border rounded-xl text-center transition-all ${
                                      project.legal.coordinationEntity === opt ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main hover:border-text-secondary"
                                    }`}
                                  >
                                    <span className="font-bold text-xs block">{opt}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 4. Declarações Técnicas */}
                        {formStep === 4 && (
                          <div className="space-y-4">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">O técnico declara que:</label>
                            <div className="grid grid-cols-1 gap-3">
                              {[
                                'O projeto cumpre normas legais aplicáveis', 
                                'O projeto respeita instrumentos de gestão territorial', 
                                'O projeto respeita servidões e restrições', 
                                'Foram observadas normas técnicas em vigor'
                              ].map(opt => (
                                <button
                                  key={opt}
                                  onClick={() => {
                                    const current = project.legal.technicalDeclarations;
                                    const updated = current.includes(opt) ? current.filter(o => o !== opt) : [...current, opt];
                                    updateProjectLevel('legal', { technicalDeclarations: updated });
                                  }}
                                  className={`p-4 border rounded-xl text-left transition-all flex items-center justify-between ${
                                    project.legal.technicalDeclarations.includes(opt) ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main hover:border-text-secondary"
                                  }`}
                                >
                                  <span className="font-bold text-sm block">{opt}</span>
                                  {project.legal.technicalDeclarations.includes(opt) ? <CheckCircle2 className="w-4 h-4 text-canvas" /> : <Circle className="w-4 h-4 text-text-secondary/30" />}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 5. Seguro de Responsabilidade Civil */}
                        {formStep === 5 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Nº apólice</label>
                              <input 
                                type="text" 
                                value={project.legal.liabilityInsurance.policyNumber}
                                onChange={e => updateProjectLevel('legal', { liabilityInsurance: { ...project.legal.liabilityInsurance, policyNumber: e.target.value }})}
                                className="w-full px-4 py-3 bg-surface border border-border-main rounded-xl font-bold text-text-primary focus:ring-accent focus:border-accent outline-none transition-all"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Seguradora</label>
                              <input 
                                type="text" 
                                value={project.legal.liabilityInsurance.insurer}
                                onChange={e => updateProjectLevel('legal', { liabilityInsurance: { ...project.legal.liabilityInsurance, insurer: e.target.value }})}
                                className="w-full px-4 py-3 bg-surface border border-border-main rounded-xl font-bold text-text-primary focus:ring-accent focus:border-accent outline-none transition-all"
                              />
                            </div>
                          </div>
                        )}

                        {/* 6. Validade da Apólice */}
                        {formStep === 6 && (
                          <div className="max-w-md">
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Data de Validade</label>
                              <input 
                                type="date" 
                                value={project.legal.liabilityInsurance.validity}
                                onChange={e => updateProjectLevel('legal', { liabilityInsurance: { ...project.legal.liabilityInsurance, validity: e.target.value }})}
                                className="w-full px-6 py-4 bg-surface border border-border-main rounded-xl font-bold text-text-primary focus:ring-accent focus:border-accent outline-none transition-all"
                              />
                            </div>
                          </div>
                        )}

                        {/* 7. Elementos Entregues */}
                        {formStep === 7 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[
                              'Projeto de Arquitetura', 'Memória Descritiva', 'Termo Responsabilidade', 
                              'Certidão Permanente', 'Caderneta Predial', 'Alvará de Loteamento', 
                              'Levantamento Topográfico', 'Fotografias do Imóvel'
                            ].map(opt => (
                              <button
                                key={opt}
                                onClick={() => {
                                  const current = project.legal.deliveredElements;
                                  const updated = current.includes(opt) ? current.filter(o => o !== opt) : [...current, opt];
                                  updateProjectLevel('legal', { deliveredElements: updated });
                                }}
                                className={`p-4 border rounded-xl text-left transition-all flex items-center justify-between ${
                                  project.legal.deliveredElements.includes(opt) ? "bg-accent text-canvas border-accent" : "bg-surface border-border-main hover:border-text-secondary"
                                }`}
                              >
                                <span className="font-bold text-[10px] uppercase tracking-widest">{opt}</span>
                                {project.legal.deliveredElements.includes(opt) ? <CheckSquare className="w-4 h-4 text-canvas" /> : <PlusCircle className="w-4 h-4 text-text-secondary/30" />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-8 border-t border-border-main flex justify-between">
                    <button 
                      onClick={() => {
                        if (formStep > 0) {
                          let prevS = formStep - 1;
                          
                          // BASE LEVEL SKIPS
                          if (activeLevel === 'base') {
                            if (prevS === 7 && project.technical.typology === 'Multifamily') prevS = 6;
                          }
                          
                          // TECHNICAL LEVEL SKIPS
                          if (activeLevel === 'technical') {
                            const isApartment = project.technical.typology === 'Multifamily';
                            const isAlteration = project.base.interventionType === 'Alteração' || project.base.interventionType === 'Reabilitação';
                            if (isApartment || isAlteration) {
                              if (prevS === 13) prevS = 12;
                            }
                          }

                          setFormStep(prevS);
                        } else {
                          if (returnToStep !== null) {
                            setStep(returnToStep);
                            setReturnToStep(null);
                          } else {
                            // Normal flow
                            if (activeLevel !== 'base') {
                              setStep(3);
                            } else if (activeLevel === 'base') {
                              setStep(1);
                            } else {
                              setStep(3);
                            }
                          }
                        }
                      }}
                      className="flex items-center gap-2 text-text-secondary px-6 py-3 rounded-md border border-border-main hover:bg-surface transition-colors uppercase text-[10px] font-bold tracking-widest"
                    >
                      <ChevronLeft className="w-3 h-3" /> Anterior
                    </button>
                    <button 
                       onClick={() => {
                          const totalSteps: Record<string, number> = { base: 10, operational: 6, commercial: 10, technical: 15, legal: 8 };
                         if (formStep < totalSteps[activeLevel] - 1) {
                            let nextS = formStep + 1;
                            
                            // BASE LEVEL SKIPS
                            if (activeLevel === 'base') {
                              if (nextS === 7 && project.technical.typology === 'Multifamily') {
                                nextS = 8;
                              }
                            }
                            
                            // TECHNICAL LEVEL SKIPS
                            if (activeLevel === 'technical') {
                              const isApartment = project.technical.typology === 'Multifamily';
                              const isAlteration = project.base.interventionType === 'Alteração' || project.base.interventionType === 'Reabilitação';
                              if (isApartment || isAlteration) {
                                if (nextS === 13) nextS = 14;
                              }
                            }

                            setFormStep(nextS);
                          } else {
                          // Complete Level
                          setProject(prev => {
                              const updatedProject = {
                                  ...prev,
                                  [activeLevel]: {
                                      ...(prev[activeLevel] as any),
                                      status: ProjectLevelStatus.COMPLETED
                                  }
                              };

                              // If we are editing a client's base data, save it back to the client
                              const editingClientId = localStorage.getItem('arqdoc_editing_client_id');
                              if (editingClientId && activeLevel === 'base') {
                                setClients(clientsPrev => clientsPrev.map(c => 
                                  c.id === editingClientId ? { ...c, baseData: updatedProject.base } : c
                                ));
                                localStorage.removeItem('arqdoc_editing_client_id');
                                // After saving client data, return to clients view
                                navigateTo('clients');
                              }

                              return updatedProject;
                          });
                          if (returnToStep !== null) {
                            setStep(returnToStep);
                            setReturnToStep(null);
                          } else if (activeLevel === 'base') {
                            setStep(2);
                          } else {
                            setStep(3);
                          }
                        }
                      }}
                      className="flex items-center gap-2 bg-accent text-canvas px-10 py-4 rounded-md hover:opacity-90 transition-all font-bold shadow-xl shadow-black/10 text-lg"
                    >
                      {formStep === ({ base: 10, operational: 6, commercial: 10, technical: 15, legal: 8 } as any)[activeLevel] - 1 ? (
                        activeLevel === 'base' ? (
                          <>Configuração do Gabinete <ChevronRight className="w-4 h-4" /></>
                        ) : (
                          <>Concluir Nível <CheckCircle2 className="w-4 h-4" /></>
                        )
                      ) : (
                        <>Próximo <ChevronRight className="w-4 h-4" /></>
                      )}
                    </button>
                  </div>
                </motion.div>
              ) : step === 2 ? (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="space-y-2">
                    <h2 className="text-4xl font-light tracking-tight text-text-primary font-display">Configuração do Gabinete</h2>
                    <p className="text-text-secondary text-lg">Defina o estilo e os serviços incluídos.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 items-stretch">
                    <div className="flex flex-col space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-text-secondary">Nome do Gabinete</label>
                        <input 
                          type="text" 
                          value={office.name || ''}
                          onChange={e => {
                            const val = e.target.value;
                            setOffice(prev => ({ ...prev, name: val }));
                          }}
                          className="w-full px-4 py-3 bg-surface text-text-primary border border-border-main rounded-md focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="text-xs font-bold uppercase tracking-widest text-text-secondary">Modelo de Honorários</label>
                        <div className="grid grid-cols-2 gap-4">
                          <button 
                            onClick={() => setOffice(prev => ({ ...prev, feeMethod: 'sqm' }))}
                            className={`flex flex-col items-center gap-2 p-4 border rounded-md transition-all ${
                              office.feeMethod === 'sqm' ? 'bg-accent text-canvas border-accent' : 'bg-surface text-text-primary border-border-main hover:border-text-secondary'
                            }`}
                          >
                            <span className="text-xs font-bold">€ / m²</span>
                            <span className="text-[10px] uppercase opacity-60 font-medium">Fixo por Área</span>
                          </button>
                          <button 
                            onClick={() => setOffice(prev => ({ ...prev, feeMethod: 'percentage' }))}
                            className={`flex flex-col items-center gap-2 p-4 border rounded-md transition-all ${
                              office.feeMethod === 'percentage' ? 'bg-accent text-canvas border-accent' : 'bg-surface text-text-primary border-border-main hover:border-text-secondary'
                            }`}
                          >
                            <span className="text-xs font-bold">%</span>
                            <span className="text-[10px] uppercase opacity-60 font-medium">Sobre Obra</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-text-secondary min-h-[32px] flex items-end pb-1">
                            {office.feeMethod === 'sqm' ? 'Valor (€/m²)' : 'Percentagem (%)'}
                          </label>
                          <div className="relative">
                            {office.feeMethod === 'sqm' ? (
                              <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                            ) : (
                              <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                            )}
                            <input 
                              type="number" 
                              value={office.feeValue ?? ''}
                              onChange={e => {
                                const val = Number(e.target.value);
                                setOffice({...office, feeValue: Number.isNaN(val) ? 0 : val});
                              }}
                              className="w-full pl-10 pr-4 py-3 bg-surface text-text-primary border border-border-main rounded-md focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-text-secondary min-h-[32px] flex items-end pb-1">Custo Construção (€/m²)</label>
                          <div className="relative">
                            <Calculator className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                            <input 
                              type="number" 
                              value={office.baseConstructionCost ?? ''}
                              onChange={e => {
                                const val = Number(e.target.value);
                                setOffice({...office, baseConstructionCost: Number.isNaN(val) ? 0 : val});
                              }}
                              className="w-full pl-10 pr-4 py-3 bg-surface text-text-primary border border-border-main rounded-md focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 space-y-4 border-t border-border-main">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-bold uppercase tracking-widest text-text-secondary">Identificação Profissional</label>
                          <span className="text-[10px] text-green-600 font-bold uppercase tracking-widest">Obrigatório para Termo</span>
                        </div>
                        
                        <button 
                          onClick={() => setShowLegalIdentity(true)}
                          className="w-full flex items-center justify-between p-4 bg-surface border border-border-main rounded-lg hover:border-text-secondary transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-surface-secondary rounded-full group-hover:bg-accent border border-transparent group-hover:border-accent transition-all">
                              <FileBadge className="w-5 h-5 text-text-secondary group-hover:text-canvas" />
                            </div>
                            <div className="text-left">
                              <p className="text-sm font-semibold text-text-primary">Configurar Identidade Legal</p>
                              <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-0.5">
                                {office.officeLegalIdentity?.architectName ? 'Dados preenchidos' : 'Dados em falta'}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-text-secondary" />
                        </button>
                      </div>

                      <div className="pt-4 space-y-4 border-t border-border-main text-text-primary">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-bold uppercase tracking-widest text-text-secondary">Distribuição Financeira Padrão</label>
                          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                            office.defaultFeeDistribution?.reduce((acc, i) => acc + i.percentage, 0) === 100 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            Total: {office.defaultFeeDistribution?.reduce((acc, i) => acc + i.percentage, 0) || 0}%
                          </span>
                        </div>
                        <p className="text-[10px] text-text-secondary leading-tight italic">
                          Define a percentagem de honorários por fase para pré-carregamento em propostas.
                        </p>
                        <div className="space-y-2">
                          {(office.defaultFeeDistribution || []).map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between gap-4 p-3 bg-surface border border-border-main rounded-lg transition-colors">
                              <span className="text-xs font-bold text-text-primary">{item.label}</span>
                              <div className="flex items-center gap-2">
                                <input 
                                  type="number"
                                  value={item.percentage}
                                  onChange={e => {
                                    const val = Number(e.target.value);
                                    const next = [...office.defaultFeeDistribution];
                                    next[idx] = { ...next[idx], percentage: val };
                                    setOffice({ ...office, defaultFeeDistribution: next });
                                  }}
                                  className="w-16 px-2 py-1 bg-surface border border-border-main rounded text-right text-xs font-bold focus:border-accent outline-none"
                                />
                                <span className="text-[10px] font-bold text-text-secondary">%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-bold uppercase tracking-widest text-text-secondary">Documentos de Referência</label>
                          {office.styleConfidenceScore > 0 && (
                            <div className="flex items-center gap-1.5">
                              <div className="w-20 h-1.5 bg-surface-secondary rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-1000 ${
                                    office.styleConfidenceScore > 70 ? 'bg-green-500' : 
                                    office.styleConfidenceScore > 40 ? 'bg-amber-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${Number.isFinite(office.styleConfidenceScore) ? office.styleConfidenceScore : 0}%` }}
                                />
                              </div>
                              <span className="text-[9px] font-bold uppercase tracking-widest text-text-secondary">Estilo: {Math.round(office.styleConfidenceScore || 0)}%</span>
                            </div>
                          )}
                        </div>
                        
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-border-main rounded-lg p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-accent hover:bg-surface-secondary transition-all group"
                        >
                          <div className="p-3 bg-surface-secondary rounded-full group-hover:bg-surface border border-transparent group-hover:border-border-main transition-all">
                            <Upload className="w-6 h-6 text-text-secondary group-hover:text-accent" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-semibold text-text-primary">Anexar ficheiros do atelier</p>
                            <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-1">DOCX, TXT ou PDF (Texto extraído)</p>
                          </div>
                          <input 
                            type="file" 
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            multiple
                            className="hidden"
                            accept=".docx,.txt"
                          />
                        </div>

                        {uploadedFiles.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Ficheiros Carregados ({uploadedFiles.length})</p>
                            <div className="bg-surface border border-border-main rounded-md overflow-hidden">
                              {uploadedFiles.map((f, i) => (
                                <div key={i} className="flex justify-between items-center px-4 py-2 border-b border-border-main last:border-0 hover:bg-surface-secondary transition-colors">
                                  <div className="flex items-center gap-2 overflow-hidden">
                                    <FileUp className="w-3 h-3 text-text-secondary shrink-0" />
                                    <span className="text-xs font-medium truncate text-text-primary">{f.name}</span>
                                  </div>
                                  <button 
                                    onClick={() => removeFile(i)}
                                    className="p-1 hover:bg-red-500/10 text-text-secondary hover:text-red-500 rounded transition-colors"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="pt-2">
                          <p className="text-[10px] text-text-secondary leading-relaxed">
                            A IA analisará o vocabulário, estrutura e ritmo destes documentos para garantir que a saída final parece escrita pelo seu gabinete.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col h-full overflow-hidden">
                      <div className="flex items-center justify-between shrink-0 mb-4">
                        <label className="text-xs font-bold uppercase tracking-widest text-text-secondary">Biblioteca de Serviços do Gabinete</label>
                        <div className="flex items-center gap-2">
                          {deletedServices.length > 0 && (
                            <button 
                              onClick={() => setShowRestoreList(!showRestoreList)}
                              className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border transition-all ${
                                showRestoreList 
                                  ? "bg-text-primary text-surface border-text-primary" 
                                  : "bg-surface-secondary text-text-primary border-border-main hover:opacity-70"
                              }`}
                            >
                              <RotateCcw className="w-3 h-3" /> Restaurar
                            </button>
                          )}
                          <button 
                            onClick={addLibraryService}
                            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-text-primary hover:opacity-70 bg-surface-secondary px-2 py-1 rounded border border-border-main transition-all"
                          >
                            <Plus className="w-3 h-3" /> Novo
                          </button>
                        </div>
                      </div>

                      <AnimatePresence>
                        {showRestoreList && deletedServices.length > 0 && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mb-4 overflow-hidden"
                          >
                            <div className="p-4 bg-surface-secondary border border-dashed border-border-main rounded-lg space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-text-secondary italic">Serviços Apagados Recentemente</h4>
                                <button 
                                  onClick={() => setShowRestoreList(false)}
                                  className="text-[10px] font-bold uppercase tracking-widest text-text-secondary hover:text-text-primary"
                                >
                                  Fechar
                                </button>
                              </div>
                              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                {deletedServices.map(service => (
                                  <div key={service.id} className="flex items-center justify-between p-2 bg-surface rounded border border-border-main">
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-bold text-text-primary truncate">{service.name}</p>
                                      <p className="text-[10px] text-text-secondary truncate">{service.phase}</p>
                                    </div>
                                    <button 
                                      onClick={() => restoreLibraryService(service.id)}
                                      className="ml-4 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-text-primary hover:underline"
                                    >
                                      <RotateCcw className="w-2.5 h-2.5" /> Restaurar
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="space-y-2 flex-1 min-h-0 max-h-[1180px] overflow-y-auto pr-2 pb-2">
                        {(office.servicesLibrary || []).map(service => (
                          <div key={service.id} className="p-3 bg-surface border border-border-main rounded-lg space-y-3 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-text-secondary bg-surface-secondary px-1.5 py-0.5 rounded border border-border-main/50 transition-colors uppercase tracking-widest">{service.phase}</span>
                                <p className="text-xs font-bold text-text-primary">{service.name}</p>
                              </div>
                              <div className="flex items-center gap-1">
                                <button 
                                  onClick={() => deleteLibraryService(service.id)}
                                  className="p-1.5 text-text-secondary/50 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-2">
                              <input 
                                type="text"
                                value={service.name}
                                onChange={e => updateLibraryService(service.id, { name: e.target.value })}
                                className="w-full text-xs px-3 py-2 bg-surface border border-border-main rounded focus:border-accent transition-all text-text-primary outline-none"
                                placeholder="Nome do serviço"
                              />
                              <textarea 
                                value={service.description}
                                onChange={e => updateLibraryService(service.id, { description: e.target.value })}
                                className="w-full text-xs px-3 py-2 bg-surface border border-border-main rounded focus:border-accent transition-all min-h-[60px] text-text-primary outline-none"
                                placeholder="Descrição do serviço..."
                              />
                            </div>

                            <div className="flex items-center gap-4">
                              <button 
                                onClick={() => updateLibraryService(service.id, { isIncludedByDefault: !service.isIncludedByDefault })}
                                className="flex items-center gap-2 group"
                              >
                                {service.isIncludedByDefault ? (
                                  <CheckSquare className="w-4 h-4 text-accent" />
                                ) : (
                                  <Square className="w-4 h-4 text-text-secondary/30 group-hover:text-text-secondary/50" />
                                )}
                                <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Incluído por Omissão</span>
                              </button>
                              <button 
                                onClick={() => updateLibraryService(service.id, { isOptional: !service.isOptional })}
                                className="flex items-center gap-2 group"
                              >
                                {service.isOptional ? (
                                  <CheckSquare className="w-4 h-4 text-accent" />
                                ) : (
                                  <Square className="w-4 h-4 text-text-secondary/30 group-hover:text-text-secondary/50" />
                                )}
                                <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Opcional</span>
                              </button>
                            </div>

                            <div className="pt-2 border-t border-border-main/30 space-y-3">
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-text-secondary">Responsabilidades Arquiteto</label>
                                <textarea 
                                  value={service.architectResponsibilities || ''}
                                  onChange={e => updateLibraryService(service.id, { architectResponsibilities: e.target.value })}
                                  className="w-full text-[10px] px-3 py-2 bg-surface border border-border-main rounded focus:border-accent transition-all text-text-primary outline-none"
                                  placeholder="O arquiteto compromete-se a..."
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-text-secondary">Responsabilidades Cliente</label>
                                <textarea 
                                  value={service.clientResponsibilities || ''}
                                  onChange={e => updateLibraryService(service.id, { clientResponsibilities: e.target.value })}
                                  className="w-full text-[10px] px-3 py-2 bg-surface border border-border-main rounded focus:border-accent transition-all text-text-primary outline-none"
                                  placeholder="O cliente compromete-se a..."
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-border-main flex justify-between">
                    <button 
                      onClick={() => {
                        if (isEditingGlobalOffice) {
                            navigateTo('settings');
                        } else {
                            prevStep();
                        }
                      }} 
                      className="flex items-center gap-2 text-text-secondary px-6 py-3 rounded-md border border-border-main hover:bg-surface transition-colors uppercase text-[10px] font-bold tracking-widest"
                    >
                      <ChevronLeft className="w-3 h-3" /> {isEditingGlobalOffice ? 'Voltar às Configurações' : 'Retroceder'}
                    </button>
                    <button 
                      onClick={() => {
                        if (isEditingGlobalOffice) {
                            navigateTo('settings');
                        } else {
                            nextStep();
                        }
                      }}
                      className="flex items-center gap-2 bg-accent text-canvas px-8 py-3 rounded-md hover:opacity-90 transition-all font-bold shadow-sm"
                    >
                      {isEditingGlobalOffice ? 'Guardar e Sair' : 'Selecionar Documento'} <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ) : step === 3 ? (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="space-y-2">
                    <h2 className="text-4xl font-light tracking-tight text-text-primary font-display">Tipo de Documento</h2>
                    <p className="text-text-secondary text-lg">Escolha o documento que deseja gerar.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 pt-4">
                    {Object.values(DocumentType).map((type) => {
                      const isLocked = project.base.status !== ProjectLevelStatus.COMPLETED || project.operational.status !== ProjectLevelStatus.COMPLETED;
                      
                      return (
                        <button
                          key={type}
                          onClick={() => {
                            setDocType(type);
                          }}
                          className={`flex items-start gap-4 p-6 border rounded-lg text-left transition-all group ${
                            docType === type 
                              ? "bg-accent text-canvas border-accent" 
                              : "bg-surface border-border-main hover:border-accent transition-colors"
                          } ${isLocked ? "opacity-60 cursor-not-allowed" : ""}`}
                        >
                          <div className={`p-3 rounded-md transition-colors ${docType === type ? "bg-canvas/10" : "bg-surface-secondary text-text-secondary group-hover:text-text-primary"}`}>
                            {isLocked ? <Lock className="w-6 h-6" /> : (
                              <>
                                {type === DocumentType.MEMORIA_DESCRITIVA && <FileText className="w-6 h-6" />}
                                {type === DocumentType.TERMO_RESPONSABILIDADE && <FileBadge className="w-6 h-6" />}
                                {type === DocumentType.PROPOSTA_ARQUITETURA && <Files className="w-6 h-6" />}
                                {type === DocumentType.ESTIMATIVA_FINANCEIRA && <BarChart3 className="w-6 h-6" />}
                              </>
                            )}
                          </div>
                          <div>
                            <div className={`font-semibold text-lg ${docType === type ? "text-canvas" : "text-text-primary"}`}>{type}</div>
                            <p className={`text-sm mt-1 leading-relaxed ${docType === type ? "text-canvas/70" : "text-text-secondary"}`}>
                              {isLocked 
                                ? "Complete os Níveis 1 e 2 para desbloquear este documento."
                                : (
                                  <>
                                    {type === DocumentType.MEMORIA_DESCRITIVA && "Documento técnico detalhado para submissão municipal conforme legislação vigente."}
                                    {type === DocumentType.TERMO_RESPONSABILIDADE && "Declaração legal de responsabilidade técnica."}
                                    {type === DocumentType.PROPOSTA_ARQUITETURA && "Contrato de prestação de serviços com honorários, prazos e condições comerciais."}
                                    {type === DocumentType.ESTIMATIVA_FINANCEIRA && "Projeção de investimento, áreas, complexidade e encargos do projeto."}
                                  </>
                                )
                              }
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-8 border-t border-border-main flex justify-between">
                    <button onClick={prevStep} className="flex items-center gap-2 text-text-secondary px-6 py-3 rounded-md border border-border-main hover:bg-surface transition-colors uppercase text-[10px] font-bold tracking-widest">
                      <ChevronLeft className="w-3 h-3" /> Retroceder
                    </button>
                    <button 
                      onClick={generateDocument}
                      disabled={loading}
                      className="flex items-center gap-2 bg-accent text-canvas px-10 py-4 rounded-md hover:opacity-90 transition-all font-bold shadow-xl shadow-accent/20"
                    >
                      {loading ? (
                        <>A processar... <Clock className="w-5 h-5 animate-spin" /></>
                      ) : (
                        (() => {
                          if (project.base.status !== ProjectLevelStatus.COMPLETED || project.operational.status !== ProjectLevelStatus.COMPLETED) {
                            return <>Completar Nível 1 & 2 <ChevronRight className="w-5 h-5" /></>;
                          }

                          const status = (project as any)[
                            docType === DocumentType.PROPOSTA_ARQUITETURA ? 'commercial' :
                            docType === DocumentType.ESTIMATIVA_FINANCEIRA ? 'operational' : // Already checked but for status consistency
                            docType === DocumentType.MEMORIA_DESCRITIVA ? 'technical' : 'legal'
                          ].status;
 
                          if (status !== ProjectLevelStatus.COMPLETED) {
                            return <>Completar Dados <ChevronRight className="w-5 h-5" /></>;
                          }
                          return (
                            <>
                              {docType === DocumentType.PROPOSTA_ARQUITETURA ? 'Gerar Proposta' : 
                               docType === DocumentType.ESTIMATIVA_FINANCEIRA ? 'Gerar Estimativa' : 'Gerar Documento'}
                              <Sparkles className="w-5 h-5" />
                            </>
                          );
                        })()
                      )}
                    </button>
                  </div>
                </motion.div>
              ) : step === 10 ? (
                <motion.div 
                  key="step10"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="space-y-4">
                    <button 
                      onClick={() => setStep(3)}
                      className="flex items-center gap-2 text-gray-400 hover:text-text-primary transition-colors text-[10px] font-bold uppercase tracking-widest mb-4"
                    >
                      <ChevronLeft className="w-3 h-3" /> Voltar à Seleção
                    </button>
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                        Configuração Técnica
                      </div>
                      <h2 className="text-4xl font-light tracking-tight text-text-primary font-display">
                        Memória Descritiva
                      </h2>
                      <p className="text-gray-500 text-lg">
                        Configure o formato e as especificações técnicas da memória.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-12">
                    <div className="space-y-6">
                      <label className="text-xs font-bold uppercase tracking-widest text-text-primary transition-colors">Modo de Saída</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[MemoriaDescritivaType.LICENSING, MemoriaDescritivaType.SIMPLIFIED, MemoriaDescritivaType.BOTH].map(type => (
                          <button
                            key={type}
                            onClick={() => setProject({
                              ...project,
                              technical: { 
                                ...project.technical, 
                                config: { 
                                  ...(project.technical.config || {
                                    constructionSystem: 'Betão Armado',
                                    roofType: 'Plana (Terraço)',
                                    exteriorFinish: 'ETICS (Capoto)'
                                  }), 
                                  type 
                                } 
                              }
                            })}
                            className={`p-6 border rounded-xl text-left transition-all ${
                              project.technical.config?.type === type
                                ? "bg-accent text-canvas border-accent scale-[1.02]"
                                : "bg-surface border-border-main hover:border-text-secondary"
                            }`}
                          >
                            <span className="font-bold block text-sm mb-1">{type === MemoriaDescritivaType.LICENSING ? 'Licenciamento RJUE' : type === MemoriaDescritivaType.SIMPLIFIED ? 'Simplificada Cliente' : 'Ambas as versões'}</span>
                            <span className={`text-[10px] leading-tight block ${project.technical.config?.type === type ? 'text-canvas/70' : 'text-text-secondary'}`}>
                              {type === MemoriaDescritivaType.LICENSING && "Texto formal e técnico pronto para submissão municipal."}
                              {type === MemoriaDescritivaType.SIMPLIFIED && "Linguagem simples e pedagógica focada no Dono de Obra."}
                              {type === MemoriaDescritivaType.BOTH && "Geração simultânea dos dois formatos com coerência total."}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-border-main">
                      <div className="space-y-4">
                        <label className="text-xs font-bold uppercase tracking-widest text-text-primary">Sistema Estrutural</label>
                        <select 
                          value={project.technical.config.constructionSystem}
                          onChange={e => setProject({
                            ...project,
                            technical: { ...project.technical, config: { ...project.technical.config, constructionSystem: e.target.value as any } }
                          })}
                          className="w-full px-4 py-3 bg-surface border border-border-main rounded-md focus:outline-none focus:ring-1 focus:ring-accent transition-all text-sm text-text-primary"
                        >
                          {['Betão Armado', 'Estrutura Metálica', 'Madeira', 'Misto', 'LSF'].map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-4">
                        <label className="text-xs font-bold uppercase tracking-widest text-text-primary">Tipo de Cobertura</label>
                        <select 
                          value={project.technical.config.roofType}
                          onChange={e => setProject({
                            ...project,
                            technical: { ...project.technical, config: { ...project.technical.config, roofType: e.target.value as any } }
                          })}
                          className="w-full px-4 py-3 bg-surface border border-border-main rounded-md focus:outline-none focus:ring-1 focus:ring-accent transition-all text-sm text-text-primary"
                        >
                          {['Plana (Terraço)', 'Inclinada', 'Mista'].map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-4">
                        <label className="text-xs font-bold uppercase tracking-widest text-text-primary">Acabamento Exterior</label>
                        <select 
                          value={project.technical.config.exteriorFinish}
                          onChange={e => setProject({
                            ...project,
                            technical: { ...project.technical, config: { ...project.technical.config, exteriorFinish: e.target.value as any } }
                          })}
                          className="w-full px-4 py-3 bg-surface border border-border-main rounded-md focus:outline-none focus:ring-1 focus:ring-accent transition-all text-sm text-text-primary"
                        >
                          {['ETICS (Capoto)', 'Fachada Ventilada', 'Reboco Tradicional', 'Pedra / Madeira'].map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-border-main flex justify-end">
                    <button 
                      onClick={generateDocument}
                      className="bg-accent text-canvas px-12 py-4 rounded-md hover:opacity-90 transition-all font-bold flex items-center gap-2 text-lg shadow-xl shadow-black/10"
                    >
                      {loading ? <>A processar... <Clock className="w-5 h-5 animate-spin" /></> : <>Gerar Memória Descritiva <Sparkles className="w-5 h-5" /></>}
                    </button>
                  </div>
                </motion.div>
              ) : step === 5 && generatedDoc ? (
                <motion.div 
                  key="step5"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-8"
                >
                  <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end border-b border-border-main pb-6 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                        <CheckCircle2 className="w-4 h-4 text-green-500" /> Documento Gerado com Sucesso
                      </div>
                      <h2 className="text-3xl font-light tracking-tight font-display">{docType}</h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={copyToClipboard}
                        className="flex items-center gap-2 bg-white text-text-primary px-3 py-2 border border-border-main rounded-md hover:bg-surface text-xs font-medium transition-all active:scale-95"
                        title="Copiar para área de transferência"
                      >
                        <Clipboard className="w-3 h-3" /> Copiar
                      </button>
                      
                      <div className="flex border border-border-main rounded-md overflow-hidden shadow-sm">
                        <button 
                          onClick={downloadDocx}
                          className="flex items-center gap-2 bg-white text-text-primary px-3 py-2 hover:bg-surface text-xs font-medium transition-all border-r border-border-main"
                          title="Descarregar .docx"
                        >
                          <FileCode className="w-3 h-3 text-blue-600" /> .DOCX
                        </button>
                        <button 
                          onClick={downloadPdf}
                          className="flex items-center gap-2 bg-white text-text-primary px-3 py-2 hover:bg-surface text-xs font-medium transition-all border-r border-border-main"
                          title="Descarregar .pdf"
                        >
                          <FileJson className="w-3 h-3 text-red-600" /> .PDF
                        </button>
                        <button 
                          onClick={downloadTxt}
                          className="flex items-center gap-2 bg-white text-text-primary px-3 py-2 hover:bg-surface text-xs font-medium transition-all"
                          title="Descarregar .txt"
                        >
                          <FileText className="w-3 h-3 text-gray-600" /> .TXT
                        </button>
                      </div>

                      <button 
                        onClick={() => setStep(3)}
                        className="flex items-center gap-2 bg-accent text-canvas px-3 py-2 rounded-md hover:opacity-90 text-xs font-medium transition-all"
                        title="Gerar outro tipo de documento para este projeto"
                      >
                        <Files className="w-3 h-3" /> Gerar Outro
                      </button>


                    </div>
                  </div>

                  <div className="bg-surface border border-border-main shadow-sm rounded-lg p-6 md:p-12 min-h-[600px] font-serif leading-loose text-text-primary text-lg lg:text-xl transition-colors">
                    <div className="markdown-body max-w-3xl mx-auto break-words overflow-x-auto">
                      <ReactMarkdown>{generatedDoc || ''}</ReactMarkdown>
                    </div>
                  </div>

                  <div className="flex justify-center pt-8">
                    <p className="text-[10px] text-text-secondary font-bold tracking-[0.3em] uppercase">
                      ArqDoc Technical Engine © {new Date().getFullYear()} — Edição para Portugal
                    </p>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            {error && (
              <div className="mt-8 p-6 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-sm uppercase tracking-wider">Erro no Processamento</p>
                  <p className="text-sm leading-relaxed">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Project Summary - Visible on Desktop steps 2, 3, 4, 7, 8, 6, 5, 9 */}
          {(step === 2 || step === 3 || step === 10 || step === 5 || step === 9) && !isEditingGlobalOffice && (
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full lg:w-72 bg-surface border border-border-main p-6 rounded-md space-y-6 lg:sticky lg:top-24 transition-colors"
            >
              <h3 className="text-xs font-bold uppercase tracking-widest text-text-primary border-b border-border-main pb-3">Resumo do Projeto</h3>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">Cliente</span>
                  <p className="text-sm font-semibold text-text-primary">{project.clientName || "Não definido"}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">Local</span>
                  <p className="text-sm font-semibold text-text-primary">{project.location}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">Intervenção</span>
                  <p className="text-sm font-semibold text-text-primary">{project.base.interventionType}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">Métricas</span>
                  <div className="flex justify-between items-center text-sm font-semibold text-text-primary">
                    <span>{(project.base.preferredArea?.areaM2 || 0).toLocaleString('pt-PT')} m²</span>
                    <span>
                      {office.feeMethod === 'sqm' 
                        ? `${(office.feeValue || 0).toLocaleString('pt-PT')} €/m²` 
                        : `${(office.feeValue || 0).toLocaleString('pt-PT')}%`}
                    </span>
                  </div>
                </div>

                {project.financialModel ? (
                  <div className="space-y-6 pt-4 border-t border-border-main">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-text-primary">Resumo Financeiro do Projeto</h4>
                    
                    <div className="space-y-5">
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">Pré-Análise de Viabilidade</span>
                        <div className="p-3 bg-surface-secondary border border-border-main rounded-lg transition-colors">
                          <p className="text-xl font-display font-bold tracking-tighter text-text-primary">
                            {(project.financialModel.globalInvestmentMin || 0).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })} — {(project.financialModel.globalInvestmentMax || 0).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                          </p>
                          <p className="text-[9px] text-text-secondary uppercase tracking-widest font-bold mt-1">Estimativa Total de Viabilidade com IVA</p>
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-4 border-t border-border-main/50">
                        <span className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">Detalhamento Técnico (Média)</span>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-text-secondary">Construção:</span>
                            <span className="font-semibold text-text-primary">{(project.financialModel.constructionCostAverage || 0).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-text-secondary">Engenharias:</span>
                            <span className="font-semibold text-text-primary">{(project.financialModel.technicalCostsEstimate || 0).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-text-secondary">Taxas e Licenças:</span>
                            <span className="font-semibold text-text-primary">{(project.financialModel.municipalFeesEstimate || 0).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-text-secondary">Projetos:</span>
                            <span className="font-semibold text-text-primary">{(project.financialModel.architectureFeesTotal || 0).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}</span>
                          </div>
                        </div>
                      </div>

                      {project.financialModel.riskNotes && project.financialModel.riskNotes.length > 0 && (
                        <div className="space-y-2 pt-4 border-t border-border-main/50">
                          <span className="text-[10px] text-amber-600 uppercase tracking-widest font-bold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Notas de Risco
                          </span>
                          <div className="space-y-1">
                            {project.financialModel.riskNotes.slice(0, 3).map((note, i) => (
                              <p key={i} className="text-[10px] text-text-secondary leading-tight italic">
                                • {note}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-1.5 pt-4 border-t border-border-main/50">
                        <span className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">Planos de Pagamento</span>
                        <div className="p-4 bg-surface rounded-lg border border-border-main shadow-sm transition-colors">
                          <div className="flex flex-col gap-1 mb-3 pb-3 border-b border-border-main/30">
                            <span className="text-[9px] uppercase tracking-wider text-text-secondary font-bold block">Intervalo de Honorários Estimados</span>
                            <p className="text-lg font-display font-bold text-text-primary">
                              {(project.financialModel.architectureFeesMin || 0).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })} — {(project.financialModel.architectureFeesMax || 0).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                            </p>
                            <p className="text-[10px] text-text-secondary italic mt-0.5">Média recomendada: {(project.financialModel.architectureFeesTotal || 0).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}</p>
                          </div>
                          <div className="space-y-2">
                            <span className="text-[9px] uppercase tracking-wider text-text-secondary font-bold block">Plano de Pagamentos</span>
                            {project.financialModel.paymentSchedule.map((phase, idx) => (
                              <div key={idx} className="flex justify-between text-[10px] font-medium text-text-secondary">
                                <span className="truncate mr-2">{phase.label}</span>
                                <span className="shrink-0 text-text-primary">{(phase.value || 0).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={recalculateFinancialModel}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-border-main rounded-md text-[10px] font-bold uppercase tracking-widest text-text-secondary hover:text-text-primary hover:bg-surface-secondary hover:border-text-secondary/30 transition-all group"
                      >
                        <Calculator className="w-3 h-3 group-hover:scale-110 transition-transform" /> Recalcular Modelo Financeiro
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-border-main space-y-4">
                    <div className="space-y-1 text-center">
                      <span className="text-[10px] text-text-secondary uppercase tracking-widest font-bold block">Estimativa de Honorários</span>
                      {(() => {
                        const area = project.base.preferredArea?.areaM2 || 0;
                        // Rough preview based on base fee model (7-9% of average construction cost)
                        const avgConst = area * (office.baseConstructionCost || 1400); 
                        const feeMin = avgConst * 0.07;
                        const feeMax = avgConst * 0.09;
                        
                        return (
                          <p className="text-xl font-display font-bold tracking-tighter text-text-primary">
                            {(feeMin || 0).toLocaleString('pt-PT')} — {(feeMax || 0).toLocaleString('pt-PT')} €
                          </p>
                        );
                      })()}
                    </div>
                    <div className="p-4 bg-surface-secondary/50 rounded-lg border border-dashed border-border-main text-center transition-colors">
                       <p className="text-[10px] text-text-secondary leading-relaxed italic uppercase font-bold tracking-widest">
                         O cálculo detalhado será gerado com base no programa e complexidade do projeto.
                       </p>
                    </div>
                  </div>
                )}

                <div className="space-y-4 pt-4 border-t border-border-main/50">
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">Âmbito Operacional</span>
                    <div className="flex flex-wrap gap-1.5">
                      {project.operational.contractedPhases.length > 0 ? (
                        project.operational.contractedPhases.map(phase => (
                          <span key={phase} className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 bg-surface border border-border-main rounded text-text-primary shadow-sm transition-colors">
                            {phase}
                          </span>
                        ))
                      ) : (
                        <span className="text-[9px] text-text-secondary italic font-medium">Nenhuma fase definida</span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">Serviços Complementares</span>
                    <div className="flex flex-wrap gap-1.5">
                      {project.operational.complementaryServices.length > 0 ? (
                        project.operational.complementaryServices.map(service => (
                          <span key={service} className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 bg-accent/5 border border-accent/20 rounded text-accent shadow-sm transition-colors">
                            {service}
                          </span>
                        ))
                      ) : (
                        <span className="text-[9px] text-text-secondary italic font-medium">Nenhum serviço complementar</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
              </div>
            </main>
          </>
        ) : (
          <div className="p-8 md:p-12 max-w-7xl mx-auto w-full">
            {view === 'dashboard' && (
              <DashboardView 
                activeProjects={allProjects} 
                totalClients={clients.length} 
                onCreateProject={openNewProjectFlow}
                onOpenProject={openProject}
              />
            )}
            {view === 'clients' && (
              <ClientsView 
                clients={clients} 
                onAddClient={(name, details) => {
                  const client = addClient(name, details);
                  openClientQuestionnaire(client);
                }} 
                onDeleteClient={deleteClient}
                onUpdateClient={updateClient}
                onOpenQuestionnaire={openClientQuestionnaire}
              />
            )}
            {view === 'projects' && (
              <ProjectsView 
                projects={allProjects}
                clients={clients}
                onAddProject={openNewProjectFlow}
                onAddClient={addClient}
                onOpenProject={openProject}
                onDeleteProject={deleteProject}
              />
            )}
            {view === 'library' && (
              <div className="max-w-5xl mx-auto py-12 space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border-main pb-8">
                  <div className="space-y-4">
                    <button 
                      onClick={() => navigateTo('settings')}
                      className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors text-[10px] font-bold uppercase tracking-[0.2em] group"
                    >
                      <ChevronLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" /> Voltar às Configurações
                    </button>
                    <div className="space-y-2">
                       <h1 className="text-4xl font-light tracking-tight font-display">Biblioteca de Serviços</h1>
                       <p className="text-text-secondary text-lg">Faça a gestão dos serviços predefinidos que o seu gabinete utiliza para gerar propostas.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                      {deletedServices.length > 0 && (
                        <button 
                          onClick={() => setShowRestoreList(!showRestoreList)}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-md border transition-all text-xs font-bold uppercase tracking-widest ${
                            showRestoreList 
                              ? "bg-text-primary text-surface border-text-primary shadow-lg" 
                              : "bg-surface text-text-primary border-border-main hover:bg-surface-secondary"
                          }`}
                        >
                          <RotateCcw className={`w-4 h-4 transition-transform ${showRestoreList ? 'rotate-180' : ''}`} /> {showRestoreList ? 'Ocultar Histórico' : 'Ver Apagados'}
                        </button>
                      )}
                      <button 
                        onClick={addLibraryService}
                        className="flex items-center gap-2 bg-accent text-canvas px-6 py-2.5 rounded-md hover:opacity-90 transition-all font-bold text-xs uppercase tracking-widest shadow-lg shadow-black/10"
                      >
                        <Plus className="w-4 h-4" /> Novo Serviço
                      </button>
                  </div>
                </div>

                <AnimatePresence>
                  {showRestoreList && deletedServices.length > 0 && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mb-8"
                    >
                      <div className="p-8 bg-surface-secondary border border-dashed border-border-main rounded-2xl space-y-6">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                             <RotateCcw className="w-4 h-4 text-text-secondary" />
                             <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary italic">Histórico de Serviços Removidos</h3>
                           </div>
                           <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-surface border border-border-main rounded text-text-secondary">
                             {deletedServices.length} itens
                           </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {deletedServices.map(service => (
                            <div key={service.id} className="flex items-center justify-between p-4 bg-surface rounded-xl border border-border-main shadow-sm group">
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-text-primary truncate">{service.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[9px] font-bold uppercase tracking-widest text-text-secondary px-1.5 py-0.5 bg-surface-secondary rounded border border-border-main">
                                    {service.phase}
                                  </span>
                                </div>
                              </div>
                              <button 
                                onClick={() => restoreLibraryService(service.id)}
                                className="ml-4 p-2 text-text-secondary hover:text-accent transition-colors hover:bg-accent/5 rounded-lg"
                                title="Restaurar"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {office.servicesLibrary.map((service, index) => (
                    <motion.div 
                      key={service.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-8 bg-surface border border-border-main rounded-2xl shadow-sm space-y-6 hover:border-accent/30 transition-all group flex flex-col h-full relative"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-3 flex-1">
                           <div className="flex items-center gap-2">
                             <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-accent/5 text-accent border border-accent/20 rounded">
                               {service.phase}
                             </span>
                           </div>
                           <input
                             type="text"
                             value={service.name}
                             onChange={(e) => updateLibraryService(service.id, { name: e.target.value })}
                             className="block w-full bg-transparent text-xl font-bold text-text-primary focus:outline-none focus:ring-0 placeholder:text-text-secondary/30 transition-all border-b border-transparent focus:border-accent/30 pb-1"
                             placeholder="Nome do serviço..."
                           />
                        </div>
                        <button 
                          onClick={() => deleteLibraryService(service.id)}
                          className="p-2.5 text-text-secondary opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 border border-transparent hover:border-red-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex-1 space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Descrição dos Trabalhos</label>
                          <textarea
                            value={service.description}
                            onChange={(e) => updateLibraryService(service.id, { description: e.target.value })}
                            className="w-full bg-surface-secondary p-4 rounded-xl border border-border-main text-sm text-text-secondary focus:outline-none focus:border-accent transition-all resize-none min-h-[120px] leading-relaxed shadow-inner"
                            placeholder="Descreva o que está incluído neste serviço..."
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Responsabilidades Arquitetura</label>
                            <textarea
                              value={service.architectResponsibilities || ''}
                              onChange={(e) => updateLibraryService(service.id, { architectResponsibilities: e.target.value })}
                              className="w-full bg-transparent p-3 border border-border-main rounded-xl font-mono text-[11px] h-24 focus:outline-none focus:border-accent leading-relaxed"
                              placeholder="O que o gabinete deve entregar..."
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Responsabilidades Cliente</label>
                            <textarea
                              value={service.clientResponsibilities || ''}
                              onChange={(e) => updateLibraryService(service.id, { clientResponsibilities: e.target.value })}
                              className="w-full bg-transparent p-3 border border-border-main rounded-xl font-mono text-[11px] h-24 focus:outline-none focus:border-accent leading-relaxed"
                              placeholder="Documentação a fornecer pelo cliente..."
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 pt-4 border-t border-border-main/50">
                        <button 
                          onClick={() => updateLibraryService(service.id, { isIncludedByDefault: !service.isIncludedByDefault })}
                          className={`flex items-center gap-2 group/check transition-all`}
                        >
                          <div className={`w-5 h-5 rounded flex items-center justify-center transition-all ${
                            service.isIncludedByDefault ? 'bg-accent text-canvas' : 'bg-surface-secondary border border-border-main'
                          }`}>
                            {service.isIncludedByDefault && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${service.isIncludedByDefault ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}>Incluído por Omissão</span>
                        </button>

                        <button 
                          onClick={() => updateLibraryService(service.id, { isOptional: !service.isOptional })}
                          className={`flex items-center gap-2 group/check transition-all`}
                        >
                          <div className={`w-5 h-5 rounded flex items-center justify-center transition-all border ${
                            service.isOptional ? 'bg-accent/10 border-accent/40 text-accent' : 'bg-surface-secondary border-border-main'
                          }`}>
                            {service.isOptional && <div className="w-1.5 h-1.5 rounded-full bg-accent" />}
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${service.isOptional ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}>Serviço Opcional</span>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {office.servicesLibrary.length === 0 && (
                  <div className="py-24 flex flex-col items-center justify-center text-center space-y-6 border-2 border-dashed border-border-main rounded-[2.5rem] bg-surface-secondary/20">
                     <div className="w-20 h-20 bg-surface border border-border-main rounded-3xl flex items-center justify-center shadow-xl shadow-black/5 rotate-3">
                       <Briefcase className="w-10 h-10 text-text-secondary" />
                     </div>
                     <div className="space-y-2">
                        <h3 className="text-2xl font-bold tracking-tight">Biblioteca Vazia</h3>
                        <p className="text-text-secondary max-w-sm text-lg">Comece a construir a sua base de serviços para automatizar as propostas do seu gabinete.</p>
                     </div>
                     <button 
                       onClick={addLibraryService}
                       className="bg-accent text-canvas px-8 py-3 rounded-full font-bold text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-accent/20 flex items-center gap-2 mt-4"
                     >
                       <Plus className="w-4 h-4" /> Adicionar Primeiro Serviço
                     </button>
                  </div>
                )}
              </div>
            )}
            {view === 'settings' && (
              <div className="max-w-4xl mx-auto space-y-12 py-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border-main pb-8">
                  <div className="space-y-2">
                    <h1 className="text-4xl font-light tracking-tight font-display">Configurações</h1>
                    <p className="text-gray-500">Faça a gestão da identidade e definições gerais do seu gabinete.</p>
                  </div>
                  <button 
                    onClick={() => {
                      setStep(2); // Jump to office configuration questionnaire
                      setView('editor');
                      setIsEditingGlobalOffice(true);
                    }}
                    className="flex items-center gap-2 bg-accent text-canvas px-6 py-2.5 rounded-md hover:opacity-90 transition-all font-bold text-sm shadow-lg shadow-black/10"
                  >
                    <Settings2 className="w-4 h-4" />
                    Editar Definições do Gabinete
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="p-8 bg-surface border border-border-main rounded-2xl shadow-sm space-y-6">
                      <div className="flex items-center gap-3 border-b border-border-main pb-4">
                        <div className="bg-accent p-2 rounded-lg">
                          <Building2 className="w-5 h-5 text-canvas" />
                        </div>
                        <h2 className="font-bold text-lg text-text-primary">Perfil do Gabinete</h2>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">Nome Comercial</label>
                          <p className="text-sm font-medium">{office.name}</p>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">Identidade Profissional</label>
                          <p className="text-sm font-medium">{office.officeLegalIdentity?.architectName || 'Não definida'}</p>
                          <p className="text-xs text-gray-500">{office.officeLegalIdentity?.architectRegNumber && `Cédula: ${office.officeLegalIdentity.architectRegNumber}`}</p>
                        </div>
                        <div className="pt-4 border-t border-gray-50">
                           <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">Método de Cálculo Padrão</label>
                           <div className="flex items-center gap-2">
                             <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                               {office.feeMethod === 'sqm' ? '€ / m²' : 'Percentagem (%)'}
                             </div>
                             <span className="text-sm font-bold text-[var(--text-color)]">
                               {office.feeValue}{office.feeMethod === 'sqm' ? '€' : '%'}
                             </span>
                           </div>
                        </div>
                      </div>
                   </div>

                   <div className="space-y-8">
                      <div className="p-8 bg-surface border border-border-main rounded-2xl shadow-sm space-y-6">
                        <div className="flex items-center gap-3 border-b border-border-main pb-4">
                          <div className="bg-accent p-2 rounded-lg">
                            <SunMoon className="w-5 h-5 text-canvas" />
                          </div>
                          <h2 className="font-bold text-lg text-text-primary">Aspecto Visual</h2>
                        </div>
                        
                        <div className="space-y-4">
                          <p className="text-xs text-gray-500 leading-relaxed italic">
                            Escolha o tema que melhor se adapta ao seu ambiente de trabalho.
                          </p>
                          <div className="grid grid-cols-2 gap-3">
                            <button 
                              onClick={() => setTheme('light')}
                              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all ${theme === 'light' ? 'bg-accent text-canvas border-accent shadow-lg shadow-accent/10' : 'bg-surface text-text-secondary border-border-main hover:border-text-secondary'}`}
                            >
                              <Sun className={`w-4 h-4 ${theme === 'light' ? 'text-amber-400' : 'text-gray-400'}`} />
                              <span className="text-xs font-bold uppercase tracking-widest">Claro</span>
                            </button>
                            <button 
                              onClick={() => setTheme('dark')}
                              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all ${theme === 'dark' ? 'bg-accent text-canvas border-accent shadow-lg shadow-accent/10' : 'bg-surface text-text-secondary border-border-main hover:border-text-secondary'}`}
                            >
                              <Moon className={`w-4 h-4 ${theme === 'dark' ? 'text-blue-400' : 'text-gray-500'}`} />
                              <span className="text-xs font-bold uppercase tracking-widest">Escuro</span>
                            </button>
                          </div>
                        </div>
                     </div>

                     <div className="p-8 bg-surface border border-border-main rounded-2xl shadow-sm space-y-6 transition-colors">
                        <div className="flex items-center gap-3 border-b border-border-main pb-4">
                          <div className="bg-accent p-2 rounded-lg">
                            <Briefcase className="w-5 h-5 text-canvas" />
                          </div>
                          <h2 className="font-bold text-lg text-text-primary">Biblioteca de Serviços</h2>
                        </div>
                        <p className="text-sm text-text-secondary leading-relaxed">
                          A sua biblioteca contém <strong>{office.servicesLibrary.length} serviços</strong> predefinidos que serão utilizados para gerar novas propostas.
                        </p>
                        <button 
                          onClick={() => setView('library')}
                          className="text-sm font-bold text-text-primary flex items-center gap-2 hover:gap-3 transition-all group"
                        >
                          Gerir Biblioteca <ChevronRight className="w-4 h-4 text-accent transition-transform group-hover:translate-x-1" />
                        </button>
                     </div>
                   </div>
                </div>

                <div className="p-8 border border-amber-100 bg-amber-50 rounded-2xl flex gap-4">
                  <Info className="w-6 h-6 text-amber-500 shrink-0" />
                  <div className="space-y-1">
                    <h4 className="font-bold text-amber-900 text-sm">Sincronização Ativa</h4>
                    <p className="text-xs text-amber-700 leading-relaxed">
                      Qualquer alteração efetuada nos dados do gabinete será automaticamente refletida nos projetos ativos. Da mesma forma, ajustes efetuados no nível comercial de um projeto atualizarão estas definições base.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none -z-10 select-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-[var(--border-color)]/30 rounded-full blur-[140px] transition-colors" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[500px] h-[500px] bg-blue-100/20 dark:bg-blue-900/10 rounded-full blur-[120px] transition-colors" />
      </div>
    </div>
  );
}
