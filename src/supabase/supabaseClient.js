// supabaseClient.js
import { createClient } from '@supabase/supabase-js';
import env from '../env/env';
// import multer from 'multer';

const supabaseUrl = env.supabaseUrl
const supabaseKey = env.supabaseServiceRoleKey

export const supabase = createClient(supabaseUrl, supabaseKey);

// Multer middleware to handle multipart/form-data (file uploads)
// const storage = multer.memoryStorage(); // store file in memory
// export const upload = multer({ storage });