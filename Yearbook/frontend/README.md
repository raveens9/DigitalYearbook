# Digital Yearbook - Frontend

React + TypeScript frontend for the Digital Yearbook application.

## Tech Stack

- React 18
- TypeScript
- Vite
- React Router v6
- Tailwind CSS

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

### Development

```bash
# Start development server
npm run dev
```

The app will be available at http://localhost:5173

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── api/              # API client and endpoints
│   ├── client.ts     # HTTP client with auth handling
│   └── endpoints.ts  # API endpoint functions
├── components/       # Reusable components
│   ├── Comment.tsx
│   ├── Layout.tsx
│   ├── Navbar.tsx
│   ├── Post.tsx
│   └── ProtectedRoute.tsx
├── contexts/         # React contexts
│   └── AuthContext.tsx
├── pages/            # Page components
│   ├── Feed.tsx
│   ├── Login.tsx
│   ├── PostDetail.tsx
│   ├── Profile.tsx
│   ├── Register.tsx
│   ├── Search.tsx
│   └── UserProfile.tsx
├── types/            # TypeScript types
│   └── index.ts
├── App.tsx           # Main app component
├── main.tsx          # Entry point
└── index.css         # Global styles
```

## Features

- User authentication (login/register/logout)
- JWT token management with auto-refresh
- Social feed with posts
- Create, edit, delete posts
- Like/unlike posts
- Comments on posts
- User profiles
- Student search
- Report content

## Environment Variables

| Variable     | Description     | Default               |
| ------------ | --------------- | --------------------- |
| VITE_API_URL | Backend API URL | http://localhost:8000 |
