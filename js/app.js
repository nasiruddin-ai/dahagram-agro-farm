(() => {
  const STORAGE_CART_KEY = 'daf_cart_v1';
  const STORAGE_CUSTOM_PRODUCTS_KEY = 'daf_custom_products_v1';
  const STORAGE_WISHLIST_KEY = 'daf_wishlist_v1';

  const baseData = window.CATALOG_DATA;
  let customProducts = JSON.parse(localStorage.getItem(STORAGE_CUSTOM_PRODUCTS_KEY) || '[]');
  let cart = JSON.parse(localStorage.getItem(STORAGE_CART_KEY) || '[]');
  let wishlist = JSON.parse(localStorage.getItem(STORAGE_WISHLIST_KEY) || '[]');
  let activeTab = 'all';
  let searchQuery = '';
  let currentSlide = 0;

  const getAllProducts = () => [...customProducts, ...baseData.products];

  const formatBDT = (amount) => `৳${Number(amount).toLocaleString('en-BD')}`;

  function saveState() {
    localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(cart));
    localStorage.setItem(STORAGE_WISHLIST_KEY, JSON.stringify(wishlist));
    localStorage.setItem(STORAGE_CUSTOM_PRODUCTS_KEY, JSON.stringify(customProducts));
    updateHeaderBadges();
  }

  function updateHeaderBadges() {
    const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
    document.querySelectorAll('[data-cart-count]').forEach((el) => {
      el.textContent = cartCount;
    });
    document.querySelectorAll('[data-wishlist-count]').forEach((el) => {
      el.textContent = wishlist.length;
    });
  }

  function renderProductCard(product) {
    const discount =
      product.oldPrice && product.oldPrice > product.price
        ? product.oldPrice - product.price
        : 0;
    const isWished = wishlist.includes(product.id);

    return `
      <article class="product-card" data-product-id="${product.id}">
        <div>
          <div class="product-badge-row">
            ${discount > 0 ? `<span class="badge-discount">- ${formatBDT(discount)}</span>` : '<span></span>'}
            <span class="badge-playlist">${product.videoCount ? `${product.videoCount} Videos` : 'Agro Product'}</span>
          </div>
          <div class="product-thumb">
            ${
              product.image
                ? `<img src="${product.image}" alt="${product.title}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" /><span class="product-thumb-emoji" style="display:none;">${product.emoji || '🌱'}</span>`
                : `<span class="product-thumb-emoji">${product.emoji || '🌱'}</span>`
            }
            <span class="product-thumb-code">${product.unit || 'Unit'}</span>
            <button type="button" class="quick-view-btn" data-quick-view="${product.id}">
              ▶ Watch &amp; View
            </button>
          </div>
          <div class="product-cat">${product.categoryLabel}</div>
          <h3 class="product-title" title="${product.title}">${product.bnTitle || product.title}</h3>
          <div class="product-sku">${product.title} • ${product.sku}</div>
        </div>
        <div>
          <div class="product-price-row">
            <span class="price-now">${formatBDT(product.price)}</span>
            ${product.oldPrice ? `<span class="price-old">${formatBDT(product.oldPrice)}</span>` : ''}
          </div>
          <div class="product-actions">
            <button type="button" class="btn-cart" data-add-cart="${product.id}">Add To Cart</button>
            <button type="button" class="btn-yt" title="Save to Wishlist" data-toggle-wish="${product.id}">
              ${isWished ? '♥' : '♡'}
            </button>
          </div>
        </div>
      </article>
    `;
  }

  function renderCategories() {
    const grid = document.getElementById('popularCategoriesGrid');
    if (!grid) return;
    grid.innerHTML = baseData.categories
      .map(
        (cat) => `
      <div class="category-card" data-select-category="${cat.id}">
        <div class="category-icon">${cat.icon}</div>
        <h4>${cat.name}</h4>
        <small>${cat.bnName}</small>
      </div>
    `
      )
      .join('');
  }

  function renderTabs() {
    const tabsBar = document.getElementById('showcaseTabsBar');
    if (!tabsBar) return;
    const tabs = [
      { id: 'all', name: 'All Playlists & Products' },
      ...baseData.categories.slice(0, 7),
    ];
    tabsBar.innerHTML = tabs
      .map(
        (tab) => `
      <button type="button" class="tab-btn ${activeTab === tab.id ? 'active' : ''}" data-tab="${tab.id}">
        ${tab.name}
      </button>
    `
      )
      .join('');
  }

  function renderShowcaseProducts() {
    const container = document.getElementById('showcaseProductsGrid');
    if (!container) return;

    const q = searchQuery.trim().toLowerCase();
    const filtered = getAllProducts().filter((p) => {
      const matchesTab = activeTab === 'all' || p.category === activeTab;
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        (p.bnTitle && p.bnTitle.toLowerCase().includes(q)) ||
        p.categoryLabel.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q);
      return matchesTab && matchesQuery;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; background: #fff; padding: 36px; text-align: center; border-radius: 12px; border: 1px dashed #cbd5e1;">
          <p style="font-weight: 700; margin-bottom: 8px;">No matching plants or products found.</p>
          <button type="button" class="btn-outline-sm" id="resetFilterBtn">Reset Filters</button>
        </div>
      `;
      document.getElementById('resetFilterBtn')?.addEventListener('click', () => {
        activeTab = 'all';
        searchQuery = '';
        const searchInput = document.getElementById('globalSearchInput');
        if (searchInput) searchInput.value = '';
        renderTabs();
        renderShowcaseProducts();
      });
      return;
    }

    container.innerHTML = filtered.slice(0, 12).map(renderProductCard).join('');
  }

  function renderCommercialSplit() {
    const container = document.getElementById('commercialSplitGrid');
    if (!container) return;
    const items = getAllProducts().filter((p) => p.featuredCommercial).slice(0, 6);
    container.innerHTML = items.map(renderProductCard).join('');
  }

  function renderCategorySection(categoryId, elementId) {
    const container = document.getElementById(elementId);
    if (!container) return;
    const items = getAllProducts().filter((p) => p.category === categoryId).slice(0, 4);
    container.innerHTML = items.map(renderProductCard).join('');
  }

  function renderGuides() {
    const container = document.getElementById('farmingGuidesGrid');
    if (!container) return;
    container.innerHTML = baseData.guides
      .map(
        (g) => `
      <article class="blog-card">
        <div class="blog-thumb">
          ${g.image ? `<img src="${g.image}" alt="${g.title}" loading="lazy" />` : g.emoji}
        </div>
        <div class="blog-body">
          <div class="blog-meta">${g.meta}</div>
          <h4>${g.bnTitle}</h4>
          <p style="font-size: 13px; color: var(--text-muted);">${g.title}</p>
          <a href="${g.url}" target="_blank" rel="noopener">Watch Playlist on YouTube →</a>
        </div>
      </article>
    `
      )
      .join('');
  }

  function openQuickView(productId) {
    const product = getAllProducts().find((p) => p.id === productId);
    if (!product) return;

    const modal = document.getElementById('quickViewModal');
    const body = document.getElementById('quickViewBody');
    const embedHtml = product.playlistId
      ? `<div style="margin: 14px 0; border-radius: 10px; overflow: hidden; border: 1px solid var(--border-color);">
           <iframe width="100%" height="260"
             src="https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(product.playlistId)}"
             title="${product.title}"
             frameborder="0"
             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
             allowfullscreen></iframe>
         </div>`
      : '';

    body.innerHTML = `
      <div style="display:flex; gap:14px; align-items:center; margin-bottom:10px;">
        ${
          product.image
            ? `<img src="${product.image}" alt="${product.title}" style="width:72px;height:72px;object-fit:cover;border-radius:10px;border:1px solid var(--border-color);flex-shrink:0;" />`
            : `<span style="font-size:36px;">${product.emoji || '🌱'}</span>`
        }
        <div>
          <span class="badge-playlist">${product.categoryLabel}</span>
          <h2 style="font-size:20px; margin-top:4px;">${product.bnTitle || product.title}</h2>
          <p style="font-size:13px; color:var(--text-muted);">${product.title} • SKU: ${product.sku}</p>
        </div>
      </div>
      <p style="font-size:14px; color:var(--text-dark); margin-bottom:10px;">${product.description || ''}</p>
      <div class="product-price-row">
        <span class="price-now">${formatBDT(product.price)}</span>
        ${product.oldPrice ? `<span class="price-old">${formatBDT(product.oldPrice)}</span>` : ''}
        <span style="font-size:12.5px; color:var(--text-muted);">(${product.unit || 'Unit'})</span>
      </div>
      ${embedHtml}
      <div style="display:flex; flex-wrap:wrap; gap:10px; margin-top:14px;">
        <button type="button" class="btn-cart" style="flex:1;" data-add-cart="${product.id}">
          Add To Cart — ${formatBDT(product.price)}
        </button>
        ${
          product.playlistUrl
            ? `<a href="${product.playlistUrl}" target="_blank" rel="noopener" class="btn-outline-sm" style="display:inline-flex;align-items:center;">Open YouTube Playlist ↗</a>`
            : ''
        }
      </div>
    `;
    modal.classList.add('open');
  }

  function addToCart(productId) {
    const product = getAllProducts().find((p) => p.id === productId);
    if (!product) return;
    const existing = cart.find((c) => c.id === productId);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ id: product.id, qty: 1 });
    }
    saveState();
    renderCartDrawer();
    openCartDrawer();
  }

  function toggleWishlist(productId) {
    if (wishlist.includes(productId)) {
      wishlist = wishlist.filter((id) => id !== productId);
    } else {
      wishlist.push(productId);
    }
    saveState();
    renderAllProductViews();
  }

  function renderCartDrawer() {
    const listEl = document.getElementById('cartItemsList');
    const totalEl = document.getElementById('cartTotalAmount');
    if (!listEl || !totalEl) return;

    const all = getAllProducts();
    let total = 0;

    if (cart.length === 0) {
      listEl.innerHTML = `<p style="color:var(--text-muted); font-size:14px; padding:20px 0;">Your cart is empty. Add saplings, seeds, or agro inputs to order.</p>`;
      totalEl.textContent = formatBDT(0);
      return;
    }

    listEl.innerHTML = cart
      .map((item) => {
        const p = all.find((x) => x.id === item.id);
        if (!p) return '';
        total += p.price * item.qty;
        return `
        <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; padding:10px 0; border-bottom:1px solid var(--border-color);">
          <div>
            <strong style="font-size:13.5px; display:block;">${p.emoji || '🌱'} ${p.bnTitle || p.title}</strong>
            <span style="font-size:12px; color:var(--text-muted);">${formatBDT(p.price)} × ${item.qty}</span>
          </div>
          <div style="display:flex; align-items:center; gap:6px;">
            <button type="button" class="btn-outline-sm" data-cart-dec="${p.id}">-</button>
            <span style="font-size:13px; font-weight:700;">${item.qty}</span>
            <button type="button" class="btn-outline-sm" data-cart-inc="${p.id}">+</button>
          </div>
        </div>
      `;
      })
      .join('');

    totalEl.textContent = formatBDT(total);
  }

  function openCartDrawer() {
    renderCartDrawer();
    document.getElementById('cartDrawer')?.classList.add('open');
  }

  function renderAllProductViews() {
    renderShowcaseProducts();
    renderCommercialSplit();
    renderCategorySection('exotic-fruits', 'exoticFruitsGrid');
    renderCategorySection('medicinal', 'medicinalPlantsGrid');
    renderCategorySection('spices-seeds', 'spicesSeedsGrid');
  }

  function initHeroSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-dot');
    if (!slides.length) return;

    const showSlide = (idx) => {
      currentSlide = (idx + slides.length) % slides.length;
      slides.forEach((s, i) => s.classList.toggle('active', i === currentSlide));
      dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
    };

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => showSlide(idx));
    });

    setInterval(() => showSlide(currentSlide + 1), 6000);
  }

  function initEvents() {
    document.body.addEventListener('click', (e) => {
      const tabBtn = e.target.closest('[data-tab]');
      if (tabBtn) {
        activeTab = tabBtn.dataset.tab;
        renderTabs();
        renderShowcaseProducts();
        return;
      }

      const catCard = e.target.closest('[data-select-category]');
      if (catCard) {
        activeTab = catCard.dataset.selectCategory;
        renderTabs();
        renderShowcaseProducts();
        document.getElementById('showcaseSection')?.scrollIntoView({ behavior: 'smooth' });
        return;
      }

      const quickBtn = e.target.closest('[data-quick-view]');
      if (quickBtn) {
        openQuickView(quickBtn.dataset.quickView);
        return;
      }

      const addBtn = e.target.closest('[data-add-cart]');
      if (addBtn) {
        addToCart(addBtn.dataset.addCart);
        return;
      }

      const wishBtn = e.target.closest('[data-toggle-wish]');
      if (wishBtn) {
        toggleWishlist(wishBtn.dataset.toggleWish);
        return;
      }

      const incBtn = e.target.closest('[data-cart-inc]');
      if (incBtn) {
        const item = cart.find((c) => c.id === incBtn.dataset.cartInc);
        if (item) item.qty += 1;
        saveState();
        renderCartDrawer();
        return;
      }

      const decBtn = e.target.closest('[data-cart-dec]');
      if (decBtn) {
        const idx = cart.findIndex((c) => c.id === decBtn.dataset.cartDec);
        if (idx > -1) {
          if (cart[idx].qty > 1) cart[idx].qty -= 1;
          else cart.splice(idx, 1);
          saveState();
          renderCartDrawer();
        }
        return;
      }
    });

    // Global Search
    const searchForm = document.getElementById('globalSearchForm');
    const searchInput = document.getElementById('globalSearchInput');
    searchForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      searchQuery = searchInput.value || '';
      activeTab = 'all';
      renderTabs();
      renderShowcaseProducts();
      document.getElementById('showcaseSection')?.scrollIntoView({ behavior: 'smooth' });
    });

    // Modals & Drawers
    document.getElementById('openCartBtn')?.addEventListener('click', openCartDrawer);
    document.getElementById('closeCartBtn')?.addEventListener('click', () => {
      document.getElementById('cartDrawer')?.classList.remove('open');
    });
    document.getElementById('closeQuickViewBtn')?.addEventListener('click', () => {
      document.getElementById('quickViewModal')?.classList.remove('open');
    });
    document.getElementById('closePromoBtn')?.addEventListener('click', () => {
      document.getElementById('promoModal')?.classList.remove('open');
    });

    // Mobile Nav Toggle
    document.getElementById('mobileMenuToggle')?.addEventListener('click', () => {
      const nav = document.getElementById('primaryNavList');
      nav?.scrollIntoView({ behavior: 'smooth', inline: 'start' });
    });

    // Checkout -> WhatsApp Order
    document.getElementById('checkoutForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      if (cart.length === 0) {
        alert('Please add at least one product to your cart first.');
        return;
      }
      const name = document.getElementById('custName').value.trim();
      const phone = document.getElementById('custPhone').value.trim();
      const address = document.getElementById('custAddress').value.trim();
      const all = getAllProducts();
      let total = 0;
      const lines = cart.map((item) => {
        const p = all.find((x) => x.id === item.id);
        const sub = p ? p.price * item.qty : 0;
        total += sub;
        return `- ${p ? p.bnTitle || p.title : item.id} x${item.qty} = ৳${sub}`;
      });
      const message = encodeURIComponent(
        `নতুন অর্ডার — DAHAGRAM AGRO FIRM AND NURSARY\nনাম: ${name}\nমোবাইল: ${phone}\nঠিকানা: ${address}\n\nপণ্যসমূহ:\n${lines.join('\n')}\n\nমোট: ৳${total} (Cash on Delivery)`
      );
      window.open(`https://wa.me/${baseData.farm.whatsapp}?text=${message}`, '_blank');
    });

    // Newsletter
    document.getElementById('newsletterForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const msg = document.getElementById('newsletterStatus');
      if (msg) msg.textContent = 'ধন্যবাদ! নতুন কৃষি ভিডিও ও পণ্যের আপডেট আপনার ইমেইলে পাঠানো হবে।';
      e.target.reset();
    });

    // Future Product / Playlist Manager Modal
    const adminModal = document.getElementById('adminProductModal');
    document.getElementById('openAdminModalBtn')?.addEventListener('click', () => {
      adminModal?.classList.add('open');
    });
    document.getElementById('closeAdminModalBtn')?.addEventListener('click', () => {
      adminModal?.classList.remove('open');
    });
    document.getElementById('addProductForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const catId = document.getElementById('newProdCat').value;
      const catObj = baseData.categories.find((c) => c.id === catId);
      const playlistRaw = document.getElementById('newProdPlaylist').value.trim();
      let playlistId = '';
      if (playlistRaw.includes('list=')) {
        playlistId = new URLSearchParams(playlistRaw.split('?')[1]).get('list') || '';
      } else {
        playlistId = playlistRaw;
      }

      const newProduct = {
        id: `custom-${Date.now()}`,
        sku: `DAF-NEW-${Math.floor(100 + Math.random() * 900)}`,
        title: document.getElementById('newProdTitle').value.trim(),
        bnTitle: document.getElementById('newProdBnTitle').value.trim(),
        category: catId,
        categoryLabel: catObj ? catObj.name : 'Agro Product',
        price: Number(document.getElementById('newProdPrice').value) || 100,
        oldPrice: Number(document.getElementById('newProdOldPrice').value) || null,
        unit: document.getElementById('newProdUnit').value.trim() || 'Per Unit',
        emoji: document.getElementById('newProdEmoji').value.trim() || '🌱',
        image: (document.getElementById('newProdImage')?.value || '').trim(),
        playlistId,
        playlistUrl: playlistId ? `https://www.youtube.com/playlist?list=${playlistId}` : baseData.farm.youtubeMain,
        videoCount: Number(document.getElementById('newProdVideos').value) || 0,
        featuredCommercial: false,
        description: document.getElementById('newProdDesc').value.trim(),
      };

      customProducts.unshift(newProduct);
      saveState();
      renderAllProductViews();
      document.getElementById('newProdJsonPreview').value = JSON.stringify(newProduct, null, 2);
      e.target.reset();
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderCategories();
    renderTabs();
    renderAllProductViews();
    renderGuides();
    updateHeaderBadges();
    initHeroSlider();
    initEvents();
  });
})();
