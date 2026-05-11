# CXP Puffin Recon — Setup & Run Guide

SMS Event Processing Reconciliation System
Stack: .NET 8 (C# / ASP.NET Core) + React 18 (Vite / Tailwind / Recharts) + SQL Server

---

## Project Structure

CXP_PuffinRecon/
├── SQL/
│   └── sp_GetReconciliationDashboard.sql   <- Run this in SQL Server FIRST
├── Backend/
│   ├── appsettings.json                    <- Set your DB connection string here
│   ├── Program.cs
│   ├── PuffinRecon.API.csproj
│   ├── Controllers/
│   │   ├── ReconciliationController.cs
│   │   └── DashboardController.cs
│   ├── Services/ReconciliationService.cs
│   ├── Models/ReconciliationModels.cs
│   ├── Infrastructure/DbConnectionFactory.cs
│   └── Middleware/GlobalExceptionMiddleware.cs
└── Frontend/
    ├── package.json
    ├── .env                                <- Set API URL here
    └── src/
        ├── App.jsx
        ├── components/  (Dashboard, FilterBar, ReconciliationTable)
        ├── hooks/       (useReconciliation, useDashboard)
        └── services/    (api.js)

---

## Prerequisites

  Tool        Version   Download
  .NET SDK    8.0+      https://dotnet.microsoft.com/download/dotnet/8.0
  Node.js     18+       https://nodejs.org
  SQL Server  2019+     (your existing instance)

Verify installs:
  dotnet --version    # should show 8.x.x
  node --version      # should show v18.x or higher
  npm --version       # should show 9.x or higher

---

## STEP 1 — Database Setup

Open SQL Server Management Studio (SSMS) or Azure Data Studio.

1a. Run the stored procedures
    Open:  SQL/sp_GetReconciliationDashboard.sql
    Press: F5 (or click Execute)

    This creates two SPs:
    - sp_GetReconciliationDetail     (record-level view, Content Match %, 5-state status)
    - sp_GetReconciliationDashboard  (KPI summary + service breakdown for dashboard)

1b. Verify they were created:
    EXEC sp_GetReconciliationDashboard;
    EXEC sp_GetReconciliationDetail;

    Both should run without errors.

---

## STEP 2 — Backend Setup

2a. Edit connection string
    Open:  Backend/appsettings.json
    Update the "PuffinDB" value:

    SQL Auth example:
    "Server=192.168.1.10;Database=PuffinDB;User Id=sa;Password=YourPass;TrustServerCertificate=True;"

    Windows Auth example:
    "Server=localhost;Database=PuffinDB;Integrated Security=True;TrustServerCertificate=True;"

    Named instance example:
    "Server=MYPC\SQLEXPRESS;Database=PuffinDB;Integrated Security=True;TrustServerCertificate=True;"

2b. Run the backend
    Open a terminal and run:

    cd CXP_PuffinRecon/Backend
    dotnet restore
    dotnet run

    You should see:
    "Now listening on: http://localhost:5000"

2c. Verify — open in browser:
    http://localhost:5000/swagger

    You should see Swagger UI with 3 endpoints:
    GET /api/reconciliation
    GET /api/reconciliation/export
    GET /api/dashboard

---

## STEP 3 — Frontend Setup

3a. Set the API URL
    Open:  Frontend/.env
    Make sure it contains:

    VITE_API_URL=http://localhost:5000

    (Change port if your backend started on a different port)

3b. Install dependencies
    cd CXP_PuffinRecon/Frontend
    npm install

    (Takes 30-60 seconds. Only needed once.)

3c. Run the frontend
    npm run dev

    You should see:
    "Local: http://localhost:5173/"

3d. Open the app
    http://localhost:5173

---

## Running Both Together

Open TWO terminal windows:

  Terminal 1 (Backend):
    cd CXP_PuffinRecon/Backend
    dotnet run

  Terminal 2 (Frontend):
    cd CXP_PuffinRecon/Frontend
    npm install    <- only first time
    npm run dev

Then open: http://localhost:5173

---

## API Endpoints

  GET /api/reconciliation
    ?mobileNumber=  partial mobile filter
    ?statusFilter=  SUCCESS | FAILED | NOT SENT | SERVICE MAPPED WRONG | MESSAGE NOT MATCHED
    ?dateFrom=      2026-01-01T00:00:00
    ?dateTo=        2026-12-31T23:59:59

  GET /api/reconciliation/export
    Same params — downloads color-coded Excel file

  GET /api/dashboard
    ?dateFrom=  optional
    ?dateTo=    optional
    Returns: { summary: {...}, serviceBreakdown: [...] }

---

## Dashboard Panels

  Panel                   Data             Description
  8 KPI Cards             RS1 summary      Total / Success / Failed / Not Sent /
                                           Svc Mapped Wrong / Msg Not Matched /
                                           Avg & Max Processing Time
  Status Donut            RS1 summary      Pie chart of all 5 statuses
  Success Rate Gauge      RS1 summary      SVG arc gauge + timing tiles
  Stacked Bar Chart       RS2 services     Top 12 services stacked by status
  Service Detail Table    RS2 services     Per-service breakdown with success %

---

## Status Values

  Status                  Color    Meaning
  SUCCESS                 Green    IsProcessed=1, archive found, match >= 90%
  FAILED                  Red      IsProcessed = 0
  NOT SENT                Amber    No MSISDN found in Archive_SMS
  SERVICE MAPPED WRONG    Orange   Service journey != Source journey
  MESSAGE NOT MATCHED     Purple   Content match % < 90

---

## Troubleshooting

  Backend connection error
  -> Check appsettings.json connection string
  -> Ensure SQL Server is running and reachable
  -> Add TrustServerCertificate=True to the connection string

  Frontend shows "Failed to load dashboard"
  -> Make sure Backend is running first
  -> Check Frontend/.env has correct VITE_API_URL
  -> Check browser console for CORS errors
  -> Add your frontend URL to Cors.AllowedOrigins in appsettings.json

  npm install fails
  -> node --version must show v18 or higher
  -> Try: npm install --legacy-peer-deps

  SP execution error
  -> Make sure required tables exist:
     d_CX_Customer_detail, Archive_SMS, Service_ServiceMaster,
     Dictionary_TenantDatabaseSource, Service_ServiceDetail_SMS,
     Dictionary_MessageTemplateMaster

  Port conflict
  -> Backend:  dotnet run --urls http://localhost:5050
  -> Frontend: Vite auto-picks next available port
  -> Update Frontend/.env with new backend port

---

## Production Build

  Backend:
    cd CXP_PuffinRecon/Backend
    dotnet publish -c Release -o ./publish

  Frontend:
    cd CXP_PuffinRecon/Frontend
    npm run build
    # Output in ./dist — deploy to IIS, Nginx, or Azure Static Web Apps

