import React, { useState, useEffect } from "react";
import { googleSheetsService } from "../Components/utils/GoogleSheetsService";
import { motion } from "framer-motion";
import { UserCheck, Search, Phone, Mail, MapPin, ChevronDown } from "lucide-react";

export default function MyAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [volunteerName, setVolunteerName] = useState("");
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredVolunteers, setFilteredVolunteers] = useState([]);

  useEffect(() => {
    loadVolunteers();
  }, []);

  useEffect(() => {
    if (volunteerName.trim() && volunteers.length > 0) {
      const filtered = volunteers.filter(v => 
        v.full_name.toLowerCase().includes(volunteerName.toLowerCase())
      ).slice(0, 5); // Limit to 5 suggestions
      setFilteredVolunteers(filtered);
      setShowSuggestions(filtered.length > 0 && volunteerName !== filtered[0]?.full_name);
    } else {
      setFilteredVolunteers([]);
      setShowSuggestions(false);
    }
  }, [volunteerName, volunteers]);

  const loadVolunteers = async () => {
    try {
      const data = await googleSheetsService.fetchVolunteers();
      setVolunteers(data);
    } catch (error) {
      console.error("Error loading volunteers:", error);
    }
  };

  const searchAssignments = async (nameToSearch = null) => {
    const searchName = nameToSearch || volunteerName.trim();
    if (!searchName) return;
    
    setLoading(true);
    setSearchPerformed(true);
    setShowSuggestions(false);
    try {
      const allMerchants = await googleSheetsService.fetchMerchants();
      const userAssignments = allMerchants.filter(m => m.assigned_to === searchName);
      setAssignments(userAssignments);
    } catch (error) {
      console.error("Error loading assignments:", error);
      setAssignments([]);
    }
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchAssignments();
    } else if (e.key === 'ArrowDown' && filteredVolunteers.length > 0) {
      e.preventDefault();
      // Focus first suggestion
      const firstSuggestion = document.querySelector('.suggestion-item');
      if (firstSuggestion) firstSuggestion.focus();
    }
  };

  const handleSuggestionClick = (name) => {
    setVolunteerName(name);
    setShowSuggestions(false);
    // Immediately search with the selected name
    searchAssignments(name);
  };

  const handleInputFocus = () => {
    if (filteredVolunteers.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicks
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div>
       <header style={{ marginBottom: 'var(--gutter)', textAlign: 'center' }}>
        <div style={{width: '60px', height: '60px', background: 'var(--tint)', borderRadius: 'var(--radius-lg)', display: 'grid', placeItems: 'center', margin: '0 auto 1rem'}}>
            <UserCheck size={32} style={{ color: 'white' }} />
        </div>
        <h1 style={{fontSize: 'var(--font-size-2xl)', color: 'var(--text)'}}>My Assigned Merchants</h1>
        <p style={{fontSize: 'var(--font-size-lg)', color: 'var(--muted)', maxWidth: '60ch', margin: '0 auto' }}>
          View all merchants assigned to you for ad sponsorship outreach.
        </p>
      </header>

      <div className="card" style={{ maxWidth: '720px', margin: '0 auto var(--gutter) auto', position: 'relative' }}>
        <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--muted)', display: 'block', marginBottom: '8px' }}>
          Enter Your Full Name
        </label>
        <div style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              className="input"
              placeholder="Type your full name..."
              value={volunteerName}
              onChange={(e) => setVolunteerName(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              autoComplete="off"
            />
            
            {showSuggestions && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: 'var(--bg-elev)',
                border: '1px solid var(--divider)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-sm)',
                zIndex: 1000,
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                {filteredVolunteers.map((volunteer, index) => (
                  <button
                    key={volunteer.id}
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(volunteer.full_name)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSuggestionClick(volunteer.full_name);
                      } else if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        const next = e.target.nextElementSibling;
                        if (next) next.focus();
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        const prev = e.target.previousElementSibling;
                        if (prev) prev.focus();
                        else document.querySelector('input').focus();
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: 'none',
                      background: 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: 'var(--font-size-md)',
                      color: 'var(--text)',
                      borderBottom: index < filteredVolunteers.length - 1 ? '1px solid var(--divider)' : 'none',
                      transition: 'background var(--dur-fast) var(--ease)'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'var(--bg)'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    {volunteer.full_name}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button 
            onClick={() => searchAssignments()}
            disabled={!volunteerName.trim() || loading}
            className="btn primary"
            style={{ flexShrink: 0 }}
          >
            {loading ? "Searching..." : "Find"}
          </button>
        </div>
        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--muted)', marginTop: '8px', marginBottom: 0 }}>
          * Enter your name exactly as it was used during assignment. Maximum 3 assignments per volunteer.
        </p>
      </div>

      <div>
          {loading && searchPerformed && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
               <p style={{ color: 'var(--muted)'}}>Searching for your assignments...</p>
            </div>
          )}

          {!loading && searchPerformed && assignments.length === 0 && (
             <div className="card" style={{borderColor: 'var(--warning)', background: 'rgba(255,159,10,0.05)', textAlign: 'center', maxWidth: '600px', margin: '0 auto'}}>
                <h4 style={{color: 'var(--warning)'}}>No Assignments Found</h4>
                <p style={{color: 'var(--muted)', margin: 0}}>No assignments found for "{volunteerName}". Please check the spelling and try again.</p>
            </div>
          )}

          {!loading && assignments.length > 0 && (
            <>
              <div style={{ textAlign: 'center', marginBottom: 'var(--gutter)' }}>
                <h2 style={{fontSize: 'var(--font-size-xl)', color: 'var(--text)'}}>
                  Your Assignments ({assignments.length}/3)
                </h2>
                <p style={{color: 'var(--muted)'}}>
                  Assigned to: <span style={{fontWeight: 600, color: 'var(--text)'}}>{volunteerName}</span>
                </p>
              </div>

              <div className="grid grid-3">
                {assignments.map((merchant, index) => (
                  <motion.div
                    key={merchant.id}
                    className="card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        background: 'var(--bg)', 
                        borderRadius: 'var(--radius-md)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '18px'
                      }}>
                        {googleSheetsService.getBusinessIcon(merchant.category, merchant.sub_category)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{fontWeight: 600, fontSize: '18px', color: 'var(--text)', margin: 0}}>
                          {merchant.business_name}
                        </h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                          {merchant.category && <span className="badge" style={{ fontSize: '10px' }}>{merchant.category}</span>}
                          {merchant.sub_category && <span className="badge" style={{ fontSize: '10px' }}>{merchant.sub_category}</span>}
                        </div>
                      </div>
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {merchant.address && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                          <MapPin size={16} style={{ color: 'var(--muted)', marginTop: '2px', flexShrink: 0 }} />
                          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--muted)', lineHeight: 1.4 }}>
                            {merchant.address}
                          </span>
                        </div>
                      )}

                      {merchant.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Phone size={16} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                          <a href={`tel:${merchant.phone}`} style={{ 
                            fontSize: 'var(--font-size-sm)', 
                            color: 'var(--tint)', 
                            textDecoration: 'none' 
                          }}>
                            {merchant.phone}
                          </a>
                        </div>
                      )}

                      {merchant.email && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Mail size={16} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                          <a href={`mailto:${merchant.email}`} style={{ 
                            fontSize: 'var(--font-size-sm)', 
                            color: 'var(--tint)', 
                            textDecoration: 'none',
                            wordBreak: 'break-all'
                          }}>
                            {merchant.email}
                          </a>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}

          {!searchPerformed && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <UserCheck style={{ width: '48px', height: '48px', color: 'var(--divider)', margin: '0 auto 1rem' }} />
              <h3 style={{fontSize: '20px', color: 'var(--text)'}}>Ready to View Your Assignments</h3>
              <p style={{ color: 'var(--muted)', maxWidth: '40ch', margin: '0 auto' }}>
                Enter your full name above to see all merchants assigned to you.
              </p>
            </div>
          )}
        </div>
    </div>
  );
}
