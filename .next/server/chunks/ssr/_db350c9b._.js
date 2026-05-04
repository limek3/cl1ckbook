module.exports=[57050,(a,b,c)=>{let{createClientModuleProxy:d}=a.r(4039);a.n(d("[project]/node_modules/.pnpm/next@16.1.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/client/script.js <module evaluation>"))},34545,(a,b,c)=>{let{createClientModuleProxy:d}=a.r(4039);a.n(d("[project]/node_modules/.pnpm/next@16.1.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/client/script.js"))},36937,a=>{"use strict";a.i(57050);var b=a.i(34545);a.n(b)},61231,(a,b,c)=>{b.exports=a.r(36937)},88322,a=>{"use strict";a.s(["Providers",()=>b]);let b=(0,a.i(4039).registerClientReference)(function(){throw Error("Attempted to call Providers() from the server but Providers is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/components/app/providers.tsx <module evaluation>","Providers")},54838,a=>{"use strict";a.s(["Providers",()=>b]);let b=(0,a.i(4039).registerClientReference)(function(){throw Error("Attempted to call Providers() from the server but Providers is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/components/app/providers.tsx","Providers")},67177,a=>{"use strict";a.i(88322);var b=a.i(54838);a.n(b)},33290,a=>{"use strict";let b,c,d;var e=a.i(81332),f=a.i(17750),g=a.i(61231),h=a.i(67177);let i={dashboard:{layout:"balanced",order:["summary","pipeline","week","highlights"]},today:{layout:"balanced",order:["summary","timeline","queue","insights"]},stats:{layout:"balanced",order:["summary","journal","activity","signals"]},chats:{layout:"balanced",order:["inbox","conversation","assistant","clientCard"]},services:{layout:"split",order:["summary","catalog","preview","quickAdd"]},availability:{layout:"split",order:["summary","editor","presets"]},public:{layout:"split",order:["hero","services","booking","contacts","faq","gallery"]}};i.dashboard.order,i.today.order,i.stats.order,i.chats.order,i.services.order,i.availability.order,i.public.order;let j=`
  try {
    const collapsed = window.localStorage.getItem('clickbook-sidebar-premium-v15');
    document.documentElement.dataset.slotySidebar = collapsed === 'true' ? 'collapsed' : 'expanded';
  } catch (error) {
    document.documentElement.dataset.slotySidebar = 'expanded';
  }
`,k=(b=JSON.stringify({accentTone:"cobalt",neutralTone:"zinc",density:"standard",radius:"medium",motion:"smooth",cardStyle:"soft",dashboardSurface:"calm",dashboardControlStyle:"capsule",publicCover:"gradient",publicAccent:"cobalt",publicButtonStyle:"pill",publicCardStyle:"soft",publicServicesStyle:"grid",publicBookingStyle:"panel",publicHeroLayout:"split",publicSurface:"soft",publicSectionStyle:"cards",publicGalleryStyle:"grid",publicNavigationStyle:"side",publicStatsStyle:"cards",publicCtaMode:"sticky",platformWidth:"balanced",sidebarDensity:"balanced",topbarDensity:"balanced",mobileFontScale:"compact",layoutConstructor:i}),c=JSON.stringify("sloty-appearance-settings"),d=JSON.stringify({emerald:{hue:"164",sat:"80%",solid:"#10b981",soft:"rgba(16, 185, 129, 0.14)",gradient:"linear-gradient(135deg, #10b981, #0f9f70)"},violet:{hue:"258",sat:"88%",solid:"#8b5cf6",soft:"rgba(139, 92, 246, 0.14)",gradient:"linear-gradient(135deg, #8b5cf6, #7c3aed)"},sky:{hue:"199",sat:"92%",solid:"#0ea5e9",soft:"rgba(14, 165, 233, 0.14)",gradient:"linear-gradient(135deg, #0ea5e9, #0284c7)"},rose:{hue:"340",sat:"82%",solid:"#f43f5e",soft:"rgba(244, 63, 94, 0.14)",gradient:"linear-gradient(135deg, #f43f5e, #e11d48)"},amber:{hue:"38",sat:"92%",solid:"#f59e0b",soft:"rgba(245, 158, 11, 0.14)",gradient:"linear-gradient(135deg, #f59e0b, #d97706)"},cyan:{hue:"188",sat:"94%",solid:"#06b6d4",soft:"rgba(6, 182, 212, 0.14)",gradient:"linear-gradient(135deg, #06b6d4, #0891b2)"},indigo:{hue:"236",sat:"83%",solid:"#6366f1",soft:"rgba(99, 102, 241, 0.14)",gradient:"linear-gradient(135deg, #6366f1, #4f46e5)"},peach:{hue:"18",sat:"95%",solid:"#fb7185",soft:"rgba(251, 113, 133, 0.14)",gradient:"linear-gradient(135deg, #fb7185, #f43f5e)"},teal:{hue:"173",sat:"80%",solid:"#14b8a6",soft:"rgba(20, 184, 166, 0.14)",gradient:"linear-gradient(135deg, #14b8a6, #0f766e)"},cobalt:{hue:"214",sat:"99%",solid:"#127dfe",soft:"rgba(18, 125, 254, 0.14)",gradient:"linear-gradient(135deg, #127dfe, #0f6fe1)"},ruby:{hue:"350",sat:"78%",solid:"#dc2626",soft:"rgba(220, 38, 38, 0.14)",gradient:"linear-gradient(135deg, #dc2626, #b91c1c)"},lime:{hue:"84",sat:"80%",solid:"#84cc16",soft:"rgba(132, 204, 22, 0.14)",gradient:"linear-gradient(135deg, #84cc16, #65a30d)"}}),`
    try {
      const fallback = ${b};
      const palette = ${d};
      const raw = window.localStorage.getItem(${c});
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
  `);function l({children:a}){return(0,e.jsx)("html",{lang:"ru",suppressHydrationWarning:!0,children:(0,e.jsxs)("body",{className:"min-h-screen bg-background font-sans text-foreground antialiased",children:[(0,e.jsx)(g.default,{id:"sloty-appearance-preferences",strategy:"beforeInteractive",children:k}),(0,e.jsx)(g.default,{id:"sloty-shell-preferences",strategy:"beforeInteractive",children:j}),(0,e.jsx)(g.default,{id:"telegram-miniapp-sdk",src:"https://telegram.org/js/telegram-web-app.js",strategy:"beforeInteractive"}),(0,e.jsx)(f.Suspense,{fallback:null,children:(0,e.jsx)(h.Providers,{children:a})})]})})}a.s(["default",()=>l,"metadata",0,{title:"КликБук — платформа для записи клиентов",description:"Профиль мастера, страница записи, чаты и аналитика в одной платформе КликБук.",generator:"КликБук"},"viewport",0,{width:"device-width",initialScale:1,themeColor:[{media:"(prefers-color-scheme: light)",color:"#f5f6f8"},{media:"(prefers-color-scheme: dark)",color:"#090909"}]}],33290)}];

//# sourceMappingURL=_db350c9b._.js.map