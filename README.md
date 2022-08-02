## This application template can be used to create your applications

---

### Frontend:

- Typescript
- React
- Redux Tookit
- Redux Saga
- Tailwind
- React Router Dom v5

### Backend:

- Express
- Passport + JWT
- Sequelize + Postgres

---

### Important! Create `.env.local` file for development and `.env` for production

---

#### .env.local:

```
# UI
REACT_APP_REFRESH_TOKEN_TIMEOUT = 60 * 5
PORT = 3000

########################

#API
DEBUG = api:*

API_PORT = 9000

# Database
POSTGRES_HOST = localhost
POSTGRES_DB = app
POSTGRES_USER = postgres
POSTGRES_PASSWORD = postgres

# JWT
JWT_SECRET = SECRET-STRING
REFRESH_TOKEN_SECRET = SECRET-STRING
SESSION_EXPIRY = 60 * 15
REFRESH_TOKEN_EXPIRY = 60 * 60 * 24 * 30
COOKIE_SECRET = SECRET-STRING
```
