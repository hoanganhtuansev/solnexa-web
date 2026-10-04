/**
 * SOLNEXA Relational Database Engine
 * Structured relational model supporting:
 * - Manufacturer
 * - EquipmentCategory
 * - EquipmentModel
 * - Datasheet
 * - SpecificationDefinition
 * - EquipmentSpecification
 * - Unit
 * - SourceReference
 * - ExtractionRun
 */

import fs from 'fs';
import path from 'path';
import {
  EquipmentCategoryCode,
  ReviewStatus,
  ExtractionMethod,
  Manufacturer,
  EquipmentCategory,
  Datasheet,
  EquipmentModel,
  EquipmentSpecification,
  SourceReference,
  ExtractionRun,
  ExtractionDiagnostics,
  Project,
  CableSpecificationItem,
  PriceBookItem
} from '../../src/types';

export interface DBUnit {
  symbol: string;
  name: string;
  category: 'VOLTAGE' | 'CURRENT' | 'POWER' | 'ENERGY' | 'EFFICIENCY' | 'TEMPERATURE' | 'LENGTH' | 'WEIGHT' | 'FREQUENCY' | 'RESISTANCE' | 'PERCENT';
  conversionFactorToBase: number;
  baseUnit: string;
}

export interface DBSpecificationDefinition {
  id: string;
  categoryCode: EquipmentCategoryCode;
  parameterName: string;
  displayName: string;
  standardUnit: string;
  dataType: 'NUMBER' | 'STRING' | 'RANGE';
  isRequired: boolean;
  description: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'solnexa_relational_db.json');

// Ensure data directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

class RelationalDatabase {
  private manufacturers: Map<string, Manufacturer> = new Map();
  private categories: Map<EquipmentCategoryCode, EquipmentCategory> = new Map();
  private models: Map<string, EquipmentModel> = new Map();
  private datasheets: Map<string, Datasheet> = new Map();
  private specifications: Map<string, EquipmentSpecification> = new Map();
  private specDefinitions: Map<string, DBSpecificationDefinition> = new Map();
  private units: Map<string, DBUnit> = new Map();
  private sourceReferences: Map<string, SourceReference> = new Map();
  private extractionRuns: Map<string, ExtractionRun> = new Map();
  private projects: Map<string, Project> = new Map();
  private cables: Map<string, CableSpecificationItem> = new Map();
  private priceBook: Map<string, PriceBookItem> = new Map();

  constructor() {
    this.initDefaultDefinitions();
    this.loadFromDisk();
    if (this.models.size === 0) {
      this.seedInitialLibrary();
    }
    this.seedMissingEngineeringModels();
    this.seedInitialProjects();
    if (this.cables.size === 0) {
      this.seedInitialCables();
    }
    if (this.priceBook.size === 0) {
      this.seedInitialPriceBook();
    }
    this.enforceUserRequestedCleanState();
  }

  private initDefaultDefinitions() {
    // Equipment categories
    const defaultCategories: EquipmentCategory[] = [
      {
        code: 'PV_MODULE',
        name: 'PV Module',
        description: 'Solar photovoltaic modules (monocrystalline, TOPCon, HJT, bifacial)',
        iconName: 'Sun',
        standardParameters: ['rated_power_pmax', 'open_circuit_voltage_voc', 'short_circuit_current_isc', 'max_power_voltage_vmp', 'max_power_current_imp', 'module_efficiency', 'temp_coefficient_voc', 'max_system_voltage', 'dimensions', 'weight']
      },
      {
        code: 'PCS_INVERTER',
        name: 'PCS / String Inverter',
        description: 'Power Conversion Systems and central / string solar inverters',
        iconName: 'Zap',
        standardParameters: ['rated_ac_power', 'max_dc_voltage', 'mppt_voltage_range_min', 'mppt_voltage_range_max', 'max_input_current_per_mppt', 'mppt_tracker_count', 'max_efficiency', 'euro_efficiency', 'nominal_ac_voltage', 'rated_frequency', 'thdi', 'power_factor_range', 'ip_rating']
      },
      {
        code: 'BESS',
        name: 'BESS (Battery Energy Storage System)',
        description: 'Utility & commercial containerized energy storage systems',
        iconName: 'Layers',
        standardParameters: ['nominal_energy_capacity', 'rated_discharge_power', 'cell_chemistry', 'c_rate', 'dc_voltage_range_min', 'dc_voltage_range_max', 'round_trip_efficiency', 'cycle_life', 'operating_temperature_range', 'cooling_system', 'dimensions', 'weight']
      },
      {
        code: 'BATTERY',
        name: 'Battery Rack / Module',
        description: 'Battery modules, cell packs and DC battery racks',
        iconName: 'BatteryCharging',
        standardParameters: ['nominal_capacity_kwh', 'nominal_voltage', 'cell_type', 'max_charge_current', 'max_discharge_current', 'cycle_life', 'operating_temp']
      },
      {
        code: 'TRANSFORMER',
        name: 'Step-up Transformer',
        description: 'Medium and high voltage oil-immersed / dry-type step-up transformers',
        iconName: 'GitCommit',
        standardParameters: ['rated_power_kva', 'primary_voltage_kv', 'secondary_voltage_kv', 'impedance_uk_percent', 'vector_group', 'no_load_losses_kw', 'load_losses_kw', 'cooling_type', 'frequency']
      },
      {
        code: 'QB_CUBICLE',
        name: 'QB Cubicle / Switchgear',
        description: 'Medium Voltage GIS / AIS cubicles and ring main units',
        iconName: 'Box',
        standardParameters: ['rated_voltage_kv', 'rated_current_a', 'rated_short_time_withstand_current_ka', 'duration_short_circuit_s', 'insulation_medium', 'protection_degree']
      },
      {
        code: 'MCCB',
        name: 'Molded Case Circuit Breaker (MCCB)',
        description: 'Low-voltage MCCB protection devices for AC and DC distribution',
        iconName: 'ShieldAlert',
        standardParameters: ['rated_current_in', 'rated_voltage_ue', 'breaking_capacity_icu', 'breaking_capacity_ics', 'poles_count', 'trip_unit_type']
      },
      {
        code: 'ACB',
        name: 'Air Circuit Breaker (ACB)',
        description: 'High current main incoming low-voltage circuit breakers',
        iconName: 'ShieldCheck',
        standardParameters: ['rated_current_in', 'breaking_capacity_icu_ka', 'rated_voltage_v', 'rated_short_time_current_icw', 'poles_count']
      },
      {
        code: 'VCB',
        name: 'Vacuum Circuit Breaker (VCB)',
        description: 'Medium voltage vacuum circuit breakers for substation protection',
        iconName: 'Radio',
        standardParameters: ['rated_voltage_kv', 'rated_normal_current_a', 'rated_short_circuit_breaking_current_ka', 'operating_sequence']
      },
      {
        code: 'FUSE',
        name: 'PV / DC Fuse',
        description: 'High speed gPV cylindrical / NH fuses for string and array protection',
        iconName: 'MinusCircle',
        standardParameters: ['rated_current_a', 'rated_voltage_v', 'breaking_capacity_ka', 'fuse_class', 'size_dimension']
      },
      {
        code: 'CABLE',
        name: 'Solar DC / AC Power Cable',
        description: 'Photovoltaic cables (EN 50618) and XLPE insulated AC cables',
        iconName: 'GitBranch',
        standardParameters: ['conductor_cross_section_mm2', 'rated_voltage_u0_u', 'conductor_material', 'insulation_material', 'max_current_air_a', 'max_current_ground_a', 'conductor_resistance_20c_ohm_km', 'operating_temperature_max']
      },
      {
        code: 'COMBINER_BOX',
        name: 'DC Combiner Box',
        description: 'String monitoring combiner box with SPD and disconnect switches',
        iconName: 'Cpu',
        standardParameters: ['max_input_circuits', 'rated_dc_voltage', 'fuse_rating_a', 'spd_type', 'communication_interface', 'ip_rating']
      },
      {
        code: 'DISTRIBUTION_BOARD',
        name: 'AC Distribution Board (ACDB)',
        description: 'LV/MV main distribution switchboards and panels',
        iconName: 'Grid',
        standardParameters: ['rated_operational_voltage', 'rated_current_busbar', 'rated_short_time_current', 'ingress_protection', 'enclosure_type']
      },
      {
        code: 'OTHER',
        name: 'Other Equipment',
        description: 'Auxiliary sensors, pyranometers, weather stations, and balance of plant',
        iconName: 'MoreHorizontal',
        standardParameters: ['description', 'manufacturer_code', 'specifications']
      }
    ];

    defaultCategories.forEach(cat => this.categories.set(cat.code, cat));

    // Units
    const standardUnits: DBUnit[] = [
      { symbol: 'V', name: 'Volt', category: 'VOLTAGE', conversionFactorToBase: 1, baseUnit: 'V' },
      { symbol: 'kV', name: 'Kilovolt', category: 'VOLTAGE', conversionFactorToBase: 1000, baseUnit: 'V' },
      { symbol: 'mV', name: 'Millivolt', category: 'VOLTAGE', conversionFactorToBase: 0.001, baseUnit: 'V' },
      { symbol: 'A', name: 'Ampere', category: 'CURRENT', conversionFactorToBase: 1, baseUnit: 'A' },
      { symbol: 'kA', name: 'Kiloampere', category: 'CURRENT', conversionFactorToBase: 1000, baseUnit: 'A' },
      { symbol: 'mA', name: 'Milliampere', category: 'CURRENT', conversionFactorToBase: 0.001, baseUnit: 'A' },
      { symbol: 'W', name: 'Watt', category: 'POWER', conversionFactorToBase: 0.001, baseUnit: 'kW' },
      { symbol: 'kW', name: 'Kilowatt', category: 'POWER', conversionFactorToBase: 1, baseUnit: 'kW' },
      { symbol: 'MW', name: 'Megawatt', category: 'POWER', conversionFactorToBase: 1000, baseUnit: 'kW' },
      { symbol: 'kVA', name: 'Kilovolt-Ampere', category: 'POWER', conversionFactorToBase: 1, baseUnit: 'kVA' },
      { symbol: 'MVA', name: 'Megavolt-Ampere', category: 'POWER', conversionFactorToBase: 1000, baseUnit: 'kVA' },
      { symbol: 'kWh', name: 'Kilowatt-hour', category: 'ENERGY', conversionFactorToBase: 1, baseUnit: 'kWh' },
      { symbol: 'MWh', name: 'Megawatt-hour', category: 'ENERGY', conversionFactorToBase: 1000, baseUnit: 'kWh' },
      { symbol: '%', name: 'Percent', category: 'PERCENT', conversionFactorToBase: 1, baseUnit: '%' },
      { symbol: 'Hz', name: 'Hertz', category: 'FREQUENCY', conversionFactorToBase: 1, baseUnit: 'Hz' },
      { symbol: 'mm²', name: 'Square Millimeter', category: 'LENGTH', conversionFactorToBase: 1, baseUnit: 'mm²' },
      { symbol: 'Ω/km', name: 'Ohm per Kilometer', category: 'RESISTANCE', conversionFactorToBase: 1, baseUnit: 'Ω/km' },
      { symbol: 'kg', name: 'Kilogram', category: 'WEIGHT', conversionFactorToBase: 1, baseUnit: 'kg' },
      { symbol: '°C', name: 'Degree Celsius', category: 'TEMPERATURE', conversionFactorToBase: 1, baseUnit: '°C' }
    ];

    standardUnits.forEach(u => this.units.set(u.symbol, u));
  }

  private seedInitialLibrary() {
    // Real industry manufacturer records
    const mfgList: Array<Partial<Manufacturer>> = [
      { id: 'mfg-huawei', name: 'Huawei', country: 'China', website: 'https://solar.huawei.com', notes: 'FusionSolar Smart PV & BESS' },
      { id: 'mfg-sungrow', name: 'Sungrow', country: 'China', website: 'https://www.sungrowpower.com', notes: 'String & Central Inverters, BESS Solutions' },
      { id: 'mfg-tmeic', name: 'TMEIC', country: 'Japan', website: 'https://www.tmeic.com', notes: 'Toshiba Mitsubishi-Electric Industrial Systems' },
      { id: 'mfg-catl', name: 'CATL', country: 'China', website: 'https://www.catl.com', notes: 'Contemporary Amperex Technology - Lithium BESS' },
      { id: 'mfg-byd', name: 'BYD Energy', country: 'China', website: 'https://bydenergy.com', notes: 'Battery energy storage & Blade Battery systems' },
      { id: 'mfg-trina', name: 'Trina Solar', country: 'China', website: 'https://www.trinasolar.com', notes: 'Vertex & Vertex S+ Dual-Glass PV Modules' },
      { id: 'mfg-jinko', name: 'Jinko Solar', country: 'China', website: 'https://www.jinkosolar.com', notes: 'Tiger Neo N-type TOPCon modules' },
      { id: 'mfg-longi', name: 'LONGi Solar', country: 'China', website: 'https://www.longi.com', notes: 'Hi-MO series HPBC / TOPCon modules' },
      { id: 'mfg-schneider', name: 'Schneider Electric', country: 'France', website: 'https://www.se.com', notes: 'MasterPact ACB, Compact NSX MCCB, MV cubicles' },
      { id: 'mfg-mitsubishi', name: 'Mitsubishi Electric', country: 'Japan', website: 'https://www.mitsubishielectric.com', notes: 'Transformers, VCB, Breakers' },
      { id: 'mfg-fuji', name: 'Fuji Electric', country: 'Japan', website: 'https://www.fujielectric.com', notes: 'Inverters, Power Semiconductors, Switchgear' },
      { id: 'mfg-ls', name: 'LS Electric', country: 'South Korea', website: 'https://www.ls-electric.com', notes: 'Susol ACB/MCCB, MV Switchgear, Transformers' }
    ];

    mfgList.forEach(m => {
      this.manufacturers.set(m.id!, {
        id: m.id!,
        name: m.name!,
        country: m.country,
        website: m.website,
        notes: m.notes,
        createdAt: new Date().toISOString()
      });
    });

    // Seed Approved Equipment Models with realistic engineering datasheets and specifications
    // 1. Huawei SUN2000-50KTL-NHM3
    const huaweiId = 'eq-huawei-sun2000-50ktl';
    this.models.set(huaweiId, {
      id: huaweiId,
      manufacturerId: 'mfg-huawei',
      manufacturerName: 'Huawei',
      categoryCode: 'PCS_INVERTER',
      modelName: 'SUN2000-50KTL-NHM3',
      series: 'SUN2000 Series',
      description: 'Smart String Inverter for Commercial & Industrial Solar PV',
      isApproved: true,
      revision: 1,
      createdAt: '2026-03-10T08:00:00.000Z',
      updatedAt: '2026-03-10T08:00:00.000Z'
    });

    const huaweiSpecs: Array<Omit<EquipmentSpecification, 'id' | 'modelId' | 'createdAt' | 'updatedAt'>> = [
      { parameterName: 'max_efficiency', displayName: 'Max Efficiency', rawValue: '98.5%', rawUnit: '%', normalizedValue: 98.5, normalizedUnit: '%', sourceDocument: 'Huawei_SUN2000-50KTL-NHM3_Datasheet.pdf', sourcePage: 2, confidence: 0.99, extractionMethod: 'NATIVE_TABLE', reviewStatus: 'APPROVED' },
      { parameterName: 'european_efficiency', displayName: 'European Efficiency', rawValue: '98.0%', rawUnit: '%', normalizedValue: 98.0, normalizedUnit: '%', sourceDocument: 'Huawei_SUN2000-50KTL-NHM3_Datasheet.pdf', sourcePage: 2, confidence: 0.98, extractionMethod: 'NATIVE_TABLE', reviewStatus: 'APPROVED' },
      { parameterName: 'max_dc_voltage', displayName: 'Max DC Input Voltage', rawValue: '1100', rawUnit: 'V', normalizedValue: 1100, normalizedUnit: 'V', sourceDocument: 'Huawei_SUN2000-50KTL-NHM3_Datasheet.pdf', sourcePage: 2, confidence: 0.99, extractionMethod: 'NATIVE_REGEX', reviewStatus: 'APPROVED' },
      { parameterName: 'mppt_voltage_range_min', displayName: 'MPPT Operating Voltage (Min)', rawValue: '200', rawUnit: 'V', normalizedValue: 200, normalizedUnit: 'V', sourceDocument: 'Huawei_SUN2000-50KTL-NHM3_Datasheet.pdf', sourcePage: 2, confidence: 0.97, extractionMethod: 'NATIVE_REGEX', reviewStatus: 'APPROVED' },
      { parameterName: 'mppt_voltage_range_max', displayName: 'MPPT Operating Voltage (Max)', rawValue: '1000', rawUnit: 'V', normalizedValue: 1000, normalizedUnit: 'V', sourceDocument: 'Huawei_SUN2000-50KTL-NHM3_Datasheet.pdf', sourcePage: 2, confidence: 0.97, extractionMethod: 'NATIVE_REGEX', reviewStatus: 'APPROVED' },
      { parameterName: 'start_up_voltage', displayName: 'Start-up Voltage', rawValue: '200', rawUnit: 'V', normalizedValue: 200, normalizedUnit: 'V', sourceDocument: 'Huawei_SUN2000-50KTL-NHM3_Datasheet.pdf', sourcePage: 2, confidence: 0.95, extractionMethod: 'NATIVE_REGEX', reviewStatus: 'APPROVED' },
      { parameterName: 'mppt_tracker_count', displayName: 'Number of MPPT Trackers', rawValue: '4', rawUnit: '', normalizedValue: 4, normalizedUnit: 'units', sourceDocument: 'Huawei_SUN2000-50KTL-NHM3_Datasheet.pdf', sourcePage: 2, confidence: 0.99, extractionMethod: 'NATIVE_TABLE', reviewStatus: 'APPROVED' },
      { parameterName: 'max_inputs_per_mppt', displayName: 'Max Inputs per MPPT', rawValue: '2', rawUnit: '', normalizedValue: 2, normalizedUnit: 'inputs', sourceDocument: 'Huawei_SUN2000-50KTL-NHM3_Datasheet.pdf', sourcePage: 2, confidence: 0.96, extractionMethod: 'NATIVE_TABLE', reviewStatus: 'APPROVED' },
      { parameterName: 'max_input_current_per_mppt', displayName: 'Max Input Current per MPPT', rawValue: '30', rawUnit: 'A', normalizedValue: 30, normalizedUnit: 'A', sourceDocument: 'Huawei_SUN2000-50KTL-NHM3_Datasheet.pdf', sourcePage: 2, confidence: 0.98, extractionMethod: 'NATIVE_TABLE', reviewStatus: 'APPROVED' },
      { parameterName: 'max_short_circuit_current_per_mppt', displayName: 'Max Short Circuit Current per MPPT', rawValue: '40', rawUnit: 'A', normalizedValue: 40, normalizedUnit: 'A', sourceDocument: 'Huawei_SUN2000-50KTL-NHM3_Datasheet.pdf', sourcePage: 2, confidence: 0.98, extractionMethod: 'NATIVE_TABLE', reviewStatus: 'APPROVED' },
      { parameterName: 'rated_ac_power', displayName: 'Rated AC Active Power', rawValue: '50', rawUnit: 'kW', normalizedValue: 50, normalizedUnit: 'kW', sourceDocument: 'Huawei_SUN2000-50KTL-NHM3_Datasheet.pdf', sourcePage: 2, confidence: 0.99, extractionMethod: 'NATIVE_REGEX', reviewStatus: 'APPROVED' },
      { parameterName: 'max_ac_apparent_power', displayName: 'Max AC Apparent Power', rawValue: '55', rawUnit: 'kVA', normalizedValue: 55, normalizedUnit: 'kVA', sourceDocument: 'Huawei_SUN2000-50KTL-NHM3_Datasheet.pdf', sourcePage: 2, confidence: 0.99, extractionMethod: 'NATIVE_REGEX', reviewStatus: 'APPROVED' },
      { parameterName: 'nominal_ac_voltage', displayName: 'Nominal AC Grid Voltage', rawValue: '400', rawUnit: 'V', normalizedValue: 400, normalizedUnit: 'V', sourceDocument: 'Huawei_SUN2000-50KTL-NHM3_Datasheet.pdf', sourcePage: 2, confidence: 0.99, extractionMethod: 'NATIVE_REGEX', reviewStatus: 'APPROVED' },
      { parameterName: 'rated_ac_current', displayName: 'Rated AC Output Current', rawValue: '72.2', rawUnit: 'A', normalizedValue: 72.2, normalizedUnit: 'A', sourceDocument: 'Huawei_SUN2000-50KTL-NHM3_Datasheet.pdf', sourcePage: 2, confidence: 0.97, extractionMethod: 'NATIVE_TABLE', reviewStatus: 'APPROVED' },
      { parameterName: 'rated_frequency', displayName: 'Rated Grid Frequency', rawValue: '50 / 60', rawUnit: 'Hz', normalizedValue: 50, normalizedUnit: 'Hz', sourceDocument: 'Huawei_SUN2000-50KTL-NHM3_Datasheet.pdf', sourcePage: 2, confidence: 0.98, extractionMethod: 'NATIVE_REGEX', reviewStatus: 'APPROVED' },
      { parameterName: 'power_factor_range', displayName: 'Adjustable Power Factor Range', rawValue: '0.8 leading ... 0.8 lagging', rawUnit: '', normalizedValue: '0.8 lead - 0.8 lag', normalizedUnit: '', sourceDocument: 'Huawei_SUN2000-50KTL-NHM3_Datasheet.pdf', sourcePage: 2, confidence: 0.95, extractionMethod: 'NATIVE_TABLE', reviewStatus: 'APPROVED' },
      { parameterName: 'thdi', displayName: 'Total Harmonic Distortion (THDi)', rawValue: '< 3%', rawUnit: '%', normalizedValue: 3.0, normalizedUnit: '%', sourceDocument: 'Huawei_SUN2000-50KTL-NHM3_Datasheet.pdf', sourcePage: 2, confidence: 0.94, extractionMethod: 'NATIVE_REGEX', reviewStatus: 'APPROVED' },
      { parameterName: 'ip_rating', displayName: 'Protection Degree', rawValue: 'IP66', rawUnit: '', normalizedValue: 'IP66', normalizedUnit: '', sourceDocument: 'Huawei_SUN2000-50KTL-NHM3_Datasheet.pdf', sourcePage: 3, confidence: 0.99, extractionMethod: 'NATIVE_REGEX', reviewStatus: 'APPROVED' },
      { parameterName: 'weight', displayName: 'Net Weight', rawValue: '49', rawUnit: 'kg', normalizedValue: 49, normalizedUnit: 'kg', sourceDocument: 'Huawei_SUN2000-50KTL-NHM3_Datasheet.pdf', sourcePage: 3, confidence: 0.98, extractionMethod: 'NATIVE_REGEX', reviewStatus: 'APPROVED' }
    ];

    huaweiSpecs.forEach((s, idx) => {
      const specId = `spec-${huaweiId}-${idx + 1}`;
      this.specifications.set(specId, {
        id: specId,
        modelId: huaweiId,
        ...s,
        createdAt: '2026-03-10T08:00:00.000Z',
        updatedAt: '2026-03-10T08:00:00.000Z'
      });
    });

    // 2. Trina Solar TSM-NEG9R.28 (Vertex S+ 440W Dual Glass)
    const trinaId = 'eq-trina-tsm-neg9r28';
    this.models.set(trinaId, {
      id: trinaId,
      manufacturerId: 'mfg-trina',
      manufacturerName: 'Trina Solar',
      categoryCode: 'PV_MODULE',
      modelName: 'TSM-440NEG9R.28',
      series: 'Vertex S+ Series',
      description: 'N-type TOPCon Dual-Glass High Efficiency PV Module',
      isApproved: true,
      revision: 1,
      createdAt: '2026-03-11T09:00:00.000Z',
      updatedAt: '2026-03-11T09:00:00.000Z'
    });

    const trinaSpecs: Array<Omit<EquipmentSpecification, 'id' | 'modelId' | 'createdAt' | 'updatedAt'>> = [
      { parameterName: 'rated_power_pmax', displayName: 'Peak Power Pmax (STC)', rawValue: '440', rawUnit: 'W', normalizedValue: 440, normalizedUnit: 'W', sourceDocument: 'Trina_Vertex_S_Plus_NEG9R28_Datasheet.pdf', sourcePage: 1, confidence: 0.99, extractionMethod: 'NATIVE_TABLE', reviewStatus: 'APPROVED' },
      { parameterName: 'open_circuit_voltage_voc', displayName: 'Open Circuit Voltage Voc (STC)', rawValue: '52.2', rawUnit: 'V', normalizedValue: 52.2, normalizedUnit: 'V', sourceDocument: 'Trina_Vertex_S_Plus_NEG9R28_Datasheet.pdf', sourcePage: 1, confidence: 0.99, extractionMethod: 'NATIVE_TABLE', reviewStatus: 'APPROVED' },
      { parameterName: 'short_circuit_current_isc', displayName: 'Short Circuit Current Isc (STC)', rawValue: '10.67', rawUnit: 'A', normalizedValue: 10.67, normalizedUnit: 'A', sourceDocument: 'Trina_Vertex_S_Plus_NEG9R28_Datasheet.pdf', sourcePage: 1, confidence: 0.99, extractionMethod: 'NATIVE_TABLE', reviewStatus: 'APPROVED' },
      { parameterName: 'max_power_voltage_vmp', displayName: 'Max Power Voltage Vmp (STC)', rawValue: '43.6', rawUnit: 'V', normalizedValue: 43.6, normalizedUnit: 'V', sourceDocument: 'Trina_Vertex_S_Plus_NEG9R28_Datasheet.pdf', sourcePage: 1, confidence: 0.98, extractionMethod: 'NATIVE_TABLE', reviewStatus: 'APPROVED' },
      { parameterName: 'max_power_current_imp', displayName: 'Max Power Current Imp (STC)', rawValue: '10.10', rawUnit: 'A', normalizedValue: 10.10, normalizedUnit: 'A', sourceDocument: 'Trina_Vertex_S_Plus_NEG9R28_Datasheet.pdf', sourcePage: 1, confidence: 0.98, extractionMethod: 'NATIVE_TABLE', reviewStatus: 'APPROVED' },
      { parameterName: 'module_efficiency', displayName: 'Module Efficiency', rawValue: '22.0%', rawUnit: '%', normalizedValue: 22.0, normalizedUnit: '%', sourceDocument: 'Trina_Vertex_S_Plus_NEG9R28_Datasheet.pdf', sourcePage: 1, confidence: 0.99, extractionMethod: 'NATIVE_TABLE', reviewStatus: 'APPROVED' },
      { parameterName: 'temp_coefficient_pmax', displayName: 'Temperature Coefficient of Pmax', rawValue: '-0.30%/°C', rawUnit: '%/°C', normalizedValue: -0.30, normalizedUnit: '%/°C', sourceDocument: 'Trina_Vertex_S_Plus_NEG9R28_Datasheet.pdf', sourcePage: 2, confidence: 0.97, extractionMethod: 'NATIVE_REGEX', reviewStatus: 'APPROVED' },
      { parameterName: 'temp_coefficient_voc', displayName: 'Temperature Coefficient of Voc', rawValue: '-0.24%/°C', rawUnit: '%/°C', normalizedValue: -0.24, normalizedUnit: '%/°C', sourceDocument: 'Trina_Vertex_S_Plus_NEG9R28_Datasheet.pdf', sourcePage: 2, confidence: 0.97, extractionMethod: 'NATIVE_REGEX', reviewStatus: 'APPROVED' },
      { parameterName: 'temp_coefficient_isc', displayName: 'Temperature Coefficient of Isc', rawValue: '+0.04%/°C', rawUnit: '%/°C', normalizedValue: 0.04, normalizedUnit: '%/°C', sourceDocument: 'Trina_Vertex_S_Plus_NEG9R28_Datasheet.pdf', sourcePage: 2, confidence: 0.96, extractionMethod: 'NATIVE_REGEX', reviewStatus: 'APPROVED' },
      { parameterName: 'max_system_voltage', displayName: 'Maximum System Voltage', rawValue: '1500', rawUnit: 'V', normalizedValue: 1500, normalizedUnit: 'V', sourceDocument: 'Trina_Vertex_S_Plus_NEG9R28_Datasheet.pdf', sourcePage: 2, confidence: 0.99, extractionMethod: 'NATIVE_REGEX', reviewStatus: 'APPROVED' },
      { parameterName: 'max_series_fuse_rating', displayName: 'Max Series Fuse Rating', rawValue: '25', rawUnit: 'A', normalizedValue: 25, normalizedUnit: 'A', sourceDocument: 'Trina_Vertex_S_Plus_NEG9R28_Datasheet.pdf', sourcePage: 2, confidence: 0.98, extractionMethod: 'NATIVE_REGEX', reviewStatus: 'APPROVED' },
      { parameterName: 'weight', displayName: 'Module Weight', rawValue: '21.0', rawUnit: 'kg', normalizedValue: 21.0, normalizedUnit: 'kg', sourceDocument: 'Trina_Vertex_S_Plus_NEG9R28_Datasheet.pdf', sourcePage: 2, confidence: 0.98, extractionMethod: 'NATIVE_REGEX', reviewStatus: 'APPROVED' }
    ];

    trinaSpecs.forEach((s, idx) => {
      const specId = `spec-${trinaId}-${idx + 1}`;
      this.specifications.set(specId, {
        id: specId,
        modelId: trinaId,
        ...s,
        createdAt: '2026-03-11T09:00:00.000Z',
        updatedAt: '2026-03-11T09:00:00.000Z'
      });
    });

    // 3. CATL EnerOne BESS
    const catlId = 'eq-catl-enerone-3727';
    this.models.set(catlId, {
      id: catlId,
      manufacturerId: 'mfg-catl',
      manufacturerName: 'CATL',
      categoryCode: 'BESS',
      modelName: 'EnerOne 372.7kWh',
      series: 'EnerOne Outdoor BESS',
      description: 'Liquid Cooling BESS Outdoor Cabinet with LFP chemistry',
      isApproved: true,
      revision: 1,
      createdAt: '2026-03-12T10:00:00.000Z',
      updatedAt: '2026-03-12T10:00:00.000Z'
    });

    const catlSpecs: Array<Omit<EquipmentSpecification, 'id' | 'modelId' | 'createdAt' | 'updatedAt'>> = [
      { parameterName: 'nominal_energy_capacity', displayName: 'Nominal Energy Capacity', rawValue: '372.7', rawUnit: 'kWh', normalizedValue: 372.7, normalizedUnit: 'kWh', sourceDocument: 'CATL_EnerOne_Datasheet.pdf', sourcePage: 1, confidence: 0.99, extractionMethod: 'NATIVE_TABLE', reviewStatus: 'APPROVED' },
      { parameterName: 'cell_chemistry', displayName: 'Cell Chemistry', rawValue: 'LFP (LiFePO4)', rawUnit: '', normalizedValue: 'LFP', normalizedUnit: '', sourceDocument: 'CATL_EnerOne_Datasheet.pdf', sourcePage: 1, confidence: 0.98, extractionMethod: 'NATIVE_REGEX', reviewStatus: 'APPROVED' },
      { parameterName: 'dc_voltage_range_min', displayName: 'DC Voltage Operating Range (Min)', rawValue: '850', rawUnit: 'V', normalizedValue: 850, normalizedUnit: 'V', sourceDocument: 'CATL_EnerOne_Datasheet.pdf', sourcePage: 2, confidence: 0.97, extractionMethod: 'NATIVE_REGEX', reviewStatus: 'APPROVED' },
      { parameterName: 'dc_voltage_range_max', displayName: 'DC Voltage Operating Range (Max)', rawValue: '1500', rawUnit: 'V', normalizedValue: 1500, normalizedUnit: 'V', sourceDocument: 'CATL_EnerOne_Datasheet.pdf', sourcePage: 2, confidence: 0.97, extractionMethod: 'NATIVE_REGEX', reviewStatus: 'APPROVED' },
      { parameterName: 'rated_discharge_rate', displayName: 'Continuous C-rate', rawValue: '0.5C', rawUnit: 'C', normalizedValue: 0.5, normalizedUnit: 'C', sourceDocument: 'CATL_EnerOne_Datasheet.pdf', sourcePage: 2, confidence: 0.96, extractionMethod: 'NATIVE_TABLE', reviewStatus: 'APPROVED' },
      { parameterName: 'cycle_life', displayName: 'Cycle Life (80% EOL)', rawValue: '10,000', rawUnit: 'cycles', normalizedValue: 10000, normalizedUnit: 'cycles', sourceDocument: 'CATL_EnerOne_Datasheet.pdf', sourcePage: 2, confidence: 0.95, extractionMethod: 'NATIVE_REGEX', reviewStatus: 'APPROVED' },
      { parameterName: 'cooling_system', displayName: 'Thermal Management', rawValue: 'Liquid Cooling', rawUnit: '', normalizedValue: 'Liquid Cooling', normalizedUnit: '', sourceDocument: 'CATL_EnerOne_Datasheet.pdf', sourcePage: 2, confidence: 0.99, extractionMethod: 'NATIVE_REGEX', reviewStatus: 'APPROVED' },
      { parameterName: 'ip_rating', displayName: 'Enclosure Protection', rawValue: 'IP66 & C5', rawUnit: '', normalizedValue: 'IP66', normalizedUnit: '', sourceDocument: 'CATL_EnerOne_Datasheet.pdf', sourcePage: 2, confidence: 0.98, extractionMethod: 'NATIVE_REGEX', reviewStatus: 'APPROVED' }
    ];

    catlSpecs.forEach((s, idx) => {
      const specId = `spec-${catlId}-${idx + 1}`;
      this.specifications.set(specId, {
        id: specId,
        modelId: catlId,
        ...s,
        createdAt: '2026-03-12T10:00:00.000Z',
        updatedAt: '2026-03-12T10:00:00.000Z'
      });
    });

    // 4. Sungrow SG49.5CX-JP Inverter
    const sungrowId = 'eq-sungrow-sg495cx-jp';
    this.models.set(sungrowId, {
      id: sungrowId,
      manufacturerId: 'mfg-sungrow',
      manufacturerName: 'Sungrow',
      categoryCode: 'PCS_INVERTER',
      modelName: 'SG49.5CX-JP',
      series: 'Multi-MPPT String Inverter Series',
      description: 'High performance string inverter tailored for Japan & Asia C&I projects',
      isApproved: true,
      revision: 1,
      createdAt: '2026-03-13T11:00:00.000Z',
      updatedAt: '2026-03-13T11:00:00.000Z'
    });

    const sungrowSpecs: Array<Omit<EquipmentSpecification, 'id' | 'modelId' | 'createdAt' | 'updatedAt'>> = [
      { parameterName: 'rated_ac_power', displayName: 'Rated AC Output Power', rawValue: '49.5', rawUnit: 'kW', normalizedValue: 49.5, normalizedUnit: 'kW', sourceDocument: 'Sungrow_SG49.5CX-JP_Datasheet.pdf', sourcePage: 1, confidence: 0.99, extractionMethod: 'NATIVE_TABLE', reviewStatus: 'APPROVED' },
      { parameterName: 'max_dc_voltage', displayName: 'Max DC Input Voltage', rawValue: '1100', rawUnit: 'V', normalizedValue: 1100, normalizedUnit: 'V', sourceDocument: 'Sungrow_SG49.5CX-JP_Datasheet.pdf', sourcePage: 2, confidence: 0.99, extractionMethod: 'NATIVE_TABLE', reviewStatus: 'APPROVED' },
      { parameterName: 'mppt_voltage_range_min', displayName: 'MPPT Voltage Range (Min)', rawValue: '200', rawUnit: 'V', normalizedValue: 200, normalizedUnit: 'V', sourceDocument: 'Sungrow_SG49.5CX-JP_Datasheet.pdf', sourcePage: 2, confidence: 0.98, extractionMethod: 'NATIVE_REGEX', reviewStatus: 'APPROVED' },
      { parameterName: 'mppt_voltage_range_max', displayName: 'MPPT Voltage Range (Max)', rawValue: '1000', rawUnit: 'V', normalizedValue: 1000, normalizedUnit: 'V', sourceDocument: 'Sungrow_SG49.5CX-JP_Datasheet.pdf', sourcePage: 2, confidence: 0.98, extractionMethod: 'NATIVE_REGEX', reviewStatus: 'APPROVED' },
      { parameterName: 'mppt_tracker_count', displayName: 'MPPT Count', rawValue: '4', rawUnit: '', normalizedValue: 4, normalizedUnit: 'trackers', sourceDocument: 'Sungrow_SG49.5CX-JP_Datasheet.pdf', sourcePage: 2, confidence: 0.99, extractionMethod: 'NATIVE_TABLE', reviewStatus: 'APPROVED' },
      { parameterName: 'max_input_current_per_mppt', displayName: 'Max Input Current per MPPT', rawValue: '30', rawUnit: 'A', normalizedValue: 30, normalizedUnit: 'A', sourceDocument: 'Sungrow_SG49.5CX-JP_Datasheet.pdf', sourcePage: 2, confidence: 0.97, extractionMethod: 'NATIVE_TABLE', reviewStatus: 'APPROVED' },
      { parameterName: 'nominal_ac_voltage', displayName: 'Nominal Grid Voltage', rawValue: '400', rawUnit: 'V', normalizedValue: 400, normalizedUnit: 'V', sourceDocument: 'Sungrow_SG49.5CX-JP_Datasheet.pdf', sourcePage: 2, confidence: 0.99, extractionMethod: 'NATIVE_REGEX', reviewStatus: 'APPROVED' },
      { parameterName: 'max_efficiency', displayName: 'Max Efficiency', rawValue: '98.6%', rawUnit: '%', normalizedValue: 98.6, normalizedUnit: '%', sourceDocument: 'Sungrow_SG49.5CX-JP_Datasheet.pdf', sourcePage: 2, confidence: 0.98, extractionMethod: 'NATIVE_TABLE', reviewStatus: 'APPROVED' }
    ];

    sungrowSpecs.forEach((s, idx) => {
      const specId = `spec-${sungrowId}-${idx + 1}`;
      this.specifications.set(specId, {
        id: specId,
        modelId: sungrowId,
        ...s,
        createdAt: '2026-03-13T11:00:00.000Z',
        updatedAt: '2026-03-13T11:00:00.000Z'
      });
    });

    // 5. Schneider Electric MasterPact MTZ2 16 H1 ACB
    const schneiderId = 'eq-schneider-masterpact-mtz2';
    this.models.set(schneiderId, {
      id: schneiderId,
      manufacturerId: 'mfg-schneider',
      manufacturerName: 'Schneider Electric',
      categoryCode: 'ACB',
      modelName: 'MasterPact MTZ2 16 H1',
      series: 'MasterPact MTZ Series',
      description: 'High Performance Air Circuit Breaker with Micrologic X control unit',
      isApproved: true,
      revision: 1,
      createdAt: '2026-03-14T14:00:00.000Z',
      updatedAt: '2026-03-14T14:00:00.000Z'
    });

    const schneiderSpecs: Array<Omit<EquipmentSpecification, 'id' | 'modelId' | 'createdAt' | 'updatedAt'>> = [
      { parameterName: 'rated_current_in', displayName: 'Rated Current (In)', rawValue: '1600', rawUnit: 'A', normalizedValue: 1600, normalizedUnit: 'A', sourceDocument: 'Schneider_MasterPact_MTZ2_Datasheet.pdf', sourcePage: 1, confidence: 0.99, extractionMethod: 'NATIVE_TABLE', reviewStatus: 'APPROVED' },
      { parameterName: 'rated_operational_voltage', displayName: 'Rated Operational Voltage Ue', rawValue: '690', rawUnit: 'V', normalizedValue: 690, normalizedUnit: 'V', sourceDocument: 'Schneider_MasterPact_MTZ2_Datasheet.pdf', sourcePage: 1, confidence: 0.99, extractionMethod: 'NATIVE_TABLE', reviewStatus: 'APPROVED' },
      { parameterName: 'breaking_capacity_icu_ka', displayName: 'Ultimate Breaking Capacity (Icu @ 415V)', rawValue: '66', rawUnit: 'kA', normalizedValue: 66, normalizedUnit: 'kA', sourceDocument: 'Schneider_MasterPact_MTZ2_Datasheet.pdf', sourcePage: 1, confidence: 0.98, extractionMethod: 'NATIVE_TABLE', reviewStatus: 'APPROVED' },
      { parameterName: 'rated_short_time_current_icw', displayName: 'Rated Short-time Withstand Current Icw (1s)', rawValue: '66', rawUnit: 'kA', normalizedValue: 66, normalizedUnit: 'kA', sourceDocument: 'Schneider_MasterPact_MTZ2_Datasheet.pdf', sourcePage: 1, confidence: 0.98, extractionMethod: 'NATIVE_TABLE', reviewStatus: 'APPROVED' },
      { parameterName: 'poles_count', displayName: 'Poles', rawValue: '3P / 4P', rawUnit: '', normalizedValue: 3, normalizedUnit: 'poles', sourceDocument: 'Schneider_MasterPact_MTZ2_Datasheet.pdf', sourcePage: 1, confidence: 0.97, extractionMethod: 'NATIVE_REGEX', reviewStatus: 'APPROVED' }
    ];

    schneiderSpecs.forEach((s, idx) => {
      const specId = `spec-${schneiderId}-${idx + 1}`;
      this.specifications.set(specId, {
        id: specId,
        modelId: schneiderId,
        ...s,
        createdAt: '2026-03-14T14:00:00.000Z',
        updatedAt: '2026-03-14T14:00:00.000Z'
      });
    });

    this.saveToDisk();
  }

  private saveToDisk() {
    try {
      const payload = {
        manufacturers: Array.from(this.manufacturers.values()),
        categories: Array.from(this.categories.values()),
        models: Array.from(this.models.values()),
        datasheets: Array.from(this.datasheets.values()),
        specifications: Array.from(this.specifications.values()),
        specDefinitions: Array.from(this.specDefinitions.values()),
        units: Array.from(this.units.values()),
        sourceReferences: Array.from(this.sourceReferences.values()),
        extractionRuns: Array.from(this.extractionRuns.values()),
        projects: Array.from(this.projects.values()),
        cables: Array.from(this.cables.values()),
        priceBook: Array.from(this.priceBook.values())
      };
      const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempFile, JSON.stringify(payload, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      console.error('Failed to save SOLNEXA database to disk:', err);
    }
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const data = JSON.parse(raw);

        if (Array.isArray(data.manufacturers)) {
          data.manufacturers.forEach((m: Manufacturer) => this.manufacturers.set(m.id, m));
        }
        if (Array.isArray(data.models)) {
          data.models.forEach((m: EquipmentModel) => this.models.set(m.id, m));
        }
        if (Array.isArray(data.datasheets)) {
          data.datasheets.forEach((d: Datasheet) => this.datasheets.set(d.id, d));
        }
        if (Array.isArray(data.specifications)) {
          data.specifications.forEach((s: EquipmentSpecification) => this.specifications.set(s.id, s));
        }
        if (Array.isArray(data.sourceReferences)) {
          data.sourceReferences.forEach((r: SourceReference) => this.sourceReferences.set(r.id, r));
        }
        if (Array.isArray(data.extractionRuns)) {
          data.extractionRuns.forEach((r: ExtractionRun) => this.extractionRuns.set(r.id, r));
        }
        if (Array.isArray(data.projects)) {
          data.projects.forEach((p: Project) => this.projects.set(p.id, p));
        }
        if (Array.isArray(data.cables)) {
          data.cables.forEach((c: CableSpecificationItem) => this.cables.set(c.id, c));
        }
        if (Array.isArray(data.priceBook)) {
          data.priceBook.forEach((pb: PriceBookItem) => this.priceBook.set(pb.id, pb));
        }
      }
    } catch (err) {
      console.warn('Could not load existing SOLNEXA db, will re-initialize defaults:', err);
    }
  }

  // --- Manufacturers ---
  public getManufacturers(): Manufacturer[] {
    const list = Array.from(this.manufacturers.values());
    return list.map(m => {
      const eqCount = Array.from(this.models.values()).filter(eq => eq.manufacturerId === m.id).length;
      return { ...m, equipmentCount: eqCount };
    });
  }

  public getManufacturer(id: string): Manufacturer | undefined {
    return this.manufacturers.get(id);
  }

  public getOrCreateManufacturer(name: string, country?: string): Manufacturer {
    const cleanName = name.trim();
    for (const m of this.manufacturers.values()) {
      if (m.name.toLowerCase() === cleanName.toLowerCase()) {
        return m;
      }
    }
    const newId = `mfg-${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;
    const newMfg: Manufacturer = {
      id: newId,
      name: cleanName,
      country,
      createdAt: new Date().toISOString()
    };
    this.manufacturers.set(newId, newMfg);
    this.saveToDisk();
    return newMfg;
  }

  // --- Categories ---
  public getCategories(): EquipmentCategory[] {
    return Array.from(this.categories.values());
  }

  public getCategory(code: EquipmentCategoryCode): EquipmentCategory | undefined {
    return this.categories.get(code);
  }

  // --- Datasheets ---
  public getDatasheets(): Datasheet[] {
    return Array.from(this.datasheets.values()).sort(
      (a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
    );
  }

  public getDatasheet(id: string): Datasheet | undefined {
    return this.datasheets.get(id);
  }

  public addDatasheet(datasheet: Datasheet): Datasheet {
    this.datasheets.set(datasheet.id, datasheet);
    this.saveToDisk();
    return datasheet;
  }

  // --- Equipment Models ---
  public getModels(filter?: {
    category?: EquipmentCategoryCode;
    manufacturerId?: string;
    search?: string;
    isApproved?: boolean;
  }): EquipmentModel[] {
    let result = Array.from(this.models.values());

    if (filter) {
      if (filter.category) {
        result = result.filter(m => m.categoryCode === filter.category);
      }
      if (filter.manufacturerId) {
        result = result.filter(m => m.manufacturerId === filter.manufacturerId);
      }
      if (filter.isApproved !== undefined) {
        result = result.filter(m => m.isApproved === filter.isApproved);
      }
      if (filter.search) {
        const q = filter.search.toLowerCase();
        result = result.filter(m =>
          m.modelName.toLowerCase().includes(q) ||
          m.manufacturerName.toLowerCase().includes(q) ||
          (m.series && m.series.toLowerCase().includes(q)) ||
          (m.description && m.description.toLowerCase().includes(q))
        );
      }
    }

    return result.map(m => {
      const specs = Array.from(this.specifications.values()).filter(s => s.modelId === m.id);
      return {
        ...m,
        specificationsCount: specs.length,
        specifications: specs
      };
    });
  }

  public getModelById(id: string): EquipmentModel | undefined {
    const model = this.models.get(id);
    if (!model) return undefined;
    const specs = Array.from(this.specifications.values()).filter(s => s.modelId === id);
    const refs = Array.from(this.sourceReferences.values()).filter(r => r.modelId === id);
    return {
      ...model,
      specifications: specs,
      sourceReferences: refs
    };
  }

  public upsertModel(model: EquipmentModel): EquipmentModel {
    this.models.set(model.id, {
      ...model,
      updatedAt: new Date().toISOString()
    });
    this.saveToDisk();
    return model;
  }

  // --- Specifications ---
  public getSpecificationsByModelId(modelId: string): EquipmentSpecification[] {
    return Array.from(this.specifications.values()).filter(s => s.modelId === modelId);
  }

  public upsertSpecification(spec: EquipmentSpecification): EquipmentSpecification {
    this.specifications.set(spec.id, {
      ...spec,
      updatedAt: new Date().toISOString()
    });
    this.saveToDisk();
    return spec;
  }

  public deleteSpecification(specId: string): boolean {
    const deleted = this.specifications.delete(specId);
    if (deleted) this.saveToDisk();
    return deleted;
  }

  public approveSpecification(specId: string): EquipmentSpecification | undefined {
    const spec = this.specifications.get(specId);
    if (!spec) return undefined;
    spec.reviewStatus = 'APPROVED';
    spec.updatedAt = new Date().toISOString();
    this.saveToDisk();
    return spec;
  }

  public rejectSpecification(specId: string): EquipmentSpecification | undefined {
    const spec = this.specifications.get(specId);
    if (!spec) return undefined;
    spec.reviewStatus = 'REJECTED';
    spec.updatedAt = new Date().toISOString();
    this.saveToDisk();
    return spec;
  }

  public addSourceReference(ref: SourceReference): SourceReference {
    this.sourceReferences.set(ref.id, ref);
    this.saveToDisk();
    return ref;
  }

  // --- Extraction Runs & Diagnostics ---
  public addExtractionRun(run: ExtractionRun): ExtractionRun {
    this.extractionRuns.set(run.id, run);
    this.saveToDisk();
    return run;
  }

  public getExtractionRuns(datasheetId?: string): ExtractionRun[] {
    const list = Array.from(this.extractionRuns.values());
    if (datasheetId) {
      return list.filter(r => r.datasheetId === datasheetId);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // --- Projects ---
  public getProjects(filter?: { type?: string; status?: string; search?: string }): Project[] {
    let list = Array.from(this.projects.values());
    if (filter) {
      if (filter.type) {
        list = list.filter(p => p.type === filter.type);
      }
      if (filter.status) {
        list = list.filter(p => p.status === filter.status);
      }
      if (filter.search) {
        const q = filter.search.toLowerCase();
        list = list.filter(p =>
          p.name.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.type.toLowerCase().includes(q)
        );
      }
    }
    return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  public getProjectById(id: string): Project | undefined {
    return this.projects.get(id);
  }

  public upsertProject(project: Partial<Project> & { name: string; type: Project['type'] }): Project {
    const id = project.id || `proj-${Date.now()}`;
    const existing = this.projects.get(id);
    const now = new Date().toISOString();

    const updated: Project = {
      id,
      name: project.name,
      type: project.type,
      status: project.status || existing?.status || 'IN_DESIGN',
      location: project.location || existing?.location || 'Tokyo, Japan',
      designStandard: project.designStandard || existing?.designStandard || 'JIS',
      capacityDisplay: project.capacityDisplay || existing?.capacityDisplay || '1.0 MWp',
      voltageDisplay: project.voltageDisplay || existing?.voltageDisplay || '400 V / 6.6 kV',
      completionPercent: project.completionPercent !== undefined ? project.completionPercent : (existing?.completionPercent ?? 50),
      estimatedCostJpy: project.estimatedCostJpy !== undefined ? project.estimatedCostJpy : (existing?.estimatedCostJpy ?? 100000000),
      totalPvCapacityKwp: project.totalPvCapacityKwp ?? existing?.totalPvCapacityKwp,
      totalAcCapacityKw: project.totalAcCapacityKw ?? existing?.totalAcCapacityKw,
      dcAcRatio: project.dcAcRatio ?? existing?.dcAcRatio,
      storageCapacityMwh: project.storageCapacityMwh ?? existing?.storageCapacityMwh,
      storagePowerMw: project.storagePowerMw ?? existing?.storagePowerMw,
      solarConfig: project.solarConfig || existing?.solarConfig,
      bessConfig: project.bessConfig || existing?.bessConfig,
      notes: project.notes || existing?.notes || [],
      boqItems: project.boqItems || existing?.boqItems || [],
      quotation: project.quotation || existing?.quotation || {
        materialCost: 0,
        laborCost: 0,
        engineeringCost: 0,
        otherCost: 0,
        subtotal: 0,
        marginPercentage: 15,
        marginAmount: 0,
        taxPercentage: 0,
        taxAmount: 0,
        grandTotal: 0,
        sellingPrice: 0
      },
      createdAt: existing?.createdAt || now,
      updatedAt: now
    };

    this.projects.set(id, updated);
    this.saveToDisk();
    return updated;
  }

  public deleteProject(id: string): boolean {
    const deleted = this.projects.delete(id);
    if (deleted) {
      this.saveToDisk();
    }
    return deleted;
  }

  // --- Cables ---
  public getCables(): CableSpecificationItem[] {
    return Array.from(this.cables.values());
  }

  // --- Price Book ---
  public getPriceBook(): PriceBookItem[] {
    return Array.from(this.priceBook.values());
  }

  // --- Seeding missing models, projects, cables, priceBook ---
  private seedMissingEngineeringModels() {
    // 1. Trina TSM-580NE19R
    if (!this.models.has('eq-trina-tsm-580ne19r')) {
      const trina580Id = 'eq-trina-tsm-580ne19r';
      this.models.set(trina580Id, {
        id: trina580Id,
        manufacturerId: 'mfg-trina',
        manufacturerName: 'Trina Solar',
        categoryCode: 'PV_MODULE',
        modelName: 'TSM-580NE19R',
        series: 'Vertex N Series',
        description: '580W N-Type TOPCon Bifacial Dual Glass PV Module',
        isApproved: true,
        revision: 1,
        createdAt: '2026-03-12T00:00:00.000Z',
        updatedAt: '2026-03-12T00:00:00.000Z'
      });
      const specs = [
        { parameterName: 'rated_power_pmax', displayName: 'Peak Power Pmax (STC)', rawValue: '580 W', rawUnit: 'W', normalizedValue: 580, normalizedUnit: 'W' },
        { parameterName: 'open_circuit_voltage_voc', displayName: 'Open Circuit Voltage Voc', rawValue: '51.42 V', rawUnit: 'V', normalizedValue: 51.42, normalizedUnit: 'V' },
        { parameterName: 'short_circuit_current_isc', displayName: 'Short Circuit Current Isc', rawValue: '14.42 A', rawUnit: 'A', normalizedValue: 14.42, normalizedUnit: 'A' },
        { parameterName: 'max_power_voltage_vmp', displayName: 'Voltage at Pmax Vmp', rawValue: '42.80 V', rawUnit: 'V', normalizedValue: 42.80, normalizedUnit: 'V' },
        { parameterName: 'max_power_current_imp', displayName: 'Current at Pmax Imp', rawValue: '13.55 A', rawUnit: 'A', normalizedValue: 13.55, normalizedUnit: 'A' },
        { parameterName: 'module_efficiency', displayName: 'Module Efficiency', rawValue: '22.5 %', rawUnit: '%', normalizedValue: 22.5, normalizedUnit: '%' },
        { parameterName: 'temp_coefficient_voc', displayName: 'Temperature Coeff Voc', rawValue: '-0.24 %/°C', rawUnit: '%/°C', normalizedValue: -0.24, normalizedUnit: '%/°C' },
        { parameterName: 'temp_coefficient_pmax', displayName: 'Temperature Coeff Pmax', rawValue: '-0.30 %/°C', rawUnit: '%/°C', normalizedValue: -0.30, normalizedUnit: '%/°C' },
        { parameterName: 'temp_coefficient_isc', displayName: 'Temperature Coeff Isc', rawValue: '+0.04 %/°C', rawUnit: '%/°C', normalizedValue: 0.04, normalizedUnit: '%/°C' },
        { parameterName: 'max_system_voltage', displayName: 'Max System Voltage', rawValue: '1500 V', rawUnit: 'V', normalizedValue: 1500, normalizedUnit: 'V' }
      ];
      specs.forEach((s, idx) => {
        const specId = `spec-${trina580Id}-${idx + 1}`;
        this.specifications.set(specId, {
          id: specId,
          modelId: trina580Id,
          ...s,
          sourceDocument: 'Trina_Vertex_N_TSM-580NE19R_Datasheet.pdf',
          sourcePage: 1,
          confidence: 0.99,
          extractionMethod: 'NATIVE_TABLE',
          reviewStatus: 'APPROVED',
          createdAt: '2026-03-12T00:00:00.000Z',
          updatedAt: '2026-03-12T00:00:00.000Z'
        });
      });
    }

    // 2. Jinko Solar Tiger Neo 585W
    if (!this.models.has('eq-jinko-tiger-neo-585')) {
      const jinkoId = 'eq-jinko-tiger-neo-585';
      this.models.set(jinkoId, {
        id: jinkoId,
        manufacturerId: 'mfg-jinko',
        manufacturerName: 'Jinko Solar',
        categoryCode: 'PV_MODULE',
        modelName: 'JKM585N-72HL4-BDV',
        series: 'Tiger Neo N-type',
        description: '585W Bifacial Dual Glass Module, N-type TOPCon, 1500V DC',
        isApproved: true,
        revision: 1,
        createdAt: '2026-03-12T00:00:00.000Z',
        updatedAt: '2026-03-12T00:00:00.000Z'
      });
      const specs = [
        { parameterName: 'rated_power_pmax', displayName: 'Peak Power Pmax (STC)', rawValue: '585 W', rawUnit: 'W', normalizedValue: 585, normalizedUnit: 'W' },
        { parameterName: 'open_circuit_voltage_voc', displayName: 'Open Circuit Voltage Voc', rawValue: '52.10 V', rawUnit: 'V', normalizedValue: 52.10, normalizedUnit: 'V' },
        { parameterName: 'short_circuit_current_isc', displayName: 'Short Circuit Current Isc', rawValue: '14.36 A', rawUnit: 'A', normalizedValue: 14.36, normalizedUnit: 'A' },
        { parameterName: 'max_power_voltage_vmp', displayName: 'Voltage at Pmax Vmp', rawValue: '43.60 V', rawUnit: 'V', normalizedValue: 43.60, normalizedUnit: 'V' },
        { parameterName: 'max_power_current_imp', displayName: 'Current at Pmax Imp', rawValue: '13.42 A', rawUnit: 'A', normalizedValue: 13.42, normalizedUnit: 'A' },
        { parameterName: 'module_efficiency', displayName: 'Module Efficiency', rawValue: '22.6 %', rawUnit: '%', normalizedValue: 22.6, normalizedUnit: '%' },
        { parameterName: 'temp_coefficient_voc', displayName: 'Temperature Coeff Voc', rawValue: '-0.25 %/°C', rawUnit: '%/°C', normalizedValue: -0.25, normalizedUnit: '%/°C' },
        { parameterName: 'temp_coefficient_pmax', displayName: 'Temperature Coeff Pmax', rawValue: '-0.29 %/°C', rawUnit: '%/°C', normalizedValue: -0.29, normalizedUnit: '%/°C' },
        { parameterName: 'max_system_voltage', displayName: 'Max System Voltage', rawValue: '1500 V', rawUnit: 'V', normalizedValue: 1500, normalizedUnit: 'V' }
      ];
      specs.forEach((s, idx) => {
        const specId = `spec-${jinkoId}-${idx + 1}`;
        this.specifications.set(specId, {
          id: specId,
          modelId: jinkoId,
          ...s,
          sourceDocument: 'Jinko_TigerNeo_JKM585N-72HL4-BDV_Datasheet.pdf',
          sourcePage: 1,
          confidence: 0.99,
          extractionMethod: 'NATIVE_TABLE',
          reviewStatus: 'APPROVED',
          createdAt: '2026-03-12T00:00:00.000Z',
          updatedAt: '2026-03-12T00:00:00.000Z'
        });
      });
    }

    // 3. LONGi Hi-MO 7 585W
    if (!this.models.has('eq-longi-himo7-585')) {
      const longiId = 'eq-longi-himo7-585';
      this.models.set(longiId, {
        id: longiId,
        manufacturerId: 'mfg-longi',
        manufacturerName: 'LONGi Solar',
        categoryCode: 'PV_MODULE',
        modelName: 'LR5-72HTH-585M',
        series: 'Hi-MO 7',
        description: '585W High Efficiency HPBC Solar Module, 1500V DC',
        isApproved: true,
        revision: 1,
        createdAt: '2026-03-12T00:00:00.000Z',
        updatedAt: '2026-03-12T00:00:00.000Z'
      });
      const specs = [
        { parameterName: 'rated_power_pmax', displayName: 'Peak Power Pmax (STC)', rawValue: '585 W', rawUnit: 'W', normalizedValue: 585, normalizedUnit: 'W' },
        { parameterName: 'open_circuit_voltage_voc', displayName: 'Open Circuit Voltage Voc', rawValue: '52.00 V', rawUnit: 'V', normalizedValue: 52.00, normalizedUnit: 'V' },
        { parameterName: 'short_circuit_current_isc', displayName: 'Short Circuit Current Isc', rawValue: '14.31 A', rawUnit: 'A', normalizedValue: 14.31, normalizedUnit: 'A' },
        { parameterName: 'max_power_voltage_vmp', displayName: 'Voltage at Pmax Vmp', rawValue: '43.50 V', rawUnit: 'V', normalizedValue: 43.50, normalizedUnit: 'V' },
        { parameterName: 'max_power_current_imp', displayName: 'Current at Pmax Imp', rawValue: '13.45 A', rawUnit: 'A', normalizedValue: 13.45, normalizedUnit: 'A' },
        { parameterName: 'module_efficiency', displayName: 'Module Efficiency', rawValue: '22.6 %', rawUnit: '%', normalizedValue: 22.6, normalizedUnit: '%' },
        { parameterName: 'temp_coefficient_voc', displayName: 'Temperature Coeff Voc', rawValue: '-0.23 %/°C', rawUnit: '%/°C', normalizedValue: -0.23, normalizedUnit: '%/°C' },
        { parameterName: 'temp_coefficient_pmax', displayName: 'Temperature Coeff Pmax', rawValue: '-0.28 %/°C', rawUnit: '%/°C', normalizedValue: -0.28, normalizedUnit: '%/°C' },
        { parameterName: 'max_system_voltage', displayName: 'Max System Voltage', rawValue: '1500 V', rawUnit: 'V', normalizedValue: 1500, normalizedUnit: 'V' }
      ];
      specs.forEach((s, idx) => {
        const specId = `spec-${longiId}-${idx + 1}`;
        this.specifications.set(specId, {
          id: specId,
          modelId: longiId,
          ...s,
          sourceDocument: 'LONGi_HiMO7_LR5-72HTH-585M_Datasheet.pdf',
          sourcePage: 1,
          confidence: 0.99,
          extractionMethod: 'NATIVE_TABLE',
          reviewStatus: 'APPROVED',
          createdAt: '2026-03-12T00:00:00.000Z',
          updatedAt: '2026-03-12T00:00:00.000Z'
        });
      });
    }

    // 4. Canadian Solar CS7N-585MB-AG
    if (!this.models.has('eq-canadian-cs7n-585')) {
      const canId = 'eq-canadian-cs7n-585';
      this.models.set(canId, {
        id: canId,
        manufacturerId: 'mfg-canadian',
        manufacturerName: 'Canadian Solar',
        categoryCode: 'PV_MODULE',
        modelName: 'CS7N-585MB-AG',
        series: 'BiHiKu7',
        description: '585W TOPBiHiKu7 Bifacial TOPCon Module, 1500V DC',
        isApproved: true,
        revision: 1,
        createdAt: '2026-03-12T00:00:00.000Z',
        updatedAt: '2026-03-12T00:00:00.000Z'
      });
      const specs = [
        { parameterName: 'rated_power_pmax', displayName: 'Peak Power Pmax (STC)', rawValue: '585 W', rawUnit: 'W', normalizedValue: 585, normalizedUnit: 'W' },
        { parameterName: 'open_circuit_voltage_voc', displayName: 'Open Circuit Voltage Voc', rawValue: '52.40 V', rawUnit: 'V', normalizedValue: 52.40, normalizedUnit: 'V' },
        { parameterName: 'short_circuit_current_isc', displayName: 'Short Circuit Current Isc', rawValue: '14.26 A', rawUnit: 'A', normalizedValue: 14.26, normalizedUnit: 'A' },
        { parameterName: 'max_power_voltage_vmp', displayName: 'Voltage at Pmax Vmp', rawValue: '43.70 V', rawUnit: 'V', normalizedValue: 43.70, normalizedUnit: 'V' },
        { parameterName: 'max_power_current_imp', displayName: 'Current at Pmax Imp', rawValue: '13.39 A', rawUnit: 'A', normalizedValue: 13.39, normalizedUnit: 'A' },
        { parameterName: 'module_efficiency', displayName: 'Module Efficiency', rawValue: '22.5 %', rawUnit: '%', normalizedValue: 22.5, normalizedUnit: '%' },
        { parameterName: 'temp_coefficient_voc', displayName: 'Temperature Coeff Voc', rawValue: '-0.25 %/°C', rawUnit: '%/°C', normalizedValue: -0.25, normalizedUnit: '%/°C' },
        { parameterName: 'temp_coefficient_pmax', displayName: 'Temperature Coeff Pmax', rawValue: '-0.29 %/°C', rawUnit: '%/°C', normalizedValue: -0.29, normalizedUnit: '%/°C' },
        { parameterName: 'max_system_voltage', displayName: 'Max System Voltage', rawValue: '1500 V', rawUnit: 'V', normalizedValue: 1500, normalizedUnit: 'V' }
      ];
      specs.forEach((s, idx) => {
        const specId = `spec-${canId}-${idx + 1}`;
        this.specifications.set(specId, {
          id: specId,
          modelId: canId,
          ...s,
          sourceDocument: 'CanadianSolar_BiHiKu7_CS7N-585MB-AG_Datasheet.pdf',
          sourcePage: 1,
          confidence: 0.99,
          extractionMethod: 'NATIVE_TABLE',
          reviewStatus: 'APPROVED',
          createdAt: '2026-03-12T00:00:00.000Z',
          updatedAt: '2026-03-12T00:00:00.000Z'
        });
      });
    }

    // 5. JA Solar JAM72D40-580/GB
    if (!this.models.has('eq-ja-jam72d40-580')) {
      const jaId = 'eq-ja-jam72d40-580';
      this.models.set(jaId, {
        id: jaId,
        manufacturerId: 'mfg-jasolar',
        manufacturerName: 'JA Solar',
        categoryCode: 'PV_MODULE',
        modelName: 'JAM72D40-580/GB',
        series: 'DeepBlue 4.0 Pro',
        description: '580W N-type Bycium+ Bifacial Dual Glass Module',
        isApproved: true,
        revision: 1,
        createdAt: '2026-03-12T00:00:00.000Z',
        updatedAt: '2026-03-12T00:00:00.000Z'
      });
      const specs = [
        { parameterName: 'rated_power_pmax', displayName: 'Peak Power Pmax (STC)', rawValue: '580 W', rawUnit: 'W', normalizedValue: 580, normalizedUnit: 'W' },
        { parameterName: 'open_circuit_voltage_voc', displayName: 'Open Circuit Voltage Voc', rawValue: '51.50 V', rawUnit: 'V', normalizedValue: 51.50, normalizedUnit: 'V' },
        { parameterName: 'short_circuit_current_isc', displayName: 'Short Circuit Current Isc', rawValue: '14.32 A', rawUnit: 'A', normalizedValue: 14.32, normalizedUnit: 'A' },
        { parameterName: 'max_power_voltage_vmp', displayName: 'Voltage at Pmax Vmp', rawValue: '43.10 V', rawUnit: 'V', normalizedValue: 43.10, normalizedUnit: 'V' },
        { parameterName: 'max_power_current_imp', displayName: 'Current at Pmax Imp', rawValue: '13.46 A', rawUnit: 'A', normalizedValue: 13.46, normalizedUnit: 'A' },
        { parameterName: 'module_efficiency', displayName: 'Module Efficiency', rawValue: '22.5 %', rawUnit: '%', normalizedValue: 22.5, normalizedUnit: '%' },
        { parameterName: 'temp_coefficient_voc', displayName: 'Temperature Coeff Voc', rawValue: '-0.25 %/°C', rawUnit: '%/°C', normalizedValue: -0.25, normalizedUnit: '%/°C' },
        { parameterName: 'temp_coefficient_pmax', displayName: 'Temperature Coeff Pmax', rawValue: '-0.30 %/°C', rawUnit: '%/°C', normalizedValue: -0.30, normalizedUnit: '%/°C' },
        { parameterName: 'max_system_voltage', displayName: 'Max System Voltage', rawValue: '1500 V', rawUnit: 'V', normalizedValue: 1500, normalizedUnit: 'V' }
      ];
      specs.forEach((s, idx) => {
        const specId = `spec-${jaId}-${idx + 1}`;
        this.specifications.set(specId, {
          id: specId,
          modelId: jaId,
          ...s,
          sourceDocument: 'JASolar_DeepBlue4Pro_JAM72D40-580_Datasheet.pdf',
          sourcePage: 1,
          confidence: 0.99,
          extractionMethod: 'NATIVE_TABLE',
          reviewStatus: 'APPROVED',
          createdAt: '2026-03-12T00:00:00.000Z',
          updatedAt: '2026-03-12T00:00:00.000Z'
        });
      });
    }

    // 6. Huawei SUN2000-100KTL-M2 Inverter
    if (!this.models.has('eq-huawei-sun2000-100ktl')) {
      const hw100Id = 'eq-huawei-sun2000-100ktl';
      this.models.set(hw100Id, {
        id: hw100Id,
        manufacturerId: 'mfg-huawei',
        manufacturerName: 'Huawei',
        categoryCode: 'PCS_INVERTER',
        modelName: 'SUN2000-100KTL-M2',
        series: 'Smart PV String Inverter Series',
        description: '100 kW 3-Phase String Inverter with 10 MPPTs for C&I Rooftops',
        isApproved: true,
        revision: 1,
        createdAt: '2026-03-12T00:00:00.000Z',
        updatedAt: '2026-03-12T00:00:00.000Z'
      });
      const specs = [
        { parameterName: 'rated_ac_power', displayName: 'Rated AC Power', rawValue: '100 kW', rawUnit: 'kW', normalizedValue: 100, normalizedUnit: 'kW' },
        { parameterName: 'max_dc_voltage', displayName: 'Max DC Voltage', rawValue: '1100 V', rawUnit: 'V', normalizedValue: 1100, normalizedUnit: 'V' },
        { parameterName: 'nominal_ac_voltage', displayName: 'Nominal AC Voltage', rawValue: '400 V', rawUnit: 'V', normalizedValue: 400, normalizedUnit: 'V' },
        { parameterName: 'mppt_count', displayName: 'MPPT Count', rawValue: '10', rawUnit: 'trackers', normalizedValue: 10, normalizedUnit: 'trackers' },
        { parameterName: 'max_efficiency', displayName: 'Max Efficiency', rawValue: '98.6 %', rawUnit: '%', normalizedValue: 98.6, normalizedUnit: '%' }
      ];
      specs.forEach((s, idx) => {
        const specId = `spec-${hw100Id}-${idx + 1}`;
        this.specifications.set(specId, {
          id: specId,
          modelId: hw100Id,
          ...s,
          sourceDocument: 'Huawei_SUN2000-100KTL-M2_Datasheet.pdf',
          sourcePage: 1,
          confidence: 0.99,
          extractionMethod: 'NATIVE_TABLE',
          reviewStatus: 'APPROVED',
          createdAt: '2026-03-12T00:00:00.000Z',
          updatedAt: '2026-03-12T00:00:00.000Z'
        });
      });
    }

    // 7. Huawei Smart String PCS 2000kW (Utility BESS PCS)
    if (!this.models.has('eq-huawei-pcs-2000')) {
      const hwPcsId = 'eq-huawei-pcs-2000';
      this.models.set(hwPcsId, {
        id: hwPcsId,
        manufacturerId: 'mfg-huawei',
        manufacturerName: 'Huawei',
        categoryCode: 'PCS_INVERTER',
        modelName: 'Smart String PCS 2000kW',
        series: 'Smart String Energy Storage System Series',
        description: '2000 kW Central Bidirectional PCS, 1500V DC / 690V AC, Grid-forming capability',
        isApproved: true,
        revision: 1,
        createdAt: '2026-03-12T00:00:00.000Z',
        updatedAt: '2026-03-12T00:00:00.000Z'
      });
      const specs = [
        { parameterName: 'rated_power_kw', displayName: 'Rated AC Output Power', rawValue: '2000 kW', rawUnit: 'kW', normalizedValue: 2000, normalizedUnit: 'kW' },
        { parameterName: 'dc_voltage_range_max', displayName: 'Max DC Voltage', rawValue: '1500 V', rawUnit: 'V', normalizedValue: 1500, normalizedUnit: 'V' },
        { parameterName: 'ac_voltage_v', displayName: 'Nominal AC Output Voltage', rawValue: '690 V', rawUnit: 'V', normalizedValue: 690, normalizedUnit: 'V' },
        { parameterName: 'max_efficiency', displayName: 'Max Efficiency', rawValue: '99.0 %', rawUnit: '%', normalizedValue: 99.0, normalizedUnit: '%' },
        { parameterName: 'grid_support', displayName: 'Grid Forming Capability', rawValue: 'Yes (VSG / Black Start)', rawUnit: '', normalizedValue: 'VSG', normalizedUnit: '' }
      ];
      specs.forEach((s, idx) => {
        const specId = `spec-${hwPcsId}-${idx + 1}`;
        this.specifications.set(specId, {
          id: specId,
          modelId: hwPcsId,
          ...s,
          sourceDocument: 'Huawei_Smart_String_PCS_2000kW_Datasheet.pdf',
          sourcePage: 1,
          confidence: 0.99,
          extractionMethod: 'NATIVE_TABLE',
          reviewStatus: 'APPROVED',
          createdAt: '2026-03-12T00:00:00.000Z',
          updatedAt: '2026-03-12T00:00:00.000Z'
        });
      });
    }

    // 8. Huawei LUNA2000-2.0MWH-2H1 BESS Container (4 units = 8 MWh)
    if (!this.models.has('eq-huawei-luna2000-2mwh')) {
      const hwBessId = 'eq-huawei-luna2000-2mwh';
      this.models.set(hwBessId, {
        id: hwBessId,
        manufacturerId: 'mfg-huawei',
        manufacturerName: 'Huawei',
        categoryCode: 'BESS',
        modelName: 'LUNA2000-2.0MWH-2H1',
        series: 'Smart String BESS Container Series',
        description: '2032 kWh Utility Liquid Cooling Battery Energy Storage System Container (1500V DC)',
        isApproved: true,
        revision: 1,
        createdAt: '2026-03-12T00:00:00.000Z',
        updatedAt: '2026-03-12T00:00:00.000Z'
      });
      const specs = [
        { parameterName: 'nominal_energy_capacity', displayName: 'Nominal Energy Capacity', rawValue: '2032 kWh', rawUnit: 'kWh', normalizedValue: 2032, normalizedUnit: 'kWh' },
        { parameterName: 'nominal_voltage_v', displayName: 'Nominal DC Voltage', rawValue: '1300 V', rawUnit: 'V', normalizedValue: 1300, normalizedUnit: 'V' },
        { parameterName: 'operating_voltage_range', displayName: 'Operating DC Voltage Range', rawValue: '1000 - 1500 V', rawUnit: 'V', normalizedValue: 1500, normalizedUnit: 'V' },
        { parameterName: 'cell_chemistry', displayName: 'Cell Chemistry', rawValue: 'LFP (LiFePO4)', rawUnit: '', normalizedValue: 'LFP', normalizedUnit: '' },
        { parameterName: 'cooling_system', displayName: 'Thermal Management', rawValue: 'Cell-level Liquid Cooling', rawUnit: '', normalizedValue: 'Liquid Cooling', normalizedUnit: '' },
        { parameterName: 'cycle_life', displayName: 'Cycle Life', rawValue: '10,000 cycles (80% EOL)', rawUnit: 'cycles', normalizedValue: 10000, normalizedUnit: 'cycles' },
        { parameterName: 'fire_safety', displayName: 'Fire Suppression System', rawValue: 'NFPA 855 / Aerosol + Water Mist', rawUnit: '', normalizedValue: 'NFPA 855', normalizedUnit: '' }
      ];
      specs.forEach((s, idx) => {
        const specId = `spec-${hwBessId}-${idx + 1}`;
        this.specifications.set(specId, {
          id: specId,
          modelId: hwBessId,
          ...s,
          sourceDocument: 'Huawei_LUNA2000-2.0MWH-2H1_Datasheet.pdf',
          sourcePage: 1,
          confidence: 0.99,
          extractionMethod: 'NATIVE_TABLE',
          reviewStatus: 'APPROVED',
          createdAt: '2026-03-12T00:00:00.000Z',
          updatedAt: '2026-03-12T00:00:00.000Z'
        });
      });
    }

    // 9. Hitachi Step-up Transformer 500 kVA (for Solar 500kW)
    if (!this.models.has('eq-hitachi-trans-500')) {
      const hitachi500Id = 'eq-hitachi-trans-500';
      this.models.set(hitachi500Id, {
        id: hitachi500Id,
        manufacturerId: 'mfg-hitachi',
        manufacturerName: 'Hitachi Energy',
        categoryCode: 'TRANSFORMER',
        modelName: 'Hitachi TR-500kVA-6.6kV',
        series: 'EcoDry / Oil Step-up Series',
        description: 'Step-up Transformer 500 kVA, Primary 6.6 kV, Secondary 400 V, 50 Hz',
        isApproved: true,
        revision: 1,
        createdAt: '2026-03-12T00:00:00.000Z',
        updatedAt: '2026-03-12T00:00:00.000Z'
      });
      const specs = [
        { parameterName: 'rated_power_kva', displayName: 'Rated Capacity', rawValue: '500 kVA', rawUnit: 'kVA', normalizedValue: 500, normalizedUnit: 'kVA' },
        { parameterName: 'primary_voltage_kv', displayName: 'Primary Voltage (HV)', rawValue: '6.6 kV', rawUnit: 'kV', normalizedValue: 6.6, normalizedUnit: 'kV' },
        { parameterName: 'secondary_voltage_v', displayName: 'Secondary Voltage (LV)', rawValue: '400 V', rawUnit: 'V', normalizedValue: 400, normalizedUnit: 'V' },
        { parameterName: 'impedance_percent', displayName: 'Short Circuit Impedance (%Z)', rawValue: '5.5 %', rawUnit: '%', normalizedValue: 5.5, normalizedUnit: '%' }
      ];
      specs.forEach((s, idx) => {
        const specId = `spec-${hitachi500Id}-${idx + 1}`;
        this.specifications.set(specId, {
          id: specId,
          modelId: hitachi500Id,
          ...s,
          sourceDocument: 'Hitachi_TR-500kVA-6.6kV_Datasheet.pdf',
          sourcePage: 1,
          confidence: 0.99,
          extractionMethod: 'NATIVE_TABLE',
          reviewStatus: 'APPROVED',
          createdAt: '2026-03-12T00:00:00.000Z',
          updatedAt: '2026-03-12T00:00:00.000Z'
        });
      });
    }

    // 10. Hitachi Step-up Transformer 2500 kVA (for BESS 2MW)
    if (!this.models.has('eq-hitachi-trans-2500')) {
      const hitachi2500Id = 'eq-hitachi-trans-2500';
      this.models.set(hitachi2500Id, {
        id: hitachi2500Id,
        manufacturerId: 'mfg-hitachi',
        manufacturerName: 'Hitachi Energy',
        categoryCode: 'TRANSFORMER',
        modelName: 'Hitachi TR-2500kVA-6.6kV',
        series: 'BESS Step-up Series',
        description: 'Step-up Transformer 2500 kVA, Primary 6.6 kV, Secondary 690 V, 50 Hz',
        isApproved: true,
        revision: 1,
        createdAt: '2026-03-12T00:00:00.000Z',
        updatedAt: '2026-03-12T00:00:00.000Z'
      });
      const specs = [
        { parameterName: 'rated_power_kva', displayName: 'Rated Capacity', rawValue: '2500 kVA', rawUnit: 'kVA', normalizedValue: 2500, normalizedUnit: 'kVA' },
        { parameterName: 'primary_voltage_kv', displayName: 'Primary Voltage (HV)', rawValue: '6.6 kV', rawUnit: 'kV', normalizedValue: 6.6, normalizedUnit: 'kV' },
        { parameterName: 'secondary_voltage_v', displayName: 'Secondary Voltage (LV)', rawValue: '690 V', rawUnit: 'V', normalizedValue: 690, normalizedUnit: 'V' },
        { parameterName: 'impedance_percent', displayName: 'Short Circuit Impedance (%Z)', rawValue: '6.5 %', rawUnit: '%', normalizedValue: 6.5, normalizedUnit: '%' }
      ];
      specs.forEach((s, idx) => {
        const specId = `spec-${hitachi2500Id}-${idx + 1}`;
        this.specifications.set(specId, {
          id: specId,
          modelId: hitachi2500Id,
          ...s,
          sourceDocument: 'Hitachi_TR-2500kVA-6.6kV_Datasheet.pdf',
          sourcePage: 1,
          confidence: 0.99,
          extractionMethod: 'NATIVE_TABLE',
          reviewStatus: 'APPROVED',
          createdAt: '2026-03-12T00:00:00.000Z',
          updatedAt: '2026-03-12T00:00:00.000Z'
        });
      });
    }

    // 11. Sungrow SC2000UD 2MW Central PCS
    if (!this.models.has('eq-sungrow-sc2000ud')) {
      const sungrowPcsId = 'eq-sungrow-sc2000ud';
      this.models.set(sungrowPcsId, {
        id: sungrowPcsId,
        manufacturerId: 'mfg-sungrow',
        manufacturerName: 'Sungrow',
        categoryCode: 'PCS_INVERTER',
        modelName: 'SC2000UD 2.0MW',
        series: 'Utility BESS PCS Series',
        description: '2000 kW Central Power Conversion System for Utility Energy Storage',
        isApproved: true,
        revision: 1,
        createdAt: '2026-03-12T00:00:00.000Z',
        updatedAt: '2026-03-12T00:00:00.000Z'
      });
    }

    // 12. Sungrow PowerTitan ST2752UX BESS Container
    if (!this.models.has('eq-sungrow-powertitan-2750')) {
      const st2750Id = 'eq-sungrow-powertitan-2750';
      this.models.set(st2750Id, {
        id: st2750Id,
        manufacturerId: 'mfg-sungrow',
        manufacturerName: 'Sungrow',
        categoryCode: 'BESS',
        modelName: 'PowerTitan ST2752UX',
        series: 'PowerTitan Utility BESS Series',
        description: '2752 kWh Utility Liquid Cooling Battery Container with LFP chemistry',
        isApproved: true,
        revision: 1,
        createdAt: '2026-03-12T00:00:00.000Z',
        updatedAt: '2026-03-12T00:00:00.000Z'
      });
    }
  }

  private seedInitialProjects() {
    // Exactly 2 sample projects as requested by user:
    // 1. Solar 500 kW System (Chiba)
    const chiba: Project = {
      id: 'proj-chiba-solar',
      name: 'Chiba 500kW Commercial Solar PV',
      type: 'SOLAR_PV',
      status: 'IN_DESIGN',
      location: 'Chiba, Japan',
      designStandard: 'JIS',
      capacityDisplay: '500 kWp / 500 kW',
      voltageDisplay: '400 V / 6.6 kV',
      completionPercent: 60,
      estimatedCostJpy: 55200000,
      totalPvCapacityKwp: 500,
      totalAcCapacityKw: 500,
      dcAcRatio: 1.00,
      solarConfig: {
        siteConditions: {
          ambientTempMinC: -5,
          ambientTempMaxC: 38,
          solarIrradiancePeakW: 1000,
          installationType: 'ROOFTOP',
          tiltAngleDeg: 15,
          azimuthDeg: 180
        },
        pvModule: {
          modelId: 'eq-trina-tsm-580ne19r',
          manufacturer: 'Trina Solar',
          modelName: 'TSM-580NE19R',
          ratedPowerW: 580,
          voc: 51.60,
          isc: 14.28,
          vmp: 43.20,
          imp: 13.43,
          efficiency: 22.5,
          quantity: 862,
          cellType: 'N-type TOPCon 182mm',
          datasheetFilename: 'Trina_Vertex_N_TSM-580NE19R_Datasheet.pdf'
        },
        strings: {
          modulesPerString: 19,
          totalStrings: 45,
          stringsPerMppt: 2,
          totalCombiners: 5
        },
        inverter: {
          modelId: 'eq-huawei-sun2000-100ktl',
          manufacturer: 'Huawei',
          modelName: 'SUN2000-100KTL-M2',
          ratedAcPowerKw: 100,
          quantity: 5,
          maxDcVoltage: 1100,
          nominalAcVoltage: 400,
          mpptCount: 10,
          efficiency: 98.6
        },
        transformer: {
          modelId: 'eq-hitachi-trans-500',
          manufacturer: 'Hitachi Energy',
          modelName: 'Hitachi TR-500kVA-6.6kV',
          ratedPowerKva: 500,
          primaryVoltageKv: 6.6,
          secondaryVoltageV: 400,
          quantity: 1,
          impedancePercent: 5.5
        },
        grid: {
          voltageKv: 6.6,
          frequencyHz: 50,
          connectionType: 'INTERCONNECTION_HV'
        },
        cables: {
          dcCablePv: {
            type: 'CVT / PV1-F',
            sizeMm2: 16,
            lengthM: 80,
            currentA: 24.5,
            voltageDropPercent: 0.95,
            voltageDropVolts: 7.6,
            status: 'OK'
          },
          acCableInverter: {
            type: 'CVT 600V',
            sizeMm2: 150,
            lengthM: 45,
            currentA: 144.3,
            voltageDropPercent: 0.82,
            voltageDropVolts: 3.3,
            status: 'OK'
          },
          acCableTransformer: {
            type: '6.6kV CVT 38mm²',
            sizeMm2: 38,
            lengthM: 50,
            currentA: 43.7,
            voltageDropPercent: 0.35,
            voltageDropVolts: 23.1,
            status: 'OK'
          }
        }
      },
      notes: [
        '1. Check roof load capacity (standard 15 kg/m² requirement for industrial metal roof)',
        '2. Confirm grid connection point with TEPCO Power Grid at 6.6 kV incoming cubicle',
        '3. 500 kW system: 862 modules of Trina 580W with 5x Huawei 100kW inverters'
      ],
      boqItems: [
        {
          id: 'boq-chiba-1',
          itemNumber: 1,
          equipmentId: 'eq-trina-tsm-580ne19r',
          category: 'PV_MODULE',
          itemName: 'PV Module 580W N-type TOPCon Bifacial',
          manufacturer: 'Trina Solar',
          model: 'TSM-580NE19R',
          description: 'High efficiency dual-glass module, 580W, 1500V DC',
          quantity: 862,
          unit: 'pcs',
          unitPrice: 16500,
          totalPrice: 14223000,
          notes: 'Standard 25-year product, 30-year linear performance warranty'
        },
        {
          id: 'boq-chiba-2',
          itemNumber: 2,
          equipmentId: 'eq-huawei-sun2000-100ktl',
          category: 'PCS_INVERTER',
          itemName: 'Smart String Inverter 100 kW',
          manufacturer: 'Huawei',
          model: 'SUN2000-100KTL-M2',
          description: '10 MPPTs, 400V 3-phase AC output, IP66 enclosure',
          quantity: 5,
          unit: 'pcs',
          unitPrice: 2200000,
          totalPrice: 11000000,
          notes: 'Includes integrated DC disconnector, SPD Type II, and smart IV curve'
        },
        {
          id: 'boq-chiba-3',
          itemNumber: 3,
          equipmentId: 'eq-hitachi-trans-500',
          category: 'TRANSFORMER',
          itemName: 'Step-up Transformer 500 kVA',
          manufacturer: 'Hitachi Energy',
          model: 'Hitachi TR-500kVA-6.6kV',
          description: '6.6 kV / 400 V, 50 Hz, 3-phase, Oil-immersed, outdoor enclosure',
          quantity: 1,
          unit: 'set',
          unitPrice: 5200000,
          totalPrice: 5200000,
          notes: 'Standard JIS C 4304 compliance'
        },
        {
          id: 'boq-chiba-4',
          itemNumber: 4,
          category: 'SWITCHGEAR',
          itemName: 'AC Low Voltage Combiner Board (500 kW)',
          manufacturer: 'Custom / Terasaki',
          model: 'ACB-400V-800A',
          description: 'Outdoor weatherproof AC combiner board with MCCBs',
          quantity: 1,
          unit: 'set',
          unitPrice: 3200000,
          totalPrice: 3200000,
          notes: 'Aggregates all 5 Huawei 100kW inverters'
        },
        {
          id: 'boq-chiba-5',
          itemNumber: 5,
          category: 'CABLE',
          itemName: 'DC Solar Cable & Main Branch (PV1-F & CVT 16mm²)',
          manufacturer: 'Sumitomo / Furukawa',
          model: 'CVT 16 mm² / PV1-F 6 mm²',
          description: '1500V DC rated cross-linked polyethylene insulated cable',
          quantity: 4800,
          unit: 'm',
          unitPrice: 1100,
          totalPrice: 5280000,
          notes: 'Engineered for rooftop ambient 45°C'
        },
        {
          id: 'boq-chiba-6',
          itemNumber: 6,
          category: 'CABLE',
          itemName: 'AC Cables (CVT 150 mm² & 6.6kV CVT 38 mm²)',
          manufacturer: 'Fujikura / Furukawa',
          model: 'CVT 150 mm² & 6.6kV CVT 38 mm²',
          description: '600V and 6.6kV cross-linked polyethylene cable runs',
          quantity: 850,
          unit: 'm',
          unitPrice: 2850,
          totalPrice: 2422500,
          notes: 'Voltage drop engineered below 1.0%'
        },
        {
          id: 'boq-chiba-7',
          itemNumber: 7,
          category: 'SWITCHGEAR',
          itemName: 'High Voltage Switchgear Cubicle (6.6 kV)',
          manufacturer: 'Schneider / Fuji Electric',
          model: 'VCB-6.6kV-630A',
          description: 'Vacuum Circuit Breaker (VCB), Protection Relays (OCR/DGR), PT/CT, ZCT',
          quantity: 1,
          unit: 'lot',
          unitPrice: 3397500,
          totalPrice: 3397500,
          notes: 'Meets TEPCO interconnection technical requirement'
        }
      ],
      quotation: {
        materialCost: 44723000,
        laborCost: 7500000,
        engineeringCost: 1500000,
        otherCost: 1477000,
        subtotal: 55200000,
        marginPercentage: 15,
        marginAmount: 8280000,
        taxPercentage: 0,
        taxAmount: 0,
        grandTotal: 63480000,
        sellingPrice: 63480000
      },
      createdAt: '2026-03-01T08:00:00.000Z',
      updatedAt: '2026-03-20T14:30:00.000Z'
    };

    // 2. BESS 2 MW AC / 8 MWh DC System (using 4x Huawei 2MW Containers)
    const tokyoBess: Project = {
      id: 'proj-tokyo-bess',
      name: 'Yokohama Port 2MW / 8MWh Utility BESS',
      type: 'BESS',
      status: 'IN_DESIGN',
      location: 'Yokohama, Kanagawa, Japan',
      designStandard: 'JIS',
      capacityDisplay: '2 MW / 8 MWh',
      voltageDisplay: '6.6 kV / 690 V',
      completionPercent: 35,
      estimatedCostJpy: 286500000,
      storagePowerMw: 2.0,
      storageCapacityMwh: 8.0,
      bessConfig: {
        requiredPowerMw: 2.0,
        requiredEnergyMwh: 8.0,
        durationHours: 4,
        cRate: 0.25,
        roundTripEfficiency: 88.5,
        battery: {
          modelId: 'eq-huawei-luna2000-2mwh',
          manufacturer: 'Huawei',
          modelName: 'LUNA2000-2.0MWH-2H1',
          capacityKwh: 2032,
          nominalVoltageV: 1300,
          chemistry: 'LFP (LiFePO4) Liquid Cooling',
          cycleLife: 10000,
          quantity: 4, // Exactly 4 container units as user requested!
          rackCount: 48,
          datasheetFilename: 'Huawei_LUNA2000-2.0MWH-2H1_Datasheet.pdf'
        },
        pcs: {
          modelId: 'eq-huawei-pcs-2000',
          manufacturer: 'Huawei',
          modelName: 'Smart String PCS 2000kW',
          ratedPowerKw: 2000,
          quantity: 1,
          dcVoltageMinV: 1000,
          dcVoltageMaxV: 1500,
          acVoltageV: 690,
          efficiency: 99.0
        },
        transformer: {
          modelId: 'eq-hitachi-trans-2500',
          manufacturer: 'Hitachi Energy',
          modelName: 'Hitachi TR-2500kVA-6.6kV',
          ratedPowerKva: 2500,
          primaryVoltageKv: 6.6,
          secondaryVoltageV: 690,
          quantity: 1
        },
        grid: {
          voltageKv: 6.6,
          frequencyHz: 50,
          connectionType: 'SUBSTATION_MV'
        },
        cables: {
          dcCableBattery: {
            type: '1500V DC Single-core XLPE Copper',
            sizeMm2: 300,
            lengthM: 40,
            currentA: 1540,
            voltageDropPercent: 0.65,
            status: 'OK'
          },
          acCablePcs: {
            type: '600V/1kV CVT 250 mm² (Parallel 2 runs)',
            sizeMm2: 250,
            lengthM: 30,
            currentA: 1673,
            voltageDropPercent: 0.58,
            status: 'OK'
          },
          acCableTransformer: {
            type: '6.6kV CVT 100 mm²',
            sizeMm2: 100,
            lengthM: 70,
            currentA: 218,
            voltageDropPercent: 0.42,
            status: 'OK'
          }
        }
      },
      notes: [
        '1. Utility BESS 2MW AC / 8MWh DC using 4x Huawei LUNA2000-2.0MWH containers (0.25C 4-hour duration)',
        '2. Frequency regulation, energy arbitrage and peak shaving contract with TEPCO Power Grid',
        '3. Fire safety compliant with NFPA 855 and Tokyo Fire Department energy storage safety guidelines',
        '4. Noise attenuation enclosure designed to achieve <60 dBA at site boundary'
      ],
      boqItems: [
        {
          id: 'boq-bess-1',
          itemNumber: 1,
          equipmentId: 'eq-huawei-luna2000-2mwh',
          category: 'BESS',
          itemName: 'Huawei Smart String BESS Container 2.032 MWh',
          manufacturer: 'Huawei',
          model: 'LUNA2000-2.0MWH-2H1',
          description: 'LFP Liquid-cooled container, 1500V DC, built-in HVAC & dual-tier fire suppression',
          quantity: 4,
          unit: 'set',
          unitPrice: 46000000,
          totalPrice: 184000000,
          notes: '4 containers aggregate to 8.128 MWh total storage'
        },
        {
          id: 'boq-bess-2',
          itemNumber: 2,
          equipmentId: 'eq-huawei-pcs-2000',
          category: 'PCS_INVERTER',
          itemName: 'Huawei Smart String Central PCS 2000 kW',
          manufacturer: 'Huawei',
          model: 'Smart String PCS 2000kW',
          description: 'Outdoor containerized bidirectional inverter, 690V AC, grid-forming & black start',
          quantity: 1,
          unit: 'set',
          unitPrice: 38000000,
          totalPrice: 38000000,
          notes: 'Supports four-quadrant operation with response time < 20ms'
        },
        {
          id: 'boq-bess-3',
          itemNumber: 3,
          equipmentId: 'eq-hitachi-trans-2500',
          category: 'TRANSFORMER',
          itemName: 'BESS Step-up Transformer 2500 kVA',
          manufacturer: 'Hitachi Energy',
          model: 'Hitachi TR-2500kVA-6.6kV',
          description: '6.6 kV / 690 V, 50 Hz, low loss oil-immersed design with oil containment basin',
          quantity: 1,
          unit: 'set',
          unitPrice: 15800000,
          totalPrice: 15800000
        },
        {
          id: 'boq-bess-4',
          itemNumber: 4,
          category: 'SWITCHGEAR',
          itemName: 'MV Protection & Grid Interconnection GIS Panel (6.6 kV)',
          manufacturer: 'Mitsubishi / Fuji Electric',
          model: 'MV-GIS-6.6kV',
          description: 'Gas Insulated Switchgear with directional overcurrent, islanding protection & metering',
          quantity: 1,
          unit: 'lot',
          unitPrice: 16500000,
          totalPrice: 16500000
        },
        {
          id: 'boq-bess-5',
          itemNumber: 5,
          category: 'ENGINEERING',
          itemName: 'Huawei Master EMS, AGC/AVC & SCADA Interconnection',
          manufacturer: 'Huawei',
          model: 'SmartEMS-Utility',
          description: 'Plant controller with automated generation control and TEPCO dispatch gateway',
          quantity: 1,
          unit: 'lot',
          unitPrice: 8500000,
          totalPrice: 8500000
        },
        {
          id: 'boq-bess-6',
          itemNumber: 6,
          category: 'CABLE',
          itemName: 'DC 1500V Busway & AC 690V Heavy Copper Power Cables',
          manufacturer: 'Furukawa / Sumitomo',
          model: 'XLPE 300 mm² & CVT 250 mm²',
          description: 'Interconnection cables connecting 4 containers to PCS and PCS to transformer',
          quantity: 1,
          unit: 'lot',
          unitPrice: 9200000,
          totalPrice: 9200000
        },
        {
          id: 'boq-bess-7',
          itemNumber: 7,
          category: 'LABOR',
          itemName: 'Civil Concrete Foundation, Fire Barrier Walls & Acoustic Fence',
          manufacturer: 'EPC Partner',
          model: 'Utility BESS Civil Package',
          description: 'NFPA 855 fire barrier containment, transformer bund, container foundations',
          quantity: 1,
          unit: 'lot',
          unitPrice: 14500000,
          totalPrice: 14500000
        }
      ],
      quotation: {
        materialCost: 286500000,
        laborCost: 22000000,
        engineeringCost: 8500000,
        otherCost: 9000000,
        subtotal: 326000000,
        marginPercentage: 12,
        marginAmount: 39120000,
        taxPercentage: 0,
        taxAmount: 0,
        grandTotal: 365120000,
        sellingPrice: 365120000
      },
      createdAt: '2026-03-05T09:00:00.000Z',
      updatedAt: '2026-03-20T11:20:00.000Z'
    };

    // Seed sample projects if not already existing, without clearing user-created projects
    if (!this.projects.has(chiba.id)) {
      this.projects.set(chiba.id, chiba);
    }
    if (!this.projects.has(tokyoBess.id)) {
      this.projects.set(tokyoBess.id, tokyoBess);
    }
  }

  public enforceUserRequestedCleanState() {
    // Ensure standard baseline sample projects exist, but strictly preserve all user-created projects
    if (!this.projects.has('proj-chiba-solar') || !this.projects.has('proj-tokyo-bess')) {
      this.seedInitialProjects();
      this.saveToDisk();
    }
  }

  private seedInitialCables() {
    const list: CableSpecificationItem[] = [
      { id: 'cbl-cvt-14', code: 'CVT-14', name: '600V CVT 14 mm²', material: 'COPPER', insulation: 'XLPE', ratedVoltage: '600 V', sizeMm2: 14, ampacityAirA: 95, ampacityGroundA: 90, resistance20COhmKm: 1.34, outerDiameterMm: 21.0, weightKgKm: 570, standard: 'JIS C 3605' },
      { id: 'cbl-cvt-22', code: 'CVT-22', name: '600V CVT 22 mm²', material: 'COPPER', insulation: 'XLPE', ratedVoltage: '600 V', sizeMm2: 22, ampacityAirA: 125, ampacityGroundA: 115, resistance20COhmKm: 0.852, outerDiameterMm: 24.0, weightKgKm: 850, standard: 'JIS C 3605' },
      { id: 'cbl-cvt-38', code: 'CVT-38', name: '600V CVT 38 mm²', material: 'COPPER', insulation: 'XLPE', ratedVoltage: '600 V', sizeMm2: 38, ampacityAirA: 170, ampacityGroundA: 155, resistance20COhmKm: 0.493, outerDiameterMm: 28.0, weightKgKm: 1390, standard: 'JIS C 3605' },
      { id: 'cbl-cvt-60', code: 'CVT-60', name: '600V CVT 60 mm²', material: 'COPPER', insulation: 'XLPE', ratedVoltage: '600 V', sizeMm2: 60, ampacityAirA: 215, ampacityGroundA: 195, resistance20COhmKm: 0.312, outerDiameterMm: 33.0, weightKgKm: 2120, standard: 'JIS C 3605' },
      { id: 'cbl-cvt-100', code: 'CVT-100', name: '600V CVT 100 mm²', material: 'COPPER', insulation: 'XLPE', ratedVoltage: '600 V', sizeMm2: 100, ampacityAirA: 295, ampacityGroundA: 260, resistance20COhmKm: 0.187, outerDiameterMm: 40.0, weightKgKm: 3450, standard: 'JIS C 3605' },
      { id: 'cbl-cvt-150', code: 'CVT-150', name: '600V CVT 150 mm²', material: 'COPPER', insulation: 'XLPE', ratedVoltage: '600 V', sizeMm2: 150, ampacityAirA: 370, ampacityGroundA: 320, resistance20COhmKm: 0.125, outerDiameterMm: 46.0, weightKgKm: 5040, standard: 'JIS C 3605' },
      { id: 'cbl-cvt-200', code: 'CVT-200', name: '600V CVT 200 mm²', material: 'COPPER', insulation: 'XLPE', ratedVoltage: '600 V', sizeMm2: 200, ampacityAirA: 440, ampacityGroundA: 375, resistance20COhmKm: 0.0935, outerDiameterMm: 52.0, weightKgKm: 6620, standard: 'JIS C 3605' },
      { id: 'cbl-cvt-250', code: 'CVT-250', name: '600V CVT 250 mm²', material: 'COPPER', insulation: 'XLPE', ratedVoltage: '600 V', sizeMm2: 250, ampacityAirA: 505, ampacityGroundA: 425, resistance20COhmKm: 0.0748, outerDiameterMm: 57.0, weightKgKm: 8150, standard: 'JIS C 3605' },
      { id: 'cbl-cvt-325', code: 'CVT-325', name: '600V CVT 325 mm²', material: 'COPPER', insulation: 'XLPE', ratedVoltage: '600 V', sizeMm2: 325, ampacityAirA: 585, ampacityGroundA: 485, resistance20COhmKm: 0.0575, outerDiameterMm: 63.0, weightKgKm: 10450, standard: 'JIS C 3605' },
      { id: 'cbl-pv1f-4', code: 'PV1-F-4', name: '1500V PV1-F 4 mm²', material: 'COPPER', insulation: 'XLPE', ratedVoltage: '1500 V DC', sizeMm2: 4, ampacityAirA: 55, ampacityGroundA: 50, resistance20COhmKm: 4.95, outerDiameterMm: 6.2, weightKgKm: 65, standard: 'EN 50618' },
      { id: 'cbl-pv1f-6', code: 'PV1-F-6', name: '1500V PV1-F 6 mm²', material: 'COPPER', insulation: 'XLPE', ratedVoltage: '1500 V DC', sizeMm2: 6, ampacityAirA: 70, ampacityGroundA: 62, resistance20COhmKm: 3.30, outerDiameterMm: 7.0, weightKgKm: 85, standard: 'EN 50618' },
      { id: 'cbl-6kv-cvt-38', code: '6kV-CVT-38', name: '6.6kV CVT 38 mm²', material: 'COPPER', insulation: 'XLPE', ratedVoltage: '6.6 kV', sizeMm2: 38, ampacityAirA: 155, ampacityGroundA: 145, resistance20COhmKm: 0.493, outerDiameterMm: 42.0, weightKgKm: 2150, standard: 'JIS C 3606' },
      { id: 'cbl-6kv-cvt-60', code: '6kV-CVT-60', name: '6.6kV CVT 60 mm²', material: 'COPPER', insulation: 'XLPE', ratedVoltage: '6.6 kV', sizeMm2: 60, ampacityAirA: 200, ampacityGroundA: 185, resistance20COhmKm: 0.312, outerDiameterMm: 47.0, weightKgKm: 2950, standard: 'JIS C 3606' },
      { id: 'cbl-6kv-cvt-100', code: '6kV-CVT-100', name: '6.6kV CVT 100 mm²', material: 'COPPER', insulation: 'XLPE', ratedVoltage: '6.6 kV', sizeMm2: 100, ampacityAirA: 275, ampacityGroundA: 250, resistance20COhmKm: 0.187, outerDiameterMm: 55.0, weightKgKm: 4450, standard: 'JIS C 3606' }
    ];
    list.forEach(c => this.cables.set(c.id, c));
  }

  private seedInitialPriceBook() {
    const list: PriceBookItem[] = [
      { id: 'pb-1', category: 'PV_MODULE', itemName: 'Trina Solar Vertex N 580W Bifacial', manufacturer: 'Trina Solar', modelOrSpec: 'TSM-580NE19R', unit: 'pcs', unitPriceJpy: 16500, leadTimeWeeks: 6, supplier: 'Trina Solar Japan KK', lastUpdated: '2026-03-01' },
      { id: 'pb-2', category: 'PV_MODULE', itemName: 'Jinko Solar Tiger Neo 585W', manufacturer: 'Jinko Solar', modelOrSpec: 'JKM585N-72HL4-BDV', unit: 'pcs', unitPriceJpy: 16800, leadTimeWeeks: 6, supplier: 'Jinko Solar Japan', lastUpdated: '2026-03-01' },
      { id: 'pb-3', category: 'PV_MODULE', itemName: 'LONGi Solar Hi-MO 7 585W', manufacturer: 'LONGi Solar', modelOrSpec: 'LR5-72HTH-585M', unit: 'pcs', unitPriceJpy: 16600, leadTimeWeeks: 5, supplier: 'LONGi Japan', lastUpdated: '2026-03-01' },
      { id: 'pb-pv-4', category: 'PV_MODULE', itemName: 'Canadian Solar BiHiKu7 585W', manufacturer: 'Canadian Solar', modelOrSpec: 'CS7N-585MB-AG', unit: 'pcs', unitPriceJpy: 16500, leadTimeWeeks: 5, supplier: 'Canadian Solar Japan', lastUpdated: '2026-03-01' },
      { id: 'pb-pv-5', category: 'PV_MODULE', itemName: 'JA Solar DeepBlue 4.0 Pro 580W', manufacturer: 'JA Solar', modelOrSpec: 'JAM72D40-580/GB', unit: 'pcs', unitPriceJpy: 16400, leadTimeWeeks: 6, supplier: 'JA Solar Japan', lastUpdated: '2026-03-01' },
      { id: 'pb-4', category: 'PCS_INVERTER', itemName: 'Huawei Smart String Inverter 100kW', manufacturer: 'Huawei', modelOrSpec: 'SUN2000-100KTL-M2', unit: 'pcs', unitPriceJpy: 2200000, leadTimeWeeks: 4, supplier: 'Huawei Technologies Japan', lastUpdated: '2026-03-01' },
      { id: 'pb-5', category: 'PCS_INVERTER', itemName: 'Huawei Smart String PCS 2000kW', manufacturer: 'Huawei', modelOrSpec: 'Smart String PCS 2000kW', unit: 'set', unitPriceJpy: 38000000, leadTimeWeeks: 12, supplier: 'Huawei Technologies Japan', lastUpdated: '2026-03-01' },
      { id: 'pb-6', category: 'PCS_INVERTER', itemName: 'Sungrow Utility Central PCS 2000kW', manufacturer: 'Sungrow', modelOrSpec: 'SC2000UD 2.0MW', unit: 'set', unitPriceJpy: 42000000, leadTimeWeeks: 14, supplier: 'Sungrow Japan', lastUpdated: '2026-03-01' },
      { id: 'pb-7', category: 'BESS', itemName: 'Huawei Smart String BESS Container 2.032 MWh', manufacturer: 'Huawei', modelOrSpec: 'LUNA2000-2.0MWH-2H1', unit: 'set', unitPriceJpy: 46000000, leadTimeWeeks: 16, supplier: 'Huawei Technologies Japan', lastUpdated: '2026-03-01' },
      { id: 'pb-bess-2', category: 'BESS', itemName: 'CATL EnerC 3.72 MWh Container', manufacturer: 'CATL', modelOrSpec: 'EnerC Plus 3.72MWh', unit: 'set', unitPriceJpy: 160000000, leadTimeWeeks: 16, supplier: 'CATL Japan', lastUpdated: '2026-03-01' },
      { id: 'pb-8', category: 'TRANSFORMER', itemName: 'Hitachi Step-up Transformer 500 kVA (6.6kV/400V)', manufacturer: 'Hitachi Energy', modelOrSpec: 'TR-500kVA-6.6kV', unit: 'set', unitPriceJpy: 5200000, leadTimeWeeks: 10, supplier: 'Hitachi Energy Japan', lastUpdated: '2026-03-01' },
      { id: 'pb-9', category: 'TRANSFORMER', itemName: 'Hitachi Step-up Transformer 2500 kVA (6.6kV/690V)', manufacturer: 'Hitachi Energy', modelOrSpec: 'TR-2500kVA-6.6kV', unit: 'set', unitPriceJpy: 15800000, leadTimeWeeks: 14, supplier: 'Hitachi Energy Japan', lastUpdated: '2026-03-01' },
      { id: 'pb-10', category: 'CABLE', itemName: 'DC Cable CVT 16 mm²', manufacturer: 'Sumitomo', modelOrSpec: '600V CVT 16 mm²', unit: 'm', unitPriceJpy: 1100, leadTimeWeeks: 2, supplier: 'Sumitomo Electric', lastUpdated: '2026-03-01' },
      { id: 'pb-11', category: 'CABLE', itemName: 'AC Cable CVT 150 mm²', manufacturer: 'Fujikura', modelOrSpec: '600V CVT 150 mm²', unit: 'm', unitPriceJpy: 5200, leadTimeWeeks: 2, supplier: 'Fujikura Cable', lastUpdated: '2026-03-01' },
      { id: 'pb-12', category: 'CABLE', itemName: 'AC Cable CVT 250 mm²', manufacturer: 'Fujikura', modelOrSpec: '600V CVT 250 mm²', unit: 'm', unitPriceJpy: 8500, leadTimeWeeks: 3, supplier: 'Fujikura Cable', lastUpdated: '2026-03-01' },
      { id: 'pb-13', category: 'CABLE', itemName: '6.6kV MV Cable CVT 38 mm²', manufacturer: 'Furukawa', modelOrSpec: '6.6kV CVT 38 mm²', unit: 'm', unitPriceJpy: 3400, leadTimeWeeks: 3, supplier: 'Furukawa Electric', lastUpdated: '2026-03-01' },
      { id: 'pb-14', category: 'SWITCHGEAR', itemName: '6.6kV High Voltage Switchgear Cubicle', manufacturer: 'Schneider / Fuji', modelOrSpec: 'VCB-6.6kV-630A', unit: 'lot', unitPriceJpy: 3397500, leadTimeWeeks: 10, supplier: 'Fuji Electric', lastUpdated: '2026-03-01' },
      { id: 'pb-15', category: 'LABOR', itemName: 'PV Rooftop Installation & Mounting Labor', manufacturer: 'EPC Partner', modelOrSpec: 'Standard Commercial EPC', unit: 'kWp', unitPriceJpy: 15000, leadTimeWeeks: 1, supplier: 'Regional EPC Network', lastUpdated: '2026-03-01' },
      { id: 'pb-16', category: 'ENGINEERING', itemName: 'Detailed Electrical Engineering & METI Filing', manufacturer: 'SOLNEXA Engineering', modelOrSpec: 'Standard Package', unit: 'project', unitPriceJpy: 1500000, leadTimeWeeks: 2, supplier: 'SOLNEXA Partners', lastUpdated: '2026-03-01' }
    ];
    list.forEach(item => this.priceBook.set(item.id, item));
  }

  public getDashboardStats() {
    const allModels = Array.from(this.models.values());
    const totalEquipment = allModels.filter(m => m.isApproved).length;
    const pendingReviews = allModels.filter(m => !m.isApproved).length;
    const datasheetsProcessed = this.datasheets.size;
    const manufacturersCount = this.manufacturers.size;

    const allProjects = Array.from(this.projects.values());
    const totalProjects = allProjects.length;
    const projectsInDesign = allProjects.filter(p => p.status === 'IN_DESIGN').length;
    const projectsQuotation = allProjects.filter(p => p.status === 'QUOTATION').length;
    const projectsCompleted = allProjects.filter(p => p.status === 'COMPLETED').length;

    // Categories breakdown
    const categoryCounts: Record<string, number> = {};
    allModels.forEach(m => {
      categoryCounts[m.categoryCode] = (categoryCounts[m.categoryCode] || 0) + 1;
    });

    // Recent datasheets
    const recentDatasheets = this.getDatasheets().slice(0, 5);

    // Recent projects
    const recentProjects = this.getProjects().slice(0, 5);

    return {
      totalProjects,
      projectsInDesign,
      projectsQuotation,
      projectsCompleted,
      totalEquipment,
      pendingReviews,
      datasheetsProcessed,
      manufacturersCount,
      categoryCounts,
      recentDatasheets,
      recentProjects
    };
  }
}

export const db = new RelationalDatabase();
