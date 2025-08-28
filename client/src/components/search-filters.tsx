import React from "react";
import { Search } from "lucide-react";

interface SearchFiltersProps {
  searchText: string;
  setSearchText: (text: string) => void;
  assignmentFilter: string;
  setAssignmentFilter: (filter: string) => void;
  categoryFilter: string;
  setCategoryFilter: (filter: string) => void;
  categories: string[];
  subCategoryFilter: string;
  setSubCategoryFilter: (filter: string) => void;
  subCategories: string[];
}

export default function SearchFilters({
  searchText,
  setSearchText,
  assignmentFilter,
  setAssignmentFilter,
  categoryFilter,
  setCategoryFilter,
  categories,
  subCategoryFilter,
  setSubCategoryFilter,
  subCategories,
}: SearchFiltersProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      {/* Search Input */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          className="input-apple pl-12"
          placeholder="Search merchants..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          data-testid="input-search-merchants"
        />
      </div>
      
      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Assignment Status
          </label>
          <select 
            className="input-apple" 
            value={assignmentFilter} 
            onChange={(e) => setAssignmentFilter(e.target.value)}
            data-testid="select-assignment-filter"
          >
            <option value="all">All Merchants</option>
            <option value="unassigned">Unassigned Only</option>
            <option value="assigned">Assigned Only</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Category
          </label>
          <select 
            className="input-apple" 
            value={categoryFilter} 
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setSubCategoryFilter("all");
            }}
            data-testid="select-category-filter"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Sub-Category
          </label>
          <select 
            className="input-apple"
            value={subCategoryFilter} 
            onChange={(e) => setSubCategoryFilter(e.target.value)} 
            disabled={categoryFilter === 'all' && subCategories.length === 0}
            data-testid="select-subcategory-filter"
          >
            <option value="all">All Sub-Categories</option>
            {subCategories.map(subCategory => (
              <option key={subCategory} value={subCategory}>{subCategory}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
