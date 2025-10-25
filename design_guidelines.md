# Design Guidelines for Jaki Global Drag-and-Drop Website Builder

## Design Approach

**Hybrid Approach**: Material Design system for the builder interface + Shopify/Wix-inspired aesthetics for the generated storefront pages.

**Rationale**: The builder tool requires clear, intuitive UI patterns (Material Design), while the ecommerce output should feel modern, trustworthy, and visually appealing (inspired by Shopify's clean product displays and Wix's flexibility).

**Key Principles**:
- Builder clarity: Every tool and option immediately understandable
- Output elegance: Generated pages should look professionally designed
- Brand presence: "Jaki Global" branding prominent but not overwhelming
- Conversion-focused: Ecommerce layout optimized for product discovery and purchase

## Typography System

**Builder Interface**:
- Primary: Inter (Google Fonts) - weights 400, 500, 600, 700
- Headings: text-lg to text-2xl (builder panel headers)
- Body: text-sm to text-base (tool labels, descriptions)
- Micro: text-xs (helper text, secondary info)

**Generated Storefront**:
- Brand/Headers: Montserrat (Google Fonts) - weights 600, 700, 800
- Product Names: text-xl font-semibold
- Body: text-base leading-relaxed
- Prices: text-2xl font-bold (emphasize commercial value)
- Buttons: text-sm font-medium uppercase tracking-wide

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, 12, 16
- Tight spacing: p-2, gap-2 (color swatches, icon groups)
- Standard spacing: p-4, gap-4 (form fields, card padding)
- Section spacing: py-8, py-12 (builder sections)
- Generous spacing: py-16 (storefront hero, product sections)

**Builder Interface Grid**:
- Left sidebar: Fixed width 280px (toolbox panel)
- Center canvas: Flexible (live preview area with iframe)
- Right sidebar: Fixed width 320px (properties panel)
- Mobile: Stack vertically with collapsible panels

**Storefront Grid**:
- Container: max-w-7xl mx-auto px-4
- Product grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
- Product detail: Two-column split (60% images, 40% details)

## Component Library

### Builder Interface Components

**Toolbox Panel**:
- Draggable component cards with icon + label
- Categories: Headers, Text Boxes, Images, Backgrounds, Buttons, Product Displays
- Visual preview thumbnails for each component type
- Smooth drag indicators with ghost preview

**Properties Panel**:
- Tabbed interface: Style | Content | Layout
- Color picker with preset swatches AND custom input
- Metallic options: Gold (#D4AF37, #FFD700), Silver (#C0C0C0, #E8E8E8) with gradient suggestions
- Font dropdown with live preview
- Spacing controls: Slider + numeric input
- Alignment tools: Visual button group

**Canvas Controls**:
- Floating toolbar: Desktop/Tablet/Mobile preview toggles
- Zoom controls: 50%, 75%, 100%, 150%
- Undo/Redo prominent in top-left
- Save/Export primary button top-right

**Color System Panel**:
- Standard palette: 12 curated colors in grid
- Metallic section: 4 gold variants, 4 silver variants
- Custom color input with hex/rgb support
- Recent colors history (last 8 used)

### Storefront Components

**Header**:
- Brand "Jaki Global": text-3xl font-bold tracking-tight
- Clean navigation bar with hover underline effect
- Shopping cart icon with item count badge
- Sticky on scroll with subtle shadow

**Hero Section**:
- Full-width background image support (user-uploaded)
- Centered content overlay with blur backdrop for text readability
- Large headline: text-5xl md:text-6xl font-bold
- CTA button with blurred background effect (backdrop-blur-md bg-white/20)
- Minimum height: 60vh on desktop, 50vh on mobile

**Product Cards**:
- Clean white cards with subtle border
- Product image: Aspect ratio 4:3, object-cover
- Hover effect: Subtle scale and shadow lift
- Product name truncated to 2 lines
- Price prominent with "Add to Cart" button
- Variant indicators (e.g., "5 colors available")

**Product Detail Page**:
- Image gallery: Main image + thumbnail strip
- Variant selectors: Styled dropdown menus for Color and Size
- Clear labels above each selector
- Price updates dynamically based on variant
- "Add to Cart" CTA: Large, high contrast, fixed on mobile scroll
- Product description with expandable sections

**PayPal Checkout Integration**:
- PayPal button: Official branding, centered
- Secure checkout badge below button
- Order summary card: Itemized with clear totals
- Trust indicators: "Secure payment" text with lock icon

**Footer** (User-Specified):
- Background: #0d0d0d
- Text color: #ffffff
- Contact email link: #00aced
- Donation code: #ff4d4d bold
- Font: Arial
- Padding: 20px
- Centered alignment
- Three distinct sections with proper spacing

## Image Strategy

**Hero Section**: Large, impactful lifestyle or product photography (1920x1080 recommended). User will upload via drag-and-drop interface.

**Product Images**: High-quality product shots on white/neutral backgrounds (800x800 minimum). Automatically fetched from Printify API.

**Background Options**: Solid colors, gradients, or uploaded images. Builder provides preset gradient options including metallic gold-to-black, silver-to-white.

**Placeholder Images**: Use via Unsplash API for demo/preview purposes in builder.

## Drag-and-Drop Interactions

**Visual Feedback**:
- Dotted outline shows drop zones
- Ghost preview follows cursor during drag
- Target element highlights on hover
- Snap-to-grid option for alignment

**Component Insertion**:
- Components drop into position with smooth fade-in
- Automatic spacing adjustment around new elements
- Selection outline appears immediately after drop

**Editing States**:
- Selected: Blue outline with resize handles
- Hover: Subtle gray outline
- Locked: Red outline (prevents accidental edits)

## Animations

**Builder Interface**: Minimal, functional only
- Panel slide-in/out: 200ms ease
- Tool highlight on hover: Instant
- Save confirmation: 2s fade toast notification

**Storefront**: Strategic, conversion-focused
- Product card hover: 150ms scale(1.02)
- Add to cart button: Ripple effect on click
- Image gallery transitions: 300ms crossfade
- No scroll-triggered animations

## Responsive Breakpoints

- Mobile: < 768px (single column, touch-optimized)
- Tablet: 768px - 1024px (2-column product grid)
- Desktop: > 1024px (3-4 column grid, full builder interface)

**Mobile-Specific**:
- Hamburger menu for navigation
- Bottom sheet for variant selection
- Sticky "Add to Cart" button
- Simplified builder interface with accordion panels

## Export Functionality

Generated code package includes:
- Standalone HTML files with inline Tailwind CSS
- Separate CSS file for custom styles
- JavaScript file for Printify API integration
- PayPal SDK integration script
- README with deployment instructions
- All uploaded assets in organized folder structure

This design creates a professional, user-friendly website builder that produces high-converting ecommerce pages for Jaki Global brand.