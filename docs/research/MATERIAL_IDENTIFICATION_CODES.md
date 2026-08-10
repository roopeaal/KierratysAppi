# Packaging material identification codes

Accessed: 2026-08-10.

## Authoritative source

- European Commission Decision 97/129/EC, consolidated official text: <https://eur-lex.europa.eu/eli/dec/1997/129/oj/eng>

The decision establishes a voluntary numbering and abbreviation system for packaging materials. Its annexes define exact identifiers for plastics, paper/fibreboard, metals, wood, textiles, glass, and composites.

## Implemented scope

The local parser recognizes only exact entries represented in the annexes: PET 1, HDPE 2, PVC 3, LDPE 4, PP 5, PS 6; PAP 20–22; FE 40; ALU 41; FOR 50–51; COT 60; TEX 61; and GL 70–72. Leading-zero and number-first printed variants normalize to the same identifier.

An explicit `C/…` mark is recognized only as the composite material group. Its number does not infer a dominant material or Finnish collection destination. Undefined numbers, unknown abbreviations, multiple known codes, and abbreviation/number conflicts stay unknown or ambiguous.

## Product consequence

The user types one visible code and must confirm that it appears on the package before the material family reaches the sorting engine. The code, source jurisdiction, decision version, checked date, inference confidence, and user-confirmed provenance remain attached to the result. No photo, OCR, upload, or AI service participates in this flow.

Material identification does not by itself establish that an item is packaging, its shape, Finnish deposit eligibility, hazardous residue, emptiness, or local collection eligibility. Existing sorting rules may therefore return a question or safe unknown after a code is recognized.
