import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Input, Button } from '../index'; // Your custom components
import userService from '../../supabase/conf'; // Adjust path as needed
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaCamera, FaUpload } from "react-icons/fa";

function BasicDetails({
    handleSubmitBasicDetails
}) {

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
          photo: null,
          gender: "",
          dob: "",
  address: "",
  blood_group: '',
        },
      });
    
      const requestCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          // stream.getTracks().forEach(track => track.stop()); // immediately stop it after getting permission
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
      
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        setPhotoPreview(imageDataUrl); // For showing preview
      
        // Convert base64 to Blob and then to a File
        function dataURLtoFile(dataUrl, fileName) {
          const arr = dataUrl.split(',');
          const mimeMatch = arr[0].match(/:(.*?);/);
          const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
          const bstr = atob(arr[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
      
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
      
          return new File([u8arr], fileName, { type: mime });
        }
      
        const imageFile = dataURLtoFile(imageDataUrl, `captured_${Date.now()}.jpg`);
        setCapturedImage(imageFile); // Set as a File object
        setValue("photo", null); // Clear any file input
        setShowCamera(false)
    
        // Stop camera using streamRef
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
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

        // Switch camera
      const switchCamera = async (e) => {
        setShowCamera(false);
        setFacingMode(prev => (prev === "user" ? "environment" : "user"));
        toast.success(`Switched to ${facingMode === 'user' ? 'front' : 'rear'} camera`);
        e.preventDefault()
        toast('swtiched camera ////')
       try {
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
        toast.error("unable to switch camera ❌");
        console.error("Camera error:", error);
       }
      };
      
      useEffect(() => {
        return () => {
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
          }
        };
      }, []);

      const submit = (data) => {

              const fixedData = {
        ...data,
        photo: capturedImage ? capturedImage : (data.photo?.[0] || null),
      };
        handleSubmitBasicDetails(fixedData)
              setPhotoPreview(null);
              setCapturedImage(null);
              reset()
      }

  return (

<form
  onSubmit={handleSubmit(submit)}
  className="flex flex-col gap-4"
>

  {photoPreview && (
    <div className="text-center">
      <img
        src={photoPreview}
        alt="Preview"
        className="w-[250px] h-[250px] object-cover mx-auto rounded-lg border-2 border-yellow-500"
      />
    </div>
  )}

  {/* Name Fields */}
  <div className="flex flex-col md:flex-row gap-4">
    <Input
      label="First Name"
      required
      {...register("first_name", { required: true })}
      className="w-full"
    />
    <Input
      label="Middle Name"
      {...register("middle_name")}
      className="w-full"
    />
    <Input
      label="Last Name"
      required
      {...register("last_name", { required: true })}
      className="w-full"
    />
  </div>

  {/* Photo Upload */}
  <div>
    <label className="block mb-1 text-gray-700 font-medium">Upload Photo</label>
    <div className="flex items-center gap-2 bg-gray-100 border-2 border-yellow-500 rounded-lg shadow-sm px-3 py-2">
      <FaUpload className="text-yellow-500 text-xl" />
      <input
        type="file"
        accept="image/*"
        {...register("photo")}
        onChange={handlePhotoChange}
        className="outline-none"
      />
    </div>
    <button
      type="button"
      onClick={openCamera}
      className="mt-3 w-full flex items-center justify-center gap-2 bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition"
    >
      <FaCamera />
      Open Camera
    </button>
  </div>

  {/* Camera Modal */}
  {showCamera && (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white min-h-[70vh] min-w-[70vw] p-6 rounded-lg shadow-xl flex flex-col items-center gap-4">
        <video
          ref={videoRef}
          className="w-full h-full rounded-lg bg-black"
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
            onClick={closeCamera}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )}

  {/* Contact Info */}
  <div className="flex flex-col md:flex-row gap-4">
    <Input label="Email" type="email" {...register("email")} className="w-full" />
    <Input label="Phone" type="tel" {...register("phone")} className="w-full" />
  </div>

  {/* Gender */}
  <div>
    <label className="block text-sm font-medium mb-1">Gender</label>
    <div className="flex flex-wrap gap-4">
      {["Male", "Female", "Other"].map((gender) => (
        <label key={gender} className="inline-flex items-center">
          <input
            type="radio"
            value={gender}
            {...register("gender")}
            className="form-radio text-teal-600"
          />
          <span className="ml-2">{gender}</span>
        </label>
      ))}
    </div>
  </div>

  {/* DOB and Address */}
  <div className="flex flex-col md:flex-row gap-4">
    <Input label="Date of Birth" type="date" {...register("dob")} className="w-full" />
    <Input label="Address" type="text" {...register("address")} className="w-full" />
  </div>

  {/* Blood Group (Radio) */}
<div>
  <label className="block text-sm font-medium mb-1" htmlFor="blood_group">
    Blood Group
  </label>
  <select
    id="blood_group"
    {...register("blood_group", { required: true })}
    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
  >
    <option value="">Select Blood Group</option>
    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
      <option key={bg} value={bg}>
        {bg}
      </option>
    ))}
  </select>
</div>


  {/* Submit Button */}
  <div>
    <Button
      type="submit"
      bgColor="bg-orange-500 hover:bg-orange-600"
      className="w-full text-white py-3 font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105"
    >
      Submit
    </Button>
  </div>
</form>


  )
}

export default BasicDetails