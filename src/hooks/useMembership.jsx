// hooks/useMembership.js
import { useState, useEffect, useCallback } from 'react';
import MembershipService from '../supabase/MembershipService';
import FileUploadService from '../component/FileUploadService';

export const useMembership = (memberId) => {
    // State management
    const [memberData, setMemberData] = useState(null);
    const [membershipPlans, setMembershipPlans] = useState([]);
    const [existingMemberships, setExistingMemberships] = useState([]);
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Load initial data
    const loadData = useCallback(async () => {
        if (!memberId) return;

        try {
            setLoading(true);
            setError(null);

            // Load data in parallel
            const [memberResult, plansResult, membershipsResult, historyResult] = await Promise.allSettled([
                MembershipService.getMember(memberId),
                MembershipService.getMembershipPlans(),
                MembershipService.getMemberMemberships(memberId),
                MembershipService.getMemberPaymentHistory(memberId)
            ]);

            console.log("memberResult: ",memberResult);
            console.log("membershipsResult: ",membershipsResult);
            
            // Handle member data
            if (memberResult.status === 'fulfilled') {
                setMemberData(memberResult.value);
            } else {
                console.error('Failed to load member data:', memberResult.reason);
                throw new Error('Failed to load member data');
            }

            console.log(plansResult);
            
            // Handle plans data
            if (plansResult.status === 'fulfilled') {
                setMembershipPlans(plansResult.value);
            } else {
                console.error('Failed to load membership plans:', plansResult.reason);
                setMembershipPlans([]);
            }

            // Handle memberships data
            if (membershipsResult.status === 'fulfilled') {
                setExistingMemberships(membershipsResult.value);
            } else {
                console.error('Failed to load memberships:', membershipsResult.reason);
                setExistingMemberships([]);
            }

            // Handle payment history
            if (historyResult.status === 'fulfilled') {
                setPaymentHistory(historyResult.value);
            } else {
                console.error('Failed to load payment history:', historyResult.reason);
                setPaymentHistory([]);
            }

        } catch (err) {
            console.error('Error loading membership data:', err);
            setError(err.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
        console.log("existingMemberships :",existingMemberships);
        
    }, [memberId]);

    // Load data on mount and when memberId changes
    useEffect(() => {
        loadData();
    }, [loadData]);

    // Add payment to existing membership
    const addPayment = useCallback(async (paymentData) => {
        try {
            setLoading(true);
            setError(null);

            let screenshotUrl = null;

            // Upload screenshot if provided
            if (paymentData.screenshot) {
                try {
                    const uploadResult = await FileUploadService.uploadPaymentScreenshot(
                        paymentData.screenshot,
                        `temp_${Date.now()}`
                    );
                    screenshotUrl = uploadResult.url;
                } catch (uploadError) {
                    console.warn('Screenshot upload failed:', uploadError);
                    // Continue without screenshot
                }
            }

            // Add payment to database
            const payment = await MembershipService.addPayment({
                membershipId: paymentData.membershipId,
                amount: paymentData.amount,
                method: paymentData.method,
                screenshotUrl: screenshotUrl,
                notes: paymentData.notes
            });

            // Update screenshot reference if uploaded
            if (screenshotUrl && payment.id) {
                try {
                    await FileUploadService.updatePaymentScreenshot(payment.id, screenshotUrl);
                } catch (updateError) {
                    console.warn('Failed to update payment screenshot reference:', updateError);
                }
            }

            setSuccess('Payment added successfully!');
            
            // Reload data to reflect changes
            await loadData();

            return payment;

        } catch (err) {
            console.error('Error adding payment:', err);
            setError(err.message || 'Failed to add payment');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [loadData]);

    // Renew membership
    const renewMembership = useCallback(async (renewalData) => {
        try {
            setLoading(true);
            setError(null);

            let screenshotUrl = null;

            // Upload screenshot if provided
            if (renewalData.screenshot) {
                try {
                    const uploadResult = await FileUploadService.uploadPaymentScreenshot(
                        renewalData.screenshot,
                        `renewal_${Date.now()}`
                    );
                    screenshotUrl = uploadResult.url;
                } catch (uploadError) {
                    console.warn('Screenshot upload failed:', uploadError);
                    // Continue without screenshot
                }
            }

            // Renew membership
            const result = await MembershipService.renewMembership({
                memberId: memberId,
                planId: renewalData.planId,
                amount: renewalData.amount,
                method: renewalData.method,
                screenshotUrl: screenshotUrl,
                notes: renewalData.notes
            });

            setSuccess('Membership renewed successfully!');
            
            // Reload data to reflect changes
            await loadData();

            return result;

        } catch (err) {
            console.error('Error renewing membership:', err);
            setError(err.message || 'Failed to renew membership');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [memberId, loadData]);

    // Get membership status
    const getMembershipStatus = useCallback(async () => {
        try {
            return await MembershipService.getMembershipStatus(memberId);
        } catch (err) {
            console.error('Error getting membership status:', err);
            return null;
        }
    }, [memberId]);

    // Clear messages
    const clearMessages = useCallback(() => {
        setError(null);
        setSuccess(null);
    }, []);

    // Auto-clear messages after timeout
    useEffect(() => {
        if (success || error) {
            const timer = setTimeout(() => {
                clearMessages();
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [success, error, clearMessages]);

    // Get active membership (helper)
    const getActiveMembership = useCallback(() => {
        return existingMemberships.find(membership => 
            membership.membership_status === 'Active'
        );
    }, [existingMemberships]);

    // Get membership balance (helper)
    const getMembershipBalance = useCallback((membershipId) => {
        const membership = existingMemberships.find(m => m.membership_id === membershipId);
        return membership ? parseFloat(membership.total_amount_due) : 0;
    }, [existingMemberships]);

    // Check if member has overdue payments
    const hasOverduePayments = useCallback(() => {
        return existingMemberships.some(membership => 
            parseFloat(membership.total_amount_due) > 0 && 
            membership.membership_status === 'Active'
        );
    }, [existingMemberships]);

    // Get next payment due date
    const getNextPaymentDue = useCallback(() => {
        const activeMembership = getActiveMembership();
        return activeMembership?.next_payment_due_date || null;
    }, [getActiveMembership]);

    // Refresh data
    const refresh = useCallback(() => {
        return loadData();
    }, [loadData]);

    return {
        // Data
        memberData,
        membershipPlans,
        existingMemberships,
        paymentHistory,
        
        // State
        loading,
        error,
        success,
        uploadProgress,
        
        // Actions
        addPayment,
        renewMembership,
        getMembershipStatus,
        refresh,
        clearMessages,
        
        // Helpers
        getActiveMembership,
        getMembershipBalance,
        hasOverduePayments,
        getNextPaymentDue,
        setLoading
    };
};

// Hook for membership plans only (lighter version)
export const useMembershipPlans = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadPlans = async () => {
            try {
                setLoading(true);
                const data = await MembershipService.getMembershipPlans();
                setPlans(data);
            } catch (err) {
                console.error('Error loading membership plans:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadPlans();
    }, []);

    return { plans, loading, error };
};

// Hook for file upload with progress
export const useFileUpload = () => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);

    const uploadFile = useCallback(async (file, paymentId) => {
        try {
            setUploading(true);
            setProgress(0);
            setError(null);

            // Simulate progress for user feedback
            const progressInterval = setInterval(() => {
                setProgress(prev => Math.min(prev + 10, 90));
            }, 100);

            const result = await FileUploadService.uploadPaymentScreenshot(file, paymentId);
            
            clearInterval(progressInterval);
            setProgress(100);
            
            return result;
        } catch (err) {
            console.error('File upload error:', err);
            setError(err.message);
            throw err;
        } finally {
            setUploading(false);
            setTimeout(() => setProgress(0), 1000);
        }
    }, []);

    return {
        uploadFile,
        uploading,
        progress,
        error,
        clearError: () => setError(null)
    };
};