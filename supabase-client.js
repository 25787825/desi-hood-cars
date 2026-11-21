/**
 * Manual Supabase Connection & Cloud Sync Engine (No MCP / No Plugins)
 * Project: Desi Hood Cars by AHMAD RAZA
 */

const SUPABASE_CONFIG = {
  url: "https://rktpglykpwxydaqrurom.supabase.co",
  publishableKey: "sb_publishable_aLujgd3kkEvwcHfkQxQKng_M7_JNsX2"
};

let supabaseClient = null;
const supabaseSyncState = {
  connected: false,
  schemaReady: false,
  lastCheckedAt: null,
  lastMessage: "Initializing manual Supabase client..."
};

function initSupabaseClient() {
  try {
    if (window.supabase && typeof window.supabase.createClient === "function") {
      supabaseClient = window.supabase.createClient(
        SUPABASE_CONFIG.url,
        SUPABASE_CONFIG.publishableKey,
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: false
          }
        }
      );
      supabaseSyncState.connected = true;
      supabaseSyncState.lastMessage = "Supabase JS client initialized manually.";
      return supabaseClient;
    }
    supabaseSyncState.lastMessage = "Supabase JS SDK not loaded; running offline/localStorage mode.";
  } catch (err) {
    console.warn("Supabase client init error:", err);
    supabaseSyncState.lastMessage = err.message || "Client init failed";
  }
  return null;
}

// Field mappers between app camelCase and Postgres snake_case
function mapDealerToRow(d) {
  return {
    id: d.id,
    name: d.name,
    owner: d.owner || "",
    email: d.email || "",
    phone: d.phone || "",
    whatsapp: d.whatsapp || "",
    location: d.location || "",
    country: d.country || "US",
    address: d.address || "",
    license: d.license || "",
    avatar: d.avatar || "",
    description: d.description || "",
    rating: Number(d.rating || 5.0),
    reviews_count: Number(d.reviewsCount || 1),
    verified: d.verified !== false,
    banned: Boolean(d.banned),
    ban_reason: d.banReason || "",
    banned_at: d.bannedAt || null,
    total_cars_sold: Number(d.totalCarsSold || 0),
    total_sales_volume: Number(d.totalSalesVolume || 0),
    member_since: d.memberSince || ""
  };
}

function mapRowToDealer(row) {
  return {
    id: row.id,
    name: row.name,
    owner: row.owner || "",
    email: row.email || "",
    phone: row.phone || "",
    whatsapp: row.whatsapp || "",
    location: row.location || "",
    country: row.country || "US",
    address: row.address || "",
    license: row.license || "",
    avatar: row.avatar || "",
    description: row.description || "",
    rating: Number(row.rating || 5.0),
    reviewsCount: Number(row.reviews_count || 1),
    verified: Boolean(row.verified),
    banned: Boolean(row.banned),
    banReason: row.ban_reason || "",
    bannedAt: row.banned_at || null,
    totalCarsSold: Number(row.total_cars_sold || 0),
    totalSalesVolume: Number(row.total_sales_volume || 0),
    memberSince: row.member_since || ""
  };
}

function mapCarToRow(c) {
  const cleanFeatures = (Array.isArray(c.features) ? c.features : []).filter(
    f => typeof f === "string" && !f.startsWith("__OLD_META__:")
  );
  const meta = {};
  if (c.color) meta.color = c.color;
  if (c.isOldCar) meta.isOldCar = true;
  if (c.kilometers !== undefined && c.kilometers !== null && c.kilometers !== "") {
    meta.kilometers = Number(c.kilometers);
  }
  if (c.workingDetails) meta.workingDetails = c.workingDetails;
  if (Object.keys(meta).length > 0) {
    cleanFeatures.push("__OLD_META__:" + JSON.stringify(meta));
  }

  return {
    id: c.id,
    dealer_id: c.dealerId,
    country: c.country || "US",
    make: c.make,
    model: c.model,
    year: Number(c.year),
    price: Number(c.price),
    mileage: Number(c.mileage || 0),
    body_style: c.bodyStyle || "Sedan",
    fuel_type: c.fuelType || "Petrol",
    transmission: c.transmission || "Automatic",
    condition: c.condition || "Used",
    horsepower: c.horsepower ? Number(c.horsepower) : null,
    vin: c.vin || "",
    image: c.image || "",
    description: c.description || "",
    features: cleanFeatures,
    status: c.status === "sold" ? "sold" : "active",
    sold_date: c.soldDate || null,
    featured: Boolean(c.featured)
  };
}

function mapRowToCar(row) {
  const rawFeatures = Array.isArray(row.features) ? row.features : [];
  let meta = {};
  const cleanFeatures = [];
  for (const item of rawFeatures) {
    if (typeof item === "string" && item.startsWith("__OLD_META__:")) {
      try {
        meta = JSON.parse(item.slice("__OLD_META__:".length)) || {};
      } catch {
        // ignore malformed meta
      }
    } else {
      cleanFeatures.push(item);
    }
  }

  return {
    id: row.id,
    dealerId: row.dealer_id,
    country: row.country || "US",
    make: row.make,
    model: row.model,
    year: Number(row.year),
    price: Number(row.price),
    mileage: Number(row.mileage || 0),
    kilometers: meta.kilometers !== undefined ? Number(meta.kilometers) : Math.round(Number(row.mileage || 0) * 1.60934),
    color: meta.color || "",
    isOldCar: Boolean(meta.isOldCar || row.condition === "Old Car" || row.condition === "Used"),
    workingDetails: meta.workingDetails || null,
    bodyStyle: row.body_style || "Sedan",
    fuelType: row.fuel_type || "Petrol",
    transmission: row.transmission || "Automatic",
    condition: row.condition || "Used",
    horsepower: row.horsepower,
    vin: row.vin || "",
    image: row.image || "",
    description: row.description || "",
    features: cleanFeatures,
    status: row.status === "sold" ? "sold" : "active",
    soldDate: row.sold_date || null,
    featured: Boolean(row.featured),
    createdAt: row.created_at
  };
}

function mapRequestToRow(r) {
  return {
    id: r.id,
    name: r.name,
    owner: r.owner,
    phone: r.phone,
    whatsapp: r.whatsapp,
    email: r.email,
    country_name: r.countryName || "",
    city: r.city || "",
    location: r.location || "",
    country: r.country || "US",
    address: r.address || "",
    license: r.license || "",
    avatar: r.avatar || "",
    description: r.description || "",
    status: r.status || "pending",
    review_note: r.reviewNote || "",
    submitted_at: r.submittedAt || new Date().toISOString(),
    reviewed_at: r.reviewedAt || null
  };
}

function mapRowToRequest(row) {
  return {
    id: row.id,
    name: row.name,
    owner: row.owner,
    phone: row.phone,
    whatsapp: row.whatsapp,
    email: row.email,
    countryName: row.country_name || "",
    city: row.city || "",
    location: row.location || "",
    country: row.country || "US",
    address: row.address || "",
    license: row.license || "",
    avatar: row.avatar || "",
    description: row.description || "",
    status: row.status || "pending",
    reviewNote: row.review_note || "",
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at
  };
}

function mapBuyerToRow(b) {
  return {
    id: b.id,
    auth_user_id: b.authUserId || null,
    full_name: b.fullName,
    username: b.username,
    dob: b.dob || "",
    id_number: b.idNumber || "",
    email: b.email,
    phone: b.phone,
    whatsapp: b.whatsapp,
    country: b.country,
    city: b.city,
    postal_code: b.postalCode || "",
    address: b.address,
    preferred_currency: b.preferredCurrency || "USD",
    budget_range: b.budgetRange || "",
    preferred_vehicle_type: b.preferredVehicleType || "",
    payment_method: b.paymentMethod || "",
    avatar: b.avatar || "",
    verified_buyer: b.verifiedBuyer !== false
  };
}

function mapRowToBuyer(row) {
  return {
    id: row.id,
    authUserId: row.auth_user_id || null,
    fullName: row.full_name,
    username: row.username,
    dob: row.dob || "",
    idNumber: row.id_number || "",
    email: row.email,
    phone: row.phone,
    whatsapp: row.whatsapp,
    country: row.country,
    city: row.city,
    postalCode: row.postal_code || "",
    address: row.address,
    preferredCurrency: row.preferred_currency || "USD",
    budgetRange: row.budget_range || "",
    preferredVehicleType: row.preferred_vehicle_type || "",
    paymentMethod: row.payment_method || "",
    avatar: row.avatar || "",
    verifiedBuyer: Boolean(row.verified_buyer),
    createdAt: row.created_at || new Date().toISOString()
  };
}

function mapBlogToRow(b) {
  return {
    id: b.id,
    title: b.title,
    category: b.category,
    author: b.author,
    car_tag: b.carTag || "",
    read_time: b.readTime || "4 min read",
    published_date: b.publishedDate || "",
    image: b.image || "",
    excerpt: b.excerpt || "",
    content: b.content || ""
  };
}

function mapRowToBlog(row) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    author: row.author,
    carTag: row.car_tag || "",
    readTime: row.read_time || "4 min read",
    publishedDate: row.published_date || "",
    image: row.image || "",
    excerpt: row.excerpt || "",
    content: row.content || ""
  };
}

function mapPartToRow(p) {
  return {
    id: p.id,
    name: p.name,
    category: p.category || "Engine",
    part_number: p.partNumber || "",
    compatibility: p.compatibility || "",
    price: Number(p.price || 0),
    country: p.country || "US",
    stock: Number(p.stock || 1),
    image: p.image || "",
    description: p.description || ""
  };
}

function mapRowToPart(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category || "Engine",
    partNumber: row.part_number || "",
    compatibility: row.compatibility || "",
    price: Number(row.price || 0),
    country: row.country || "US",
    stock: Number(row.stock || 1),
    image: row.image || "",
    description: row.description || ""
  };
}

function mapInquiryToRow(i) {
  return {
    id: i.id,
    car_id: i.carId || null,
    dealer_id: i.dealerId || null,
    car_name: i.carName || "",
    customer_name: i.customerName,
    customer_email: i.customerEmail,
    customer_phone: i.customerPhone,
    type: i.type || "Check Availability",
    message: i.message || "",
    status: i.status || "New"
  };
}

async function seedInitialCloudDataIfEmpty() {
  if (!supabaseClient) return false;
  try {
    if (appState.dealers?.length) {
      await supabaseClient.from("dealers").upsert(appState.dealers.map(mapDealerToRow), { onConflict: "id" });
    }
    if (appState.cars?.length) {
      await supabaseClient.from("cars").upsert(appState.cars.map(mapCarToRow), { onConflict: "id" });
    }
    if (appState.parts?.length) {
      await supabaseClient.from("spare_parts").upsert(appState.parts.map(mapPartToRow), { onConflict: "id" });
    }
    if (appState.blogs?.length) {
      await supabaseClient.from("blogs").upsert(appState.blogs.map(mapBlogToRow), { onConflict: "id" });
    }
    if (appState.inquiries?.length) {
      await supabaseClient.from("inquiries").upsert(appState.inquiries.map(mapInquiryToRow), { onConflict: "id" });
    }
    return true;
  } catch (err) {
    console.warn("Initial Supabase seed skipped:", err);
    return false;
  }
}

async function syncFromSupabase() {
  if (!supabaseClient) initSupabaseClient();
  if (!supabaseClient) return false;

  supabaseSyncState.lastCheckedAt = new Date().toLocaleTimeString();

  try {
    const [dealersRes, carsRes, reqRes, blogsRes, partsRes, inqRes, buyersRes] = await Promise.all([
      supabaseClient.from("dealers").select("*"),
      supabaseClient.from("cars").select("*"),
      supabaseClient.from("dealer_requests").select("*").order("submitted_at", { ascending: false }),
      supabaseClient.from("blogs").select("*"),
      supabaseClient.from("spare_parts").select("*"),
      supabaseClient.from("inquiries").select("*").order("created_at", { ascending: false }),
      supabaseClient.from("buyer_profiles").select("*").order("created_at", { ascending: false })
    ]);

    const firstErr = dealersRes.error || carsRes.error || reqRes.error;
    if (firstErr) {
      supabaseSyncState.connected = true;
      supabaseSyncState.schemaReady = false;
      supabaseSyncState.lastMessage = `Connected to Supabase, waiting for SQL tables (${firstErr.code || firstErr.message}). Local data active.`;
      renderSupabaseStatusUI();
      return false;
    }

    supabaseSyncState.connected = true;
    supabaseSyncState.schemaReady = true;

    // Auto-populate empty Supabase tables with initial showcase catalog on first sync
    if ((dealersRes.data?.length || 0) === 0 && (carsRes.data?.length || 0) === 0) {
      await seedInitialCloudDataIfEmpty();
      supabaseSyncState.lastMessage = `Cloud DB initialized & seeded (${appState.dealers.length} dealers, ${appState.cars.length} cars, ${reqRes.data?.length || 0} requests)`;
    } else {
      supabaseSyncState.lastMessage = `Live Sync Ready (${dealersRes.data?.length || 0} dealers, ${carsRes.data?.length || 0} cars, ${reqRes.data?.length || 0} requests)`;
    }

    if (dealersRes.data && dealersRes.data.length > 0) {
      appState.dealers = dealersRes.data.map(mapRowToDealer);
    }
    if (carsRes.data && carsRes.data.length > 0) {
      appState.cars = carsRes.data.map(mapRowToCar);
    }
    if (reqRes.data && reqRes.data.length > 0) {
      const localOnly = (appState.dealerRequests || []).filter(lr => !reqRes.data.some(sr => sr.id === lr.id));
      appState.dealerRequests = [...reqRes.data.map(mapRowToRequest), ...localOnly];
    }
    if (blogsRes.data && blogsRes.data.length > 0) {
      appState.blogs = blogsRes.data.map(mapRowToBlog);
    }
    if (partsRes.data && partsRes.data.length > 0) {
      appState.parts = partsRes.data.map(mapRowToPart);
    }
    if (inqRes.data && inqRes.data.length > 0) {
      appState.inquiries = inqRes.data.map(row => ({
        id: row.id,
        carId: row.car_id,
        dealerId: row.dealer_id,
        carName: row.car_name,
        customerName: row.customer_name,
        customerEmail: row.customer_email,
        customerPhone: row.customer_phone,
        type: row.type,
        message: row.message,
        status: row.status,
        createdAt: row.created_at
      }));
    }
    if (buyersRes.data && buyersRes.data.length > 0) {
      const existingById = new Map((appState.buyers || []).map(b => [b.id, b]));
      const mergedBuyers = buyersRes.data.map(row => {
        const mapped = mapRowToBuyer(row);
        const prev = existingById.get(mapped.id);
        if (prev && prev.password) mapped.password = prev.password;
        return mapped;
      });
      const cloudIds = new Set(mergedBuyers.map(b => b.id));
      const localOnlyBuyers = (appState.buyers || []).filter(b => !cloudIds.has(b.id));
      appState.buyers = [...mergedBuyers, ...localOnlyBuyers];
    }

    saveAllState();
    populateDealerDropdown();
    renderMarketplace();
    renderDealersDirectory();
    renderSpareParts();
    renderBlogs();
    updateOwnerPendingBadge();
    updateMarketStatusBar();
    renderSupabaseStatusUI();
    return true;
  } catch (err) {
    supabaseSyncState.lastMessage = `Supabase check fallback: ${err.message}`;
    renderSupabaseStatusUI();
    return false;
  }
}

async function sbUpsertRecord(table, payload) {
  if (!supabaseClient) initSupabaseClient();
  if (!supabaseClient) return { ok: false, error: "Supabase client unavailable" };
  try {
    const { error } = await supabaseClient.from(table).upsert(payload, { onConflict: "id" });
    if (error) {
      console.warn(`Supabase upsert (${table}) error:`, error.message);
      return { ok: false, error: error.message };
    }
    supabaseSyncState.connected = true;
    supabaseSyncState.schemaReady = true;
    return { ok: true };
  } catch (err) {
    console.warn(`Supabase upsert (${table}) exception:`, err);
    return { ok: false, error: err.message };
  }
}

async function sbDeleteRecord(table, id) {
  if (!supabaseClient) initSupabaseClient();
  if (!supabaseClient) return { ok: false, error: "Supabase client unavailable" };
  try {
    const { error } = await supabaseClient.from(table).delete().eq("id", id);
    if (error) {
      console.warn(`Supabase delete (${table}) error:`, error.message);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (err) {
    console.warn(`Supabase delete (${table}) exception:`, err);
    return { ok: false, error: err.message };
  }
}

async function sbSyncBuyerRegistration(buyer, password) {
  if (!supabaseClient) initSupabaseClient();
  if (!supabaseClient) return { ok: false };
  try {
    if (buyer.email && password) {
      const authRes = await supabaseClient.auth.signUp({
        email: buyer.email,
        password: password,
        options: {
          data: {
            full_name: buyer.fullName,
            username: buyer.username
          }
        }
      });
      if (authRes?.data?.user?.id) {
        buyer.authUserId = authRes.data.user.id;
      }
    }
    return await sbUpsertRecord("buyer_profiles", mapBuyerToRow(buyer));
  } catch (err) {
    console.warn("Supabase buyer sync fallback:", err);
    return await sbUpsertRecord("buyer_profiles", mapBuyerToRow(buyer));
  }
}

async function seedDemoDataToSupabase() {
  if (typeof requireOwnerAccess === "function" && !requireOwnerAccess()) return;
  if (!supabaseClient) initSupabaseClient();
  if (!supabaseClient) {
    showToast("Supabase Unavailable", "Supabase client could not initialize.", "error");
    return;
  }

  try {
    const { error: dErr } = await supabaseClient.from("dealers").upsert(appState.dealers.map(mapDealerToRow), { onConflict: "id" });
    if (dErr) {
      showToast("Run SQL Schema First", `Please run supabase-schema.sql in Supabase SQL Editor first (${dErr.message}).`, "error");
      return;
    }
    await supabaseClient.from("cars").upsert(appState.cars.map(mapCarToRow), { onConflict: "id" });
    if (appState.parts?.length) {
      await supabaseClient.from("spare_parts").upsert(appState.parts.map(mapPartToRow), { onConflict: "id" });
    }
    if (appState.dealerRequests?.length) {
      await supabaseClient.from("dealer_requests").upsert(appState.dealerRequests.map(mapRequestToRow), { onConflict: "id" });
    }
    if (appState.blogs?.length) {
      await supabaseClient.from("blogs").upsert(appState.blogs.map(mapBlogToRow), { onConflict: "id" });
    }
    if (appState.inquiries?.length) {
      await supabaseClient.from("inquiries").upsert(appState.inquiries.map(mapInquiryToRow), { onConflict: "id" });
    }
    supabaseSyncState.schemaReady = true;
    supabaseSyncState.lastMessage = "All Marketplace Dealers, Cars, Blogs & Requests synced to Supabase Cloud!";
    renderSupabaseStatusUI();
    showToast("Synced to Supabase!", "All local marketplace data was pushed to your Supabase database.", "success");
  } catch (err) {
    showToast("Sync Error", err.message || "Failed to push demo data.", "error");
  }
}

function renderSupabaseStatusUI() {
  const statusEl = document.getElementById("owner-supabase-status-text");
  const badgeEl = document.getElementById("owner-supabase-badge");
  if (statusEl) statusEl.textContent = supabaseSyncState.lastMessage;
  if (badgeEl) {
    if (supabaseSyncState.schemaReady) {
      badgeEl.className = "px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase";
      badgeEl.textContent = "Cloud Sync Active";
    } else if (supabaseSyncState.connected) {
      badgeEl.className = "px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase";
      badgeEl.textContent = "Connected (Run Schema SQL)";
    } else {
      badgeEl.className = "px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-black uppercase";
      badgeEl.textContent = "Offline / Local Mode";
    }
  }
}
