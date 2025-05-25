import React, { useState, useEffect } from 'react';
import { useMembership, useFileUpload } from '../../hooks/useMembership';
import { FaCreditCard, FaHistory, FaRedo, FaUser, FaPhone, FaEnvelope, FaCalendar, FaRupeeSign, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

function MembershipAndPayments({ memberId }) {
  const {
    memberData,
    membershipPlans,
    existingMemberships,
    paymentHistory,
    loading,
    error,
    success,
    addPayment,
    renewMembership,
    getActiveMembership,
    getMembershipBalance,
    hasOverduePayments,
    clearMessages
  } = useMembership(memberId);

  const { uploadFile, uploading, progress: uploadProgress } = useFileUpload();
  
  const hasDueMemberships = existingMemberships.some(m => m.total_amount_due > 0);
  const [activeTab, setActiveTab] = useState(hasDueMemberships ? 'add-payment' : 'renew-membership');

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

  useEffect(() => {
    if (existingMemberships.length > 0) {
      const activeMembership = getActiveMembership() || existingMemberships[0];
      
      if (activeMembership) {
        setPaymentForm(prev => ({
          ...prev,
          membershipId: activeMembership.membership_id,
          amount: activeMembership.total_amount_due || ''
        }));
        
        setRenewalForm(prev => ({
          ...prev,
          planId: activeMembership.plan_id || ''
        }));
      }
    }
  }, [existingMemberships, getActiveMembership]);

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
      
      setPaymentForm(prev => ({
        ...prev,
        amount: '',
        screenshot: null,
        notes: ''
      }));
      
      const fileInput = document.querySelector('input[type="file"][data-form="payment"]');
      if (fileInput) fileInput.value = '';
      
    } catch (err) {
      console.error('Payment submission error:', err);
    }
  };

  const handleRenewalSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await renewMembership({
        planId: parseInt(renewalForm.planId),
        amount: parseFloat(renewalForm.amount),
        method: renewalForm.method,
        screenshot: renewalForm.screenshot,
        notes: renewalForm.notes
      });
      
      setRenewalForm(prev => ({
        ...prev,
        amount: '',
        screenshot: null,
        notes: ''
      }));
      
      const fileInput = document.querySelector('input[type="file"][data-form="renewal"]');
      if (fileInput) fileInput.value = '';
      
      const selectedPlan = membershipPlans.find(p => p.id.toString() === renewalForm.planId.toString());
      if (selectedPlan && parseFloat(renewalForm.amount) < selectedPlan.amount) {
        setActiveTab('add-payment');
      }
      
    } catch (err) {
      console.error('Renewal submission error:', err);
    }
  };

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

  const handlePaymentFormChange = (field, value) => {
    setPaymentForm(prev => ({ ...prev, [field]: value }));
  };

  const handleRenewalFormChange = (field, value) => {
    setRenewalForm(prev => ({ ...prev, [field]: value }));

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

  const activeMembership = getActiveMembership();
  const memberBalance = getMembershipBalance();
  const hasOverdue = hasOverduePayments();

  if (loading) {
    return (
      <div className="max-w-md mx-auto p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading membership data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto p-4">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
          <div className="flex items-center text-red-600 mb-2">
            <FaExclamationTriangle className="mr-2" />
            <span className="font-semibold">Error</span>
          </div>
          <p className="text-red-700 text-sm mb-3">{error}</p>
          <button
            onClick={clearMessages}
            className="text-sm text-red-600 hover:text-red-800 underline"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  const SelectField = ({ icon: Icon, label, name, options, value, onChange, required = true }) => (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <Icon className="text-orange-500" size={16} />
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        className="px-4 py-3 rounded-lg bg-white text-gray-800 outline-none transition-all duration-200 border border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-200 w-full"
        required={required}
      >
        <option value="">Select {label}</option>
        {options.map((opt, i) => (
          <option key={i} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );

  const InputField = ({ icon: Icon, label, type = "text", value, onChange, name, ...props }) => (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <Icon className="text-orange-500" size={16} />
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        className="px-4 py-3 rounded-lg bg-white text-gray-800 placeholder-gray-500 outline-none transition-all duration-200 border border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-200 w-full"
        {...props}
      />
    </div>
  );

  return (
    <div className="max-w-md mx-auto p-4 bg-white space-y-6">
      
      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4">
          <div className="flex items-center text-green-600 mb-2">
            <FaCheckCircle className="mr-2" />
            <span className="font-semibold">Success</span>
          </div>
          <p className="text-green-700 text-sm mb-3">{success}</p>
          <button
            onClick={clearMessages}
            className="text-sm text-green-600 hover:text-green-800 underline"
          >
            Dismiss
          </button>
        </div>
      )}

{console.log("memberData: ",memberData)
}
      {/* Member Info Card */}
      {memberData && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-200 p-4">
          <div className="flex items-center gap-3 mb-4">
<div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 overflow-hidden flex items-center justify-center">
  {memberData.photo_url ? (
    <img
      src={memberData.photo_url}
      alt="Member Photo"
      className="w-full h-full object-cover"
    />
  ) : (
    <FaUser className="text-white text-xl" />
  )}
</div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {memberData.first_name} {memberData.last_name}
              </h2>
              <p className="text-sm text-gray-600">ID: {memberData.id}</p>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            {memberData.email && (
              <div className="flex items-center gap-2 text-gray-600">
                <FaEnvelope className="text-blue-500" size={14} />
                <span>{memberData.email}</span>
              </div>
            )}
            {memberData.phone && (
              <div className="flex items-center gap-2 text-gray-600">
                <FaPhone className="text-green-500" size={14} />
                <span>{memberData.phone}</span>
              </div>
            )}
            {memberData.date_of_birth && (
              <div className="flex items-center gap-2 text-gray-600">
                <FaCalendar className="text-purple-500" size={14} />
                <span>DOB: {new Date(memberData.date_of_birth).toLocaleDateString()}</span>
              </div>
            )}
            {memberData.address && (
              <div className="flex items-start gap-2 text-gray-600">
                <span className="text-orange-500 mt-1">📍</span>
                <span>{memberData.address}</span>
              </div>
            )}
            {memberData.emergency_contact && (
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-red-500">🚨</span>
                <span>Emergency: {memberData.emergency_contact}</span>
              </div>
            )}
          </div>

          {/* Status and Balance */}
          <div className="flex flex-wrap gap-2 mt-4">
            {activeMembership && (
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                activeMembership.membership_status === 'Active' 
                  ? 'bg-green-100 text-green-800'
                  : activeMembership.membership_status === 'Expired'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {activeMembership.membership_status}
              </span>
            )}
            
            {memberBalance !== 0 && (
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                memberBalance > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
              }`}>
                ₹{Math.abs(memberBalance)?.toFixed(2)} {memberBalance > 0 ? 'Due' : 'Credit'}
              </span>
            )}
            
            {hasOverdue && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                ⚠️ Overdue
              </span>
            )}
          </div>

          {activeMembership && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <p className="text-xs text-red-500 font-bold">
                Expires: {new Date(activeMembership.membership_end_date).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Simple Tab Buttons */}
      <div className="flex gap-2">
        {hasDueMemberships && (
          <button
            onClick={() => setActiveTab('add-payment')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
              activeTab === 'add-payment'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FaCreditCard />
            Pay
          </button>
        )}
        <button
          onClick={() => setActiveTab('renew-membership')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
            activeTab === 'renew-membership'
              ? 'bg-gradient-to-r from-green-500 to-green-600  text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FaRedo />
          Renew
        </button>
        <button
          onClick={() => setActiveTab('payment-history')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
            activeTab === 'payment-history'
              ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FaHistory />
          History
        </button>
      </div>

      {/* Add Payment Form */}
      {activeTab === 'add-payment' && hasDueMemberships && (
        <div className="bg-gradient-to-r from-orange-50 to-indigo-50 rounded-2xl border-2 border-blue-200 p-4">
          <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4">
            <FaCreditCard className="text-blue-500" />
            Add Payment
          </h3>
          
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <SelectField
              icon={FaCreditCard}
              label="Membership"
              name="membershipId"
              value={paymentForm.membershipId}
              onChange={handlePaymentFormChange}
              options={existingMemberships.map((membership) => {
                const plan = membershipPlans.find(p => p.id === membership.plan_id);
                return {
                  value: membership.membership_id,
                  label: `${plan?.name || 'Unknown'} - Due: ₹${membership.total_amount_due}`
                };
              })}
            />

            <InputField
              icon={FaRupeeSign}
              label="Amount"
              type="number"
              name="amount"
              value={paymentForm.amount}
              onChange={handlePaymentFormChange}
              min="0"
              step="0.01"
              placeholder="0.00"
              required
            />

            <SelectField
              icon={FaCreditCard}
              label="Payment Method"
              name="method"
              value={paymentForm.method}
              onChange={handlePaymentFormChange}
              options={[
                { value: 'Cash', label: 'Cash' },
                { value: 'Card', label: 'Card' },
                { value: 'Bank Transfer', label: 'Bank Transfer' },
                { value: 'UPI', label: 'UPI' },
                { value: 'Cheque', label: 'Cheque' }
              ]}
              required={false}
            />

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Screenshot (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                data-form="payment"
                onChange={(e) => handleFileUpload(e.target.files[0], 'payment')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={uploading}
              />
              {uploading && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              )}
              {paymentForm.screenshot && <p className="text-sm text-green-600">✓ Uploaded</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Notes</label>
              <textarea
                value={paymentForm.notes}
                onChange={(e) => handlePaymentFormChange('notes', e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 outline-none focus:ring-orange-200 resize-none"
                placeholder="Additional notes..."
              />
            </div>

            <button
              type="submit"
              disabled={loading || uploading}
              className="w-full bg-gradient-to-r from-orange-400   to-blue-400 text-white py-4 font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Add Payment'}
            </button>
          </form>
        </div>
      )}

      {/* Renew Membership Form */}
      {activeTab === 'renew-membership' && (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl border-2 border-green-200 p-4">
          <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4">
            <FaRedo className="text-green-500" />
            {existingMemberships.length === 0 ? 'Add New Membership' : 'Renew Membership'}
          </h3>
          
          <form onSubmit={handleRenewalSubmit} className="space-y-4">
            <SelectField
              icon={FaRedo}
              label="Membership Plan"
              name="planId"
              value={renewalForm.planId}
              onChange={handleRenewalFormChange}
              options={membershipPlans.map((plan) => ({
                value: plan.id,
                label: `${plan.name} - ₹${plan.price} (${plan.duration_days} days)`
              }))}
            />

            <InputField
              icon={FaRupeeSign}
              label="Amount Paid"
              type="number"
              name="amount"
              value={renewalForm.amount}
              onChange={handleRenewalFormChange}
              min="0"
              step="0.01"
              placeholder="0.00"
              required
            />

            <SelectField
              icon={FaCreditCard}
              label="Payment Method"
              name="method"
              value={renewalForm.method}
              onChange={handleRenewalFormChange}
              options={[
                { value: 'Cash', label: 'Cash' },
                { value: 'Card', label: 'Card' },
                { value: 'Bank Transfer', label: 'Bank Transfer' },
                { value: 'UPI', label: 'UPI' },
                { value: 'Cheque', label: 'Cheque' }
              ]}
              required={false}
            />

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Screenshot (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                data-form="renewal"
                onChange={(e) => handleFileUpload(e.target.files[0], 'renewal')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={uploading}
              />
              {uploading && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              )}
              {renewalForm.screenshot && <p className="text-sm text-green-600">✓ Uploaded</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Notes</label>
              <textarea
                value={renewalForm.notes}
                onChange={(e) => handleRenewalFormChange('notes', e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 outline-none focus:ring-orange-200 resize-none"
                placeholder="Additional notes..."
              />
            </div>

            <button
              type="submit"
              disabled={loading || uploading}
              className="w-full bg-gradient-to-r from-blue-500 to-green-400 text-white py-4 font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Processing...' : existingMemberships.length === 0 ? 'Add Membership' : 'Renew Membership'}
            </button>
          </form>
        </div>
      )}

      {/* Payment History */}
      {activeTab === 'payment-history' && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200 p-4">
          <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4">
            <FaHistory className="text-purple-500" />
            Payment History
          </h3>
          
          {paymentHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FaHistory className="mx-auto text-4xl mb-2 opacity-50" />
              <p>No payment history found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {paymentHistory.map((payment) => {
                const membership = existingMemberships.find(m => m.membership_id === payment.membership_id);
                const plan = membershipPlans.find(p => p.id === membership?.plan_id);
                
                return (
                  <div key={payment.id} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">₹{payment.payment_amount?.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">{plan?.name || 'Unknown Plan'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {new Date(payment.payment_date).toLocaleDateString()}
                        </p>
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                          !payment.status || payment.status === 'Completed'
                            ? 'bg-green-100 text-green-800'
                            : payment.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {payment.status || 'Completed'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span className="bg-gray-100 px-2 py-1 rounded">{payment.payment_method}</span>
                      {payment.notes && (
                        <span className="italic text-xs">{payment.notes}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MembershipAndPayments;