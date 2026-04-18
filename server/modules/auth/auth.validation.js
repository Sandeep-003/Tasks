import { badRequest } from '../../utils/errors.js';

function requiredString(value, field) {
  if (typeof value !== 'string' || !value.trim()) {
    throw badRequest(`${field} is required`);
  }
  return value.trim();
}

export function validateRegisterInput(body) {
  const name = requiredString(body.name, 'Name');
  const email = requiredString(body.email, 'Email').toLowerCase();
  const password = requiredString(body.password, 'Password');

  if (password.length < 6) {
    throw badRequest('Password must be at least 6 characters');
  }

  return { name, email, password };
}

export function validateLoginInput(body) {
  const email = requiredString(body.email, 'Email').toLowerCase();
  const password = requiredString(body.password, 'Password');
  return { email, password };
}
