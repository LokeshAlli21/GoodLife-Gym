import React, { useState, useEffect } from 'react';

function MembershipAndPayments({ memberId = null }) {
  // States for form data
  const [membershipData, setMembershipData] = useState({
    member_id: memberId || '',
    plan_id: '',
    membership_start_date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  
  const [paymentData, setPaymentData] = useState({
    payment_amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'Cash',
    payment_screenshot_url: '',
    notes: ''
  });
  
  // States for dropdown options
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch members and plans on component mount
  useEffect(() => {
    fetchMembers();
    fetchPlans();
  }, []);

  // Fetch members from API
  const fetchMembers = async () => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/members');
      const data = await response.json();
      setMembers(data);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  // Fetch plans from API
  const fetchPlans = async () => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/membership-plans');
      const data = await response.json();
      setPlans(data);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  // Handle membership form changes
  const handleMembershipChange = (e) => {
    const { name, value } = e.target;
    setMembershipData(prev => ({ ...prev, [name]: value }));
    
    // Update payment amount when plan changes
    if (name === 'plan_id') {
      const plan = plans.find(p => p.id === parseInt(value));
      setSelectedPlan(plan);
      if (plan) {
        setPaymentData(prev => ({ ...prev, payment_amount: plan.price }));
      }
    }
  };

  // Handle payment form changes
  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({ ...prev, [name]: value }));
  };

  // Handle file upload for payment screenshot
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, you'd upload this to your server/storage
      // For now, we'll just store the file name
      setPaymentData(prev => ({ 
        ...prev, 
        payment_screenshot_url: file.name 
      }));
    }
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // First, create the membership
      const membershipResponse = await fetch('/api/memberships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(membershipData)
      });
      
      if (!membershipResponse.ok) {
        throw new Error('Failed to create membership');
      }
      
      const membershipResult = await membershipResponse.json();
      
      // Then create the payment with the new membership ID
      const paymentResponse = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...paymentData,
          membership_id: membershipResult.id
        })
      });
      
      if (!paymentResponse.ok) {
        throw new Error('Failed to record payment');
      }
      
      // Show success message
      setMessage({ 
        type: 'success', 
        text: 'Membership and payment recorded successfully!'
      });
      
      // Reset form if needed
      if (!memberId) {
        resetForm();
      }
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setMessage({ 
        type: 'error', 
        text: `Error: ${error.message}` 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setMembershipData({
      member_id: '',
      plan_id: '',
      membership_start_date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    
    setPaymentData({
      payment_amount: '',
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'Cash',
      payment_screenshot_url: '',
      notes: ''
    });
    
    setSelectedPlan(null);
  };

  // Sample submission object for reference
  const sampleSubmissionObject = {
    membership: {
      member_id: 1,
      plan_id: 2,
      membership_start_date: '2025-05-20',
      notes: 'New membership'
    },
    payment: {
      membership_id: null, // Will be filled after membership creation
      payment_amount: 1500.00,
      payment_date: '2025-05-20',
      payment_method: 'Cash',
      payment_screenshot_url: 'receipt_123.jpg',
      notes: 'Initial payment'
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Add Membership & Payment</h2>
      
      {/* Alert Message */}
      {message.text && (
        <div className={`p-4 mb-6 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Membership Section */}
          <div className="p-4 border border-gray-200 rounded-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Membership Details</h3>
            
            {/* Member Selection */}
            <div className="mb-4">
              <label htmlFor="member_id" className="block text-sm font-medium text-gray-700 mb-1">Select Member</label>
              <select
                id="member_id"
                name="member_id"
                value={membershipData.member_id}
                onChange={handleMembershipChange}
                disabled={!!memberId}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">-- Select Member --</option>
                {members.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.first_name} {member.last_name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Plan Selection */}
            <div className="mb-4">
              <label htmlFor="plan_id" className="block text-sm font-medium text-gray-700 mb-1">Membership Plan</label>
              <select
                id="plan_id"
                name="plan_id"
                value={membershipData.plan_id}
                onChange={handleMembershipChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">-- Select Plan --</option>
                {plans.map(plan => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} - ₹{plan.price} for {plan.duration_days} days
                  </option>
                ))}
              </select>
            </div>
            
            {/* Start Date */}
            <div className="mb-4">
              <label htmlFor="membership_start_date" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                id="membership_start_date"
                name="membership_start_date"
                value={membershipData.membership_start_date}
                onChange={handleMembershipChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            {/* End Date Preview (calculated by trigger) */}
            {selectedPlan && (
              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <span className="text-sm text-gray-700">
                  End Date (Auto-calculated): 
                  <strong className="ml-2">
                    {new Date(new Date(membershipData.membership_start_date).getTime() + selectedPlan.duration_days * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </strong>
                </span>
              </div>
            )}
            
            {/* Notes */}
            <div className="mb-4">
              <label htmlFor="membership_notes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                id="membership_notes"
                name="notes"
                value={membershipData.notes}
                onChange={handleMembershipChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows="2"
              ></textarea>
            </div>
          </div>
          
          {/* Payment Section */}
          <div className="p-4 border border-gray-200 rounded-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Payment Details</h3>
            
            {/* Payment Amount */}
            <div className="mb-4">
              <label htmlFor="payment_amount" className="block text-sm font-medium text-gray-700 mb-1">Payment Amount (₹)</label>
              <input
                type="number"
                id="payment_amount"
                name="payment_amount"
                value={paymentData.payment_amount}
                onChange={handlePaymentChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                min="0"
                step="0.01"
                required
              />
              {selectedPlan && (
                <div className="mt-1 text-sm text-gray-600">
                  {paymentData.payment_amount < selectedPlan.price ? (
                    <span className="text-yellow-600">
                      Remaining: ₹{(selectedPlan.price - paymentData.payment_amount).toFixed(2)}
                    </span>
                  ) : paymentData.payment_amount > selectedPlan.price ? (
                    <span className="text-red-600">
                      Overpayment: ₹{(paymentData.payment_amount - selectedPlan.price).toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-green-600">Full payment</span>
                  )}
                </div>
              )}
            </div>
            
            {/* Payment Date */}
            <div className="mb-4">
              <label htmlFor="payment_date" className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
              <input
                type="date"
                id="payment_date"
                name="payment_date"
                value={paymentData.payment_date}
                onChange={handlePaymentChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            {/* Payment Method */}
            <div className="mb-4">
              <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select
                id="payment_method"
                name="payment_method"
                value={paymentData.payment_method}
                onChange={handlePaymentChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              >
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Check">Check</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            {/* Payment Screenshot */}
            <div className="mb-4">
              <label htmlFor="payment_screenshot" className="block text-sm font-medium text-gray-700 mb-1">Payment Receipt/Screenshot</label>
              <input
                type="file"
                id="payment_screenshot"
                name="payment_screenshot"
                onChange={handleFileUpload}
                className="w-full p-2 border border-gray-300 rounded-md"
                accept="image/*,.pdf"
              />
            </div>
            
            {/* Notes */}
            <div className="mb-4">
              <label htmlFor="payment_notes" className="block text-sm font-medium text-gray-700 mb-1">Payment Notes</label>
              <textarea
                id="payment_notes"
                name="notes"
                value={paymentData.notes}
                onChange={handlePaymentChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows="2"
              ></textarea>
            </div>
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'}`}
          >
            {isSubmitting ? 'Processing...' : 'Save Membership & Payment'}
          </button>
        </div>
      </form>
      
      {/* Developer Note - Remove in production */}
      {/* 
      <div className="mt-8 p-4 bg-gray-50 rounded-md">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Sample Submission Object:</h4>
        <pre className="text-xs overflow-auto">{JSON.stringify(sampleSubmissionObject, null, 2)}</pre>
      </div>
      */}
    </div>
  );
}

export default MembershipAndPayments;