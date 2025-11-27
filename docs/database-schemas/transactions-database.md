# Transactions Database Schema

## Overview
The **Transactions Database** is used to track financial transactions with categorization and amount tracking. This database helps users monitor their expenses and income.

**Database ID**: `27a230047143800e87c3cd8411ea251b`
**Title**: "Transactions"
**URL**: https://www.notion.so/27a230047143800e87c3cd8411ea251b

---

## Properties

### 1. Name
- **Type**: `Title`
- **Description**: The primary title field for the transaction
- **Usage**: Main identifier for each transaction (e.g., "Grocery Shopping")

### 2. Kind
- **Type**: `Select`
- **Description**: Category classification for the transaction
- **Options** (7 available):
  - **Makan** (blue) - Food expenses
  - **Gift** (green) - Gift-related expenses
  - **Bill** (red) - Bill payments
  - **HealthCare** (orange) - Healthcare expenses
  - **Shopping** (purple) - General shopping expenses
  - **Subscription** (brown) - Subscription services
  - **Transportation** (pink) - Transportation costs

### 3. Amount
- **Type**: `Number`
- **Description**: Financial amount of the transaction
- **Format**: `number_with_commas` (formatted with thousand separators)

### 4. Note
- **Type**: `Rich Text`
- **Description**: Additional notes or details about the transaction
- **Usage**: Multi-line text field for context, descriptions, or additional information

### 5. Created time
- **Type**: `Created Time`
- **Description**: Automatically generated timestamp when the transaction was created
- **Usage**: Read-only field

---

## Database Structure

```json
{
  "title": "Transactions",
  "properties": {
    "Name": {
      "type": "title",
      "title": {}
    },
    "Kind": {
      "type": "select",
      "select": {
        "options": [
          {"name": "Makan", "color": "blue", "id": "dafc07f5-500e-40cc-a84f-cc7c39f37f8e"},
          {"name": "Gift", "color": "green", "id": "53a0768d-8f26-437c-9409-392b5e231b2f"},
          {"name": "Bill", "color": "red", "id": "9307609f-0637-4665-919e-c4e2664d595b"},
          {"name": "HealthCare", "color": "orange", "id": "2d1ad19c-8675-469a-9f41-d67f443f0280"},
          {"name": "Shopping", "color": "purple", "id": "3121d17c-fc25-4110-b247-5c7ae7ee715b"},
          {"name": "Subscription", "color": "brown", "id": "6db3f1f4-a897-4f6f-a2ee-aea48daa5cf7"},
          {"name": "Transportation", "color": "pink", "id": "a7d0c54d-4356-443b-aa4f-f337c84ec738"}
        ]
      }
    },
    "Amount": {
      "type": "number",
      "number": {
        "format": "number_with_commas"
      }
    },
    "Note": {
      "type": "rich_text",
      "rich_text": {}
    },
    "Created time": {
      "type": "created_time",
      "created_time": {}
    }
  }
}
```

---

## Usage Examples

### Creating a New Transaction Entry
```typescript
{
  "Name": "Grocery Shopping",
  "Kind": "Makan",
  "Amount": 45.67,
  "Note": "Weekly grocery shopping at the local market"
}
```

### Transaction Categories Breakdown
- **Makan**: Food-related expenses (restaurants, groceries, etc.)
- **Gift**: Expenses for gifts for others
- **Bill**: Utility bills, subscription payments, etc.
- **HealthCare**: Medical expenses, medications, etc.
- **Shopping**: General shopping for goods
- **Subscription**: Recurring subscription services
- **Transportation**: Public transport, fuel, car maintenance, etc.

---

## Database Queries

### Getting Transactions by Month
The application can filter transactions by date range using the "Created time" property.

### Categorization Analysis
Transactions can be grouped by the "Kind" property for expense analysis and budget tracking.

---

## Important Notes

### Schema Mismatch Issue - RESOLVED ✅
**The critical discrepancy between the database schema and the application code has been fixed:**

- **Database Schema**: Uses `"Kind"` property for transaction categories ✅
- **Application Code**: Now correctly uses `"Kind"` property for categories

- **Database Schema**: Uses `"Created time"` for transaction dates ✅
- **Application Code**: Now correctly uses `"Created time"` property

#### Fixed Code Changes in `lib/notion.ts`:
```typescript
// Fixed parseTransaction function:
const parseTransaction = (page): Transaction => ({
  id: page.id,
  description: page.properties.Name?.title?.[0]?.plain_text || "",
  amount: page.properties.Amount?.number || 0,
  category: page.properties.Kind?.select?.name || "",      // ✅ FIXED: Type -> Kind
  date: page.properties["Created time"]?.created_time || "", // ✅ FIXED: Pay Date -> Created time
  notes: page.properties.Note?.rich_text?.[0]?.plain_text || "",
});
```

---

## Financial Tracking Features

The database supports:
- **Expense categorization** with 7 predefined categories
- **Amount tracking** with proper number formatting
- **Detailed notes** for transaction context
- **Automatic timestamping** for audit trails
- **Categorical analysis** for budget planning