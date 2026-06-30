# BillPro — Inventory, Billing & Financial Reporting System

A production-ready full-stack business management system for retail/fabric stores.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS v3 |
| Charts | Recharts |
| PDF/Excel | jsPDF + jspdf-autotable |
| HTTP Client | Axios + React Query |
| State | Zustand |
| Backend | Spring Boot 3.3 (Java 21+) |
| Auth | Spring Security + JWT |
| Database | PostgreSQL 16 |
| Migrations | Flyway |

---

## 🚀 Quick Start

### Prerequisites

- **Java 21+** — [Download](https://www.oracle.com/java/technologies/downloads/)
- **Maven 3.9+** — [Download](https://maven.apache.org/download.cgi)
- **Node.js 18+** — [Download](https://nodejs.org/)
- **PostgreSQL 16** — [Download](https://www.postgresql.org/download/) or use Docker

### Option A: Using Docker (Recommended)

```bash
# 1. Start PostgreSQL + pgAdmin
docker-compose up -d

# 2. Start Backend
cd backend
mvn spring-boot:run

# 3. Start Frontend (new terminal)
cd frontend
npm install
npm run dev
```

### Option B: Manual PostgreSQL Setup

1. Install and start PostgreSQL
2. Create database and user:
```sql
CREATE DATABASE billing_db;
CREATE USER billing_user WITH PASSWORD 'billing_pass';
GRANT ALL PRIVILEGES ON DATABASE billing_db TO billing_user;
```
3. Start backend:
```bash
cd backend
# Set JAVA_HOME if needed:
# set JAVA_HOME=C:\Program Files\Java\jdk-26.0.1
mvn spring-boot:run
```
4. Start frontend:
```bash
cd frontend
npm install
npm run dev
```

---

## Access

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8080 |
| pgAdmin | http://localhost:5050 |

### Default Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Billing Staff | staff | admin123 |

---

## Features

### 📦 Inventory Management
- Auto-generated item codes (ITM000001, ITM000002...)
- Category management
- Low stock alerts with configurable thresholds
- Purchase price, selling price, margin calculator
- Units: Meter, Piece, KG, NOS
- GST tax percentage per item

### 🧾 Billing / POS
- Lightning-fast product search (by name or code)
- Shopping cart with quantity editing
- Discount support (% or fixed ₹ amount)
- Automatic tax calculation
- Payment methods: Cash, UPI, Card, Bank Transfer, Credit
- Auto-generated invoice numbers: INV-2026-000001
- Print invoice / Download PDF
- Customer auto-creation from phone number
- Reprint previous invoices

### 📊 Dashboard
- Today's / Monthly / Quarterly / Annual revenue
- Total products, bills, customers, low stock alerts
- Daily sales trend chart (Area chart)
- Monthly revenue bar chart
- Category performance pie chart
- Top selling products

### 📈 Financial Reports (Admin only)
- Daily Sales Report with invoice list
- Monthly Report with top products
- Quarterly Report with growth % vs previous quarter
- Yearly Report with monthly breakdown

### 🔍 Analytics (Admin only)
- Revenue trend line chart
- Best selling products
- Slow moving products
- Fast moving products
- Category performance bar chart

### ⚙️ Settings (Admin only)
- Company name, address, GST number
- Invoice prefix and number format
- Currency symbol
- Invoice footer message
- User management (create, toggle active, delete)

---

## Project Structure

```
billing-software/
├── backend/                    # Spring Boot API
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/billing/
│       │   ├── BillingApplication.java
│       │   ├── config/         # JWT, Security, CORS
│       │   ├── controller/     # REST endpoints
│       │   ├── dto/            # Request/Response objects
│       │   ├── entity/         # JPA entities
│       │   ├── exception/      # Error handling
│       │   ├── repository/     # Spring Data JPA
│       │   └── service/        # Business logic
│       └── resources/
│           ├── application.yml
│           └── db/migration/   # Flyway SQL migrations
│
├── frontend/                   # React + Vite app
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Route-level pages
│   │   ├── services/           # Axios API calls
│   │   ├── store/              # Zustand state
│   │   └── types/              # TypeScript interfaces
│   ├── index.html
│   └── tailwind.config.js
│
├── docker-compose.yml          # PostgreSQL + pgAdmin
└── README.md
```

---

## API Endpoints

### Auth
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get current user

### Inventory
- `GET /api/items` — List items (search, category filter, pagination)
- `POST /api/items` — Create item
- `PUT /api/items/{id}` — Update item
- `DELETE /api/items/{id}` — Delete item (Admin only)
- `GET /api/items/low-stock` — Low stock items
- `GET /api/items/search?q=` — Search for billing

### Billing
- `POST /api/invoices` — Create invoice (atomic: deducts stock)
- `GET /api/invoices` — Invoice history (with filters)
- `GET /api/invoices/{id}` — Invoice detail

### Dashboard
- `GET /api/dashboard/summary` — KPI metrics
- `GET /api/dashboard/sales-trend` — Daily trend
- `GET /api/dashboard/monthly-trend` — Monthly trend
- `GET /api/dashboard/top-products` — Top sellers
- `GET /api/dashboard/category-performance`

### Reports (Admin only)
- `GET /api/reports/daily?date=2026-06-19`
- `GET /api/reports/monthly?year=2026&month=6`
- `GET /api/reports/quarterly?year=2026&quarter=2`
- `GET /api/reports/yearly?year=2026`

---

## Environment Configuration

### Backend (`backend/src/main/resources/application.yml`)
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/billing_db
    username: billing_user
    password: billing_pass

app:
  jwt:
    secret: your-secret-key-here
    expiration-ms: 86400000
```

### Frontend (`frontend/.env`)
```
VITE_API_URL=http://localhost:8080
```
