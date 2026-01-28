# Microblogging Frontend

A modern, enterprise-grade social media frontend built with Next.js 16, React 19, and TypeScript, featuring comprehensive authentication, real-time social interactions, and professional UI/UX.

## 🚀 Features

### Authentication & Security
- **Multi-step Registration**: 3-step process with email/phone verification
- **Multiple Login Methods**: Email, username, or phone number
- **Social Authentication**: Google and Apple integration with callback handling
- **Two-Factor Authentication**: Basic 2FA setup and verification
- **Password Management**: Secure reset with 6-digit code verification
- **Email Verification**: Complete verification flow with resend functionality
- **Phone Verification**: SMS-based verification with auto-submit
- **Protected Routes**: Automatic redirects based on authentication state
- **Session Management**: Secure token handling with httpOnly cookies

### Social Media Features
- **Timeline**: Real-time post feed with infinite scroll capability
- **Post Creation**: 280-character limit with media upload placeholders
- **Post Interactions**: Like, comment, repost, quote tweet, bookmark, share
- **User Profiles**: Complete profile pages with stats and post history
- **Search System**: Advanced search for posts and users with tabbed interface
- **Notifications**: Real-time notification system with mark-as-read functionality
- **Trending Topics**: Hashtag trending with post counts
- **User Suggestions**: "Who to follow" recommendations
- **Follow System**: Complete follow/unfollow functionality
- **Quote Tweets**: Support for quoted posts with embedded content

### UI/UX Excellence
- **Responsive Design**: Mobile-first approach with perfect desktop scaling
- **Loading States**: Comprehensive loading indicators (spinners, skeletons, cards)
- **Error Handling**: Global error boundaries with user-friendly fallbacks
- **Toast Notifications**: 4 types (success, error, info, warning) with animations
- **Navigation**: Sidebar navigation with active states and right sidebar widgets
- **Accessibility**: WCAG compliant with skip links, ARIA labels, screen reader support
- **Dark Mode**: Built-in dark mode support with system preference detection
- **Animations**: Smooth transitions and micro-interactions
- **Performance**: Lazy loading, code splitting, and bundle optimization

## 🛠 Tech Stack

### Core Technologies
- **Next.js**: 16.1.1 (App Router, Server Components)
- **React**: 19.2.3 (Latest with concurrent features)
- **TypeScript**: 5.x (Strict mode enabled)
- **Tailwind CSS**: 4.x (Latest with CSS-in-JS)

### State Management & Data
- **TanStack Query**: 5.90.16 (Server state management)
- **Zod**: 4.3.5 (Runtime validation)
- **React Hook Form**: 7.70.0 (Form management)
- **Axios**: 1.13.2 (HTTP client with interceptors)

### UI Components & Icons
- **Radix UI**: Accessible component primitives
- **Lucide React**: 0.562.0 (Modern icon library)
- **React Hot Toast**: 2.6.0 (Toast notifications)
- **Date-fns**: 4.1.0 (Date utilities)

### Development & Build
- **ESLint**: 9.x (Code linting)
- **PostCSS**: Latest (CSS processing)
- **Clsx & Tailwind Merge**: Utility class management

## 📦 Installation

### Prerequisites
- Node.js 18+ (recommended: 20+)
- npm or yarn or pnpm
- Backend API running on port 8000

### Quick Start
```bash
# Clone repository
git clone <repository-url>
cd frontend

# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local
# Edit .env.local with your API URL

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

### Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## 🏗 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   │   ├── login/         # Login page
│   │   ├── register/      # Multi-step registration
│   │   ├── phone-login/   # Phone authentication
│   │   ├── forgot-password/ # Password reset
│   │   ├── email-verify/  # Email verification
│   │   └── social/        # Social auth callback
│   ├── (main)/            # Main application pages
│   │   ├── timeline/      # Home timeline
│   │   ├── profile/       # User profile
│   │   ├── notifications/ # Notifications
│   │   └── explore/       # Search & discovery
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── auth/             # Authentication components
│   ├── layout/           # Layout components
│   ├── post/             # Post-related components
│   ├── ui/               # UI primitives
│   └── providers/        # Context providers
├── contexts/             # React contexts
├── hooks/                # Custom hooks
├── lib/                  # Utilities & configurations
│   ├── api.ts           # API client
│   ├── auth-storage.ts  # Authentication storage
│   ├── validation.ts    # Zod schemas
│   └── utils.ts         # Helper functions
├── store/                # State management
├── types/                # TypeScript definitions
└── utils/                # Utility functions
```

## 🔐 Authentication System

### Multi-Step Registration
```typescript
// Step 1: Contact verification
POST /auth/register/step1
{
  "contact": "user@example.com",
  "contact_type": "email"
}

// Step 2: Code verification
POST /auth/register/step2
{
  "session_id": "uuid",
  "code": "123456"
}

// Step 3: Complete profile
POST /auth/register/step3
{
  "session_id": "uuid",
  "username": "username",
  "password": "password",
  "password_confirmation": "password",
  "date_of_birth": "1990-01-01"
}
```

### Login Methods
```typescript
// Email/Username login
POST /auth/login
{
  "login": "user@example.com", // or username
  "password": "password",
  "two_factor_code": "123456" // optional
}

// Phone login
POST /auth/phone/login
{
  "phone": "+1234567890",
  "verification_code": "123456"
}
```

### Social Authentication
```typescript
// Redirect to provider
GET /auth/social/google
GET /auth/social/apple

// Handle callback
GET /auth/social/{provider}/callback?code=...&state=...
```

## 🎨 UI Components

### Authentication Components
```typescript
// Reusable auth input with validation
<AuthInput
  label="Email"
  type="email"
  fieldType="email"
  value={email}
  onChange={setEmail}
  error={errors.email}
  showStrength={false}
/>

// Auth button with loading state
<AuthButton
  type="submit"
  loading={mutation.isPending}
  variant="primary"
>
  Sign In
</AuthButton>
```

### Post Components
```typescript
// Post creation
<CreatePost />

// Post display with interactions
<PostCard post={post} />
```

### Layout Components
```typescript
// Main navigation
<Sidebar />

// Trending & suggestions
<RightSidebar />
```

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Layout Structure
```css
/* Mobile-first approach */
.container {
  @apply px-4 sm:px-6 lg:px-8;
}

/* Responsive grid */
.main-layout {
  @apply grid grid-cols-1 lg:grid-cols-[256px_1fr_320px];
}
```

## 🔍 Search & Discovery

### Search Implementation
```typescript
// Advanced search with tabs
const { data: searchResults } = useQuery({
  queryKey: ['search', query, activeTab],
  queryFn: () => api.get(`/search/${activeTab}?q=${query}`),
  enabled: !!query
})
```

### Trending System
```typescript
// Trending hashtags
const { data: trending } = useQuery({
  queryKey: ['trending'],
  queryFn: () => api.get('/hashtags/trending')
})
```

## 🔔 Notifications

### Real-time Notifications
```typescript
// Notification types
type NotificationType = 'like' | 'comment' | 'follow' | 'mention' | 'repost'

// Notification display
<NotificationCard
  notification={notification}
  onMarkAsRead={markAsRead}
/>
```

## 🎯 Performance Optimization

### Code Splitting
```typescript
// Lazy loading components
const LazyCreatePost = lazy(() => import('@/components/post/create-post'))
const LazyPostCard = lazy(() => import('@/components/post/post-card'))

// Suspense wrapper
<Suspense fallback={<LoadingSpinner />}>
  <LazyCreatePost />
</Suspense>
```

### Image Optimization
```typescript
// Next.js config
const nextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  }
}
```

### Bundle Optimization
```typescript
// Package imports optimization
experimental: {
  optimizePackageImports: [
    'lucide-react',
    '@radix-ui/react-avatar',
    '@radix-ui/react-dialog'
  ]
}
```

## 🧪 Validation System

### Zod Schemas
```typescript
// Email validation
export const emailSchema = z.string()
  .min(1, 'Email is required')
  .email('Invalid email format')
  .max(255, 'Email too long')

// Password validation (social media optimized)
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .refine(password => !WEAK_PASSWORDS.includes(password.toLowerCase()))
```

### Real-time Validation
```typescript
// Field validation with sanitization
export const validateField = {
  email: (value: string) => emailSchema.safeParse(value),
  password: (value: string) => passwordSchema.safeParse(value),
  username: (value: string) => usernameSchema.safeParse(value)
}
```

## 🎨 Styling & Theming

### Tailwind Configuration
```css
/* Custom animations */
@keyframes slide-in-from-right {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

/* Accessibility support */
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; }
}

@media (prefers-contrast: high) {
  .border-gray-200 { border-color: #000; }
}
```

### Dark Mode Support
```css
:root {
  --background: #ffffff;
  --foreground: #171717;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}
```

## 🔧 API Integration

### Axios Configuration
```typescript
// API client with interceptors
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  withCredentials: true
})

// Request interceptor for CSRF
api.interceptors.request.use(config => {
  const csrfToken = AuthStorage.getCSRFToken()
  if (csrfToken) {
    config.headers['X-CSRF-TOKEN'] = csrfToken
  }
  return config
})

// Response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      AuthStorage.clearAuth()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

## 🧪 Testing

### Validation Tests
```typescript
// Backend compatibility tests
export const runValidationTests = () => {
  const results = { passed: 0, failed: 0, details: [] }
  
  // Test email validation
  validationTests.email.valid.forEach(email => {
    try {
      emailSchema.parse(email)
      results.passed++
    } catch {
      results.failed++
    }
  })
  
  return results
}
```

## 🚀 Deployment

### Build Process
```bash
# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Environment Setup
```bash
# Production environment
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NODE_ENV=production
```

## 📊 Performance Metrics

### Core Web Vitals
- **LCP**: < 2.5s (Largest Contentful Paint)
- **FID**: < 100ms (First Input Delay)
- **CLS**: < 0.1 (Cumulative Layout Shift)

### Bundle Analysis
```bash
# Analyze bundle size
npm run build
npx @next/bundle-analyzer
```

## 🔒 Security Features

### Authentication Security
- HttpOnly cookies for token storage
- CSRF token validation
- Secure session management
- Input sanitization and validation

### Content Security
- XSS protection through sanitization
- Secure API communication
- Error boundary protection
- Accessibility compliance

## 🎯 Browser Support

### Supported Browsers
- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

### Progressive Enhancement
- Core functionality works without JavaScript
- Enhanced experience with JavaScript enabled
- Graceful degradation for older browsers

## 📈 Future Enhancements

### Planned Features
- **Real-time Messaging**: WebSocket integration
- **Advanced 2FA**: QR codes and backup codes UI
- **Device Management**: Security dashboard
- **Analytics Dashboard**: User engagement metrics
- **PWA Support**: Offline functionality

### Performance Improvements
- **Service Worker**: Caching strategy
- **Image Optimization**: Advanced lazy loading
- **Bundle Splitting**: Route-based code splitting

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Follow TypeScript strict mode
4. Add comprehensive validation
5. Test responsive design
6. Commit changes (`git commit -m 'Add amazing feature'`)
7. Push to branch (`git push origin feature/amazing-feature`)
8. Open Pull Request

### Code Standards
- TypeScript strict mode
- ESLint configuration compliance
- Responsive design requirements
- Accessibility standards (WCAG 2.1)
- Performance optimization

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using Next.js 16, React 19, and modern web technologies**