
import React, { useState, useEffect } from "react";
import { googleSheetsService } from "../utils/GoogleSheetsService";
import { UserCheck, X } from "lucide-react";
import { motion } from "framer-motion";

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
        padding: 'var(--gutter)'
      }}
    >
      <motion.div
        initial={{ y: 20, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="card"
        style={{
          width: '100%',
          maxWidth: '480px',
          maxHeight: '90vh',
          overflowY: 'auto',
          margin: 0,
          position: 'relative'
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default function AssignmentModal({ 
  isOpen, 
  onClose, 
  merchant, 
  onAssign,
  isAssigning 
}) {
  const [volunteers, setVolunteers] = useState([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadVolunteers();
    }
  }, [isOpen]);

  const loadVolunteers = async () => {
    setLoading(true);
    try {
      const data = await googleSheetsService.fetchVolunteers();
      setVolunteers(data);
    } catch (error) {
      console.error("Error loading volunteers:", error);
    }
    setLoading(false);
  };

  const handleAssign = () => {
    if (selectedVolunteer && merchant) {
      // Pass the entire merchant object and the selected volunteer's name
      onAssign(merchant, selectedVolunteer);
    }
  };

  if (!merchant) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div style={{ position: 'relative' }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            background: 'var(--bg-elev)',
            border: '1px solid var(--divider)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <X size={16} style={{ color: 'var(--muted)' }} />
        </button>

        <header style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem'}}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'var(--tint)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <UserCheck size={20} style={{ color: 'white' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0, color: 'var(--text)' }}>
              Assign Merchant
            </h2>
            <p style={{ color: 'var(--muted)', margin: 0, fontSize: 'var(--font-size-sm)' }}>
              Select a volunteer for this merchant
            </p>
          </div>
        </header>

        {/* Merchant Info */}
        <div className="card" style={{ marginBottom: '1.5rem', padding: '16px', background: 'var(--bg)' }}>
          <h3 style={{ fontWeight: 600, margin: '0 0 8px 0', color: 'var(--text)' }}>
            {merchant.business_name}
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
            {merchant.category && <span className="badge">{merchant.category}</span>}
            {merchant.sub_category && <span className="badge">{merchant.sub_category}</span>}
          </div>
          {merchant.address && (
            <p style={{ color: 'var(--muted)', fontSize: 'var(--font-size-sm)', margin: 0 }}>
              {merchant.address}
            </p>
          )}
        </div>
        
        <div style={{ marginBottom: '1.5rem'}}>
          <label style={{ 
            fontSize: 'var(--font-size-sm)', 
            color: 'var(--muted)', 
            display: 'block', 
            marginBottom: '8px',
            fontWeight: 600
          }}>
            Select Volunteer
          </label>
          <select 
            className="input"
            value={selectedVolunteer} 
            onChange={(e) => setSelectedVolunteer(e.target.value)}
            disabled={loading || isAssigning}
            style={{ width: '100%' }}
          >
            <option value="" disabled>
              {loading ? "Loading volunteers..." : "Choose a volunteer"}
            </option>
            {volunteers.map((volunteer) => (
              <option key={volunteer.id} value={volunteer.full_name}>
                {volunteer.full_name}
              </option>
            ))}
          </select>
        </div>
        
        <footer style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: '12px', 
          paddingTop: '1.5rem', 
          borderTop: '1px solid var(--divider)' 
        }}>
          <button 
            className="btn" 
            onClick={onClose} 
            disabled={isAssigning}
          >
            Cancel
          </button>
          <button 
            onClick={handleAssign}
            disabled={!selectedVolunteer || isAssigning}
            className="btn primary"
          >
            {isAssigning ? "Assigning..." : "Assign Merchant"}
          </button>
        </footer>
      </div>
    </Modal>
  );
}

