import React from 'react';
import { TrendingUp, AlertTriangle, PlusCircle, CheckCircle } from 'lucide-react';

export default function InventoryInsights({
  items,
  onOpenStockModal,
  onSelectItemSearch
}) {
  // 1. Top 3 Valued Items
  const topValuedItems = [...items]
    .map(i => ({
      ...i,
      totalValue: (Number(i.stock_quantity) || 0) * (Number(i.unit_price) || 0)
    }))
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 3);

  // 2. Urgent Restock Items (Shortage severity = safety_stock - stock_quantity)
  const urgentRestockItems = [...items]
    .filter(i => (Number(i.stock_quantity) || 0) < (Number(i.safety_stock) || 0))
    .map(i => ({
      ...i,
      shortage: (Number(i.safety_stock) || 0) - (Number(i.stock_quantity) || 0)
    }))
    .sort((a, b) => b.shortage - a.shortage)
    .slice(0, 3);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '1.25rem',
      marginBottom: '1.75rem'
    }}>
      {/* 1. 최고 자산 가치 품목 Top 3 */}
      <div style={{
        background: '#111827',
        border: '1px solid #1f293d',
        borderRadius: 14,
        padding: '1.25rem 1.5rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          paddingBottom: '0.65rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <TrendingUp size={17} color="#10b981" />
            <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff' }}>
              최고 자산가치 품목 Top 3
            </span>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.12)', padding: '0.15rem 0.45rem', borderRadius: 6 }}>
            고액 자산
          </span>
        </div>

        {topValuedItems.length === 0 ? (
          <div style={{ color: '#6b7280', fontSize: '0.82rem', textAlign: 'center', padding: '1rem 0' }}>
            등록된 품목 데이터가 없습니다.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {topValuedItems.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => onSelectItemSearch && onSelectItemSearch(item.name)}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                  borderRadius: 8,
                  padding: '0.6rem 0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                title="클릭하여 해당 품목 검색"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span style={{
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    background: idx === 0 ? '#fbbf24' : (idx === 1 ? '#94a3b8' : '#cd7f32'),
                    color: '#000',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {idx + 1}
                  </span>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontFamily: 'monospace' }}>
                      {item.item_code} · {item.stock_quantity}개 보유
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#34d399' }}>
                    ₩{item.totalValue.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                    단가 ₩{(item.unit_price || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. 긴급 보충 필요 품목 Top 3 */}
      <div style={{
        background: '#111827',
        border: '1px solid #1f293d',
        borderRadius: 14,
        padding: '1.25rem 1.5rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          paddingBottom: '0.65rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <AlertTriangle size={17} color="#f59e0b" />
            <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff' }}>
              긴급 보충 권장 품목
            </span>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.12)', padding: '0.15rem 0.45rem', borderRadius: 6 }}>
            안전재고 미달
          </span>
        </div>

        {urgentRestockItems.length === 0 ? (
          <div style={{ color: '#10b981', fontSize: '0.85rem', textAlign: 'center', padding: '1.5rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
            <CheckCircle size={16} /> 모든 품목이 안전재고 수준을 충족하고 있습니다.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {urgentRestockItems.map(item => (
              <div
                key={item.id}
                style={{
                  background: 'rgba(239, 68, 68, 0.04)',
                  border: '1px solid rgba(239, 68, 68, 0.15)',
                  borderRadius: 8,
                  padding: '0.6rem 0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#f87171' }}>
                    현재 {item.stock_quantity}개 / 안전 {item.safety_stock}개 (부족: {item.shortage}개)
                  </div>
                </div>

                <button
                  onClick={() => onOpenStockModal && onOpenStockModal(item, 'INBOUND')}
                  style={{
                    background: '#06b6d4',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <PlusCircle size={12} /> 즉시 입고
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
