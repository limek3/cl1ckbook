(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/hooks/use-browser-search-params.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "useBrowserSearchParams",
    ()=>useBrowserSearchParams
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
function getSearchString() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return window.location.search || '';
}
function patchHistoryMethod(method) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const historyRef = window.history;
    const flag = method === 'pushState' ? '__klikbukPatchedPushState' : '__klikbukPatchedReplaceState';
    if (historyRef[flag]) {
        return ()=>{};
    }
    historyRef[flag] = true;
    const original = window.history[method];
    window.history[method] = function patchedHistoryMethod(...args) {
        const result = original.apply(this, args);
        window.setTimeout(()=>{
            window.dispatchEvent(new Event('klikbuk:searchchange'));
        }, 0);
        return result;
    };
    return ()=>{
        window.history[method] = original;
        historyRef[flag] = false;
    };
}
function useBrowserSearchParams() {
    _s();
    const [search, setSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "useBrowserSearchParams.useState": ()=>getSearchString()
    }["useBrowserSearchParams.useState"]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useBrowserSearchParams.useEffect": ()=>{
            let frameId = 0;
            const sync = {
                "useBrowserSearchParams.useEffect.sync": ()=>{
                    window.cancelAnimationFrame(frameId);
                    frameId = window.requestAnimationFrame({
                        "useBrowserSearchParams.useEffect.sync": ()=>{
                            const nextSearch = getSearchString();
                            setSearch({
                                "useBrowserSearchParams.useEffect.sync": (current)=>current === nextSearch ? current : nextSearch
                            }["useBrowserSearchParams.useEffect.sync"]);
                        }
                    }["useBrowserSearchParams.useEffect.sync"]);
                }
            }["useBrowserSearchParams.useEffect.sync"];
            sync();
            const unpatchPush = patchHistoryMethod('pushState');
            const unpatchReplace = patchHistoryMethod('replaceState');
            window.addEventListener('popstate', sync);
            window.addEventListener('klikbuk:searchchange', sync);
            return ({
                "useBrowserSearchParams.useEffect": ()=>{
                    window.cancelAnimationFrame(frameId);
                    unpatchPush();
                    unpatchReplace();
                    window.removeEventListener('popstate', sync);
                    window.removeEventListener('klikbuk:searchchange', sync);
                }
            })["useBrowserSearchParams.useEffect"];
        }
    }["useBrowserSearchParams.useEffect"], []);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useBrowserSearchParams.useMemo": ()=>new URLSearchParams(search)
    }["useBrowserSearchParams.useMemo"], [
        search
    ]);
}
_s(useBrowserSearchParams, "mo+bbrVPQkcmUvKzYIS6+gAzSr8=");
const __TURBOPACK__default__export__ = useBrowserSearchParams;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/telegram-miniapp-auth-client.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CLICKBOOK_AUTH_SESSION_READY_EVENT",
    ()=>CLICKBOOK_AUTH_SESSION_READY_EVENT,
    "authorizeTelegramMiniAppSession",
    ()=>authorizeTelegramMiniAppSession,
    "clearTelegramAppSessionToken",
    ()=>clearTelegramAppSessionToken,
    "getStoredTelegramAppSessionToken",
    ()=>getStoredTelegramAppSessionToken,
    "getTelegramAppSessionHeaders",
    ()=>getTelegramAppSessionHeaders,
    "getTelegramMiniAppInitData",
    ()=>getTelegramMiniAppInitData,
    "hasTelegramMiniAppInitData",
    ()=>hasTelegramMiniAppInitData,
    "hasTelegramMiniAppRuntime",
    ()=>hasTelegramMiniAppRuntime,
    "storeTelegramAppSessionToken",
    ()=>storeTelegramAppSessionToken,
    "waitForTelegramMiniAppInitData",
    ()=>waitForTelegramMiniAppInitData
]);
'use client';
const CLICKBOOK_AUTH_SESSION_READY_EVENT = 'clickbook:auth-session-ready';
function getTelegramWebApp() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return window.Telegram?.WebApp;
}
const APP_SESSION_STORAGE_KEY = 'clickbook_app_session_token';
let cachedAuthPromise = null;
let hasSuccessfulAuth = false;
function getStoredTelegramAppSessionToken() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        return window.localStorage.getItem(APP_SESSION_STORAGE_KEY) || '';
    } catch  {
        return '';
    }
}
function storeTelegramAppSessionToken(token) {
    if (!token || ("TURBOPACK compile-time value", "object") === 'undefined') return;
    try {
        window.localStorage.setItem(APP_SESSION_STORAGE_KEY, token);
    } catch  {}
}
function clearTelegramAppSessionToken() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        window.localStorage.removeItem(APP_SESSION_STORAGE_KEY);
    } catch  {}
}
function getTelegramAppSessionHeaders() {
    const token = getStoredTelegramAppSessionToken();
    return token ? {
        'X-ClickBook-App-Session': token
    } : {};
}
function getTelegramMiniAppInitData() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        const webApp = getTelegramWebApp();
        webApp?.ready?.();
        webApp?.expand?.();
        return webApp?.initData || '';
    } catch  {
        return getTelegramWebApp()?.initData || '';
    }
}
function hasTelegramMiniAppInitData() {
    return getTelegramMiniAppInitData().length > 10;
}
function hasTelegramMiniAppRuntime() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const webApp = getTelegramWebApp();
    return Boolean(webApp?.initData || webApp?.initDataUnsafe?.user);
}
async function waitForTelegramMiniAppInitData(timeoutMs = 1800) {
    const immediate = getTelegramMiniAppInitData();
    if (immediate) return immediate;
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const startedAt = Date.now();
    return new Promise((resolve)=>{
        const tick = ()=>{
            const value = getTelegramMiniAppInitData();
            if (value) {
                resolve(value);
                return;
            }
            if (Date.now() - startedAt >= timeoutMs) {
                resolve('');
                return;
            }
            window.setTimeout(tick, 80);
        };
        tick();
    });
}
function dispatchAuthReady(payload) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    window.dispatchEvent(new CustomEvent(CLICKBOOK_AUTH_SESSION_READY_EVENT, {
        detail: payload
    }));
}
async function readJsonSafe(response) {
    const text = await response.text();
    if (!text) return {};
    try {
        return JSON.parse(text);
    } catch  {
        return {
            error: text
        };
    }
}
async function authorizeTelegramMiniAppSession(options) {
    const initData = await waitForTelegramMiniAppInitData(options?.waitMs ?? 1800);
    if (!initData) {
        return {
            ok: false,
            error: 'telegram_init_data_empty'
        };
    }
    if (hasSuccessfulAuth && !options?.force) {
        return {
            ok: true,
            app_session: true,
            appSessionToken: getStoredTelegramAppSessionToken() || undefined
        };
    }
    if (cachedAuthPromise && !options?.force) {
        return cachedAuthPromise;
    }
    cachedAuthPromise = (async ()=>{
        const controller = new AbortController();
        const timeout = window.setTimeout(()=>controller.abort(), 8000);
        const response = await fetch('/api/auth/telegram-miniapp', {
            method: 'POST',
            credentials: 'include',
            cache: 'no-store',
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                initData
            })
        }).finally(()=>window.clearTimeout(timeout));
        const payload = await readJsonSafe(response);
        if (!response.ok || !payload.ok) {
            const message = payload.error || 'telegram_miniapp_auth_failed';
            throw new Error(message);
        }
        storeTelegramAppSessionToken(payload.appSessionToken);
        hasSuccessfulAuth = true;
        dispatchAuthReady(payload);
        return payload;
    })();
    try {
        return await cachedAuthPromise;
    } catch (error) {
        cachedAuthPromise = null;
        return {
            ok: false,
            error: error instanceof Error ? error.message : 'telegram_miniapp_auth_failed'
        };
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/auth/telegram-miniapp-auto-auth.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TelegramMiniAppAutoAuth",
    ()=>TelegramMiniAppAutoAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$browser$2d$search$2d$params$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/use-browser-search-params.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2d$miniapp$2d$auth$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/telegram-miniapp-auth-client.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function normalizeRedirect(value) {
    if (!value) return '/dashboard';
    try {
        const decoded = decodeURIComponent(value);
        return decoded.startsWith('/') && !decoded.startsWith('//') ? decoded : '/dashboard';
    } catch  {
        return value.startsWith('/') && !value.startsWith('//') ? value : '/dashboard';
    }
}
function shouldForceTelegramSession(pathname) {
    return pathname === '/login';
}
function TelegramMiniAppAutoAuth() {
    _s();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$browser$2d$search$2d$params$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useBrowserSearchParams"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TelegramMiniAppAutoAuth.useEffect": ()=>{
            let cancelled = false;
            if (pathname === '/app') return;
            ({
                "TelegramMiniAppAutoAuth.useEffect": async ()=>{
                    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2d$miniapp$2d$auth$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["authorizeTelegramMiniAppSession"])({
                        force: shouldForceTelegramSession(pathname),
                        waitMs: 2200
                    });
                    if (cancelled || !result.ok) return;
                    if (pathname === '/login') {
                        window.location.replace(normalizeRedirect(searchParams.get('redirectTo')));
                        return;
                    }
                    router.refresh();
                }
            })["TelegramMiniAppAutoAuth.useEffect"]();
            return ({
                "TelegramMiniAppAutoAuth.useEffect": ()=>{
                    cancelled = true;
                }
            })["TelegramMiniAppAutoAuth.useEffect"];
        }
    }["TelegramMiniAppAutoAuth.useEffect"], [
        pathname,
        router,
        searchParams
    ]);
    return null;
}
_s(TelegramMiniAppAutoAuth, "DEZJDQuW+cgua3BNSwMDviQYtmY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"],
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$browser$2d$search$2d$params$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useBrowserSearchParams"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = TelegramMiniAppAutoAuth;
var _c;
__turbopack_context__.k.register(_c, "TelegramMiniAppAutoAuth");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/theme-provider.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ThemeProvider",
    ()=>ThemeProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$2d$themes$40$0$2e$4$2e$6_react$2d$dom_a1781a4635338e9843bf95c5370569a6$2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next-themes@0.4.6_react-dom_a1781a4635338e9843bf95c5370569a6/node_modules/next-themes/dist/index.mjs [app-client] (ecmascript)");
'use client';
;
;
function ThemeProvider({ children, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$2d$themes$40$0$2e$4$2e$6_react$2d$dom_a1781a4635338e9843bf95c5370569a6$2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ThemeProvider"], {
        ...props,
        children: children
    }, void 0, false, {
        fileName: "[project]/components/theme-provider.tsx",
        lineNumber: 7,
        columnNumber: 10
    }, this);
}
_c = ThemeProvider;
var _c;
__turbopack_context__.k.register(_c, "ThemeProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/sonner.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Toaster",
    ()=>Toaster
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$2d$themes$40$0$2e$4$2e$6_react$2d$dom_a1781a4635338e9843bf95c5370569a6$2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next-themes@0.4.6_react-dom_a1781a4635338e9843bf95c5370569a6/node_modules/next-themes/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$sonner$40$1$2e$7$2e$4_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/sonner@1.7.4_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
const Toaster = ({ ...props })=>{
    _s();
    const { theme = 'system' } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$2d$themes$40$0$2e$4$2e$6_react$2d$dom_a1781a4635338e9843bf95c5370569a6$2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$sonner$40$1$2e$7$2e$4_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Toaster"], {
        theme: theme,
        className: "toaster group",
        toastOptions: {
            classNames: {
                toast: 'rounded-[16px] border backdrop-blur-[18px] px-1 shadow-[0_24px_70px_rgba(0,0,0,0.18)]',
                title: 'text-[12.5px] font-semibold tracking-[-0.02em]',
                description: 'text-[11px] leading-4 opacity-75',
                closeButton: 'rounded-[10px] border'
            }
        },
        style: {
            '--normal-bg': 'color-mix(in srgb, var(--popover) 92%, transparent)',
            '--normal-text': 'var(--popover-foreground)',
            '--normal-border': 'color-mix(in srgb, var(--border) 82%, transparent)',
            '--success-bg': 'color-mix(in srgb, var(--popover) 92%, transparent)',
            '--success-text': 'var(--popover-foreground)',
            '--success-border': 'color-mix(in srgb, var(--border) 82%, transparent)',
            '--error-bg': 'color-mix(in srgb, var(--popover) 92%, transparent)',
            '--error-text': 'var(--popover-foreground)',
            '--error-border': 'color-mix(in srgb, var(--border) 82%, transparent)'
        },
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/sonner.tsx",
        lineNumber: 10,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(Toaster, "bbCbBsvL7+LiaR8ofHlkcwveh/Y=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$2d$themes$40$0$2e$4$2e$6_react$2d$dom_a1781a4635338e9843bf95c5370569a6$2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTheme"]
    ];
});
_c = Toaster;
;
var _c;
__turbopack_context__.k.register(_c, "Toaster");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/i18n.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getMessages",
    ()=>getMessages,
    "intlLocaleMap",
    ()=>intlLocaleMap,
    "messages",
    ()=>messages
]);
const intlLocaleMap = {
    ru: 'ru-RU',
    en: 'en-US'
};
const messages = {
    ru: {
        app: {
            name: 'КликБук',
            subtitle: 'Онлайн-запись без переписок',
            userFallback: 'Ваш кабинет',
            searchPlaceholder: 'Поиск по разделам',
            resources: 'Ресурсы',
            marketplace: 'Каталог',
            overview: 'Обзор',
            dashboard: 'Кабинет',
            createProfile: 'Профиль',
            profileSettings: 'Редактирование профиля',
            demoPage: 'Демо-режим',
            system: 'Платформа',
            openMenu: 'Открыть меню',
            closeMenu: 'Свернуть меню',
            theme: 'Тема',
            language: 'Язык',
            dark: 'Тёмная',
            light: 'Светлая',
            russian: 'RU',
            english: 'EN'
        },
        home: {
            badge: 'КликБук для записи клиентов',
            title: 'Клиенты записываются сами — вы управляете заявками в одном кабинете',
            description: 'Соберите красивую страницу услуг, отправьте ссылку клиентам и принимайте записи без бесконечных уточнений в чате.',
            primaryCta: 'Создать профиль',
            secondaryCta: 'Посмотреть демо',
            composerPlaceholder: 'Опишите мастера, услуги или нужный сценарий…',
            composerHint: 'Разделы кабинета, подсказки и поддержка помогают быстро запустить страницу и не терять заявки.',
            aiAssistLabel: 'КликБук AI',
            aiResultBadge: 'Подсказка',
            aiPromptLabel: 'Запрос',
            aiScenarioLabel: 'Сценарии',
            aiUtilitiesTitle: 'Быстрые действия',
            aiEmptyTitle: 'AI подскажет следующий шаг',
            aiEmptyDescription: 'Выберите сценарий или задайте вопрос.',
            aiStayHere: 'Оставить как есть',
            runAi: 'Запустить',
            scenarioPrompts: {
                profile: 'Помоги собрать понятный профиль: имя, специализация, услуги, описание и контакты.',
                link: 'Подготовь ссылку для клиента и короткий текст для отправки.',
                dashboard: 'Покажи, как обрабатывать заявки, подтверждения и расписание.',
                system: 'Подскажи, как быстрее освоиться в интерфейсе КликБук.'
            },
            aiBullets: {
                profile: [
                    'Имя и специализация',
                    'Услуги и описание',
                    'Контакты и ссылка'
                ],
                link: [
                    'Ссылка /m/[slug]',
                    'Текст для клиента',
                    'Готовый сценарий отправки'
                ],
                dashboard: [
                    'Новые заявки',
                    'Статусы и история',
                    'Быстрые действия'
                ],
                system: [
                    'Меню и навигация',
                    'Язык и тема',
                    'Помощь и поддержка'
                ]
            },
            quickActions: [
                'Создать профиль',
                'Открыть кабинет',
                'Посмотреть демо',
                'Открыть клиентскую страницу'
            ],
            suggestionsTitle: 'С чего начать',
            suggestions: [
                {
                    title: 'Соберите страницу специалиста',
                    description: 'Добавьте услуги, цены, город, контакты и короткое описание для клиента.'
                },
                {
                    title: 'Проверьте клиентскую страницу',
                    description: 'Откройте страницу с телефона и убедитесь, что запись понятна с первого экрана.'
                },
                {
                    title: 'Принимайте заявки в кабинете',
                    description: 'Новые записи, статусы и комментарии клиентов собраны в одном рабочем списке.'
                },
                {
                    title: 'Подключите каналы связи',
                    description: 'Телефон, ВК, Telegram и публичная ссылка всегда доступны клиенту.'
                },
                {
                    title: 'Используйте AI-помощника',
                    description: 'FAQ, подсказки и поддержка доступны прямо в кабинете.'
                },
                {
                    title: 'Работайте с телефона',
                    description: 'Мобильная версия адаптирована под быстрые действия и просмотр заявок.'
                }
            ]
        },
        dashboard: {
            title: 'Кабинет записей и клиентов',
            description: 'Следите за новыми заявками, подтверждайте визиты и быстро отправляйте клиентам ссылку на запись.',
            createProfile: 'Создать профиль',
            editProfile: 'Редактировать профиль',
            emptyTitle: 'Сначала заполните профиль',
            emptyDescription: 'После сохранения профиля здесь появятся публичная ссылка, заявки и история записей.',
            openDemo: 'Открыть демо',
            totalBookings: 'Всего заявок',
            newBookings: 'Новые заявки',
            profileReady: 'Клиентская страница',
            profileReadyValue: 'Готова к отправке',
            firstTip: 'После отправки ссылки новые заявки появятся здесь автоматически.',
            newListTitle: 'Нужно обработать',
            newListDescription: 'Начните с заявок, которые ждут подтверждения.',
            allListTitle: 'Все заявки',
            allListDescription: 'Полная история записей и обращений с публичной страницы.'
        },
        createProfile: {
            title: 'Создайте страницу, которую удобно отправлять клиентам',
            titleExisting: 'Страница уже готова — обновите детали',
            description: 'Заполните услуги, описание, контакты и получите аккуратную страницу для онлайн-записи.',
            descriptionExisting: 'Обновите услуги, описание, портфолио и контакты — ссылка останется прежней.'
        },
        profileEdit: {
            title: 'Редактирование профиля',
            description: 'Обновляйте тексты, услуги, портфолио и контакты без лишних кликов.',
            emptyTitle: 'Профиль пока не создан',
            emptyDescription: 'Сначала создайте профиль, а потом вернитесь сюда для редактирования.',
            back: 'Вернуться к заявкам'
        },
        form: {
            titleCreate: 'Профиль мастера',
            titleEdit: 'Редактирование страницы мастера',
            description: 'Сделайте страницу понятной для клиента: услуги, цены, преимущества, контакты и быстрый выбор времени.',
            previewTitle: 'Предпросмотр страницы',
            previewDescription: 'Превью показывает, как клиент увидит профиль, услуги и форму записи.',
            labels: {
                name: 'Имя и фамилия',
                profession: 'Специализация',
                city: 'Город',
                slug: 'Адрес страницы',
                bio: 'Короткое описание',
                services: 'Услуги',
                phone: 'Телефон',
                telegram: 'Телеграм',
                whatsapp: 'ВК',
                avatar: 'Фото мастера'
            },
            placeholders: {
                name: 'Анна Петрова',
                profession: 'Мастер маникюра',
                city: 'Амстердам',
                slug: 'anna-petrova',
                bio: 'Коротко расскажите, чем вы помогаете клиенту, в каком стиле работаете и почему к вам удобно записаться.',
                services: 'Добавьте услуги по одной строке. Например: Маникюр + гель-лак, Педикюр, Укрепление ногтей',
                phone: '+31 6 1234 5678',
                telegram: '@anna_nails',
                whatsapp: 'vk.com/anna',
                avatar: 'Загрузите фото специалиста или оставьте пусто — тогда покажем инициалы'
            },
            slugHint: 'Страница будет доступна по адресу',
            servicesHint: 'Выберите готовые варианты или впишите свои услуги отдельными строками.',
            saveCreate: 'Сохранить профиль',
            saveEdit: 'Сохранить изменения',
            back: 'Вернуться к заявкам',
            previewNameFallback: 'Имя мастера',
            previewProfessionFallback: 'Специализация',
            previewBioFallback: 'Здесь появится короткое описание, которое увидит клиент.',
            previewLocationFallback: 'Город',
            servicesPreviewTitle: 'Услуги',
            publicLinkTitle: 'Ссылка для клиента',
            publicLinkDescription: 'Открывается без регистрации и ведёт клиента сразу к услугам и записи.',
            previewCta: 'Форма записи',
            previewCtaDescription: 'Клиент увидит услуги, контакты и быстрый выбор даты и времени без переписки.',
            saveError: 'Не удалось сохранить профиль.'
        },
        profileCard: {
            professionCitySeparator: '•',
            edit: 'Редактировать профиль',
            openPage: 'Открыть страницу клиента'
        },
        linkCard: {
            title: 'Ссылка для записи',
            description: 'Скопируйте публичную страницу и отправьте клиенту в мессенджере.',
            copy: 'Скопировать ссылку',
            copied: 'Ссылка скопирована',
            open: 'Открыть страницу'
        },
        bookings: {
            emptyTitle: 'Заявок пока нет',
            emptyDescription: 'Когда клиенты начнут записываться, обращения появятся в этом списке.',
            columns: {
                client: 'Клиент',
                service: 'Услуга',
                when: 'Дата и время',
                comment: 'Комментарий',
                status: 'Статус',
                created: 'Создано'
            },
            noComment: 'Без комментария'
        },
        bookingForm: {
            title: 'Запись онлайн',
            description: 'Выберите услугу, дату и время. Мы передадим заявку специалисту для подтверждения.',
            successBadge: 'Заявка отправлена',
            successTitle: 'Спасибо! Заявка отправлена.',
            successDescription: 'Специалист свяжется с вами и подтвердит запись в удобном канале.',
            submitAgain: 'Отправить ещё одну заявку',
            submit: 'Отправить заявку',
            labels: {
                clientName: 'Ваше имя',
                clientPhone: 'Телефон для связи',
                service: 'Услуга',
                date: 'Дата',
                time: 'Время',
                comment: 'Комментарий'
            },
            placeholders: {
                clientName: 'Мария',
                clientPhone: '+31 6 5555 0101',
                service: 'Выберите услугу',
                comment: 'Например, пожелания по услуге, времени или важные детали визита'
            },
            submitError: 'Не удалось отправить заявку.'
        },
        publicPage: {
            demoBadge: 'Демо-профиль',
            notFoundTitle: 'Страница не найдена',
            notFoundDescription: 'Похоже, ссылка изменилась. Проверьте адрес или создайте собственный профиль.',
            createProfile: 'Создать профиль',
            openDemo: 'Открыть демо',
            city: 'Город',
            contacts: 'Контакты',
            bookBlock: 'Форма записи',
            bookBlockDescription: 'Оставьте заявку здесь — запись сразу попадёт в кабинет мастера.'
        },
        statuses: {
            new: 'Новая',
            confirmed: 'Запланирована',
            completed: 'Завершена',
            cancelled: 'Отменена'
        },
        validation: {
            masterName: 'Укажите имя мастера.',
            profession: 'Укажите специализацию.',
            city: 'Укажите город.',
            bio: 'Добавьте короткое описание.',
            slug: 'Укажите адрес страницы.',
            services: 'Добавьте хотя бы одну услугу.',
            slugTaken: 'Этот адрес уже занят. Выберите другой.',
            clientName: 'Укажите имя.',
            clientPhone: 'Укажите телефон.',
            service: 'Выберите услугу.',
            date: 'Выберите дату.',
            time: 'Выберите время.',
            pastDate: 'Нельзя выбрать прошедшую дату.'
        }
    },
    en: {
        app: {
            name: 'ClickBook',
            subtitle: 'Booking platform',
            userFallback: 'Your workspace',
            searchPlaceholder: 'Search sections',
            resources: 'Resources',
            marketplace: 'Catalog',
            overview: 'Overview',
            dashboard: 'Workspace',
            createProfile: 'Profile',
            profileSettings: 'Edit profile',
            demoPage: 'Demo page',
            system: 'Platform',
            openMenu: 'Open menu',
            closeMenu: 'Collapse menu',
            theme: 'Theme',
            language: 'Language',
            dark: 'Dark',
            light: 'Light',
            russian: 'RU',
            english: 'EN'
        },
        home: {
            badge: 'ClickBook booking workspace',
            title: 'Let clients book online while you manage everything in one workspace',
            description: 'Create a polished service page, share one link, and keep bookings, contacts, and confirmations under control.',
            primaryCta: 'Create profile',
            secondaryCta: 'View demo',
            composerPlaceholder: 'Describe the specialist, services, or the setup you need…',
            composerHint: 'Workspace sections, tips, FAQ, and support help you launch the page and handle bookings faster.',
            aiAssistLabel: 'ClickBook AI',
            aiResultBadge: 'Hint',
            aiPromptLabel: 'Prompt',
            aiScenarioLabel: 'Scenarios',
            aiUtilitiesTitle: 'Quick actions',
            aiEmptyTitle: 'AI will suggest the next step',
            aiEmptyDescription: 'Pick a scenario or ask a question.',
            aiStayHere: 'Keep it',
            runAi: 'Run',
            scenarioPrompts: {
                profile: 'Help me build a specialist profile with services, description, and contacts.',
                link: 'Prepare a public client link and a short message for sharing.',
                dashboard: 'Show how to organize incoming requests and booking operations.',
                system: 'Explain how to navigate and use ClickBook faster.'
            },
            aiBullets: {
                profile: [
                    'Name and role',
                    'Services and bio',
                    'Contacts and link'
                ],
                link: [
                    'Public /m/[slug] link',
                    'Client message',
                    'Sharing flow'
                ],
                dashboard: [
                    'New requests',
                    'Statuses and history',
                    'Quick actions'
                ],
                system: [
                    'Navigation',
                    'Language and theme',
                    'Help and support'
                ]
            },
            quickActions: [
                'Create profile',
                'Open dashboard',
                'View demo',
                'Open public page'
            ],
            suggestionsTitle: 'How to start',
            suggestions: [
                {
                    title: 'Build the specialist page',
                    description: 'Add services, pricing, city, contacts, and a short client-facing description.'
                },
                {
                    title: 'Check the public page',
                    description: 'Open it on mobile and make sure booking is clear from the first screen.'
                },
                {
                    title: 'Manage requests in the dashboard',
                    description: 'New bookings, statuses, notes, and client details stay in one clear list.'
                },
                {
                    title: 'Connect contact channels',
                    description: 'Phone, ВК, Telegram, and the public link stay easy to find.'
                },
                {
                    title: 'Use the AI helper',
                    description: 'FAQ, help, and support are available on every workspace screen.'
                },
                {
                    title: 'Work from mobile',
                    description: 'The mobile layout is optimized for quick actions and request review.'
                }
            ]
        },
        dashboard: {
            title: 'Bookings and client workspace',
            description: 'Track new requests, confirm visits, and share the booking link with clients quickly.',
            createProfile: 'Create profile',
            editProfile: 'Edit profile',
            emptyTitle: 'Complete the profile first',
            emptyDescription: 'After saving the profile, the public link, incoming requests, and booking history will appear here.',
            openDemo: 'Open demo',
            totalBookings: 'Total requests',
            newBookings: 'New requests',
            profileReady: 'Client page',
            profileReadyValue: 'Ready to share',
            firstTip: 'New requests will appear here as soon as you send the link.',
            newListTitle: 'Needs confirmation',
            newListDescription: 'Start with requests that are waiting for confirmation.',
            allListTitle: 'All requests',
            allListDescription: 'The complete booking and request history from your public page.'
        },
        createProfile: {
            title: 'Create a booking page clients can use right away',
            titleExisting: 'The page is ready — refine the details',
            description: 'Fill in services, description, contacts, and get a polished online booking page.',
            descriptionExisting: 'Update services, copy, portfolio, and contacts while keeping the same link.'
        },
        profileEdit: {
            title: 'Edit profile',
            description: 'Update copy, services, portfolio, and contacts without extra friction.',
            emptyTitle: 'The profile is not created yet',
            emptyDescription: 'Create the profile first and come back here to edit it.',
            back: 'Back to requests'
        },
        form: {
            titleCreate: 'Specialist profile',
            titleEdit: 'Profile editor',
            description: 'Make the page clear for clients: services, pricing, benefits, contacts, and quick time selection.',
            previewTitle: 'Preview',
            previewDescription: 'The preview shows how clients will see the profile, services, and booking form.',
            labels: {
                name: 'Full name',
                profession: 'Specialization',
                city: 'City',
                slug: 'Page address',
                bio: 'Short description',
                services: 'Services',
                phone: 'Phone',
                telegram: 'Telegram',
                whatsapp: 'ВК',
                avatar: 'Specialist photo'
            },
            placeholders: {
                name: 'Anna Petrova',
                profession: 'Nail artist',
                city: 'Amsterdam',
                slug: 'anna-petrova',
                bio: 'Briefly explain what you help clients with, your style, and why booking with you is convenient.',
                services: 'Add one service per line. Example: Gel polish manicure, Pedicure, Nail strengthening',
                phone: '+31 6 1234 5678',
                telegram: '@anna_nails',
                whatsapp: 'vk.com/anna',
                avatar: 'Upload a photo from your device or leave it empty to use initials'
            },
            slugHint: 'The page will be available at',
            servicesHint: 'Choose ready-made options or add your own services line by line.',
            saveCreate: 'Save profile',
            saveEdit: 'Save changes',
            back: 'Back to requests',
            previewNameFallback: 'Specialist name',
            previewProfessionFallback: 'Specialization',
            previewBioFallback: 'Your client-facing description will appear here.',
            previewLocationFallback: 'City',
            servicesPreviewTitle: 'Services',
            publicLinkTitle: 'Client link',
            publicLinkDescription: 'Opens without registration and takes clients straight to services and booking.',
            previewCta: 'Booking form',
            previewCtaDescription: 'The client sees services, contacts, and quick date and time selection without chat back-and-forth.',
            saveError: 'Could not save the profile.'
        },
        profileCard: {
            professionCitySeparator: '•',
            edit: 'Edit profile',
            openPage: 'Open client page'
        },
        linkCard: {
            title: 'Booking link',
            description: 'Copy the public page and share it with a client in any messenger.',
            copy: 'Copy link',
            copied: 'Copied',
            open: 'Open page'
        },
        bookings: {
            emptyTitle: 'No requests yet',
            emptyDescription: 'When clients start booking, their requests will appear here.',
            columns: {
                client: 'Client',
                service: 'Service',
                when: 'Date and time',
                comment: 'Comment',
                status: 'Status',
                created: 'Created'
            },
            noComment: 'No comment'
        },
        bookingForm: {
            title: 'Book online',
            description: 'Choose a service, date, and time. We will send the request to the specialist for confirmation.',
            successBadge: 'Request sent',
            successTitle: 'Thanks! Your request has been sent.',
            successDescription: 'The booking has been sent to the specialist workspace. Connect Telegram to receive updates and reminders.',
            submitAgain: 'Submit another request',
            submit: 'Send request',
            labels: {
                clientName: 'Your name',
                clientPhone: 'Phone number',
                service: 'Service',
                date: 'Date',
                time: 'Time',
                comment: 'Comment'
            },
            placeholders: {
                clientName: 'Maria',
                clientPhone: '+31 6 5555 0101',
                service: 'Select a service',
                comment: 'For example, service wishes, timing, or important visit details'
            },
            submitError: 'Could not send the request.'
        },
        publicPage: {
            demoBadge: 'Demo profile',
            notFoundTitle: 'Page not found',
            notFoundDescription: 'The link may have changed. Check the address or create your own profile.',
            createProfile: 'Create profile',
            openDemo: 'Open demo',
            city: 'City',
            contacts: 'Contacts',
            bookBlock: 'Booking form',
            bookBlockDescription: 'Submit a request here — it will appear in the specialist workspace right away.'
        },
        statuses: {
            new: 'New',
            confirmed: 'Scheduled',
            completed: 'Completed',
            cancelled: 'Cancelled'
        },
        validation: {
            masterName: 'Enter the specialist name.',
            profession: 'Enter the specialization.',
            city: 'Enter the city.',
            bio: 'Add a short description.',
            slug: 'Enter the page address.',
            services: 'Add at least one service.',
            slugTaken: 'This address is already taken. Choose another one.',
            clientName: 'Enter the name.',
            clientPhone: 'Enter the phone number.',
            service: 'Select a service.',
            date: 'Select a date.',
            time: 'Select a time.',
            pastDate: 'You cannot select a past date.'
        }
    }
};
function getMessages(locale) {
    return messages[locale];
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/locale-context.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LocaleProvider",
    ()=>LocaleProvider,
    "useLocale",
    ()=>useLocale
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/i18n.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
const STORAGE_KEY = 'sloty-locale';
const LocaleContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
function LocaleProvider({ children }) {
    _s();
    const [locale, setLocale] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('ru');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LocaleProvider.useEffect": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            const saved = window.localStorage.getItem(STORAGE_KEY);
            if (saved === 'ru' || saved === 'en') {
                setLocale(saved);
            }
        }
    }["LocaleProvider.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LocaleProvider.useEffect": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            window.localStorage.setItem(STORAGE_KEY, locale);
            document.documentElement.lang = locale;
        }
    }["LocaleProvider.useEffect"], [
        locale
    ]);
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "LocaleProvider.useMemo[value]": ()=>({
                locale,
                setLocale,
                copy: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMessages"])(locale)
            })
    }["LocaleProvider.useMemo[value]"], [
        locale
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LocaleContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/lib/locale-context.tsx",
        lineNumber: 48,
        columnNumber: 10
    }, this);
}
_s(LocaleProvider, "Y69x+H485hj4PT7DtQRr4foAoSU=");
_c = LocaleProvider;
function useLocale() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(LocaleContext);
    if (!context) {
        throw new Error('useLocale must be used within LocaleProvider');
    }
    return context;
}
_s1(useLocale, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "LocaleProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/supabase/env.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getSupabasePublishableKey",
    ()=>getSupabasePublishableKey,
    "getSupabaseServiceRoleKey",
    ()=>getSupabaseServiceRoleKey,
    "getSupabaseUrl",
    ()=>getSupabaseUrl
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
function getSupabaseUrl() {
    const value = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_SUPABASE_URL ?? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.SUPABASE_URL;
    if (!value) {
        throw new Error('Missing Supabase URL. Set NEXT_PUBLIC_SUPABASE_URL.');
    }
    return value;
}
function getSupabasePublishableKey() {
    const value = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!value) {
        throw new Error('Missing Supabase publishable key. Set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.');
    }
    return value;
}
function getSupabaseServiceRoleKey() {
    const value = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.SUPABASE_SERVICE_ROLE_KEY;
    if (!value) {
        throw new Error('Missing Supabase service role key. Set SUPABASE_SERVICE_ROLE_KEY.');
    }
    return value;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/supabase/client.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createClient",
    ()=>createClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$6$2e$1_$40$supabase$2b$supabase$2d$js$40$2$2e$103$2e$0$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+ssr@0.6.1_@supabase+supabase-js@2.103.0/node_modules/@supabase/ssr/dist/module/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$6$2e$1_$40$supabase$2b$supabase$2d$js$40$2$2e$103$2e$0$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createBrowserClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+ssr@0.6.1_@supabase+supabase-js@2.103.0/node_modules/@supabase/ssr/dist/module/createBrowserClient.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$env$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/env.ts [app-client] (ecmascript)");
'use client';
;
;
function createClient() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$6$2e$1_$40$supabase$2b$supabase$2d$js$40$2$2e$103$2e$0$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createBrowserClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createBrowserClient"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$env$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabaseUrl"])(), (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$env$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSupabasePublishableKey"])());
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/utils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn,
    "formatCreatedAt",
    ()=>formatCreatedAt,
    "formatDate",
    ()=>formatDate,
    "formatDateTime",
    ()=>formatDateTime,
    "getInitials",
    ()=>getInitials,
    "parseServices",
    ()=>parseServices,
    "slugify",
    ()=>slugify
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$clsx$40$2$2e$1$2e$1$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$tailwind$2d$merge$40$3$2e$5$2e$0$2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/tailwind-merge@3.5.0/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/i18n.ts [app-client] (ecmascript)");
;
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$tailwind$2d$merge$40$3$2e$5$2e$0$2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$clsx$40$2$2e$1$2e$1$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
function slugify(value) {
    return String(value ?? '').trim().toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}
function parseServices(value) {
    return String(value ?? '').split(/\n|,/).map((item)=>item.trim()).filter(Boolean);
}
function getIntlLocale(locale = 'ru') {
    return __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["intlLocaleMap"][locale];
}
function formatDate(date, options, locale = 'ru') {
    return new Intl.DateTimeFormat(getIntlLocale(locale), {
        day: 'numeric',
        month: 'long',
        ...options
    }).format(new Date(`${date}T00:00:00`));
}
function formatDateTime(date, time, locale = 'ru') {
    const value = new Date(`${date}T${time}`);
    return new Intl.DateTimeFormat(getIntlLocale(locale), {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
    }).format(value);
}
function formatCreatedAt(value, locale = 'ru') {
    return new Intl.DateTimeFormat(getIntlLocale(locale), {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(value));
}
function getInitials(value) {
    return String(value ?? '').split(' ').filter(Boolean).slice(0, 2).map((part)=>part[0]?.toUpperCase() ?? '').join('');
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/billing-plans.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SUBSCRIPTION_PLANS",
    ()=>SUBSCRIPTION_PLANS,
    "SUBSCRIPTION_PLAN_IDS",
    ()=>SUBSCRIPTION_PLAN_IDS,
    "addBillingPeriod",
    ()=>addBillingPeriod,
    "getBillingPlan",
    ()=>getBillingPlan,
    "getLocalizedPlan",
    ()=>getLocalizedPlan,
    "getLocalizedPlans",
    ()=>getLocalizedPlans,
    "getPlanLimits",
    ()=>getPlanLimits,
    "getPlanPrice",
    ()=>getPlanPrice,
    "isFinitePlanLimit",
    ()=>isFinitePlanLimit,
    "normalizeBillingCycle",
    ()=>normalizeBillingCycle,
    "normalizeSubscriptionPlanId",
    ()=>normalizeSubscriptionPlanId,
    "normalizeSubscriptionStatus",
    ()=>normalizeSubscriptionStatus
]);
const SUBSCRIPTION_PLAN_IDS = [
    'start',
    'pro',
    'studio',
    'premium'
];
const SUBSCRIPTION_PLANS = [
    {
        id: 'start',
        name: 'Start',
        descriptionRu: 'Для мастера, который только запускает страницу записи.',
        descriptionEn: 'For a master just launching a booking page.',
        monthly: 0,
        yearly: 0,
        featuresRu: [
            'До 5 услуг',
            'Базовая публичная ссылка',
            'Заявки и календарь',
            '1 канал уведомлений',
            'Базовые напоминания'
        ],
        featuresEn: [
            'Up to 5 services',
            'Basic public link',
            'Requests and calendar',
            '1 notification channel',
            'Basic reminders'
        ],
        limits: {
            services: 5,
            clients: 30,
            reminders: 30,
            exports: 0,
            templates: 3,
            teamMembers: 1
        }
    },
    {
        id: 'pro',
        name: 'Pro',
        descriptionRu: 'Основной рабочий тариф с аналитикой и кастомизацией.',
        descriptionEn: 'The main working plan with analytics and customization.',
        monthly: 990,
        yearly: 9990,
        popular: true,
        featuresRu: [
            'До 20 услуг',
            'Статистика и доход',
            'Шаблоны сообщений',
            'Кастомизация страницы',
            'Напоминания клиентам'
        ],
        featuresEn: [
            'Up to 20 services',
            'Stats and revenue',
            'Message templates',
            'Public page styling',
            'Client reminders'
        ],
        limits: {
            services: 20,
            clients: 150,
            reminders: 120,
            exports: 10,
            templates: 20,
            teamMembers: 1
        }
    },
    {
        id: 'studio',
        name: 'Studio',
        descriptionRu: 'Для мастеров с несколькими направлениями и плотным потоком.',
        descriptionEn: 'For busier masters with multiple service lines.',
        monthly: 2490,
        yearly: 24990,
        featuresRu: [
            'До 80 услуг',
            'Источники и конверсия',
            'Экспорт данных',
            'Интеграции',
            'Брендирование'
        ],
        featuresEn: [
            'Up to 80 services',
            'Sources and conversion',
            'Data export',
            'Integrations',
            'Branding'
        ],
        limits: {
            services: 80,
            clients: 500,
            reminders: 500,
            exports: 60,
            templates: 80,
            teamMembers: 3
        }
    },
    {
        id: 'premium',
        name: 'Premium',
        descriptionRu: 'Для студии и команды с приоритетной поддержкой.',
        descriptionEn: 'For studios and teams with priority support.',
        monthly: 5990,
        yearly: 59990,
        featuresRu: [
            'Команда и сотрудники',
            'Премиум-аналитика',
            'Брендированные блоки',
            'Приоритетная поддержка',
            'Расширенные лимиты'
        ],
        featuresEn: [
            'Team members',
            'Premium analytics',
            'White-label blocks',
            'Priority support',
            'Expanded limits'
        ],
        limits: {
            services: 9999,
            clients: 9999,
            reminders: 9999,
            exports: 999,
            templates: 999,
            teamMembers: 10
        }
    }
];
function normalizeSubscriptionPlanId(value) {
    const raw = String(value ?? '').trim().toLowerCase();
    if (raw === 'free' || raw === 'base' || raw === 'basic') return 'start';
    if (raw === 'starter') return 'start';
    return SUBSCRIPTION_PLAN_IDS.includes(raw) ? raw : 'start';
}
function normalizeBillingCycle(value) {
    return String(value ?? '').trim().toLowerCase() === 'yearly' ? 'yearly' : 'monthly';
}
function normalizeSubscriptionStatus(value) {
    const raw = String(value ?? '').trim().toLowerCase();
    if (raw === 'trialing' || raw === 'past_due' || raw === 'cancelled' || raw === 'inactive') return raw;
    return 'active';
}
function getBillingPlan(planId) {
    const normalized = normalizeSubscriptionPlanId(planId);
    return SUBSCRIPTION_PLANS.find((plan)=>plan.id === normalized) ?? SUBSCRIPTION_PLANS[0];
}
function getPlanPrice(planId, billingCycle) {
    const plan = getBillingPlan(planId);
    return normalizeBillingCycle(billingCycle) === 'yearly' ? plan.yearly : plan.monthly;
}
function getLocalizedPlan(plan, locale) {
    return {
        id: plan.id,
        name: plan.name,
        description: locale === 'ru' ? plan.descriptionRu : plan.descriptionEn,
        monthly: plan.monthly,
        yearly: plan.yearly,
        popular: plan.popular,
        features: locale === 'ru' ? plan.featuresRu : plan.featuresEn
    };
}
function getLocalizedPlans(locale) {
    return SUBSCRIPTION_PLANS.map((plan)=>getLocalizedPlan(plan, locale));
}
function getPlanLimits(planId) {
    return getBillingPlan(planId).limits;
}
function isFinitePlanLimit(value) {
    return value < 9000;
}
function addBillingPeriod(date, billingCycle) {
    const next = new Date(date);
    if (billingCycle === 'yearly') {
        next.setFullYear(next.getFullYear() + 1);
    } else {
        next.setMonth(next.getMonth() + 1);
    }
    return next;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/master-workspace.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "bookingStatusLabel",
    ()=>bookingStatusLabel,
    "buildLimits",
    ()=>buildLimits,
    "buildSubscriptionPayments",
    ()=>buildSubscriptionPayments,
    "buildWorkspaceDataset",
    ()=>buildWorkspaceDataset,
    "formatCurrency",
    ()=>formatCurrency,
    "formatPercent",
    ()=>formatPercent,
    "normalizeSubscriptionEvents",
    ()=>normalizeSubscriptionEvents,
    "normalizeSubscriptionInsight",
    ()=>normalizeSubscriptionInsight
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$billing$2d$plans$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/billing-plans.ts [app-client] (ecmascript)");
;
const SOURCE_LABELS = {
    ru: [
        'Web',
        'ТГ',
        'ВК',
        'Инстаграм'
    ],
    en: [
        'Web',
        'Telegram',
        'VK',
        'Instagram'
    ]
};
const CATEGORY_LABELS = {
    ru: [
        'Базовый уход',
        'Популярное',
        'Дизайн',
        'Поддержка',
        'Дополнительно'
    ],
    en: [
        'Core care',
        'Popular',
        'Design',
        'Support',
        'Add-on'
    ]
};
const NOTES = {
    ru: [
        'Любит утренние слоты и быстро подтверждает время.',
        'Чаще приходит перед выходными, ценит напоминания.',
        'Хорошо реагирует на деликатное сообщение после визита.',
        'Обычно записывается повторно через 3–4 недели.',
        'Хорошо реагирует на сообщения с готовой ссылкой.'
    ],
    en: [
        'Prefers morning slots and confirms fast.',
        'Usually books before weekends and likes reminders.',
        'Responds well to a soft post-visit follow-up.',
        'Typically comes back every 3–4 weeks.',
        'Reacts well to a short message with the booking link.'
    ]
};
function normalizeDate(value) {
    return value.toISOString().slice(0, 10);
}
function dayLabel(date, locale) {
    return new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
        day: 'numeric',
        month: 'short'
    }).format(date);
}
function hashSeed(input) {
    let hash = 2166136261;
    for(let index = 0; index < input.length; index += 1){
        hash ^= input.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}
function seededFloat(seed) {
    const value = Math.sin(hashSeed(seed)) * 10000;
    return value - Math.floor(value);
}
function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}
function getBookingDateTime(booking) {
    return new Date(`${booking.date}T${booking.time}:00`);
}
function sum(values) {
    return values.reduce((total, current)=>total + current, 0);
}
function normalizeSourceLabel(value, locale) {
    const raw = String(value ?? '').trim().toLowerCase();
    const ru = locale === 'ru';
    if (raw.includes('инст') || raw.includes('insta') || raw.includes('instagram')) return ru ? 'Инстаграм' : 'Instagram';
    if (raw.includes('вк') || raw.includes('vk') || raw.includes('max') || raw.includes('макс')) return ru ? 'ВК' : 'VK';
    if (raw.includes('web') || raw.includes('site') || raw.includes('сайт') || raw.includes('публич') || raw.includes('public')) return 'Web';
    if (raw.includes('tg') || raw.includes('тг') || raw.includes('telegram') || raw.includes('телеграм')) return ru ? 'ТГ' : 'Telegram';
    return 'Web';
}
function serviceDurationFromName(service, fallback) {
    const match = service.match(/(\d{2,3})\s*(?:мин|min)/i);
    return match ? Number(match[1]) : fallback;
}
function servicePriceFromName(service, fallback) {
    const match = service.match(/(?:от|from)?\s*([\d\s]{3,})\s*(?:₽|р|rub)/i);
    if (!match?.[1]) return fallback;
    const parsed = Number(match[1].replace(/\s+/g, ''));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
function bookingPrice(booking, services) {
    if (typeof booking.priceAmount === 'number' && booking.priceAmount > 0) return Math.round(booking.priceAmount);
    const service = services.find((item)=>item.name === booking.service);
    return service?.price ?? servicePriceFromName(booking.service, 0);
}
function countsAsRevenue(booking) {
    return booking.status === 'completed';
}
function countsAsScheduledBooking(booking) {
    return booking.status === 'new' || booking.status === 'confirmed' || booking.status === 'completed';
}
function countsAsActiveBooking(booking) {
    return booking.status !== 'cancelled' && booking.status !== 'no_show';
}
function servicePriceByName(service, serviceIndex) {
    const seed = hashSeed(`${service}-${serviceIndex}`);
    return 1800 + seed % 8 * 350 + serviceIndex * 250;
}
function serviceDurationByName(service, serviceIndex) {
    const options = [
        45,
        60,
        75,
        90,
        105
    ];
    const seed = hashSeed(`${service}-${serviceIndex}-duration`);
    return options[seed % options.length];
}
function buildServices(profile, bookings, locale) {
    const categories = CATEGORY_LABELS[locale];
    const totalBookings = Math.max(1, bookings.length);
    return profile.services.map((service, index)=>{
        const price = servicePriceFromName(service, servicePriceByName(service, index));
        const duration = serviceDurationFromName(service, serviceDurationByName(service, index));
        const related = bookings.filter((booking)=>booking.service === service);
        const bookingsCount = related.length;
        const revenue = related.filter(countsAsRevenue).reduce((total, booking)=>total + (booking.priceAmount ?? price), 0);
        return {
            id: `${profile.slug}-service-${index}`,
            name: service,
            duration,
            price,
            status: 'active',
            visible: true,
            bookings: bookingsCount,
            revenue,
            popularity: Math.round(bookingsCount / totalBookings * 100),
            category: categories[index % categories.length]
        };
    });
}
function normalizeBookingServiceList(value) {
    const raw = String(value || '').trim();
    if (!raw) return [
        'Услуга не указана'
    ];
    const cleaned = raw.replace(/[-–—_]{3,}\s*входит\s*:?\s*-?/gi, '').replace(/\s+входит\s*:?\s*-?\s*$/gi, '').replace(/^[-–—_\s]+$/g, '').trim();
    if (!cleaned || /^[-–—_:\s]+$/i.test(cleaned)) return [
        'Услуга не указана'
    ];
    const parts = cleaned.split(/\n|;|\s\+\s|,\s(?=[А-ЯA-ZЁ])|\s·\s/g).map((item)=>item.replace(/^[-–—_\s]+/, '').replace(/[-–—_\s]+$/, '').trim()).filter(Boolean);
    return parts.length > 0 ? parts : [
        'Услуга не указана'
    ];
}
function bookingCodeFromId(id) {
    const compact = String(id || '').replace(/[^a-z0-9]/gi, '').slice(0, 6).toUpperCase();
    return compact ? `#CB-${compact}` : '#CB';
}
function bookingSummaryFromBooking(booking) {
    return {
        id: booking.id,
        code: bookingCodeFromId(booking.id),
        service: booking.service,
        services: normalizeBookingServiceList(booking.service),
        date: booking.date,
        time: booking.time,
        status: booking.status,
        source: booking.source,
        channel: booking.channel
    };
}
function buildClients(bookings, services, locale) {
    const serviceMap = new Map(services.map((service)=>[
            service.name,
            service
        ]));
    const grouped = new Map();
    bookings.forEach((booking)=>{
        const key = booking.clientPhone || booking.clientName;
        const next = grouped.get(key) ?? [];
        next.push(booking);
        grouped.set(key, next);
    });
    return Array.from(grouped.entries()).map(([key, items], index)=>{
        const now = Date.now();
        const sorted = [
            ...items
        ].sort((a, b)=>getBookingDateTime(b).getTime() - getBookingDateTime(a).getTime());
        const sortedAsc = [
            ...items
        ].sort((a, b)=>getBookingDateTime(a).getTime() - getBookingDateTime(b).getTime());
        const futureItems = sortedAsc.filter((booking)=>getBookingDateTime(booking).getTime() > now);
        const pastItems = sorted.filter((booking)=>getBookingDateTime(booking).getTime() <= now);
        const nextBooking = futureItems[0];
        const lastVisit = pastItems[0] ?? sortedAsc[0] ?? sorted[0];
        const revenueBookings = sorted.filter(countsAsRevenue);
        const totalRevenue = revenueBookings.reduce((total, booking)=>{
            const service = serviceMap.get(booking.service);
            return total + (booking.priceAmount ?? service?.price ?? servicePriceFromName(booking.service, 2400));
        }, 0);
        const averageCheck = revenueBookings.length > 0 ? Math.round(totalRevenue / revenueBookings.length) : 0;
        const daysSince = pastItems[0] ? Math.round((now - getBookingDateTime(pastItems[0]).getTime()) / 86400000) : 0;
        const hasReschedule = sorted.some((booking)=>{
            const metadata = booking.metadata && typeof booking.metadata === 'object' ? booking.metadata : {};
            return booking.cancelReason === 'client_reschedule_requested' || Boolean(metadata.rescheduleRequested) || Boolean(metadata.acceptedRescheduleProposalId) || Boolean(metadata.declinedRescheduleProposalId) || Boolean(metadata.rescheduledFromDate);
        });
        const rescheduleCount = sorted.filter((booking)=>{
            const metadata = booking.metadata && typeof booking.metadata === 'object' ? booking.metadata : {};
            return booking.cancelReason === 'client_reschedule_requested' || Boolean(metadata.rescheduleRequested) || Boolean(metadata.acceptedRescheduleProposalId) || Boolean(metadata.declinedRescheduleProposalId) || Boolean(metadata.rescheduledFromDate);
        }).length;
        const hasNoShow = sorted.some((booking)=>booking.status === 'no_show' || booking.status === 'cancelled');
        const latestStatus = sorted[0]?.status;
        const segment = latestStatus === 'no_show' || latestStatus === 'cancelled' || hasNoShow || !nextBooking && pastItems[0] && daysSince > 45 ? 'sleeping' : pastItems.length >= 2 ? 'regular' : 'new';
        const source = normalizeSourceLabel(sorted[0].source ?? sorted[0].channel, locale);
        const bookingSummaries = sorted.map(bookingSummaryFromBooking);
        const activeBookingSummaries = bookingSummaries.filter((booking)=>booking.status !== 'cancelled' && booking.status !== 'no_show' && booking.status !== 'completed');
        const serviceList = Array.from(new Set(bookingSummaries.flatMap((booking)=>booking.services)));
        return {
            id: key,
            name: sorted[0].clientName,
            phone: sorted[0].clientPhone,
            lastVisit: lastVisit.date,
            nextVisit: nextBooking?.date,
            visits: sorted.length,
            averageCheck,
            totalRevenue,
            segment,
            favorite: sorted.length >= 3 || totalRevenue >= 10000,
            note: String(sorted[0].comment ?? '').trim(),
            source,
            service: serviceList[0] ?? sorted[0].service,
            hasReschedule,
            rescheduleCount,
            bookings: bookingSummaries,
            activeBookingCount: activeBookingSummaries.length,
            serviceList
        };
    }).sort((a, b)=>b.totalRevenue - a.totalRevenue);
}
function getRequestDate(booking, todayIso) {
    const raw = typeof booking.createdAt === 'string' ? booking.createdAt.slice(0, 10) : '';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return todayIso;
    // A request cannot happen in the future. Old fallback data sometimes used
    // the visit date as createdAt, which made analytics show future заявки/traffic.
    return raw > todayIso ? todayIso : raw;
}
function buildDaily(profile, bookings, services, locale) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayIso = normalizeDate(today);
    // Dashboard analytics are operational: last 30 calendar days ending today.
    // Future visits belong to the schedule, not to factual traffic/request charts.
    const rangeStart = new Date(today);
    rangeStart.setDate(today.getDate() - 29);
    const requestDateByBookingId = new Map();
    const firstClientVisit = new Map();
    [
        ...bookings
    ].sort((a, b)=>new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).forEach((booking)=>{
        const requestDate = getRequestDate(booking, todayIso);
        requestDateByBookingId.set(booking.id, requestDate);
        const key = booking.clientPhone || booking.clientName;
        if (!firstClientVisit.has(key)) {
            firstClientVisit.set(key, requestDate);
        }
    });
    return Array.from({
        length: 30
    }, (_, offset)=>{
        const date = new Date(rangeStart);
        date.setDate(rangeStart.getDate() + offset);
        const iso = normalizeDate(date);
        const dayBookings = bookings.filter((booking)=>booking.date === iso);
        const createdBookings = bookings.filter((booking)=>requestDateByBookingId.get(booking.id) === iso);
        const requests = createdBookings.length;
        const confirmed = dayBookings.filter((booking)=>countsAsScheduledBooking(booking)).length;
        const revenue = dayBookings.filter(countsAsRevenue).reduce((total, booking)=>total + bookingPrice(booking, services), 0);
        const newClients = createdBookings.filter((booking)=>{
            const key = booking.clientPhone || booking.clientName;
            return firstClientVisit.get(key) === iso;
        }).length;
        return {
            date: iso,
            label: dayLabel(date, locale),
            visitors: requests,
            requests,
            confirmed,
            revenue,
            newClients,
            pageViews: requests
        };
    });
}
function buildChannels(profile, daily, locale, bookings, services) {
    void daily;
    const sourceLabels = SOURCE_LABELS[locale];
    const grouped = new Map();
    for (const label of sourceLabels){
        grouped.set(label, {
            visitors: 0,
            bookings: 0,
            revenue: 0
        });
    }
    for (const booking of bookings){
        const label = normalizeSourceLabel(booking.source ?? booking.channel, locale);
        const item = grouped.get(label) ?? {
            visitors: 0,
            bookings: 0,
            revenue: 0
        };
        item.visitors += 1;
        item.bookings += countsAsScheduledBooking(booking) ? 1 : 0;
        item.revenue += countsAsRevenue(booking) ? bookingPrice(booking, services) : 0;
        grouped.set(label, item);
    }
    return Array.from(grouped.entries()).map(([label, item])=>({
            id: `${profile.slug}-channel-${label.toLowerCase()}`,
            label,
            visitors: item.visitors,
            bookings: item.bookings,
            revenue: item.revenue,
            conversion: item.visitors > 0 ? Number((item.bookings / item.visitors * 100).toFixed(1)) : 0
        })).sort((left, right)=>right.bookings - left.bookings || right.visitors - left.visitors);
}
function buildWeeklyLoad(profile, daily) {
    void profile;
    return Array.from({
        length: 6
    }, (_, index)=>{
        const start = index * 5;
        const slice = daily.slice(start, start + 5);
        const bookings = sum(slice.map((item)=>item.confirmed));
        const hours = Math.round(bookings);
        const utilization = bookings > 0 ? Math.min(100, Math.round(hours / 40 * 100)) : 0;
        return {
            week: `W${index + 1}`,
            bookings,
            hours,
            utilization
        };
    });
}
function buildPeakHours(profile, bookings) {
    void profile;
    return Array.from({
        length: 10
    }, (_, index)=>{
        const hour = 9 + index;
        const label = `${String(hour).padStart(2, '0')}:00`;
        const actual = bookings.filter((booking)=>Number(booking.time.split(':')[0]) === hour).length;
        return {
            hour: label,
            bookings: actual
        };
    });
}
function buildTemplates(locale) {
    return locale === 'ru' ? [
        {
            id: 'confirm',
            title: 'Запись создана',
            channel: locale === 'ru' ? 'ВК / Телеграм' : 'VK / Telegram',
            conversion: '74%',
            variables: [
                '{{имя}}',
                '{{дата}}',
                '{{время}}',
                '{{услуга}}'
            ],
            content: 'Здравствуйте, {{имя}}! Ваша запись на {{услуга}} создана: {{дата}} в {{время}}. Быстрая ссылка: https://кликбук.рф/m/{{slug}}'
        },
        {
            id: 'reminder',
            title: 'Напоминание за день',
            channel: locale === 'ru' ? 'Пуш / ВК' : 'Push / VK',
            conversion: '68%',
            variables: [
                '{{имя}}',
                '{{дата}}',
                '{{время}}'
            ],
            content: 'Напоминаю о визите завтра, {{имя}}. Жду вас {{дата}} в {{время}}. Если понадобится сдвинуть время — дайте знать.'
        },
        {
            id: 'thanks',
            title: 'Спасибо после визита',
            channel: locale === 'ru' ? 'Телеграм' : 'Telegram',
            conversion: '42%',
            variables: [
                '{{имя}}',
                'https://кликбук.рф/m/{{slug}}'
            ],
            content: 'Спасибо за визит, {{имя}}! Буду рада видеть вас снова. Сохраните ссылку https://кликбук.рф/m/{{slug}}, чтобы в следующий раз записаться быстрее.'
        },
        {
            id: 'return',
            title: 'Возврат клиента',
            channel: 'VK',
            conversion: '31%',
            variables: [
                '{{имя}}',
                'https://кликбук.рф/m/{{slug}}'
            ],
            content: 'Здравствуйте, {{имя}}! У меня появились новые удобные слоты на ближайшие недели. Вот быстрая ссылка для записи: https://кликбук.рф/m/{{slug}}'
        }
    ] : [
        {
            id: 'confirm',
            title: 'Booking created',
            channel: locale === 'ru' ? 'ВК / Телеграм' : 'VK / Telegram',
            conversion: '74%',
            variables: [
                '{{name}}',
                '{{date}}',
                '{{time}}',
                '{{service}}'
            ],
            content: 'Hi {{name}}! Your {{service}} booking is created for {{date}} at {{time}}. Quick link: https://кликбук.рф/m/{{slug}}'
        },
        {
            id: 'reminder',
            title: 'Reminder message',
            channel: locale === 'ru' ? 'Пуш / ВК' : 'Push / VK',
            conversion: '68%',
            variables: [
                '{{name}}',
                '{{date}}',
                '{{time}}'
            ],
            content: 'A quick reminder about your appointment tomorrow, {{name}} — {{date}} at {{time}}. Let me know if you need to adjust the time.'
        },
        {
            id: 'thanks',
            title: 'Post-visit thank you',
            channel: locale === 'ru' ? 'Телеграм' : 'Telegram',
            conversion: '42%',
            variables: [
                '{{name}}',
                'https://кликбук.рф/m/{{slug}}'
            ],
            content: 'Thanks for coming, {{name}}. I would love to see you again. Save this link https://кликбук.рф/m/{{slug}} to book faster next time.'
        },
        {
            id: 'return',
            title: 'Return invitation',
            channel: 'VK',
            conversion: '31%',
            variables: [
                '{{name}}',
                'https://кликбук.рф/m/{{slug}}'
            ],
            content: 'Hi {{name}}! New time slots are open for the coming weeks. Here is the quick booking link: https://кликбук.рф/m/{{slug}}'
        }
    ];
}
function buildAvailability(locale) {
    return locale === 'ru' ? [
        {
            id: 'mon',
            label: 'Понедельник',
            status: 'workday',
            slots: [
                '09:00–13:00',
                '14:00–19:00'
            ],
            breaks: [
                '13:00–14:00'
            ]
        },
        {
            id: 'tue',
            label: 'Вторник',
            status: 'workday',
            slots: [
                '10:00–14:00',
                '15:00–20:00'
            ],
            breaks: [
                '14:00–15:00'
            ]
        },
        {
            id: 'wed',
            label: 'Среда',
            status: 'short',
            slots: [
                '11:00–17:00'
            ],
            breaks: [
                '14:00–14:30'
            ]
        },
        {
            id: 'thu',
            label: 'Четверг',
            status: 'workday',
            slots: [
                '09:00–13:00',
                '14:00–19:00'
            ],
            breaks: [
                '13:00–14:00'
            ]
        },
        {
            id: 'fri',
            label: 'Пятница',
            status: 'workday',
            slots: [
                '09:00–12:00',
                '13:00–18:00'
            ],
            breaks: [
                '12:00–13:00'
            ]
        },
        {
            id: 'sat',
            label: 'Суббота',
            status: 'short',
            slots: [
                '10:00–15:00'
            ],
            breaks: []
        },
        {
            id: 'sun',
            label: 'Воскресенье',
            status: 'day-off',
            slots: [],
            breaks: []
        }
    ] : [
        {
            id: 'mon',
            label: 'Monday',
            status: 'workday',
            slots: [
                '09:00–13:00',
                '14:00–19:00'
            ],
            breaks: [
                '13:00–14:00'
            ]
        },
        {
            id: 'tue',
            label: 'Tuesday',
            status: 'workday',
            slots: [
                '10:00–14:00',
                '15:00–20:00'
            ],
            breaks: [
                '14:00–15:00'
            ]
        },
        {
            id: 'wed',
            label: 'Wednesday',
            status: 'short',
            slots: [
                '11:00–17:00'
            ],
            breaks: [
                '14:00–14:30'
            ]
        },
        {
            id: 'thu',
            label: 'Thursday',
            status: 'workday',
            slots: [
                '09:00–13:00',
                '14:00–19:00'
            ],
            breaks: [
                '13:00–14:00'
            ]
        },
        {
            id: 'fri',
            label: 'Friday',
            status: 'workday',
            slots: [
                '09:00–12:00',
                '13:00–18:00'
            ],
            breaks: [
                '12:00–13:00'
            ]
        },
        {
            id: 'sat',
            label: 'Saturday',
            status: 'short',
            slots: [
                '10:00–15:00'
            ],
            breaks: []
        },
        {
            id: 'sun',
            label: 'Sunday',
            status: 'day-off',
            slots: [],
            breaks: []
        }
    ];
}
function buildIntegrations(locale) {
    return locale === 'ru' ? [
        {
            id: 'telegram',
            name: 'Телеграм',
            description: 'Подтверждения и быстрые уведомления в личные сообщения.',
            status: 'connected',
            hint: 'Подключён и синхронизирует новые заявки.'
        },
        {
            id: 'whatsapp',
            name: 'ВК',
            description: 'Отправка ссылки, напоминаний и статусов визита.',
            status: 'connected',
            hint: 'Активен для клиентских шаблонов.'
        },
        {
            id: 'instagram',
            name: 'Ссылка из Инстаграм',
            description: 'Ссылка в профиле и метки переходов на публичную страницу.',
            status: 'recommended',
            hint: 'Высокий потенциал конверсии из профиля.'
        },
        {
            id: 'calendar',
            name: 'Календарь',
            description: 'Экспорт подтверждённых визитов в рабочий календарь.',
            status: 'available',
            hint: 'Помогает избежать накладок по времени.'
        },
        {
            id: 'site',
            name: 'Taplink / сайт',
            description: 'Встроить кнопку записи на ваш внешний сайт.',
            status: 'available',
            hint: 'Полезно для студий и команд.'
        }
    ] : [
        {
            id: 'telegram',
            name: 'Telegram',
            description: 'Confirmations and fast alerts in direct messages.',
            status: 'connected',
            hint: 'Already syncing new requests.'
        },
        {
            id: 'whatsapp',
            name: 'ВК',
            description: 'Send the link, reminders, and visit status updates.',
            status: 'connected',
            hint: 'Enabled for client templates.'
        },
        {
            id: 'instagram',
            name: 'Instagram link',
            description: 'Track clicks from bio to the public booking page.',
            status: 'recommended',
            hint: 'High conversion potential from profile traffic.'
        },
        {
            id: 'calendar',
            name: 'Calendar',
            description: 'Export confirmed appointments to your calendar.',
            status: 'available',
            hint: 'Prevents time overlaps.'
        },
        {
            id: 'site',
            name: 'Website / Taplink',
            description: 'Embed the booking button on an external site.',
            status: 'available',
            hint: 'Useful for studios and teams.'
        }
    ];
}
function buildNotifications(locale) {
    return locale === 'ru' ? [
        {
            id: 'new-request',
            title: 'Новая заявка',
            description: 'Уведомлять сразу после отправки формы в Телеграм и кабинете.',
            channel: 'telegram',
            enabled: true,
            critical: true
        },
        {
            id: 'visit-reminder',
            title: 'Напоминание клиенту',
            description: 'Отправлять клиенту подтверждение и напоминания через Telegram.',
            channel: 'telegram',
            enabled: true
        },
        {
            id: 'chat-message',
            title: 'Сообщение клиенту',
            description: 'Доставлять исходящие сообщения из чата клиенту через бота.',
            channel: 'telegram',
            enabled: true
        },
        {
            id: 'cancellation',
            title: 'Отмена или перенос',
            description: 'Сразу сообщать об изменении записи в Телеграм.',
            channel: 'telegram',
            enabled: true,
            critical: true
        },
        {
            id: 'schedule-change',
            title: 'Изменение графика',
            description: 'Отправлять себе сводку в ВК о блокировках и спецдатах.',
            channel: 'vk',
            enabled: false
        },
        {
            id: 'weekly-digest',
            title: 'Недельная сводка',
            description: 'Доход, конверсия и загрузка по неделе.',
            channel: 'email',
            enabled: true
        }
    ] : [
        {
            id: 'new-request',
            title: 'New request',
            description: 'Notify in Telegram and inside the workspace right after the form is sent.',
            channel: 'telegram',
            enabled: true,
            critical: true
        },
        {
            id: 'visit-reminder',
            title: 'Client reminder',
            description: 'Send confirmations and reminders to the client via Telegram.',
            channel: 'telegram',
            enabled: true
        },
        {
            id: 'chat-message',
            title: 'Client chat message',
            description: 'Deliver outgoing chat messages to the client through the bot.',
            channel: 'telegram',
            enabled: true
        },
        {
            id: 'cancellation',
            title: 'Cancellation or reschedule',
            description: 'Alert immediately in Telegram when an appointment changes.',
            channel: 'telegram',
            enabled: true,
            critical: true
        },
        {
            id: 'schedule-change',
            title: 'Schedule changes',
            description: 'Send a VK summary about blocked time and special dates.',
            channel: 'vk',
            enabled: false
        },
        {
            id: 'weekly-digest',
            title: 'Weekly digest',
            description: 'Revenue, conversion, and load summary for the week.',
            channel: 'email',
            enabled: true
        }
    ];
}
function formatBillingDate(value, locale) {
    if (!value) return locale === 'ru' ? 'не запланировано' : 'not scheduled';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return locale === 'ru' ? 'не запланировано' : 'not scheduled';
    return new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    }).format(date);
}
function getStringFromRecord(record, keys) {
    for (const key of keys){
        const value = record[key];
        if (typeof value === 'string' && value.trim()) return value.trim();
    }
    return null;
}
function getBooleanFromRecord(record, key, fallback = false) {
    const value = record[key];
    return typeof value === 'boolean' ? value : fallback;
}
function normalizeSubscriptionInsight(value, locale) {
    const row = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    const metadata = row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata) ? row.metadata : {};
    const planId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$billing$2d$plans$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["normalizeSubscriptionPlanId"])(row.planId ?? row.plan_id ?? row.plan ?? metadata.planId ?? metadata.plan_id ?? metadata.plan);
    const plan = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$billing$2d$plans$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getBillingPlan"])(planId);
    const status = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$billing$2d$plans$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["normalizeSubscriptionStatus"])(row.status ?? metadata.status);
    const billingCycle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$billing$2d$plans$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["normalizeBillingCycle"])(row.billingCycle ?? row.billing_cycle ?? metadata.billingCycle ?? metadata.billing_cycle);
    const currentPeriodStart = getStringFromRecord(row, [
        'currentPeriodStart',
        'current_period_start'
    ]);
    const currentPeriodEnd = getStringFromRecord(row, [
        'currentPeriodEnd',
        'current_period_end'
    ]);
    const paymentMethodLabel = getStringFromRecord(row, [
        'paymentMethodLabel',
        'payment_method_label'
    ]) ?? getStringFromRecord(metadata, [
        'paymentMethodLabel',
        'payment_method_label',
        'method'
    ]) ?? (locale === 'ru' ? 'Не привязана' : 'Not connected');
    return {
        id: getStringFromRecord(row, [
            'id'
        ]),
        planId,
        planName: plan.name,
        status,
        billingCycle,
        currentPeriodStart,
        currentPeriodEnd,
        nextChargeLabel: plan.monthly === 0 ? locale === 'ru' ? 'Бесплатный тариф' : 'Free plan' : formatBillingDate(currentPeriodEnd, locale),
        paymentMethodLabel,
        cancelAtPeriodEnd: getBooleanFromRecord(row, 'cancelAtPeriodEnd') || getBooleanFromRecord(row, 'cancel_at_period_end'),
        provider: getStringFromRecord(row, [
            'provider'
        ]) ?? getStringFromRecord(metadata, [
            'provider'
        ]) ?? 'manual'
    };
}
function normalizeSubscriptionEvents(value) {
    if (!Array.isArray(value)) return [];
    return value.filter((item)=>item && typeof item === 'object').map((item, index)=>{
        const row = item;
        const metadata = row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata) ? row.metadata : {};
        const amount = typeof row.amount === 'number' ? row.amount : Number(row.amount ?? metadata.amount ?? 0);
        return {
            id: String(row.id ?? `subscription-event-${index}`),
            eventType: String(row.eventType ?? row.event_type ?? metadata.eventType ?? 'subscription_event'),
            amount: Number.isFinite(amount) ? amount : 0,
            currency: String(row.currency ?? metadata.currency ?? 'RUB'),
            planId: getStringFromRecord(row, [
                'planId',
                'plan_id',
                'plan'
            ]) ?? getStringFromRecord(metadata, [
                'planId',
                'plan_id',
                'plan'
            ]) ?? undefined,
            planName: getStringFromRecord(row, [
                'planName',
                'plan_name'
            ]) ?? getStringFromRecord(metadata, [
                'planName',
                'plan_name'
            ]) ?? undefined,
            status: getStringFromRecord(row, [
                'status'
            ]) ?? getStringFromRecord(metadata, [
                'status'
            ]) ?? undefined,
            method: getStringFromRecord(row, [
                'method'
            ]) ?? getStringFromRecord(metadata, [
                'method'
            ]) ?? undefined,
            createdAt: String(row.createdAt ?? row.created_at ?? new Date().toISOString()),
            metadata
        };
    }).sort((a, b)=>new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
function buildSubscriptionPayments(locale, events = []) {
    return events.filter((event)=>event.amount > 0 || event.eventType.includes('payment')).map((event)=>{
        const plan = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$billing$2d$plans$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getBillingPlan"])(event.planId);
        const status = event.eventType.includes('refund') ? 'refunded' : event.eventType.includes('pending') || event.status === 'pending' ? 'pending' : 'paid';
        return {
            id: event.id,
            date: formatBillingDate(event.createdAt, locale),
            amount: event.amount,
            status,
            method: event.method || (locale === 'ru' ? 'Ручная активация' : 'Manual activation'),
            plan: event.planName || plan.name
        };
    });
}
function buildPlans(locale) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$billing$2d$plans$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getLocalizedPlans"])(locale);
}
function buildLimits(services, clients, locale, planId = 'start') {
    const limits = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$billing$2d$plans$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getPlanLimits"])(planId);
    const totalLabel = (value)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$billing$2d$plans$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isFinitePlanLimit"])(value) ? value : 9999;
    return [
        {
            id: 'services',
            label: locale === 'ru' ? 'Активные услуги' : 'Active services',
            used: services.filter((service)=>service.status !== 'draft').length,
            total: totalLabel(limits.services)
        },
        {
            id: 'clients',
            label: locale === 'ru' ? 'Клиенты в месяц' : 'Clients per month',
            used: clients.length,
            total: totalLabel(limits.clients)
        },
        {
            id: 'reminders',
            label: locale === 'ru' ? 'Напоминания' : 'Reminders',
            used: 0,
            total: totalLabel(limits.reminders),
            accent: 'warning'
        },
        {
            id: 'exports',
            label: locale === 'ru' ? 'Экспорты данных' : 'Data exports',
            used: 0,
            total: totalLabel(limits.exports),
            accent: 'success'
        },
        {
            id: 'templates',
            label: locale === 'ru' ? 'Шаблоны сообщений' : 'Message templates',
            used: 0,
            total: totalLabel(limits.templates)
        }
    ];
}
function buildWorkspaceDataset(profile, bookings, locale) {
    const services = buildServices(profile, bookings, locale);
    const clients = buildClients(bookings, services, locale);
    const daily = buildDaily(profile, bookings, services, locale);
    const channels = buildChannels(profile, daily, locale, bookings, services);
    const weeklyLoad = buildWeeklyLoad(profile, daily);
    const peakHours = buildPeakHours(profile, bookings);
    const paidBookings = bookings.filter(countsAsRevenue);
    const totalsRevenue = sum(paidBookings.map((booking)=>bookingPrice(booking, services)));
    const visitors = sum(daily.map((item)=>item.visitors));
    const confirmed = bookings.filter((booking)=>countsAsScheduledBooking(booking)).length;
    const completed = bookings.filter((booking)=>booking.status === 'completed').length;
    const totals = {
        bookings: bookings.length,
        confirmed,
        completed,
        cancelled: bookings.filter((booking)=>booking.status === 'cancelled' || booking.status === 'no_show').length,
        revenue: totalsRevenue,
        visitors,
        conversion: visitors > 0 ? Number((sum(daily.map((item)=>item.confirmed)) / visitors * 100).toFixed(1)) : 0,
        averageCheck: paidBookings.length > 0 ? Math.round(totalsRevenue / paidBookings.length) : 0,
        newClients: sum(daily.map((item)=>item.newClients)),
        returnRate: clients.length > 0 ? Number((clients.filter((client)=>client.segment === 'regular').length / clients.length * 100).toFixed(1)) : 0
    };
    return {
        services,
        clients,
        daily,
        channels,
        weeklyLoad,
        peakHours,
        templates: buildTemplates(locale),
        availability: buildAvailability(locale),
        integrations: buildIntegrations(locale),
        notifications: buildNotifications(locale),
        payments: buildSubscriptionPayments(locale),
        plans: buildPlans(locale),
        subscription: normalizeSubscriptionInsight(null, locale),
        limits: buildLimits(services, clients, locale, 'start'),
        totals
    };
}
function bookingStatusLabel(status, locale) {
    if (locale === 'ru') {
        return ({
            new: 'Новая',
            confirmed: 'Запланирована',
            completed: 'Пришёл',
            no_show: 'Не пришёл',
            cancelled: 'Отменена'
        })[status];
    }
    return ({
        new: 'New',
        confirmed: 'Scheduled',
        completed: 'Arrived',
        no_show: 'No-show',
        cancelled: 'Cancelled'
    })[status];
}
function formatCurrency(value, locale) {
    return new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0
    }).format(value);
}
function formatPercent(value, locale) {
    return new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
        style: 'percent',
        maximumFractionDigits: 0
    }).format(value / 100);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/workspace-store.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WORKSPACE_ID_STORAGE_KEY",
    ()=>WORKSPACE_ID_STORAGE_KEY,
    "buildWorkspaceDatasetFromStored",
    ()=>buildWorkspaceDatasetFromStored,
    "buildWorkspaceSeed",
    ()=>buildWorkspaceSeed
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$master$2d$workspace$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/master-workspace.ts [app-client] (ecmascript)");
;
const WORKSPACE_ID_STORAGE_KEY = 'sloty-workspace-id';
function normalizeNotificationItems(value, fallback) {
    if (!Array.isArray(value) || value.length === 0) return fallback;
    const fallbackById = new Map(fallback.map((item)=>[
            item.id,
            item
        ]));
    const usedIds = new Set();
    const normalized = value.map((item, index)=>{
        if (!item || typeof item !== 'object') return fallback[index] ?? fallback[0];
        const candidate = item;
        const id = String(candidate.id ?? fallback[index]?.id ?? `notification-${index}`);
        const fallbackItem = fallbackById.get(id) ?? fallback[index] ?? fallback[0];
        usedIds.add(id);
        return {
            id,
            title: String(candidate.title ?? fallbackItem?.title ?? ''),
            description: String(candidate.description ?? fallbackItem?.description ?? ''),
            channel: candidate.channel === 'push' || candidate.channel === 'email' || candidate.channel === 'telegram' || candidate.channel === 'vk' ? candidate.channel : fallbackItem?.channel ?? 'telegram',
            enabled: typeof candidate.enabled === 'boolean' ? candidate.enabled : fallbackItem?.enabled ?? true,
            critical: typeof candidate.critical === 'boolean' ? candidate.critical : fallbackItem?.critical
        };
    });
    for (const item of fallback){
        if (!usedIds.has(item.id)) normalized.push(item);
    }
    return normalized;
}
function normalizeClientTextMap(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    return Object.fromEntries(Object.entries(value).filter(([key, item])=>key && typeof item === 'string').map(([key, item])=>[
            key,
            item
        ]));
}
function normalizeClientBooleanMap(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    return Object.fromEntries(Object.entries(value).filter(([key, item])=>key && typeof item === 'boolean').map(([key, item])=>[
            key,
            item
        ]));
}
function parsePriceFromName(name, fallback = 0) {
    const match = name.match(/(?:от|from)?\s*([\d\s]{3,})\s*(?:₽|р|rub)/i);
    if (!match?.[1]) return fallback;
    const value = Number(match[1].replace(/\s+/g, ''));
    return Number.isFinite(value) && value > 0 ? value : fallback;
}
function countsAsRevenue(status) {
    return status === 'completed';
}
function countsAsScheduled(status) {
    return status === 'new' || status === 'confirmed' || status === 'completed';
}
function sourceLabel(value, locale) {
    const raw = String(value ?? '').toLowerCase();
    const ru = locale === 'ru';
    if (raw.includes('инст') || raw.includes('insta') || raw.includes('instagram')) return ru ? 'Инстаграм' : 'Instagram';
    if (raw.includes('вк') || raw.includes('vk') || raw.includes('max') || raw.includes('макс')) return ru ? 'ВК' : 'VK';
    if (raw.includes('web') || raw.includes('site') || raw.includes('сайт') || raw.includes('публич') || raw.includes('public')) return 'Web';
    if (raw.includes('tg') || raw.includes('тг') || raw.includes('telegram') || raw.includes('телеграм')) return ru ? 'ТГ' : 'Telegram';
    return 'Web';
}
function rebuildStoredServiceMetrics(services, bookings) {
    const total = Math.max(1, bookings.length);
    return services.map((service)=>{
        const related = bookings.filter((booking)=>booking.service === service.name);
        const price = service.price || parsePriceFromName(service.name, 0);
        const revenue = related.filter((booking)=>countsAsRevenue(booking.status)).reduce((sum, booking)=>sum + (booking.priceAmount ?? price), 0);
        return {
            ...service,
            price,
            bookings: related.length,
            revenue,
            popularity: Math.round(related.length / total * 100)
        };
    });
}
function overlayClientExtras(clients, sections) {
    const notes = normalizeClientTextMap(sections.clientNotes);
    const favorites = normalizeClientBooleanMap(sections.clientFavorites);
    if (Object.keys(notes).length === 0 && Object.keys(favorites).length === 0) return clients;
    return clients.map((client)=>{
        const note = notes[client.id] ?? notes[client.phone];
        const favorite = favorites[client.id] ?? favorites[client.phone];
        return {
            ...client,
            ...note !== undefined ? {
                note
            } : {},
            ...favorite !== undefined ? {
                favorite
            } : {}
        };
    });
}
function buildWorkspaceSeed(profile, bookings, locale) {
    const dataset = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$master$2d$workspace$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildWorkspaceDataset"])(profile, bookings, locale);
    return {
        bookings,
        services: dataset.services,
        availability: dataset.availability,
        templates: dataset.templates,
        notifications: dataset.notifications,
        chats: [],
        quietHours: false,
        fallbackEmail: true
    };
}
function buildWorkspaceDatasetFromStored(profile, bookings, locale, sections) {
    const base = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$master$2d$workspace$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildWorkspaceDataset"])(profile, bookings, locale);
    const source = sections ?? {};
    const effectiveServices = Array.isArray(source.services) && source.services.length > 0 ? rebuildStoredServiceMetrics(source.services, bookings) : base.services;
    const serviceMap = new Map(effectiveServices.map((service)=>[
            service.name,
            service
        ]));
    const daily = base.daily.map((day)=>{
        const dayBookings = bookings.filter((booking)=>booking.date === day.date);
        const confirmed = dayBookings.filter((booking)=>countsAsScheduled(booking.status)).length;
        const revenue = dayBookings.filter((booking)=>countsAsRevenue(booking.status)).reduce((sum, booking)=>sum + (booking.priceAmount ?? serviceMap.get(booking.service)?.price ?? parsePriceFromName(booking.service, 0)), 0);
        return {
            ...day,
            visitors: day.requests,
            confirmed,
            revenue,
            pageViews: day.requests
        };
    });
    const channelMap = new Map();
    for (const booking of bookings){
        const label = sourceLabel(booking.source ?? booking.channel, locale);
        const next = channelMap.get(label) ?? {
            visitors: 0,
            bookings: 0,
            revenue: 0
        };
        next.visitors += 1;
        next.bookings += countsAsScheduled(booking.status) ? 1 : 0;
        next.revenue += countsAsRevenue(booking.status) ? booking.priceAmount ?? serviceMap.get(booking.service)?.price ?? parsePriceFromName(booking.service, 0) : 0;
        channelMap.set(label, next);
    }
    const channelLabels = locale === 'ru' ? [
        'Web',
        'ТГ',
        'ВК',
        'Инстаграм'
    ] : [
        'Web',
        'Telegram',
        'VK',
        'Instagram'
    ];
    const channels = channelLabels.map((label)=>{
        const canonical = label === 'ТГ' ? 'Telegram' : label === 'ВК' ? 'VK' : label;
        const item = channelMap.get(label) ?? channelMap.get(canonical) ?? {
            visitors: 0,
            bookings: 0,
            revenue: 0
        };
        const display = label;
        return {
            id: profile.slug + '-channel-' + display.toLowerCase(),
            label: display,
            visitors: item.visitors,
            bookings: item.bookings,
            revenue: item.revenue,
            conversion: item.visitors > 0 ? Number((item.bookings / item.visitors * 100).toFixed(1)) : 0
        };
    });
    const visitors = daily.reduce((sum, item)=>sum + item.visitors, 0);
    const confirmed = bookings.filter((booking)=>countsAsScheduled(booking.status)).length;
    const activeBookings = bookings.filter((booking)=>booking.status !== 'cancelled' && booking.status !== 'no_show');
    const revenue = activeBookings.filter((booking)=>countsAsRevenue(booking.status)).reduce((sum, booking)=>sum + (booking.priceAmount ?? serviceMap.get(booking.service)?.price ?? parsePriceFromName(booking.service, 0)), 0);
    const subscription = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$master$2d$workspace$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["normalizeSubscriptionInsight"])(source.subscription, locale);
    const subscriptionEvents = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$master$2d$workspace$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["normalizeSubscriptionEvents"])(source.subscriptionEvents);
    const clients = overlayClientExtras(base.clients, source);
    return {
        ...base,
        services: effectiveServices,
        daily,
        channels,
        availability: Array.isArray(source.availability) && source.availability.length > 0 ? source.availability : base.availability,
        templates: Array.isArray(source.templates) && source.templates.length > 0 ? source.templates : base.templates,
        notifications: normalizeNotificationItems(source.notifications, base.notifications),
        clients,
        subscription,
        payments: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$master$2d$workspace$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildSubscriptionPayments"])(locale, subscriptionEvents),
        limits: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$master$2d$workspace$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildLimits"])(effectiveServices, clients, locale, subscription.planId),
        totals: {
            ...base.totals,
            confirmed,
            completed: bookings.filter((booking)=>countsAsRevenue(booking.status)).length,
            cancelled: bookings.filter((booking)=>booking.status === 'cancelled' || booking.status === 'no_show').length,
            revenue,
            visitors,
            conversion: visitors > 0 ? Number((confirmed / visitors * 100).toFixed(1)) : 0,
            averageCheck: bookings.filter((booking)=>countsAsRevenue(booking.status)).length > 0 ? Math.round(revenue / bookings.filter((booking)=>countsAsRevenue(booking.status)).length) : 0
        }
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/demo-data.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Demo data for КликБук Mini App.
 * Replace with API calls when wiring to real backend.
 */ __turbopack_context__.s([
    "APPOINTMENTS",
    ()=>APPOINTMENTS,
    "CAMPAIGNS",
    ()=>CAMPAIGNS,
    "CLIENTS",
    ()=>CLIENTS,
    "FINANCE_OPS",
    ()=>FINANCE_OPS,
    "INTEGRATIONS",
    ()=>INTEGRATIONS,
    "MASTER",
    ()=>MASTER,
    "MESSAGES",
    ()=>MESSAGES,
    "REVENUE_WEEK",
    ()=>REVENUE_WEEK,
    "REVIEWS",
    ()=>REVIEWS,
    "SCHEDULE_DEFAULT",
    ()=>SCHEDULE_DEFAULT,
    "SERVICES",
    ()=>SERVICES,
    "SOURCES",
    ()=>SOURCES,
    "TEMPLATES",
    ()=>TEMPLATES,
    "THREADS",
    ()=>THREADS
]);
const MASTER = {
    name: 'Алина Морозова',
    firstName: 'Алина',
    username: '@alina.nails',
    city: 'Москва',
    rating: 4.9,
    service: 'Ногтевой сервис',
    link: '/m/admin',
    phone: '+7 916 117 22 04',
    bio: 'Маникюр и педикюр. Стерильно, аккуратно, без спешки. 8 лет опыта.',
    socials: {
        tg: 'alina.nails',
        vk: 'alina.nails',
        ig: '@alina.nails'
    }
};
const SERVICES = [
    {
        n: 1,
        name: 'Маникюр + покрытие',
        price: 2500,
        duration: 90,
        popularity: 0.92,
        count: 24
    },
    {
        n: 2,
        name: 'Дизайн ногтей',
        price: 1500,
        duration: 60,
        popularity: 0.61,
        count: 14
    },
    {
        n: 3,
        name: 'Снятие покрытия',
        price: 800,
        duration: 30,
        popularity: 0.34,
        count: 8
    },
    {
        n: 4,
        name: 'Френч / ombre',
        price: 2200,
        duration: 75,
        popularity: 0.45,
        count: 11
    },
    {
        n: 5,
        name: 'Парафинотерапия',
        price: 1200,
        duration: 40,
        popularity: 0.18,
        count: 4
    }
];
const APPOINTMENTS = [
    {
        time: '10:00',
        name: 'Екатерина Соловьёва',
        service: 'Маникюр + покрытие',
        status: 'in-focus',
        phone: '+7 916 248 17 02',
        dur: 90
    },
    {
        time: '11:45',
        name: 'Марина Лебедева',
        service: 'Дизайн ногтей',
        status: 'scheduled',
        phone: '+7 903 117 84 22',
        dur: 60
    },
    {
        time: '13:30',
        name: 'Ольга Кузнецова',
        service: 'Маникюр + покрытие',
        status: 'scheduled',
        phone: '+7 925 446 09 81',
        dur: 90
    },
    {
        time: '15:00',
        name: 'Анна Петрова',
        service: 'Снятие покрытия',
        status: 'scheduled',
        phone: '+7 911 327 56 03',
        dur: 30
    },
    {
        time: '16:30',
        name: 'Виктория Зайцева',
        service: 'Френч / ombre',
        status: 'scheduled',
        phone: '+7 962 504 12 47',
        dur: 75
    },
    {
        time: '18:00',
        name: 'Дарья Волкова',
        service: 'Маникюр + покрытие',
        status: 'scheduled',
        phone: '+7 985 660 22 14',
        dur: 90
    }
];
const CLIENTS = [
    {
        name: 'Екатерина Соловьёва',
        phone: '+7 916 248 17 02',
        visits: 12,
        total: 28400
    },
    {
        name: 'Марина Лебедева',
        phone: '+7 903 117 84 22',
        visits: 8,
        total: 19200
    },
    {
        name: 'Ольга Кузнецова',
        phone: '+7 925 446 09 81',
        visits: 6,
        total: 14600
    },
    {
        name: 'Анна Петрова',
        phone: '+7 911 327 56 03',
        visits: 5,
        total: 11800
    },
    {
        name: 'Виктория Зайцева',
        phone: '+7 962 504 12 47',
        visits: 4,
        total: 9400
    },
    {
        name: 'Дарья Волкова',
        phone: '+7 985 660 22 14',
        visits: 3,
        total: 7100
    },
    {
        name: 'Софья Морозова',
        phone: '+7 919 833 47 56',
        visits: 2,
        total: 4800
    },
    {
        name: 'Полина Игнатова',
        phone: '+7 977 215 09 38',
        visits: 1,
        total: 2500
    }
];
const THREADS = [
    {
        id: 1,
        name: 'Екатерина Соловьёва',
        last: 'Хорошо, до встречи в понедельник',
        time: '14:42',
        channel: 'TG',
        unread: 2,
        online: true
    },
    {
        id: 2,
        name: 'Марина Лебедева',
        last: 'А можно перенести на час позже?',
        time: '13:18',
        channel: 'TG',
        unread: 1
    },
    {
        id: 3,
        name: 'Ольга Кузнецова',
        last: 'Спасибо! Всё понравилось',
        time: 'вчера',
        channel: 'ВК',
        unread: 0
    },
    {
        id: 4,
        name: 'Анна Петрова',
        last: 'Отправляю фото референса',
        time: 'вчера',
        channel: 'TG',
        unread: 0
    },
    {
        id: 5,
        name: 'Виктория Зайцева',
        last: 'Записалась через сайт',
        time: '2 дн',
        channel: 'Web',
        unread: 0
    },
    {
        id: 6,
        name: 'Дарья Волкова',
        last: 'Ок, увидимся в субботу',
        time: '3 дн',
        channel: 'TG',
        unread: 0
    },
    {
        id: 7,
        name: 'Софья Морозова',
        last: 'Подскажите, есть ли свободное окно',
        time: '5 дн',
        channel: 'ВК',
        unread: 0
    }
];
const MESSAGES = [
    {
        from: 'them',
        text: 'Здравствуйте! Хотела записаться на маникюр',
        t: '14:20'
    },
    {
        from: 'me',
        text: 'Здравствуйте, Екатерина! Конечно. На какой день удобно?',
        t: '14:21'
    },
    {
        from: 'them',
        text: 'В понедельник в первой половине дня?',
        t: '14:25'
    },
    {
        from: 'me',
        text: 'Есть слот в 10:00. Маникюр с покрытием — 2 500 ₽, около 90 минут.',
        t: '14:26'
    },
    {
        from: 'them',
        text: 'Отлично, записываюсь',
        t: '14:40'
    },
    {
        from: 'me',
        text: 'Записала. Адрес и напоминание пришлю утром.',
        t: '14:41'
    },
    {
        from: 'them',
        text: 'Хорошо, до встречи в понедельник',
        t: '14:42'
    }
];
const TEMPLATES = [
    {
        id: 'confirm',
        name: 'Подтверждение записи',
        body: 'Здравствуйте, {имя}. Подтверждаю запись на {дата} в {время}, {услуга}. Адрес и детали в закреплённом сообщении.'
    },
    {
        id: 'remind',
        name: 'Напоминание за день',
        body: 'Напоминаю про завтрашний визит — {дата}, {время}. Если планы поменялись, напишите, переназначим.'
    },
    {
        id: 'thanks',
        name: 'Благодарность после визита',
        body: 'Спасибо, что были у меня сегодня! Если всё понравилось, можно оставить отзыв по ссылке: {ссылка}'
    },
    {
        id: 'review',
        name: 'Запрос отзыва',
        body: 'Поделитесь впечатлением от визита — это помогает другим клиентам выбрать мастера.'
    },
    {
        id: 'promo',
        name: 'Анонс акции',
        body: 'На этой неделе действует -15% на {услуга}. Чтобы записаться, ответьте на это сообщение.'
    }
];
const REVIEWS = [
    {
        name: 'Екатерина Соловьёва',
        stars: 5,
        text: 'Алина — мастер с большой буквы. Стерильно, аккуратно, никакой суеты.',
        date: '2 мая'
    },
    {
        name: 'Марина Лебедева',
        stars: 5,
        text: 'Хожу больше года. Покрытие держится 3+ недели стабильно.',
        date: '28 апр'
    },
    {
        name: 'Ольга Кузнецова',
        stars: 4,
        text: 'Качество отличное, но кабинет на 5-м этаже без лифта — это минус.',
        date: '24 апр'
    },
    {
        name: 'Анна Петрова',
        stars: 5,
        text: 'Дизайн получился лучше, чем на референсе. Спасибо!',
        date: '21 апр'
    },
    {
        name: 'Виктория Зайцева',
        stars: 5,
        text: 'Очень внимательный мастер. Записалась снова на месяц вперёд.',
        date: '17 апр'
    }
];
const REVENUE_WEEK = [
    {
        d: 'Пн',
        v: 8400,
        active: false
    },
    {
        d: 'Вт',
        v: 12200,
        active: false
    },
    {
        d: 'Ср',
        v: 6800,
        active: false
    },
    {
        d: 'Чт',
        v: 14600,
        active: false
    },
    {
        d: 'Пт',
        v: 11200,
        active: false
    },
    {
        d: 'Сб',
        v: 18400,
        active: true
    },
    {
        d: 'Вс',
        v: 9200,
        active: false
    }
];
const SCHEDULE_DEFAULT = [
    {
        d: 'Пн',
        from: '10:00',
        to: '20:00',
        on: true
    },
    {
        d: 'Вт',
        from: '10:00',
        to: '20:00',
        on: true
    },
    {
        d: 'Ср',
        from: '10:00',
        to: '20:00',
        on: true
    },
    {
        d: 'Чт',
        from: '10:00',
        to: '20:00',
        on: true
    },
    {
        d: 'Пт',
        from: '10:00',
        to: '18:00',
        on: true
    },
    {
        d: 'Сб',
        from: '11:00',
        to: '17:00',
        on: true
    },
    {
        d: 'Вс',
        from: '—',
        to: '—',
        on: false
    }
];
const INTEGRATIONS = [
    {
        id: 'tg',
        name: 'Telegram-бот',
        sub: 'Принимает записи и пишет напоминания',
        icon: 'send',
        on: true
    },
    {
        id: 'vk',
        name: 'ВКонтакте',
        sub: 'Кнопка записи в группе',
        icon: 'message-square',
        on: true
    },
    {
        id: 'ig',
        name: 'Instagram',
        sub: 'DM и stories',
        icon: 'instagram',
        on: false
    },
    {
        id: 'web',
        name: 'Сайт-виджет',
        sub: 'Iframe с расписанием',
        icon: 'code',
        on: true
    },
    {
        id: 'gcal',
        name: 'Google Calendar',
        sub: 'Двусторонняя синхронизация',
        icon: 'calendar-days',
        on: false
    },
    {
        id: 'ymap',
        name: 'Яндекс.Карты',
        sub: 'Карточка организации',
        icon: 'map-pin',
        on: true
    }
];
const SOURCES = [
    {
        name: 'Прямая ссылка',
        records: 24,
        conv: 0.62,
        key: 'direct'
    },
    {
        name: 'Telegram',
        records: 18,
        conv: 0.58,
        key: 'tg'
    },
    {
        name: 'Сайт',
        records: 9,
        conv: 0.41,
        key: 'site'
    },
    {
        name: 'ВКонтакте',
        records: 6,
        conv: 0.34,
        key: 'vk'
    },
    {
        name: 'Instagram',
        records: 4,
        conv: 0.22,
        key: 'ig'
    }
];
const FINANCE_OPS = [
    {
        date: '4 мая',
        desc: 'Маникюр — Екатерина С.',
        amount: 2500
    },
    {
        date: '4 мая',
        desc: 'Дизайн — Марина Л.',
        amount: 1500
    },
    {
        date: '3 мая',
        desc: 'Вывод на карту •• 4421',
        amount: -18000
    },
    {
        date: '3 мая',
        desc: 'Маникюр — Ольга К.',
        amount: 2500
    },
    {
        date: '3 мая',
        desc: 'Снятие — Анна П.',
        amount: 800
    },
    {
        date: '2 мая',
        desc: 'Френч — Виктория З.',
        amount: 2200
    },
    {
        date: '2 мая',
        desc: 'Комиссия эквайринга',
        amount: -132
    },
    {
        date: '1 мая',
        desc: 'Маникюр — Дарья В.',
        amount: 2500
    }
];
const CAMPAIGNS = [
    {
        name: 'Майские праздники −15%',
        sent: 142,
        opened: 88,
        clicked: 23,
        status: 'active'
    },
    {
        name: 'Возврат давних клиентов',
        sent: 31,
        opened: 19,
        clicked: 6,
        status: 'active'
    },
    {
        name: 'Анонс новых услуг',
        sent: 198,
        opened: 120,
        clicked: 41,
        status: 'finished'
    }
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/dashboard-demo.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DASHBOARD_DEMO_PARAM",
    ()=>DASHBOARD_DEMO_PARAM,
    "getDashboardDemoStorageKey",
    ()=>getDashboardDemoStorageKey,
    "isDashboardDemoEnabled",
    ()=>isDashboardDemoEnabled,
    "toggleDashboardDemoHref",
    ()=>toggleDashboardDemoHref,
    "withDashboardDemoParam",
    ()=>withDashboardDemoParam
]);
const DASHBOARD_DEMO_PARAM = 'demo';
function isDashboardDemoEnabled(searchParams) {
    return searchParams?.get(DASHBOARD_DEMO_PARAM) === '1' || searchParams?.get('mode') === 'demo';
}
function withDashboardDemoParam(href, enabled) {
    if (!enabled || !href.startsWith('/dashboard')) {
        return href;
    }
    const [pathWithQuery, hash = ''] = href.split('#');
    const [pathname, query = ''] = pathWithQuery.split('?');
    const params = new URLSearchParams(query);
    params.set(DASHBOARD_DEMO_PARAM, '1');
    params.delete('mode');
    const nextQuery = params.toString();
    return `${pathname}${nextQuery ? `?${nextQuery}` : ''}${hash ? `#${hash}` : ''}`;
}
function toggleDashboardDemoHref(pathname, searchParams, enabled) {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    if (enabled) {
        params.delete(DASHBOARD_DEMO_PARAM);
        params.delete('mode');
    } else {
        params.set(DASHBOARD_DEMO_PARAM, '1');
    }
    const nextQuery = params.toString();
    return `${pathname}${nextQuery ? `?${nextQuery}` : ''}`;
}
function getDashboardDemoStorageKey(scope) {
    return `sloty-demo:${scope}`;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/app-context.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AppProvider",
    ()=>AppProvider,
    "useApp",
    ()=>useApp
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$locale$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/locale-context.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/client.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2d$miniapp$2d$auth$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/telegram-miniapp-auth-client.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$workspace$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/workspace-store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$demo$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/demo-data.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$dashboard$2d$demo$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/dashboard-demo.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
;
const AppContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
function buildProfile(values, previous) {
    const priceHint = 'priceHint' in values ? values.priceHint?.trim() || undefined : previous?.priceHint;
    const experienceLabel = 'experienceLabel' in values ? values.experienceLabel?.trim() || undefined : previous?.experienceLabel;
    const responseTime = 'responseTime' in values ? values.responseTime?.trim() || undefined : previous?.responseTime;
    const workGallery = values.workGallery ?? previous?.workGallery;
    const reviews = values.reviews ?? previous?.reviews;
    const locationMode = 'locationMode' in values ? values.locationMode ?? previous?.locationMode ?? 'online' : previous?.locationMode ?? 'online';
    const address = 'address' in values ? values.address?.trim() || undefined : previous?.address;
    const mapUrl = 'mapUrl' in values ? values.mapUrl?.trim() || undefined : previous?.mapUrl;
    const rating = typeof values.rating === 'number' ? values.rating : previous?.rating;
    const reviewCount = typeof values.reviewCount === 'number' ? values.reviewCount : previous?.reviewCount;
    return {
        id: previous?.id ?? crypto.randomUUID(),
        slug: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["slugify"])(values.slug || values.name),
        name: values.name.trim(),
        profession: values.profession.trim(),
        city: values.city.trim(),
        bio: values.bio.trim(),
        services: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseServices"])(values.servicesText),
        phone: values.phone.trim() || undefined,
        telegram: values.telegram.trim() || undefined,
        whatsapp: values.whatsapp.trim() || undefined,
        locationMode,
        address,
        mapUrl,
        hidePhone: values.hidePhone,
        hideTelegram: values.hideTelegram,
        hideWhatsapp: values.hideWhatsapp,
        avatar: values.avatar.trim() || undefined,
        priceHint,
        experienceLabel,
        responseTime,
        workGallery,
        reviews,
        rating,
        reviewCount,
        createdAt: previous?.createdAt ?? new Date().toISOString()
    };
}
const BOOKING_STATUSES = [
    'new',
    'confirmed',
    'completed',
    'no_show',
    'cancelled'
];
function valueToString(value, fallback = '') {
    if (typeof value === 'string') return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
    return fallback;
}
function optionalString(value) {
    const text = valueToString(value);
    return text || undefined;
}
function objectRecord(value) {
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}
function normalizeServiceList(value) {
    const rawItems = Array.isArray(value) ? value : typeof value === 'string' ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseServices"])(value) : [];
    return Array.from(new Map(rawItems.map((item)=>{
        if (typeof item === 'string' || typeof item === 'number') return valueToString(item);
        const row = objectRecord(item);
        return valueToString(row.name ?? row.title ?? row.label ?? row.service);
    }).filter(Boolean).map((item)=>[
            item.toLowerCase(),
            item
        ])).values());
}
function normalizeLocationMode(value) {
    return value === 'address' ? 'address' : 'online';
}
function normalizeWorkGallery(value) {
    if (!Array.isArray(value)) return [];
    return value.map((item, index)=>{
        const row = objectRecord(item);
        const title = valueToString(row.title ?? row.name);
        const image = valueToString(row.image ?? row.url ?? row.src);
        if (!title && !image) return null;
        return {
            id: valueToString(row.id, `work-${index}`),
            title,
            image,
            note: optionalString(row.note ?? row.description)
        };
    }).filter((item)=>Boolean(item));
}
function normalizeReviews(value) {
    if (!Array.isArray(value)) return [];
    return value.map((item, index)=>{
        const row = objectRecord(item);
        const author = valueToString(row.author ?? row.name ?? row.clientName);
        const text = valueToString(row.text ?? row.message ?? row.comment);
        if (!author && !text) return null;
        const rating = Number(row.rating ?? 5);
        return {
            id: valueToString(row.id, `review-${index}`),
            author: author || 'Клиент',
            text,
            rating: Number.isFinite(rating) ? Math.min(5, Math.max(1, rating)) : 5,
            dateLabel: optionalString(row.dateLabel ?? row.date),
            service: optionalString(row.service)
        };
    }).filter((item)=>Boolean(item));
}
function normalizeProfile(value) {
    const row = objectRecord(value);
    if (Object.keys(row).length === 0) return null;
    const rawName = valueToString(row.name ?? row.masterName ?? row.title ?? row.displayName);
    const rawSlug = valueToString(row.slug ?? row.username);
    const name = rawName || 'Профиль мастера';
    const slug = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["slugify"])(rawSlug || name) || 'master';
    const services = normalizeServiceList(row.services ?? row.servicesText);
    const rating = Number(row.rating);
    const reviewCount = Number(row.reviewCount ?? row.review_count);
    return {
        id: valueToString(row.id, slug),
        slug,
        name,
        profession: valueToString(row.profession ?? row.specialization, 'Специалист'),
        city: valueToString(row.city, 'Город'),
        bio: valueToString(row.bio ?? row.description, 'Описание профиля'),
        services,
        phone: optionalString(row.phone),
        telegram: optionalString(row.telegram),
        whatsapp: optionalString(row.whatsapp ?? row.vk),
        locationMode: normalizeLocationMode(row.locationMode ?? row.location_mode),
        address: optionalString(row.address),
        mapUrl: optionalString(row.mapUrl ?? row.map_url),
        hidePhone: Boolean(row.hidePhone ?? row.hide_phone),
        hideTelegram: Boolean(row.hideTelegram ?? row.hide_telegram),
        hideWhatsapp: Boolean(row.hideWhatsapp ?? row.hide_whatsapp),
        avatar: optionalString(row.avatar ?? row.avatarUrl ?? row.photo),
        rating: Number.isFinite(rating) ? rating : undefined,
        reviewCount: Number.isFinite(reviewCount) ? reviewCount : undefined,
        responseTime: optionalString(row.responseTime ?? row.response_time),
        experienceLabel: optionalString(row.experienceLabel ?? row.experience_label),
        priceHint: optionalString(row.priceHint ?? row.price_hint),
        reviews: normalizeReviews(row.reviews),
        workGallery: normalizeWorkGallery(row.workGallery ?? row.work_gallery),
        createdAt: valueToString(row.createdAt ?? row.created_at, new Date().toISOString())
    };
}
function normalizeBookingStatus(value) {
    return BOOKING_STATUSES.includes(value) ? value : 'new';
}
function normalizeBooking(value, index) {
    const row = objectRecord(value);
    if (Object.keys(row).length === 0) return null;
    const clientName = valueToString(row.clientName ?? row.client_name ?? row.name, 'Клиент');
    const clientPhone = valueToString(row.clientPhone ?? row.client_phone ?? row.phone, '');
    const service = valueToString(row.service ?? row.serviceName ?? row.service_name, 'Услуга');
    const date = valueToString(row.date, new Date().toISOString().slice(0, 10));
    const time = valueToString(row.time, '10:00').slice(0, 5);
    const createdAt = valueToString(row.createdAt ?? row.created_at, new Date().toISOString());
    const priceAmount = Number(row.priceAmount ?? row.price_amount);
    const durationMinutes = Number(row.durationMinutes ?? row.duration_minutes);
    const metadata = row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata) ? row.metadata : undefined;
    return {
        id: valueToString(row.id, `booking-${index}-${date}-${time}`),
        masterSlug: valueToString(row.masterSlug ?? row.master_slug ?? row.slug),
        clientName,
        clientPhone,
        service,
        date,
        time,
        comment: optionalString(row.comment),
        status: normalizeBookingStatus(row.status),
        createdAt,
        source: optionalString(row.source),
        channel: optionalString(row.channel),
        priceAmount: Number.isFinite(priceAmount) ? priceAmount : undefined,
        durationMinutes: Number.isFinite(durationMinutes) ? durationMinutes : undefined,
        confirmedAt: optionalString(row.confirmedAt ?? row.confirmed_at),
        completedAt: optionalString(row.completedAt ?? row.completed_at),
        noShowAt: optionalString(row.noShowAt ?? row.no_show_at),
        cancelledAt: optionalString(row.cancelledAt ?? row.cancelled_at),
        cancelReason: optionalString(row.cancelReason ?? row.cancel_reason),
        statusCheckSentAt: optionalString(row.statusCheckSentAt ?? row.status_check_sent_at),
        metadata
    };
}
function normalizeBookings(value, fallbackSlug) {
    if (!Array.isArray(value)) return [];
    return value.map((item, index)=>normalizeBooking(item, index)).filter((item)=>Boolean(item)).map((booking)=>({
            ...booking,
            masterSlug: booking.masterSlug || fallbackSlug || ''
        }));
}
function normalizeWorkspaceData(value, fallbackSlug) {
    const source = objectRecord(value);
    const bookings = normalizeBookings(source.bookings, fallbackSlug);
    return {
        ...source,
        bookings
    };
}
function buildBooking(masterSlug, values) {
    return {
        masterSlug,
        clientName: values.clientName.trim(),
        clientPhone: values.clientPhone.trim(),
        service: values.service.trim(),
        date: values.date,
        time: values.time,
        comment: values.comment.trim() || undefined
    };
}
function detectBookingClientChannel() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const telegramWebApp = window.Telegram?.WebApp;
    const params = new URLSearchParams(window.location.search);
    const hasTelegramContext = Boolean(telegramWebApp?.initData) || params.has('tgWebAppData') || params.get('source') === 'telegram';
    const hasVkContext = Boolean(params.get('vk_app_id') || params.get('viewer_id') || params.get('vk_user_id') || params.get('source') === 'vk');
    if (hasTelegramContext) {
        return {
            sourceChannel: 'telegram',
            source: 'Telegram',
            clientContext: {
                entry: 'telegram',
                hasInitData: Boolean(telegramWebApp?.initData)
            }
        };
    }
    if (hasVkContext) {
        return {
            sourceChannel: 'vk',
            source: 'VK',
            clientContext: {
                entry: 'vk'
            }
        };
    }
    return {
        sourceChannel: 'web',
        source: 'Web',
        clientContext: {
            entry: 'public_page'
        }
    };
}
async function parseJson(response) {
    return await response.json();
}
async function getAuthHeaders(includeJson = false) {
    const headers = includeJson ? {
        'Content-Type': 'application/json'
    } : {};
    try {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
            headers.Authorization = `Bearer ${session.access_token}`;
        }
    } catch  {
    // Cookie-based Telegram app auth can still work without the fallback header.
    }
    Object.assign(headers, (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2d$miniapp$2d$auth$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getTelegramAppSessionHeaders"])());
    return headers;
}
function mergeHeaders(...sources) {
    const headers = new Headers();
    for (const source of sources){
        if (!source) continue;
        new Headers(source).forEach((value, key)=>headers.set(key, value));
    }
    return headers;
}
async function ensureTelegramMiniAppSessionIfNeeded(options) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2d$miniapp$2d$auth$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasTelegramMiniAppRuntime"])()) return;
    const hasStoredToken = Boolean((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2d$miniapp$2d$auth$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getStoredTelegramAppSessionToken"])());
    if (hasStoredToken && !options?.force) return;
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2d$miniapp$2d$auth$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["authorizeTelegramMiniAppSession"])(options);
}
async function fetchWithTelegramMiniAppRetry(input, init) {
    const response = await fetch(input, init);
    if (response.status !== 401) {
        return response;
    }
    await ensureTelegramMiniAppSessionIfNeeded({
        force: true,
        waitMs: 2600
    });
    if (Object.keys((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2d$miniapp$2d$auth$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getTelegramAppSessionHeaders"])()).length === 0) {
        return response;
    }
    return fetch(input, {
        ...init,
        credentials: init?.credentials ?? 'include',
        cache: init?.cache ?? 'no-store',
        headers: mergeHeaders(init?.headers, await getAuthHeaders(false))
    });
}
function AppProvider({ children }) {
    _s();
    const { copy, locale } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$locale$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLocale"])();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const [hasHydrated, setHasHydrated] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [workspaceId, setWorkspaceId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [ownedProfile, setOwnedProfile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [storedBookings, setStoredBookings] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [workspaceData, setWorkspaceData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const applySnapshot = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AppProvider.useCallback[applySnapshot]": (snapshot)=>{
            if (!snapshot) {
                setWorkspaceId(null);
                setOwnedProfile(null);
                setStoredBookings([]);
                setWorkspaceData({});
                return;
            }
            const safeProfile = normalizeProfile(snapshot.profile);
            const safeData = normalizeWorkspaceData(snapshot.data, safeProfile?.slug ?? snapshot.slug);
            const safeBookings = Array.isArray(safeData.bookings) ? safeData.bookings : [];
            setWorkspaceId(valueToString(snapshot.id));
            setOwnedProfile(safeProfile);
            setStoredBookings(safeBookings);
            setWorkspaceData(safeData);
        }
    }["AppProvider.useCallback[applySnapshot]"], []);
    const refreshWorkspace = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AppProvider.useCallback[refreshWorkspace]": async ()=>{
            try {
                await ensureTelegramMiniAppSessionIfNeeded({
                    waitMs: 1400
                });
                const response = await fetchWithTelegramMiniAppRetry('/api/workspace', {
                    credentials: 'include',
                    cache: 'no-store',
                    headers: await getAuthHeaders()
                });
                if (response.status === 401 || response.status === 404) {
                    applySnapshot(null);
                    return;
                }
                if (!response.ok) {
                    throw new Error('workspace_fetch_failed');
                }
                const snapshot = await parseJson(response);
                applySnapshot(snapshot);
            } catch  {
                applySnapshot(null);
            }
        }
    }["AppProvider.useCallback[refreshWorkspace]"], [
        applySnapshot
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AppProvider.useEffect": ()=>{
            let active = true;
            if (pathname === '/app') {
                setHasHydrated(true);
                return ({
                    "AppProvider.useEffect": ()=>{
                        active = false;
                    }
                })["AppProvider.useEffect"];
            }
            ({
                "AppProvider.useEffect": async ()=>{
                    await refreshWorkspace();
                    if (active) {
                        setHasHydrated(true);
                    }
                }
            })["AppProvider.useEffect"]();
            return ({
                "AppProvider.useEffect": ()=>{
                    active = false;
                }
            })["AppProvider.useEffect"];
        }
    }["AppProvider.useEffect"], [
        pathname,
        refreshWorkspace
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AppProvider.useEffect": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            const handleAuthReady = {
                "AppProvider.useEffect.handleAuthReady": ()=>{
                    if (pathname === '/app') return;
                    void refreshWorkspace();
                }
            }["AppProvider.useEffect.handleAuthReady"];
            window.addEventListener(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2d$miniapp$2d$auth$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CLICKBOOK_AUTH_SESSION_READY_EVENT"], handleAuthReady);
            return ({
                "AppProvider.useEffect": ()=>{
                    window.removeEventListener(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2d$miniapp$2d$auth$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CLICKBOOK_AUTH_SESSION_READY_EVENT"], handleAuthReady);
                }
            })["AppProvider.useEffect"];
        }
    }["AppProvider.useEffect"], [
        pathname,
        refreshWorkspace
    ]);
    const profiles = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "AppProvider.useMemo[profiles]": ()=>{
            return ownedProfile ? [
                ownedProfile
            ] : [];
        }
    }["AppProvider.useMemo[profiles]"], [
        ownedProfile
    ]);
    const bookings = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "AppProvider.useMemo[bookings]": ()=>{
            return [
                ...storedBookings
            ].sort({
                "AppProvider.useMemo[bookings]": (a, b)=>new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            }["AppProvider.useMemo[bookings]"]);
        }
    }["AppProvider.useMemo[bookings]"], [
        storedBookings
    ]);
    const getProfileBySlug = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AppProvider.useCallback[getProfileBySlug]": (slug)=>profiles.find({
                "AppProvider.useCallback[getProfileBySlug]": (profile)=>profile.slug === slug
            }["AppProvider.useCallback[getProfileBySlug]"]) ?? null
    }["AppProvider.useCallback[getProfileBySlug]"], [
        profiles
    ]);
    const getDemoProfileBySlug = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AppProvider.useCallback[getDemoProfileBySlug]": (slug)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$demo$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDemoProfile"])(slug, locale)
    }["AppProvider.useCallback[getDemoProfileBySlug]"], [
        locale
    ]);
    const getBookingsBySlug = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AppProvider.useCallback[getBookingsBySlug]": (slug)=>bookings.filter({
                "AppProvider.useCallback[getBookingsBySlug]": (booking)=>booking.masterSlug === slug
            }["AppProvider.useCallback[getBookingsBySlug]"])
    }["AppProvider.useCallback[getBookingsBySlug]"], [
        bookings
    ]);
    const getDemoBookingsBySlug = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AppProvider.useCallback[getDemoBookingsBySlug]": (slug)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$demo$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDemoBookings"])(slug, locale)
    }["AppProvider.useCallback[getDemoBookingsBySlug]"], [
        locale
    ]);
    const validateProfile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AppProvider.useCallback[validateProfile]": (values, existingProfile)=>{
            const slug = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["slugify"])(values.slug || values.name);
            const services = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseServices"])(values.servicesText);
            if (!values.name.trim()) return copy.validation.masterName;
            if (!values.profession.trim()) return copy.validation.profession;
            if (!values.city.trim()) return copy.validation.city;
            if (!values.bio.trim()) return copy.validation.bio;
            if (!slug) return copy.validation.slug;
            if (services.length === 0) return copy.validation.services;
            return null;
        }
    }["AppProvider.useCallback[validateProfile]"], [
        copy.validation
    ]);
    const validateBooking = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AppProvider.useCallback[validateBooking]": (values)=>{
            if (!values.clientName.trim()) return copy.validation.clientName;
            if (!values.clientPhone.trim()) return copy.validation.clientPhone;
            if (!values.service.trim()) return copy.validation.service;
            if (!values.date) return copy.validation.date;
            if (!values.time) return copy.validation.time;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const selectedDate = new Date(`${values.date}T00:00:00`);
            if (selectedDate.getTime() < today.getTime()) return copy.validation.pastDate;
            return null;
        }
    }["AppProvider.useCallback[validateBooking]"], [
        copy.validation
    ]);
    const saveProfile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AppProvider.useCallback[saveProfile]": async (values)=>{
            const error = validateProfile(values, ownedProfile);
            if (error) {
                return {
                    success: false,
                    error
                };
            }
            const demoMode = ("TURBOPACK compile-time value", "object") !== 'undefined' && (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$dashboard$2d$demo$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isDashboardDemoEnabled"])(new URLSearchParams(window.location.search || ''));
            const previousProfile = demoMode ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$demo$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDemoProfile"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$demo$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SLOTY_DEMO_SLUG"], locale) : ownedProfile;
            const nextProfile = buildProfile(demoMode ? {
                ...values,
                slug: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$demo$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SLOTY_DEMO_SLUG"]
            } : values, previousProfile);
            if (demoMode) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$demo$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["saveStoredDemoProfile"])(nextProfile);
                return {
                    success: true,
                    profile: nextProfile
                };
            }
            try {
                const response = await fetchWithTelegramMiniAppRetry('/api/profile', {
                    method: 'POST',
                    credentials: 'include',
                    cache: 'no-store',
                    headers: await getAuthHeaders(true),
                    body: JSON.stringify({
                        workspaceId,
                        profile: nextProfile,
                        locale
                    })
                });
                if (response.status === 401) {
                    return {
                        success: false,
                        error: locale === 'ru' ? 'Сессия истекла. Войдите снова.' : 'Session expired. Please sign in again.'
                    };
                }
                if (response.status === 409) {
                    return {
                        success: false,
                        error: copy.validation.slugTaken
                    };
                }
                if (response.status === 402) {
                    const payload = await parseJson(response).catch({
                        "AppProvider.useCallback[saveProfile]": ()=>({})
                    }["AppProvider.useCallback[saveProfile]"]);
                    return {
                        success: false,
                        error: locale === 'ru' ? `На текущем тарифе можно сохранить до ${payload.limit ?? 5} активных услуг. Уменьшите список или смените тариф.` : `Your current plan allows up to ${payload.limit ?? 5} active services. Reduce the list or change the plan.`
                    };
                }
                if (!response.ok) {
                    return {
                        success: false,
                        error: locale === 'ru' ? 'Не удалось сохранить данные. Попробуйте ещё раз.' : 'Could not save the data. Please try again.'
                    };
                }
                const snapshot = await parseJson(response);
                const nextData = Object.keys(snapshot.data ?? {}).length > 0 ? snapshot.data : (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$workspace$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildWorkspaceSeed"])(nextProfile, snapshot.data?.bookings ?? [], locale);
                applySnapshot({
                    ...snapshot,
                    data: nextData
                });
                return {
                    success: true,
                    profile: nextProfile
                };
            } catch  {
                return {
                    success: false,
                    error: locale === 'ru' ? 'Не удалось сохранить данные. Попробуйте ещё раз.' : 'Could not save the data. Please try again.'
                };
            }
        }
    }["AppProvider.useCallback[saveProfile]"], [
        applySnapshot,
        copy.validation.slugTaken,
        locale,
        ownedProfile,
        validateProfile,
        workspaceId
    ]);
    const createBooking = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AppProvider.useCallback[createBooking]": async (masterSlug, values)=>{
            const error = validateBooking(values);
            if (error) {
                return {
                    success: false,
                    error
                };
            }
            try {
                const response = await fetch('/api/bookings', {
                    method: 'POST',
                    credentials: 'include',
                    cache: 'no-store',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        masterSlug,
                        values: buildBooking(masterSlug, values),
                        ...detectBookingClientChannel()
                    })
                });
                if (response.status === 409) {
                    return {
                        success: false,
                        error: locale === 'ru' ? 'Это время уже занято или недоступно в графике. Выберите другой слот.' : 'This time is already booked or unavailable. Please choose another slot.'
                    };
                }
                if (!response.ok) {
                    return {
                        success: false,
                        error: locale === 'ru' ? 'Не удалось сохранить данные. Попробуйте ещё раз.' : 'Could not save the data. Please try again.'
                    };
                }
                const payload = await parseJson(response);
                if (ownedProfile?.slug === masterSlug) {
                    setStoredBookings({
                        "AppProvider.useCallback[createBooking]": (current)=>[
                                payload.booking,
                                ...current
                            ]
                    }["AppProvider.useCallback[createBooking]"]);
                    setWorkspaceData({
                        "AppProvider.useCallback[createBooking]": (current)=>({
                                ...current,
                                bookings: [
                                    payload.booking,
                                    ...Array.isArray(current.bookings) ? current.bookings : storedBookings
                                ]
                            })
                    }["AppProvider.useCallback[createBooking]"]);
                }
                return {
                    success: true,
                    booking: payload.booking,
                    telegramConfirmationUrl: payload.telegram?.url ?? payload.telegramConfirmationUrl ?? null,
                    vkConfirmationUrl: payload.vk?.url ?? payload.vkConfirmationUrl ?? null
                };
            } catch  {
                return {
                    success: false,
                    error: locale === 'ru' ? 'Не удалось сохранить данные. Попробуйте ещё раз.' : 'Could not save the data. Please try again.'
                };
            }
        }
    }["AppProvider.useCallback[createBooking]"], [
        locale,
        ownedProfile?.slug,
        storedBookings,
        validateBooking
    ]);
    const updateWorkspaceSection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AppProvider.useCallback[updateWorkspaceSection]": async (section, value)=>{
            if (!workspaceId) return false;
            setWorkspaceData({
                "AppProvider.useCallback[updateWorkspaceSection]": (current)=>({
                        ...current,
                        [section]: value
                    })
            }["AppProvider.useCallback[updateWorkspaceSection]"]);
            if (section === 'bookings' && Array.isArray(value)) {
                setStoredBookings(value);
            }
            try {
                const response = await fetchWithTelegramMiniAppRetry('/api/workspace/section', {
                    method: 'PATCH',
                    credentials: 'include',
                    cache: 'no-store',
                    headers: await getAuthHeaders(true),
                    body: JSON.stringify({
                        workspaceId,
                        section,
                        value
                    })
                });
                if (!response.ok) {
                    await refreshWorkspace();
                    return false;
                }
                return true;
            } catch  {
                return false;
            }
        }
    }["AppProvider.useCallback[updateWorkspaceSection]"], [
        workspaceId,
        refreshWorkspace
    ]);
    const updateBookingStatus = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AppProvider.useCallback[updateBookingStatus]": async (bookingId, status)=>{
            if (!workspaceId) return;
            const optimisticBookings = bookings.map({
                "AppProvider.useCallback[updateBookingStatus].optimisticBookings": (booking)=>booking.id === bookingId ? {
                        ...booking,
                        status
                    } : booking
            }["AppProvider.useCallback[updateBookingStatus].optimisticBookings"]);
            setStoredBookings(optimisticBookings);
            setWorkspaceData({
                "AppProvider.useCallback[updateBookingStatus]": (current)=>({
                        ...current,
                        bookings: optimisticBookings
                    })
            }["AppProvider.useCallback[updateBookingStatus]"]);
            try {
                const response = await fetchWithTelegramMiniAppRetry('/api/bookings', {
                    method: 'PATCH',
                    credentials: 'include',
                    cache: 'no-store',
                    headers: await getAuthHeaders(true),
                    body: JSON.stringify({
                        bookingId,
                        status
                    })
                });
                if (!response.ok) {
                    throw new Error('booking_status_update_failed');
                }
                const payload = await parseJson(response);
                const confirmedBookings = optimisticBookings.map({
                    "AppProvider.useCallback[updateBookingStatus].confirmedBookings": (booking)=>booking.id === bookingId ? payload.booking : booking
                }["AppProvider.useCallback[updateBookingStatus].confirmedBookings"]);
                setStoredBookings(confirmedBookings);
                setWorkspaceData({
                    "AppProvider.useCallback[updateBookingStatus]": (current)=>({
                            ...current,
                            bookings: confirmedBookings
                        })
                }["AppProvider.useCallback[updateBookingStatus]"]);
            } catch  {
                await refreshWorkspace();
            }
        }
    }["AppProvider.useCallback[updateBookingStatus]"], [
        bookings,
        refreshWorkspace,
        workspaceId
    ]);
    const getPublicPath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AppProvider.useCallback[getPublicPath]": (slug)=>`/m/${slug}`
    }["AppProvider.useCallback[getPublicPath]"], []);
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "AppProvider.useMemo[value]": ()=>({
                hasHydrated,
                workspaceId,
                ownedProfile,
                profiles,
                bookings,
                workspaceData,
                saveProfile,
                createBooking,
                updateBookingStatus,
                updateWorkspaceSection,
                refreshWorkspace,
                getProfileBySlug,
                getDemoProfileBySlug,
                getBookingsBySlug,
                getDemoBookingsBySlug,
                getPublicPath
            })
    }["AppProvider.useMemo[value]"], [
        bookings,
        createBooking,
        getBookingsBySlug,
        getDemoBookingsBySlug,
        getDemoProfileBySlug,
        getProfileBySlug,
        getPublicPath,
        hasHydrated,
        ownedProfile,
        profiles,
        refreshWorkspace,
        saveProfile,
        updateBookingStatus,
        updateWorkspaceSection,
        workspaceData,
        workspaceId
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AppContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/lib/app-context.tsx",
        lineNumber: 863,
        columnNumber: 10
    }, this);
}
_s(AppProvider, "x0iRHjUktQy2erHIxn2D8nNCiKw=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$locale$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLocale"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"]
    ];
});
_c = AppProvider;
function useApp() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
}
_s1(useApp, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "AppProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/appearance-palette.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "accentPalette",
    ()=>accentPalette,
    "accentToneValues",
    ()=>accentToneValues
]);
const accentToneValues = [
    'emerald',
    'violet',
    'sky',
    'rose',
    'amber',
    'cyan',
    'indigo',
    'peach',
    'teal',
    'cobalt',
    'ruby',
    'lime'
];
const accentPalette = {
    emerald: {
        hue: '164',
        sat: '80%',
        solid: '#10b981',
        soft: 'rgba(16, 185, 129, 0.14)',
        gradient: 'linear-gradient(135deg, #10b981, #0f9f70)'
    },
    violet: {
        hue: '258',
        sat: '88%',
        solid: '#8b5cf6',
        soft: 'rgba(139, 92, 246, 0.14)',
        gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
    },
    sky: {
        hue: '199',
        sat: '92%',
        solid: '#0ea5e9',
        soft: 'rgba(14, 165, 233, 0.14)',
        gradient: 'linear-gradient(135deg, #0ea5e9, #0284c7)'
    },
    rose: {
        hue: '340',
        sat: '82%',
        solid: '#f43f5e',
        soft: 'rgba(244, 63, 94, 0.14)',
        gradient: 'linear-gradient(135deg, #f43f5e, #e11d48)'
    },
    amber: {
        hue: '38',
        sat: '92%',
        solid: '#f59e0b',
        soft: 'rgba(245, 158, 11, 0.14)',
        gradient: 'linear-gradient(135deg, #f59e0b, #d97706)'
    },
    cyan: {
        hue: '188',
        sat: '94%',
        solid: '#06b6d4',
        soft: 'rgba(6, 182, 212, 0.14)',
        gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)'
    },
    indigo: {
        hue: '236',
        sat: '83%',
        solid: '#6366f1',
        soft: 'rgba(99, 102, 241, 0.14)',
        gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)'
    },
    peach: {
        hue: '18',
        sat: '95%',
        solid: '#fb7185',
        soft: 'rgba(251, 113, 133, 0.14)',
        gradient: 'linear-gradient(135deg, #fb7185, #f43f5e)'
    },
    teal: {
        hue: '173',
        sat: '80%',
        solid: '#14b8a6',
        soft: 'rgba(20, 184, 166, 0.14)',
        gradient: 'linear-gradient(135deg, #14b8a6, #0f766e)'
    },
    cobalt: {
        hue: '214',
        sat: '99%',
        solid: '#127dfe',
        soft: 'rgba(18, 125, 254, 0.14)',
        gradient: 'linear-gradient(135deg, #127dfe, #0f6fe1)'
    },
    ruby: {
        hue: '350',
        sat: '78%',
        solid: '#dc2626',
        soft: 'rgba(220, 38, 38, 0.14)',
        gradient: 'linear-gradient(135deg, #dc2626, #b91c1c)'
    },
    lime: {
        hue: '84',
        sat: '80%',
        solid: '#84cc16',
        soft: 'rgba(132, 204, 22, 0.14)',
        gradient: 'linear-gradient(135deg, #84cc16, #65a30d)'
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/appearance.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "APPEARANCE_STORAGE_KEY",
    ()=>APPEARANCE_STORAGE_KEY,
    "applyAppearanceToElement",
    ()=>applyAppearanceToElement,
    "buildAppearancePreferenceScript",
    ()=>buildAppearancePreferenceScript,
    "defaultAppearanceSettings",
    ()=>defaultAppearanceSettings,
    "defaultLayoutConstructor",
    ()=>defaultLayoutConstructor,
    "getPublicButtonClassName",
    ()=>getPublicButtonClassName,
    "normalizeAppearanceSettings",
    ()=>normalizeAppearanceSettings,
    "normalizeLayoutConstructor",
    ()=>normalizeLayoutConstructor
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$appearance$2d$palette$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/appearance-palette.ts [app-client] (ecmascript)");
;
const APPEARANCE_STORAGE_KEY = 'sloty-appearance-settings';
const defaultLayoutConstructor = {
    dashboard: {
        layout: 'balanced',
        order: [
            'summary',
            'pipeline',
            'week',
            'highlights'
        ]
    },
    today: {
        layout: 'balanced',
        order: [
            'summary',
            'timeline',
            'queue',
            'insights'
        ]
    },
    stats: {
        layout: 'balanced',
        order: [
            'summary',
            'journal',
            'activity',
            'signals'
        ]
    },
    chats: {
        layout: 'balanced',
        order: [
            'inbox',
            'conversation',
            'assistant',
            'clientCard'
        ]
    },
    services: {
        layout: 'split',
        order: [
            'summary',
            'catalog',
            'preview',
            'quickAdd'
        ]
    },
    availability: {
        layout: 'split',
        order: [
            'summary',
            'editor',
            'presets'
        ]
    },
    public: {
        layout: 'split',
        order: [
            'hero',
            'services',
            'booking',
            'contacts',
            'faq',
            'gallery'
        ]
    }
};
const defaultAppearanceSettings = {
    accentTone: 'cobalt',
    neutralTone: 'zinc',
    density: 'standard',
    radius: 'medium',
    motion: 'smooth',
    cardStyle: 'soft',
    dashboardSurface: 'calm',
    dashboardControlStyle: 'capsule',
    publicCover: 'gradient',
    publicAccent: 'cobalt',
    publicButtonStyle: 'pill',
    publicCardStyle: 'soft',
    publicServicesStyle: 'grid',
    publicBookingStyle: 'panel',
    publicHeroLayout: 'split',
    publicSurface: 'soft',
    publicSectionStyle: 'cards',
    publicGalleryStyle: 'grid',
    publicNavigationStyle: 'side',
    publicStatsStyle: 'cards',
    publicCtaMode: 'sticky',
    platformWidth: 'balanced',
    sidebarDensity: 'balanced',
    topbarDensity: 'balanced',
    mobileFontScale: 'compact',
    layoutConstructor: defaultLayoutConstructor
};
const appearanceValueMap = {
    accentTone: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$appearance$2d$palette$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["accentToneValues"],
    neutralTone: [
        'zinc',
        'slate',
        'stone',
        'pearl',
        'sage',
        'sand'
    ],
    density: [
        'compact',
        'standard',
        'airy'
    ],
    radius: [
        'soft',
        'medium',
        'tight'
    ],
    motion: [
        'off',
        'fast',
        'smooth'
    ],
    cardStyle: [
        'flat',
        'soft',
        'glass'
    ],
    dashboardSurface: [
        'calm',
        'clear',
        'contrast'
    ],
    dashboardControlStyle: [
        'capsule',
        'line',
        'solid'
    ],
    publicCover: [
        'gradient',
        'portrait',
        'minimal'
    ],
    publicAccent: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$appearance$2d$palette$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["accentToneValues"],
    publicButtonStyle: [
        'pill',
        'rounded',
        'contrast'
    ],
    publicCardStyle: [
        'editorial',
        'soft',
        'compact'
    ],
    publicServicesStyle: [
        'grid',
        'chips',
        'stacked'
    ],
    publicBookingStyle: [
        'panel',
        'step',
        'minimal'
    ],
    publicHeroLayout: [
        'split',
        'centered',
        'compact'
    ],
    publicSurface: [
        'soft',
        'contrast',
        'glass'
    ],
    publicSectionStyle: [
        'cards',
        'minimal',
        'dividers'
    ],
    publicGalleryStyle: [
        'grid',
        'editorial',
        'compact'
    ],
    publicNavigationStyle: [
        'side',
        'top',
        'hidden'
    ],
    publicStatsStyle: [
        'cards',
        'strip',
        'hidden'
    ],
    publicCtaMode: [
        'sticky',
        'inline',
        'quiet'
    ],
    platformWidth: [
        'focused',
        'balanced',
        'wide'
    ],
    sidebarDensity: [
        'tight',
        'balanced',
        'roomy'
    ],
    topbarDensity: [
        'tight',
        'balanced',
        'roomy'
    ],
    mobileFontScale: [
        'compact',
        'standard'
    ]
};
const constructorOrderMap = {
    dashboard: defaultLayoutConstructor.dashboard.order,
    today: defaultLayoutConstructor.today.order,
    stats: defaultLayoutConstructor.stats.order,
    chats: defaultLayoutConstructor.chats.order,
    services: defaultLayoutConstructor.services.order,
    availability: defaultLayoutConstructor.availability.order,
    public: defaultLayoutConstructor.public.order
};
const constructorLayoutMap = {
    dashboard: [
        'balanced',
        'focus',
        'stacked'
    ],
    today: [
        'balanced',
        'priority',
        'stacked'
    ],
    stats: [
        'balanced',
        'detail',
        'stacked'
    ],
    chats: [
        'balanced',
        'focus',
        'assistant'
    ],
    services: [
        'split',
        'catalog',
        'stacked'
    ],
    availability: [
        'split',
        'helper',
        'stacked'
    ],
    public: [
        'split',
        'booking',
        'stacked'
    ]
};
function normalizeOrder(value, fallback) {
    const allowed = new Set(fallback);
    const raw = Array.isArray(value) ? value : [];
    const valid = raw.filter((item)=>typeof item === 'string' && allowed.has(item));
    const unique = Array.from(new Set(valid));
    return [
        ...unique,
        ...fallback.filter((item)=>!unique.includes(item))
    ];
}
function normalizeLayoutConstructor(value) {
    return {
        dashboard: {
            layout: value?.dashboard?.layout && constructorLayoutMap.dashboard.includes(value.dashboard.layout) ? value.dashboard.layout : defaultLayoutConstructor.dashboard.layout,
            order: normalizeOrder(value?.dashboard?.order, constructorOrderMap.dashboard)
        },
        today: {
            layout: value?.today?.layout && constructorLayoutMap.today.includes(value.today.layout) ? value.today.layout : defaultLayoutConstructor.today.layout,
            order: normalizeOrder(value?.today?.order, constructorOrderMap.today)
        },
        stats: {
            layout: value?.stats?.layout && constructorLayoutMap.stats.includes(value.stats.layout) ? value.stats.layout : defaultLayoutConstructor.stats.layout,
            order: normalizeOrder(value?.stats?.order, constructorOrderMap.stats)
        },
        chats: {
            layout: value?.chats?.layout && constructorLayoutMap.chats.includes(value.chats.layout) ? value.chats.layout : defaultLayoutConstructor.chats.layout,
            order: normalizeOrder(value?.chats?.order, constructorOrderMap.chats)
        },
        services: {
            layout: value?.services?.layout && constructorLayoutMap.services.includes(value.services.layout) ? value.services.layout : defaultLayoutConstructor.services.layout,
            order: normalizeOrder(value?.services?.order, constructorOrderMap.services)
        },
        availability: {
            layout: value?.availability?.layout && constructorLayoutMap.availability.includes(value.availability.layout) ? value.availability.layout : defaultLayoutConstructor.availability.layout,
            order: normalizeOrder(value?.availability?.order, constructorOrderMap.availability)
        },
        public: {
            layout: value?.public?.layout && constructorLayoutMap.public.includes(value.public.layout) ? value.public.layout : defaultLayoutConstructor.public.layout,
            order: normalizeOrder(value?.public?.order, constructorOrderMap.public)
        }
    };
}
function normalizeAppearanceSettings(value) {
    const next = {
        ...defaultAppearanceSettings
    };
    if (!value) {
        return next;
    }
    Object.keys(appearanceValueMap).forEach((key)=>{
        const candidate = value[key];
        const allowed = appearanceValueMap[key];
        if (typeof candidate === 'string' && allowed.includes(candidate)) {
            next[key] = candidate;
        }
    });
    next.layoutConstructor = normalizeLayoutConstructor(typeof value.layoutConstructor === 'object' && value.layoutConstructor ? value.layoutConstructor : null);
    return next;
}
function applyAppearanceToElement(element, settings) {
    const accent = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$appearance$2d$palette$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["accentPalette"][settings.accentTone] ?? __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$appearance$2d$palette$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["accentPalette"].cobalt;
    const publicAccent = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$appearance$2d$palette$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["accentPalette"][settings.publicAccent] ?? accent;
    element.style.setProperty('--accent-hue', accent.hue);
    element.style.setProperty('--accent-sat', accent.sat);
    element.style.setProperty('--accent-solid', accent.solid);
    element.style.setProperty('--accent-hover', accent.solid);
    element.style.setProperty('--accent-gradient', accent.gradient);
    element.style.setProperty('--accent-soft', accent.soft);
    element.style.setProperty('--primary', accent.solid);
    element.style.setProperty('--primary-hover', accent.solid);
    element.style.setProperty('--gradient-primary', accent.gradient);
    element.style.setProperty('--ring', `color-mix(in srgb, ${accent.solid} 18%, transparent)`);
    element.style.setProperty('--cb-public-accent', publicAccent.solid);
    element.style.setProperty('--cb-public-gradient', publicAccent.gradient);
    element.dataset.slotyAccent = settings.accentTone;
    element.dataset.slotyNeutral = settings.neutralTone;
    element.dataset.slotyDensity = settings.density;
    element.dataset.slotyRadius = settings.radius;
    element.dataset.slotyMotion = settings.motion;
    element.dataset.slotyCardStyle = settings.cardStyle;
    element.dataset.slotyDashboardSurface = settings.dashboardSurface;
    element.dataset.slotyDashboardControl = settings.dashboardControlStyle;
    element.dataset.slotyPublicCover = settings.publicCover;
    element.dataset.slotyPublicAccent = settings.publicAccent;
    element.dataset.slotyPublicButton = settings.publicButtonStyle;
    element.dataset.slotyPublicCard = settings.publicCardStyle;
    element.dataset.slotyPublicServices = settings.publicServicesStyle;
    element.dataset.slotyPublicBooking = settings.publicBookingStyle;
    element.dataset.slotyPublicHero = settings.publicHeroLayout;
    element.dataset.slotyPublicSurface = settings.publicSurface;
    element.dataset.slotyPublicSection = settings.publicSectionStyle;
    element.dataset.slotyPublicGallery = settings.publicGalleryStyle;
    element.dataset.slotyPublicNavigation = settings.publicNavigationStyle;
    element.dataset.slotyPublicStats = settings.publicStatsStyle;
    element.dataset.slotyPublicCta = settings.publicCtaMode;
    element.dataset.slotyPlatformWidth = settings.platformWidth;
    element.dataset.slotySidebarDensity = settings.sidebarDensity;
    element.dataset.slotyTopbarDensity = settings.topbarDensity;
    element.dataset.slotyMobileScale = settings.mobileFontScale;
}
function buildAppearancePreferenceScript() {
    const fallback = JSON.stringify(defaultAppearanceSettings);
    const key = JSON.stringify(APPEARANCE_STORAGE_KEY);
    const palette = JSON.stringify(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$appearance$2d$palette$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["accentPalette"]);
    return `
    try {
      const fallback = ${fallback};
      const palette = ${palette};
      const raw = window.localStorage.getItem(${key});
      const parsed = raw ? JSON.parse(raw) : fallback;
      const settings = { ...fallback, ...parsed };
      const accent = palette[settings.accentTone] || palette.cobalt;
      const publicAccent = palette[settings.publicAccent] || accent;
      const root = document.documentElement;
      root.style.setProperty('--accent-hue', accent.hue);
      root.style.setProperty('--accent-sat', accent.sat);
      root.style.setProperty('--accent-solid', accent.solid);
      root.style.setProperty('--accent-hover', accent.solid);
      root.style.setProperty('--accent-gradient', accent.gradient);
      root.style.setProperty('--accent-soft', accent.soft);
      root.style.setProperty('--primary', accent.solid);
      root.style.setProperty('--primary-hover', accent.solid);
      root.style.setProperty('--gradient-primary', accent.gradient);
      root.style.setProperty('--ring', 'color-mix(in srgb, ' + accent.solid + ' 18%, transparent)');
      root.style.setProperty('--cb-public-accent', publicAccent.solid);
      root.style.setProperty('--cb-public-gradient', publicAccent.gradient);
      root.dataset.slotyAccent = settings.accentTone;
      root.dataset.slotyNeutral = settings.neutralTone;
      root.dataset.slotyDensity = settings.density;
      root.dataset.slotyRadius = settings.radius;
      root.dataset.slotyMotion = settings.motion;
      root.dataset.slotyCardStyle = settings.cardStyle;
      root.dataset.slotyDashboardSurface = settings.dashboardSurface || 'calm';
      root.dataset.slotyDashboardControl = settings.dashboardControlStyle || 'capsule';
      root.dataset.slotyPublicCover = settings.publicCover;
      root.dataset.slotyPublicAccent = settings.publicAccent;
      root.dataset.slotyPublicButton = settings.publicButtonStyle;
      root.dataset.slotyPublicCard = settings.publicCardStyle;
      root.dataset.slotyPublicServices = settings.publicServicesStyle;
      root.dataset.slotyPublicBooking = settings.publicBookingStyle;
      root.dataset.slotyPublicHero = settings.publicHeroLayout;
      root.dataset.slotyPublicSurface = settings.publicSurface;
      root.dataset.slotyPublicSection = settings.publicSectionStyle;
      root.dataset.slotyPublicGallery = settings.publicGalleryStyle;
      root.dataset.slotyPublicNavigation = settings.publicNavigationStyle || 'side';
      root.dataset.slotyPublicStats = settings.publicStatsStyle || 'cards';
      root.dataset.slotyPublicCta = settings.publicCtaMode || 'sticky';
      root.dataset.slotyPlatformWidth = settings.platformWidth;
      root.dataset.slotySidebarDensity = settings.sidebarDensity;
      root.dataset.slotyTopbarDensity = settings.topbarDensity;
      root.dataset.slotyMobileScale = settings.mobileFontScale || 'compact';
    } catch (error) {
      const root = document.documentElement;
      root.dataset.slotyAccent = 'cobalt';
      root.dataset.slotyNeutral = 'zinc';
      root.dataset.slotyDensity = 'standard';
      root.dataset.slotyRadius = 'medium';
      root.dataset.slotyMotion = 'smooth';
      root.dataset.slotyCardStyle = 'soft';
      root.dataset.slotyDashboardSurface = 'calm';
      root.dataset.slotyDashboardControl = 'capsule';
      root.dataset.slotyPublicCover = 'gradient';
      root.dataset.slotyPublicAccent = 'cobalt';
      root.dataset.slotyPublicButton = 'pill';
      root.dataset.slotyPublicCard = 'soft';
      root.dataset.slotyPublicServices = 'grid';
      root.dataset.slotyPublicBooking = 'panel';
      root.dataset.slotyPublicHero = 'split';
      root.dataset.slotyPublicSurface = 'soft';
      root.dataset.slotyPublicSection = 'cards';
      root.dataset.slotyPublicGallery = 'grid';
      root.dataset.slotyPublicNavigation = 'side';
      root.dataset.slotyPublicStats = 'cards';
      root.dataset.slotyPublicCta = 'sticky';
      root.dataset.slotyPlatformWidth = 'balanced';
      root.dataset.slotySidebarDensity = 'balanced';
      root.dataset.slotyTopbarDensity = 'balanced';
      root.dataset.slotyMobileScale = 'compact';
    }
  `;
}
function getPublicButtonClassName(style, variant = 'primary') {
    const shapeClass = style === 'pill' ? 'rounded-full' : style === 'rounded' ? 'rounded-[16px]' : 'rounded-[14px]';
    if (variant === 'primary') {
        if (style === 'contrast') {
            return `${shapeClass} bg-foreground text-background hover:opacity-92`;
        }
        return `${shapeClass}`;
    }
    if (variant === 'secondary') {
        if (style === 'contrast') {
            return `${shapeClass} border-foreground/14 bg-card/88 text-foreground hover:bg-accent`;
        }
        return `${shapeClass} border-border bg-card/88 text-foreground hover:bg-accent`;
    }
    return `${shapeClass} text-muted-foreground hover:bg-accent hover:text-foreground`;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/appearance-context.tsx [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AppearanceProvider",
    ()=>AppearanceProvider,
    "useAppearance",
    ()=>useAppearance
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$browser$2d$search$2d$params$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/use-browser-search-params.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$app$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/app-context.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$appearance$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/appearance.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$dashboard$2d$demo$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/dashboard-demo.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$demo$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/demo-data.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
const AppearanceContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
function applyAppearance(settings) {
    if (typeof document === 'undefined') return;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$appearance$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["applyAppearanceToElement"])(document.documentElement, settings);
}
;
function AppearanceProvider({ children }) {
    _s();
    const { hasHydrated, workspaceId, workspaceData, updateWorkspaceSection } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$app$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useApp"])();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$browser$2d$search$2d$params$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useBrowserSearchParams"])();
    const demoMode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$dashboard$2d$demo$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isDashboardDemoEnabled"])(searchParams);
    const storageKey = demoMode ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$dashboard$2d$demo$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDashboardDemoStorageKey"])('appearance') : __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$appearance$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["APPEARANCE_STORAGE_KEY"];
    const [settings, setSettings] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "AppearanceProvider.useState": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            const currentParams = new URLSearchParams(window.location.search || '');
            const currentDemoMode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$dashboard$2d$demo$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isDashboardDemoEnabled"])(currentParams);
            const currentStorageKey = currentDemoMode ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$dashboard$2d$demo$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDashboardDemoStorageKey"])('appearance') : __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$appearance$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["APPEARANCE_STORAGE_KEY"];
            const fallback = currentDemoMode ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$demo$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDashboardDemoAppearance"])() : __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$appearance$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["defaultAppearanceSettings"];
            try {
                const raw = window.localStorage.getItem(currentStorageKey);
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$appearance$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["normalizeAppearanceSettings"])(raw ? JSON.parse(raw) : fallback);
            } catch  {
                return fallback;
            }
        }
    }["AppearanceProvider.useState"]);
    const lastSavedRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])('');
    const syncedWorkspaceRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AppearanceProvider.useEffect": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            try {
                const raw = window.localStorage.getItem(storageKey);
                const fallback = demoMode ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$demo$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDashboardDemoAppearance"])() : __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$appearance$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["defaultAppearanceSettings"];
                const next = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$appearance$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["normalizeAppearanceSettings"])(raw ? JSON.parse(raw) : fallback);
                setSettings(next);
                applyAppearance(next);
            } catch  {
                const fallback = demoMode ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$demo$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDashboardDemoAppearance"])() : __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$appearance$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["defaultAppearanceSettings"];
                setSettings(fallback);
                applyAppearance(fallback);
            }
        }
    }["AppearanceProvider.useEffect"], [
        demoMode,
        storageKey
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AppearanceProvider.useEffect": ()=>{
            if (demoMode || !hasHydrated) return;
            const remoteSettings = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$appearance$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["normalizeAppearanceSettings"])(workspaceData.appearance ?? null);
            if (!workspaceId) return;
            if (syncedWorkspaceRef.current === workspaceId && lastSavedRef.current) return;
            syncedWorkspaceRef.current = workspaceId;
            lastSavedRef.current = JSON.stringify(remoteSettings);
            setSettings(remoteSettings);
            applyAppearance(remoteSettings);
        }
    }["AppearanceProvider.useEffect"], [
        demoMode,
        hasHydrated,
        workspaceData.appearance,
        workspaceId
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AppearanceProvider.useEffect": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            window.localStorage.setItem(storageKey, JSON.stringify(settings));
            applyAppearance(settings);
            window.dispatchEvent(new CustomEvent('clickbook:appearance-updated', {
                detail: {
                    storageKey,
                    settings
                }
            }));
        }
    }["AppearanceProvider.useEffect"], [
        settings,
        storageKey
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AppearanceProvider.useEffect": ()=>{
            if (demoMode || !workspaceId || !hasHydrated) return;
            const serialized = JSON.stringify(settings);
            if (serialized === lastSavedRef.current) return;
            lastSavedRef.current = serialized;
            const timeout = window.setTimeout({
                "AppearanceProvider.useEffect.timeout": ()=>{
                    void updateWorkspaceSection('appearance', settings);
                    void fetch('/api/appearance', {
                        method: 'PATCH',
                        credentials: 'include',
                        cache: 'no-store',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            workspaceId,
                            settings
                        })
                    }).catch({
                        "AppearanceProvider.useEffect.timeout": ()=>undefined
                    }["AppearanceProvider.useEffect.timeout"]);
                }
            }["AppearanceProvider.useEffect.timeout"], 250);
            return ({
                "AppearanceProvider.useEffect": ()=>{
                    window.clearTimeout(timeout);
                }
            })["AppearanceProvider.useEffect"];
        }
    }["AppearanceProvider.useEffect"], [
        demoMode,
        hasHydrated,
        settings,
        updateWorkspaceSection,
        workspaceId
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AppearanceProvider.useEffect": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            const handleStorage = {
                "AppearanceProvider.useEffect.handleStorage": (event)=>{
                    if (event.key !== storageKey) return;
                    const fallback = demoMode ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$demo$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDashboardDemoAppearance"])() : __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$appearance$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["defaultAppearanceSettings"];
                    const next = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$appearance$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["normalizeAppearanceSettings"])(event.newValue ? JSON.parse(event.newValue) : fallback);
                    setSettings(next);
                    applyAppearance(next);
                }
            }["AppearanceProvider.useEffect.handleStorage"];
            window.addEventListener('storage', handleStorage);
            return ({
                "AppearanceProvider.useEffect": ()=>{
                    window.removeEventListener('storage', handleStorage);
                }
            })["AppearanceProvider.useEffect"];
        }
    }["AppearanceProvider.useEffect"], [
        demoMode,
        storageKey
    ]);
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "AppearanceProvider.useMemo[value]": ()=>({
                settings,
                setSetting: ({
                    "AppearanceProvider.useMemo[value]": (key, value)=>{
                        setSettings({
                            "AppearanceProvider.useMemo[value]": (current)=>({
                                    ...current,
                                    [key]: value
                                })
                        }["AppearanceProvider.useMemo[value]"]);
                    }
                })["AppearanceProvider.useMemo[value]"],
                setSettingsBatch: ({
                    "AppearanceProvider.useMemo[value]": (value)=>{
                        setSettings({
                            "AppearanceProvider.useMemo[value]": (current)=>({
                                    ...current,
                                    ...value
                                })
                        }["AppearanceProvider.useMemo[value]"]);
                    }
                })["AppearanceProvider.useMemo[value]"],
                resetSettings: ({
                    "AppearanceProvider.useMemo[value]": ()=>{
                        setSettings(demoMode ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$demo$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDashboardDemoAppearance"])() : __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$appearance$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["defaultAppearanceSettings"]);
                    }
                })["AppearanceProvider.useMemo[value]"]
            })
    }["AppearanceProvider.useMemo[value]"], [
        demoMode,
        settings
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AppearanceContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/lib/appearance-context.tsx",
        lineNumber: 166,
        columnNumber: 10
    }, this);
}
_s(AppearanceProvider, "uY3IqVXbyA4Fl6gzVOuFacX0BBE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$app$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useApp"],
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$browser$2d$search$2d$params$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useBrowserSearchParams"]
    ];
});
_c = AppearanceProvider;
function useAppearance() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AppearanceContext);
    if (!context) {
        throw new Error('useAppearance must be used within AppearanceProvider');
    }
    return context;
}
_s1(useAppearance, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "AppearanceProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/app/providers.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Providers",
    ()=>Providers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$auth$2f$telegram$2d$miniapp$2d$auto$2d$auth$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/auth/telegram-miniapp-auto-auth.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$theme$2d$provider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/theme-provider.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$sonner$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/sonner.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$app$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/app-context.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$appearance$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/lib/appearance-context.tsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$locale$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/locale-context.tsx [app-client] (ecmascript)");
'use client';
;
;
;
;
;
;
;
function Providers({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$theme$2d$provider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ThemeProvider"], {
        attribute: "class",
        defaultTheme: "dark",
        enableSystem: true,
        disableTransitionOnChange: true,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$locale$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LocaleProvider"], {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$app$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AppProvider"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$appearance$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["AppearanceProvider"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$auth$2f$telegram$2d$miniapp$2d$auto$2d$auth$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TelegramMiniAppAutoAuth"], {}, void 0, false, {
                            fileName: "[project]/components/app/providers.tsx",
                            lineNumber: 17,
                            columnNumber: 13
                        }, this),
                        children,
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$sonner$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Toaster"], {
                            position: "bottom-right",
                            closeButton: true
                        }, void 0, false, {
                            fileName: "[project]/components/app/providers.tsx",
                            lineNumber: 19,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/app/providers.tsx",
                    lineNumber: 16,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/app/providers.tsx",
                lineNumber: 15,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/app/providers.tsx",
            lineNumber: 14,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/app/providers.tsx",
        lineNumber: 13,
        columnNumber: 5
    }, this);
}
_c = Providers;
var _c;
__turbopack_context__.k.register(_c, "Providers");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/system/telegram-miniapp-viewport.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TelegramMiniAppViewport",
    ()=>TelegramMiniAppViewport
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
function safe(action) {
    try {
        action();
    } catch  {}
}
function setPx(name, value) {
    if (typeof document === 'undefined') return;
    const number = typeof value === 'number' && Number.isFinite(value) ? value : 0;
    document.documentElement.style.setProperty(name, `${Math.max(0, Math.round(number))}px`);
}
function TelegramMiniAppViewport() {
    _s();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TelegramMiniAppViewport.useEffect": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            const webApp = window.Telegram?.WebApp;
            const apply = {
                "TelegramMiniAppViewport.useEffect.apply": ()=>{
                    const safeArea = webApp?.safeAreaInset ?? {};
                    const contentSafeArea = webApp?.contentSafeAreaInset ?? {};
                    setPx('--tg-safe-top', Math.max(safeArea.top ?? 0, contentSafeArea.top ?? 0));
                    setPx('--tg-safe-bottom', Math.max(safeArea.bottom ?? 0, contentSafeArea.bottom ?? 0));
                    setPx('--tg-viewport-height', webApp?.viewportStableHeight ?? webApp?.viewportHeight ?? window.innerHeight);
                }
            }["TelegramMiniAppViewport.useEffect.apply"];
            safe({
                "TelegramMiniAppViewport.useEffect": ()=>window.setTimeout({
                        "TelegramMiniAppViewport.useEffect": ()=>webApp?.ready?.()
                    }["TelegramMiniAppViewport.useEffect"], 0)
            }["TelegramMiniAppViewport.useEffect"]);
            safe({
                "TelegramMiniAppViewport.useEffect": ()=>window.setTimeout({
                        "TelegramMiniAppViewport.useEffect": ()=>webApp?.expand?.()
                    }["TelegramMiniAppViewport.useEffect"], 0)
            }["TelegramMiniAppViewport.useEffect"]);
            safe(apply);
            const handler = {
                "TelegramMiniAppViewport.useEffect.handler": ()=>safe(apply)
            }["TelegramMiniAppViewport.useEffect.handler"];
            safe({
                "TelegramMiniAppViewport.useEffect": ()=>webApp?.onEvent?.('viewportChanged', handler)
            }["TelegramMiniAppViewport.useEffect"]);
            window.addEventListener('resize', handler);
            window.addEventListener('orientationchange', handler);
            return ({
                "TelegramMiniAppViewport.useEffect": ()=>{
                    safe({
                        "TelegramMiniAppViewport.useEffect": ()=>webApp?.offEvent?.('viewportChanged', handler)
                    }["TelegramMiniAppViewport.useEffect"]);
                    window.removeEventListener('resize', handler);
                    window.removeEventListener('orientationchange', handler);
                }
            })["TelegramMiniAppViewport.useEffect"];
        }
    }["TelegramMiniAppViewport.useEffect"], []);
    return null;
}
_s(TelegramMiniAppViewport, "OD7bBpZva5O2jO+Puf00hKivP7c=");
_c = TelegramMiniAppViewport;
var _c;
__turbopack_context__.k.register(_c, "TelegramMiniAppViewport");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_e880bde6._.js.map