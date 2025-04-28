import React, { useEffect, useState } from 'react';
import { PostCard, Container } from '../component/index';
import userService from '../supabase/conf';
import { FaSearch } from 'react-icons/fa'; // React Icon for search

function Home() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    userService.getUsers().then((data) => {
      if (data && data.length > 0) {
        console.log(data);
        setUsers(data);
      }
    }).catch((err) => {
      console.error("Error fetching users:", err);
    });
  }, []);

  // Filter users based on searchTerm
  const filteredUsers = users.filter((user) => {
    const fullName = `${user.first_name} ${user.middle_name || ''} ${user.last_name}`.toLowerCase();
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="w-full py-0 ">
      <Container noBackground>
        {/* Search Bar */}
        <div className="mb-8 w-full flex justify-center">
          <div className="relative w-full md:w-1/2">
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              className="w-full p-4 pl-12 pr-4 border-2 border-yellow-500 rounded-lg shadow-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg placeholder-gray-500 transition-all duration-300 ease-in-out"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute top-1/2 left-3 transform -translate-y-1/2 text-yellow-500">
              <FaSearch size={20} />
            </div>
          </div>
        </div>

        {/* Display filtered users */}
        {filteredUsers.length === 0 ? (
          <div className="text-center text-gray-600 text-lg">No users found.</div>
        ) : (
          <div className="flex flex-wrap justify-center gap-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="p-2 w-full sm:w-2/3 md:w-2/5 lg:w-1/4">
                <PostCard {...user} />
              </div>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}

export default Home;
