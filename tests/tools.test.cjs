const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
globalThis.BigNumber = require('../assets/vendor/bignumber.js');
const U = require('../assets/js/tools.js');

test('Laundry preserves rows, aggregates repeated types, and uses exact decimal rates', () => {
  const { rows, errors } = U.parseLaundry('2x Shirt\r\n3x Trouser\r\n\r\n1x Shirt');
  assert.deepEqual(errors, []);
  const rates = U.normalizeRates([{ key:'old-0', clotheType:'Shirt', rate:'0.10' }, { key:'old-1', clotheType:'Trouser', rate:'0.20' }]);
  assert.deepEqual(U.calculateLaundry(rows, rates), { total:'0.90', totalClothes:6, totalRows:3, details:[{ clotheType:'Shirt', count:3, rate:'0.1', amount:'0.3' }, { clotheType:'Trouser', count:3, rate:'0.2', amount:'0.6' }] });
});
test('Laundry reports malformed lines and does not conceal invalid or missing rates', () => {
  assert.equal(U.parseLaundry('2x Shirt\ninvalid\n-1x Trouser').errors.length, 2);
  const { rows } = U.parseLaundry('1x Shirt');
  for (const rate of ['', '-1', 'abc', 'Infinity', '1.2.3']) assert.throws(() => U.calculateLaundry(rows, [{ clotheType:'Shirt', rate }]));
  assert.throws(() => U.calculateLaundry(rows, []));
  assert.equal(U.calculateLaundry(rows, [{ clotheType:'Shirt', rate:'0' }]).total, '0.00');
  assert.equal(U.parseLaundry('999999999999999999x Shirt').errors.length, 1);
});
test('Laundry keeps case-sensitive matching and reads legacy saved rate shapes', () => {
  assert.throws(() => U.calculateLaundry(U.parseLaundry('1x shirt').rows, [{ clotheType:'Shirt', rate:'20' }]));
  assert.deepEqual(U.normalizeRates([null, {}, { clotheType:'Shirt', rate:35 }, { clotheType:'Shirt', rate:40 }]), [{ key:'rate-0', clotheType:'Shirt', rate:'35' }]);
  assert.throws(() => U.normalizeRates({}));
});
test('Git conversion retains SSH, HTTPS, CLI and Bitbucket username formats', () => {
  for (const input of ['user-1/repo_2.0', 'https://github.com/user-1/repo_2.0.git', 'git@github.com:user-1/repo_2.0.git', 'ssh://git@github.com/user-1/repo_2.0.git']) {
    assert.deepEqual(U.gitLinks(input).map(row => row.value), ['git@github.com:user-1/repo_2.0.git', 'https://github.com/user-1/repo_2.0.git', 'gh repo clone user-1/repo_2.0']);
  }
  const links = U.gitLinks('https://myuser@bitbucket.org/company/repo.git');
  assert.equal(links[0].value, 'git@bitbucket.org:company/repo.git');
  assert.equal(links[2].value, 'https://myuser@bitbucket.org/company/repo.git');
  for (const input of ['', 'javascript:alert(1)', 'https://github.com/a/b/tree/main', 'bad owner/repo', 'https://github.com/a/b?x=1', 'a/..']) assert.throws(() => U.gitLinks(input));
});
test('YouTube shared, embed, old /v and /u, Shorts and live links retain canonical output', () => {
  const id = 'dQw4w9WgXcQ';
  for (const input of [`https://youtu.be/${id}?t=9`, `https://www.youtube.com/embed/${id}`, `https://youtube.com/watch?x=1&v=${id}`, `https://youtube.com/v/${id}`, `https://youtube.com/u/1/${id}`, `https://youtube.com/shorts/${id}`, `https://m.youtube.com/live/${id}`, `https://www.youtube-nocookie.com/embed/${id}`]) {
    assert.equal(U.youtubeLink(input), `https://www.youtube.com/watch?v=${id}`);
  }
  for (const input of ['https://evil.com/watch?v=dQw4w9WgXcQ', 'https://youtu.be/abc', 'ftp://youtube.com/watch?v=dQw4w9WgXcQ']) assert.throws(() => U.youtubeLink(input));
});
test('Colors retain alpha and opaque FF output and accept shorthand hex', () => {
  assert.equal(U.rgbToHex('255, 153, 0'), '#FF9900FF');
  assert.equal(U.rgbToHex('rgba(255, 153, 0, 0.5)'), '#FF990080');
  assert.equal(U.rgbToHex('0 0 0 0'), '#00000000');
  assert.equal(U.rgbToHex('255 255 255 .501'), '#FFFFFF80');
  assert.equal(U.hexToRgb('#0099ff'), 'rgba(0, 153, 255, 1.00)');
  assert.equal(U.hexToRgb('#09f8'), 'rgba(0, 153, 255, 0.53)');
  assert.equal(U.hexToRgb('00000000'), 'rgba(0, 0, 0, 0.00)');
  for (const input of ['256 0 0', '-1 0 0', '0 0', '1.5 0 0', '0 0 0 2', '0 0 0 1 2']) assert.throws(() => U.rgbToHex(input));
  for (const input of ['GGGGGG', '12345', '123456789', '<img>']) assert.throws(() => U.hexToRgb(input));
});
test('Counter restores legacy saved values and handles corrupt storage', () => {
  assert.equal(U.readCounter('42'), 42); assert.equal(U.readCounter('-7'), -7);
  for (const value of [null, 'NaN', 'Infinity', '1.5', '999999999999999999']) assert.equal(U.readCounter(value), 0);
});
test('Currency calculation preserves original formulas', () => {
  assert.deepEqual(U.calculateFees({ rate:'154.97', price:'12.99', fee:'5', charged:'2123.78' }), { base:'2013.06', fee:'100.65', total:'2113.71', percent:'105.50', serviceFee:'5.50' });
  assert.throws(() => U.calculateFees({ rate:'0', price:'1', fee:'5', charged:'1' }));
});
test('Text cleaner retains ASCII letter and number behavior', () => {
  assert.equal(U.cleanText('  hello_world---file.v2!  '), 'hello world file v2');
});
test('Every static page has a header, active link and valid local links/assets', () => {
  const root = path.resolve(__dirname, '..');
  const pages = ['index.html', 'laundry/index.html', 'url_converters/index.html', 'rgb_to_hex/index.html', 'counter/index.html', 'render_markdown/index.html', 'percentage/index.html', '404.html'];
  for (const page of pages) {
    const html = fs.readFileSync(path.join(root, page), 'utf8');
    assert.match(html, /<header class="site-header">/);
    if (page !== '404.html') assert.match(html, /aria-current="page"/);
    for (const [, target] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (/^(?:https?:|#)/.test(target)) continue;
      assert.ok(fs.existsSync(target.startsWith('/') ? path.join(root, target) : path.resolve(root, path.dirname(page), target)), `${page}: missing ${target}`);
    }
    assert.doesNotMatch(html, /react|bootstrap|%PUBLIC_URL%|\/src\/index/i);
  }
});

test('Retirement worker unregisters and reloads only windows inside its scope', async () => {
  const vm = require('node:vm');
  const listeners = {}, navigated = [];
  let unregistered = false, skipped = false;
  const scope = 'https://example.test/tools/';
  const context = { self:{
    registration:{ scope, unregister:async () => { unregistered = true; } },
    skipWaiting:() => { skipped = true; },
    addEventListener:(name, callback) => { listeners[name] = callback; },
    clients:{ matchAll:async () => ['https://example.test/tools/counter/', 'https://example.test/other/'].map(url => ({ url, navigate:async value => navigated.push(value) })) }
  } };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../service-worker.js'), 'utf8'), context);
  listeners.install();
  let activation;
  listeners.activate({ waitUntil:task => { activation = task; } });
  await activation;
  assert.equal(skipped, true); assert.equal(unregistered, true);
  assert.deepEqual(navigated, [scope + 'counter/']);
});
