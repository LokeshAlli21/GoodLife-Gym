
import React, { useState, useEffect } from 'react';

function MembershipAndPayments({ memberId }) {
  // State for form data
  const [memberData, setMemberData] = useState(null);
  const [membershipPlans, setMembershipPlans] = useState([]);
  const [activeTab, setActiveTab] = useState('add-payment');
  const [existingMemberships, setExistingMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form states
  const [paymentForm, setPaymentForm] = useState({
    membershipId: '',
    amount: '',
    method: 'Cash',
    screenshot: null,
    notes: ''
  });

  const [renewalForm, setRenewalForm] = useState({
    planId: '',
    amount: '',
    method: 'Cash',
    screenshot: null,
    notes: ''
  });

  // Sample data instead of API calls
  useEffect(() => {
    const loadSampleData = () => {
      try {
        setLoading(true);
        
        // Sample member data
        const sampleMemberData = {
          id: memberId,
          first_name: "Rahul",
          last_name: "Sharma",
          email: "rahul.sharma@example.com",
          phone: "9876543210",
          gender: "Male",
          dob: "1990-05-15",
          address: "123 Main St, Bangalore"
        };
        
        // Sample membership plans
        const samplePlans = [
          { id: 1, name: "Monthly", duration_days: 30, price: "600.00", active: true },
          { id: 2, name: "Quarterly", duration_days: 90, price: "1500.00", active: true },
          { id: 3, name: "Annual", duration_days: 365, price: "4500.00", active: true }
        ];
        
        // Sample existing memberships with payments
        const today = new Date();
        const twoMonthsAgo = new Date();
        twoMonthsAgo.setMonth(today.getMonth() - 2);
        
        const oneMonthFromNow = new Date();
        oneMonthFromNow.setMonth(today.getMonth() + 1);
        
        const sampleMemberships = [
          {
            id: 101,
            member_id: memberId,
            plan_id: 2, // Quarterly plan
            membership_start_date: twoMonthsAgo.toISOString().split('T')[0],
            membership_end_date: oneMonthFromNow.toISOString().split('T')[0],
            payments: [
              {
                id: 1001,
                membership_id: 101,
                payment_amount: "1000.00",
                payment_date: twoMonthsAgo.toISOString().split('T')[0],
                payment_method: "UPI",
                notes: "Initial payment"
              }
            ]
          },
          {
            id: 100,
            member_id: memberId,
            plan_id: 1, // Monthly plan
            membership_start_date: "2024-11-01",
            membership_end_date: "2024-12-01",
            payments: [
              {
                id: 1000,
                membership_id: 100,
                payment_amount: "600.00",
                payment_date: "2024-11-01",
                payment_method: "Cash",
                notes: "Full payment"
              }
            ]
          }
        ];
        
        // Set states with sample data
        setMemberData(sampleMemberData);
        setMembershipPlans(samplePlans);
        setExistingMemberships(sampleMemberships);
        
        // Pre-populate form if there are existing memberships
        if (sampleMemberships.length > 0) {
          // Find active membership or most recent one
          const activeMembership = sampleMemberships.find(m => 
            new Date(m.membership_end_date) >= new Date()
          ) || sampleMemberships[0];
          
          setPaymentForm(prev => ({
            ...prev,
            membershipId: activeMembership.id
          }));
          
          // Set default plan for renewal to the current plan
          setRenewalForm(prev => ({
            ...prev,
            planId: activeMembership.plan_id
          }));
        }
        
        // If there's an active plan, update the amount
        if (sampleMemberships.length > 0) {
          const activeMembership = sampleMemberships.find(m => 
            new Date(m.membership_end_date) >= new Date()
          );
          
          if (activeMembership) {
            const totalPaid = activeMembership.payments?.reduce(
              (sum, payment) => sum + parseFloat(payment.payment_amount), 0
            ) || 0;
            
            const plan = samplePlans.find(p => p.id === activeMembership.plan_id);
            if (plan) {
              const remainingAmount = Math.max(0, parseFloat(plan.price) - totalPaid);
              setPaymentForm(prev => ({
                ...prev,
                amount: remainingAmount.toFixed(2)
              }));
            }
          }
        }
      } catch (err) {
        setError(err.message);
        console.error("Error loading sample data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadSampleData();
  }, [memberId]);

  // Handle payment form submission
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Instead of API call, just log the data
      console.log('Payment Form Submitted:', {
        membershipId: paymentForm.membershipId,
        amount: paymentForm.amount,
        method: paymentForm.method,
        screenshot: paymentForm.screenshot ? paymentForm.screenshot.name : null,
        notes: paymentForm.notes
      });
      
      // Simulate successful response
      const simulatedResult = {
        id: Math.floor(Math.random() * 1000) + 1000,
        membership_id: paymentForm.membershipId,
        payment_amount: paymentForm.amount,
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: paymentForm.method,
        notes: paymentForm.notes
      };
      
      console.log('Payment added successfully:', simulatedResult);
      setSuccess('Payment added successfully!');
      
      // Update local state to reflect the new payment
      setExistingMemberships(prev => {
        return prev.map(membership => {
          if (membership.id.toString() === paymentForm.membershipId.toString()) {
            return {
              ...membership,
              payments: [
                ...(membership.payments || []),
                simulatedResult
              ]
            };
          }
          return membership;
        });
      });
      
      // Reset form
      setPaymentForm({
        membershipId: paymentForm.membershipId,
        amount: '',
        method: 'Cash',
        screenshot: null,
        notes: ''
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      setError(err.message);
      console.error("Error adding payment:", err);
      
      // Clear error message after 3 seconds
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Handle renewal form submission
  const handleRenewalSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Instead of API call, just log the data
      console.log('Renewal Form Submitted:', {
        memberId: memberId,
        planId: renewalForm.planId,
        amount: renewalForm.amount,
        method: renewalForm.method,
        screenshot: renewalForm.screenshot ? renewalForm.screenshot.name : null,
        notes: renewalForm.notes
      });
      
      // Get the selected plan details
      const selectedPlan = membershipPlans.find(p => p.id.toString() === renewalForm.planId.toString());
      
      // Calculate new membership dates
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + (selectedPlan?.duration_days || 30));
      
      // Simulate successful response - new membership
      const newMembershipId = Math.floor(Math.random() * 100) + 200;
      const simulatedMembership = {
        id: newMembershipId,
        member_id: memberId,
        plan_id: parseInt(renewalForm.planId),
        membership_start_date: startDate.toISOString().split('T')[0],
        membership_end_date: endDate.toISOString().split('T')[0],
        payments: [
          {
            id: Math.floor(Math.random() * 1000) + 2000,
            membership_id: newMembershipId,
            payment_amount: renewalForm.amount,
            payment_date: new Date().toISOString().split('T')[0],
            payment_method: renewalForm.method,
            notes: renewalForm.notes
          }
        ]
      };
      
      console.log('Membership renewed successfully:', simulatedMembership);
      setSuccess('Membership renewed successfully!');
      
      // Update local state to reflect the new membership
      setExistingMemberships(prev => [simulatedMembership, ...prev]);
      
      // Reset form
      setRenewalForm({
        planId: renewalForm.planId,
        amount: '',
        method: 'Cash',
        screenshot: null,
        notes: ''
      });
      
      // Change to payment tab if the payment was partial
      if (selectedPlan && parseFloat(renewalForm.amount) < parseFloat(selectedPlan.price)) {
        setActiveTab('add-payment');
        
        // Pre-select the new membership
        setPaymentForm(prev => ({
          ...prev,
          membershipId: newMembershipId,
          amount: (parseFloat(selectedPlan.price) - parseFloat(renewalForm.amount)).toFixed(2)
        }));
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      setError(err.message);
      console.error("Error renewing membership:", err);
      
      // Clear error message after 3 seconds
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Update renewal amount when plan changes
  const handlePlanChange = (e) => {
    const selectedPlanId = e.target.value;
    const selectedPlan = membershipPlans.find(p => p.id.toString() === selectedPlanId);
    
    setRenewalForm(prev => ({
      ...prev,
      planId: selectedPlanId,
      amount: selectedPlan ? selectedPlan.price : ''
    }));
  };

  // File input handler
  const handleFileChange = (e, formType) => {
    const file = e.target.files[0];
    if (formType === 'payment') {
      setPaymentForm(prev => ({ ...prev, screenshot: file }));
    } else {
      setRenewalForm(prev => ({ ...prev, screenshot: file }));
    }
  };

  if (loading && !memberData) {
    return <div className="p-4 text-center">Loading member data...</div>;
  }

  if (!loading && error && !memberData) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      {memberData && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">
            {memberData.first_name} {memberData.last_name}
          </h2>
          {existingMemberships.length > 0 && (
            <div className="bg-gray-100 p-4 rounded mb-4">
              <h3 className="font-semibold mb-2">Membership Status</h3>
              {existingMemberships.map((membership, index) => {
                const isActive = new Date(membership.membership_end_date) >= new Date();
                const plan = membershipPlans.find(p => p.id === membership.plan_id);
                const totalPaid = membership.payments?.reduce(
                  (sum, payment) => sum + parseFloat(payment.payment_amount), 0
                ) || 0;
                const remainingAmount = plan ? Math.max(0, parseFloat(plan.price) - totalPaid) : 0;
                
                return (
                  <div key={membership.id} className={`${index > 0 ? 'mt-4 pt-4 border-t' : ''}`}>
                    <div className="flex justify-between">
                      <span className="font-medium">{plan ? plan.name : 'Unknown'} Plan</span>
                      <span className={`px-2 py-1 rounded text-sm ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {isActive ? 'Active' : 'Expired'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                      <div>
                        <span className="text-gray-600">Start Date:</span>{' '}
                        {new Date(membership.membership_start_date).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="text-gray-600">End Date:</span>{' '}
                        {new Date(membership.membership_end_date).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="text-gray-600">Total Paid:</span>{' '}
                        ₹{totalPaid.toFixed(2)}
                      </div>
                      <div>
                        <span className="text-gray-600">Balance:</span>{' '}
                        ₹{remainingAmount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b mb-4">
        <div className="flex">
          <button
            className={`px-4 py-2 ${activeTab === 'add-payment' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('add-payment')}
          >
            Add Payment
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'renew-membership' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('renew-membership')}
          >
            Renew Membership
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          {success}
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      {/* Add Payment Form */}
      {activeTab === 'add-payment' && (
        <form onSubmit={handlePaymentSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Membership
            </label>
            <select
              className="w-full p-2 border rounded"
              value={paymentForm.membershipId}
              onChange={(e) => setPaymentForm({...paymentForm, membershipId: e.target.value})}
              required
            >
              <option value="">Select a membership</option>
              {existingMemberships.map(membership => {
                const plan = membershipPlans.find(p => p.id === membership.plan_id);
                return (
                  <option key={membership.id} value={membership.id}>
                    {plan?.name || 'Unknown'} - 
                    End Date: {new Date(membership.membership_end_date).toLocaleDateString()}
                  </option>
                );
              })}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Amount (₹)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="w-full p-2 border rounded"
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <select
              className="w-full p-2 border rounded"
              value={paymentForm.method}
              onChange={(e) => setPaymentForm({...paymentForm, method: e.target.value})}
              required
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Screenshot (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              className="w-full p-2 border rounded"
              onChange={(e) => handleFileChange(e, 'payment')}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              className="w-full p-2 border rounded"
              value={paymentForm.notes}
              onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
              rows="2"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-blue-300"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Add Payment'}
          </button>
        </form>
      )}

      {/* Renew Membership Form */}
      {activeTab === 'renew-membership' && (
        <form onSubmit={handleRenewalSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Plan
            </label>
            <select
              className="w-full p-2 border rounded"
              value={renewalForm.planId}
              onChange={handlePlanChange}
              required
            >
              <option value="">Select a plan</option>
              {membershipPlans.map(plan => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} - ₹{plan.price} ({plan.duration_days} days)
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Initial Payment Amount (₹)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="w-full p-2 border rounded"
              value={renewalForm.amount}
              onChange={(e) => setRenewalForm({...renewalForm, amount: e.target.value})}
              required
            />
            {renewalForm.planId && renewalForm.amount && (
              <p className="text-sm text-gray-500 mt-1">
                {parseFloat(renewalForm.amount) < parseFloat(membershipPlans.find(p => p.id.toString() === renewalForm.planId.toString())?.price || 0) 
                  ? `Remaining balance: ₹${(parseFloat(membershipPlans.find(p => p.id.toString() === renewalForm.planId.toString())?.price || 0) - parseFloat(renewalForm.amount)).toFixed(2)}`
                  : 'Full payment'
                }
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <select
              className="w-full p-2 border rounded"
              value={renewalForm.method}
              onChange={(e) => setRenewalForm({...renewalForm, method: e.target.value})}
              required
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Screenshot (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              className="w-full p-2 border rounded"
              onChange={(e) => handleFileChange(e, 'renewal')}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              className="w-full p-2 border rounded"
              value={renewalForm.notes}
              onChange={(e) => setRenewalForm({...renewalForm, notes: e.target.value})}
              rows="2"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:bg-green-300"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Renew Membership'}
          </button>
        </form>
      )}

      {/* Payment History */}
      {existingMemberships.length > 0 && (
        <div className="mt-8">
          <h3 className="font-bold mb-2">Payment History</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-2">Date</th>
                  <th className="p-2">Amount</th>
                  <th className="p-2">Method</th>
                  <th className="p-2">Membership</th>
                  <th className="p-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {existingMemberships.flatMap(membership => 
                  (membership.payments || []).map(payment => {
                    const plan = membershipPlans.find(p => p.id === membership.plan_id);
                    return (
                      <tr key={payment.id} className="border-t">
                        <td className="p-2">{new Date(payment.payment_date).toLocaleDateString()}</td>
                        <td className="p-2">₹{parseFloat(payment.payment_amount).toFixed(2)}</td>
                        <td className="p-2">{payment.payment_method}</td>
                        <td className="p-2">{plan?.name || 'Unknown'}</td>
                        <td className="p-2">{payment.notes || '-'}</td>
                      </tr>
                    );
                  })
                )}
                {existingMemberships.flatMap(m => m.payments || []).length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-2 text-center text-gray-500">No payment records found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default MembershipAndPayments;