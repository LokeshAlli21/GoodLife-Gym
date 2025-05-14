import { supabase } from './supabaseClient.js'
import { toast } from 'react-toastify';
import { format } from 'date-fns-tz'; // install date-fns-tz if not installed

class UserService {
    // User related services

async createUser({
  first_name,
  middle_name,
  last_name,
  email,
  phone,
  photo,
  gender,
  dob,
  address,
  blood_group
}) {
  try {
    let photo_url = null;

    if (photo && photo.name && photo.type) {
      toast.info('Uploading photo... 📤');

      const indiaTime = format(new Date(), 'yyyyMMddHHmmss', { timeZone: 'Asia/Kolkata' });
      const fileExtension = photo.name.split('.').pop();
      const sanitizedFirstName = first_name.trim().toLowerCase().replace(/\s+/g, '-');
      const sanitizedLastName = last_name.trim().toLowerCase().replace(/\s+/g, '-');
      const photoFileName = `${sanitizedFirstName}-${sanitizedLastName}-${indiaTime}.${fileExtension}`;
      const photoPath = `profile-photos/${photoFileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(photoPath, photo, { upsert: true });

      if (uploadError) {
        console.error("Photo upload error:", uploadError);
        toast.error('Failed to upload photo ❌');
        throw uploadError;
      }

      const { data: publicURL, error: urlError } = supabase
        .storage
        .from('images')
        .getPublicUrl(photoPath);

      if (urlError) {
        console.error("Error getting photo URL:", urlError);
        toast.error('Failed to fetch photo URL ❌');
        throw urlError;
      }

      photo_url = publicURL.publicUrl;
      toast.success('Photo uploaded successfully ✅');
    }

    const { data, error } = await supabase
      .from('members')
      .insert([{
        first_name,
        middle_name,
        last_name,
        email,
        phone,
        gender,
        dob: dob === '' ? null : dob,
        address,
        blood_group,
        photo_url
      }])
      .select()

    if (error) {
      console.error("Supabase insert error:", error);
      throw error;
    }
    // console.log(data);
    

    toast.success('Member created successfully 🎉');
    return data;
  } catch (error) {
    console.error("Error creating member:", error);
    throw error;
  }
}

async createHealthMetrics(member_id, {
  height_feet,
  height_inches,
  weight_kg,
  bicps_size_inches,
  bmi,
  notes
}) {
  try {
    const healthData = {
      member_id: Number(member_id),
      height_feet: Number(height_feet),
      height_inches: Number(height_inches),
      weight_kg: parseFloat(weight_kg),
      bicps_size_inches: parseFloat(bicps_size_inches),
      bmi: parseFloat(bmi),
      notes: notes || null
    };

    const { data, error } = await supabase
      .from('health_metrics')
      .upsert([healthData], { onConflict: 'member_id' });

    if (error) {
      console.error("Supabase upsert error (health_metrics):", error);
      throw error;
    }

    toast.success('Health metrics saved successfully 💪');
    return data;
  } catch (error) {
    console.error("Error upserting health metrics:", error);
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
