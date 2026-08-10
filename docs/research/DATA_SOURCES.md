# Data-source matrix

Accessed: 2026-08-10. `Unknown` means written terms or a contract must be obtained before production use.

| Source | Coverage / fields | Reliability and freshness | Licence / attribution / caching | API / auth / cost | Decision |
| --- | --- | --- | --- | --- | --- |
| Open Food Facts v3.6 | Global community food identity, images, structured `packagings`, completeness flag, taxonomies | Community-supplied; official docs give no accuracy/completeness assurance | Database ODbL, contents DbCL, images CC BY-SA; attribution/share-alike and terms apply. Cached/combined databases require careful ODbL isolation | Product reads: 15/min/IP; search: 10/min/IP; identified `User-Agent`; reads do not require account | P0 provider behind validated adapter; store source metadata; display attribution; avoid bulk cache/mixing until legal review |
| Open Products Facts | Non-food sibling database using Product Opener | Experimental/smaller coverage; no coverage guarantee found | Same family of open-data concerns; verify exact terms before production | Product-type redirect/API family exists | Fallback boundary only; no production claim yet |
| GS1 Synkka / GS1 Data | Finnish trading-partner product data, GTIN, hierarchies, public/private products, media | Supplier-originated and structured; service is migrating from Synkka to GS1 Data | Commercial service terms and redistribution rights are not established for this app | Receiver relationship/contact required; APIs and XML integration available; cost/contract unknown | Mock contract now; production adapter blocked on written licence, cost, access, caching, and consumer-display rights |
| GS1 Digital Link | Standard URI syntax/resolver links from identifiers | Standard, not a product-content database | GS1 standard terms; linked resources retain their own terms | No single universal product-data API | Parse/support identifiers later; do not confuse with GS1 data entitlement |
| Rinki | Nationwide Finnish packaging sorting instructions for plastic, carton, glass, and metal | Authoritative packaging guidance; pages checked at release-content date | Site copyright retained; link freely, but use concise original summaries and references rather than copied prose | Public web, no sorting-rule API found | Primary P0 rule source; editorial review/versioning required |
| Palpa | Finnish deposit-return system and consumer return requirements | Authoritative for Palpa-managed beverage containers; not every bottle/can is in the system | Site copyright retained; concise original summary + link | Public web; no product-level public GTIN API verified | Deposit is a separate decision dimension; unknown deposit status yields a question, not a guess |
| Kierrätys.info / KIVO | Nationwide collection-point coordinates, materials, hours, operators | Maintainers are distributed; KIVO disclaims perfect accuracy | Open API for recycling-access use, but commercial use must be agreed separately; maps/images require separate rights | API key tied to email; read-only JSON; availability/load restrictions; current site links API guide 3.1 | P1 adapter only after owner obtains key and written commercial permission if applicable |
| Municipal waste companies | Local non-packaging guidance and service-specific exceptions | Appropriate for local rules; fragmented and jurisdiction-specific | Varies by operator | Varies | Add only as named, dated regional sources; never generalize locally |

## Open Food Facts implementation facts

Official API documentation: https://openfoodfacts.github.io/documentation/docs/Product-Opener/api/

- API v3.6 is current and recommended for new integrations; v2 is deprecated.
- `GET /api/v3/product/{code}` supports a field allow-list, country/language, localized taxonomy names, and product-type routing: https://openfoodfacts.github.io/documentation/docs/Product-Opener/v3/products/get-api-v3-product-code/.
- Structured packaging components can include shape, material, recycling, unit count, quantity, and weights. Source parsing/merging can join partially compatible components incorrectly, and completeness may be unknown: https://openfoodfacts.github.io/documentation/docs/Product-Opener/dev/explain-packaging-data/.
- A backend cache must not silently mix modified OFF records with incompatible proprietary product data. Preserve provider records and derived internal observations as separately attributable layers.

## Owner/legal gates

Before public release, the owner must review Open Food Facts reuse terms and attribution, contact OFF about the planned use, confirm the database-isolation/share-alike approach, and approve any image display. GS1 and KIVO commercial/API use remain external blockers.
