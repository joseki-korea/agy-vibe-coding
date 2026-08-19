import React from 'react';
import { AlertTriangle, AlertOctagon, CheckCircle2, Trash2, ArrowLeftRight, Layers } from 'lucide-react';

export default function InventoryTable({
  items,
  onOpenStockModal,
  onDeleteItem,
  onStatusClick,
  clearAllFilters
}) {
  return (
    <div style={{
      background: '#111827',
      border: '1px solid #1f293d',
      borderRadius: 14,
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
    }}>
      <div style={{
        padding: '0.85rem 1.25rem',
        background: 'rgba(255, 255, 255, 0.02)',
        borderBottom: '1px solid #1f293d',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#e5e7eb', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Layers size={16} color="#06b6d4" />
          <span>재고 품목 데이터 목록</span>
          <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 400 }}>
            (총 {items.length}개 항목)
          </span>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid #1f293d', color: '#9ca3af' }}>
              <th style={{ padding: '0.75rem 1rem' }}>품목 코드</th>
              <th style={{ padding: '0.75rem 1rem' }}>품목명</th>
              <th style={{ padding: '0.75rem 1rem' }}>카테고리</th>
              <th style={{ padding: '0.75rem 1rem' }}>보관 위치</th>
              <th style={{ padding: '0.75rem 1rem' }}>현재 재고량 (안전재고)</th>
              <th style={{ padding: '0.75rem 1rem' }}>단가</th>
              <th style={{ padding: '0.75rem 1rem' }}>총 자산가치</th>
              <th style={{ padding: '0.75rem 1rem' }}>재고 상태</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#6b7280' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#9ca3af' }}>
                    조건에 일치하는 품목이 없습니다.
                  </div>
                  <p style={{ fontSize: '0.82rem', marginBottom: '1rem' }}>
                    검색어나 필터 조건을 변경하거나 초기화해 보세요.
                  </p>
                  <button
                    onClick={clearAllFilters}
                    style={{
                      background: '#1f293d',
                      border: '1px solid #374151',
                      color: '#38bdf8',
                      padding: '0.4rem 0.85rem',
                      borderRadius: 6,
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    모든 필터 초기화
                  </button>
                </td>
              </tr>
            ) : (
              items.map(item => {
                const qty = Number(item.stock_quantity) || 0;
                const safety = Number(item.safety_stock) || 0;
                const price = Number(item.unit_price) || 0;
                const itemTotalValue = qty * price;
                const isOutOfStock = qty === 0;
                const isLowStock = !isOutOfStock && qty < safety;

                const stockRatio = safety > 0 ? Math.min(100, Math.round((qty / (safety * 1.5)) * 100)) : 100;

                return (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      backgroundColor: isOutOfStock
                        ? 'rgba(239, 68, 68, 0.06)'
                        : (isLowStock ? 'rgba(245, 158, 11, 0.04)' : 'transparent'),
                      transition: 'background 0.15s ease'
                    }}
                  >
                    {/* Item Code */}
                    <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', color: '#38bdf8', fontWeight: 600 }}>
                      {item.item_code}
                    </td>

                    {/* Name */}
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#fff' }}>
                      {item.name}
                    </td>

                    {/* Category */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: '0.15rem 0.5rem',
                        borderRadius: 6,
                        fontSize: '0.78rem',
                        color: '#cbd5e1'
                      }}>
                        {item.category}
                      </span>
                    </td>

                    {/* Warehouse Location */}
                    <td style={{ padding: '0.85rem 1rem', color: '#9ca3af', fontSize: '0.82rem' }}>
                      {item.warehouse_location}
                    </td>

                    {/* Stock Quantity */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                        <span style={{
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          color: isOutOfStock ? '#ef4444' : (isLowStock ? '#fbbf24' : '#fff')
                        }}>
                          {qty.toLocaleString()} 개
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                          (안전: {safety})
                        </span>
                      </div>
                      {/* Mini Stock Bar */}
                      <div style={{ height: 4, width: 80, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginTop: 4, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${stockRatio}%`,
                          background: isOutOfStock ? '#ef4444' : (isLowStock ? '#f59e0b' : '#10b981'),
                          borderRadius: 2
                        }} />
                      </div>
                    </td>

                    {/* Unit Price */}
                    <td style={{ padding: '0.85rem 1rem', color: '#cbd5e1' }}>
                      ₩{price.toLocaleString()}
                    </td>

                    {/* Total Valuation */}
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#34d399', fontFamily: 'monospace' }}>
                      ₩{itemTotalValue.toLocaleString()}
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {isOutOfStock ? (
                        <span
                          onClick={() => onStatusClick && onStatusClick('OUT_OF_STOCK')}
                          style={{
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#f87171',
                            padding: '0.2rem 0.55rem',
                            borderRadius: 10,
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                          title="클릭 시 품절 품목만 필터"
                        >
                          <AlertOctagon size={12} /> 품절
                        </span>
                      ) : isLowStock ? (
                        <span
                          onClick={() => onStatusClick && onStatusClick('LOW_STOCK')}
                          style={{
                            background: 'rgba(245, 158, 11, 0.15)',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                            color: '#fbbf24',
                            padding: '0.2rem 0.55rem',
                            borderRadius: 10,
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                          title="클릭 시 부족 품목만 필터"
                        >
                          <AlertTriangle size={12} /> 재고 부족
                        </span>
                      ) : (
                        <span
                          onClick={() => onStatusClick && onStatusClick('NORMAL')}
                          style={{
                            background: 'rgba(16, 185, 129, 0.15)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            color: '#34d399',
                            padding: '0.2rem 0.55rem',
                            borderRadius: 10,
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                          title="클릭 시 정상 품목만 필터"
                        >
                          <CheckCircle2 size={12} /> 정상
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => onOpenStockModal && onOpenStockModal(item)}
                          style={{
                            background: '#3b82f6',
                            color: '#fff',
                            border: 'none',
                            padding: '0.35rem 0.75rem',
                            borderRadius: 6,
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                        >
                          <ArrowLeftRight size={13} /> 입출고
                        </button>
                        <button
                          onClick={() => onDeleteItem && onDeleteItem(item.id, item.name)}
                          style={{
                            background: 'rgba(239, 68, 68, 0.12)',
                            border: '1px solid rgba(239, 68, 68, 0.25)',
                            color: '#f87171',
                            padding: '0.35rem 0.55rem',
                            borderRadius: 6,
                            fontSize: '0.78rem',
                            cursor: 'pointer'
                          }}
                          title="삭제"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
