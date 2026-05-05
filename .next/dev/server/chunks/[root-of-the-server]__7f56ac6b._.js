module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

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
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/lib/supabase/env.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/lib/supabase/server.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createClient",
    ()=>createClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$6$2e$1_$40$supabase$2b$supabase$2d$js$40$2$2e$103$2e$0$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+ssr@0.6.1_@supabase+supabase-js@2.103.0/node_modules/@supabase/ssr/dist/module/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$6$2e$1_$40$supabase$2b$supabase$2d$js$40$2$2e$103$2e$0$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+ssr@0.6.1_@supabase+supabase-js@2.103.0/node_modules/@supabase/ssr/dist/module/createServerClient.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/headers.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/env.ts [app-route] (ecmascript)");
;
;
;
async function createClient() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$6$2e$1_$40$supabase$2b$supabase$2d$js$40$2$2e$103$2e$0$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createServerClient"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSupabaseUrl"])(), (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSupabasePublishableKey"])(), {
        cookies: {
            getAll () {
                return cookieStore.getAll();
            },
            setAll (cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options })=>{
                        cookieStore.set(name, value, options);
                    });
                } catch  {
                // Server Components cannot always mutate cookies.
                // Route handlers and proxy.ts refresh the session cookies.
                }
            }
        }
    });
}
}),
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[project]/lib/server/app-session.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CLICKBOOK_AUTH_COOKIE",
    ()=>CLICKBOOK_AUTH_COOKIE,
    "clearTelegramAppSessionCookie",
    ()=>clearTelegramAppSessionCookie,
    "createProviderAppSessionToken",
    ()=>createProviderAppSessionToken,
    "createTelegramAppSessionToken",
    ()=>createTelegramAppSessionToken,
    "getAppSessionUser",
    ()=>getAppSessionUser,
    "getAppSessionUserFromToken",
    ()=>getAppSessionUserFromToken,
    "getTelegramAppSessionUser",
    ()=>getTelegramAppSessionUser,
    "getTelegramAppSessionUserFromToken",
    ()=>getTelegramAppSessionUserFromToken,
    "setProviderAppSessionCookie",
    ()=>setProviderAppSessionCookie,
    "setTelegramAppSessionCookie",
    ()=>setTelegramAppSessionCookie,
    "verifyAppSessionToken",
    ()=>verifyAppSessionToken,
    "verifyTelegramAppSessionToken",
    ()=>verifyTelegramAppSessionToken
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$server$2d$only$2f$empty$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/compiled/server-only/empty.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/headers.js [app-route] (ecmascript)");
;
;
;
const CLICKBOOK_AUTH_COOKIE = 'clickbook_auth_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;
function shouldUseSecureCookies() {
    return ("TURBOPACK compile-time value", "development") === 'production' || process.env.VERCEL === '1' || process.env.NEXT_PUBLIC_APP_URL?.startsWith('https://');
}
function getSessionSecret() {
    const value = process.env.KEY_VAULTS_SECRET || process.env.TELEGRAM_WEBHOOK_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!value) {
        throw new Error('Missing KEY_VAULTS_SECRET for app session signing.');
    }
    return value;
}
function base64url(value) {
    return Buffer.from(value).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
function fromBase64url(value) {
    const padded = value.padEnd(value.length + (4 - value.length % 4) % 4, '=');
    return Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
}
function sign(payloadPart) {
    return base64url(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].createHmac('sha256', getSessionSecret()).update(payloadPart).digest());
}
function safeEqual(left, right) {
    const a = Buffer.from(left);
    const b = Buffer.from(right);
    if (a.length !== b.length) return false;
    return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].timingSafeEqual(a, b);
}
function createProviderAppSessionToken(params) {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
        sub: params.userId,
        provider: params.provider,
        provider_user_id: params.providerUserId ?? null,
        username: params.username ?? null,
        first_name: params.firstName ?? null,
        last_name: params.lastName ?? null,
        full_name: params.fullName ?? null,
        email: params.email ?? null,
        phone: params.phone ?? null,
        avatar_url: params.avatarUrl ?? null,
        iat: now,
        exp: now + SESSION_TTL_SECONDS
    };
    if (params.provider === 'telegram') {
        const telegramId = typeof params.providerUserId === 'number' ? params.providerUserId : typeof params.providerUserId === 'string' ? Number(params.providerUserId) : NaN;
        if (Number.isFinite(telegramId) && telegramId > 0) {
            payload.telegram_id = Math.trunc(telegramId);
        }
    }
    if (params.provider === 'vk' && params.providerUserId != null) {
        payload.vk_id = String(params.providerUserId);
    }
    const payloadPart = base64url(JSON.stringify(payload));
    const signaturePart = sign(payloadPart);
    return `${payloadPart}.${signaturePart}`;
}
function createTelegramAppSessionToken(params) {
    return createProviderAppSessionToken({
        userId: params.userId,
        provider: 'telegram',
        providerUserId: params.telegramId,
        username: params.username,
        firstName: params.firstName,
        lastName: params.lastName
    });
}
function verifyAppSessionToken(token) {
    if (!token) return null;
    const [payloadPart, signaturePart] = token.split('.');
    if (!payloadPart || !signaturePart) return null;
    const expectedSignature = sign(payloadPart);
    if (!safeEqual(signaturePart, expectedSignature)) return null;
    let payload;
    try {
        payload = JSON.parse(fromBase64url(payloadPart));
    } catch  {
        return null;
    }
    if (!payload.sub || !payload.provider) return null;
    if (![
        'telegram',
        'vk'
    ].includes(payload.provider)) return null;
    if (!payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload;
}
function verifyTelegramAppSessionToken(token) {
    const payload = verifyAppSessionToken(token);
    return payload?.provider === 'telegram' ? payload : null;
}
function setProviderAppSessionCookie(response, params) {
    const token = params.token ?? createProviderAppSessionToken(params);
    const secureCookie = shouldUseSecureCookies();
    response.cookies.set(CLICKBOOK_AUTH_COOKIE, token, {
        httpOnly: true,
        secure: secureCookie,
        sameSite: secureCookie ? 'none' : 'lax',
        path: '/',
        maxAge: SESSION_TTL_SECONDS
    });
    return response;
}
function setTelegramAppSessionCookie(response, params) {
    return setProviderAppSessionCookie(response, {
        userId: params.userId,
        provider: 'telegram',
        providerUserId: params.telegramId,
        username: params.username,
        firstName: params.firstName,
        lastName: params.lastName,
        token: params.token
    });
}
function clearTelegramAppSessionCookie(response) {
    const secureCookie = shouldUseSecureCookies();
    response.cookies.set(CLICKBOOK_AUTH_COOKIE, '', {
        httpOnly: true,
        secure: secureCookie,
        sameSite: secureCookie ? 'none' : 'lax',
        path: '/',
        maxAge: 0
    });
    return response;
}
function appSessionPayloadToUser(session) {
    if (session.provider === 'telegram') {
        return {
            id: session.sub,
            aud: 'authenticated',
            role: 'authenticated',
            email: session.telegram_id ? `telegram_${session.telegram_id}@auth.clickbook.app` : undefined,
            app_metadata: {
                provider: 'telegram',
                providers: [
                    'telegram'
                ]
            },
            user_metadata: {
                provider: 'telegram',
                providers: [
                    'telegram'
                ],
                telegram_id: session.telegram_id,
                telegram_username: session.username,
                telegram_first_name: session.first_name,
                telegram_last_name: session.last_name
            },
            created_at: new Date(session.iat * 1000).toISOString(),
            updated_at: new Date(session.iat * 1000).toISOString()
        };
    }
    return {
        id: session.sub,
        aud: 'authenticated',
        role: 'authenticated',
        email: session.email || (session.vk_id ? `vk_${session.vk_id}@auth.clickbook.app` : undefined),
        app_metadata: {
            provider: 'vk',
            providers: [
                'vk'
            ]
        },
        user_metadata: {
            provider: 'vk',
            providers: [
                'vk'
            ],
            vk_id: session.vk_id || session.provider_user_id,
            vk_screen_name: session.username,
            vk_first_name: session.first_name,
            vk_last_name: session.last_name,
            vk_full_name: session.full_name,
            vk_photo_url: session.avatar_url,
            email: session.email,
            phone: session.phone,
            name: session.full_name,
            avatar_url: session.avatar_url
        },
        created_at: new Date(session.iat * 1000).toISOString(),
        updated_at: new Date(session.iat * 1000).toISOString()
    };
}
function getAppSessionUserFromToken(token) {
    try {
        const session = verifyAppSessionToken(token);
        return session ? appSessionPayloadToUser(session) : null;
    } catch  {
        return null;
    }
}
function getTelegramAppSessionUserFromToken(token) {
    try {
        const session = verifyTelegramAppSessionToken(token);
        return session ? appSessionPayloadToUser(session) : null;
    } catch  {
        return null;
    }
}
async function getAppSessionUser() {
    try {
        const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
        return getAppSessionUserFromToken(cookieStore.get(CLICKBOOK_AUTH_COOKIE)?.value);
    } catch  {
        return null;
    }
}
async function getTelegramAppSessionUser() {
    try {
        const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
        return getTelegramAppSessionUserFromToken(cookieStore.get(CLICKBOOK_AUTH_COOKIE)?.value);
    } catch  {
        return null;
    }
}
}),
"[project]/lib/server/require-auth-user.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "requireAuthUser",
    ()=>requireAuthUser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$server$2d$only$2f$empty$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/compiled/server-only/empty.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/headers.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$supabase$2d$js$40$2$2e$103$2e$0$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+supabase-js@2.103.0/node_modules/@supabase/supabase-js/dist/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/server.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/env.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$app$2d$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/server/app-session.ts [app-route] (ecmascript)");
;
;
;
;
;
;
function parseBearerToken(value) {
    if (!value) return null;
    const match = value.match(/^Bearer\s+(.+)$/i);
    return match?.[1]?.trim() || null;
}
async function getRequestAuthHeaders() {
    try {
        const headerStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["headers"])();
        return {
            bearerToken: parseBearerToken(headerStore.get('authorization')),
            appSessionToken: headerStore.get('x-clickbook-app-session')
        };
    } catch  {
        return {
            bearerToken: null,
            appSessionToken: null
        };
    }
}
async function requireAuthUser() {
    const serverSupabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createClient"])();
    const { data, error } = await serverSupabase.auth.getUser();
    if (!error && data.user) {
        return data.user;
    }
    const { bearerToken: token, appSessionToken } = await getRequestAuthHeaders();
    if (token) {
        const tokenSupabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$supabase$2d$js$40$2$2e$103$2e$0$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSupabaseUrl"])(), (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSupabasePublishableKey"])(), {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false
            }
        });
        const { data: tokenData, error: tokenError } = await tokenSupabase.auth.getUser(token);
        if (!tokenError && tokenData.user) {
            return tokenData.user;
        }
    }
    const headerAppSessionUser = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$app$2d$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAppSessionUserFromToken"])(appSessionToken);
    if (headerAppSessionUser) {
        return headerAppSessionUser;
    }
    const appSessionUser = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$app$2d$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAppSessionUser"])();
    if (appSessionUser) {
        return appSessionUser;
    }
    throw new Error('unauthorized');
}
}),
"[project]/lib/server/supabase-rest.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "supabaseRestRequest",
    ()=>supabaseRestRequest
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$server$2d$only$2f$empty$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/compiled/server-only/empty.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/env.ts [app-route] (ecmascript)");
;
;
function getSupabaseRestConfig() {
    return {
        url: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSupabaseUrl"])(),
        serviceRoleKey: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSupabaseServiceRoleKey"])()
    };
}
async function supabaseRestRequest(path, init = {}) {
    const { url, serviceRoleKey } = getSupabaseRestConfig();
    const response = await fetch(`${url}${path}`, {
        ...init,
        headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json',
            ...init.headers ?? {}
        },
        cache: 'no-store'
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Supabase request failed: ${response.status}`);
    }
    return response;
}
}),
"[project]/lib/server/supabase-bookings.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createBookingRecord",
    ()=>createBookingRecord,
    "listBookingsByWorkspace",
    ()=>listBookingsByWorkspace,
    "updateBookingRecord",
    ()=>updateBookingRecord,
    "updateBookingStatusRecord",
    ()=>updateBookingStatusRecord
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$server$2d$only$2f$empty$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/compiled/server-only/empty.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$supabase$2d$rest$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/server/supabase-rest.ts [app-route] (ecmascript)");
;
;
function mapRow(row) {
    return {
        id: row.id,
        masterSlug: row.master_slug,
        clientName: row.client_name,
        clientPhone: row.client_phone,
        service: row.service,
        date: row.booking_date,
        time: row.booking_time,
        comment: row.comment ?? undefined,
        status: row.status,
        createdAt: row.created_at,
        source: row.source ?? undefined,
        channel: row.channel ?? undefined,
        priceAmount: typeof row.price_amount === 'number' ? row.price_amount : undefined,
        durationMinutes: typeof row.duration_minutes === 'number' ? row.duration_minutes : undefined,
        confirmedAt: row.confirmed_at ?? undefined,
        completedAt: row.completed_at ?? undefined,
        noShowAt: row.no_show_at ?? undefined,
        cancelledAt: row.cancelled_at ?? undefined,
        cancelReason: row.cancel_reason ?? undefined,
        statusCheckSentAt: row.status_check_sent_at ?? undefined,
        metadata: row.metadata ?? undefined
    };
}
async function listBookingsByWorkspace(workspaceId) {
    const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$supabase$2d$rest$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseRestRequest"])(`/rest/v1/sloty_bookings?workspace_id=eq.${encodeURIComponent(workspaceId)}&select=*&order=created_at.desc`);
    const rows = await response.json();
    return rows.map(mapRow);
}
async function createBookingRecord(workspaceId, booking) {
    const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$supabase$2d$rest$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseRestRequest"])('/rest/v1/sloty_bookings?select=*', {
        method: 'POST',
        headers: {
            Prefer: 'return=representation'
        },
        body: JSON.stringify([
            {
                id: booking.id,
                workspace_id: workspaceId,
                master_slug: booking.masterSlug,
                client_name: booking.clientName,
                client_phone: booking.clientPhone,
                service: booking.service,
                booking_date: booking.date,
                booking_time: booking.time,
                comment: booking.comment ?? null,
                status: booking.status,
                duration_minutes: booking.durationMinutes ?? null,
                price_amount: booking.priceAmount ?? null,
                source: booking.source ?? 'Web',
                channel: booking.channel ?? 'web',
                confirmed_at: booking.status === 'confirmed' ? booking.confirmedAt ?? new Date().toISOString() : null,
                completed_at: booking.completedAt ?? null,
                no_show_at: booking.noShowAt ?? null,
                cancelled_at: booking.cancelledAt ?? null,
                cancel_reason: booking.cancelReason ?? null,
                metadata: booking.metadata ?? {}
            }
        ])
    });
    const rows = await response.json();
    return rows[0] ? mapRow(rows[0]) : null;
}
function buildPatchPayload(patch) {
    const payload = {};
    if (patch.status !== undefined) payload.status = patch.status;
    if (patch.date !== undefined) payload.booking_date = patch.date;
    if (patch.time !== undefined) payload.booking_time = patch.time;
    if (patch.comment !== undefined) payload.comment = patch.comment;
    if (patch.source !== undefined) payload.source = patch.source;
    if (patch.channel !== undefined) payload.channel = patch.channel;
    if (patch.durationMinutes !== undefined) payload.duration_minutes = patch.durationMinutes;
    if (patch.priceAmount !== undefined) payload.price_amount = patch.priceAmount;
    if (patch.confirmedAt !== undefined) payload.confirmed_at = patch.confirmedAt;
    if (patch.completedAt !== undefined) payload.completed_at = patch.completedAt;
    if (patch.noShowAt !== undefined) payload.no_show_at = patch.noShowAt;
    if (patch.cancelledAt !== undefined) payload.cancelled_at = patch.cancelledAt;
    if (patch.cancelReason !== undefined) payload.cancel_reason = patch.cancelReason;
    if (patch.statusCheckSentAt !== undefined) payload.status_check_sent_at = patch.statusCheckSentAt;
    if (patch.metadata !== undefined) payload.metadata = patch.metadata;
    return payload;
}
async function updateBookingRecord(workspaceId, bookingId, patch) {
    const payload = buildPatchPayload(patch);
    const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$supabase$2d$rest$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseRestRequest"])(`/rest/v1/sloty_bookings?id=eq.${encodeURIComponent(bookingId)}&workspace_id=eq.${encodeURIComponent(workspaceId)}&select=*`, {
        method: 'PATCH',
        headers: {
            Prefer: 'return=representation'
        },
        body: JSON.stringify(payload)
    });
    const rows = await response.json();
    return rows[0] ? mapRow(rows[0]) : null;
}
async function updateBookingStatusRecord(workspaceId, bookingId, status) {
    const now = new Date().toISOString();
    return updateBookingRecord(workspaceId, bookingId, {
        status,
        ...status === 'confirmed' ? {
            confirmedAt: now
        } : {},
        ...status === 'completed' ? {
            completedAt: now
        } : {},
        ...status === 'no_show' ? {
            noShowAt: now
        } : {},
        ...status === 'cancelled' ? {
            cancelledAt: now
        } : {}
    });
}
}),
"[project]/lib/billing-plans.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/lib/server/supabase-subscriptions.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ensureWorkspaceSubscription",
    ()=>ensureWorkspaceSubscription,
    "fetchWorkspaceSubscription",
    ()=>fetchWorkspaceSubscription,
    "getWorkspaceBillingSnapshot",
    ()=>getWorkspaceBillingSnapshot,
    "listSubscriptionEvents",
    ()=>listSubscriptionEvents,
    "recordSubscriptionEvent",
    ()=>recordSubscriptionEvent,
    "updateWorkspaceSubscription",
    ()=>updateWorkspaceSubscription
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$server$2d$only$2f$empty$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/compiled/server-only/empty.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$billing$2d$plans$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/billing-plans.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/env.ts [app-route] (ecmascript)");
;
;
;
function getSupabaseRestConfig() {
    return {
        url: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSupabaseUrl"])(),
        serviceRoleKey: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSupabaseServiceRoleKey"])()
    };
}
async function supabaseRequest(path, init = {}) {
    const { url, serviceRoleKey } = getSupabaseRestConfig();
    const response = await fetch(`${url}${path}`, {
        ...init,
        headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json',
            ...init.headers ?? {}
        },
        cache: 'no-store'
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Supabase request failed: ${response.status}`);
    }
    return response;
}
function asRecord(value) {
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}
function stringValue(value) {
    return typeof value === 'string' && value.trim() ? value.trim() : null;
}
function boolValue(value) {
    return typeof value === 'boolean' ? value : false;
}
function mapSubscriptionRow(row) {
    const metadata = asRecord(row.metadata);
    const planId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$billing$2d$plans$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeSubscriptionPlanId"])(row.plan ?? row.plan_id ?? metadata.plan ?? metadata.plan_id);
    return {
        id: String(row.id),
        workspaceId: String(row.workspace_id),
        planId,
        status: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$billing$2d$plans$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeSubscriptionStatus"])(row.status ?? metadata.status),
        billingCycle: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$billing$2d$plans$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeBillingCycle"])(row.billing_cycle ?? metadata.billing_cycle),
        currentPeriodStart: stringValue(row.current_period_start),
        currentPeriodEnd: stringValue(row.current_period_end),
        cancelAtPeriodEnd: boolValue(row.cancel_at_period_end),
        provider: stringValue(row.provider) ?? stringValue(metadata.provider) ?? 'manual',
        paymentMethodLabel: stringValue(row.payment_method_label) ?? stringValue(metadata.payment_method_label) ?? stringValue(metadata.paymentMethodLabel) ?? '',
        metadata,
        createdAt: stringValue(row.created_at) ?? undefined,
        updatedAt: stringValue(row.updated_at) ?? undefined
    };
}
function mapEventRow(row) {
    const amount = Number(row.amount ?? 0);
    return {
        id: String(row.id),
        workspaceId: String(row.workspace_id),
        subscriptionId: stringValue(row.subscription_id),
        eventType: String(row.event_type ?? 'subscription_event'),
        amount: Number.isFinite(amount) ? amount : 0,
        currency: String(row.currency ?? 'RUB'),
        metadata: asRecord(row.metadata),
        createdAt: String(row.created_at ?? new Date().toISOString())
    };
}
function serializeSubscription(record) {
    const plan = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$billing$2d$plans$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getBillingPlan"])(record.planId);
    return {
        id: record.id,
        workspaceId: record.workspaceId,
        plan: record.planId,
        planId: record.planId,
        planName: plan.name,
        status: record.status,
        billingCycle: record.billingCycle,
        billing_cycle: record.billingCycle,
        currentPeriodStart: record.currentPeriodStart,
        current_period_start: record.currentPeriodStart,
        currentPeriodEnd: record.currentPeriodEnd,
        current_period_end: record.currentPeriodEnd,
        cancelAtPeriodEnd: record.cancelAtPeriodEnd,
        cancel_at_period_end: record.cancelAtPeriodEnd,
        provider: record.provider,
        paymentMethodLabel: record.paymentMethodLabel,
        payment_method_label: record.paymentMethodLabel,
        metadata: {
            ...record.metadata,
            planId: record.planId,
            planName: plan.name
        },
        createdAt: record.createdAt,
        updatedAt: record.updatedAt
    };
}
function serializeEvent(record) {
    const metadata = record.metadata ?? {};
    const planId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$billing$2d$plans$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeSubscriptionPlanId"])(metadata.planId ?? metadata.plan_id ?? metadata.plan);
    const plan = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$billing$2d$plans$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getBillingPlan"])(planId);
    return {
        id: record.id,
        workspaceId: record.workspaceId,
        subscriptionId: record.subscriptionId,
        eventType: record.eventType,
        event_type: record.eventType,
        amount: record.amount,
        currency: record.currency,
        planId,
        plan_id: planId,
        planName: String(metadata.planName ?? metadata.plan_name ?? plan.name),
        plan_name: String(metadata.planName ?? metadata.plan_name ?? plan.name),
        status: String(metadata.status ?? 'paid'),
        method: String(metadata.method ?? metadata.payment_method_label ?? 'manual'),
        metadata,
        createdAt: record.createdAt,
        created_at: record.createdAt
    };
}
async function fetchWorkspaceSubscription(workspaceId) {
    const response = await supabaseRequest(`/rest/v1/sloty_workspace_subscriptions?workspace_id=eq.${encodeURIComponent(workspaceId)}&select=*&limit=1`);
    const rows = await response.json();
    return rows[0] ? mapSubscriptionRow(rows[0]) : null;
}
async function insertWorkspaceSubscription(workspaceId, planId = 'start') {
    const now = new Date();
    const plan = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$billing$2d$plans$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getBillingPlan"])(planId);
    const billingCycle = 'monthly';
    const currentPeriodEnd = plan.monthly > 0 ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$billing$2d$plans$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["addBillingPeriod"])(now, billingCycle).toISOString() : null;
    const response = await supabaseRequest('/rest/v1/sloty_workspace_subscriptions?select=*', {
        method: 'POST',
        headers: {
            Prefer: 'return=representation'
        },
        body: JSON.stringify([
            {
                workspace_id: workspaceId,
                plan: planId,
                status: 'active',
                billing_cycle: billingCycle,
                current_period_start: now.toISOString(),
                current_period_end: currentPeriodEnd,
                cancel_at_period_end: false,
                provider: 'manual',
                payment_method_label: plan.monthly > 0 ? 'Manual activation' : '',
                metadata: {
                    planId,
                    planName: plan.name,
                    source: 'auto_create'
                }
            }
        ])
    });
    const rows = await response.json();
    return mapSubscriptionRow(rows[0]);
}
async function recordSubscriptionEvent(args) {
    const response = await supabaseRequest('/rest/v1/sloty_subscription_events?select=*', {
        method: 'POST',
        headers: {
            Prefer: 'return=representation'
        },
        body: JSON.stringify([
            {
                workspace_id: args.workspaceId,
                subscription_id: args.subscriptionId ?? null,
                event_type: args.eventType,
                amount: args.amount ?? 0,
                currency: args.currency ?? 'RUB',
                metadata: args.metadata ?? {}
            }
        ])
    });
    const rows = await response.json();
    return rows[0] ? mapEventRow(rows[0]) : null;
}
async function ensureWorkspaceSubscription(workspaceId) {
    const existing = await fetchWorkspaceSubscription(workspaceId);
    if (existing) {
        return existing;
    }
    const created = await insertWorkspaceSubscription(workspaceId, 'start');
    await recordSubscriptionEvent({
        workspaceId,
        subscriptionId: created.id,
        eventType: 'subscription_created',
        amount: 0,
        metadata: {
            planId: created.planId,
            planName: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$billing$2d$plans$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getBillingPlan"])(created.planId).name,
            status: created.status,
            method: 'auto'
        }
    }).catch(()=>null);
    return created;
}
async function updateWorkspaceSubscription(args) {
    const current = await ensureWorkspaceSubscription(args.workspaceId);
    const plan = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$billing$2d$plans$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getBillingPlan"])(args.planId);
    const now = new Date();
    const amount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$billing$2d$plans$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getPlanPrice"])(args.planId, args.billingCycle);
    const currentPeriodEnd = amount > 0 ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$billing$2d$plans$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["addBillingPeriod"])(now, args.billingCycle).toISOString() : null;
    const paymentMethodLabel = amount > 0 ? 'Manual activation' : '';
    const response = await supabaseRequest(`/rest/v1/sloty_workspace_subscriptions?id=eq.${encodeURIComponent(current.id)}&select=*`, {
        method: 'PATCH',
        headers: {
            Prefer: 'return=representation'
        },
        body: JSON.stringify({
            plan: args.planId,
            status: 'active',
            billing_cycle: args.billingCycle,
            current_period_start: now.toISOString(),
            current_period_end: currentPeriodEnd,
            cancel_at_period_end: false,
            provider: 'manual',
            payment_method_label: paymentMethodLabel,
            metadata: {
                ...current.metadata ?? {},
                planId: args.planId,
                planName: plan.name,
                billingCycle: args.billingCycle,
                method: paymentMethodLabel || 'free',
                source: 'dashboard_subscription_page',
                updatedAt: now.toISOString()
            }
        })
    });
    const rows = await response.json();
    const updated = rows[0] ? mapSubscriptionRow(rows[0]) : current;
    await recordSubscriptionEvent({
        workspaceId: args.workspaceId,
        subscriptionId: updated.id,
        eventType: args.eventType ?? (amount > 0 ? 'payment_succeeded' : 'plan_changed'),
        amount,
        metadata: {
            planId: args.planId,
            planName: plan.name,
            billingCycle: args.billingCycle,
            status: updated.status,
            method: paymentMethodLabel || 'free',
            mode: 'manual_mvp'
        }
    }).catch(()=>null);
    return updated;
}
async function listSubscriptionEvents(workspaceId) {
    const response = await supabaseRequest(`/rest/v1/sloty_subscription_events?workspace_id=eq.${encodeURIComponent(workspaceId)}&select=*&order=created_at.desc&limit=50`);
    const rows = await response.json();
    return rows.map(mapEventRow);
}
async function getWorkspaceBillingSnapshot(workspaceId) {
    const subscription = await ensureWorkspaceSubscription(workspaceId);
    const events = await listSubscriptionEvents(workspaceId).catch(()=>[]);
    return {
        subscription: serializeSubscription(subscription),
        subscriptionEvents: events.map(serializeEvent)
    };
}
}),
"[project]/lib/server/supabase-workspaces.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createWorkspace",
    ()=>createWorkspace,
    "ensureUniqueSlug",
    ()=>ensureUniqueSlug,
    "fetchWorkspaceById",
    ()=>fetchWorkspaceById,
    "fetchWorkspaceByOwner",
    ()=>fetchWorkspaceByOwner,
    "fetchWorkspaceBySlug",
    ()=>fetchWorkspaceBySlug,
    "fetchWorkspaceForUser",
    ()=>fetchWorkspaceForUser,
    "updateWorkspace",
    ()=>updateWorkspace,
    "updateWorkspaceOwner",
    ()=>updateWorkspaceOwner
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$server$2d$only$2f$empty$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/compiled/server-only/empty.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/env.ts [app-route] (ecmascript)");
;
;
function getSupabaseRestConfig() {
    return {
        url: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSupabaseUrl"])(),
        serviceRoleKey: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$env$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSupabaseServiceRoleKey"])()
    };
}
async function supabaseRequest(path, init = {}) {
    const { url, serviceRoleKey } = getSupabaseRestConfig();
    const response = await fetch(`${url}${path}`, {
        ...init,
        headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json',
            ...init.headers ?? {}
        },
        cache: 'no-store'
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Supabase request failed: ${response.status}`);
    }
    return response;
}
function mapRow(row) {
    return {
        id: String(row.id),
        ownerId: typeof row.owner_id === 'string' ? row.owner_id : undefined,
        slug: String(row.slug),
        profile: row.profile,
        data: row.data ?? {},
        appearance: row.appearance ?? null,
        createdAt: typeof row.created_at === 'string' ? row.created_at : undefined,
        updatedAt: typeof row.updated_at === 'string' ? row.updated_at : undefined
    };
}
async function getSingle(path) {
    const response = await supabaseRequest(path);
    const rows = await response.json();
    return rows[0] ? mapRow(rows[0]) : null;
}
async function fetchWorkspaceById(workspaceId) {
    return getSingle(`/rest/v1/sloty_workspaces?id=eq.${encodeURIComponent(workspaceId)}&select=*`);
}
async function fetchWorkspaceByOwner(ownerId) {
    return getSingle(`/rest/v1/sloty_workspaces?owner_id=eq.${encodeURIComponent(ownerId)}&select=*`);
}
async function fetchWorkspaceBySlug(slug) {
    return getSingle(`/rest/v1/sloty_workspaces?slug=eq.${encodeURIComponent(slug)}&select=*`);
}
async function createWorkspace(snapshot) {
    const response = await supabaseRequest('/rest/v1/sloty_workspaces?select=*', {
        method: 'POST',
        headers: {
            Prefer: 'return=representation'
        },
        body: JSON.stringify([
            {
                id: snapshot.id,
                owner_id: snapshot.ownerId,
                slug: snapshot.slug,
                profile: snapshot.profile,
                data: snapshot.data,
                appearance: snapshot.appearance ?? null
            }
        ])
    });
    const rows = await response.json();
    return mapRow(rows[0]);
}
async function updateWorkspace(workspaceId, patch) {
    const response = await supabaseRequest(`/rest/v1/sloty_workspaces?id=eq.${encodeURIComponent(workspaceId)}&select=*`, {
        method: 'PATCH',
        headers: {
            Prefer: 'return=representation'
        },
        body: JSON.stringify(patch)
    });
    const rows = await response.json();
    return rows[0] ? mapRow(rows[0]) : null;
}
async function ensureUniqueSlug(slug, workspaceId) {
    const existing = await fetchWorkspaceBySlug(slug);
    if (!existing) return;
    if (!workspaceId || existing.id !== workspaceId) {
        throw new Error('slug_taken');
    }
}
function getTelegramIdFromUser(user) {
    const raw = user.user_metadata?.telegram_id;
    const value = typeof raw === 'number' ? raw : typeof raw === 'string' ? Number(raw) : NaN;
    return Number.isFinite(value) && value > 0 ? String(Math.trunc(value)) : null;
}
async function fetchSingleWorkspaceForRepair() {
    const response = await supabaseRequest('/rest/v1/sloty_workspaces?select=*&order=updated_at.desc&limit=2');
    const rows = await response.json();
    if (rows.length !== 1) return null;
    return mapRow(rows[0]);
}
async function updateWorkspaceOwner(workspaceId, ownerId) {
    const response = await supabaseRequest(`/rest/v1/sloty_workspaces?id=eq.${encodeURIComponent(workspaceId)}&select=*`, {
        method: 'PATCH',
        headers: {
            Prefer: 'return=representation'
        },
        body: JSON.stringify({
            owner_id: ownerId
        })
    });
    const rows = await response.json();
    return rows[0] ? mapRow(rows[0]) : null;
}
async function fetchWorkspaceForUser(user) {
    const owned = await fetchWorkspaceByOwner(user.id);
    if (owned) return owned;
    const telegramId = getTelegramIdFromUser(user);
    if (!telegramId || process.env.CLICKBOOK_DISABLE_SINGLE_WORKSPACE_REPAIR === '1') {
        return null;
    }
    // Recovery for early MVP databases: old Telegram auth could create a new
    // Supabase Auth user while the existing workspace stayed attached to the
    // previous synthetic user. If this project has exactly one workspace, safely
    // reattach it to the current Telegram user instead of showing "create profile".
    const singleWorkspace = await fetchSingleWorkspaceForRepair();
    if (!singleWorkspace) return null;
    return updateWorkspaceOwner(singleWorkspace.id, user.id);
}
}),
"[project]/app/api/workspace/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "dynamic",
    ()=>dynamic,
    "revalidate",
    ()=>revalidate
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$require$2d$auth$2d$user$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/server/require-auth-user.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$supabase$2d$bookings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/server/supabase-bookings.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$supabase$2d$subscriptions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/server/supabase-subscriptions.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$supabase$2d$workspaces$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/server/supabase-workspaces.ts [app-route] (ecmascript)");
;
;
;
;
;
const dynamic = 'force-dynamic';
const revalidate = 0;
function mergeBookings(tableBookings, jsonBookings) {
    const map = new Map();
    // JSON bookings are the resilient fallback. Table rows win when the same id
    // exists there, because they may contain a confirmed status updated later.
    for (const booking of [
        ...jsonBookings,
        ...tableBookings
    ]){
        if (!booking?.id) continue;
        map.set(booking.id, booking);
    }
    return Array.from(map.values()).sort((a, b)=>new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
async function GET() {
    try {
        const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$require$2d$auth$2d$user$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requireAuthUser"])();
        const workspace = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$supabase$2d$workspaces$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchWorkspaceForUser"])(user);
        if (!workspace) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'not_found'
            }, {
                status: 404
            });
        }
        const jsonBookings = Array.isArray(workspace.data?.bookings) ? workspace.data.bookings : [];
        const tableBookings = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$supabase$2d$bookings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["listBookingsByWorkspace"])(workspace.id).catch(()=>[]);
        const bookings = mergeBookings(tableBookings, jsonBookings);
        const billing = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$supabase$2d$subscriptions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getWorkspaceBillingSnapshot"])(workspace.id).catch(()=>({
                subscription: workspace.data?.subscription ?? null,
                subscriptionEvents: Array.isArray(workspace.data?.subscriptionEvents) ? workspace.data.subscriptionEvents : []
            }));
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ...workspace,
            data: {
                ...workspace.data ?? {},
                bookings,
                subscription: billing.subscription,
                subscriptionEvents: billing.subscriptionEvents
            }
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'unknown_error';
        if (message === 'unauthorized') {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'unauthorized'
            }, {
                status: 401
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: message
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__7f56ac6b._.js.map