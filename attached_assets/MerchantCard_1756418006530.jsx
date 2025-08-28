import React from "react";
import { Building2, MapPin, User, CheckCircle, Phone, Mail } from "lucide-react";
import { motion } from "framer-motion";

export default function MerchantCard({ merchant, onSelect, isSelectable, businessIcon = '🏢' }) {
  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        minHeight: '280px',
        maxWidth: '100%',
        overflow: 'hidden'
      }}
    >
      <div style={{ flexGrow: 1 }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          justifyContent: 'space-between', 
          gap: '12px', 
          marginBottom: '1rem'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            minWidth: 0,
            flex: '1 1 auto'
          }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              background: 'var(--bg)', 
              border: '1px solid var(--divider)', 
              borderRadius: 'var(--radius-md)', 
              display: 'grid', 
              placeItems: 'center', 
              flexShrink: 0,
              fontSize: '20px'
            }}>
              {businessIcon}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <h3 style={{ 
                fontWeight: 600, 
                fontSize: 'clamp(16px, 4vw, 18px)', 
                lineHeight: 1.3,
                margin: 0,
                wordBreak: 'break-word',
                color: 'var(--text)'
              }}>
                {merchant.business_name}
              </h3>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '4px', 
                marginTop: '6px' 
              }}>
                {merchant.category && (
                  <span className="badge" style={{ fontSize: '10px' }}>
                    {merchant.category}
                  </span>
                )}
                {merchant.sub_category && (
                  <span className="badge" style={{ fontSize: '10px' }}>
                    {merchant.sub_category}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div style={{ flexShrink: 0 }}>
            {merchant.assigned_to ? (
              <span className="badge assigned" style={{ fontSize: '10px' }}>
                <CheckCircle size={12} />
                Assigned
              </span>
            ) : (
              <span className="badge available" style={{ fontSize: '10px' }}>
                <User size={12} />
                Available
              </span>
            )}
          </div>
        </div>
        
        {/* Address */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          gap: '8px',
          marginBottom: '0.75rem'
        }}>
          <MapPin size={14} style={{ 
            color: 'var(--muted)', 
            marginTop: '2px', 
            flexShrink: 0 
          }} />
          <p style={{ 
            fontSize: 'clamp(12px, 3vw, 14px)', 
            color: 'var(--muted)', 
            margin: 0, 
            lineHeight: 1.4,
            wordBreak: 'break-word'
          }}>
            {merchant.address || 'No address provided'}
          </p>
        </div>

        {/* Phone */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          marginBottom: '0.5rem'
        }}>
          <Phone size={14} style={{ 
            color: 'var(--muted)', 
            flexShrink: 0 
          }} />
          {merchant.phone ? (
            <a 
              href={`tel:${merchant.phone}`}
              style={{ 
                fontSize: 'clamp(12px, 3vw, 14px)', 
                color: 'var(--tint)', 
                textDecoration: 'none',
                wordBreak: 'break-word'
              }}
            >
              {merchant.phone}
            </a>
          ) : (
            <p style={{ fontSize: 'clamp(12px, 3vw, 14px)', color: 'var(--muted)', margin: 0 }}>
              No phone
            </p>
          )}
        </div>

        {/* Email */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          marginBottom: '1rem'
        }}>
          <Mail size={14} style={{ 
            color: 'var(--muted)', 
            flexShrink: 0 
          }} />
          {merchant.email ? (
            <a 
              href={`mailto:${merchant.email}`}
              style={{ 
                fontSize: 'clamp(12px, 3vw, 14px)', 
                color: 'var(--tint)', 
                textDecoration: 'none',
                wordBreak: 'break-all'
              }}
            >
              {merchant.email}
            </a>
          ) : (
            <p style={{ fontSize: 'clamp(12px, 3vw, 14px)', color: 'var(--muted)', margin: 0 }}>
              No email
            </p>
          )}
        </div>
      </div>
      
      <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
        {merchant.assigned_to ? (
          <div style={{ 
            paddingTop: '1rem', 
            borderTop: '1px solid var(--divider)' 
          }}>
            <p style={{
              fontSize: 'clamp(12px, 3vw, 14px)', 
              margin: 0,
              wordBreak: 'break-word'
            }}>
              <span style={{color: 'var(--muted)'}}>Assigned to: </span>
              <span style={{fontWeight: 600, color: 'var(--success)'}}>
                {merchant.assigned_to}
              </span>
            </p>
          </div>
        ) : isSelectable ? (
          <button 
            onClick={() => onSelect(merchant)}
            className="btn primary"
            style={{ 
              width: '100%',
              fontSize: 'clamp(12px, 3vw, 14px)',
              padding: '12px 16px'
            }}
          >
            Select This Merchant
          </button>
        ) : null}
      </div>
    </motion.div>
  );
}
