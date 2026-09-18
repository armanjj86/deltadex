## فاز ۳ — داده‌های تایپ‌شده، استورها، اتصال کیف پول

> **وضعیت:** کد این فاز هم‌اکنون روی `main` است (چت تأیید فاز ۲ انجام شد و کاربر گفت «برو سراغ مرحله بعد»؛ محیط کاری من طوری تنظیم است که push ها روی `main` می‌نشینند). این PR برای بازبینی Human باز شده و دیفش خالی است تا وقتی تو «تأیید می‌کنم» بگویی، اصلاحات بعدی روی همین برنچ می‌آید.

### ۱) کیف پول — طبق ch01، بدون هیچ وابستگی اضافه
- `src/services/wallet/injected.ts`: تنها فایلِ مجاز به لمس `window.ethereum`. دو متد: `request()` (throw می‌کند) و `tryRequest()` (هیچ‌وقت throw نمی‌کند؛ `{ok:false, reason:'rejected'}` می‌دهد).
- `src/services/wallet/mock.ts` — `MockWalletService`:
  - `detect()` → MetaMask (شناسایی واقعی از `window.ethereum.isMetaMask`)، کیف پول دمو، و WalletConnect/Coinbase/Rabby با برچسب «خارج از اسکوپ» (وایرگات نیاز به Project ID و رله دارد — عمداً بیرون از اسکوپ).
  - `connect('metamask')` → `eth_requestAccounts` + `eth_chainId`؛ رد کردن در افزونه = پیام «اتصال لغو شد»، نه صفحه‌ی خراب.
  - `connect('demo')` → آدرس محلی تولیدشده با همان `src/lib/hex.ts`، ذخیره در `dd.v1.demo-address` تا بعد از رفرش/ریست همان آدرس بماند.
  - `addDeltaChainNetwork()` → `wallet_addEthereumChain` با پارامترهای قفل‌شده در `ARCHITECTURE.md` §4: `chainId 0x17c65` (97477)، native `DELTA`، `https://rpc.delta.exchange` (هرگز تماس گرفته نمی‌شود؛ هشدار «cannot verify» متامسک انتظار همین است).
  - `watchAsset()` برای افزودن DELTA، `signMessage()` برای «امضای پیام دمو» (هر دو best-effort).
  - `accountsChanged` / `chainChanged` → سابسکرایب با `subscribeToProvider`.
- `src/services/wallet/binding.ts` — نقطه‌ی اتصال واحد، مثل `tx`؛ کامپوننت‌ها هیچ‌وقت `window.ethereum` نمی‌بینند.

### ۲) استورها (zustand + persist، همه زیر `dd.v1.`)
| کلید | محتوا |
|---|---|
| `dd.v1.wallet` | `ConnectedWallet` — سرویس مالک state است، React با `useSyncExternalStore` فقط آینه می‌کند (`getServerSnapshot = null`، پس HTMLِ پررندر شده هیچ‌وقت «متصل» نشان نمی‌دهد) |
| `dd.v1.balances` | موجودی توکن‌ها، seed از دمو استوری، API: `applyDelta` / `setAmount` / `resetDemoData` |
| `dd.v1.prefs` | اسلیپیج، محافظت MEV، سرعت تیک قیمت (برای فاز ۵ آماده است) |
- `src/store/persist.ts` اگر localStorage بلوکه باشد به حافظه‌ی فرافکن برمی‌گردد (حالت خصوصی مرورگر دمو را نمی‌شکند).

### ۳) دیتای توکن‌ها
`src/data/tokens.ts`: ۸ توکن (DELTA، veDELTA، ETH، USDC، USDT، ARB، wstETH، GMِ تاییدنشده) با `decimals`، `chip` رنگی، `usd`، `network`، `demoAddress` و `seedBalance`. lesson learned که در سند ثبت شد: آدرس‌های «خوانا»ی دست‌نویس (`0x…USDC`) هگز نامعتبرند؛ همه از مولدِ قطعی `src/lib/hex.ts` تولید می‌شوند (۴۲ کاراکتر).

### ۴) UI
- `WalletSection` (تنها فایل کلاینت): اسلات نوار بالا — دکمه‌ی «اتصال کیف پول» / چیپ `0x7A3f…F9C2` با آواتار conic و Badge قرمز برای شبکه‌ی پشتیبانی‌نشده — و مودال.
- `WalletModalView`: کاملاً presentational و server-capable؛ متن‌ها از `wallet` دیکشنری می‌آیند (۳۱ کلید جدید).
- `Topnav` یک prop جدید `walletNode` گرفت تا کامپوننتِ ظاهری بماند.
- گالری یک بلوک جدید «کیف پول (فاز ۳، زنده)» دارد: همان مودال به‌صورت inline با دکمه‌های واقعی (وصل‌شدن با دمو، قطع، نمایش پیام خطاها، حالت کپی‌شده) تا بدون صفحه‌ی محصولی تست شود.

### ۵) قوانینی که در همین فاز سخت‌تر شد
- هیچ `Detected` ای در HTMLِ پررندر شده: تشخیص پروایدر بعد از mount انجام می‌شود.
- هر خطای کیف پول یک «متن» است نه یک کرش: `errRejected · errNoExtension · errOffline · errGeneric`.
- `WalletModalView` یک `errors` رکوردی می‌گیرد، نه تابع — توابع از مرز RSC رد نمی‌شوند (همین اول فاز با `errorCopy={(k)=>…}` ترکید و اصلاح شد؛ به `ARCHITECTURE.md` §6.1 اضافه شد).
- همه‌ی اعداد همچنان لاتین (قرارداد فاز ۲).

### چک‌لیست ردیابی فاز ۳
| # | آیتم | کجا | حالت |
|---|---|---|---|
| 1 | `window.ethereum` فقط در یک فایل | بازبینی کد | ✅ |
| 2 | اتصال واقعی MetaMask + هندل «لغو شد» | نوار بالا → اتصال | ✅ (نیاز به افزونه روی لپ‌تاپ تو) |
| 3 | کیف پول دمو بدون افزونه | گالری / نوار بالا | ✅ |
| 4 | حفظ اتصال بعد از رفرش | `dd.v1.wallet` | ✅ |
| 5 | افزودن Delta Chain (97477, native DELTA) | مودال، فقط با افزونه | ✅ |
| 6 | watchAsset / personal_sign (اختیاری، best-effort) | مودال | ✅ |
| 7 | detect بعد از mount (نه در SSR) | HTML پررندر شده | ✅ |
| 8 | موجودی‌ها از استور seed می‌شوند | مودال | ✅ |
| 9 | Reset demo همه‌ی `dd.v1.*` را پاک می‌کند | فوتر | ✅ |
| 10 | `t('...')` صفر کلیدِ گم‌شده | `npm run i18n:check` | ✅ 208 کلید |
| 11 | صفر رقم فارسی در UI | اسکن ۱۱ مسیر | ✅ |
| 12 | build / tsc / lint | CI محلی | ✅ |
| 13 | تیکر قیمت (راه‌اندازی در فاز ۵) | `dd.v1.prefs.priceTickMs` | ⏳ فاز ۵ |
| 14 | مصرف موجودی در swap/stake | — | ⏳ فازهای ۵ و ۷ |
