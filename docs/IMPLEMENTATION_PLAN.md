# IMPLEMENTATION PLAN: SOLNEXA Corporate Website
**Solar & BESS Engineering Platform (Solar Frontier Inspired Architecture)**
*Document: /docs/IMPLEMENTATION_PLAN.md*

---

## 1. Project Vision & Architecture

The goal is to produce a state-of-the-art Japanese renewable energy corporate website for **株式会社ソルネクサ (SOLNEXA Japan)**.
The website achieves parity with **Solar Frontier** (https://solar-frontier.com/jpn/) in terms of:
- Visual polish, clean typography, and spacious layout rhythm.
- Two-level header with interactive desktop **MegaMenu** and independent mobile drawer.
- Cinematic architectural hero section with fluid bilingual typography.
- "Pick up" interactive card grid/carousel.
- Asymmetric corporate solution showcases (Solar PV, Grid BESS, Engineering Services, O&M).
- Image-led architectural project case studies with genuine engineering data (40MW/160MWh, 66kV, JIS C 8955, Fire Service Act Notification No. 2).
- Editorial About & Philosophy section.
- Minimalist news & announcement feed with thin borders.
- Full-width memorable Contact CTA.
- Structured Japanese corporate footer.
- **Flawless Authentication & Role-Based Access**:
  - Gated tools: Unauthenticated guests get free access to fundamental tools (Voc temperature check, basic voltage drop, load current), while advanced pro features (JIS/ISI conduit sizing, BESS degradation simulation, 66kV transformer sizing, SLD CAD export) prompt a 1-click free registration/login.
  - 1-click demo login & instant registration with real state persistence and feedback.
  - Admin CMS permission to create, edit, and delete technical articles directly in the browser.

---

## 2. Component Hierarchy

```
<App>
  ├── <SiteHeader />
  │     ├── <UtilityTopBar /> (Policy Ticker, Catalog, Contact, Language, Member Auth)
  │     ├── <MainNavigation /> (Brand Logo, Nav Links with Hover State, Contact CTA)
  │     └── <MegaMenu /> (Category Overview, Sub-service Columns, Contextual Photography)
  ├── <MobileNavDrawer /> (Independent Mobile Experience with Accordions)
  │
  ├── [Homepage Main Content]
  │     ├── <HeroSection /> ("ENERGY ENGINEERED FOR THE FUTURE", Slide Carousel, Scroll Indicator)
  │     ├── <FeaturedPickUp /> ("Pick up" Horizontal Card Grid with Hover Scale & Accents)
  │     ├── <BusinessSolutions /> (Solar PV, Grid-Scale BESS, Engineering, O&M)
  │     ├── <BESSSection /> (40MW/160MWh Focus, 1500V DC, Fire Safety 3m Clearance)
  │     ├── <SolarPVSection /> (FIP Transition, DC/AC Oversizing, Industrial Rooftop PPA)
  │     ├── <TechnologySection /> (Integrated Cloud Design Tools, JIS C 3605, SLD CAD)
  │     ├── <CaseStudies /> (Iwata BESS, Soma Utility BESS, Hokkaido Solar, Gunma PPA)
  │     ├── <AboutSection /> ("ENGINEERING A SUSTAINABLE FUTURE" Editorial Whitespace)
  │     ├── <NewsSection /> (Minimal Japanese Corporate Feed, Thin 1px Dividers)
  │     └── <ContactCTA /> ("LET'S BUILD THE NEXT ENERGY INFRASTRUCTURE")
  │
  ├── <SiteFooter /> (Multi-column corporate footer, affiliations, legal, language)
  │
  └── [Interactive Overlays & Modals]
        ├── <LoginModal /> (Instant Demo Login, 30s Free Registration, Role Badges)
        ├── <ContactModal /> (Corporate Inquiry & Technical Consulting)
        ├── <ArticleEditorModal /> (Admin CMS CRUD for Articles)
        └── <EngineeringToolsPortal /> (Direct Gateway to Pro Workspace)
```

---

## 3. Detailed Component Plan & Implementation Steps

### Step 1: Fix Login / Authentication Subsystem
- Ensure `LoginModal.tsx` supports:
  - 1-click login directly upon clicking any demo account card (Admin, EPC Partner, Asset Owner).
  - Clean manual email login with local & backend fallback.
  - 30-second free customer registration with instant auto-login.
  - Visual toast notification on login/logout.
  - Seamless persistence across browser reloads via `localStorage` and `/api/auth/me`.

### Step 2: Build `SiteHeader.tsx` & `MegaMenu.tsx`
- Build two-tier navigation.
- Implement animated `MegaMenu` with active tab detection, smooth CSS transition, keyboard navigation, and rich category details + contextual photography.
- Build mobile slide-in drawer with clean accordion hierarchy.

### Step 3: Build `HeroSection.tsx`
- Implement widescreen architectural solar/battery canvas.
- Display bilingual typography:
  - EN: `ENERGY ENGINEERED FOR THE FUTURE.`
  - JP: `未来のエネルギーを、設計する。`
- Include subtle slide transition controls, active slide indicator, and animated scroll prompt.

### Step 4: Build `FeaturedPickUp.tsx`
- "Pick up" section matching Solar Frontier with 4 curated cards.
- Category tags, dates, hover scale on images (`scale-104 duration-500`), clean typography, red chevron indicator.

### Step 5: Build `BusinessSolutions.tsx`, `BESSSection.tsx` & `SolarPVSection.tsx`
- Asymmetric editorial entries for primary business units.
- Real Japanese energy metrics (40MW/160MWh, 66kV, Fire Service Act Notification No. 2, JIS C 8955).

### Step 6: Build `TechnologySection.tsx` & `CaseStudies.tsx`
- Showcase the integrated cloud design suite, Single Line Diagram generator, and JIS C 3605 cable sizing.
- Real case studies with photos, location, capacity, system type, and commissioning year.

### Step 7: Build `AboutSection.tsx`, `NewsSection.tsx` & `ContactCTA.tsx`
- Editorial whitespace composition for About.
- Minimalist news list with thin dividers.
- Full-width authoritative Contact CTA banner.

### Step 8: Build `SiteFooter.tsx`
- Full corporate Japanese directory, JPEA / Battery Association affiliations, Tokyo HQ address, privacy policy, and copyright.

### Step 9: Verify Responsive Design, Lint & Compilation
- Validate at mobile (375px/430px), tablet (768px), laptop (1024px/1440px), and wide desktop (1920px).
- Verify `lint_applet` and `compile_applet`.
