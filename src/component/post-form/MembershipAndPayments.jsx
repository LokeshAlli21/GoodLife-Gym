import React, { useState, useEffect } from 'react';
import { useMembership, useFileUpload } from '../../hooks/useMembership';

function MembershipAndPayments({ memberId }) {
  // Use the custom hook for membership data
  const {
    memberData,
    membershipPlans,
    existingMemberships,
    paymentHistory,
    loading,
    error,
    setLoading,
    success,
    addPayment,
    renewMembership,
    getActiveMembership,
    getMembershipBalance,
    hasOverduePayments,
    clearMessages
  } = useMembership(memberId);
      console.log(membershipPlans);
        const hasDueMemberships = existingMemberships.some(m => m.total_amount_due > 0);

  // File upload hook
  const { uploadFile, uploading, progress: uploadProgress } = useFileUpload();

  // State for form data
  const [activeTab, setActiveTab] = useState(hasDueMemberships? 'add-payment' : 'renew-membership');

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
  console.log("existingMemberships: ",existingMemberships);


  

  // Update form when data loads
  useEffect(() => {
    if (existingMemberships.length > 0) {
      // Find active membership or most recent one
      const activeMembership = getActiveMembership() || existingMemberships[0];
      
      if (activeMembership) {
        setPaymentForm(prev => ({
          ...prev,
          membershipId: activeMembership.membership_id,
          amount: activeMembership.total_amount_due || ''
        }));
        
        // Set default plan for renewal
        setRenewalForm(prev => ({
          ...prev,
          planId: activeMembership.plan_id || ''
        }));
      }
    }
  }, [existingMemberships, getActiveMembership]);

  // Handle payment form submission
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await addPayment({
        membershipId: paymentForm.membershipId,
        amount: parseFloat(paymentForm.amount),
        method: paymentForm.method,
        screenshot: paymentForm.screenshot,
        notes: paymentForm.notes
      });
      
      // Reset form
      setPaymentForm(prev => ({
        ...prev,
        amount: '',
        screenshot: null,
        notes: ''
      }));
      
      // Clear file input
      const fileInput = document.querySelector('input[type="file"][data-form="payment"]');
      if (fileInput) fileInput.value = '';
      
    } catch (err) {
      // Error is handled by the hook
      console.error('Payment submission error:', err);
    }
  };

  // Handle renewal form submission
  const handleRenewalSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const result = await renewMembership({
        planId: parseInt(renewalForm.planId),
        amount: parseFloat(renewalForm.amount),
        method: renewalForm.method,
        screenshot: renewalForm.screenshot,
        notes: renewalForm.notes
      });
      
      // Reset form
      setRenewalForm(prev => ({
        ...prev,
        amount: '',
        screenshot: null,
        notes: ''
      }));
      
      // Clear file input
      const fileInput = document.querySelector('input[type="file"][data-form="renewal"]');
      if (fileInput) fileInput.value = '';
      
      // Check if payment was partial and switch to payment tab
      const selectedPlan = membershipPlans.find(p => p.id.toString() === renewalForm.planId.toString());
      if (selectedPlan && parseFloat(renewalForm.amount) < selectedPlan.amount) {
        setActiveTab('add-payment');
      }
      
    } catch (err) {
      // Error is handled by the hook
      console.error('Renewal submission error:', err);
    }
  };

  // Handle file upload for screenshots
  const handleFileUpload = async (file, formType) => {
    if (!file) return;

    try {
      const uploadedFile = await uploadFile(file);
      
      if (formType === 'payment') {
        setPaymentForm(prev => ({
          ...prev,
          screenshot: uploadedFile
        }));
      } else if (formType === 'renewal') {
        setRenewalForm(prev => ({
          ...prev,
          screenshot: uploadedFile
        }));
      }
    } catch (err) {
      console.error('File upload error:', err);
    }
  };

  // Handle form input changes
  const handlePaymentFormChange = (field, value) => {
    setPaymentForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRenewalFormChange = (field, value) => {
    setRenewalForm(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-populate amount when plan is selected
    if (field === 'planId') {
      const selectedPlan = membershipPlans.find(p => p.id.toString() === value.toString());
      if (selectedPlan) {
        setRenewalForm(prev => ({
          ...prev,
          amount: selectedPlan?.amount?.toString()
        }));
      }
    }
  };

  // Calculate member status and balances
  const activeMembership = getActiveMembership();
  console.log("activeMembership: ",activeMembership);
  
  const memberBalance = getMembershipBalance();
  const hasOverdue = hasOverduePayments();

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading membership data...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-red-800">{error}</span>
        </div>
        <button
          onClick={clearMessages}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Dismiss
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Success Message */}
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-green-800">{success}</span>
          </div>
          <button
            onClick={clearMessages}
            className="mt-2 text-sm text-green-600 hover:text-green-800 underline"
          >
            Dismiss
          </button>
        </div>
      )}

{console.log("memberData: ",memberData)
       }
      {/* Member Info Header */}
      {memberData &&  (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {memberData.first_name} {memberData.last_name}
              </h2>
              <p className="text-gray-600">Member ID: {memberData.id}</p>
              {memberData.email && (
                <p className="text-gray-600">{memberData.email}</p>
              )}
              {memberData.phone && (
                <p className="text-gray-600">{memberData.phone}</p>
              )}
            </div>
            
            <div className="text-right">
              {activeMembership && (
                <div className="space-y-1">
                  <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    activeMembership.membership_status === 'Active' 
                      ? 'bg-green-100 text-green-800'
                      : activeMembership.membership_status === 'Expired'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {activeMembership.membership_status}
                  </div>
                  <p className="text-sm text-gray-600">
                    Expires: {new Date(activeMembership.membership_end_date).toLocaleDateString()}
                  </p>
                </div>
              )}
              
              {memberBalance !== 0 && (
                <div className={`mt-2 text-lg font-semibold ${
                  memberBalance > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  Balance: ₹{Math.abs(memberBalance)?.toFixed(2)} {memberBalance > 0 ? 'Due' : 'Credit'}
                </div>
              )}
              
              {hasOverdue && (
                <div className="mt-1 text-sm text-red-600 font-medium">
                  ⚠️ Overdue Payments
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              ...(hasDueMemberships ? [{ id: 'add-payment', label: 'Add Payment', icon: '💳' }] : []),
              { id: 'renew-membership', label: 'Renew Membership', icon: '🔄' },
              { id: 'payment-history', label: 'Payment History', icon: '📋' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Add Payment Tab */}
          {activeTab === 'add-payment' && hasDueMemberships && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Add Payment</h3>
              
              {existingMemberships.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No active memberships found. Please create a membership first.</p>
                </div>
              ) : (
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Membership Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Membership
                      </label>
                      <select
                        value={paymentForm.membershipId}
                        onChange={(e) => handlePaymentFormChange('membershipId', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Membership</option>
                        {existingMemberships.map((membership) => {
                          const plan = membershipPlans.find(p => p.id === membership.plan_id);
                          return (
                            <option key={membership.membership_id} value={membership.membership_id}>
                              {plan?.name || 'Unknown Plan'} - 
                              {new Date(membership.membership_start_date).toLocaleDateString()} to {new Date(membership.membership_end_date).toLocaleDateString()}
                              {membership.total_amount_due > 0 && ` (Due: ₹${membership.total_amount_due})`}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {/* Amount */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={paymentForm.amount}
                        onChange={(e) => handlePaymentFormChange('amount', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                        required
                      />
                    </div>

                    {/* Payment Method */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Method
                      </label>
                      <select
                        value={paymentForm.method}
                        onChange={(e) => handlePaymentFormChange('method', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Cash">Cash</option>
                        <option value="Card">Card</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="UPI">UPI</option>
                        <option value="Cheque">Cheque</option>
                      </select>
                    </div>

                    {/* Screenshot Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Screenshot (Optional)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        data-form="payment"
                        onChange={(e) => handleFileUpload(e.target.files[0], 'payment')}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={uploading}
                      />
                      {uploading && (
                        <div className="mt-2">
                          <div className="bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">Uploading... {uploadProgress}%</p>
                        </div>
                      )}
                      {paymentForm.screenshot && (
                        <p className="text-sm text-green-600 mt-1">✓ Screenshot uploaded</p>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={paymentForm.notes}
                      onChange={(e) => handlePaymentFormChange('notes', e.target.value)}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Add any additional notes..."
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading || uploading}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Processing...' : 'Add Payment'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Renew Membership Tab */}
{activeTab === 'renew-membership' && (
  <div>
    <h3 className="text-lg font-semibold mb-4">
      {existingMemberships.length === 0 ? 'Add New Membership' : 'Renew Membership'}
    </h3>

    <form onSubmit={handleRenewalSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Plan Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Membership Plan
          </label>
          <select
            value={renewalForm.planId}
            onChange={(e) => handleRenewalFormChange('planId', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select Plan</option>
            {membershipPlans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name} - ₹{plan.price} ({plan.duration_days} days)
              </option>
            ))}
          </select>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount Paid
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={renewalForm.amount}
            onChange={(e) => handleRenewalFormChange('amount', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
            required
          />
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Method
          </label>
          <select
            value={renewalForm.method}
            onChange={(e) => handleRenewalFormChange('method', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="UPI">UPI</option>
            <option value="Cheque">Cheque</option>
          </select>
        </div>

        {/* Screenshot Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Screenshot (Optional)
          </label>
          <input
            type="file"
            accept="image/*"
            data-form="renewal"
            onChange={(e) => handleFileUpload(e.target.files[0], 'renewal')}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={uploading}
          />
          {uploading && (
            <div className="mt-2">
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">Uploading... {uploadProgress}%</p>
            </div>
          )}
          {renewalForm.screenshot && (
            <p className="text-sm text-green-600 mt-1">✓ Screenshot uploaded</p>
          )}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes (Optional)
        </label>
        <textarea
          value={renewalForm.notes}
          onChange={(e) => handleRenewalFormChange('notes', e.target.value)}
          rows={3}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Add any additional notes..."
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading || uploading}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? 'Processing...'
            : existingMemberships.length === 0
            ? 'Add Membership'
            : 'Renew Membership'}
        </button>
      </div>
    </form>
  </div>
)}


          {/* Payment History Tab */}
          {activeTab === 'payment-history' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Payment History</h3>
              
              {paymentHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No payment history found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Method
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Membership
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">{console.log("paymentHistory: ",paymentHistory)
                    }
                      {paymentHistory.map((payment) => {
                        const membership = existingMemberships.find(m => m.membership_id === payment.membership_id);
                        const plan = membershipPlans.find(p => p.id === membership?.plan_id);
                        
                        return (
                          <tr key={payment.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(payment.payment_date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              ₹{payment.payment_amount?.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {payment.payment_method}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {plan?.name || 'Unknown Plan'}
                            </td>
                            {/* TODO */}
                            {
                              !payment.status  ? 
                              <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 `}>
                                Completed
                              </span>
                            </td> 
                            :

                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                payment.status === 'Completed'
                                  ? 'bg-green-100 text-green-800'
                                  : payment.status === 'Pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {payment.status}
                              </span>
                            </td>

                            }
                            
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {payment.notes || '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MembershipAndPayments;