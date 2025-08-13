# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native healthcare consultation app built with Expo that connects patients with doctors for home visits. The app supports two user types: patients and doctors, with separate authentication flows and interfaces.

## Tech Stack & Architecture

- **Framework**: Expo SDK 53 with React Native
- **Routing**: Expo Router with typed routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk with secure token caching
- **State Management**: Zustand for global state
- **Styling**: TailwindCSS with NativeWind
- **Payments**: Stripe integration
- **Maps**: React Native Maps with Google Places API
- **Email**: Nodemailer for notifications
- **Image Upload**: Cloudinary integration

## Development Commands

```bash
# Start development server
npm start

# Run on specific platforms
npm run ios
npm run android
npm run web

# Code quality
npm run lint          # ESLint + Prettier check
npm run format        # Auto-fix linting and format code

# Database
npx prisma generate   # Generate Prisma client
npx prisma db push    # Push schema changes
npx prisma studio     # Open database browser
```

## App Structure

The app uses Expo Router with a three-tier navigation structure:

1. **Root Layout** (`app/_layout.tsx`): Clerk authentication wrapper
2. **Feature Groups**:
   - `(auth)`: Sign-in, sign-up, password reset
   - `(root)`: Patient interface with tabs (home, consultations, chat, profile)
   - `(doctor)`: Doctor interface with tabs (dashboard, consultations, chat, profile)
3. **API Routes** (`app/(api)`): Server-side endpoints for consultations, payments, messaging

## Database Schema

Core entities managed by Prisma:
- **User**: Patients with personal info and consultation history
- **Doctor**: Medical professionals with approval workflow and location data
- **Consultation**: Central entity linking patients/doctors with status tracking
- **MedicalRecord**: Post-consultation diagnoses and treatment notes
- **Message**: Real-time chat system within consultations
- **Payment**: Stripe integration with platform fee calculation
- **Rating**: Post-consultation feedback system

## Key Features

- **Dual Authentication**: Separate flows for patients and doctors
- **Location Services**: Google Maps integration for home visit requests
- **Real-time Chat**: Message system within active consultations
- **Payment Processing**: Stripe-powered transactions with fee splitting
- **Doctor Approval**: Admin workflow for verifying medical credentials
- **Medical Records**: Secure patient history management

## Environment Variables

Required environment variables:
- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk authentication
- `DATABASE_URL`: PostgreSQL connection string
- `STRIPE_PUBLISHABLE_KEY` / `STRIPE_SECRET_KEY`: Payment processing
- Google Maps API key (configured in app.json)

## Testing & Deployment

The app uses Expo's build system. Before deploying:
1. Run `npm run lint` to ensure code quality
2. Test on both iOS and Android platforms
3. Verify database migrations with Prisma
4. Ensure all environment variables are configured

## Common Patterns

- Use Zustand stores for location and driver selection state
- API routes follow RESTful patterns with proper error handling
- All database operations use Prisma client with proper type safety
- Component styling uses TailwindCSS classes via NativeWind
- Navigation uses typed routes for better developer experience
- Nunca use Emojis dentro do projeto.