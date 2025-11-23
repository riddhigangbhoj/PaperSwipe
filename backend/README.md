# PaperSwipe Backend

FastAPI backend for PaperSwipe - A Tinder-style app for discovering research papers.

## Features

- **User Authentication**: JWT-based authentication with access and refresh tokens
- **Paper Discovery**: Search and filter papers from arXiv API
- **Saved Papers**: Save, organize with notes and tags
- **Social Features**: Follow users, trending papers, activity feed
- **Export**: Export saved papers to BibTeX, CSV, or plain text
- **Migration**: Import data from localStorage (one-time migration)

## Tech Stack

- **FastAPI**: Modern Python web framework
- **PostgreSQL**: Database
- **SQLAlchemy**: ORM
- **Redis**: Caching (optional)
- **Docker**: Containerization
- **JWT**: Authentication

## Setup

### Prerequisites

- Docker and Docker Compose
- Python 3.11+ (if running locally without Docker)

### Quick Start with Docker

1. **Clone and navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create .env file** (already done, but you can modify):
   ```bash
   cp .env.example .env
   ```

3. **Start services**:
   ```bash
   docker-compose up -d
   ```

   This will start:
   - PostgreSQL database on port 5432
   - Redis on port 6379
   - FastAPI backend on port 8000

4. **Check if services are running**:
   ```bash
   docker-compose ps
   ```

5. **View logs**:
   ```bash
   docker-compose logs -f backend
   ```

### Local Development (without Docker)

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Start PostgreSQL** (using Homebrew on Mac):
   ```bash
   brew services start postgresql@15
   ```

3. **Create database**:
   ```bash
   createdb paperswipe
   ```

4. **Run the application**:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

## API Documentation

Once the server is running, visit:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get tokens
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout

### Papers
- `GET /api/papers/search` - Search papers with filters
- `GET /api/papers/{arxiv_id}` - Get specific paper
- `POST /api/papers/interaction` - Record paper interaction

### Saved Papers
- `GET /api/saved/` - Get all saved papers
- `POST /api/saved/` - Save a paper
- `PATCH /api/saved/{paper_id}` - Update paper (notes, tags)
- `DELETE /api/saved/{paper_id}` - Remove paper
- `GET /api/saved/tags` - Get all tags
- `POST /api/saved/tags` - Create tag
- `DELETE /api/saved/tags/{tag_id}` - Delete tag

### Social
- `GET /api/social/profile/{user_id}` - Get user profile
- `POST /api/social/follow/{user_id}` - Follow user
- `DELETE /api/social/follow/{user_id}` - Unfollow user
- `GET /api/social/followers` - Get followers
- `GET /api/social/following` - Get following
- `GET /api/social/trending` - Get trending papers
- `GET /api/social/feed` - Get activity feed

### Migration
- `POST /api/migrate/import-localstorage` - Import localStorage data

## Database Management

### Create migration
```bash
docker-compose exec backend alembic revision --autogenerate -m "description"
```

### Run migrations
```bash
docker-compose exec backend alembic upgrade head
```

### Rollback migration
```bash
docker-compose exec backend alembic downgrade -1
```

## Environment Variables

Key variables in `.env`:

- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: JWT secret key (change in production!)
- `ALLOWED_ORIGINS`: CORS allowed origins
- `ARXIV_API_BASE`: arXiv API endpoint

## Stopping Services

```bash
docker-compose down
```

To also remove volumes (database data):
```bash
docker-compose down -v
```

## Production Deployment

1. Update `.env` with production values:
   - Change `SECRET_KEY` to a secure random string
   - Set `ALLOWED_ORIGINS` to your frontend domain
   - Use production database URL

2. Deploy using Docker or your preferred hosting platform (Railway, Render, AWS, etc.)

## Troubleshooting

### Port already in use
If port 8000 or 5432 is already in use:
```bash
# Check what's using the port
lsof -i :8000
# Kill the process or change the port in docker-compose.yml
```

### Database connection errors
```bash
# Restart PostgreSQL
docker-compose restart postgres

# Check PostgreSQL logs
docker-compose logs postgres
```

### Module not found errors
```bash
# Rebuild the container
docker-compose build backend
docker-compose up -d
```
