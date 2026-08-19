import React, { useState } from 'react';
import { PieChart, BarChart3, Warehouse, Activity, CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';

const COLOR_PALETTE = [
  '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', 
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'
];

export default function AnalyticsCharts({
  items,
  selectedCategory,
  setSelectedCategory,
  selectedLocation,
  setSelectedLocation,
  selectedStatusFilter,
  setSelectedStatusFilter
}) {
  const [activeTab, setActiveTab] = useState('category'); // 'category' | 'warehouse' | 'status'
  const [categoryMetric, setCategoryMetric] = useState('quantity'); // 'quantity' | 'valuation'

  const totalStockQuantity = items.reduce((acc, i) => acc + (Number(i.stock_quantity) || 0), 0);
  const totalValuation = items.reduce((acc, i) => acc + ((Number(i.stock_quantity) || 0) * (Number(i.unit_price) || 0)), 0);

  // 1. Category Distribution
  const categoryStatsMap = {};
  items.forEach(i => {
    const cat = i.category || '기타';
    if (!categoryStatsMap[cat]) {
      categoryStatsMap[cat] = { quantity: 0, valuation: 0, count: 0 };
    }
    const qty = Number(i.stock_quantity) || 0;
    const price = Number(i.unit_price) || 0;
    categoryStatsMap[cat].quantity += qty;
    categoryStatsMap[cat].valuation += qty * price;
    categoryStatsMap[cat].count += 1;
  });

  const categoryList = Object.keys(categoryStatsMap).map((catName, idx) => {
    const data = categoryStatsMap[catName];
    const qtyPct = totalStockQuantity > 0 ? Math.round((data.quantity / totalStockQuantity) * 100) : 0;
    const valPct = totalValuation > 0 ? Math.round((data.valuation / totalValuation) * 100) : 0;
    return {
      name: catName,
      quantity: data.quantity,
      valuation: data.valuation,
      itemCount: data.count,
      percentage: categoryMetric === 'quantity' ? qtyPct : valPct,
      color: COLOR_PALETTE[idx % COLOR_PALETTE.length]
    };
  }).sort((a, b) => categoryMetric === 'quantity' ? b.quantity - a.quantity : b.valuation - a.valuation);

  // 2. Warehouse Distribution
  const warehouseStatsMap = {};
  items.forEach(i => {
    const loc = i.warehouse_location || '미지정';
    if (!warehouseStatsMap[loc]) {
      warehouseStatsMap[loc] = { quantity: 0, valuation: 0, count: 0 };
    }
    const qty = Number(i.stock_quantity) || 0;
    const price = Number(i.unit_price) || 0;
    warehouseStatsMap[loc].quantity += qty;
    warehouseStatsMap[loc].valuation += qty * price;
    warehouseStatsMap[loc].count += 1;
  });

  const warehouseList = Object.keys(warehouseStatsMap).map((locName, idx) => {
    const data = warehouseStatsMap[locName];
    const qtyPct = totalStockQuantity > 0 ? Math.round((data.quantity / totalStockQuantity) * 100) : 0;
    return {
      name: locName,
      quantity: data.quantity,
      valuation: data.valuation,
      itemCount: data.count,
      percentage: qtyPct,
      color: COLOR_PALETTE[(idx + 3) % COLOR_PALETTE.length]
    };
  }).sort((a, b) => b.quantity - a.quantity);

  // 3. Status Distribution
  const normalItems = items.filter(i => (Number(i.stock_quantity) || 0) >= (Number(i.safety_stock) || 0));
  const lowStockItems = items.filter(i => {
    const q = Number(i.stock_quantity) || 0;
    const s = Number(i.safety_stock) || 0;
    return q > 0 && q < s;
  });
  const outOfStockItems = items.filter(i => (Number(i.stock_quantity) || 0) === 0);

  const totalCount = items.length || 1;
  const statusStats = [
    {
      id: 'NORMAL',
      label: '정상 재고',
      count: normalItems.length,
      percentage: Math.round((normalItems.length / totalCount) * 100),
      color: '#10b981',
      icon: CheckCircle2,
      bgColor: 'rgba(16, 185, 129, 0.15)'
    },
    {
      id: 'LOW_STOCK',
      label: '재고 부족',
      count: lowStockItems.length,
      percentage: Math.round((lowStockItems.length / totalCount) * 100),
      color: '#f59e0b',
      icon: AlertTriangle,
      bgColor: 'rgba(245, 158, 11, 0.15)'
    },
    {
      id: 'OUT_OF_STOCK',
      label: '품절 / 소진',
      count: outOfStockItems.length,
      percentage: Math.round((outOfStockItems.length / totalCount) * 100),
      color: '#ef4444',
      icon: AlertOctagon,
      bgColor: 'rgba(239, 68, 68, 0.15)'
    }
  ];

  return (
    <div style={{
      background: '#111827',
      border: '1px solid #1f293d',
      borderRadius: 14,
      padding: '1.25rem 1.5rem',
      marginBottom: '1.75rem'
    }}>
      {/* Header & Tabs */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '0.75rem',
        borderBottom: '1px solid #1f293d',
        paddingBottom: '0.85rem',
        marginBottom: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart3 size={18} color="#06b6d4" />
          <span style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
            재고 다차원 통계 분석
          </span>
          <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
            (항목 클릭 시 목록 자동 필터링)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Tab Buttons */}
          <div style={{ display: 'flex', background: '#090d16', padding: '0.2rem', borderRadius: 8, border: '1px solid #1f293d' }}>
            <button
              onClick={() => setActiveTab('category')}
              style={{
                background: activeTab === 'category' ? '#1f293d' : 'transparent',
                color: activeTab === 'category' ? '#38bdf8' : '#9ca3af',
                border: 'none',
                padding: '0.35rem 0.75rem',
                borderRadius: 6,
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <PieChart size={14} /> 카테고리별 ({categoryList.length})
            </button>
            <button
              onClick={() => setActiveTab('warehouse')}
              style={{
                background: activeTab === 'warehouse' ? '#1f293d' : 'transparent',
                color: activeTab === 'warehouse' ? '#38bdf8' : '#9ca3af',
                border: 'none',
                padding: '0.35rem 0.75rem',
                borderRadius: 6,
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <Warehouse size={14} /> 보관 창고별 ({warehouseList.length})
            </button>
            <button
              onClick={() => setActiveTab('status')}
              style={{
                background: activeTab === 'status' ? '#1f293d' : 'transparent',
                color: activeTab === 'status' ? '#38bdf8' : '#9ca3af',
                border: 'none',
                padding: '0.35rem 0.75rem',
                borderRadius: 6,
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <Activity size={14} /> 상태 비중
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Category Distribution */}
      {activeTab === 'category' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.82rem', color: '#9ca3af' }}>
              카테고리 항목을 클릭하면 해당 카테고리만 즉시 필터링됩니다.
            </div>
            {/* Metric Mode Toggle */}
            <div style={{ display: 'flex', gap: '0.35rem', background: '#090d16', padding: '0.2rem', borderRadius: 6, border: '1px solid #1f293d' }}>
              <button
                onClick={() => setCategoryMetric('quantity')}
                style={{
                  background: categoryMetric === 'quantity' ? '#06b6d4' : 'transparent',
                  color: categoryMetric === 'quantity' ? '#fff' : '#9ca3af',
                  border: 'none',
                  padding: '0.25rem 0.55rem',
                  borderRadius: 4,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                수량 기준
              </button>
              <button
                onClick={() => setCategoryMetric('valuation')}
                style={{
                  background: categoryMetric === 'valuation' ? '#10b981' : 'transparent',
                  color: categoryMetric === 'valuation' ? '#fff' : '#9ca3af',
                  border: 'none',
                  padding: '0.25rem 0.55rem',
                  borderRadius: 4,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                평가금액 기준
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.75rem' }}>
            {categoryList.map(cat => {
              const isSelected = selectedCategory === cat.name;
              return (
                <div
                  key={cat.name}
                  onClick={() => setSelectedCategory(isSelected ? 'ALL' : cat.name)}
                  style={{
                    cursor: 'pointer',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 10,
                    transition: 'all 0.2s ease',
                    background: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                    border: isSelected ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.05)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: cat.color }} />
                      <span style={{ fontWeight: 600, fontSize: '0.88rem', color: isSelected ? '#38bdf8' : '#fff' }}>
                        {cat.name}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
                        ({cat.itemCount}개 SKU)
                      </span>
                      {isSelected && <span style={{ fontSize: '0.7rem', color: '#06b6d4', fontWeight: 600 }}>[선택됨]</span>}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#fff', fontFamily: 'monospace' }}>
                        {categoryMetric === 'quantity'
                          ? `${cat.quantity.toLocaleString()} 개`
                          : `₩${cat.valuation.toLocaleString()}`
                        }
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#9ca3af', marginLeft: '0.4rem' }}>
                        ({cat.percentage}%)
                      </span>
                    </div>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255, 255, 255, 0.06)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.max(2, cat.percentage)}%`,
                      background: cat.color,
                      borderRadius: 3,
                      transition: 'width 0.4s ease'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Warehouse Distribution */}
      {activeTab === 'warehouse' && (
        <div>
          <div style={{ fontSize: '0.82rem', color: '#9ca3af', marginBottom: '1rem' }}>
            보관 창고 구역별 재고량 및 품목 분포 현황입니다. 클릭 시 해당 창고 품목으로 필터링됩니다.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.75rem' }}>
            {warehouseList.map(wh => {
              const isSelected = selectedLocation === wh.name;
              return (
                <div
                  key={wh.name}
                  onClick={() => setSelectedLocation(isSelected ? 'ALL' : wh.name)}
                  style={{
                    cursor: 'pointer',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 10,
                    transition: 'all 0.2s ease',
                    background: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                    border: isSelected ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.05)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <Warehouse size={14} color={wh.color} />
                      <span style={{ fontWeight: 600, fontSize: '0.88rem', color: isSelected ? '#34d399' : '#fff' }}>
                        {wh.name}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
                        ({wh.itemCount}개 SKU)
                      </span>
                      {isSelected && <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>[선택됨]</span>}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#fff', fontFamily: 'monospace' }}>
                        {wh.quantity.toLocaleString()} 개
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#9ca3af', marginLeft: '0.4rem' }}>
                        ({wh.percentage}%)
                      </span>
                    </div>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255, 255, 255, 0.06)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.max(2, wh.percentage)}%`,
                      background: wh.color,
                      borderRadius: 3,
                      transition: 'width 0.4s ease'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Status Ratio */}
      {activeTab === 'status' && (
        <div>
          <div style={{ fontSize: '0.82rem', color: '#9ca3af', marginBottom: '1rem' }}>
            전체 관리 품목의 정상, 재고부족, 품절 상태 비중입니다. 상태 카드를 클릭하여 즉시 필터링하세요.
          </div>

          {/* Segmented Bar */}
          <div style={{
            display: 'flex',
            height: 12,
            borderRadius: 6,
            overflow: 'hidden',
            marginBottom: '1.25rem',
            background: 'rgba(255, 255, 255, 0.05)'
          }}>
            {statusStats.map(s => (
              <div
                key={s.id}
                style={{
                  width: `${s.percentage}%`,
                  backgroundColor: s.color,
                  transition: 'width 0.4s ease'
                }}
                title={`${s.label}: ${s.count}개 (${s.percentage}%)`}
              />
            ))}
          </div>

          {/* Status Metric Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
            {statusStats.map(s => {
              const isSelected = selectedStatusFilter === s.id;
              const IconComponent = s.icon;
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedStatusFilter(isSelected ? 'ALL' : s.id)}
                  style={{
                    cursor: 'pointer',
                    padding: '0.75rem 1rem',
                    borderRadius: 10,
                    background: isSelected ? s.bgColor : 'rgba(255, 255, 255, 0.02)',
                    border: isSelected ? `1.5px solid ${s.color}` : '1px solid rgba(255, 255, 255, 0.05)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: s.color, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <IconComponent size={15} /> {s.label}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{s.percentage}%</span>
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
                    {s.count} <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 400 }}>개 품목</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
