import React, { useEffect, useState } from "react";
import { User, Phone, Mail, MapPin, Activity, CreditCard, Calendar, Heart, ChevronRight, Edit3, Plus, RefreshCw } from "lucide-react";
import { useNavigate, useParams } from 'react-router-dom'
import MembershipService from "../supabase/MembershipService";
import { useSelector } from "react-redux";

export default function Post() {
  const [post, setPost] = useState({});
  const [activeTab, setActiveTab] = useState('overview');

  const { slug } = useParams();
  const navigate = useNavigate()

  const userData = useSelector((state) => state.auth.userData);

  const isAuthor = post && userData ? post.userId === userData.$id : false;

  useEffect(() => {
    if (slug) {
      MembershipService.getCompleteMemberDetails(slug).then((post) => {
        if (post) {
          console.log(post);
          setPost(post);
        }
        else navigate("/");
      });
    } else navigate("/");
  }, [slug, navigate]);

   const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const StatusBadge = ({ status }) => {
    const colors = {
      'Active': 'bg-green-500',
      'Expired': 'bg-red-500',
      'Pending': 'bg-yellow-500'
    };
    return (
      <div className={`w-3 h-3 rounded-full ${colors[status] || 'bg-gray-500'}`}></div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-6">
          <div className="flex items-center gap-4">
            <img
              src={post.photo_url}
              alt={post.full_name}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-900">{post.full_name}</h1>
              <p className="text-sm text-gray-500">ID: {post.member_id}</p>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={post.membership_status} />
                <span className="text-sm text-gray-600">{post.membership_status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
            <div className="text-2xl font-bold text-orange-500">{post.days_remaining}</div>
            <div className="text-xs text-gray-500 mt-1">Days Left</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{post.bmi}</div>
            <div className="text-xs text-gray-500 mt-1">BMI</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">₹{post.current_membership_paid}</div>
            <div className="text-xs text-gray-500 mt-1">Paid</div>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="px-4 mb-4">
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="font-medium text-gray-900">Contact Information</h2>
          </div>
          <div className="divide-y divide-gray-100">
            <div className="px-4 py-3 flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{post.phone}</div>
                <div className="text-xs text-gray-500">Phone</div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
            <div className="px-4 py-3 flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{post.email}</div>
                <div className="text-xs text-gray-500">Email</div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
            <div className="px-4 py-3 flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{post.address}</div>
                <div className="text-xs text-gray-500">Address</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Details */}
      <div className="px-4 mb-4">
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="font-medium text-gray-900">Personal Details</h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Age</div>
                <div className="font-medium text-gray-900">{post.age} years</div>
              </div>
              <div>
                <div className="text-gray-500">Blood Group</div>
                <div className="font-medium text-red-500">{post.blood_group}</div>
              </div>
              <div>
                <div className="text-gray-500">Height</div>
                <div className="font-medium text-gray-900">{post.height_display}</div>
              </div>
              <div>
                <div className="text-gray-500">Weight</div>
                <div className="font-medium text-gray-900">{post.weight_kg} kg</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Membership */}
      <div className="px-4 mb-4">
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="font-medium text-gray-900">Current Membership</h2>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Plan</span>
              <span className="text-sm font-medium text-gray-900">{post.current_plan_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Duration</span>
              <span className="text-sm font-medium text-gray-900">{post.current_plan_duration} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Start Date</span>
              <span className="text-sm font-medium text-gray-900">{formatDate(post.current_membership_start)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">End Date</span>
              <span className="text-sm font-medium text-gray-900">{formatDate(post.current_membership_end)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Price</span>
              <span className="text-sm font-medium text-green-600">₹{post.current_plan_price}</span>
            </div>
            {post.current_membership_notes && (
              <div className="pt-2 border-t border-gray-100">
                <div className="text-xs text-gray-500 mb-1">Notes</div>
                <div className="text-sm text-gray-700">{post.current_membership_notes}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Status */}
      <div className="px-4 mb-4">
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="font-medium text-gray-900">Payment Status</h2>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">Status</span>
              <span className="text-sm font-medium text-green-600">{post.payment_status}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Last Payment</div>
                <div className="font-medium text-gray-900">₹{post.last_payment_amount}</div>
                <div className="text-xs text-gray-400">{formatDate(post.last_payment_date)}</div>
              </div>
              <div>
                <div className="text-gray-500">Method</div>
                <div className="font-medium text-gray-900">{post.last_payment_method}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Health Notes */}
      <div className="px-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="font-medium text-gray-900">Health Notes</h2>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-700 mb-2">{post.health_notes}</p>
            <p className="text-xs text-gray-400">Last updated: {formatDate(post.health_last_updated)}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 pb-8">
        <div className="space-y-3">
          <button className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2">
            <Edit3 className="w-5 h-5" />
            Edit Member
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button className="bg-green-500 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2">
              <Plus className="w-5 h-5" />
              Add Payment
            </button>
            <button className="bg-blue-500 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Renew
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}