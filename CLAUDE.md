# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a T3 Chat clone - a multi-user chat application with LLM integration built for the T3 Chat Cloneathon. The project uses a Django backend with Django Ninja API and a React frontend with TanStack Router.

## Architecture

**Monorepo Structure:**
- `backend/` - Django application with Django Ninja API, WebSockets, and Celery workers
- `frontend/` - React SPA with TanStack Router and Vite
- `docs/` - Project documentation

**Tech Stack:**
- Backend: Django + Django Ninja + Django Channels (WebSockets) + Celery + Redis + PostgreSQL
- Frontend: React + TanStack Router + Vite + TailwindCSS + Radix UI
- Authentication: GitHub OAuth
- Database: PostgreSQL with Redis for caching/channels

## Commands

**Root level (uses Turbo):**
```bash
npm run dev           # Start both frontend and backend
npm run build         # Build both workspaces
npm run codegen       # Generate OpenAPI types
npm run type:check    # Type check both workspaces
npm run lint          # Lint and fix both workspaces
npm run lint:check    # Check linting without fixes
npm run format        # Format code
npm run format:check  # Check formatting
npm run test          # Run tests
```

**Backend specific:**
```bash
cd backend
uv run manage.py runserver                    # Start Django dev server
DEMO=True uv run manage.py runserver          # Start in demo mode
uv run manage.py migrate                      # Run migrations
uv run manage.py makemigrations               # Create migrations
uv run manage.py createsuperuser              # Create admin user
uv run celery -A chats.jobs worker -l INFO    # Start Celery worker
uv run ruff check --fix                       # Lint Python code
uv run ruff format                            # Format Python code
uv run pytest .                               # Run Python tests
```

**Frontend specific:**
```bash
cd frontend
npm run dev                    # Start Vite dev server
npm run build                  # Build for production
npm run codegen                # Generate API client from OpenAPI schema
tsc --noEmit                   # Type check TypeScript
```

## Key Architecture Details

**API Communication:**
- REST API generated with Django Ninja at `/api/`
- OpenAPI schema auto-generated and used to create TypeScript client
- WebSocket connections for real-time chat updates

**Data Flow:**
- Frontend uses generated API client (`frontend/src/api/client/`) for type-safe API calls
- Real-time updates via WebSockets in `backend/chats/websockets.py`
- Offline-first architecture with Dexie.js for local storage sync

**Authentication:**
- GitHub OAuth integration
- Session-based authentication
- User context passed through TanStack Router

**Message Processing:**
- Celery workers handle LLM API calls asynchronously
- Multiple LLM providers supported (OpenAI, Gemini)
- Streaming responses via WebSockets

**Database Models:**
- `chats/models/` contains core models: Users, Conversations, Messages, Members, Settings
- Django migrations in `chats/migrations/`

## Development Workflow

1. Run `npm run dev` from root to start both frontend and backend
2. Backend runs on `http://localhost:8000`, frontend on `http://localhost:3000`
3. After API changes, run `npm run codegen` to regenerate TypeScript types
4. Always run linting/formatting before commits: `npm run lint && npm run format`

## Demo Mode

Set `DEMO=True` environment variable to run in demo mode for local development without requiring full OAuth setup.