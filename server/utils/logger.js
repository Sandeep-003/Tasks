function now() {
  return new Date().toISOString();
}

function write(level, message, meta) {
  if (meta) {
    console.log(`[${now()}] [${level}] ${message}`, meta);
    return;
  }
  console.log(`[${now()}] [${level}] ${message}`);
}

export const logger = {
  info(message, meta) {
    write('INFO', message, meta);
  },
  warn(message, meta) {
    write('WARN', message, meta);
  },
  error(message, meta) {
    write('ERROR', message, meta);
  },
};
