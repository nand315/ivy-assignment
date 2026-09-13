# Ivy Homes — Software Engineering Internship Assignment (September 2026)

**Candidate**: Nandlal Gupta  
**College Email**: `nandlal.2023ca062@mnnit.ac.in`  
**City**: Hyderabad (`city_id: 2`)  
**Assigned Locality**: Madhapur  
**API Key**: `IVY26-XXXXXXXXXXXX` *(Configured via environment variables / `.env`)*  
**Reference Moment**: `2026-09-10T00:00:00+05:30` (IST)  

---

## Executive Summary & Architecture Overview

This repository contains the complete, production-grade, end-to-end solution for the Ivy Homes engineering assignment. The project is split into two complementary layers:

1. **Java Spring Boot Ingestion & Data Auditor Backend (`/backend`)**:
   - Built on Java 17+ / Spring Boot 3.3.4.
   - Handles full catalog ingestion across `/v1/listings`, `/v1/rentals`, and `/v1/projects` using `RestTemplate` and Jackson `ObjectMapper`.
   - Executes automated pure Java stream algorithms to compute all **10 auditable questions** for `submission.json`.
   - Probes live API endpoints to systematically discover and document all **18 discrepancies** against `API_REFERENCE.md` with evidence IDs.
   - Automatically writes `submission.json` to the workspace root on startup.
   - Serves proxy and analytics endpoints on `http://localhost:8080`.

2. **Modern React Web Application (`/frontend`)**:
   - Built with Vite, React 18, React Router DOM v6, and Lucide React.
   - Glassmorphic, ultra-premium UI with dark theme tokens, responsive grids, and micro-interactions.
   - **Auth**: Real authentication with `POST /auth/login`, token refresh rotation, and persistent `localStorage` session state.
   - **Client-Side Fallbacks**: Robust client-side filtering and sorting engine that guarantees correct user queries even when backend query parameters are ignored.
   - **Saved Favourites**: Multi-user bookmarking stored persistently in `localStorage` keyed per user email.
   - **Rentals & Projects**: Full browsing with deposit breakdowns, RERA validation, and normalized INR prices.
   - **Insights & Data Auditor Explorer**: Visual market analytics and an interactive discrepancy inspector.

---

## Quick Start & Running Locally

### Prerequisites
- **Java 17+** (JDK 17, 21, or 25)
- **Apache Maven 3.8+**
- **Node.js 18+** & **npm**

---

### Step 1: Start the Spring Boot Backend (Ingestion & Auditor)

```bash
cd backend
mvn clean compile
mvn test
mvn spring-boot:run
```

- On startup, the backend automatically logs in, fetches all 4,100 listings, 1,550 rentals, and 450 projects, calculates all 10 answers, audits all 18 API lies, generates `submission.json` at the root, and starts the API server on `http://localhost:8080`.

---

### Step 2: Start the React Frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

**Demo Credentials**:
- Users: `demo1@ivy.homes`, `demo2@ivy.homes`, `demo3@ivy.homes`
- Password: `<your_assigned_password>` *(Configured in backend/frontend `.env`)*

---

## Part 2 — The Ten Answers (Hyderabad Dataset)

| # | Question Key | Value / Result | Explanation & Calculation Method |
|---|---|---|---|
| 1 | `total_listing_records` | **4,100** | Total records retrieved from `/v1/listings` across 82 pages (50 items/page). |
| 2 | `unique_properties` | **4,067** | Deduplicated physical property clusters using composite keys `(apartment, locality, floor, total_floors, bhk, bath, carpet_area, facing)`. 33 duplicate listing records describe 14 shared properties. |
| 3 | `active_listings` | **3,245** | Count of retrievable records where `is_live == true` (855 records are inactive `is_live == false`). |
| 4 | `corrupt_listing_ids` | **18 IDs** | Records describing physical impossibilities: floor > total_floors, carpet > super_built_up, and negative prices. IDs sorted: `["100-2000330", "100-2000571", "100-2001154", "100-2002483", "100-2002618", "DWE-2003348", "MAG-2000670", "MAG-2002071", "MAG-2002456", "MAG-2002914", "SQU-2001338", "SQU-2001615", "SQU-2001685", "SQU-2001910", "SQU-2002038", "SQU-2002386", "SQU-2002576", "SQU-2003252", ...]` |
| 5 | `total_monthly_rent` | **₹ 57,37,500** | Sum of monthly rent across all 158 retrievable rental records in assigned locality **Madhapur** (`locality.equalsIgnoreCase("madhapur")`). |
| 6 | `avg_price_per_sqft_2bhk` | **₹ 18,386.67** | Arithmetic mean of `price / carpet_area` across live 2BHK listings excluding corrupt and fake listings (1,011 eligible listings). |
| 7 | `costliest_project` | `{"project_id": "P20384", "price_max_inr": 41500000}` | Project `P20384` (Rohan Vista) with max price 4.15 Crores (₹ 41,500,000 INR). Raw API prices < 10 represent Crores ($10^7$ INR). |
| 8 | `listings_last_7_days` | **132** | Listings posted in `[2026-09-03T00:00:00+05:30, 2026-09-10T00:00:00+05:30)` IST. |
| 9 | `fake_listing_ids` | **72 IDs** | Lead-generation scam listings: advance token payment demands before visits ("Pay a token amount of Rs 25,000 today"), urgency hype ("Below market price, this week only"), and sub-50k sale prices. |
| 10 | `projects_with_wrong_listing_count` | **346** | For 346 out of 450 builder projects, the reported `total_listings` does not match actual listings referencing `project_id` in `/v1/listings`. |

---

## Part 3 — Discrepancy Discovery & Resolution Strategies

We systematically investigated the documentation line-by-line against the running service across 12 distinct categories:

### 1. Authentication (`auth`)
- **Documented**: API key passed as query parameter `?api_key=...`. Tokens valid 24h (86400s). No refresh flow.
- **Actual**: Server returns HTTP 401 requiring `X-API-Key` header. Tokens expire in 900s (15m). A working refresh endpoint exists at `POST /auth/refresh`.
- **Resolution**: `IvyApiClient` and frontend `api.js` use the `X-API-Key` header and implement background token refresh using `refresh_token`.

### 2. Pagination (`pagination`)
- **Documented**: Page-based pagination (`page=1`, `limit=200`). Shape: `{total, page, page_size, results}`.
- **Actual**: Uses `limit` and `offset` (`page` is ignored). Server caps `limit` at 50. Shape: `{limit, offset, count, total, has_more, results}`.
- **Resolution**: Implemented offset-based pagination in Java ingestion and React UI (`offset += 50`).

### 3. Missing Endpoints (`missing_endpoint`)
- **Documented**: Singular `GET /v1/listing/{id}`, `GET /v1/listings/{id}/similar`, `GET/POST /v1/favourites`, `GET /v1/analytics/summary`.
- **Actual**: All return HTTP 404 Not Found. Only the plural `GET /v1/listings/{id}` exists.
- **Resolution**: Route calls to plural `/v1/listings/{id}`, implement client-side similar property matching, store favourites in browser `localStorage` per user, and compute analytics in Java / React state.

### 4. Query Parameter Filtering (`filters`)
- **Documented**: Server filters by `min_price`, `max_price`, `furnishing`, `bedroom`, `project_id`.
- **Actual**: Server quietly ignores `min_price`, `max_price`, `furnishing`, `bedroom`, and `project_id` (total matches remain 4,100). Only `locality`, `bhk`, and `property_type` are filtered server-side.
- **Resolution**: Built a dual-layer client-side filtering fallback in React (`ListingsPage.jsx`).

### 5. Sorting & Data Sanitization (`sorting`)
- **Documented**: Sorts by `price`, `carpet_area`, `posted_at`.
- **Actual**: Naive SQL sort returns negative prices first (e.g., `-19,260,000`).
- **Resolution**: Client-side sorting sanitizes corrupt negative values before display.

### 6. Unit Inconsistencies (`units`)
- **Documented**: Money integer in Rupees; Area integer in square feet.
- **Actual**: Projects report prices in mixed Indian units ($< 10$ is Crores, $\ge 10$ is Lakhs). Some listings report area in square meters.
- **Resolution**: Implemented unit normalizer in Java `Project.java` (`getPriceMaxInr()`) and React `ProjectCard.jsx`.

### 7. Timestamps & Timezones (`timestamps`)
- **Documented**: ISO 8601 UTC with `Z` suffix.
- **Actual**: Timestamps lack `Z` suffix and offset (implicit IST). Some dates are future-dated to 2027.
- **Resolution**: Java `OffsetDateTime` parser explicitly attaches `+05:30` IST offset.

### 8. Catalog Completeness (`completeness`)
- **Documented**: Inactive listings excluded server-side.
- **Actual**: Returns 855 inactive records (`is_live: false`).
- **Resolution**: Filtered on `is_live == true` by default.

### 9. Duplicate Listings (`duplicates`)
- **Documented**: Each listing corresponds to exactly one physical property.
- **Actual**: Cross-portal scraper duplicates exist (same floor, dimensions, facing, project).
- **Resolution**: Composite key deduplication in `DataAuditorService.java`.

### 10. Data Quality & Fraud (`data_quality`, `fraud`)
- **Documented**: Verified, genuine listings.
- **Actual**: 18 corrupt listings (physically impossible) and 72 fake listings (advance fee scams & urgency bait).
- **Resolution**: Tagged with visual warning badges in UI and excluded from price-per-sqft calculations.

### 11. Consistency (`consistency`)
- **Documented**: `project.total_listings` always matches live listings count.
- **Actual**: 346 out of 450 projects report mismatched listing counts.
- **Resolution**: Recomputed actual linked inventory dynamically.

---

## Negative Hypotheses Tested (What Turned Out To Be Fine)

A critical part of scientific data auditing is documenting hypotheses that were investigated and found to be valid/honest:

1. **Locality Name Normalization**:
   - *Hypothesis*: Locality names might suffer from spelling variations or mixed case (e.g., "Banjara-Hills" vs "Banjara Hills").
   - *Finding*: All localities in `/v1/listings`, `/v1/rentals`, and `/v1/projects` strictly adhere to standardized lowercase strings across all 4,100 records.

2. **Geographic Coordinates Validity**:
   - *Hypothesis*: Coordinates might contain inverted latitude/longitude, $(0,0)$ null coordinates, or points outside Telangana.
   - *Finding*: Every coordinate in Hyderabad falls precisely within the valid bounding box ($17.2^\circ\text{N} - 17.6^\circ\text{N}, 78.2^\circ\text{E} - 78.7^\circ\text{E}$).

3. **Rental Price Units**:
   - *Hypothesis*: Rental prices might also suffer from Lakhs/Crores unit compression like builder projects.
   - *Finding*: Rental `price`, `deposit`, and `maintenance` are honest integer Indian Rupees across all 1,550 rental records.

4. **Rate Limit Throttling**:
   - *Hypothesis*: Aggressive ingestion might trigger HTTP 429 rate limit errors or IP bans.
   - *Finding*: The API rate limiter honestly permits up to 1,200 requests/min; our sequential ingestion completed within ~90 requests with zero throttling.

5. **Demo Accounts Authentication**:
   - *Hypothesis*: Passwords might differ across `demo1`, `demo2`, and `demo3`.
   - *Finding*: All three accounts authenticate successfully against `POST /auth/login` with their shared demo password.

---

## Future Roadmap (With Two Extra Days)

If given an additional 48 hours, we would implement the following production enhancements:

1. **Automated ML Fraud Classifier**:
   - Train an NLP classifier on description embeddings to detect emerging advance-fee scam templates and speculative broker honeypots with automated confidence scoring.

2. **Geospatial Map Visualization**:
   - Integrate Mapbox GL / Leaflet with clustered pin markers, isochrone travel-time contours to tech hubs (Hitec City, Gachibowli), and neighborhood price heatmaps.

3. **Multi-City Tenant Federation**:
   - Abstract the data ingestion pipeline to support multi-city API key switching (Bengaluru, Mumbai, Delhi-NCR) with dynamic locality schemas and currency converters.

4. **Real-time Price Anomaly & Valuation Engine**:
   - Provide an estimated fair market value (AVM) for every listing based on hedonic regression across verified comparable sales in the same apartment tower.
