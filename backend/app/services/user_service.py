from typing import Optional
from datetime import timedelta
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from app.db.session import get_db
from app.core.config import settings
from app.core.security import verify_password, create_access_token
from app.schemas.user import UserCreate, UserResponse, TokenData
from app.repositories.user_repository import UserRepository

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")


class UserService:
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db
        self.user_repo = UserRepository(db)

    def register(self, user_in: UserCreate) -> UserResponse:
        if self.user_repo.get_by_email(user_in.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        if self.user_repo.get_by_username(user_in.username):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
        user = self.user_repo.create(user_in)
        return UserResponse.model_validate(user)

    def authenticate_user(self, email: str, password: str) -> Optional[UserResponse]:
        user = self.user_repo.get_by_email(email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return UserResponse.model_validate(user)

    def get_current_user(self, token: str = Depends(oauth2_scheme)) -> UserResponse:
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            email: str = payload.get("sub")
            if email is None:
                raise credentials_exception
            token_data = TokenData(email=email)
        except JWTError:
            raise credentials_exception
        user = self.user_repo.get_by_email(token_data.email)
        if user is None:
            raise credentials_exception
        return UserResponse.model_validate(user)

    def create_user_token(self, user: UserResponse) -> dict:
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}
