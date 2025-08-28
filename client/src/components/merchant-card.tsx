import React from "react";
import { MapPin, Phone, Mail, CheckCircle, User, UserPlus } from "lucide-react";
import { type Merchant } from "@shared/schema";
import { getBusinessIcon } from "@/lib/google-sheets-service";

interface MerchantCardProps {
  merchant: Merchant;
  onAssign: () => void;
}

export default function MerchantCard({ merchant, onAssign }: MerchantCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 card-hover" data-testid={`merchant-card-${merchant.id}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center text-xl flex-shrink-0">
            {getBusinessIcon(merchant.category, merchant.sub_category)}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground text-lg mb-1 truncate" data-testid={`text-business-name-${merchant.id}`}>
              {merchant.business_name}
            </h3>
            <div className="flex gap-1 flex-wrap">
              {merchant.category && <span className="badge badge-category">{merchant.category}</span>}
              {merchant.sub_category && <span className="badge badge-category">{merchant.sub_category}</span>}
            </div>
          </div>
        </div>
        <div className="flex-shrink-0">
          {merchant.assigned_to ? (
            <span className="badge badge-assigned" data-testid={`badge-assigned-${merchant.id}`}>
              <CheckCircle size={12} />
              Assigned
            </span>
          ) : (
            <span className="badge badge-available" data-testid={`badge-available-${merchant.id}`}>
              <User size={12} />
              Available
            </span>
          )}
        </div>
      </div>

      {/* Contact Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-start gap-2">
          <MapPin size={16} className="text-muted-foreground mt-0.5 flex-shrink-0" />
          <span className="text-sm text-muted-foreground" data-testid={`text-address-${merchant.id}`}>
            {merchant.address || 'No address provided'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Phone size={16} className="text-muted-foreground flex-shrink-0" />
          {merchant.phone ? (
            <a 
              href={`tel:${merchant.phone}`} 
              className="text-sm text-primary hover:underline" 
              data-testid={`link-phone-${merchant.id}`}
            >
              {merchant.phone}
            </a>
          ) : (
            <span className="text-sm text-muted-foreground">No phone</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Mail size={16} className="text-muted-foreground flex-shrink-0" />
          {merchant.email ? (
            <a 
              href={`mailto:${merchant.email}`} 
              className="text-sm text-primary hover:underline truncate"
              data-testid={`link-email-${merchant.id}`}
            >
              {merchant.email}
            </a>
          ) : (
            <span className="text-sm text-muted-foreground">No email</span>
          )}
        </div>
      </div>

      {/* Footer */}
      {merchant.assigned_to ? (
        <div className="pt-4 border-t border-border">
          <p className="text-sm">
            <span className="text-muted-foreground">Assigned to: </span>
            <span className="font-semibold text-foreground" data-testid={`text-assigned-to-${merchant.id}`}>
              {merchant.assigned_to}
            </span>
          </p>
        </div>
      ) : (
        <div className="pt-4">
          <button 
            className="btn-apple w-full" 
            onClick={onAssign}
            data-testid={`button-assign-${merchant.id}`}
          >
            <UserPlus size={16} />
            Select This Merchant
          </button>
        </div>
      )}
    </div>
  );
}
