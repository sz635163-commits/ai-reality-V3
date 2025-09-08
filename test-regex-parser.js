// Test nového regex parseru s reálnými dotazy z kontrola-linku.txt
const { parseSearchQuery } = require('./regex-parser');
const { buildUrl } = require('./url-builder');

const realneDotyazy = [
  // Test podle přesných dotazů z kontrola-linku.txt
  {
    cislo: 1,
    dotaz: "2+kk byt v Praze do 6 milionů",
    expectedPath: "/nemovitosti/prodej-bytu/2-kk/",
    mustContain: ["kraje_id[0]=1001", "cenado=6+000+000", "okres_id="]
  },

  {
    cislo: 2, 
    dotaz: "pronájem 3+1 Brno s balkonem do 25 tisíc",
    expectedPath: "/nemovitosti/pronajem-bytu/okres-brno-mesto/brno/3-1/",
    mustContain: ["kraje_id[0]=2002", "cenado=25+000", "okres_id=20023702"]
  },

  {
    cislo: 3,
    dotaz: "1+kk Praha 2 novostavba s parkovištěm",
    expectedPath: "/nemovitosti/prodej-bytu/1-kk/",
    mustContain: ["okresy_id[0]=10013102", "kraje_id[0]=1001", "prislusenstvi[0]=parkoviste"]
  },

  {
    cislo: 4,
    dotaz: "garsonka Olomouc s výtahem do 3 mil",
    expectedPath: "/nemovitosti/prodej-bytu/1-kk/",
    mustContain: ["okresy_id[0]=20093805", "kraje_id[0]=2009", "cenado=3+000+000", "prislusenstvi[0]=vytah"]
  },

  {
    cislo: 5,
    dotaz: "4+kk 2-5 patro Praha s terasou a sklepem cihlový",
    expectedPath: "/nemovitosti/prodej-bytu/4-kk/",
    mustContain: ["postavenoz[0]=1", "prislusenstvi[0]=sklep", "patrood=2", "patrodo=5"]
  },

  {
    cislo: 6,
    dotaz: "pronájem 2+1 Ostrava zařízeno bezbariérový",
    expectedPath: "/nemovitosti/pronajem-bytu/okres-ostrava/ostrava/2-1/",
    mustContain: ["kraje_id[0]=2012", "prislusenstvi[0]=zarizeno", "prislusenstvi[1]=bezbarierovy", "okres_id=20123807"]
  },

  {
    cislo: 7,
    dotaz: "3+kk výborný stav Praha centrum 80-120 m2",
    expectedPath: "/nemovitosti/prodej-bytu/3-kk/",
    mustContain: ["kraje_id[0]=1001", "stav[0]=1", "plochaod=80", "plochado=120"]
  },

  {
    cislo: 8,
    dotaz: "rodinný dům Brno se zahradou do 8 mil",
    expectedPath: "/nemovitosti/prodej-domu/okres-brno-mesto/brno/rodinny-dum/",
    mustContain: ["kraje_id[0]=2002", "cenado=8+000+000", "okres_id=20023702"]
  },

  {
    cislo: 9,
    dotaz: "pronájem dům Liberec s garáží",
    expectedPath: "/nemovitosti/pronajem-domu/rodinny-dum/",
    mustContain: ["okresy_id[0]=10083505", "kraje_id[0]=1008", "okres_id="]
  },

  {
    cislo: 10,
    dotaz: "dum po rekonstrukci Plzeň vlastní pozemek",
    expectedPath: "/nemovitosti/prodej-domu/rodinny-dum/",
    mustContain: ["okresy_id[0]=10103405", "kraje_id[0]=1010", "okres_id="]
  },

  {
    cislo: 11,
    dotaz: "stavební pozemek Praha 500-1000 m2",
    expectedPath: "/nemovitosti/prodej-pozemku/stavebni-bydleni/",
    mustContain: ["kraje_id[0]=1001", "plochaod=500", "plochado=1000"]
  },

  {
    cislo: 12,
    dotaz: "zahrada Olomoucký kraj do 500 tisíc",
    expectedPath: "/nemovitosti/prodej-pozemku/zahrady/",
    mustContain: ["kraje_id[0]=2009", "cenado=500+000"]
  },

  {
    cislo: 13,
    dotaz: "zemědělský pozemek 2000 m2 Jihomoravský kraj",
    expectedPath: "/nemovitosti/prodej-pozemku/zemedelske-a-lesni/",
    mustContain: ["kraje_id[0]=2002", "plochaod=2000"]
  },

  {
    cislo: 14,
    dotaz: "kancelář Praha centrum 50-100 m2",
    expectedPath: "/nemovitosti/prodej-komercnich-prostor/kancelarske-prostory/",
    mustContain: ["okresy_id[0]=10013101", "kraje_id[0]=1001", "plochaod=50", "plochado=100"]
  },

  {
    cislo: 15,
    dotaz: "obchod přízemí Brno s parkovištěm",
    expectedPath: "/nemovitosti/prodej-komercnich-prostor/prostory-pro-obchod/",
    mustContain: ["okresy_id[0]=20023702", "kraje_id[0]=2002", "patrood=0"]
  },

  {
    cislo: 16,
    dotaz: "sklad Ostrava 200 m2",
    expectedPath: "/nemovitosti/prodej-komercnich-prostor/prostory-pro-sklad/",
    mustContain: ["okresy_id[0]=20123807", "kraje_id[0]=2012", "plochaod=200"]
  },

  {
    cislo: 17,
    dotaz: "garáž Praha do 500 tisíc",
    expectedPath: "/nemovitosti/prodej-ostatni/garaz/",
    mustContain: ["kraje_id[0]=1001", "cenado=500+000", "okres_id="]
  },

  {
    cislo: 18,
    dotaz: "byt Chorvatsko u moře do 200 tisíc eur",
    expectedPath: "/nemovitosti/prodej-zahranicni/1-1,1-kk,2-1,2-kk,3-1,3-kk,4-1,4-kk,5-1-nebo-vetsi,5-kk/",
    mustContain: ["stat[0]=107", "cenado=200+000"]
  },

  {
    cislo: 19,
    dotaz: "dům Slovensko",
    expectedPath: "/nemovitosti/prodej-zahranicni/",
    mustContain: ["stat[0]=122"]
  },

  {
    cislo: 20,
    dotaz: "atypický byt Praha s lodžií",
    expectedPath: "/nemovitosti/prodej-bytu/vsechny/",
    mustContain: ["kraje_id[0]=1001", "okres_id="]
  },

  {
    cislo: 21,
    dotaz: "5+kk družstevní Praha energetický štítek A",
    expectedPath: "/nemovitosti/prodej-bytu/5-kk/",
    mustContain: ["kraje_id[0]=1001", "vlastnictvi[0]=2", "stitek[0]=1"]
  },

  {
    cislo: 22,
    dotaz: "panel 3+1 Praha 10 1. patro",
    expectedPath: "/nemovitosti/prodej-bytu/3-1/",
    mustContain: ["okresy_id[0]=10013110", "kraje_id[0]=1001", "postavenoz[0]=2", "patrood=1"]
  }
];

function testRegexParser() {
  console.log('🔍 Testování nového REGEX parseru s reálnými dotazy...\n');
  
  let passed = 0;
  let total = realneDotyazy.length;
  
  for (let i = 0; i < realneDotyazy.length; i++) {
    const testCase = realneDotyazy[i];
    console.log(`Test ${testCase.cislo}: ${testCase.dotaz}`);
    
    try {
      // 1. Parse dotazu
      const parsedParams = parseSearchQuery(testCase.dotaz);
      console.log(`  Parsed: propertyType="${parsedParams.propertyType}", roomTypes=[${parsedParams.roomTypes.join(',')}], subtypes=[${parsedParams.subtypes.join(',')}]`);
      
      // 2. Build URL
      const result = buildUrl(parsedParams);
      const url = new URL(result);
      const resultPath = url.pathname;
      const resultQuery = url.search.substring(1);
      
      let testPassed = true;
      let errors = [];
      
      // Kontrola path
      if (!resultPath.includes(testCase.expectedPath.replace(/\/$/, ''))) {
        testPassed = false;
        errors.push(`❌ Path: očekáváno '${testCase.expectedPath}', dostáno '${resultPath}'`);
      }
      
      // Kontrola parametrů
      testCase.mustContain.forEach(expectedParam => {
        if (!resultQuery.includes(expectedParam)) {
          testPassed = false;
          errors.push(`❌ Chybí: ${expectedParam}`);
        }
      });
      
      if (testPassed) {
        console.log('  ✅ PASSED');
        passed++;
      } else {
        console.log('  ❌ FAILED');
        errors.forEach(error => console.log(`    ${error}`));
      }
      
      console.log(`  URL: ${result}`);
      console.log('  ---');
      
    } catch (error) {
      console.log(`  ❌ ERROR: ${error.message}`);
      console.log('  ---');
    }
  }
  
  console.log(`\n📊 REGEX PARSER VÝSLEDKY: ${passed}/${total} passed (${Math.round(passed/total*100)}%)`);
  
  if (passed === total) {
    console.log('🎉 VŠECHNY TESTY S REGEX PARSEREM PROŠLY!');
  } else {
    console.log(`⚠️  ${total - passed} testů selhalo - potřebujeme další úpravy`);
    console.log('\n🔧 Selhané testy ukazují, kde potřebujeme zlepšit regex parser.');
  }
}

testRegexParser();