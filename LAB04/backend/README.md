# ShopAdmin Backend (Lab 4 Homework)

REST API for the ShopAdmin web UI, built with Express, MongoDB (Mongoose), bcryptjs, JWT and Multer.

## Requirements

- Node.js 18 or newer
- MongoDB running locally (default `mongodb://127.0.0.1:27017`) or a MongoDB Atlas connection string

## Setup

1. Go into the backend folder:

```bash
cd backend
```

2. Initialize the project (skip if `package.json` already exists):

```bash
npm init -y
```

3. Install dependencies:

```bash
npm install express cors mongoose bcryptjs jsonwebtoken multer dotenv
```

4. Install the development dependency:

```bash
npm install -D nodemon
```

5. Make sure the scripts in `package.json` are:

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

## Run

```bash
npm run start
```

For development with auto-restart:

```bash
npm run dev
```

The terminal should print:

```
Connected to MongoDB successfully
Server listening at: http://localhost:4000
```

Health check: `http://localhost:4000/api/v1/health`

