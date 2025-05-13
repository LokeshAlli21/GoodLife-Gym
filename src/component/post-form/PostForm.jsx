import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import BasicDetails from './BasicDetails';
import HealthMetrics from './HealthMetrics';
import MembershipAndPayments from './MembershipAndPayments';

function PostForm() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('basic');


  const handleSubmitBasicDetails = async (data) => {
    console.log(data);
    return
    
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

  return (
    <div className="max-w-5xl mx-auto mt-8 p-3   bg-white rounded-xl shadow-lg border border-gray-200">

      {/* Tab Navigation */}
      <div className="flex justify-center space-x-4 border-b border-gray-300 mb-6">
        {[
          { id: 'basic', label: 'Basic Details' },
          { id: 'health', label: 'Health Metrics' },
          { id: 'membership', label: 'Membership & Payments' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-semibold rounded-t-md transition-all duration-200
              ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow'
                  : 'text-gray-600 hover:text-black'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-gray-50 p-6 rounded-xl shadow-inner">
        {activeTab === 'basic' && (
          <BasicDetails handleSubmitBasicDetails={handleSubmitBasicDetails} />
        )}
        {activeTab === 'health' && <HealthMetrics />}
        {activeTab === 'membership' && <MembershipAndPayments />}
      </div>
    </div>
  );
}

export default PostForm;