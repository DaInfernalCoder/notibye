import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * Allows safe HTML tags for email content while removing dangerous scripts
 */
export const sanitizeHTML = (htmlContent: string): string => {
  return DOMPurify.sanitize(htmlContent, {
    ALLOWED_TAGS: [
      'p', 'br', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'strong', 'b', 'em', 'i', 'u', 'a', 'ul', 'ol', 'li',
      'blockquote', 'pre', 'code', 'hr', 'table', 'thead', 'tbody',
      'tr', 'th', 'td', 'img'
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'alt', 'src', 'width', 'height', 'style'
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'iframe'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
    KEEP_CONTENT: false
  });
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email) && email.length <= 254;
};

/**
 * Validate API key formats
 */
export const validateApiKey = (key: string, type: 'stripe' | 'posthog' | 'resend'): boolean => {
  if (!key || key.length < 8) return false;
  
  switch (type) {
    case 'stripe':
      return /^(sk|pk)_(test|live)_[a-zA-Z0-9]{24,}$/.test(key);
    case 'posthog':
      return /^phc_[a-zA-Z0-9]{43}$/.test(key);
    case 'resend':
      return /^re_[a-zA-Z0-9_]{32,}$/.test(key);
    default:
      return false;
  }
};

/**
 * Sanitize user input to prevent injection attacks
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};