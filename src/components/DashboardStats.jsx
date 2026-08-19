import React from 'react';
import { Package, AlertTriangle, AlertOctagon, ShieldCheck, DollarSign } from 'lucide-react';

export default function DashboardStats({
  items,
  selectedStatusFilter,
  setSelectedStatusFilter,
  selectedCategory,
  clearAllFilters
}) {
  const totalItemsCount = items.length;
  const totalStockQuantity = items.reduce((acc, i) => acc + (Number(i.stock_quantity) || 0), 0);
  
  const lowStockItems = items.filter(i => {
    const qty = Number(i.stock_quantity) || 0;
    const safety = Number(i.safety_stock) || 0;
    return qty > 0 && qty < safety;
  });

  const outOfStockItems = items.filter(i => (Number(i.stock_quantity) || 0) === 0);
  const normalStockItems = items.filter(i => {
    const qty = Number(i.stock_quantity) || 0;
    const safety = Number(i.safety_stock) || 0;
    return qty >= safety;
  });

  const totalValuation = items.reduce((acc, i) => {
    const qty = Number(i.stock_quantity) || 0;
    const price = Number(i.unit_price) || 0;
    return acc + (qty * price);
  }, 0);

  const avgUnitPrice = totalItemsCount > 0
    ? Math.round(items.reduce((acc, i) => acc + (Number(i.unit_price) || 0), 0) / totalItemsCount)
    : 0;

  const healthRate = totalItemsCount > 0
    ? Math.round((normalStockItems.length / totalItemsCount) * 100)
    : 100;

  const isAllSelected = selectedStatusFilter === 'ALL' && selectedCategory === 'ALL';

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '1rem',
      marginBottom: '1.75rem'
    }}>
      {/* 1. 전체 보유 재고 */}
      <div
        onClick={clearAllFilters}
        style={{
          background: isAllSelected
            ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.12), rgba(17, 24, 39, 0.95))'
            : '#111827',
          border: isAllSelected ? '2px solid #06b6d4' : '1px solid #1f293d',
          borderRadius: 14,
          padding: '1.2rem',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: isAllSelected ? '0 0 15px rgba(6, 182, 212, 0.25)' : 'none'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Package size={16} color="#38bdf8" /> 전체 보유 재고
          </span>
          <span style={{ fontSize: '0.7rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.15)', padding: '0.15rem 0.45rem', borderRadius: 8 }}>
            {totalItemsCount}개 품목
          </span>
        </div>
        <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
          {totalStockQuantity.toLocaleString()} <span style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: 500 }}>개</span>
        </div>
        <div style={{ fontSize: '0.75rem', color: '#06b6d4', marginTop: '0.4rem' }}>
          {isAllSelected ? '✓ 전체 품목 표시 중' : '클릭 시 전체보기'}
        </div>
      </div>

      {/* 2. 안전재고 부족 품목 */}
      <div
        onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'LOW_STOCK' ? 'ALL' : 'LOW_STOCK')}
        style={{
          background: selectedStatusFilter === 'LOW_STOCK'
            ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(17, 24, 39, 0.95))'
            : '#111827',
          border: selectedStatusFilter === 'LOW_STOCK'
            ? '2px solid #f59e0b'
            : (lowStockItems.length > 0 ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid #1f293d'),
          borderRadius: 14,
          padding: '1.2rem',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: selectedStatusFilter === 'LOW_STOCK' ? '0 0 15px rgba(245, 158, 11, 0.25)' : 'none'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '0.85rem', color: lowStockItems.length > 0 ? '#fbbf24' : '#9ca3af', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <AlertTriangle size={16} color="#f59e0b" /> 안전재고 부족
          </span>
          <span style={{ fontSize: '0.7rem', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.15)', padding: '0.15rem 0.45rem', borderRadius: 8 }}>
            보충 권장
          </span>
        </div>
        <div style={{ fontSize: '1.65rem', fontWeight: 800, color: lowStockItems.length > 0 ? '#fbbf24' : '#fff' }}>
          {lowStockItems.length} <span style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: 500 }}>건</span>
        </div>
        <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '0.4rem' }}>
          {selectedStatusFilter === 'LOW_STOCK' ? '✓ 필터 적용됨' : '클릭하여 부족 품목만 보기'}
        </div>
      </div>

      {/* 3. 품절 / 재고 0 품목 */}
      <div
        onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'OUT_OF_STOCK' ? 'ALL' : 'OUT_OF_STOCK')}
        style={{
          background: selectedStatusFilter === 'OUT_OF_STOCK'
            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(17, 24, 39, 0.95))'
            : '#111827',
          border: selectedStatusFilter === 'OUT_OF_STOCK'
            ? '2px solid #ef4444'
            : (outOfStockItems.length > 0 ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid #1f293d'),
          borderRadius: 14,
          padding: '1.2rem',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: selectedStatusFilter === 'OUT_OF_STOCK' ? '0 0 15px rgba(239, 68, 68, 0.25)' : 'none'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '0.85rem', color: outOfStockItems.length > 0 ? '#f87171' : '#9ca3af', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <AlertOctagon size={16} color="#ef4444" /> 품절 / 재고 0
          </span>
          <span style={{ fontSize: '0.7rem', color: '#ef4444', background: 'rgba(239, 68, 68, 0.15)', padding: '0.15rem 0.45rem', borderRadius: 8 }}>
            긴급 입고
          </span>
        </div>
        <div style={{ fontSize: '1.65rem', fontWeight: 800, color: outOfStockItems.length > 0 ? '#ef4444' : '#fff' }}>
          {outOfStockItems.length} <span style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: 500 }}>건</span>
        </div>
        <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.4rem' }}>
          {selectedStatusFilter === 'OUT_OF_STOCK' ? '✓ 필터 적용됨' : '클릭하여 품절 품목만 보기'}
        </div>
      </div>

      {/* 4. 총 재고 자산 평가액 */}
      <div style={{
        background: '#111827',
        border: '1px solid #1f293d',
        borderRadius: 14,
        padding: '1.2rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <DollarSign size={16} color="#10b981" /> 총 재고 자산 평가액
          </span>
          <span style={{ fontSize: '0.7rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', padding: '0.15rem 0.45rem', borderRadius: 8 }}>
            자산 가치
          </span>
        </div>
        <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#34d399', letterSpacing: '-0.5px' }}>
          ₩{totalValuation.toLocaleString()}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.4rem' }}>
          평균 품목 단가: ₩{avgUnitPrice.toLocaleString()}
        </div>
      </div>

      {/* 5. 재고 건전성 지수 */}
      <div style={{
        background: '#111827',
        border: '1px solid #1f293d',
        borderRadius: 14,
        padding: '1.2rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldCheck size={16} color="#8b5cf6" /> 재고 건전도 지수
          </span>
          <span style={{
            fontSize: '0.7rem',
            color: healthRate >= 80 ? '#34d399' : (healthRate >= 50 ? '#fbbf24' : '#f87171'),
            background: healthRate >= 80 ? 'rgba(16, 185, 129, 0.15)' : (healthRate >= 50 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)'),
            padding: '0.15rem 0.45rem',
            borderRadius: 8
          }}>
            {healthRate >= 80 ? '우수' : (healthRate >= 50 ? '주의' : '위험')}
          </span>
        </div>
        <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#c084fc', letterSpacing: '-0.5px' }}>
          {healthRate}%
        </div>
        <div style={{ marginTop: '0.4rem' }}>
          <div style={{ height: 6, background: 'rgba(255, 255, 255, 0.08)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${healthRate}%`,
              background: healthRate >= 80 ? '#10b981' : (healthRate >= 50 ? '#f59e0b' : '#ef4444'),
              borderRadius: 3,
              transition: 'width 0.4s ease'
            }} />
          </div>
          <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '0.3rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>정상: {normalStockItems.length}개</span>
            <span>부족/품절: {lowStockItems.length + outOfStockItems.length}개</span>
          </div>
        </div>
      </div>
    </div>
  );
}
