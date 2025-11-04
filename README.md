# Unified Multi-Channel Inbox

A production-ready customer communication platform that aggregates messages from SMS, WhatsApp, Email, and social media into a single, intuitive inbox.

## 🎯 Key Features

- **Unified Inbox**: Manage all customer conversations across channels in one place
- **Multi-Channel Support**: SMS (Twilio), WhatsApp, Email, Twitter DMs, Facebook Messenger
- **Real-time Collaboration**: Live presence, @mentions, and shared notes
- **Contact Management**: Centralized CRM with conversation history and internal notes
- **Message Scheduling**: Schedule campaigns and automated follow-ups
- **Analytics Dashboard**: Track engagement metrics and response times
- **Role-based Access**: Admin, Editor, and Viewer roles for team collaboration
- **Secure Webhooks**: Incoming message handling with Twilio webhook integration

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: PostgreSQL (via Supabase), Prisma ORM
- **Authentication**: Better Auth with Google OAuth
- **Messaging**: Twilio SDK (SMS/WhatsApp)
- **Real-time**: Pusher for live updates
- **UI Components**: shadcn/ui, Recharts for analytics

## 📋 Environment Variables

\`\`\`env
# Database
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]

# Authentication
AUTH_SECRET=your_secret_key
AUTH_TRUST_HOST=true
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Pusher
PUSHER_APP_ID=your_app_id
PUSHER_KEY=your_key
PUSHER_SECRET=your_secret
NEXT_PUBLIC_PUSHER_KEY=your_public_key
NEXT_PUBLIC_PUSHER_CLUSTER=us2
\`\`\`

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in `.env.local`
4. Run database migrations: `npm run prisma:migrate`
5. Seed the database: `npm run seed`
6. Start development server: `npm run dev`

## 📊 Integration Comparison

| Channel | Latency | Cost | Reliability | Notes |
|---------|---------|------|-------------|-------|
| SMS | ~2-5s | $0.0075/msg | 99.9% | Best for notifications |
| WhatsApp | ~2-5s | $0.01/msg | 99.95% | Sandbox mode for testing |
| Email | ~5-30s | Free* | 95% | *Using Resend/SMTP |
| Twitter | ~5-10s | Free | 98% | API v2, DMs only |
| Facebook | ~3-10s | Free | 97% | Requires approval |

## 🔐 Security

- Row-level security (RLS) on database tables
- Secure webhook signature validation
- Environment variables for all secrets
- Rate limiting on API endpoints
- CORS configuration for trusted origins

## 📝 Database Schema

See `prisma/schema.prisma` for complete schema. Key models:

- **User**: Authentication and authorization
- **Team**: Organizational grouping
- **Contact**: CRM with unified data
- **Message**: Normalized message storage
- **InternalNote**: Collaboration notes
- **ScheduledMessage**: Automated outreach
- **Analytics**: Engagement tracking

## 🔗 Webhook Setup

Configure Twilio webhook to: `https://yourapp.com/api/webhooks/twilio`

Twilio will POST incoming messages here for processing.

## 📄 License

MIT

## 👥 Support

For issues or questions, please open an GitHub issue or contact support.
