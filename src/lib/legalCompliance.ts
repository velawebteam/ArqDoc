export const LEGAL_BLOCKS = {
  CONTRACTUAL_SCOPE: {
    id: 'CONTRACTUAL_SCOPE',
    title: 'Âmbito Contratual e Natureza dos Serviços',
    content: 'Os serviços de arquitetura constituem prestações de serviços intelectuais e de criação técnica, não devendo ser confundidos com a empreitada de construção ou fornecimento de materiais. O Arquiteto não assume responsabilidade por defeitos de construção ou incumprimentos do empreiteiro.'
  },
  PRICE_COST_DISCLAIMER: {
    id: 'PRICE_COST_DISCLAIMER',
    title: 'Estimativa de Custos e Natureza Indicativa',
    content: 'A estimativa de custos de construção apresentada fundamenta-se em indicadores médios de mercado à data da sua elaboração. Tem um caráter puramente indicativo e não constitui qualquer garantia de preço final de adjudicação, o qual dependerá das propostas dos empreiteiros e da volatilidade do mercado.'
  },
  CLIENT_RESPONSIBILITIES: {
    id: 'CLIENT_RESPONSIBILITIES',
    title: 'Responsabilidades e Obrigações do Dono de Obra',
    content: 'Compete ao Dono de Obra a disponibilização de toda a documentação legal e técnica necessária (ex: levantamento topográfico, certidões), o pagamento das taxas municipais e a contratação de empreiteiro devidamente habilitado.'
  },
  EXCLUDED_SERVICES: {
    id: 'EXCLUDED_SERVICES',
    title: 'Exclusões de Serviços e Encargos',
    content: 'Encontram-se excluídos da presente prestação de serviços, salvo acordo escrito em contrário: levantamento topográfico, estudos geotécnicos, fiscalização de obra, taxas municipais, seguros e licenciamentos extra-municipais.'
  },
  INTELLECTUAL_PROPERTY: {
    id: 'INTELLECTUAL_PROPERTY',
    title: 'Propriedade Intelectual e Direitos de Autor',
    content: 'O Arquiteto retém a titularidade exclusiva de todos os direitos de propriedade intelectual sobre os projetos, desenhos e modelos criados, gozando do direito moral e patrimonial de autor, nos termos do Código do Direito de Autor e dos Direitos Conexos.'
  },
  RJUE_COMPLIANCE: {
    id: 'RJUE_COMPLIANCE',
    title: 'Conformidade com o RJUE e Regulamentação',
    content: 'O projeto será elaborado em conformidade com o Regime Jurídico da Urbanização e Edificação (RJUE) e regulamentos municipais vigentes. A aprovação final é uma competência exclusiva das entidades licenciadoras, não podendo o Arquiteto garantir prazos ou decisões administrativas.'
  },
  PROJECT_CHANGES: {
    id: 'PROJECT_CHANGES',
    title: 'Alterações ao Projeto e Honorários Adicionais',
    content: 'Qualquer alteração substancial às fases já aprovadas pelo Dono de Obra, motivada por mudança de programa ou intenção, conferirá ao Arquiteto o direito a honorários adicionais calculados com base no tempo despendido ou percentagem acordada.'
  },
  MARKET_VOLATILITY: {
    id: 'MARKET_VOLATILITY',
    title: 'Volatilidade de Mercado e Preços',
    content: 'Dada a atual instabilidade nas cadeias de abastecimento e custos de matérias-primas, os orçamentos estimados podem sofrer oscilações significativas em períodos curtos. Recomenda-se a atualização de orçamentos o mais próximo possível da fase de concurso.'
  },
  LIABILITY_LIMITATION: {
    id: 'LIABILITY_LIMITATION',
    title: 'Limitação de Responsabilidade Civil',
    content: 'A responsabilidade civil do Arquiteto perante o Dono de Obra e terceiros encontra-se limitada ao âmbito estrito dos serviços contratados, nos termos do seguro de responsabilidade civil profissional vigente e obrigatório por lei.'
  }
};

export type DocumentTypeLegal = 'PROPOSTA' | 'ESTIMATIVA_CLIENTE' | 'ESTIMATIVA_TECNICA' | 'MEMORIA_DESCRITIVA';

export function getLegalBlocksForDocument(type: string): string[] {
  const blocks: string[] = [];
  
  // Mapping based on new independent document types
  if (type.includes('Proposta')) {
    blocks.push(LEGAL_BLOCKS.CONTRACTUAL_SCOPE.content);
    blocks.push(LEGAL_BLOCKS.CLIENT_RESPONSIBILITIES.content);
    blocks.push(LEGAL_BLOCKS.EXCLUDED_SERVICES.content);
    blocks.push(LEGAL_BLOCKS.INTELLECTUAL_PROPERTY.content);
    blocks.push(LEGAL_BLOCKS.PROJECT_CHANGES.content);
    blocks.push(LEGAL_BLOCKS.LIABILITY_LIMITATION.content);
  } else if (type.includes('Estimativa')) {
    blocks.push(LEGAL_BLOCKS.PRICE_COST_DISCLAIMER.content);
    blocks.push(LEGAL_BLOCKS.MARKET_VOLATILITY.content);
    blocks.push(LEGAL_BLOCKS.RJUE_COMPLIANCE.content);
    blocks.push(LEGAL_BLOCKS.LIABILITY_LIMITATION.content);
  } else if (type.includes('Memória')) {
    blocks.push(LEGAL_BLOCKS.RJUE_COMPLIANCE.content);
    blocks.push(LEGAL_BLOCKS.INTELLECTUAL_PROPERTY.content);
  } else if (type.includes('Termo')) {
    blocks.push(LEGAL_BLOCKS.RJUE_COMPLIANCE.content);
    blocks.push(LEGAL_BLOCKS.LIABILITY_LIMITATION.content);
  } else {
    // Default fallback
    blocks.push(LEGAL_BLOCKS.CONTRACTUAL_SCOPE.content);
    blocks.push(LEGAL_BLOCKS.PRICE_COST_DISCLAIMER.content);
  }

  return blocks;
}
