import { Link } from "react-router-dom";
import logo from "../../assets/logo.svg";
import { Linkedin, Twitter } from "lucide-react";

const footerLinks = {
  product: {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How It Works", href: "#how-it-works" },
      { label: "Pricing", href: "#pricing" },
      { label: "Demo", href: "#demo" },
    ],
  },
  company: {
    title: "Company",
    links: [
      { label: "About Us", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact Us", href: "#final-cta" },
      { label: "Blog", href: "#" },
    ],
  },
  resources: {
    title: "Resources",
    links: [
      { label: "Case Studies", href: "#case-studies" },
      { label: "FAQ", href: "#faq" },
      { label: "Documentation", href: "#" },
      { label: "API Reference", href: "#" },
    ],
  },
  legal: {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Security", href: "#" },
      { label: "Cookie Policy", href: "#" },
    ],
  },
};

const Footer = () => {
  const scrollToSection = (href: string) => {
    if (href.startsWith("#") && href.length > 1) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <footer className="bg-landing-bg-section border-t border-landing-border">
      <div className="landing-container">
        {/* Main footer content */}
        <div className="py-16 grid grid-cols-2 md:grid-cols-6 gap-8 md:gap-12">
          {/* Brand column */}
          <div className="col-span-2">
            <Link to="/" className="inline-block mb-5">
              <img src={logo} alt="Accordo AI" className="h-14" />
            </Link>
            <p className="text-sm text-landing-text-secondary leading-relaxed mb-6 max-w-xs font-Inter">
              The leading AI-powered platform for enterprise procurement
              negotiations. Automating thousands of vendor negotiations to find
              better deals for both sides.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-3">
              <a
                href="https://www.linkedin.com/company/accordo-ai/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white border border-landing-border flex items-center justify-center text-landing-text-muted hover:text-primary-500 hover:border-primary-200 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-white border border-landing-border flex items-center justify-center text-landing-text-muted hover:text-primary-500 hover:border-primary-200 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold text-landing-text mb-4">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => scrollToSection(link.href)}
                      className="text-sm text-landing-text-muted hover:text-primary-500 transition-colors font-Inter"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-landing-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-landing-text-muted font-Inter">
            &copy; {new Date().getFullYear()} Accordo AI. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <button className="text-sm text-landing-text-muted hover:text-landing-text-secondary transition-colors font-Inter">
              Privacy
            </button>
            <button className="text-sm text-landing-text-muted hover:text-landing-text-secondary transition-colors font-Inter">
              Terms
            </button>
            <button className="text-sm text-landing-text-muted hover:text-landing-text-secondary transition-colors font-Inter">
              Cookies
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
