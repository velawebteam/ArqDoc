import { ProjectData, OfficeData, ProjectFinancialModel, PaymentPhase, ProjectMasterData } from '../types';

export function calculateFinancialModel(project: ProjectData, office: OfficeData): ProjectFinancialModel {
  const area = project.base?.preferredArea?.areaM2 || 0;
  
  // 1. BASE COST PER M²
  const baseCostPerM2 = office.baseConstructionCost || 1400;

  // 2. COEFFICIENTS (MASTER PROMPT V3)
  let complexityCoef = 1.0;
  const complexity = project.operational?.projectComplexity || 'Standard';
  if (complexity === 'Simples') complexityCoef = 0.90;
  else if (complexity === 'Standard') complexityCoef = 1.00;
  else if (complexity === 'Complexa') complexityCoef = 1.15;
  else if (complexity === 'Muito Complexa') complexityCoef = 1.30;

  let terrainCoef = 1.0;
  const topography = project.base?.topography || 'Plana';
  if (topography === 'Plana') terrainCoef = 1.00;
  else if (topography === 'Inclinação moderada') terrainCoef = 1.10; // Slightly higher as per prompt V3 logic (Terrain steep 1.10)
  else if (topography === 'Inclinação acentuada') terrainCoef = 1.15;

  let qualityCoef = 1.0; 
  const exigency = project.operational?.projectExigency || 'Médio';
  if (exigency === 'Base') qualityCoef = 0.85;
  else if (exigency === 'Médio') qualityCoef = 1.00;
  else if (exigency === 'Elevado') qualityCoef = 1.15;
  else if (exigency === 'Premium') qualityCoef = 1.30;

  // 3. FEATURES (ADDERS)
  let featureAdders = 0;
  if (project.base?.features?.pool) featureAdders += 0.05;
  if (project.base?.features?.largeGlazing) featureAdders += 0.05;
  if (project.base?.features?.basement) featureAdders += 0.08;
  if (project.base?.features?.energyEfficiency) featureAdders += 0.07;

  // BASE CONSTRUCTION COST
  const totalComplexity = complexityCoef * terrainCoef * qualityCoef;
  const totalConstructionAverage = area * baseCostPerM2 * totalComplexity * (1 + featureAdders);

  // INVESTMENT RANGE (+/- 10% for construction - base/min/max)
  const constructionCostMin = totalConstructionAverage * 0.90;
  const constructionCostMax = totalConstructionAverage * 1.15; // +15% as per prompt

  // 4. TECHNICAL COSTS (11% of Construction - as per Master Prompt)
  const technicalCostsTotal = totalConstructionAverage * 0.11;
  const technicalCostsMin = constructionCostMin * 0.11;
  const technicalCostsMax = constructionCostMax * 0.11;

  // 5. MUNICIPAL FEES (2.5% to 4% default)
  const municipalFeesPerc = 0.035; 
  const municipalFeesTotal = totalConstructionAverage * municipalFeesPerc;
  const municipalFeesMin = constructionCostMin * 0.025;
  const municipalFeesMax = constructionCostMax * 0.04;

  // 6. GLOBAL INVESTMENT
  const globalInvestmentAverage = totalConstructionAverage + technicalCostsTotal + municipalFeesTotal;
  const globalInvestmentMin = constructionCostMin + technicalCostsMin + municipalFeesMin;
  const globalInvestmentMax = constructionCostMax + technicalCostsMax + municipalFeesMax;

  // 7. ARCHITECTURE FEES ENGINE
  let architectureFeesTotal = 0;
  const feeMethod = project.commercial?.feeModel || 'Percentagem sobre obra';
  const feeValue = project.commercial?.feeValue || 0;

  if (feeMethod === 'Valor por m²') {
    architectureFeesTotal = area * feeValue;
  } else if (feeMethod === 'Percentagem sobre obra') {
    const costBasis = project.commercial?.constructionCostBasis > 0 ? project.commercial.constructionCostBasis : totalConstructionAverage;
    architectureFeesTotal = costBasis * (feeValue / 100);
  } else {
    architectureFeesTotal = feeValue;
  }

  // 8. PAYMENT SCHEDULE
  let paymentSchedule: PaymentPhase[] = [];
  
  // Use either project custom distribution or office defaults
  let distributionSource = project.commercial?.useDefaultDistribution && office.defaultFeeDistribution
    ? office.defaultFeeDistribution 
    : project.commercial?.paymentPhases;

  // Filter by contracted phases if any are defined
  if (project.operational.contractedPhases && project.operational.contractedPhases.length > 0) {
    distributionSource = distributionSource.filter(d => project.operational.contractedPhases.includes(d.label));
  }

  if (distributionSource && distributionSource.length > 0) {
    paymentSchedule = distributionSource.map(phase => ({
      label: phase.label,
      percentage: phase.percentage,
      value: architectureFeesTotal * (phase.percentage / 100),
      isCompleted: false
    }));
  } else {
    // Hard fallback if nothing is defined (should not happen with default distribution initialized)
    const defaults = [
      { label: 'Estudo Prévio', p: 15 },
      { label: 'Licenciamento', p: 35 },
      { label: 'Projeto de Execução', p: 35 },
      { label: 'Assistência Técnica à Obra', p: 15 }
    ];
    paymentSchedule = defaults.map(d => ({
      label: d.label,
      percentage: d.p,
      value: architectureFeesTotal * (d.p / 100),
      isCompleted: false
    }));
  }

  // 9. RISK & UNCERTAINTY GENERATOR
  const riskNotes: string[] = [];
  if (topography !== 'Plana') riskNotes.push('Terreno inclinado: Custos elevados de escavação e contenção.');
  if (project.base?.features?.pool) riskNotes.push('Piscina: Requer engenharia especializada e impermeabilização reforçada.');
  if (complexity === 'Complexa' || complexity === 'Muito Complexa') riskNotes.push('Complexidade técnica elevada: Requer maior coordenação e rigor construtivo.');
  if (exigency === 'Premium') riskNotes.push('Nível Premium: Exige detalhe minucioso e mão de obra altamente qualificada.');
  if (project.base?.features?.basement) riskNotes.push('Cave: Risco de infiltrações e custo elevado de estrutura.');

  return {
    createdAt: new Date().toISOString(),
    constructionCostAverage: totalConstructionAverage,
    constructionCostMin,
    constructionCostMax,
    baseCostPerM2,
    municipalFeesEstimate: municipalFeesTotal,
    technicalCostsEstimate: technicalCostsTotal,
    globalInvestmentAverage,
    globalInvestmentMin,
    globalInvestmentMax,
    ivaEstimated: globalInvestmentAverage * 0.23,
    totalWithIva: globalInvestmentAverage * 1.23,
    architectureFeesTotal,
    architectureFeesMin: architectureFeesTotal * 0.95,
    architectureFeesMax: architectureFeesTotal * 1.05,
    riskNotes,
    paymentSchedule,
    // Add missing properties for compatibility with the component expectations
    licensingFeesMin: municipalFeesMin,
    licensingFeesMax: municipalFeesMax,
    engineeringSpecialtiesMin: technicalCostsMin,
    engineeringSpecialtiesMax: technicalCostsMax,
    contingencyValue: globalInvestmentAverage * 0.05
  };
}

export function composeMasterData(project: ProjectData, office: OfficeData): ProjectMasterData {
  const model = calculateFinancialModel(project, office);
  
  return {
    client: {
      name: project.base?.client?.name || project.clientName || 'Cliente Final',
      taxId: project.base?.client?.nif || '',
      address: project.base?.client?.address || project.location || ''
    },
    project: {
      name: project.base?.projectName || project.name || 'Projeto de Arquitetura',
      type: project.base?.interventionType || 'Habitação',
      location: (project.base?.location?.municipality || '') + (project.base?.location?.parish ? `, ${project.base.location.parish}` : ''),
      urbanContext: 'Inserido em contexto local.',
      terrainComplexity: project.base?.topography || 'Plana',
      qualityLevel: project.operational?.projectExigency || 'Médio',
      constructionAreaM2: project.base?.preferredArea?.areaM2 || 0,
      typology: project.base?.preferredArea?.typology || 'T3',
      projectTypology: project.technical?.typology || 'Housing',
      clientProfile: project.operational?.clientType || 'Particular',
      features: {
        hasPool: project.base?.features?.pool || false,
        hasBasement: project.base?.features?.basement || false
      },
      technicalDetails: {
        implantation: project.technical?.implantation,
        functionalOrganization: project.technical?.functionalOrganization,
        architecturalLanguage: project.technical?.architecturalLanguage,
        constructionSystems: project.technical?.constructionSystems
      },
      legalStructure: {
        procedureType: project.legal?.procedureType || 'Licenciamento',
        urbanOperationType: project.legal?.urbanOperationType || 'Construção Nova',
        coordinationEntity: project.legal?.coordinationEntity || 'Atelier responsável'
      }
    },
    financial: {
      construction: {
        min: model.constructionCostMin,
        mid: model.constructionCostAverage,
        max: model.constructionCostMax
      },
      engineering: {
        min: model.engineeringSpecialtiesMin,
        mid: model.technicalCostsEstimate,
        max: model.engineeringSpecialtiesMax
      },
      licensing: {
        min: model.licensingFeesMin,
        mid: model.municipalFeesEstimate,
        max: model.licensingFeesMax
      },
      architecture: {
        min: model.architectureFeesMin,
        mid: model.architectureFeesTotal,
        max: model.architectureFeesMax
      },
      totalInvestment: {
        min: model.globalInvestmentMin,
        mid: model.globalInvestmentAverage,
        max: model.globalInvestmentMax
      },
      vat: model.ivaEstimated,
      contingency: model.contingencyValue
    },
    operationalScope: {
      phases: project.operational.contractedPhases || [],
      services: (project.operational.complementaryServices || []).map(s => ({
        name: s,
        description: 'Serviço complementar selecionado para o projeto.',
        phase: 'Complementar'
      })),
      coordination: project.operational.technicalCoordination,
      extraServices: [],
      complexity: project.operational.projectComplexity,
      exigency: project.operational.projectExigency,
      deadlines: project.operational.deadlineType
    },
    commercialTerms: {
      feeModel: project.commercial.feeModel,
      paymentSchedule: model.paymentSchedule,
      excludedCosts: project.commercial.excludedCosts || [],
      revisionPolicy: `${project.commercial.revisionPolicy.maxRevisions} revisões incluídas. ${project.commercial.revisionPolicy.description}`,
      suspensionPolicy: project.commercial.suspensionPolicy.enabled ? `Ativa para: ${project.commercial.suspensionPolicy.reasons.join(', ')}` : 'Não definida',
      validity: project.commercial.proposalValidity
    },
    metadata: {
      documentDate: new Date().toLocaleDateString('pt-PT'),
      architectName: office.officeLegalIdentity?.architectName || '',
      architectLicense: office.officeLegalIdentity?.architectRegNumber || '',
      studioName: office.name
    },
    riskNotes: model.riskNotes || []
  };
}
