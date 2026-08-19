import React, { useState } from 'react';
import { X, ArrowDownRight, ArrowUpRight, AlertTriangle, AlertOctagon, CheckCircle2 } from 'lucide-react';

export default function StockModal({
  isOpen,
  onClose,
  item,
  initialType = 'INBOUND',
  onSubmit
}) {
  const [transactionType, setTransactionType] = useState(initialType);
  const [changeQty, setChangeQty] = useState(1);
  const [notes, setNotes] = useState('');

  if (!isOpen || !item) return null;

  const currentQty = Number(item.stock_quantity) || 0;
  const safetyStock = Number(item.safety_stock) || 0;
  const qtyAmount = Math.max(1, Number(changeQty) || 1);

  const projectedQty = transactionType === 'INBOUND'
    ? currentQty + qtyAmount
    : Math.max(0, currentQty - qtyAmount);

  const isOutOfStockProjected = projectedQty === 0;
  const isLowStockProjected = !isOutOfStockProjected && projectedQty < safetyStock;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      item,
      transactionType,
      quantity: qtyAmount,
      notes: notes.trim() || null
    });
  };

  const handleQuickPreset = (amount) => {
    setChangeQty(prev => Math.max(1, (Number(prev) || 0) + amount));
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        background: '#111827',
        border: '1px solid #1f293d',
        borderRadius: 16,
        width: '100%',
        maxWidth: 460,
        padding: '1.75rem',
        color: '#fff',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1.2rem', fontWeight: 700 }}>
              재고 수량 변동 (입·출고)
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#9ca3af' }}>
              <strong style={{ color: '#38bdf8' }}>{item.item_code}</strong> · {item.name}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 4 }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Movement Type Tabs */}
          <div style={{ display: 'flex', gap: '0.65rem', marginBottom: '1.25rem' }}>
            <button
              type="button"
              onClick={() => setTransactionType('INBOUND')}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: 10,
                border: '1.5px solid',
                borderColor: transactionType === 'INBOUND' ? '#10b981' : '#1f293d',
                background: transactionType === 'INBOUND' ? 'rgba(16, 185, 129, 0.15)' : '#090d16',
                color: transactionType === 'INBOUND' ? '#10b981' : '#9ca3af',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s'
              }}
            >
              <ArrowDownRight size={18} /> + 입고 (재고 증가)
            </button>
            <button
              type="button"
              onClick={() => setTransactionType('OUTBOUND')}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: 10,
                border: '1.5px solid',
                borderColor: transactionType === 'OUTBOUND' ? '#ef4444' : '#1f293d',
                background: transactionType === 'OUTBOUND' ? 'rgba(239, 68, 68, 0.15)' : '#090d16',
                color: transactionType === 'OUTBOUND' ? '#ef4444' : '#9ca3af',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s'
              }}
            >
              <ArrowUpRight size={18} /> - 출고 (재고 차감)
            </button>
          </div>

          {/* Quantity Input & Presets */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', color: '#9ca3af', marginBottom: '0.4rem' }}>
              변동 수량 입력
            </label>
            <input
              type="number"
              min="1"
              max={transactionType === 'OUTBOUND' ? currentQty : 999999}
              value={changeQty}
              onChange={e => setChangeQty(Math.max(1, parseInt(e.target.value) || 1))}
              style={{
                width: '100%',
                background: '#090d16',
                border: '1px solid #1f293d',
                borderRadius: 8,
                padding: '0.65rem 1rem',
                color: '#fff',
                fontSize: '1.1rem',
                fontWeight: 700,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />

            {/* Presets */}
            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>
              {[1, 5, 10, 50, 100].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleQuickPreset(amt)}
                  style={{
                    background: '#1f293d',
                    border: '1px solid #374151',
                    color: '#cbd5e1',
                    borderRadius: 6,
                    padding: '0.25rem 0.6rem',
                    fontSize: '0.78rem',
                    cursor: 'pointer'
                  }}
                >
                  +{amt}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setChangeQty(1)}
                style={{
                  background: '#1f293d',
                  border: '1px solid #374151',
                  color: '#9ca3af',
                  borderRadius: 6,
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  marginLeft: 'auto'
                }}
              >
                초기화
              </button>
            </div>
          </div>

          {/* Real-time Calculation Preview Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid #1f293d',
            borderRadius: 10,
            padding: '0.85rem 1rem',
            marginBottom: '1.25rem'
          }}>
            <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: '0.5rem' }}>
              실시간 재고 변동 예측
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.82rem', color: '#9ca3af' }}>현재: </span>
                <span style={{ fontWeight: 700, color: '#fff' }}>{currentQty}개</span>
              </div>
              <span style={{ color: '#06b6d4' }}>➔</span>
              <div>
                <span style={{ fontSize: '0.82rem', color: '#9ca3af' }}>예상 잔여: </span>
                <span style={{
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  color: isOutOfStockProjected ? '#ef4444' : (isLowStockProjected ? '#fbbf24' : '#10b981')
                }}>
                  {projectedQty}개
                </span>
              </div>
              <div>
                {isOutOfStockProjected ? (
                  <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                    <AlertOctagon size={12} /> 품절 예정
                  </span>
                ) : isLowStockProjected ? (
                  <span style={{ color: '#fbbf24', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                    <AlertTriangle size={12} /> 재고 부족
                  </span>
                ) : (
                  <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                    <CheckCircle2 size={12} /> 정상 유지
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Memo / Notes */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', color: '#9ca3af', marginBottom: '0.4rem' }}>
              입출고 사유 / 메모 (선택)
            </label>
            <input
              type="text"
              placeholder="예: 정기 발주 입고, 고객 긴급 출고 등"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              style={{
                width: '100%',
                background: '#090d16',
                border: '1px solid #1f293d',
                borderRadius: 8,
                padding: '0.55rem 0.85rem',
                color: '#fff',
                fontSize: '0.85rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: '1px solid #1f293d',
                color: '#9ca3af',
                padding: '0.6rem 1.1rem',
                borderRadius: 8,
                fontSize: '0.88rem',
                cursor: 'pointer'
              }}
            >
              취소
            </button>
            <button
              type="submit"
              style={{
                background: transactionType === 'INBOUND' ? '#10b981' : '#ef4444',
                color: '#fff',
                border: 'none',
                padding: '0.6rem 1.4rem',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer'
              }}
            >
              {transactionType === 'INBOUND' ? '+ 입고 완료' : '- 출고 완료'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
