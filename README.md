# Full-Stack Application with Supabase

A modern full-stack application built with React, TypeScript, Tailwind CSS, and Supabase, featuring real-time data handling, file storage, and event processing.

## 🚀 Features

### Real-time Data Handling
- Supabase Realtime Subscriptions for live data updates
- Connection state management and reconnection logic
- Table-specific subscriptions with filtering options

### File Storage
- Supabase Storage integration for file management
- Secure file upload/download functionality
- File type validation and size restrictions
- Bucket policies and permissions

### Event Handling
- Database triggers for automated actions
- Webhook integration for external service communication
- Comprehensive error handling and logging
- Event-driven architecture

### Deployment Configuration
- Frontend deployment on Netlify
- Backend serverless functions on Vercel
- Environment variable management
- Automated build and deployment pipelines

## 🛠️ Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Supabase, Netlify Functions, Vercel Serverless Functions
- **Database**: PostgreSQL (via Supabase)
- **Storage**: Supabase Storage
- **Real-time**: Supabase Realtime
- **Authentication**: Supabase Auth
- **Deployment**: Netlify (frontend), Vercel (functions)

## 📁 Project Structure

```
/
├── src/                      # Frontend source code
│   ├── components/           # React components
│   │   ├── ui/               # UI components
│   │   ├── FileUploader.tsx  # File upload component
│   │   ├── FileManager.tsx   # File management component
│   │   ├── RealtimeStatus.tsx # Realtime connection status
│   │   └── RealtimeData.tsx  # Real-time data display component
│   ├── hooks/                # Custom React hooks
│   │   ├── useRealtime.ts    # Hook for realtime subscriptions
│   │   ├── useStorage.ts     # Hook for file storage operations
│   │   └── useEvents.ts      # Hook for event handling
│   ├── services/             # Service layer
│   │   ├── supabase.ts       # Supabase client configuration
│   │   ├── realtime.ts       # Realtime service
│   │   ├── storage.ts        # Storage service
│   │   └── events.ts         # Events service
│   └── pages/                # Page components
├── netlify/                  # Netlify functions
│   └── functions/            # Serverless functions
│       ├── webhook.ts        # Main webhook handler
│       ├── storage-webhook.ts # Storage event handler
│       └── realtime-webhook.ts # Realtime event handler
├── supabase/                 # Supabase configuration
│   └── migrations/           # Database migrations
├── public/                   # Static assets
├── netlify.toml              # Netlify configuration
├── vercel.json               # Vercel configuration
└── package.json              # Project dependencies
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Supabase account
- Netlify account
- Vercel account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/fullstack-supabase-app.git
   cd fullstack-supabase-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update the environment variables in the `.env` file with your Supabase credentials.

5. Start the development server:
   ```bash
   npm run dev
   ```

## 🔄 Real-time Data Handling

The application uses Supabase's Realtime feature to provide live updates:

```typescript
// Subscribe to table changes
const subscriptionId = realtimeService.subscribeToTable(
  'bookings',
  (payload) => {
    console.log('Booking updated:', payload);
    // Update UI with new data
  },
  {
    event: 'UPDATE', // Listen only for updates
    schema: 'public'
  }
);

// Unsubscribe when done
realtimeService.unsubscribe(subscriptionId);
```

## 📦 File Storage

File management is handled through Supabase Storage:

```typescript
// Upload a file
const result = await storageService.uploadFile(file, {
  bucket: 'profile-photos',
  path: `user-${userId}/${file.name}`,
  metadata: {
    userId,
    uploadedAt: new Date().toISOString()
  }
});

// Get a public URL
const url = storageService.getPublicUrl('profile-photos', filePath);
```

## 🔔 Event Handling

The application uses an event-driven architecture:

```typescript
// Register event handler
eventsService.on('booking_created', async (payload) => {
  console.log('New booking created:', payload);
  // Send notification, update stats, etc.
});

// Trigger event manually
await eventsService.trigger('booking_created', bookingData);

// Send webhook to external service
await eventsService.sendWebhook('booking_created', bookingData);
```

## 🚢 Deployment

### Frontend (Netlify)

1. Connect your GitHub repository to Netlify
2. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Add environment variables in the Netlify dashboard
4. Enable automatic deployments

### Backend (Vercel Functions)

1. Connect your GitHub repository to Vercel
2. Configure build settings in `vercel.json`
3. Add environment variables in the Vercel dashboard
4. Deploy the functions

## 🔒 Security Best Practices

- All sensitive operations are performed in serverless functions
- Row Level Security (RLS) is enabled on all Supabase tables
- File uploads are validated for type and size
- Webhooks use secret keys for authentication
- Environment variables are used for sensitive information

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.