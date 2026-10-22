const { test } = require('node:test');
const assert = require('node:assert/strict');
globalThis.BigNumber = require('../assets/vendor/bignumber.js');
const U = require('../assets/js/tools.js');

// Independent oracle: integer arithmetic only, no BigNumber or floating-point money.
function units(text, scale) {
  const [whole, fraction = ''] = text.split('.');
  assert.ok(fraction.length <= scale);
  return BigInt(whole || '0') * 10n ** BigInt(scale) + BigInt(fraction.padEnd(scale, '0') || '0');
}
function fixed(value, scale) {
  const text = value.toString().padStart(scale + 1, '0');
  return scale ? `${text.slice(0, -scale)}.${text.slice(-scale)}` : text;
}
function payment(value, scale) {
  const divisor = 10n ** BigInt(Math.max(0, scale - 2));
  const cents = scale <= 2 ? value * 10n ** BigInt(2 - scale) : (value + divisor / 2n) / divisor;
  return fixed(cents, 2);
}
function displayed(value, scale) {
  let [whole, fraction = ''] = fixed(value, scale).split('.');
  fraction = fraction.replace(/0+$/, '').padEnd(2, '0');
  return `${whole}.${fraction}`;
}

test('Laundry matches a manually checked bill without omissions or double counting', () => {
  const { rows, errors } = U.parseLaundry('2x Shirt\n3x Trouser\n1x Shirt\n4x Shalwar Kameez\n');
  assert.deepEqual(errors, []);
  const result = U.calculateLaundry(rows, [
    { clotheType:'Shirt', rate:'25.50' },
    { clotheType:'Trouser', rate:'40' },
    { clotheType:'Shalwar Kameez', rate:'85.25' },
    { clotheType:'Unused', rate:'invalid but not billed' }
  ]);
  // 3 × 25.50 + 3 × 40.00 + 4 × 85.25 = 76.50 + 120.00 + 341.00.
  assert.equal(result.total, '537.50');
  assert.equal(result.totalClothes, 10);
  assert.equal(result.totalRows, 4);
  assert.deepEqual(result.details.map(row => [row.clotheType, row.count, U.formatLaundryAmount(row.amount)]), [
    ['Shirt', 3, '76.50'], ['Trouser', 3, '120.00'], ['Shalwar Kameez', 4, '341.00']
  ]);
});

test('Fractional-paisa rates keep exact details and round only the final payment', () => {
  const result = U.calculateLaundry([{ clotheType:'A', count:1 }, { clotheType:'B', count:1 }], [{ clotheType:'A', rate:'0.005' }, { clotheType:'B', rate:'0.005' }]);
  assert.equal(result.total, '0.01');
  assert.deepEqual(result.details.map(row => U.formatLaundryAmount(row.amount)), ['0.005', '0.005']);
  for (const [rate, expected] of [['0.0049', '0.00'], ['0.005', '0.01'], ['0.0051', '0.01'], ['1.005', '1.01'], ['2.675', '2.68']]) {
    assert.equal(U.calculateLaundry([{ clotheType:'A', count:1 }], [{ clotheType:'A', rate }]).total, expected);
  }
  assert.equal(U.calculateLaundry([{ clotheType:'A', count:3 }], [{ clotheType:'A', rate:'0.335' }]).total, '1.01');
});

test('Payment rounding is explicit, independent of the library default', () => {
  const previous = BigNumber.config().ROUNDING_MODE;
  try {
    BigNumber.config({ ROUNDING_MODE:BigNumber.ROUND_DOWN });
    assert.equal(U.calculateLaundry([{ clotheType:'A', count:1 }], [{ clotheType:'A', rate:'1.005' }]).total, '1.01');
  } finally { BigNumber.config({ ROUNDING_MODE:previous }); }
});

test('Calculation boundary rejects invalid counts, missing types, and ambiguous rates', () => {
  const rates = [{ clotheType:'Shirt', rate:'25' }];
  for (const count of [-1, 0.5, NaN, Infinity, '2', null, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => U.calculateLaundry([{ clotheType:'Shirt', count }], rates), /count/i);
  }
  for (const row of [null, {}, { count:1, clotheType:'' }, { count:1, clotheType:'   ' }]) {
    assert.throws(() => U.calculateLaundry([row], rates));
  }
  assert.throws(() => U.calculateLaundry([], rates));
  assert.throws(() => U.calculateLaundry([{ count:1, clotheType:'Shirt' }], [...rates, { clotheType:'Shirt', rate:'30' }]), /single rate/);
  for (const rate of ['', ' ', '-0.01', '25rs', '1,000', '1e3', 'NaN', 'Infinity', null, true]) {
    assert.throws(() => U.calculateLaundry([{ count:1, clotheType:'Shirt' }], [{ clotheType:'Shirt', rate }]));
  }
  assert.throws(() => U.calculateLaundry([{ count:1, clotheType:'Shirt' }], []));
});

test('Large counts and totals stay exact; unsafe accumulated counts fail', () => {
  const max = Number.MAX_SAFE_INTEGER;
  const rates = [{ clotheType:'A', rate:'0.01' }];
  assert.equal(U.calculateLaundry([{ count:max, clotheType:'A' }], rates).total, '90071992547409.91');
  assert.throws(() => U.calculateLaundry([{ count:max, clotheType:'A' }, { count:1, clotheType:'A' }], rates), /count is too large/);
  assert.equal(U.calculateLaundry([{ count:3, clotheType:'A' }], [{ clotheType:'A', rate:'9007199254740991.99' }]).total, '27021597764222975.97');
  const zero = U.calculateLaundry([{ count:0, clotheType:'A' }, { count:8, clotheType:'B' }], [{ clotheType:'A', rate:'25.50' }, { clotheType:'B', rate:'0' }]);
  assert.equal(zero.total, '0.00'); assert.equal(zero.totalClothes, 8); assert.equal(zero.totalRows, 2);
});

test('Parser accepts supported names and reports every malformed nonempty line', () => {
  const valid = U.parseLaundry(' 2x Shirt  \r\n\r\n3X Shalwar Kameez\r\n4× قمیص\n1x __proto__\n1x constructor');
  assert.deepEqual(valid.errors, []);
  assert.deepEqual(valid.rows.map(row => row.clotheType), ['Shirt', 'Shalwar Kameez', 'قمیص', '__proto__', 'constructor']);
  for (const line of ['1.5x Shirt', '-2x Shirt', '2x', '2x   ', '2 Shirt', '999999999999999999x Shirt']) {
    assert.equal(U.parseLaundry(line).errors.length, 1, line);
  }
});

test('2,000 generated bills agree with an independent exact integer oracle', () => {
  let seed = 0x12ab34cd;
  function random(max) { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % max; }
  for (let scenario = 0; scenario < 2000; scenario++) {
    const scale = random(9), typeCount = 1 + random(8);
    const rates = Array.from({ length:typeCount }, (_, index) => ({ clotheType:`Garment ${index}`, rate:fixed(BigInt(random(10000000)), scale) }));
    const rows = Array.from({ length:1 + random(40) }, () => ({ clotheType:rates[random(typeCount)].clotheType, count:random(1000) }));
    const oracle = new Map(); let sum = 0n, totalClothes = 0;
    for (const row of rows) {
      const rate = rates.find(rate => rate.clotheType === row.clotheType);
      const amount = units(rate.rate, scale) * BigInt(row.count);
      const previous = oracle.get(row.clotheType) || { count:0, amount:0n };
      oracle.set(row.clotheType, { count:previous.count + row.count, amount:previous.amount + amount });
      sum += amount; totalClothes += row.count;
    }
    const parsed = U.parseLaundry(rows.map(row => `${row.count}x ${row.clotheType}`).join('\r\n'));
    assert.deepEqual(parsed.errors, []);
    const result = U.calculateLaundry(parsed.rows, rates);
    assert.equal(result.total, payment(sum, scale), `scenario ${scenario}`);
    assert.equal(result.totalClothes, totalClothes); assert.equal(result.totalRows, rows.length);
    assert.equal(result.details.length, oracle.size);
    for (const detail of result.details) {
      const expected = oracle.get(detail.clotheType);
      assert.equal(detail.count, expected.count);
      assert.equal(units(detail.amount, scale), expected.amount);
      assert.equal(U.formatLaundryAmount(detail.amount), displayed(expected.amount, scale));
    }
    const reversed = U.calculateLaundry([...parsed.rows].reverse(), rates);
    assert.equal(reversed.total, result.total);
    const grouped = U.calculateLaundry([...oracle].map(([clotheType, value]) => ({ clotheType, count:value.count })), rates);
    assert.equal(grouped.total, result.total);
  }
});
