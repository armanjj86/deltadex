# DELTA DEX — Terminology Glossary (EN ↔ FA)

> **Purpose:** All Farsi UI text in the prototype MUST use these exact translations.
> Source of truth: the use-case specification document (approved terminology, 9 chapters).
> English is the primary UI language; Farsi is the secondary (RTL) locale.
>
> **Rules:**
> - Prices are ALWAYS in USD, Western digits, LTR — never localized.
> - Addresses/hashes are ALWAYS LTR monospace.
> - ~~Persian digits~~ + Jalali dates are used in Farsi locale for all other numbers/dates.
>   *(superseded — see the correction below this list)*
>
> **Correction (Phase 2, user decision 2026-09-18):** Persian digits are NOT used — every numeral in
> the Farsi UI is a Western digit in the same monospace face as English, because the Persian digit
> glyphs did not match the Latin UI numerals. Jalali dates stay, written `1405/06/27` / `27 شهریور 1405`.
>
> - The user's brand voice: simple, clear, no Arabic-script diacritics (tashkeel), no «ی» with hamza.

---

## 1 · Brand & platform

| English | Farsi | Notes |
|---|---|---|
| Delta DEX | دلتا دکس | Brand name — keep Latin "DELTA DEX" in logo/wordmark; Farsi only in prose |
| Delta (token) | DELTA | Token symbol never translated |
| veDELTA | veDELTA | Never translated |
| decentralized exchange (DEX) | صرافی غیرمتمرکز | |
| multi-chain | چندزنجیره‌ای | |
| prototype | پروتوتایپ | |
| test network (testnet) | شبکه تست | |

## 2 · Navigation & pages

| English | Farsi |
|---|---|
| Swap / Trade | مبادله |
| Pools | استخر نقدینگی |
| Stake | تعهدسپاری |
| Farm | مزرعه‌های کشت سود |
| Bridge | پل بین‌زنجیره‌ای |
| Governance | حاکمیت |
| Portfolio / Dashboard | پورتفولیو / داشبورد |
| History | تاریخچه تراکنش‌ها |
| Connect Wallet | اتصال کیف پول |
| Landing hero: "Trade like it's yours." | «معامله کنید؛ انگار **برای** خودتان است.» *(user revision, 2026-09-18 — supersedes «انگار مال خودتان است». Gradient word = «برای خودتان»)* |

## 3 · Wallet & connection (Ch.1)

| English | Farsi |
|---|---|
| wallet | کیف پول |
| connect | اتصال |
| disconnect | قطع اتصال |
| public address | آدرس عمومی |
| session | نشست |
| network | شبکه |
| switch network | تعویض شبکه |
| Chain ID | شناسه زنجیره |
| support request (new network) | درخواست پشتیبانی از شبکه جدید |
| support ticket | تیکت پشتیبانی |
| notification | اعلان |
| in-app notification | اعلان داخل پلتفرم |
| browser notification | اعلان مرورگر |
| notifications center | مرکز اعلان‌ها |
| modal | پنجره مودال |
| dropdown | منوی کشویی |

## 4 · Trading (Ch.2)

| English | Farsi |
|---|---|
| token | توکن |
| token symbol | نام اختصاری توکن |
| search & filter | جست‌وجو و فیلتر |
| verified token list | فهرست رسمی توکن‌ها |
| unverified / out-of-list token | توکن خارج از فهرست رسمی |
| route / routing | مسیر / مسیریابی |
| best route | بهترین مسیر |
| multi-hop route | مسیر چندمرحله‌ای |
| price impact | تاثیر قیمتی |
| slippage tolerance | آستانه تحمل انحراف قیمت |
| slippage | انحراف قیمت |
| MEV protection | محافظت MEV |
| private RPC / private route | مسیر خصوصی |
| limit order | سفارش با قیمت مشخص |
| open orders | سفارش‌های باز |
| order history | تاریخچه سفارش‌ها |
| confirm / confirmation | تایید |
| transaction | تراکنش |
| pending | در حال پردازش |
| success | موفق |
| failed | ناموفق |
| retry | تلاش مجدد |
| You pay / You receive | شما پرداخت می‌کنید / شما دریافت می‌کنید |
| MAX (button) | حداکثر |
| estimated time | زمان تخمینی |
| recent swaps | مبادله‌های اخیر |
| token approval | اعطای مجوز برداشت توکن |
| pro tools | ابزارهای حرفه‌ای |

## 5 · Liquidity pools (Ch.3)

| English | Farsi |
|---|---|
| liquidity | نقدینگی |
| add liquidity | افزودن نقدینگی |
| remove liquidity | برداشت نقدینگی |
| liquidity provider | تامین‌کننده نقدینگی |
| LP token | توکن نقدینگی |
| pool | استخر (نقدینگی) |
| create new pool | ایجاد استخر جدید |
| fee tier | سطح کارمزد |
| TVL (total value locked) | ارزش کل دارایی‌ها |
| volume 24h | حجم ۲۴ ساعت |
| APR | نرخ پاداش سالانه |
| impermanent loss | ضرر ناپایدار |
| pool share | سهم از استخر |
| position | موقعیت |
| open position | موقعیت باز |
| my positions | موقعیت‌های من |
| unclaimed fees | کارمزدهای وصول‌نشده |
| arbitrage | آربیتراژ |
| pair | جفت‌توکن |

## 6 · Staking & veDELTA (Ch.4)

| English | Farsi |
|---|---|
| staking | تعهدسپاری |
| stake (verb) | سپردن |
| unstake / withdraw stake | برداشت سپرده |
| staker | تعهدسپار |
| flexible staking | تعهدسپاری منعطف |
| fixed-term staking | تعهدسپاری با مدت ثابت |
| lock | قفل |
| lock period | مدت قفل |
| governance lock | قفل حاکمیتی |
| halving | هاوینگ |
| rewards | پاداش |
| claim rewards | برداشت پاداش |
| pending rewards | پاداش انباشته‌شده |
| auto-compound | مرکب‌سازی خودکار |
| APY | نرخ پاداش سالانه با مرکب‌سازی |
| countdown | شمارنده معکوس |
| multiplier | ضریب |
| decay | کاهش تدریجی |

## 7 · Yield farms (Ch.5)

| English | Farsi |
|---|---|
| farming / yield farming | کشت سود |
| farm | مزرعه (کشت سود) |
| farmer | بهره‌بردار کشت سود |
| deposit | واریز |
| withdraw | برداشت |
| harvest | برداشت پاداش مزرعه |
| allocation points | امتیاز تخصیص |
| boost | ضریب پاداش |
| boosted APR | نرخ پاداش سالانه با ضریب پاداش |
| featured farm | مزرعه ویژه |
| stake LP | واریز توکن نقدینگی |

## 8 · Bridge (Ch.6)

| English | Farsi |
|---|---|
| bridge (noun/verb) | پل / پل کردن |
| transfer | انتقال |
| source chain | شبکه مبدا |
| destination chain | شبکه مقصد |
| bridge fee | کارمزد پل |
| amount received | مقدار دریافتی |
| min received | حداقل مقدار دریافتی |
| transfer tracking | پیگیری وضعیت تراکنش پل |
| in-flight transfer | انتقال در حال انجام |
| recent transfers | انتقال‌های اخیر |
| supported chains | شبکه‌های پشتیبانی‌شده |
| bridge liquidity | تامین نقدینگی پل |
| bridge pool | استخر پل |
| free liquidity | نقدینگی آزاد |
| liquidity in transit | نقدینگی در مسیر |
| waiting queue (no liquidity) | صف انتظار (در انتظار نقدینگی) |
| rebalancing (market-driven fee) | انگیزه کارمزدی تعادل |

## 9 · Governance (Ch.7)

| English | Farsi |
|---|---|
| governance | حاکمیت |
| proposal | پیشنهاد حاکمیتی |
| create proposal | ایجاد پیشنهاد حاکمیتی |
| vote | رای |
| voting | رای‌گیری |
| for / against / abstain | موافق / مخالف / ممتنع |
| voter | رای‌دهنده |
| voting power | قدرت رای |
| delegated voting power | قدرت رای تفویض‌شده |
| delegation | تفویض قدرت رای |
| delegate | نماینده |
| quorum | نصاب قانونی |
| threshold | آستانه |
| snapshot | تصویر وضعیت |
| active / passed / rejected | فعال / تصویب‌شده / ردشده |
| execution | در حال اجرا |
| treasury | خزانه |
| vote delegation | تفویض قدرت رای |

## 10 · Portfolio & history (Ch.8)

| English | Farsi |
|---|---|
| portfolio | پورتفولیو |
| dashboard | داشبورد |
| net worth | ارزش کل خالص دارایی |
| balance | موجودی |
| assets | دارایی‌ها |
| allocation | سهم |
| top movers | پرنوسان‌ترین‌ها |
| per-network breakdown | به تفکیک شبکه |
| collapsed section | بخش جمع‌شده |
| transaction hash | هش تراکنش |
| block explorer | کاوشگر بلاکچین |
| export (CSV) | دریافت خروجی |
| network strip | نوار شبکه‌ها |

## 11 · Security (Ch.9)

| English | Farsi |
|---|---|
| security audit | ارزیابی امنیتی |
| auditor | شرکت ارزیاب (امنیتی) |
| audited | ارزیابی‌شده |
| security badge | نشان امنیتی |
| findings | یافته‌ها |
| critical / important / minor | بحرانی / مهم / جزئی |
| resolved | رفع‌شده |
| audit report | گزارش ارزیابی |
| audit history | تاریخچه ارزیابی‌ها |

## 12 · Common UI vocabulary

| English | Farsi |
|---|---|
| button | دکمه |
| field | فیلد |
| input | ورودی |
| search | جست‌وجو |
| filter | فیلتر |
| sort | مرتب‌سازی |
| loading | در حال بارگذاری |
| error | خطا |
| warning | هشدار |
| success message | پیام موفقیت |
| cancel | لغو |
| confirm | تایید |
| back | بازگشت |
| next | بعدی |
| save | ذخیره |
| settings | تنظیمات |
| toggle switch | کلید تغییر وضعیت |
| tooltip | راهنمای ابزار |
| slider | نوار لغزنده |
| stepper | نمایش مرحله‌ای |
| checkbox | چک‌باکس |
| popover | پاپ‌اور |
| empty state | حالت خالی |
| onboarding | راهنمای شروع |