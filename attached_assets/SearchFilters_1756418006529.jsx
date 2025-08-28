import React from "react";
import { Search, Filter } from "lucide-react";

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
  subCategories
}) {
  return (
    <div className="card" style={{ marginBottom: 'var(--gutter)' }}>
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <Search style={{ 
          position: 'absolute', 
          left: '14px', 
          top: '50%', 
          transform: 'translateY(-50%)', 
          color: 'var(--muted)', 
          width: '18px', 
          height: '18px' 
        }} />
        <input
          type="text"
          className="input"
          placeholder="Search merchants..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ 
            paddingLeft: '44px', 
            fontSize: 'clamp(14px, 4vw, 18px)',
            padding: '14px 14px 14px 44px'
          }}
        />
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(180px, 100%), 1fr))', 
        gap: 'clamp(12px, 3vw, 16px)' 
      }}>
        <div>
          <label style={{ 
            fontSize: 'clamp(12px, 3vw, 14px)', 
            color: 'var(--muted)', 
            display: 'block', 
            marginBottom: '6px',
            fontWeight: 500
          }}>
            Assignment Status
          </label>
          <select 
            className="input" 
            value={assignmentFilter} 
            onChange={(e) => setAssignmentFilter(e.target.value)}
            style={{ fontSize: 'clamp(12px, 3vw, 14px)' }}
          >
            <option value="all">All Merchants</option>
            <option value="unassigned">Unassigned Only</option>
            <option value="assigned">Assigned Only</option>
          </select>
        </div>
        
        <div>
          <label style={{ 
            fontSize: 'clamp(12px, 3vw, 14px)', 
            color: 'var(--muted)', 
            display: 'block', 
            marginBottom: '6px',
            fontWeight: 500
          }}>
            Category
          </label>
          <select 
            className="input" 
            value={categoryFilter} 
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setSubCategoryFilter("all");
            }}
            style={{ fontSize: 'clamp(12px, 3vw, 14px)' }}
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label style={{ 
            fontSize: 'clamp(12px, 3vw, 14px)', 
            color: 'var(--muted)', 
            display: 'block', 
            marginBottom: '6px',
            fontWeight: 500
          }}>
            Sub-Category
          </label>
          <select 
            className="input"
            value={subCategoryFilter} 
            onChange={(e) => setSubCategoryFilter(e.target.value)} 
            disabled={categoryFilter === 'all' && subCategories.length === 0}
            style={{ fontSize: 'clamp(12px, 3vw, 14px)' }}
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
