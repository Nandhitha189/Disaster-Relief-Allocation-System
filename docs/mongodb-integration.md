# MongoDB Integration

## Overview

The Disaster Relief Resource Allocation and Aid Distribution System uses MongoDB alongside MySQL.

MySQL is used for structured relational data and core allocation-related operations, while MongoDB is used for flexible operational data such as field reports, activity logs, and supply updates.

## MongoDB Atlas

MongoDB Atlas provides the cloud-hosted MongoDB database used by the application.

The application connects to MongoDB through the MongoDB Node.js driver. Database credentials and connection strings are stored in environment variables and should not be committed to GitHub.

## Collections

The MongoDB modules include the following collections:

* `field_reports` — stores reports submitted from disaster-affected field locations.
* `activity_logs` — stores activity and operational log information.
* `supply_updates` — stores updates related to relief supplies and their availability or movement.

## Why MongoDB is Used Alongside MySQL

MySQL is suitable for structured relational information where relationships, constraints, and transactions are important.

MongoDB is useful for operational information that may have flexible fields and can change as the system evolves.

Using both databases allows the system to use the strengths of relational and document-oriented database models.

## Application Integration

The Next.js application communicates with MongoDB through server-side API routes.

The general flow is:

1. A user interacts with a Next.js page.
2. The page sends a request to the appropriate API route.
3. The API route validates and processes the request.
4. The server communicates with MongoDB.
5. The result is returned to the frontend.
6. The frontend displays the result to the user.

## Security

MongoDB connection strings and credentials must be stored in environment variables.

Sensitive files such as `.env.local` must not be committed to the repository.
