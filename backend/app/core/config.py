from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Valores inseguros que NO deben usarse jamas como SECRET_KEY (ni en desarrollo).
_INSECURE_SECRETS = {"change-me", "changeme", "secret", "default", "please-change"}


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    PROJECT_NAME: str = "TCU - Sistema Institucional API"
    API_V1_PREFIX: str = "/api/v1"

    # Sin valor por defecto: la aplicacion NO arranca si falta (se lee del entorno).
    # Nunca incrustar credenciales en el codigo.
    DATABASE_URL: str

    # Sin valor por defecto: obligatorio y validado. Genere una con:
    #   openssl rand -hex 32
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    # Cookie de sesion httpOnly. COOKIE_SECURE debe ser True en produccion (HTTPS);
    # en desarrollo (HTTP) se deja False para que el navegador la envie.
    COOKIE_SECURE: bool = False
    COOKIE_SAMESITE: str = "lax"

    # Origenes permitidos por CORS. Cadena separada por comas (se define por
    # entorno). Se expone ya parseada en `cors_origins`. Se guarda como `str`
    # (no `list`) para evitar que pydantic-settings intente decodificarla como JSON.
    #   BACKEND_CORS_ORIGINS=https://midominio.cr,https://www.midominio.cr
    # Vacio por defecto: sin localhost incrustado en el codigo.
    BACKEND_CORS_ORIGINS: str = ""

    # Nivel de logging de la aplicacion (DEBUG/INFO/WARNING/ERROR).
    LOG_LEVEL: str = "INFO"

    @property
    def cors_origins(self) -> list[str]:
        """Lista de origenes permitidos a partir de la cadena coma-separada."""
        return [origin.strip() for origin in self.BACKEND_CORS_ORIGINS.split(",") if origin.strip()]

    @field_validator("SECRET_KEY")
    @classmethod
    def _validate_secret_key(cls, v: str) -> str:
        if not v or v.strip().lower() in _INSECURE_SECRETS:
            raise ValueError(
                "SECRET_KEY invalida o insegura. Definala por entorno con una clave "
                "fuerte generada con: openssl rand -hex 32"
            )
        if len(v) < 32:
            raise ValueError(
                "SECRET_KEY demasiado corta (minimo 32 caracteres). "
                "Genere una con: openssl rand -hex 32"
            )
        return v


settings = Settings()
