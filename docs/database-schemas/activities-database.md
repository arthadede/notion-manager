# Activities Database Schema

## Overview
The **Activities Database** is used to track various types of activities with duration tracking. This database helps users monitor and categorize their daily activities.

**Database ID**: `27723004714380a7a181d695565092a5`
**Title**: "Activity Tracker"
**URL**: https://www.notion.so/27723004714380a7a181d695565092a5

---

## Properties

### 1. Name
- **Type**: `Title`
- **Description**: The primary title field for the activity
- **Usage**: Main identifier for each activity entry

### 2. Kind
- **Type**: `Autocomplete`
- **Description**: Categorizes the activity type
- **Options** (10 available):
  - **Chill** (default color)
  - **Sleep** (gray)
  - **Hangout** (brown)
  - **Watching** (yellow)
  - **Gaming** (orange)
  - **Reading / Writing** (green)
  - **Forest Interactive** (blue)
  - **Labs** (red)
  - **Personal Project** (purple)

### 3. Duration in hours
- **Type**: `Number`
- **Description**: Duration of the activity in hours
- **Format**: `number` (plain numeric format)

### 4. Created time
- **Type**: `Created Time`
- **Description**: Automatically generated timestamp when the activity was created
- **Usage**: Read-only field

### 5. Last edited time
- **Type**: `Last Edited Time`
- **Description**: Automatically generated timestamp when the activity was last modified
- **Usage**: Read-only field

---

## Database Structure

```json
{
  "title": "Activity Tracker",
  "properties": {
    "Name": {
      "type": "title",
      "title": {}
    },
    "Kind": {
      "type": "select",
      "select": {
        "options": [
          {"name": "Chill", "color": "default", "id": "3daa0700-d225-48ca-aae5-a50419176011"},
          {"name": "Sleep", "color": "gray", "id": "c7527f96-0ab9-44bf-b0f0-44a678c459bc"},
          {"name": "Hangout", "color": "brown", "id": "3bf77fd4-6abd-4c98-8dab-d0adfb8a9f2b"},
          {"name": "Watching", "color": "yellow", "id": "375b9336-6b91-4a9a-9db1-27c25e914836"},
          {"name": "Gaming", "color": "orange", "id": "e90f06b1-abf3-49d7-afe0-8d62dd6176cc"},
          {"name": "Reading / Writing", "color": "green", "id": "dc2f5ae9-6c24-4b7f-9975-8c59b0d3e6da"},
          {"name": "Forest Interactive", "color": "blue", "id": "07086a8a-5da8-4105-87d9-d644feba02fe"},
          {"name": "Labs", "color": "red", "id": "5c4a30e8-9e5c-4400-9235-4188875516e0"},
          {"name": "Testing", "color": "pink", "id": "651e43b0-5f22-4648-8a0f-46c6172fba71"},
          {"name": "Personal Project", "color": "purple", "id": "1b2f2787-847d-4ea6-8636-458a68560c12"}
        ]
      }
    },
    "Duration in hours": {
      "type": "number",
      "number": {
        "format": "number"
      }
    },
    "Created time": {
      "type": "created_time",
      "created_time": {}
    },
    "Last edited time": {
      "type": "last_edited_time",
      "last_edited_time": {}
    }
  }
}
```

---

## Usage Examples

### Creating a New Activity Entry
```typescript
{
  "Name": "Morning Coding Session",
  "Kind": "Labs",
  "Duration in hours": 2.5
}
```

### Querying for Active Activities
The application queries for activities where "End Time" is empty (not present in current schema).

---

## Notes

- This database does not currently have an "End Time" property, which suggests the schema might need to be updated to match the application requirements
- The "Duration in hours" property suggests the system expects manual duration entry rather than start/end time tracking
- Activities can be filtered by "Kind" property for categorization and analysis