import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Input, Button } from '../index'; // Assuming these are your custom components
import userService from '../../supabase/conf'; // adjust path if needed
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; // Ensure toastify is installed
import { FaCamera, FaUpload } from "react-icons/fa"

function PostForm() {
  const navigate = useNavigate();
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



  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  
  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      setShowCamera(true);
  
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error("Camera error:", error);
      toast.error("Failed to access camera ❌");
    }
  };
  
  const capturePhoto = () => {
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
  
    const context = canvas.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL("image/png");
  
    setPhotoPreview(imageData);
    closeCamera();
  };
  
  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setShowCamera(false);
  };
  

  const submit = async (data) => {
    setLoading(true);
    console.log("Original form data:", data);

    try {
      // Fix and prepare data
      const fixedData = {
        ...data,
        height_feet: data.height_feet === '' ? null : parseInt(data.height_feet, 10),
        height_inches: data.height_inches === '' ? null : parseInt(data.height_inches, 10),
        weight_kg: data.weight_kg === '' ? null : parseFloat(data.weight_kg),
        photo: data.photo?.[0] || null, // take first photo file
      };

      console.log("Fixed data before sending:", fixedData);

      toast.info('Submitting data...', { autoClose: 1000 }); // Toast to notify submission start
      const result = await userService.createUser(fixedData);
      console.log("User created successfully:", result);

      reset(); // Clear the form
      toast.success('User created successfully ✅');
      navigate('/all-profiles');

    } catch (error) {
      console.error("Failed to create user:", error);

      // Handle duplicate email error separately
      if (error.code === '23505') {
        toast.error('This email already exists. Please use a different email address ❌');
      } else {
        toast.error('Failed to create user. Please try again later ❌');
      }
    } finally {
      setLoading(false);
    }
  };

  return loading ? (
    <div className="text-center text-gray-500 py-6">
      <p>Submitting...</p>
      <div className="loader"></div> {/* Add your loading spinner here */}
    </div>
  ) : (
    <form onSubmit={handleSubmit(submit)} className="flex flex-wrap bg-white p-6 rounded-lg shadow-md">
      {photoPreview && (
        <div className="mt-4 w-full pb-4">
          <img src={photoPreview} alt="Preview" className="w-[300px] h-[300px] mx-auto object-cover rounded-lg border-2 border-yellow-500" />
        </div>
      )}
      {/* Form Fields */}
      <div className="w-full md:w-1/3 px-2 mb-4">
        <Input label="First Name" required placeholder="First Name" {...register("first_name", { required: true })} />
      </div>

      <div className="w-full md:w-1/3 px-2 mb-4">
        <Input label="Middle Name" placeholder="Middle Name" {...register("middle_name")} />
      </div>
      <div className="w-full md:w-1/3 px-2 mb-4">
        <Input label="Last Name" required placeholder="Last Name" {...register("last_name", { required: true })} />
      </div>

      {/* Photo Upload */}
      <div className="w-full px-2 mb-4 md:w-1/3">
  <label className="block mb-2 text-gray-700 font-semibold">
    Upload Photo
  </label>
  
  <div className="flex items-center gap-2 bg-gray-100 border-2 border-yellow-500 rounded-lg shadow-md px-3 py-2">
    <FaUpload className="text-yellow-500 text-xl" />
    <input
      type="file"
      accept="image/*"
      {...register("photo")}
      onChange={handlePhotoChange}
      required
      className="flex-1 bg-gray-100 focus:outline-none"
    />
  </div>

  <button
    type="button"
    onClick={openCamera}
    className="mt-3 flex items-center justify-center gap-2 bg-orange-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-orange-600 transition-all duration-300 w-full"
  >
    <FaCamera className="text-lg" />
    Open Camera
  </button>
</div>
{showCamera && (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center">
    <div className="bg-white rounded-lg p-4 shadow-xl flex flex-col items-center gap-4">
      <video ref={videoRef} className="w-80 h-60 rounded-lg" autoPlay muted />

      <div className="flex gap-4">
        <button
          onClick={capturePhoto}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Capture
        </button>
        <button
          onClick={closeCamera}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}


      <div className="w-full md:w-1/2 px-2 mb-4">
        <Input label="Email" type="email" placeholder="Email address" {...register("email")} />
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
