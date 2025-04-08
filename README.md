# Plannora Project

This repository contains the Plannora event planning application.

## Structure

The project is structured as follows:
- `/plannora/` - Main application code

## Running the Application

### Option 1: Using the provided script

Run the application using the provided shell script:

```bash
./run-plannora.sh
```

### Option 2: Navigate to the app directory

```bash
cd plannora
npm run dev
```

## Important Notes

- The application runs on port 3203
- Make sure you're in the correct directory when running npm commands
- All npm commands should be run from the `/plannora/` directory, not from the parent directory

# Plannora - Event Planning App

Plannora is a comprehensive event planning application that allows users to configure events by adding various services such as venues, catering, music, and more.

## Features

- Create and configure events with basic details
- Browse and add service providers from multiple categories
- Adjust quantities and track selections
- Generate a complete offer with total pricing
- Responsive design for all devices

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router

## Getting Started

### Prerequisites

- Node.js (version 14 or later)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/plannora.git
cd plannora
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

The application will be available at http://localhost:3203

## Deployment

This project is configured for easy deployment on Vercel. Simply connect your GitHub repository to Vercel and it will automatically deploy your application.

## Project Structure

- `/src/components` - Reusable UI components
- `/src/pages` - Page components
- `/src/context` - React context for state management
- `/src/data` - Mock data for providers

## Current Limitations

- Uses mock data instead of real providers
- No authentication or user accounts
- No persistent storage

## Future Enhancements

- User authentication and accounts
- Admin panel for managing providers
- Email notifications
- PDF generation for quotes
- Integration with payment providers

# Plannora

Plannora is a web application for event planning and management.

## Features

- User authentication (register, login, profile management)
- Event creation and management
- Step-by-step event planning process
- Category-based organization of event details

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Authentication**: JWT, bcrypt
- **Deployment**: Vercel (Frontend + API Routes)

## Local Development

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or Atlas)

### Setup

1. Clone the repository
   ```
   git clone https://github.com/yourusername/plannora.git
   cd plannora
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   ```

4. Start the development server
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3209`

## Deployment to Vercel

### Prerequisites

- A Vercel account
- A MongoDB Atlas account (or your own MongoDB instance)

### Deployment Steps

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

2. Log in to your Vercel account and click "New Project"

3. Connect to your Git provider and select the repository

4. Configure the build settings:
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Add the following environment variables in the Vercel dashboard:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your JWT secret key
   - `NODE_ENV`: Set to `production`
   - `CORS_ORIGIN`: Set to your Vercel domain (e.g., `https://plannora.vercel.app`)

6. Click "Deploy"

### Environment Variables

Make sure to set the following environment variables in your Vercel dashboard:

- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: A secure random string for JWT token generation
- `NODE_ENV`: Set to `production` for production deployment
- `CORS_ORIGIN`: Set to your Vercel domain

## Project Structure

```
plannora/
├── server/
│   ├── config/
│   │   └── database.ts    # Database configuration
│   ├── middleware/
│   │   └── auth.ts        # Authentication middleware
│   ├── models/
│   │   ├── Event.ts       # Event model
│   │   ├── User.ts        # User model
│   │   └── types.ts       # TypeScript interfaces
│   └── routes/
│       ├── authRoutes.ts  # Authentication routes
│       └── eventRoutes.ts # Event routes
├── src/
│   ├── components/        # React components
│   ├── contexts/          # React contexts
│   ├── pages/             # Page components
│   └── utils/
│       └── api.js         # API client
├── .env                   # Environment variables
├── vercel.json            # Vercel configuration
├── package.json           # Project dependencies
└── vite.config.js         # Vite configuration
```

## License

MIT 