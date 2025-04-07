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