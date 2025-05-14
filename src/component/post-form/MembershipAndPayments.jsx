import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input, Button } from '../index';
import { toast } from 'react-toastify';

const today = new Date().toISOString().split('T')[0]

function MembershipAndPayments({ handleSubmitMembershipAndPayments, prevData = {} }) {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      membership_plan: prevData.membership_plan || '',
      membership_price: prevData.membership_price || '',
      membership_duration_days: prevData.membership_duration_days || '',
      payment_installment_1: prevData.payment_installment_1 || '',
      payment_installment_2: prevData.payment_installment_2 || '',
      payment_installment_3: prevData.payment_installment_3 || '',
      installment_amount: prevData.installment_amount || '',
      total_amount_paid: prevData.total_amount_paid || '',
      total_amount_due: prevData.total_amount_due || '',
      last_payment_date: prevData.last_payment_date || '',
      next_payment_due_date: prevData.next_payment_due_date || '',
      payment_method: prevData.payment_method || '',
      payment_screenshot_url: prevData.payment_screenshot_url || '',
      notes: prevData.notes || '',
      membership_start_date: prevData.membership_start_date || today,
      membership_end_date: prevData.membership_end_date || '',
    },
  })

  // State for selected membership plan
  const [selectedPlan, setSelectedPlan] = useState('');

  // Prices and durations for different membership plans
  const plans = {
    monthly: { price: 600, duration: 30 },
    quarterly: { price: 1500, duration: 90 },
    yearly: { price: 4500, duration: 365 }
  };

  // Automatically set data based on the selected plan
  useEffect(() => {
    if (selectedPlan) {
      const { price, duration } = plans[selectedPlan];
      setValue('membership_price', price);
      setValue('membership_duration_days', duration);
    }
  }, [selectedPlan, setValue]);

  // Handle form submission
  const submit = (data) => {
    handleSubmitMembershipAndPayments(data);
    reset(); // Clear form after submit
  };



  // Watch inputs for auto-calculation
  const installmentAmount = watch('installment_amount');
  const paymentInstallment1 = watch('payment_installment_1');
  const paymentInstallment2 = watch('payment_installment_2');
  const paymentInstallment3 = watch('payment_installment_3');
  const membershipPrice = watch('membership_price');
  const membershipDuration = watch('membership_duration_days');
  const startDate = watch('membership_start_date');

  // Auto-set membership price and duration
  useEffect(() => {
    if (selectedPlan) {
      const { price, duration } = plans[selectedPlan];
      setValue('membership_price', price);
      setValue('membership_duration_days', duration);
    }
  }, [selectedPlan, setValue]);

  // Auto-calculate total amount paid and due
  useEffect(() => {
    if (installmentAmount && membershipPrice) {
      const p1 = Number(paymentInstallment1) || 0;
      const p2 = Number(paymentInstallment2) || 0;
      const p3 = Number(paymentInstallment3) || 0;
      const prevPaid = p1 + p2 + p3;
      const paid = Number(installmentAmount) + prevPaid;
      const due = Number(membershipPrice) - paid;
      setValue('total_amount_paid', paid);
      setValue('total_amount_due', due >= 0 ? due : 0);
    }
  }, [installmentAmount, membershipPrice, setValue]);

  // Auto-calculate membership end and next due date
useEffect(() => {
  if (startDate && membershipDuration) {
    const start = new Date(startDate);
    const end = new Date(start);
    const nextDue = new Date(start);

    end.setDate(end.getDate() + Number(membershipDuration));
    nextDue.setDate(nextDue.getDate() + Number(membershipDuration));

    const formatDate = (date) => date.toISOString().split("T")[0];

    setValue('membership_end_date', formatDate(end));
    setValue('next_payment_due_date', formatDate(nextDue));
  }
}, [startDate, membershipDuration, setValue]);


  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
      {/* Membership Plan Selector */}
      <div>
        <label className="block text-sm font-medium mb-1">Membership Plan</label>
        <select
          {...register('membership_plan', { required: true })}
          onChange={(e) => setSelectedPlan(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="">Select Plan</option>
          <option value="monthly">Monthly - ₹600</option>
          <option value="quarterly">Quarterly - ₹1500</option>
          <option value="yearly">Yearly - ₹4500</option>
        </select>
      </div>

      {/* Membership Price */}
      <div>
        <Input
          label="Membership Price (₹)"
          type="number"
          {...register('membership_price', { required: true })}
          className="w-full"
          disabled
        />
      </div>

      {/* Membership Duration */}
      <div>
        <Input
          label="Membership Duration (days)"
          type="number"
          {...register('membership_duration_days', { required: true })}
          className="w-full"
          disabled
        />
      </div>

      {/* Payment Information */}
      <div className="flex flex-col gap-4">
        {prevData && <>
        <Input
          label="Installment 1"
          type="number"
          {...register('payment_installment_1')}
          className="w-full"
          disabled
        />
        <Input
          label="Installment 2"
          type="number"
          {...register('payment_installment_2')}
          className="w-full"
          disabled
        />

        <Input
          label="Installment 3"
          type="number"
          {...register('payment_installment_3')}
          className="w-full"
          disabled
        />
        </>}

                {/* Installment Amount */}
        <Input
          label="Installment Amount (₹)"
          type="number"
          {...register('installment_amount')}
          className="w-full"
        />

        {/* Total Amount Paid */}
        <Input
          label="Total Amount Paid (₹)"
          type="number"
          {...register('total_amount_paid')}
          className="w-full"
          disabled
        />

        {/* Total Amount Due */}
        <Input
          label="Total Amount Due (₹)"
          type="number"
          {...register('total_amount_due')}
          className="w-full"
          disabled
        />

        {/* Last Payment Date */}
        {
          prevData &&
                  <Input
          label="Last Payment Date"
          type="date"
          {...register('last_payment_date')}
          className="w-full"
          disabled
        />
        }
        <Input
          label="membership_start_date"
          type="date"
          {...register('membership_start_date')}
          className="w-full"
        />
        {/* Next Payment Due Date */}
        <Input
          label="Next Payment Due Date"
          type="date"
          {...register('next_payment_due_date')}
          className="w-full"
          disabled
        />
        <Input
          label="membership_end_date"
          type="date"
          {...register('membership_end_date')}
          className="w-full"
          disabled
        />

        {/* Payment Method */}
        <Input
          label="Payment Method"
          {...register('payment_method')}
          className="w-full"
        />
        
        {/* Payment Screenshot URL */}
        <Input
          label="Payment Screenshot URL"
          {...register('payment_screenshot_url')}
          className="w-full"
        />

        {/* Notes */}
        <Input
          label="Notes"
          {...register('notes')}
          className="w-full"
        />
      </div>

      {/* Submit Button */}
      <div>
        <Button
          type="submit"
          bgColor="bg-orange-500 hover:bg-orange-600"
          className="w-full text-white py-3 font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105"
        >
          Submit
        </Button>
      </div>
    </form>
  );
}

export default MembershipAndPayments;