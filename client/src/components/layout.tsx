import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Building2, UserCheck, Sun, Moon, Menu } from "lucide-react";

const navigationItems = [
  {
    title: "Merchant Selection",
    url: "/merchant-selection",
    icon: Building2,
  },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (theme === "dark" || (!theme && prefersDark)) {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDarkMode(false);
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    setIsDarkMode(newMode);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="nav-glass sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-foreground">Ridgewood Jamboree</h1>
            </div>

            {/* Desktop Navigation */}
            <div className="desktop-nav items-center space-x-8">
              {navigationItems.map((item) => (
                <Link 
                  to={item.url} 
                  key={item.title}
                  className={`nav-link ${location === item.url ? 'active' : ''}`}
                  data-testid={`nav-${item.title.toLowerCase().replace(' ', '-')}`}
                >
                  <item.icon size={16} />
                  <span>{item.title}</span>
                </Link>
              ))}
              
              <button 
                className="theme-toggle" 
                onClick={toggleTheme}
                data-testid="button-theme-toggle"
              >
                {isDarkMode ? <Moon size={16} /> : <Sun size={16} />}
                <span className="text-xs font-semibold">
                  {isDarkMode ? 'Dark' : 'Light'}
                </span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="mobile-menu md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              <Menu size={24} />
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden pb-4">
              <div className="space-y-2">
                {navigationItems.map((item) => (
                  <Link 
                    to={item.url} 
                    key={item.title}
                    className={`nav-link block ${location === item.url ? 'active' : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    data-testid={`mobile-nav-${item.title.toLowerCase().replace(' ', '-')}`}
                  >
                    <item.icon size={20} />
                    <span>{item.title}</span>
                  </Link>
                ))}
                
                <button 
                  className="theme-toggle w-full justify-start"
                  onClick={toggleTheme}
                  data-testid="button-mobile-theme-toggle"
                >
                  {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                  <span>Switch to {isDarkMode ? 'Light' : 'Dark'} Mode</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
