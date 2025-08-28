import React, { useState } from "react";
import { X, UserCheck, Check } from "lucide-react";
import { type Merchant, type Volunteer } from "@shared/schema";
import { getBusinessIcon } from "@/lib/google-sheets-service";
import { useToast } from "@/hooks/use-toast";

interface AssignmentModalProps {
  merchant: Merchant;
  volunteers: Volunteer[];
  onAssign: (merchantName: string, volunteerName: string) => void;
  onClose: () => void;
  isLoading: boolean;
}

export default function AssignmentModal({
  merchant,
  volunteers,
  onAssign,
  onClose,
  isLoading,
}: AssignmentModalProps) {
  const [selectedVolunteer, setSelectedVolunteer] = useState("");
  const { toast } = useToast();

  const handleAssign = () => {
    if (!selectedVolunteer) {
      toast({
        title: "Error",
        description: "Please select a volunteer",
        variant: "destructive",
      });
      return;
    }

    onAssign(merchant.business_name, selectedVolunteer);
    toast({
      title: "Success",
      description: `Successfully assigned ${merchant.business_name} to ${selectedVolunteer}`,
    });
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 modal-backdrop flex items-center justify-center z-50"
      onClick={handleBackdropClick}
      data-testid="assignment-modal"
    >
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-md w-full mx-4 slide-up">
        <div className="p-6 relative">
          {/* Close Button */}
          <button 
            className="absolute top-4 right-4 w-8 h-8 bg-secondary rounded-full flex items-center justify-center hover:bg-accent transition-colors" 
            onClick={onClose}
            data-testid="button-close-modal"
          >
            <X size={16} />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <UserCheck size={20} className="text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Assign Merchant</h2>
              <p className="text-sm text-muted-foreground">Select a volunteer for this merchant</p>
            </div>
          </div>

          {/* Merchant Info */}
          <div className="bg-muted rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-background rounded-md flex items-center justify-center text-lg">
                {getBusinessIcon(merchant.category, merchant.sub_category)}
              </div>
              <h3 className="font-semibold text-foreground" data-testid="text-modal-merchant-name">
                {merchant.business_name}
              </h3>
            </div>
            <div className="flex gap-2 mb-2">
              <span className="badge badge-category">{merchant.category}</span>
              <span className="badge badge-category">{merchant.sub_category}</span>
            </div>
            <p className="text-sm text-muted-foreground" data-testid="text-modal-merchant-address">
              {merchant.address}
            </p>
          </div>

          {/* Volunteer Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Select Volunteer
            </label>
            <select 
              className="input-apple" 
              value={selectedVolunteer}
              onChange={(e) => setSelectedVolunteer(e.target.value)}
              data-testid="select-volunteer"
            >
              <option value="" disabled>Choose a volunteer</option>
              {volunteers.filter(v => v.active).map(volunteer => (
                <option key={volunteer.id} value={volunteer.full_name}>
                  {volunteer.full_name}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              Note: Each volunteer can only have up to 3 merchants assigned.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <button 
              className="btn-secondary flex-1" 
              onClick={onClose}
              disabled={isLoading}
              data-testid="button-cancel-assignment"
            >
              Cancel
            </button>
            <button 
              className="btn-apple flex-1" 
              onClick={handleAssign}
              disabled={isLoading || !selectedVolunteer}
              data-testid="button-confirm-assignment"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <Check size={16} />
                  Assign Merchant
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
