# Mingle App - Social Media API

A RESTful API for a social media platform with JWT authentication, posts with expiration, and user interactions

## Technologies Used

- **Node.js** - https://nodejs.org/
- **Express.js** - https://expressjs.com/
- **MongoDB** with Mongoose - https://mongoosejs.com/
- **JSON Web Tokens (JWT)** - https://jwt.io/
- **bcryptjs** - https://www.npmjs.com/package/bcryptjs
- **Joi** - https://joi.dev/
- **Axios** (for testing) - https://axios-http.com/docs/intro

## Code Attribution

This project builds upon concepts and patterns covered in class lectures and tutorials. Core authentication flows, JWT middleware implementation, and RESTful endpoint structures were adapted from course materials (BUCI028H6, 2025-2026).

## Setup

Create a `.env` file in the root directory:

```
MONGO_URI=your_mongodb_connection_string
TOKEN_SECRET=your_secret_key_here
PORT=3000
```

Install dependencies and run:

```
npm install
npm start
```

## API Endpoints

**Authentication**
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login and receive JWT token
- GET /api/auth/me - Get current user (protected)

**Users**
- GET /api/users - List all users (protected)

**Posts**
- POST /api/posts - Create post (protected)
- GET /api/posts - List posts with filters (protected)
- GET /api/posts/:id - Get single post (protected)
- PUT /api/posts/:id/like - Like post (protected)
- PUT /api/posts/:id/dislike - Dislike post (protected)
- POST /api/posts/:id/comment - Add comment (protected)
- DELETE /api/posts/:id - Delete own post (protected)

All protected routes require header: `auth-token: <JWT>`

## Data Models

**User**
- name, email (unique), password (hashed), createdAt

**Post**
- title, topics (Politics|Health|Sport|Tech), content, author, expiresAt
- likes, dislikes, likedBy, dislikedBy, comments
- Virtual fields: status (Live|Expired), timeLeft

**Comment**
- user, text, createdAt

## Key Features

- JWT-based authentication (https://jwt.io/introduction)
- Password hashing with bcryptjs
- Post expiration blocking interactions
- Validation with Joi schemas
- Topic filtering and interest-based sorting
- Owner restrictions (cannot like own posts)
- Duplicate reaction prevention

## Testing

Automated test suite using Axios (https://github.com/axios/axios) located in `/mingle-tests`:

```
cd mingle-tests
npm install axios
node test-mingle.js
```

## References

- [Node.js Documentation](https://nodejs.org/en/docs/)
- [Express.js documentation](https://expressjs.com/en/guide/routing.html)
- [MongoDB Mongoose](https://mongoosejs.com/docs/guide.html)
- [JWT specification](https://datatracker.ietf.org/doc/html/rfc7519)
- [bcryptjs Documentation](https://www.npmjs.com/package/bcryptjs)
- [Joi Documentation](https://joi.dev/api/?v=17.6.0)
- [Axios HTTP client](https://axios-http.com/docs/intro)
