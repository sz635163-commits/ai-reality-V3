// Refaktorovaný URL Builder podle dokumentace realitycechy.cz

function buildUrl(parsedParams) {
  const baseUrl = 'https://www.realitycechy.cz';
  
  // Zjistit typ nemovitosti a zvolít odpovídající builder
  if (parsedParams.isForeign) {
    return buildForeignUrl(parsedParams);
  }
  
  switch (parsedParams.propertyType) {
    case 'byt':
      return buildApartmentUrl(parsedParams);
    case 'dum':
      return buildHouseUrl(parsedParams);
    case 'pozemek':
      return buildLandUrl(parsedParams);
    case 'komercni':
      return buildCommercialUrl(parsedParams);
    case 'ostatni':
      return buildOtherUrl(parsedParams);
    default:
      return buildApartmentUrl(parsedParams); // default fallback
  }
}

// Builder pro byty - podle vzorů z kontrola-linku.txt
function buildApartmentUrl(parsedParams) {
  const baseUrl = 'https://www.realitycechy.cz';
  let path = '/nemovitosti';
  let queryParams = [];

  // Path struktura pro byty
  if (parsedParams.transactionType === 'prodej') {
    path += '/prodej-bytu';
  } else if (parsedParams.transactionType === 'pronajem') {
    path += '/pronajem-bytu';
  } else {
    path += '/prodej,drazba-bytu';
  }

  // Pro PRONÁJEM: okres + město v path (příklady 2, 6)
  if (parsedParams.transactionType === 'pronajem') {
    if (parsedParams.locations && parsedParams.locations.length > 0) {
      const okresName = getOkresNameForPath(parsedParams.locations[0]);
      if (okresName) {
        path += '/' + okresName;
      }
      path += '/' + parsedParams.locations[0];
    }
  }

  // Room types - VŽDY konkrétní typ, nikdy "vsechny"
  if (parsedParams.roomTypes && parsedParams.roomTypes.length > 0) {
    path += '/' + parsedParams.roomTypes.join(',');
  } else {
    // Pouze pro atypické byty (příklad 20)
    path += '/vsechny';
  }

  // Query parametry
  addCommonQueryParams(parsedParams, queryParams);
  addApartmentSpecificParams(parsedParams, queryParams);

  return finalizeUrl(baseUrl, path, queryParams);
}

// Builder pro domy - podle vzorů z kontrola-linku.txt  
function buildHouseUrl(parsedParams) {
  const baseUrl = 'https://www.realitycechy.cz';
  let path = '/nemovitosti';
  let queryParams = [];

  // Path struktura pro domy
  if (parsedParams.transactionType === 'prodej') {
    path += '/prodej-domu';
  } else if (parsedParams.transactionType === 'pronajem') {
    path += '/pronajem-domu';
  } else {
    path += '/prodej,drazba-domu';
  }

  // Pro PRODEJ domů: pouze u Brna okres v path (příklad 8)
  if (parsedParams.transactionType === 'prodej' && parsedParams.locations && parsedParams.locations.includes('brno')) {
    if (parsedParams.locations.length > 0) {
      const okresName = getOkresNameForPath(parsedParams.locations[0]);
      if (okresName) {
        path += '/' + okresName;
      }
      path += '/' + parsedParams.locations[0];
    }
  }

  // Pro PRONÁJEM domů: pouze typ (příklad 9)
  // Pro všechny domy: vždy "rodinny-dum"
  path += '/rodinny-dum';

  addCommonQueryParams(parsedParams, queryParams);
  addApartmentSpecificParams(parsedParams, queryParams);

  return finalizeUrl(baseUrl, path, queryParams);
}

// Builder pro pozemky - podle vzorů z kontrola-linku.txt
function buildLandUrl(parsedParams) {
  const baseUrl = 'https://www.realitycechy.cz';
  let path = '/nemovitosti';
  let queryParams = [];

  // Path struktura pro pozemky (příklady 11, 12, 13)
  path += '/prodej-pozemku';

  // Povinné podtypy pozemků v path
  if (parsedParams.subtypes && parsedParams.subtypes.length > 0) {
    path += '/' + parsedParams.subtypes.join(',');
  } else {
    // Default podle typu dotazu
    path += '/stavebni-bydleni';
  }

  addCommonQueryParams(parsedParams, queryParams);
  addLandSpecificParams(parsedParams, queryParams);

  return finalizeUrl(baseUrl, path, queryParams);
}

// Builder pro komerční prostory - podle vzorů z kontrola-linku.txt
function buildCommercialUrl(parsedParams) {
  const baseUrl = 'https://www.realitycechy.cz';
  let path = '/nemovitosti';
  let queryParams = [];

  // Path struktura pro komerční prostory (příklady 14, 15, 16)
  path += '/prodej-komercnich-prostor';

  // Povinné podtypy komerčních prostor v path
  if (parsedParams.subtypes && parsedParams.subtypes.length > 0) {
    path += '/' + parsedParams.subtypes.join(',');
  } else {
    // Default
    path += '/kancelarske-prostory';
  }

  addCommonQueryParams(parsedParams, queryParams);
  addApartmentSpecificParams(parsedParams, queryParams);

  return finalizeUrl(baseUrl, path, queryParams);
}

// Builder pro ostatní nemovitosti - podle vzorů z kontrola-linku.txt
function buildOtherUrl(parsedParams) {
  const baseUrl = 'https://www.realitycechy.cz';
  let path = '/nemovitosti';
  let queryParams = [];

  // Path struktura pro ostatní nemovitosti (příklad 17)
  path += '/prodej-ostatni';

  // Povinné podtypy ostatních nemovitostí v path
  if (parsedParams.subtypes && parsedParams.subtypes.length > 0) {
    path += '/' + parsedParams.subtypes.join(',');
  } else {
    // Default
    path += '/garaz';
  }

  addCommonQueryParams(parsedParams, queryParams);
  addLandSpecificParams(parsedParams, queryParams);

  return finalizeUrl(baseUrl, path, queryParams);
}

// Builder pro zahraniční nemovitosti
function buildForeignUrl(parsedParams) {
  const baseUrl = 'https://www.realitycechy.cz';
  let path = '/nemovitosti/prodej-zahranicni';
  let queryParams = [];

  // Pro zahraniční nemovitosti podle příkladů 18, 19
  if (parsedParams.propertyType === 'byt' && parsedParams.roomTypes && parsedParams.roomTypes.length > 0) {
    // Pokud je specifikován typ bytu, použij pouze tento typ (příklad 18)
    path += '/' + parsedParams.roomTypes.join(',');
  } else if (parsedParams.propertyType === 'byt') {
    // Pro byty obecně (příklad 18)
    path += '/1-1,1-kk,2-1,2-kk,3-1,3-kk,4-1,4-kk,5-1-nebo-vetsi,5-kk';
  } else {
    // Pro ostatní typy nemovitostí nebo nespecifikované (příklad 19)
    // Prázdná path znamená všechny typy
  }

  // Přidat zahraniční státy
  if (parsedParams.countryIds && parsedParams.countryIds.length > 0) {
    parsedParams.countryIds.forEach((countryId, index) => {
      queryParams.push(`stat[${index}]=${countryId}`);
    });
  }

  addForeignSpecificParams(parsedParams, queryParams);

  return finalizeUrl(baseUrl, path, queryParams);
}

// Helper funkce
function getOkresNameForPath(location) {
  // Mapování lokací na okres names pro path (podle tvých příkladů)
  const okresPathMapping = {
    'brno': 'okres-brno-mesto',
    'ostrava': 'okres-ostrava',
    'plzen': 'okres-plzen-mesto',
    'liberec': 'okres-liberec',
    // Další města podle potřeby
  };
  
  return okresPathMapping[location.toLowerCase()] || null;
}

function getOkresNamesForPath(locations) {
  // Starší funkce - zachováváme pro kompatibilitu
  return [];
}

function addCommonQueryParams(parsedParams, queryParams) {
  // Kraje ID
  if (parsedParams.krajIds && parsedParams.krajIds.length > 0) {
    parsedParams.krajIds.forEach((krajId, index) => {
      queryParams.push(`kraje_id[${index}]=${krajId}`);
    });
  }

  // Cena
  if (parsedParams.priceRange) {
    if (parsedParams.priceRange.min) {
      queryParams.push(`cenaod=${parsedParams.priceRange.min.toLocaleString('cs-CZ').replace(/\s/g, '+')}`);
    }
    if (parsedParams.priceRange.max) {
      queryParams.push(`cenado=${parsedParams.priceRange.max.toLocaleString('cs-CZ').replace(/\s/g, '+')}`);
    }
  }

  // Plocha
  if (parsedParams.area) {
    if (parsedParams.area.min) {
      queryParams.push(`plochaod=${parsedParams.area.min}`);
    }
    if (parsedParams.area.max) {
      queryParams.push(`plochado=${parsedParams.area.max}`);
    }
  }

  // Stav nemovitosti
  if (parsedParams.stavId) {
    queryParams.push(`stav[0]=${parsedParams.stavId}`);
  }

  // Vlastnictví
  if (parsedParams.vlastnictviId) {
    queryParams.push(`vlastnictvi[0]=${parsedParams.vlastnictviId}`);
  }

  // Materiál stavby
  if (parsedParams.postavenozId) {
    queryParams.push(`postavenoz[0]=${parsedParams.postavenozId}`);
  }

  // Energetický štítek
  if (parsedParams.stitekId) {
    queryParams.push(`stitek[0]=${parsedParams.stitekId}`);
  }

  // Místo parametr (podle tvých příkladů)
  if (parsedParams.locations && parsedParams.locations.length > 0) {
    queryParams.push(`misto=${parsedParams.locations[0]}`);
  }

  // Základní parametry
  queryParams.push('stari_nabidky=vse');
}

function addApartmentSpecificParams(parsedParams, queryParams) {
  // Okresy ID - podle tvých příkladů používáš okresy_id[] pro většinu případů
  if (parsedParams.okresIds && parsedParams.okresIds.length > 0) {
    parsedParams.okresIds.forEach((okresId, index) => {
      queryParams.push(`okresy_id[${index}]=${okresId}`);
    });
  }
  
  // okres_id parametr - podle tvých příkladů:
  // - pro pronájem má konkrétní hodnotu
  // - pro domy (prodej) také má konkrétní hodnotu (příklad 8)
  // - pro byty (prodej) je prázdný
  if ((parsedParams.transactionType === 'pronajem' || parsedParams.propertyType === 'dum') 
      && parsedParams.okresIds && parsedParams.okresIds.length > 0) {
    queryParams.push(`okres_id=${parsedParams.okresIds[0]}`);
  } else {
    queryParams.push('okres_id=');
  }

  // Příslušenství pro byty/domy
  if (parsedParams.features && parsedParams.features.length > 0) {
    let prislusenstviIndex = 0;
    
    parsedParams.features.forEach(feature => {
      const featureLower = feature.toLowerCase();
      
      if (featureLower === 'parkoviste') {
        queryParams.push(`prislusenstvi[${prislusenstviIndex}]=parkoviste`);
        prislusenstviIndex++;
      } else if (featureLower === 'zarizeno') {
        queryParams.push(`prislusenstvi[${prislusenstviIndex}]=zarizeno`);
        prislusenstviIndex++;
      } else if (featureLower === 'vytah') {
        queryParams.push(`prislusenstvi[${prislusenstviIndex}]=vytah`);
        prislusenstviIndex++;
      } else if (featureLower === 'sklep') {
        queryParams.push(`prislusenstvi[${prislusenstviIndex}]=sklep`);
        prislusenstviIndex++;
      } else if (featureLower === 'bezbarierovy') {
        queryParams.push(`prislusenstvi[${prislusenstviIndex}]=bezbarierovy`);
        prislusenstviIndex++;
      }
    });
  }

  // Patro pro byty/domy/komerční
  if (parsedParams.floor) {
    if (parsedParams.floor.min !== undefined) {
      queryParams.push(`patrood=${parsedParams.floor.min}`);
    }
    if (parsedParams.floor.max !== undefined) {
      queryParams.push(`patrodo=${parsedParams.floor.max}`);
    }
  }
}

function addLandSpecificParams(parsedParams, queryParams) {
  // Okresy ID (plural pro pozemky/ostatní)
  if (parsedParams.okresIds && parsedParams.okresIds.length > 0) {
    parsedParams.okresIds.forEach((okresId, index) => {
      queryParams.push(`okresy_id[${index}]=${okresId}`);
    });
  }
  
  // Pro pozemky a ostatní je okres_id prázdný
  queryParams.push('okres_id=');
}

function addForeignSpecificParams(parsedParams, queryParams) {
  // Parametry specifické pro zahraniční nemovitosti
  addCommonQueryParams(parsedParams, queryParams);
  
  // Bez okresů, pouze státy
}

function finalizeUrl(baseUrl, path, queryParams) {
  let finalUrl = baseUrl + path;
  
  if (queryParams.length > 0) {
    finalUrl += '/?' + queryParams.join('&');
  }

  return finalUrl;
}

module.exports = { buildUrl };