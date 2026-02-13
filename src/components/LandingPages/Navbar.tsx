import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.svg";
import { Menu, X, ChevronDown } from "lucide-react";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    {
      label: "Product",
      href: "#features",
      dropdown: [
        { label: "Features", href: "#features" },
        { label: "How It Works", href: "#how-it-works" },
        { label: "Demo", href: "#demo" },
      ],
    },
    { label: "Solutions", href: "#why-us" },
    { label: "Pricing", href: "#pricing" },
    {
      label: "Resources",
      href: "#",
      dropdown: [
        { label: "Case Studies", href: "#case-studies" },
        { label: "FAQ", href: "#faq" },
      ],
    },
  ];

  const scrollToSection = (href: string) => {
    if (href.startsWith("#")) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  };

  // Inline styles only for nav container background/shadow/border
  const navContainerStyle: React.CSSProperties = scrolled
    ? {
        background: '#FFFFFF',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        borderBottom: '1px solid #E2E8F0',
      }
    : {
        background: 'rgba(11, 15, 23, 0.35)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "nav-scrolled" : ""
      }`}
      style={navContainerStyle}
    >
      <div className="landing-container">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <img
              src={logo}
              className={`h-16 transition-all duration-300 ${
                scrolled ? "" : "brightness-0 invert"
              }`}
              alt="Accordo AI"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() =>
                  link.dropdown && setActiveDropdown(link.label)
                }
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  onClick={() => scrollToSection(link.href)}
                  className="nav-link flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg"
                >
                  {link.label}
                  {link.dropdown && <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {/* Dropdown */}
                {link.dropdown && activeDropdown === link.label && (
                  <div className="absolute top-full left-0 pt-2 w-48">
                    <div
                      className="rounded-xl shadow-lg overflow-hidden py-1"
                      style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}
                    >
                      {link.dropdown.map((item) => (
                        <button
                          key={item.label}
                          onClick={() => scrollToSection(item.href)}
                          className="nav-dropdown-item block w-full text-left px-4 py-2.5 text-sm"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/auth"
              className="nav-link text-sm font-medium px-4 py-2 rounded-lg"
            >
              Sign In
            </Link>
            <button
              onClick={() => scrollToSection("#final-cta")}
              className="btn-primary text-sm !py-2.5 !px-6"
            >
              Request a Demo
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="nav-link lg:hidden p-2 rounded-lg"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden transition-all duration-300 overflow-hidden ${
          mobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div
          className="shadow-lg"
          style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid #E2E8F0' }}
        >
          <div className="landing-container py-4 space-y-1">
            {navLinks.map((link) => (
              <div key={link.label}>
                <button
                  onClick={() => {
                    if (link.dropdown) {
                      setActiveDropdown(
                        activeDropdown === link.label ? null : link.label
                      );
                    } else {
                      scrollToSection(link.href);
                    }
                  }}
                  className="nav-mobile-link flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-lg"
                >
                  {link.label}
                  {link.dropdown && (
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        activeDropdown === link.label ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>
                {link.dropdown && activeDropdown === link.label && (
                  <div className="ml-4 space-y-1 mt-1">
                    {link.dropdown.map((item) => (
                      <button
                        key={item.label}
                        onClick={() => scrollToSection(item.href)}
                        className="nav-mobile-sublink block w-full text-left px-4 py-2.5 text-sm rounded-lg"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-4 space-y-2 px-4" style={{ borderTop: '1px solid #E2E8F0' }}>
              <Link
                to="/auth"
                className="nav-mobile-link block text-center py-2.5 text-sm font-medium"
              >
                Sign In
              </Link>
              <button
                onClick={() => scrollToSection("#final-cta")}
                className="btn-primary w-full text-sm !py-2.5"
              >
                Request a Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
