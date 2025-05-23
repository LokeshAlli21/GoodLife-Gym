import React, { useState, useEffect } from 'react'
import { Container, Logo, LogoutBtn } from '../index'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSticky, setIsSticky] = useState(false)
  const authStatus = useSelector(state => state.auth.status)
  const navigate = useNavigate()

  const navItems = [
    { name: 'Home', slug: '/', active: true },
    { name: 'Login', slug: '/login', active: !authStatus },
    { name: 'All Profiles', slug: '/all-profiles', active: authStatus },
    { name: 'Add Profile', slug: '/add-profile', active: authStatus },
  ]

  const handleNavigation = (slug) => {
    navigate(slug)
    setIsMenuOpen(false)
  }

  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 150)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const stickyClasses = isSticky 
    ? 'fixed top-0 left-0 w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg z-50' 
    : 'bg-transparent'

  return (
    <header className={`py-3 transition-all duration-300 ${stickyClasses}`}>
      <Container noBackground noPaddingY>
        <nav className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <Logo width="60px" logoPath="../logo.jpg" />
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center space-x-4">
            {navItems.map(item => 
              item.active && (
                <li key={item.name}>
                  <button
                    className="px-4 py-2 bg-black hover:bg-white text-white hover:text-black rounded-lg transition-all duration-300 transform hover:scale-105 text-sm"
                    onClick={() => navigate(item.slug)}
                  >
                    {item.name}
                  </button>
                </li>
              )
            )}
            {authStatus && <li><LogoutBtn /></li>}
          </ul>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
              />
            </svg>
          </button>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-3 pb-3 border-t border-white/20">
            <ul className="flex flex-col space-y-2 pt-3">
              {navItems.map(item => 
                item.active && (
                  <li key={item.name}>
                    <button
                      className="w-full px-4 py-3 bg-black/80 hover:bg-white text-white hover:text-black rounded-lg transition-all duration-300 text-left"
                      onClick={() => handleNavigation(item.slug)}
                    >
                      {item.name}
                    </button>
                  </li>
                )
              )}
              {authStatus && (
                <li className="pt-2 border-t border-white/20">
                  <LogoutBtn />
                </li>
              )}
            </ul>
          </div>
        )}
      </Container>
    </header>
  )
}

export default Header