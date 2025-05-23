import React, { useState } from 'react'
import { toast } from 'react-toastify'
import BasicDetails from './BasicDetails'
import HealthMetrics from './HealthMetrics'
import MembershipAndPayments from './MembershipAndPayments'
import userService from '../../supabase/conf'

const TABS = [
  { id: 'basic', label: 'Basic Details', icon: '👤', step: 1 },
  { id: 'health', label: 'Health Metrics', icon: '💪', step: 2 },
  { id: 'membership', label: 'Membership', icon: '💳', step: 3 },
]

function PostForm() {
  const [memberId, setMemberId] = useState(1)
  const [activeTab, setActiveTab] = useState('basic')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (type, data) => {
    setLoading(true)
    
    try {
      const actions = {
        basic: async () => {
          toast.info('Creating profile...')
          const response = await userService.createUser(data)
          
          if (Array.isArray(response) && response.length > 0) {
            setMemberId(response[0].id)
          }
          
          toast.success('Profile created ✅')
          setActiveTab('health')
        },
        
        health: async () => {
          toast.info('Saving health data...')
          await userService.createHealthMetrics(memberId, data)
          toast.success('Health data saved ✅')
          setActiveTab('membership')
        },
        
        membership: async () => {
          console.log(data)
          return // Remove this when ready to implement
          // toast.info('Processing payment...')
          // await userService.createMembershipAndPayments(memberId, data)
          // toast.success('Payment processed ✅')
        }
      }

      await actions[type]()
      
    } catch (error) {
      console.error(`${type} error:`, error)
      
      const errorMessages = {
        basic: error.code === '23505' ? 'Email already exists ❌' : 'Failed to create profile ❌',
        health: 'Failed to save health data ❌',
        membership: 'Payment processing failed ❌'
      }
      
      toast.error(errorMessages[type])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto mt-2 px-3">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 mx-auto mb-4"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-500 absolute top-0 left-1/2 transform -translate-x-1/2"></div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Processing your information</h3>
            <p className="text-gray-600">Please wait while we save your details...</p>
            <div className="flex justify-center mt-4">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="max-w-4xl mx-auto mb-10">
      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          {TABS.map((tab, index) => (
            <div key={tab.id} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                activeTab === tab.id 
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg' 
                  : TABS.findIndex(t => t.id === activeTab) > index
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
              }`}>
                {TABS.findIndex(t => t.id === activeTab) > index ? '✓' : tab.step}
              </div>
              {index < TABS.length - 1 && (
                <div className={`w-8 sm:w-16 h-1 mx-2 rounded transition-all duration-300 ${
                  TABS.findIndex(t => t.id === activeTab) > index ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-white">
          Step {TABS.find(tab => tab.id === activeTab)?.step} of {TABS.length}: {TABS.find(tab => tab.id === activeTab)?.label}
        </p>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden backdrop-blur-sm">
        {/* Tab Navigation */}
<div className="bg-gradient-to-r from-gray-50 rounded-2xl to-gray-100 border-b border-gray-200 shadow-sm w-full mx-auto">
  <div className="flex justify-center  sm:px-6 p-3 gap-4 sm:gap-3 w-full mx-auto">
    {TABS.map((tab) => {
      const isDisabled = (tab.id === 'health' || tab.id === 'membership') && !memberId;
      const isActive = activeTab === tab.id;

      return (
<button
  key={tab.id}
  onClick={() => setActiveTab(tab.id)}
  disabled={isDisabled}
  className={`
    flex items-center justify-center gap-2
    px-5 sm:px-6 py-3 flex-1 rounded-xl
    text-sm font-semibold transition-all duration-300 whitespace-nowrap hover:shadow-lg
    ${
      isActive
        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-md scale-[1.05] '
        : isDisabled
        ? 'text-gray-400  cursor-not-allowed opacity-60'
        : 'text-gray-700  hover:text-black '
    }
  `}
>
  <span className="text-lg">{tab.icon}</span>
  <span className="hidden sm:inline">{tab.label}</span>
  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
</button>

      );
    })}
  </div>
</div>


        {/* Form Content Area */}
        <div className="relative min-h-[60vh]">
          
          {/* Content */}
          <div className="relative">
            <div className="transition-all duration-500 ease-in-out">
              {activeTab === 'basic' && (
                <div className="animate-fadeIn">
                  <BasicDetails handleSubmitBasicDetails={(data) => handleSubmit('basic', data)} />
                </div>
              )}
              
              {activeTab === 'health' && (
                <div className="animate-fadeIn">
                  <div className="mb-6 text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Health & Fitness Goals</h2>
                    <p className="text-gray-600">Help us understand your fitness journey</p>
                  </div>
                  <HealthMetrics handleSubmitHealthMetrics={(data) => handleSubmit('health', data)} />
                </div>
              )}
              
              {activeTab === 'membership' && (
                <div className="animate-fadeIn">
                  <div className="mb-6 text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Membership & Payment</h2>
                    <p className="text-gray-600">Choose your plan and complete registration</p>
                  </div>
                  <MembershipAndPayments handleSubmitMembershipAndPayments={(data) => handleSubmit('membership', data)} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PostForm