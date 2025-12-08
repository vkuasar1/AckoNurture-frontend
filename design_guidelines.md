# Acko App Design Guidelines - BabyCare Feature

## Design Approach
**Reference-Based Approach**: Exact replication of the Acko app design system as shown in provided screenshots. This is a mobile-first insurance app with a clean, modern aesthetic focused on accessibility and clarity.

---

## Core Design Elements

### Typography
- **Headings**: Bold sans-serif (Inter or similar), dark text
  - Section headers: ~20px, font-weight 700
  - Card titles: ~16px, font-weight 600
- **Body text**: Medium weight (~400-500), 14px
- **Labels/tags**: Uppercase, 11-12px, font-weight 600
- **Hierarchy**: Clear contrast between heading weights

### Color Palette (User-Specified)
- **Header backgrounds**: Dark charcoal/black (#1a1a1a)
- **Card backgrounds**: Pure white (#ffffff)
- **Primary accent**: Purple/violet (#7c3aed or similar)
- **Secondary accents**: 
  - Light purple pills for tags (#e9d5ff)
  - Coral/pink for "NEW" badges (#fb7185)
  - Red for "Sale" (#ef4444)
  - Green for branded elements (#10b981)
- **Gradients**: Subtle light blue to white in background sections

### Layout System
**Spacing Units**: Use Tailwind units of 4, 6, 8, 12, 16, 20, 24, 32
- Container padding: px-4 (16px horizontal margin from edges)
- Section vertical spacing: py-6 to py-8
- Card internal padding: p-4 to p-5
- Gap between grid items: gap-4

### Component Library

#### Cards
- White background with rounded corners (rounded-xl or ~12-16px)
- Subtle shadow (shadow-sm)
- Clean separation, no heavy borders
- 2-column grid for utility tiles and insurance products

#### Buttons
- **Primary CTA**: White rounded button with dark text, right arrow icon
- **Pill buttons**: Rounded-full with light backgrounds
- **Icon buttons**: Circular, minimal style

#### Navigation
- **Top bar**: Dark background, avatar left, Emergency button right, py-4
- **Quick access**: Horizontal scroll of pill-shaped category buttons
- **Bottom nav**: 3 tabs (Explore, Home, Support), filled icons when active

#### Utility Tiles (Critical for BabyCare)
- **Grid**: 2-column layout (grid-cols-2 gap-4)
- **Card structure**: White background, rounded-xl, p-4, shadow-sm
- **Icon**: Circular container with background color, centered icon (~40px)
- **Title**: Bold, 14-15px, mb-1
- **Subtitle**: Gray text, 12-13px, leading-tight
- **Spacing**: Icon mb-3, text centered or left-aligned

#### BabyCare Tile Specifications
- **Icon**: Baby face or heart-baby icon in circular purple/pink container
- **Title**: "BabyCare" (bold, dark text)
- **Subtitle**: "Track vaccines, growth & milestones" (gray, smaller)
- **Placement**: Within "Do more with ACKO" section, 3x2 utility grid
- **Interaction**: Tappable, navigates to BabyCare Home screen

#### Promotional Banners
- Dark gradient backgrounds with imagery
- White text with CTA buttons
- Purple/light tags for promotional info ("Zero commission", "0% GST")

#### Section Headers
- Bold black text (~18-20px)
- mb-4 spacing below
- Examples: "Buy insurance", "Do more with ACKO"

---

## Screen Structure - Explore Page

### Components in Order:
1. **Top Navigation**: Dark header with greeting + avatar (left), Emergency button (right)
2. **Quick Access Pills**: Horizontal scrollable categories (Vehicles, Family, Policies, Rewards)
3. **Promotional Banner**: Health e-cards with dark gradient background
4. **Buy Insurance Section**: 
   - Section header
   - 2-column grid of insurance cards (Car, Bike, Health, Travel, Life)
   - Each with 3D illustration, title, purple tags, white CTA button
5. **Do More with ACKO Section**:
   - Section header
   - Featured card (AI health policy analyzer)
   - 3x2 utility grid INCLUDING new BabyCare tile
6. **Bottom Tab Navigation**: Explore (active), Home, Support

---

## Images

### Required Images:
- **Insurance product illustrations**: 3D rendered vehicles, medical buildings, umbrellas (colorful, professional)
- **Promotional banners**: Real photography with gradient overlays
- **Utility icons**: Line-style minimal icons for each tile
- **BabyCare icon**: Friendly baby face or heart-baby icon (soft, approachable, purple/pink tones)

### Image Treatment:
- No large hero image (mobile app layout)
- Product cards use illustrations as visual anchors
- Icons are SVG-based, centered in circular containers
- Maintain consistent illustrative style across all product cards

---

## Accessibility & Interaction
- Minimum touch target: 44x44px for all tappable elements
- Clear visual feedback on tap (subtle scale or opacity change)
- High contrast text for readability
- Consistent rounded corners across all components
- Smooth transitions between screens

---

## Critical Quality Standards
- **Pixel-perfect alignment**: All cards, grids, and spacing must match reference screenshots exactly
- **Visual consistency**: BabyCare tile must be indistinguishable from existing utility tiles in style
- **Production-ready**: No placeholder text, proper icon implementation, functional navigation
- **Mobile-first**: Optimized for mobile viewport (375-414px width)