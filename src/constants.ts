/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ServiceDefinition } from './types.ts';

export const SYSTEM_PROMPT = `
# SYSTEM INSTRUCTION — GENERAL DOCUMENT ENGINE

You are the document generation engine of a SaaS platform for architecture offices in Portugal.

Your purpose is to generate professional architecture documents using only the information received.

## CORE RULES

Use only the data provided in the input.

Never invent facts, values, measurements, dates, entities, legal references or technical information that were not supplied.

If information is missing, omit the subject naturally instead of creating assumptions.

All generated content must remain internally consistent.

The information received is the single source of truth.

Do not reinterpret or modify supplied values.

Do not perform calculations unless explicitly instructed by the document-specific instructions.

Do not create placeholders.

Do not ask questions.

Do not provide warnings, explanations or comments outside the requested document.

Do not mention artificial intelligence, prompts, instructions, system messages or internal reasoning.

Never expose your chain of thought.

## WRITING RULES

Always write in European Portuguese.

Use professional language appropriate for architecture, engineering and construction sectors in Portugal.

Maintain a formal, credible and production-ready tone.

Avoid repetitive language.

Use clear structure and section hierarchy.

Adapt wording to the project type, project scale and intended audience.

## DOCUMENT RULES

Generate only the document requested by the document-specific instructions.

Do not generate additional documents.

Do not generate introductory explanations.

Do not generate concluding explanations.

Return only the document content.

Output must be valid Markdown.

## CONSISTENCY RULES

Use client information exactly as provided.

Use office information exactly as provided.

Use architect information exactly as provided.

Maintain consistency between all sections of the document.

Do not introduce contradictions.

Do not create additional services, phases, costs, responsibilities or technical elements that were not supplied.

## REFERENCE DOCUMENTS

If reference documents are supplied:

* Follow their writing style.
* Follow their structure when appropriate.
* Follow their legal and professional tone.
* Preserve professional credibility.

Reference documents may influence style but must never override factual project data.

## FINAL RULE

The input data provided by the platform is authoritative.

The generated document must be suitable for real professional use by architecture offices in Portugal.
`;

export const DEFAULT_OFFICE_SERVICES: ServiceDefinition[] = [
  {
    id: 'ep',
    name: 'Estudo Prévio',
    description: 'Conceção inicial do projeto, definição de volumes, áreas e linguagem arquitetónica.',
    phase: 'Estudo Prévio',
    isIncludedByDefault: true,
    isOptional: false,
    architectResponsibilities: 'Elaboração de peças desenhadas (plantas, cortes, alçados) e memórias descritivas base.',
    clientResponsibilities: 'Aprovação das soluções propostas e fornecimento do programa base.',
    includedItems: ['Estudo volumétrico', 'Plantas de organização funcional', 'Imagens 3D base'],
    excludedItems: ['Projetos de especialidades', 'Maquetes físicas']
  },
  {
    id: 'lic',
    name: 'Projeto de Licenciamento',
    description: 'Preparação de todos os elementos necessários para aprovação municipal.',
    phase: 'Licenciamento',
    isIncludedByDefault: true,
    isOptional: false,
    architectResponsibilities: 'Coordenação com a CM, preenchimento de termos de responsabilidade e peças técnicas regulamentares.',
    clientResponsibilities: 'Pagamento de taxas municipais e fornecimento de certidões atualizadas.',
    includedItems: ['Memórias descritivas legais', 'Plantas de arquitetura (RJUE)', 'Calendarização de obra'],
    excludedItems: ['Assistência técnica diária na obra']
  },
  {
    id: 'exec',
    name: 'Projeto de Execução',
    description: 'Detalhamento técnico rigoroso para construção e medição de custos.',
    phase: 'Execução',
    isIncludedByDefault: true,
    isOptional: false,
    architectResponsibilities: 'Pormenorização de construtivos, mapas de vãos, mapas de acabamentos e caderno de encargos.',
    clientResponsibilities: 'Definição final de materiais e acabamentos específicos.',
    includedItems: ['Pormenores construtivos', 'Mapa de acabamentos', 'Caderno de encargos'],
    excludedItems: ['Fiscalização de obra']
  },
  {
    id: 'coord',
    name: 'Coordenação de Especialidades',
    description: 'Articulação entre o projeto de arquitetura e os projetos de engenharia.',
    phase: 'Outros',
    isIncludedByDefault: true,
    isOptional: true,
    architectResponsibilities: 'Verificação de compatibilidade entre estruturas, águas, esgotos, eletricidade e arquitetura.',
    clientResponsibilities: 'Contratação direta dos técnicos de engenharia (se não incluído).',
    includedItems: ['Reuniões de coordenação', 'Análise de conflitos técnicos'],
    excludedItems: ['Cálculo estrutural']
  },
  {
    id: 'interiores',
    name: 'Design de Interiores',
    description: 'Estudo detalhado de ambientes, mobiliário fixo e iluminação.',
    phase: 'Execução',
    isIncludedByDefault: false,
    isOptional: true,
    architectResponsibilities: 'Desenho de mobiliário por medida, seleção de cores, texturas e luminárias.',
    clientResponsibilities: 'Decisões sobre mobiliário decorativo.',
    includedItems: ['Plantas de teto falso', 'Desenho de carpintarias', 'Moodboards'],
    excludedItems: ['Compra de mobiliário']
  }
];

export const DEFAULT_SERVICES = [
  "Levantamento Arquitetónico",
  "Estudo Prévio",
  "Projeto de Licenciamento",
  "Projeto de Execução",
  "Assistência Técnica à Obra",
  "Certificação Energética",
  "Projetos de Especialidades (Engenharia)"
];

export const PROJECT_PHASES = [
  "Programa Base",
  "Estudo Prévio",
  "Projeto de Licenciamento",
  "Projeto de Execução",
  "Procedimento de Contratação",
  "Assistência Técnica à Obra"
];

export const TECHNICAL_BRIEF_QUESTIONS = [
  { id: 'urbanContext', label: 'Contexto Urbano', placeholder: 'Enquadramento do lote na malha urbana ou rústica...' },
  { id: 'implantation', label: 'Implantação', placeholder: 'Justificação da ocupação do solo e afastamentos...' },
  { id: 'functionalOrganization', label: 'Organização Funcional', placeholder: 'Distribuição dos espaços interiores por pisos...' },
  { id: 'materials', label: 'Materiais e Acabamentos', placeholder: 'Soluções construtivas e revestimentos principais...' },
  { id: 'thermalPerformance', label: 'Desempenho Térmico', placeholder: 'Isolamentos, vãos e sistemas de climatização...' },
  { id: 'accessibility', label: 'Acessibilidade', placeholder: 'Cumprimento do DL 163/2006...' },
  { id: 'fireSafety', label: 'Segurança contra Incêndio', placeholder: 'Medidas de autoproteção e riscos...' },
  { id: 'infrastructure', label: 'Infraestruturas', placeholder: 'Ligação às redes públicas e drenagens...' },
  { id: 'landscapeIntegration', label: 'Integração Paisagística', placeholder: 'Arranjos exteriores e vegetação...' }
];
