# Pollflow Realtime

A real-time polling application built with Next.js 14 (App Router), Supabase, and Socket.io.

## Features

- **Create Polls**: Create new polls with multiple options.
- **Real-time Updates**: Live vote counts update instantly across all connected clients using Socket.io.
- **Duplicate Prevention**: Prevents multiple votes from the same browser using fingerprinting and IP checks.
- **Shareable Links**: Unique, short URLs for sharing polls.
- **Responsive Design**: Built with Tailwind CSS and Framer Motion for smooth animations.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes, Supabase (PostgreSQL), Socket.io
- **Database**: Supabase PostgreSQL
- **Realtime**: Socket.io (Custom implementation within Next.js)

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/Anubhab-Rakshit/pollflow.git
    cd pollflow/pollflow-realtime
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure Environment Variables:
    Create `.env.local` in the root directory and add your Supabase credentials:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
    SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
    ```
    > Note: Replace `your-supabase-url` with a valid URL (e.g., from Supabase dashboard) or the build will fail.

4.  Set up the Database:
    Run the SQL script located in `supabase_schema.sql` in your Supabase SQL Editor to create the necessary tables and policies.

5.  Run the development server:
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser.

## Deployment

### Vercel Deployment Note

This project uses a custom Socket.io server integrated into Next.js API routes (`src/pages/api/socket/io.ts`). While this works seamlessly locally, deploying to Vercel (Serverless) has limitations:
- **WebSocket connections** may not be persistent due to serverless function timeouts.
- For production scale, it is recommended to use a separate Node.js server for the Socket.io backend or a managed service like Pusher.
- However, for demos and light usage, the provided standalone configuration (`addTrailingSlash: false`) attempts to work within the constraints.

### Build

To build explicitly for production:

```bash
npm run build
```

## Project Structure

- `src/app`: App Router pages and API routes.
- `src/pages/api/socket`: Socket.io server handler (Legacy API route for server access).
- `src/components`: React components (UI, Polls, Providers).
- `src/lib`: Utility functions and Supabase client.
- `src/hooks`: Custom hooks (e.g., `use-fingerprint`).
