
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Building2,
  Loader,
  RefreshCw,
  LayoutGrid,
  Table2,
} from "lucide-react";

import { type Merchant, type Volunteer } from "@shared/schema";
import SearchFilters from "@/components/search-filters";
import MerchantCard from "@/components/merchant-card";
import AssignmentModal from "@/components/assignment-modal";
import { apiRequest } from "@/lib/queryClient";

type ViewMode = "grid" | "table";

export default function MerchantSelection() {
  const queryClient = useQueryClient();

  const [searchText, setSearchText] = useState("");
  const [assignmentFilter, setAssignmentFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [visibleCount, setVisibleCount] = useState(30);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Fetch merchants with auto-refresh
  const {
    data: merchants = [],
    isLoading: merchantsLoading,
    refetch: refetchMerchants,
  } = useQuery<Merchant[]>({
    queryKey: ["/api/merchants"],
    refetchInterval: 30000,
    refetchIntervalInBackground: true,
  });

  // Fetch volunteers
  const { data: volunteers = [] } = useQuery<Volunteer[]>({
    queryKey: ["/api/volunteers"],
  });

  // Assignment mutation
  const assignMutation = useMutation({
    mutationFn: async ({
      merchantName,
      volunteerName,
    }: {
      merchantName: string;
      volunteerName: string;
    }) => {
      const response = await apiRequest(
        "POST",
        "/api/assignments",
        { merchantName, volunteerName }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Assignment failed");
      }

      return response.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/merchants"] });
      setSelectedMerchant(null);
    },

    onError: (error) => {
      console.error("Assignment failed:", error);
    },
  });

  // Filter merchants
  const filteredMerchants = merchants.filter((merchant) => {
    const search = searchText.toLowerCase();

    const matchesSearch =
      !searchText ||
      merchant.business_name.toLowerCase().includes(search) ||
      merchant.category.toLowerCase().includes(search) ||
      merchant.sub_category.toLowerCase().includes(search) ||
      merchant.address.toLowerCase().includes(search);

    const matchesAssignment =
      assignmentFilter === "all" ||
      (assignmentFilter === "assigned" && merchant.assigned_to) ||
      (assignmentFilter === "unassigned" && !merchant.assigned_to);

    const matchesCategory =
      categoryFilter === "all" ||
      merchant.category === categoryFilter;

    return matchesSearch && matchesAssignment && matchesCategory;
  });

  // Get unique categories
  const categories = Array.from(
    new Set(
      merchants
        .map((merchant) => merchant.category)
        .filter((category) => category && category.trim() !== "")
        .sort()
    )
  );

  // Handle assignment
  const handleAssignMerchant = async (
    merchantName: string,
    volunteerName: string
  ) => {
    return new Promise((resolve, reject) => {
      assignMutation.mutate(
        { merchantName, volunteerName },
        {
          onSuccess: (data) => resolve(data),
          onError: (error) => reject(error),
        }
      );
    });
  };

  // Manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetchMerchants();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const loadMoreMerchants = () => {
    setVisibleCount((prev) => prev + 30);
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

        <h1 className="text-4xl font-bold text-foreground mb-2">
          Merchant Signup
        </h1>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Browse and assign merchants for ad sponsorships in the Ridgewood
          Jamboree program.
        </p>

        <button
          className="btn-secondary mt-4"
          onClick={handleRefresh}
          disabled={isRefreshing}
          data-testid="button-refresh"
        >
          <RefreshCw
            className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          <span>{isRefreshing ? "Refreshing..." : "Refresh Data"}</span>
        </button>
      </header>

      {/* Search and Filters */}
      <div className="max-w-none mb-6">
        <SearchFilters
          searchText={searchText}
          setSearchText={setSearchText}
          assignmentFilter={assignmentFilter}
          setAssignmentFilter={setAssignmentFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          categories={categories}
        />
      </div>

      {/* Results Counter and View Toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <p
          className="text-sm text-muted-foreground"
          data-testid="text-results-count"
        >
          Showing{" "}
          <strong className="text-foreground">
            {visibleMerchants.length}
          </strong>{" "}
          of{" "}
          <strong className="text-foreground">
            {filteredMerchants.length}
          </strong>{" "}
          merchants ({merchants.length} total)
        </p>

        {/* View Toggle */}
        <div
          className="inline-flex items-center rounded-lg border border-border bg-muted p-1"
          role="group"
          aria-label="Merchant view"
        >
          <button
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === "grid"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            aria-pressed={viewMode === "grid"}
            data-testid="button-grid-view"
          >
            <LayoutGrid size={16} />
            Grid
          </button>

          <button
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === "table"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            aria-pressed={viewMode === "table"}
            data-testid="button-table-view"
          >
            <Table2 size={16} />
            Table
          </button>
        </div>
      </div>

      {/* Loading State */}
      {merchantsLoading && (
        <div className="text-center py-16">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading merchants...</p>
        </div>
      )}

      {/* Merchant Grid */}
      {!merchantsLoading && viewMode === "grid" && (
        <div
          className="grid grid-responsive gap-6 mb-8"
          data-testid="merchant-grid"
        >
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

      {/* Merchant Table */}
      {!merchantsLoading && viewMode === "table" && (
        <div
          className="w-full overflow-x-auto rounded-xl border border-border mb-8"
          data-testid="merchant-table"
        >


<table className="w-full text-sm text-left">
  <thead className="bg-muted/70 text-muted-foreground">
    <tr>
      {[
        "Business Name",
        "Category",
        "Address",
        "Contact Information",
        "Previous Year Information",
      ].map((heading) => (
        <th
          key={heading}
          className="px-4 py-3 font-semibold whitespace-nowrap"
        >
          {heading}
        </th>
      ))}
    </tr>
  </thead>

  <tbody className="divide-y divide-border">
    {visibleMerchants.map((merchant) => (
      <tr
        key={merchant.id}
        className="hover:bg-muted/40 transition-colors"
      >
        {/* Business Name + Assignment */}
        <td className="px-4 py-3 min-w-56">
          <div className="space-y-2">
            <div className="font-medium text-foreground">
              {merchant.business_name || "—"}
            </div>

            {merchant.assigned_to ? (
              <div className="text-sm text-muted-foreground">
  Assigned to:
  <div className="font-medium text-foreground">
    {merchant.assigned_to}
  </div>
</div>
            ) : (
              <button
                className="btn-apple whitespace-nowrap"
                onClick={() => setSelectedMerchant(merchant)}
                data-testid={`button-assign-${merchant.id}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="inline-block mr-2"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" x2="19" y1="8" y2="14" />
                  <line x1="22" x2="16" y1="11" y2="11" />
                </svg>
                Select This Merchant
              </button>
            )}
          </div>
        </td>

        <td className="px-4 py-3">
          {merchant.category || "—"}
        </td>

        <td className="px-4 py-3 min-w-48">
          {merchant.address || "—"}
        </td>

        {/* Contact Information */}
        <td className="px-4 py-3 min-w-48">
          <div className="space-y-1">
            <div>{merchant.contact_person || "—"}</div>
            <div className="text-muted-foreground">
              {merchant.phone || "—"}
            </div>
            <div className="text-muted-foreground">
              {merchant.email || "—"}
            </div>
          </div>
        </td>

        {/* Previous Year Information */}
        <td className="px-4 py-3 min-w-48">
          <div className="space-y-1">
            <div>
              <span className="text-muted-foreground">Ad Size: </span>
              {merchant.previous_ad_size || "—"}
            </div>
            <div>
              <span className="text-muted-foreground">Last Solicitor: </span>
              {merchant.previous_solicitor || "No solicitor last year"}
            </div>
          </div>
        </td>
      </tr>
    ))}
  </tbody>
</table>


        </div>
      )}

      {/* Empty State */}
      {!merchantsLoading && visibleMerchants.length === 0 && (
        <div className="text-center py-16" data-testid="empty-state">
          <Building2 className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No merchants found
          </h3>
          <p className="text-muted-foreground">
            Try adjusting your search filters to see more results.
          </p>
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
            Load More Merchants (
            {Math.max(0, filteredMerchants.length - visibleCount)} remaining)
          </button>
        </div>
      )}

      {/* Assignment Modal */}
      {selectedMerchant && (
        <AssignmentModal
          merchant={selectedMerchant}
          volunteers={volunteers}
          onAssign={handleAssignMerchant}
          onClose={() => setSelectedMerchant(null)}
          isLoading={assignMutation.isPending}
          isOpen={!!selectedMerchant}
        />
      )}
    </div>
  );
}