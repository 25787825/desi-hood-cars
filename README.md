# Desi Hood Cars by AHMAD RAZA — Vehicle Marketplace & Dealer Network

Desi Hood Cars by AHMAD RAZA is a premium vehicle marketplace and dealer platform that connects verified automotive dealerships directly with prospective car buyers.

---

## 🌟 Key Features

### 1. Buyer & Public Marketplace
- **Hero Quick Search**: Search by Make, Body Style, and Max Price directly from the landing section.
- **Dynamic Multi-Faceted Filtering**:
  - Full-text keyword search across make, model, trim, description, and features.
  - Price slider up to \$220,000+.
  - Powertrain filter (Gasoline, Electric EV, Hybrid, Diesel).
  - Transmission filter (Automatic vs. Manual).
  - Vehicle Condition filter (Certified Pre-Owned, Like New, Used).
  - Sorting: Featured, Price (Low to High, High to Low), Lowest Mileage, Newest Year.
- **Vehicle Detailed Inspection Modal**:
  - High-resolution imagery.
  - Complete specifications table: Engine, Horsepower, Transmission, Drivetrain, Exterior & Interior color, VIN.
  - Verified factory options and package chips.
  - Dealer credentials card with verified badge, phone, and location.
- **Buyer Direct Interactions**:
  - Direct inquiry and price negotiation form.
  - Schedule a Test Drive with date and time picker.
  - Saved Favorites / Watchlist with badge counter.

### 2. Dealership Portal & Inventory Manager
- **Dealer Switcher**: Toggle between different demo dealerships or add your own.
- **Real-Time Dealership Metrics**:
  - Active Vehicles in stock.
  - Total Inventory Dollar Value.
  - Inquiries / Customer Leads received.
  - Dealership star rating and reviews count.
- **Complete Inventory CRUD**:
  - **Add Vehicle**: Full spec input form with auto-photo assignment, pricing, specs, and featured status.
  - **Edit Vehicle**: Update prices, mileage, photos, or descriptions.
  - **Toggle Status**: Mark vehicles as "Active" or "Sold".
  - **Delete Listing**: Remove vehicles permanently.
- **Leads & Inquiries CRM**:
  - View buyer inquiries, price offers, and scheduled test drives.
  - Lead statuses: `New Lead`, `Contacted`, `Closed / Won`.
  - Direct email reply button.

### 3. Data Persistence & Architecture
- Built with standard Web standards: HTML5, Tailwind CSS, Lucide Icons, and Vanilla JavaScript.
- All vehicle listings, inquiries, leads, and favorites are preserved in browser `localStorage`.
- No compilation or build steps needed — works instantly in any web browser.

---

## 🚀 How to Run the Website

### Option 1: Double-Click or Open Directly in Browser
You can open `index.html` directly in Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari:
```powershell
Start-Process "C:\Users\Nouman Ahmed\.gemini\antigravity\scratch\car-dealer-marketplace\index.html"
```

### Option 2: Run with any Local Static Server
If you have a local server installed (e.g. `npx serve`, Python `http.server`, or VS Code Live Server):
```bash
# Example with Python (if installed):
python -m http.server 8000

# Example with Node npx (if installed):
npx serve .
```

---

## 📁 File Structure
```
car-dealer-marketplace/
├── index.html       # Single Page Application structure with Tailwind & Lucide
├── styles.css       # Custom automotive styling, animations, glassmorphism
├── data.js          # Realistic preloaded dataset (cars, dealers, demo leads)
├── app.js           # Core state machine, filters, modal controllers, and CRM
└── README.md        # Documentation and extension guide
```

---

## 🔮 Next Steps & Backend Integration
When you are ready to expand this platform into a production full-stack application:
1. **Database**: Connect to PostgreSQL (via Supabase / Prisma) or Firebase Firestore for shared multi-dealer cloud databases.
2. **Authentication**: Add Firebase Auth or Auth0 for dealer account creation and SMS/email verification.
3. **Cloud Storage**: Use AWS S3 or Cloudinary for direct dealership photo uploads and 360-degree spins.
4. **Stripe Integration**: Charge dealer subscription tiers or listing promotion fees.
