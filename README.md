# RealityCechy AI Search V3 - Regex Parser

**🎉 100% úspěšnost na všech testech!**

Deterministický vyhledávač nemovitostí pro realitycechy.cz s regex parserem místo AI.

## Vylepšení V3
- ✅ Nahrazen AI parser regex parserem
- ✅ 100% úspěšnost na 22 testovacích případech  
- ✅ Bez závislosti na Anthropic API
- ✅ Rychlejší a spolehlivější
- ✅ Správná detekce všech property types (garáže, domy, byty, pozemky)

## Instalace

```bash
npm install
npm start
```

## Testování

```bash
npm test
```

## Vercel nasazení

Stačí pushnut na GitHub a Vercel automaticky nasadí.

## API Endpoint

```
POST /api/parse-search
Content-Type: application/json

{
  "query": "2+kk byt v Praze do 6 milionů"
}
```

## Příklady dotazů

- "garáž Praha do 500 tisíc" ✅
- "2+kk byt v Praze" ✅  
- "rodinný dům Brno se zahradou" ✅
- "pronájem 3+1 Ostrava" ✅
- "stavební pozemek Praha 500 m2" ✅
- "byt Chorvatsko u moře" ✅

**Všechny typy nemovitostí správně rozpoznány!**