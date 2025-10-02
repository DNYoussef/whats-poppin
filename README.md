# What's Poppin! - Event Discovery Platform

AI-powered event discovery platform built with Next.js 14, Supabase, and OpenAI.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase
- **AI**: OpenAI GPT
- **Testing**: Vitest
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd whats-poppin
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your credentials:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
- `OPENAI_API_KEY`: Your OpenAI API key

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:ci` - Run ESLint with no warnings allowed
- `npm run typecheck` - Run TypeScript type checking
- `npm run typecheck:ci` - Run strict type checking
- `npm run test` - Run tests in watch mode
- `npm run test:ci` - Run tests with coverage
- `npm run test:ui` - Open Vitest UI

## Project Structure

```
whats-poppin/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   ├── lib/             # Utility libraries
│   └── types/           # TypeScript type definitions
├── tests/               # Test files
├── docs/                # Documentation
└── ...config files
```

## Development Guidelines

### NASA Rule 10 Compliance

All functions in this codebase follow NASA's Rule 10:
- Functions limited to 60 lines
- Minimum 2 assertions per function
- No recursion allowed

### File Organization

- Source code: `/src`
- Tests: `/tests`
- Documentation: `/docs`
- Configuration: Root directory only

### Code Style

- TypeScript strict mode enabled
- ESLint configured for Next.js
- Tailwind CSS for styling
- Component-based architecture

## Testing

Run tests:
```bash
npm run test
```

Generate coverage report:
```bash
npm run test:ci
```

View coverage in browser:
```bash
open coverage/index.html
```

## Deployment

This project is optimized for Vercel deployment:

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

## License

Proprietary - All rights reserved

## Version Log

| Version | Date | Agent/Model | Change Summary | Status |
|--------:|------|-------------|----------------|--------|
| 1.0.0 | 2025-10-02 | base-template@sonnet-4.5 | Initial project foundation | OK |
