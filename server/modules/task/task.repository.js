import { query } from '../../config/db.js';

export async function insertTask(userId, payload) {
  const { title, description, status } = payload;
  const { rows } = await query(
    `INSERT INTO tasks (title, description, status, user_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id, title, description, status, user_id, created_at, updated_at`,
    [title, description, status, userId]
  );
  return rows[0];
}

export async function listTasks(userId, options) {
  const values = [userId];
  const where = ['user_id = $1'];

  if (options.status) {
    values.push(options.status);
    where.push(`status = $${values.length}`);
  }

  const baseWhere = where.join(' AND ');
  const offset = (options.page - 1) * options.limit;

  values.push(options.limit);
  values.push(offset);

  const tasksQuery = `
    SELECT id, title, description, status, user_id, created_at, updated_at
    FROM tasks
    WHERE ${baseWhere}
    ORDER BY created_at DESC
    LIMIT $${values.length - 1} OFFSET $${values.length}
  `;

  const countValues = values.slice(0, values.length - 2);
  const countQuery = `SELECT COUNT(*)::int AS total FROM tasks WHERE ${baseWhere}`;

  const [tasksResult, countResult] = await Promise.all([
    query(tasksQuery, values),
    query(countQuery, countValues),
  ]);

  return {
    tasks: tasksResult.rows,
    total: countResult.rows[0].total,
  };
}

export async function findTaskById(taskId, userId) {
  const { rows } = await query(
    `SELECT id, title, description, status, user_id, created_at, updated_at
     FROM tasks
     WHERE id = $1 AND user_id = $2`,
    [taskId, userId]
  );
  return rows[0] || null;
}

export async function updateTaskById(taskId, userId, payload) {
  const fields = [];
  const values = [];

  Object.entries(payload).forEach(([key, value]) => {
    values.push(value);
    fields.push(`${key} = $${values.length}`);
  });

  values.push(taskId);
  values.push(userId);

  const { rows } = await query(
    `UPDATE tasks
     SET ${fields.join(', ')}, updated_at = now()
     WHERE id = $${values.length - 1} AND user_id = $${values.length}
     RETURNING id, title, description, status, user_id, created_at, updated_at`,
    values
  );

  return rows[0] || null;
}

export async function deleteTaskById(taskId, userId) {
  const { rows } = await query(
    `DELETE FROM tasks
     WHERE id = $1 AND user_id = $2
     RETURNING id, title, description, status, user_id, created_at, updated_at`,
    [taskId, userId]
  );
  return rows[0] || null;
}

export async function getTaskStats(userId) {
  const { rows } = await query(
    `SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status = 'done')::int AS completed,
      COUNT(*) FILTER (WHERE status != 'done')::int AS pending
     FROM tasks
     WHERE user_id = $1`,
    [userId]
  );
  return rows[0];
}
