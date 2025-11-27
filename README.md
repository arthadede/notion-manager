# Activity Tracker

A simple activity tracking application built with Next.js and Notion API.

## Features

- Track activities using Notion as backend
- Clean, modern UI with Tailwind CSS
- Single Next.js application with integrated API routes
- Simple Docker deployment

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Next.js API Routes
- **Database**: Notion API
- **Styling**: Tailwind CSS
- **Deployment**: Docker, Docker Compose

## Quick Start

1. **Set up environment variables:**

   ```bash
   cp .env.local.local.example .env.local.local
   # Edit .env.local.local with your Notion API credentials
   ```

2. **Install dependencies:**

   ```bash
   make setup
   ```

3. **Run development server:**

   ```bash
   make dev
   ```

4. **Build for production:**
   ```bash
   make build-local
   ```

## Docker Deployment

1. **Build and run with Docker Compose:**

   ```bash
   make up
   ```

2. **View logs:**

   ```bash
   make logs
   ```

3. **Stop application:**
   ```bash
   make down
   ```

## API Routes

The application includes internal API routes that are not exposed externally:

- `GET /api/current` - Get current activity
- `GET /api` - Get all activity types
- `POST /api` - Update/create activity

## Configuration

### Notion Setup

1. Create a Notion integration at https://www.notion.so/my-integrations
2. Create a database with the following properties:
   - Name (Title)
   - Kind (Select)
   - Duration in hours (Number)
   - Note (Rich text)
3. Copy your API key and database ID to `.env.local`

**Note**: The system uses "Duration in hours" to track activities. Current activities have a duration of 0 hours. When switching activities, the system automatically calculates and updates the duration based on the activity's created time.

### Environment Variables

```env
NOTION_API_KEY=your_notion_api_key
NOTION_DATABASE_ID=your_database_id
```

## Development

- **Development server**: `make dev`
- **Linting**: `make lint`
- **Build**: `make build-local`
- **Production server**: `make start-local`

## Makefile Commands

- `make help` - Show all available commands
- `make setup` - Initial project setup
- `make dev` - Run development server
- `make up` - Start with Docker Compose
- `make down` - Stop Docker Compose
- `make clean` - Clean up Docker resources

## Technical Implementation

### Real-Time Activity Tracking

The application implements real-time activity tracking using duration calculation:

- **Current Activities**: Identified by `Duration in hours = 0`
- **Duration Calculation**: When switching activities, duration is calculated as `(now - createdTime) / (1000 * 60 * 60)`
- **Real-Time Display**: Duration is calculated on-the-fly and continuously updated
- **Activity Switching**: Automatic duration calculation and preservation of current activity state

### Database Schema

The system uses your existing Notion database schema:

- **Kind** (Select): Activity type (Chill, Sleep, Hangout, etc.)
- **Duration in hours** (Number): Activity duration (0 = currently active)
- **Note** (Rich text): Optional activity notes
- **Created time** (Auto-generated): Activity start time

### Error Handling & Type Safety

- Comprehensive error handling with user-friendly messages
- TypeScript type safety enabled throughout the codebase
- Environment variable validation
- Structured API responses with detailed error information

## Migration from Previous Version

This application was migrated from a complex multi-service architecture (React + Express + Nginx + Traefik) to a simplified single Next.js application. The new architecture:

- ✅ Single codebase for frontend and backend
- ✅ No complex Docker networking
- ✅ No reverse proxy configuration
- ✅ Built-in API routes
- ✅ Better performance with Next.js optimizations
- ✅ Simplified deployment
- ✅ Real-time activity tracking with duration calculation
- ✅ Enhanced error handling and type safety
