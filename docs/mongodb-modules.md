# MongoDB Modules

## 1. Field Reports

The Field Reports module is used to record information collected from disaster-affected areas.

Field reports can contain information such as the reporting location, reported requirements, description, severity, and other operational details.

The frontend provides the user interface for viewing and submitting reports, while the corresponding API route processes requests and communicates with MongoDB.

### General Flow

```text
User
  ↓
Field Reports Page
  ↓
Next.js API Route
  ↓
MongoDB
  ↓
Response
  ↓
Frontend
```

## 2. Activity Logs

The Activity Logs module provides information about activities performed within the system.

Activity information can be stored as documents in MongoDB, allowing operational events to be recorded without requiring a rigid relational structure.

The frontend retrieves the available logs through the corresponding API route and displays them to authorized users.

## 3. Supply Updates

The Supply Updates module is used to record changes and updates related to relief supplies.

This information can help users monitor supply-related activities during disaster relief operations.

The frontend communicates with the Supply Updates API route, which handles the interaction with MongoDB.

## MongoDB API Integration

The three modules follow the same general application architecture:

1. The user interacts with a Next.js frontend page.
2. The frontend sends a request to the corresponding API route.
3. The API route validates and processes the request.
4. MongoDB is accessed on the server side.
5. The API returns the result.
6. The frontend displays the result or an appropriate error message.

## Separation from MySQL

The MongoDB modules are used for flexible operational information, while MySQL continues to handle structured relational data and core system operations.

This separation allows each database technology to be used for the type of information it handles most effectively.
