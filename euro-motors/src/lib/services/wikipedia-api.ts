// src/lib/services/wikipedia-api.ts
// @ts-ignore: No types available for 'wikidata-sdk'
import { sparqlQuery } from 'wikidata-sdk';
import fetch from 'node-fetch';

export interface DepreciationEntry {
  year: number;
  depreciation: number;
}

export async function getDepreciation(
  make: string,
  model: string,
  year: number
): Promise<DepreciationEntry[]> {
  const entity = `${make} ${model}`;
  const sparql = `
    SELECT ?year ?value WHERE {
      ?item wdt:P31 wd:Q3231690;
            rdfs:label "${entity}"@en;
            wdt:P571 ?inception;
            wdt:P2130 ?value.
      BIND(YEAR(?inception) AS ?year)
    }
    ORDER BY DESC(?year)
  `;

  const url = sparqlQuery(sparql);
  const res = await fetch(url);
  const json = await res.json();

  const results = json?.results?.bindings || [];
  return results.map((entry: any) => ({
    year: Number(entry.year.value),
    depreciation: Number(entry.value.value),
  }));
}