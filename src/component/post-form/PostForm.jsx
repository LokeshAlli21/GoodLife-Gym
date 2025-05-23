import React, { useState } from 'react'
import { toast } from 'react-toastify'
import BasicDetails from './BasicDetails'
import HealthMetrics from './HealthMetrics'
import MembershipAndPayments from './MembershipAndPayments'
import userService from '../../supabase/conf'

const TABS = [
  { id: 'basic', label: 'Basic' },
  { id: 'health', label: 'Health' },
  { id: 'membership', label: 'Payment' },
]

function PostForm() {
  const [memberId, setMemberId] = useState(null)
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
      <div className="flex items-center justify-center min-h-[50vh] bg-white rounded-xl mx-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-3"></div>
          <p className="text-gray-600">Processing...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="max-w-4xl mx-auto mt-4 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Mobile-Optimized Tab Navigation */}
      <div className="flex bg-gray-50 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-2 py-3 text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                : 'text-gray-600 hover:text-black hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-4 sm:p-6">
        {activeTab === 'basic' && (
          <BasicDetails handleSubmitBasicDetails={(data) => handleSubmit('basic', data)} />
        )}
        {activeTab === 'health' && (
          <HealthMetrics handleSubmitHealthMetrics={(data) => handleSubmit('health', data)} />
        )}
        {activeTab === 'membership' && (
          <MembershipAndPayments handleSubmitMembershipAndPayments={(data) => handleSubmit('membership', data)} />
        )}
      </div>
    </div>
  )
}

export default PostForm