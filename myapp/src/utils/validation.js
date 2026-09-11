/**
 * Reusable Form Validation Utilities
 */

export const validateRequired = (value, fieldName = 'Field') => {
  if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return '';
};

export const validateEmail = (email) => {
  if (!email || email.trim() === '') {
    return 'Email is required';
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address';
  }
  return '';
};

export const validatePhone = (phone, required = true) => {
  if (!phone || phone.trim() === '') {
    if (required) return 'Phone number is required';
    return '';
  }
  const cleanPhone = phone.trim().replace(/[\s\-()]/g, '');
  const phoneRegex = /^(\+?\d{1,4})?[0-9]{10}$/;
  if (!phoneRegex.test(cleanPhone)) {
    return 'Please enter a valid 10-digit phone number';
  }
  return '';
};

export const validateAmount = (amount, fieldName = 'Amount') => {
  if (amount === undefined || amount === null || amount === '') {
    return `${fieldName} is required`;
  }
  const num = Number(amount);
  if (isNaN(num) || num <= 0) {
    return `${fieldName} must be greater than 0`;
  }
  return '';
};

export const validateMinLength = (value, min, fieldName = 'Field') => {
  if (!value || value.length < min) {
    return `${fieldName} must be at least ${min} characters`;
  }
  return '';
};

export const validateMaxLength = (value, max, fieldName = 'Field') => {
  if (value && value.length > max) {
    return `${fieldName} must be at most ${max} characters`;
  }
  return '';
};

export const validatePassword = (password) => {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  return '';
};

export const validateDate = (date) => {
  if (!date) {
    return 'Date is required';
  }
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return 'Please provide a valid date';
  }
  return '';
};

export const validateDuplicate = (value, list, key = 'email', fieldName = 'Email') => {
  if (!value || !Array.isArray(list)) return '';
  const exists = list.some(
    (item) => String(item[key] || '').toLowerCase().trim() === String(value).toLowerCase().trim()
  );
  if (exists) {
    return `${fieldName} already exists in records`;
  }
  return '';
};
