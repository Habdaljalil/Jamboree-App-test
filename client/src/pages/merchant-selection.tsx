import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Building2, Loader, RefreshCw } from "lucide-react";
import { type Merchant, type Volunteer } from "@shared/schema";
import SearchFilters from "@/components/search-filters";
import MerchantCard from "@/components/merchant-card";
import AssignmentModal from "@/components/assignment-modal";
import { apiRequest } from "@/lib/queryClient";

export default function MerchantSelection() {
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState("");
  const [assignmentFilter, setAssignmentFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [subCategoryFilter, setSubCategoryFilter] = useState("all");
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [visibleCount, setVisibleCount] = useState(30);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch merchants with auto-refresh
  const { data: merchants = [], isLoading: merchantsLoading, refetch: refetchMerchants } = useQuery<Merchant[]>({
    queryKey: ["/api/merchants"],
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    refetchIntervalInBackground: true,
  });

  // Fetch volunteers
  const { data: volunteers = [] } = useQuery<Volunteer[]>({
    queryKey: ["/api/volunteers"],
  });

  // Assignment mutation
  const assignMutation = useMutation({
    mutationFn: async ({ merchantName, volunteerName }: { merchantName: string; volunteerName: string }) => {
      const response = await apiRequest("POST", "/api/assignments", { merchantName, volunteerName });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/merchants"] });
      setSelectedMerchant(null);
    },
  });

  // Filter merchants based on search criteria
  const filteredMerchants = merchants.filter(merchant => {
    // Search filter
    const matchesSearch = !searchText || 
      merchant.business_name.toLowerCase().includes(searchText.toLowerCase()) ||
      merchant.category.toLowerCase().includes(searchText.toLowerCase()) ||
      merchant.sub_category.toLowerCase().includes(searchText.toLowerCase()) ||
      merchant.address.toLowerCase().includes(searchText.toLowerCase());

    // Assignment filter
    const matchesAssignment = assignmentFilter === 'all' ||
      (assignmentFilter === 'assigned' && merchant.assigned_to) ||
      (assignmentFilter === 'unassigned' && !merchant.assigned_to);

    // Category filter
    const matchesCategory = categoryFilter === 'all' || merchant.category === categoryFilter;

    // Sub-category filter
    const matchesSubCategory = subCategoryFilter === 'all' || merchant.sub_category === subCategoryFilter;

    return matchesSearch && matchesAssignment && matchesCategory && matchesSubCategory;
  });

  // Get unique categories and sub-categories
  const categories = Array.from(new Set(merchants.map(m => m.category)));
  const subCategories = categoryFilter === 'all' 
    ? Array.from(new Set(merchants.map(m => m.sub_category)))
    : Array.from(new Set(merchants.filter(m => m.category === categoryFilter).map(m => m.sub_category)));

  // Update sub-category filter when category changes
  useEffect(() => {
    if (categoryFilter !== 'all') {
      setSubCategoryFilter('all');
    }
  }, [categoryFilter]);

  const handleAssignMerchant = (merchantName: string, volunteerName: string) => {
    assignMutation.mutate({ merchantName, volunteerName });
  };

  // Manual refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetchMerchants();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const loadMoreMerchants = () => {
    setVisibleCount(prev => prev + 30);
  };

  const visibleMerchants = filteredMerchants.slice(0, visibleCount);
  const hasMore = filteredMerchants.length > visibleCount;

  return (
    <div>
      {/* Header */}
      <header className="text-center mb-8">
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Building2 size={32} className="text-primary-foreground" />
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Merchant Sponsorship Portal</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Browse and assign merchants for ad sponsorships in the Ridgewood Jamboree program.
        </p>
        
        {/* Manual Refresh Button */}
        <button 
          className="btn-secondary mt-4" 
          onClick={handleRefresh}
          disabled={isRefreshing}
          data-testid="button-refresh"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
        </button>
      </header>


      {/* Search and Filters */}
      <SearchFilters
        searchText={searchText}
        setSearchText={setSearchText}
        assignmentFilter={assignmentFilter}
        setAssignmentFilter={setAssignmentFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        categories={categories}
        subCategoryFilter={subCategoryFilter}
        setSubCategoryFilter={setSubCategoryFilter}
        subCategories={subCategories}
      />

      {/* Results Counter */}
      <div className="text-center mb-6">
        <p className="text-sm text-muted-foreground" data-testid="text-results-count">
          Showing <strong className="text-foreground">{visibleMerchants.length}</strong> of <strong className="text-foreground">{filteredMerchants.length}</strong> merchants
          ({merchants.length} total)
        </p>
      </div>

      {/* Loading State */}
      {merchantsLoading && (
        <div className="text-center py-16">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading merchants...</p>
        </div>
      )}

      {/* Merchant Grid */}
      {!merchantsLoading && (
        <div className="grid grid-responsive gap-6 mb-8" data-testid="merchant-grid">
          {visibleMerchants.map((merchant, index) => (
            <motion.div
              key={merchant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <MerchantCard 
                merchant={merchant} 
                onAssign={() => setSelectedMerchant(merchant)}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!merchantsLoading && visibleMerchants.length === 0 && (
        <div className="text-center py-16" data-testid="empty-state">
          <Building2 className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No merchants found</h3>
          <p className="text-muted-foreground">Try adjusting your search filters to see more results.</p>
        </div>
      )}

      {/* Load More Button */}
      {hasMore && !merchantsLoading && (
        <div className="text-center">
          <button 
            className="btn-apple" 
            onClick={loadMoreMerchants}
            data-testid="button-load-more"
          >
            <Building2 size={16} />
            Load More Merchants ({filteredMerchants.length - visibleCount} remaining)
          </button>
        </div>
      )}

      {/* Assignment Modal */}
      {selectedMerchant && (
        <AssignmentModal
          merchant={selectedMerchant}
          volunteers={volunteers}
          onAssign={(merchantName, volunteerName) => handleAssignMerchant(merchantName, volunteerName)}
          onClose={() => setSelectedMerchant(null)}
          isLoading={assignMutation.isPending}
        />
      )}
    </div>
  );
}
