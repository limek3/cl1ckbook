# ClickBook Pixel Dashboard

This sample project demonstrates how to achieve a **pixel‑perfect** prototype of
the ClickBook premium dashboard by using an image overlay. The goal is to
present an interactive dashboard that visually matches the original design
exactly (“1 в 1”) without reimplementing every graphic detail from scratch.

## How It Works

- The `components/dashboard/PixelDashboardOverview.tsx` component renders
  the reference screenshot at its native size (2048×1448) and scales it
  down responsively to fill the viewport while maintaining aspect ratio.
- Interactive hotspots are defined via CSS classes in
  `pixel-dashboard.module.css`. Each hotspot is absolutely positioned over
  the image using pixel coordinates measured from the original design.
  When hovered, hotspots show a subtle highlight and navigate to the
  appropriate page when clicked.
- The `public/assets/clickbook/reference/01_dashboard_overview.png`
  image is the original design used as the base layer. Replace this
  file with newer designs if the reference changes.

## Structure

```
clickbook_pixel_dashboard/
├── app/
│   └── dashboard/
│       └── page.tsx          – Next.js page rendering the pixel dashboard
├── components/
│   └── dashboard/
│       ├── PixelDashboardOverview.tsx – React component for the overlay
│       └── pixel-dashboard.module.css – Styles and hotspot definitions
├── public/
│   └── assets/
│       └── clickbook/
│           └── reference/
│               └── 01_dashboard_overview.png – Source image
└── README.md                  – Project overview (this file)
```

## Usage

1. Install dependencies in your Next.js project (`npm install`, `pnpm
   install` or `yarn install`).
2. Copy the `clickbook_pixel_dashboard` folder into your project.
3. Import and render `PixelDashboardOverview` on the `/dashboard` route.
4. Open the application in a browser. The dashboard should visually match
   the reference design exactly while still providing functional navigation.

## Extending

This approach is ideal for demos or prototypes where visual fidelity is
critical and data interactions are minimal. For production use, consider
progressively replacing hotspots with fully implemented components that
adhere to your design system.