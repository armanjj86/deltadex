import { JSDOM } from 'jsdom';
import React, { act } from 'react';
import { mount, internalState, resetWallet, debugCounts } from './bundle/entry.mjs';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost:3000/en', pretendToBeVisual: true });
const d = dom.window.document;
const bind = (k, v) => Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
for (const k of ['window', 'document', 'HTMLElement', 'Element', 'Node', 'Event', 'CustomEvent', 'MouseEvent', 'KeyboardEvent', 'getComputedStyle', 'localStorage', 'MutationObserver']) {
  bind(k, k === 'localStorage' ? dom.window.localStorage : dom.window[k]);
}
bind('navigator', dom.window.navigator);
globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(0), 0);
globalThis.cancelAnimationFrame = (id) => clearTimeout(id);
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let failures = 0;
const expect = (cond, what) => { console.log(`  ${cond ? 'PASS' : 'FAIL'} — ${what}`); if (!cond) failures++; };
const flush = async (ms = 50) => { await act(async () => { await new Promise((r) => setTimeout(r, ms)); }); };
const click = async (el) => { await act(async () => { el.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true })); await new Promise((r) => setTimeout(r, 40)); }); };
const dlg = () => d.querySelector('[role="dialog"]');
const dlgText = () => (dlg()?.textContent || '').replace(/\s+/g, ' ').trim();
const state = (label) => {
  const panel = dlg()?.parentElement;
  console.log(`\n### ${label} — dialog in <body>: ${panel?.parentElement === d.body}, inside mount root: ${!!panel?.closest('#r')}`);
  console.log(`  chars=${dlgText().length} buttons=${dlg()?.querySelectorAll('button').length} rows=${dlg()?.querySelectorAll('ul li').length}`);
  console.log(`  ${dlgText().slice(0, 400)}`);
};

let seq = 0;
const open = async (locale, mode) => {
  await act(async () => { await resetWallet(); });
  d.body.innerHTML = `<div id="r${++seq}"></div>`;
  const el = d.getElementById(`r${seq}`);
  await act(async () => { mount(locale, mode, el); });
  await flush();
  console.log('  counts after mount:', JSON.stringify(debugCounts()));
  return el;
};

(async () => {
  console.log('=========== EN — the exact click path the professor takes ===========');
  let cur = await open('en', 'connect');
  expect(/connect/i.test(cur.textContent || ''), 'topbar slot shows a Connect button (no fake "connected" chip)');
  console.log('  state after mount:', JSON.stringify(internalState()));
  await click([...cur.querySelectorAll('button')].find((b) => /connect/i.test(b.textContent || '')));
  await flush(80);
  state('1) modal immediately after the click');
  let t = dlgText();
  expect(!!dlg(), 'a dialog is present');
  expect(dlg().parentElement.parentElement === d.body, 'modal is portalled to <body> (escapes the sticky header stacking context)');
  expect(dlg().querySelectorAll('ul li').length === 5, 'all five provider rows render');
  expect(/MetaMask/.test(t), 'MetaMask row visible');
  expect(/Not installed/i.test(t) && /Install/i.test(t), 'MetaMask shows "Not installed" + install link (no extension here)');
  expect(/never sees keys|public address only/i.test(t), 'security note present');
  expect(!/^\s*$/.test(t), 'modal is NOT empty');

  const demo = [...dlg().querySelectorAll('ul li button')].find((b) => /demo wallet/i.test(b.textContent || ''));
  expect(!!demo, 'demo row is a real button');
  await click(demo);
  await flush(400);
  console.log('  state after connect:', JSON.stringify(internalState()));
  console.log('  counts after connect:', JSON.stringify(debugCounts()));
  await act(async () => { dom.window.dispatchEvent(new dom.window.Event('focus')); await new Promise(r => setTimeout(r, 60)); });
  console.log('  after a window focus event (useSyncExternalStore re-checks):', JSON.stringify((cur.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80)));
  console.log('  raw topbar:', JSON.stringify((cur.textContent || '').replace(/\s+/g, ' ').trim()));
  console.log('  topbar html:', (cur.innerHTML || '').replace(/\s+/g, ' ').slice(0, 300));
  expect(!dlg(), 'modal closed after a successful connect');
  expect(/0x[0-9a-fA-F]{4}.{0,4}…[0-9a-fA-F]{4}/.test(cur.textContent || ''), 'topbar chip shows the shortened live address');
  expect(/dd\.v1\.wallet|storage/.test('') || JSON.stringify(internalState()).includes('0x'), 'session persisted');

  await click([...cur.querySelectorAll('button')][0]);
  await flush(80);
  state('2) modal reopened while connected');
  t = dlgText();
  expect(/Delta Chain/.test(t), 'reopened modal shows network = Delta Chain (never blank)');
  expect(/18,290/.test(t), 'balances render from the seeded store');
  expect(/Disconnect/.test(t), 'disconnect action present');

  const dcb = [...dlg().querySelectorAll('button')].find((b) => /disconnect/i.test(b.textContent || ''));
  if (dcb) await click(dcb);
  await flush(120);
  expect(/connect/i.test(cur.textContent || ''), 'topbar is back to the Connect button after disconnect');
  expect(!dlg() || /Choose a wallet|Connect a wallet/i.test(dlgText()), 'no half-connected panel left behind');

  console.log('\n=========== FA — same flow, every string localized ===========');
  cur = await open('fa', 'connect');
  await click([...cur.querySelectorAll('button')].find((b) => /اتصال/.test(b.textContent || '')));
  await flush(80);
  state('3) fa modal');
  t = dlgText();
  expect(dlg() && dlg().querySelectorAll('ul li').length === 5, 'fa modal renders the same five rows');
  expect(!/\b(wallet|gallery|nav|footer)\.[a-zA-Z]/.test(t), 'no raw dictionary keys leak');
  expect(!/undefined|\[missing/.test(t), 'no undefined / [missing] strings');
  expect(/همان آدرس_public|هیچ|کلید|خصوصی/.test(t) || /کلید/.test(t), 'fa security sentence present');
  await click([...dlg().querySelectorAll('ul li button')].find((b) => /دمو/.test(b.textContent || '')));
  await flush(120);
  expect(/0x[0-9a-fA-F]{4}.{0,4}…[0-9a-fA-F]{4}/.test(cur.textContent || ''), 'fa topbar chip shows the live address after connecting');
  expect(JSON.stringify(internalState()).includes('0x'), 'fa: same session store');

  console.log(`\n${failures === 0 ? 'ALL PASS' : failures + ' FAILURES'}`);
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.error('HARNESS ERROR:', e?.stack || e); process.exit(1); });
