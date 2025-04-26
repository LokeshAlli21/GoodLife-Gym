import React from 'react';
import { Link } from 'react-router-dom';
import { FaPhoneAlt, FaEnvelope, FaWeight, FaRulerVertical, FaUserAlt } from 'react-icons/fa';

function PostCard({
  id,
  first_name,
  middle_name,
  last_name,
  email,
  phone,
  height_feet,
  height_inches,
  weight_kg,
  photo_url,
}) {
  const fullName = [first_name, middle_name, last_name].filter(Boolean).join(' ');
  const initials = first_name?.charAt(0).toUpperCase() + (last_name?.charAt(0).toUpperCase() || '');

  return (
    <Link to={`/user/${id}`} className="block">
      <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
        
        {/* Top Section - Profile Image and Name */}
        <div className="flex flex-col items-center justify-center bg-yellow-400 py-6">
          {photo_url ? (
            <img
              src={photo_url}
              alt={fullName}
              className="h-28 w-28 rounded-full object-cover border-4 border-white shadow-md"
            />
          ) : (
            <div className="h-28 w-28 rounded-full bg-white flex items-center justify-center text-4xl font-bold text-yellow-500 border-4 border-white">
              {initials}
            </div>
          )}
          <h2 className="mt-4 text-2xl font-bold text-gray-900">{fullName}</h2>
          <p className="text-gray-700 text-sm flex items-center gap-2 mt-1">
            <FaEnvelope className="text-gray-600" /> {email}
          </p>
          <p className="text-gray-700 text-sm flex items-center gap-2 mt-1">
            <FaPhoneAlt className="text-gray-600" /> {phone}
          </p>
        </div>

        {/* Divider */}
        <div className="h-1 bg-orange-400"></div>

        {/* Details Section - Height and Weight */}
        <div className="flex flex-col gap-4 p-6 bg-gray-50">
          <div className="flex items-center gap-4">
            <FaRulerVertical className="text-orange-500 text-2xl" />
            <div>
              <p className="text-gray-600 text-sm font-semibold">Height</p>
              <p className="text-gray-900 font-bold text-lg">{height_feet}'{height_inches}"</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <FaWeight className="text-orange-500 text-2xl" />
            <div>
              <p className="text-gray-600 text-sm font-semibold">Weight</p>
              <p className="text-gray-900 font-bold text-lg">{weight_kg} kg</p>
            </div>
          </div>
        </div>

      </div>
    </Link>
  );
}

export default PostCard;
