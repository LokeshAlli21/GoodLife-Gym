import React, { useState } from 'react'
import {Container, Logo, LogoutBtn} from '../index'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import '@fortawesome/fontawesome-free/css/all.min.css';

function Header() {

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  const authStatus = useSelector((state) =>state.auth.status)
  const navigate = useNavigate()

  const navItems = [
    {
      name: 'Home',
      slug: '/',
      active: true
    },
    {
      name: "Login",
      slug: "/login",
      active: !authStatus,
  },
  {
      name: "Signup",
      slug: "/signup",
      active: !authStatus,
  },
  {
      name: "All Posts",
      slug: "/all-posts",
      active: authStatus,
  },
  {
      name: "Add Post",
      slug: "/add-post",
      active: authStatus,
  },
  ]
  return (
    <header className="py-3 shadow-lg bg-gray-800 text-white">
      <Container noBackground noPaddingY>
        <nav className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/">
              <Logo width="70px" logoPath={'https://img.freepik.com/free-vector/bird-colorful-logo-gradient-vector_343694-1365.jpg'} />
            </Link>
          </div>
          <ul className="hidden md:flex items-center space-x-6">
            {navItems.map((item) =>
              item.active ? (
                <li key={item.name}>
                  <button
                    className="px-4 py-2 transition duration-200 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md"
                    onClick={() => navigate(item.slug)}
                  >
                    {item.name}
                  </button>
                </li>
              ) : null
            )}
            {authStatus && (
              <li>
                <LogoutBtn />
              </li>
            )}
          </ul>
          <div className="md:hidden">
            <button className="text-white focus:outline-none" onClick={toggleMenu}>
              <i className="fas fa-bars text-gray-600 text-2xl"></i>
            </button>
          </div>
        </nav>
        {/* Mobile menu */}
        <div className={`md:hidden mt-2 transition-transform transform ${isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <ul className={`flex flex-col space-y-2 transition-all duration-300`}>
            {navItems.map((item) =>
              item.active ? (
                <li key={item.name}>
                  <button
                    className="block w-full px-4 py-2 transition duration-200 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md"
                    onClick={() => {
                      navigate(item.slug);
                      setIsMenuOpen(false); // Close menu after navigation
                    }}
                  >
                    {item.name}
                  </button>
                </li>
              ) : null
            )}
            {authStatus && (
              <li>
                <LogoutBtn />
              </li>
            )}
          </ul>
        </div>
      </Container>
    </header>
  );
}

export default Header