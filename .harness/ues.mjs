import { JSDOM } from 'jsdom';
import React, { act, useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
const dom = new JSDOM('<!doctype html><html><body><div id="r"></div></body></html>', { url: 'http://localhost/' });
globalThis.window = dom.window; globalThis.document = dom.window.document;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let value = null; const subs = new Set();
const store = {
  subscribe: (l) => { subs.add(l); return () => subs.delete(l); },
  getSnapshot: () => value,
  getServerSnapshot: () => null,
};
function Comp() { const v = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot); return React.createElement('span', null, v ? 'CONNECTED' : 'DISCONNECTED'); }
(async () => {
  const root = createRoot(document.getElementById('r'));
  await act(async () => root.render(React.createElement(Comp)));
  console.log('initial:', document.getElementById('r').textContent);
  await act(async () => { value = { address: '0x1' }; [...subs].forEach((f) => f()); });
  console.log('after emit (listeners=' + subs.size + '):', document.getElementById('r').textContent);
  process.exit(document.getElementById('r').textContent === 'CONNECTED' ? 0 : 1);
})();
