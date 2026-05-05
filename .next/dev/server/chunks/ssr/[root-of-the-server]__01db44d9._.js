module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[project]/hooks/use-browser-search-params.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "useBrowserSearchParams",
    ()=>useBrowserSearchParams
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
function getSearchString() {
    if ("TURBOPACK compile-time truthy", 1) return '';
    //TURBOPACK unreachable
    ;
}
function patchHistoryMethod(method) {
    if ("TURBOPACK compile-time truthy", 1) return ()=>{};
    //TURBOPACK unreachable
    ;
    const historyRef = undefined;
    const flag = undefined;
    const original = undefined;
}
function useBrowserSearchParams() {
    const [search, setSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>getSearchString());
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let frameId = 0;
        const sync = ()=>{
            window.cancelAnimationFrame(frameId);
            frameId = window.requestAnimationFrame(()=>{
                const nextSearch = getSearchString();
                setSearch((current)=>current === nextSearch ? current : nextSearch);
            });
        };
        sync();
        const unpatchPush = patchHistoryMethod('pushState');
        const unpatchReplace = patchHistoryMethod('replaceState');
        window.addEventListener('popstate', sync);
        window.addEventListener('klikbuk:searchchange', sync);
        return ()=>{
            window.cancelAnimationFrame(frameId);
            unpatchPush();
            unpatchReplace();
            window.removeEventListener('popstate', sync);
            window.removeEventListener('klikbuk:searchchange', sync);
        };
    }, []);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>new URLSearchParams(search), [
        search
    ]);
}
const __TURBOPACK__default__export__ = useBrowserSearchParams;
}),
"[project]/lib/telegram-miniapp-auth-client.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
    if ("TURBOPACK compile-time truthy", 1) return undefined;
    //TURBOPACK unreachable
    ;
}
const APP_SESSION_STORAGE_KEY = 'clickbook_app_session_token';
let cachedAuthPromise = null;
let hasSuccessfulAuth = false;
function getStoredTelegramAppSessionToken() {
    if ("TURBOPACK compile-time truthy", 1) return '';
    //TURBOPACK unreachable
    ;
}
function storeTelegramAppSessionToken(token) {
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
}
function clearTelegramAppSessionToken() {
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
}
function getTelegramAppSessionHeaders() {
    const token = getStoredTelegramAppSessionToken();
    return token ? {
        'X-ClickBook-App-Session': token
    } : {};
}
function getTelegramMiniAppInitData() {
    if ("TURBOPACK compile-time truthy", 1) return '';
    //TURBOPACK unreachable
    ;
}
function hasTelegramMiniAppInitData() {
    return getTelegramMiniAppInitData().length > 10;
}
function hasTelegramMiniAppRuntime() {
    if ("TURBOPACK compile-time truthy", 1) return false;
    //TURBOPACK unreachable
    ;
    const webApp = undefined;
}
async function waitForTelegramMiniAppInitData(timeoutMs = 1800) {
    const immediate = getTelegramMiniAppInitData();
    if (immediate) return immediate;
    if ("TURBOPACK compile-time truthy", 1) return '';
    //TURBOPACK unreachable
    ;
    const startedAt = undefined;
}
function dispatchAuthReady(payload) {
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
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
}),
"[project]/components/auth/telegram-miniapp-auto-auth.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TelegramMiniAppAutoAuth",
    ()=>TelegramMiniAppAutoAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$browser$2d$search$2d$params$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/use-browser-search-params.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2d$miniapp$2d$auth$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/telegram-miniapp-auth-client.ts [app-ssr] (ecmascript)");
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
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$browser$2d$search$2d$params$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useBrowserSearchParams"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let cancelled = false;
        if (pathname === '/app') return;
        (async ()=>{
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2d$miniapp$2d$auth$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["authorizeTelegramMiniAppSession"])({
                force: shouldForceTelegramSession(pathname),
                waitMs: 2200
            });
            if (cancelled || !result.ok) return;
            if (pathname === '/login') {
                window.location.replace(normalizeRedirect(searchParams.get('redirectTo')));
                return;
            }
            router.refresh();
        })();
        return ()=>{
            cancelled = true;
        };
    }, [
        pathname,
        router,
        searchParams
    ]);
    return null;
}
}),
"[project]/components/theme-provider.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ThemeProvider",
    ()=>ThemeProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$2d$themes$40$0$2e$4$2e$6_react$2d$dom_a1781a4635338e9843bf95c5370569a6$2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next-themes@0.4.6_react-dom_a1781a4635338e9843bf95c5370569a6/node_modules/next-themes/dist/index.mjs [app-ssr] (ecmascript)");
'use client';
;
;
function ThemeProvider({ children, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$2d$themes$40$0$2e$4$2e$6_react$2d$dom_a1781a4635338e9843bf95c5370569a6$2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ThemeProvider"], {
        ...props,
        children: children
    }, void 0, false, {
        fileName: "[project]/components/theme-provider.tsx",
        lineNumber: 7,
        columnNumber: 10
    }, this);
}
}),
"[project]/components/ui/sonner.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Toaster",
    ()=>Toaster
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$2d$themes$40$0$2e$4$2e$6_react$2d$dom_a1781a4635338e9843bf95c5370569a6$2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next-themes@0.4.6_react-dom_a1781a4635338e9843bf95c5370569a6/node_modules/next-themes/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$sonner$40$1$2e$7$2e$4_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/sonner@1.7.4_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/sonner/dist/index.mjs [app-ssr] (ecmascript)");
'use client';
;
;
;
const Toaster = ({ ...props })=>{
    const { theme = 'system' } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$2d$themes$40$0$2e$4$2e$6_react$2d$dom_a1781a4635338e9843bf95c5370569a6$2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTheme"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$sonner$40$1$2e$7$2e$4_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Toaster"], {
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
;
}),
"[project]/lib/i18n.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
}),
"[project]/lib/locale-context.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LocaleProvider",
    ()=>LocaleProvider,
    "useLocale",
    ()=>useLocale
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/i18n.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
const STORAGE_KEY = 'sloty-locale';
const LocaleContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(null);
function LocaleProvider({ children }) {
    const [locale, setLocale] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('ru');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
        const saved = undefined;
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
    }, [
        locale
    ]);
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>({
            locale,
            setLocale,
            copy: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getMessages"])(locale)
        }), [
        locale
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(LocaleContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/lib/locale-context.tsx",
        lineNumber: 48,
        columnNumber: 10
    }, this);
}
function useLocale() {
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(LocaleContext);
    if (!context) {
        throw new Error('useLocale must be used within LocaleProvider');
    }
    return context;
}
}),
"[project]/lib/supabase/env.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getSupabasePublishableKey",
    ()=>getSupabasePublishableKey,
    "getSupabaseServiceRoleKey",
    ()=>getSupabaseServiceRoleKey,
    "getSupabaseUrl",
    ()=>getSupabaseUrl
]);
function getSupabaseUrl() {
    const value = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
    if (!value) {
        throw new Error('Missing Supabase URL. Set NEXT_PUBLIC_SUPABASE_URL.');
    }
    return value;
}
function getSupabasePublishableKey() {
    const value = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!value) {
        throw new Error('Missing Supabase publishable key. Set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.');
    }
    return value;
}
function getSupabaseServiceRoleKey() {
    const value = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!value) {
        throw new Error('Missing Supabase service role key. Set SUPABASE_SERVICE_ROLE_KEY.');
    }
    return value;
}
}),
"[project]/lib/supabase/client.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createClient",
    ()=>createClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$6$2e$1_$40$supabase$2b$supabase$2d$js$40$2$2e$103$2e$0$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+ssr@0.6.1_@supabase+supabase-js@2.103.0/node_modules/@supabase/ssr/dist/module/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$6$2e$1_$40$supabase$2b$supabase$2d$js$40$2$2e$103$2e$0$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createBrowserClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+ssr@0.6.1_@supabase+supabase-js@2.103.0/node_modules/@supabase/ssr/dist/module/createBrowserClient.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$env$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/env.ts [app-ssr] (ecmascript)");
'use client';
;
;
function createClient() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$6$2e$1_$40$supabase$2b$supabase$2d$js$40$2$2e$103$2e$0$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createBrowserClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createBrowserClient"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$env$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabaseUrl"])(), (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$env$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSupabasePublishableKey"])());
}
}),
"[project]/lib/utils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$clsx$40$2$2e$1$2e$1$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$tailwind$2d$merge$40$3$2e$5$2e$0$2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/tailwind-merge@3.5.0/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/i18n.ts [app-ssr] (ecmascript)");
;
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$tailwind$2d$merge$40$3$2e$5$2e$0$2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$clsx$40$2$2e$1$2e$1$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
function slugify(value) {
    return String(value ?? '').trim().toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}
function parseServices(value) {
    return String(value ?? '').split(/\n|,/).map((item)=>item.trim()).filter(Boolean);
}
function getIntlLocale(locale = 'ru') {
    return __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["intlLocaleMap"][locale];
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
}),
"[project]/lib/billing-plans.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
}),
"[project]/lib/master-workspace.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$billing$2d$plans$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/billing-plans.ts [app-ssr] (ecmascript)");
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
    const planId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$billing$2d$plans$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeSubscriptionPlanId"])(row.planId ?? row.plan_id ?? row.plan ?? metadata.planId ?? metadata.plan_id ?? metadata.plan);
    const plan = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$billing$2d$plans$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getBillingPlan"])(planId);
    const status = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$billing$2d$plans$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeSubscriptionStatus"])(row.status ?? metadata.status);
    const billingCycle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$billing$2d$plans$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeBillingCycle"])(row.billingCycle ?? row.billing_cycle ?? metadata.billingCycle ?? metadata.billing_cycle);
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
        const plan = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$billing$2d$plans$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getBillingPlan"])(event.planId);
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
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$billing$2d$plans$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getLocalizedPlans"])(locale);
}
function buildLimits(services, clients, locale, planId = 'start') {
    const limits = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$billing$2d$plans$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getPlanLimits"])(planId);
    const totalLabel = (value)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$billing$2d$plans$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isFinitePlanLimit"])(value) ? value : 9999;
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
}),
"[project]/lib/workspace-store.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WORKSPACE_ID_STORAGE_KEY",
    ()=>WORKSPACE_ID_STORAGE_KEY,
    "buildWorkspaceDatasetFromStored",
    ()=>buildWorkspaceDatasetFromStored,
    "buildWorkspaceSeed",
    ()=>buildWorkspaceSeed
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$master$2d$workspace$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/master-workspace.ts [app-ssr] (ecmascript)");
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
    const dataset = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$master$2d$workspace$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildWorkspaceDataset"])(profile, bookings, locale);
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
    const base = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$master$2d$workspace$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildWorkspaceDataset"])(profile, bookings, locale);
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
    const subscription = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$master$2d$workspace$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeSubscriptionInsight"])(source.subscription, locale);
    const subscriptionEvents = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$master$2d$workspace$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeSubscriptionEvents"])(source.subscriptionEvents);
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
        payments: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$master$2d$workspace$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildSubscriptionPayments"])(locale, subscriptionEvents),
        limits: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$master$2d$workspace$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildLimits"])(effectiveServices, clients, locale, subscription.planId),
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
}),
"[project]/lib/appearance-palette.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
}),
"[project]/lib/appearance.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$appearance$2d$palette$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/appearance-palette.ts [app-ssr] (ecmascript)");
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
    accentTone: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$appearance$2d$palette$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["accentToneValues"],
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
    publicAccent: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$appearance$2d$palette$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["accentToneValues"],
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
    const accent = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$appearance$2d$palette$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["accentPalette"][settings.accentTone] ?? __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$appearance$2d$palette$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["accentPalette"].cobalt;
    const publicAccent = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$appearance$2d$palette$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["accentPalette"][settings.publicAccent] ?? accent;
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
    const palette = JSON.stringify(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$appearance$2d$palette$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["accentPalette"]);
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
}),
"[project]/lib/demo-data.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEMO_PROFILE_STORAGE_KEY",
    ()=>DEMO_PROFILE_STORAGE_KEY,
    "DEMO_PROFILE_UPDATED_EVENT",
    ()=>DEMO_PROFILE_UPDATED_EVENT,
    "SLOTY_DEMO_SLUG",
    ()=>SLOTY_DEMO_SLUG,
    "demoBookings",
    ()=>demoBookings,
    "demoProfile",
    ()=>demoProfile,
    "getDashboardDemoAnalyticsFeed",
    ()=>getDashboardDemoAnalyticsFeed,
    "getDashboardDemoAnalyticsHighlights",
    ()=>getDashboardDemoAnalyticsHighlights,
    "getDashboardDemoAppearance",
    ()=>getDashboardDemoAppearance,
    "getDashboardDemoChatThreads",
    ()=>getDashboardDemoChatThreads,
    "getDashboardDemoSections",
    ()=>getDashboardDemoSections,
    "getDemoBookings",
    ()=>getDemoBookings,
    "getDemoProfile",
    ()=>getDemoProfile,
    "readStoredDemoProfile",
    ()=>readStoredDemoProfile,
    "resetStoredDemoProfile",
    ()=>resetStoredDemoProfile,
    "saveStoredDemoProfile",
    ()=>saveStoredDemoProfile
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$appearance$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/appearance.ts [app-ssr] (ecmascript)");
;
const SLOTY_DEMO_SLUG = 'klikbuk-demo';
const DEMO_PROFILE_STORAGE_KEY = 'sloty-demo:profile';
const DEMO_PROFILE_UPDATED_EVENT = 'sloty-demo:profile-updated';
function daysFromToday(offset) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + offset);
    return date.toISOString().slice(0, 10);
}
function buildArtworkDataUri(title, subtitle, start, end) {
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${start}" />
          <stop offset="100%" stop-color="${end}" />
        </linearGradient>
        <radialGradient id="glow" cx="30%" cy="20%" r="70%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.28)" />
          <stop offset="100%" stop-color="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>
      <rect width="1200" height="900" fill="url(#g)" />
      <rect width="1200" height="900" fill="url(#glow)" />
      <g fill="none" stroke="rgba(255,255,255,0.22)">
        <circle cx="980" cy="170" r="140" />
        <circle cx="1040" cy="720" r="180" />
        <path d="M90 700c140-180 320-260 540-240" />
      </g>
      <g fill="#ffffff">
        <text x="92" y="150" font-size="78" font-family="Golos UI, Golos Text, Arial, sans-serif" font-weight="700">${title}</text>
        <text x="96" y="214" font-size="30" font-family="Golos UI, Golos Text, Arial, sans-serif" opacity="0.86">${subtitle}</text>
      </g>
    </svg>
  `.trim();
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
const demoProfile = {
    id: 'demo-profile-sloty',
    slug: SLOTY_DEMO_SLUG,
    name: 'Алина Морозова',
    profession: 'Ногтевой сервис',
    city: 'Москва',
    bio: 'Маникюр, педикюр и укрепление. Чистая работа, спокойный сервис и запись без долгой переписки.',
    services: [
        'Маникюр + покрытие',
        'Укрепление гелем',
        'Смарт-педикюр',
        'Снятие + новый дизайн',
        'Экспресс-уход'
    ],
    phone: '+7 999 444-22-11',
    telegram: 'klikbuk_demo',
    whatsapp: '+79994442211',
    avatar: '',
    rating: 4.9,
    reviewCount: 128,
    responseTime: 'Отвечаю в течение 10 минут',
    experienceLabel: 'Опыт 7 лет',
    priceHint: 'от 2 300 ₽',
    reviews: [
        {
            id: 'demo-review-1',
            author: 'Мария',
            rating: 5,
            text: 'Очень аккуратно, спокойно и без суеты. Понравилось, как организована запись и напоминания.',
            dateLabel: '2 недели назад',
            service: 'Маникюр + покрытие'
        },
        {
            id: 'demo-review-2',
            author: 'Светлана',
            rating: 5,
            text: 'Удобно записаться, всё понятно по услугам и времени. Профиль выглядит аккуратно.',
            dateLabel: 'месяц назад',
            service: 'Смарт-педикюр'
        },
        {
            id: 'demo-review-3',
            author: 'Елена',
            rating: 5,
            text: 'Страница аккуратная, по услугам и записи всё понятно сразу.',
            dateLabel: '6 дней назад',
            service: 'Укрепление гелем'
        }
    ],
    workGallery: [
        {
            id: 'demo-work-1',
            title: 'Молочный розовый',
            image: buildArtworkDataUri('Молочный розовый', 'Чистая форма и мягкий блеск', '#f9bcc7', '#a855f7'),
            note: 'Нежный повседневный дизайн'
        },
        {
            id: 'demo-work-2',
            title: 'Глянцевый нюд',
            image: buildArtworkDataUri('Глянцевый нюд', 'Минималистичный салонный сет', '#f3d0b6', '#fb7185'),
            note: 'Самый частый выбор новых клиентов'
        },
        {
            id: 'demo-work-3',
            title: 'Глубокий эспрессо',
            image: buildArtworkDataUri('Глубокий эспрессо', 'Контрастный тон с мягким светом', '#7c3f29', '#111827'),
            note: 'Осенний тёплый акцент'
        },
        {
            id: 'demo-work-4',
            title: 'Мягкий хром',
            image: buildArtworkDataUri('Мягкий хром', 'Светлая хромированная фактура', '#dbeafe', '#6366f1'),
            note: 'Для вечерних записей'
        }
    ],
    createdAt: new Date('2025-01-15T09:30:00.000Z').toISOString()
};
const demoProfileEn = {
    ...demoProfile,
    name: 'Alina Morozova',
    profession: 'Nail care specialist',
    city: 'Amsterdam',
    bio: 'Manicure, pedicure, and nail strengthening with a calm service flow. Services, reviews, contacts, and booking are clear before the client writes.',
    services: [
        'Gel polish manicure',
        'Gel strengthening',
        'Smart pedicure',
        'Removal + new design',
        'Express care'
    ],
    phone: '+31 6 4444 2211',
    whatsapp: '+31644442211',
    responseTime: 'Replies within 10 minutes',
    experienceLabel: '7 years of experience',
    priceHint: 'from €45',
    reviews: [
        {
            id: 'demo-review-1',
            author: 'Maria',
            rating: 5,
            text: 'Very neat, calm, and organized. I liked that booking and reminders were clear from the start.',
            dateLabel: '2 weeks ago',
            service: 'Gel polish manicure'
        },
        {
            id: 'demo-review-2',
            author: 'Svetlana',
            rating: 5,
            text: 'It was easy to book, and the services and available time were clear right away.',
            dateLabel: '1 month ago',
            service: 'Smart pedicure'
        },
        {
            id: 'demo-review-3',
            author: 'Elena',
            rating: 5,
            text: 'The page feels clean and professional. Services, reviews, and booking are easy to understand.',
            dateLabel: '6 days ago',
            service: 'Gel strengthening'
        }
    ],
    workGallery: [
        {
            id: 'demo-work-1',
            title: 'Milky rose',
            image: buildArtworkDataUri('Milky rose', 'Clean shape and soft shine', '#f9bcc7', '#a855f7'),
            note: 'Soft everyday design'
        },
        {
            id: 'demo-work-2',
            title: 'Glossy nude',
            image: buildArtworkDataUri('Glossy nude', 'Minimal salon set', '#f3d0b6', '#fb7185'),
            note: 'Most popular first-visit choice'
        },
        {
            id: 'demo-work-3',
            title: 'Deep espresso',
            image: buildArtworkDataUri('Deep espresso', 'Warm contrast tone', '#7c3f29', '#111827'),
            note: 'Warm seasonal accent'
        },
        {
            id: 'demo-work-4',
            title: 'Soft chrome',
            image: buildArtworkDataUri('Soft chrome', 'Light chrome texture', '#dbeafe', '#6366f1'),
            note: 'For evening appointments'
        }
    ]
};
const demoBookingEn = {
    'demo-booking-1': {
        clientName: 'Maria',
        service: 'Gel polish manicure',
        comment: 'First visit, prefers a calm shade and short square shape.'
    },
    'demo-booking-2': {
        clientName: 'Olga',
        service: 'Removal + strengthening',
        comment: 'Asked to move 15 minutes later if a slot opens.'
    },
    'demo-booking-3': {
        clientName: 'Elena',
        service: 'Extensions + design',
        comment: 'Usually brings a design reference and arrives early.'
    },
    'demo-booking-4': {
        clientName: 'Ksenia',
        service: 'Smart pedicure',
        comment: 'Needs a receipt and a short reminder one hour before the visit.'
    },
    'demo-booking-5': {
        clientName: 'Alina',
        service: 'Gel correction',
        comment: 'Regular client; suggest the next slot right after the visit.'
    },
    'demo-booking-6': {
        clientName: 'Svetlana',
        service: 'Express manicure',
        comment: 'If an earlier slot opens, Telegram is convenient.'
    },
    'demo-booking-7': {
        clientName: 'Natalia',
        service: 'Gel strengthening',
        comment: 'Evening visit; send a soft reminder in advance.'
    },
    'demo-booking-8': {
        clientName: 'Marina',
        service: 'Gel polish manicure',
        comment: 'Ready to confirm in chat after the morning reminder.'
    },
    'demo-booking-9': {
        clientName: 'Irina',
        service: 'Smart pedicure',
        comment: 'After the visit, send a short message with the next available slot.'
    },
    'demo-booking-10': {
        clientName: 'Daria',
        service: 'Gel strengthening',
        comment: 'Completed visit from history for analytics.'
    }
};
function localizeDemoProfile(locale) {
    return locale === 'ru' ? demoProfile : demoProfileEn;
}
function localizeDemoBookings(locale) {
    if (locale === 'ru') return demoBookings;
    return demoBookings.map((booking)=>({
            ...booking,
            ...demoBookingEn[booking.id] ?? {}
        }));
}
const demoBookings = [
    {
        id: 'demo-booking-1',
        masterSlug: SLOTY_DEMO_SLUG,
        clientName: 'Мария',
        clientPhone: '+7 999 100-00-11',
        service: 'Маникюр + покрытие',
        date: daysFromToday(0),
        time: '09:30',
        comment: 'Первый визит, любит спокойный тон и короткий квадрат.',
        status: 'confirmed',
        createdAt: new Date().toISOString()
    },
    {
        id: 'demo-booking-2',
        masterSlug: SLOTY_DEMO_SLUG,
        clientName: 'Ольга',
        clientPhone: '+7 999 120-00-19',
        service: 'Снятие + укрепление',
        date: daysFromToday(0),
        time: '11:00',
        comment: 'Просила сдвинуться на 15 минут, если окно освободится.',
        status: 'new',
        createdAt: new Date().toISOString()
    },
    {
        id: 'demo-booking-3',
        masterSlug: SLOTY_DEMO_SLUG,
        clientName: 'Елена',
        clientPhone: '+7 999 300-00-33',
        service: 'Наращивание + дизайн',
        date: daysFromToday(0),
        time: '12:30',
        comment: 'Берёт дизайн по референсу, обычно приходит заранее.',
        status: 'confirmed',
        createdAt: new Date().toISOString()
    },
    {
        id: 'demo-booking-4',
        masterSlug: SLOTY_DEMO_SLUG,
        clientName: 'Ксения',
        clientPhone: '+7 999 410-00-48',
        service: 'Смарт-педикюр',
        date: daysFromToday(0),
        time: '14:30',
        comment: 'Нужен чек и короткое напоминание за час.',
        status: 'confirmed',
        createdAt: new Date().toISOString()
    },
    {
        id: 'demo-booking-5',
        masterSlug: SLOTY_DEMO_SLUG,
        clientName: 'Алина',
        clientPhone: '+7 999 520-00-57',
        service: 'Коррекция геля',
        date: daysFromToday(0),
        time: '16:00',
        comment: 'Постоянный клиент, можно предложить следующий слот сразу после визита.',
        status: 'completed',
        createdAt: new Date().toISOString()
    },
    {
        id: 'demo-booking-6',
        masterSlug: SLOTY_DEMO_SLUG,
        clientName: 'Светлана',
        clientPhone: '+7 999 200-00-22',
        service: 'Экспресс-маникюр',
        date: daysFromToday(0),
        time: '17:30',
        comment: 'Если освободится окно раньше, удобно написать в Телеграм.',
        status: 'confirmed',
        createdAt: new Date().toISOString()
    },
    {
        id: 'demo-booking-7',
        masterSlug: SLOTY_DEMO_SLUG,
        clientName: 'Наталья',
        clientPhone: '+7 999 620-00-63',
        service: 'Укрепление гелем',
        date: daysFromToday(0),
        time: '19:00',
        comment: 'Вечерний визит, лучше заранее отправить мягкое напоминание.',
        status: 'new',
        createdAt: new Date().toISOString()
    },
    {
        id: 'demo-booking-8',
        masterSlug: SLOTY_DEMO_SLUG,
        clientName: 'Марина',
        clientPhone: '+7 999 710-00-71',
        service: 'Маникюр + покрытие',
        date: daysFromToday(1),
        time: '11:00',
        comment: 'Готова подтвердить в чате, если придёт напоминание утром.',
        status: 'confirmed',
        createdAt: new Date().toISOString()
    },
    {
        id: 'demo-booking-9',
        masterSlug: SLOTY_DEMO_SLUG,
        clientName: 'Ирина',
        clientPhone: '+7 999 820-00-82',
        service: 'Смарт-педикюр',
        date: daysFromToday(3),
        time: '14:30',
        comment: 'После визита стоит отправить короткое сообщение с предложением следующего окна.',
        status: 'new',
        createdAt: new Date().toISOString()
    },
    {
        id: 'demo-booking-10',
        masterSlug: SLOTY_DEMO_SLUG,
        clientName: 'Дарья',
        clientPhone: '+7 999 930-00-94',
        service: 'Укрепление гелем',
        date: daysFromToday(-5),
        time: '16:00',
        comment: 'Завершённый визит из истории для аналитики.',
        status: 'completed',
        createdAt: new Date().toISOString()
    }
];
function normalizeDemoProfile(value) {
    if (!value) return null;
    return {
        ...demoProfile,
        ...value,
        id: value.id || demoProfile.id,
        slug: SLOTY_DEMO_SLUG,
        name: value.name || demoProfile.name,
        profession: value.profession || demoProfile.profession,
        city: value.city || demoProfile.city,
        bio: value.bio || demoProfile.bio,
        services: Array.isArray(value.services) && value.services.length > 0 ? value.services : demoProfile.services,
        workGallery: Array.isArray(value.workGallery) ? value.workGallery : demoProfile.workGallery,
        reviews: Array.isArray(value.reviews) ? value.reviews : demoProfile.reviews,
        rating: typeof value.rating === 'number' ? value.rating : demoProfile.rating,
        reviewCount: typeof value.reviewCount === 'number' ? value.reviewCount : value.reviews?.length ?? demoProfile.reviewCount,
        createdAt: value.createdAt || demoProfile.createdAt
    };
}
function readStoredDemoProfile() {
    if ("TURBOPACK compile-time truthy", 1) return null;
    //TURBOPACK unreachable
    ;
}
function saveStoredDemoProfile(profile) {
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
}
function resetStoredDemoProfile() {
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
}
function getDemoProfile(slug, locale = 'ru') {
    if (slug !== SLOTY_DEMO_SLUG) return null;
    return readStoredDemoProfile() ?? localizeDemoProfile(locale);
}
function getDemoBookings(slug, locale = 'ru') {
    return slug === SLOTY_DEMO_SLUG ? localizeDemoBookings(locale) : [];
}
function getDashboardDemoAppearance() {
    return {
        ...__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$appearance$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaultAppearanceSettings"],
        accentTone: 'cobalt',
        neutralTone: 'zinc',
        density: 'compact',
        radius: 'medium',
        motion: 'smooth',
        cardStyle: 'soft',
        publicAccent: 'cobalt',
        publicSurface: 'soft',
        publicHeroLayout: 'split',
        publicCardStyle: 'soft',
        publicServicesStyle: 'grid',
        publicBookingStyle: 'panel',
        platformWidth: 'focused',
        sidebarDensity: 'tight',
        topbarDensity: 'tight'
    };
}
function getDashboardDemoChatThreads(locale) {
    const firstVisit = daysFromToday(1);
    const secondVisit = daysFromToday(3);
    const thirdVisit = daysFromToday(7);
    return [
        {
            id: 'demo-thread-1',
            workspaceId: 'demo-workspace',
            clientName: locale === 'ru' ? 'Мария' : 'Maria',
            clientPhone: '+7 999 100-00-11',
            channel: 'Telegram',
            segment: 'new',
            source: locale === 'ru' ? 'Публичная страница' : 'Public page',
            nextVisit: firstVisit,
            isPriority: true,
            botConnected: true,
            lastMessagePreview: locale === 'ru' ? 'Добрый день! Можно ли немного сдвинуть запись на завтра?' : 'Hello! Can we move tomorrow’s booking a little later?',
            lastMessageAt: new Date(`${firstVisit}T09:18:00.000Z`).toISOString(),
            unreadCount: 2,
            createdAt: new Date(`${firstVisit}T08:45:00.000Z`).toISOString(),
            updatedAt: new Date(`${firstVisit}T09:18:00.000Z`).toISOString(),
            messages: [
                {
                    id: 'demo-thread-1-message-1',
                    threadId: 'demo-thread-1',
                    author: 'client',
                    body: locale === 'ru' ? 'Здравствуйте! Я записана на маникюр завтра.' : 'Hello! I am booked for a manicure tomorrow.',
                    viaBot: false,
                    deliveryState: null,
                    createdAt: new Date(`${firstVisit}T08:45:00.000Z`).toISOString()
                },
                {
                    id: 'demo-thread-1-message-2',
                    threadId: 'demo-thread-1',
                    author: 'system',
                    body: locale === 'ru' ? 'КликБук бот подготовил мягкий перенос на 12:30.' : 'ClickBook bot prepared a soft reschedule for 12:30.',
                    viaBot: true,
                    deliveryState: 'queued',
                    createdAt: new Date(`${firstVisit}T09:02:00.000Z`).toISOString()
                },
                {
                    id: 'demo-thread-1-message-3',
                    threadId: 'demo-thread-1',
                    author: 'client',
                    body: locale === 'ru' ? 'Добрый день! Можно ли немного сдвинуть запись на завтра?' : 'Hello! Can we move tomorrow’s booking a little later?',
                    viaBot: false,
                    deliveryState: null,
                    createdAt: new Date(`${firstVisit}T09:18:00.000Z`).toISOString()
                }
            ]
        },
        {
            id: 'demo-thread-2',
            workspaceId: 'demo-workspace',
            clientName: locale === 'ru' ? 'Светлана' : 'Svetlana',
            clientPhone: '+7 999 200-00-22',
            channel: 'ВК',
            segment: 'active',
            source: 'ВК',
            nextVisit: secondVisit,
            isPriority: false,
            botConnected: true,
            lastMessagePreview: locale === 'ru' ? 'Подтверждаю, 14:30 мне подходит.' : 'Confirmed, 2:30 PM works for me.',
            lastMessageAt: new Date(`${secondVisit}T10:44:00.000Z`).toISOString(),
            unreadCount: 0,
            createdAt: new Date(`${secondVisit}T09:56:00.000Z`).toISOString(),
            updatedAt: new Date(`${secondVisit}T10:44:00.000Z`).toISOString(),
            messages: [
                {
                    id: 'demo-thread-2-message-1',
                    threadId: 'demo-thread-2',
                    author: 'system',
                    body: locale === 'ru' ? 'Здравствуйте, Светлана! Напоминаю о записи на педикюр.' : 'Hi Svetlana! A reminder about your pedicure booking.',
                    viaBot: true,
                    deliveryState: 'read',
                    createdAt: new Date(`${secondVisit}T09:56:00.000Z`).toISOString()
                },
                {
                    id: 'demo-thread-2-message-2',
                    threadId: 'demo-thread-2',
                    author: 'client',
                    body: locale === 'ru' ? 'Подтверждаю, 14:30 мне подходит.' : 'Confirmed, 2:30 PM works for me.',
                    viaBot: false,
                    deliveryState: null,
                    createdAt: new Date(`${secondVisit}T10:44:00.000Z`).toISOString()
                }
            ]
        },
        {
            id: 'demo-thread-3',
            workspaceId: 'demo-workspace',
            clientName: locale === 'ru' ? 'Елена' : 'Elena',
            clientPhone: '+7 999 300-00-33',
            channel: 'Telegram',
            segment: 'followup',
            source: locale === 'ru' ? 'Повторный визит' : 'Repeat visit',
            nextVisit: thirdVisit,
            isPriority: false,
            botConnected: true,
            lastMessagePreview: locale === 'ru' ? 'Спасибо! Скиньте, пожалуйста, ближайшие слоты на следующую неделю.' : 'Thanks! Please send the nearest slots for next week.',
            lastMessageAt: new Date(`${thirdVisit}T13:28:00.000Z`).toISOString(),
            unreadCount: 1,
            createdAt: new Date(`${thirdVisit}T12:10:00.000Z`).toISOString(),
            updatedAt: new Date(`${thirdVisit}T13:28:00.000Z`).toISOString(),
            messages: [
                {
                    id: 'demo-thread-3-message-1',
                    threadId: 'demo-thread-3',
                    author: 'system',
                    body: locale === 'ru' ? 'Спасибо за визит! Когда будет удобно, отправлю ближайшие окна сюда.' : 'Thanks for visiting! I can send the nearest slots here.',
                    viaBot: true,
                    deliveryState: 'delivered',
                    createdAt: new Date(`${thirdVisit}T12:10:00.000Z`).toISOString()
                },
                {
                    id: 'demo-thread-3-message-2',
                    threadId: 'demo-thread-3',
                    author: 'client',
                    body: locale === 'ru' ? 'Спасибо! Скиньте, пожалуйста, ближайшие слоты на следующую неделю.' : 'Thanks! Please send the nearest slots for next week.',
                    viaBot: false,
                    deliveryState: null,
                    createdAt: new Date(`${thirdVisit}T13:28:00.000Z`).toISOString()
                }
            ]
        },
        {
            id: 'demo-thread-4',
            workspaceId: 'demo-workspace',
            clientName: locale === 'ru' ? 'Анна' : 'Anna',
            clientPhone: '+7 999 410-10-44',
            channel: 'Telegram',
            segment: 'active',
            source: locale === 'ru' ? 'Ссылка в Инстаграм' : 'Instagram bio',
            nextVisit: secondVisit,
            isPriority: false,
            botConnected: true,
            lastMessagePreview: locale === 'ru' ? 'Супер, тогда оставляем запись на 18:00. До встречи!' : 'Perfect, then we keep the 6:00 PM slot. See you!',
            lastMessageAt: new Date(`${secondVisit}T15:12:00.000Z`).toISOString(),
            unreadCount: 0,
            createdAt: new Date(`${secondVisit}T14:22:00.000Z`).toISOString(),
            updatedAt: new Date(`${secondVisit}T15:12:00.000Z`).toISOString(),
            messages: [
                {
                    id: 'demo-thread-4-message-1',
                    threadId: 'demo-thread-4',
                    author: 'client',
                    body: locale === 'ru' ? 'Добрый день! Есть ли вечерние слоты на педикюр?' : 'Hi! Do you have any evening pedicure slots?',
                    viaBot: false,
                    deliveryState: null,
                    createdAt: new Date(`${secondVisit}T14:22:00.000Z`).toISOString()
                },
                {
                    id: 'demo-thread-4-message-2',
                    threadId: 'demo-thread-4',
                    author: 'system',
                    body: locale === 'ru' ? 'КликБук бот нашёл удобное окно на 18:00 и отправил быстрое подтверждение.' : 'ClickBook bot found a convenient 6:00 PM slot and sent a quick confirmation.',
                    viaBot: true,
                    deliveryState: 'delivered',
                    createdAt: new Date(`${secondVisit}T14:39:00.000Z`).toISOString()
                },
                {
                    id: 'demo-thread-4-message-3',
                    threadId: 'demo-thread-4',
                    author: 'client',
                    body: locale === 'ru' ? 'Супер, тогда оставляем запись на 18:00. До встречи!' : 'Perfect, then we keep the 6:00 PM slot. See you!',
                    viaBot: false,
                    deliveryState: null,
                    createdAt: new Date(`${secondVisit}T15:12:00.000Z`).toISOString()
                }
            ]
        },
        {
            id: 'demo-thread-5',
            workspaceId: 'demo-workspace',
            clientName: locale === 'ru' ? 'Кристина' : 'Kristina',
            clientPhone: '+7 999 510-14-55',
            channel: 'ВК',
            segment: 'new',
            source: locale === 'ru' ? 'ВК мини-приложение' : 'ВК mini app',
            nextVisit: firstVisit,
            isPriority: true,
            botConnected: true,
            lastMessagePreview: locale === 'ru' ? 'Добрый вечер! Я впервые, подскажите, сколько длится укрепление?' : 'Good evening! I am a new client — how long does strengthening take?',
            lastMessageAt: new Date(`${firstVisit}T18:14:00.000Z`).toISOString(),
            unreadCount: 1,
            createdAt: new Date(`${firstVisit}T17:52:00.000Z`).toISOString(),
            updatedAt: new Date(`${firstVisit}T18:14:00.000Z`).toISOString(),
            messages: [
                {
                    id: 'demo-thread-5-message-1',
                    threadId: 'demo-thread-5',
                    author: 'system',
                    body: locale === 'ru' ? 'Привет! Я помогу быстро записаться и отвечу на частые вопросы.' : 'Hi! I can help with a quick booking and answer common questions.',
                    viaBot: true,
                    deliveryState: 'read',
                    createdAt: new Date(`${firstVisit}T17:52:00.000Z`).toISOString()
                },
                {
                    id: 'demo-thread-5-message-2',
                    threadId: 'demo-thread-5',
                    author: 'client',
                    body: locale === 'ru' ? 'Добрый вечер! Я впервые, подскажите, сколько длится укрепление?' : 'Good evening! I am a new client — how long does strengthening take?',
                    viaBot: false,
                    deliveryState: null,
                    createdAt: new Date(`${firstVisit}T18:14:00.000Z`).toISOString()
                }
            ]
        }
    ];
}
function getDashboardDemoAnalyticsHighlights(locale) {
    return locale === 'ru' ? [
        {
            id: 'demo-analytics-1',
            label: 'Лучшее окно недели',
            value: 'Вт · 12:30–16:00',
            detail: 'Самый плотный поток записей и лучшая конверсия из Телеграм.'
        },
        {
            id: 'demo-analytics-2',
            label: 'Точка роста',
            value: '+18%',
            detail: 'Повторные визиты растут после шаблона «Спасибо после визита».'
        },
        {
            id: 'demo-analytics-3',
            label: 'Что показать клиенту',
            value: 'Чаты + шаблоны',
            detail: 'Лучше всего работают каналы, где клиент сразу видит страницу записи и отзывы.'
        }
    ] : [
        {
            id: 'demo-analytics-1',
            label: 'Best window this week',
            value: 'Tue · 12:30–4:00 PM',
            detail: 'The densest booking flow and the strongest Telegram conversion.'
        },
        {
            id: 'demo-analytics-2',
            label: 'Growth point',
            value: '+18%',
            detail: 'Repeat visits grow after the “Thank you after visit” template.'
        },
        {
            id: 'demo-analytics-3',
            label: 'What to show first',
            value: 'Chats + templates',
            detail: 'Demos convert best when messages, analytics, and the public page are shown together.'
        }
    ];
}
function getDashboardDemoAnalyticsFeed(locale) {
    return locale === 'ru' ? [
        'За последние 7 дней Телеграм дал больше всего подтверждённых записей.',
        'Во вторник и четверг окно после обеда заполняется быстрее всего.',
        'Повторные визиты чаще приходят после сообщения с благодарностью и ссылкой на запись.',
        'Напоминание за день до визита заметно снижает количество переносов.'
    ] : [
        'Telegram delivered the largest number of confirmed bookings in the last 7 days.',
        'Tuesday and Thursday afternoons fill up the fastest.',
        'Repeat visits grow after a thank-you message with a booking link.',
        'A reminder one day before the visit noticeably reduces reschedules.'
    ];
}
function getDashboardDemoSections(locale) {
    return {
        appearance: getDashboardDemoAppearance(),
        chats: getDashboardDemoChatThreads(locale)
    };
}
}),
"[project]/lib/dashboard-demo.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
}),
"[project]/lib/app-context.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AppProvider",
    ()=>AppProvider,
    "useApp",
    ()=>useApp
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$locale$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/locale-context.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/client.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2d$miniapp$2d$auth$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/telegram-miniapp-auth-client.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$workspace$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/workspace-store.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$demo$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/demo-data.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$dashboard$2d$demo$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/dashboard-demo.ts [app-ssr] (ecmascript)");
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
;
const AppContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(null);
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
        slug: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["slugify"])(values.slug || values.name),
        name: values.name.trim(),
        profession: values.profession.trim(),
        city: values.city.trim(),
        bio: values.bio.trim(),
        services: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseServices"])(values.servicesText),
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
    const rawItems = Array.isArray(value) ? value : typeof value === 'string' ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseServices"])(value) : [];
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
    const slug = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["slugify"])(rawSlug || name) || 'master';
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
    if ("TURBOPACK compile-time truthy", 1) {
        return {
            sourceChannel: 'web',
            source: 'Web',
            clientContext: {}
        };
    }
    //TURBOPACK unreachable
    ;
    const telegramWebApp = undefined;
    const params = undefined;
    const hasTelegramContext = undefined;
    const hasVkContext = undefined;
}
async function parseJson(response) {
    return await response.json();
}
async function getAuthHeaders(includeJson = false) {
    const headers = includeJson ? {
        'Content-Type': 'application/json'
    } : {};
    try {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createClient"])();
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
            headers.Authorization = `Bearer ${session.access_token}`;
        }
    } catch  {
    // Cookie-based Telegram app auth can still work without the fallback header.
    }
    Object.assign(headers, (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2d$miniapp$2d$auth$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getTelegramAppSessionHeaders"])());
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
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2d$miniapp$2d$auth$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["hasTelegramMiniAppRuntime"])()) return;
    const hasStoredToken = Boolean((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2d$miniapp$2d$auth$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStoredTelegramAppSessionToken"])());
    if (hasStoredToken && !options?.force) return;
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2d$miniapp$2d$auth$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["authorizeTelegramMiniAppSession"])(options);
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
    if (Object.keys((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$telegram$2d$miniapp$2d$auth$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getTelegramAppSessionHeaders"])()).length === 0) {
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
    const { copy, locale } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$locale$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLocale"])();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])();
    const [hasHydrated, setHasHydrated] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [workspaceId, setWorkspaceId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [ownedProfile, setOwnedProfile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [storedBookings, setStoredBookings] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [workspaceData, setWorkspaceData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const applySnapshot = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((snapshot)=>{
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
    }, []);
    const refreshWorkspace = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
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
    }, [
        applySnapshot
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let active = true;
        if (pathname === '/app') {
            setHasHydrated(true);
            return ()=>{
                active = false;
            };
        }
        (async ()=>{
            await refreshWorkspace();
            if (active) {
                setHasHydrated(true);
            }
        })();
        return ()=>{
            active = false;
        };
    }, [
        pathname,
        refreshWorkspace
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
        const handleAuthReady = undefined;
    }, [
        pathname,
        refreshWorkspace
    ]);
    const profiles = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return ownedProfile ? [
            ownedProfile
        ] : [];
    }, [
        ownedProfile
    ]);
    const bookings = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return [
            ...storedBookings
        ].sort((a, b)=>new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [
        storedBookings
    ]);
    const getProfileBySlug = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((slug)=>profiles.find((profile)=>profile.slug === slug) ?? null, [
        profiles
    ]);
    const getDemoProfileBySlug = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((slug)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$demo$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDemoProfile"])(slug, locale), [
        locale
    ]);
    const getBookingsBySlug = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((slug)=>bookings.filter((booking)=>booking.masterSlug === slug), [
        bookings
    ]);
    const getDemoBookingsBySlug = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((slug)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$demo$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDemoBookings"])(slug, locale), [
        locale
    ]);
    const validateProfile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((values, existingProfile)=>{
        const slug = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["slugify"])(values.slug || values.name);
        const services = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseServices"])(values.servicesText);
        if (!values.name.trim()) return copy.validation.masterName;
        if (!values.profession.trim()) return copy.validation.profession;
        if (!values.city.trim()) return copy.validation.city;
        if (!values.bio.trim()) return copy.validation.bio;
        if (!slug) return copy.validation.slug;
        if (services.length === 0) return copy.validation.services;
        return null;
    }, [
        copy.validation
    ]);
    const validateBooking = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((values)=>{
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
    }, [
        copy.validation
    ]);
    const saveProfile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (values)=>{
        const error = validateProfile(values, ownedProfile);
        if (error) {
            return {
                success: false,
                error
            };
        }
        const demoMode = ("TURBOPACK compile-time value", "undefined") !== 'undefined' && (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$dashboard$2d$demo$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isDashboardDemoEnabled"])(new URLSearchParams(window.location.search || ''));
        const previousProfile = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : ownedProfile;
        const nextProfile = buildProfile(("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : values, previousProfile);
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
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
                const payload = await parseJson(response).catch(()=>({}));
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
            const nextData = Object.keys(snapshot.data ?? {}).length > 0 ? snapshot.data : (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$workspace$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildWorkspaceSeed"])(nextProfile, snapshot.data?.bookings ?? [], locale);
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
    }, [
        applySnapshot,
        copy.validation.slugTaken,
        locale,
        ownedProfile,
        validateProfile,
        workspaceId
    ]);
    const createBooking = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (masterSlug, values)=>{
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
                setStoredBookings((current)=>[
                        payload.booking,
                        ...current
                    ]);
                setWorkspaceData((current)=>({
                        ...current,
                        bookings: [
                            payload.booking,
                            ...Array.isArray(current.bookings) ? current.bookings : storedBookings
                        ]
                    }));
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
    }, [
        locale,
        ownedProfile?.slug,
        storedBookings,
        validateBooking
    ]);
    const updateWorkspaceSection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (section, value)=>{
        if (!workspaceId) return false;
        setWorkspaceData((current)=>({
                ...current,
                [section]: value
            }));
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
    }, [
        workspaceId,
        refreshWorkspace
    ]);
    const updateBookingStatus = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (bookingId, status)=>{
        if (!workspaceId) return;
        const optimisticBookings = bookings.map((booking)=>booking.id === bookingId ? {
                ...booking,
                status
            } : booking);
        setStoredBookings(optimisticBookings);
        setWorkspaceData((current)=>({
                ...current,
                bookings: optimisticBookings
            }));
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
            const confirmedBookings = optimisticBookings.map((booking)=>booking.id === bookingId ? payload.booking : booking);
            setStoredBookings(confirmedBookings);
            setWorkspaceData((current)=>({
                    ...current,
                    bookings: confirmedBookings
                }));
        } catch  {
            await refreshWorkspace();
        }
    }, [
        bookings,
        refreshWorkspace,
        workspaceId
    ]);
    const getPublicPath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((slug)=>`/m/${slug}`, []);
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>({
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
        }), [
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AppContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/lib/app-context.tsx",
        lineNumber: 863,
        columnNumber: 10
    }, this);
}
function useApp() {
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
}
}),
"[project]/lib/appearance-context.tsx [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AppearanceProvider",
    ()=>AppearanceProvider,
    "useAppearance",
    ()=>useAppearance
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$browser$2d$search$2d$params$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/use-browser-search-params.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$app$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/app-context.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$appearance$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/appearance.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$dashboard$2d$demo$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/dashboard-demo.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$demo$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/demo-data.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
;
const AppearanceContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(null);
function applyAppearance(settings) {
    if (typeof document === 'undefined') return;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$appearance$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["applyAppearanceToElement"])(document.documentElement, settings);
}
;
function AppearanceProvider({ children }) {
    const { hasHydrated, workspaceId, workspaceData, updateWorkspaceSection } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$app$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useApp"])();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$browser$2d$search$2d$params$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useBrowserSearchParams"])();
    const demoMode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$dashboard$2d$demo$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isDashboardDemoEnabled"])(searchParams);
    const storageKey = demoMode ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$dashboard$2d$demo$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDashboardDemoStorageKey"])('appearance') : __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$appearance$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["APPEARANCE_STORAGE_KEY"];
    const [settings, setSettings] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>{
        if ("TURBOPACK compile-time truthy", 1) return __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$appearance$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaultAppearanceSettings"];
        //TURBOPACK unreachable
        ;
        const currentParams = undefined;
        const currentDemoMode = undefined;
        const currentStorageKey = undefined;
        const fallback = undefined;
    });
    const lastSavedRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])('');
    const syncedWorkspaceRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
    }, [
        demoMode,
        storageKey
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (demoMode || !hasHydrated) return;
        const remoteSettings = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$appearance$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeAppearanceSettings"])(workspaceData.appearance ?? null);
        if (!workspaceId) return;
        if (syncedWorkspaceRef.current === workspaceId && lastSavedRef.current) return;
        syncedWorkspaceRef.current = workspaceId;
        lastSavedRef.current = JSON.stringify(remoteSettings);
        setSettings(remoteSettings);
        applyAppearance(remoteSettings);
    }, [
        demoMode,
        hasHydrated,
        workspaceData.appearance,
        workspaceId
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
    }, [
        settings,
        storageKey
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (demoMode || !workspaceId || !hasHydrated) return;
        const serialized = JSON.stringify(settings);
        if (serialized === lastSavedRef.current) return;
        lastSavedRef.current = serialized;
        const timeout = window.setTimeout(()=>{
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
            }).catch(()=>undefined);
        }, 250);
        return ()=>{
            window.clearTimeout(timeout);
        };
    }, [
        demoMode,
        hasHydrated,
        settings,
        updateWorkspaceSection,
        workspaceId
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
        const handleStorage = undefined;
    }, [
        demoMode,
        storageKey
    ]);
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>({
            settings,
            setSetting: (key, value)=>{
                setSettings((current)=>({
                        ...current,
                        [key]: value
                    }));
            },
            setSettingsBatch: (value)=>{
                setSettings((current)=>({
                        ...current,
                        ...value
                    }));
            },
            resetSettings: ()=>{
                setSettings(demoMode ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$demo$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDashboardDemoAppearance"])() : __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$appearance$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaultAppearanceSettings"]);
            }
        }), [
        demoMode,
        settings
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AppearanceContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/lib/appearance-context.tsx",
        lineNumber: 166,
        columnNumber: 10
    }, this);
}
function useAppearance() {
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(AppearanceContext);
    if (!context) {
        throw new Error('useAppearance must be used within AppearanceProvider');
    }
    return context;
}
}),
"[project]/components/app/providers.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Providers",
    ()=>Providers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$auth$2f$telegram$2d$miniapp$2d$auto$2d$auth$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/auth/telegram-miniapp-auto-auth.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$theme$2d$provider$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/theme-provider.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$sonner$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/sonner.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$app$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/app-context.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$appearance$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/lib/appearance-context.tsx [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$locale$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/locale-context.tsx [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
;
function Providers({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$theme$2d$provider$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ThemeProvider"], {
        attribute: "class",
        defaultTheme: "dark",
        enableSystem: true,
        disableTransitionOnChange: true,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$locale$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LocaleProvider"], {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$app$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AppProvider"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$appearance$2d$context$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["AppearanceProvider"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$auth$2f$telegram$2d$miniapp$2d$auto$2d$auth$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TelegramMiniAppAutoAuth"], {}, void 0, false, {
                            fileName: "[project]/components/app/providers.tsx",
                            lineNumber: 17,
                            columnNumber: 13
                        }, this),
                        children,
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$sonner$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Toaster"], {
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
}),
"[project]/components/system/telegram-miniapp-viewport.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TelegramMiniAppViewport",
    ()=>TelegramMiniAppViewport
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
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
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
        const webApp = undefined;
        const apply = undefined;
        const handler = undefined;
    }, []);
    return null;
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__01db44d9._.js.map