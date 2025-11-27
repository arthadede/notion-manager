export function validateEnv() {
  const required = ['NOTION_API_KEY', 'NOTION_ACTIVITIES_DATABASE_ID'];
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

export function validateOptionalEnv() {
  const optional = ['NOTION_TRANSACTIONS_DATABASE_ID'];
  const missing = optional.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.warn(`Missing optional environment variables: ${missing.join(', ')}`);
  }
}