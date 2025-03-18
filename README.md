# BeeHub - AlgoHive Project

BeeHub is a catalog management system with user authentication and access control.

## Project Structure

- `frontend/`: React frontend application
- `backend/`: Python FastAPI backend application

## Backend Setup

1. Navigate to the backend directory:

   ```
   cd backend
   ```

2. Create a virtual environment:

   ```
   python -m venv venv
   source venv/bin/activate   # On Windows use: venv\Scripts\activate
   ```

3. Install dependencies:

   ```
   pip install -r requirements.txt
   ```

4. Copy the example environment file and configure it:

   ```
   cp .env.example .env
   ```

   Edit the `.env` file to set your own configurations.

5. Run the application:
   ```
   python app.py
   ```
   The API will be available at http://localhost:5000

## Frontend Setup

1. Navigate to the frontend directory:

   ```
   cd frontend
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```
   The frontend will be available at http://localhost:5173

## API Documentation

Once the backend is running, you can access the API documentation at:

- Swagger UI: http://localhost:5000/docs
- ReDoc: http://localhost:5000/redoc

## Authentication

The system uses JWT tokens for authentication. To access protected endpoints:

1. Login using `/auth/login` to get a token
2. Include the token in the Authorization header as:
   ```
   Authorization: Bearer your_token_here
   ```

## Default Admin User

A default admin user is created on first startup:

- Username: admin
- Password: admin123

Change these credentials in production by updating the .env file.
