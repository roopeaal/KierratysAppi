# Product-provider contracts

```ts
interface ProductDataProvider {
  readonly id: string;
  findByGtin(gtin: Gtin, context: LookupContext): Promise<ProviderProductResult>;
}
```

`ProviderProductResult` is one of `found`, `not_found`, `rate_limited`, `unavailable`, or `invalid_response`. A provider error never masquerades as absence.

Every found result contains:

- provider ID and immutable source-record ID;
- retrieval timestamp and source URL/reference;
- licence/attribution metadata;
- product identity observations;
- individual packaging-component observations;
- completeness indicator (`complete`, `partial`, `unknown`);
- field-level confidence and verification status.

External payloads are schema-validated, size/time bounded, selected by a field allow-list, and never stored/logged wholesale by default.

## Open Food Facts adapter

- Uses API v3.6 product read with `product_type=all`, Finnish country/language hints, localized tags, a narrow field list, and an identified backend `User-Agent`.
- Maps missing/malformed product and packaging fields defensively.
- Marks community fields `community`/`unverified`; it does not translate OFF's `recycling` taxonomy directly into Finnish policy.
- Treats missing `packagings_complete` as unknown and retains the provider's update time when available.

## GS1 adapter contract

The mock implements the exact interface and contract suite but returns explicitly synthetic records labelled `mock` only in tests/development. Enabling a production adapter requires written data rights, credentials, field mapping, rate/error behavior, and approved fixtures.
