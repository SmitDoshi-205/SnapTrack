let dotenvLoaded = false;

try {
  const dotenv = await import("dotenv");
  dotenv.config();
  dotenvLoaded = true;
} catch (err) {
  console.log("dotenv not found, skipping (production mode)");
}

const required = ["DATABASE_URL", "JWT_SECRET", "REFRESH_TOKEN_SECRET"];

for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

export const env = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "15m",
  refreshSecret: process.env.REFRESH_TOKEN_SECRET,
  refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  emailProvider: process.env.EMAIL_PROVIDER || "gmail",
  gmailUser: process.env.GMAIL_USER || "",
  gmailPass: process.env.GMAIL_APP_PASSWORD || "",
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || "",
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || "",
};