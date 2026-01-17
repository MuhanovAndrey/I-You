# I&You Platform - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           React Frontend (Port 5173)                  │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Animated Background (Canvas)                   │  │  │
│  │  │  - Sakura Petals  - Hearts                      │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Components                                      │  │  │
│  │  │  - Login/Register - Feed                        │  │  │
│  │  │  - Post           - CreatePost                  │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  API Service (Axios)                            │  │  │
│  │  │  - HTTP Client with JWT interceptor             │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/REST API
                            │ (Authorization: Bearer <token>)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│           FastAPI Backend (Port 8000)                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  CORS Middleware                                      │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  API Routers                                          │  │
│  │  ┌─────────────┬─────────────┬─────────────────────┐ │  │
│  │  │ /api/auth   │ /api/posts  │ /api/reactions      │ │  │
│  │  │             │             │ /api/comments       │ │  │
│  │  └─────────────┴─────────────┴─────────────────────┘ │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Authentication Layer                                 │  │
│  │  - JWT Token Validation                               │  │
│  │  - Password Hashing (bcrypt)                          │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  SQLAlchemy ORM                                       │  │
│  │  - Models (User, Post, Reaction, Comment)             │  │
│  │  - Schemas (Pydantic validation)                      │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ SQL Queries
                            ▼
┌─────────────────────────────────────────────────────────────┐
│           PostgreSQL Database (Port 5432)                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Tables:                                              │  │
│  │  - users (id, username, email, hashed_password)       │  │
│  │  - posts (id, title, content, author_id, timestamps)  │  │
│  │  - reactions (id, post_id, user_id, reaction_type)    │  │
│  │  - comments (id, post_id, author_id, content)         │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. User Registration Flow
```
User Input → Register Component → API Service
    ↓
POST /api/auth/register {username, email, password}
    ↓
Backend: Hash password → Create user in DB
    ↓
Return user object → Auto-login → Store JWT token
```

### 2. User Login Flow
```
User Input → Login Component → API Service
    ↓
POST /api/auth/login (OAuth2 form)
    ↓
Backend: Verify credentials → Generate JWT token
    ↓
Return {access_token, token_type} → Store in localStorage
    ↓
Set Authorization header for all future requests
```

### 3. Create Post Flow
```
User Input → CreatePost Component → API Service
    ↓
POST /api/posts/ {title, content} + JWT token
    ↓
Backend: Verify token → Extract user_id → Create post
    ↓
Return post object → Reload feed → Display new post
```

### 4. Reaction Flow
```
User clicks reaction → Post Component → API Service
    ↓
POST /api/reactions/ {post_id, reaction_type} + JWT token
    ↓
Backend: Check existing reaction → Create or update
    ↓
Return reaction → Reload posts → Update counts
```

### 5. Comment Flow
```
User Input → Post Component → API Service
    ↓
POST /api/comments/ {post_id, content} + JWT token
    ↓
Backend: Verify token → Create comment
    ↓
Return comment → Reload comments → Display in list
```

## Authentication Flow

```
┌──────────────┐
│   Browser    │
└──────┬───────┘
       │ 1. POST /api/auth/login
       │    {username, password}
       ▼
┌──────────────────┐
│  Backend API     │
│  1. Verify creds │
│  2. Generate JWT │
└──────┬───────────┘
       │ 2. Return JWT token
       ▼
┌──────────────┐
│   Browser    │
│ Store token  │
│ localStorage │
└──────┬───────┘
       │ 3. All requests include:
       │    Authorization: Bearer <token>
       ▼
┌──────────────────┐
│  Backend API     │
│  Decode JWT      │
│  Extract user_id │
│  Allow access    │
└──────────────────┘
```

## Component Hierarchy

```
App
├── AnimatedBackground (always visible)
├── Login (if not authenticated)
│   └── Form
├── Register (if not authenticated)
│   └── Form
└── Feed (if authenticated)
    ├── Header
    │   └── User info + Logout
    ├── CreatePost
    │   └── Form (expandable)
    └── Post[] (list)
        ├── Header (author, date)
        ├── Content (title, body)
        ├── Reactions (buttons)
        └── Comments (expandable)
            ├── Comment Form
            └── Comment[] (list)
```

## Database Relationships

```
┌─────────┐        ┌─────────┐
│  User   │◄───────│  Post   │
│         │ 1    * │         │
│ id      │        │ id      │
│ username│        │ title   │
│ email   │        │ content │
│ password│        │ author  │
└────┬────┘        └────┬────┘
     │                  │
     │ 1                │ 1
     │                  │
     │ *                │ *
┌────┴──────┐      ┌───┴──────┐
│ Reaction  │      │ Comment  │
│           │      │          │
│ id        │      │ id       │
│ post_id   │      │ post_id  │
│ user_id   │      │ author_id│
│ type      │      │ content  │
└───────────┘      └──────────┘
```

## API Request/Response Examples

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "maria",
  "email": "maria@example.com",
  "password": "securepassword"
}

Response 200:
{
  "id": 1,
  "username": "maria",
  "email": "maria@example.com",
  "created_at": "2024-01-17T12:00:00Z"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/x-www-form-urlencoded

username=maria&password=securepassword

Response 200:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Create Post
```http
POST /api/posts/
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Твоя улыбка",
  "content": "Я люблю тебя за твою удивительную улыбку, которая освещает мой день!"
}

Response 200:
{
  "id": 1,
  "title": "Твоя улыбка",
  "content": "Я люблю тебя за твою удивительную улыбку...",
  "author_id": 1,
  "author": {
    "id": 1,
    "username": "maria",
    "email": "maria@example.com"
  },
  "created_at": "2024-01-17T12:30:00Z",
  "updated_at": "2024-01-17T12:30:00Z",
  "reactions_count": {},
  "comments_count": 0
}
```

### Add Reaction
```http
POST /api/reactions/
Authorization: Bearer <token>
Content-Type: application/json

{
  "post_id": 1,
  "reaction_type": "heart"
}

Response 200:
{
  "id": 1,
  "post_id": 1,
  "user_id": 1,
  "reaction_type": "heart",
  "created_at": "2024-01-17T12:31:00Z"
}
```

## Security Measures

1. **Password Security**
   - Bcrypt hashing (10 rounds)
   - Never stored in plain text
   - Salted automatically

2. **JWT Tokens**
   - Signed with SECRET_KEY
   - 30-minute expiration
   - Stored client-side only

3. **API Security**
   - CORS configured
   - Protected endpoints require authentication
   - SQL injection prevention via ORM

4. **Input Validation**
   - Pydantic schemas
   - Email format validation
   - Required fields enforced

## Deployment Architecture (Docker)

```
┌─────────────────────────────────────────┐
│         Docker Compose                  │
│  ┌───────────────────────────────────┐  │
│  │  Frontend Container               │  │
│  │  - Node 18                        │  │
│  │  - npm run dev                    │  │
│  │  - Port 5173                      │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  Backend Container                │  │
│  │  - Python 3.11                    │  │
│  │  - uvicorn                        │  │
│  │  - Port 8000                      │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  PostgreSQL Container             │  │
│  │  - PostgreSQL 15                  │  │
│  │  - Port 5432                      │  │
│  │  - Volume: postgres_data          │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

**All components work together to create a seamless love-sharing experience! 💕**
