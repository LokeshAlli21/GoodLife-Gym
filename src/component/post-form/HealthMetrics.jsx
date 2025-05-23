import React from 'react';
import { useForm } from 'react-hook-form';
import { Input, Button } from '../index'; // Adjust the import paths as needed

function HealthMetrics({ handleSubmitHealthMetrics }) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      height_feet: '',
      height_inches: '',
      weight_kg: '',
      bicps_size_inches: '',
      notes: '',
    },
  });

  const onSubmit = (data) => {
    handleSubmitHealthMetrics(data);
    reset(); // Reset form after submit
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
    >
      {/* Height Input */}
{/* Height Section */}
<div className="flex gap-4">
  {/* Height (Feet) */}
  <div className="w-full">
    <label className="block mb-1 text-gray-700 font-medium" htmlFor="height_feet">
      Height (Feet)
    </label>
    <select
      id="height_feet"
      {...register("height_feet", { required: true })}
      className="px-4 py-3 rounded-lg bg-white text-gray-800 placeholder-gray-500 outline-none transition-all duration-200 border border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-200 w-full"
      defaultValue=""
    >
      <option value="" disabled>Select Feet</option>
      {[...Array(10)].map((_, i) => (
        <option key={i + 1} value={i + 1}>{i + 1}</option>
      ))}
    </select>
  </div>

  {/* Height (Inches) */}
  <div className="w-full">
    <label className="block mb-1 text-gray-700 font-medium" htmlFor="height_inches">
      Height (Inches)
    </label>
    <select
      id="height_inches"
      {...register("height_inches", { required: true })}
      className="px-4 py-3 rounded-lg bg-white text-gray-800 placeholder-gray-500 outline-none transition-all duration-200 border border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-200 w-full"
      defaultValue=""
    >
      <option value="" disabled>Select Inches</option>
      {[...Array(12)].map((_, i) => (
        <option key={i} value={i}>{i}</option>
      ))}
    </select>
  </div>
</div>

{/* Weight and Biceps */}
<div className="flex gap-4 mt-4">
  {/* Weight (kg) */}
  <div className="w-full">
    <label className="block mb-1 text-gray-700 font-medium" htmlFor="weight_kg">
      Weight (kg)
    </label>
    <select
      id="weight_kg"
      {...register("weight_kg", { required: true })}
      className="px-4 py-3 rounded-lg bg-white text-gray-800 placeholder-gray-500 outline-none transition-all duration-200 border border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-200 w-full"
      defaultValue=""
    >
      <option value="" disabled>Select Weight</option>
      {Array.from({ length: 241 }, (_, i) => (30 + i * 0.5).toFixed(1)).map((weight) => (
        <option key={weight} value={weight}>{weight}</option>
      ))}
    </select>
  </div>

  {/* Biceps Size */}
  <div className="w-full">
    <label className="block mb-1 text-gray-700 font-medium" htmlFor="bicps_size_inches">
      Biceps Size (inches)
    </label>
    <select
      id="bicps_size_inches"
      {...register("bicps_size_inches", { required: true })}
      className="px-4 py-3 rounded-lg bg-white text-gray-800 placeholder-gray-500 outline-none transition-all duration-200 border border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-200 w-full"
      defaultValue=""
    >
      <option value="" disabled>Select Size</option>
      {Array.from({ length: 31 }, (_, i) => (10 + i * 0.5).toFixed(1)).map((size) => (
        <option key={size} value={size}>{size}</option>
      ))}
    </select>
  </div>
</div>



      {/* Notes */}
      <div>
        <label className="block mb-1 text-gray-700 font-medium">Notes</label>
        <textarea
          {...register("notes")}
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="Any additional notes..."
        ></textarea>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        bgColor="bg-orange-500 hover:bg-orange-600"
        className="w-full text-white py-3 font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105"
      >
        Submit
      </Button>
    </form>
  );
}

export default HealthMetrics;
