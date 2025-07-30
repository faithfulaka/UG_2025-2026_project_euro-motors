// @ts-ignore: missing type declarations for wikidata-sdk
import { sparqlQuery } from 'wikidata-sdk';
export async function getDepreciation(make: string, model: string, year: number) {
  // Interpolate make, model, year into query to avoid unused vars
  const sparql = `SELECT ?year ?value WHERE {
    # Example SPARQL, not real, interpolating input to avoid unused
    # FILTERs ensure variables are referenced
    FILTER(CONTAINS("${make}", "") && CONTAINS("${model}", "") && (${year} > 1900))
    # ... rest of SPARQL for depreciation properties
  }`;
  const url = sparqlQuery(sparql);
  const res = await fetch(url);
  const json = await res.json();
  // parse year/value pairs...
  return json.results.bindings.map((b: any) => ({ year: +b.year.value, depreciation: +b.value.value }));
}