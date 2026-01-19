import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  MapPin,
  Factory,
  DollarSign,
  TrendingUp,
  FileText,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface FeasibilityTemplate {
  id: string;
  nameKey: string;
  regionKey: string;
  country: string;
  flag: string;
  descriptionKey: string;
  daily_capacity_tons: number;
  equipment_cost: number;
  installation_cost: number;
  infrastructure_cost: number;
  working_capital: number;
  other_capex: number;
  raw_material_cost: number;
  labor_cost: number;
  energy_cost: number;
  maintenance_cost: number;
  logistics_cost: number;
  administrative_cost: number;
  other_opex: number;
  rubber_granules_price: number;
  rubber_granules_yield: number;
  steel_wire_price: number;
  steel_wire_yield: number;
  textile_fiber_price: number;
  textile_fiber_yield: number;
  tax_rate: number;
  highlightKeys: string[];
}

const templates: FeasibilityTemplate[] = [
  {
    id: 'australia',
    nameKey: 'australiaName',
    regionKey: 'oceania',
    country: 'Australia',
    flag: '🇦🇺',
    descriptionKey: 'australiaDesc',
    daily_capacity_tons: 100,
    equipment_cost: 3200000,
    installation_cost: 600000,
    infrastructure_cost: 1500000,
    working_capital: 800000,
    other_capex: 400000,
    raw_material_cost: 0,
    labor_cost: 85000,
    energy_cost: 35000,
    maintenance_cost: 28000,
    logistics_cost: 45000,
    administrative_cost: 22000,
    other_opex: 15000,
    rubber_granules_price: 320,
    rubber_granules_yield: 74.7,
    steel_wire_price: 280,
    steel_wire_yield: 15.7,
    textile_fiber_price: 180,
    textile_fiber_yield: 9.7,
    tax_rate: 30,
    highlightKeys: ['freeRawMaterial', 'highPrices', 'strongMiningDemand']
  },
  {
    id: 'brazil-north',
    nameKey: 'brazilName',
    regionKey: 'southAmerica',
    country: 'Brasil',
    flag: '🇧🇷',
    descriptionKey: 'brazilDesc',
    daily_capacity_tons: 85,
    equipment_cost: 2400000,
    installation_cost: 400000,
    infrastructure_cost: 900000,
    working_capital: 500000,
    other_capex: 300000,
    raw_material_cost: 5000,
    labor_cost: 28000,
    energy_cost: 18000,
    maintenance_cost: 15000,
    logistics_cost: 35000,
    administrative_cost: 12000,
    other_opex: 8000,
    rubber_granules_price: 220,
    rubber_granules_yield: 74.7,
    steel_wire_price: 200,
    steel_wire_yield: 15.7,
    textile_fiber_price: 100,
    textile_fiber_yield: 9.7,
    tax_rate: 34,
    highlightKeys: ['abundantOtrSupply', 'lowLaborCosts', 'growingDemand']
  },
  {
    id: 'europe-italy',
    nameKey: 'italyName',
    regionKey: 'europe',
    country: 'Italy',
    flag: '🇮🇹',
    descriptionKey: 'italyDesc',
    daily_capacity_tons: 60,
    equipment_cost: 2800000,
    installation_cost: 550000,
    infrastructure_cost: 1200000,
    working_capital: 600000,
    other_capex: 350000,
    raw_material_cost: 15000,
    labor_cost: 55000,
    energy_cost: 40000,
    maintenance_cost: 22000,
    logistics_cost: 25000,
    administrative_cost: 18000,
    other_opex: 12000,
    rubber_granules_price: 350,
    rubber_granules_yield: 74.7,
    steel_wire_price: 300,
    steel_wire_yield: 15.7,
    textile_fiber_price: 200,
    textile_fiber_yield: 9.7,
    tax_rate: 24,
    highlightKeys: ['premiumPrices', 'strongEuRegulations', 'gateFeePotential']
  },
  {
    id: 'europe-germany',
    nameKey: 'germanyName',
    regionKey: 'europe',
    country: 'Germany',
    flag: '🇩🇪',
    descriptionKey: 'germanyDesc',
    daily_capacity_tons: 70,
    equipment_cost: 3500000,
    installation_cost: 700000,
    infrastructure_cost: 1800000,
    working_capital: 700000,
    other_capex: 500000,
    raw_material_cost: 10000,
    labor_cost: 75000,
    energy_cost: 45000,
    maintenance_cost: 25000,
    logistics_cost: 20000,
    administrative_cost: 20000,
    other_opex: 15000,
    rubber_granules_price: 380,
    rubber_granules_yield: 74.7,
    steel_wire_price: 320,
    steel_wire_yield: 15.7,
    textile_fiber_price: 220,
    textile_fiber_yield: 9.7,
    tax_rate: 30,
    highlightKeys: ['highestQuality', 'automotiveDemand', 'excellentLogistics']
  },
  {
    id: 'chile-mining',
    nameKey: 'chileName',
    regionKey: 'southAmerica',
    country: 'Chile',
    flag: '🇨🇱',
    descriptionKey: 'chileDesc',
    daily_capacity_tons: 90,
    equipment_cost: 2600000,
    installation_cost: 480000,
    infrastructure_cost: 1000000,
    working_capital: 550000,
    other_capex: 350000,
    raw_material_cost: 0,
    labor_cost: 38000,
    energy_cost: 22000,
    maintenance_cost: 18000,
    logistics_cost: 40000,
    administrative_cost: 14000,
    other_opex: 10000,
    rubber_granules_price: 260,
    rubber_granules_yield: 74.7,
    steel_wire_price: 230,
    steel_wire_yield: 15.7,
    textile_fiber_price: 140,
    textile_fiber_yield: 9.7,
    tax_rate: 27,
    highlightKeys: ['largestCopperMines', 'stableEconomy', 'freeTradeAgreements']
  },
  {
    id: 'south-africa',
    nameKey: 'southAfricaName',
    regionKey: 'africa',
    country: 'South Africa',
    flag: '🇿🇦',
    descriptionKey: 'southAfricaDesc',
    daily_capacity_tons: 75,
    equipment_cost: 2300000,
    installation_cost: 380000,
    infrastructure_cost: 850000,
    working_capital: 450000,
    other_capex: 280000,
    raw_material_cost: 0,
    labor_cost: 22000,
    energy_cost: 15000,
    maintenance_cost: 14000,
    logistics_cost: 30000,
    administrative_cost: 10000,
    other_opex: 8000,
    rubber_granules_price: 200,
    rubber_granules_yield: 74.7,
    steel_wire_price: 180,
    steel_wire_yield: 15.7,
    textile_fiber_price: 90,
    textile_fiber_yield: 9.7,
    tax_rate: 28,
    highlightKeys: ['lowOperatingCosts', 'growingAfricanDemand', 'miningHub']
  },
  {
    id: 'mexico-mining',
    nameKey: 'mexicoName',
    regionKey: 'northAmerica',
    country: 'Mexico',
    flag: '🇲🇽',
    descriptionKey: 'mexicoDesc',
    daily_capacity_tons: 80,
    equipment_cost: 2500000,
    installation_cost: 420000,
    infrastructure_cost: 950000,
    working_capital: 520000,
    other_capex: 320000,
    raw_material_cost: 0,
    labor_cost: 25000,
    energy_cost: 20000,
    maintenance_cost: 16000,
    logistics_cost: 32000,
    administrative_cost: 11000,
    other_opex: 8000,
    rubber_granules_price: 240,
    rubber_granules_yield: 74.7,
    steel_wire_price: 210,
    steel_wire_yield: 15.7,
    textile_fiber_price: 110,
    textile_fiber_yield: 9.7,
    tax_rate: 30,
    highlightKeys: ['govPartnership', 'royaltiesProgram', 'environmentalBonus', 'miningPartnerships']
  }
];

interface FeasibilityTemplatesProps {
  onSelectTemplate: (template: { name: string; country: string; daily_capacity_tons: number; equipment_cost: number; installation_cost: number; infrastructure_cost: number; working_capital: number; other_capex: number; raw_material_cost: number; labor_cost: number; energy_cost: number; maintenance_cost: number; logistics_cost: number; administrative_cost: number; other_opex: number; rubber_granules_price: number; rubber_granules_yield: number; steel_wire_price: number; steel_wire_yield: number; textile_fiber_price: number; textile_fiber_yield: number; tax_rate: number }) => void;
}

export function FeasibilityTemplates({ onSelectTemplate }: FeasibilityTemplatesProps) {
  const { t } = useTranslation();

  const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (Math.abs(value) >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  const calculateQuickROI = (template: FeasibilityTemplate) => {
    const annualTonnage = template.daily_capacity_tons * 300 * 0.85;
    const revenue = 
      annualTonnage * (template.rubber_granules_yield / 100) * template.rubber_granules_price +
      annualTonnage * (template.steel_wire_yield / 100) * template.steel_wire_price +
      annualTonnage * (template.textile_fiber_yield / 100) * template.textile_fiber_price;
    
    const opex = (
      template.raw_material_cost + template.labor_cost + template.energy_cost +
      template.maintenance_cost + template.logistics_cost + template.administrative_cost +
      template.other_opex
    ) * 12;
    
    const investment = 
      template.equipment_cost + template.installation_cost + 
      template.infrastructure_cost + template.working_capital + template.other_capex;
    
    const ebitda = revenue - opex;
    const roi = (ebitda / investment) * 100;
    return roi;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">{t('admin.feasibility.templates.title')}</h3>
        <p className="text-sm text-muted-foreground">{t('admin.feasibility.templates.description')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template, index) => {
          const roi = calculateQuickROI(template);
          const totalInvestment = 
            template.equipment_cost + template.installation_cost + 
            template.infrastructure_cost + template.working_capital + template.other_capex;
          const templateName = t(`admin.feasibility.templates.${template.nameKey}`);

          return (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{template.flag}</span>
                        <Badge variant="outline" className="text-xs">
                          {t(`admin.feasibility.templates.regions.${template.regionKey}`)}
                        </Badge>
                      </div>
                      <CardTitle className="text-base">{templateName}</CardTitle>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground block">ROI</span>
                      <span className={`font-bold ${roi > 30 ? 'text-green-600' : roi > 20 ? 'text-primary' : 'text-amber-600'}`}>
                        {roi.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <CardDescription className="text-xs line-clamp-2">
                    {t(`admin.feasibility.templates.${template.descriptionKey}`)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Factory className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{template.daily_capacity_tons} t/d</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{formatCurrency(totalInvestment)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {template.highlightKeys.slice(0, 2).map((highlightKey, i) => (
                      <Badge key={i} variant="secondary" className="text-xs font-normal">
                        {t(`admin.feasibility.templates.highlights.${highlightKey}`)}
                      </Badge>
                    ))}
                  </div>

                  <Button 
                    className="w-full group-hover:bg-primary"
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectTemplate({
                      name: templateName,
                      country: template.country,
                      daily_capacity_tons: template.daily_capacity_tons,
                      equipment_cost: template.equipment_cost,
                      installation_cost: template.installation_cost,
                      infrastructure_cost: template.infrastructure_cost,
                      working_capital: template.working_capital,
                      other_capex: template.other_capex,
                      raw_material_cost: template.raw_material_cost,
                      labor_cost: template.labor_cost,
                      energy_cost: template.energy_cost,
                      maintenance_cost: template.maintenance_cost,
                      logistics_cost: template.logistics_cost,
                      administrative_cost: template.administrative_cost,
                      other_opex: template.other_opex,
                      rubber_granules_price: template.rubber_granules_price,
                      rubber_granules_yield: template.rubber_granules_yield,
                      steel_wire_price: template.steel_wire_price,
                      steel_wire_yield: template.steel_wire_yield,
                      textile_fiber_price: template.textile_fiber_price,
                      textile_fiber_yield: template.textile_fiber_yield,
                      tax_rate: template.tax_rate
                    })}
                  >
                    {t('admin.feasibility.templates.useTemplate')}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
