import { badRequest } from '../../utils/errors.js';

const VALID_STATUS = new Set(['todo', 'in-progress', 'done']);

function asOptionalString(value) {
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof value !== 'string') {
    return null;
  }
  const next = value.trim();
  return next.length ? next : null;
}

export function validateCreateTaskInput(body) {
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const description = asOptionalString(body.description);
  const status = body.status || 'todo';

  if (!title) {
    throw badRequest('Title is required');
  }

  if (!VALID_STATUS.has(status)) {
    throw badRequest('Invalid status');
  }

  return { title, description, status };
}

export function validateUpdateTaskInput(body) {
  const payload = {};

  if (body.title !== undefined) {
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    if (!title) {
      throw badRequest('Title cannot be empty');
    }
    payload.title = title;
  }

  if (body.description !== undefined) {
    payload.description = asOptionalString(body.description);
  }

  if (body.status !== undefined) {
    if (!VALID_STATUS.has(body.status)) {
      throw badRequest('Invalid status');
    }
    payload.status = body.status;
  }

  if (Object.keys(payload).length === 0) {
    throw badRequest('No fields to update');
  }

  return payload;
}

export function validateTaskQuery(query) {
  const page = Number.parseInt(query.page || '1', 10);
  const limit = Number.parseInt(query.limit || '10', 10);
  const status = query.status;

  if (!Number.isInteger(page) || page < 1) {
    throw badRequest('Invalid page value');
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw badRequest('Invalid limit value');
  }
  if (status && !VALID_STATUS.has(status)) {
    throw badRequest('Invalid status filter');
  }

  return {
    page,
    limit,
    status: status || null,
  };
}
