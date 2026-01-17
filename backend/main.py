from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, posts, reactions, comments

app = FastAPI(title="I&You API", description="API for love reasons sharing platform")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(posts.router, prefix="/api/posts", tags=["posts"])
app.include_router(reactions.router, prefix="/api/reactions", tags=["reactions"])
app.include_router(comments.router, prefix="/api/comments", tags=["comments"])

@app.on_event("startup")
async def startup_event():
    # Create database tables on startup
    Base.metadata.create_all(bind=engine)

@app.get("/")
async def root():
    return {"message": "Welcome to I&You API"}
