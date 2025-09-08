// Nový deterministický parser podle příkladů z kontrola-linku.txt
const KRAJ_MAPPINGS = {
  'praha': 1001,
  'středočeský': 1011,
  'jihočeský': 1003,
  'plzenský': 1010,
  'karlovarský': 1007,
  'ústecký': 1013,
  'liberecký': 1008,
  'královéhradecký': 1005,
  'pardubický': 1004,
  'vysočina': 1006,
  'jihomoravský': 2002,
  'olomoucký': 2009,
  'zlínský': 2014,
  'moravskoslezský': 2012
};

const OKRES_MAPPINGS = {
  'praha': [10013101, 10013102, 10013103, 10013104, 10013105, 10013106, 10013107, 10013108, 10013109, 10013110, 10013111, 10013112, 10013113, 10013114, 10013115, 10013116, 10013117, 10013118, 10013119, 10013120, 10013121, 10013122],
  'praha 2': 10013102,
  'praha 10': 10013110,
  'brno': 20023702,
  'olomouc': 20093805,
  'ostrava': 20123807,
  'liberec': 10083505,
  'plzen': 10103405
};

const FOREIGN_COUNTRIES = {
  'chorvatsko': 107,
  'slovensko': 122
};

function parseSearchQuery(query) {
  const lowerQuery = query.toLowerCase();
  const result = {
    transactionType: 'prodej', // default
    propertyType: 'byt', // default
    isForeign: false,
    locations: [],
    countries: [],
    priceRange: {},
    roomTypes: [],
    area: {},
    floor: {},
    subtypes: [],
    features: [],
    krajIds: [],
    okresIds: [],
    countryIds: [],
    stavId: null,
    vlastnictviId: null,
    postavenozId: null,
    stitekId: null
  };

  // 1. TRANSACTION TYPE - rozpoznávání typu transakce
  if (lowerQuery.includes('pronajem') || lowerQuery.includes('pronájem')) {
    result.transactionType = 'pronajem';
  }

  // 2. FOREIGN - zahraniční nemovitosti (PRIORITA!)
  for (const [country, countryId] of Object.entries(FOREIGN_COUNTRIES)) {
    if (lowerQuery.includes(country)) {
      result.isForeign = true;
      result.countries.push(country);
      result.countryIds.push(countryId);
      break; // První nalezená země
    }
  }

  // 3. PROPERTY TYPE - rozpoznávání typu nemovitosti (PRIORITA!)
  // POZEMKY - nejvyšší priorita
  if (lowerQuery.includes('stavební pozemek') || lowerQuery.includes('stavebni pozemek')) {
    result.propertyType = 'pozemek';
    result.subtypes = ['stavebni-bydleni'];
  }
  else if (lowerQuery.includes('zemědělský pozemek') || lowerQuery.includes('zemedelsky pozemek')) {
    result.propertyType = 'pozemek';
    result.subtypes = ['zemedelske-a-lesni'];
  }
  else if (lowerQuery.includes('zahrada') && !lowerQuery.includes('se zahradou')) {
    result.propertyType = 'pozemek';
    result.subtypes = ['zahrady'];
  }
  else if (lowerQuery.includes('pozemek') && !(lowerQuery.includes(' dům') || lowerQuery.includes(' dum') || lowerQuery.match(/^dum\b/))) {
    result.propertyType = 'pozemek';
    result.subtypes = ['stavebni-bydleni']; // default
  }
  // DOMY - vysoká priorita (dříve než garáže)
  else if (lowerQuery.includes('rodinný dům') || lowerQuery.includes('rodinny dum') || 
           (lowerQuery.includes(' dům') || lowerQuery.includes(' dum')) || 
           lowerQuery.match(/^dum\b/)) {
    result.propertyType = 'dum';
  }
  // KOMERČNÍ PROSTORY
  else if (lowerQuery.includes('kancelář') || lowerQuery.includes('kancelar')) {
    result.propertyType = 'komercni';
    result.subtypes = ['kancelarske-prostory'];
  }
  else if (lowerQuery.includes('obchod')) {
    result.propertyType = 'komercni';
    result.subtypes = ['prostory-pro-obchod'];
  }
  else if (lowerQuery.includes('sklad')) {
    result.propertyType = 'komercni';
    result.subtypes = ['prostory-pro-sklad'];
  }
  // OSTATNÍ NEMOVITOSTI
  else if (lowerQuery.includes('garáž') || lowerQuery.includes('garaz')) {
    result.propertyType = 'ostatni';
    result.subtypes = ['garaz'];
  }
  // BYTY - speciální případy
  else if (lowerQuery.includes('garsonka')) {
    result.propertyType = 'byt';
    result.roomTypes = ['1-kk'];
  }
  else if (lowerQuery.includes('atypický byt') || lowerQuery.includes('atypicky byt')) {
    result.propertyType = 'byt';
    // roomTypes zůstane prázdné pro "vsechny"
  }
  else {
    // Default: hledej room types pro byty
    result.propertyType = 'byt';
  }

  // 4. ROOM TYPES - rozpoznávání dispozic (pouze pro byty)
  if (result.propertyType === 'byt' && result.roomTypes.length === 0) {
    const roomPatterns = [
      { pattern: /1\+kk|1-kk/, type: '1-kk' },
      { pattern: /2\+kk|2-kk/, type: '2-kk' },
      { pattern: /3\+kk|3-kk/, type: '3-kk' },
      { pattern: /4\+kk|4-kk/, type: '4-kk' },
      { pattern: /5\+kk|5-kk/, type: '5-kk' },
      { pattern: /1\+1|1-1/, type: '1-1' },
      { pattern: /2\+1|2-1/, type: '2-1' },
      { pattern: /3\+1|3-1/, type: '3-1' },
      { pattern: /4\+1|4-1/, type: '4-1' },
      { pattern: /5\+1|5-1/, type: '5-1' }
    ];

    for (const room of roomPatterns) {
      if (room.pattern.test(lowerQuery)) {
        result.roomTypes.push(room.type);
      }
    }
  }

  // 5. LOCATIONS - rozpoznávání míst (specifické okresy první!)
  if (lowerQuery.includes('praha 10')) {
    result.locations.push('praha');
    result.okresIds.push(10013110);
  }
  else if (lowerQuery.includes('praha 2')) {
    result.locations.push('praha');
    result.okresIds.push(10013102);
  }
  else {
    for (const [location, okresId] of Object.entries(OKRES_MAPPINGS)) {
      if ((lowerQuery.includes(location) || (location === 'plzen' && lowerQuery.includes('plzeň'))) 
          && !location.includes('praha ')) {
        result.locations.push(location);
        if (Array.isArray(okresId)) {
          result.okresIds.push(...okresId);
        } else {
          result.okresIds.push(okresId);
        }
        break; // První nalezené město
      }
    }
  }

  // Kraje podle měst a krajů (vždy přidat!)
  if (result.locations.includes('praha') || lowerQuery.includes('praha') || lowerQuery.includes('praze')) {
    result.krajIds.push(1001);
  }
  if (result.locations.includes('brno') || lowerQuery.includes('brno')) {
    result.krajIds.push(2002);
  }
  if (result.locations.includes('olomouc') || lowerQuery.includes('olomouc')) {
    result.krajIds.push(2009);
  }
  if (result.locations.includes('ostrava') || lowerQuery.includes('ostrava')) {
    result.krajIds.push(2012);
  }
  if (result.locations.includes('liberec') || lowerQuery.includes('liberec')) {
    result.krajIds.push(1008);
  }
  if (result.locations.includes('plzen') || lowerQuery.includes('plzen') || lowerQuery.includes('plzeň')) {
    result.krajIds.push(1010);
  }
  
  // Obecné kraje
  for (const [krajName, krajId] of Object.entries(KRAJ_MAPPINGS)) {
    if (lowerQuery.includes(krajName)) {
      if (!result.krajIds.includes(krajId)) {
        result.krajIds.push(krajId);
      }
    }
  }

  // 6. PRICE RANGE a AREA - rozpoznávání cen a ploch
  // Area ranges první (specifičtější)
  const areaMatch1 = lowerQuery.match(/(\d+)-(\d+)\s*m2/);
  if (areaMatch1) {
    result.area.min = parseInt(areaMatch1[1]);
    result.area.max = parseInt(areaMatch1[2]);
  } else {
    const areaMatch2 = lowerQuery.match(/(\d+)\s*m2/);
    if (areaMatch2) {
      result.area.min = parseInt(areaMatch2[1]);
      result.area.max = parseInt(areaMatch2[1]);
    }
  }

  // Price patterns
  const priceMatch1 = lowerQuery.match(/do (\d+) mil/);
  if (priceMatch1) {
    result.priceRange.max = parseInt(priceMatch1[1]) * 1000000;
  } else {
    const priceMatch2 = lowerQuery.match(/do (\d+) tisíc/);
    if (priceMatch2) {
      result.priceRange.max = parseInt(priceMatch2[1]) * 1000;
    }
  }

  // 7. FLOOR - rozpoznávání pater
  const floorPatterns = [
    { pattern: /(\d+)-(\d+) patro/, hasRange: true },
    { pattern: /(\d+)\. patro/, hasRange: false },
    { pattern: /přízemí|prizemi/, floor: 0 }
  ];

  for (const floorPattern of floorPatterns) {
    const match = lowerQuery.match(floorPattern.pattern);
    if (match) {
      if (floorPattern.floor !== undefined) {
        result.floor.min = floorPattern.floor;
        result.floor.max = floorPattern.floor;
      } else if (floorPattern.hasRange) {
        result.floor.min = parseInt(match[1]);
        result.floor.max = parseInt(match[2]);
      } else {
        result.floor.min = parseInt(match[1]);
        result.floor.max = parseInt(match[1]);
      }
    }
  }

  // 8. FEATURES - rozpoznávání příslušenství
  const featurePatterns = [
    { pattern: /parkovištěm?|parkovistem?/, feature: 'parkoviste' },
    { pattern: /výtah|vytah/, feature: 'vytah' },
    { pattern: /sklep/, feature: 'sklep' },
    { pattern: /zařízeno|zarizeno/, feature: 'zarizeno' },
    { pattern: /bezbariérový|bezbarierovy/, feature: 'bezbarierovy' },
    { pattern: /novostavba/, feature: 'novostavba' }
  ];

  for (const feat of featurePatterns) {
    if (feat.pattern.test(lowerQuery)) {
      result.features.push(feat.feature);
    }
  }

  // 9. SPECIAL ATTRIBUTES
  if (lowerQuery.includes('výborný stav')) {
    result.stavId = 1;
  }
  if (lowerQuery.includes('družstevní')) {
    result.vlastnictviId = 2;
  }
  if (lowerQuery.includes('cihlový') || lowerQuery.includes('cihla')) {
    result.postavenozId = 1;
  }
  if (lowerQuery.includes('panel')) {
    result.postavenozId = 2;
  }
  if (lowerQuery.includes('štítek a') || lowerQuery.includes('stitek a')) {
    result.stitekId = 1;
  }

  return result;
}

module.exports = { parseSearchQuery };