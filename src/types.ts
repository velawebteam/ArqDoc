/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum DocumentType {
  PROPOSTA_ARQUITETURA = 'Proposta de Prestação de Serviços de Arquitetura',
  ESTIMATIVA_FINANCEIRA = 'Estimativa Financeira e Técnica',
  MEMORIA_DESCRITIVA = 'Memória Descritiva',
  TERMO_RESPONSABILIDADE = 'Termo de Responsabilidade',
}

export type ServicePhase = 'Estudo Prévio' | 'Licenciamento' | 'Execução' | 'Acompanhamento' | 'Outros';

export interface ServiceDefinition {
  id: string;
  name: string;
  description: string;
  phase: ServicePhase;
  isIncludedByDefault: boolean;
  isOptional: boolean;
  architectResponsibilities?: string;
  clientResponsibilities?: string;
  includedItems?: string[];
  excludedItems?: string[];
}

export interface ClientData {
  name: string;
  email?: string;
  nif?: string;
  address?: string;
  phone?: string;
}

export interface SiteContext {
  landType: 'Urbano' | 'Rústico' | 'Loteamento' | 'Parcela isolada';
  slope: 'Plano' | 'Inclinado (moderado)' | 'Acentuado';
  topography: 'Plano' | 'Ligeiro declive' | 'Declive acentuado';
  solarOrientation: 'Norte' | 'Sul' | 'Este' | 'Oeste' | 'Mista';
  plotArea: number;
  grossConstructionArea: number;
  floorsAboveGround: number;
  floorsBelowGround: number;
  hasBasement: boolean;
}

export enum EstimationType {
  CLIENT = 'Pré-Análise de Viabilidade (Cliente)',
  TECHNICAL = 'Estimativa Financeira e Técnica (Gabinete)',
  BOTH = 'Gerar ambas as versões',
}

export interface EstimationOptions {
  type: EstimationType;
  qualityLevel: 'Standard' | 'Alta' | 'Premium';
  complexityLevel: 'Baixa' | 'Média' | 'Alta';
}

export enum ProjectLevelStatus {
  NOT_STARTED = 'Por preencher',
  PARTIAL = 'Parcial',
  COMPLETED = 'Completo',
}

export enum MemoriaDescritivaType {
  LICENSING = 'Memória Descritiva para Licenciamento (RJUE)',
  SIMPLIFIED = 'Memória Descritiva Simplificada (Cliente)',
  BOTH = 'Gerar ambas as versões',
}

export interface TechnicalOptions {
  type: MemoriaDescritivaType;
  constructionSystem: 'Betão Armado' | 'Estrutura Metálica' | 'Madeira' | 'Misto' | 'LSF';
  roofType: 'Plana (Terraço)' | 'Inclinada' | 'Mista';
  exteriorFinish: 'ETICS (Capoto)' | 'Fachada Ventilada' | 'Reboco Tradicional' | 'Pedra / Madeira';
}

export interface UrbanOperationData {
  parish: string;
  matricialArticle?: string;
  propertyDescription?: string;
  workType: 'Nova construção' | 'Ampliação' | 'Alteração' | 'Reconstrução' | 'Reabilitação';
  buildingUse: 'Habitação unifamiliar' | 'Habitação multifamiliar' | 'Comércio' | 'Serviços' | 'Turismo';
  floorsAbove: number;
  floorsBelow: number;
}

export interface CommercialProposalData {
  clientType: 'Particular' | 'Promotor imobiliário' | 'Empresa' | 'Investidor estrangeiro';
  interventionType: 'Construção nova' | 'Ampliação' | 'Reabilitação' | 'Legalização' | 'Alteração interior';
  specialtiesCoordination: 'Sim, coordenação total' | 'Apenas articulação pontual' | 'Não incluído';
  specialtiesIncluded?: string;
  meetingsPerPhase: {
    estudoPrevio: number;
    licenciamento: number;
    execucao: number;
  };
  revisionsPerPhase: number;
  constructionFollowUp: 'Não incluído' | 'Inclui visitas pontuais' | 'Inclui acompanhamento regular';
  numberOfConstructionVisits?: number;
  clientResponseDeadline: number;
  excludedServices: string[];
  adjudicationType: 'Assinatura da proposta = contrato' | 'Contrato posterior';
}

export interface BuildingProgram {
  bedrooms: number;
  suites: number;
  bathrooms: number;
  offices: number;
  parkingSpaces: number;
  hasOpenSpace: boolean;
  hasLaundry: boolean;
  hasStorage: boolean;
  hasGym: boolean;
  hasCinema: boolean;
  hasPool: boolean;
  otherSpaces?: string;
}

export interface EnergySystems {
  solarPanels: boolean;
  heatPump: boolean;
  underfloorHeating: boolean;
  vmc: boolean;
  poolHeating: boolean;
  energyClassTarget: 'A+' | 'A' | 'B' | 'B-' | 'C';
}

export interface ExternalFeatures {
  pool: boolean;
  landscaping: boolean;
  outdoorKitchen: boolean;
  largeGlazing: boolean;
  retainingWalls: boolean;
}

export interface BudgetPositioning {
  qualityLevel: 'Económica' | 'Standard' | 'Alta' | 'Premium';
  complexityLevel: 'Baixa' | 'Média' | 'Alta';
  budgetComfort: 'Conservador' | 'Equilibrado' | 'Flexível';
  marketPositioning: number; // 1400-2600 range per sqm
  estimationFormat: EstimationType;
}

export interface ProjectBaseData {
  projectName: string;
  client: ClientData;
  
  // 1. Tipo de Projeto
  interventionType: 'Construção nova' | 'Ampliação' | 'Remodelação' | 'Reabilitação' | 'Legalização' | 'Alteração' | 'Loteamento' | 'Comércio/Serviços' | 'Turismo';
  
  // 1b. Objetivo
  mainGoal?: string;

  // 2. Localização
  location: {
    municipality: string;
    parish: string;
    address?: string;
  };
  
  // 3. Tipo de Imóvel/Terreno
  propertySituation: 'Lote urbano aprovado' | 'Terreno urbano' | 'Terreno rústico' | 'Moradia existente' | 'Apartamento' | 'Edifício existente' | 'Não sei';
  
  // 3b. Fase Atual
  currentProcessPhase?: string;
  
  // 4. Área Pretendida
  preferredArea: {
    areaM2: number;
    typology: string;
    floors: number;
  };
  
  // 5. Características Especiais
  features: {
    pool: boolean;
    basement: boolean;
    garage: boolean;
    flatRoof: boolean;
    largeGlazing: boolean;
    tourismAL: boolean;
    energyEfficiency: boolean;
  };
  
  // 6. Topografia do Terreno
  topography: 'Plana' | 'Inclinação moderada' | 'Inclinação acentuada' | 'Não sei';
  
  // 7. Objetivo Financeiro
  financialGoals: {
    predictedBudget: number;
    bankFinancing: boolean;
    maxInvestmentLimit?: number;
    estimationFormat?: EstimationType;
  };
  
  // 8. Documentação Disponível
  documentation: {
    cadernetaPredial: boolean;
    levantamentoTopografico: boolean;
    plantaLoteamento: boolean;
    photos: boolean;
    previousProject: boolean;
    none: boolean;
  };

  status: ProjectLevelStatus;
}

export interface ProjectOperationalData {
  // 1. Fases Contratuais do Projeto
  contractedPhases: string[]; 
  
  // 2. Serviços Complementares
  complementaryServices: string[];
  
  // 3. Entregáveis (Gerados Automáticamente)
  automatedDeliverables: string[];

  // Configuração Operacional (Existing fields)
  technicalCoordination: 'Sim' | 'Não';
  projectComplexity: 'Simples' | 'Standard' | 'Complexa' | 'Muito Complexa';
  projectExigency: 'Base' | 'Médio' | 'Elevado' | 'Premium';
  deadlineType: 'Urgente' | 'Normal' | 'Flexível';
  constructionModel: string;
  foreseenSpecialties: string[];
  clientType: 'Particular' | 'Promotor' | 'Empresa' | 'Investidor' | 'Hotelaria' | 'Público';
  clientTraits: string[];
  technicalInfoStatus: string[];
  
  status: ProjectLevelStatus;
}

export interface ProjectCommercialData {
  feeModel: 'Percentagem sobre obra' | 'Valor por m²' | 'Valor fixo' | 'Modelo híbrido'; // Modelo de Honorários
  feeValue: number; // Percentagem, €/m² ou Valor Fixo
  constructionCostBasis?: number; // Custo de obra estimado para cálculo
  excludedCosts: string[]; // Custos Excluídos (Comerciais)
  paymentStructure: 'Percentagem por fase' | 'Mensal' | 'Entrada + fases' | 'Pagamentos fixos'; // Estrutura de Pagamento
  paymentPhases: { label: string; percentage: number }[]; // Percentagens por Fase
  useDefaultDistribution: boolean; // Se utiliza a distribuição pré-definida do gabinete
  revisionPolicy: {
    maxRevisions: number;
    description: string;
  };
  changeManagementPolicy: 'Incluídas sem limite' | 'Incluídas até número definido de revisões' | 'Alterações relevantes serão faturadas adicionalmente' | 'Todas as alterações após aprovação serão faturadas' | 'Definir em observações';
  suspensionPolicy: {
    enabled: boolean;
    reasons: string[]; // atrasos camarários, documentação cliente, pareceres externos, etc.
  };
  proposalValidity: '15 dias' | '30 dias' | '60 dias' | 'Personalizado';
  signatureType: 'Assinatura digital qualificada' | 'Assinatura manual';
  commercialNotes: string;
  status: ProjectLevelStatus;
}

export type ProjectTypology = 'Housing' | 'Commerce' | 'Tourism' | 'Services' | 'Multifamily' | 'Loteamento';

export interface HousingTechnicalData {
  numBedrooms: number;
  numSuites: number;
  numBathrooms: number;
  hasCloset: boolean;
  isOpenSpace: boolean;
  hasMasterSuite: boolean;
  hasGarage: boolean;
  hasLaundry: boolean;
  hasStorage: boolean;
  hasGym?: boolean;
  hasCinema?: boolean;
}

export interface CommerceTechnicalData {
  hasReception: boolean;
  hasPublicArea: boolean;
  hasStorage: boolean;
  hasPublicCirculation: boolean;
  hasTechnicalAreas: boolean;
  hasStaffZones: boolean;
  commercialType?: 'Retail' | 'Restaurant' | 'Office' | 'Industrial';
}

export interface TourismTechnicalData {
  numAccommodationUnits: number;
  hasCommonAreas: boolean;
  hasTechnicalSupport: boolean;
  hasReception: boolean;
  hasServiceAreas: boolean;
  tourismType?: 'AL' | 'Hotel' | 'Guesthouse' | 'Rural';
}

export interface LoteamentoTechnicalData {
  numLots: number;
  hasInfrastructures: boolean;
  hasStreets: boolean;
  hasGreenSpaces: boolean;
  hasCollectiveParking: boolean;
}

export interface ProjectTechnicalData {
  typology: ProjectTypology;
  implantation: {
    implantationArea: number;
    implantationType: 'isolada' | 'geminada' | 'banda';
    hasAnnex: boolean;
    hasParking: boolean;
    preferredSolarOrientation?: string;
    solarOrientationFeatures?: string[];
    // Loteamento specific or general
    numLots?: number;
    infrastructureNotes?: string;
  };
  functionalOrganization: {
    rooms: string[];
    functionalNotes: string;
    additionalSpaces?: string[];
    projectPriority?: string;
    integrationLevel?: string;
    integrationFeatures?: string[];
    
    // Typology specific data (flattened for easy access or optional based on typology)
    housing?: HousingTechnicalData;
    commerce?: CommerceTechnicalData;
    tourism?: TourismTechnicalData;
    loteamento?: LoteamentoTechnicalData;
  };
  architecturalLanguage: {
    language: 'Contemporânea' | 'Tradicional' | 'Minimalista' | 'Vernacular' | 'Industrial' | 'Mediterrânica' | 'Híbrida';
    architecturalNotes: string;
  };
  constructionSystems: {
    structure: 'Betão armado' | 'Metálica' | 'Madeira' | 'Mista';
    roof: 'Plana' | 'Inclinada' | 'Ajardinada';
    facades: string[];
    frames: 'Alumínio' | 'PVC' | 'Madeira';
    performanceLevel?: string;
    performanceFeatures?: string[];
  };
  energyEfficiency: string[];
  infrastructure: string[];
  accessibility: {
    subject: 'Sim' | 'Não' | 'Parcialmente';
    hasAccessibleRoute: boolean;
    hasAccessibleBathroom: boolean;
    hasElevator: boolean;
  };
  fireSafety: {
    usageType: 'Habitação' | 'Comércio' | 'Serviços' | 'Turismo' | 'Mista';
    riskCategory: '1ª' | '2ª' | '3ª' | '4ª' | 'Não aplicável';
  };
  landscapeIntegration: {
    maintainVegetation: boolean;
    newGardenZones: boolean;
    walls: boolean;
    exteriorPavements: boolean;
    landscapeStrategy: string;
  };
  technicalConstraints: string[];
  status: ProjectLevelStatus;

  // Legacy/Internal compatibility
  config?: TechnicalOptions;
  urbanContext?: string;
  materials?: string;
  thermalPerformance?: string;
}

export interface ProjectLegalData {
  procedureType: 'Licenciamento' | 'Comunicação Prévia';
  urbanOperationType?: 'Construção Nova' | 'Alteração' | 'Ampliação' | 'Reconstrução' | 'Demolição' | 'Legalização';
  propertyIdentification: {
    matricialArticle: string;
    propertyDescription: string;
    conservatory: string;
    permanentCertificateCode: string;
    landArea: number;
  };
  ownerType: 'Proprietário' | 'Coproprietário' | 'Usufrutuário' | 'Representante' | 'Promotor';
  legalRegime: string[];
  coordinationEntity?: 'Atelier responsável' | 'Técnico externo' | 'Empresa coordenadora' | 'Não definido';
  technicalDeclarations: string[];
  liabilityInsurance: {
    policyNumber: string;
    insurer: string;
    validity: string;
  };
  signatureType: 'Manual' | 'Digital qualificada';
  deliveredElements: string[];
  status: ProjectLevelStatus;

  // Legacy/Internal compatibility
  architectRegNumber?: string;
  ownerIdentification?: string;
}

export interface PaymentPhase {
  label: string;
  percentage: number;
  value: number;
}

export interface ProjectFinancialModel {
  createdAt: string;
  
  // Construction Cost
  constructionCostAverage: number;
  constructionCostMin: number;
  constructionCostMax: number;
  baseCostPerM2: number;
  
  // Expenses
  municipalFeesEstimate: number;
  technicalCostsEstimate: number;
  
  // Global Investment
  globalInvestmentAverage: number;
  globalInvestmentMin: number;
  globalInvestmentMax: number;
  
  // Specific Rubrics
  poolEstimate?: number;
  landscapingEstimate?: number;
  domoticaEstimate?: number;
  contingencyValue: number;
  ivaEstimated: number;
  totalWithIva: number;
  
  // Architecture Fees
  architectureFeesTotal: number;
  architectureFeesMin: number;
  architectureFeesMax: number;

  // New detailed ranges
  engineeringSpecialtiesMin?: number;
  engineeringSpecialtiesMax?: number;
  licensingFeesMin?: number;
  licensingFeesMax?: number;
  
  // Risk & Uncertainty
  riskNotes?: string[];
  
  paymentSchedule: PaymentPhase[];
}

export interface ProjectMasterData {
  client: {
    name: string;
    taxId: string;
    address: string;
  };
  project: {
    name: string;
    type: string;
    location: string;
    urbanContext: string;
    terrainComplexity: string;
    qualityLevel: string;
    constructionAreaM2: number;
    typology: string;
    projectTypology: ProjectTypology;
    clientProfile: string;
    features: {
      hasPool: boolean;
      hasBasement: boolean;
    };
    technicalDetails: {
      implantation: any;
      functionalOrganization: any;
      architecturalLanguage: any;
      constructionSystems: any;
    };
    legalStructure: {
      procedureType: string;
      urbanOperationType: string;
      coordinationEntity: string;
    };
  };
  financial: {
    construction: {
      min: number;
      mid: number;
      max: number;
    };
    engineering: {
      min: number;
      mid: number;
      max: number;
    };
    licensing: {
      min: number;
      mid: number;
      max: number;
    };
    architecture: {
      min: number;
      mid: number;
      max: number;
    };
    totalInvestment: {
      min: number;
      mid: number;
      max: number;
    };
    vat: number;
    contingency: number;
  };
  operationalScope: {
    phases: string[];
    services: { name: string; description: string; phase: string }[];
    coordination: string;
    extraServices: string[];
    complexity: string;
    exigency: string;
    deadlines: string;
  };
  commercialTerms: {
    feeModel: string;
    paymentSchedule: { label: string; percentage: number; value: number }[];
    excludedCosts: string[];
    revisionPolicy: string;
    suspensionPolicy: string;
    validity: string;
  };
  metadata: {
    documentDate: string;
    architectName: string;
    architectLicense: string;
    studioName: string;
  };
  riskNotes: string[];
}

export interface ProjectData {
  id: string;
  name: string; 
  clientName: string;
  clientEmail?: string;
  location: string;
  base: ProjectBaseData;
  operational: ProjectOperationalData;
  commercial: ProjectCommercialData;
  technical: ProjectTechnicalData;
  legal: ProjectLegalData;
  financialModel?: ProjectFinancialModel;
  masterData?: ProjectMasterData;
  legalRiskLevel?: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'finished' | 'deactivated';
}

export interface ProjectDataLegacy {
  type: string;
  location: string;
  area: number;
  phase: string;
  services: string[];
  urbanOperationData?: UrbanOperationData;
  commercialProposalData?: CommercialProposalData;
  estimationOptions?: EstimationOptions;
}

export interface OfficeLegalIdentity {
  architectName: string;
  architectRegNumber: string;
  taxId: string;
  address: string;
  email: string;
  phone: string;
  signatureType: 'Assinatura digital qualificada' | 'Assinatura manual';
}

export interface StudioStyleProfile {
  tone: {
    formality: string; // formal / semi-formal / technical
    sentenceLength: string;
    paragraphSize: string;
    voice: string; // passive / active
  };
  vocabulary: {
    technicalExpressions: string[];
    preferredWording: string[];
    recurringPhrases: string[];
    commonDisclaimers: string[];
  };
  structure: {
    sectionNaming: string[];
    numberingStyle: string;
    headingStyle: string;
    signatureFormat: string;
  };
  legal: {
    responsibilityClauses: string[];
    exclusionClauses: string[];
    intellectualProperty: string[];
  };
}

export interface ProjectTemplate {
  id: string;
  name: string;
  data: ProjectData;
  createdAt: string;
}

export interface OfficeData {
  name: string;
  feeMethod: 'sqm' | 'percentage';
  feeValue: number;
  pricePerSqm?: number; // Keep for legacy or temporary use if needed, but we'll prefer feeValue
  baseConstructionCost: number; // Base construction cost per sqm for estimates
  servicesLibrary: ServiceDefinition[];
  templateSnippets?: string;
  templateFilesContent?: string[];
  officeLegalIdentity?: OfficeLegalIdentity;
  styleProfile?: StudioStyleProfile;
  styleConfidenceScore: number;
  defaultFeeDistribution: { label: string; percentage: number }[];
}

export interface DocumentRequest {
  type: DocumentType;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  nif?: string;
  address?: string;
  phone?: string;
  baseData?: ProjectBaseData;
  createdAt: string;
}

export type NavigationView = 'dashboard' | 'clients' | 'projects' | 'editor' | 'settings' | 'library';

export interface AppState {
  view: NavigationView;
  clients: Client[];
  projects: ProjectData[];
  office: OfficeData;
  activeProjectId?: string;
}
