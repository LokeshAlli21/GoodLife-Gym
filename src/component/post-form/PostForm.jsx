import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input, Button } from '../index'; // Assuming these are your custom components
import userService from '../../supabase/conf'; // adjust path if needed

function PostForm() {
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
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
      photo: null, // Change to handle file input
    }
  });

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoPreview(URL.createObjectURL(file)); // Set photo preview
    }
  };

  const openCamera = () => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          video.srcObject = stream;
          video.play();
          document.body.appendChild(video); // Temporary for demo purpose
          setTimeout(() => {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = canvas.toDataURL('image/png');
            setPhotoPreview(imageData); // Set photo preview from camera
            stream.getTracks().forEach(track => track.stop()); // Stop camera
            video.remove(); // Remove video after capturing
          }, 3000); // Capture after 3 seconds (you can adjust this time)
        })
        .catch(err => {
          console.error("Camera error:", err);
        });
    }
  };

  const submit = async (data) => {
    setLoading(true);
    try {
      const result = await userService.createUser(data);
      console.log("User created successfully:", result);
      reset(); // Reset form after successful submit
      alert('User created successfully ✅');
    } catch (error) {
      console.error("Failed to create user:", error);
      alert('Failed to create user ❌');
    } finally {
      setLoading(false);
    }
  };

  return loading ? (
    <div className="text-center text-gray-500 py-6">
      <p>Submitting...</p>
    </div>
  ) : (
    <form onSubmit={handleSubmit(submit)} className="flex flex-wrap bg-white p-6 rounded-lg m shadow-md">
        {photoPreview && (
          <div className="mt-4 w-full pb-4">
            {/* <p className="text-gray-700 font-medium">Photo Preview</p> */}
            <img src={photoPreview} alt="Preview" className="w-[300px] h-[300px] mx-auto object-cover rounded-lg border-2 border-yellow-500" />
          </div> 
        )}
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
      {/* Photo Upload */}
<div className="w-full px-2 mb-4 md:w-1/3 px-2 mb-4">
        <label className="block mb-1 text-gray-700 font-medium">Upload Photo</label>
        <input
          type="file"
          accept="image/*"
          {...register("photo")}
          onChange={handlePhotoChange}
          className="w-full p-4 bg-gray-100 rounded-lg border-2 border-yellow-500 shadow-md"
        />
        
        {/* <button
          type="button"
          onClick={openCamera}
          className="mt-2 bg-orange-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-orange-600 transition-all duration-300"
        >
          Open Camera
        </button> */}
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
  );
}

export default PostForm;
