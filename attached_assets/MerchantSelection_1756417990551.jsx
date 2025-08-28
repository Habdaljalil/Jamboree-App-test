import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Search as SearchIcon, Users, CheckCircle, X, Loader } from "lucide-react";
import { googleSheetsService } from "../Components/utils/GoogleSheetsService";

import SearchFilters from "../Components/merchants/SearchFilters";
import MerchantCard from "../Components/merchants/MerchantCard";
import AssignmentModal from "../Components/merchants/AssignmentModal";

const ITEMS_PER_PAGE = 30;
const PERFORMANCE_TRACKER = {
  loadStart: 0,
  loadEnd: 0,
  searchStart: 0,
  searchEnd: 0,
  renderStart: 0,
  renderEnd: 0
};

export default function MerchantSelection() {
  const [merchants, setMerchants] = useState([]);
  const [displayedMerchants, setDisplayedMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [assignmentFilter, setAssignmentFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [subCategoryFilter, setSubCategoryFilter] = useState("all");
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [error, setError] = useState(null);
  const [assignmentError, setAssignmentError] = useState(null);
  const [performanceStats, setPerformanceStats] = useState(null);
  const [showPerformanceStats, setShowPerformanceStats] = useState(false);

  const loadMerchants = useCallback(async () => {
    if (document.hidden) return;
    try {
      const data = await googleSheetsService.fetchMerchants();
      console.log('Loaded merchants:', data.length);
      setMerchants(data);
      setError(null);
    } catch (error) {
      const errorMsg = "Failed to load merchants from Google Sheets. Please check your internet connection and try again.";
      setError(errorMsg);
      console.error("Error loading merchants:", error);
    }
  }, []);

  const filteredMerchants = useMemo(() => {
    PERFORMANCE_TRACKER.searchStart = Date.now();
    let filtered = merchants;

    if (assignmentFilter === "assigned") {
      filtered = filtered.filter(m => m.assigned_to);
    } else if (assignmentFilter === "unassigned") {
      filtered = filtered.filter(m => !m.assigned_to);
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(m => m.category === categoryFilter);
    }

    if (subCategoryFilter !== "all") {
      filtered = filtered.filter(m => m.sub_category === subCategoryFilter);
    }

    if (searchText.trim()) {
      const searchTerm = searchText.toLowerCase().trim();
      filtered = filtered.filter(merchant => {
        return (
          merchant.business_name?.toLowerCase().includes(searchTerm) ||
          merchant.category?.toLowerCase().includes(searchTerm) ||
          merchant.sub_category?.toLowerCase().includes(searchTerm) ||
          merchant.address?.toLowerCase().includes(searchTerm) ||
          merchant.contact_person?.toLowerCase().includes(searchTerm)
        );
      });
    }

    PERFORMANCE_TRACKER.searchEnd = Date.now();
    return filtered;
  }, [merchants, assignmentFilter, categoryFilter, subCategoryFilter, searchText]);

  const updatePerformanceStats = useCallback(() => {
    const isMobile = window.innerWidth < 768;
    setPerformanceStats({
      loadTime: PERFORMANCE_TRACKER.loadEnd - PERFORMANCE_TRACKER.loadStart,
      searchTime: PERFORMANCE_TRACKER.searchEnd - PERFORMANCE_TRACKER.searchStart,
      renderTime: PERFORMANCE_TRACKER.renderEnd - PERFORMANCE_TRACKER.renderStart,
      totalMerchants: merchants.length,
      filteredCount: filteredMerchants.length,
      displayedCount: displayedMerchants.length,
      deviceType: isMobile ? 'Mobile' : 'Desktop',
      memoryUsage: 'performance' in window && 'memory' in window.performance ? `${Math.round(window.performance.memory.usedJSHeapSize / 1024 / 1024)}MB` : 'N/A'
    });
  }, [merchants.length, filteredMerchants.length, displayedMerchants.length]);

  useEffect(() => {
    const initialLoad = async () => {
      PERFORMANCE_TRACKER.loadStart = Date.now();
      setLoading(true);
      await loadMerchants();
      PERFORMANCE_TRACKER.loadEnd = Date.now();
      setLoading(false);
      updatePerformanceStats();
    };
    initialLoad();

    const intervalId = setInterval(loadMerchants, 10000);
    return () => clearInterval(intervalId);
  }, [loadMerchants, updatePerformanceStats]);

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(merchants.map(m => m.category).filter(Boolean))];
    return uniqueCategories.sort();
  }, [merchants]);

  const subCategories = useMemo(() => {
    let filteredSubs = merchants;
    if (categoryFilter !== 'all') {
      filteredSubs = merchants.filter(m => m.category === categoryFilter);
    }
    const uniqueSubCategories = [...new Set(filteredSubs.map(m => m.sub_category).filter(Boolean))];
    return uniqueSubCategories.sort();
  }, [merchants, categoryFilter]);
  
  // Pagination logic
  useEffect(() => {
    PERFORMANCE_TRACKER.renderStart = Date.now();
    const startIndex = 0;
    const endIndex = currentPage * ITEMS_PER_PAGE;
    setDisplayedMerchants(filteredMerchants.slice(startIndex, endIndex));
    PERFORMANCE_TRACKER.renderEnd = Date.now();
    updatePerformanceStats();
  }, [filteredMerchants, currentPage, updatePerformanceStats]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, assignmentFilter, categoryFilter, subCategoryFilter]);

  const handleLoadMore = useCallback(() => {
    setLoadingMore(true);
    setTimeout(() => {
      setCurrentPage(prev => prev + 1);
      setLoadingMore(false);
    }, 300);
  }, []);

  const handleAssignMerchant = async (merchant, volunteerName) => {
    setIsAssigning(true);
    setAssignmentError(null);
    try {
      // Pass the business name instead of the ID
      await googleSheetsService.updateMerchantAssignment(merchant.business_name, volunteerName);
      await loadMerchants(); // This will fetch fresh data
      setSelectedMerchant(null);
    } catch (error) {
      console.error("Error assigning merchant:", error);
      setAssignmentError(error.message || "Failed to assign merchant. Please try again.");
    } finally {
      setIsAssigning(false);
    }
  };

  const hasMoreItems = displayedMerchants.length < filteredMerchants.length;

  return (
    <div style={{ padding: 'var(--gutter)', maxWidth: 'var(--max-w)', margin: '0 auto' }}>
      <header style={{ marginBottom: 'var(--gutter)', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--text)', marginBottom: '0.5rem' }}>
          Merchant Sponsorship Portal
        </h1>
        <p style={{ fontSize: 'var(--font-size-lg)', color: 'var(--muted)', maxWidth: '60ch', margin: '0 auto' }}>
          Browse and assign merchants for ad sponsorships in the Ridgewood Jamboree program.
        </p>
        
        {/* Performance Toggle - Always available but hidden by default */}
        <button 
          onClick={() => setShowPerformanceStats(!showPerformanceStats)}
          className="btn link"
          style={{ fontSize: 'var(--font-size-xs)', marginTop: '0.5rem' }}
        >
          {showPerformanceStats ? 'Hide' : 'Show'} Performance Stats
        </button>
      </header>

      {/* Performance Stats */}
      {showPerformanceStats && performanceStats && (
        <div className="card" style={{ marginBottom: 'var(--gutter)', fontSize: 'var(--font-size-xs)' }}>
          <h4>Performance Report</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px' }}>
            <div>Load Time: {performanceStats.loadTime}ms</div>
            <div>Search Time: {performanceStats.searchTime}ms</div>
            <div>Render Time: {performanceStats.renderTime}ms</div>
            <div>Device: {performanceStats.deviceType}</div>
            <div>Memory: {performanceStats.memoryUsage}</div>
            <div>Total/Filtered/Shown: {performanceStats.totalMerchants}/{performanceStats.filteredCount}/{performanceStats.displayedCount}</div>
          </div>
        </div>
      )}

      {assignmentError && (
        <div className="card" style={{
          borderColor: 'var(--danger)',
          background: 'rgba(255,59,48,0.05)',
          marginBottom: 'var(--gutter)',
          textAlign: 'center'
        }}>
          <h4 style={{ color: 'var(--danger)', fontSize: 'var(--font-size-md)' }}>Assignment Failed</h4>
          <p style={{ color: 'var(--danger)', margin: 0, fontSize: 'var(--font-size-sm)' }}>
            {assignmentError}
          </p>
        </div>
      )}

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

      {error && (
        <div className="card" style={{
          borderColor: 'var(--danger)',
          background: 'rgba(255,59,48,0.05)',
          margin: 'var(--gutter) 0',
          textAlign: 'center'
        }}>
          <p style={{ color: 'var(--danger)', margin: 0, fontSize: 'var(--font-size-sm)' }}>
            {error}
          </p>
          <p style={{ color: 'var(--muted)', margin: '8px 0 0 0', fontSize: 'var(--font-size-xs)' }}>
            Check the console for more details. The Google Sheet may need to be made publicly viewable.
          </p>
        </div>
      )}

      {loading ? (
        <div className="grid grid-3">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="card" style={{ opacity: 0.5, minHeight: '280px' }}>
              <div style={{
                height: '40px',
                background: 'var(--bg)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem'
              }}></div>
              <div style={{
                height: '20px',
                background: 'var(--bg)',
                borderRadius: 'var(--radius-sm)'
              }}></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div style={{ margin: 'var(--gutter) 0 1rem 0', textAlign: 'center' }}>
            <p style={{ color: 'var(--muted)', fontSize: 'var(--font-size-sm)' }}>
              Showing <strong style={{color: 'var(--text)'}}>{displayedMerchants.length}</strong> of <strong style={{color: 'var(--text)'}}>{filteredMerchants.length}</strong> merchants
              {filteredMerchants.length !== merchants.length && ` (${merchants.length} total)`}
            </p>
          </div>

          <AnimatePresence>
            {displayedMerchants.length > 0 ? (
              <div className="grid grid-3">
                {displayedMerchants.map((merchant) => (
                  <MerchantCard
                    key={merchant.id}
                    merchant={merchant}
                    onSelect={setSelectedMerchant}
                    isSelectable={!merchant.assigned_to}
                    businessIcon={googleSheetsService.getBusinessIcon(merchant.category, merchant.sub_category)}
                  />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: 'center', padding: '60px 20px' }}
              >
                <SearchIcon style={{ 
                  width: '48px', 
                  height: '48px', 
                  color: 'var(--divider)', 
                  margin: '0 auto 1rem' 
                }} />
                <h3 style={{fontSize: '20px'}}>No merchants found</h3>
                <p style={{ color: 'var(--muted)', maxWidth: '40ch', margin: '0 auto', fontSize: 'var(--font-size-sm)' }}>
                  {merchants.length === 0 && error ? 
                    "Unable to load merchants from Google Sheets. Please check the console for details." : 
                    "Try adjusting your search criteria or filters."
                  }
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {hasMoreItems && (
            <div style={{ textAlign: 'center', marginTop: 'var(--gutter)' }}>
              <button 
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="btn primary"
                style={{ padding: '12px 24px' }}
              >
                {loadingMore ? (
                  <>
                    <Loader size={16} style={{ marginRight: '8px', animation: 'spin 1s linear infinite' }} />
                    Loading...
                  </>
                ) : (
                  `Load More (${filteredMerchants.length - displayedMerchants.length} remaining)`
                )}
              </button>
            </div>
          )}
        </>
      )}

      <AssignmentModal
        isOpen={!!selectedMerchant}
        onClose={() => setSelectedMerchant(null)}
        merchant={selectedMerchant}
        onAssign={handleAssignMerchant}
        isAssigning={isAssigning}
      />

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
