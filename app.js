/**
 * Desi Hood Cars by AHMAD RAZA
 * Core Vehicle Marketplace, Spare Parts & Dealer Network Engine
 */

// 5 Beautiful Automotive Background Color Themes
const THEMES = [
  { id: 'obsidian', name: 'Obsidian', hex: '#0b0f19' },
  { id: 'crimson', name: 'Rosso Corsa', hex: '#e11d48' },
  { id: 'emerald', name: 'British Emerald', hex: '#10b981' },
  { id: 'navy', name: 'Royal Navy', hex: '#3b82f6' },
  { id: 'carbon', name: 'Carbon OLED', hex: '#f59e0b' }
];

// Multi-Country Global Currencies & Conversion Rates (Base: USD)
const CURRENCIES = {
  USD: { symbol: '$', rate: 1.0, label: 'USD ($)', digits: 0 },
  PKR: { symbol: 'Rs ', rate: 278.0, label: 'PKR (Rs)', digits: 0 },
  AED: { symbol: 'AED ', rate: 3.67, label: 'AED (د.إ)', digits: 0 },
  SAR: { symbol: 'SAR ', rate: 3.75, label: 'SAR (﷼)', digits: 0 },
  GBP: { symbol: '£', rate: 0.79, label: 'GBP (£)', digits: 0 },
  EUR: { symbol: '€', rate: 0.92, label: 'EUR (€)', digits: 0 },
  CAD: { symbol: 'C$', rate: 1.38, label: 'CAD (C$)', digits: 0 },
  AUD: { symbol: 'A$', rate: 1.52, label: 'AUD (A$)', digits: 0 },
  INR: { symbol: '₹', rate: 84.0, label: 'INR (₹)', digits: 0 },
  JPY: { symbol: '¥', rate: 154.0, label: 'JPY (¥)', digits: 0 }
};

// Application State
let appState = {
  cars: [],
  dealers: [],
  parts: [],
  blogs: [],
  inquiries: [],
  partOrders: [],
  favorites: [],
  buyers: [],
  currentBuyerId: null,
  dealerRequests: [],
  isOwnerAuthenticated: false,
  activeOwnerTab: 'requests',
  activeOwnerReqFilter: 'pending',
  currentRole: 'buyer', // 'buyer' or 'dealer'
  currentView: 'marketplace',
  currentCurrency: 'USD',
  currentCountry: 'ALL', // 'ALL' = show everything, or country code like 'PK','US','AE'
  activeDealerId: 'dealer-1',
  activePortalTab: 'inventory',
  activePartsCategory: 'all',
  activeBlogCategory: 'all',
  activeFilter: {
    keyword: '',
    make: '',
    bodyStyle: '',
    maxPrice: 220000,
    fuelTypes: [],
    transmission: 'all',
    conditions: [],
    showActive: true,
    showSold: true,
    sortBy: 'featured'
  }
};

const SAMPLE_CAR_IMAGES = [
  "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80"
];

const SAMPLE_PART_IMAGES = [
  "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80"
];

const SAMPLE_DEALER_AVATARS = [
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80"
];

// Initialize on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initCurrency();
  initStorage();
  populateDealerDropdown();
  renderMarketplace();
  renderDealersDirectory();
  renderSpareParts();
  renderBlogs();
  syncBrandAutoUpdates(false);
  loadNewCarsPage(false);
  loadYouTubeChannelVideos(false);
  renderBuyerAccountView();
  updateBuyerNavLabel();
  updateOwnerNavVisibility();
  updateOwnerPendingBadge();
  updateFavoritesCount();
  initBankFinancingRates();
  calculateFinancing();
  updateLiveEstimate();
  checkPrivateOwnerRoute();
  if (typeof syncFromSupabase === "function") {
    syncFromSupabase();
  }
});

window.addEventListener("hashchange", checkPrivateOwnerRoute);

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.shiftKey && (e.key === 'O' || e.key === 'o' || e.key === 'A' || e.key === 'a')) {
    e.preventDefault();
    openOwnerConsole();
  }
});

// ==========================================
// 5 BACKGROUND COLOR THEMES ENGINE
// ==========================================
function initTheme() {
  const saved = localStorage.getItem('desihood_theme') || 'obsidian';
  setTheme(saved, false);
}

function setTheme(themeId, notify = true) {
  THEMES.forEach(t => document.body.classList.remove('theme-' + t.id));
  document.body.classList.add('theme-' + themeId);
  localStorage.setItem('desihood_theme', themeId);

  const themeObj = THEMES.find(t => t.id === themeId) || THEMES[0];
  
  const floatingName = document.getElementById("floating-color-name");
  if (floatingName) floatingName.textContent = themeObj.name;
  
  const floatingDot = document.getElementById("floating-color-dot");
  if (floatingDot) floatingDot.style.backgroundColor = themeObj.hex;

  const currentDot = document.getElementById("current-theme-dot");
  if (currentDot) currentDot.style.backgroundColor = themeObj.hex;

  closeThemeDropdown();
  if (notify) {
    showToast("Background Updated", `Switched to ${themeObj.name} background`, "info");
  }
}

function cycleNextTheme() {
  const current = localStorage.getItem('desihood_theme') || 'obsidian';
  const idx = THEMES.findIndex(t => t.id === current);
  const nextIdx = (idx + 1) % THEMES.length;
  setTheme(THEMES[nextIdx].id);
}

function toggleThemeDropdown(event) {
  if (event) event.stopPropagation();
  const dropdown = document.getElementById("theme-dropdown-menu");
  if (dropdown) dropdown.classList.toggle("hidden");
}

function closeThemeDropdown() {
  const dropdown = document.getElementById("theme-dropdown-menu");
  if (dropdown) dropdown.classList.add("hidden");
}

document.addEventListener("click", () => {
  closeThemeDropdown();
});

// ==========================================
// MULTI-COUNTRY LOCATION & CURRENCY ENGINE
// ==========================================
function initCurrency() {
  const savedCountry = localStorage.getItem('desihood_country') || 'ALL';
  const countryMeta = (typeof COUNTRY_INFO !== 'undefined' && COUNTRY_INFO[savedCountry]) ? COUNTRY_INFO[savedCountry] : { currency: localStorage.getItem('desihood_currency') || 'USD' };
  appState.currentCountry = savedCountry;
  appState.currentCurrency = countryMeta.currency;
  const select = document.getElementById("global-currency-select");
  if (select) select.value = savedCountry;
}

function changeCountryLocation(countryCode) {
  const info = (typeof COUNTRY_INFO !== 'undefined' && COUNTRY_INFO[countryCode])
    ? COUNTRY_INFO[countryCode]
    : { name: "All Countries", flag: "🌍", currency: "USD" };

  appState.currentCountry = COUNTRY_INFO[countryCode] ? countryCode : 'ALL';
  appState.currentCurrency = info.currency;

  localStorage.setItem('desihood_country', appState.currentCountry);
  localStorage.setItem('desihood_currency', appState.currentCurrency);

  const select = document.getElementById("global-currency-select");
  if (select) select.value = appState.currentCountry;

  const curLabel = CURRENCIES[appState.currentCurrency]?.label || appState.currentCurrency;
  showToast(`${info.flag} ${info.name}`, `Showing ${info.name} dealers & cars in ${curLabel}`, "info");

  renderMarketplace();
  renderNewCarsView();
  renderDealersDirectory();
  renderSpareParts();
  renderDealerPortal();
  calculateFinancing();
  updateLiveEstimate();
  updateMarketStatusBar();
}

function changeGlobalCurrency(currCode) {
  if (!CURRENCIES[currCode]) currCode = 'USD';
  appState.currentCurrency = currCode;
  localStorage.setItem('desihood_currency', currCode);

  showToast("Currency Changed", `All prices converted to ${CURRENCIES[currCode].label}`, "info");

  renderMarketplace();
  renderNewCarsView();
  renderDealersDirectory();
  renderSpareParts();
  renderDealerPortal();
  calculateFinancing();
  updateLiveEstimate();
  updateMarketStatusBar();
}

function updateMarketStatusBar() {
  const country = appState.currentCountry || 'ALL';
  const info = (typeof COUNTRY_INFO !== 'undefined' && COUNTRY_INFO[country])
    ? COUNTRY_INFO[country]
    : { name: "All Countries", flag: "🌍", currency: appState.currentCurrency || "USD" };
  const curLabel = CURRENCIES[appState.currentCurrency]?.label || info.currency;

  const carsInCountry = appState.cars.filter(c => {
    if (country !== 'ALL' && (c.country || 'US') !== country) return false;
    const d = appState.dealers.find(dl => dl.id === c.dealerId);
    if (d && d.banned) return false;
    return true;
  });
  const dealersInCountry = appState.dealers.filter(d => !d.banned && (country === 'ALL' || (d.country || 'US') === country));
  const partsInCountry = appState.parts.filter(p => country === 'ALL' || (p.country || 'US') === country);

  const flagEl = document.getElementById("market-flag");
  const nameEl = document.getElementById("market-country-name");
  const curEl = document.getElementById("market-currency-label");
  const carCountEl = document.getElementById("market-car-count");
  const dealerCountEl = document.getElementById("market-dealer-count");
  const partsCountEl = document.getElementById("market-parts-count");

  if (flagEl) flagEl.textContent = info.flag;
  if (nameEl) nameEl.textContent = info.name;
  if (curEl) curEl.textContent = curLabel;
  if (carCountEl) carCountEl.textContent = carsInCountry.filter(c => c.status !== 'sold').length;
  if (dealerCountEl) dealerCountEl.textContent = dealersInCountry.length;
  if (partsCountEl) partsCountEl.textContent = partsInCountry.length;
}

function formatCurrency(usdAmount) {
  if (usdAmount === null || usdAmount === undefined || isNaN(usdAmount)) return '$0';
  const cur = CURRENCIES[appState.currentCurrency] || CURRENCIES.USD;
  const converted = Math.round(usdAmount * cur.rate);
  return `${cur.symbol}${formatNumber(converted)}`;
}

function formatNumber(num) {
  return new Intl.NumberFormat('en-US').format(num || 0);
}

// ==========================================
// STORAGE & STATE INITIALIZATION
// ==========================================
function initStorage() {
  try {
    const storedCars = localStorage.getItem('desihood_cars') || localStorage.getItem('autosphere_cars');
    const storedDealers = localStorage.getItem('desihood_dealers') || localStorage.getItem('autosphere_dealers');
    const storedParts = localStorage.getItem('desihood_parts');
    const storedBlogs = localStorage.getItem('desihood_blogs');
    const storedInquiries = localStorage.getItem('desihood_inquiries') || localStorage.getItem('autosphere_inquiries');
    const storedFavorites = localStorage.getItem('desihood_favorites') || localStorage.getItem('autosphere_favorites');
    const storedPartOrders = localStorage.getItem('desihood_part_orders');
    const storedBuyers = localStorage.getItem('desihood_buyers');
    const storedCurrentBuyer = localStorage.getItem('desihood_current_buyer');
    const storedDealerRequests = localStorage.getItem('desihood_dealer_requests');

    let parsedCars = storedCars ? JSON.parse(storedCars) : null;
    let parsedDealers = storedDealers ? JSON.parse(storedDealers) : null;
    let parsedParts = storedParts ? JSON.parse(storedParts) : null;
    let parsedBlogs = storedBlogs ? JSON.parse(storedBlogs) : null;

    // Upgrade legacy cached data missing multi-country fields or gallery imports
    const needsSync = !parsedDealers || !parsedDealers.some(d => d.country === 'PK') ||
                      !parsedCars || !parsedCars.some(c => c.id === 'car-gal-1') ||
                      !parsedParts || !parsedParts.some(p => p.country === 'PK');

    appState.cars = (!needsSync && parsedCars) ? parsedCars : [...INITIAL_CARS];
    appState.dealers = (!needsSync && parsedDealers) ? parsedDealers : [...INITIAL_DEALERS];
    appState.parts = (!needsSync && parsedParts) ? parsedParts : [...INITIAL_PARTS];
    const defaultBlogs = typeof INITIAL_BLOGS !== 'undefined' ? INITIAL_BLOGS : [];
    if (parsedBlogs && parsedBlogs.length) {
      appState.blogs = parsedBlogs.filter(b => !String(b.id || '').startsWith('blog-news-'));
      if (!appState.blogs.length) appState.blogs = [...defaultBlogs];
    } else {
      appState.blogs = [...defaultBlogs];
    }
    appState.inquiries = storedInquiries ? JSON.parse(storedInquiries) : [...INITIAL_INQUIRIES];
    appState.favorites = storedFavorites ? JSON.parse(storedFavorites) : [];
    appState.partOrders = storedPartOrders ? JSON.parse(storedPartOrders) : [];
    appState.buyers = storedBuyers ? JSON.parse(storedBuyers) : [];
    appState.currentBuyerId = storedCurrentBuyer || null;
    appState.dealerRequests = storedDealerRequests ? JSON.parse(storedDealerRequests) : [];
    appState.isOwnerAuthenticated = sessionStorage.getItem('desihood_owner_auth') === 'true';

    saveAllState();
    updateMarketStatusBar();
  } catch (err) {
    console.warn("Storage fallback to default data", err);
    appState.cars = [...INITIAL_CARS];
    appState.dealers = [...INITIAL_DEALERS];
    appState.parts = [...INITIAL_PARTS];
    appState.blogs = [...(typeof INITIAL_BLOGS !== 'undefined' ? INITIAL_BLOGS : [])];
    appState.inquiries = [...INITIAL_INQUIRIES];
    appState.favorites = [];
    appState.partOrders = [];
    appState.buyers = [];
    appState.currentBuyerId = null;
    appState.dealerRequests = [];
    appState.isOwnerAuthenticated = false;
  }
}

function saveAllState() {
  localStorage.setItem('desihood_cars', JSON.stringify(appState.cars));
  localStorage.setItem('desihood_dealers', JSON.stringify(appState.dealers));
  localStorage.setItem('desihood_parts', JSON.stringify(appState.parts));
  localStorage.setItem('desihood_blogs', JSON.stringify(appState.blogs));
  localStorage.setItem('desihood_inquiries', JSON.stringify(appState.inquiries));
  localStorage.setItem('desihood_favorites', JSON.stringify(appState.favorites));
  localStorage.setItem('desihood_part_orders', JSON.stringify(appState.partOrders));
  localStorage.setItem('desihood_buyers', JSON.stringify(appState.buyers));
  if (appState.currentBuyerId) {
    localStorage.setItem('desihood_current_buyer', appState.currentBuyerId);
  } else {
    localStorage.removeItem('desihood_current_buyer');
  }
  localStorage.setItem('desihood_dealer_requests', JSON.stringify(appState.dealerRequests));
}

// ==========================================
// NAVIGATION & VIEW SWITCHER
// ==========================================
function switchView(viewName) {
  appState.currentView = viewName;

  const views = [
    { id: 'marketplace', el: document.getElementById('view-marketplace'), btn: document.getElementById('nav-btn-marketplace') },
    { id: 'new-cars', el: document.getElementById('view-new-cars'), btn: document.getElementById('nav-btn-new-cars') },
    { id: 'old-cars', el: document.getElementById('view-old-cars'), btn: document.getElementById('nav-btn-old-cars') },
    { id: 'browse-more', el: document.getElementById('view-browse-more'), btn: document.getElementById('nav-btn-browse-more') },
    { id: 'gallery', el: document.getElementById('view-gallery'), btn: document.getElementById('nav-btn-gallery') },
    { id: 'blogs', el: document.getElementById('view-blogs'), btn: document.getElementById('nav-btn-blogs') },
    { id: 'youtube', el: document.getElementById('view-youtube'), btn: document.getElementById('nav-btn-youtube') },
    { id: 'dealers-directory', el: document.getElementById('view-dealers-directory'), btn: document.getElementById('nav-btn-dealers') },
    { id: 'spare-parts', el: document.getElementById('view-spare-parts'), btn: document.getElementById('nav-btn-parts') },
    { id: 'sell-car', el: document.getElementById('view-sell-car'), btn: document.getElementById('nav-btn-sell') },
    { id: 'financing', el: document.getElementById('view-financing'), btn: document.getElementById('nav-btn-financing') },
    { id: 'about', el: document.getElementById('view-about'), btn: document.getElementById('nav-btn-about') },
    { id: 'contact', el: document.getElementById('view-contact'), btn: document.getElementById('nav-btn-contact') },
    { id: 'become-dealer', el: document.getElementById('view-become-dealer'), btn: document.getElementById('nav-btn-become-dealer') },
    { id: 'buyer-account', el: document.getElementById('view-buyer-account'), btn: document.getElementById('nav-btn-buyer-account') },
    { id: 'dealer-portal', el: document.getElementById('view-dealer-portal'), btn: document.getElementById('nav-btn-portal') },
    { id: 'owner-console', el: document.getElementById('view-owner-console'), btn: document.getElementById('nav-btn-owner-desk') },
    { id: 'showroom-owners-pk', el: document.getElementById('view-showroom-owners-pk'), btn: document.getElementById('nav-btn-showroom-owners-pk') }
  ];

  views.forEach(v => {
    if (v.el) v.el.classList.add('hidden');
    if (v.btn) {
      if (v.id === 'become-dealer') {
        v.btn.className = "shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors border border-amber-500/30 flex items-center space-x-1.5";
      } else if (v.id === 'buyer-account') {
        v.btn.className = "shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors border border-emerald-500/30 flex items-center space-x-1.5";
      } else if (v.id === 'owner-console') {
        v.btn.className = (appState.isOwnerAuthenticated ? "flex " : "hidden ") + "shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors border border-rose-500/30 items-center space-x-1.5";
      } else if (v.id === 'showroom-owners-pk') {
        v.btn.className = (appState.isOwnerAuthenticated ? "flex " : "hidden ") + "shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors border border-amber-500/30 items-center space-x-1.5";
      } else {
        v.btn.className = "shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors flex items-center space-x-1.5";
      }
    }
  });

  if (viewName === 'showroom-owners-pk' && !appState.isOwnerAuthenticated) {
    openOwnerConsole();
    return;
  }

  const active = views.find(v => v.id === viewName);
  if (active && active.el) {
    active.el.classList.remove('hidden');
    if (active.btn) {
      if ((active.id !== 'owner-console' && active.id !== 'showroom-owners-pk') || appState.isOwnerAuthenticated) {
        active.btn.className = "shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors text-slate-950 bg-amber-500 border border-amber-400 shadow-md shadow-amber-500/20 flex items-center space-x-1.5";
      }
    }
  }

  if (viewName === 'marketplace') renderMarketplace();
  else if (viewName === 'new-cars') renderNewCarsView();
  else if (viewName === 'old-cars') renderOldCarsSection();
  else if (viewName === 'browse-more') renderBrowseMoreHub();
  else if (viewName === 'blogs') renderBlogs();
  else if (viewName === 'youtube') renderYouTubeView();
  else if (viewName === 'dealers-directory') renderDealersDirectory();
  else if (viewName === 'spare-parts') renderSpareParts();
  else if (viewName === 'buyer-account') renderBuyerAccountView();
  else if (viewName === 'dealer-portal') renderDealerPortal();
  else if (viewName === 'owner-console') renderOwnerConsole();
  else if (viewName === 'showroom-owners-pk') renderShowroomOwnersPK();

  window.scrollTo({ top: 0, behavior: 'smooth' });
  lucide.createIcons();
}

function setPortalRole(role) {
  appState.currentRole = role;
  const buyerBtn = document.getElementById("role-buyer-btn");
  const dealerBtn = document.getElementById("role-dealer-btn");
  const dealerSwitcher = document.getElementById("dealer-switcher-wrapper");

  if (role === 'buyer') {
    buyerBtn.className = "px-3 py-1.5 rounded-lg font-semibold transition-all bg-amber-500 text-slate-950 shadow-sm flex items-center space-x-1.5";
    dealerBtn.className = "px-3 py-1.5 rounded-lg font-medium text-slate-400 hover:text-slate-200 transition-all flex items-center space-x-1.5";
    dealerSwitcher.classList.add("hidden");
    switchView('marketplace');
  } else {
    dealerBtn.className = "px-3 py-1.5 rounded-lg font-semibold transition-all bg-amber-500 text-slate-950 shadow-sm flex items-center space-x-1.5";
    buyerBtn.className = "px-3 py-1.5 rounded-lg font-medium text-slate-400 hover:text-slate-200 transition-all flex items-center space-x-1.5";
    dealerSwitcher.classList.remove("hidden");
    switchView('dealer-portal');
  }
}

function populateDealerDropdown() {
  const select = document.getElementById("active-dealer-select");
  if (!select) return;
  const availableDealers = appState.isOwnerAuthenticated
    ? appState.dealers
    : appState.dealers.filter(d => !d.banned);

  if (availableDealers.length === 0) {
    select.innerHTML = `<option value="">No Active Dealers</option>`;
    return;
  }

  if (!availableDealers.some(d => d.id === appState.activeDealerId)) {
    appState.activeDealerId = availableDealers[0].id;
  }

  select.innerHTML = availableDealers.map(d => `
    <option value="${d.id}" ${d.id === appState.activeDealerId ? 'selected' : ''}>${d.name}${d.banned ? ' [BANNED]' : ''}</option>
  `).join("");
}

function changeActiveDealer(dealerId) {
  appState.activeDealerId = dealerId;
  const dealer = getActiveDealer();
  if (dealer) showToast("Dealership Switched", `Managing ${dealer.name}`, "info");
  renderDealerPortal();
}

function getActiveDealer() {
  const pool = appState.isOwnerAuthenticated
    ? appState.dealers
    : appState.dealers.filter(d => !d.banned);
  return pool.find(d => d.id === appState.activeDealerId) || pool[0] || null;
}

function getDealerById(id) {
  return appState.dealers.find(d => d.id === id) || {
    name: "Authorized Dealership",
    location: "United States",
    rating: 4.8,
    phone: "+1 (800) 555-0100",
    whatsapp: "+18005550100",
    email: "contact@dealer.com",
    totalCarsSold: 12,
    totalSalesVolume: 1250000,
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80"
  };
}

// ==========================================
// SPARE PARTS STORE ENGINE
// ==========================================
let partsDebounceTimer;
function debounceFilterParts() {
  clearTimeout(partsDebounceTimer);
  partsDebounceTimer = setTimeout(renderSpareParts, 200);
}

function filterPartsByCategory(category) {
  appState.activePartsCategory = category;

  document.querySelectorAll('.parts-cat-btn').forEach(btn => {
    if (btn.dataset.category === category) {
      btn.className = "parts-cat-btn px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 shadow-sm";
    } else {
      btn.className = "parts-cat-btn px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors";
    }
  });

  renderSpareParts();
}

function renderSpareParts() {
  const container = document.getElementById("spare-parts-grid");
  if (!container) return;

  const keyword = (document.getElementById("parts-keyword-search")?.value || '').toLowerCase().trim();
  const category = appState.activePartsCategory;

  const country = appState.currentCountry || 'ALL';
  let filtered = appState.parts.filter(part => {
    if (country !== 'ALL' && (part.country || 'US') !== country) return false;
    if (category !== 'all' && part.category !== category) return false;
    if (keyword) {
      const text = `${part.name} ${part.category} ${part.compatibility} ${part.partNumber} ${part.description}`.toLowerCase();
      if (!text.includes(keyword)) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-12 text-center text-slate-400 glass-panel rounded-2xl border border-slate-800">
        <i data-lucide="wrench" class="w-10 h-10 mx-auto mb-2 text-slate-600"></i>
        <h4 class="text-white font-bold">No spare parts match your search</h4>
        <p class="text-xs text-slate-500 mt-1">Try searching for other components or view all categories.</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = filtered.map(part => `
    <div class="glass-card rounded-2xl overflow-hidden flex flex-col justify-between border border-slate-800 group">
      <div>
        <div class="relative h-48 bg-slate-950 overflow-hidden car-image-container">
          <img src="${part.image}" alt="${part.name}" class="w-full h-full object-cover">
          <span class="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900/90 text-amber-400 border border-slate-700">
            ${part.condition}
          </span>
          <span class="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/90 text-slate-950">
            ${part.inStock > 0 ? `${part.inStock} in Stock` : 'Out of Stock'}
          </span>
        </div>

        <div class="p-4">
          <span class="text-[10px] uppercase font-bold text-slate-500 tracking-wider">${part.category}</span>
          <h3 class="text-sm font-bold text-white group-hover:text-amber-400 transition-colors leading-snug line-clamp-2 mt-0.5">
            ${part.name}
          </h3>

          <p class="text-[11px] text-slate-400 mt-2 flex items-center">
            <i data-lucide="check" class="w-3 h-3 text-emerald-400 mr-1 flex-shrink-0"></i>
            <span class="truncate">${part.compatibility}</span>
          </p>

          <div class="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/80">
            <div>
              <span class="text-[10px] text-slate-500 block uppercase">Price</span>
              <span class="text-base font-black text-amber-400 font-mono">${formatCurrency(part.price)}</span>
            </div>
            <span class="text-[10px] text-slate-400 font-mono bg-slate-900 px-2 py-1 rounded border border-slate-800">
              #${part.partNumber || 'OEM'}
            </span>
          </div>
        </div>
      </div>

      <!-- Actions: Details & Buy Now -->
      <div class="p-4 pt-0 grid grid-cols-2 gap-2">
        <button onclick="openPartDetailModal('${part.id}')" class="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 flex items-center justify-center space-x-1 transition-colors">
          <i data-lucide="info" class="w-3.5 h-3.5"></i>
          <span>Details</span>
        </button>
        <button onclick="openPartCheckoutModal('${part.id}')" class="py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center justify-center space-x-1 transition-all shadow-md shadow-emerald-600/25">
          <i data-lucide="shopping-bag" class="w-3.5 h-3.5"></i>
          <span>Buy Now</span>
        </button>
      </div>

    </div>
  `).join("");

  lucide.createIcons();
}

function openPartDetailModal(partId) {
  const part = appState.parts.find(p => p.id === partId);
  if (!part) return;

  const container = document.getElementById("part-detail-modal-content");
  if (!container) return;

  container.innerHTML = `
    <div class="relative h-64 sm:h-72 w-full bg-slate-950 rounded-2xl overflow-hidden mb-6">
      <img src="${part.image}" alt="${part.name}" class="w-full h-full object-cover">
      <div class="absolute bottom-3 left-3 bg-slate-950/90 px-3 py-1 rounded-xl border border-slate-800 text-amber-400 text-xs font-bold">
        ${part.category} &bull; ${part.condition}
      </div>
    </div>

    <div>
      <span class="text-xs text-slate-500 font-mono">Part Number: ${part.partNumber || 'OEM-GENUINE'}</span>
      <h2 class="text-xl sm:text-2xl font-black text-white heading-font mt-1">${part.name}</h2>
      
      <div class="flex items-center space-x-4 my-4">
        <span class="text-3xl font-black text-amber-400 font-mono">${formatCurrency(part.price)}</span>
        <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          In Stock (${part.inStock || 1} units available)
        </span>
      </div>

      <!-- Specs Table -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 my-5 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
        <div>
          <span class="text-slate-500 block text-[11px] uppercase font-bold">Vehicle Compatibility</span>
          <span class="text-slate-200 font-medium">${part.compatibility}</span>
        </div>
        <div>
          <span class="text-slate-500 block text-[11px] uppercase font-bold">Warranty Coverage</span>
          <span class="text-slate-200 font-medium">${part.warranty || '1 Year Guarantee'}</span>
        </div>
        <div>
          <span class="text-slate-500 block text-[11px] uppercase font-bold">Seller</span>
          <span class="text-amber-400 font-medium">${part.sellerName || 'Verified Parts Dealer'}</span>
        </div>
        <div>
          <span class="text-slate-500 block text-[11px] uppercase font-bold">Delivery</span>
          <span class="text-emerald-400 font-medium">Express Tracked Courier</span>
        </div>
      </div>

      <div class="mb-6">
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Product Description</h4>
        <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">${part.description}</p>
      </div>

      <div class="flex items-center space-x-3 pt-4 border-t border-slate-800">
        <button onclick="closeModal('modal-part-detail')" class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium">
          Close
        </button>
        <button onclick="closeModal('modal-part-detail'); openPartCheckoutModal('${part.id}')" class="flex-grow py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/30">
          <i data-lucide="shopping-bag" class="w-4 h-4"></i>
          <span>Buy Now (${formatCurrency(part.price)})</span>
        </button>
      </div>
    </div>
  `;

  openModal("modal-part-detail");
  lucide.createIcons();
}

function openPartCheckoutModal(partId) {
  const part = appState.parts.find(p => p.id === partId);
  if (!part) return;

  document.getElementById("checkout-part-id").value = part.id;
  document.getElementById("checkout-part-summary").textContent = `Product: ${part.name} &bull; Part #${part.partNumber || 'OEM'}`;
  document.getElementById("checkout-total-price").textContent = formatCurrency(part.price);

  openModal("modal-part-checkout");
}

function handlePartCheckoutSubmit(e) {
  e.preventDefault();
  const partId = document.getElementById("checkout-part-id").value;
  const part = appState.parts.find(p => p.id === partId);

  const order = {
    id: "order-" + Date.now(),
    partId: partId,
    partName: part ? part.name : "Spare Part",
    price: part ? part.price : 0,
    currency: appState.currentCurrency,
    customerName: document.getElementById("checkout-name").value.trim(),
    phone: document.getElementById("checkout-phone").value.trim(),
    email: document.getElementById("checkout-email").value.trim(),
    country: document.getElementById("checkout-country").value.trim(),
    city: document.getElementById("checkout-city").value.trim(),
    address: document.getElementById("checkout-address").value.trim(),
    paymentMethod: document.getElementById("checkout-payment-method").value,
    status: "Confirmed & Dispatched",
    createdAt: new Date().toISOString()
  };

  appState.partOrders.unshift(order);
  if (part && part.inStock > 0) part.inStock--;

  saveAllState();
  closeModal("modal-part-checkout");
  renderSpareParts();

  showToast("⚡ Order Confirmed!", `Thank you ${order.customerName}. Your order for "${order.partName}" is confirmed! Dispatched via ${order.paymentMethod}.`, "success");
}

function openAddPartModal() {
  assignAutoPartImage();
  openModal("modal-add-part");
}

function assignAutoPartImage() {
  const random = SAMPLE_PART_IMAGES[Math.floor(Math.random() * SAMPLE_PART_IMAGES.length)];
  const input = document.getElementById("part-form-image");
  if (input) input.value = random;
}

function handlePartSubmit(e) {
  e.preventDefault();
  const activeDealer = getActiveDealer();

  const newPart = {
    id: "part-" + Date.now(),
    sellerId: activeDealer.id,
    country: activeDealer.country || (appState.currentCountry !== 'ALL' ? appState.currentCountry : 'US'),
    sellerName: activeDealer.name,
    sellerPhone: activeDealer.phone,
    sellerWhatsapp: activeDealer.whatsapp || activeDealer.phone,
    name: document.getElementById("part-form-name").value.trim(),
    category: document.getElementById("part-form-category").value,
    price: parseFloat(document.getElementById("part-form-price").value),
    partNumber: document.getElementById("part-form-number").value.trim() || "OEM-" + Math.floor(1000 + Math.random() * 9000),
    condition: document.getElementById("part-form-condition").value,
    compatibility: document.getElementById("part-form-compatibility").value.trim(),
    image: document.getElementById("part-form-image").value.trim() || SAMPLE_PART_IMAGES[0],
    description: document.getElementById("part-form-description").value.trim() || "Authentic quality automotive spare part.",
    warranty: "1 Year Performance Warranty",
    inStock: 5,
    rating: 5.0
  };

  appState.parts.unshift(newPart);
  saveAllState();
  closeModal("modal-add-part");
  renderSpareParts();

  showToast("Spare Part Published!", `"${newPart.name}" is now live for buyers to purchase!`, "success");
}

// ==========================================
// MARKETPLACE & FILTERING WITH AUTOMATED SOLD OUT BOARD
// ==========================================
let filterDebounceTimer;
function debounceFilter() {
  clearTimeout(filterDebounceTimer);
  filterDebounceTimer = setTimeout(filterCars, 250);
}

function updatePriceSlider(val) {
  const display = document.getElementById("price-slider-display");
  if (parseInt(val) >= 220000) {
    display.textContent = formatCurrency(220000) + "+";
  } else {
    display.textContent = formatCurrency(val);
  }
  filterCars();
}

function applyQuickSearch() {
  const make = document.getElementById("quick-make").value;
  const body = document.getElementById("quick-body-style").value;
  const price = parseInt(document.getElementById("quick-max-price").value);

  appState.activeFilter.make = make;
  appState.activeFilter.bodyStyle = body;
  appState.activeFilter.maxPrice = price;

  const slider = document.getElementById("filter-price-range");
  if (slider) {
    slider.value = Math.min(price, 220000);
    updatePriceSlider(slider.value);
  }

  filterCars();
  const grid = document.getElementById("cars-grid");
  if (grid) grid.scrollIntoView({ behavior: "smooth" });
}

function resetFilters() {
  document.getElementById("filter-keyword").value = "";
  document.getElementById("quick-make").value = "";
  document.getElementById("quick-body-style").value = "";
  document.getElementById("quick-max-price").value = "9999999";
  document.getElementById("filter-price-range").value = 220000;
  document.getElementById("price-slider-display").textContent = formatCurrency(220000) + "+";
  document.getElementById("sort-by").value = "featured";

  document.querySelectorAll('input[name="fuel"]').forEach(el => el.checked = false);
  document.querySelectorAll('input[name="condition"]').forEach(el => el.checked = false);
  document.querySelectorAll('input[name="transmission"]').forEach(el => el.checked = (el.value === 'all'));

  const chkActive = document.getElementById("filter-show-active");
  const chkSold = document.getElementById("filter-show-sold");
  if (chkActive) chkActive.checked = true;
  if (chkSold) chkSold.checked = true;

  filterCars();
  showToast("Filters Reset", "Showing all vehicles", "info");
}

function filterCars() {
  const keyword = (document.getElementById("filter-keyword")?.value || '').toLowerCase().trim();
  const maxPrice = parseInt(document.getElementById("filter-price-range")?.value || 220000);
  const quickMake = document.getElementById("quick-make")?.value || '';
  const quickBody = document.getElementById("quick-body-style")?.value || '';
  const sortBy = document.getElementById("sort-by")?.value || 'featured';

  const fuelCheckboxes = Array.from(document.querySelectorAll('input[name="fuel"]:checked')).map(el => el.value);
  const conditionCheckboxes = Array.from(document.querySelectorAll('input[name="condition"]:checked')).map(el => el.value);
  const transRadio = document.querySelector('input[name="transmission"]:checked')?.value || 'all';

  const showActive = document.getElementById("filter-show-active") ? document.getElementById("filter-show-active").checked : true;
  const showSold = document.getElementById("filter-show-sold") ? document.getElementById("filter-show-sold").checked : true;

  const country = appState.currentCountry || 'ALL';

  let filtered = appState.cars.filter(car => {
    const dealer = appState.dealers.find(d => d.id === car.dealerId);
    if (dealer && dealer.banned) return false;
    if (country !== 'ALL' && (car.country || 'US') !== country) return false;
    const isSold = car.status === 'sold';
    if (isSold && !showSold) return false;
    if (!isSold && !showActive) return false;

    if (car.price > maxPrice && maxPrice < 220000) return false;
    if (quickMake && car.make !== quickMake) return false;
    if (quickBody && car.bodyStyle !== quickBody) return false;
    if (fuelCheckboxes.length > 0 && !fuelCheckboxes.includes(car.fuelType)) return false;
    if (transRadio !== 'all' && car.transmission !== transRadio) return false;
    if (conditionCheckboxes.length > 0 && !conditionCheckboxes.includes(car.condition)) return false;

    if (keyword) {
      const matchText = `${car.make} ${car.model} ${car.year} ${car.bodyStyle} ${car.description} ${car.features?.join(' ')}`.toLowerCase();
      if (!matchText.includes(keyword)) return false;
    }

    return true;
  });

  if (sortBy === 'price-asc') filtered.sort((a, b) => a.price - b.price);
  else if (sortBy === 'price-desc') filtered.sort((a, b) => b.price - a.price);
  else if (sortBy === 'mileage-asc') filtered.sort((a, b) => a.mileage - b.mileage);
  else if (sortBy === 'year-desc') filtered.sort((a, b) => b.year - a.year);
  else if (sortBy === 'featured') filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  renderCarsGrid(filtered);
  updateMarketStatusBar();
}

function renderMarketplace() {
  filterCars();
}

function renderCarsGrid(carsList) {
  const container = document.getElementById("cars-grid");
  const emptyState = document.getElementById("cars-empty-state");
  const countLabel = document.getElementById("inventory-count-label");

  if (countLabel) {
    const soldCount = carsList.filter(c => c.status === 'sold').length;
    const activeCount = carsList.length - soldCount;
    countLabel.textContent = `Showing ${activeCount} active in stock &bull; ${soldCount} sold out`;
  }

  if (carsList.length === 0) {
    container.innerHTML = "";
    if (emptyState) emptyState.classList.remove("hidden");
    return;
  }

  if (emptyState) emptyState.classList.add("hidden");

  container.innerHTML = carsList.map(car => {
    const dealer = getDealerById(car.dealerId);
    const isFavorite = appState.favorites.includes(car.id);
    const isSold = car.status === 'sold';

    return `
      <div class="glass-card rounded-2xl overflow-hidden flex flex-col group border ${isSold ? 'border-rose-900/40 opacity-85' : 'border-slate-800'}">
        
        <!-- Car Image Container -->
        <div class="relative h-52 sm:h-56 w-full overflow-hidden car-image-container bg-slate-900">
          <img src="${car.image}" alt="${car.make} ${car.model}" class="w-full h-full object-cover">
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>

          <!-- THE PROMINENT AUTOMATIC SOLD OUT BOARD -->
          ${isSold ? `
            <div class="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-20">
              <div class="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-700 via-rose-600 to-red-600 text-white font-black text-sm uppercase tracking-widest border-2 border-rose-400 shadow-2xl rotate-[-6deg] flex items-center space-x-2">
                <i data-lucide="tag" class="w-4 h-4 text-amber-300"></i>
                <span>SOLD OUT</span>
              </div>
            </div>
          ` : ''}

          <!-- Badges on top -->
          <div class="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            ${car.featured && !isSold ? `
              <span class="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500 text-slate-950 uppercase tracking-wider">
                Featured
              </span>
            ` : ''}
            <span class="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-900/80 text-amber-400 backdrop-blur-md border border-slate-700/60">
              ${car.condition}
            </span>
          </div>

          <!-- Favorite Button -->
          <button onclick="toggleFavorite('${car.id}', event)" class="absolute top-3 right-3 w-9 h-9 rounded-full bg-slate-950/70 hover:bg-slate-900 backdrop-blur-md flex items-center justify-center text-slate-300 hover:text-rose-500 transition-colors border border-slate-700/50 z-10">
            <i data-lucide="heart" class="w-4 h-4 ${isFavorite ? 'text-rose-500 fill-rose-500' : ''}"></i>
          </button>

          <!-- Price overlay bottom right -->
          <div class="absolute bottom-3 right-3 text-right z-10">
            ${isSold ? `
              <span class="text-xs line-through text-slate-400 block">${formatCurrency(car.price)}</span>
              <span class="text-lg font-black text-rose-400 heading-font">SOLD OUT</span>
            ` : `
              <span class="text-xl font-extrabold text-white heading-font tracking-tight drop-shadow-md">
                ${formatCurrency(car.price)}
              </span>
            `}
          </div>
        </div>

        <!-- Card Body -->
        <div class="p-5 flex-grow flex flex-col justify-between">
          <div>
            <div>
              <span class="text-xs font-semibold text-amber-400 uppercase tracking-wider">${car.year} &bull; ${car.bodyStyle}${car.color ? ` &bull; ${escapeHtml(car.color)}` : ''}</span>
              <h3 class="text-lg font-bold text-white group-hover:text-amber-400 transition-colors heading-font leading-snug">
                ${car.make} ${car.model}
              </h3>
            </div>

            <div class="grid grid-cols-3 gap-2 py-3.5 my-3 border-y border-slate-800/80 text-[11px] text-slate-400">
              <div class="flex items-center space-x-1.5">
                <i data-lucide="gauge" class="w-3.5 h-3.5 text-slate-500"></i>
                <span>${car.kilometers ? formatNumber(car.kilometers) + ' km' : formatNumber(car.mileage) + ' mi'}</span>
              </div>
              <div class="flex items-center space-x-1.5">
                <i data-lucide="fuel" class="w-3.5 h-3.5 text-slate-500"></i>
                <span class="truncate">${car.fuelType}</span>
              </div>
              <div class="flex items-center space-x-1.5">
                <i data-lucide="zap" class="w-3.5 h-3.5 text-slate-500"></i>
                <span>${car.horsepower ? car.horsepower + ' HP' : car.transmission}</span>
              </div>
            </div>

            <!-- Dealer info row with click to open Dealer Profile -->
            <div class="flex items-center justify-between p-2 rounded-xl bg-slate-900/50 border border-slate-800/80 mb-4 cursor-pointer hover:border-amber-500/40 transition-colors" onclick="openDealerProfileModal('${dealer.id}')" title="Click to View Dealer Profile & Track Record">
              <div class="flex items-center space-x-2.5 truncate">
                <img src="${dealer.avatar}" alt="${dealer.name}" class="w-7 h-7 rounded-full object-cover border border-amber-500/30 flex-shrink-0">
                <div class="text-xs truncate">
                  <span class="text-slate-200 font-bold block truncate">${dealer.name}</span>
                  <span class="text-slate-500 text-[10px] block">${dealer.location}</span>
                </div>
              </div>
              <span class="text-[10px] text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 whitespace-nowrap">
                ${dealer.totalCarsSold || 0} Sold &rarr;
              </span>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-2 pt-2">
            <button onclick="openCarDetailModal('${car.id}')" class="py-2.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors border border-slate-700 flex items-center justify-center space-x-1">
              <i data-lucide="eye" class="w-3.5 h-3.5 shrink-0"></i>
              <span>Details</span>
            </button>
            ${isSold ? `
              <button onclick="openInquiryModal('${car.id}', 'Check Similar Vehicles')" class="py-2.5 px-2.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 font-bold text-xs transition-colors border border-rose-800/50 flex items-center justify-center space-x-1">
                <i data-lucide="tag" class="w-3.5 h-3.5 shrink-0"></i>
                <span>Similar</span>
              </button>
            ` : `
              <button onclick="openInquiryModal('${car.id}', 'Check Availability')" class="py-2.5 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center space-x-1 shadow-sm">
                <i data-lucide="message-square" class="w-3.5 h-3.5 shrink-0"></i>
                <span>Inquire</span>
              </button>
            `}
            <a href="${buildCarWhatsAppUrl(car, dealer)}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()" title="Chat on WhatsApp with ${escapeHtml(dealer.name)}" class="py-2.5 px-2.5 rounded-xl bg-emerald-600/25 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 font-bold text-xs transition-colors border border-emerald-500/40 flex items-center justify-center space-x-1">
              <i data-lucide="message-circle" class="w-3.5 h-3.5 shrink-0"></i>
              <span>WhatsApp</span>
            </a>
          </div>

        </div>

      </div>
    `;
  }).join("");

  lucide.createIcons();
}

// ==========================================
// DEALER PROFILE MODAL & SALES TRACK RECORD
// ==========================================
function buildCarWhatsAppUrl(car, dealer) {
  const raw = (dealer && (dealer.whatsapp || dealer.phone)) || "923435972004";
  const digits = String(raw).replace(/[^0-9]/g, "") || "923435972004";
  const carTitle = car ? `${car.year} ${car.make} ${car.model} (${formatCurrency(car.price)})` : "this vehicle";
  const dealerName = dealer?.name || "your dealership";
  const text = `Assalam-o-Alaikum, I am interested in the ${carTitle} listed by ${dealerName} on Desi Hood Cars.`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

function openDealerProfileModal(dealerId) {
  const dealer = getDealerById(dealerId);
  const dealerCars = appState.cars.filter(c => c.dealerId === dealer.id);
  const soldCars = dealerCars.filter(c => c.status === 'sold');
  const activeCars = dealerCars.filter(c => c.status !== 'sold');

  const totalSold = dealer.totalCarsSold || soldCars.length || 0;
  const totalVolume = dealer.totalSalesVolume || dealerCars.reduce((a, b) => a + (b.price || 0), 0);

  const container = document.getElementById("dealer-profile-modal-content");
  if (!container) return;

  const whatsappClean = (dealer.whatsapp || dealer.phone || '').replace(/[^0-9]/g, '');

  container.innerHTML = `
    <div class="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 border border-amber-500/30 overflow-hidden mb-8">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div class="flex items-center space-x-5">
          <img src="${dealer.avatar}" alt="${dealer.name}" class="w-20 h-20 rounded-2xl object-cover border-2 border-amber-500/50 shadow-xl">
          <div>
            <div class="flex items-center space-x-2">
              <h2 class="text-2xl sm:text-3xl font-extrabold text-white heading-font">${dealer.name}</h2>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold badge-verified text-amber-300">
                <i data-lucide="check" class="w-3.5 h-3.5 mr-1 text-amber-400"></i> Verified Dealer
              </span>
            </div>
            <p class="text-xs text-slate-300 mt-1 flex items-center space-x-2">
              <span><i data-lucide="map-pin" class="w-3.5 h-3.5 inline mr-1 text-slate-500"></i>${dealer.location || 'Showroom'}</span>
              <span>&bull;</span>
              <span>Member Since ${dealer.memberSince || '2024'}</span>
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          ${whatsappClean ? `
            <a href="https://wa.me/${whatsappClean}" target="_blank" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-emerald-600/30">
              <i data-lucide="message-circle" class="w-4 h-4"></i>
              <span>WhatsApp Chat</span>
            </a>
          ` : ''}
          <a href="tel:${dealer.phone}" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium border border-slate-700 flex items-center space-x-1.5">
            <i data-lucide="phone" class="w-4 h-4 text-amber-400"></i>
            <span>Call Showroom</span>
          </a>
        </div>
      </div>

      <!-- Sales Track Record Stats -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800">
        <div class="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
          <span class="text-[11px] text-slate-400 font-medium block">Cars Sold on Desi Hood</span>
          <span class="text-2xl font-black text-rose-400 heading-font mt-0.5 block">${totalSold} Vehicles</span>
        </div>
        <div class="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
          <span class="text-[11px] text-slate-400 font-medium block">Total Sales Volume</span>
          <span class="text-2xl font-black text-emerald-400 heading-font mt-0.5 block">${formatCurrency(totalVolume)}</span>
        </div>
        <div class="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
          <span class="text-[11px] text-slate-400 font-medium block">Current In Stock</span>
          <span class="text-2xl font-black text-white heading-font mt-0.5 block">${activeCars.length} Available</span>
        </div>
        <div class="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
          <span class="text-[11px] text-slate-400 font-medium block">Customer Rating</span>
          <span class="text-2xl font-black text-amber-400 heading-font mt-0.5 flex items-center">
            ${dealer.rating || 4.9} <i data-lucide="star" class="w-4 h-4 fill-amber-400 text-amber-400 ml-1"></i>
          </span>
        </div>
      </div>
    </div>

    <!-- Dealer Bio -->
    <div class="mb-8">
      <h4 class="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">Dealership Overview</h4>
      <p class="text-slate-300 text-xs sm:text-sm leading-relaxed">${dealer.description || 'Specializing in quality inspected certified luxury and sport vehicles.'}</p>
    </div>

    <!-- Inventory & Sold Archive -->
    <div>
      <div class="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <h4 class="text-base font-bold text-white">Dealership Showcase (${dealerCars.length} Vehicles)</h4>
        <span class="text-xs text-slate-400">${soldCars.length} marked SOLD OUT</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        ${dealerCars.map(car => `
          <div class="glass-card rounded-2xl overflow-hidden border ${car.status === 'sold' ? 'border-rose-900/50 opacity-80' : 'border-slate-800'}">
            <div class="relative h-36 bg-slate-900">
              <img src="${car.image}" class="w-full h-full object-cover">
              ${car.status === 'sold' ? `
                <div class="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span class="px-3 py-1 rounded-lg bg-rose-600 text-white font-black text-xs uppercase tracking-widest shadow-xl">
                    SOLD OUT
                  </span>
                </div>
              ` : `
                <span class="absolute top-2 left-2 px-2 py-0.5 rounded bg-emerald-500/90 text-slate-950 font-bold text-[10px]">
                  In Stock
                </span>
              `}
              <span class="absolute bottom-2 right-2 text-sm font-black text-white bg-slate-950/80 px-2 py-0.5 rounded">
                ${formatCurrency(car.price)}
              </span>
            </div>
            <div class="p-3 space-y-2">
              <h5 class="font-bold text-white text-xs truncate">${car.year} ${car.make} ${car.model}</h5>
              <div class="flex justify-between text-[11px] text-slate-400">
                <span>${formatNumber(car.mileage)} mi</span>
                <span>${car.fuelType}</span>
              </div>
              <a href="${buildCarWhatsAppUrl(car, dealer)}" target="_blank" rel="noopener noreferrer" class="w-full py-1.5 px-2.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/40 text-[11px] font-bold flex items-center justify-center space-x-1 transition-colors">
                <i data-lucide="message-circle" class="w-3 h-3"></i>
                <span>WhatsApp Dealer</span>
              </a>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  openModal("modal-dealer-profile");
  lucide.createIcons();
}

// ==========================================
// DEALERS DIRECTORY VIEW
// ==========================================
function renderDealersDirectory() {
  const container = document.getElementById("dealers-grid");
  const banner = document.getElementById("dealers-banner");
  if (!container) return;

  const country = appState.currentCountry || 'ALL';
  const info = (typeof COUNTRY_INFO !== 'undefined' && COUNTRY_INFO[country])
    ? COUNTRY_INFO[country]
    : { name: "All Countries", flag: "🌍", currency: "USD" };

  const visibleDealers = appState.dealers.filter(d => !d.banned && (country === 'ALL' || (d.country || 'US') === country));

  if (banner) {
    banner.innerHTML = country !== 'ALL' ? `
      <div class="glass-panel rounded-2xl p-4 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="flex items-center space-x-3 text-xs sm:text-sm">
          <span class="text-2xl">${info.flag}</span>
          <span class="text-slate-200">Showing <strong class="text-white">${visibleDealers.length}</strong> certified dealership(s) in <strong class="text-amber-400">${info.name}</strong> (${CURRENCIES[appState.currentCurrency]?.label || info.currency})</span>
        </div>
        <button onclick="changeCountryLocation('ALL')" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold border border-slate-700 transition-colors">
          Show All Countries
        </button>
      </div>
    ` : '';
  }

  if (visibleDealers.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-12 text-center text-slate-400 glass-panel rounded-2xl border border-slate-800">
        <i data-lucide="store" class="w-10 h-10 mx-auto mb-2 text-slate-600"></i>
        <h4 class="text-white font-bold">No dealers listed in ${info.name} yet</h4>
        <button onclick="changeCountryLocation('ALL')" class="mt-3 px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs">Show All Countries</button>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = visibleDealers.map(dealer => {
    const dealerCars = appState.cars.filter(c => c.dealerId === dealer.id);
    const activeCount = dealerCars.filter(c => c.status !== 'sold').length;
    const soldCount = dealer.totalCarsSold || dealerCars.filter(c => c.status === 'sold').length || 0;
    const whatsappClean = (dealer.whatsapp || dealer.phone || '').replace(/[^0-9]/g, '');

    return `
      <div class="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
        <div>
          <div class="flex items-center space-x-4 mb-4">
            <img src="${dealer.avatar}" alt="${dealer.name}" class="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/40">
            <div>
              <div class="flex items-center space-x-1.5">
                <h3 class="text-base font-bold text-white">${dealer.name}</h3>
                ${dealer.verified ? `<i data-lucide="check-circle-2" class="w-4 h-4 text-amber-400 fill-amber-500/20"></i>` : ''}
              </div>
              <p class="text-xs text-slate-400 flex items-center mt-1">
                <i data-lucide="map-pin" class="w-3.5 h-3.5 mr-1 text-slate-500"></i> ${dealer.location}
              </p>
            </div>
          </div>

          <p class="text-xs text-slate-300 leading-relaxed mb-4 line-clamp-2">${dealer.description}</p>

          <div class="grid grid-cols-3 gap-2 p-3 bg-slate-900/80 rounded-xl text-xs mb-4 text-center">
            <div>
              <span class="text-slate-500 block text-[10px] uppercase font-bold">In Stock</span>
              <span class="font-extrabold text-white text-sm">${activeCount}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[10px] uppercase font-bold">Cars Sold</span>
              <span class="font-extrabold text-rose-400 text-sm">${soldCount}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[10px] uppercase font-bold">Rating</span>
              <span class="font-extrabold text-amber-400 text-sm flex items-center justify-center">
                ${dealer.rating || 4.9} <i data-lucide="star" class="w-3 h-3 fill-amber-400 text-amber-400 ml-0.5"></i>
              </span>
            </div>
          </div>
        </div>

        <div class="space-y-2 pt-2 border-t border-slate-800/80">
          <div class="flex items-center justify-between gap-2">
            ${whatsappClean ? `
              <a href="https://wa.me/${whatsappClean}" target="_blank" class="flex-1 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-1">
                <i data-lucide="message-circle" class="w-3.5 h-3.5"></i>
                <span>WhatsApp</span>
              </a>
            ` : ''}
            <button onclick="openDealerProfileModal('${dealer.id}')" class="flex-1 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-1">
              <i data-lucide="user" class="w-3.5 h-3.5"></i>
              <span>View Profile</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  lucide.createIcons();
}

// ==========================================
// BECOME A DEALER ONBOARDING ENGINE
// ==========================================
function assignAutoDealerAvatar() {
  const random = SAMPLE_DEALER_AVATARS[Math.floor(Math.random() * SAMPLE_DEALER_AVATARS.length)];
  const input = document.getElementById("reg-avatar");
  if (input) input.value = random;
}

async function handleDealerRegistration(e) {
  e.preventDefault();

  const name = document.getElementById("reg-dealer-name").value.trim();
  const owner = document.getElementById("reg-owner-name").value.trim();
  const phone = document.getElementById("reg-phone").value.trim();
  const whatsapp = document.getElementById("reg-whatsapp").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const country = document.getElementById("reg-country").value.trim();
  const city = document.getElementById("reg-city").value.trim();
  const address = document.getElementById("reg-address").value.trim();
  const license = document.getElementById("reg-license")?.value.trim() || '';
  const avatar = document.getElementById("reg-avatar")?.value.trim() || SAMPLE_DEALER_AVATARS[0];
  const bio = document.getElementById("reg-bio")?.value.trim() || `Authorized showroom managed by ${owner} in ${city}, ${country}.`;

  const countryLower = country.toLowerCase();
  const countryCode = countryLower.includes('pakistan') || countryLower === 'pk' ? 'PK' :
    countryLower.includes('uae') || countryLower.includes('emirates') || countryLower === 'ae' ? 'AE' :
    countryLower.includes('saudi') || countryLower === 'sa' ? 'SA' :
    countryLower.includes('uk') || countryLower.includes('kingdom') || countryLower === 'gb' ? 'GB' :
    countryLower.includes('canada') || countryLower === 'ca' ? 'CA' :
    countryLower.includes('australia') || countryLower === 'au' ? 'AU' :
    countryLower.includes('india') || countryLower === 'in' ? 'IN' :
    countryLower.includes('japan') || countryLower === 'jp' ? 'JP' :
    countryLower.includes('europe') || countryLower.includes('germany') || countryLower === 'eu' ? 'EU' :
    (appState.currentCountry !== 'ALL' ? appState.currentCountry : 'US');

  const newRequest = {
    id: "req-" + Date.now(),
    name: name,
    owner: owner,
    phone: phone,
    whatsapp: whatsapp,
    email: email,
    countryName: country,
    city: city,
    location: `${city}, ${country}`,
    country: countryCode,
    address: address,
    license: license,
    avatar: avatar,
    description: bio,
    status: "pending",
    reviewNote: "",
    submittedAt: new Date().toISOString()
  };

  appState.dealerRequests.unshift(newRequest);
  saveAllState();
  updateOwnerPendingBadge();
  let cloudSaved = false;
  if (typeof sbUpsertRecord === "function" && typeof mapRequestToRow === "function") {
    const res = await sbUpsertRecord("dealer_requests", mapRequestToRow(newRequest));
    cloudSaved = Boolean(res && res.ok);
  }

  const regForm = document.getElementById("dealer-registration-form");
  if (regForm) regForm.reset();

  const banner = document.getElementById("dealer-request-submitted-banner");
  const bannerText = document.getElementById("dealer-request-submitted-text");
  if (banner) {
    banner.classList.remove("hidden");
    if (bannerText) {
      bannerText.textContent = `Application ${newRequest.id} for "${name}" (${city}, ${country}) has been delivered${cloudSaved ? ' to Supabase Cloud' : ''} for owner verification and approval.`;
    }
    banner.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  if (appState.isOwnerAuthenticated) renderOwnerConsole();

  showToast("Request Submitted!", `"${name}" application received${cloudSaved ? ' and synced to Supabase' : ''} for owner approval.`, "success");
  lucide.createIcons();
}

// ==========================================
// DEALER MANAGEMENT PORTAL ENGINE (AUTOMATIC SOLD OUT)
// ==========================================
function renderDealerPortal() {
  const dealer = getActiveDealer();
  const ownerBar = document.getElementById("owner-dealer-portal-bar");
  const bannedAlert = document.getElementById("banned-dealer-alert");
  const pendingCountEl = document.getElementById("portal-owner-pending-count");
  const banBtn = document.getElementById("portal-ban-dealer-btn");

  if (ownerBar) {
    ownerBar.classList.toggle("hidden", !appState.isOwnerAuthenticated);
  }
  if (pendingCountEl) {
    pendingCountEl.textContent = appState.dealerRequests.filter(r => r.status === 'pending').length;
  }

  if (!dealer) {
    if (bannedAlert) bannedAlert.classList.add("hidden");
    const tbody = document.getElementById("dealer-inventory-table-body");
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-slate-400 text-xs">No active dealership selected.</td></tr>`;
    }
    lucide.createIcons();
    return;
  }

  if (bannedAlert) {
    if (dealer.banned) {
      bannedAlert.classList.remove("hidden");
      const reasonEl = document.getElementById("banned-dealer-reason-text");
      if (reasonEl) reasonEl.textContent = `Reason: ${dealer.banReason || 'Removed/Suspended by Owner for fraudulent or poor conduct.'}`;
    } else {
      bannedAlert.classList.add("hidden");
    }
  }

  if (banBtn) {
    banBtn.innerHTML = dealer.banned
      ? `<i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i><span>Unban Dealer</span>`
      : `<i data-lucide="ban" class="w-3.5 h-3.5"></i><span>Ban Fraudulent Dealer</span>`;
  }

  const dealerCars = appState.cars.filter(c => c.dealerId === dealer.id);
  const activeCars = dealerCars.filter(c => c.status !== 'sold');
  const soldCars = dealerCars.filter(c => c.status === 'sold');
  const dealerInquiries = appState.inquiries.filter(i => i.dealerId === dealer.id);

  const nameEl = document.getElementById("portal-dealer-name");
  const avatarEl = document.getElementById("portal-dealer-avatar");
  const locEl = document.getElementById("portal-dealer-location");

  if (nameEl) nameEl.textContent = dealer.name;
  if (avatarEl) avatarEl.src = dealer.avatar;
  if (locEl) {
    locEl.innerHTML = `<i data-lucide="map-pin" class="w-4 h-4 mr-1 text-slate-500"></i> ${dealer.location}`;
  }

  const totalSold = dealer.totalCarsSold || soldCars.length || 0;
  const totalVolume = dealer.totalSalesVolume || dealerCars.reduce((a, b) => a + (b.price || 0), 0);

  const statActive = document.getElementById("dealer-stat-active-cars");
  const statSold = document.getElementById("dealer-stat-sold-cars");
  const statTotal = document.getElementById("dealer-stat-total-value");
  const statLeads = document.getElementById("dealer-stat-leads");
  const leadsBadge = document.getElementById("leads-count-badge");

  if (statActive) statActive.textContent = activeCars.length;
  if (statSold) statSold.innerHTML = `<span>${totalSold}</span> <span class="text-xs ml-2 px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">SOLD OUT</span>`;
  if (statTotal) statTotal.textContent = formatCurrency(totalVolume);
  if (statLeads) statLeads.textContent = dealerInquiries.length;
  if (leadsBadge) leadsBadge.textContent = dealerInquiries.length;

  if (appState.activePortalTab === 'inventory') {
    renderDealerInventoryTable(dealerCars);
  } else {
    renderDealerLeads(dealerInquiries);
  }

  lucide.createIcons();
}

function switchPortalTab(tabName) {
  appState.activePortalTab = tabName;
  const invBtn = document.getElementById("portal-tab-inventory-btn");
  const leadsBtn = document.getElementById("portal-tab-leads-btn");
  const invView = document.getElementById("portal-tab-inventory");
  const leadsView = document.getElementById("portal-tab-leads");

  if (tabName === 'inventory') {
    invBtn.className = "px-4 py-2 rounded-xl text-sm font-semibold transition-colors bg-amber-500/20 text-amber-400 border border-amber-500/30";
    leadsBtn.className = "px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-slate-200 transition-colors flex items-center space-x-2";
    invView.classList.remove("hidden");
    leadsView.classList.add("hidden");
  } else {
    leadsBtn.className = "px-4 py-2 rounded-xl text-sm font-semibold transition-colors bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center space-x-2";
    invBtn.className = "px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-slate-200 transition-colors";
    leadsView.classList.remove("hidden");
    invView.classList.add("hidden");
  }

  renderDealerPortal();
}

function renderDealerInventoryTable(cars) {
  const tbody = document.getElementById("dealer-inventory-table-body");
  if (!tbody) return;

  if (cars.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="py-8 text-center text-slate-400 text-xs">
          No vehicles in your inventory. Click "Add Vehicle Listing" above to publish your first car!
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = cars.map(car => {
    const isSold = car.status === 'sold';

    return `
      <tr class="hover:bg-slate-800/40 transition-colors ${isSold ? 'bg-rose-950/10' : ''}">
        <td class="py-3 px-4">
          <div class="flex items-center space-x-3">
            <div class="relative w-12 h-10 rounded-lg overflow-hidden border border-slate-700 flex-shrink-0">
              <img src="${car.image}" class="w-full h-full object-cover">
              ${isSold ? `<span class="absolute inset-0 bg-rose-700/80 text-[9px] font-black text-white flex items-center justify-center">SOLD</span>` : ''}
            </div>
            <div>
              <span class="font-bold text-white block text-sm">${car.make} ${car.model}</span>
              <span class="text-[11px] text-slate-400 font-mono">${car.vin || 'VIN N/A'}</span>
            </div>
          </div>
        </td>
        <td class="py-3 px-4 text-xs text-slate-300">
          <div>${car.year} &bull; ${car.bodyStyle}</div>
          <div class="text-[11px] text-slate-500">${car.fuelType} &bull; ${car.transmission}</div>
        </td>
        <td class="py-3 px-4 font-bold ${isSold ? 'text-rose-400 line-through' : 'text-emerald-400'} text-sm">
          ${formatCurrency(car.price)}
        </td>
        <td class="py-3 px-4 text-xs text-slate-300">
          ${formatNumber(car.mileage)} mi
        </td>
        <td class="py-3 px-4">
          <span class="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
            ${car.condition}
          </span>
        </td>
        
        <!-- Toggle Status button with AUTOMATIC SOLD OUT BOARD placement -->
        <td class="py-3 px-4">
          <button onclick="toggleCarStatus('${car.id}')" title="Click to declare car SOLD or Active" class="px-3 py-1 rounded-full text-xs font-extrabold transition-all ${isSold ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'} flex items-center space-x-1">
            <i data-lucide="${isSold ? 'tag' : 'check'}" class="w-3 h-3"></i>
            <span>${isSold ? 'SOLD OUT' : 'Active In Stock'}</span>
          </button>
        </td>

        <td class="py-3 px-4 text-right space-x-2">
          <button onclick="openListingModal('${car.id}')" title="Edit Listing" class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors">
            <i data-lucide="edit-3" class="w-4 h-4"></i>
          </button>
          <button onclick="deleteCarListing('${car.id}')" title="Delete Listing" class="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-400 transition-colors">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </td>
      </tr>
    `;
  }).join("");

  lucide.createIcons();
}

function toggleCarStatus(carId) {
  const car = appState.cars.find(c => c.id === carId);
  if (!car) return;

  const dealer = getDealerById(car.dealerId);

  if (car.status === 'sold') {
    car.status = 'active';
    showToast("Status Updated", `${car.make} ${car.model} is now marked as Active in Stock.`, "info");
  } else {
    // AUTOMATICALLY PLACES SOLD OUT BOARD ON LISTING
    car.status = 'sold';
    car.soldDate = new Date().toISOString().split('T')[0];
    
    // Automatically increment dealer sales volume and count
    dealer.totalCarsSold = (dealer.totalCarsSold || 0) + 1;
    dealer.totalSalesVolume = (dealer.totalSalesVolume || 0) + (car.price || 0);

    showToast("🎉 Vehicle SOLD OUT!", `Marked ${car.make} ${car.model} as SOLD OUT! Automatic SOLD OUT board placed on listing.`, "success");
  }

  saveAllState();
  if (typeof sbUpsertRecord === "function" && typeof mapCarToRow === "function") {
    sbUpsertRecord("cars", mapCarToRow(car));
    if (dealer && dealer.id && typeof mapDealerToRow === "function") {
      sbUpsertRecord("dealers", mapDealerToRow(dealer));
    }
  }
  renderDealerPortal();
  renderMarketplace();
  renderDealersDirectory();
}

function renderDealerLeads(leads) {
  const container = document.getElementById("dealer-leads-list");
  if (!container) return;

  if (leads.length === 0) {
    container.innerHTML = `
      <div class="glass-panel p-8 rounded-2xl border border-slate-800 text-center text-slate-400 text-sm">
        No inquiries received yet. When buyers message you or book a test drive, their details appear here in real-time.
      </div>
    `;
    return;
  }

  container.innerHTML = leads.map(lead => `
    <div class="glass-panel p-5 rounded-2xl border ${lead.status === 'New' ? 'border-amber-500/40 bg-amber-950/10' : 'border-slate-800'} transition-all">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
        <div>
          <div class="flex items-center space-x-2">
            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold ${lead.type === 'Test Drive' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'}">
              ${lead.type}
            </span>
            <h4 class="text-sm font-bold text-white">${lead.carName}</h4>
          </div>
          <span class="text-[11px] text-slate-400 mt-0.5 block">Received ${new Date(lead.createdAt).toLocaleDateString()}</span>
        </div>

        <div class="flex items-center space-x-2">
          <span class="text-xs text-slate-400">Status:</span>
          <select onchange="updateLeadStatus('${lead.id}', this.value)" class="bg-slate-900 border border-slate-700 text-xs rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-amber-500">
            <option value="New" ${lead.status === 'New' ? 'selected' : ''}>New Lead</option>
            <option value="Contacted" ${lead.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
            <option value="Closed" ${lead.status === 'Closed' ? 'selected' : ''}>Closed / Won</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 py-3 text-xs text-slate-300">
        <div>
          <span class="text-slate-500 block text-[11px]">Customer</span>
          <span class="font-semibold text-white">${lead.customerName}</span>
        </div>
        <div>
          <span class="text-slate-500 block text-[11px]">Phone</span>
          <a href="tel:${lead.customerPhone}" class="text-amber-400 hover:underline font-mono">${lead.customerPhone}</a>
        </div>
        <div>
          <span class="text-slate-500 block text-[11px]">Email</span>
          <a href="mailto:${lead.customerEmail}" class="text-amber-400 hover:underline">${lead.customerEmail}</a>
        </div>
      </div>

      <div class="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300">
        <span class="text-slate-500 block text-[10px] uppercase font-bold mb-1">Customer Message:</span>
        <p class="italic">"${lead.message}"</p>
      </div>
    </div>
  `).join("");

  lucide.createIcons();
}

function updateLeadStatus(leadId, newStatus) {
  const lead = appState.inquiries.find(i => i.id === leadId);
  if (lead) {
    lead.status = newStatus;
    saveAllState();
    showToast("Status Updated", `Inquiry marked as ${newStatus}`, "info");
    renderDealerPortal();
  }
}

// ==========================================
// CAR INSPECTION & DETAIL MODAL
// ==========================================
function openCarDetailModal(carId) {
  const car = appState.cars.find(c => c.id === carId);
  if (!car) return;

  const dealer = getDealerById(car.dealerId);
  const isSold = car.status === 'sold';
  const container = document.getElementById("car-detail-content");

  container.innerHTML = `
    <div class="relative h-72 sm:h-96 w-full bg-slate-950 overflow-hidden">
      <img src="${car.image}" alt="${car.make} ${car.model}" class="w-full h-full object-cover">
      <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>

      ${isSold ? `
        <div class="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-20">
          <div class="px-6 py-3 rounded-2xl bg-rose-600 text-white font-black text-lg uppercase tracking-widest border-2 border-rose-400 shadow-2xl rotate-[-4deg]">
            SOLD OUT &bull; PURCHASE COMPLETED
          </div>
        </div>
      ` : ''}

      <div class="absolute bottom-5 left-5 sm:left-8 right-5 flex flex-col sm:flex-row sm:items-end justify-between gap-2 z-10">
        <div>
          <div class="flex items-center space-x-2 mb-1.5">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500 text-slate-950 font-bold">
              ${car.condition}
            </span>
            <span class="text-xs text-slate-300">${car.year} Model</span>
          </div>
          <h2 class="text-2xl sm:text-4xl font-extrabold text-white heading-font">
            ${car.make} ${car.model}
          </h2>
        </div>
        <div class="sm:text-right">
          <span class="text-xs text-slate-400 uppercase tracking-widest block font-medium">${isSold ? 'Final Sale Price' : 'Dealer Asking Price'}</span>
          <span class="text-3xl sm:text-4xl font-black ${isSold ? 'text-rose-400 line-through' : 'text-amber-400'} heading-font">
            ${formatCurrency(car.price)}
          </span>
        </div>
      </div>
    </div>

    <div class="p-6 sm:p-8 space-y-8">
      <div>
        <h4 class="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-2">
          <i data-lucide="cpu" class="w-4 h-4 text-amber-400"></i>
          <span>Technical Specifications</span>
        </h4>
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div class="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span class="text-[11px] text-slate-500 block">Distance Driven</span>
            <span class="text-sm font-bold text-white">${formatNumber(getCarKilometers(car))} km <span class="text-[11px] text-slate-400">(${formatNumber(car.mileage)} mi)</span></span>
          </div>
          <div class="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span class="text-[11px] text-slate-500 block">Exterior Color</span>
            <span class="text-sm font-bold text-white">${escapeHtml(car.color || 'Factory Finish')}</span>
          </div>
          <div class="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span class="text-[11px] text-slate-500 block">Powertrain</span>
            <span class="text-sm font-bold text-white">${car.fuelType}</span>
          </div>
          <div class="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span class="text-[11px] text-slate-500 block">Transmission</span>
            <span class="text-sm font-bold text-white">${car.transmission}</span>
          </div>
          <div class="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span class="text-[11px] text-slate-500 block">Horsepower</span>
            <span class="text-sm font-bold text-white">${car.horsepower ? car.horsepower + ' HP' : 'Standard'}</span>
          </div>
        </div>
      </div>

      ${car.workingDetails ? `
        <div class="p-4 sm:p-5 rounded-2xl bg-orange-950/20 border border-orange-500/30 space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h4 class="text-xs font-extrabold uppercase tracking-wider text-orange-300 flex items-center space-x-1.5">
              <i data-lucide="wrench" class="w-4 h-4"></i>
              <span>Car Total Working Details</span>
            </h4>
            <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">${escapeHtml(car.workingDetails.score || 'Verified Working')}</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
            <div class="bg-slate-950/80 p-3 rounded-xl border border-slate-800"><span class="text-slate-400 block text-[10px] uppercase">Engine Working</span><strong class="text-white">${escapeHtml(car.workingDetails.engine || 'Smooth')}</strong></div>
            <div class="bg-slate-950/80 p-3 rounded-xl border border-slate-800"><span class="text-slate-400 block text-[10px] uppercase">Body &amp; Paint</span><strong class="text-white">${escapeHtml(car.workingDetails.body || 'Clean')}</strong></div>
            <div class="bg-slate-950/80 p-3 rounded-xl border border-slate-800"><span class="text-slate-400 block text-[10px] uppercase">AC &amp; Electronics</span><strong class="text-white">${escapeHtml(car.workingDetails.ac || 'Working')}</strong></div>
            <div class="bg-slate-950/80 p-3 rounded-xl border border-slate-800"><span class="text-slate-400 block text-[10px] uppercase">Suspension &amp; Tyres</span><strong class="text-white">${escapeHtml(car.workingDetails.suspension || 'Smooth')}</strong></div>
            <div class="bg-slate-950/80 p-3 rounded-xl border border-slate-800"><span class="text-slate-400 block text-[10px] uppercase">Ownership &amp; Docs</span><strong class="text-white">${escapeHtml(car.workingDetails.owners || 'Verified')}</strong></div>
            ${car.workingDetails.notes ? `<div class="bg-slate-950/80 p-3 rounded-xl border border-slate-800 sm:col-span-2 lg:col-span-1"><span class="text-slate-400 block text-[10px] uppercase">Inspection Notes</span><strong class="text-slate-200">${escapeHtml(car.workingDetails.notes)}</strong></div>` : ''}
          </div>
        </div>
      ` : ''}

      <div>
        <h4 class="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">Vehicle Overview</h4>
        <p class="text-slate-300 text-sm leading-relaxed">${car.description}</p>
      </div>

      <div class="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-700/80 flex flex-col md:flex-row items-center justify-between gap-6">
        <div class="flex items-center space-x-4">
          <img src="${dealer.avatar}" class="w-14 h-14 rounded-2xl object-cover border border-amber-500/40">
          <div>
            <div class="flex items-center space-x-2">
              <h5 class="text-base font-bold text-white">${dealer.name}</h5>
              <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">Verified Dealer</span>
            </div>
            <p class="text-xs text-slate-400 mt-0.5 flex items-center">
              <i data-lucide="map-pin" class="w-3.5 h-3.5 mr-1 text-slate-500"></i> ${dealer.location} &bull; ${dealer.totalCarsSold || 0} Cars Sold
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button onclick="closeModal('modal-car-detail'); openDealerProfileModal('${dealer.id}')" class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700">
            View Dealer Profile
          </button>
          <a href="${buildCarWhatsAppUrl(car, dealer)}" target="_blank" rel="noopener noreferrer" class="px-4 py-2.5 rounded-xl bg-emerald-600/25 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 text-xs font-bold border border-emerald-500/40 flex items-center space-x-1.5 transition-colors">
            <i data-lucide="message-circle" class="w-3.5 h-3.5"></i>
            <span>WhatsApp Dealer</span>
          </a>
          <button onclick="closeModal('modal-car-detail'); openInquiryModal('${car.id}', 'Check Availability')" class="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold btn-primary-glow">
            Contact Dealer
          </button>
        </div>
      </div>
    </div>
  `;

  openModal("modal-car-detail");
  lucide.createIcons();
}

// ==========================================
// CAR VALUATION & SELL YOUR CAR
// ==========================================
function updateLiveEstimate() {
  const year = parseInt(document.getElementById("val-year")?.value || 2024);
  const make = document.getElementById("val-make")?.value || 'BMW';
  const mileage = parseInt(document.getElementById("val-mileage")?.value || 12000);
  const conditionMult = parseFloat(document.getElementById("val-condition")?.value || 1.0);

  const baseMap = {
    'Porsche': 115000,
    'Mercedes-Benz': 92000,
    'BMW': 74000,
    'Audi': 68000,
    'Tesla': 62000,
    'Toyota': 38000,
    'Ford': 44000
  };

  const base = baseMap[make] || 50000;
  const yearFactor = 1 - (2025 - year) * 0.05;
  const mileageFactor = Math.max(0.7, 1 - (mileage / 100000) * 0.25);

  const calculated = Math.round(base * yearFactor * mileageFactor * conditionMult);
  const minOffer = Math.round(calculated * 0.95 / 500) * 500;
  const maxOffer = Math.round(calculated * 1.04 / 500) * 500;

  const display = document.getElementById("val-result-range");
  if (display) {
    display.textContent = `${formatCurrency(minOffer)} – ${formatCurrency(maxOffer)}`;
  }
}

function handleCarValuationSubmit(e) {
  e.preventDefault();
  const name = document.getElementById("seller-name").value;
  const phone = document.getElementById("seller-phone").value;
  const offer = document.getElementById("val-result-range").textContent;

  showToast("Certified Offer Locked!", `Thank you ${name}. Our appraisal desk has received your submission (${offer}). We will contact ${phone} shortly.`, "success");
}

// ==========================================
// FINANCING CALCULATOR
// ==========================================
// ==========================================
// PAKISTAN BANK CAR FINANCE & MARKUP ENGINE
// ==========================================
const PAKISTAN_BANK_FINANCE_RATES = [
  {
    id: "hbl",
    name: "HBL CarLoan",
    fullName: "Habib Bank Limited (HBL CarLoan)",
    type: "Conventional / Tiered",
    apr: 14.00,
    rateLabel: "13.50% – 14.50% p.a.",
    note: "Fixed & KIBOR-linked customer tiers; discount possible for HBL salary accounts.",
    url: "https://www.hbl.com/personal/loans/hbl-car-loan"
  },
  {
    id: "nbp",
    name: "NBP Car Finance",
    fullName: "National Bank of Pakistan (NBP)",
    type: "Conventional / Advance",
    apr: 13.50,
    rateLabel: "12.80% – 14.50% p.a.",
    note: "Typically 1Y KIBOR + 1.99% to 3.00% spread depending on applicant tier.",
    url: "https://www.nbp.com.pk/AHAF-CALC/index.aspx"
  },
  {
    id: "ubl",
    name: "UBL Drive",
    fullName: "United Bank Limited (UBL Drive)",
    type: "Variable KIBOR",
    apr: 15.75,
    rateLabel: "14.50% – 17.50% p.a.",
    note: "Variable markup pegged to 1-Year KIBOR + 4.00% to 4.75%.",
    url: "https://www.ubldigital.com/Loans/Consumer-Loans/UBL-Drive"
  },
  {
    id: "askari",
    name: "Askari Bank (Ijarah)",
    fullName: "Askari Bank – Ijarah-bis-Sayyarah",
    type: "Islamic Ijarah",
    apr: 14.50,
    rateLabel: "13.50% – 15.50% p.a.",
    note: "Shariah-compliant Ijarah rental structure across conventional & defense tiers.",
    url: "https://askaribank.com/personal/loans/consumer%20financing/ijrarah-bis-sayyarah"
  },
  {
    id: "faysal",
    name: "Faysal Islami Car Finance",
    fullName: "Faysal Bank – Faysal Islami Car Finance",
    type: "Islamic Financing",
    apr: 16.00,
    rateLabel: "15.00% – 17.50% p.a.",
    note: "Islamic Diminishing Musharakah / Ijarah benchmarked around 1Y KIBOR + 4%–6%.",
    url: "https://www.faysalbank.com/car-finance/faysal-islami-car-finance"
  },
  {
    id: "bajk",
    name: "Bank of AJK",
    fullName: "Bank of Azad Jammu & Kashmir (BAJK)",
    type: "Consumer Auto Finance",
    apr: 14.00,
    rateLabel: "~14.00%+ (Verify at Bank)",
    note: "Indicative framework starts near 14.00%; exact markup confirmed per branch/tier.",
    url: "https://bankajk.com/consumer-finances.php"
  },
  {
    id: "alfalah",
    name: "Bank Alfalah Auto Loan",
    fullName: "Bank Alfalah – Auto Loan & Islamic",
    type: "Conventional / Islamic",
    apr: 15.50,
    rateLabel: "14.40% – 17.50% p.a.",
    note: "1-Year KIBOR + 3.5% to 4.5% spread with relationship rate options.",
    url: "https://www.bankalfalah.com/personal-banking/auto-loan/"
  },
  {
    id: "bop",
    name: "Bank of Punjab (BOP RDA)",
    fullName: "Bank of Punjab – Roshan Apni Car Calculator",
    type: "RDA / Dynamic Rate",
    apr: null,
    rateLabel: "Check BOP Calculator",
    note: "Exact rate varies by RDA / resident scheme & tenure. Open BOP's official calculator directly.",
    url: "https://rda.bop.com.pk/Home/InstallmentCalculatorOpen"
  }
];

function initBankFinancingRates() {
  const select = document.getElementById("calc-bank-select");
  if (select) {
    select.innerHTML = PAKISTAN_BANK_FINANCE_RATES.map(b => {
      const rateSuffix = b.apr !== null ? `${b.apr.toFixed(2)}% Indicative` : "Open Bank Calculator";
      return `<option value="${b.id}">${b.fullName} — ${rateSuffix}</option>`;
    }).join("") + `<option value="custom">Custom Interest / Markup Rate (%)</option>`;
    select.value = "hbl";
  }
  renderPakistanBanksGrid();
  onFinancingBankChange();
}

function selectBankForFinancing(bankId) {
  const select = document.getElementById("calc-bank-select");
  if (select) {
    select.value = bankId;
    onFinancingBankChange();
    select.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function onFinancingBankChange() {
  const bankId = document.getElementById("calc-bank-select")?.value || "hbl";
  const bank = PAKISTAN_BANK_FINANCE_RATES.find(b => b.id === bankId);
  const aprInput = document.getElementById("calc-apr");
  const typePill = document.getElementById("calc-bank-type-pill");
  const noteEl = document.getElementById("calc-bank-rate-note");

  if (bank) {
    if (bank.apr !== null) {
      if (aprInput) aprInput.value = bank.apr.toFixed(2);
      if (typePill) {
        typePill.textContent = bank.type;
        typePill.className = "px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase";
      }
      if (noteEl) noteEl.textContent = `${bank.rateLabel} • ${bank.note}`;
    } else {
      if (aprInput) aprInput.value = "";
      if (typePill) {
        typePill.textContent = "Live Rate On Bank Site";
        typePill.className = "px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[10px] font-bold uppercase";
      }
      if (noteEl) noteEl.textContent = bank.note;
    }
  } else {
    if (typePill) {
      typePill.textContent = "Custom APR";
      typePill.className = "px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold uppercase";
    }
    if (noteEl) noteEl.textContent = "Enter any custom annual interest / markup percentage below.";
  }

  calculateFinancing();
  renderPakistanBanksGrid();
}

function renderPakistanBanksGrid() {
  const grid = document.getElementById("pakistan-banks-grid");
  if (!grid) return;
  const activeId = document.getElementById("calc-bank-select")?.value || "hbl";

  grid.innerHTML = PAKISTAN_BANK_FINANCE_RATES.map(bank => {
    const isSelected = bank.id === activeId;
    return `
      <div class="glass-card p-5 rounded-2xl border ${isSelected ? 'border-amber-500/70 bg-amber-500/5' : 'border-slate-800'} flex flex-col justify-between space-y-4">
        <div class="space-y-2">
          <div class="flex items-center justify-between gap-2">
            <span class="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-bold uppercase">${escapeHtml(bank.type)}</span>
            ${isSelected ? `<span class="text-[10px] font-black text-amber-400 uppercase">Selected</span>` : ''}
          </div>
          <h4 class="text-sm font-extrabold text-white">${escapeHtml(bank.name)}</h4>
          <div class="text-base font-black ${bank.apr !== null ? 'text-emerald-400' : 'text-sky-400'}">${escapeHtml(bank.rateLabel)}</div>
          <p class="text-[11px] text-slate-400 leading-relaxed">${escapeHtml(bank.note)}</p>
        </div>

        <div class="space-y-2 pt-2 border-t border-slate-800/80">
          <button type="button" onclick="selectBankForFinancing('${bank.id}')" class="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors">
            ${bank.apr !== null ? 'Apply Rate in Calculator' : 'Check in Calculator'}
          </button>
          <a href="${bank.url}" target="_blank" rel="noopener noreferrer" class="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-sky-300 font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors">
            <span>Official Bank Calculator</span>
            <i data-lucide="external-link" class="w-3 h-3"></i>
          </a>
        </div>
      </div>
    `;
  }).join("");

  lucide.createIcons();
}

function formatFinancingAmount(amount) {
  const cur = CURRENCIES[appState.currentCurrency] || CURRENCIES.USD;
  const val = Math.max(0, Math.round(Number(amount) || 0));
  return `${cur.symbol}${formatNumber(val)}`;
}

function syncFinancingSliderInput(field, val) {
  const clamped = Math.max(0, Math.min(50000000, Number(val) || 0));
  const numInput = document.getElementById(field === 'price' ? 'calc-price-input' : 'calc-down-input');
  if (numInput) numInput.value = clamped;
  calculateFinancing();
}

function syncFinancingNumberInput(field, val) {
  const num = parseFloat(val);
  const clamped = isNaN(num) ? 0 : Math.max(0, Math.min(50000000, num));
  const slider = document.getElementById(field === 'price' ? 'calc-price' : 'calc-down');
  if (slider) slider.value = clamped;
  calculateFinancing();
}

function calculateFinancing() {
  const rawPrice = parseFloat(document.getElementById("calc-price")?.value ?? 5000000);
  const price = isNaN(rawPrice) ? 0 : Math.max(0, Math.min(50000000, rawPrice));
  const rawDown = parseFloat(document.getElementById("calc-down")?.value ?? 1500000);
  const down = isNaN(rawDown) ? 0 : Math.max(0, Math.min(50000000, rawDown));
  const term = parseInt(document.getElementById("calc-term")?.value || 60, 10);
  const bankId = document.getElementById("calc-bank-select")?.value || "hbl";
  const bank = PAKISTAN_BANK_FINANCE_RATES.find(b => b.id === bankId);

  const aprRaw = document.getElementById("calc-apr")?.value;
  const parsedApr = parseFloat(aprRaw);
  const rateUnavailable = (!aprRaw || isNaN(parsedApr) || parsedApr <= 0);
  const annualApr = rateUnavailable ? 0 : parsedApr;
  const monthlyRate = annualApr / 100 / 12;

  const displayPrice = document.getElementById("calc-price-display");
  const displayDown = document.getElementById("calc-down-display");
  if (displayPrice) displayPrice.textContent = formatFinancingAmount(price);
  if (displayDown) displayDown.textContent = formatFinancingAmount(down);

  const fallbackBox = document.getElementById("bank-fallback-link-box");
  const fallbackTitle = document.getElementById("bank-fallback-title");
  const fallbackDesc = document.getElementById("bank-fallback-desc");
  const fallbackAnchor = document.getElementById("bank-fallback-anchor");

  if (fallbackBox) {
    if (rateUnavailable && bank) {
      fallbackBox.classList.remove("hidden");
      if (fallbackTitle) fallbackTitle.textContent = `${bank.name} Rate Not Listed Statically`;
      if (fallbackDesc) fallbackDesc.textContent = `Open ${bank.fullName}'s official car finance calculator directly to view live rates and exact installment schedules.`;
      if (fallbackAnchor) fallbackAnchor.href = bank.url;
    } else if (rateUnavailable) {
      fallbackBox.classList.remove("hidden");
      if (fallbackTitle) fallbackTitle.textContent = "No Markup Rate Entered";
      if (fallbackDesc) fallbackDesc.textContent = "Pick any bank above or enter an annual markup % to calculate monthly installments.";
      if (fallbackAnchor) fallbackAnchor.href = "https://www.hbl.com/personal/loans/hbl-car-loan";
    } else {
      fallbackBox.classList.add("hidden");
    }
  }

  const principal = Math.max(0, price - down);
  let monthly = 0;
  if (principal > 0) {
    monthly = monthlyRate > 0
      ? (principal * monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1)
      : principal / term;
  }

  const totalCost = monthly * term;
  const totalInterest = Math.max(0, totalCost - principal);

  const elMonthly = document.getElementById("calc-monthly-payment");
  const elFinanced = document.getElementById("calc-financed-amount");
  const elInterest = document.getElementById("calc-total-interest");
  const elCost = document.getElementById("calc-total-cost");
  const elBankName = document.getElementById("calc-summary-bank-name");
  const elSummaryRate = document.getElementById("calc-summary-rate");
  const elSummaryLink = document.getElementById("calc-summary-bank-link");
  const elSummaryLinkLabel = document.getElementById("calc-summary-bank-link-label");

  if (elMonthly) elMonthly.innerHTML = rateUnavailable && bank
    ? `<span class="text-2xl text-sky-400">See Bank Portal</span>`
    : `${formatFinancingAmount(Math.round(monthly))} <span class="text-xs text-slate-400 font-normal">/ month</span>`;
  if (elFinanced) elFinanced.textContent = formatFinancingAmount(principal);
  if (elInterest) elInterest.textContent = rateUnavailable && bank ? "Variable" : formatFinancingAmount(Math.round(totalInterest));
  if (elCost) elCost.textContent = rateUnavailable && bank ? "See Bank Calculator" : formatFinancingAmount(Math.round(totalCost));
  if (elBankName) elBankName.textContent = bank ? bank.name : "Custom Rate";
  if (elSummaryRate) elSummaryRate.textContent = rateUnavailable ? "Not Set (See Bank Link)" : `${annualApr.toFixed(2)}% p.a.`;

  if (elSummaryLink && elSummaryLinkLabel) {
    if (bank) {
      elSummaryLink.href = bank.url;
      elSummaryLink.classList.remove("hidden");
      elSummaryLinkLabel.textContent = `Open ${bank.name} Car Calculator`;
    } else {
      elSummaryLink.href = PAKISTAN_BANK_FINANCE_RATES[0].url;
      elSummaryLinkLabel.textContent = "Browse Pakistan Bank Calculators";
    }
  }
}

function handlePreApprovalSubmit(e) {
  e.preventDefault();
  const name = document.getElementById("loan-name").value;
  showToast("Pre-Approval Submitted", `Thank you ${name}. Soft credit evaluation completed. Approved at competitive rates!`, "success");
}

function handleContactSupportSubmit(e) {
  e.preventDefault();
  const name = document.getElementById("contact-name").value;
  showToast("Message Sent", `Thank you ${name}. Desi Hood Cars team has received your message and will respond shortly.`, "success");
  e.target.reset();
}

// ==========================================
// LISTING MODAL & CRUD (WITH CURRENCY SELECTION)
// ==========================================
function openOldCarListingModal() {
  openListingModal(null, true);
}

function syncMilesFromKm() {
  const kmEl = document.getElementById("form-kilometers");
  const miEl = document.getElementById("form-mileage");
  if (!kmEl || !miEl) return;
  const km = parseInt(kmEl.value || 0);
  if (!isNaN(km) && km >= 0) {
    miEl.value = Math.round(km * 0.621371);
  }
}

function toggleOldCarFormSection() {
  const cond = document.getElementById("form-condition")?.value || '';
  const box = document.getElementById("old-car-working-fields");
  if (!box) return;
  if (cond === 'Old Car' || cond === 'Used') {
    box.classList.remove("opacity-75");
  } else {
    box.classList.add("opacity-75");
  }
}

function openListingModal(carId = null, presetOldCar = false) {
  const activeDealer = getActiveDealer();
  if (!activeDealer) {
    showToast("No Dealership Selected", "Register or approve an active dealership first.", "error");
    return;
  }
  if (activeDealer.banned) {
    showToast("Dealership Banned", "This dealership is banned by the Owner and cannot list vehicles.", "error");
    return;
  }
  const form = document.getElementById("car-listing-form");
  const title = document.getElementById("listing-modal-title");
  form.reset();

  const curSelect = document.getElementById("form-currency");
  if (curSelect) curSelect.value = appState.currentCurrency;

  if (carId) {
    const car = appState.cars.find(c => c.id === carId);
    if (car) {
      title.textContent = `Edit Listing: ${car.make} ${car.model}`;
      document.getElementById("form-car-id").value = car.id;
      document.getElementById("form-make").value = car.make;
      document.getElementById("form-model").value = car.model;
      document.getElementById("form-year").value = car.year;
      document.getElementById("form-price").value = car.price;
      document.getElementById("form-mileage").value = car.mileage;
      if (document.getElementById("form-kilometers")) document.getElementById("form-kilometers").value = getCarKilometers(car);
      if (document.getElementById("form-color") && car.color) document.getElementById("form-color").value = car.color;
      document.getElementById("form-body-style").value = car.bodyStyle;
      document.getElementById("form-fuel-type").value = car.fuelType;
      document.getElementById("form-transmission").value = car.transmission;
      document.getElementById("form-condition").value = car.condition;
      document.getElementById("form-image").value = car.image;
      document.getElementById("form-description").value = car.description;
      if (car.workingDetails) {
        if (document.getElementById("form-working-score")) document.getElementById("form-working-score").value = car.workingDetails.score || "90% Excellent Working";
        if (document.getElementById("form-working-engine")) document.getElementById("form-working-engine").value = car.workingDetails.engine || "";
        if (document.getElementById("form-working-body")) document.getElementById("form-working-body").value = car.workingDetails.body || "";
        if (document.getElementById("form-working-ac")) document.getElementById("form-working-ac").value = car.workingDetails.ac || "";
        if (document.getElementById("form-working-suspension")) document.getElementById("form-working-suspension").value = car.workingDetails.suspension || "";
        if (document.getElementById("form-working-owners")) document.getElementById("form-working-owners").value = car.workingDetails.owners || "";
        if (document.getElementById("form-working-notes")) document.getElementById("form-working-notes").value = car.workingDetails.notes || "";
      }
    }
  } else {
    title.textContent = presetOldCar ? "List Old Car (KM & Working Details)" : "Create New Vehicle Listing";
    document.getElementById("form-car-id").value = "";
    if (presetOldCar) {
      document.getElementById("form-condition").value = "Old Car";
      document.getElementById("form-year").value = "2018";
      if (document.getElementById("form-kilometers")) {
        document.getElementById("form-kilometers").value = "85000";
        syncMilesFromKm();
      }
    }
    insertSampleImage();
  }

  toggleOldCarFormSection();
  openModal("modal-listing");
  lucide.createIcons();
}

function insertSampleImage() {
  const random = SAMPLE_CAR_IMAGES[Math.floor(Math.random() * SAMPLE_CAR_IMAGES.length)];
  document.getElementById("form-image").value = random;
}

function handleListingSubmit(e) {
  e.preventDefault();
  const id = document.getElementById("form-car-id").value;
  const activeDealer = getActiveDealer();

  const inputPrice = parseFloat(document.getElementById("form-price").value);
  const inputCurrency = document.getElementById("form-currency") ? document.getElementById("form-currency").value : 'USD';
  
  // Normalize price to base USD
  const rate = CURRENCIES[inputCurrency]?.rate || 1.0;
  const baseUsdPrice = Math.round(inputPrice / rate);

  const kmRaw = parseInt(document.getElementById("form-kilometers")?.value || 0);
  const milesRaw = parseInt(document.getElementById("form-mileage")?.value || 0);
  const kilometers = kmRaw > 0 ? kmRaw : Math.round(milesRaw * 1.60934);
  const mileage = milesRaw > 0 ? milesRaw : Math.round(kilometers * 0.621371);
  const condition = document.getElementById("form-condition").value;
  const color = document.getElementById("form-color")?.value || "Obsidian Black";
  const isOldCar = condition === 'Old Car' || condition === 'Used';

  const workingDetails = {
    score: document.getElementById("form-working-score")?.value || "90% Excellent Working",
    engine: document.getElementById("form-working-engine")?.value.trim() || "10/10 Sealed Engine",
    body: document.getElementById("form-working-body")?.value.trim() || "Clean Body & Paint",
    ac: document.getElementById("form-working-ac")?.value.trim() || "Chilled AC & Electronics Working",
    suspension: document.getElementById("form-working-suspension")?.value.trim() || "Smooth Suspension & Good Tyres",
    owners: document.getElementById("form-working-owners")?.value.trim() || "Original File & Documents",
    notes: document.getElementById("form-working-notes")?.value.trim() || ""
  };

  const carData = {
    id: id || "car-" + Date.now(),
    dealerId: activeDealer.id,
    country: activeDealer.country || (appState.currentCountry !== 'ALL' ? appState.currentCountry : 'US'),
    make: document.getElementById("form-make").value.trim(),
    model: document.getElementById("form-model").value.trim(),
    year: parseInt(document.getElementById("form-year").value),
    price: baseUsdPrice,
    mileage: mileage,
    kilometers: kilometers,
    color: color,
    isOldCar: isOldCar,
    workingDetails: workingDetails,
    bodyStyle: document.getElementById("form-body-style").value,
    fuelType: document.getElementById("form-fuel-type").value,
    transmission: document.getElementById("form-transmission").value,
    condition: condition,
    image: document.getElementById("form-image").value.trim(),
    description: document.getElementById("form-description").value.trim() || "Quality inspected by certified specialists.",
    status: "active",
    featured: true,
    createdAt: new Date().toISOString()
  };

  if (id) {
    const idx = appState.cars.findIndex(c => c.id === id);
    if (idx !== -1) appState.cars[idx] = { ...appState.cars[idx], ...carData };
    showToast("Listing Updated", `${carData.make} ${carData.model} updated successfully.`, "success");
  } else {
    appState.cars.unshift(carData);
    showToast("Vehicle Listed!", `${carData.make} ${carData.model} (${color}) is now live on Desi Hood Cars.`, "success");
  }

  saveAllState();
  closeModal("modal-listing");
  renderMarketplace();
  renderOldCarsSection();
  renderDealerPortal();
  if (typeof sbUpsertRecord === "function" && typeof mapCarToRow === "function") {
    const savedCar = appState.cars.find(c => c.id === carData.id) || carData;
    sbUpsertRecord("cars", mapCarToRow(savedCar));
  }
}

function deleteCarListing(carId) {
  if (confirm("Are you sure you want to permanently remove this vehicle listing?")) {
    appState.cars = appState.cars.filter(c => c.id !== carId);
    saveAllState();
    if (typeof sbDeleteRecord === "function") sbDeleteRecord("cars", carId);
    showToast("Listing Deleted", "Vehicle removed from inventory.", "info");
    renderDealerPortal();
    renderMarketplace();
  }
}

// ==========================================
// INQUIRY FORM
// ==========================================
function openInquiryModal(carId, type = 'Check Availability') {
  const car = appState.cars.find(c => c.id === carId);
  if (!car) return;
  const dealer = getDealerById(car.dealerId);

  document.getElementById("inquiry-car-id").value = car.id;
  document.getElementById("inquiry-dealer-id").value = dealer.id;
  document.getElementById("inquiry-vehicle-summary").textContent = `Re: ${car.year} ${car.make} ${car.model} (${formatCurrency(car.price)}) &bull; Dealer: ${dealer.name}`;
  document.getElementById("inquiry-type").value = type;

  const currentBuyer = getCurrentBuyer();
  if (currentBuyer) {
    const nameIn = document.getElementById("inquiry-name");
    const emailIn = document.getElementById("inquiry-email");
    const phoneIn = document.getElementById("inquiry-phone");
    if (nameIn && !nameIn.value) nameIn.value = currentBuyer.fullName;
    if (emailIn && !emailIn.value) emailIn.value = currentBuyer.email;
    if (phoneIn && !phoneIn.value) phoneIn.value = currentBuyer.phone;
  }

  openModal("modal-contact-dealer");
}

function handleInquirySubmit(e) {
  e.preventDefault();
  const carId = document.getElementById("inquiry-car-id").value;
  const dealerId = document.getElementById("inquiry-dealer-id").value;
  const car = appState.cars.find(c => c.id === carId);

  const newInq = {
    id: "inq-" + Date.now(),
    carId: carId,
    dealerId: dealerId,
    carName: car ? `${car.year} ${car.make} ${car.model}` : "Vehicle",
    customerName: document.getElementById("inquiry-name").value.trim(),
    customerEmail: document.getElementById("inquiry-email").value.trim(),
    customerPhone: document.getElementById("inquiry-phone").value.trim(),
    type: document.getElementById("inquiry-type").value,
    message: document.getElementById("inquiry-message").value.trim() || "Inquiring about this car.",
    status: "New",
    createdAt: new Date().toISOString()
  };

  appState.inquiries.unshift(newInq);
  saveAllState();
  if (typeof sbUpsertRecord === "function" && typeof mapInquiryToRow === "function") {
    sbUpsertRecord("inquiries", mapInquiryToRow(newInq));
  }
  closeModal("modal-contact-dealer");
  showToast("Inquiry Transmitted!", "The dealership has received your message and will contact you promptly.", "success");
  renderDealerPortal();
}

// ==========================================
// FAVORITES WATCHLIST
// ==========================================
function toggleFavorite(carId, event) {
  if (event) event.stopPropagation();
  const idx = appState.favorites.indexOf(carId);
  if (idx === -1) {
    appState.favorites.push(carId);
    showToast("Saved to Favorites", "Added to your watchlist", "info");
  } else {
    appState.favorites.splice(idx, 1);
    showToast("Removed from Favorites", "Removed from watchlist", "info");
  }

  saveAllState();
  updateFavoritesCount();
  renderMarketplace();
}

function updateFavoritesCount() {
  const count = document.getElementById("saved-favorites-count");
  if (count) count.textContent = appState.favorites.length;
}

function openFavoritesModal() {
  const container = document.getElementById("favorites-list");
  const favCars = appState.cars.filter(c => appState.favorites.includes(c.id));

  if (favCars.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12 text-slate-400">
        <i data-lucide="heart" class="w-10 h-10 mx-auto mb-2 text-slate-600"></i>
        <p class="text-sm">You haven't saved any vehicles yet.</p>
        <p class="text-xs text-slate-500 mt-1">Click the heart icon on any car card to save it for later.</p>
      </div>
    `;
  } else {
    container.innerHTML = favCars.map(car => `
      <div class="flex items-center justify-between p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
        <div class="flex items-center space-x-3.5 cursor-pointer" onclick="closeModal('modal-favorites'); openCarDetailModal('${car.id}')">
          <img src="${car.image}" class="w-16 h-12 rounded-xl object-cover border border-slate-800">
          <div>
            <h4 class="text-sm font-bold text-white hover:text-amber-400 transition-colors">${car.year} ${car.make} ${car.model}</h4>
            <span class="text-xs font-bold text-amber-400">${formatCurrency(car.price)}</span>
            <span class="text-[11px] text-slate-500 ml-2">${formatNumber(car.mileage)} mi</span>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <button onclick="closeModal('modal-favorites'); openInquiryModal('${car.id}')" class="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs">
            Contact
          </button>
          <button onclick="toggleFavorite('${car.id}')" class="p-1.5 text-slate-400 hover:text-rose-500 transition-colors">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      </div>
    `).join("");
  }

  openModal("modal-favorites");
  lucide.createIcons();
}

// ==========================================
// MODAL & TOAST HELPERS
// ==========================================
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("active");
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove("active");
}

function showToast(title, message, type = 'info') {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  const borderClass = type === 'success' ? 'border-amber-500/60 bg-slate-900/95 text-amber-300' :
                      type === 'error' ? 'border-rose-500/60 bg-slate-900/95 text-rose-300' :
                      'border-amber-500/50 bg-slate-900/95 text-amber-300';

  const iconName = type === 'success' ? 'check-circle' : type === 'error' ? 'alert-triangle' : 'info';

  toast.className = `p-4 rounded-2xl border shadow-2xl backdrop-blur-md flex items-start space-x-3 max-w-sm pointer-events-auto transform transition-all duration-300 ease-out translate-y-2 opacity-0 ${borderClass}`;
  toast.innerHTML = `
    <i data-lucide="${iconName}" class="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-400"></i>
    <div class="flex-grow">
      <h5 class="text-xs font-bold text-white uppercase tracking-wider">${title}</h5>
      <p class="text-xs text-slate-300 mt-0.5 leading-snug">${message}</p>
    </div>
  `;

  container.appendChild(toast);
  lucide.createIcons();

  setTimeout(() => toast.classList.remove("translate-y-2", "opacity-0"), 10);
  setTimeout(() => {
    toast.classList.add("opacity-0", "translate-y-2");
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function resetAllDemoData() {
  if (confirm("Reset all vehicles, spare parts, dealers, and inquiries back to original demo values?")) {
    localStorage.clear();
    sessionStorage.removeItem('desihood_owner_auth');
    initTheme();
    initCurrency();
    initStorage();
    populateDealerDropdown();
    renderMarketplace();
    renderDealersDirectory();
    renderSpareParts();
    renderBlogs();
    renderBuyerAccountView();
    renderDealerPortal();
    renderOwnerConsole();
    updateBuyerNavLabel();
    updateOwnerNavVisibility();
    updateOwnerPendingBadge();
    updateFavoritesCount();
    updateMarketStatusBar();
    showToast("Demo Data Restored", "All vehicles, spare parts, dealers, and test leads reset.", "success");
  }
}

// ==========================================
// FEATURES SLIDESHOW ENGINE
// ==========================================
let currentSlideIndex = 0;
let autoSlideInterval = null;

function goToSlide(index) {
  const slides = document.querySelectorAll("#features-slideshow .feature-slide");
  const dots = document.querySelectorAll("#slide-dots .slide-dot");
  if (!slides.length) return;

  currentSlideIndex = ((index % slides.length) + slides.length) % slides.length;

  slides.forEach((slide, i) => {
    slide.classList.toggle("active-slide", i === currentSlideIndex);
  });
  dots.forEach((dot, i) => {
    if (i === currentSlideIndex) {
      dot.className = "slide-dot active-dot w-2.5 h-2.5 rounded-full bg-amber-500 transition-all";
    } else {
      dot.className = "slide-dot w-2 h-2 rounded-full bg-slate-600 hover:bg-slate-400 transition-all";
    }
  });
}

function nextSlide() {
  goToSlide(currentSlideIndex + 1);
}

function prevSlide() {
  goToSlide(currentSlideIndex - 1);
}

function toggleAutoSlide() {
  const label = document.getElementById("autoplay-label");
  if (autoSlideInterval) {
    clearInterval(autoSlideInterval);
    autoSlideInterval = null;
    if (label) label.textContent = "Auto";
  } else {
    nextSlide();
    autoSlideInterval = setInterval(nextSlide, 4500);
    if (label) label.textContent = "Playing";
  }
}

// ==========================================
// GALLERY LIGHTBOX MODAL
// ==========================================
function openGalleryLightbox(imgSrc, title, desc) {
  const img = document.getElementById("lightbox-img");
  const titleEl = document.getElementById("lightbox-title");
  const descEl = document.getElementById("lightbox-desc");
  if (img) img.src = imgSrc;
  if (titleEl) titleEl.textContent = title || "";
  if (descEl) descEl.textContent = desc || "";
  openModal("modal-gallery-lightbox");
  lucide.createIcons();
}

function closeGalleryLightbox() {
  closeModal("modal-gallery-lightbox");
}

// ==========================================
// AUTOMOTIVE NEWSROOM RSS & BLOGS ENGINE
// ==========================================
function pickAutoNewsCoverImage(title = '', brandId = '', idx = 0) {
  const t = `${brandId} ${title}`.toLowerCase();
  if (/toyota|camry|corolla|hilux|land cruiser|fortuner|yaris/.test(t)) return 'https://images.unsplash.com/photo-1581540222194-0def2dda95b8?auto=format&fit=crop&w=1200&q=80';
  if (/honda|civic|city|hr-v|cr-v|br-v/.test(t)) return 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=1200&q=80';
  if (/suzuki|swift|alto|cultus|wagon|jimny|vitara/.test(t)) return 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=1200&q=80';
  if (/kia|sportage|picanto|stonic|sorento|ev3|ev6|ev9/.test(t)) return 'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=1200&q=80';
  if (/hyundai|tucson|elantra|sonata|santa fe|ioniq|porter/.test(t)) return 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1200&q=80';
  if (/mg|hs|zs|ev|electric|tesla|byd|battery/.test(t)) return 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80';
  if (/changan|alsvin|oshan|deepal|proton|saga|x70|x50/.test(t)) return 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1200&q=80';
  if (/nissan|daihatsu|mitsubishi|pajero|outlander|mira/.test(t)) return 'https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=1200&q=80';
  const fallbacks = ['gallery/car-theme-hero.jpg', 'gallery/gallery-1.jpg', 'gallery/gallery-2.jpg', 'gallery/gallery-3.jpg'];
  return fallbacks[idx % fallbacks.length];
}

function getDeletedBlogIds() {
  try {
    return new Set(JSON.parse(localStorage.getItem('desihood_deleted_blog_ids') || '[]'));
  } catch (e) {
    return new Set();
  }
}

let newsroomState = {
  syncedAt: null,
  isSyncing: false,
  activeBrand: 'all',
  channels: [],
  stories: []
};

function extractBlogSourceUrl(blog) {
  if (!blog) return '';
  if (blog.sourceUrl) return blog.sourceUrl;
  const text = `${blog.content || ''} ${blog.excerpt || ''}`;
  const match = text.match(/https?:\/\/[^\s"'<>]+/i);
  return match ? match[0] : '';
}

function buildBlogShareText(blog) {
  const sourceUrl = extractBlogSourceUrl(blog);
  const siteUrl = `${window.location.origin}${window.location.pathname}#view-blogs`;
  const parts = [
    `${blog.title} — Desi Hood Cars`,
    blog.excerpt || '',
    sourceUrl ? `Official Source: ${sourceUrl}` : '',
    `Read & Share: ${siteUrl}`
  ].filter(Boolean);
  return {
    title: blog.title,
    text: parts.join('\n\n'),
    url: sourceUrl || siteUrl
  };
}

async function copyShareText(text, label = 'Update link') {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    showToast('Ready to Share!', `${label} copied to clipboard.`, 'success');
  } catch (err) {
    showToast('Copy Complete', 'Share text prepared for pasting.', 'info');
  }
}

async function shareBlogPost(blogId) {
  const blog = (appState.blogs || []).find(b => b.id === blogId);
  if (!blog) return;
  const payload = buildBlogSharePayload(blog);
  if (navigator.share) {
    try {
      await navigator.share({
        title: payload.title,
        text: payload.text,
        url: payload.url
      });
      return;
    } catch (err) {
      if (err?.name === 'AbortError') return;
    }
  }
  await copyShareText(payload.text, `"${blog.title}"`);
}

function buildBlogSharePayload(blog) {
  return buildBlogShareText(blog);
}

function shareBlogToWhatsApp(blogId) {
  const blog = (appState.blogs || []).find(b => b.id === blogId);
  if (!blog) return;
  const payload = buildBlogShareText(blog);
  window.open(`https://wa.me/?text=${encodeURIComponent(payload.text)}`, '_blank', 'noopener,noreferrer');
}

function shareBlogToX(blogId) {
  const blog = (appState.blogs || []).find(b => b.id === blogId);
  if (!blog) return;
  const payload = buildBlogShareText(blog);
  window.open(
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(payload.url)}`,
    '_blank',
    'noopener,noreferrer'
  );
}

function shareBlogToFacebook(blogId) {
  const blog = (appState.blogs || []).find(b => b.id === blogId);
  if (!blog) return;
  const payload = buildBlogShareText(blog);
  window.open(
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(payload.url)}`,
    '_blank',
    'noopener,noreferrer'
  );
}

async function shareAllAutoUpdates() {
  const pageUrl = `${window.location.origin}${window.location.pathname}`;
  const topStories = (newsroomState.stories || []).slice(0, 5);
  const summaryLines = topStories.length
    ? topStories.map(s => `• [${s.brand}] ${s.title}`).join('\n')
    : 'Live RSS news updates for Toyota, Suzuki, Honda, Kia, Hyundai, Daihatsu, Nissan, Mitsubishi, Changan, Proton & MG Pakistan.';
  const fullText = `Desi Hood Cars Live Car Newsroom:\n\n${summaryLines}\n\nRead & Share: ${pageUrl}`;
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Desi Hood Cars — Live Car Newsroom',
        text: fullText,
        url: pageUrl
      });
      return;
    } catch (err) {
      if (err?.name === 'AbortError') return;
    }
  }
  await copyShareText(fullText, 'Live Newsroom updates');
}

async function fetchPlatformApi(vercelUrl, netlifyUrl) {
  let res = await fetch(vercelUrl, { headers: { Accept: 'application/json' } });
  if (!res.ok && netlifyUrl) {
    res = await fetch(netlifyUrl, { headers: { Accept: 'application/json' } });
  }
  return res;
}

async function syncBrandAutoUpdates(manualTrigger = false) {
  if (newsroomState.isSyncing) return;
  newsroomState.isSyncing = true;

  const statusEl = document.getElementById('newsroom-sync-status');
  const syncBtn = document.getElementById('btn-sync-auto-news');
  if (statusEl) statusEl.textContent = 'Syncing Google Auto News...';
  if (syncBtn) syncBtn.disabled = true;

  try {
    const res = await fetchPlatformApi('/api/auto-news', '/.netlify/functions/auto-news');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const channels = Array.isArray(data?.channels) ? data.channels : [];
    const stories = Array.isArray(data?.stories) ? data.stories : [];
    const syncDate = (data?.fetchedAt || new Date().toISOString()).split('T')[0];

    newsroomState.syncedAt = data?.fetchedAt || new Date().toISOString();
    newsroomState.channels = channels;
    newsroomState.stories = stories;

    let addedCount = 0;
    if (stories.length) {
      const deletedIds = getDeletedBlogIds();
      const nonNewsBlogs = (appState.blogs || []).filter(b => {
        const id = String(b.id || '');
        return !id.startsWith('blog-news-') && !id.startsWith('gnews-');
      });
      const existingById = new Map(nonNewsBlogs.map(b => [b.id, b]));
      const newlyUploaded = [];

      // Keep top 24 newest RSS stories uploaded into Car News & Blogs
      stories.slice(0, 24).forEach((item, idx) => {
        const rssBlogId = `rss-${item.id}`;
        if (deletedIds.has(rssBlogId)) return;

        const relatedLines = (item.relatedHeadlines || []).map(h => `• ${h}`).join('\n');
        const contentBody = [
          `Brand Beat: ${item.brand} | Publisher: ${item.sourceName || 'Google News'}`,
          relatedLines ? `Related Coverage:\n${relatedLines}` : '',
          `Original News Link: ${item.link}`
        ].filter(Boolean).join('\n\n');

        const excerptText = (item.relatedHeadlines && item.relatedHeadlines[0])
          ? `${item.brand} News (${item.sourceName}): ${item.relatedHeadlines[0]}`
          : `Latest ${item.brand} news update covered by ${item.sourceName || 'Google News'}.`;

        if (!existingById.has(rssBlogId)) {
          addedCount++;
          newlyUploaded.push({
            id: rssBlogId,
            title: item.title,
            category: 'Auto News & Updates',
            author: item.sourceName || `${item.brand} News`,
            carTag: item.brand,
            sourceUrl: item.link,
            readTime: 'Live RSS',
            publishedDate: item.publishedDate || syncDate,
            image: pickAutoNewsCoverImage(item.title, item.brandId, idx),
            excerpt: excerptText,
            content: contentBody,
            liveHeadlines: item.relatedHeadlines || [],
            liveSyncedAt: newsroomState.syncedAt
          });
        } else {
          const existing = existingById.get(rssBlogId);
          existing.liveSyncedAt = newsroomState.syncedAt;
          existing.sourceUrl = item.link;
        }
      });

      const retainedBlogs = nonNewsBlogs.filter(b => !String(b.id || '').startsWith('rss-'));
      const currentRssBlogs = nonNewsBlogs.filter(b => String(b.id || '').startsWith('rss-'));
      const mergedRss = [...newlyUploaded, ...currentRssBlogs].slice(0, 24);
      appState.blogs = [...mergedRss, ...retainedBlogs];
    }

    const okChannels = channels.filter(c => c.ok).length;
    if (statusEl) {
      const timeLabel = new Date(newsroomState.syncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      statusEl.textContent = `${stories.length} Stories (${okChannels}/${channels.length} Feeds) • ${timeLabel}`;
    }

    saveAllState();
    renderBlogs();
    if (manualTrigger) {
      showToast('Newsroom Updated', `Synced ${stories.length} latest car news stories across ${okChannels} RSS feeds (${addedCount} new).`, 'success');
    }
  } catch (err) {
    if (statusEl) statusEl.textContent = 'RSS Sync Retry Needed';
    renderNewsroom();
    if (manualTrigger) {
      showToast('RSS Unavailable', 'Could not reach live RSS feeds right now. Try Refresh Newsroom in a moment.', 'warning');
    }
  } finally {
    newsroomState.isSyncing = false;
    if (syncBtn) syncBtn.disabled = false;
  }
}

function filterNewsroomByBrand(brandId, btnEl) {
  newsroomState.activeBrand = brandId;
  document.querySelectorAll('.newsroom-brand-btn').forEach(btn => {
    btn.className = 'newsroom-brand-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700 transition-colors';
  });
  if (btnEl) {
    btnEl.className = 'newsroom-brand-btn px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 text-slate-950 transition-colors';
  }
  renderNewsroom();
}

function renderNewsroom() {
  const grid = document.getElementById('newsroom-grid');
  if (!grid) return;

  const brandFilter = newsroomState.activeBrand || 'all';
  const filtered = (newsroomState.stories || []).filter(s => brandFilter === 'all' || s.brandId === brandFilter);

  if (!newsroomState.stories.length) {
    grid.innerHTML = `
      <div class="col-span-full p-5 rounded-2xl bg-slate-900/75 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p class="text-xs text-slate-300">${newsroomState.isSyncing ? 'Fetching live car news from Toyota, Suzuki, Honda, Kia, Hyundai, Daihatsu, Nissan, Mitsubishi, Changan, Proton & MG RSS...' : 'Click Refresh Newsroom to fetch the latest breaking car news from all RSS feeds.'}</p>
        <button onclick="syncBrandAutoUpdates(true)" class="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold shrink-0">
          Refresh Newsroom
        </button>
      </div>
    `;
    return;
  }

  if (!filtered.length) {
    grid.innerHTML = `
      <div class="col-span-full p-5 rounded-2xl bg-slate-900/75 border border-slate-800 text-center text-xs text-slate-400">
        No recent RSS stories matched this brand filter yet. Try "All Brands" or click Refresh Newsroom.
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.slice(0, 12).map(item => {
    const blogId = `rss-${item.id}`;
    return `
      <div class="rounded-2xl bg-slate-900/85 border border-slate-800 hover:border-emerald-500/40 p-4 flex flex-col justify-between transition-colors">
        <div>
          <div class="flex items-center justify-between gap-2 mb-2">
            <div class="flex items-center gap-1.5 min-w-0">
              <span class="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-extrabold uppercase shrink-0">
                ${escapeHtml(item.brand)}
              </span>
              <span class="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold truncate">
                ${escapeHtml(item.sourceName || 'News')}
              </span>
            </div>
            <span class="text-[10px] text-slate-400 shrink-0">${escapeHtml(item.publishedDate || '')}</span>
          </div>

          <h4 onclick="openBlogDetailModal('${blogId}')" class="text-xs sm:text-sm font-extrabold text-white hover:text-amber-400 cursor-pointer leading-snug line-clamp-2">
            ${escapeHtml(item.title)}
          </h4>

          ${(item.relatedHeadlines && item.relatedHeadlines.length) ? `
            <p class="text-[11px] text-slate-400 mt-1.5 line-clamp-1">
              ${escapeHtml(item.relatedHeadlines[0])}
            </p>
          ` : ''}
        </div>

        <div class="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center gap-1.5">
          <button onclick="openBlogDetailModal('${blogId}')" class="flex-1 px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/30 text-[11px] font-bold transition-colors">
            Read &amp; Share
          </button>
          <a href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer" class="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-sky-400 border border-slate-700 text-[11px] font-bold inline-flex items-center space-x-1">
            <span>Story</span>
            <i data-lucide="external-link" class="w-3 h-3"></i>
          </a>
          <button onclick="shareBlogToWhatsApp('${blogId}')" title="Share on WhatsApp" class="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/30 transition-colors">
            <i data-lucide="message-circle" class="w-3.5 h-3.5"></i>
          </button>
          <button onclick="shareBlogPost('${blogId}')" title="Share / Copy" class="p-1.5 rounded-lg bg-slate-800 hover:bg-sky-500 text-slate-300 hover:text-slate-950 border border-slate-700 transition-colors">
            <i data-lucide="share-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
  lucide.createIcons();
}

function filterBlogsByCategory(category, btnEl) {
  appState.activeBlogCategory = category;

  document.querySelectorAll(".blog-cat-btn").forEach(btn => {
    btn.className = "blog-cat-btn px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700 transition-colors";
  });
  if (btnEl) {
    btnEl.className = "blog-cat-btn px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-slate-950 transition-colors";
  }

  renderBlogs();
}

function renderBlogs() {
  renderNewsroom();

  const lastSyncMs = newsroomState.syncedAt ? new Date(newsroomState.syncedAt).getTime() : 0;
  const isStale = !lastSyncMs || (Date.now() - lastSyncMs > 3 * 60 * 1000);
  if (isStale && !newsroomState.isSyncing && document.getElementById('view-blogs') && !document.getElementById('view-blogs').classList.contains('hidden')) {
    syncBrandAutoUpdates(false);
  }

  const container = document.getElementById("blogs-grid");
  if (!container) return;

  const keyword = (document.getElementById("blogs-keyword-search")?.value || '').toLowerCase().trim();
  const category = appState.activeBlogCategory || 'all';

  const filtered = (appState.blogs || []).filter(blog => {
    if (category !== 'all' && blog.category !== category) return false;
    if (keyword) {
      const hay = `${blog.title} ${blog.category} ${blog.author} ${blog.carTag || ''} ${blog.excerpt} ${blog.content}`.toLowerCase();
      if (!hay.includes(keyword)) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-12 text-center text-slate-400 glass-panel rounded-2xl border border-slate-800">
        <i data-lucide="newspaper" class="w-10 h-10 mx-auto mb-2 text-slate-600"></i>
        <h4 class="text-white font-bold">No car blogs or auto updates found</h4>
        <p class="text-xs text-slate-500 mt-1">Try another search or click "Upload / Share Update" to publish a new story.</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = filtered.map(blog => {
    const sourceUrl = extractBlogSourceUrl(blog);
    return `
    <article class="glass-card rounded-3xl overflow-hidden border border-slate-800 flex flex-col justify-between group">
      <div>
        <div onclick="openBlogDetailModal('${blog.id}')" class="relative h-52 bg-slate-950 overflow-hidden cursor-pointer">
          <img src="${blog.image || 'gallery/gallery-1.jpg'}" alt="${escapeHtml(blog.title)}" class="w-full h-full object-cover">
          <span class="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-sky-500/40 text-sky-400 text-[10px] font-extrabold uppercase tracking-wider">
            ${escapeHtml(blog.category)}
          </span>
          <span class="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-slate-950/80 text-slate-300 text-[10px] font-semibold">
            ${escapeHtml(blog.readTime || '4 min read')}
          </span>
        </div>

        <div class="p-6">
          <div class="flex items-center justify-between text-[11px] text-slate-400 mb-2">
            <span class="flex items-center space-x-1">
              <i data-lucide="user" class="w-3 h-3 text-amber-400"></i>
              <span class="font-semibold text-slate-300">${escapeHtml(blog.author)}</span>
            </span>
            <span>${escapeHtml(blog.publishedDate || '2026-11-19')}</span>
          </div>

          <h3 onclick="openBlogDetailModal('${blog.id}')" class="text-base font-extrabold text-white group-hover:text-amber-400 transition-colors leading-snug cursor-pointer line-clamp-2">
            ${escapeHtml(blog.title)}
          </h3>

          <div class="flex flex-wrap items-center gap-1.5 mt-2">
            ${blog.carTag ? `
              <span class="inline-block px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold">
                ${escapeHtml(blog.carTag)}
              </span>
            ` : ''}
            ${sourceUrl ? `
              <a href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 text-sky-400 hover:text-sky-300 text-[10px] font-bold">
                <span>Official Source</span>
                <i data-lucide="external-link" class="w-2.5 h-2.5"></i>
              </a>
            ` : ''}
          </div>

          <p class="text-xs text-slate-400 mt-3 leading-relaxed line-clamp-3">
            ${escapeHtml(blog.excerpt)}
          </p>

          ${blog.liveHeadline ? `
            <div class="mt-2.5 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 line-clamp-1">
              <strong class="text-emerald-400">Live Headline:</strong> ${escapeHtml(blog.liveHeadline)}
            </div>
          ` : ''}
        </div>
      </div>

      <div class="px-6 pb-6 pt-3 flex items-center justify-between gap-2 border-t border-slate-800/70">
        <button onclick="openBlogDetailModal('${blog.id}')" class="flex-1 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/30 font-bold text-xs transition-colors flex items-center justify-center space-x-1.5">
          <i data-lucide="book-open" class="w-3.5 h-3.5"></i>
          <span>Read</span>
        </button>
        <button onclick="shareBlogToWhatsApp('${blog.id}')" title="Share on WhatsApp" class="p-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/30 transition-colors">
          <i data-lucide="message-circle" class="w-3.5 h-3.5"></i>
        </button>
        <button onclick="shareBlogPost('${blog.id}')" title="Share or Copy Update" class="p-2.5 rounded-xl bg-sky-500/15 hover:bg-sky-500 text-sky-400 hover:text-slate-950 border border-sky-500/30 transition-colors">
          <i data-lucide="share-2" class="w-3.5 h-3.5"></i>
        </button>
        <button onclick="deleteBlogPost('${blog.id}')" title="Delete Blog" class="p-2.5 rounded-xl bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    </article>
  `;
  }).join("");

  lucide.createIcons();
}

function openBlogDetailModal(blogId) {
  const blog = (appState.blogs || []).find(b => b.id === blogId);
  if (!blog) return;

  const container = document.getElementById("blog-detail-content");
  if (!container) return;

  const sourceUrl = extractBlogSourceUrl(blog);
  const liveHeadlines = Array.isArray(blog.liveHeadlines) ? blog.liveHeadlines.filter(Boolean) : [];
  const paragraphs = (blog.content || blog.excerpt || '').split(/\n+/).filter(Boolean)
    .map(p => `<p class="text-sm text-slate-300 leading-relaxed">${escapeHtml(p)}</p>`).join("");
  const liveBlock = liveHeadlines.length ? `
    <div class="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
      <div class="flex items-center justify-between gap-2">
        <span class="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">Latest Auto-Updated Official Headlines</span>
        ${blog.liveSyncedAt ? `<span class="text-[11px] text-slate-400">Synced ${escapeHtml(new Date(blog.liveSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))}</span>` : ''}
      </div>
      <ul class="space-y-1 text-xs text-slate-200 list-disc pl-4">
        ${liveHeadlines.map(h => `<li>${escapeHtml(h)}</li>`).join('')}
      </ul>
    </div>
  ` : '';

  container.innerHTML = `
    <div class="relative h-64 sm:h-80 bg-slate-950 overflow-hidden rounded-t-3xl">
      <img src="${blog.image || 'gallery/gallery-1.jpg'}" alt="${escapeHtml(blog.title)}" class="w-full h-full object-cover">
      <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent"></div>
      <div class="absolute bottom-5 left-6 right-6">
        <span class="inline-block px-3 py-1 rounded-lg bg-amber-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider mb-2">
          ${escapeHtml(blog.category)}
        </span>
        <h2 class="text-2xl sm:text-3xl font-extrabold text-white heading-font leading-tight">${escapeHtml(blog.title)}</h2>
      </div>
    </div>

    <div class="p-6 sm:p-8 space-y-5">
      <div class="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800 text-xs text-slate-400">
        <div class="flex items-center space-x-4">
          <span class="flex items-center space-x-1.5 text-white font-semibold">
            <i data-lucide="user" class="w-4 h-4 text-amber-400"></i>
            <span>${escapeHtml(blog.author)}</span>
          </span>
          <span>&bull;</span>
          <span>${escapeHtml(blog.publishedDate || '2026-11-19')}</span>
          <span>&bull;</span>
          <span>${escapeHtml(blog.readTime || '4 min read')}</span>
        </div>
        ${blog.carTag ? `<span class="px-2.5 py-1 rounded-lg bg-slate-800 text-amber-400 font-bold text-[11px]">${escapeHtml(blog.carTag)}</span>` : ''}
      </div>

      <div class="space-y-4">
        ${liveBlock}
        ${paragraphs}
      </div>

      ${sourceUrl ? `
        <div class="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p class="text-xs font-bold text-sky-400 uppercase tracking-wider">Official Automaker Press Source</p>
            <p class="text-xs text-slate-300 mt-0.5 break-all">${escapeHtml(sourceUrl)}</p>
          </div>
          <a href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener noreferrer" class="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs inline-flex items-center justify-center space-x-1.5 shrink-0">
            <span>Open Official Portal</span>
            <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
          </a>
        </div>
      ` : ''}

      <div class="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <span class="text-xs font-bold text-slate-300 uppercase tracking-wider">Share This Update</span>
        <div class="flex flex-wrap items-center gap-2">
          <button onclick="shareBlogToWhatsApp('${blog.id}')" class="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/30 text-xs font-bold inline-flex items-center space-x-1.5 transition-colors">
            <i data-lucide="message-circle" class="w-3.5 h-3.5"></i>
            <span>WhatsApp</span>
          </button>
          <button onclick="shareBlogToX('${blog.id}')" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-bold transition-colors">
            Share on X
          </button>
          <button onclick="shareBlogToFacebook('${blog.id}')" class="px-3 py-1.5 rounded-lg bg-blue-500/15 hover:bg-blue-500 text-blue-400 hover:text-white border border-blue-500/30 text-xs font-bold transition-colors">
            Facebook
          </button>
          <button onclick="shareBlogPost('${blog.id}')" class="px-3 py-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500 text-sky-400 hover:text-slate-950 border border-sky-500/30 text-xs font-bold inline-flex items-center space-x-1.5 transition-colors">
            <i data-lucide="share-2" class="w-3.5 h-3.5"></i>
            <span>Copy / Share</span>
          </button>
        </div>
      </div>

      <div class="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <button onclick="closeModal('modal-blog-detail'); switchView('marketplace')" class="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors">
          Browse Matching Cars
        </button>
        <button onclick="closeModal('modal-blog-detail')" class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700">
          Close Article
        </button>
      </div>
    </div>
  `;

  openModal("modal-blog-detail");
  lucide.createIcons();
}

function openBlogUploadModal() {
  const form = document.querySelector("#modal-blog-upload form");
  if (form) form.reset();
  const imgInput = document.getElementById("blog-form-image");
  if (imgInput) imgInput.value = "gallery/gallery-1.jpg";
  const readInput = document.getElementById("blog-form-readtime");
  if (readInput) readInput.value = "4 min read";
  openModal("modal-blog-upload");
  lucide.createIcons();
}

function setBlogCoverPreset(url) {
  const input = document.getElementById("blog-form-image");
  if (input) input.value = url;
}

function handleBlogFileUpload(inputEl) {
  const file = inputEl?.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const imgInput = document.getElementById("blog-form-image");
    if (imgInput && e.target?.result) {
      imgInput.value = e.target.result;
      showToast("Photo Attached", `"${file.name}" attached to your blog post.`, "success");
    }
  };
  reader.readAsDataURL(file);
}

function handleBlogUploadSubmit(e) {
  e.preventDefault();

  const sourceUrl = document.getElementById("blog-form-source-url")?.value.trim() || "";
  const rawContent = document.getElementById("blog-form-content").value.trim();
  const fullContent = sourceUrl && !rawContent.includes(sourceUrl)
    ? `${rawContent}\n\nOfficial Press Source: ${sourceUrl}`
    : rawContent;

  const newBlog = {
    id: "blog-" + Date.now(),
    title: document.getElementById("blog-form-title").value.trim(),
    category: document.getElementById("blog-form-category").value,
    author: document.getElementById("blog-form-author").value.trim() || "Guest Author",
    carTag: document.getElementById("blog-form-car-tag")?.value.trim() || "",
    sourceUrl,
    readTime: document.getElementById("blog-form-readtime")?.value.trim() || "4 min read",
    publishedDate: new Date().toISOString().split("T")[0],
    image: document.getElementById("blog-form-image").value.trim() || "gallery/gallery-1.jpg",
    excerpt: document.getElementById("blog-form-excerpt").value.trim(),
    content: fullContent
  };

  appState.blogs.unshift(newBlog);
  saveAllState();
  if (typeof sbUpsertRecord === "function" && typeof mapBlogToRow === "function") {
    sbUpsertRecord("blogs", mapBlogToRow(newBlog));
  }
  closeModal("modal-blog-upload");
  renderBlogs();

  showToast("Update Published!", `"${newBlog.title}" is now live & ready to share.`, "success");
}

function deleteBlogPost(blogId) {
  if (confirm("Remove this blog post from the Car Blogs & News page?")) {
    if (String(blogId || '').startsWith('rss-') || String(blogId || '').startsWith('gnews-')) {
      const deleted = getDeletedBlogIds();
      deleted.add(blogId);
      localStorage.setItem('desihood_deleted_blog_ids', JSON.stringify([...deleted]));
    }
    appState.blogs = (appState.blogs || []).filter(b => b.id !== blogId);
    saveAllState();
    if (typeof sbDeleteRecord === "function") sbDeleteRecord("blogs", blogId);
    renderBlogs();
    showToast("Blog Removed", "Blog post deleted.", "info");
  }
}

// ==========================================
// SAFE HTML HELPER
// ==========================================
function escapeHtml(val) {
  return String(val ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ==========================================
// BUYER ACCOUNT REGISTRATION & PROFILE ENGINE
// ==========================================
function getCurrentBuyer() {
  if (!appState.currentBuyerId) return null;
  return (appState.buyers || []).find(b => b.id === appState.currentBuyerId) || null;
}

function updateBuyerNavLabel() {
  const labelEl = document.getElementById("buyer-account-nav-label");
  if (!labelEl) return;
  const buyer = getCurrentBuyer();
  labelEl.textContent = buyer ? `Buyer: ${buyer.fullName.split(' ')[0]}` : 'Buyer Account';
}

function switchBuyerAuthTab(tab) {
  const regPanel = document.getElementById("buyer-register-panel");
  const loginPanel = document.getElementById("buyer-login-panel");
  const regBtn = document.getElementById("buyer-tab-register-btn");
  const loginBtn = document.getElementById("buyer-tab-login-btn");

  const activeCls = "px-5 py-2.5 rounded-xl text-xs font-extrabold bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all";
  const inactiveCls = "px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-slate-300 border border-slate-700 hover:border-slate-500 transition-all";

  if (tab === 'login') {
    if (regPanel) regPanel.classList.add("hidden");
    if (loginPanel) loginPanel.classList.remove("hidden");
    if (loginBtn) loginBtn.className = activeCls;
    if (regBtn) regBtn.className = inactiveCls;
  } else {
    if (loginPanel) loginPanel.classList.add("hidden");
    if (regPanel) regPanel.classList.remove("hidden");
    if (regBtn) regBtn.className = activeCls;
    if (loginBtn) loginBtn.className = inactiveCls;
  }
}

function syncBuyerWhatsappFromPhone() {
  const phoneEl = document.getElementById("buyer-reg-phone");
  const waEl = document.getElementById("buyer-reg-whatsapp");
  if (phoneEl && waEl) {
    waEl.value = phoneEl.value;
    showToast("WhatsApp Synced", "Copied primary phone number to WhatsApp field.", "info");
  }
}

function togglePasswordVisibility(inputId, btnEl) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  if (btnEl) btnEl.textContent = show ? 'Hide' : 'Show';
}

function assignAutoBuyerAvatar() {
  const input = document.getElementById("buyer-reg-avatar");
  if (!input) return;
  const pick = SAMPLE_DEALER_AVATARS[Math.floor(Math.random() * SAMPLE_DEALER_AVATARS.length)];
  input.value = pick;
}

function handleBuyerRegistration(e) {
  e.preventDefault();

  const fullName = document.getElementById("buyer-reg-name").value.trim();
  const username = document.getElementById("buyer-reg-username").value.trim().replace(/^@/, '');
  const dob = document.getElementById("buyer-reg-dob").value;
  const idNumber = document.getElementById("buyer-reg-id-number").value.trim();
  const email = document.getElementById("buyer-reg-email").value.trim().toLowerCase();
  const phone = document.getElementById("buyer-reg-phone").value.trim();
  const whatsapp = document.getElementById("buyer-reg-whatsapp").value.trim();
  const country = document.getElementById("buyer-reg-country").value;
  const city = document.getElementById("buyer-reg-city").value.trim();
  const postalCode = document.getElementById("buyer-reg-postal")?.value.trim() || '';
  const address = document.getElementById("buyer-reg-address").value.trim();
  const preferredCurrency = document.getElementById("buyer-reg-currency").value || 'USD';
  const budgetRange = document.getElementById("buyer-reg-budget").value;
  const preferredVehicleType = document.getElementById("buyer-reg-vehicle-type").value;
  const paymentMethod = document.getElementById("buyer-reg-payment").value;
  const avatar = document.getElementById("buyer-reg-avatar")?.value.trim() || SAMPLE_DEALER_AVATARS[1];
  const password = document.getElementById("buyer-reg-password").value;
  const confirmPassword = document.getElementById("buyer-reg-confirm-password").value;

  if (password.length < 6) {
    showToast("Password Too Short", "Password must be at least 6 characters long.", "error");
    return;
  }
  if (password !== confirmPassword) {
    showToast("Password Mismatch", "Confirm Password must match your Account Password.", "error");
    return;
  }

  const duplicate = (appState.buyers || []).find(
    b => b.email.toLowerCase() === email || b.username.toLowerCase() === username.toLowerCase()
  );
  if (duplicate) {
    showToast("Account Exists", "A buyer account with this email or username already exists. Please sign in.", "error");
    switchBuyerAuthTab('login');
    return;
  }

  const newBuyer = {
    id: "buyer-" + Date.now(),
    fullName,
    username,
    dob,
    idNumber,
    email,
    phone,
    whatsapp,
    country,
    city,
    postalCode,
    address,
    preferredCurrency,
    budgetRange,
    preferredVehicleType,
    paymentMethod,
    avatar,
    password,
    verifiedBuyer: true,
    createdAt: new Date().toISOString()
  };

  appState.buyers.unshift(newBuyer);
  appState.currentBuyerId = newBuyer.id;
  saveAllState();
  if (typeof sbSyncBuyerRegistration === "function") {
    sbSyncBuyerRegistration(newBuyer, password);
  }

  const regForm = document.getElementById("buyer-registration-form");
  if (regForm) regForm.reset();

  if (CURRENCIES[preferredCurrency] && typeof changeGlobalCurrency === 'function') {
    changeGlobalCurrency(preferredCurrency);
  }

  updateBuyerNavLabel();
  renderBuyerAccountView();
  showToast("Buyer Account Created!", `Welcome, ${fullName}! Your verified buyer profile is now active.`, "success");
}

function handleBuyerLogin(e) {
  e.preventDefault();
  const identifier = document.getElementById("buyer-login-identifier").value.trim().toLowerCase().replace(/^@/, '');
  const password = document.getElementById("buyer-login-password").value;

  const found = (appState.buyers || []).find(
    b => (b.email.toLowerCase() === identifier || b.username.toLowerCase() === identifier) && b.password === password
  );

  if (!found) {
    showToast("Sign In Failed", "Invalid email/username or password.", "error");
    return;
  }

  appState.currentBuyerId = found.id;
  saveAllState();
  const loginForm = document.getElementById("buyer-login-form");
  if (loginForm) loginForm.reset();
  updateBuyerNavLabel();
  renderBuyerAccountView();
  showToast("Signed In", `Welcome back, ${found.fullName}!`, "success");
}

function logoutBuyerAccount() {
  appState.currentBuyerId = null;
  saveAllState();
  updateBuyerNavLabel();
  renderBuyerAccountView();
  showToast("Signed Out", "You have signed out of your buyer account.", "info");
}

function toggleBuyerProfileEditForm() {
  const formWrap = document.getElementById("buyer-edit-profile-wrap");
  if (formWrap) formWrap.classList.toggle("hidden");
}

function handleUpdateBuyerProfile(e) {
  e.preventDefault();
  const buyer = getCurrentBuyer();
  if (!buyer) return;

  buyer.fullName = document.getElementById("buyer-edit-name").value.trim() || buyer.fullName;
  buyer.phone = document.getElementById("buyer-edit-phone").value.trim() || buyer.phone;
  buyer.whatsapp = document.getElementById("buyer-edit-whatsapp").value.trim() || buyer.whatsapp;
  buyer.city = document.getElementById("buyer-edit-city").value.trim() || buyer.city;
  buyer.address = document.getElementById("buyer-edit-address").value.trim() || buyer.address;
  buyer.budgetRange = document.getElementById("buyer-edit-budget").value;
  buyer.preferredVehicleType = document.getElementById("buyer-edit-vehicle-type").value;
  buyer.paymentMethod = document.getElementById("buyer-edit-payment").value;

  saveAllState();
  if (typeof sbUpsertRecord === "function" && typeof mapBuyerToRow === "function") {
    sbUpsertRecord("buyer_profiles", mapBuyerToRow(buyer));
  }
  updateBuyerNavLabel();
  renderBuyerAccountView();
  showToast("Profile Updated", "Your buyer account preferences and contact info have been saved.", "success");
}

function renderBuyerAccountView() {
  const authContainer = document.getElementById("buyer-auth-container");
  const dashContainer = document.getElementById("buyer-dashboard-container");
  if (!authContainer || !dashContainer) return;

  const buyer = getCurrentBuyer();
  if (!buyer) {
    authContainer.classList.remove("hidden");
    dashContainer.classList.add("hidden");
    lucide.createIcons();
    return;
  }

  authContainer.classList.add("hidden");
  dashContainer.classList.remove("hidden");

  const myInquiries = (appState.inquiries || []).filter(
    inq => (inq.customerEmail || '').toLowerCase() === buyer.email.toLowerCase()
  );
  const memberDate = new Date(buyer.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const waDigits = (buyer.whatsapp || buyer.phone || '').replace(/[^0-9]/g, '');

  dashContainer.innerHTML = `
    <div class="glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-500/40 shadow-2xl">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="flex items-center space-x-5">
          <img src="${escapeHtml(buyer.avatar)}" alt="${escapeHtml(buyer.fullName)}" class="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500/50 shadow-xl">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="text-2xl font-extrabold text-white heading-font">${escapeHtml(buyer.fullName)}</h3>
              <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-extrabold">Verified Buyer</span>
            </div>
            <p class="text-xs text-slate-400 mt-1">@${escapeHtml(buyer.username)} &bull; Member since ${memberDate}</p>
            <p class="text-xs text-slate-300 mt-1 flex items-center">
              <i data-lucide="map-pin" class="w-3.5 h-3.5 mr-1 text-amber-400"></i>
              ${escapeHtml(buyer.city)}, ${escapeHtml(buyer.country)} ${buyer.postalCode ? `(${escapeHtml(buyer.postalCode)})` : ''}
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button onclick="toggleBuyerProfileEditForm()" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold border border-slate-700 transition-colors">
            Edit Profile
          </button>
          <button onclick="switchView('marketplace')" class="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold transition-colors">
            Browse Cars
          </button>
          <button onclick="logoutBuyerAccount()" class="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-bold border border-rose-500/30 transition-colors">
            Sign Out
          </button>
        </div>
      </div>

      <!-- KPI Strip -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
        <div class="bg-slate-900/70 p-4 rounded-2xl border border-slate-800">
          <span class="text-[11px] text-slate-400 uppercase font-bold">Target Budget</span>
          <div class="text-sm font-extrabold text-emerald-400 mt-1">${escapeHtml(buyer.budgetRange)}</div>
        </div>
        <div class="bg-slate-900/70 p-4 rounded-2xl border border-slate-800">
          <span class="text-[11px] text-slate-400 uppercase font-bold">Preferred Style</span>
          <div class="text-sm font-extrabold text-white mt-1">${escapeHtml(buyer.preferredVehicleType)}</div>
        </div>
        <div class="bg-slate-900/70 p-4 rounded-2xl border border-slate-800 cursor-pointer hover:border-rose-500/40" onclick="openFavoritesModal()">
          <span class="text-[11px] text-slate-400 uppercase font-bold">Saved Favorites</span>
          <div class="text-sm font-extrabold text-rose-400 mt-1">${appState.favorites.length} Vehicles &rarr;</div>
        </div>
        <div class="bg-slate-900/70 p-4 rounded-2xl border border-slate-800">
          <span class="text-[11px] text-slate-400 uppercase font-bold">My Inquiries Sent</span>
          <div class="text-sm font-extrabold text-amber-400 mt-1">${myInquiries.length} Inquiries</div>
        </div>
      </div>

      <!-- Full Account Details Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-800 text-xs">
        <div class="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
          <h4 class="font-bold text-slate-300 uppercase tracking-wider text-[11px]">Contact &amp; Identity</h4>
          <p class="text-slate-400">Email: <span class="text-white font-semibold">${escapeHtml(buyer.email)}</span></p>
          <p class="text-slate-400">Phone: <span class="text-white font-semibold">${escapeHtml(buyer.phone)}</span></p>
          <p class="text-slate-400">WhatsApp: <a href="https://wa.me/${waDigits}" target="_blank" class="text-emerald-400 font-semibold hover:underline">${escapeHtml(buyer.whatsapp)}</a></p>
          <p class="text-slate-400">ID / Passport: <span class="text-white font-mono">${escapeHtml(buyer.idNumber)}</span></p>
          <p class="text-slate-400">Date of Birth: <span class="text-white">${escapeHtml(buyer.dob)}</span></p>
        </div>
        <div class="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
          <h4 class="font-bold text-slate-300 uppercase tracking-wider text-[11px]">Address &amp; Buying Setup</h4>
          <p class="text-slate-400">Address: <span class="text-white">${escapeHtml(buyer.address)}</span></p>
          <p class="text-slate-400">City / Country: <span class="text-white">${escapeHtml(buyer.city)}, ${escapeHtml(buyer.country)}</span></p>
          <p class="text-slate-400">Payment Mode: <span class="text-amber-400 font-semibold">${escapeHtml(buyer.paymentMethod)}</span></p>
          <p class="text-slate-400">Preferred Currency: <span class="text-white font-bold">${escapeHtml(buyer.preferredCurrency)}</span></p>
        </div>
      </div>

      <!-- Inline Edit Profile Form -->
      <div id="buyer-edit-profile-wrap" class="hidden mt-6 pt-6 border-t border-slate-800">
        <h4 class="text-sm font-extrabold text-amber-400 uppercase tracking-wider mb-4">Update Buyer Profile Details</h4>
        <form onsubmit="handleUpdateBuyerProfile(event)" class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label class="block text-slate-400 font-semibold uppercase mb-1">Full Name</label>
            <input type="text" id="buyer-edit-name" value="${escapeHtml(buyer.fullName)}" required class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500">
          </div>
          <div>
            <label class="block text-slate-400 font-semibold uppercase mb-1">Phone Number</label>
            <input type="tel" id="buyer-edit-phone" value="${escapeHtml(buyer.phone)}" required class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500">
          </div>
          <div>
            <label class="block text-slate-400 font-semibold uppercase mb-1">WhatsApp Number</label>
            <input type="tel" id="buyer-edit-whatsapp" value="${escapeHtml(buyer.whatsapp)}" required class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500">
          </div>
          <div>
            <label class="block text-slate-400 font-semibold uppercase mb-1">City / State</label>
            <input type="text" id="buyer-edit-city" value="${escapeHtml(buyer.city)}" required class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500">
          </div>
          <div class="sm:col-span-2">
            <label class="block text-slate-400 font-semibold uppercase mb-1">Street Address</label>
            <input type="text" id="buyer-edit-address" value="${escapeHtml(buyer.address)}" required class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500">
          </div>
          <div>
            <label class="block text-slate-400 font-semibold uppercase mb-1">Budget Range</label>
            <select id="buyer-edit-budget" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500">
              <option value="Under $25,000" ${buyer.budgetRange === 'Under $25,000' ? 'selected' : ''}>Under $25,000</option>
              <option value="$25,000 - $60,000" ${buyer.budgetRange === '$25,000 - $60,000' ? 'selected' : ''}>$25,000 - $60,000</option>
              <option value="$60,000 - $120,000" ${buyer.budgetRange === '$60,000 - $120,000' ? 'selected' : ''}>$60,000 - $120,000</option>
              <option value="$120,000 - $250,000" ${buyer.budgetRange === '$120,000 - $250,000' ? 'selected' : ''}>$120,000 - $250,000</option>
              <option value="$250,000+ Exotic" ${buyer.budgetRange === '$250,000+ Exotic' ? 'selected' : ''}>$250,000+ Exotic / Luxury</option>
            </select>
          </div>
          <div>
            <label class="block text-slate-400 font-semibold uppercase mb-1">Preferred Vehicle Type</label>
            <select id="buyer-edit-vehicle-type" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500">
              <option value="Sports & Performance" ${buyer.preferredVehicleType === 'Sports & Performance' ? 'selected' : ''}>Sports & Performance</option>
              <option value="Luxury Sedan" ${buyer.preferredVehicleType === 'Luxury Sedan' ? 'selected' : ''}>Luxury Sedan</option>
              <option value="SUV & 4x4" ${buyer.preferredVehicleType === 'SUV & 4x4' ? 'selected' : ''}>SUV & 4x4</option>
              <option value="Electric & Hybrid" ${buyer.preferredVehicleType === 'Electric & Hybrid' ? 'selected' : ''}>Electric & Hybrid</option>
              <option value="Hypercar & Supercar" ${buyer.preferredVehicleType === 'Hypercar & Supercar' ? 'selected' : ''}>Hypercar & Supercar</option>
              <option value="Daily Commuter" ${buyer.preferredVehicleType === 'Daily Commuter' ? 'selected' : ''}>Daily Commuter</option>
            </select>
          </div>
          <div class="sm:col-span-2">
            <label class="block text-slate-400 font-semibold uppercase mb-1">Payment Method</label>
            <select id="buyer-edit-payment" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500">
              <option value="Cash / Bank Wire" ${buyer.paymentMethod === 'Cash / Bank Wire' ? 'selected' : ''}>Cash / Bank Wire</option>
              <option value="Auto Financing" ${buyer.paymentMethod === 'Auto Financing' ? 'selected' : ''}>Auto Financing / Loan</option>
              <option value="Trade-In + Cash" ${buyer.paymentMethod === 'Trade-In + Cash' ? 'selected' : ''}>Trade-In + Cash</option>
            </select>
          </div>
          <div class="sm:col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" onclick="toggleBuyerProfileEditForm()" class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold">Cancel</button>
            <button type="submit" class="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  `;

  lucide.createIcons();
}

// ==========================================
// OWNER-ONLY CONSOLE: DEALER REQUEST BOX & DEALER MODERATION
// ==========================================
const OWNER_EMAIL = "desihoodcars@gmail.com";

function getOwnerPin() {
  return localStorage.getItem('desihood_owner_pin') || 'AHMAD2026';
}

function updateOwnerNavVisibility() {
  const navBtns = [
    document.getElementById("nav-btn-owner-desk"),
    document.getElementById("nav-btn-showroom-owners-pk")
  ].filter(Boolean);

  navBtns.forEach(navBtn => {
    if (appState.isOwnerAuthenticated) {
      navBtn.classList.remove("hidden");
      navBtn.classList.add("flex");
    } else {
      navBtn.classList.add("hidden");
      navBtn.classList.remove("flex");
    }
  });
}

function checkPrivateOwnerRoute() {
  const hash = (window.location.hash || '').toLowerCase();
  const params = new URLSearchParams(window.location.search || '');
  if (hash === '#owner' || hash === '#admin' || params.get('owner') === '1' || params.get('admin') === '1') {
    openOwnerConsole();
  }
}

function updateOwnerPendingBadge() {
  const pendingCount = (appState.dealerRequests || []).filter(r => r.status === 'pending').length;
  const badge = document.getElementById("owner-pending-requests-badge");
  if (badge) {
    badge.textContent = pendingCount;
    badge.classList.toggle("hidden", pendingCount === 0);
  }
  const portalCount = document.getElementById("portal-owner-pending-count");
  if (portalCount) portalCount.textContent = pendingCount;
}

function requireOwnerAccess() {
  if (appState.isOwnerAuthenticated === true) return true;
  showToast("Owner Only Feature", "Restricted strictly to Owner AHMAD RAZA. Please unlock Owner Desk.", "error");
  switchView('owner-console');
  return false;
}

function openOwnerConsole() {
  switchView('owner-console');
}

function handleOwnerLogin(e) {
  e.preventDefault();
  const email = document.getElementById("owner-auth-email").value.trim().toLowerCase();
  const pin = document.getElementById("owner-auth-pin").value.trim();

  if (email !== OWNER_EMAIL || pin !== getOwnerPin()) {
    showToast("Access Denied", "Invalid Owner Email or Security PIN. Only Owner AHMAD RAZA can access this box.", "error");
    return;
  }

  appState.isOwnerAuthenticated = true;
  sessionStorage.setItem('desihood_owner_auth', 'true');
  const form = document.getElementById("owner-auth-form");
  if (form) form.reset();

  populateDealerDropdown();
  updateOwnerNavVisibility();
  renderOwnerConsole();
  if (appState.currentView === 'dealer-portal') renderDealerPortal();
  showToast("Owner Mode Unlocked", "Welcome AHMAD RAZA! Dealer Request Box & Moderation controls are active.", "success");
}

function lockOwnerConsole() {
  appState.isOwnerAuthenticated = false;
  sessionStorage.removeItem('desihood_owner_auth');
  const pkTbody = document.getElementById("pk-showroom-owners-tbody");
  if (pkTbody) pkTbody.innerHTML = "";
  populateDealerDropdown();
  updateOwnerNavVisibility();
  renderOwnerConsole();
  if (appState.currentView === 'dealer-portal') renderDealerPortal();
  if (window.location.hash.toLowerCase() === '#owner' || window.location.hash.toLowerCase() === '#admin') {
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }
  switchView('marketplace');
  showToast("Owner Mode Locked", "Owner Desk has been hidden and locked.", "info");
}

function openChangeOwnerPinModal() {
  if (!requireOwnerAccess()) return;
  const input = document.getElementById("owner-new-pin");
  if (input) input.value = "";
  openModal("modal-owner-pin");
}

function handleChangeOwnerPin(e) {
  e.preventDefault();
  if (!requireOwnerAccess()) return;
  const newPin = document.getElementById("owner-new-pin").value.trim();
  if (newPin.length < 4) {
    showToast("PIN Too Short", "Owner PIN must be at least 4 characters.", "error");
    return;
  }
  localStorage.setItem('desihood_owner_pin', newPin);
  closeModal("modal-owner-pin");
  showToast("Owner PIN Updated", "Your private Owner Security PIN has been updated.", "success");
}

function switchOwnerTab(tab) {
  if (!requireOwnerAccess()) return;
  appState.activeOwnerTab = tab;

  const tabs = ['requests', 'dealers', 'cars', 'buyers', 'content'];
  const activeCls = "px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 flex items-center space-x-2 transition-colors";
  const inactiveCls = "px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700 flex items-center space-x-2 transition-colors";

  tabs.forEach(t => {
    const btn = document.getElementById(`owner-tab-${t}-btn`);
    const panel = document.getElementById(`owner-tab-${t}`);
    const isActive = t === tab;
    if (btn) btn.className = isActive ? activeCls : inactiveCls;
    if (panel) panel.classList.toggle('hidden', !isActive);
  });

  if (tab === 'requests') renderOwnerRequestsList();
  else if (tab === 'dealers') renderOwnerDealersEnforcement();
  else if (tab === 'cars') renderOwnerCarsModeration();
  else if (tab === 'buyers') renderOwnerBuyersDirectory();
  else if (tab === 'content') renderOwnerContentModeration();

  lucide.createIcons();
}

function filterOwnerRequests(status, btnEl) {
  if (!requireOwnerAccess()) return;
  appState.activeOwnerReqFilter = status;
  document.querySelectorAll(".owner-req-filter-btn").forEach(btn => {
    btn.className = "owner-req-filter-btn px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-slate-300 border border-slate-800";
  });
  if (btnEl) {
    btnEl.className = "owner-req-filter-btn px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-slate-950";
  }
  renderOwnerRequestsList();
}

function renderOwnerConsole() {
  const lockedGate = document.getElementById("owner-locked-gate");
  const unlockedDash = document.getElementById("owner-unlocked-dashboard");
  if (!lockedGate || !unlockedDash) return;

  if (!appState.isOwnerAuthenticated) {
    lockedGate.classList.remove("hidden");
    unlockedDash.classList.add("hidden");
    lucide.createIcons();
    return;
  }

  lockedGate.classList.add("hidden");
  unlockedDash.classList.remove("hidden");

  const pending = appState.dealerRequests.filter(r => r.status === 'pending').length;
  const rejected = appState.dealerRequests.filter(r => r.status === 'rejected').length;
  const activeDealers = appState.dealers.filter(d => !d.banned).length;
  const bannedDealers = appState.dealers.filter(d => d.banned).length;

  const elP = document.getElementById("owner-stat-pending");
  const elA = document.getElementById("owner-stat-active-dealers");
  const elB = document.getElementById("owner-stat-banned-dealers");
  const elC = document.getElementById("owner-stat-total-cars");
  const elBuyers = document.getElementById("owner-stat-buyers");
  const elR = document.getElementById("owner-stat-rejected");

  if (elP) elP.textContent = pending;
  if (elA) elA.textContent = activeDealers;
  if (elB) elB.textContent = bannedDealers;
  if (elC) elC.textContent = (appState.cars || []).length;
  if (elBuyers) elBuyers.textContent = (appState.buyers || []).length;
  if (elR) elR.textContent = rejected;

  updateOwnerPendingBadge();
  renderOwnerRequestsList();
  renderOwnerDealersEnforcement();
  renderOwnerCarsModeration();
  renderOwnerBuyersDirectory();
  renderOwnerContentModeration();
  if (typeof renderSupabaseStatusUI === "function") renderSupabaseStatusUI();
  lucide.createIcons();
}

function renderOwnerRequestsList() {
  if (!appState.isOwnerAuthenticated) return;
  const container = document.getElementById("owner-requests-list");
  if (!container) return;

  const filter = appState.activeOwnerReqFilter || 'pending';
  const list = (appState.dealerRequests || []).filter(r => filter === 'all' || r.status === filter);

  if (list.length === 0) {
    container.innerHTML = `
      <div class="glass-panel p-10 rounded-3xl border border-slate-800 text-center text-slate-400">
        <i data-lucide="inbox" class="w-10 h-10 mx-auto mb-2 text-slate-600"></i>
        <h4 class="text-white font-bold text-sm">No ${filter === 'all' ? '' : filter} dealer requests in your box</h4>
        <p class="text-xs text-slate-500 mt-1">When dealers submit their showroom application on Become a Dealer, full profiles appear here for your approval.</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = list.map(req => {
    const waDigits = (req.whatsapp || req.phone || '').replace(/[^0-9]/g, '');
    const statusBadge = req.status === 'approved'
      ? `<span class="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase">Approved</span>`
      : req.status === 'rejected'
      ? `<span class="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-black uppercase">Rejected</span>`
      : `<span class="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase">Pending Owner Approval</span>`;

    return `
      <div class="glass-panel p-6 rounded-3xl border ${req.status === 'pending' ? 'border-amber-500/40' : 'border-slate-800'} space-y-4">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center space-x-4">
            <img src="${escapeHtml(req.avatar)}" alt="${escapeHtml(req.name)}" class="w-16 h-16 rounded-2xl object-cover border border-amber-500/40">
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <h4 class="text-lg font-extrabold text-white">${escapeHtml(req.name)}</h4>
                ${statusBadge}
              </div>
              <p class="text-xs text-slate-400 mt-0.5">Owner / Rep: <strong class="text-slate-200">${escapeHtml(req.owner)}</strong> &bull; Submitted ${new Date(req.submittedAt).toLocaleString()}</p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            ${req.status === 'pending' ? `
              <button onclick="approveDealerRequest('${req.id}')" class="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center space-x-1.5 transition-colors">
                <i data-lucide="check-circle" class="w-4 h-4"></i>
                <span>Approve Dealer</span>
              </button>
              <button onclick="rejectDealerRequest('${req.id}')" class="px-4 py-2 rounded-xl bg-rose-600/25 hover:bg-rose-600/40 border border-rose-500/50 text-rose-300 font-bold text-xs flex items-center space-x-1.5 transition-colors">
                <i data-lucide="x-circle" class="w-4 h-4"></i>
                <span>Reject Request</span>
              </button>
            ` : `
              <button onclick="deleteDealerRequestRecord('${req.id}')" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold">
                Delete Record
              </button>
            `}
          </div>
        </div>

        <!-- Complete Submitted Dealer Details -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs">
          <div class="space-y-1">
            <span class="text-[10px] font-bold uppercase text-slate-500 block">Contact Numbers &amp; Email</span>
            <p class="text-slate-200">Phone: <span class="font-semibold">${escapeHtml(req.phone)}</span></p>
            <p class="text-slate-200">WhatsApp: <a href="https://wa.me/${waDigits}" target="_blank" class="text-emerald-400 hover:underline font-semibold">${escapeHtml(req.whatsapp)}</a></p>
            <p class="text-slate-200">Email: <span class="text-sky-400">${escapeHtml(req.email)}</span></p>
          </div>
          <div class="space-y-1">
            <span class="text-[10px] font-bold uppercase text-slate-500 block">Location &amp; License</span>
            <p class="text-slate-200">City / Country: <span class="font-semibold">${escapeHtml(req.location)}</span></p>
            <p class="text-slate-200">Street Address: <span>${escapeHtml(req.address)}</span></p>
            <p class="text-slate-200">License / Tax ID: <span class="font-mono text-amber-300">${escapeHtml(req.license || 'Not Provided')}</span></p>
          </div>
          <div class="space-y-1">
            <span class="text-[10px] font-bold uppercase text-slate-500 block">Dealership Bio &amp; Specialties</span>
            <p class="text-slate-300 leading-relaxed">${escapeHtml(req.description)}</p>
            ${req.reviewNote ? `<p class="text-rose-300 font-semibold pt-1">Owner Note: ${escapeHtml(req.reviewNote)}</p>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join("");

  lucide.createIcons();
}

function approveDealerRequest(reqId) {
  if (!requireOwnerAccess()) return;
  const req = appState.dealerRequests.find(r => r.id === reqId);
  if (!req || req.status !== 'pending') return;

  req.status = 'approved';
  req.reviewedAt = new Date().toISOString();

  const newDealer = {
    id: "dealer-" + Date.now(),
    name: req.name,
    owner: req.owner,
    phone: req.phone,
    whatsapp: req.whatsapp,
    email: req.email,
    location: req.location,
    country: req.country || 'US',
    address: req.address,
    license: req.license || '',
    avatar: req.avatar || SAMPLE_DEALER_AVATARS[0],
    description: req.description,
    rating: 5.0,
    reviewsCount: 1,
    verified: true,
    banned: false,
    totalCarsSold: 0,
    totalSalesVolume: 0,
    memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  };

  appState.dealers.unshift(newDealer);
  appState.activeDealerId = newDealer.id;
  saveAllState();
  if (typeof sbUpsertRecord === "function") {
    if (typeof mapRequestToRow === "function") sbUpsertRecord("dealer_requests", mapRequestToRow(req));
    if (typeof mapDealerToRow === "function") sbUpsertRecord("dealers", mapDealerToRow(newDealer));
  }

  populateDealerDropdown();
  renderDealersDirectory();
  renderMarketplace();
  renderOwnerConsole();
  showToast("Dealer Approved!", `"${newDealer.name}" is now an active verified dealer on Desi Hood Cars.`, "success");
}

function rejectDealerRequest(reqId) {
  if (!requireOwnerAccess()) return;
  const req = appState.dealerRequests.find(r => r.id === reqId);
  if (!req || req.status !== 'pending') return;

  const reason = prompt(`Optional rejection reason for "${req.name}":`, "Incomplete verification or does not meet marketplace standards.");
  if (reason === null) return;

  req.status = 'rejected';
  req.reviewNote = reason.trim() || "Rejected by Owner.";
  req.reviewedAt = new Date().toISOString();
  saveAllState();
  if (typeof sbUpsertRecord === "function" && typeof mapRequestToRow === "function") {
    sbUpsertRecord("dealer_requests", mapRequestToRow(req));
  }

  renderOwnerConsole();
  showToast("Request Rejected", `Dealer application for "${req.name}" has been rejected.`, "info");
}

function deleteDealerRequestRecord(reqId) {
  if (!requireOwnerAccess()) return;
  appState.dealerRequests = appState.dealerRequests.filter(r => r.id !== reqId);
  saveAllState();
  if (typeof sbDeleteRecord === "function") sbDeleteRecord("dealer_requests", reqId);
  renderOwnerConsole();
}

function renderOwnerDealersEnforcement() {
  if (!appState.isOwnerAuthenticated) return;
  const container = document.getElementById("owner-dealers-enforcement-list");
  if (!container) return;

  const keyword = (document.getElementById("owner-dealers-search")?.value || '').toLowerCase().trim();
  const dealers = (appState.dealers || []).filter(d => {
    if (!keyword) return true;
    return `${d.name} ${d.owner || ''} ${d.location} ${d.email} ${d.phone}`.toLowerCase().includes(keyword);
  });

  if (dealers.length === 0) {
    container.innerHTML = `<div class="p-8 rounded-2xl glass-panel border border-slate-800 text-center text-xs text-slate-400">No dealers match your search.</div>`;
    return;
  }

  container.innerHTML = dealers.map(d => {
    const carCount = appState.cars.filter(c => c.dealerId === d.id).length;
    return `
      <div class="glass-panel p-5 rounded-2xl border ${d.banned ? 'border-rose-500/50 bg-rose-950/15' : 'border-slate-800'} flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div class="flex items-center space-x-4">
          <img src="${escapeHtml(d.avatar)}" alt="${escapeHtml(d.name)}" class="w-14 h-14 rounded-2xl object-cover border ${d.banned ? 'border-rose-500 grayscale' : 'border-amber-500/40'}">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h4 class="text-base font-extrabold text-white">${escapeHtml(d.name)}</h4>
              ${d.banned
                ? `<span class="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase">BANNED / SUSPENDED</span>`
                : `<span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase">Active Dealer</span>`
              }
            </div>
            <p class="text-xs text-slate-400 mt-0.5">${escapeHtml(d.location)} &bull; ${escapeHtml(d.email || '')} &bull; ${carCount} vehicle(s) listed</p>
            ${d.banned && d.banReason ? `<p class="text-[11px] text-rose-300 mt-1">Ban Reason: ${escapeHtml(d.banReason)}</p>` : ''}
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          ${d.banned ? `
            <button onclick="unbanDealer('${d.id}')" class="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-colors">
              Restore / Unban
            </button>
          ` : `
            <button onclick="banDealer('${d.id}')" class="px-3.5 py-2 rounded-xl bg-rose-600/25 hover:bg-rose-600/40 border border-rose-500/50 text-rose-300 text-xs font-bold flex items-center space-x-1.5 transition-colors">
              <i data-lucide="ban" class="w-3.5 h-3.5"></i>
              <span>Ban Fraudulent Dealer</span>
            </button>
          `}
          <button onclick="removeDealerPermanently('${d.id}')" class="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            <span>Remove Permanently</span>
          </button>
        </div>
      </div>
    `;
  }).join("");

  lucide.createIcons();
}

function banDealer(dealerId) {
  if (!requireOwnerAccess()) return;
  const dealer = appState.dealers.find(d => d.id === dealerId);
  if (!dealer) return;

  const reason = prompt(`Enter ban/suspension reason for "${dealer.name}":`, "Fraudulent activity / poor customer service.");
  if (reason === null) return;

  dealer.banned = true;
  dealer.verified = false;
  dealer.banReason = reason.trim() || "Banned by Owner for fraudulent or bad conduct.";
  dealer.bannedAt = new Date().toISOString();

  saveAllState();
  if (typeof sbUpsertRecord === "function" && typeof mapDealerToRow === "function") {
    sbUpsertRecord("dealers", mapDealerToRow(dealer));
  }
  populateDealerDropdown();
  renderDealersDirectory();
  renderMarketplace();
  renderOwnerConsole();
  if (appState.currentView === 'dealer-portal') renderDealerPortal();
  showToast("Dealer Banned", `"${dealer.name}" has been banned and hidden from public listings.`, "error");
}

function unbanDealer(dealerId) {
  if (!requireOwnerAccess()) return;
  const dealer = appState.dealers.find(d => d.id === dealerId);
  if (!dealer) return;

  dealer.banned = false;
  dealer.verified = true;
  delete dealer.banReason;
  delete dealer.bannedAt;

  saveAllState();
  if (typeof sbUpsertRecord === "function" && typeof mapDealerToRow === "function") {
    sbUpsertRecord("dealers", mapDealerToRow(dealer));
  }
  populateDealerDropdown();
  renderDealersDirectory();
  renderMarketplace();
  renderOwnerConsole();
  if (appState.currentView === 'dealer-portal') renderDealerPortal();
  showToast("Dealer Restored", `"${dealer.name}" is active again.`, "success");
}

function removeDealerPermanently(dealerId) {
  if (!requireOwnerAccess()) return;
  const dealer = appState.dealers.find(d => d.id === dealerId);
  if (!dealer) return;

  if (!confirm(`Permanently remove "${dealer.name}" and ALL of their vehicle listings from Desi Hood Cars? This cannot be undone.`)) {
    return;
  }

  appState.dealers = appState.dealers.filter(d => d.id !== dealerId);
  appState.cars = appState.cars.filter(c => c.dealerId !== dealerId);

  if (appState.activeDealerId === dealerId) {
    const nextDealer = appState.dealers.find(d => !d.banned) || appState.dealers[0];
    appState.activeDealerId = nextDealer ? nextDealer.id : '';
  }

  saveAllState();
  if (typeof sbDeleteRecord === "function") sbDeleteRecord("dealers", dealerId);
  populateDealerDropdown();
  renderDealersDirectory();
  renderMarketplace();
  renderOwnerConsole();
  if (appState.currentView === 'dealer-portal') renderDealerPortal();
  showToast("Dealer Removed Permanently", `"${dealer.name}" and all associated listings were deleted.`, "info");
}

function banActivePortalDealer() {
  if (!requireOwnerAccess()) return;
  const dealer = getActiveDealer();
  if (!dealer) return;
  if (dealer.banned) unbanDealer(dealer.id);
  else banDealer(dealer.id);
}

function removeActivePortalDealer() {
  if (!requireOwnerAccess()) return;
  const dealer = getActiveDealer();
  if (!dealer) return;
  removeDealerPermanently(dealer.id);
}

// ==========================================
// ADMIN PANEL: VEHICLES, BUYERS & CONTENT MODERATION
// ==========================================
function renderOwnerCarsModeration() {
  if (!appState.isOwnerAuthenticated) return;
  const container = document.getElementById("owner-cars-admin-list");
  if (!container) return;

  const q = (document.getElementById("owner-cars-search")?.value || '').toLowerCase().trim();
  const list = (appState.cars || []).filter(car => {
    if (!q) return true;
    const dealer = getDealerById(car.dealerId);
    return `${car.year} ${car.make} ${car.model} ${dealer?.name || ''} ${car.country || ''}`.toLowerCase().includes(q);
  });

  if (list.length === 0) {
    container.innerHTML = `<div class="p-8 rounded-2xl glass-panel border border-slate-800 text-center text-xs text-slate-400">No vehicles match your filter.</div>`;
    return;
  }

  container.innerHTML = list.map(car => {
    const dealer = getDealerById(car.dealerId);
    const isSold = car.status === 'sold';
    return `
      <div class="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center space-x-3.5">
          <img src="${escapeHtml(car.image)}" alt="${escapeHtml(car.model)}" class="w-16 h-12 rounded-xl object-cover border border-slate-700 shrink-0">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h4 class="text-sm font-extrabold text-white">${escapeHtml(car.year)} ${escapeHtml(car.make)} ${escapeHtml(car.model)}</h4>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${isSold ? 'bg-rose-600/25 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}">${isSold ? 'SOLD OUT' : 'Active'}</span>
              ${car.featured ? `<span class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">Featured</span>` : ''}
            </div>
            <p class="text-xs text-slate-400 mt-0.5">${formatCurrency(car.price)} &bull; Dealer: <strong class="text-slate-200">${escapeHtml(dealer?.name || 'Unknown')}</strong></p>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button onclick="adminToggleCarFeatured('${car.id}')" class="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold">${car.featured ? 'Unfeature' : 'Feature'}</button>
          <button onclick="adminToggleCarStatus('${car.id}')" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold">${isSold ? 'Mark Active' : 'Mark Sold'}</button>
          <button onclick="adminDeleteCar('${car.id}')" class="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold">Delete</button>
        </div>
      </div>
    `;
  }).join("");
}

function adminToggleCarFeatured(carId) {
  if (!requireOwnerAccess()) return;
  const car = appState.cars.find(c => c.id === carId);
  if (!car) return;
  car.featured = !car.featured;
  saveAllState();
  if (typeof sbUpsertRecord === "function" && typeof mapCarToRow === "function") sbUpsertRecord("cars", mapCarToRow(car));
  renderMarketplace();
  renderOwnerConsole();
}

function adminToggleCarStatus(carId) {
  if (!requireOwnerAccess()) return;
  toggleCarStatus(carId);
  renderOwnerConsole();
}

function adminDeleteCar(carId) {
  if (!requireOwnerAccess()) return;
  if (!confirm("Delete this vehicle listing permanently from marketplace & cloud?")) return;
  appState.cars = appState.cars.filter(c => c.id !== carId);
  saveAllState();
  if (typeof sbDeleteRecord === "function") sbDeleteRecord("cars", carId);
  renderMarketplace();
  renderDealerPortal();
  renderOwnerConsole();
  showToast("Vehicle Removed", "Vehicle listing deleted by Admin.", "info");
}

function renderOwnerBuyersDirectory() {
  if (!appState.isOwnerAuthenticated) return;
  const container = document.getElementById("owner-buyers-admin-list");
  if (!container) return;

  const q = (document.getElementById("owner-buyers-search")?.value || '').toLowerCase().trim();
  const list = (appState.buyers || []).filter(b => {
    if (!q) return true;
    return `${b.fullName} ${b.username} ${b.email} ${b.city} ${b.country}`.toLowerCase().includes(q);
  });

  if (list.length === 0) {
    container.innerHTML = `<div class="p-8 rounded-2xl glass-panel border border-slate-800 text-center text-xs text-slate-400">No registered buyer accounts found yet.</div>`;
    return;
  }

  container.innerHTML = list.map(b => `
    <div class="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div class="flex items-center space-x-4">
        <img src="${escapeHtml(b.avatar || SAMPLE_DEALER_AVATARS[1])}" alt="${escapeHtml(b.fullName)}" class="w-12 h-12 rounded-2xl object-cover border border-emerald-500/40 shrink-0">
        <div>
          <h4 class="text-sm font-extrabold text-white">${escapeHtml(b.fullName)} <span class="text-xs text-emerald-400 font-semibold">@${escapeHtml(b.username)}</span></h4>
          <p class="text-xs text-slate-400">${escapeHtml(b.email)} &bull; ${escapeHtml(b.phone)} &bull; ${escapeHtml(b.city)}, ${escapeHtml(b.country)}</p>
          <p class="text-[11px] text-slate-300 mt-1">Budget: <span class="text-amber-300 font-semibold">${escapeHtml(b.budgetRange)}</span> &bull; Style: ${escapeHtml(b.preferredVehicleType)} &bull; ID: <span class="font-mono">${escapeHtml(b.idNumber)}</span></p>
        </div>
      </div>
      <button onclick="adminDeleteBuyer('${b.id}')" class="px-3.5 py-2 rounded-xl bg-red-600/25 hover:bg-red-600 text-red-200 hover:text-white border border-red-500/40 text-xs font-bold shrink-0">Remove Buyer</button>
    </div>
  `).join("");
}

function adminDeleteBuyer(buyerId) {
  if (!requireOwnerAccess()) return;
  if (!confirm("Remove this buyer account?")) return;
  appState.buyers = (appState.buyers || []).filter(b => b.id !== buyerId);
  if (appState.currentBuyerId === buyerId) appState.currentBuyerId = null;
  saveAllState();
  if (typeof sbDeleteRecord === "function") sbDeleteRecord("buyer_profiles", buyerId);
  updateBuyerNavLabel();
  renderBuyerAccountView();
  renderOwnerConsole();
  showToast("Buyer Removed", "Buyer account deleted by Admin.", "info");
}

function renderOwnerContentModeration() {
  if (!appState.isOwnerAuthenticated) return;
  const inqContainer = document.getElementById("owner-inquiries-admin-list");
  const blogContainer = document.getElementById("owner-blogs-admin-list");

  if (inqContainer) {
    const inqs = appState.inquiries || [];
    inqContainer.innerHTML = inqs.length === 0
      ? `<div class="p-6 rounded-2xl glass-panel border border-slate-800 text-xs text-slate-400 text-center">No inquiries recorded.</div>`
      : inqs.map(inq => `
        <div class="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <h5 class="font-bold text-white">${escapeHtml(inq.customerName)} <span class="text-amber-400">(${escapeHtml(inq.type)})</span></h5>
            <p class="text-slate-400">${escapeHtml(inq.carName)} &bull; ${escapeHtml(inq.customerEmail)} &bull; ${escapeHtml(inq.customerPhone)}</p>
            <p class="text-slate-300 mt-1">${escapeHtml(inq.message)}</p>
          </div>
          <button onclick="adminDeleteInquiry('${inq.id}')" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white font-bold shrink-0">Delete</button>
        </div>
      `).join("");
  }

  if (blogContainer) {
    const blogs = appState.blogs || [];
    blogContainer.innerHTML = blogs.length === 0
      ? `<div class="p-6 rounded-2xl glass-panel border border-slate-800 text-xs text-slate-400 text-center">No blog articles found.</div>`
      : blogs.map(blog => `
        <div class="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <h5 class="font-bold text-white">${escapeHtml(blog.title)}</h5>
            <p class="text-slate-400">${escapeHtml(blog.category)} &bull; By ${escapeHtml(blog.author)} &bull; ${escapeHtml(blog.publishedDate || '')}</p>
          </div>
          <button onclick="adminDeleteBlog('${blog.id}')" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white font-bold shrink-0">Delete Blog</button>
        </div>
      `).join("");
  }
}

function adminDeleteInquiry(inqId) {
  if (!requireOwnerAccess()) return;
  appState.inquiries = (appState.inquiries || []).filter(i => i.id !== inqId);
  saveAllState();
  if (typeof sbDeleteRecord === "function") sbDeleteRecord("inquiries", inqId);
  renderDealerPortal();
  renderOwnerConsole();
}

function adminDeleteBlog(blogId) {
  if (!requireOwnerAccess()) return;
  appState.blogs = (appState.blogs || []).filter(b => b.id !== blogId);
  saveAllState();
  if (typeof sbDeleteRecord === "function") sbDeleteRecord("blogs", blogId);
  renderBlogs();
  renderOwnerConsole();
}

// ==========================================
// OLD CARS SECTION (KM & TOTAL WORKING DETAILS)
// ==========================================
function getCarKilometers(car) {
  if (!car) return 0;
  if (car.kilometers !== undefined && car.kilometers !== null && !isNaN(car.kilometers)) {
    return Number(car.kilometers);
  }
  return Math.round(Number(car.mileage || 0) * 1.60934);
}

function isOldCarRecord(car) {
  if (!car) return false;
  return Boolean(car.isOldCar || car.condition === "Old Car" || car.condition === "Used" || Number(car.year) <= 2022 || car.workingDetails);
}

function renderOldCarsSection() {
  const grid = document.getElementById("old-cars-grid");
  if (!grid) return;

  const q = (document.getElementById("old-cars-search")?.value || "").toLowerCase().trim();
  const maxKmRaw = document.getElementById("old-cars-max-km")?.value || "all";
  const maxKm = maxKmRaw === "all" ? Infinity : parseInt(maxKmRaw, 10);
  const workingFilter = document.getElementById("old-cars-working-filter")?.value || "all";

  const list = (appState.cars || []).filter(car => {
    const dealer = appState.dealers.find(d => d.id === car.dealerId);
    if (dealer && dealer.banned) return false;
    if (!isOldCarRecord(car)) return false;

    const km = getCarKilometers(car);
    if (km > maxKm) return false;

    const scoreText = car.workingDetails?.score || "90% Excellent Working";
    if (workingFilter !== "all" && !scoreText.startsWith(workingFilter)) return false;

    if (q) {
      const hay = `${car.year} ${car.make} ${car.model} ${car.color || ""} ${dealer?.name || ""} ${dealer?.location || ""} ${car.description || ""} ${JSON.stringify(car.workingDetails || {})}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  if (list.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-14 text-center text-slate-400 glass-panel rounded-3xl border border-slate-800">
        <i data-lucide="history" class="w-10 h-10 mx-auto mb-2 text-orange-400"></i>
        <h4 class="text-white font-bold">No matching old cars found</h4>
        <p class="text-xs text-slate-500 mt-1">Adjust your KM/working filters or click "Dealer: List Old Car" above to add one.</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  grid.innerHTML = list.map(car => {
    const dealer = getDealerById(car.dealerId);
    const km = getCarKilometers(car);
    const wd = car.workingDetails || {
      score: "90% Excellent Working",
      engine: "Sealed Engine • Smooth Running",
      body: "Clean Body & Original Frame",
      ac: "Chilled AC • Electronics Working",
      suspension: "Smooth Suspension & Good Tyres",
      owners: "Verified Registration & Docs"
    };
    const isSold = car.status === "sold";

    return `
      <div class="glass-card rounded-2xl overflow-hidden flex flex-col border ${isSold ? "border-rose-900/40 opacity-85" : "border-slate-800"}">
        <div class="relative h-52 bg-slate-900 overflow-hidden">
          <img src="${escapeHtml(car.image)}" alt="${escapeHtml(car.make)} ${escapeHtml(car.model)}" class="w-full h-full object-cover">
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent"></div>
          ${isSold ? `
            <div class="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
              <span class="px-4 py-1.5 rounded-xl bg-rose-600 text-white font-black text-xs uppercase tracking-widest border border-rose-400">SOLD OUT</span>
            </div>
          ` : ""}
          <div class="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            <span class="px-2.5 py-1 rounded-lg bg-orange-500 text-slate-950 text-[10px] font-black uppercase">${formatNumber(km)} km</span>
            ${car.color ? `<span class="px-2.5 py-1 rounded-lg bg-slate-900/85 text-slate-200 border border-slate-700 text-[10px] font-bold">${escapeHtml(car.color)}</span>` : ""}
          </div>
          <div class="absolute bottom-3 left-3 right-3 flex items-end justify-between z-10">
            <span class="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-extrabold">${escapeHtml(wd.score)}</span>
            <span class="text-lg font-extrabold text-white heading-font">${formatCurrency(car.price)}</span>
          </div>
        </div>

        <div class="p-5 flex-grow flex flex-col justify-between space-y-4">
          <div>
            <span class="text-[11px] font-bold text-amber-400 uppercase">${escapeHtml(car.year)} &bull; ${escapeHtml(car.transmission)} &bull; ${escapeHtml(car.fuelType)}</span>
            <h3 class="text-lg font-extrabold text-white heading-font">${escapeHtml(car.make)} ${escapeHtml(car.model)}</h3>

            <div class="mt-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-[11px]">
              <div class="text-orange-300 font-bold uppercase tracking-wider text-[10px] mb-1">Car Total Working Details</div>
              <p class="text-slate-300"><strong class="text-white">Engine:</strong> ${escapeHtml(wd.engine)}</p>
              <p class="text-slate-300"><strong class="text-white">Body/Paint:</strong> ${escapeHtml(wd.body)}</p>
              <p class="text-slate-300"><strong class="text-white">AC/Electric:</strong> ${escapeHtml(wd.ac)}</p>
              <p class="text-slate-300"><strong class="text-white">Suspension:</strong> ${escapeHtml(wd.suspension)}</p>
              <p class="text-slate-300"><strong class="text-white">Docs/Owner:</strong> ${escapeHtml(wd.owners)}</p>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-2 pt-1">
            <button onclick="openCarDetailModal('${car.id}')" class="py-2.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs border border-slate-700 flex items-center justify-center space-x-1">
              <i data-lucide="eye" class="w-3.5 h-3.5"></i>
              <span>Details</span>
            </button>
            <button onclick="openInquiryModal('${car.id}', 'Old Car Inspection Inquiry')" class="py-2.5 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1">
              <i data-lucide="message-square" class="w-3.5 h-3.5"></i>
              <span>Inquire</span>
            </button>
            <a href="${buildCarWhatsAppUrl(car, dealer)}" target="_blank" rel="noopener noreferrer" class="py-2.5 px-2.5 rounded-xl bg-emerald-600/25 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 font-bold text-xs border border-emerald-500/40 flex items-center justify-center space-x-1">
              <i data-lucide="message-circle" class="w-3.5 h-3.5"></i>
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    `;
  }).join("");

  lucide.createIcons();
}

// ==========================================
// BROWSE MORE HUB ENGINE
// ==========================================
const INITIAL_CAR_REVIEWS = [
  { id: "rev-1", carName: "2025 Porsche 911 Carrera S", author: "Ahmad Raza", rating: "5", pros: "Razor-sharp PDK gearbox, timeless cabin & daily usability", summary: "Effortless balance between weekend canyon carving and comfortable highway cruising." },
  { id: "rev-2", carName: "2024 Toyota Land Cruiser 300 ZX", author: "Hamza Tariq", rating: "4.5", pros: "Twin-turbo V6 torque, commanding ground clearance, zero rattles", summary: "Handles northern mountain highways and city boulevards with supreme refinement." },
  { id: "rev-3", carName: "2024 Honda Civic RS Turbo", author: "Usman Ali", rating: "4.5", pros: "Punchy VTEC turbo response, Honda Sensing suite, sleek fastback stance", summary: "Best-in-class steering feel and solid resale retention." }
];

const INITIAL_USED_BIKES = [
  { id: "bike-1", makeModel: "Yamaha YZF-R6", year: 2021, price: 9800, km: 14200, condition: "9.5/10 Sealed 600cc Engine • Original Fairing", whatsapp: "+923435972004", image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=900&q=80" },
  { id: "bike-2", makeModel: "Kawasaki Ninja ZX-10R", year: 2020, price: 12900, km: 18500, condition: "9/10 Smooth Quickshifter • Fresh Diablo Tyres", whatsapp: "+923435972004", image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=900&q=80" },
  { id: "bike-3", makeModel: "Honda CBR600RR ABS", year: 2019, price: 8600, km: 22400, condition: "9/10 Chilled Radiator • Akrapovic Slip-On", whatsapp: "+923435972004", image: "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?auto=format&fit=crop&w=900&q=80" }
];

let activeBrowseMoreTab = "all";

function getStoredReviews() {
  try {
    const raw = localStorage.getItem("desihood_reviews");
    return raw ? JSON.parse(raw) : [...INITIAL_CAR_REVIEWS];
  } catch {
    return [...INITIAL_CAR_REVIEWS];
  }
}

function getStoredUsedBikes() {
  try {
    const raw = localStorage.getItem("desihood_used_bikes");
    return raw ? JSON.parse(raw) : [...INITIAL_USED_BIKES];
  } catch {
    return [...INITIAL_USED_BIKES];
  }
}

function switchBrowseMoreTab(tab) {
  activeBrowseMoreTab = tab;
  const tabs = ["all", "blogs", "reviews", "compare", "onroad", "coolrides", "bikes", "parts"];

  tabs.forEach(t => {
    const btn = document.getElementById(`bm-tab-${t}-btn`);
    const panel = document.getElementById(`bm-panel-${t}`);
    const isActive = t === tab;
    if (btn) {
      btn.className = isActive
        ? "bm-tab-btn px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 transition-colors"
        : "bm-tab-btn px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-slate-300 border border-slate-800 hover:border-amber-500/40";
    }
    if (panel) panel.classList.toggle("hidden", !isActive);
  });

  if (tab === "blogs") renderBrowseMoreBlogsPreview();
  else if (tab === "reviews") renderCarReviews();
  else if (tab === "compare") { populateCompareDropdowns(); renderCarComparison(); }
  else if (tab === "onroad") { populateOnRoadCarSelect(); calculateOnRoadPrice(); }
  else if (tab === "coolrides") renderCoolRides();
  else if (tab === "bikes") renderUsedBikes();
  else if (tab === "parts") renderBrowseMorePartsPreview();

  lucide.createIcons();
}

function renderBrowseMoreHub() {
  switchBrowseMoreTab(activeBrowseMoreTab || "all");
}

function renderBrowseMoreBlogsPreview() {
  const container = document.getElementById("bm-blogs-preview-grid");
  if (!container) return;
  const blogs = (appState.blogs || []).slice(0, 6);
  container.innerHTML = blogs.map(b => `
    <div class="glass-card rounded-2xl overflow-hidden border border-slate-800 flex flex-col justify-between cursor-pointer" onclick="openBlogDetailModal('${b.id}')">
      <img src="${escapeHtml(b.image || 'gallery/gallery-1.jpg')}" alt="${escapeHtml(b.title)}" class="h-44 w-full object-cover">
      <div class="p-4 space-y-2">
        <span class="px-2 py-0.5 rounded bg-sky-500/15 text-sky-400 text-[10px] font-bold uppercase">${escapeHtml(b.category)}</span>
        <h4 class="text-sm font-extrabold text-white line-clamp-2">${escapeHtml(b.title)}</h4>
        <p class="text-xs text-slate-400 line-clamp-2">${escapeHtml(b.excerpt)}</p>
      </div>
    </div>
  `).join("");
}

function renderBrowseMorePartsPreview() {
  const container = document.getElementById("bm-parts-preview-grid");
  if (!container) return;
  const parts = (appState.parts || []).slice(0, 6);
  container.innerHTML = parts.map(p => `
    <div class="glass-card rounded-2xl overflow-hidden border border-slate-800 p-4 flex flex-col justify-between space-y-3">
      <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" class="h-40 w-full object-cover rounded-xl">
      <div>
        <span class="text-[10px] font-bold text-amber-400 uppercase">${escapeHtml(p.category)}</span>
        <h4 class="text-sm font-extrabold text-white">${escapeHtml(p.name)}</h4>
        <p class="text-xs text-slate-400 mt-1 line-clamp-2">${escapeHtml(p.description)}</p>
      </div>
      <div class="flex items-center justify-between pt-2 border-t border-slate-800">
        <span class="text-base font-black text-emerald-400">${formatCurrency(p.price)}</span>
        <button onclick="switchView('spare-parts')" class="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs">Order Part</button>
      </div>
    </div>
  `).join("");
}

function renderCarReviews() {
  const container = document.getElementById("bm-reviews-list");
  if (!container) return;
  const reviews = getStoredReviews();
  container.innerHTML = reviews.map(rev => `
    <div class="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2.5">
      <div class="flex items-center justify-between">
        <span class="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-extrabold">${escapeHtml(rev.rating)} ★</span>
        <span class="text-[11px] text-slate-400">By ${escapeHtml(rev.author)}</span>
      </div>
      <h4 class="text-sm font-extrabold text-white">${escapeHtml(rev.carName)}</h4>
      <p class="text-xs text-emerald-400 font-semibold">Pros: ${escapeHtml(rev.pros)}</p>
      <p class="text-xs text-slate-300 leading-relaxed">${escapeHtml(rev.summary)}</p>
    </div>
  `).join("");
}

function handleReviewSubmit(e) {
  e.preventDefault();
  const reviews = getStoredReviews();
  reviews.unshift({
    id: "rev-" + Date.now(),
    carName: document.getElementById("rev-car-name").value.trim(),
    author: document.getElementById("rev-author").value.trim(),
    rating: document.getElementById("rev-rating").value,
    pros: document.getElementById("rev-pros").value.trim(),
    summary: document.getElementById("rev-summary").value.trim()
  });
  localStorage.setItem("desihood_reviews", JSON.stringify(reviews));
  e.target.reset();
  renderCarReviews();
  showToast("Review Published!", "Your car review is now live in Browse More.", "success");
}

function populateCompareDropdowns() {
  const selA = document.getElementById("compare-car-a");
  const selB = document.getElementById("compare-car-b");
  if (!selA || !selB) return;
  const options = (appState.cars || []).map((c, idx) => `<option value="${c.id}">${c.year} ${c.make} ${c.model} (${formatCurrency(c.price)})</option>`).join("");
  selA.innerHTML = options;
  selB.innerHTML = options;
  if (appState.cars.length > 1) selB.selectedIndex = 1;
}

function renderCarComparison() {
  const wrap = document.getElementById("bm-compare-table-wrap");
  const idA = document.getElementById("compare-car-a")?.value;
  const idB = document.getElementById("compare-car-b")?.value;
  if (!wrap) return;
  const a = appState.cars.find(c => c.id === idA) || appState.cars[0];
  const b = appState.cars.find(c => c.id === idB) || appState.cars[1] || a;
  if (!a || !b) return;

  const rows = [
    ["Price", formatCurrency(a.price), formatCurrency(b.price)],
    ["Year", a.year, b.year],
    ["Kilometers / Miles", `${formatNumber(getCarKilometers(a))} km`, `${formatNumber(getCarKilometers(b))} km`],
    ["Exterior Color", a.color || "Standard", b.color || "Standard"],
    ["Horsepower", a.horsepower ? `${a.horsepower} HP` : "Standard", b.horsepower ? `${b.horsepower} HP` : "Standard"],
    ["Fuel / Powertrain", a.fuelType, b.fuelType],
    ["Transmission", a.transmission, b.transmission],
    ["Body Style", a.bodyStyle, b.bodyStyle],
    ["Condition", a.condition, b.condition]
  ];

  wrap.innerHTML = `
    <div class="overflow-x-auto rounded-2xl border border-slate-800">
      <table class="w-full text-left text-xs text-slate-300">
        <thead class="bg-slate-900 text-white border-b border-slate-800">
          <tr>
            <th class="p-4 uppercase text-slate-400">Specification</th>
            <th class="p-4 text-amber-400 font-extrabold">${escapeHtml(a.year)} ${escapeHtml(a.make)} ${escapeHtml(a.model)}</th>
            <th class="p-4 text-cyan-400 font-extrabold">${escapeHtml(b.year)} ${escapeHtml(b.make)} ${escapeHtml(b.model)}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800">
          ${rows.map(r => `<tr><td class="p-3.5 font-bold text-slate-400">${r[0]}</td><td class="p-3.5 font-semibold text-white">${escapeHtml(r[1])}</td><td class="p-3.5 font-semibold text-white">${escapeHtml(r[2])}</td></tr>`).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function populateOnRoadCarSelect() {
  const sel = document.getElementById("onroad-car-select");
  if (!sel) return;
  sel.innerHTML = `<option value="">-- Custom Price --</option>` + (appState.cars || []).map(c => `<option value="${c.id}">${c.year} ${c.make} ${c.model} (${formatCurrency(c.price)})</option>`).join("");
}

function applyCarToOnRoadCalc() {
  const id = document.getElementById("onroad-car-select")?.value;
  const car = appState.cars.find(c => c.id === id);
  if (car) {
    document.getElementById("onroad-base-price").value = car.price;
    calculateOnRoadPrice();
  }
}

function calculateOnRoadPrice() {
  const wrap = document.getElementById("bm-onroad-result");
  if (!wrap) return;
  const base = parseFloat(document.getElementById("onroad-base-price")?.value || 45000);
  const taxPct = parseFloat(document.getElementById("onroad-tax-pct")?.value || 4.5);
  const insPct = parseFloat(document.getElementById("onroad-ins-pct")?.value || 2.5);
  const fees = parseFloat(document.getElementById("onroad-fees")?.value || 650);

  const taxAmt = base * (taxPct / 100);
  const insAmt = base * (insPct / 100);
  const total = base + taxAmt + insAmt + fees;

  wrap.innerHTML = `
    <span class="text-xs font-bold uppercase tracking-wider text-emerald-400">Estimated Total On-Road Cost</span>
    <div class="text-3xl font-black text-white heading-font">${formatCurrency(total)}</div>
    <div class="space-y-1.5 pt-3 border-t border-slate-800 text-xs text-slate-300">
      <div class="flex justify-between"><span>Ex-Showroom Price:</span><strong class="text-white">${formatCurrency(base)}</strong></div>
      <div class="flex justify-between"><span>Registration &amp; Tax (${taxPct}%):</span><strong class="text-amber-300">${formatCurrency(taxAmt)}</strong></div>
      <div class="flex justify-between"><span>Insurance (${insPct}%):</span><strong class="text-sky-300">${formatCurrency(insAmt)}</strong></div>
      <div class="flex justify-between"><span>Documentation &amp; Plates:</span><strong class="text-slate-200">${formatCurrency(fees)}</strong></div>
    </div>
  `;
}

function renderCoolRides() {
  const grid = document.getElementById("bm-coolrides-grid");
  if (!grid) return;
  const rides = (appState.cars || []).filter(c => c.featured || (c.horsepower && c.horsepower >= 400) || c.bodyStyle === "Coupe").slice(0, 6);
  grid.innerHTML = rides.map(car => {
    const dealer = getDealerById(car.dealerId);
    return `
      <div class="glass-card rounded-2xl overflow-hidden border border-purple-500/30 flex flex-col justify-between">
        <div class="relative h-48">
          <img src="${escapeHtml(car.image)}" alt="${escapeHtml(car.model)}" class="w-full h-full object-cover">
          <span class="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-purple-600 text-white text-[10px] font-black uppercase">Cool Ride</span>
        </div>
        <div class="p-4 space-y-2">
          <h4 class="text-base font-extrabold text-white">${escapeHtml(car.year)} ${escapeHtml(car.make)} ${escapeHtml(car.model)}</h4>
          <p class="text-xs text-amber-400 font-bold">${formatCurrency(car.price)} &bull; ${car.horsepower ? car.horsepower + " HP" : car.bodyStyle}</p>
          <div class="flex gap-2 pt-2">
            <button onclick="openCarDetailModal('${car.id}')" class="flex-1 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold">Specs</button>
            <a href="${buildCarWhatsAppUrl(car, dealer)}" target="_blank" rel="noopener noreferrer" class="flex-1 py-2 rounded-xl bg-emerald-600/25 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center">WhatsApp</a>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function renderUsedBikes() {
  const grid = document.getElementById("bm-bikes-grid");
  if (!grid) return;
  const bikes = getStoredUsedBikes();
  grid.innerHTML = bikes.map(b => {
    const digits = String(b.whatsapp || "923435972004").replace(/[^0-9]/g, "") || "923435972004";
    const msg = encodeURIComponent(`Assalam-o-Alaikum, I am interested in your ${b.year} ${b.makeModel} (${formatCurrency(b.price)}) on Desi Hood Cars Used Bikes.`);
    return `
      <div class="glass-card rounded-2xl overflow-hidden border border-rose-500/30 flex flex-col justify-between">
        <div class="relative h-48 bg-slate-950">
          <img src="${escapeHtml(b.image)}" alt="${escapeHtml(b.makeModel)}" class="w-full h-full object-cover">
          <span class="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-black uppercase">${formatNumber(b.km)} km</span>
          <span class="absolute bottom-3 right-3 text-base font-black text-white bg-slate-950/80 px-2.5 py-1 rounded-lg">${formatCurrency(b.price)}</span>
        </div>
        <div class="p-4 space-y-2">
          <span class="text-[11px] font-bold text-amber-400 uppercase">${escapeHtml(b.year)} Model</span>
          <h4 class="text-base font-extrabold text-white">${escapeHtml(b.makeModel)}</h4>
          <p class="text-xs text-slate-300">${escapeHtml(b.condition)}</p>
          <a href="https://wa.me/${digits}?text=${msg}" target="_blank" rel="noopener noreferrer" class="w-full mt-2 py-2.5 rounded-xl bg-emerald-600/25 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/40 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors">
            <i data-lucide="message-circle" class="w-3.5 h-3.5"></i>
            <span>WhatsApp Bike Seller</span>
          </a>
        </div>
      </div>
    `;
  }).join("");
  lucide.createIcons();
}

function handleBikeSubmit(e) {
  e.preventDefault();
  const bikes = getStoredUsedBikes();
  bikes.unshift({
    id: "bike-" + Date.now(),
    makeModel: document.getElementById("bike-make-model").value.trim(),
    year: parseInt(document.getElementById("bike-year").value, 10),
    price: parseFloat(document.getElementById("bike-price").value),
    km: parseInt(document.getElementById("bike-km").value, 10),
    condition: document.getElementById("bike-condition").value.trim(),
    whatsapp: document.getElementById("bike-whatsapp").value.trim(),
    image: INITIAL_USED_BIKES[0].image
  });
  localStorage.setItem("desihood_used_bikes", JSON.stringify(bikes));
  e.target.reset();
  renderUsedBikes();
  showToast("Used Bike Listed!", "Your bike listing with KM & working condition is live.", "success");
}

// ==========================================
// NEW CARS PAGE (2024-2026) & LIVE FX API ENGINE
// ==========================================
const NEW_CARS_CURRENCIES = {
  PKR: { symbol: 'Rs ', label: 'PKR', name: 'Pakistani Rupee' },
  USD: { symbol: '$', label: 'USD', name: 'US Dollar' },
  AED: { symbol: 'AED ', label: 'AED', name: 'UAE Dirham' },
  EUR: { symbol: '€', label: 'EUR', name: 'Euro' }
};

let newCarsState = {
  currency: localStorage.getItem('desihood_newcars_currency') || null,
  yearFilter: 'all',
  isLoading: false,
  syncedAt: null,
  liveRatesOk: false,
  detectedCountry: 'PK',
  rates: {
    USD: 1,
    PKR: CURRENCIES?.PKR?.rate || 278.5,
    AED: CURRENCIES?.AED?.rate || 3.6725,
    EUR: CURRENCIES?.EUR?.rate || 0.92
  },
  apiCars: []
};

function getEffectiveNewCarsCurrency() {
  if (newCarsState.currency && NEW_CARS_CURRENCIES[newCarsState.currency]) {
    return newCarsState.currency;
  }
  const country = appState.currentCountry;
  if (country === 'PK') return 'PKR';
  if (country === 'AE') return 'AED';
  if (country === 'US') return 'USD';
  if (country === 'EU' || country === 'DE' || country === 'FR') return 'EUR';
  const cur = appState.currentCurrency;
  if (NEW_CARS_CURRENCIES[cur]) return cur;
  return 'PKR';
}

function selectNewCarsCurrency(currCode) {
  if (!NEW_CARS_CURRENCIES[currCode]) return;
  newCarsState.currency = currCode;
  localStorage.setItem('desihood_newcars_currency', currCode);

  if (CURRENCIES[currCode]) {
    appState.currentCurrency = currCode;
    localStorage.setItem('desihood_currency', currCode);
  }

  renderNewCarsView();
  showToast(
    `Currency: ${currCode}`,
    `All New Cars prices converted using live ${currCode} exchange rate.`,
    'success'
  );
}

function filterNewCarsYear(yearVal, btnEl) {
  newCarsState.yearFilter = yearVal;
  document.querySelectorAll('.new-cars-year-btn').forEach(btn => {
    btn.className = 'new-cars-year-btn px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700 transition-colors';
  });
  if (btnEl) {
    btnEl.className = 'new-cars-year-btn px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-slate-950 transition-colors';
  }
  renderNewCarsView();
}

function formatNewCarPrice(usdPrice, currCode) {
  const numUsd = Number(usdPrice || 0);
  if (!numUsd || isNaN(numUsd)) return 'Price on Request';
  const rate = newCarsState.rates[currCode] || CURRENCIES[currCode]?.rate || 1;
  const meta = NEW_CARS_CURRENCIES[currCode] || NEW_CARS_CURRENCIES.USD;
  const converted = Math.round(numUsd * rate);
  return `${meta.symbol}${formatNumber(converted)}`;
}

function pickApiCarPhoto(make = '', model = '', idx = 0) {
  const t = `${make} ${model}`.toLowerCase();
  if (/porsche|gt3|911/.test(t)) return 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80';
  if (/mercedes|amg/.test(t)) return 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80';
  if (/bmw|z4|m3|m4/.test(t)) return 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80';
  if (/audi|rs/.test(t)) return 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1200&q=80';
  if (/toyota|supra|camry|corolla|land cruiser/.test(t)) return 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1200&q=80';
  if (/honda|pilot|civic|accord/.test(t)) return 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=1200&q=80';
  if (/ford|mustang|bronco|f-150/.test(t)) return 'https://images.unsplash.com/photo-1558441719-74e1d1f03fce?auto=format&fit=crop&w=1200&q=80';
  if (/chevrolet|corvette|camaro/.test(t)) return 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80';
  if (/jaguar|f-type|lexus/.test(t)) return 'https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=1200&q=80';
  if (/kia|hyundai/.test(t)) return 'https://images.unsplash.com/photo-1581540222194-0def2dda95b8?auto=format&fit=crop&w=1200&q=80';
  const pool = ['gallery/car-theme-hero.jpg', 'gallery/gallery-1.jpg', 'gallery/gallery-2.jpg', 'gallery/gallery-3.jpg'];
  return pool[idx % pool.length];
}

async function loadNewCarsPage(manualTrigger = false) {
  if (newCarsState.isLoading) return;
  newCarsState.isLoading = true;

  const btn = document.getElementById('btn-refresh-new-cars');
  const apiBadge = document.getElementById('new-cars-api-count');
  if (btn) btn.disabled = true;
  if (apiBadge) apiBadge.textContent = 'Syncing Cars & FX API...';

  try {
    const res = await fetchPlatformApi('/api/new-cars', '/.netlify/functions/new-cars');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    newCarsState.syncedAt = data?.fetchedAt || new Date().toISOString();
    newCarsState.detectedCountry = data?.detectedCountry || 'PK';
    newCarsState.liveRatesOk = Boolean(data?.liveRatesOk);

    if (data?.rates) {
      newCarsState.rates = { ...newCarsState.rates, ...data.rates };
      Object.keys(data.rates).forEach(code => {
        if (CURRENCIES[code] && typeof data.rates[code] === 'number') {
          CURRENCIES[code].rate = data.rates[code];
        }
      });
    }

    if (!localStorage.getItem('desihood_newcars_currency') && data?.recommendedCurrency) {
      newCarsState.currency = data.recommendedCurrency;
    }

    newCarsState.apiCars = (Array.isArray(data?.apiCars) ? data.apiCars : [])
      .filter(c => Number(c.year) === 2024 || Number(c.year) === 2025 || Number(c.year) === 2026);

    renderNewCarsView();
    if (manualTrigger) {
      showToast(
        'New Cars & FX Synced',
        `Loaded ${newCarsState.apiCars.length} 2024–2026 API models & live PKR/USD/AED/EUR rates.`,
        'success'
      );
    }
  } catch (err) {
    renderNewCarsView();
    if (manualTrigger) {
      showToast('Live Inventory Active', 'Showing all 2024–2026 showroom cars using cached exchange rates.', 'info');
    }
  } finally {
    newCarsState.isLoading = false;
    if (btn) btn.disabled = false;
  }
}

function updateNewCarsCurrencyButtonsUI(activeCurr) {
  ['PKR', 'USD', 'AED', 'EUR'].forEach(code => {
    const btn = document.getElementById(`new-cars-curr-btn-${code}`);
    if (!btn) return;
    if (code === activeCurr) {
      btn.className = 'new-cars-curr-btn px-3 py-1.5 rounded-xl text-xs font-extrabold transition-colors bg-amber-500 text-slate-950 border border-amber-400';
    } else {
      btn.className = 'new-cars-curr-btn px-3 py-1.5 rounded-xl text-xs font-extrabold transition-colors bg-slate-900 text-slate-300 border border-slate-700 hover:border-amber-500/50';
    }
  });
}

function inquireNewApiCar(carName) {
  const msg = encodeURIComponent(`Assalam-o-Alaikum, please share price & availability for the new ${carName} in ${getEffectiveNewCarsCurrency()}.`);
  window.open(`https://wa.me/923435972004?text=${msg}`, '_blank', 'noopener,noreferrer');
}

function renderNewCarsView() {
  const activeCurr = getEffectiveNewCarsCurrency();
  updateNewCarsCurrencyButtonsUI(activeCurr);

  const fxBanner = document.getElementById('new-cars-fx-banner');
  if (fxBanner) {
    const pkr = Number(newCarsState.rates.PKR || 278.5).toFixed(2);
    const aed = Number(newCarsState.rates.AED || 3.6725).toFixed(2);
    const eur = Number(newCarsState.rates.EUR || 0.92).toFixed(2);
    fxBanner.textContent = `${newCarsState.liveRatesOk ? 'Live API FX' : 'FX Rates'}: 1 USD = ${pkr} PKR | ${aed} AED | ${eur} EUR`;
  }

  const keyword = (document.getElementById('new-cars-search')?.value || '').toLowerCase().trim();
  const yrFilter = newCarsState.yearFilter;

  // Section 1: Strict 2024, 2025, 2026 New Cars from Site / Supabase inventory (NO old/used cars)
  const invGrid = document.getElementById('new-cars-inventory-grid');
  const invCountEl = document.getElementById('new-cars-inv-count');
  if (invGrid) {
    const allowedYears = new Set([2024, 2025, 2026]);
    const newInvCars = (appState.cars || []).filter(car => {
      const yr = Number(car.year);
      if (!allowedYears.has(yr)) return false;
      if (car.isOldCar || String(car.condition || '').toLowerCase().includes('used')) return false;
      if (yrFilter !== 'all' && yr !== Number(yrFilter)) return false;
      if (keyword) {
        const hay = `${car.year} ${car.make} ${car.model} ${car.engine || ''} ${car.fuelType || ''} ${car.color || ''}`.toLowerCase();
        if (!hay.includes(keyword)) return false;
      }
      return true;
    }).sort((a, b) => Number(b.year) - Number(a.year));

    if (invCountEl) invCountEl.textContent = `${newInvCars.length} New Cars`;

    if (!newInvCars.length) {
      invGrid.innerHTML = `
        <div class="col-span-full py-10 text-center text-slate-400 glass-panel rounded-2xl border border-slate-800">
          <h4 class="text-white font-bold text-sm">No matching 2024–2026 showroom cars found</h4>
          <p class="text-xs text-slate-500 mt-1">Try selecting "All (2024–2026)" or clearing your search filter.</p>
        </div>
      `;
    } else {
      invGrid.innerHTML = newInvCars.map(car => {
        const dealer = getDealerById(car.dealerId);
        const engineLabel = car.engine || `${car.fuelType || 'Petrol'} • ${car.transmission || 'Auto'}`;
        const displayPrice = formatNewCarPrice(car.price, activeCurr);
        return `
          <div class="glass-card rounded-3xl overflow-hidden border border-slate-800 flex flex-col justify-between">
            <div>
              <div onclick="openCarDetailModal('${car.id}')" class="relative h-52 bg-slate-950 overflow-hidden cursor-pointer">
                <img src="${escapeHtml(car.image || 'gallery/gallery-1.jpg')}" alt="${escapeHtml(car.year)} ${escapeHtml(car.make)} ${escapeHtml(car.model)}" class="w-full h-full object-cover">
                <span class="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                  ${escapeHtml(car.year)} New
                </span>
                <span class="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-slate-950/85 border border-slate-700 text-amber-400 text-[10px] font-bold">
                  ${escapeHtml(activeCurr)}
                </span>
              </div>

              <div class="p-5">
                <div class="text-2xl font-black text-amber-400 heading-font">${escapeHtml(displayPrice)}</div>
                <h4 onclick="openCarDetailModal('${car.id}')" class="text-base font-extrabold text-white mt-1 cursor-pointer hover:text-amber-400 transition-colors">
                  ${escapeHtml(car.year)} ${escapeHtml(car.make)} ${escapeHtml(car.model)}
                </h4>

                <div class="grid grid-cols-2 gap-2 mt-3 text-[11px] text-slate-300">
                  <div class="px-2.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800">
                    <span class="block text-[10px] text-slate-500 uppercase font-bold">Model Year</span>
                    <span class="font-bold text-white">${escapeHtml(car.year)}</span>
                  </div>
                  <div class="px-2.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800">
                    <span class="block text-[10px] text-slate-500 uppercase font-bold">Engine</span>
                    <span class="font-bold text-white truncate block" title="${escapeHtml(engineLabel)}">${escapeHtml(engineLabel)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="px-5 pb-5 pt-2 flex items-center gap-2 border-t border-slate-800/70">
              <button onclick="openCarDetailModal('${car.id}')" class="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition-colors">
                View Details
              </button>
              <a href="https://wa.me/923435972004?text=${encodeURIComponent(`Assalam-o-Alaikum, I am interested in the ${car.year} ${car.make} ${car.model} (${displayPrice}) on Desi Hood Cars New Cars.`)}" target="_blank" rel="noopener noreferrer" class="px-3 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/30 font-bold text-xs transition-colors">
                WhatsApp
              </a>
              <a href="mailto:desihoodcars@gmail.com?subject=${encodeURIComponent(`Inquiry: ${car.year} ${car.make} ${car.model} (${displayPrice})`)}" title="Email desihoodcars@gmail.com" class="p-2.5 rounded-xl bg-slate-900 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-slate-700 transition-colors">
                <i data-lucide="mail" class="w-3.5 h-3.5"></i>
              </a>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // Section 2: Live API-Ninjas 2024-2026 Specs Catalog
  const apiGrid = document.getElementById('new-cars-api-grid');
  const apiCountEl = document.getElementById('new-cars-api-count');
  if (apiGrid) {
    const filteredApiCars = (newCarsState.apiCars || []).filter(car => {
      const yr = Number(car.year);
      if (yr !== 2024 && yr !== 2025 && yr !== 2026) return false;
      if (yrFilter !== 'all' && yr !== Number(yrFilter)) return false;
      if (keyword) {
        const hay = `${car.year} ${car.make} ${car.model} ${car.engine} ${car.className}`.toLowerCase();
        if (!hay.includes(keyword)) return false;
      }
      return true;
    });

    if (apiCountEl) {
      apiCountEl.textContent = newCarsState.apiCars.length
        ? `${filteredApiCars.length} Live API Models (2024–2026)`
        : (newCarsState.isLoading ? 'Loading Cars API...' : 'Cars API Ready');
    }

    if (!filteredApiCars.length) {
      apiGrid.innerHTML = `
        <div class="col-span-full py-10 text-center text-slate-400 glass-panel rounded-2xl border border-slate-800">
          <p class="text-xs text-slate-300">${newCarsState.isLoading ? 'Fetching live 2024–2026 models from Cars API...' : 'No 2024–2026 Cars API models matched this filter. Click Sync API to refresh.'}</p>
        </div>
      `;
    } else {
      apiGrid.innerHTML = filteredApiCars.map((car, idx) => `
        <div class="glass-card rounded-3xl overflow-hidden border border-slate-800 flex flex-col justify-between">
          <div>
            <div class="relative h-48 bg-slate-950 overflow-hidden">
              <img src="${pickApiCarPhoto(car.make, car.model, idx)}" alt="${escapeHtml(car.name)}" class="w-full h-full object-cover">
              <span class="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-sky-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                ${escapeHtml(car.year)} API Spec
              </span>
              <span class="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-slate-950/85 border border-slate-700 text-slate-200 text-[10px] font-bold">
                ${escapeHtml(car.drive)}
              </span>
            </div>

            <div class="p-5">
              <div class="flex items-center justify-between gap-2">
                <span class="text-sm font-extrabold text-amber-400">Price on Request (${escapeHtml(activeCurr)})</span>
                <span class="text-[10px] text-slate-400 font-semibold">${escapeHtml(car.className)}</span>
              </div>
              <h4 class="text-base font-extrabold text-white mt-1">
                ${escapeHtml(car.name)}
              </h4>

              <div class="grid grid-cols-2 gap-2 mt-3 text-[11px] text-slate-300">
                <div class="px-2.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800">
                  <span class="block text-[10px] text-slate-500 uppercase font-bold">Model Year</span>
                  <span class="font-bold text-white">${escapeHtml(car.year)}</span>
                </div>
                <div class="px-2.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800">
                  <span class="block text-[10px] text-slate-500 uppercase font-bold">Engine</span>
                  <span class="font-bold text-white truncate block" title="${escapeHtml(car.engine)}">${escapeHtml(car.engine)}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="px-5 pb-5 pt-2 flex items-center gap-2 border-t border-slate-800/70">
            <button onclick="inquireNewApiCar('${escapeHtml(car.name).replace(/'/g, "\\'")}')" class="flex-1 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/30 font-extrabold text-xs transition-colors flex items-center justify-center space-x-1.5">
              <i data-lucide="message-circle" class="w-3.5 h-3.5"></i>
              <span>WhatsApp (+923435972004)</span>
            </button>
            <a href="mailto:desihoodcars@gmail.com?subject=${encodeURIComponent(`New Car Price Request: ${car.name} (${activeCurr})`)}" title="Email desihoodcars@gmail.com" class="px-3 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/30 font-bold text-xs inline-flex items-center space-x-1 transition-colors">
              <i data-lucide="mail" class="w-3.5 h-3.5"></i>
              <span>Email</span>
            </a>
          </div>
        </div>
      `).join('');
    }
  }

  lucide.createIcons();
}

// ==========================================
// YOUTUBE CHANNEL (@DesiBoysCars) ENGINE
// ==========================================
let youtubeState = {
  isLoading: false,
  syncedAt: null,
  activeVideoId: '7TK_xM8cz_k',
  channelUrl: 'https://www.youtube.com/@DesiBoysCars',
  subscribeUrl: 'https://www.youtube.com/@DesiBoysCars?sub_confirmation=1',
  videos: []
};

async function loadYouTubeChannelVideos(manualTrigger = false) {
  if (youtubeState.isLoading) return;
  youtubeState.isLoading = true;

  const btn = document.getElementById('btn-refresh-youtube');
  const statusEl = document.getElementById('youtube-sync-status');
  if (btn) btn.disabled = true;
  if (statusEl) statusEl.textContent = 'Syncing @DesiBoysCars...';

  try {
    const res = await fetch('/api/youtube', { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (Array.isArray(data?.videos) && data.videos.length) {
      youtubeState.videos = data.videos;
      youtubeState.activeVideoId = data.videos[0].videoId;
    }
    youtubeState.syncedAt = data?.fetchedAt || new Date().toISOString();

    if (statusEl) {
      statusEl.textContent = `${youtubeState.videos.length} Videos Synced • @DesiBoysCars`;
    }
    renderYouTubeView();
    if (manualTrigger) {
      showToast('YouTube Synced', `Loaded ${youtubeState.videos.length} latest videos from @DesiBoysCars.`, 'success');
    }
  } catch (err) {
    if (statusEl) statusEl.textContent = '@DesiBoysCars Channel Connected';
    renderYouTubeView();
    if (manualTrigger) {
      showToast('Channel Ready', 'Watch or subscribe to @DesiBoysCars directly on YouTube.', 'info');
    }
  } finally {
    youtubeState.isLoading = false;
    if (btn) btn.disabled = false;
  }
}

function playYouTubeVideo(videoId) {
  if (!videoId) return;
  youtubeState.activeVideoId = videoId;
  renderYouTubeView();
  document.getElementById('youtube-featured-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function shareYouTubeVideoWhatsApp(videoId) {
  const v = youtubeState.videos.find(item => item.videoId === videoId);
  const url = v ? v.url : `https://www.youtube.com/watch?v=${videoId}`;
  const text = `${v ? v.title : 'Watch Desi Hood Cars on YouTube'} — @DesiBoysCars\n${url}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
}

async function shareYouTubeVideo(videoId) {
  const v = youtubeState.videos.find(item => item.videoId === videoId);
  const url = v ? v.url : `https://www.youtube.com/watch?v=${videoId}`;
  const title = v ? v.title : 'Desi Hood Cars (@DesiBoysCars)';
  if (navigator.share) {
    try {
      await navigator.share({ title, text: `${title} — Watch on @DesiBoysCars`, url });
      return;
    } catch (err) {
      if (err?.name === 'AbortError') return;
    }
  }
  await copyShareText(`${title}\n${url}`, 'YouTube video link');
}

function renderYouTubeView() {
  const playerWrap = document.getElementById('youtube-featured-player');
  const grid = document.getElementById('youtube-videos-grid');
  if (!playerWrap || !grid) return;

  const activeVid = youtubeState.videos.find(v => v.videoId === youtubeState.activeVideoId) || youtubeState.videos[0];
  const vidId = activeVid?.videoId || youtubeState.activeVideoId || '7TK_xM8cz_k';

  playerWrap.innerHTML = `
    <div class="relative w-full aspect-video bg-black">
      <iframe
        src="https://www.youtube.com/embed/${escapeHtml(vidId)}?rel=0"
        title="${escapeHtml(activeVid?.title || 'Desi Hood Cars (@DesiBoysCars)')}"
        class="w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen>
      </iframe>
    </div>
    ${activeVid ? `
      <div class="p-4 bg-slate-900/90 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 class="text-sm sm:text-base font-extrabold text-white">${escapeHtml(activeVid.title)}</h3>
          <p class="text-xs text-slate-400 mt-0.5">${escapeHtml(activeVid.publishedDate || '')}${activeVid.views ? ` &bull; ${formatNumber(activeVid.views)} views` : ''}</p>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <a href="${escapeHtml(activeVid.url)}" target="_blank" rel="noopener noreferrer" class="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold inline-flex items-center space-x-1.5">
            <span>Open on YouTube</span>
            <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
          </a>
          <button onclick="shareYouTubeVideoWhatsApp('${escapeHtml(activeVid.videoId)}')" class="px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/30 text-xs font-bold">
            WhatsApp
          </button>
        </div>
      </div>
    ` : ''}
  `;

  if (!youtubeState.videos.length) {
    grid.innerHTML = `
      <div class="col-span-full py-10 text-center glass-panel rounded-2xl border border-slate-800">
        <p class="text-xs text-slate-300 mb-3">${youtubeState.isLoading ? 'Loading latest videos from @DesiBoysCars...' : 'Subscribe or click Sync Videos to load the latest uploads from @DesiBoysCars.'}</p>
        <a href="https://www.youtube.com/@DesiBoysCars" target="_blank" rel="noopener noreferrer" class="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold">
          <span>Visit @DesiBoysCars on YouTube</span>
        </a>
      </div>
    `;
  } else {
    grid.innerHTML = youtubeState.videos.map(v => `
      <div class="glass-card rounded-3xl overflow-hidden border border-slate-800 flex flex-col justify-between">
        <div>
          <div onclick="playYouTubeVideo('${escapeHtml(v.videoId)}')" class="relative h-48 bg-black overflow-hidden cursor-pointer">
            <img src="${escapeHtml(v.thumbnail)}" alt="${escapeHtml(v.title)}" class="w-full h-full object-cover">
            <span class="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center space-x-1">
              <i data-lucide="play" class="w-3 h-3"></i>
              <span>Watch</span>
            </span>
            ${v.views ? `<span class="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-slate-950/85 text-slate-200 text-[10px] font-semibold">${formatNumber(v.views)} views</span>` : ''}
          </div>
          <div class="p-5">
            <span class="text-[10px] font-bold uppercase tracking-wider text-rose-400">@DesiBoysCars &bull; ${escapeHtml(v.publishedDate || '')}</span>
            <h4 onclick="playYouTubeVideo('${escapeHtml(v.videoId)}')" class="text-sm font-extrabold text-white mt-1 hover:text-amber-400 cursor-pointer line-clamp-2">
              ${escapeHtml(v.title)}
            </h4>
            ${v.description ? `<p class="text-xs text-slate-400 mt-2 line-clamp-2">${escapeHtml(v.description)}</p>` : ''}
          </div>
        </div>
        <div class="px-5 pb-5 pt-2 flex items-center gap-1.5 border-t border-slate-800/70">
          <button onclick="playYouTubeVideo('${escapeHtml(v.videoId)}')" class="flex-1 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 text-xs font-bold transition-colors">
            Play Video
          </button>
          <a href="${escapeHtml(v.url)}" target="_blank" rel="noopener noreferrer" class="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold inline-flex items-center space-x-1">
            <span>YT</span>
            <i data-lucide="external-link" class="w-3 h-3"></i>
          </a>
          <button onclick="shareYouTubeVideoWhatsApp('${escapeHtml(v.videoId)}')" title="Share on WhatsApp" class="p-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/30 transition-colors">
            <i data-lucide="message-circle" class="w-3.5 h-3.5"></i>
          </button>
          <button onclick="shareYouTubeVideo('${escapeHtml(v.videoId)}')" title="Share Link" class="p-2 rounded-xl bg-sky-500/15 hover:bg-sky-500 text-sky-400 hover:text-slate-950 border border-sky-500/30 transition-colors">
            <i data-lucide="share-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>
    `).join('');
  }

  lucide.createIcons();
}

// ==========================================
// ADMIN ONLY: SHOWROOM OWNERS PAKISTAN DIRECTORY
// ==========================================
const PK_SHOWROOM_STORAGE_KEY = 'desihood_pk_showroom_owners_v2';

const PK_SAMPLE_SHOWROOM_OWNERS = [
  {
    id: 'pk-sample-1',
    showroomName: 'Sample Car Showroom (Example)',
    ownerName: 'Example Car Owner',
    city: 'Lahore',
    category: 'Car Showroom',
    phone: '+92 300 0000001',
    email: 'sample.car@example.com',
    location: 'Main Boulevard, Gulberg (Sample Address)',
    status: 'Active',
    isSample: true
  },
  {
    id: 'pk-sample-2',
    showroomName: 'Sample Bike Showroom (Example)',
    ownerName: 'Example Bike Owner',
    city: 'Karachi',
    category: 'Bike Showroom',
    phone: '+92 300 0000002',
    email: 'sample.bike@example.com',
    location: 'Saddar Road (Sample Address)',
    status: 'In Active',
    isSample: true
  }
];

function getPkShowroomOwners() {
  try {
    if (localStorage.getItem('desihood_pk_showroom_owners')) {
      localStorage.removeItem('desihood_pk_showroom_owners');
    }
    const raw = localStorage.getItem(PK_SHOWROOM_STORAGE_KEY);
    if (raw === null) {
      localStorage.setItem(PK_SHOWROOM_STORAGE_KEY, JSON.stringify(PK_SAMPLE_SHOWROOM_OWNERS));
      return [...PK_SAMPLE_SHOWROOM_OWNERS];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [...PK_SAMPLE_SHOWROOM_OWNERS];
  }
}

function savePkShowroomOwners(list) {
  localStorage.setItem(PK_SHOWROOM_STORAGE_KEY, JSON.stringify(list));
}

async function syncShowroomOwnersPkFromCloud() {
  if (typeof sbLoadPkShowroomOwners !== 'function') return;
  const cloudRows = await sbLoadPkShowroomOwners();
  if (!Array.isArray(cloudRows)) return;

  if (cloudRows.length > 0) {
    const localList = getPkShowroomOwners();
    const cloudIds = new Set(cloudRows.map(r => r.id));
    const localOnlyReal = localList.filter(item => !item.isSample && !cloudIds.has(item.id));
    savePkShowroomOwners([...cloudRows, ...localOnlyReal]);
    if (appState.isOwnerAuthenticated && appState.currentView === 'showroom-owners-pk') {
      renderShowroomOwnersPK();
    }
  }
}

function openShowroomOwnersPKPage() {
  if (!requireOwnerAccess()) return;
  switchView('showroom-owners-pk');
}

function togglePkShowroomAddForm(forceShow) {
  if (!requireOwnerAccess()) return;
  const box = document.getElementById('pk-showroom-add-box');
  if (!box) return;
  if (typeof forceShow === 'boolean') {
    box.classList.toggle('hidden', !forceShow);
  } else {
    box.classList.toggle('hidden');
  }
  if (box.classList.contains('hidden')) {
    resetPkShowroomForm();
  }
}

function resetPkShowroomForm() {
  const form = document.getElementById('pk-showroom-owner-form');
  if (form) form.reset();
  const editIdEl = document.getElementById('pk-so-edit-id');
  const titleEl = document.getElementById('pk-showroom-form-title');
  const submitBtn = document.getElementById('pk-so-submit-btn');
  if (editIdEl) editIdEl.value = '';
  if (titleEl) titleEl.textContent = 'Add New Pakistan Showroom Owner';
  if (submitBtn) submitBtn.textContent = 'Save Showroom Owner';
}

function openAddPkShowroomOwnerForm() {
  if (!requireOwnerAccess()) return;
  resetPkShowroomForm();
  togglePkShowroomAddForm(true);
  document.getElementById('pk-so-name')?.focus();
}

function editPkShowroomOwner(id) {
  if (!requireOwnerAccess()) return;
  const item = getPkShowroomOwners().find(s => s.id === id);
  if (!item) return;

  document.getElementById('pk-so-edit-id').value = item.id;
  document.getElementById('pk-so-name').value = item.showroomName || '';
  document.getElementById('pk-so-owner').value = item.ownerName || '';
  document.getElementById('pk-so-city').value = item.city || '';
  document.getElementById('pk-so-category').value = item.category || 'Car Showroom';
  document.getElementById('pk-so-phone').value = item.phone || '';
  document.getElementById('pk-so-email').value = item.email || '';
  document.getElementById('pk-so-location').value = item.location || '';
  document.getElementById('pk-so-status').value = item.status || 'Active';

  const titleEl = document.getElementById('pk-showroom-form-title');
  const submitBtn = document.getElementById('pk-so-submit-btn');
  if (titleEl) titleEl.textContent = `Edit Showroom Owner: ${item.showroomName}`;
  if (submitBtn) submitBtn.textContent = 'Update Showroom Owner';

  togglePkShowroomAddForm(true);
  document.getElementById('pk-showroom-add-box')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function handleSavePkShowroomOwner(e) {
  e.preventDefault();
  if (!requireOwnerAccess()) return;

  const list = getPkShowroomOwners();
  const editId = document.getElementById('pk-so-edit-id')?.value.trim();

  const record = {
    id: editId || ('pk-so-' + Date.now()),
    showroomName: document.getElementById('pk-so-name').value.trim(),
    ownerName: document.getElementById('pk-so-owner').value.trim(),
    city: document.getElementById('pk-so-city').value.trim(),
    category: document.getElementById('pk-so-category').value,
    phone: document.getElementById('pk-so-phone').value.trim(),
    email: document.getElementById('pk-so-email').value.trim(),
    location: document.getElementById('pk-so-location').value.trim(),
    status: document.getElementById('pk-so-status').value,
    isSample: false
  };

  if (editId) {
    const idx = list.findIndex(s => s.id === editId);
    if (idx !== -1) list[idx] = record;
    else list.unshift(record);
    showToast('Showroom Updated', `${record.showroomName} updated and saved.`, 'success');
  } else {
    list.unshift(record);
    showToast('Showroom Added', `${record.showroomName} saved to Showroom Owners Pakistan.`, 'success');
  }

  savePkShowroomOwners(list);
  if (typeof sbUpsertRecord === 'function' && typeof mapShowroomOwnerToRow === 'function') {
    sbUpsertRecord('showroom_owners_pk', mapShowroomOwnerToRow(record));
  }

  resetPkShowroomForm();
  togglePkShowroomAddForm(false);
  renderShowroomOwnersPK();
}

function togglePkShowroomStatus(id) {
  if (!requireOwnerAccess()) return;
  const list = getPkShowroomOwners();
  const item = list.find(s => s.id === id);
  if (!item) return;
  item.status = item.status === 'Active' ? 'In Active' : 'Active';
  savePkShowroomOwners(list);
  if (!item.isSample && typeof sbUpsertRecord === 'function' && typeof mapShowroomOwnerToRow === 'function') {
    sbUpsertRecord('showroom_owners_pk', mapShowroomOwnerToRow(item));
  }
  renderShowroomOwnersPK();
  showToast('Status Updated', `${item.showroomName} is now ${item.status}.`, 'info');
}

function deletePkShowroomOwner(id) {
  if (!requireOwnerAccess()) return;
  if (!confirm('Delete this showroom owner permanently?')) return;
  const list = getPkShowroomOwners().filter(s => s.id !== id);
  savePkShowroomOwners(list);
  if (typeof sbDeleteRecord === 'function') {
    sbDeleteRecord('showroom_owners_pk', id);
  }
  renderShowroomOwnersPK();
  showToast('Deleted', 'Showroom owner removed.', 'info');
}

function clearSamplePkShowroomOwners() {
  if (!requireOwnerAccess()) return;
  const remaining = getPkShowroomOwners().filter(s => !s.isSample && !String(s.id).startsWith('pk-sample-'));
  savePkShowroomOwners(remaining);
  renderShowroomOwnersPK();
  showToast('Samples Cleared', 'Sample rows removed. Table is ready for your real showroom data.', 'info');
}

function getFilteredPkShowroomOwners(list) {
  const keyword = (document.getElementById('pk-so-search')?.value || '').toLowerCase().trim();
  const cityFilter = document.getElementById('pk-so-filter-city')?.value || 'all';
  const catFilter = document.getElementById('pk-so-filter-category')?.value || 'all';
  const statusFilter = document.getElementById('pk-so-filter-status')?.value || 'all';

  return list.filter(item => {
    if (cityFilter !== 'all' && item.city !== cityFilter) return false;
    if (catFilter !== 'all' && item.category !== catFilter) return false;
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (keyword) {
      const hay = `${item.showroomName} ${item.ownerName} ${item.city} ${item.category} ${item.phone} ${item.email} ${item.location} ${item.status}`.toLowerCase();
      if (!hay.includes(keyword)) return false;
    }
    return true;
  });
}

function exportPkShowroomOwnersCsv() {
  if (!requireOwnerAccess()) return;
  const rows = getFilteredPkShowroomOwners(getPkShowroomOwners());
  if (!rows.length) {
    showToast('Nothing to Export', 'Add showroom owners first before exporting to Excel / CSV.', 'info');
    return;
  }

  const headers = [
    'Showroom Name',
    'Showroom Owner Name',
    'City',
    'Category',
    'Phone Number',
    'Email Address',
    'Location',
    'Status'
  ];

  const csvEscape = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;
  const lines = [
    headers.map(csvEscape).join(','),
    ...rows.map(r => [
      r.showroomName,
      r.ownerName,
      r.city,
      r.category,
      r.phone,
      r.email,
      r.location,
      r.status
    ].map(csvEscape).join(','))
  ];

  const bom = '\uFEFF';
  const blob = new Blob([bom + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const today = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `showroom-owners-pakistan-${today}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast('Exported to CSV', `Downloaded ${rows.length} showroom owner rows for Excel.`, 'success');
}

function renderShowroomOwnersPK() {
  if (!appState.isOwnerAuthenticated) return;
  const tbody = document.getElementById('pk-showroom-owners-tbody');
  if (!tbody) return;

  const list = getPkShowroomOwners();

  const elTotal = document.getElementById('pk-so-stat-total');
  const elCars = document.getElementById('pk-so-stat-cars');
  const elBikes = document.getElementById('pk-so-stat-bikes');
  const elActive = document.getElementById('pk-so-stat-active');
  const elInactive = document.getElementById('pk-so-stat-inactive');
  const clearSampleBtn = document.getElementById('btn-clear-pk-samples');

  if (elTotal) elTotal.textContent = list.length;
  if (elCars) elCars.textContent = list.filter(s => s.category === 'Car Showroom').length;
  if (elBikes) elBikes.textContent = list.filter(s => s.category === 'Bike Showroom').length;
  if (elActive) elActive.textContent = list.filter(s => s.status === 'Active').length;
  if (elInactive) elInactive.textContent = list.filter(s => s.status !== 'Active').length;
  if (clearSampleBtn) {
    const hasSamples = list.some(s => s.isSample || String(s.id).startsWith('pk-sample-'));
    clearSampleBtn.classList.toggle('hidden', !hasSamples);
  }

  const citySelect = document.getElementById('pk-so-filter-city');
  const currentCity = citySelect ? citySelect.value : 'all';
  if (citySelect) {
    const cities = [...new Set(list.map(s => s.city).filter(Boolean))].sort();
    citySelect.innerHTML = `<option value="all">All Cities (${cities.length})</option>` +
      cities.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
    if (cities.includes(currentCity)) citySelect.value = currentCity;
  }

  const filtered = getFilteredPkShowroomOwners(list);

  if (!filtered.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" class="py-10 px-4 text-center text-slate-400">
          ${list.length ? 'No showroom owners match your search or filters.' : 'No showroom owners added yet. Click "+ Add New Owner" above to add real showroom owners.'}
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(item => {
    const isActive = item.status === 'Active';
    const isBike = item.category === 'Bike Showroom';
    const isSample = Boolean(item.isSample || String(item.id).startsWith('pk-sample-'));
    const cleanPhone = String(item.phone || '').replace(/[^0-9+]/g, '');
    return `
      <tr class="hover:bg-slate-900/60 transition-colors ${isSample ? 'bg-amber-500/5' : ''}">
        <td class="py-3.5 px-4 font-extrabold text-white whitespace-nowrap">
          <span>${escapeHtml(item.showroomName)}</span>
          ${isSample ? '<span class="ml-1.5 px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[9px] font-bold uppercase">Sample</span>' : ''}
        </td>
        <td class="py-3.5 px-4 text-slate-200 font-semibold whitespace-nowrap">${escapeHtml(item.ownerName)}</td>
        <td class="py-3.5 px-4 text-amber-400 font-bold whitespace-nowrap">${escapeHtml(item.city)}</td>
        <td class="py-3.5 px-4 whitespace-nowrap">
          <span class="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase ${isBike ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'}">
            ${escapeHtml(item.category)}
          </span>
        </td>
        <td class="py-3.5 px-4 whitespace-nowrap font-mono">
          <a href="tel:${escapeHtml(cleanPhone)}" class="text-emerald-400 hover:underline">${escapeHtml(item.phone)}</a>
        </td>
        <td class="py-3.5 px-4 whitespace-nowrap">
          <a href="mailto:${escapeHtml(item.email)}" class="text-sky-400 hover:underline">${escapeHtml(item.email)}</a>
        </td>
        <td class="py-3.5 px-4 text-slate-300 min-w-[200px]">${escapeHtml(item.location)}</td>
        <td class="py-3.5 px-4 whitespace-nowrap">
          <button onclick="togglePkShowroomStatus('${escapeHtml(item.id)}')" title="Click to toggle Active / In Active" class="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase cursor-pointer transition-colors ${isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'}">
            ${escapeHtml(item.status)}
          </button>
        </td>
        <td class="py-3.5 px-4 whitespace-nowrap text-right space-x-1.5">
          <button onclick="editPkShowroomOwner('${escapeHtml(item.id)}')" title="Edit" class="px-2.5 py-1 rounded-lg bg-sky-500/15 hover:bg-sky-500 text-sky-400 hover:text-slate-950 border border-sky-500/30 text-[11px] font-bold transition-colors">
            Edit
          </button>
          <button onclick="deletePkShowroomOwner('${escapeHtml(item.id)}')" title="Delete" class="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 text-[11px] font-bold transition-colors">
            Delete
          </button>
        </td>
      </tr>
    `;
  }).join('');

  lucide.createIcons();
}
