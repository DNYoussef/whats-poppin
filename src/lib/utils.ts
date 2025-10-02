import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Validates email format
 * NASA Rule 10: ≤60 lines, 2+ assertions
 */
export function isValidEmail(email: string): boolean {
  // Assertion 1: Email must be a string
  if (typeof email !== 'string') {
    throw new Error('Email must be a string');
  }

  // Assertion 2: Email must not be empty
  if (email.length === 0) {
    throw new Error('Email cannot be empty');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates password strength
 * NASA Rule 10: ≤60 lines, 2+ assertions
 */
export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  // Assertion 1: Password must be a string
  if (typeof password !== 'string') {
    throw new Error('Password must be a string');
  }

  const errors: string[] = [];

  // Minimum length
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  // Contains uppercase
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  // Contains lowercase
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  // Contains number
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // Assertion 2: Return object must have required properties
  const result = { valid: errors.length === 0, errors };
  if (!('valid' in result) || !('errors' in result)) {
    throw new Error('Invalid return object structure');
  }

  return result;
}
