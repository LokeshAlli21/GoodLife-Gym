import React, { useState, useEffect } from 'react';
import { format, addDays, parseISO } from 'date-fns';

// Mock Database - would be replaced with actual API calls
const MEMBERSHIP_PLANS = {
  monthly: { name: 'Monthly', price: 600, duration: 30 },
  quarterly: { name: 'Quarterly', price: 1500, duration: 90 },
  biannual: { name: 'Bi-Annual', price: 2800, duration: 180 },
  yearly: { name: 'Yearly', price: 4500, duration: 365 },
};

// Sample data for testing
const SAMPLE_MEMBERS = [
  { id: 1, name: "Rahul Sharma", phone: "9876543210", email: "rahul@example.com" },
  { id: 2, name: "Priya Singh", phone: "8765432109", email: "priya@example.com" },
  { id: 3, name: "Amit Kumar", phone: "7654321098", email: "amit@example.com" },
];

const SAMPLE_MEMBERSHIPS = [
  { 
    id: 1, 
    member_id: 1, 
    membership_plan: 'monthly',
    membership_price: 600,
    membership_duration_days: 30,
    membership_start_date: '2025-04-15',
    membership_end_date: '2025-05-15',
    payment_installment_1: 300,
    payment_installment_2: 300,
    payment_installment_3: 0,
    installment_amount: 0,
    total_amount_paid: 600,
    total_amount_due: 0,
    last_payment_date: '2025-04-20',
    next_payment_due_date: '2025-05-15',
    payment_method: 'upi',
    status: 'active'
  },
  { 
    id: 2, 
    member_id: 2, 
    membership_plan: 'quarterly',
    membership_price: 1500,
    membership_duration_days: 90,
    membership_start_date: '2025-03-10',
    membership_end_date: '2025-06-10',
    payment_installment_1: 500,
    payment_installment_2: 500,
    payment_installment_3: 0,
    installment_amount: 0,
    total_amount_paid: 1000,
    total_amount_due: 500,
    last_payment_date: '2025-04-05',
    next_payment_due_date: '2025-05-05',
    payment_method: 'cash',
    status: 'active'
  }
];

// Utility functions
const formatDate = (date) => {
  if (!date) return '';
  return typeof date === 'string' ? date : format(date, 'yyyy-MM-dd');
};

const calculateEndDate = (startDate, durationDays) => {
  if (!startDate || !durationDays) return '';
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  return formatDate(addDays(start, parseInt(durationDays)));
};

// Component for Input Fields
const Input = ({ label, id, error, ...props }) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input 
      id={id}
      className={`w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
      {...props}
    />
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
  </div>
);

// Button Component
const Button = ({ children, variant = "primary", className = "", ...props }) => {
  const baseClasses = "px-4 py-2 rounded-md font-medium transition-colors duration-200 flex items-center justify-center";
  
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
    success: "bg-green-600 hover:bg-green-700 text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    warning: "bg-yellow-500 hover:bg-yellow-600 text-white",
  };
  
  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Dashboard Stats
const StatCard = ({ title, value, icon, color }) => (
  <div className={`bg-white rounded-lg shadow-md p-4 border-l-4 ${color}`}>
    <div className="flex items-center">
      <div className={`rounded-full p-2 ${color.replace('border-', 'bg-').replace('-600', '-100')} mr-4`}>
        {icon}
      </div>
      <div>
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  </div>
);

// Tab Component
const Tab = ({ label, active, onClick }) => (
  <button
    className={`px-4 py-2 font-medium ${
      active 
        ? "border-b-2 border-blue-500 text-blue-600" 
        : "text-gray-500 hover:text-gray-700"
    }`}
    onClick={onClick}
  >
    {label}
  </button>
);

// Member Form component
const MemberForm = ({ onSubmit, initialData = {}, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    emergency_contact: '',
    ...initialData
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">{initialData.id ? 'Edit Member' : 'Add New Member'}</h2>
      
      <Input 
        label="Full Name" 
        id="name" 
        name="name" 
        value={formData.name} 
        onChange={handleChange} 
        required 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input 
          label="Phone Number" 
          id="phone" 
          name="phone" 
          value={formData.phone} 
          onChange={handleChange} 
          required 
        />
        
        <Input 
          label="Email" 
          id="email" 
          name="email" 
          type="email" 
          value={formData.email} 
          onChange={handleChange} 
        />
      </div>
      
      <Input 
        label="Address" 
        id="address" 
        name="address" 
        value={formData.address} 
        onChange={handleChange} 
      />
      
      <Input 
        label="Emergency Contact" 
        id="emergency_contact" 
        name="emergency_contact" 
        value={formData.emergency_contact} 
        onChange={handleChange} 
      />
      
      <div className="flex justify-end space-x-3 mt-6">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary">Save Member</Button>
      </div>
    </form>
  );
};

// Membership and Payment Form Component
const MembershipForm = ({ onSubmit, onCancel, memberData, initialData = {} }) => {
  const today = formatDate(new Date());
  
  const [formData, setFormData] = useState({
    membership_plan: '',
    membership_price: '',
    membership_duration_days: '',
    membership_start_date: today,
    membership_end_date: '',
    payment_installment_1: 0,
    payment_installment_2: 0,
    payment_installment_3: 0,
    installment_amount: '',
    total_amount_paid: '',
    total_amount_due: '',
    last_payment_date: today,
    next_payment_due_date: '',
    payment_method: '',
    notes: '',
    ...initialData
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Update end date when start date or duration changes
    if (formData.membership_start_date && formData.membership_duration_days) {
      const endDate = calculateEndDate(
        formData.membership_start_date, 
        formData.membership_duration_days
      );
      setFormData(prev => ({ 
        ...prev, 
        membership_end_date: endDate,
        next_payment_due_date: endDate
      }));
    }
  }, [formData.membership_start_date, formData.membership_duration_days]);

  useEffect(() => {
    // Calculate payments and dues
    const calculatePayments = () => {
      const price = parseFloat(formData.membership_price) || 0;
      const p1 = parseFloat(formData.payment_installment_1) || 0;
      const p2 = parseFloat(formData.payment_installment_2) || 0;
      const p3 = parseFloat(formData.payment_installment_3) || 0;
      const current = parseFloat(formData.installment_amount) || 0;
      
      const totalPaid = p1 + p2 + p3 + current;
      const due = price - totalPaid;
      
      return { totalPaid, due: due >= 0 ? due : 0 };
    };
    
    const { totalPaid, due } = calculatePayments();
    
    setFormData(prev => ({
      ...prev,
      total_amount_paid: totalPaid,
      total_amount_due: due
    }));
  }, [
    formData.membership_price,
    formData.payment_installment_1,
    formData.payment_installment_2,
    formData.payment_installment_3,
    formData.installment_amount
  ]);

  const handlePlanChange = (e) => {
    const planKey = e.target.value;
    const plan = MEMBERSHIP_PLANS[planKey] || { price: '', duration: '' };
    
    setFormData(prev => ({
      ...prev,
      membership_plan: planKey,
      membership_price: plan.price,
      membership_duration_days: plan.duration
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors = {};
    if (!formData.membership_plan) newErrors.membership_plan = "Please select a plan";
    if (!formData.membership_start_date) newErrors.membership_start_date = "Start date is required";
    if (!formData.payment_method && parseFloat(formData.installment_amount) > 0) {
      newErrors.payment_method = "Payment method is required";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSubmit({
      ...formData,
      member_id: memberData.id
    });
  };

  const isRenewal = Boolean(initialData.id);

  const handleInstallmentDistribution = () => {
    if (!formData.membership_price) {
      setErrors({ membership_plan: "Please select a plan first" });
      return;
    }
    
    const price = parseFloat(formData.membership_price);
    const installments = Math.ceil(price / 3);
    
    setFormData(prev => ({
      ...prev,
      payment_installment_1: installments,
      payment_installment_2: installments,
      payment_installment_3: price - (installments * 2),
      installment_amount: installments,
      total_amount_paid: installments,
      total_amount_due: price - installments
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">
        {isRenewal ? 'Renew Membership' : 'New Membership'} for {memberData?.name}
      </h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Membership Plan</label>
        <select
          name="membership_plan"
          value={formData.membership_plan}
          onChange={handlePlanChange}
          className={`w-full px-3 py-2 border ${errors.membership_plan ? 'border-red-500' : 'border-gray-300'} rounded-md`}
        >
          <option value="">Select Plan</option>
          {Object.entries(MEMBERSHIP_PLANS).map(([key, plan]) => (
            <option key={key} value={key}>
              {plan.name} - ₹{plan.price} ({plan.duration} days)
            </option>
          ))}
        </select>
        {errors.membership_plan && <p className="mt-1 text-sm text-red-500">{errors.membership_plan}</p>}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Price (₹)"
          id="membership_price"
          name="membership_price"
          type="number"
          value={formData.membership_price}
          onChange={handleChange}
          disabled
        />
        
        <Input
          label="Duration (days)"
          id="membership_duration_days"
          name="membership_duration_days"
          type="number"
          value={formData.membership_duration_days}
          onChange={handleChange}
          disabled
        />
        
        <div>
          <Button 
            type="button" 
            variant="secondary" 
            className="mt-7"
            onClick={handleInstallmentDistribution}
          >
            Suggest Installments
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <Input
          label="Start Date"
          id="membership_start_date"
          name="membership_start_date"
          type="date"
          value={formData.membership_start_date}
          onChange={handleChange}
          error={errors.membership_start_date}
          required
        />
        
        <Input
          label="End Date"
          id="membership_end_date"
          name="membership_end_date"
          type="date"
          value={formData.membership_end_date}
          disabled
        />
      </div>
      
      <h3 className="font-medium text-gray-700 mt-6 mb-3">Payment Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Installment 1 (₹)"
          id="payment_installment_1"
          name="payment_installment_1"
          type="number"
          min="0"
          value={formData.payment_installment_1}
          onChange={handleChange}
        />
        
        <Input
          label="Installment 2 (₹)"
          id="payment_installment_2"
          name="payment_installment_2"
          type="number"
          min="0"
          value={formData.payment_installment_2}
          onChange={handleChange}
        />
        
        <Input
          label="Installment 3 (₹)"
          id="payment_installment_3"
          name="payment_installment_3"
          type="number"
          min="0"
          value={formData.payment_installment_3}
          onChange={handleChange}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
        <Input
          label="Current Payment (₹)"
          id="installment_amount"
          name="installment_amount"
          type="number"
          min="0"
          value={formData.installment_amount}
          onChange={handleChange}
        />
        
        <Input
          label="Total Paid (₹)"
          id="total_amount_paid"
          name="total_amount_paid"
          type="number"
          value={formData.total_amount_paid}
          disabled
        />
        
        <Input
          label="Total Due (₹)"
          id="total_amount_due"
          name="total_amount_due"
          type="number"
          value={formData.total_amount_due}
          disabled
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
        <Input
          label="Payment Date"
          id="last_payment_date"
          name="last_payment_date"
          type="date"
          value={formData.last_payment_date}
          onChange={handleChange}
        />
        
        <Input
          label="Next Due Date"
          id="next_payment_due_date"
          name="next_payment_due_date"
          type="date"
          value={formData.next_payment_due_date}
          disabled
        />
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
          <select
            name="payment_method"
            value={formData.payment_method}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${errors.payment_method ? 'border-red-500' : 'border-gray-300'} rounded-md`}
          >
            <option value="">Select Method</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="upi">UPI</option>
            <option value="bank_transfer">Bank Transfer</option>
          </select>
          {errors.payment_method && <p className="mt-1 text-sm text-red-500">{errors.payment_method}</p>}
        </div>
      </div>
      
      <Input
        label="Notes"
        id="notes"
        name="notes"
        as="textarea"
        rows="2"
        value={formData.notes}
        onChange={handleChange}
      />
      
      <div className="flex justify-end space-x-3 mt-6">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary">
          {isRenewal ? 'Update Membership' : 'Create Membership'}
        </Button>
      </div>
    </form>
  );
};

// Member Details Component
const MemberDetails = ({ member, memberships, onRenewMembership, onAddPayment, onEditMember }) => {
  const activeMembership = memberships.find(m => m.status === 'active');
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b bg-blue-50">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">{member.name}</h2>
            <div className="mt-2 text-gray-600">
              <p><span className="font-medium">Phone:</span> {member.phone}</p>
              <p><span className="font-medium">Email:</span> {member.email || 'N/A'}</p>
            </div>
          </div>
          <Button onClick={() => onEditMember(member)}>Edit Member</Button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Current Membership Status</h3>
            <div className="space-x-2">
              <Button 
                variant="primary" 
                onClick={() => onRenewMembership(member, activeMembership || {})}
              >
                {activeMembership ? 'Renew Membership' : 'New Membership'}
              </Button>
              
              {activeMembership && (
                <Button 
                  variant="success" 
                  onClick={() => onAddPayment(member, activeMembership)}
                  disabled={activeMembership?.total_amount_due <= 0}
                >
                  Add Payment
                </Button>
              )}
            </div>
          </div>
          
          {activeMembership ? (
            <div className="border rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Plan</p>
                <p className="font-medium">
                  {MEMBERSHIP_PLANS[activeMembership.membership_plan]?.name || 'Unknown'} 
                  (₹{activeMembership.membership_price})
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Validity</p>
                <p className="font-medium">
                  {activeMembership.membership_start_date} to {activeMembership.membership_end_date}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Status</p>
                <div className="flex items-center">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                    activeMembership.total_amount_due > 0 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}></span>
                  <p className="font-medium">
                    {activeMembership.total_amount_due > 0 
                      ? `₹${activeMembership.total_amount_due} due` 
                      : 'Fully Paid'}
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Total Paid</p>
                <p className="font-medium">₹{activeMembership.total_amount_paid}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Next Payment Due</p>
                <p className="font-medium">{activeMembership.next_payment_due_date || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Payment</p>
                <p className="font-medium">{activeMembership.last_payment_date || 'N/A'}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed">
              <p className="text-gray-500">No active membership</p>
            </div>
          )}
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4">Membership History</h3>
          {memberships.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {memberships.map((membership) => (
                    <tr key={membership.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {MEMBERSHIP_PLANS[membership.membership_plan]?.name || 'Unknown'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {membership.membership_start_date} to {membership.membership_end_date}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        ₹{membership.membership_price}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        ₹{membership.total_amount_paid}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          membership.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {membership.status === 'active' ? 'Active' : 'Expired'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed">
              <p className="text-gray-500">No membership history</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Payment Form Component
const PaymentForm = ({ onSubmit, onCancel, memberData, membershipData }) => {
  const today = formatDate(new Date());
  
  const [formData, setFormData] = useState({
    installment_amount: '',
    payment_method: '',
    last_payment_date: today,
    notes: ''
  });
  
  const [errors, setErrors] = useState({});
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors = {};
    if (!formData.installment_amount) newErrors.installment_amount = "Amount is required";
    if (parseFloat(formData.installment_amount) <= 0) newErrors.installment_amount = "Amount must be greater than 0";
    if (!formData.payment_method) newErrors.payment_method = "Payment method is required";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Calculate next payment details
    const remainingAfterThisPayment = membershipData.total_amount_due - parseFloat(formData.installment_amount);
    
    onSubmit({
      ...membershipData,
      installment_amount: parseFloat(formData.installment_amount),
      total_amount_paid: membershipData.total_amount_paid + parseFloat(formData.installment_amount),
      total_amount_due: remainingAfterThisPayment > 0 ? remainingAfterThisPayment : 0,
      last_payment_date: formData.last_payment_date,
      payment_method: formData.payment_method,
      notes: formData.notes
    });
  };
  
  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Add Payment for {memberData?.name}</h2>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Membership Plan</p>
            <p className="font-medium">
              {MEMBERSHIP_PLANS[membershipData.membership_plan]?.name || 'Unknown'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Amount</p>
            <p className="font-medium">₹{membershipData.membership_price}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Amount Due</p>
            <p className="font-medium">₹{membershipData.total_amount_due}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Payment Amount (₹)"
          id="installment_amount"
          name="installment_amount"
          type="number"
          min="0"
          max={membershipData.total_amount_due}
          placeholder={`Max: ₹${membershipData.total_amount_due}`}
          value={formData.installment_amount}
          onChange={handleChange}
          error={errors.installment_amount}
          required
        />
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
          <select
            name="payment_method"
            value={formData.payment_method}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${errors.payment_method ? 'border-red-500' : 'border-gray-300'} rounded-md`}
            required
          >
            <option value="">Select Method</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="upi">UPI</option>
            <option value="bank_transfer">Bank Transfer</option>
          </select>
          {errors.payment_method && <p className="mt-1 text-sm text-red-500">{errors.payment_method}</p>}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Payment Date"
          id="last_payment_date"
          name="last_payment_date"
          type="date"
          value={formData.last_payment_date}
          onChange={handleChange}
          required
        />
        
        <Input
          label="Notes"
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
        />
      </div>
      
      <div className="flex justify-end space-x-3 mt-6">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="success">Process Payment</Button>
      </div>
    </form>
  );
};

// MemberList Component
const MemberList = ({ members, onSelectMember, onAddMember }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.phone.includes(searchTerm) ||
    (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-semibold">Members</h2>
        <Button onClick={onAddMember}>Add New Member</Button>
      </div>
      
      <div className="p-4">
        <div className="mb-4">
          <Input
            label=""
            id="search"
            name="search"
            type="text"
            placeholder="Search by name, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{member.name}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {member.phone}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {member.email || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                      <Button 
                        variant="secondary" 
                        className="text-sm py-1"
                        onClick={() => onSelectMember(member)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-4 py-6 text-center text-gray-500">
                    {searchTerm ? 'No members found matching your search.' : 'No members found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Dashboard Component
const Dashboard = ({ members, memberships }) => {
  // Calculate stats
  const activeMembers = memberships.filter(m => m.status === 'active').length;
  const pendingPayments = memberships.filter(m => m.status === 'active' && m.total_amount_due > 0).length;
  const totalRevenue = memberships.reduce((sum, m) => sum + m.total_amount_paid, 0);
  
  // Get members with payments due in the next 7 days
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);
  
  const upcomingPayments = memberships
    .filter(m => {
      if (!m.next_payment_due_date || m.total_amount_due <= 0) return false;
      const dueDate = parseISO(m.next_payment_due_date);
      return dueDate >= today && dueDate <= nextWeek;
    })
    .map(m => {
      const member = members.find(mem => mem.id === m.member_id);
      return {
        ...m,
        memberName: member?.name || 'Unknown'
      };
    });
  
  // Get memberships expiring in the next 7 days
  const expiringMemberships = memberships
    .filter(m => {
      if (!m.membership_end_date || m.status !== 'active') return false;
      const endDate = parseISO(m.membership_end_date);
      return endDate >= today && endDate <= nextWeek;
    })
    .map(m => {
      const member = members.find(mem => mem.id === m.member_id);
      return {
        ...m,
        memberName: member?.name || 'Unknown'
      };
    });
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Members" 
          value={members.length} 
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>}
          color="border-blue-600"
        />
        
        <StatCard 
          title="Active Memberships" 
          value={activeMembers} 
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>}
          color="border-green-600"
        />
        
        <StatCard 
          title="Pending Payments" 
          value={pendingPayments} 
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>}
          color="border-yellow-600"
        />
        
        <StatCard 
          title="Total Revenue" 
          value={`₹${totalRevenue}`} 
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>}
          color="border-purple-600"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Upcoming Payments</h2>
          </div>
          
          <div className="p-4">
            {upcomingPayments.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {upcomingPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{payment.memberName}</div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {payment.next_payment_due_date}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        ₹{payment.total_amount_due}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-6 text-gray-500">
                No upcoming payments in the next 7 days.
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Expiring Memberships</h2>
          </div>
          
          <div className="p-4">
            {expiringMemberships.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {expiringMemberships.map((membership) => (
                    <tr key={membership.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{membership.memberName}</div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {membership.membership_end_date}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {MEMBERSHIP_PLANS[membership.membership_plan]?.name || 'Unknown'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-6 text-gray-500">
                No memberships expiring in the next 7 days.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const GymManagementApp = () => {
  const [members, setMembers] = useState(SAMPLE_MEMBERS);
  const [memberships, setMemberships] = useState(SAMPLE_MEMBERSHIPS);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [showMembershipForm, setShowMembershipForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [currentMembershipForEdit, setCurrentMembershipForEdit] = useState(null);
  const [memberForEdit, setMemberForEdit] = useState(null);
  
  // Get memberships for a specific member
  const getMembershipsForMember = (memberId) => {
    return memberships.filter(m => m.member_id === memberId);
  };
  
  // Handler for adding a new member
  const handleAddMember = (memberData) => {
    const newMember = {
      ...memberData,
      id: members.length > 0 ? Math.max(...members.map(m => m.id)) + 1 : 1,
    };
    
    setMembers([...members, newMember]);
    setShowMemberForm(false);
    setSelectedMember(newMember);
    setActiveTab('members');
  };
  
  // Handler for editing a member
  const handleEditMember = (memberData) => {
    const updatedMembers = members.map(m => 
      m.id === memberData.id ? { ...m, ...memberData } : m
    );
    
    setMembers(updatedMembers);
    setShowMemberForm(false);
    setMemberForEdit(null);
    setSelectedMember(memberData);
  };
  
  // Handler for adding or updating a membership
  const handleMembershipSubmit = (membershipData) => {
    if (membershipData.id) {
      // Update existing membership
      const updatedMemberships = memberships.map(m => 
        m.id === membershipData.id ? { ...m, ...membershipData } : m
      );
      setMemberships(updatedMemberships);
    } else {
      // Add new membership
      const newMembership = {
        ...membershipData,
        id: memberships.length > 0 ? Math.max(...memberships.map(m => m.id)) + 1 : 1,
        status: 'active'
      };
      
      // Set previous memberships to expired
      const updatedMemberships = memberships.map(m => 
        m.member_id === newMembership.member_id && m.status === 'active'
          ? { ...m, status: 'expired' }
          : m
      );
      
      setMemberships([...updatedMemberships, newMembership]);
    }
    
    setShowMembershipForm(false);
    setCurrentMembershipForEdit(null);
  };
  
  // Handler for processing payments
  const handlePaymentSubmit = (updatedMembershipData) => {
    const updatedMemberships = memberships.map(m => 
      m.id === updatedMembershipData.id ? { ...updatedMembershipData } : m
    );
    
    setMemberships(updatedMemberships);
    setShowPaymentForm(false);
    setCurrentMembershipForEdit(null);
  };
  
  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard members={members} memberships={memberships} />;
        
      case 'members':
        return selectedMember ? (
          <MemberDetails 
            member={selectedMember}
            memberships={getMembershipsForMember(selectedMember.id)}
            onRenewMembership={(member, membership) => {
              setCurrentMembershipForEdit(membership);
              setShowMembershipForm(true);
            }}
            onAddPayment={(member, membership) => {
              setCurrentMembershipForEdit(membership);
              setShowPaymentForm(true);
            }}
            onEditMember={(member) => {
              setMemberForEdit(member);
              setShowMemberForm(true);
            }}
          />
        ) : (
          <MemberList 
            members={members} 
            onSelectMember={setSelectedMember}
            onAddMember={() => setShowMemberForm(true)}
          />
        );
        
      default:
        return <div>Unknown tab</div>;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Gym Management System</h1>
            <div className="flex space-x-4">
              <Button 
                variant={activeTab === 'dashboard' ? 'primary' : 'secondary'}
                onClick={() => {
                  setActiveTab('dashboard');
                  setSelectedMember(null);
                }}
              >
                Dashboard
              </Button>
              <Button 
                variant={activeTab === 'members' ? 'primary' : 'secondary'}
                onClick={() => {
                  setActiveTab('members');
                  setSelectedMember(null);
                }}
              >
                Members
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab navigation for members view */}
        {activeTab === 'members' && selectedMember && (
          <div className="mb-6">
            <div className="flex items-center">
              <button
                onClick={() => setSelectedMember(null)}
                className="mr-4 text-blue-600 hover:text-blue-800 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Member List
              </button>
              <h2 className="text-lg font-medium text-gray-900">Member Details</h2>
            </div>
          </div>
        )}
        
        {renderTabContent()}
        
        {/* Member Form Modal */}
        {showMemberForm && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
            <div className="max-w-lg w-full">
              <MemberForm 
                onSubmit={memberForEdit ? handleEditMember : handleAddMember}
                initialData={memberForEdit || {}}
                onCancel={() => {
                  setShowMemberForm(false);
                  setMemberForEdit(null);
                }}
              />
            </div>
          </div>
        )}
        
        {/* Membership Form Modal */}
        {showMembershipForm && selectedMember && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
            <div className="max-w-4xl w-full">
              <MembershipForm 
                onSubmit={handleMembershipSubmit}
                initialData={currentMembershipForEdit || {}}
                memberData={selectedMember}
                onCancel={() => {
                  setShowMembershipForm(false);
                  setCurrentMembershipForEdit(null);
                }}
              />
            </div>
          </div>
        )}
        
        {/* Payment Form Modal */}
        {showPaymentForm && selectedMember && currentMembershipForEdit && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
            <div className="max-w-lg w-full">
              <PaymentForm 
                onSubmit={handlePaymentSubmit}
                memberData={selectedMember}
                membershipData={currentMembershipForEdit}
                onCancel={() => {
                  setShowPaymentForm(false);
                  setCurrentMembershipForEdit(null);
                }}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default GymManagementApp;