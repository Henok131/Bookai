// Environment validation on startup
export function validateEnvironment(): void {
  const required = ['DATABASE_URL']
  
  if (process.env.NODE_ENV === 'production') {
    required.push('POSTGRES_PASSWORD')
  }

  for (const envVar of required) {
    if (!process.env[envVar]) {
      console.error(`❌ Required environment variable missing: ${envVar}`)
      process.exit(1)
    }
  }

  // Security check: fail if using default password in production
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.POSTGRES_PASSWORD === 'bookai_password'
  ) {
    console.error('❌ SECURITY RISK: Using default database password in production!')
    console.error('   Please set POSTGRES_PASSWORD to a strong password')
    process.exit(1)
  }
}

