import React, { useEffect } from "react";
import { X, AlertTriangle, CheckCircle } from "lucide-react";
import { type Merchant } from "@shared/schema";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  merchant: Merchant;
  volunteerName: string;
  isLoading?: boolean;
}

export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  merchant, 
  volunteerName, 
  isLoading = false 
}: ConfirmationModalProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('scroll-locked');
    } else {
      document.body.classList.remove('scroll-locked');
    }
    
    return () => {
      document.body.classList.remove('scroll-locked');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4"
      onClick={onClose}
      data-testid="confirmation-modal-backdrop"
    >
      <div 
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-md slide-up"
        onClick={(e) => e.stopPropagation()}
        data-testid="confirmation-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <AlertTriangle size={20} className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Confirm Assignment
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            data-testid="button-close-confirmation"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 mb-6">
          <p className="text-muted-foreground">
            Are you sure you want to assign this merchant to{" "}
            <span className="font-semibold text-foreground">{volunteerName}</span>?
          </p>
          
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-primary flex-shrink-0" />
              <div>
                <p className="font-semibold text-foreground text-sm" data-testid="text-merchant-name">
                  {merchant.business_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {merchant.category} {merchant.sub_category && `• ${merchant.sub_category}`}
                </p>
              </div>
            </div>
            {merchant.address && (
              <p className="text-xs text-muted-foreground ml-6 address-text" data-testid="text-merchant-address">
                {merchant.address}
              </p>
            )}
          </div>

          <div className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <p><strong>Note:</strong> This action will update the Google Sheet and cannot be easily undone. The merchant will be assigned to this volunteer.</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
            data-testid="button-cancel-assignment"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            data-testid="button-confirm-assignment"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Assigning...
              </>
            ) : (
              'Confirm Assignment'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}