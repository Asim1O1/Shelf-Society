import React from "react";
import { Link } from "react-router-dom";
import { 
  FiFacebook,
  FiTwitter,
  FiInstagram,
  FiMail,
  FiPhone,
  FiMapPin
} from "react-icons/fi";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Column */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <svg
                className="w-8 h-8 text-red-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M21 5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V22c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5V5z" />
                <path d="M3 5c1.1-.35 2.3-.5 3.5-.5 1.7 0 4.15.65 5.5 1.5V22c-1.35-.85-3.8-1.5-5.5-1.5-1.2 0-2.4.15-3.5.5V5z" />
              </svg>
              <span className="text-xl font-bold text-white">Shelf Society</span>
            </div>
            <p className="mb-4 text-sm">
              A private book library store dedicated to providing quality books to readers of all ages and interests.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FiFacebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FiTwitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FiInstagram className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          {/* Browse Column */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Browse</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/books" className="hover:text-white transition-colors">
                  All Books
                </Link>
              </li>
              <li>
                <Link to="/bestsellers" className="hover:text-white transition-colors">
                  Bestsellers
                </Link>
              </li>
              <li>
                <Link to="/award-winners" className="hover:text-white transition-colors">
                  Award Winners
                </Link>
              </li>
              <li>
                <Link to="/new-releases" className="hover:text-white transition-colors">
                  New Releases
                </Link>
              </li>
              <li>
                <Link to="/coming-soon" className="hover:text-white transition-colors">
                  Coming Soon
                </Link>
              </li>
              <li>
                <Link to="/deals" className="hover:text-white transition-colors">
                  Deals
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Account Column */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Account</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Register
                </Link>
              </li>
              <li>
                <Link to="/my-orders" className="hover:text-white transition-colors">
                  My Orders
                </Link>
              </li>
              <li>
                <Link to="/whitelist" className="hover:text-white transition-colors">
                  My Whitelist
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-white transition-colors">
                  My Profile
                </Link>
              </li>
              <li>
                <Link to="/how-to-order" className="hover:text-white transition-colors">
                  How To Order
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Column */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <FiMapPin className="w-5 h-5 mr-3 text-red-400 flex-shrink-0 mt-0.5" />
                <span>123 Reading Lane, Bookville, BK 12345</span>
              </li>
              <li className="flex items-center">
                <FiPhone className="w-5 h-5 mr-3 text-red-400 flex-shrink-0" />
                <span>(555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <FiMail className="w-5 h-5 mr-3 text-red-400 flex-shrink-0" />
                <a href="mailto:info@shelfsociety.com" className="hover:text-white transition-colors">
                  info@shelfsociety.com
                </a>
              </li>
            </ul>
            <div className="mt-6">
              <h4 className="font-semibold text-white mb-2">Store Hours</h4>
              <p className="text-sm">Monday - Friday: 9AM - 9PM</p>
              <p className="text-sm">Saturday: 10AM - 8PM</p>
              <p className="text-sm">Sunday: 11AM - 6PM</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Newsletter Section */}
      <div className="border-t border-gray-800 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-semibold text-white mb-2">
                Subscribe to Our Newsletter
              </h3>
              <p className="text-sm max-w-md">
                Stay updated with new arrivals, special promotions, and reading recommendations.
              </p>
            </div>
            <div className="w-full md:w-auto">
              <form className="flex">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full md:w-64 px-4 py-2 rounded-l-lg focus:outline-none text-gray-900"
                />
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-r-lg font-medium text-white transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      {/* Copyright Section */}
      <div className="bg-gray-950 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm">
            <div className="mb-2 md:mb-0">
              <Link to="/" className="hover:text-white transition-colors">Shelf Society</Link> &copy; {currentYear}. All rights reserved.
            </div>
            <div className="flex flex-wrap justify-center space-x-4">
              <Link to="/privacy-policy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms-of-service" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link to="/faq" className="hover:text-white transition-colors">
                FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;