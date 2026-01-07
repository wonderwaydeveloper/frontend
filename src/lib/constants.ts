// Error messages matching backend validation messages
export const ERROR_MESSAGES = {
  // Login errors
  LOGIN_REQUIRED: 'Email or username is required',
  PASSWORD_REQUIRED: 'Password is required',
  INVALID_CREDENTIALS: 'Invalid login credentials',
  
  // Registration errors
  NAME_REQUIRED: 'Name is required',
  NAME_MAX_LENGTH: 'Name must be less than 255 characters',
  USERNAME_REQUIRED: 'Username is required',
  USERNAME_MAX_LENGTH: 'Username must be less than 255 characters',
  USERNAME_FORMAT: 'Username can only contain letters, numbers, and underscores',
  EMAIL_REQUIRED: 'Email is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  EMAIL_MAX_LENGTH: 'Email must be less than 255 characters',
  PHONE_REQUIRED: 'Phone number is required',
  PHONE_INVALID: 'Please enter a valid phone number',
  PHONE_MIN_LENGTH: 'Phone number must be at least 10 digits',
  PHONE_MAX_LENGTH: 'Phone number must be less than 15 digits',
  
  // Password errors
  PASSWORD_MIN_LENGTH: 'The password must be at least 8 characters',
  PASSWORD_UPPERCASE: 'The password must contain at least one uppercase letter',
  PASSWORD_LOWERCASE: 'The password must contain at least one lowercase letter',
  PASSWORD_NUMBER: 'The password must contain at least one number',
  PASSWORD_WEAK: 'The password is too weak',
  PASSWORD_MISMATCH: 'Passwords do not match',
  
  // 2FA errors
  TWO_FACTOR_REQUIRED: 'Two-factor code must be 6 digits',
  TWO_FACTOR_INVALID: 'Two-factor code must contain only numbers',
  
  // Date errors
  DATE_REQUIRED: 'Date of birth is required',
  DATE_FUTURE: 'Date of birth must be before today',
  AGE_MINIMUM: 'You must be at least 13 years old',
  
  // General errors
  REQUIRED_FIELD: 'This field is required',
  INVALID_FORMAT: 'Invalid format',
  TOO_MANY_REQUESTS: 'Too many requests. Please try again later.',
  SERVER_ERROR: 'Server error. Please try again later.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SESSION_EXPIRED: 'Session expired. Please login again.'
} as const

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  REGISTRATION_SUCCESS: 'Registration completed successfully',
  CODE_SENT: 'Verification code sent successfully',
  EMAIL_VERIFIED: 'Email verified successfully',
  PHONE_VERIFIED: 'Phone verified successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  TWO_FACTOR_ENABLED: '2FA enabled successfully',
  TWO_FACTOR_DISABLED: '2FA disabled successfully'
} as const

// Validation patterns matching backend
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[0-9+\-\s()]+$/,
  USERNAME: /^[a-zA-Z0-9_]+$/,
  PASSWORD_UPPERCASE: /[A-Z]/,
  PASSWORD_LOWERCASE: /[a-z]/,
  PASSWORD_NUMBER: /[0-9]/,
  PASSWORD_SPECIAL: /[@$!%*?&]/,
  CODE_NUMERIC: /^[0-9]+$/
} as const

// Weak passwords list matching backend
export const WEAK_PASSWORDS = [
  'password',
  '123456',
  '123456789',
  'qwerty',
  'abc123',
  'password123',
  'admin',
  'letmein',
  'welcome',
  'monkey',
  '1234567890',
  'password1',
  '123123',
  'qwerty123',
  'dragon',
  'master',
  'hello',
  'login',
  'princess',
  'solo',
  'qwertyuiop',
  'starwars',
  'superman'
] as const