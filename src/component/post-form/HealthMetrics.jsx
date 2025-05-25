import React from 'react';
import { useForm } from 'react-hook-form';
import { Input, Button } from '../index';
import { FaRulerVertical, FaWeight, FaDumbbell, FaStickyNote } from 'react-icons/fa';

function HealthMetrics({ handleSubmitHealthMetrics }) {
  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      height_feet: '', height_inches: '', weight_kg: '', bicps_size_inches: '', notes: '',
    },
  });

  const watchedValues = watch(['height_feet', 'height_inches', 'weight_kg']);
  const totalHeightInches = parseInt(watchedValues[0] || 0) * 12 + parseInt(watchedValues[1] || 0);
  const heightInCm = Math.round(totalHeightInches * 2.54);
  const bmi = watchedValues[2] ? (parseFloat(watchedValues[2]) / Math.pow(heightInCm / 100, 2)).toFixed(1) : null;

  const onSubmit = (data) => {
    handleSubmitHealthMetrics(data);
    reset();
  };

  const SelectField = ({ icon: Icon, label, name, options, required = true }) => (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <Icon className="text-orange-500" size={16} />
        {label}
      </label>
      <select
        {...register(name, { required })}
        className="px-4 py-3 rounded-lg bg-white text-gray-800 placeholder-gray-500 outline-none transition-all duration-200 border border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-200 w-full "
      >
        <option value="">Select {label}</option>
        {options.map((opt, i) => (
          <option key={i} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="max-w-md mx-auto p-4 bg-white">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* BMI Display Card */}
        {bmi && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-2xl border border-blue-200">
            <div className="text-center">
              <h3 className="text-sm font-semibold text-gray-600 mb-1">Your BMI</h3>
              <div className="text-2xl font-bold text-blue-600">{bmi}</div>
              <div className="text-xs text-gray-500">
                {heightInCm}cm • {watchedValues[2]}kg
              </div>
              <div className="text-xs mt-1">
                <span className={`px-2 py-1 rounded-full text-white text-xs font-medium ${
                  bmi < 18.5 ? 'bg-blue-500' : 
                  bmi < 25 ? 'bg-green-500' : 
                  bmi < 30 ? 'bg-yellow-500' : 'bg-red-500'
                }`}>
                  {bmi < 18.5 ? 'Underweight' : 
                   bmi < 25 ? 'Normal' : 
                   bmi < 30 ? 'Overweight' : 'Obese'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Height Section */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-2xl border border-orange-200">
          <h3 className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-4">
            <FaRulerVertical className="text-orange-500" />
            Height Measurement
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <SelectField
              icon={FaRulerVertical}
              label="Feet"
              name="height_feet"
              options={[...Array(10)].map((_, i) => ({ value: i + 1, label: `${i + 1} ft` }))}
            />
            <SelectField
              icon={FaRulerVertical}
              label="Inches"
              name="height_inches"
              options={[...Array(12)].map((_, i) => ({ value: i, label: `${i} in` }))}
            />
          </div>
          {totalHeightInches > 0 && (
            <div className="mt-3 text-center">
              <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
                Total: {Math.floor(totalHeightInches / 12)}'{totalHeightInches % 12}" ({heightInCm}cm)
              </span>
            </div>
          )}
        </div>

        {/* Weight & Biceps Section */}
        <div className="space-y-4">
          <SelectField
            icon={FaWeight}
            label="Weight (kg)"
            name="weight_kg"
            options={Array.from({ length: 241 }, (_, i) => {
              const weight = (30 + i * 0.5).toFixed(1);
              return { value: weight, label: `${weight} kg` };
            })}
          />

          <SelectField
            icon={FaDumbbell}
            label="Biceps Size (inches)"
            name="bicps_size_inches"
            options={Array.from({ length: 31 }, (_, i) => {
              const size = (10 + i * 0.5).toFixed(1);
              return { value: size, label: `${size}"` };
            })}
          />
        </div>

        {/* Notes Section */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <FaStickyNote className="text-orange-500" size={16} />
            Additional Notes
          </label>
          <textarea
            {...register("notes")}
            rows={4}
            className="px-4 py-3 rounded-lg bg-white text-gray-800 placeholder-gray-500 outline-none transition-all duration-200 border border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-200 w-full  resize-none"
            placeholder="Any health conditions, fitness goals, or additional information..."
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
        >
          Save Health Metrics
        </Button>
      </form>

      {/* Health Tips */}
      <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-2xl border border-green-200">
        <h4 className="text-sm font-bold text-gray-700 mb-2">💡 Quick Tips</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Measure height without shoes for accuracy</li>
          <li>• Weigh yourself at the same time daily</li>
          <li>• Measure biceps when flexed for consistency</li>
          <li>• Track progress weekly, not daily</li>
        </ul>
      </div>
    </div>
  );
}

export default HealthMetrics;