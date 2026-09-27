import { generatePersonaBase } from "@/lib/personas/generator";
import { stratifiedSample, countBy } from "@/lib/personas/sampling";
import { DEFAULT_PERSONA_CONFIG } from "@/lib/personas/config";

const base = generatePersonaBase(DEFAULT_PERSONA_CONFIG);
console.log("base:", base.length, countBy(base, (p) => p.demographics.profession));
console.log("age:", countBy(base, (p) => p.demographics.ageBand));
const avg = (xs: number[]) => (xs.reduce((a, b) => a + b, 0) / xs.length).toFixed(2);
for (const band of ["18-24", "25-39", "40-59", "60+"]) {
  const g = base.filter((p) => p.demographics.ageBand === band);
  console.log(band, "literacy", avg(g.map((p) => p.demographics.digitalLiteracy)));
}
const s = stratifiedSample(base, 30, 42);
console.log("sample:", s.length, countBy(s, (p) => p.demographics.profession));
console.log(JSON.stringify(base[0], null, 1));
