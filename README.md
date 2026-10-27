# Disaster Relief Resource Allocation and Aid Distribution System

## DBMS Level 3 Mini Project

### Team Members
- Rachepalli Nandhitha
- Raksha V

## Project Overview

The Disaster Relief Resource Allocation and Aid Distribution System is a web-based application designed to manage disaster relief operations, including disaster records, relief centers, resources, beneficiaries, aid requests, allocations, and distributions.

The system uses **MySQL** for structured operational data and **MongoDB Atlas** for field reports, supply updates, and activity logs. A Next.js application provides the user interface and backend APIs.

## Technology Stack

- **Frontend:** Next.js, React, TypeScript
- **Backend:** Next.js API Routes
- **Relational Database:** MySQL
- **NoSQL Database:** MongoDB Atlas
- **Authentication:** Login/logout and role-based access control
- **Version Control:** Git and GitHub

## MySQL Database

**Database:** `disaster_relief_db`

The database contains 12 tables:

1. Disaster
2. Relief_Center
3. Resource
4. Beneficiary
5. Aid_Request
6. Request_Item
7. Allocation
8. Allocation_Item
9. Distribution
10. Distribution_Item
11. Inventory_Audit
12. App_User

**Database features:**
- Primary keys, foreign keys, and constraints
- Joins and transactions
- Priority-based and partial resource allocation
- Inventory tracking and auditing
- Views and indexing
- Stored procedures and triggers

**Views:**
- `pending_high_priority_requests`
- `low_stock_resources`
- `distribution_summary`

**Stored procedure:** `Get_Allocation_Report`

**Trigger:** `trg_inventory_audit`

## MongoDB Database

**Database:** `disaster_relief_nosql`

Collections:
- `field_reports` — disaster-related field observations
- `activity_logs` — records of supported application activities
- `supply_updates` — relief supply information

## Application Features

The implemented application includes:

- Dashboard with disaster relief statistics
- Disaster and resource information
- Aid request creation and viewing
- Resource allocation
- Distribution recording
- Field report submission and viewing
- Supply update viewing
- Activity logging
- User login and logout
- Role-based page and API protection

## User Roles

| Role | Permissions |
|---|---|
| Admin | Create requests, allocate resources, record distributions, submit field reports |
| Coordinator | Create requests, record distributions, submit field reports |
| Viewer | Read-only access |

Unauthorized operations are restricted through application permission checks.

## Project Structure

```text
Disaster-Relief-Allocation-System/
├── database/
│   ├── mysql/
│   └── mongodb/
├── docs/
├── screenshots/
│   ├── GitHub/
│   ├── MongoDB/
│   ├── MySQL/
│   ├── Testing/
│   └── WebApp/
├── web/
│   ├── app/
│   ├── lib/
│   └── package.json
└── README.md
```

## How to Run

### Prerequisites

- Node.js and npm
- MySQL Server
- MongoDB Atlas account and cluster
- Git

### Installation

Clone the repository:

```bash
git clone https://github.com/Nandhitha189/Disaster-Relief-Allocation-System.git
cd Disaster-Relief-Allocation-System/web
npm install
```

Configure the required database environment variables using the application's local environment settings. Do not commit passwords or credentials.

Create the MySQL database and import the provided SQL schema. Configure access to the existing MongoDB Atlas database.

Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

### Code Checks

```bash
npx tsc --noEmit
npm run lint
```

## Testing

The project has been tested during development for:

- MySQL queries and data integrity
- Aid request creation
- Resource allocation
- Distribution recording
- Login and logout
- Admin, Coordinator, and Viewer authorization
- Unauthorized API access prevention
- MongoDB field report submission
- Automatic activity logging for field report submission
- Dashboard integration

Supporting screenshots are available in the `screenshots/` directory.

## Database Backup

The repository includes SQL scripts and a final schema-only MySQL export.

The complete database backup is stored separately because it contains application records and authentication-related information.

## Known Limitations

- MongoDB Atlas requires an accessible cluster and appropriate network permissions.
- During final verification on October 27, 2026, connections from the development Mac to MongoDB Atlas timed out on port 27017. The collections remained accessible through Atlas Data Explorer, but live application access to the MongoDB APIs was not successfully reverified.
- Activity logging is best-effort and is not part of a distributed transaction with MySQL.
- Further deployment configuration and security hardening would be required for production use.

## Future Enhancements

- Real-time inventory monitoring
- Geographic visualization of disasters and relief centers
- Advanced resource allocation optimization
- Notifications for critical requests and low stock
- Analytics and reporting
- Cloud deployment

## Conclusion

The project demonstrates the integration of a relational database and a NoSQL database within a disaster relief management application. MySQL handles structured operational transactions, while MongoDB supports flexible reports and activity data. The Next.js interface provides role-based access to the main relief management workflows.

## Team Contributions

Both team members contributed to project development. GitHub commit history maintains the record of individual changes.