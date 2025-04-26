import { supabase } from './supabaseClient.js'

class UserService {
    // User related services
    async createUser({ first_name, middle_name, last_name, email, phone, height_feet, height_inches, weight_kg, photo_url }) {
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
                photo_url
            }])

        if (error) {
            console.error("supabase createUser error:", error)
            throw error
        }

        return data
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
