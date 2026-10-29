# Home and navigation symbols

These are original repository-native vector drawings authored for this Home
refinement on 2026-10-28. The owner-supplied screen informed color, scale and
ordinary camera/location/recycling/home metaphors; no downloaded icon path,
third-party icon set, emoji, brand mark, product image or generated bitmap was
copied. The existing leaf logo is unchanged.

Continued and integrated October 29. Recycling was refined into three separate
bent arrows with a transparent triangular center. All SVGs have source titles;
the native PNG-consuming components hide decorative images. The reviewed
export/check toolchain is sharp 0.35.5 and libvips 8.18.7. No image-generation
service or paid app-recognition request was used for these code-native symbols.

`home-camera`, `home-location`, `home-recycling` and `tab-home` are softly shaded
filled symbols. `tab-location`, `tab-scan` and `tab-settings` are slate outlines.
Every source uses a 64×64 viewBox; checked-in PNG exports are 192×192 RGBA (3×),
with transparent canvases and no text or card background. The settings symbol
uses three white slider centers as part of the drawing, not an opaque canvas.

These are decorative affordances, not proof of a product identity, material,
recyclability, available collection point or verified sorting destination. The
consuming control must provide its own localized accessible label and state;
hide redundant image content from the accessibility tree. Use theme-aware tint
or the existing vector fallback when the original color lacks contrast.

Rebuild from this repository root using the already installed build-time sharp:

```sh
SHARP_MODULE_PATH=/absolute/path/to/installed/sharp node scripts/render-home-symbols.mjs
SHARP_MODULE_PATH=/absolute/path/to/installed/sharp node scripts/render-home-symbols.mjs --check
```

The renderer accepts only the seven listed local filenames and rejects symlink
inputs/outputs, external SVG references, script, text, embedded images and foreign
objects. It makes no network requests or dependency installations. `--check`
re-renders in memory and compares bytes without writing. PNG output contains no
source photography or metadata. Deterministic byte identity is verified with
the same sharp/libvips toolchain; a future toolchain upgrade may deliberately
change encoder bytes and should be reviewed with a new visual check.
