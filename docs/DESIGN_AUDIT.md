# DESIGN AUDIT: Solar Frontier (https://solar-frontier.com/jpn/)
**Reverse-Engineering Document for SOLNEXA Corporate Design System**
*Author: Senior Frontend Engineer & UI/UX Architect*
*Date: 2026-09-27*

---

## 1. Executive Summary & Brand Impression

Solar Frontier (ソーラーフロンティア株式会社) presents one of the highest benchmarks for Japanese renewable energy B2B web design. Rather than feeling like a generic SaaS template or consumer gadget store, the site communicates:
- **Authority & Trust (信頼性と重厚感)**: Rooted in Japanese industrial engineering standards (JIS, METI, corporate infrastructure).
- **Architectural & Spatial Clarity (建築的空間美)**: Broad whitespace, asymmetric editorial layouts, and high-contrast, uncluttered imagery.
- **Precision & Restraint (抑制された美意識)**: Avoids noisy gradients, excessive glassmorphism, or hyperactive bouncy animations. Every transition is deliberate, measured, and dignified.

---

## 2. Header & Navigation Architecture

### A. Two-Tier Header Hierarchy
1. **Top Utility Bar (ユーティリティナビゲーション)**
   - **Height**: ~32px – 36px.
   - **Background**: Soft neutral off-white (`#F8FAFC` or `#F4F6F8`) with a crisp 1px bottom border (`#E2E8F0`).
   - **Left Element**: Urgent notice / corporate announcement ticker with a bold red tag (`お知らせ` / `#D81A28` or `#E60012`).
   - **Right Elements**:
     - Corporate links: *ニュース (News)*, *企業情報 (Company)*, *カタログ・資料請求 (Downloads)*, *お問い合わせ (Contact)*.
     - Authentication / Member Portal trigger.
     - Language selector: *JP / EN* switch with clean uppercase typography.

2. **Main Navigation Bar (メインナビゲーション)**
   - **Height**: ~72px – 80px desktop.
   - **Background**: Pure white (`#FFFFFF`) with subtle bottom border.
   - **Logo**: Positioned on the left, high-contrast monochrome or navy mark with tagline (*Solar & Energy Infrastructure*).
   - **Primary Menu Items**:
     - *事業・ソリューション (Solutions)*
     - *太陽光発電 (Solar PV)*
     - *系統用蓄電池 (BESS)*
     - *エンジニアリング (Engineering & Technology)*
     - *施工・導入事例 (Projects)*
     - *ナレッジ・技術基準 (Knowledge)*
     - *企業情報 (About Us)*
   - **Action Button**: Primary Corporate Red button (`#D81A28`) on the right: *「お問い合わせ・相談」* or *「設計ツール (Pro)」*.

### B. Mega-Menu Behavior
- **Trigger**: Hover with a 120ms debounce to prevent accidental triggering; also accessible via keyboard `Tab` + `Enter`.
- **Layout**: Full-width drop panel spanning the content container.
- **Structure**:
  - Left column: Category overview, headline, and featured contextual photograph (e.g., utility-scale solar or BESS container).
  - Center/Right columns: 2–3 structured sub-category lists with clear headings, sub-links, and descriptive 1-line Japanese captions.
- **Transition**:
  - Opacity: 0 → 1.
  - Subtle downward glide: `translateY(-6px)` → `translateY(0)`.
  - Duration: 240ms with `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out quint).
- **Z-Index**: Top of document stack (`z-index: 50`), overlaying page with subtle backdrop dimming (`rgba(0, 0, 0, 0.15)`).

### C. Mobile Navigation (Independent Architecture)
- Hamburger icon morphing smoothly into an 'X'.
- Fullscreen sliding drawer from the right.
- Distinct accordion panels for primary services with large touch targets (minimum 48px height).
- Prominent persistent contact & login buttons anchored at the bottom of the drawer.

---

## 3. Hero Area (The Editorial First View)

### A. Proportions & Viewport Rhythm
- **Height**: Desktop 85vh – 92vh (leaves a subtle hint of the next section below the fold, encouraging scroll).
- **Aspect Ratio**: Architectural widescreen framing.
- **Background Imagery**: High-resolution industrial photography (utility-scale PV installations, substation infrastructure, BESS liquid-cooling containers under clear natural sky).
- **Overlay Strategy**: **NO muddy black semi-transparent wash**. Instead:
  - Natural image exposure.
  - Subtle directional gradient vignette (top-left or bottom-gradient only where typography sits: `linear-gradient(to right, rgba(0, 25, 45, 0.75) 0%, rgba(0, 25, 45, 0.2) 60%, transparent 100%)`).

### B. Typography & Composition
- **Primary English Catchphrase**:
  ```
  ENERGY
  ENGINEERED
  FOR THE FUTURE.
  ```
  Rendered in bold grotesque sans-serif (`font-extrabold`, letter-spacing `-0.02em`, fluid sizing `clamp(2.5rem, 5.5vw, 5rem)`).
- **Japanese Secondary Line**:
  ```
  未来のエネルギーを、設計する。
  ```
  Set in refined `Noto Sans JP`, medium weight, elegant line-height (`1.8`).
- **Editorial Placement**: Asymmetric left-aligned composition with generous negative space on the right, showcasing the physical scale of the solar/BESS plant.
- **Scroll Indicator**: Minimal vertical line at bottom center or bottom left with subtle moving pulse indicator (`animate-pulse` or vertical line drawing).

---

## 4. Content Rhythm & Section Alternation

Solar Frontier avoids the "boxed card monotony" of typical SaaS websites. It alternates between 5 distinct visual cadences:

| Section Type | Rhythm / Composition | Visual Weight |
|---|---|---|
| **1. Pick up (ピックアップ)** | Horizontal 3–4 card grid / slider with 16:10 photography, category tags, hover image zoom, and subtle red arrow accents. | Light / Dynamic |
| **2. Core Business Divisions** | Asymmetric two-column split: Large high-impact photograph on one side + oversized English title + Japanese narrative on the other. | Heavy / Architectural |
| **3. Deep Engineering & Technology** | Clean grid with technical line diagrams, JIS/Fire code standards badges, and cloud calculation workflow preview. | Medium / Technical |
| **4. Case Studies (導入事例)** | Full-bleed or widescreen photo cards with real engineering metrics (40MW/160MWh, 66kV, location, commissioning year). | Heavy / Tangible |
| **5. About / Philosophy** | Spacious white canvas with large editorial statement, minimal text, and high whitespace ratio (>40%). | Minimal / Prestigious |
| **6. News & Announcements** | Minimalist horizontal list with thin 1px border dividers, monospace dates, and colored category pills. | Light / Functional |
| **7. Closing Contact CTA** | Bold deep-navy background (`#002B49`), bold typography, dual CTA buttons (Direct Consultation + Catalog Download). | Grounding / Conclusive |

---

## 5. Motion & Interaction Philosophy

- **Entrance Transitions**: Viewport-triggered fade-up (`opacity: 0 → 1`, `translateY: 20px → 0px`), duration 600ms, stagger delay 100ms.
- **Image Hover Effects**:
  - Image scaling: `scale(1) → scale(1.04)`.
  - Duration: 500ms `ease-out`.
  - Overflow: `overflow-hidden` container.
- **Arrow Micro-Interactions**:
  - Arrow icon moves +3px to +5px horizontally on group hover (`group-hover:translate-x-1.5`).
- **Button Active States**:
  - Scale down slightly to `0.98` on click to give physical haptic feedback.
- **Restraint Rule**: Zero bouncy springs, zero 3D tilt slop, zero endless background floating bubbles. Motion serves orientation, feedback, and dignity.

---

## 6. Design Tokens Specification

### Colors
- **Brand Navy (Primary)**: `#002B49` (Deep, stable industrial navy; represents infrastructure, grid reliability, engineering precision).
- **Brand Red (Accent / CTA)**: `#D81A28` / `#E60012` (Solar Frontier heritage corporate red; visually prompts decisive action).
- **Navy Dark (Surface/Hero)**: `#001C30` / `#00223A`.
- **Neutral Dark (Text)**: `#0F172A` (Slate 900) for headlines, `#334155` (Slate 700) for body text.
- **Neutral Muted**: `#64748B` (Slate 500).
- **Surface Light**: Pure White `#FFFFFF`.
- **Surface Off-White (Section alternating)**: `#F8FAFC` (Slate 50) and `#F1F5F9` (Slate 100).
- **Border**: `#E2E8F0` (Slate 200) and `#CBD5E1` (Slate 300).

### Typography
- **Headings (Latin)**: Grotesque Sans (`Inter`, `Helvetica Neue`, sans-serif), weights 700 / 800.
- **Headings & Body (Japanese)**: `Noto Sans JP`, `Hiragino Sans`, `Meiryo`, sans-serif.
- **Code & Specs**: Monospace (`SFMono-Regular`, `Consolas`, monospace) for dates, MW/MWh capacities, voltage levels.
- **Fluid Scale**:
  - Display Hero: `clamp(2.5rem, 5vw + 1rem, 5.5rem)`
  - H1 / Section Title: `clamp(2rem, 3.5vw + 0.5rem, 3.25rem)`
  - H2 / Sub-section: `clamp(1.5rem, 2.5vw, 2.25rem)`
  - H3 / Card Title: `1.125rem – 1.35rem`
  - Body Copy: `0.875rem – 1.0rem`, line-height `1.75 – 1.85`.

### Spacing & Layout
- **Max Content Width**: `1280px` (`max-w-7xl`).
- **Desktop Horizontal Padding**: `px-6 sm:px-8 lg:px-12`.
- **Section Vertical Padding**: `py-16 sm:py-24 lg:py-28`.
- **Border Radius**: Subtle rounded corners (`rounded-lg` 8px, `rounded-xl` 12px, `rounded-2xl` 16px). Avoid pill cards for industrial seriousness.
