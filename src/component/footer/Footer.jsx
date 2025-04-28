import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../Logo';

function Footer() {
  return (
    <footer className="relative overflow-hidden bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap -m-6">
          {/* Logo and Copyright */}
          <div className="w-full md:w-1/2 lg:w-5/12 p-6 flex flex-col justify-between">
            <div className="mb-6">
              <Logo width="120px" logoPath={'https://img.freepik.com/free-vector/bird-colorful-logo-gradient-vector_343694-1365.jpg'} />
            </div>
            <p className="text-sm text-gray-400">
              &copy; 2024 Your Company. All rights reserved.
            </p>
          </div>

          {/* Company */}
          <div className="w-full md:w-1/2 lg:w-2/12 p-6">
            <h3 className="mb-6 text-xs font-semibold uppercase tracking-widest text-gray-400">
              Company
            </h3>
            <ul className="space-y-4">
              <li>
                <Link className="hover:text-white transition-colors" to="/">Features</Link>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" to="/">Pricing</Link>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" to="/">Affiliate Program</Link>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" to="/">Press Kit</Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="w-full md:w-1/2 lg:w-2/12 p-6">
            <h3 className="mb-6 text-xs font-semibold uppercase tracking-widest text-gray-400">
              Support
            </h3>
            <ul className="space-y-4">
              <li>
                <Link className="hover:text-white transition-colors" to="/">Account</Link>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" to="/">Help</Link>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" to="/">Contact Us</Link>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" to="/">Customer Support</Link>
              </li>
            </ul>
          </div>

          {/* Legals */}
          <div className="w-full md:w-1/2 lg:w-3/12 p-6">
            <h3 className="mb-6 text-xs font-semibold uppercase tracking-widest text-gray-400">
              Legal
            </h3>
            <ul className="space-y-4">
              <li>
                <Link className="hover:text-white transition-colors" to="/">Terms &amp; Conditions</Link>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" to="/">Privacy Policy</Link>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" to="/">Licensing</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Decorative Background */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 to-transparent opacity-60 pointer-events-none"></div>
      </div>
    </footer>
  );
}

export default Footer;
