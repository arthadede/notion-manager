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
   - Kind (Select)
   - Note (Rich text)
   - Started Time (Date)
   - End Time (Date)
   - Author (Select)
3. Copy your API key and database ID to `.env.local`

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

## Migration from Previous Version

This application was migrated from a complex multi-service architecture (React + Express + Nginx + Traefik) to a simplified single Next.js application. The new architecture:

- ✅ Single codebase for frontend and backend
- ✅ No complex Docker networking
- ✅ No reverse proxy configuration
- ✅ Built-in API routes
- ✅ Better performance with Next.js optimizations
- ✅ Simplified deployment
