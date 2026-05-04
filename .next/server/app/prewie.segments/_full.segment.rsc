1:"$Sreact.fragment"
2:I[55763,["/_next/static/chunks/a5dbac3aa96c164d.js","/_next/static/chunks/b35cc6105a630a90.js","/_next/static/chunks/71907302d048ea65.js","/_next/static/chunks/7e6a4e99d2f3a486.js"],""]
a:I[50025,["/_next/static/chunks/26ca110782d86623.js","/_next/static/chunks/6fbb43098a676774.js"],"default"]
:HL["/_next/static/chunks/656eff7ade61fcd3.css","style"]
3:T1ba7,
    try {
      const fallback = {"accentTone":"cobalt","neutralTone":"zinc","density":"standard","radius":"medium","motion":"smooth","cardStyle":"soft","dashboardSurface":"calm","dashboardControlStyle":"capsule","publicCover":"gradient","publicAccent":"cobalt","publicButtonStyle":"pill","publicCardStyle":"soft","publicServicesStyle":"grid","publicBookingStyle":"panel","publicHeroLayout":"split","publicSurface":"soft","publicSectionStyle":"cards","publicGalleryStyle":"grid","publicNavigationStyle":"side","publicStatsStyle":"cards","publicCtaMode":"sticky","platformWidth":"balanced","sidebarDensity":"balanced","topbarDensity":"balanced","mobileFontScale":"compact","layoutConstructor":{"dashboard":{"layout":"balanced","order":["summary","pipeline","week","highlights"]},"today":{"layout":"balanced","order":["summary","timeline","queue","insights"]},"stats":{"layout":"balanced","order":["summary","journal","activity","signals"]},"chats":{"layout":"balanced","order":["inbox","conversation","assistant","clientCard"]},"services":{"layout":"split","order":["summary","catalog","preview","quickAdd"]},"availability":{"layout":"split","order":["summary","editor","presets"]},"public":{"layout":"split","order":["hero","services","booking","contacts","faq","gallery"]}}};
      const palette = {"emerald":{"hue":"164","sat":"80%","solid":"#10b981","soft":"rgba(16, 185, 129, 0.14)","gradient":"linear-gradient(135deg, #10b981, #0f9f70)"},"violet":{"hue":"258","sat":"88%","solid":"#8b5cf6","soft":"rgba(139, 92, 246, 0.14)","gradient":"linear-gradient(135deg, #8b5cf6, #7c3aed)"},"sky":{"hue":"199","sat":"92%","solid":"#0ea5e9","soft":"rgba(14, 165, 233, 0.14)","gradient":"linear-gradient(135deg, #0ea5e9, #0284c7)"},"rose":{"hue":"340","sat":"82%","solid":"#f43f5e","soft":"rgba(244, 63, 94, 0.14)","gradient":"linear-gradient(135deg, #f43f5e, #e11d48)"},"amber":{"hue":"38","sat":"92%","solid":"#f59e0b","soft":"rgba(245, 158, 11, 0.14)","gradient":"linear-gradient(135deg, #f59e0b, #d97706)"},"cyan":{"hue":"188","sat":"94%","solid":"#06b6d4","soft":"rgba(6, 182, 212, 0.14)","gradient":"linear-gradient(135deg, #06b6d4, #0891b2)"},"indigo":{"hue":"236","sat":"83%","solid":"#6366f1","soft":"rgba(99, 102, 241, 0.14)","gradient":"linear-gradient(135deg, #6366f1, #4f46e5)"},"peach":{"hue":"18","sat":"95%","solid":"#fb7185","soft":"rgba(251, 113, 133, 0.14)","gradient":"linear-gradient(135deg, #fb7185, #f43f5e)"},"teal":{"hue":"173","sat":"80%","solid":"#14b8a6","soft":"rgba(20, 184, 166, 0.14)","gradient":"linear-gradient(135deg, #14b8a6, #0f766e)"},"cobalt":{"hue":"214","sat":"99%","solid":"#127dfe","soft":"rgba(18, 125, 254, 0.14)","gradient":"linear-gradient(135deg, #127dfe, #0f6fe1)"},"ruby":{"hue":"350","sat":"78%","solid":"#dc2626","soft":"rgba(220, 38, 38, 0.14)","gradient":"linear-gradient(135deg, #dc2626, #b91c1c)"},"lime":{"hue":"84","sat":"80%","solid":"#84cc16","soft":"rgba(132, 204, 22, 0.14)","gradient":"linear-gradient(135deg, #84cc16, #65a30d)"}};
      const raw = window.localStorage.getItem("sloty-appearance-settings");
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
  0:{"P":null,"b":"7KssmjuyvhQk-BwGOuFzA","c":["","prewie"],"q":"","i":false,"f":[[["",{"children":["prewie",{"children":["__PAGE__",{}]}]},"$undefined","$undefined",true],[["$","$1","c",{"children":[[["$","link","0",{"rel":"stylesheet","href":"/_next/static/chunks/656eff7ade61fcd3.css","precedence":"next","crossOrigin":"$undefined","nonce":"$undefined"}],["$","script","script-0",{"src":"/_next/static/chunks/a5dbac3aa96c164d.js","async":true,"nonce":"$undefined"}],["$","script","script-1",{"src":"/_next/static/chunks/b35cc6105a630a90.js","async":true,"nonce":"$undefined"}],["$","script","script-2",{"src":"/_next/static/chunks/71907302d048ea65.js","async":true,"nonce":"$undefined"}],["$","script","script-3",{"src":"/_next/static/chunks/7e6a4e99d2f3a486.js","async":true,"nonce":"$undefined"}]],["$","html",null,{"lang":"ru","suppressHydrationWarning":true,"children":["$","body",null,{"className":"min-h-screen bg-background font-sans text-foreground antialiased","children":[["$","$L2",null,{"id":"sloty-appearance-preferences","strategy":"beforeInteractive","children":"$3"}],"$L4","$L5","$L6"]}]}]]}],{"children":["$L7",{"children":["$L8",{},null,false,false]},null,false,false]},null,false,false],"$L9",false]],"m":"$undefined","G":["$a",[]],"S":true}
b:"$Sreact.suspense"
c:I[1254,["/_next/static/chunks/a5dbac3aa96c164d.js","/_next/static/chunks/b35cc6105a630a90.js","/_next/static/chunks/71907302d048ea65.js","/_next/static/chunks/7e6a4e99d2f3a486.js"],"Providers"]
d:I[45121,["/_next/static/chunks/26ca110782d86623.js","/_next/static/chunks/6fbb43098a676774.js"],"default"]
e:I[60512,["/_next/static/chunks/26ca110782d86623.js","/_next/static/chunks/6fbb43098a676774.js"],"default"]
10:I[35417,["/_next/static/chunks/26ca110782d86623.js","/_next/static/chunks/6fbb43098a676774.js"],"OutletBoundary"]
12:I[35417,["/_next/static/chunks/26ca110782d86623.js","/_next/static/chunks/6fbb43098a676774.js"],"ViewportBoundary"]
14:I[35417,["/_next/static/chunks/26ca110782d86623.js","/_next/static/chunks/6fbb43098a676774.js"],"MetadataBoundary"]
4:["$","$L2",null,{"id":"sloty-shell-preferences","strategy":"beforeInteractive","children":"\n  try {\n    const collapsed = window.localStorage.getItem('clickbook-sidebar-premium-v15');\n    document.documentElement.dataset.slotySidebar = collapsed === 'true' ? 'collapsed' : 'expanded';\n  } catch (error) {\n    document.documentElement.dataset.slotySidebar = 'expanded';\n  }\n"}]
5:["$","$L2",null,{"id":"telegram-miniapp-sdk","src":"https://telegram.org/js/telegram-web-app.js","strategy":"beforeInteractive"}]
6:["$","$b",null,{"fallback":null,"children":["$","$Lc",null,{"children":["$","$Ld",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$Le",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":[[["$","title",null,{"children":"404: This page could not be found."}],["$","div",null,{"style":{"fontFamily":"system-ui,\"Segoe UI\",Roboto,Helvetica,Arial,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\"","height":"100vh","textAlign":"center","display":"flex","flexDirection":"column","alignItems":"center","justifyContent":"center"},"children":["$","div",null,{"children":[["$","style",null,{"dangerouslySetInnerHTML":{"__html":"body{color:#000;background:#fff;margin:0}.next-error-h1{border-right:1px solid rgba(0,0,0,.3)}@media (prefers-color-scheme:dark){body{color:#fff;background:#000}.next-error-h1{border-right:1px solid rgba(255,255,255,.3)}}"}}],["$","h1",null,{"className":"next-error-h1","style":{"display":"inline-block","margin":"0 20px 0 0","padding":"0 23px 0 0","fontSize":24,"fontWeight":500,"verticalAlign":"top","lineHeight":"49px"},"children":404}],["$","div",null,{"style":{"display":"inline-block"},"children":["$","h2",null,{"style":{"fontSize":14,"fontWeight":400,"lineHeight":"49px","margin":0},"children":"This page could not be found."}]}]]}]}]],[]],"forbidden":"$undefined","unauthorized":"$undefined"}]}]}]
7:["$","$1","c",{"children":[null,["$","$Ld",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$Le",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","forbidden":"$undefined","unauthorized":"$undefined"}]]}]
8:["$","$1","c",{"children":["$Lf",null,["$","$L10",null,{"children":["$","$b",null,{"name":"Next.MetadataOutlet","children":"$@11"}]}]]}]
9:["$","$1","h",{"children":[null,["$","$L12",null,{"children":"$L13"}],["$","div",null,{"hidden":true,"children":["$","$L14",null,{"children":["$","$b",null,{"name":"Next.Metadata","children":"$L15"}]}]}],null]}]
f:E{"digest":"NEXT_REDIRECT;replace;/about;307;"}
13:[["$","meta","0",{"charSet":"utf-8"}],["$","meta","1",{"name":"viewport","content":"width=device-width, initial-scale=1"}],["$","meta","2",{"name":"theme-color","media":"(prefers-color-scheme: light)","content":"#f5f6f8"}],["$","meta","3",{"name":"theme-color","media":"(prefers-color-scheme: dark)","content":"#090909"}]]
11:null
15:[["$","title","0",{"children":"КликБук — платформа для записи клиентов"}],["$","meta","1",{"name":"description","content":"Профиль мастера, страница записи, чаты и аналитика в одной платформе КликБук."}],["$","meta","2",{"name":"generator","content":"КликБук"}]]
