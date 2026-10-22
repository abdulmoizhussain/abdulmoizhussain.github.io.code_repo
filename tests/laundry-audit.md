# Laundry calculation audit

Verified locally on 2026-10-23. This audit concerns calculation and rendering, not verification of the quantities or rates a person enters.

## Findings and fixes

1. Ordinary quantities and rates were already multiplied and summed with exact decimal arithmetic. A display issue existed for fractional-paisa rates: two exact amounts of `0.005` displayed separately as `0.01` each, while their final sum correctly displayed as `0.01`. Details now retain their full decimal precision, and the final payment is rounded once to two decimal places. The bill states the rounding rule.
2. The input parser rejected negative counts, but the calculation function itself accepted them when called directly. The function now validates each quantity as a non-negative safe integer. It also validates row types, rejects empty bills, missing/invalid rates and ambiguous duplicate rate entries, checks finite monetary values, and rejects an unsafe accumulated clothes count.
3. Final-payment rounding is explicitly half-up and is not affected by a change to BigNumber's default rounding mode. Rates and exact intermediate amounts are not rounded before multiplication or addition.
4. Rate edits already hid stale results; the status now explicitly says to calculate again.

## Independent arithmetic checks

Run:

```powershell
node --test tests/tools.test.cjs tests/laundry.test.cjs
```

All **18 tests passed**. The Laundry suite compares **2,000 deterministic generated bills** against a separate reference using scaled `BigInt` integers. That reference does not call BigNumber or use floating-point arithmetic for money.

The generated cases vary quantities, repeated garment types, rates with zero through eight decimal places, and row counts. They check:

- Exact payment, total clothes, input-row count, and grouped counts/amounts.
- Displayed detail precision.
- The same payment after reversing row order or merging repeated garment types.

Focused examples also cover zero rates/counts, half-paisa boundaries, decimal values such as `2.675`, invalid inputs, missing rates, and numbers larger than JavaScript can safely represent as monetary values.

Manually checked example:

```text
3 × 25.50 =  76.50
3 × 40.00 = 120.00
4 × 85.25 = 341.00
             ------
Total        537.50 rs
```

The input for this example has four rows: Shirt is split across two rows. The bill still has 10 clothes, four input rows, and three grouped garment types.

## Browser checks

Against the actual page served locally:

- An invalid nonempty line blocks calculation and shows its line number; valid lines are not silently billed as a partial list.
- A blank required rate shows an error and no bill.
- `2x Audit Shirt`, `3x Audit Trouser`, `1x Audit Shirt`, with rates 25.50 and 40, gives 196.50 rs, six clothes and three input rows.
- Changing Shirt's rate to 26 hides the old bill; recalculation gives 198.00 rs.
- Editing the clothes list hides the old bill and requires confirmation again.
- Two garment types at quantity one and rate 0.005 display exact detail amounts of 0.005 each and a final payment of 0.01 rs.
- No browser console errors were reported during these checks.
