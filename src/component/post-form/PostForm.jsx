import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import BasicDetails from './BasicDetails';
import HealthMetrics from './HealthMetrics';
import MembershipAndPayments from './MembershipAndPayments';
import userService from '../../supabase/conf';

function PostForm() {
  const navigate = useNavigate();
  const [memberId, setMemberId] = useState(null)

  const [activeTab, setActiveTab] = useState('basic');
    const [loading, setLoading] = useState(false);


const handleSubmitBasicDetails = async (data) => {
  console.log(data);
  setLoading(true);

  try {
    toast.info('Submitting...');
    const response = await userService.createUser(data);

    console.log("CreateUser response:", response);

    // Check if response is an array and has at least one item
    if (Array.isArray(response) && response.length > 0) {
      setMemberId(response[0].id);
    }

    toast.success('User created successfully ✅');
    setActiveTab('health');
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

  const handleSubmitHealthMetrics = async (data) => {
  console.log(data);
  setLoading(true);
  try {
    toast.info('Submitting health metrics...');

    await userService.createHealthMetrics(memberId,data); // Adjust function name if different

    toast.success('Health metrics saved successfully ✅');
    setActiveTab('membership'); // Move to next tab or section
  } catch (error) {
    console.error("Create health metrics error:", error);
    toast.error('Failed to submit health metrics ❌');
  } finally {
    setLoading(false);
  }
};

const handleSubmitMembershipAndPayments = async (data) => {
  console.log(data);
  return
  setLoading(true);
  try {
    toast.info('Submitting membership and payment details...');

    await userService.createMembershipAndPayments(memberId, data); // Make sure this function exists in userService

    toast.success('Membership and payments saved successfully ✅');
    setActiveTab('next-tab'); // Change this to the next relevant tab
  } catch (error) {
    console.error("Create membership and payments error:", error);
    toast.error('Failed to submit membership and payments ❌');
  } finally {
    setLoading(false);
  }
};



if(loading){
  return (
     <div className="text-center text-gray-600">
      <p>Submitting...</p>
    </div>
  )
}
  
  return (
    <div className="max-w-5xl mx-auto mt-0 p-0   bg-white rounded-xl shadow-lg border border-gray-200">

      {/* Tab Navigation */}
      <div className="flex justify-center space-x-4 p-3">
        {[
          { id: 'basic', label: 'Basic Details' },
          { id: 'health', label: 'Health Metrics' },
          { id: 'membership', label: 'Membership & Payments' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-semibold rounded-md transition-all duration-200
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
        {activeTab === 'health' && <HealthMetrics handleSubmitHealthMetrics={handleSubmitHealthMetrics} />}
        {activeTab === 'membership' && <MembershipAndPayments handleSubmitMembershipAndPayments={handleSubmitMembershipAndPayments} />}
      </div>
    </div>
  );
}

export default PostForm;