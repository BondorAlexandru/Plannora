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

Event planning application with Vercel-ready API.

## Development

To run the application locally:

```bash
# Install dependencies
npm install

# Start development server (client + API)
npm run dev
```

## Deployment to Vercel

The project is configured to deploy both the frontend and API to Vercel:

1. Connect your GitHub repository to Vercel
2. Set the following environment variables in Vercel:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Secret for JWT token generation
   - `NODE_ENV`: Set to "production"

3. Deploy with the following settings:
   - Build Command: `npm run vercel-build`
   - Output Directory: `dist`
   - Install Command: `npm install`

## API Routes

The API implements the following endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get current user profile
- `POST /api/auth/logout` - User logout

### Events
- `GET /api/events` - Get all events for current user
- `GET /api/events/:id` - Get a specific event by ID
- `POST /api/events/new` - Create a new event
- `PUT /api/events/:id` - Update an event by ID
- `DELETE /api/events/:id` - Delete an event by ID
- `PATCH /api/events/step` - Update event step
- `PATCH /api/events/category` - Update event category

## Tech Stack

- Frontend: React with Vite
- API: Express.js with serverless functions
- Database: MongoDB
- Deployment: Vercel

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