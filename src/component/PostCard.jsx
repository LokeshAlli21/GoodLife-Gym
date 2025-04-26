import React from 'react';
import { Link } from 'react-router-dom';

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
      <div className="w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
        {/* Profile Image & Name Section */}
        <div className="flex items-center gap-6 p-6 bg-yellow-500">
          {photo_url ? (
            <img
              src={photo_url}
              alt={fullName}
              className="h-20 w-20 rounded-full object-cover border-4 border-orange-500 shadow-lg"
            />
          ) : (
            <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-orange-500 border-4 border-orange-500">
              {initials}
            </div>
          )}
          <div className="flex flex-col justify-center">
            <h2 className="text-2xl font-semibold text-gray-900 hover:text-orange-500 transition-all">
              {fullName}
            </h2>
            <p className="text-sm text-gray-700">{email}</p>
            <p className="text-sm text-gray-700">{phone}</p>
          </div>
        </div>

        {/* Additional Info Section (Height & Weight) */}
        <div className="bg-black px-6 py-4 text-sm text-white flex justify-between items-center border-t border-gray-300">
          <span className="flex items-center text-yellow-500">
            <strong className="font-medium">Height:</strong> {height_feet}'{height_inches}"
          </span>
          <span className="flex items-center text-yellow-500">
            <strong className="font-medium">Weight:</strong> {weight_kg} kg
          </span>
        </div>
      </div>
    </Link>
  );
}

export default PostCard;
