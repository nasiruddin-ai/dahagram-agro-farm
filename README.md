# Dahagram Agro Farm Ltd. (`দহগ্রাম এগ্রোফার্ম লিঃ`) — Ready-Made Agricultural Storefront

A ready-to-deploy, extensible agricultural e-commerce & YouTube playlist-backed website built for **Dahagram Agro Farm Ltd.** (`@dahagram_agro_farm`), located in **Dahagram, Patgram, Lalmonirhat, Bangladesh**.

## Key Features
- **Playlist-as-Product Architecture:** Each product card is linked to its real YouTube playlist (Stevia, Insulin Plant, G-9 Tissue Culture Banana, Avocado, Rambutan, Hot-Climate Apple, Saudi Date Palm, Cumin, Black Ginger, Red & White Sandalwood, ODC-3 Moringa, Top Lady Papaya, Kashmiri Saffron, Humic Acid, Sarpan-16 Bean, etc.).
- **Quick View + Embedded YouTube Player:** Clicking **Watch & View** opens a modal with an embedded YouTube playlist player (`videoseries?list=...`) alongside product pricing and `Add To Cart`.
- **Extensible Future Catalog:** Add new agricultural products (seeds, fertilizers, tools, soil mix, saplings) in two ways:
  1. Directly in `data/catalog.js` under `CATALOG_DATA.products`.
  2. Using the in-page **+ Add Product / Playlist** button in the top bar, which adds items live (`localStorage`) and generates the exact JSON snippet for `data/catalog.js`.
- **Slide-Over Cart & WhatsApp Cash-on-Delivery Checkout:** Calculates totals in `৳` and sends a formatted order message directly to `+8801765235517` via WhatsApp.

## Project Structure
- `index.html` — Complete storefront layout (3-tier header, sticky category bar, hero slider, popular categories, promo banners, tabbed showcase, commercial split grid, value propositions, YouTube guides, footer, modals & cart drawer).
- `css/styles.css` — Responsive design system (`1280px` desktop down to mobile).
- `data/catalog.js` — Farm metadata, 12 categories, 18 initial playlist-backed products, and farming guides.
- `js/app.js` — Search, category filtering, YouTube embed modal, cart/wishlist persistence, WhatsApp checkout, and live product/playlist builder.

## How to Run Locally
Open `index.html` directly in any browser, or run a local static server from this directory:

```bash
python -m http.server 8080
```
Then visit `http://localhost:8080`.
