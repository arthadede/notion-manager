# Activity Tracker - Notion Integration

A simple, clean activity tracker that syncs with your Notion database. Built with Vite, React, TypeScript, and Tailwind CSS.

## Features

- View your current activity from Notion
- Update activities with a simple dropdown
- Add notes to your activities
- Automatically ends previous activity and starts new one
- Clean, dark mode UI inspired by Vercel

## Prerequisites

- Node.js (v18 or higher)
- A Notion account with an integration set up
- A Notion database for activities

## Notion Setup

### 1. Create a Notion Integration

1. Go to [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click "+ New integration"
3. Give it a name (e.g., "Activity Tracker")
4. Select the workspace where your database is
5. Click "Submit"
6. Copy the "Internal Integration Token" - this is your `NOTION_API_KEY`

### 2. Set Up Your Notion Database

Your Notion database should have the following properties:

- **Activity** (Title) - The name of the activity
- **Notes** (Text) - Optional notes about the activity
- **Start Time** (Date) - When the activity started
- **End Time** (Date) - When the activity ended (null for ongoing activities)

### 3. Share Database with Integration

1. Open your Notion database
2. Click the "..." menu in the top right
3. Click "Add connections"
4. Select your integration

## Installation

1. Clone the repository:
```bash
cd acitivity-manage
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Edit `.env` and add your credentials:
```
NOTION_API_KEY=your_notion_integration_token_here
NOTION_DATABASE_ID=27723004714380a7a181d695565092a5
```

## Running the Application

Run as a single service (backend + frontend together)

The Express server now also serves the built frontend from `dist/`.

1. Build the frontend output:
```bash
npm run build
```
2. Start the server (serves API at `/api/*` and UI at `/`):
```bash
npm run server
```
Open `http://localhost:3000` for the UI. API is available under `http://localhost:3000/api/*`.

Or run with Docker (single container):
```bash
docker build -t histweety/activity-manage:combined .
docker run --rm -p 3000:3000 --env-file .env \
  histweety/activity-manage:combined
```

Note: The container serves both the UI and API on the same origin/port. For local development with hot reload, you may still use `npm run dev` (Vite) and `npm run server` separately, but this is optional and not required for production.

## How It Works

1. **On Load**: The app fetches your current (latest) activity from Notion
2. **Select Activity**: Choose a new activity from the dropdown (populated from all existing activities in your database)
3. **Add Notes**: Optionally add notes about what you're doing
4. **Update**: Click the "Update Activity" button
   - The current activity gets an end time (now)
   - A new activity page is created in Notion with a start time (now) and no end time

## Project Structure

```
acitivity-manage/
├── server/
│   └── index.ts         # Express backend for Notion API
├── src/
│   ├── App.tsx          # Main React component
│   ├── index.css        # Tailwind styles
│   └── main.tsx         # React entry point
├── .env                 # Environment variables (not in git)
├── .env.example         # Example environment variables
└── package.json         # Dependencies and scripts
```

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Vite
- **Backend**: Express, Node.js
- **API**: Notion SDK (@notionhq/client)

## Troubleshooting

### "Failed to fetch current activity"
- Check that your Notion API key is correct in `.env`
- Verify that your database is shared with the integration
- Make sure the backend server is running

### Activities not showing in dropdown
- Ensure your Notion database has at least one page with an "Activity" title
- Check that the property name matches exactly: "Activity" (case-sensitive)

### CORS errors
- In the single-service/Docker setup, CORS should not be needed because frontend and backend share the same origin.

## License

MIT
