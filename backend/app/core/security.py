from datetime import datetime, timedelta, timezone
from typing import Optional

import jwt
from jwt.exceptions import InvalidTokenError
from pwdlib import PasswordHash

from app.core.config import settings


# Password Hashing (Argon2)
password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    """Plain password ko hash mein convert karta hai"""
    return password_hash.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Password check karta hai"""
    return password_hash.verify(plain_password, hashed_password)


# JWT Token
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """JWT token banata hai"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.SECRET_KEY, 
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt