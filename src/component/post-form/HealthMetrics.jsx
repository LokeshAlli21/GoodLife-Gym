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
      bmi: '',
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
      <div className="flex gap-4">
        <Input
          label="Height (Feet)"
          type="number"
          required
          {...register("height_feet", { required: true })}
          className="w-full"
        />
        <Input
          label="Height (Inches)"
          type="number"
          required
          {...register("height_inches", { required: true })}
          className="w-full"
        />
      </div>

      {/* Weight and Biceps Size */}
      <div className="flex gap-4">
        <Input
          label="Weight (kg)"
          type="number"
          step="0.01"
          required
          {...register("weight_kg", { required: true })}
          className="w-full"
        />
        <Input
          label="Biceps Size (inches)"
          type="number"
          step="0.01"
          required
          noLabelWrap={true}
          {...register("bicps_size_inches", { required: true })}
          className="w-full text-nowrap"
        />
      </div>

      {/* BMI */}
      <Input
        label="BMI"
        type="number"
        step="0.01"
        required
        {...register("bmi", { required: true })}
        className="w-full"
      />

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
