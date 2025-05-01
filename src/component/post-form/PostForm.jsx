import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Input, Button } from '../index'; // Your custom components
import userService from '../../supabase/conf'; // Adjust path as needed
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaCamera, FaUpload } from "react-icons/fa";

function PostForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [facingMode, setFacingMode] = useState("environment"); // default to rear camera

  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      first_name: '',
      middle_name: '',
      last_name: '',
      email: '',
      phone: '',
      height_feet: '',
      height_inches: '',
      weight_kg: '',
      photo: null,
    },
  });

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop()); // immediately stop it after getting permission
      toast.success("Camera permission granted ✅");
      return true;
    } catch (err) {
      toast.error("Camera permission denied ❌");
      console.error("Camera permission error:", err);
      return false;
    }
  };
  

  const openCamera = async () => {
    const permissionGranted = await requestCameraPermission();
    if (!permissionGranted) return
    try {if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facingMode } });
      streamRef.current = stream;
      setShowCamera(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 200); // slight delay to ensure video is mounted
    } catch (error) {
      toast.error("Camera access denied ❌");
      console.error("Camera error:", error);
    }
  };
  

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
  
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
  
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
    const imageDataUrl = canvas.toDataURL('image/jpeg'); // jpeg is usually lighter than png
    setCapturedImage(imageDataUrl);
    setPhotoPreview(imageDataUrl);
    setValue("photo", null); // Clear file input if image is captured
    closeCamera();
  };
  

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setShowCamera(false);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
      setCapturedImage(null); // Clear camera image if file is selected
    }
  };

  const submit = async (data) => {
    setLoading(true);
    try {
      const fixedData = {
        ...data,
        height_feet: data.height_feet ? parseInt(data.height_feet, 10) : null,
        height_inches: data.height_inches ? parseInt(data.height_inches, 10) : null,
        weight_kg: data.weight_kg ? parseFloat(data.weight_kg) : null,
        photo: capturedImage ? capturedImage : (data.photo?.[0] || null),
      };

      toast.info('Submitting...');
      await userService.createUser(fixedData);

      reset();
      setPhotoPreview(null);
      setCapturedImage(null);
      toast.success('User created successfully ✅');
      navigate('/all-profiles');
    } catch (error) {
      console.error("Create user error:", error);
      if (error.code === '23505') {
        toast.error('This email already exists ❌');
      } else {
        toast.error('Failed to submit. Please try again ❌');
      }
    } finally {
      setLoading(false);
    }
  };

  // Switch camera
const switchCamera = () => {
  setFacingMode(prev => (prev === "user" ? "environment" : "user"));
};

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="flex flex-wrap bg-white p-6 rounded-lg shadow-md"
    >
      {loading && (
        <div className="text-center text-gray-600 w-full">
          <p>Submitting...</p>
        </div>
      )}

      {photoPreview && (
        <div className="w-full mb-4 text-center">
          <img
            src={photoPreview}
            alt="Preview"
            className="w-[300px] h-[300px] object-cover mx-auto rounded-lg border-2 border-yellow-500"
          />
        </div>
      )}

      {/* Name Fields */}
      <div className="w-full md:w-1/3 px-2 mb-4">
        <Input label="First Name" required {...register("first_name", { required: true })} />
      </div>
      <div className="w-full md:w-1/3 px-2 mb-4">
        <Input label="Middle Name" {...register("middle_name")} />
      </div>
      <div className="w-full md:w-1/3 px-2 mb-4">
        <Input label="Last Name" required {...register("last_name", { required: true })} />
      </div>

      {/* Photo Upload */}
      <div className="w-full md:w-1/3 px-2 mb-4">
        <label className="block mb-1 text-gray-700 font-medium">Upload Photo</label>
        <div className="flex items-center gap-2 bg-gray-100 border-2 border-yellow-500 rounded-lg shadow-sm px-3 py-2">
          <FaUpload className="text-yellow-500 text-xl" />
          <input
            type="file"
            accept="image/*"
            {...register("photo")}
            onChange={handlePhotoChange}
            className="flex-1 bg-gray-100 outline-none"
          />
        </div>
        <button
          type="button"
          onClick={openCamera}
          className="mt-3 w-full flex items-center justify-center gap-2 bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-all"
        >
          <FaCamera />
          Open Camera
        </button>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed min-h-[70vh] min-w-[70vw] inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white absolute min-h-[70vh] min-w-[70vw] p-6 rounded-lg shadow-xl flex flex-col items-center gap-4">
          <video
            ref={videoRef}
            className="w-80 h-60 rounded-lg bg-black"
            autoPlay
            playsInline
            muted
          />

            <div className="flex gap-4">
              <button
                onClick={capturePhoto}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Capture
              </button>
              <button
          onClick={switchCamera}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
        >
          Switch Camera
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

      {/* Contact Fields */}
      <div className="w-full md:w-1/2 px-2 mb-4">
        <Input label="Email" type="email" {...register("email")} />
      </div>
      <div className="w-full md:w-1/2 px-2 mb-4">
        <Input label="Phone" type="tel" {...register("phone")} />
      </div>

      {/* Physical Attributes */}
      <div className="w-full md:w-1/3 px-2 mb-4">
        <Input label="Height (feet)" type="number" {...register("height_feet")} />
      </div>
      <div className="w-full md:w-1/3 px-2 mb-4">
        <Input label="Height (inches)" type="number" {...register("height_inches")} />
      </div>
      <div className="w-full md:w-1/3 px-2 mb-4">
        <Input label="Weight (kg)" type="number" step="0.01" {...register("weight_kg")} />
      </div>

      {/* Submit */}
      <div className="w-full px-2 mt-4">
        <Button
          type="submit"
          bgColor="bg-orange-500 hover:bg-orange-600"
          className="w-full text-white py-3 font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105"
        >
          Submit
        </Button>
      </div>
    </form>
  );
}

export default PostForm;
