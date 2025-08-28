import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { UserCheck } from "lucide-react";
import { type Merchant, type Volunteer } from "@shared/schema";
import MerchantCard from "@/components/merchant-card";

export default function MyAssignments() {
  const [volunteerName, setVolunteerName] = useState("");
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredVolunteers, setFilteredVolunteers] = useState<Volunteer[]>([]);

  // Fetch volunteers for autocomplete
  const { data: volunteers = [] } = useQuery<Volunteer[]>({
    queryKey: ["/api/volunteers"],
  });

  // Fetch assignments for the selected volunteer
  const { data: assignments = [], isLoading, refetch } = useQuery<Merchant[]>({
    queryKey: ["/api/assignments", volunteerName],
    enabled: !!volunteerName.trim() && searchPerformed, // Auto-fetch when volunteer name is entered
    refetchInterval: searchPerformed ? 30000 : false, // Auto-refresh every 30 seconds when search is performed
  });

  // Update filtered volunteers for autocomplete and auto-search
  useEffect(() => {
    if (volunteerName.trim() && volunteers.length > 0) {
      const filtered = volunteers.filter(v => 
        v.full_name.toLowerCase().includes(volunteerName.toLowerCase())
      ).slice(0, 5);
      setFilteredVolunteers(filtered);
      setShowSuggestions(filtered.length > 0 && volunteerName !== filtered[0]?.full_name);
      
      // Auto-search if exact match is found
      const exactMatch = volunteers.find(v => 
        v.full_name.toLowerCase() === volunteerName.toLowerCase()
      );
      if (exactMatch && !searchPerformed) {
        searchAssignments(exactMatch.full_name);
      }
    } else {
      setFilteredVolunteers([]);
      setShowSuggestions(false);
    }
  }, [volunteerName, volunteers, searchPerformed]);

  const searchAssignments = async (nameToSearch?: string) => {
    const searchName = nameToSearch || volunteerName.trim();
    if (!searchName) return;
    
    setVolunteerName(searchName);
    setSearchPerformed(true);
    setShowSuggestions(false);
    refetch();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchAssignments();
    } else if (e.key === 'ArrowDown' && filteredVolunteers.length > 0) {
      e.preventDefault();
      const firstSuggestion = document.querySelector('.suggestion-item') as HTMLElement;
      if (firstSuggestion) firstSuggestion.focus();
    }
  };

  const handleSuggestionClick = (name: string) => {
    setVolunteerName(name);
    setShowSuggestions(false);
    searchAssignments(name);
  };

  const handleInputFocus = () => {
    if (filteredVolunteers.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div>
      {/* Header */}
      <header className="text-center mb-8">
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
          <UserCheck size={32} className="text-primary-foreground" />
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-2">My Assigned Merchants</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          View all merchants assigned to you for ad sponsorship outreach.
        </p>
      </header>

      {/* Search Form */}
      <div className="bg-card border border-border rounded-lg p-6 mb-6 max-w-2xl mx-auto">
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Enter Your Full Name
        </label>
        <div className="flex gap-4 relative">
          <div className="flex-1 relative">
            <input
              type="text"
              className="input-apple"
              placeholder="Type your full name..."
              value={volunteerName}
              onChange={(e) => setVolunteerName(e.target.value)}
              onKeyDown={handleKeyPress}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              autoComplete="off"
              data-testid="input-volunteer-name"
            />
            
            {/* Suggestions Dropdown */}
            {showSuggestions && (
              <div className="suggestions" data-testid="volunteer-suggestions">
                {filteredVolunteers.map((volunteer, index) => (
                  <button
                    key={volunteer.id}
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(volunteer.full_name)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSuggestionClick(volunteer.full_name);
                      } else if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        const next = e.currentTarget.nextElementSibling as HTMLElement;
                        if (next) next.focus();
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        const prev = e.currentTarget.previousElementSibling as HTMLElement;
                        if (prev) prev.focus();
                        else (document.querySelector('[data-testid="input-volunteer-name"]') as HTMLElement)?.focus();
                      }
                    }}
                    data-testid={`suggestion-${volunteer.id}`}
                  >
                    {volunteer.full_name}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button 
            onClick={() => searchAssignments()}
            disabled={!volunteerName.trim() || isLoading}
            className="btn-apple flex-shrink-0"
            data-testid="button-search-assignments"
          >
            {isLoading ? "Searching..." : "Find"}
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 mb-0">
          * Enter your name exactly as it was used during assignment. Maximum 3 assignments per volunteer.
        </p>
      </div>

      {/* Loading State */}
      {isLoading && searchPerformed && (
        <div className="text-center py-16" data-testid="loading-assignments">
          <p className="text-muted-foreground">Searching for your assignments...</p>
        </div>
      )}

      {/* No Assignments Found */}
      {!isLoading && searchPerformed && assignments.length === 0 && (
        <div 
          className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center max-w-2xl mx-auto"
          data-testid="no-assignments"
        >
          <h4 className="text-destructive font-semibold mb-2">No Assignments Found</h4>
          <p className="text-muted-foreground">No assignments found for "{volunteerName}". Please check the spelling and try again.</p>
        </div>
      )}

      {/* Assignment Results */}
      {!isLoading && assignments.length > 0 && (
        <>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="text-assignments-count">
              Your Assignments ({assignments.length}/3)
            </h2>
            <p className="text-muted-foreground">
              Assigned to: <span className="font-semibold text-foreground" data-testid="text-volunteer-name">{volunteerName}</span>
            </p>
          </div>

          <div className="grid grid-responsive gap-6" data-testid="assignments-grid">
            {assignments.map((merchant, index) => (
              <motion.div
                key={merchant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <MerchantCard 
                  merchant={merchant} 
                  onAssign={() => {}} // No assignment button for assigned merchants
                />
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Initial State */}
      {!searchPerformed && (
        <div className="text-center py-16" data-testid="initial-state">
          <UserCheck className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">Ready to View Your Assignments</h3>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Enter your full name above to see all merchants assigned to you.
          </p>
        </div>
      )}
    </div>
  );
}
