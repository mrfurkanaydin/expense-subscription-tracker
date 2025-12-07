# Frontend - Expense & Subscription Tracker

Next.js 16 ve React 19 ile geliştirilmiş modern frontend uygulaması.

## Teknolojiler

- **Next.js 16** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Framer Motion** - Animations
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Lucide React** - Icons
- **ESLint & Prettier** - Code quality

## Kurulum

```bash
npm install
```

## Geliştirme

```bash
npm run dev
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışacaktır.

## Scripts

- `npm run dev` - Development server başlatır
- `npm run build` - Production build oluşturur
- `npm run start` - Production server başlatır
- `npm run lint` - ESLint kontrolü yapar
- `npm run lint:fix` - ESLint hatalarını düzeltir
- `npm run format` - Prettier ile kod formatlar
- `npm run format:check` - Prettier kontrolü yapar
- `npm run type-check` - TypeScript type kontrolü yapar

## Proje Yapısı

```
frontend/
├── app/              # Next.js App Router
│   ├── layout.tsx    # Root layout
│   ├── page.tsx      # Ana sayfa
│   └── globals.css   # Global styles
├── components/       # React components
│   └── ui/          # UI components
├── lib/             # Utility functions
│   ├── utils.ts     # cn utility
│   ├── motion.ts    # Framer Motion variants
│   └── hooks.ts     # Custom hooks
└── public/          # Static assets
```

## Özellikler

- ✅ Mobile-first responsive design
- ✅ Dark mode support
- ✅ Accessibility (WCAG AA)
- ✅ TypeScript strict mode
- ✅ Modern animations (Framer Motion)
- ✅ Form validation (React Hook Form + Zod)
- ✅ Code quality tools (ESLint + Prettier)
