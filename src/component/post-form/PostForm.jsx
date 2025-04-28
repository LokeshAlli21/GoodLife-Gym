import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Input, Button } from '../index' // Assuming these are your custom components
import userService from '../../supabase/conf' // adjust path if needed

function PostForm() {
    const [loading, setLoading] = useState(false)
    const { register, handleSubmit, reset } = useForm({
        defaultValues: {
            first_name: '',
            middle_name: '',
            last_name: '',
            email: '',
            phone: '',
            height_feet: '',
            height_inches: '',
            weight_kg: '',
            photo_url: '',
        }
    })

    const submit = async (data) => {
        setLoading(true)
        try {
            const result = await userService.createUser(data)
            console.log("User created successfully:", result)
            reset() // Reset form after successful submit
            alert('User created successfully ✅')
        } catch (error) {
            console.error("Failed to create user:", error)
            alert('Failed to create user ❌')
        } finally {
            setLoading(false)
        }
    }

    return loading ? (
        <div className="text-center text-gray-500 py-6">
            <p>Submitting...</p>
        </div>
    ) : (
        <form onSubmit={handleSubmit(submit)} className="flex flex-wrap bg-white p-6 rounded-lg shadow-md">
            {/* Form Fields */}
            <div className="w-full md:w-1/3 px-2 mb-4">
                <Input label="First Name" placeholder="First Name" {...register("first_name", { required: true })} />
            </div>
            <div className="w-full md:w-1/3 px-2 mb-4">
                <Input label="Middle Name" placeholder="Middle Name" {...register("middle_name")} />
            </div>
            <div className="w-full md:w-1/3 px-2 mb-4">
                <Input label="Last Name" placeholder="Last Name" {...register("last_name", { required: true })} />
            </div>
            <div className="w-full md:w-1/2 px-2 mb-4">
                <Input label="Email" type="email" placeholder="Email address" {...register("email", { required: true })} />
            </div>
            <div className="w-full md:w-1/2 px-2 mb-4">
                <Input label="Phone" type="tel" placeholder="Phone number" {...register("phone")} />
            </div>
            <div className="w-full md:w-1/3 px-2 mb-4">
                <Input label="Height (feet)" type="number" placeholder="e.g. 5" {...register("height_feet")} />
            </div>
            <div className="w-full md:w-1/3 px-2 mb-4">
                <Input label="Height (inches)" type="number" placeholder="e.g. 8" {...register("height_inches")} />
            </div>
            <div className="w-full md:w-1/3 px-2 mb-4">
                <Input label="Weight (kg)" type="number" step="0.01" placeholder="e.g. 70.5" {...register("weight_kg")} />
            </div>
            <div className="w-full px-2 mb-4">
                <Input label="Photo URL" placeholder="https://..." {...register("photo_url")} />
            </div>

            {/* Submit Button */}
            <div className="w-full px-2 mt-2">
                <Button
                    type="submit"
                    bgColor="bg-orange-500 hover:bg-orange-600"
                    className="w-full text-white font-semibold py-3 rounded-lg shadow-md transform transition-all duration-300 hover:scale-105"
                >
                    Submit
                </Button>
            </div>
        </form>
    )
}

export default PostForm
