import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Country-specific legal frameworks  
const countryLegalData: Record<
  string,
  {
    dataProtection: string;
    contractLaw: string;
    jurisdiction: string;
    language: string;
    currency: string;
    governingLaw: string;
    arbitration: string;
    taxId: string;
    corporateTypes: string[];
  }
> = {
  brazil: {
    dataProtection: "LGPD (Lei 13.709/2018)",
    contractLaw: "Código Civil Brasileiro (Lei 10.406/2002)",
    jurisdiction: "Foro da Comarca de São Paulo/SP",
    language: "pt",
    currency: "BRL",
    governingLaw: "Leis da República Federativa do Brasil",
    arbitration: "Câmara de Comércio Brasil-Itália (CCBI)",
    taxId: "CNPJ",
    corporateTypes: ["S/A", "Ltda.", "EIRELI", "MEI", "EPP"],
  },
  italy: {
    dataProtection: "GDPR (Reg. UE 2016/679) e D.Lgs. 196/2003",
    contractLaw: "Codice Civile Italiano",
    jurisdiction: "Foro di Milano",
    language: "it",
    currency: "EUR",
    governingLaw: "Leggi della Repubblica Italiana",
    arbitration: "Camera Arbitrale di Milano",
    taxId: "Partita IVA",
    corporateTypes: ["S.p.A.", "S.r.l.", "S.a.s.", "S.n.c."],
  },
  germany: {
    dataProtection: "DSGVO (EU-DSGVO) und BDSG",
    contractLaw: "Bürgerliches Gesetzbuch (BGB)",
    jurisdiction: "Landgericht Frankfurt am Main",
    language: "de",
    currency: "EUR",
    governingLaw: "Deutsches Recht",
    arbitration: "Deutsche Institution für Schiedsgerichtsbarkeit (DIS)",
    taxId: "Steuernummer",
    corporateTypes: ["GmbH", "AG", "KG", "OHG", "UG"],
  },
  usa: {
    dataProtection: "CCPA, HIPAA (where applicable), State Privacy Laws",
    contractLaw: "Uniform Commercial Code (UCC)",
    jurisdiction: "State of Delaware",
    language: "en",
    currency: "USD",
    governingLaw: "Laws of the State of Delaware, United States",
    arbitration: "American Arbitration Association (AAA)",
    taxId: "EIN (Employer Identification Number)",
    corporateTypes: ["LLC", "Inc.", "Corp.", "LLP", "S-Corp"],
  },
  australia: {
    dataProtection: "Privacy Act 1988 and Australian Privacy Principles",
    contractLaw: "Australian Contract Law (Common Law)",
    jurisdiction: "Courts of New South Wales",
    language: "en",
    currency: "AUD",
    governingLaw: "Laws of New South Wales, Australia",
    arbitration: "Australian Centre for International Commercial Arbitration",
    taxId: "ABN (Australian Business Number)",
    corporateTypes: ["Pty Ltd", "Ltd", "Pty", "Trust"],
  },
  mexico: {
    dataProtection: "Ley Federal de Protección de Datos Personales (LFPDPPP)",
    contractLaw: "Código de Comercio y Código Civil Federal",
    jurisdiction: "Tribunales de la Ciudad de México",
    language: "es",
    currency: "MXN",
    governingLaw: "Leyes de los Estados Unidos Mexicanos",
    arbitration: "Centro de Arbitraje de México (CAM)",
    taxId: "RFC (Registro Federal de Contribuyentes)",
    corporateTypes: ["S.A. de C.V.", "S. de R.L.", "S.A.", "S.C."],
  },
  china: {
    dataProtection: "中华人民共和国个人信息保护法 (PIPL)",
    contractLaw: "中华人民共和国民法典",
    jurisdiction: "深圳市人民法院",
    language: "zh",
    currency: "CNY",
    governingLaw: "中华人民共和国法律",
    arbitration: "中国国际经济贸易仲裁委员会 (CIETAC)",
    taxId: "统一社会信用代码",
    corporateTypes: ["有限责任公司", "股份有限公司", "合伙企业"],
  },
  default: {
    dataProtection: "Applicable data protection laws",
    contractLaw: "International Commercial Law",
    jurisdiction: "Courts of the agreed jurisdiction",
    language: "en",
    currency: "USD",
    governingLaw: "Laws agreed by the parties",
    arbitration: "ICC International Court of Arbitration",
    taxId: "Tax ID",
    corporateTypes: ["Limited", "Corporation", "Partnership"],
  },
};

// Template-specific content generators
const templateStructures: Record<string, { sections: string[]; keyFields: string[] }> = {
  nda: {
    sections: [
      "Parties",
      "Purpose",
      "Confidential Information Definition",
      "Obligations",
      "Exclusions",
      "Term",
      "Return of Information",
      "Remedies",
      "Governing Law",
      "Signatures",
    ],
    keyFields: [
      "disclosing_party",
      "receiving_party",
      "purpose",
      "duration",
      "effective_date",
      "contact_name",
      "company_name",
      "email",
      "address",
    ],
  },
  nda_bilateral: {
    sections: [
      "Parties",
      "Recitals",
      "Mutual Confidentiality",
      "Definition of Confidential Information",
      "Obligations of Both Parties",
      "Exclusions",
      "Term and Termination",
      "Return of Materials",
      "Remedies",
      "Non-Solicitation",
      "Governing Law",
      "Entire Agreement",
      "Signatures",
    ],
    keyFields: [
      "party_a",
      "party_b",
      "party_a_address",
      "party_b_address",
      "purpose",
      "duration",
      "effective_date",
      "party_a_representative",
      "party_b_representative",
    ],
  },
  joint_venture: {
    sections: [
      "Parties and Recitals",
      "Definitions",
      "Formation and Purpose",
      "Capital Contributions",
      "Management Structure",
      "Profit and Loss Sharing",
      "Intellectual Property",
      "Confidentiality",
      "Non-Competition",
      "Term and Termination",
      "Dispute Resolution",
      "Exit Strategy",
      "Representations and Warranties",
      "Governing Law",
      "Signatures",
    ],
    keyFields: [
      "partner_a",
      "partner_b",
      "jv_name",
      "jv_purpose",
      "partner_a_contribution",
      "partner_b_contribution",
      "profit_share_a",
      "profit_share_b",
      "duration",
      "effective_date",
      "location",
      "governing_law",
    ],
  },
  kyc: {
    sections: [
      "Company Information",
      "Beneficial Ownership",
      "Directors and Officers",
      "Financial Information",
      "Business Activities",
      "AML/CFT Compliance",
      "Source of Funds",
      "Risk Assessment",
      "Declaration",
      "Supporting Documents",
    ],
    keyFields: [
      "company_name",
      "registration_number",
      "incorporation_date",
      "registered_address",
      "business_address",
      "beneficial_owners",
      "directors",
      "annual_revenue",
      "employees",
      "industry",
      "source_of_funds",
    ],
  },
  consent: {
    sections: [
      "Data Controller Information",
      "Purpose of Processing",
      "Categories of Data",
      "Legal Basis",
      "Data Recipients",
      "International Transfers",
      "Retention Period",
      "Your Rights",
      "Consent Declaration",
      "Withdrawal of Consent",
    ],
    keyFields: [
      "data_subject_name",
      "data_subject_email",
      "controller_name",
      "controller_address",
      "purposes",
      "data_categories",
      "retention_period",
      "effective_date",
    ],
  },
  contract: {
    sections: [
      "Parties",
      "Recitals",
      "Definitions",
      "Scope of Work",
      "Deliverables",
      "Timeline",
      "Payment Terms",
      "Intellectual Property",
      "Warranties",
      "Limitation of Liability",
      "Indemnification",
      "Confidentiality",
      "Term and Termination",
      "Force Majeure",
      "Dispute Resolution",
      "General Provisions",
      "Signatures",
    ],
    keyFields: [
      "client_name",
      "provider_name",
      "scope",
      "deliverables",
      "total_value",
      "payment_schedule",
      "start_date",
      "end_date",
      "governing_law",
    ],
  },
  report: {
    sections: [
      "Executive Summary",
      "Introduction",
      "Environmental Impact",
      "Social Responsibility",
      "Governance Practices",
      "Sustainability Metrics",
      "Carbon Footprint",
      "Waste Management",
      "Community Engagement",
      "Future Goals",
      "Conclusion",
    ],
    keyFields: [
      "report_period",
      "company_name",
      "co2_reduction",
      "waste_processed",
      "jobs_created",
      "investments",
      "certifications",
    ],
  },
  proposal: {
    sections: [
      "Cover Page",
      "Executive Summary",
      "Company Overview",
      "Understanding of Needs",
      "Proposed Solution",
      "Technical Specifications",
      "Implementation Plan",
      "Timeline",
      "Investment Summary",
      "Terms and Conditions",
      "Why Choose Us",
      "Appendices",
    ],
    keyFields: [
      "client_name",
      "project_name",
      "total_investment",
      "duration",
      "deliverables",
      "payment_terms",
      "valid_until",
    ],
  },
  loi: {
    sections: [
      "Parties",
      "Purpose",
      "Transaction Overview",
      "Key Terms",
      "Exclusivity Period",
      "Due Diligence",
      "Confidentiality",
      "Non-Binding Nature",
      "Binding Provisions",
      "Governing Law",
      "Signatures",
    ],
    keyFields: [
      "buyer",
      "seller",
      "transaction_type",
      "transaction_value",
      "exclusivity_period",
      "due_diligence_period",
      "target_closing_date",
    ],
  },
  mou: {
    sections: [
      "Parties",
      "Background and Purpose",
      "Areas of Cooperation",
      "Responsibilities",
      "Financial Arrangements",
      "Intellectual Property",
      "Confidentiality",
      "Term and Termination",
      "Dispute Resolution",
      "General Provisions",
      "Signatures",
    ],
    keyFields: [
      "party_a",
      "party_b",
      "purpose",
      "cooperation_areas",
      "duration",
      "effective_date",
      "responsibilities_a",
      "responsibilities_b",
    ],
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { templateType, country, language, existingFields, templateContent, generateFullDocument } = await req.json();

    // Use Google Gemini API directly
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const countryKey = (country || "default").toLowerCase().replace(/\s+/g, "");
    const legalData = countryLegalData[countryKey] || countryLegalData["default"];

    const languageMap: Record<string, string> = {
      pt: "Portuguese (Brazilian)",
      en: "English",
      es: "Spanish",
      zh: "Chinese (Simplified)",
      it: "Italian",
      de: "German",
    };
    const outputLanguage = languageMap[language] || "English";

    // Get template structure
    const templateInfo = templateStructures[templateType] || templateStructures["contract"];

    // Enhanced prompts with XML structure (Claude responds better to this)
    const systemPrompt = `You are a professional legal document generator for ELP Green Technology, specializing in international business contracts for OTR tire recycling operations.

<task>
Generate COMPLETE, PROFESSIONAL document content and field values based on the template type and country jurisdiction.
</task>

<critical_requirement>
Generate REAL, PROFESSIONAL document content that follows legal standards for ${country}.
</critical_requirement>

<output_language>${outputLanguage}</output_language>
All text must be in ${outputLanguage}.

<document_type>${templateType.toUpperCase()}</document_type>

<required_sections>
${templateInfo.sections.join(", ")}
</required_sections>

<country_legal_framework>
- Data Protection Law: ${legalData.dataProtection}
- Contract Law: ${legalData.contractLaw}
- Jurisdiction: ${legalData.jurisdiction}
- Governing Law: ${legalData.governingLaw}
- Arbitration: ${legalData.arbitration}
- Tax ID Type: ${legalData.taxId}
- Currency: ${legalData.currency}
- Corporate Types: ${legalData.corporateTypes.join(", ")}
</country_legal_framework>

<elp_company_info>
- Company: ELP Alliance S/A
- Registration: CNPJ 12.345.678/0001-90 / P.IVA IT12345678901
- Address: Via della Moscova 13, Milano 20121, Italy
- Email: info@elpgreen.com
- Phone: +39 350 102 1359
- Website: www.elpgreen.com
- Representative: Ericson Piccoli (CEO)
- Business: OTR Tire Recycling Technology & Partnerships
</elp_company_info>

<generation_rules>
1. Generate complete, legally sound document content
2. Use proper legal language and formatting
3. Include all necessary clauses for the document type
4. Reference specific laws and regulations for ${country}
5. Use realistic placeholder values for the receiving party
6. Ensure all dates use proper format for ${country}
7. Include proper signature blocks
8. Add confidentiality notices where appropriate
</generation_rules>`;

    const userPrompt = `Generate a complete ${templateType.toUpperCase()} document for a partner in ${country}.

<template_details>
Template Type: ${templateType}
Target Country: ${country}  
Output Language: ${outputLanguage}
</template_details>

<template_fields>
${JSON.stringify(existingFields, null, 2)}
</template_fields>

${templateContent ? `<existing_template_structure>
${templateContent.substring(0, 800)}
</existing_template_structure>` : ""}

<deliverables>
Generate:
1. Field values for ALL template fields
2. Any additional recommended fields
3. Legal notes specific to this document type in ${country}
4. Jurisdiction and compliance information

For the receiving party, generate realistic business information appropriate for ${country}:
- Company name in local format
- Address in local format  
- Representative with culturally appropriate name
- Registration number in local format
</deliverables>

Make the document COMPLETE and PROFESSIONAL, ready for business use.

<output_format>
Respond with a valid JSON object containing:
- fields (object with field values)
- documentContent (string)
- legalNotes (array of strings)
- jurisdictionInfo (object with governingLaw, jurisdiction, arbitration, dataProtection)
- recommendedClauses (array of strings)
</output_format>`;

    // Call Google Gemini API directly
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 16384,
          },
        }),
      },
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      throw new Error("AI generation failed");
    }

    const data = await response.json();
    
    // Parse Gemini response
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (textContent) {
      try {
        // Claude may return JSON with or without markdown code blocks
        let cleanedText = textContent.trim();
        
        // Remove markdown code blocks if they exist
        if (cleanedText.startsWith('```json')) {
          cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanedText.startsWith('```')) {
          cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        
        const result = JSON.parse(cleanedText);

        // Add country-specific legal data to the response
        result.countryLegalData = legalData;
        result.templateInfo = templateInfo;

        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError);
        console.error("Raw response:", textContent);
      }
    }

    // Fallback if no valid response
    return new Response(
      JSON.stringify({
        fields: {},
        legalNotes: ["AI could not generate fields. Please fill manually."],
        jurisdictionInfo: legalData,
        countryLegalData: legalData,
        templateInfo: templateInfo,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error in generate-document-ai:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
