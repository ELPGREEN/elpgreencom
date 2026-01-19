import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FeasibilityStudy {
  study_name: string;
  location?: string;
  country?: string;
  daily_capacity_tons: number;
  operating_days_per_year: number;
  utilization_rate: number;
  total_investment: number;
  annual_revenue: number;
  annual_opex: number;
  annual_ebitda: number;
  payback_months: number;
  roi_percentage: number;
  npv_10_years: number;
  irr_percentage: number;
  rubber_granules_price: number;
  rubber_granules_yield: number;
  steel_wire_price: number;
  steel_wire_yield: number;
  textile_fiber_price: number;
  textile_fiber_yield: number;
  rcb_price?: number; // Recovered Carbon Black - Jan 2026 market: $800-1200/ton
  rcb_yield?: number; // rCB yield percentage - typically 10-15% via pyrolysis
  tax_rate: number;
  discount_rate?: number;
  equipment_cost?: number;
  installation_cost?: number;
  infrastructure_cost?: number;
  working_capital?: number;
  labor_cost?: number;
  energy_cost?: number;
  maintenance_cost?: number;
  logistics_cost?: number;
  government_royalties_percent?: number;
  environmental_bonus_per_ton?: number;
  collection_model?: string;
}

interface CountryRegulation {
  agency: string;
  mainLaws: string[];
  environmentalRequirements: string[];
  taxIncentives: string[];
  licenses: string[];
  laborRegulations: string[];
}

// ============================================
// COMPREHENSIVE COUNTRY REGULATORY DATABASE
// 4 Continents: Americas, Europe, Asia, Africa/Oceania
// ============================================

const countryRegulations: Record<string, CountryRegulation> = {
  // ==========================================
  // AMERICAS
  // ==========================================
  
  // North America
  "United States": {
    agency: "EPA (Environmental Protection Agency), State DEQs, OSHA",
    mainLaws: [
      "Resource Conservation and Recovery Act (RCRA)",
      "Clean Air Act (CAA)",
      "Clean Water Act (CWA)",
      "Scrap Tire Management Guidelines (state-specific)",
      "National Emission Standards for Hazardous Air Pollutants (NESHAP)"
    ],
    environmentalRequirements: [
      "RCRA Permit for solid waste processing",
      "Air Quality Permit (Title V or minor source)",
      "Stormwater Pollution Prevention Plan (SWPPP)",
      "NPDES Permit for water discharge",
      "State-specific scrap tire facility registration"
    ],
    taxIncentives: [
      "Section 179 deduction for equipment",
      "Bonus depreciation for qualified property",
      "State recycling tax credits (varies by state)",
      "Renewable Energy Investment Tax Credit",
      "EPA Brownfields grants for contaminated sites"
    ],
    licenses: [
      "State Solid Waste Facility Permit",
      "Air Quality Operating Permit",
      "Business License",
      "EPA Generator ID Number",
      "DOT Hazmat Registration (if applicable)"
    ],
    laborRegulations: [
      "OSHA General Industry Standards (29 CFR 1910)",
      "OSHA Recordkeeping Requirements",
      "Fair Labor Standards Act (FLSA)",
      "Workers' Compensation Insurance",
      "State-specific safety requirements"
    ]
  },
  "USA": {
    agency: "EPA (Environmental Protection Agency), State DEQs, OSHA",
    mainLaws: [
      "Resource Conservation and Recovery Act (RCRA)",
      "Clean Air Act (CAA)",
      "Clean Water Act (CWA)",
      "Scrap Tire Management Guidelines (state-specific)",
      "National Emission Standards for Hazardous Air Pollutants (NESHAP)"
    ],
    environmentalRequirements: [
      "RCRA Permit for solid waste processing",
      "Air Quality Permit (Title V or minor source)",
      "Stormwater Pollution Prevention Plan (SWPPP)",
      "NPDES Permit for water discharge",
      "State-specific scrap tire facility registration"
    ],
    taxIncentives: [
      "Section 179 deduction for equipment",
      "Bonus depreciation for qualified property",
      "State recycling tax credits (varies by state)",
      "Renewable Energy Investment Tax Credit",
      "EPA Brownfields grants for contaminated sites"
    ],
    licenses: [
      "State Solid Waste Facility Permit",
      "Air Quality Operating Permit",
      "Business License",
      "EPA Generator ID Number",
      "DOT Hazmat Registration (if applicable)"
    ],
    laborRegulations: [
      "OSHA General Industry Standards (29 CFR 1910)",
      "OSHA Recordkeeping Requirements",
      "Fair Labor Standards Act (FLSA)",
      "Workers' Compensation Insurance",
      "State-specific safety requirements"
    ]
  },
  "Canada": {
    agency: "Environment and Climate Change Canada (ECCC), Provincial Environment Ministries",
    mainLaws: [
      "Canadian Environmental Protection Act (CEPA 1999)",
      "Provincial Environmental Protection Acts",
      "Tire Stewardship Programs (provincial)",
      "National Pollutant Release Inventory (NPRI)",
      "Fisheries Act (for water discharge)"
    ],
    environmentalRequirements: [
      "Environmental Assessment (federal or provincial)",
      "Certificate of Approval (C of A) for waste processing",
      "Air Emissions Permit",
      "Registration with provincial tire stewardship program",
      "Waste management plan approval"
    ],
    taxIncentives: [
      "Accelerated Capital Cost Allowance (Class 43.1/43.2)",
      "Scientific Research and Experimental Development (SR&ED)",
      "Provincial clean technology incentives",
      "Canadian Clean Technology Investment Tax Credit",
      "Zero-Emission Technology Manufacturing deduction"
    ],
    licenses: [
      "Environmental Compliance Approval",
      "Provincial Waste Management License",
      "Business Registration (Federal & Provincial)",
      "Municipal Zoning Approval",
      "Fire Safety Permit"
    ],
    laborRegulations: [
      "Canada Labour Code",
      "Provincial Occupational Health & Safety Acts",
      "Workers' Compensation Board requirements",
      "WHMIS 2015 (hazardous materials)",
      "Employment Standards Act (provincial)"
    ]
  },

  // Latin America
  "Brazil": {
    agency: "IBAMA (Instituto Brasileiro do Meio Ambiente), CONAMA, Ministério do Meio Ambiente",
    mainLaws: [
      "Resolução CONAMA 416/2009 - Gestão de Pneus Inservíveis",
      "Política Nacional de Resíduos Sólidos (Lei 12.305/2010)",
      "Logística Reversa de Pneus (Decreto 10.388/2020)",
      "Lei de Crimes Ambientais (Lei 9.605/98)"
    ],
    environmentalRequirements: [
      "Licença Ambiental (LP, LI, LO)",
      "Estudo de Impacto Ambiental (EIA/RIMA) para capacidades > 10t/dia",
      "Plano de Gerenciamento de Resíduos Sólidos (PGRS)",
      "Cadastro Técnico Federal (CTF/IBAMA)",
      "Outorga de uso de água se aplicável"
    ],
    taxIncentives: [
      "Isenção de IPI para equipamentos de reciclagem",
      "Créditos de ICMS em alguns estados",
      "Incentivos da SUDAM/SUDENE para regiões específicas",
      "Linhas de crédito BNDES para economia circular"
    ],
    licenses: [
      "Licença Prévia (LP) - viabilidade ambiental",
      "Licença de Instalação (LI) - autorização para construir",
      "Licença de Operação (LO) - autorização para operar",
      "Certificado de Regularidade do CTF"
    ],
    laborRegulations: [
      "CLT - Consolidação das Leis do Trabalho",
      "NR-6: Equipamentos de Proteção Individual",
      "NR-9: Programa de Prevenção de Riscos Ambientais",
      "NR-12: Segurança em Máquinas e Equipamentos"
    ]
  },
  "Mexico": {
    agency: "SEMARNAT (Secretaría de Medio Ambiente), PROFEPA, CONAGUA",
    mainLaws: [
      "Ley General para la Prevención y Gestión Integral de los Residuos (LGPGIR)",
      "NOM-161-SEMARNAT-2011 - Gestión de Neumáticos de Desecho",
      "Ley General del Equilibrio Ecológico (LGEEPA)",
      "Reglamento de la LGPGIR"
    ],
    environmentalRequirements: [
      "Manifestación de Impacto Ambiental (MIA)",
      "Licencia Ambiental Única (LAU)",
      "Plan de Manejo de Residuos de Manejo Especial",
      "Registro como empresa de reciclaje ante SEMARNAT",
      "Cédula de Operación Anual (COA)"
    ],
    taxIncentives: [
      "Estímulos fiscales por inversión en maquinaria verde",
      "Depreciación acelerada de activos ambientales",
      "Programas estatales de apoyo a industria verde",
      "Certificación Industria Limpia con beneficios"
    ],
    licenses: [
      "Licencia Ambiental Única Federal",
      "Registro ante SEMARNAT como gestor de residuos",
      "Autorización de impacto ambiental",
      "Licencia de uso de suelo municipal"
    ],
    laborRegulations: [
      "Ley Federal del Trabajo (LFT)",
      "NOM-017-STPS: Equipos de protección personal",
      "NOM-004-STPS: Sistemas de protección en maquinaria",
      "Registro patronal IMSS e INFONAVIT"
    ]
  },
  "Argentina": {
    agency: "Ministerio de Ambiente y Desarrollo Sustentable, SAyDS, OPDS (provincial)",
    mainLaws: [
      "Ley Nacional de Residuos Peligrosos (Ley 24.051)",
      "Ley General del Ambiente (Ley 25.675)",
      "Resolución SAyDS 523/2013 - Gestión de Neumáticos Fuera de Uso",
      "Leyes provinciales de residuos especiales"
    ],
    environmentalRequirements: [
      "Estudio de Impacto Ambiental (EsIA)",
      "Certificado de Aptitud Ambiental (CAA)",
      "Inscripción en el Registro de Generadores/Operadores",
      "Plan de Gestión de Residuos",
      "Monitoreo de emisiones atmosféricas"
    ],
    taxIncentives: [
      "Régimen de Promoción de Inversiones",
      "Beneficios fiscales provinciales",
      "Créditos del Banco de Inversión y Comercio Exterior (BICE)",
      "Programa de Desarrollo de Proveedores"
    ],
    licenses: [
      "Certificado de Aptitud Ambiental",
      "Habilitación Municipal",
      "Inscripción AFIP (Impositiva)",
      "Registro de Operadores de Residuos Especiales"
    ],
    laborRegulations: [
      "Ley de Contrato de Trabajo (Ley 20.744)",
      "Ley de Higiene y Seguridad en el Trabajo (Ley 19.587)",
      "Decreto 351/79 - Reglamento de Higiene y Seguridad",
      "ART (Aseguradoras de Riesgos del Trabajo)"
    ]
  },
  "Chile": {
    agency: "Ministerio del Medio Ambiente (MMA), Superintendencia del Medio Ambiente (SMA)",
    mainLaws: [
      "Ley 19.300 de Bases Generales del Medio Ambiente",
      "Ley REP 20.920 - Responsabilidad Extendida del Productor",
      "D.S. 40/2012 - Reglamento del SEIA",
      "D.S. 148 - Reglamento Sanitario sobre Manejo de Residuos Peligrosos"
    ],
    environmentalRequirements: [
      "Evaluación de Impacto Ambiental (EIA) o DIA",
      "Resolución de Calificación Ambiental (RCA)",
      "Plan de Gestión de Neumáticos Fuera de Uso",
      "Registro en Ventanilla Única RETC",
      "Autorización Sanitaria"
    ],
    taxIncentives: [
      "Depreciación acelerada para inversiones verdes",
      "CORFO Crece Verde - Financiamiento",
      "Incentivos tributarios por I+D (Ley 20.241)",
      "Programa Transforma de CORFO"
    ],
    licenses: [
      "Resolución de Calificación Ambiental (RCA)",
      "Autorización Sanitaria (SEREMI de Salud)",
      "Patente Municipal Comercial",
      "Inscripción en SII"
    ],
    laborRegulations: [
      "Código del Trabajo",
      "D.S. 594 - Condiciones Sanitarias y Ambientales Básicas",
      "Ley 16.744 - Accidentes del Trabajo",
      "Reglamento de EPP"
    ]
  },
  "Colombia": {
    agency: "Ministerio de Ambiente y Desarrollo Sostenible, ANLA, Corporaciones Autónomas Regionales (CAR)",
    mainLaws: [
      "Resolución 1457/2010 - Gestión de Llantas Usadas",
      "Ley 99/1993 - Ley General Ambiental",
      "Decreto 1076/2015 - Decreto Único Reglamentario del Sector Ambiente",
      "Resolución 1326/2017 - Actualización gestión de llantas"
    ],
    environmentalRequirements: [
      "Licencia Ambiental (ANLA o CAR)",
      "Estudio de Impacto Ambiental",
      "Plan de Gestión de Devolución de Productos Posconsumo",
      "Registro Único Ambiental (RUA)",
      "Permiso de Emisiones Atmosféricas"
    ],
    taxIncentives: [
      "Exclusión de IVA en equipos de control ambiental",
      "Deducción especial por inversiones ambientales",
      "Incentivo Tributario Ambiental (ITA)",
      "Líneas de crédito Bancóldex verdes"
    ],
    licenses: [
      "Licencia Ambiental",
      "Registro Mercantil (Cámara de Comercio)",
      "RUT (DIAN)",
      "Concepto de Uso del Suelo"
    ],
    laborRegulations: [
      "Código Sustantivo del Trabajo",
      "Sistema General de Riesgos Laborales",
      "Resolución 0312/2019 - Estándares Mínimos SG-SST",
      "Decreto 1072/2015 - Decreto Único del Sector Trabajo"
    ]
  },
  "Peru": {
    agency: "Ministerio del Ambiente (MINAM), OEFA, DIGESA",
    mainLaws: [
      "Ley de Gestión Integral de Residuos Sólidos (D.L. 1278)",
      "Ley General del Ambiente (Ley 28611)",
      "Reglamento de la Ley de Gestión de Residuos Sólidos (D.S. 014-2017-MINAM)",
      "Ley del Sistema Nacional de Evaluación de Impacto Ambiental"
    ],
    environmentalRequirements: [
      "Estudio de Impacto Ambiental (EIA-d o EIA-sd)",
      "Certificación Ambiental",
      "Registro como Empresa Operadora de Residuos Sólidos (EO-RS)",
      "Plan de Manejo Ambiental",
      "Instrumentos de Gestión Ambiental Correctivo (IGAC)"
    ],
    taxIncentives: [
      "Depreciación acelerada para activos fijos nuevos",
      "Régimen MYPE Tributario",
      "Beneficios tributarios regionales (zonas de selva)",
      "Obras por Impuestos"
    ],
    licenses: [
      "Certificación Ambiental (SENACE o autoridad competente)",
      "Registro EO-RS ante MINAM",
      "Licencia de Funcionamiento Municipal",
      "Inscripción en SUNAT"
    ],
    laborRegulations: [
      "Ley de Productividad y Competitividad Laboral (D.L. 728)",
      "Ley de Seguridad y Salud en el Trabajo (Ley 29783)",
      "D.S. 005-2012-TR - Reglamento de la Ley SST",
      "SCTR (Seguro Complementario de Trabajo de Riesgo)"
    ]
  },
  "Ecuador": {
    agency: "Ministerio del Ambiente, Agua y Transición Ecológica (MAATE)",
    mainLaws: [
      "Código Orgánico del Ambiente (COA)",
      "Acuerdo Ministerial 021 - Gestión de Neumáticos Usados",
      "Reglamento al COA",
      "Texto Unificado de Legislación Secundaria de Medio Ambiente (TULSMA)"
    ],
    environmentalRequirements: [
      "Licencia Ambiental",
      "Estudio de Impacto Ambiental",
      "Plan de Manejo Ambiental",
      "Registro Ambiental",
      "Auditorías Ambientales de Cumplimiento"
    ],
    taxIncentives: [
      "Exoneración de aranceles para tecnología limpia",
      "Reducción del Impuesto a la Renta por nuevas inversiones",
      "Créditos CFN para proyectos verdes",
      "Incentivos de Zonas Especiales de Desarrollo Económico (ZEDE)"
    ],
    licenses: [
      "Licencia Ambiental MAATE",
      "RUC (Servicio de Rentas Internas)",
      "Patente Municipal",
      "Permiso de Funcionamiento"
    ],
    laborRegulations: [
      "Código del Trabajo",
      "Reglamento de Seguridad y Salud de los Trabajadores",
      "Decreto Ejecutivo 2393",
      "Afiliación al IESS obligatoria"
    ]
  },
  "Venezuela": {
    agency: "Ministerio del Poder Popular para Ecosocialismo (MINEC)",
    mainLaws: [
      "Ley Orgánica del Ambiente",
      "Ley de Gestión Integral de la Basura",
      "Decreto 2.635 - Normas para el Control de Residuos Peligrosos",
      "Ley Penal del Ambiente"
    ],
    environmentalRequirements: [
      "Estudio de Impacto Ambiental y Socio-Cultural",
      "Autorización de Afectación de Recursos Naturales",
      "Registro de Actividades Susceptibles de Degradar el Ambiente (RASDA)",
      "Plan de Supervisión Ambiental"
    ],
    taxIncentives: [
      "Exoneración de impuestos para proyectos de interés nacional",
      "Régimen de Zonas Económicas Especiales",
      "Incentivos por sustitución de importaciones"
    ],
    licenses: [
      "Autorización Ambiental MINEC",
      "Registro de Información Fiscal (RIF)",
      "Patente de Industria y Comercio",
      "Conformidad de Uso"
    ],
    laborRegulations: [
      "Ley Orgánica del Trabajo, los Trabajadores y las Trabajadoras (LOTTT)",
      "Ley Orgánica de Prevención, Condiciones y Medio Ambiente de Trabajo (LOPCYMAT)",
      "Reglamentos Técnicos de la LOPCYMAT",
      "INPSASEL (Instituto de Prevención)"
    ]
  },

  // ==========================================
  // EUROPE
  // ==========================================
  
  "Germany": {
    agency: "Umweltbundesamt (UBA), Länder authorities, Bundesministerium für Umwelt",
    mainLaws: [
      "Kreislaufwirtschaftsgesetz (KrWG) - Circular Economy Act",
      "Altreifenverordnung - End-of-life tyre regulation",
      "Bundes-Immissionsschutzgesetz (BImSchG)",
      "TA Luft - Technical Instructions on Air Quality"
    ],
    environmentalRequirements: [
      "Genehmigung nach BImSchG (emissions permit)",
      "Umweltverträglichkeitsprüfung (UVP) - EIA",
      "Abfallwirtschaftskonzept",
      "Emissions monitoring requirements",
      "Entsorgungsfachbetrieb certification"
    ],
    taxIncentives: [
      "KfW Environmental Investment Programme",
      "Federal funding for resource efficiency",
      "Investment grants from Länder",
      "Accelerated depreciation for green assets",
      "EU Taxonomy alignment benefits"
    ],
    licenses: [
      "BImSchG-Genehmigung",
      "Baugenehmigung (building permit)",
      "Gewerbeanmeldung",
      "Abfallbeförderungsgenehmigung"
    ],
    laborRegulations: [
      "Arbeitsschutzgesetz",
      "Betriebssicherheitsverordnung",
      "DGUV regulations",
      "Works council requirements (Betriebsrat)"
    ]
  },
  "Italy": {
    agency: "Ministero dell'Ambiente, ISPRA, Regioni, ARPA",
    mainLaws: [
      "D.Lgs. 152/2006 (Testo Unico Ambientale)",
      "D.M. 182/2019 - Gestione pneumatici fuori uso (PFU)",
      "Regolamento UE 2020/852 (Tassonomia verde)",
      "Direttiva 2008/98/CE sui rifiuti"
    ],
    environmentalRequirements: [
      "Autorizzazione Unica Ambientale (AUA)",
      "Autorizzazione Integrata Ambientale (AIA) per impianti complessi",
      "Valutazione di Impatto Ambientale (VIA)",
      "Iscrizione Albo Nazionale Gestori Ambientali",
      "Registro cronologico di carico/scarico rifiuti"
    ],
    taxIncentives: [
      "Credito d'imposta Transizione 4.0",
      "Credito d'imposta per economia circolare",
      "Fondo Nazionale per l'Efficienza Energetica",
      "Contributi regionali per investimenti green",
      "PNRR - Missione 2 Rivoluzione Verde"
    ],
    licenses: [
      "Autorizzazione Unica Ambientale (AUA)",
      "Iscrizione all'Albo Nazionale Gestori Ambientali",
      "Permesso di costruire",
      "SCIA per inizio attività"
    ],
    laborRegulations: [
      "D.Lgs. 81/2008 - Testo Unico Sicurezza",
      "CCNL del settore applicabile",
      "Documento di Valutazione dei Rischi (DVR)",
      "Formazione obbligatoria sicurezza"
    ]
  },
  "France": {
    agency: "Ministère de la Transition Écologique, ADEME, DREAL (régionales)",
    mainLaws: [
      "Code de l'Environnement",
      "Loi Anti-Gaspillage pour une Économie Circulaire (AGEC)",
      "Décret n°2002-1563 - Gestion des pneumatiques usagés",
      "Réglementation ICPE (Installations Classées)"
    ],
    environmentalRequirements: [
      "Autorisation environnementale unique",
      "Étude d'impact environnemental",
      "Déclaration ou Autorisation ICPE",
      "Enregistrement Registre national des Émissions Polluantes",
      "Plan de Gestion des Déchets"
    ],
    taxIncentives: [
      "Suramortissement pour investissements verts",
      "Crédit d'impôt recherche (CIR)",
      "Aides ADEME pour économie circulaire",
      "Fonds Chaleur et Fonds Économie Circulaire",
      "Prêts Verts BPI France"
    ],
    licenses: [
      "Autorisation ICPE préfectorale",
      "Agrément pour la gestion des déchets",
      "Permis de construire",
      "Immatriculation au RCS"
    ],
    laborRegulations: [
      "Code du Travail",
      "Document Unique d'Évaluation des Risques (DUER)",
      "Règles INRS de sécurité",
      "Convention collective applicable"
    ]
  },
  "Spain": {
    agency: "Ministerio para la Transición Ecológica y el Reto Demográfico (MITECO), Comunidades Autónomas",
    mainLaws: [
      "Ley 7/2022 de Residuos y Suelos Contaminados",
      "Real Decreto 731/2020 - Gestión de Neumáticos Fuera de Uso",
      "Ley 21/2013 de Evaluación Ambiental",
      "Real Decreto Legislativo 1/2016 - Texto Refundido de la Ley IPPC"
    ],
    environmentalRequirements: [
      "Autorización Ambiental Integrada (AAI)",
      "Evaluación de Impacto Ambiental (EIA)",
      "Inscripción en el Registro de Productores de Residuos",
      "Plan de Gestión de Residuos",
      "Sistema de Responsabilidad Ampliada del Productor"
    ],
    taxIncentives: [
      "Deducciones fiscales por inversiones medioambientales",
      "Bonificaciones del Impuesto de Sociedades",
      "Ayudas del IDAE para eficiencia energética",
      "Fondos europeos Next Generation EU",
      "Incentivos autonómicos"
    ],
    licenses: [
      "Autorización Ambiental Integrada",
      "Licencia de Actividad Municipal",
      "Inscripción en el Registro Mercantil",
      "Alta en el IAE"
    ],
    laborRegulations: [
      "Estatuto de los Trabajadores",
      "Ley 31/1995 de Prevención de Riesgos Laborales",
      "Real Decreto 773/1997 - EPIs",
      "Convenio Colectivo sectorial"
    ]
  },
  "United Kingdom": {
    agency: "Environment Agency (EA), SEPA (Scotland), Natural Resources Wales",
    mainLaws: [
      "Environmental Protection Act 1990",
      "Waste (England and Wales) Regulations 2011",
      "End of Life Tyres Regulations",
      "Environmental Permitting Regulations 2016"
    ],
    environmentalRequirements: [
      "Environmental Permit for waste operations",
      "Environmental Impact Assessment (if required)",
      "Waste Carriers License",
      "Fire Prevention Plan",
      "Technical Competence (WAMITAB qualification)"
    ],
    taxIncentives: [
      "Annual Investment Allowance (AIA)",
      "Enhanced Capital Allowances for energy-efficient equipment",
      "R&D Tax Relief",
      "Freeport tax benefits (in designated zones)",
      "Green Business Grants"
    ],
    licenses: [
      "Environmental Permit (Bespoke or Standard Rules)",
      "Waste Carrier Registration",
      "Planning Permission",
      "Companies House Registration"
    ],
    laborRegulations: [
      "Health and Safety at Work Act 1974",
      "PUWER (Provision and Use of Work Equipment Regulations)",
      "PPE Regulations 1992",
      "RIDDOR (Reporting of Injuries)"
    ]
  },
  "UK": {
    agency: "Environment Agency (EA), SEPA (Scotland), Natural Resources Wales",
    mainLaws: [
      "Environmental Protection Act 1990",
      "Waste (England and Wales) Regulations 2011",
      "End of Life Tyres Regulations",
      "Environmental Permitting Regulations 2016"
    ],
    environmentalRequirements: [
      "Environmental Permit for waste operations",
      "Environmental Impact Assessment (if required)",
      "Waste Carriers License",
      "Fire Prevention Plan",
      "Technical Competence (WAMITAB qualification)"
    ],
    taxIncentives: [
      "Annual Investment Allowance (AIA)",
      "Enhanced Capital Allowances for energy-efficient equipment",
      "R&D Tax Relief",
      "Freeport tax benefits (in designated zones)",
      "Green Business Grants"
    ],
    licenses: [
      "Environmental Permit (Bespoke or Standard Rules)",
      "Waste Carrier Registration",
      "Planning Permission",
      "Companies House Registration"
    ],
    laborRegulations: [
      "Health and Safety at Work Act 1974",
      "PUWER (Provision and Use of Work Equipment Regulations)",
      "PPE Regulations 1992",
      "RIDDOR (Reporting of Injuries)"
    ]
  },
  "Poland": {
    agency: "Ministerstwo Klimatu i Środowiska, WIOŚ (Inspektorat Ochrony Środowiska)",
    mainLaws: [
      "Ustawa o odpadach (Waste Act)",
      "Prawo ochrony środowiska (Environmental Protection Law)",
      "Rozporządzenie w sprawie zużytych opon",
      "Ustawa o ocenach oddziaływania na środowisko"
    ],
    environmentalRequirements: [
      "Pozwolenie zintegrowane (Integrated Permit)",
      "Ocena oddziaływania na środowisko (EIA)",
      "Rejestracja w BDO (Waste Database)",
      "Plan gospodarki odpadami",
      "Monitoring emisji"
    ],
    taxIncentives: [
      "Ulga B+R (R&D tax relief)",
      "Dotacje z NFOŚiGW (National Environmental Fund)",
      "Programy operacyjne UE",
      "Ulga na robotyzację",
      "Polski Ład - preferencje dla inwestycji"
    ],
    licenses: [
      "Pozwolenie zintegrowane",
      "Wpis do rejestru BDO",
      "Pozwolenie na budowę",
      "Wpis do CEIDG lub KRS"
    ],
    laborRegulations: [
      "Kodeks pracy",
      "Rozporządzenie w sprawie BHP",
      "Ustawa o PIP (Państwowa Inspekcja Pracy)",
      "Badania lekarskie i szkolenia BHP"
    ]
  },
  "Netherlands": {
    agency: "Rijkswaterstaat, ILT (Inspectie Leefomgeving en Transport), Provincies",
    mainLaws: [
      "Wet milieubeheer (Environmental Management Act)",
      "Activiteitenbesluit milieubeheer",
      "Regeling banden en luchtbanden",
      "Besluit omgevingsrecht (Bor)"
    ],
    environmentalRequirements: [
      "Omgevingsvergunning (Environmental Permit)",
      "Milieueffectrapportage (MER) - EIA",
      "Registratie bij VIHB (waste transport)",
      "Erkend afvalverwerker status",
      "Energie-audit (EED)"
    ],
    taxIncentives: [
      "MIA (Milieu-investeringsaftrek)",
      "Vamil (Vrije afschrijving milieuinvesteringen)",
      "EIA (Energie-investeringsaftrek)",
      "SDE++ subsidie voor duurzame energie",
      "WBSO (R&D tax credit)"
    ],
    licenses: [
      "Omgevingsvergunning",
      "VIHB-registratie",
      "Inschrijving KvK",
      "Vergunning gevaarlijke stoffen"
    ],
    laborRegulations: [
      "Arbeidsomstandighedenwet (Arbowet)",
      "Arbobesluit",
      "Risico-Inventarisatie en -Evaluatie (RI&E)",
      "Cao-verplichtingen"
    ]
  },
  "Portugal": {
    agency: "Agência Portuguesa do Ambiente (APA), CCDR (Comissões de Coordenação Regional)",
    mainLaws: [
      "Regime Geral de Gestão de Resíduos (DL 102-D/2020)",
      "Gestão de Pneus e Pneus Usados (DL 111/2001)",
      "Regime de Avaliação de Impacte Ambiental",
      "Regime de Emissões Industriais"
    ],
    environmentalRequirements: [
      "Licença Ambiental (Título Único Ambiental)",
      "Avaliação de Impacte Ambiental (AIA)",
      "Licenciamento Industrial (SIR)",
      "Registo no SIRER (Sistema de Informação de Resíduos)",
      "Plano de Prevenção de Acidentes Graves"
    ],
    taxIncentives: [
      "RFAI (Regime Fiscal de Apoio ao Investimento)",
      "SIFIDE II (Sistema de Incentivos Fiscais à I&D)",
      "Benefícios fiscais do interior",
      "Fundos PT2030",
      "Créditos do Fundo Ambiental"
    ],
    licenses: [
      "Título Único Ambiental",
      "Licença de Exploração",
      "Registo Comercial",
      "Início de Atividade nas Finanças"
    ],
    laborRegulations: [
      "Código do Trabalho",
      "Lei 102/2009 - Segurança e Saúde no Trabalho",
      "Regulamento de EPIs",
      "Medicina do Trabalho obrigatória"
    ]
  },
  "Belgium": {
    agency: "Federal Public Service Environment, Regional agencies (OVAM, SPW, Bruxelles Environnement)",
    mainLaws: [
      "Decree on Waste Prevention and Management (Flemish/Walloon/Brussels)",
      "Federal Product Standards Law",
      "Royal Decree on Waste Tires",
      "Environmental Permit Decree"
    ],
    environmentalRequirements: [
      "Milieu- of omgevingsvergunning (Environmental Permit)",
      "Milieueffectenrapport (MER) - EIA",
      "VLAREMA compliance (Flemish waste regulation)",
      "OVAM registration",
      "Fire safety report"
    ],
    taxIncentives: [
      "Federal investment deduction",
      "Regional ecological premiums",
      "Innovation income deduction",
      "Accelerated depreciation for R&D",
      "European LIFE+ program grants"
    ],
    licenses: [
      "Omgevingsvergunning (Environmental & Building)",
      "OVAM/OWD registration",
      "BCE/KBO registration",
      "VAT registration"
    ],
    laborRegulations: [
      "Welzijnswet (Well-being at Work Act)",
      "ARAB/CODEX regulations",
      "Joint Committee (Paritair Comité) requirements",
      "External Prevention Service"
    ]
  },
  "Sweden": {
    agency: "Naturvårdsverket (EPA), Länsstyrelsen (County Administrative Boards)",
    mainLaws: [
      "Miljöbalken (Environmental Code)",
      "Avfallsförordningen (Waste Ordinance)",
      "Förordning om däck (Tire Regulation)",
      "Förordning om producentansvar för däck"
    ],
    environmentalRequirements: [
      "Miljötillstånd (Environmental Permit)",
      "Miljökonsekvensbeskrivning (EIA)",
      "Registration with Länsstyrelsen",
      "Egenkontroll (Self-monitoring program)",
      "Avfallsplan (Waste management plan)"
    ],
    taxIncentives: [
      "Climate Leap (Klimatklivet) grants",
      "Industry Leap (Industriklivet) support",
      "R&D deduction (FoU-avdrag)",
      "Green bonds and sustainable financing",
      "Regional development grants"
    ],
    licenses: [
      "Miljötillstånd from Länsstyrelsen or Mark- och miljödomstolen",
      "Bygglov (Building permit)",
      "F-skatt registration",
      "Bolagsverket registration"
    ],
    laborRegulations: [
      "Arbetsmiljölagen (Work Environment Act)",
      "Arbetsmiljöverkets föreskrifter (AFS)",
      "Systematiskt arbetsmiljöarbete (SAM)",
      "Kollektivavtal (Collective agreements)"
    ]
  },
  "Austria": {
    agency: "Bundesministerium für Klimaschutz (BMK), Landesregierungen",
    mainLaws: [
      "Abfallwirtschaftsgesetz (AWG 2002)",
      "Altreifenverordnung",
      "UVP-Gesetz 2000",
      "Gewerbeordnung (GewO)"
    ],
    environmentalRequirements: [
      "Genehmigung nach AWG oder GewO",
      "Umweltverträglichkeitsprüfung (UVP)",
      "Abfallbehandlererlaubnis",
      "Emissionsgrenzwerte gemäß IG-L",
      "EDM-Registrierung (elektronisches Datenmanagement)"
    ],
    taxIncentives: [
      "Umweltförderung im Inland (UFI)",
      "aws Umwelt- und Energiekredite",
      "Forschungsprämie (14%)",
      "Investitionsprämie für Klimaschutz",
      "Landesförderungen"
    ],
    licenses: [
      "Gewerbeberechtigung",
      "Abfallbehandlererlaubnis",
      "Baubewilligung",
      "Firmenbucheintragung"
    ],
    laborRegulations: [
      "ArbeitnehmerInnenschutzgesetz (ASchG)",
      "Allgemeine Arbeitnehmerschutzverordnung (AAV)",
      "Arbeitsinspektionsgesetz",
      "Kollektivvertrag"
    ]
  },
  "Switzerland": {
    agency: "Bundesamt für Umwelt (BAFU), Kantonale Umweltämter",
    mainLaws: [
      "Umweltschutzgesetz (USG)",
      "Technische Verordnung über Abfälle (TVA)",
      "Luftreinhalte-Verordnung (LRV)",
      "Verordnung über die Rückgabe, die Rücknahme und die Entsorgung elektrischer und elektronischer Geräte"
    ],
    environmentalRequirements: [
      "Umweltverträglichkeitsprüfung (UVP)",
      "Betriebsbewilligung für Abfallanlagen",
      "Luftreinhaltung-Massnahmenplan",
      "Gewässerschutzbewilligung",
      "Lärmschutzmassnahmen"
    ],
    taxIncentives: [
      "Stiftung Klimaschutz und CO2-Kompensation",
      "Energie Schweiz Förderprogramme",
      "Kantonale Investitionsförderung",
      "Forschungsförderung Innosuisse",
      "Steuerliche Abzüge für Umweltinvestitionen"
    ],
    licenses: [
      "Betriebsbewilligung (Kanton)",
      "Baubewilligung",
      "Handelsregistereintrag",
      "Abfallbewilligung"
    ],
    laborRegulations: [
      "Arbeitsgesetz (ArG)",
      "Verordnung über die Verhütung von Unfällen (VUV)",
      "SUVA-Vorschriften",
      "Gesamtarbeitsvertrag (GAV)"
    ]
  },

  // ==========================================
  // ASIA
  // ==========================================
  
  "China": {
    agency: "生态环境部 (MEE), 国家发展改革委, 省级生态环境厅",
    mainLaws: [
      "固体废物污染环境防治法 (2020修订)",
      "再生资源回收管理办法",
      "废旧轮胎综合利用行业准入条件",
      "循环经济促进法"
    ],
    environmentalRequirements: [
      "环境影响评价 (EIA) 审批",
      "排污许可证",
      "危险废物经营许可证 (如适用)",
      "清洁生产审核",
      "环保竣工验收"
    ],
    taxIncentives: [
      "资源综合利用增值税即征即退",
      "企业所得税优惠 (环保设备投资额10%抵扣)",
      "循环经济专项资金支持",
      "绿色信贷支持"
    ],
    licenses: [
      "营业执照 (再生资源回收经营)",
      "环评批复",
      "排污许可证",
      "安全生产许可证"
    ],
    laborRegulations: [
      "劳动法、劳动合同法",
      "安全生产法",
      "职业病防治法",
      "工伤保险条例"
    ]
  },
  "India": {
    agency: "Ministry of Environment, Forest and Climate Change (MoEFCC), CPCB, State PCBs",
    mainLaws: [
      "Hazardous and Other Wastes (Management and Transboundary Movement) Rules, 2016",
      "E-Waste (Management) Rules, 2016",
      "Plastic Waste Management Rules, 2016",
      "Environment Protection Act, 1986",
      "Solid Waste Management Rules, 2016"
    ],
    environmentalRequirements: [
      "Environmental Clearance (EC) from MoEFCC or SEIAA",
      "Consent to Establish (CTE) from State PCB",
      "Consent to Operate (CTO) from State PCB",
      "Authorization under Hazardous Waste Rules",
      "Environmental Impact Assessment (EIA) Report"
    ],
    taxIncentives: [
      "Accelerated depreciation for pollution control equipment",
      "GST exemptions for certain recycling activities",
      "Make in India incentives",
      "State industrial policy incentives",
      "PLI Scheme for Advanced Chemistry Cell"
    ],
    licenses: [
      "Environmental Clearance",
      "CTE/CTO from SPCB",
      "Factory License under Factories Act",
      "GST Registration",
      "MSME Registration (if applicable)"
    ],
    laborRegulations: [
      "Factories Act, 1948",
      "Occupational Safety, Health and Working Conditions Code, 2020",
      "EPF and Miscellaneous Provisions Act",
      "ESI Act"
    ]
  },
  "Japan": {
    agency: "環境省 (Ministry of Environment), 経済産業省 (METI), 都道府県",
    mainLaws: [
      "廃棄物処理法 (Waste Management and Public Cleansing Act)",
      "循環型社会形成推進基本法",
      "使用済自動車の再資源化等に関する法律 (ELV Law)",
      "資源有効利用促進法"
    ],
    environmentalRequirements: [
      "産業廃棄物処理業許可",
      "環境影響評価 (EIA) - for large facilities",
      "大気汚染防止法に基づく届出",
      "水質汚濁防止法に基づく届出",
      "施設設置届出"
    ],
    taxIncentives: [
      "中小企業投資促進税制",
      "グリーン投資減税",
      "環境関連設備への特別償却",
      "補助金 (NEDO, 環境省事業)",
      "地方自治体の優遇措置"
    ],
    licenses: [
      "産業廃棄物処理業許可 (収集運搬・処分)",
      "一般廃棄物処理業許可",
      "建築確認",
      "法人登記"
    ],
    laborRegulations: [
      "労働安全衛生法",
      "労働基準法",
      "労働者災害補償保険法",
      "労働安全衛生規則"
    ]
  },
  "South Korea": {
    agency: "환경부 (Ministry of Environment), 한국환경공단 (KECO)",
    mainLaws: [
      "폐기물관리법 (Waste Control Act)",
      "자원순환기본법 (Framework Act on Resource Circulation)",
      "자동차관리법 (Automobile Management Act)",
      "환경영향평가법"
    ],
    environmentalRequirements: [
      "폐기물처리업 허가",
      "환경영향평가 (EIA)",
      "대기오염물질 배출시설 설치신고",
      "재활용사업계획 승인",
      "사업장폐기물 배출자 신고"
    ],
    taxIncentives: [
      "녹색산업 세제지원",
      "환경친화적 시설 투자세액공제",
      "중소기업 특별세액감면",
      "환경부 보조금 사업",
      "한국환경산업기술원 R&D 지원"
    ],
    licenses: [
      "폐기물처리업 허가 (종합/개별)",
      "사업자등록",
      "건축허가",
      "공장등록"
    ],
    laborRegulations: [
      "산업안전보건법",
      "근로기준법",
      "산업재해보상보험법",
      "위험성평가 실시"
    ]
  },
  "Indonesia": {
    agency: "Kementerian Lingkungan Hidup dan Kehutanan (KLHK), BPLHD (Provincial)",
    mainLaws: [
      "UU No. 32/2009 tentang Perlindungan dan Pengelolaan Lingkungan Hidup",
      "PP No. 101/2014 tentang Pengelolaan Limbah B3",
      "PP No. 22/2021 tentang Penyelenggaraan Perlindungan dan Pengelolaan LH",
      "UU No. 18/2008 tentang Pengelolaan Sampah"
    ],
    environmentalRequirements: [
      "AMDAL (Analisis Mengenai Dampak Lingkungan)",
      "Izin Lingkungan",
      "Izin Pengelolaan Limbah B3",
      "UKL-UPL untuk usaha menengah",
      "Pertek (Persetujuan Teknis)"
    ],
    taxIncentives: [
      "Tax Holiday for pioneer industries",
      "Super tax deduction for R&D",
      "Import duty exemption for machinery",
      "Tax allowance for certain investments",
      "Insentif Kawasan Ekonomi Khusus (KEK)"
    ],
    licenses: [
      "NIB (Nomor Induk Berusaha) via OSS",
      "Izin Usaha Industri",
      "Izin Lingkungan",
      "Pertek Limbah B3"
    ],
    laborRegulations: [
      "UU Cipta Kerja (Omnibus Law)",
      "PP 50/2012 tentang SMK3",
      "Permenaker tentang K3",
      "BPJS Ketenagakerjaan"
    ]
  },
  "Thailand": {
    agency: "Ministry of Natural Resources and Environment, Department of Industrial Works (DIW)",
    mainLaws: [
      "Factory Act B.E. 2535 (1992)",
      "Enhancement and Conservation of National Environmental Quality Act B.E. 2535",
      "Hazardous Substance Act B.E. 2535",
      "Public Health Act B.E. 2535"
    ],
    environmentalRequirements: [
      "Environmental Impact Assessment (EIA)",
      "Factory License (Ror.Ngor.4)",
      "Waste disposal registration",
      "Air emission permit",
      "Environmental monitoring program"
    ],
    taxIncentives: [
      "BOI (Board of Investment) privileges",
      "Corporate income tax exemption for promoted activities",
      "Import duty exemption for machinery",
      "Eastern Economic Corridor (EEC) incentives",
      "SME tax incentives"
    ],
    licenses: [
      "Factory License (DIW)",
      "Environmental license",
      "Company registration (DBD)",
      "VAT registration"
    ],
    laborRegulations: [
      "Labour Protection Act B.E. 2541",
      "Occupational Safety, Health and Environment Act B.E. 2554",
      "Social Security Act",
      "Workmen's Compensation Act"
    ]
  },
  "Vietnam": {
    agency: "Bộ Tài nguyên và Môi trường (MONRE), Sở TNMT (Provincial)",
    mainLaws: [
      "Luật Bảo vệ môi trường 2020",
      "Nghị định 08/2022/NĐ-CP về quản lý chất thải",
      "Luật Đầu tư 2020",
      "Nghị định về đánh giá tác động môi trường"
    ],
    environmentalRequirements: [
      "Đánh giá tác động môi trường (ĐTM/EIA)",
      "Giấy phép môi trường",
      "Đăng ký chủ nguồn thải chất thải nguy hại",
      "Kế hoạch bảo vệ môi trường",
      "Quan trắc môi trường định kỳ"
    ],
    taxIncentives: [
      "Corporate income tax incentives for encouraged sectors",
      "Import duty exemption for project assets",
      "Special Economic Zone incentives",
      "Environmental protection incentives",
      "R&D expense deductions"
    ],
    licenses: [
      "Giấy phép môi trường",
      "Giấy chứng nhận đăng ký đầu tư",
      "Giấy chứng nhận đăng ký doanh nghiệp",
      "Giấy phép xây dựng"
    ],
    laborRegulations: [
      "Bộ luật Lao động 2019",
      "Luật An toàn, vệ sinh lao động 2015",
      "Bảo hiểm xã hội bắt buộc",
      "Nghị định về điều kiện an toàn lao động"
    ]
  },
  "Malaysia": {
    agency: "Department of Environment (DOE), MITI",
    mainLaws: [
      "Environmental Quality Act 1974",
      "Environmental Quality (Scheduled Wastes) Regulations 2005",
      "Solid Waste and Public Cleansing Management Act 2007",
      "Environmental Impact Assessment Order 2015"
    ],
    environmentalRequirements: [
      "Environmental Impact Assessment (EIA) Approval",
      "Written Approval for scheduled waste treatment",
      "Occupier's License",
      "Emission monitoring requirements",
      "Waste management plan"
    ],
    taxIncentives: [
      "Pioneer Status (70% income tax exemption)",
      "Investment Tax Allowance",
      "Accelerated Capital Allowance for environmental equipment",
      "Green Technology Tax Incentive",
      "Reinvestment Allowance"
    ],
    licenses: [
      "EIA Approval from DOE",
      "Scheduled Waste Treatment Facility License",
      "Business License (Local Authority)",
      "SSM Registration"
    ],
    laborRegulations: [
      "Occupational Safety and Health Act 1994",
      "Factories and Machinery Act 1967",
      "Employment Act 1955",
      "SOCSO coverage"
    ]
  },
  "Philippines": {
    agency: "Department of Environment and Natural Resources (DENR), EMB",
    mainLaws: [
      "Republic Act 9003 (Ecological Solid Waste Management Act)",
      "Republic Act 6969 (Toxic Substances and Hazardous and Nuclear Wastes Control Act)",
      "Presidential Decree 1586 (Environmental Impact Statement System)",
      "Clean Air Act (RA 8749)"
    ],
    environmentalRequirements: [
      "Environmental Compliance Certificate (ECC)",
      "Permit to Operate (for air emissions)",
      "TSD Facility Registration",
      "Environmental Impact Statement/Assessment",
      "Self-Monitoring Report"
    ],
    taxIncentives: [
      "CREATE Act incentives (2021)",
      "BOI-registered enterprise benefits",
      "Special Economic Zone incentives",
      "Green Lane privilege for environmental equipment",
      "Duty exemption for capital equipment"
    ],
    licenses: [
      "Environmental Compliance Certificate",
      "Business Permit (LGU)",
      "SEC Registration",
      "TSD Registration"
    ],
    laborRegulations: [
      "Labor Code of the Philippines",
      "Occupational Safety and Health Standards",
      "DOLE DO 198-18",
      "SSS, PhilHealth, Pag-IBIG contributions"
    ]
  },
  "Saudi Arabia": {
    agency: "Ministry of Environment, Water and Agriculture, NCEC, GAMEP",
    mainLaws: [
      "General Environmental Law (Royal Decree M/165)",
      "Waste Management Regulation",
      "Environmental Impact Assessment Regulation",
      "Saudi Building Code - Environmental Requirements"
    ],
    environmentalRequirements: [
      "Environmental License from NCEC",
      "Environmental Impact Assessment",
      "Waste Management Plan",
      "Air Quality Monitoring Program",
      "Industrial License from MODON or Royal Commission"
    ],
    taxIncentives: [
      "No corporate income tax for manufacturing (certain conditions)",
      "SIDF loans at preferential rates",
      "Customs duty exemption for equipment",
      "Vision 2030 industrial incentives",
      "Special Economic Zones benefits"
    ],
    licenses: [
      "Environmental License",
      "Industrial License (MODON/RC)",
      "Commercial Registration (MC)",
      "Municipality License"
    ],
    laborRegulations: [
      "Labor Law (Royal Decree M/51)",
      "GOSI (Social Insurance)",
      "Nitaqat (Saudization requirements)",
      "Occupational Health & Safety regulations"
    ]
  },
  "United Arab Emirates": {
    agency: "Ministry of Climate Change and Environment (MOCCAE), Local authorities (EAD, DM)",
    mainLaws: [
      "Federal Law No. 24/1999 on Environmental Protection",
      "Cabinet Resolution No. 39/2006 on Waste Management",
      "Federal Law No. 12/2018 on Integrated Waste Management",
      "Emirates EIA requirements"
    ],
    environmentalRequirements: [
      "Environmental Permit from competent authority",
      "Environmental Impact Assessment",
      "Waste Management Permit",
      "No Objection Certificates (NOCs)",
      "Environmental monitoring and reporting"
    ],
    taxIncentives: [
      "Free Zone benefits (0% corporate tax)",
      "Industrial development incentives",
      "Customs duty exemption",
      "Operation Al Makeen support for manufacturing",
      "R&D grants"
    ],
    licenses: [
      "Trade License (DED or Free Zone)",
      "Environmental Permit",
      "Industrial License",
      "Municipality approvals"
    ],
    laborRegulations: [
      "Federal Labour Law",
      "Ministerial Decision on OSH",
      "Emirates standardization requirements",
      "End of service benefits"
    ]
  },
  "Turkey": {
    agency: "Çevre, Şehircilik ve İklim Değişikliği Bakanlığı",
    mainLaws: [
      "Çevre Kanunu (Environment Law No. 2872)",
      "Atık Yönetimi Yönetmeliği",
      "Ömrünü Tamamlamış Lastiklerin Kontrolü Yönetmeliği",
      "Çevresel Etki Değerlendirmesi Yönetmeliği"
    ],
    environmentalRequirements: [
      "Çevresel Etki Değerlendirmesi (ÇED)",
      "Geçici Faaliyet Belgesi / Çevre İzin ve Lisansı",
      "Emisyon İzni",
      "Atık Yönetim Planı",
      "Çevre Görevlisi atama"
    ],
    taxIncentives: [
      "Yatırım teşvik belgesi",
      "KDV istisnası (machinery)",
      "Gümrük vergisi muafiyeti",
      "Organize Sanayi Bölgesi avantajları",
      "KOSGEB destekleri"
    ],
    licenses: [
      "Çevre İzin ve Lisansı",
      "İşyeri Açma ve Çalışma Ruhsatı",
      "Ticaret Sicil Kaydı",
      "Yapı Ruhsatı"
    ],
    laborRegulations: [
      "İş Kanunu (No. 4857)",
      "İş Sağlığı ve Güvenliği Kanunu (No. 6331)",
      "SGK kaydı",
      "Risk Değerlendirmesi"
    ]
  },

  // ==========================================
  // AFRICA & OCEANIA
  // ==========================================
  
  "Australia": {
    agency: "EPA (Environment Protection Authority), Department of Climate Change and Environment",
    mainLaws: [
      "Environment Protection Act (varies by state)",
      "Tyre Stewardship Scheme (TSA)",
      "National Environment Protection Measures (NEPMs)",
      "Product Stewardship Act 2011"
    ],
    environmentalRequirements: [
      "Development Consent / Planning Approval",
      "Environmental Protection License (EPL)",
      "Waste Management License",
      "Air Quality Impact Assessment",
      "Noise Impact Assessment"
    ],
    taxIncentives: [
      "Instant Asset Write-off for business equipment",
      "R&D Tax Incentive for innovation",
      "Clean Energy Finance Corporation support",
      "State-based environmental grants",
      "Carbon Credit opportunities (ACCUs)"
    ],
    licenses: [
      "Environmental Protection License",
      "Waste Transport License",
      "Scheduled Premises License",
      "Development Approval"
    ],
    laborRegulations: [
      "Fair Work Act 2009",
      "Work Health and Safety Act",
      "Model WHS Regulations",
      "Workers Compensation requirements"
    ]
  },
  "New Zealand": {
    agency: "Ministry for the Environment, Regional Councils, EPA NZ",
    mainLaws: [
      "Resource Management Act 1991 (RMA)",
      "Waste Minimisation Act 2008",
      "Hazardous Substances and New Organisms Act 1996",
      "Climate Change Response Act 2002"
    ],
    environmentalRequirements: [
      "Resource Consent (land use, discharge, water)",
      "Assessment of Environmental Effects (AEE)",
      "Waste Management and Minimisation Plan",
      "Air discharge consent",
      "Trade waste agreement"
    ],
    taxIncentives: [
      "Depreciation on plant and equipment",
      "R&D Tax Incentive (15% tax credit)",
      "Waste levy exemptions for recovery activities",
      "Regional development incentives",
      "Callaghan Innovation grants"
    ],
    licenses: [
      "Resource Consent from Regional Council",
      "Building Consent",
      "Companies Office registration",
      "IRD number"
    ],
    laborRegulations: [
      "Health and Safety at Work Act 2015",
      "Health and Safety at Work Regulations 2016",
      "ACC (Accident Compensation)",
      "Employment Relations Act 2000"
    ]
  },
  "South Africa": {
    agency: "Department of Forestry, Fisheries and the Environment (DFFE), Provincial Departments",
    mainLaws: [
      "National Environmental Management: Waste Act 59 of 2008 (NEMWA)",
      "National Environmental Management Act 107 of 1998 (NEMA)",
      "Waste Tyre Regulations 2017 (GN R1064)",
      "Air Quality Act 39 of 2004"
    ],
    environmentalRequirements: [
      "Environmental Authorization (EA)",
      "Waste Management License (WML)",
      "Atmospheric Emission License (AEL)",
      "Environmental Impact Assessment",
      "Registration with REDISA/SAWIC (Tyre Industry Waste Management Plan)"
    ],
    taxIncentives: [
      "Section 12I Tax Allowance (manufacturing)",
      "Section 12L Energy Efficiency Savings",
      "Special Economic Zones tax incentives",
      "Industrial Development Corporation funding",
      "DTI incentive schemes"
    ],
    licenses: [
      "Environmental Authorization",
      "Waste Management License",
      "Business Registration (CIPC)",
      "Municipal zoning approval"
    ],
    laborRegulations: [
      "Occupational Health and Safety Act 85 of 1993",
      "Basic Conditions of Employment Act",
      "Labour Relations Act",
      "Compensation for Occupational Injuries and Diseases Act"
    ]
  },
  "Nigeria": {
    agency: "Federal Ministry of Environment, NESREA, State Environmental Protection Agencies",
    mainLaws: [
      "National Environmental Standards and Regulations Enforcement Agency Act 2007",
      "Environmental Impact Assessment Act 1992",
      "National Environmental (Sanitation and Waste Control) Regulations 2009",
      "Harmful Waste (Special Criminal Provisions) Act"
    ],
    environmentalRequirements: [
      "Environmental Impact Assessment (EIA) Approval",
      "Environmental Audit Report",
      "Waste Management Permit from NESREA",
      "State Environmental Permit",
      "Pollution control measures"
    ],
    taxIncentives: [
      "Pioneer status tax holiday (3-5 years)",
      "Capital allowances on plant and machinery",
      "Export Free Zone incentives",
      "Tax relief for R&D",
      "Nigerian Content Development incentives"
    ],
    licenses: [
      "EIA Approval from Federal Ministry of Environment",
      "NESREA permit",
      "CAC Business Registration",
      "State Ministry of Environment permit"
    ],
    laborRegulations: [
      "Labour Act 2004",
      "Factories Act",
      "Employee's Compensation Act 2010",
      "National Health Insurance Scheme"
    ]
  },
  "Kenya": {
    agency: "National Environment Management Authority (NEMA)",
    mainLaws: [
      "Environmental Management and Co-ordination Act (EMCA) 1999 (revised 2015)",
      "Waste Management Regulations 2006",
      "Environmental (Impact Assessment and Audit) Regulations 2003",
      "Air Quality Regulations 2014"
    ],
    environmentalRequirements: [
      "Environmental Impact Assessment (EIA) License",
      "NEMA License for Waste Management",
      "Annual Environmental Audit",
      "Effluent Discharge License",
      "Noise and Vibration Control"
    ],
    taxIncentives: [
      "Investment deduction allowance (100% first year)",
      "Wear and tear deduction",
      "Export Processing Zone benefits",
      "Special Economic Zones incentives",
      "Green energy incentives"
    ],
    licenses: [
      "NEMA EIA License",
      "County Government Business Permit",
      "KRA PIN Certificate",
      "Fire Safety Certificate"
    ],
    laborRegulations: [
      "Occupational Safety and Health Act 2007",
      "Employment Act 2007",
      "Work Injury Benefits Act",
      "NSSF and NHIF contributions"
    ]
  },
  "Egypt": {
    agency: "Ministry of Environment, Egyptian Environmental Affairs Agency (EEAA)",
    mainLaws: [
      "Environment Law No. 4 of 1994 (amended by Law 9/2009)",
      "Waste Management Regulation Law No. 202 of 2020",
      "Executive Regulations for Environmental Protection",
      "Industrial Development Authority regulations"
    ],
    environmentalRequirements: [
      "Environmental Impact Assessment (EIA)",
      "Environmental Approval from EEAA",
      "Waste Management License",
      "Air emission monitoring",
      "Environmental Register"
    ],
    taxIncentives: [
      "Investment Law No. 72 of 2017 incentives",
      "Free Zone benefits",
      "Special Economic Zones tax holidays",
      "Golden License for strategic projects",
      "Customs exemptions for equipment"
    ],
    licenses: [
      "Environmental Approval",
      "Industrial License (IDA)",
      "Commercial Registry",
      "Tax Card"
    ],
    laborRegulations: [
      "Labour Law No. 12 of 2003",
      "Social Insurance Law",
      "Occupational Safety regulations",
      "Employment injury insurance"
    ]
  },
  "Morocco": {
    agency: "Ministère de la Transition Énergétique et du Développement Durable",
    mainLaws: [
      "Loi 28-00 relative à la gestion des déchets",
      "Loi 11-03 relative à la protection de l'environnement",
      "Loi 12-03 relative aux études d'impact sur l'environnement",
      "Décret sur la gestion des déchets dangereux"
    ],
    environmentalRequirements: [
      "Étude d'Impact sur l'Environnement (EIE)",
      "Autorisation d'exploitation",
      "Acceptabilité environnementale",
      "Plan de gestion des déchets",
      "Suivi environnemental"
    ],
    taxIncentives: [
      "Exonération de TVA pour équipements solaires",
      "Fonds de développement industriel",
      "Zones franches d'exportation",
      "Plan d'accélération industrielle",
      "Crédit d'impôt R&D"
    ],
    licenses: [
      "Acceptabilité environnementale",
      "Autorisation d'exercer",
      "Inscription au registre de commerce",
      "Patente"
    ],
    laborRegulations: [
      "Code du Travail (Loi 65-99)",
      "Loi sur les accidents du travail",
      "CNSS (Caisse Nationale de Sécurité Sociale)",
      "Médecine du travail"
    ]
  },
  "Ghana": {
    agency: "Environmental Protection Agency (EPA Ghana)",
    mainLaws: [
      "Environmental Protection Agency Act 1994 (Act 490)",
      "Environmental Assessment Regulations 1999 (LI 1652)",
      "Hazardous, Electronic and Other Wastes Control and Management Act 2016",
      "Environmental Quality Guidelines"
    ],
    environmentalRequirements: [
      "Environmental Permit from EPA",
      "Environmental Impact Assessment",
      "Preliminary Environmental Report",
      "Annual Environmental Report",
      "Waste Management Plan"
    ],
    taxIncentives: [
      "Free Zones incentives (10-year tax holiday)",
      "Capital allowance for plant and machinery",
      "Import duty exemptions",
      "GIPC incentives for priority sectors",
      "Special incentives for manufacturing"
    ],
    licenses: [
      "EPA Environmental Permit",
      "Business Registration (Registrar General)",
      "Tax Identification Number",
      "Metropolitan/District Assembly permit"
    ],
    laborRegulations: [
      "Labour Act 2003 (Act 651)",
      "Factories, Offices and Shops Act",
      "Workmen's Compensation Law",
      "SSNIT contributions"
    ]
  }
};

// Default regulations for unknown countries
const defaultRegulations: CountryRegulation = {
  agency: "National Environmental Agency, Ministry of Environment",
  mainLaws: [
    "National Waste Management Act",
    "Environmental Protection Act",
    "Industrial Licensing Regulations",
    "End-of-life Tire Management Regulations"
  ],
  environmentalRequirements: [
    "Environmental Impact Assessment (EIA)",
    "Operating Permit/License",
    "Waste Management Plan",
    "Air Quality Monitoring",
    "Water Discharge Permit (if applicable)"
  ],
  taxIncentives: [
    "Accelerated depreciation for green investments",
    "Tax credits for recycling equipment",
    "Regional development incentives",
    "Green financing options"
  ],
  licenses: [
    "Environmental Operating License",
    "Industrial Operating Permit",
    "Business Registration",
    "Waste Handler License"
  ],
  laborRegulations: [
    "National Labor Code",
    "Occupational Health & Safety regulations",
    "Personal Protective Equipment requirements",
    "Workers compensation insurance"
  ]
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { study, language = 'en', model = 'flash' } = await req.json() as { 
      study: FeasibilityStudy; 
      language?: string;
      model?: 'flash' | 'pro';
    };
    
    // Use Gemini for flash, Anthropic for pro
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    
    if (model === 'flash' && !GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY is not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    if (model === 'pro' && !ANTHROPIC_API_KEY) {
      return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY is not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Calculate additional metrics
    const annualTonnage = study.daily_capacity_tons * study.operating_days_per_year * (study.utilization_rate / 100);
    const ebitdaMargin = study.annual_revenue > 0 ? (study.annual_ebitda / study.annual_revenue) * 100 : 0;
    const revenuePerTon = annualTonnage > 0 ? study.annual_revenue / annualTonnage : 0;
    const opexPerTon = annualTonnage > 0 ? study.annual_opex / annualTonnage : 0;
    
    // Revenue breakdown
    const rubberRevenue = annualTonnage * (study.rubber_granules_yield / 100) * study.rubber_granules_price;
    const steelRevenue = annualTonnage * (study.steel_wire_yield / 100) * study.steel_wire_price;
    const fiberRevenue = annualTonnage * (study.textile_fiber_yield / 100) * study.textile_fiber_price;

    // Government partnership metrics
    const royaltiesPercent = study.government_royalties_percent || 0;
    const envBonusPerTon = study.environmental_bonus_per_ton || 0;
    const annualRoyalties = study.annual_revenue * (royaltiesPercent / 100);
    const annualEnvBonus = annualTonnage * envBonusPerTon;
    const netRevenueAfterRoyalties = study.annual_revenue - annualRoyalties - annualEnvBonus;
    const hasGovPartnership = royaltiesPercent > 0 || envBonusPerTon > 0;

    // Get country-specific regulations
    const country = study.country || 'Unknown';
    const regulations = countryRegulations[country] || defaultRegulations;

    const languageInstructions: Record<string, string> = {
      en: "Respond in English.",
      pt: "Responda em Português do Brasil.",
      es: "Responde en Español.",
      zh: "用中文回复。",
      it: "Rispondi in Italiano."
    };

    const systemPrompt = `<role>You are an expert industrial consultant specializing in OTR (Off-The-Road) tire recycling plants with 25+ years of experience in environmental regulations, industrial licensing, market conditions, and economic viability analysis.</role>

<language_instruction>${languageInstructions[language] || languageInstructions.en}</language_instruction>

## CRITICAL: BUSINESS MODEL CONTEXT (MUST START YOUR ANALYSIS WITH THIS)
This project is presented by ELP Green Technology in partnership with TOPS Recycling (China). Their business model is UNIQUE and must be explained first:

**The ELP/TOPS OTR Smart Line Partnership Model:**
- ELP Green Technology does NOT sell equipment or machinery
- Instead, ELP seeks STRATEGIC PARTNERS worldwide to jointly operate OTR tire recycling plants
- The "Smart Line" is an advanced robotics-based OTR tire processing system:
  - Robotic automation: Place tire on platform → robot automatically positions and cuts
  - Processes large OTR tires (57" to 63"+) from mining, ports, and heavy industry
  - First demonstration line: Australia (April/May 2025)
- ELP travels to partner locations to evaluate OTR tire sources (mining companies, ports, tire manufacturers, tire dealers)
- ELP negotiates directly with resource owners (mining companies, governments, etc.)
- Joint venture model: ELP brings technology + expertise, Partner brings OTR tire sources + local market access

**Global Expansion Vision 2025-2030:**
- Goal: 1 million tons/year capacity across 17-18 factories worldwide
- First Smart Line: Australia Q1-Q2 2025
- 2026: South America & Europe expansion (3-4 factories)
- 2027: Africa & Middle East (8-10 factories)
- 2028-2030: Complete global goal (~175 tons/hour total capacity)

**What ELP seeks in partners:**
- Access to OTR tire sources (mining companies, tire manufacturers, dealers, ports)
- Local market knowledge and government relationships
- Commitment to joint operation of recycling facilities

BEGIN YOUR ANALYSIS by explaining this unique partnership model and how this feasibility study supports a potential joint venture opportunity.

You MUST cover ALL sections below, but keep the response within a practical length (target 1800–2500 words). Do not omit any section. For each section: write 1 short paragraph + 4–8 bullet points max. Prioritize actionable recommendations and numeric references; avoid repetition.

## 1. OVERALL VIABILITY ASSESSMENT
- Clear rating: Excellent / Good / Moderate / Risky / Not Recommended
- Detailed justification based on all financial metrics (ROI, IRR, NPV, Payback, EBITDA margin)
- Comparison with industry benchmarks
- Investment grade assessment
- **Partnership attractiveness score** (how attractive is this location for the ELP partnership model)

## 2. REGULATORY FRAMEWORK FOR ${country.toUpperCase()}
Based on the country's specific regulations, cover COMPLETELY:
- **Regulatory Agencies**: ${regulations.agency} - explain their roles and jurisdiction
- **Key Legislation**: List and explain EACH applicable law in detail
- **Required Licenses**: Detail EVERY license needed with timeline and costs
- **Environmental Requirements**: All specific assessments and permits needed
- **Compliance Timeline**: Detailed realistic timeline from application to operation (month by month)

## 3. ENVIRONMENTAL COMPLIANCE
Provide COMPLETE analysis of:
- Environmental Impact Assessment (EIA) requirements and process
- Air quality monitoring specifications and emission limits (specific values)
- Water usage permits and discharge requirements
- Waste management plans and circular economy integration
- Noise and vibration limits with specific dB values
- Required environmental monitoring equipment list
- Annual environmental reporting obligations

## 4. FINANCIAL & TAX INCENTIVES
Based on ${country} regulations, detail EACH incentive:
${regulations.taxIncentives.map(i => `- ${i}`).join('\n')}
- Step-by-step process to access each incentive
- Estimated monetary value for this specific project scale
- Timeline and application process
- Required documentation

## 5. LABOR & SAFETY REQUIREMENTS
${regulations.laborRegulations.map(r => `- ${r}`).join('\n')}
- Minimum staffing requirements by department
- Training and certification programs needed
- Safety equipment specifications and protocols
- Accident prevention programs
- Workers' compensation requirements

## 6. MARKET ANALYSIS FOR ${study.location || country}
- Local and regional demand for recycled rubber products
- Competitor landscape analysis
- Supply chain considerations for raw materials
- Off-take agreements potential and pricing
- Export opportunities and logistics
- Market growth projections
- **OTR tire availability assessment** (mining operations, ports, heavy industry in the region)

## 7. KEY STRENGTHS (provide at least 10-12 points)
- All financial advantages with specific metrics
- Strategic location benefits
- Technology and equipment advantages (Smart Line robotics)
- Market positioning opportunities
- ESG and sustainability strengths
- Government partnership benefits (if applicable)
- Partnership model synergies

## 8. RISK FACTORS & MITIGATION (comprehensive analysis)
- Regulatory risks with specific scenarios
- Market and price volatility risks
- Operational and technical risks
- Financial and currency risks
- Political and social risks
- Environmental liability risks
- DETAILED mitigation strategies for EACH risk

## 9. DETAILED RECOMMENDATIONS
- Pre-project phase steps (checklist)
- License application strategy and timeline
- Financing structure recommendations
- Partnership and stakeholder engagement
- Technology procurement strategy
- Human resources development plan
- Implementation timeline (Gantt-style breakdown)

${hasGovPartnership ? `
## 10. GOVERNMENT PARTNERSHIP MODEL ANALYSIS
This project includes a government partnership with:
- Royalties: ${royaltiesPercent}% of revenue
- Environmental Bonus: USD ${envBonusPerTon}/ton
- Collection Model: ${study.collection_model || 'hybrid'}

Provide COMPLETE analysis of:
- Long-term sustainability of the partnership model
- Detailed impact on project economics and cash flows
- Contract structuring recommendations
- Risk allocation between parties
- Social impact and community benefits
- ESG alignment and SDG contributions
- Political risk assessment
- Exit strategy considerations
` : ''}

## 11. VISUAL ANALYTICS INTERPRETATION (ANALYZE EACH CHART IN DETAIL)

### Revenue Breakdown Analysis
- Explain the composition of revenue streams (rubber granules, steel wire, textile fiber, rCB recovered carbon black)
- Assess dependency on primary product (rubber granules typically 50-55%)
- Highlight the value of rCB (recovered carbon black) at $800-1200/ton as premium product
- Revenue diversification recommendations
- Price sensitivity by product category

### OPEX Breakdown Analysis  
- Analyze cost structure efficiency (labor, energy, maintenance, logistics, admin)
- Identify cost optimization opportunities
- Benchmark against industry standards
- Variable vs fixed cost ratio analysis

### Cash Flow Projection (10-Year) Analysis
- Explain cash flow trajectory year by year
- Identify critical cash flow periods (negative during investment, positive during operation)
- Break-even and payback visualization interpretation
- Cumulative profit growth analysis
- Reinvestment capacity assessment

### ESG Performance Radar Analysis
- Interpret each ESG dimension score (Environmental, Social, Governance, Waste, Innovation)
- Identify strengths and improvement areas
- ESG rating implications for financing and partnerships
- SDG alignment assessment

### ROI Sensitivity Heatmap Analysis
- Explain price and capacity impact zones
- Identify optimal operating parameters
- Risk corridors and safe zones
- "Sweet spot" for maximum profitability

### Sensitivity Analysis Interpretation
- Price elasticity impact on ROI
- Capacity utilization critical thresholds
- OPEX variation tolerance analysis
- Scenario planning recommendations

### CAPEX Distribution Analysis
- Investment allocation efficiency (equipment, infrastructure, installation, working capital)
- Equipment vs infrastructure balance
- Working capital adequacy assessment
- Comparison with industry benchmarks

## 12. FINAL PARTNERSHIP RECOMMENDATION
Conclude with a specific recommendation for the ELP partnership:
- Is this location suitable for the Smart Line partnership model?
- What are the key success factors for this joint venture?
- What should ELP and the potential partner prioritize?
- Timeline for partnership development

CRITICAL INSTRUCTION: Cover ALL sections with clear headings. Keep total length 1800–2500 words. Each section must include 1 short paragraph + 4–8 bullet points max. Prioritize actionable, country-specific guidance and numeric references. Avoid repetition.`;

    const userPrompt = `Analyze this OTR tire recycling plant feasibility study in COMPLETE DETAIL:

**Project Details:**
- Name: ${study.study_name}
- Location: ${study.location || 'Not specified'}, ${study.country || 'Not specified'}
- Daily Capacity: ${study.daily_capacity_tons} tons/day
- Operating Days: ${study.operating_days_per_year} days/year
- Utilization Rate: ${study.utilization_rate}%
- Annual Production: ${annualTonnage.toFixed(0)} tons

**Investment (CAPEX):**
- Total Investment: USD ${(study.total_investment / 1000000).toFixed(2)}M
- Equipment: USD ${((study.equipment_cost || 0) / 1000000).toFixed(2)}M (${study.total_investment > 0 ? (((study.equipment_cost || 0) / study.total_investment) * 100).toFixed(1) : 0}%)
- Infrastructure: USD ${((study.infrastructure_cost || 0) / 1000000).toFixed(2)}M
- Installation: USD ${((study.installation_cost || 0) / 1000000).toFixed(2)}M
- Working Capital: USD ${((study.working_capital || 0) / 1000000).toFixed(2)}M

**Revenue (Annual):**
- Total Revenue: USD ${(study.annual_revenue / 1000000).toFixed(2)}M
- Rubber Granules (${study.rubber_granules_yield}% yield @ $${study.rubber_granules_price}/ton): USD ${(rubberRevenue / 1000000).toFixed(2)}M (${study.annual_revenue > 0 ? ((rubberRevenue / study.annual_revenue) * 100).toFixed(1) : 0}%)
- Steel Wire (${study.steel_wire_yield}% yield @ $${study.steel_wire_price}/ton): USD ${(steelRevenue / 1000000).toFixed(2)}M (${study.annual_revenue > 0 ? ((steelRevenue / study.annual_revenue) * 100).toFixed(1) : 0}%)
- Textile Fiber (${study.textile_fiber_yield}% yield @ $${study.textile_fiber_price}/ton): USD ${(fiberRevenue / 1000000).toFixed(2)}M
- rCB Recovered Carbon Black (${study.rcb_yield || 12}% yield @ $${study.rcb_price || 1000}/ton): Premium product via pyrolysis
- Revenue per ton processed: USD ${revenuePerTon.toFixed(2)}

**Operating Costs (Annual):**
- Total OPEX: USD ${(study.annual_opex / 1000000).toFixed(2)}M
- Labor: USD ${((study.labor_cost || 0) * 12 / 1000000).toFixed(2)}M (${study.annual_opex > 0 ? (((study.labor_cost || 0) * 12 / study.annual_opex) * 100).toFixed(1) : 0}%)
- Energy: USD ${((study.energy_cost || 0) * 12 / 1000000).toFixed(2)}M
- Maintenance: USD ${((study.maintenance_cost || 0) * 12 / 1000000).toFixed(2)}M
- Logistics: USD ${((study.logistics_cost || 0) * 12 / 1000000).toFixed(2)}M
- Cost per ton: USD ${opexPerTon.toFixed(2)}

**Financial Metrics:**
- Annual EBITDA: USD ${(study.annual_ebitda / 1000000).toFixed(2)}M
- EBITDA Margin: ${ebitdaMargin.toFixed(1)}%
- ROI: ${study.roi_percentage.toFixed(1)}%
- IRR: ${study.irr_percentage.toFixed(1)}%
- NPV (10 years): USD ${(study.npv_10_years / 1000000).toFixed(2)}M
- Payback Period: ${study.payback_months} months (${(study.payback_months / 12).toFixed(1)} years)
- Tax Rate: ${study.tax_rate}%
- Discount Rate: ${study.discount_rate || 12}%

${hasGovPartnership ? `
**Government Partnership Model:**
- Collection Model: ${study.collection_model || 'Not specified'}
- Government Royalties: ${royaltiesPercent}% of revenue (USD ${(annualRoyalties / 1000000).toFixed(2)}M/year)
- Environmental Bonus: USD ${envBonusPerTon}/ton (USD ${(annualEnvBonus / 1000000).toFixed(2)}M/year)
- Net Revenue After Royalties: USD ${(netRevenueAfterRoyalties / 1000000).toFixed(2)}M
- Social Impact: Job creation, environmental improvement, circular economy
` : ''}

**Country-Specific Regulatory Information for ${country}:**
- Regulatory Agency: ${regulations.agency}
- Main Laws: ${regulations.mainLaws.join('; ')}
- Required Licenses: ${regulations.licenses.join('; ')}
- Environmental Requirements: ${regulations.environmentalRequirements.join('; ')}
- Available Tax Incentives: ${regulations.taxIncentives.join('; ')}
- Labor Regulations: ${regulations.laborRegulations.join('; ')}

**CHART DATA FOR ANALYSIS:**
- Revenue Distribution: Rubber ${study.rubber_granules_yield}%, Steel ${study.steel_wire_yield}%, Fiber ${study.textile_fiber_yield}%, rCB ${study.rcb_yield || 12}% (premium via pyrolysis)
- OPEX Components: Labor ${study.annual_opex > 0 ? (((study.labor_cost || 0) * 12 / study.annual_opex) * 100).toFixed(0) : 0}%, Energy ${study.annual_opex > 0 ? (((study.energy_cost || 0) * 12 / study.annual_opex) * 100).toFixed(0) : 0}%, Maintenance ${study.annual_opex > 0 ? (((study.maintenance_cost || 0) * 12 / study.annual_opex) * 100).toFixed(0) : 0}%
- 10-Year NPV: USD ${(study.npv_10_years / 1000000).toFixed(2)}M with ${study.payback_months} month payback
- ESG Rating: High environmental impact with ${annualTonnage.toFixed(0)} tons waste processed/year

CRITICAL INSTRUCTION: Provide your COMPLETE and EXHAUSTIVE expert analysis. Cover ALL 11 sections in full detail. DO NOT stop before completing all sections. Each section must have substantial, actionable content.`;

    // Adjust prompt based on model type
    const analysisPrompt = model === 'flash' 
      ? systemPrompt + "\n\nProvide a COMPLETE analysis covering ALL sections. Be concise but thorough - each section needs actionable content. Do NOT stop mid-section.\n\n" + userPrompt
      : systemPrompt + "\n\nProvide an EXHAUSTIVE and COMPLETE analysis. Cover ALL 12 sections in full detail. Do NOT stop before completing all sections.\n\n" + userPrompt;

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    let analysis = "";
    let usedModel = model;
    let didFallback = false;

    if (model === 'flash') {
      // Use Gemini API for flash analysis
      const callGemini = async (prompt: string) => {
        return await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }],
            generationConfig: {
              maxOutputTokens: 8192,
              temperature: 0.7
            }
          }),
        });
      };

      let response: Response | null = null;
      let lastErrorText = "";

      for (let attempt = 0; attempt < 3; attempt++) {
        response = await callGemini(analysisPrompt);

        if (response.ok) break;

        if (response.status === 429) {
          const waitMs = Math.min(8000, 800 * Math.pow(2, attempt) + Math.floor(Math.random() * 250));
          await sleep(waitMs);
          continue;
        }

        lastErrorText = await response.text();
        break;
      }

      if (!response || !response.ok) {
        if (response?.status === 429) {
          return new Response(
            JSON.stringify({
              error: "Rate limits exceeded. Please try again in a few moments.",
              recommended_model: "pro",
            }),
            {
              status: 429,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const errorText = lastErrorText || (response ? await response.text() : "Unknown error");
        console.error("Gemini API error:", response?.status, errorText);
        return new Response(JSON.stringify({ error: "AI analysis failed", details: errorText }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const data = await response.json();
      analysis = data.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to generate analysis.";

    } else {
      // Use Anthropic Claude API for pro analysis
      const callClaude = async (prompt: string) => {
        return await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": ANTHROPIC_API_KEY!,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 16384,
            messages: [
              {
                role: "user",
                content: prompt,
              },
            ],
          }),
        });
      };

      let response: Response | null = null;
      let lastErrorText = "";

      for (let attempt = 0; attempt < 3; attempt++) {
        response = await callClaude(analysisPrompt);

        if (response.ok) break;

        if (response.status === 429) {
          const waitMs = Math.min(8000, 800 * Math.pow(2, attempt) + Math.floor(Math.random() * 250));
          await sleep(waitMs);
          continue;
        }

        lastErrorText = await response.text();
        break;
      }

      if (!response || !response.ok) {
        if (response?.status === 429) {
          return new Response(
            JSON.stringify({
              error: "Rate limits exceeded. Please try again in a few moments.",
              recommended_model: "flash",
            }),
            {
              status: 429,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const errorText = lastErrorText || (response ? await response.text() : "Unknown error");
        console.error("Anthropic API error:", response?.status, errorText);
        return new Response(JSON.stringify({ error: "AI analysis failed", details: errorText }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const data = await response.json();
      analysis = data.content?.[0]?.text || "Unable to generate analysis.";
    }

    return new Response(JSON.stringify({ 
      analysis,
      model_used: usedModel,
      did_fallback: didFallback,
      metrics: {
        annualTonnage,
        ebitdaMargin,
        revenuePerTon,
        opexPerTon,
        rubberRevenue,
        steelRevenue,
        fiberRevenue,
        annualRoyalties,
        annualEnvBonus,
        netRevenueAfterRoyalties
      },
      regulations: {
        country,
        ...regulations
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Analyze feasibility error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
