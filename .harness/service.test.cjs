const assert = require('assert');
const store = new Map();
global.window = {
  localStorage: { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) },
  addEventListener() {}, removeEventListener() {},
};
global.navigator = { onLine: true };
const { MockWalletService } = require('/tmp/wallet-test.cjs');
(async () => {
  const svc = new MockWalletService();
  const list = await svc.detect();
  assert.equal(list[0].installed, false, 'no extension => MetaMask not installed');
  assert.ok(list.find((p) => p.id === 'demo').available, 'demo always available');
  assert.equal(svc.getSnapshot(), null, 'no session => null');

  const w = await svc.connect('demo');
  assert.match(w.address, /^0x[0-9a-fA-F]{40}$/, 'demo address is valid hex');
  assert.equal(w.chainId, 97477, 'Delta Chain decimal id');
  assert.equal(Number(store.get('dd.v1.wallet') ? JSON.parse(store.get('dd.v1.wallet')).state.chainId : 0), 97477, 'persisted chainId');
  assert.equal(svc.getSnapshot()?.address, w.address, 'store mirrors service');

  let reactNotified = 0, legacySeen = null;
  const off = svc.subscribe(() => reactNotified++);
  const offChange = svc.onChange((wallet) => { legacySeen = wallet?.address ?? null; });
  assert.equal(legacySeen, w.address, 'onChange replays the current state on subscribe');

  await svc.disconnect();
  assert.equal(reactNotified, 1, 'React subscriber notified on disconnect');
  assert.equal(legacySeen, null, 'onChange listener sees the disconnect');
  assert.equal(svc.getSnapshot(), null, 'snapshot cleared');
  assert.equal(store.has('dd.v1.wallet'), false, 'session key removed');
  off(); offChange();

  // blocked storage must not throw
  global.window.localStorage = { getItem() { throw new Error('SecurityError'); }, setItem() { throw new Error('SecurityError'); }, removeItem() { throw new Error('SecurityError'); } };
  const s2 = new MockWalletService();
  assert.equal(s2.getSnapshot(), null, 'unreadable storage => not connected');
  assert.match((await s2.connect('demo')).address, /^0x[0-9a-fA-F]{40}$/, 'demo still works without storage');

  // real provider handshake + addEthereumChain + chainChanged
  store.clear();
  global.window.localStorage = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) };
  const events = {}; let addParams = null;
  global.window.ethereum = {
    isMetaMask: true, chainId: '0x1',
    on: (e, cb) => { (events[e] ||= []).push(cb); }, removeListener: () => {},
    request: async ({ method, params }) => {
      if (method === 'eth_requestAccounts' || method === 'eth_accounts') return ['0x1111111111111111111111111111111111111111'];
      if (method === 'eth_chainId') return global.window.ethereum.chainId;
      if (method === 'wallet_addEthereumChain') { addParams = params[0]; global.window.ethereum.chainId = addParams.chainId; return null; }
      if (method === 'personal_sign') return '0xsig';
      if (method === 'wallet_watchAsset') return true;
      throw new Error('unhandled ' + method);
    },
  };
  const s3 = new MockWalletService();
  const un3 = s3.subscribe(() => {});
  assert.equal((await s3.detect())[0].installed, true, 'extension detected');
  assert.equal((await s3.connect('metamask')).network, 'ethereum', 'chainId 1 => Ethereum');
  await s3.addDeltaChainNetwork();
  assert.equal(Number(addParams.chainId, 16), 97477, 'wallet_addEthereumChain carries exactly 97477');
  assert.equal(addParams.nativeCurrency.symbol, 'DELTA', 'native currency DELTA');
  for (const cb of events['chainChanged'] || []) await cb(addParams.chainId);
  await new Promise((r) => setTimeout(r, 10));
  assert.equal(s3.getSnapshot()?.network, 'delta-chain', 'chainChanged re-reads the provider (no stale cache)');
  assert.equal(await s3.signMessage('x'), 'signed', 'personal_sign');
  assert.equal(await s3.watchAsset({ address: '0x' + '2'.repeat(40), symbol: 'DELTA', decimals: 18 }), true, 'wallet_watchAsset');
  un3();

  // cancelled connect leaves nothing behind
  global.window.ethereum.request = async ({ method }) => {
    if (method === 'eth_requestAccounts') { const e = new Error('User rejected'); e.code = 4001; throw e; }
    return [];
  };
  store.clear();
  const s4 = new MockWalletService();
  await assert.rejects(() => s4.connect('metamask'), 'rejection surfaces as an error');
  assert.equal(s4.getSnapshot(), null, 'no half-connected state after a cancellation');
  console.log('SERVICE TEST: all 24 assertions passed');
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
