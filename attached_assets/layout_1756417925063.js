
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Building2, Users, BarChart3, Sun, Moon, Menu } from "lucide-react";

const navigationItems = [
  {
    title: "Merchant Selection",
    url: createPageUrl("MerchantSelection"),
    icon: Building2,
  },
  {
    title: "My Assignments",
    url: createPageUrl("MyAssignments"),
    icon: Users,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
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
    <>
      <style>
        {`
          /* Apple Design System - Updated for top navigation */
          :root {
            --font-sans: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display",
                        "Helvetica Neue", Helvetica, Arial, "Segoe UI", Roboto, system-ui, sans-serif;
            --font-size-xs: 12px;
            --font-size-sm: 14px;
            --font-size-md: 16px;
            --font-size-lg: 18px;
            --font-size-xl: clamp(28px, 4vw, 40px);
            --font-size-2xl: clamp(36px, 6vw, 56px);
            --leading-tight: 1.12;
            --leading-normal: 1.42;
            --leading-relaxed: 1.6;
            --bg: #fbfbfd;
            --bg-elev: #ffffff;
            --text: #1d1d1f;
            --muted: #6e6e73;
            --divider: rgba(0,0,0,0.08);
            --tint: #0071e3;
            --tint-press: #0062c3;
            --success: #34c759;
            --warning: #ff9f0a;
            --danger:  #ff3b30;
            --radius-sm: 8px;
            --radius-md: 14px;
            --radius-lg: 22px;
            --shadow-xs: 0 1px 2px rgba(0,0,0,0.03);
            --shadow-sm: 0 6px 18px rgba(0,0,0,0.06);
            --shadow-md: 0 12px 28px rgba(0,0,0,0.08);
            --max-w: 1200px;
            --gutter: clamp(16px, 3.5vw, 32px);
            --section-y: clamp(40px, 10vw, 120px);
            --ease: cubic-bezier(.215,.61,.355,1);
            --dur-fast: 160ms;
            --dur: 260ms;
            --dur-slow: 420ms;
            --frost: rgba(255,255,255,0.7);
            --frost-border: rgba(0,0,0,0.08);
          }

          /* Dark Mode */
          .dark {
            --bg: #000000;
            --bg-elev: #111111;
            --text: #f5f5f7;
            --muted: #a1a1a6;
            --divider: rgba(255,255,255,0.12);
            --tint: #0a84ff;
            --tint-press: #0063db;
            --frost: rgba(30,30,32,0.7);
            --frost-border: rgba(255,255,255,0.08);
            --shadow-xs: 0 1px 2px rgba(0,0,0,0.4);
            --shadow-sm: 0 10px 24px rgba(0,0,0,0.45);
            --shadow-md: 0 20px 40px rgba(0,0,0,0.5);
          }

          html, body { 
            background: var(--bg); 
            color: var(--text); 
            font-family: var(--font-sans); 
            font-size: var(--font-size-md); 
            line-height: var(--leading-normal); 
            -webkit-font-smoothing: antialiased; 
            -moz-osx-font-smoothing: grayscale; 
            margin: 0;
            padding: 0;
          }
          
          a { 
            color: var(--tint); 
            text-decoration: none; 
            transition: color var(--dur) var(--ease); 
          }
          a:hover { color: var(--tint-press); }
          
          p { margin: 0 0 1rem; color: var(--text); }
          .small, small { font-size: var(--font-size-sm); color: var(--muted); }
          
          h1, h2, h3, h4 { 
            margin: 0 0 .5rem; 
            font-weight: 700; 
            letter-spacing: -0.02em; 
            line-height: var(--leading-tight);
            color: var(--text);
          }
          h1 { font-size: var(--font-size-2xl); }
          h2 { font-size: var(--font-size-xl); }
          h3 { font-size: 22px; }
          h4 { font-size: 18px; font-weight: 600; }
          
          .container { 
            width: min(100% - 2*var(--gutter), var(--max-w)); 
            margin-inline: auto; 
          }
          
          .grid { 
            display: grid; 
            gap: clamp(16px, 3vw, 24px); 
          }
          .grid-3 { 
            grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr)); 
          }
          
          .btn { 
            appearance: none; 
            border: 1px solid var(--divider); 
            background: var(--bg-elev); 
            color: var(--text); 
            padding: 10px 18px; 
            border-radius: 999px; 
            font-weight: 600; 
            font-size: var(--font-size-sm); 
            transition: transform var(--dur-fast) var(--ease), box-shadow var(--dur) var(--ease), background var(--dur) var(--ease); 
            box-shadow: var(--shadow-xs); 
            cursor: pointer; 
            display: inline-flex; 
            align-items: center; 
            justify-content: center; 
            gap: 8px; 
            white-space: nowrap;
          }
          .btn:hover { transform: translateY(-1px); box-shadow: var(--shadow-sm); }
          .btn:active { transform: translateY(0); }
          .btn.primary { background: var(--tint); color: #fff; border-color: transparent; }
          .btn.primary:hover { background: var(--tint-press); }
          
          .card { 
            background: var(--bg-elev); 
            border: 1px solid var(--divider); 
            border-radius: var(--radius-lg); 
            padding: clamp(16px, 4vw, 24px); 
            box-shadow: var(--shadow-xs); 
            transition: transform var(--dur) var(--ease), box-shadow var(--dur) var(--ease); 
            width: 100%;
            box-sizing: border-box;
          }
          .card:hover { transform: translateY(-2px); box-shadow: var(--shadow-sm); }
          
          .input, select { 
            width: 100%; 
            background: var(--bg-elev); 
            color: var(--text); 
            border: 1px solid var(--divider); 
            padding: 12px 14px; 
            border-radius: 12px; 
            outline: none; 
            transition: border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease); 
            font-size: var(--font-size-md);
            box-sizing: border-box;
          }
          .input:focus, select:focus { 
            border-color: rgba(0,113,227,0.35); 
            box-shadow: 0 0 0 4px rgba(0,113,227,0.12); 
          }
          
          .badge { 
            display: inline-flex; 
            align-items: center; 
            gap: 6px; 
            padding: 4px 12px; 
            font-size: var(--font-size-xs); 
            font-weight: 600; 
            border-radius: 999px; 
            border: 1px solid var(--divider); 
            background: var(--bg); 
            color: var(--muted); 
          }
          .badge.available { 
            color: var(--tint); 
            border-color: rgba(0,113,227,0.25); 
            background-color: rgba(0,113,227,0.05); 
          }
          .badge.assigned { 
            color: var(--success); 
            border-color: rgba(52,199,89,0.25); 
            background-color: rgba(52,199,89,0.05); 
          }

          /* Top Navigation */
          .top-nav {
            position: sticky;
            top: 0;
            z-index: 50;
            backdrop-filter: saturate(180%) blur(20px);
            background: var(--frost);
            border-bottom: 1px solid var(--frost-border);
          }
          
          .top-nav-inner {
            max-width: var(--max-w);
            margin: 0 auto;
            padding: 0 var(--gutter);
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          
          .nav-brand {
            font-size: 18px;
            font-weight: 700;
            letter-spacing: -0.02em;
            color: var(--text);
          }
          
          .nav-menu {
            display: flex;
            gap: 18px;
            align-items: center;
          }
          
          .nav-menu a {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            border-radius: var(--radius-sm);
            font-size: var(--font-size-sm);
            font-weight: 500;
            color: var(--text);
            transition: background .2s ease, color .2s ease;
          }
          
          .nav-menu a:hover {
            background: var(--bg);
          }
          
          .nav-menu a.active {
            background: var(--tint);
            color: white;
          }
          
          .nav-menu a.active:hover {
            background: var(--tint-press);
          }
          
          .theme-toggle {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 12px;
            border-radius: 999px;
            background: var(--bg);
            border: 1px solid var(--divider);
            cursor: pointer;
            transition: all var(--dur) var(--ease);
          }
          
          .theme-toggle:hover {
            background: var(--bg-elev);
            box-shadow: var(--shadow-xs);
          }
          
          .mobile-menu-btn {
            display: none;
            background: transparent;
            border: none;
            color: var(--text);
            cursor: pointer;
          }
          
          .mobile-menu {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: var(--bg-elev);
            border-bottom: 1px solid var(--divider);
            padding: var(--gutter);
          }
          
          .mobile-menu.open {
            display: block;
          }
          
          .mobile-menu a {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 0;
            border-bottom: 1px solid var(--divider);
            font-size: var(--font-size-md);
            font-weight: 500;
            color: var(--text);
          }
          
          .mobile-menu a:last-child {
            border-bottom: none;
          }
          
          .mobile-menu a.active {
            color: var(--tint);
          }
          
          .main-content {
            padding: var(--gutter);
            max-width: var(--max-w);
            margin: 0 auto;
            width: 100%;
            box-sizing: border-box;
          }
          
          @media (max-width: 768px) {
            .nav-menu {
              display: none;
            }
            
            .mobile-menu-btn {
              display: block;
            }
            
            .grid-3 {
              grid-template-columns: 1fr;
            }
            
            .card {
              padding: 16px;
            }
            
            h1 {
              font-size: clamp(24px, 8vw, 36px);
            }
            
            h2 {
              font-size: clamp(20px, 6vw, 28px);
            }
          }
        `}
      </style>
      
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <nav className="top-nav">
          <div className="top-nav-inner">
            <div className="nav-brand">Ridgewood Jamboree</div>
            
            <div className="nav-menu">
              {navigationItems.map((item) => (
                <Link 
                  to={item.url} 
                  key={item.title}
                  className={location.pathname === item.url ? 'active' : ''}
                >
                  <item.icon size={16} />
                  <span>{item.title}</span>
                </Link>
              ))}
              
              <div className="theme-toggle" onClick={toggleTheme}>
                {isDarkMode ? <Moon size={16} /> : <Sun size={16} />}
                <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>
                  {isDarkMode ? 'Dark' : 'Light'}
                </span>
              </div>
            </div>
            
            <button 
              className="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu size={24} />
            </button>
          </div>
          
          <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
            {navigationItems.map((item) => (
              <Link 
                to={item.url} 
                key={item.title}
                className={location.pathname === item.url ? 'active' : ''}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon size={20} />
                <span>{item.title}</span>
              </Link>
            ))}
            
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                padding: '12px 0',
                cursor: 'pointer' 
              }}
              onClick={toggleTheme}
            >
              {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
              <span>Switch to {isDarkMode ? 'Light' : 'Dark'} Mode</span>
            </div>
          </div>
        </nav>
        
        <main className="main-content">
          {children}
        </main>
      </div>
    </>
  );
}

