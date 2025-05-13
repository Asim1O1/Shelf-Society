import { useState } from "react";
import {
  FiChevronDown,
  FiChevronUp,
  FiFacebook,
  FiInstagram,
  FiMail,
  FiMapPin,
  FiPhone,
  FiTwitter,
} from "react-icons/fi";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // State for mobile accordions
  const [openSection, setOpenSection] = useState(null);

  // Toggle accordion on mobile
  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  // Footer navigation sections
  const footerSections = [
    {
      id: "browse",
      title: "Browse",
      links: [
        { to: "/books", label: "All Books" },
        { to: "/bestsellers", label: "Bestsellers" },
        { to: "/award-winners", label: "Award Winners" },
        { to: "/new-releases", label: "New Releases" },
        { to: "/coming-soon", label: "Coming Soon" },
        { to: "/deals", label: "Deals" },
      ],
    },
    {
      id: "account",
      title: "Account",
      links: [
        { to: "/login", label: "Login" },
        { to: "/register", label: "Register" },
        { to: "/my-orders", label: "My Orders" },
        { to: "/whitelist", label: "My Whitelist" },
        { to: "/profile", label: "My Profile" },
        { to: "/how-to-order", label: "How To Order" },
      ],
    },
  ];

  // Social media links
  const socialLinks = [
    { icon: <FiFacebook className="w-5 h-5" />, label: "Facebook", url: "#" },
    { icon: <FiTwitter className="w-5 h-5" />, label: "Twitter", url: "#" },
    { icon: <FiInstagram className="w-5 h-5" />, label: "Instagram", url: "#" },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-8">
          {/* About Column - Always visible */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <svg
                className="w-8 h-8 text-red-500"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M21 5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V22c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5V5z" />
                <path d="M3 5c1.1-.35 2.3-.5 3.5-.5 1.7 0 4.15.65 5.5 1.5V22c-1.35-.85-3.8-1.5-5.5-1.5-1.2 0-2.4.15-3.5.5V5z" />
              </svg>
              <span className="text-xl font-bold text-white">
                Shelf Society
              </span>
            </div>
            <p className="text-sm">
              A private book library store dedicated to providing quality books
              to readers of all ages and interests.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  className="text-gray-400 hover:text-white transition-colors duration-300"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Sections - Collapsible on mobile */}
          {footerSections.map((section) => (
            <div key={section.id} className="footer-section">
              {/* Section Title - Clickable on mobile */}
              <button
                className="flex items-center justify-between w-full text-left md:cursor-default"
                onClick={() => toggleSection(section.id)}
                aria-expanded={openSection === section.id}
                aria-controls={`${section.id}-content`}
              >
                <h3 className="text-lg font-semibold text-white mb-4">
                  {section.title}
                </h3>
                <span className="md:hidden">
                  {openSection === section.id ? (
                    <FiChevronUp className="w-5 h-5" />
                  ) : (
                    <FiChevronDown className="w-5 h-5" />
                  )}
                </span>
              </button>

              {/* Section Links - Collapsible on mobile */}
              <ul
                id={`${section.id}-content`}
                className={`space-y-2 text-sm transition-all duration-300 ${
                  openSection === section.id || window.innerWidth >= 768
                    ? "max-h-96 opacity-100"
                    : "max-h-0 opacity-0 md:opacity-100 md:max-h-96 overflow-hidden"
                }`}
              >
                {section.links.map((link, index) => (
                  <li key={index}>
                    <Link
                      to={link.to}
                      className="hover:text-white transition-colors inline-block py-1"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Column */}
          <div>
            <button
              className="flex items-center justify-between w-full text-left md:cursor-default"
              onClick={() => toggleSection("contact")}
              aria-expanded={openSection === "contact"}
              aria-controls="contact-content"
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                Contact Us
              </h3>
              <span className="md:hidden">
                {openSection === "contact" ? (
                  <FiChevronUp className="w-5 h-5" />
                ) : (
                  <FiChevronDown className="w-5 h-5" />
                )}
              </span>
            </button>

            <div
              id="contact-content"
              className={`transition-all duration-300 ${
                openSection === "contact" || window.innerWidth >= 768
                  ? "max-h-96 opacity-100"
                  : "max-h-0 opacity-0 md:opacity-100 md:max-h-96 overflow-hidden"
              }`}
            >
              <ul className="space-y-3 text-sm">
                <li className="flex items-start">
                  <FiMapPin
                    className="w-5 h-5 mr-3 text-red-400 flex-shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>123 Reading Lane, Bookville, BK 12345</span>
                </li>
                <li className="flex items-center">
                  <FiPhone
                    className="w-5 h-5 mr-3 text-red-400 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <a
                    href="tel:+15551234567"
                    className="hover:text-white transition-colors"
                  >
                    (555) 123-4567
                  </a>
                </li>
                <li className="flex items-center">
                  <FiMail
                    className="w-5 h-5 mr-3 text-red-400 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <a
                    href="info@shelfsociety.com"
                    className="hover:text-white transition-colors"
                  >
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
      </div>

      {/* Copyright Section */}
      <div className="bg-gray-950 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm">
            <div className="mb-4 md:mb-0 text-center md:text-left">
              <Link to="/" className="hover:text-white transition-colors">
                Shelf Society
              </Link>{" "}
              &copy; {currentYear}. All rights reserved.
            </div>
            <nav
              className="flex flex-wrap justify-center gap-y-2 gap-x-4"
              aria-label="Legal"
            >
              <Link
                to="/privacy-policy"
                className="hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms-of-service"
                className="hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
              <Link to="/faq" className="hover:text-white transition-colors">
                FAQ
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
