# Notion Database Integration Guide

## Overview
This document provides a comprehensive guide for integrating with the Notion databases used in the Activity Tracker application. It covers setup, API usage, troubleshooting, and best practices.

## Database References

### Environment Configuration
```bash
# .env file
NOTION_ACTIVITIES_DATABASE_ID=27723004714380a7a181d695565092a5
NOTION_TRANSACTIONS_DATABASE_ID=27a230047143800e87c3cd8411ea251b
NOTION_API_KEY=your_notion_api_key_here
```

### Database Summaries

| Database | Purpose | Key Properties |
|----------|---------|----------------|
| **Activities** | Track various activity types with duration | Name, Kind, Duration in hours, Timestamps |
| **Transactions** | Financial expense tracking | Name, Kind, Amount, Note, Timestamps |

---

## Setup and Configuration

### 1. Notion API Setup
1. Create a Notion integration at [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Copy the Internal Integration Token
3. Share both databases with your integration:
   - Open each database in Notion
   - Click "Share" in the top-right corner
   - Add your integration's email and set permissions

### 2. Environment Variables
```bash
# Required variables
NOTION_API_KEY=your_integration_token
NOTION_ACTIVITIES_DATABASE_ID=27723004714380a7a181d695565092a5
NOTION_TRANSACTIONS_DATABASE_ID=27a230047143800e87c3cd8411ea251b

# Optional
NODE_ENV=production
```

---

## API Usage Examples

### Activities Database Operations

#### Getting Current Activity
```typescript
const currentActivity = await getCurrentActivity();
// Returns: Activity | null
```

#### Getting All Activity Types
```typescript
const activities = await getActivities();
// Returns: string[] (e.g., ["Chill", "Sleep", "Gaming", "Reading / Writing"])
```

#### Creating/Updating Activity
```typescript
const activity = await updateActivity({
  currentActivityId: "page_id", // Optional
  newActivityName: "Coding",
  notes: "Working on new features"
});
```

### Transactions Database Operations

#### Getting Transactions by Month
```typescript
const transactions = await getTransactionsByMonth(2024, 11);
// Returns: Transaction[]
```

#### Creating Transaction
```typescript
const transaction = await createTransaction({
  amount: 25.99,
  type: "Makan",
  payDate: "2024-11-27", // Optional
  note: "Lunch at restaurant"
});
```

#### Getting Transaction Categories
```typescript
const categories = getTransactionCategories();
// Returns: ["Makan", "Gift", "Bill", "HealthCare", "Shopping", "Subscription", "Transportation"]
```

---

## Data Types

### Activity Interface
```typescript
interface Activity {
  id: string;
  name: string;
  notes: string;
  startTime: string;
  endTime: string | null;
}
```

### Transaction Interface
```typescript
interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  notes: string;
}
```

---

## API Endpoints

### Activities API
- **GET** `/api` - Get all activity types
- **POST** `/api` - Create/update activity
- **GET** `/api/current` - Get current active activity

### Transactions API
- **GET** `/api/transactions` - Get transactions (with year/month params)
- **POST** `/api/transactions` - Create new transaction
- **GET** `/api/transactions/categories` - Get transaction categories

---

## Troubleshooting

### Common Issues

#### 1. Unauthorized Access Error
**Error**: `API token is invalid` or `401 Unauthorized`

**Solution**:
- Verify the NOTION_API_KEY is correct
- Ensure the integration is shared with both databases
- Check that the integration has proper permissions

#### 2. Property Not Found Error
**Error**: Property does not exist in database

**Solution**: Update database schema or modify code to match actual properties

#### 3. Schema Mismatch Issue - RESOLVED ✅
**Fixed**: Transactions code now correctly uses `"Kind"` and `"Created time"` properties
**Status**: Schema mismatch has been resolved in the latest code updates

**Applied Fixes**:
```typescript
// In lib/notion.ts - Updated to match database schema:
const parseTransaction = (page): Transaction => ({
  id: page.id,
  description: page.properties.Name?.title?.[0]?.plain_text || "",
  amount: page.properties.Amount?.number || 0,
  category: page.properties.Kind?.select?.name || "",      // ✅ FIXED: Type -> Kind
  date: page.properties["Created time"]?.created_time || "", // ✅ FIXED: Pay Date -> Created time
  notes: page.properties.Note?.rich_text?.[0]?.plain_text || "",
});
```

### Debug Steps

1. **Test API Connectivity**
```bash
curl -X POST http://localhost:3000/api/investigate-databases
```

2. **Check Database Access**
```typescript
// Test script to verify database access
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const db = await notion.databases.retrieve({
  database_id: process.env.NOTION_ACTIVITIES_DATABASE_ID
});
```

3. **Validate Properties**
Use the investigation API to get current schema:
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"database_id": "YOUR_DATABASE_ID"}' \
  http://localhost:3000/api/investigate-databases
```

---

## Best Practices

### 1. Error Handling
```typescript
try {
  const result = await notionOperation();
  return result;
} catch (error) {
  console.error("Operation failed:", error);
  // Provide user-friendly error message
  throw new Error("Failed to perform operation");
}
```

### 2. Rate Limiting
- Notion API has rate limits (3 requests/second for API tokens)
- Implement retry logic with exponential backoff
- Cache results where possible

### 3. Data Validation
```typescript
if (!amount || amount <= 0) {
  throw new Error("Amount must be a positive number");
}
```

### 4. Environment Management
- Use different API tokens for development and production
- Store secrets in environment variables, not in code
- Validate required environment variables on startup

---

## Database Schema Updates

### Recommended Enhancements

#### Activities Database
1. **Add End Time Property**
   ```json
   {
     "End Time": {
       "type": "date",
       "date": {}
     }
   }
   ```

2. **Add Status Property**
   ```json
   {
     "Status": {
       "type": "select",
       "select": {
         "options": [
           {"name": "Active", "color": "green"},
           {"name": "Completed", "color": "blue"},
           {"name": "Paused", "color": "orange"}
         ]
       }
     }
   }
   ```

#### Transactions Database
1. **Add Date Property** (to replace relying on Created time)
   ```json
   {
     "Transaction Date": {
       "type": "date",
       "date": {}
     }
   }
   ```

2. **Add Type Property** (Income vs Expense)
   ```json
   {
     "Transaction Type": {
       "type": "select",
       "select": {
         "options": [
           {"name": "Income", "color": "green"},
           {"name": "Expense", "color": "red"}
         ]
       }
     }
   }
   ```

---

## Monitoring and Maintenance

### Performance Considerations
- Database queries should use appropriate filters
- Implement pagination for large result sets
- Cache frequently accessed data (like categories)

### Security
- Never expose Notion API keys in client-side code
- Use least privilege principle for database sharing
- Regularly audit integration permissions

### Backup Strategy
- Export Notion databases regularly
- Maintain code versioning for schema changes
- Document all schema modifications