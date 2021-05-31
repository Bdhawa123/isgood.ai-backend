module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL:
    process.env.DATABASE_URL ||
    "postgresql://mattsirkis@localhost/isgooddatabase",
  TEST_DATABASE_URL:
    process.env.TEST_DATABASE_URL ||
    "postgresql://mattsirkis@localhost/isgooddatabase_test",
  JWT_SECRET: process.env.JWT_SECRET || "change-this-secret",
  JWT_EXPIRY: process.env.JWT_EXPIRY || "5h",

  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
  CLIENT_ID_MANAGEMENT: process.env.CLIENT_ID_MANAGEMENT,
  CLIENT_SECRET_MANAGEMENT: process.env.CLIENT_SECRET_MANAGEMENT,

  S3_KEY: process.env.S3_KEY,
  S3_SECRET: process.env.S3_SECRET,
  BUCKET_NAME: process.env.BUCKET_NAME,
  BUCKET_REGION: process.env.BUCKET_NAME,
};
