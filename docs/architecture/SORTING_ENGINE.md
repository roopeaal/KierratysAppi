# Sorting-engine specification

## Inputs

- jurisdiction: country and optional region/municipality;
- component observation: packaging status, material family/code, shape, deposit status, detachable relationship, cleanliness/hazard/pressure conditions;
- evaluation date and requested language;
- provenance/confidence for every observation.

## Rule shape

Each immutable rule includes ID/version, jurisdiction, effective dates, match predicates, priority, destination, preparation, exceptions, explanatory reason, source name/URL, source checked date, and editorial verification.

## Evaluation

1. Reject unsupported jurisdiction or non-packaging assumptions safely.
2. Select only effective jurisdiction-matching rules.
3. Evaluate deposit rules before material collection.
4. If bottle/can deposit status is unknown, return `ambiguous` with an inspection question.
5. Apply the most specific deterministic rule; if equally specific rules conflict, return alternatives rather than choosing silently.
6. Overall confidence cannot exceed the least trustworthy decisive observation even when the policy rule is verified.
7. Return a machine-readable trace naming matched predicates and rejected higher-priority branches.

## Typed material-code boundary

Decision 97/129/EC identifiers are parsed locally before engine evaluation. Exact code-to-family mappings use scheme-derived `inferred` provenance; the visible code and packaging status use separate `user_confirmed` provenance only after explicit confirmation. Unknown/conflicting identifiers never enter the engine. A composite enters as `composite` and remains unknown until a reviewed Finnish composite rule exists.

## Seed rule version

`fi-rinki-2026-08-10.1` covers only source-reviewed plastic, carton, glass, metal, and known deposit packaging. Every result retains the rule source and checked date. Unsupported composites/materials are unknown.
