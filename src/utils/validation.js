// src/utils/validation.js
/**
 * Validation utilities for form fields and user input
 */

import { limits } from '../constants/index';

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if email is valid
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} {isValid, errors, strength}
 */
export const validatePassword = (password) => {
  const errors = [];
  let strength = 0;

  if (!password) {
    return { isValid: false, errors: ['Password is required'], strength: 0 };
  }

  if (password.length < limits.minPasswordLength) {
    errors.push(`Password must be at least ${limits.minPasswordLength} characters long`);
  } else {
    strength += 25;
  }

  if (password.length >= 12) {
    strength += 10;
  }

  if (/[A-Z]/.test(password)) {
    strength += 15;
  }

  if (/[0-9]/.test(password)) {
    strength += 15;
  }

  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    strength += 20;
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength: Math.min(100, strength),
  };
};

/**
 * Validate name format
 * @param {string} name - Name to validate
 * @returns {object} {isValid, error}
 */
export const validateName = (name) => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Name is required' };
  }

  if (name.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters' };
  }

  if (name.length > limits.maxNameLength) {
    return { isValid: false, error: `Name must be less than ${limits.maxNameLength} characters` };
  }

  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  if (!/^[a-zA-Z\s'-]+$/.test(name)) {
    return { isValid: false, error: 'Name contains invalid characters' };
  }

  return { isValid: true, error: null };
};

/**
 * Validate that two values match
 * @param {string} value1 - First value
 * @param {string} value2 - Second value
 * @param {string} fieldName - Name of field for error message
 * @returns {object} {isValid, error}
 */
export const validateMatch = (value1, value2, fieldName = 'Values') => {
  if (value1 !== value2) {
    return { isValid: false, error: `${fieldName} do not match` };
  }
  return { isValid: true, error: null };
};

/**
 * Validate numeric input
 * @param {number} value - Value to validate
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @param {string} fieldName - Name of field for error message
 * @returns {object} {isValid, error}
 */
export const validateNumber = (value, min, max, fieldName = 'Value') => {
  if (value === null || value === undefined || isNaN(value)) {
    return { isValid: false, error: `${fieldName} must be a number` };
  }

  if (value < min) {
    return { isValid: false, error: `${fieldName} must be at least ${min}` };
  }

  if (value > max) {
    return { isValid: false, error: `${fieldName} must be at most ${max}` };
  }

  return { isValid: true, error: null };
};

/**
 * Validate required field
 * @param {string} value - Value to check
 * @param {string} fieldName - Name of field for error message
 * @returns {object} {isValid, error}
 */
export const validateRequired = (value, fieldName = 'This field') => {
  if (!value || (typeof value === 'string' && value.trim().length === 0)) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  return { isValid: true, error: null };
};

/**
 * Validate age
 * @param {number} age - Age to validate
 * @returns {object} {isValid, error}
 */
export const validateAge = (age) => {
  const ageNum = parseInt(age, 10);

  if (isNaN(ageNum)) {
    return { isValid: false, error: 'Age must be a valid number' };
  }

  if (ageNum < 13) {
    return { isValid: false, error: 'You must be at least 13 years old' };
  }

  if (ageNum > 150) {
    return { isValid: false, error: 'Please enter a valid age' };
  }

  return { isValid: true, error: null };
};

/**
 * Validate weight
 * @param {number} weight - Weight in kg
 * @returns {object} {isValid, error}
 */
export const validateWeight = (weight) => {
  const weightNum = parseFloat(weight);

  if (isNaN(weightNum)) {
    return { isValid: false, error: 'Weight must be a valid number' };
  }

  if (weightNum < 20) {
    return { isValid: false, error: 'Weight must be at least 20 kg' };
  }

  if (weightNum > 300) {
    return { isValid: false, error: 'Weight must be less than 300 kg' };
  }

  return { isValid: true, error: null };
};

/**
 * Validate height
 * @param {number} height - Height in cm
 * @returns {object} {isValid, error}
 */
export const validateHeight = (height) => {
  const heightNum = parseFloat(height);

  if (isNaN(heightNum)) {
    return { isValid: false, error: 'Height must be a valid number' };
  }

  if (heightNum < 100) {
    return { isValid: false, error: 'Height must be at least 100 cm' };
  }

  if (heightNum > 250) {
    return { isValid: false, error: 'Height must be less than 250 cm' };
  }

  return { isValid: true, error: null };
};

/**
 * Validate glucose reading
 * @param {number} glucose - Glucose value in mg/dL
 * @returns {object} {isValid, error, status}
 */
export const validateGlucose = (glucose) => {
  const glucoseNum = parseFloat(glucose);

  if (isNaN(glucoseNum)) {
    return { isValid: false, error: 'Glucose must be a valid number', status: null };
  }

  if (glucoseNum < 20) {
    return { isValid: false, error: 'Glucose value seems too low', status: 'critical' };
  }

  if (glucoseNum > 500) {
    return { isValid: false, error: 'Glucose value seems too high', status: 'critical' };
  }

  let status = 'normal';
  if (glucoseNum < 70) {
    status = 'low'; // Hypoglycemia range
  } else if (glucoseNum > 180) {
    status = 'high'; // Hyperglycemia range
  }

  return { isValid: true, error: null, status };
};

/**
 * Validate all form fields
 * @param {object} formData - Object with field names and values
 * @param {object} validationRules - Object with field names and validation functions
 * @returns {object} {isValid, errors}
 */
export const validateForm = (formData, validationRules) => {
  const errors = {};

  for (const field in validationRules) {
    const validator = validationRules[field];
    const value = formData[field];

    const result = validator(value);
    if (!result.isValid) {
      errors[field] = result.error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
