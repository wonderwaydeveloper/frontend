// Validation Test Suite - Frontend/Backend Sync Check
import { 
  emailSchema, 
  phoneSchema, 
  passwordSchema, 
  usernameSchema, 
  codeSchema,
  loginSchema,
  registerStep1Schema,
  registerStep3Schema,
  phoneLoginStep1Schema,
  phoneLoginStep2Schema
} from './validation'

// Test cases matching backend validation
export const validationTests = {
  // Email tests
  email: {
    valid: ['test@example.com', 'user.name@domain.co.uk'],
    invalid: ['invalid-email', '@domain.com', 'test@', '']
  },
  
  // Phone tests  
  phone: {
    valid: ['+1234567890', '(555) 123-4567', '555-123-4567'],
    invalid: ['123', 'abc123', '123456789012345678', '']
  },
  
  // Password tests (matching backend StrongPassword + PhoneRegisterRequest)
  password: {
    valid: ['Password123!', 'MySecure@Pass1', 'Strong#Pass99'],
    invalid: [
      'password', // too weak
      '123456', // too weak  
      'Password', // no number or special
      'password123', // no uppercase or special
      'PASSWORD123!', // no lowercase
      'Pass1!', // too short
      'NoSpecial123' // no special character
    ]
  },
  
  // Username tests
  username: {
    valid: ['user123', 'test_user', 'User_Name_123'],
    invalid: ['user-name', 'user.name', 'user name', 'user@name', '']
  },
  
  // 2FA Code tests
  code: {
    valid: ['123456', '000000', '999999'],
    invalid: ['12345', '1234567', 'abc123', 'a12345', '']
  }
}

// Run validation tests
export const runValidationTests = () => {
  const results = {
    passed: 0,
    failed: 0,
    details: [] as string[]
  }
  
  // Test email validation
  validationTests.email.valid.forEach(email => {
    try {
      emailSchema.parse(email)
      results.passed++
    } catch {
      results.failed++
      results.details.push(`Email validation failed for valid input: ${email}`)
    }
  })
  
  validationTests.email.invalid.forEach(email => {
    try {
      emailSchema.parse(email)
      results.failed++
      results.details.push(`Email validation passed for invalid input: ${email}`)
    } catch {
      results.passed++
    }
  })
  
  // Test password validation
  validationTests.password.valid.forEach(password => {
    try {
      passwordSchema.parse(password)
      results.passed++
    } catch (error) {
      results.failed++
      results.details.push(`Password validation failed for valid input: ${password} - ${error}`)
    }
  })
  
  validationTests.password.invalid.forEach(password => {
    try {
      passwordSchema.parse(password)
      results.failed++
      results.details.push(`Password validation passed for invalid input: ${password}`)
    } catch {
      results.passed++
    }
  })
  
  // Test phone validation
  validationTests.phone.valid.forEach(phone => {
    try {
      phoneSchema.parse(phone)
      results.passed++
    } catch (error) {
      results.failed++
      results.details.push(`Phone validation failed for valid input: ${phone} - ${error}`)
    }
  })
  
  // Test username validation
  validationTests.username.valid.forEach(username => {
    try {
      usernameSchema.parse(username)
      results.passed++
    } catch (error) {
      results.failed++
      results.details.push(`Username validation failed for valid input: ${username} - ${error}`)
    }
  })
  
  // Test 2FA code validation
  validationTests.code.valid.forEach(code => {
    try {
      codeSchema.parse(code)
      results.passed++
    } catch (error) {
      results.failed++
      results.details.push(`Code validation failed for valid input: ${code} - ${error}`)
    }
  })
  
  return results
}

// Backend compatibility check
export const backendCompatibilityCheck = {
  // These should match backend exactly
  passwordRequirements: {
    minLength: 8,
    requiresUppercase: true,
    requiresLowercase: true, 
    requiresNumber: true,
    requiresSpecialChar: true, // [@$!%*?&]
    weakPasswords: ['password', '123456', 'qwerty', 'abc123', 'password123']
  },
  
  phoneFormat: /^[0-9+\-\s()]+$/,
  usernameFormat: /^[a-zA-Z0-9_]+$/,
  codeFormat: /^[0-9]{6}$/,
  
  fieldLimits: {
    email: { max: 255 },
    username: { max: 255 },
    name: { max: 255 },
    phone: { minDigits: 10, maxDigits: 15 }
  }
}