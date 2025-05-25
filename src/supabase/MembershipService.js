// services/MembershipService.js
import { supabase } from './supabaseClient.js'

class MembershipService {
    // Get member with health metrics
    async getMember(id) {
        const { data, error } = await supabase
            .from('member_health_view')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error("supabase getMember error:", error);
            throw error;
        }
console.log(data);

        return data;
    }

    // Get all membership plans
    async getMembershipPlans() {
        const { data, error } = await supabase
            .from('membership_plans')
            .select('*')
            .eq('active', true)
            .order('duration_days');

        if (error) {
            console.error("supabase getMembershipPlans error:", error);
            throw error;
        }
console.log(data);

        return data;
    }

    // Get member's memberships with payment details
    async getMemberMemberships(memberId) {
        const { data, error } = await supabase
            .from('membership_payment_view')
            .select('*')
            .eq('member_id', memberId)
            .order('membership_start_date', { ascending: false });

        if (error) {
            console.error("supabase getMemberMemberships error:", error);
            throw error;
        }
        console.log(data);

        return data;
    }

    // Get payments for a specific membership
    async getMembershipPayments(membershipId) {
        const { data, error } = await supabase
            .from('payments')
            .select(`
                *,
                memberships!inner(
                    id,
                    member_id,
                    membership_start_date,
                    membership_end_date,
                    membership_plans!inner(name, price)
                )
            `)
            .eq('membership_id', membershipId)
            .order('payment_date', { ascending: false });

        if (error) {
            console.error("supabase getMembershipPayments error:", error);
            throw error;
        }
console.log(data);
        return data;
    }

    // Add payment to existing membership
    async addPayment(paymentData) {
        // First check if membership exists and get plan details
        const { data: membershipData, error: membershipError } = await supabase
            .from('memberships')
            .select(`
                id,
                membership_plans!inner(price)
            `)
            .eq('id', paymentData.membershipId)
            .single();

        if (membershipError) {
            console.error("supabase membership check error:", membershipError);
            throw membershipError;
        }

        // Get current total payments
        const { data: currentPayments, error: paymentsError } = await supabase
            .from('payments')
            .select('payment_amount')
            .eq('membership_id', paymentData.membershipId);

        if (paymentsError) {
            console.error("supabase current payments error:", paymentsError);
            throw paymentsError;
        }

        const currentTotal = currentPayments.reduce((sum, payment) => 
            sum + parseFloat(payment.payment_amount), 0
        );
        const planPrice = parseFloat(membershipData.membership_plans.price);
        const newPaymentAmount = parseFloat(paymentData.amount);

        // Check if payment would exceed plan price
        if (currentTotal + newPaymentAmount > planPrice) {
            throw new Error(`Payment of ₹${newPaymentAmount} would exceed the total plan price of ₹${planPrice}. Current total paid is ₹${currentTotal}.`);
        }

        // Insert the payment
        const { data, error } = await supabase
            .from('payments')
            .insert({
                membership_id: paymentData.membershipId,
                payment_amount: newPaymentAmount,
                payment_date: new Date().toISOString().split('T')[0],
                payment_method: paymentData.method,
                payment_screenshot_url: paymentData.screenshotUrl || null,
                notes: paymentData.notes || null
            })
            .select()
            .single();

        if (error) {
            console.error("supabase addPayment error:", error);
            throw error;
        }

        return data;
    }

    // Renew membership using the database function
    async renewMembership(renewalData) {
        const { data, error } = await supabase
            .rpc('renew_membership', {
                p_member_id: renewalData.memberId,
                p_plan_id: renewalData.planId,
                p_payment_amount: parseFloat(renewalData.amount),
                p_payment_method: renewalData.method,
                p_payment_screenshot_url: renewalData.screenshotUrl || null,
                p_notes: renewalData.notes || null
            });

        if (error) {
            console.error("supabase renewMembership error:", error);
            throw error;
        }

        // Return the new membership ID
        return { membershipId: data };
    }

    // Get member's payment history
    async getMemberPaymentHistory(memberId) {
        const { data, error } = await supabase
            .from('payments')
            .select(`
                *,
                memberships!inner(
                    id,
                    member_id,
                    membership_start_date,
                    membership_end_date,
                    membership_plans!inner(name, price, duration_days)
                )
            `)
            .eq('memberships.member_id', memberId)
            .order('payment_date', { ascending: false });

        if (error) {
            console.error("supabase getMemberPaymentHistory error:", error);
            throw error;
        }

        return data;
    }

    // Upload payment screenshot
    async uploadPaymentScreenshot(file, paymentId) {
        const fileExt = file.name.split('.').pop();
        const fileName = `payment_${paymentId}_${Date.now()}.${fileExt}`;
        const filePath = `payment-screenshots/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('payment-screenshots') // Make sure this bucket exists
            .upload(filePath, file);

        if (uploadError) {
            console.error("supabase uploadPaymentScreenshot error:", uploadError);
            throw uploadError;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('payment-screenshots')
            .getPublicUrl(filePath);

        return urlData.publicUrl;
    }

    // Get membership status summary
    async getMembershipStatus(memberId) {
        const { data, error } = await supabase
            .from('membership_payment_view')
            .select('*')
            .eq('member_id', memberId)
            .eq('membership_status', 'Active')
            .order('membership_end_date', { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
            console.error("supabase getMembershipStatus error:", error);
            throw error;
        }

        return data;
    }

    // Get expiring memberships (for notifications)
    async getExpiringMemberships(days = 7) {
        const { data, error } = await supabase
            .from('expiring_memberships')
            .select('*')
            .lte('days_until_expiration', days)
            .order('days_until_expiration');

        if (error) {
            console.error("supabase getExpiringMemberships error:", error);
            throw error;
        }

        return data;
    }

    // Get pending payments (members with outstanding balances)
    async getPendingPayments() {
        const { data, error } = await supabase
            .from('pending_payments_view')
            .select('*')
            .order('days_since_last_payment', { ascending: false });

        if (error) {
            console.error("supabase getPendingPayments error:", error);
            throw error;
        }

        return data;
    }
}

export default new MembershipService();