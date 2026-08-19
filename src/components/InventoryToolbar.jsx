import React from 'react';
import { Search, Filter, RefreshCw, PlusCircle, Download, ArrowUpDown, X } from 'lucide-react';

export default function InventoryToolbar({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  categories,
  selectedStatusFilter,
  setSelectedStatusFilter,
  selectedLocation,
  setSelectedLocation,
  locations,
  sortBy,
  setSortBy,
  onRefresh,
  loading,
  onOpenAddItemModal,
  onExportCSV,
  clearAllFilters,
  hasActiveFilters
}) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      {/* Main Toolbar */}
      <div style={{
        background: '#111827',
        border: '1px solid #1f293d',
        borderRadius: 14,
        padding: '1rem 1.25rem',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '0.85rem'
      }}>
        {/* Left: Search & Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', flex: 1, minWidth: 280 }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 180 }}>
            <Search size={16} color="#6b7280" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="품목명, 코드, 보관위치 검색..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                background: '#090d16',
                border: '1px solid #1f293d',
                borderRadius: 8,
                padding: '0.5rem 0.75rem 0.5rem 2rem',
                color: '#fff',
                fontSize: '0.85rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  padding: 2
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            style={{
              background: '#090d16',
              border: selectedCategory !== 'ALL' ? '1px solid #38bdf8' : '1px solid #1f293d',
              borderRadius: 8,
              padding: '0.5rem 0.75rem',
              color: selectedCategory !== 'ALL' ? '#38bdf8' : '#fff',
              fontSize: '0.85rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'ALL' ? '전체 카테고리' : `카테고리: ${cat}`}
              </option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={selectedStatusFilter}
            onChange={e => setSelectedStatusFilter(e.target.value)}
            style={{
              background: '#090d16',
              border: selectedStatusFilter !== 'ALL' ? '1px solid #f59e0b' : '1px solid #1f293d',
              borderRadius: 8,
              padding: '0.5rem 0.75rem',
              color: selectedStatusFilter !== 'ALL' ? '#fbbf24' : '#fff',
              fontSize: '0.85rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">전체 상태</option>
            <option value="NORMAL">정상 재고</option>
            <option value="LOW_STOCK">안전재고 부족</option>
            <option value="OUT_OF_STOCK">품절 (0개)</option>
          </select>

          {/* Location Dropdown */}
          <select
            value={selectedLocation}
            onChange={e => setSelectedLocation(e.target.value)}
            style={{
              background: '#090d16',
              border: selectedLocation !== 'ALL' ? '1px solid #10b981' : '1px solid #1f293d',
              borderRadius: 8,
              padding: '0.5rem 0.75rem',
              color: selectedLocation !== 'ALL' ? '#34d399' : '#fff',
              fontSize: '0.85rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {locations.map(loc => (
              <option key={loc} value={loc}>
                {loc === 'ALL' ? '전체 보관위치' : `위치: ${loc}`}
              </option>
            ))}
          </select>

          {/* Sort Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <ArrowUpDown size={14} color="#9ca3af" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{
                background: '#090d16',
                border: '1px solid #1f293d',
                borderRadius: 8,
                padding: '0.5rem 0.75rem',
                color: '#fff',
                fontSize: '0.85rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="default">기본 등록순</option>
              <option value="stock_desc">재고 많은순</option>
              <option value="stock_asc">재고 적은순</option>
              <option value="val_desc">평가액 높은순</option>
              <option value="price_desc">단가 높은순</option>
              <option value="name_asc">품목명 (가나다순)</option>
            </select>
          </div>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {/* CSV Export */}
          <button
            onClick={onExportCSV}
            title="현재 재고 목록을 CSV 파일로 다운로드"
            style={{
              background: '#1f293d',
              border: '1px solid #374151',
              color: '#cbd5e1',
              padding: '0.5rem 0.75rem',
              borderRadius: 8,
              fontSize: '0.82rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              transition: 'background 0.2s'
            }}
          >
            <Download size={14} /> CSV 내보내기
          </button>

          {/* Refresh */}
          <button
            onClick={onRefresh}
            title="새로고침"
            style={{
              background: '#1f293d',
              border: '1px solid #374151',
              color: '#9ca3af',
              padding: '0.5rem 0.75rem',
              borderRadius: 8,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> 새로고침
          </button>

          {/* Add Item */}
          <button
            onClick={onOpenAddItemModal}
            style={{
              background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
              color: '#fff',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: 8,
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 2px 8px rgba(6, 182, 212, 0.3)'
            }}
          >
            <PlusCircle size={15} /> 신규 품목 등록
          </button>
        </div>
      </div>

      {/* Active Filter Pill */}
      {hasActiveFilters && (
        <div style={{
          marginTop: '0.75rem',
          background: 'rgba(6, 182, 212, 0.1)',
          border: '1px solid rgba(6, 182, 212, 0.25)',
          padding: '0.5rem 1rem',
          borderRadius: 8,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#22d3ee',
          fontSize: '0.82rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <Filter size={14} />
            <span>적용된 필터:</span>
            {selectedCategory !== 'ALL' && (
              <span style={{ background: 'rgba(6, 182, 212, 0.2)', padding: '0.1rem 0.4rem', borderRadius: 4 }}>
                카테고리: {selectedCategory}
              </span>
            )}
            {selectedStatusFilter !== 'ALL' && (
              <span style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', padding: '0.1rem 0.4rem', borderRadius: 4 }}>
                상태: {selectedStatusFilter === 'LOW_STOCK' ? '부족' : (selectedStatusFilter === 'OUT_OF_STOCK' ? '품절' : '정상')}
              </span>
            )}
            {selectedLocation !== 'ALL' && (
              <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '0.1rem 0.4rem', borderRadius: 4 }}>
                위치: {selectedLocation}
              </span>
            )}
            {searchTerm && (
              <span style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#fff', padding: '0.1rem 0.4rem', borderRadius: 4 }}>
                검색: "{searchTerm}"
              </span>
            )}
          </div>
          <button
            onClick={clearAllFilters}
            style={{
              background: 'transparent',
              border: '1px solid #06b6d4',
              color: '#06b6d4',
              padding: '0.2rem 0.55rem',
              borderRadius: 6,
              fontSize: '0.72rem',
              cursor: 'pointer'
            }}
          >
            필터 초기화
          </button>
        </div>
      )}
    </div>
  );
}
