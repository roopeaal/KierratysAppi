# Release artifact representation checks —2026-11-10

Primary source, accessed2026-11-10:
[Apple CoreML Model.proto](https://raw.githubusercontent.com/apple/coremltools/main/mlmodel/format/Model.proto).
The Metadata definition declares user-defined information as a string-to-string
map at field100. This supports comparing those informational entries by value,
not ignoring arbitrary compiled model bytes.

## Actual native representation

An initial client10 checker wrongly requires two contiguous raw strings. Shipping
code constructs its timeout code from a prefix and uppercased typed reason.
Swift Release stores the15-byte V4 version as SmallString ARM64 immediates.
Prove the exact V4 value/store inside the actual linked specialized perform
function, rather than inserting a string into the app to satisfy a scanner.
Pin3 unchanged native sources, require3 exact linked Release archive objects,
8 engine/readiness/watchdog/delivery/module symbol checks and the dynamic prefix.
The two words decode to `local-vision-v4` plus the0xef SmallString discriminator;
another function, different version or incomplete/clobbered construction rejects.

## Exact compiled metadata permutation, no new model

All13 resource names/23,378,043bytes remain. Graph/weights/analytics/prototypes/
source bins/four full notices are byte-exact. JSON metadata objects are entirely
equal, only object-key serialization order differs. The382-byte core metadata
differs only by permutation of these same3 known field100 records:

- `com.github.apple.coremltools.source` → `torch==1.13.0`
- `com.github.apple.coremltools.version` → `7.1`
- `com.github.apple.coremltools.source_dialect` → `TorchScript`

Require pinned old client9 reference hashes; all3 complete encoded entries must
occur once, contiguous at bytes204–365. Entire preceding204 and following16
bytes remain identical. Canonically order only these records and require whole
file equality. Reject other changes/extra/duplicate fields/values/header/footer,
not a generic protobuf normalization or tolerated drift. JSON comparison retains
all types/arrays/fields and rejects duplicate keys/noncanonical tokens.

Root independently completes this exact permutation proof before replacement
install; a later aggregate check repeats it.33 positive/negative synthetic checks
cover both native proof and metadata, including all6 permutations. Both original
failed checker receipts remain; no app/model/source/prompt/gate was changed and
no image inference or frozen experiment rerun was used to repair the checker.

Actual new compiled iOS tree SHA256:
`3dc20cc27b6d593bae31b0b14d184cfca9b0108d56dca6f68802cb5bc0d026cc`.
It is not claimed byte-identical to the old metadata tree. Full old/new hashes,
private verifier and independent proof are retained under the integration
receipt root in `docs/final/TEAM_MAIN_INTEGRATION_AND_CLIENT10.md`.
Integrity/provenance and installation are not camera-quality acceptance.
