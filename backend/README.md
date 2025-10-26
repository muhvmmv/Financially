# Financial Tracker Backend

This is the backend API for the Financial Tracker application.

## Database Setup

The application requires PostgreSQL database with the following setup:

### 1. Create Database and User

Connect to PostgreSQL as a superuser and run:

```sql
-- Create database
CREATE DATABASE financially;

-- Create user
CREATE USER financially_user WITH PASSWORD 'your_password_here';

-- Grant permissions
GRANT CONNECT ON DATABASE financially TO financially_user;
GRANT USAGE ON SCHEMA public TO financially_user;
GRANT CREATE ON SCHEMA public TO financially_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO financially_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO financially_user;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO financially_user;

-- Grant permissions on future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO financially_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO financially_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO financially_user;
```

### 2. Environment Variables

Create a `.env` file in the backend directory with:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=financially
DB_USER=financially_user
DB_PASSWORD=your_password_here
JWT_SECRET=your_strong_secret_key_here
PORT=5000
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Setup Database Tables

```bash
node setup-db.js
```

### 5. Start the Server

```bash
node server.js
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Dashboard
- `GET /api/dashboard/data` - Get dashboard data (requires authentication)

### Accounts
- `GET /api/accounts/profile` - Get user profile
- `GET /api/accounts/accounts` - Get user accounts
- `POST /api/accounts/accounts` - Create new account
- `PUT /api/accounts/accounts/:id` - Update account
- `DELETE /api/accounts/accounts/:id` - Delete account

### Transactions
- `GET /api/transactions` - Get transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Budgets
- `GET /api/budgets` - Get budgets
- `POST /api/budgets` - Create budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

## Current Status

The dashboard is currently functional with sample data. The application will automatically detect if the required database tables exist:

- If tables exist: Uses real data from the database
- If tables don't exist: Uses sample data as fallback

To enable full functionality with real data, follow the database setup instructions above. 