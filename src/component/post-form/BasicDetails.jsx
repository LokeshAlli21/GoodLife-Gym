import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Input, Button } from '../index';
import userService from '../../supabase/conf';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaCamera, FaUpload, FaSyncAlt, FaTimes } from "react-icons/fa";

function BasicDetails({ handleSubmitBasicDetails }) {
  const navigate = useNavigate();
  const [photoPreview, setPhotoPreview] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [facingMode, setFacingMode] = useState("environment");
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      first_name: '', middle_name: '', last_name: '', email: '', phone: '',
      photo: null, gender: "", dob: "", address: "", blood_group: '',
    },
  });

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      toast.success("Camera permission granted ✅");
      return true;
    } catch (err) {
      toast.error("Camera permission denied ❌");
      return false;
    }
  };

  const openCamera = async () => {
    if (!(await requestCameraPermission())) return;
    try {
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode } });
      streamRef.current = stream;
      setShowCamera(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 200);
    } catch (error) {
      toast.error("Camera access denied ❌");
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    [canvas.width, canvas.height] = [video.videoWidth || 640, video.videoHeight || 480];
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageDataUrl = canvas.toDataURL('image/jpeg');
    setPhotoPreview(imageDataUrl);
    
    const dataURLtoFile = (dataUrl, fileName) => {
      const arr = dataUrl.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
      const bstr = atob(arr[1]);
      const u8arr = new Uint8Array(bstr.length);
      for (let i = bstr.length - 1; i >= 0; i--) u8arr[i] = bstr.charCodeAt(i);
      return new File([u8arr], fileName, { type: mime });
    };

    setCapturedImage(dataURLtoFile(imageDataUrl, `captured_${Date.now()}.jpg`));
    setValue("photo", null);
    closeCamera();
  };

  const closeCamera = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    setShowCamera(false);
  };

  const switchCamera = async (e) => {
    e.preventDefault();
    const newMode = facingMode === "user" ? "environment" : "user";
    closeCamera();
    setFacingMode(newMode);
    toast.success(`Switched to ${newMode === 'user' ? 'front' : 'rear'} camera`);
    setTimeout(openCamera, 300);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
      setCapturedImage(null);
    }
  };

  const submit = (data) => {
    handleSubmitBasicDetails({
      ...data,
      photo: capturedImage || data.photo?.[0] || null,
    });
    setPhotoPreview(null);
    setCapturedImage(null);
    reset();
  };

  useEffect(() => () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
  }, []);

  return (
    <div className="max-w-md mx-auto p-4 bg-white">
      <form onSubmit={handleSubmit(submit)} className="space-y-5">
        
        {/* Photo Preview */}
        {photoPreview && (
          <div className="flex justify-center">
            <div className="relative">
              <img src={photoPreview} alt="Preview" className="w-32 h-32 object-cover rounded-full border-4 border-orange-400 shadow-lg"/>
              <button type="button" onClick={() => {setPhotoPreview(null); setCapturedImage(null);}} 
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600">
                <FaTimes size={12} />
              </button>
            </div>
          </div>
        )}

        {/* Photo Upload Section */}
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-xl border border-orange-200">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Profile Photo</label>
          
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col items-center justify-center p-4 bg-white border-2 border-dashed border-orange-300 rounded-lg hover:bg-orange-50 cursor-pointer transition-all">
              <FaUpload className="text-orange-500 text-xl mb-2" />
              <span className="text-xs text-gray-600 text-center">Upload Photo</span>
              <input type="file" accept="image/*" {...register("photo")} onChange={handlePhotoChange} className="hidden" />
            </label>
            
            <button type="button" onClick={openCamera}
              className="flex flex-col items-center justify-center p-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all">
              <FaCamera className="text-xl mb-2" />
              <span className="text-xs">Take Photo</span>
            </button>
          </div>
        </div>

        {/* Name Fields */}
        <div className="space-y-3">
          <Input label="First Name" required {...register("first_name", { required: true })} className="w-full" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Middle Name" {...register("middle_name")} className="w-full" />
            <Input label="Last Name" required {...register("last_name", { required: true })} className="w-full" />
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-3">
          <Input label="Email" type="email" {...register("email")} className="w-full" />
          <Input label="Phone" type="tel" {...register("phone")} className="w-full" />
        </div>

        {/* Personal Details */}
        <div className="grid grid-cols-2 gap-3">
          <Input label="Date of Birth" type="date" {...register("dob")} className="w-full" />
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Blood Group</label>
            <select {...register("blood_group")} 
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white">
              <option value="">Select</option>
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">Gender</label>
          <div className="flex gap-4">
            {["Male", "Female", "Other"].map(gender => (
              <label key={gender} className="flex items-center space-x-2 cursor-pointer">
                <input type="radio" value={gender} {...register("gender")} 
                  className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500" />
                <span className="text-sm text-gray-700">{gender}</span>
              </label>
            ))}
          </div>
        </div>

        <Input label="Address" {...register("address")} className="w-full" />

        {/* Submit Button */}
        <Button type="submit" 
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200">
          Complete Profile
        </Button>
      </form>

      {/* Camera Modal */}
{showCamera && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 m-0">
    <div className="w-screen h-screen bg-white rounded-none overflow-hidden shadow-none flex flex-col">
      <div className="relative aspect-square flex-grow bg-black">
        <video
          ref={videoRef}
          className="absolute top-0 left-0 w-full h-full object-cover"
          autoPlay
          playsInline
          muted
        />
        <button
          onClick={switchCamera}
          className="absolute top-4 right-4 bg-white bg-opacity-20 backdrop-blur-sm text-red-500 p-2 rounded-full hover:bg-opacity-30"
        >
          <FaSyncAlt />
        </button>
      </div>

      <div className="p-4 bg-white">
        <div className="flex gap-3">
          <button
            onClick={capturePhoto}
            className="flex-1 bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors"
          >
            Capture
          </button>
          <button
            onClick={closeCamera}
            className="flex-1 bg-gray-500 text-white py-3 rounded-xl font-semibold hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
)}

    </div>
  );
}

export default BasicDetails;