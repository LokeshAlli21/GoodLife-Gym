import { supabase } from './supabaseClient.js'
import { toast } from 'react-toastify';
import { format } from 'date-fns-tz'; // install date-fns-tz if not installed

class UserService {
    // User related services


    async createUser({ first_name, middle_name, last_name, email, phone, height_feet, height_inches, weight_kg, photo }) {
        try {
            toast.info('Uploading photo... 📤');
    
            // Generate timestamp in Asia/Kolkata timezone
            const indiaTime = format(new Date(), 'yyyyMMddHHmmss', { timeZone: 'Asia/Kolkata' });
    
            // Get file extension from original photo
            const fileExtension = photo.name.split('.').pop();
    
            // Create custom filename: firstname-lastname-timestamp.ext
            const sanitizedFirstName = first_name.trim().toLowerCase().replace(/\s+/g, '-');
            const sanitizedLastName = last_name.trim().toLowerCase().replace(/\s+/g, '-');
            const photoFileName = `${sanitizedFirstName}-${sanitizedLastName}-${indiaTime}.${fileExtension}`;
    
            const photoPath = `profile-photos/${photoFileName}`;
    
            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase
                .storage
                .from('images')
                .upload(photoPath, photo);

                console.log('uploadData', uploadData);
                
    
            if (uploadError) {
                console.error("Photo upload error:", uploadError);
                toast.error('Failed to upload photo ❌');
                throw uploadError;
            }
    
            // Get the public URL for the uploaded photo
            const { data: publicURL, error: urlError } = supabase
                .storage
                .from('images')
                .getPublicUrl(photoPath);
                
                
                if (urlError) {
                    console.error("Error getting photo URL:", urlError);
                    toast.error('Failed to fetch photo URL ❌');
                    throw urlError;
                } else {
                    console.log("Public URL:", publicURL);
                  }
                
            toast.success('Photo uploaded successfully ✅');
    
            // Insert user data
            const { data, error } = await supabase
                .from('users')
                .insert([{
                    first_name,
                    middle_name,
                    last_name,
                    email,
                    phone,
                    height_feet,
                    height_inches,
                    weight_kg,
                    photo_url: publicURL.publicUrl,
                }]);
    
            if (error) {
                console.error("Supabase createUser error:", error);
                throw error;
            }
    
            toast.success('User created successfully 🎉');
            return data;
        } catch (error) {
            console.error("Error creating user:", error);
            throw error;
        }
    }
    
    

    async updateUser(id, { first_name, middle_name, last_name, email, phone, height_feet, height_inches, weight_kg, photo_url }) {
        const { data, error } = await supabase
            .from('users')
            .update({
                first_name,
                middle_name,
                last_name,
                email,
                phone,
                height_feet,
                height_inches,
                weight_kg,
                photo_url
            })
            .eq('id', id)

        if (error) {
            console.error("supabase updateUser error:", error)
            throw error
        }

        return data
    }

    async deleteUser(id) {
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', id)

        if (error) {
            console.error("supabase deleteUser error:", error)
            throw error
        }

        return true
    }

    async getUser(id) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            console.error("supabase getUser error:", error)
            throw error
        }

        return data
    }

    async getUsers() {
        const { data, error } = await supabase
            .from('users')
            .select('*')

        if (error) {
            console.error("supabase getUsers error:", error)
            throw error
        }

        return data
    }
}

const userService = new UserService()
export default userService
