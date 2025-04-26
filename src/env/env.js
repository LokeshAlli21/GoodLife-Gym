const env = {
    supabaseUrl: String(import.meta.env.VITE_SUPABASE_URL), // endpoint
    supabaseAnonKey: String(import.meta.env.VITE_SUPABASE_ANON_KEY),    
    supabaseServiceRoleKey: String(import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY),    
    supabaseDbUrl: String(import.meta.env.VITE_SUPABASE_DB_URL),    
    jwtSecret: String(import.meta.env.VITE_JWT_SECRET),
}
export default env