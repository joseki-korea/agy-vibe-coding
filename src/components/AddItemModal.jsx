import React, { useState } from 'react';
import { X, PlusCircle, PackagePlus } from 'lucide-react';

const COMMON_CATEGORIES = ['전자부품', '핵심부품', '소모품', '기계부품', '외장재', '원자재', '포장재'];
const COMMON_LOCATIONS = ['창고 A-01', '창고 A-05', '창고 A-12', '창고 B-03', '창고 C-01', '창고 D-02'];

export default function AddItemModal({
  isOpen,
  onClose,
  onSubmit
}) {
  const [formData, setFormData] = useState({
    item_code: '',
    name: '',
    category: '전자부품',
    stock_quantity: 20,
    safety_stock: 10,
    unit_price: 50000,
    warehouse_location: '창고 A-01'
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.item_code.trim() || !formData.name.trim()) return;

    onSubmit({
      ...formData,
      item_code: formData.item_code.trim().toUpperCase(),
      name: formData.name.trim(),
      stock_quantity: Number(formData.stock_quantity) || 0,
      safety_stock: Number(formData.safety_stock) || 0,
      unit_price: Number(formData.unit_price) || 0,
      warehouse_location: formData.warehouse_location.trim() || '창고 A-01'
    });

    setFormData({
      item_code: '',
      name: '',
      category: '전자부품',
      stock_quantity: 20,
      safety_stock: 10,
      unit_price: 50000,
      warehouse_location: '창고 A-01'
    });
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
        maxWidth: 520,
        padding: '1.75rem',
        color: '#fff',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <PackagePlus size={18} color="#fff" />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>신규 재고 품목 등록</h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 4 }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Row 1: Code & Category */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#9ca3af', marginBottom: '0.4rem' }}>
                품목 코드 (SKU) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="예: AGY-TEST-006"
                required
                value={formData.item_code}
                onChange={e => setFormData({ ...formData, item_code: e.target.value })}
                style={{
                  width: '100%',
                  background: '#090d16',
                  border: '1px solid #1f293d',
                  borderRadius: 8,
                  padding: '0.6rem 0.85rem',
                  color: '#fff',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#9ca3af', marginBottom: '0.4rem' }}>
                카테고리 <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                list="category-suggestions"
                placeholder="예: 전자부품"
                required
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                style={{
                  width: '100%',
                  background: '#090d16',
                  border: '1px solid #1f293d',
                  borderRadius: 8,
                  padding: '0.6rem 0.85rem',
                  color: '#fff',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <datalist id="category-suggestions">
                {COMMON_CATEGORIES.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>
          </div>

          {/* Row 2: Item Name */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', color: '#9ca3af', marginBottom: '0.4rem' }}>
              품목명 <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="예: 안티그래비티 신형 고정밀 센서"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              style={{
                width: '100%',
                background: '#090d16',
                border: '1px solid #1f293d',
                borderRadius: 8,
                padding: '0.6rem 0.85rem',
                color: '#fff',
                fontSize: '0.88rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Row 3: Unit Price & Location */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#9ca3af', marginBottom: '0.4rem' }}>
                단가 (KRW ₩)
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={formData.unit_price}
                onChange={e => setFormData({ ...formData, unit_price: e.target.value })}
                style={{
                  width: '100%',
                  background: '#090d16',
                  border: '1px solid #1f293d',
                  borderRadius: 8,
                  padding: '0.6rem 0.85rem',
                  color: '#fff',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#9ca3af', marginBottom: '0.4rem' }}>
                보관 위치
              </label>
              <input
                type="text"
                list="location-suggestions"
                placeholder="예: 창고 A-01"
                value={formData.warehouse_location}
                onChange={e => setFormData({ ...formData, warehouse_location: e.target.value })}
                style={{
                  width: '100%',
                  background: '#090d16',
                  border: '1px solid #1f293d',
                  borderRadius: 8,
                  padding: '0.6rem 0.85rem',
                  color: '#fff',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <datalist id="location-suggestions">
                {COMMON_LOCATIONS.map(l => <option key={l} value={l} />)}
              </datalist>
            </div>
          </div>

          {/* Row 4: Initial Stock & Safety Stock */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#9ca3af', marginBottom: '0.4rem' }}>
                초기 재고 수량
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock_quantity}
                onChange={e => setFormData({ ...formData, stock_quantity: e.target.value })}
                style={{
                  width: '100%',
                  background: '#090d16',
                  border: '1px solid #1f293d',
                  borderRadius: 8,
                  padding: '0.6rem 0.85rem',
                  color: '#fff',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#9ca3af', marginBottom: '0.4rem' }}>
                안전 재고 기준 수량
              </label>
              <input
                type="number"
                min="0"
                value={formData.safety_stock}
                onChange={e => setFormData({ ...formData, safety_stock: e.target.value })}
                style={{
                  width: '100%',
                  background: '#090d16',
                  border: '1px solid #1f293d',
                  borderRadius: 8,
                  padding: '0.6rem 0.85rem',
                  color: '#fff',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
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
                background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                color: '#fff',
                border: 'none',
                padding: '0.6rem 1.4rem',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <PlusCircle size={16} /> 신규 품목 등록
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
