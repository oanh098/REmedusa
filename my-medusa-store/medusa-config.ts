import { loadEnv, defineConfig } from '@medusajs/framework/utils'
import Stripe from 'stripe';

loadEnv(process.env.NODE_ENV || 'development', process.cwd())


module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
    paymentProviders: {
      stripe: {
        options: {
          secret_key: process.env.STRIPE_SECRET_KEY,
          publishable_key: process.env.STRIPE_PUBLISHABLE_KEY,
        },
      },
    },
    
  },
  
  
})
