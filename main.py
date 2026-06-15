from fastapi.responses import RedirectResponse
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
import string, random

from database import engine, get_db, Base
from models import URL

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class URLRequest(BaseModel):
    long_url: str

def generate_short_code(length=6):
    chars = string.ascii_letters + string.digits
    return "".join(random.choices(chars, k=length))


@app.post("/shorten")
def shorten_url(request: URLRequest, db: Session = Depends(get_db)):
    existing = db.query(URL).filter(URL.long_url == request.long_url).first()
    if existing:
        return {"short_code": existing.short_code}

    for _ in range(5):
        code = generate_short_code()
        if not db.query(URL).filter(URL.short_code == code).first():
            break

    new_url = URL(short_code=code, long_url=request.long_url)
    db.add(new_url)
    db.commit()
    db.refresh(new_url)
    return {"short_code": new_url.short_code}


from fastapi.responses import RedirectResponse

@app.get("/{short_code}")
def redirect_url(short_code: str, db: Session = Depends(get_db)):
    url = db.query(URL).filter(URL.short_code == short_code).first()
    if not url:
        raise HTTPException(status_code=404, detail="URL not found")

    url.clicks += 1
    db.commit()
    return RedirectResponse(url=url.long_url)


@app.get("/stats/{short_code}")
def get_stats(short_code: str, db: Session = Depends(get_db)):
    url = db.query(URL).filter(URL.short_code == short_code).first()
    if not url:
        raise HTTPException(status_code=404, detail="URL not found")
    return {
        "short_code": url.short_code,
        "long_url": url.long_url,
        "clicks": url.clicks,
        "created_at": url.created_at
    }