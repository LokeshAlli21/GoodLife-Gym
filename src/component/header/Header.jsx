import React, { useState, useEffect } from 'react';
import { Container, Logo, LogoutBtn } from '../index';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  const authStatus = useSelector((state) => state.auth.status);
  const navigate = useNavigate();

  const navItems = [
    { name: 'Home', slug: '/', active: true },
    { name: 'Classes', slug: '/classes', active: authStatus },
    { name: 'Login', slug: '/login', active: !authStatus },
    { name: 'Signup', slug: '/signup', active: !authStatus },
    { name: 'All Profiles', slug: '/all-profiles', active: authStatus },
    { name: 'Add Profile', slug: '/add-profile', active: authStatus },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 150) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`py-4 transition-all duration-300 ${isSticky ? 'fixed top-0 left-0 w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg z-50 animate-fadeIn' : 'bg-transparent'}`}
    >
      <Container noBackground noPaddingY>
        <nav className="flex items-center justify-between">
          <div className="flex items-center animate-slideIn">
            <Link to="/">
              <Logo width="70px" logoPath={'./logo.jpg'} />
            </Link>
          </div>
          <ul className="hidden md:flex items-center space-x-6">
            {navItems.map(
              (item) =>
                item.active && (
                  <li key={item.name} className="animate-fadeInNav">
                    <button
                      className="px-5 py-2 transition-all duration-300 bg-black hover:bg-white text-white hover:text-black rounded-lg shadow-lg transform hover:scale-105"
                      onClick={() => navigate(item.slug)}
                    >
                      {item.name}
                    </button>
                  </li>
                )
            )}
            {authStatus && (
              <li className="animate-fadeInNav">
                <LogoutBtn />
              </li>
            )}
          </ul>
          <div className="md:hidden">
            <button className="text-white focus:outline-none" onClick={toggleMenu}>
              <i className="fas fa-bars text-2xl"></i>
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        <div className={`md:hidden mt-2 transition-all transform ${isMenuOpen ? 'max-h-screen opacity-100 animate-slideInMenu' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <ul className="flex flex-col space-y-3 transition-all duration-300">
            {navItems.map(
              (item) =>
                item.active && (
                  <li key={item.name}>
                    <button
                      className="block w-full px-5 py-3 transition-all duration-300 bg-black hover:bg-white text-white hover:text-black rounded-lg shadow-md transform hover:scale-105"
                      onClick={() => {
                        navigate(item.slug);
                        setIsMenuOpen(false); // Close menu after navigation
                      }}
                    >
                      {item.name}
                    </button>
                  </li>
                )
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

export default Header;
