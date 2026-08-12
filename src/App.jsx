import React, { useState, useEffect } from 'react';
import { 
  Package, AlertTriangle, Plus, ArrowUpRight, ArrowDownRight, 
  Search, Filter, RefreshCw, Database, History, Trash2, CheckCircle2, X, PlusCircle
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from './lib/supabase';

const INITIAL_PRODUCTS = [
  { id: '1', sku: 'SKU-1001', name: '유기농 제주 감귤 5kg', category: '식품/신선', quantity: 45, min_quantity: 15, unit_price: 25000 },
  { id: '2', sku: 'SKU-1002', name: '프리미엄 원두 커피 1kg', category: '음료/차', quantity: 8, min_quantity: 10, unit_price: 32000 },
  { id: '3', sku: 'SKU-1003', name: '친환경 종이컵 1000개입', category: '소모품', quantity: 120, min_quantity: 30, unit_price: 18000 },
  { id: '4', sku: 'SKU-1004', name: '스테인리스 텀블러 500ml', category: '잡화', quantity: 4, min_quantity: 10, unit_price: 22000 },
  { id: '5', sku: 'SKU-1005', name: '콜드브루 추출 원액 500ml', category: '음료/차', quantity: 25, min_quantity: 8, unit_price: 15000 },
];

export default function App() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [loading, setLoading] = useState(false);

  // Modals
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Stock Form State
  const [logType, setLogType] = useState('IN');
  const [changeAmount, setChangeAmount] = useState(1);
  const [changeReason, setChangeReason] = useState('');

  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    sku: '',
    name: '',
    category: '식품/신선',
    quantity: 10,
    min_quantity: 5,
    unit_price: 10000
  });

  // Fetch Products from Supabase or Fallback
  const fetchProducts = async () => {
    if (!isSupabaseConfigured || !supabase) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase fetch error:', error);
      } else if (data && data.length > 0) {
        setProducts(data);
      }
    } catch (err) {
      console.error('Fetch exception:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Inventory Logs
  const fetchLogs = async () => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { data, error } = await supabase
        .from('inventory_logs')
        .select('*, products(name, sku)')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        setLogs(data);
      }
    } catch (err) {
      console.error('Fetch logs exception:', err);
    }
  };

  useEffect(() => {
    fetchProducts();

    if (isSupabaseConfigured && supabase) {
      // Realtime subscription for products table
      const channel = supabase
        .channel('public:products')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
          fetchProducts();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  // Handle Stock Update
  const handleStockUpdate = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const amount = Number(changeAmount);
    const newQty = logType === 'IN' 
      ? selectedProduct.quantity + amount 
      : Math.max(0, selectedProduct.quantity - amount);

    // Update state locally first
    setProducts(prev => prev.map(p => p.id === selectedProduct.id ? { ...p, quantity: newQty } : p));

    // Add local log
    const newLog = {
      id: Date.now().toString(),
      product_id: selectedProduct.id,
      products: { name: selectedProduct.name, sku: selectedProduct.sku },
      type: logType,
      amount,
      reason: changeReason || (logType === 'IN' ? '정기 재고 입고' : '고객 주문 출고'),
      created_at: new Date().toISOString()
    };
    setLogs(prev => [newLog, ...prev]);

    // Update Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('products')
          .update({ quantity: newQty, updated_at: new Date().toISOString() })
          .eq('id', selectedProduct.id);

        await supabase
          .from('inventory_logs')
          .insert({
            product_id: selectedProduct.id,
            type: logType,
            amount: amount,
            reason: changeReason || (logType === 'IN' ? '정기 입고' : '출고 처리')
          });
      } catch (err) {
        console.error('Supabase update failed:', err);
      }
    }

    setIsStockModalOpen(false);
    setSelectedProduct(null);
    setChangeAmount(1);
    setChangeReason('');
  };

  // Handle Add New Product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.sku || !newProduct.name) return;

    const createdProduct = {
      id: isSupabaseConfigured ? undefined : Date.now().toString(),
      sku: newProduct.sku.toUpperCase(),
      name: newProduct.name,
      category: newProduct.category,
      quantity: Number(newProduct.quantity),
      min_quantity: Number(newProduct.min_quantity),
      unit_price: Number(newProduct.unit_price)
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('products')
        .insert([createdProduct])
        .select();

      if (error) {
        alert(`Supabase 추가 실패: ${error.message}`);
      } else if (data && data[0]) {
        setProducts(prev => [data[0], ...prev]);
      }
    } else {
      setProducts(prev => [{ ...createdProduct, id: Date.now().toString() }, ...prev]);
    }

    setIsAddProductModalOpen(false);
    setNewProduct({
      sku: '',
      name: '',
      category: '식품/신선',
      quantity: 10,
      min_quantity: 5,
      unit_price: 10000
    });
  };

  // Handle Product Delete
  const handleDeleteProduct = async (id, name) => {
    if (!confirm(`'${name}' 상품을 virkelig 삭제하시겠습니까?`)) return;

    setProducts(prev => prev.filter(p => p.id !== id));

    if (isSupabaseConfigured && supabase) {
      await supabase.from('products').delete().eq('id', id);
    }
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.includes(searchTerm) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Stats
  const totalItemsCount = products.reduce((acc, p) => acc + (p.quantity || 0), 0);
  const lowStockCount = products.filter(p => p.quantity < p.min_quantity).length;
  const totalInventoryValue = products.reduce((acc, p) => acc + ((p.quantity || 0) * (p.unit_price || 0)), 0);
  const categories = ['ALL', ...Array.from(new Set(products.map(p => p.category)))];

  return (
    <div style={{ backgroundColor: '#0b0f19', color: '#f3f4f6', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid #1f293d', backgroundColor: '#0d1322', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)' }}>
            <Package size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#fff', letterSpacing: '-0.02em' }}>Vibe Inventory System</h1>
            <p style={{ fontSize: '0.75rem', color: '#06b6d4', margin: 0, fontWeight: 500 }}>GitHub + Supabase + Cloudflare Pages Masterclass</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            onClick={() => { fetchLogs(); setIsLogsModalOpen(true); }}
            style={{ background: '#1f293d', border: '1px solid #374151', color: '#e5e7eb', padding: '0.45rem 0.9rem', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}
          >
            <History size={15} /> 입출고 이력
          </button>

          <div style={{ 
            background: isSupabaseConfigured ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)', 
            border: isSupabaseConfigured ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)', 
            color: isSupabaseConfigured ? '#10b981' : '#f59e0b', 
            padding: '0.4rem 0.85rem', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' 
          }}>
            <Database size={14} /> 
            {isSupabaseConfigured ? 'Supabase DB Live Connected' : 'Mock Local Mode (.env.local 설정 필요)'}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem' }}>
        
        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          <div style={{ background: '#111827', border: '1px solid #1f293d', borderRadius: 12, padding: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '0.4rem' }}>전체 보유 재고 수량</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
              {totalItemsCount.toLocaleString()} <span style={{ fontSize: '1rem', color: '#6b7280', fontWeight: 400 }}>개</span>
            </div>
          </div>

          <div style={{ background: '#111827', border: lowStockCount > 0 ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid #1f293d', borderRadius: 12, padding: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', color: lowStockCount > 0 ? '#f87171' : '#9ca3af', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlertTriangle size={16} /> 안전재고 부족 알림
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: lowStockCount > 0 ? '#ef4444' : '#fff' }}>
              {lowStockCount} <span style={{ fontSize: '1rem', color: '#6b7280', fontWeight: 400 }}>품목 경고</span>
            </div>
          </div>

          <div style={{ background: '#111827', border: '1px solid #1f293d', borderRadius: 12, padding: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '0.4rem' }}>총 재고 자산 평가액</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#60a5fa' }}>
              ₩{totalInventoryValue.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div style={{ background: '#111827', border: '1px solid #1f293d', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flex: 1, minWidth: 280 }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} color="#6b7280" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="제품명 또는 SKU 코드 검색..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ width: '100%', background: '#090d16', border: '1px solid #1f293d', borderRadius: 8, padding: '0.55rem 1rem 0.55rem 2.4rem', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>

            {/* Category Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={18} color="#6b7280" />
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                style={{ background: '#090d16', border: '1px solid #1f293d', borderRadius: 8, padding: '0.55rem 1rem', color: '#fff', fontSize: '0.9rem', outline: 'none', cursor: 'pointer' }}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat === 'ALL' ? '전체 카테고리' : cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => fetchProducts()}
              style={{ background: '#1f293d', border: '1px solid #374151', color: '#9ca3af', padding: '0.55rem 0.85rem', borderRadius: 8, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <RefreshCw size={15} className={loading ? 'spin' : ''} /> 새로고침
            </button>
            <button
              onClick={() => setIsAddProductModalOpen(true)}
              style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '0.55rem 1.1rem', borderRadius: 8, fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}
            >
              <PlusCircle size={16} /> 신규 상품 등록
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ background: '#111827', border: '1px solid #1f293d', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid #1f293d', color: '#9ca3af' }}>
                <th style={{ padding: '0.85rem 1.25rem' }}>SKU 코드</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>제품명</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>카테고리</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>현재 재고량</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>단가</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>상태</th>
                <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                    등록된 상품이 없거나 검색 결과가 없습니다.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => {
                  const isLowStock = p.quantity < p.min_quantity;
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', backgroundColor: isLowStock ? 'rgba(239, 68, 68, 0.04)' : 'transparent' }}>
                      <td style={{ padding: '1rem 1.25rem', fontFamily: 'monospace', color: '#93c5fd', fontWeight: 600 }}>{p.sku}</td>
                      <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: '#fff' }}>{p.name}</td>
                      <td style={{ padding: '1rem 1.25rem', color: '#9ca3af' }}>{p.category}</td>
                      <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: isLowStock ? '#ef4444' : '#fff' }}>
                        {p.quantity} 개 <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 400 }}>(안전: {p.min_quantity})</span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', color: '#e5e7eb' }}>₩{(p.unit_price || 0).toLocaleString()}</td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        {isLowStock ? (
                          <span style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '0.25rem 0.65rem', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <AlertTriangle size={12} /> 재고 부족
                          </span>
                        ) : (
                          <span style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', padding: '0.25rem 0.65rem', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <CheckCircle2 size={12} /> 정상
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button 
                            onClick={() => { setSelectedProduct(p); setIsStockModalOpen(true); }}
                            style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                          >
                            입/출고
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '0.4rem 0.6rem', borderRadius: 6, fontSize: '0.8rem', cursor: 'pointer' }}
                            title="삭제"
                          >
                            <Trash2 size={14} />
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

        {/* Modal: Stock Update */}
        {isStockModalOpen && selectedProduct && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: '#111827', border: '1px solid #1f293d', borderRadius: 16, width: 440, padding: '1.75rem', color: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>재고 입출고 변경</h3>
                <button onClick={() => setIsStockModalOpen(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}><X size={20} /></button>
              </div>
              <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.85rem', color: '#9ca3af' }}>{selectedProduct.name} ({selectedProduct.sku})</p>

              <form onSubmit={handleStockUpdate}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  <button
                    type="button"
                    onClick={() => setLogType('IN')}
                    style={{ flex: 1, padding: '0.65rem', borderRadius: 8, border: '1px solid', borderColor: logType === 'IN' ? '#10b981' : '#1f293d', background: logType === 'IN' ? 'rgba(16, 185, 129, 0.15)' : '#090d16', color: logType === 'IN' ? '#10b981' : '#9ca3af', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                  >
                    <ArrowUpRight size={16} /> 입고 (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogType('OUT')}
                    style={{ flex: 1, padding: '0.65rem', borderRadius: 8, border: '1px solid', borderColor: logType === 'OUT' ? '#ef4444' : '#1f293d', background: logType === 'OUT' ? 'rgba(239, 68, 68, 0.15)' : '#090d16', color: logType === 'OUT' ? '#ef4444' : '#9ca3af', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                  >
                    <ArrowDownRight size={16} /> 출고 (-)
                  </button>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '0.4rem' }}>수량</label>
                  <input
                    type="number"
                    min="1"
                    value={changeAmount}
                    onChange={e => setChangeAmount(e.target.value)}
                    style={{ width: '100%', background: '#090d16', border: '1px solid #1f293d', borderRadius: 8, padding: '0.6rem 1rem', color: '#fff', fontSize: '1rem', outline: 'none' }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '0.4rem' }}>사유 / 메모 (선택)</label>
                  <input
                    type="text"
                    placeholder="예: 발주 입고, 고객 변심 반품, 손실 처리 등"
                    value={changeReason}
                    onChange={e => setChangeReason(e.target.value)}
                    style={{ width: '100%', background: '#090d16', border: '1px solid #1f293d', borderRadius: 8, padding: '0.6rem 1rem', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setIsStockModalOpen(false)}
                    style={{ background: 'transparent', border: '1px solid #1f293d', color: '#9ca3af', padding: '0.55rem 1rem', borderRadius: 8, cursor: 'pointer' }}
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    style={{ background: logType === 'IN' ? '#10b981' : '#ef4444', color: '#fff', border: 'none', padding: '0.55rem 1.25rem', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
                  >
                    저장하기
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add New Product */}
        {isAddProductModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: '#111827', border: '1px solid #1f293d', borderRadius: 16, width: 480, padding: '1.75rem', color: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>신규 상품 등록</h3>
                <button onClick={() => setIsAddProductModalOpen(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}><X size={20} /></button>
              </div>

              <form onSubmit={handleAddProduct}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#9ca3af', marginBottom: '0.4rem' }}>SKU 코드</label>
                    <input
                      type="text"
                      placeholder="SKU-2001"
                      required
                      value={newProduct.sku}
                      onChange={e => setNewProduct({ ...newProduct, sku: e.target.value })}
                      style={{ width: '100%', background: '#090d16', border: '1px solid #1f293d', borderRadius: 8, padding: '0.55rem 0.85rem', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#9ca3af', marginBottom: '0.4rem' }}>카테고리</label>
                    <input
                      type="text"
                      placeholder="식품/신선"
                      required
                      value={newProduct.category}
                      onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                      style={{ width: '100%', background: '#090d16', border: '1px solid #1f293d', borderRadius: 8, padding: '0.55rem 0.85rem', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#9ca3af', marginBottom: '0.4rem' }}>제품명</label>
                  <input
                    type="text"
                    placeholder="예: 친환경 유기농 밀가루 1kg"
                    required
                    value={newProduct.name}
                    onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                    style={{ width: '100%', background: '#090d16', border: '1px solid #1f293d', borderRadius: 8, padding: '0.55rem 0.85rem', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.4rem' }}>초기 수량</label>
                    <input
                      type="number"
                      min="0"
                      value={newProduct.quantity}
                      onChange={e => setNewProduct({ ...newProduct, quantity: e.target.value })}
                      style={{ width: '100%', background: '#090d16', border: '1px solid #1f293d', borderRadius: 8, padding: '0.55rem 0.75rem', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.4rem' }}>안전 재고</label>
                    <input
                      type="number"
                      min="0"
                      value={newProduct.min_quantity}
                      onChange={e => setNewProduct({ ...newProduct, min_quantity: e.target.value })}
                      style={{ width: '100%', background: '#090d16', border: '1px solid #1f293d', borderRadius: 8, padding: '0.55rem 0.75rem', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.4rem' }}>단가(원)</label>
                    <input
                      type="number"
                      min="0"
                      value={newProduct.unit_price}
                      onChange={e => setNewProduct({ ...newProduct, unit_price: e.target.value })}
                      style={{ width: '100%', background: '#090d16', border: '1px solid #1f293d', borderRadius: 8, padding: '0.55rem 0.75rem', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setIsAddProductModalOpen(false)}
                    style={{ background: 'transparent', border: '1px solid #1f293d', color: '#9ca3af', padding: '0.55rem 1rem', borderRadius: 8, cursor: 'pointer' }}
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '0.55rem 1.25rem', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
                  >
                    등록 완료
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: View Logs */}
        {isLogsModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: '#111827', border: '1px solid #1f293d', borderRadius: 16, width: 620, maxHeight: '80vh', padding: '1.75rem', color: '#fff', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <History size={20} color="#3b82f6" /> 최근 입출고 이력 기록
                </h3>
                <button onClick={() => setIsLogsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}><X size={20} /></button>
              </div>

              <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.5rem' }}>
                {logs.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem 0' }}>최근 처리된 입출고 이력이 없습니다.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {logs.map((log, idx) => (
                      <div key={log.id || idx} style={{ background: '#090d16', border: '1px solid #1f293d', borderRadius: 8, padding: '0.85rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ 
                            background: log.type === 'IN' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: log.type === 'IN' ? '#10b981' : '#f87171',
                            padding: '0.25rem 0.6rem', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700
                          }}>
                            {log.type === 'IN' ? '+ 입고' : '- 출고'}
                          </span>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>
                              {log.products?.name || '상품'} <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>({log.products?.sku})</span>
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>{log.reason || '사유 미기재'}</div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 700, color: log.type === 'IN' ? '#10b981' : '#f87171' }}>
                            {log.type === 'IN' ? `+${log.amount}` : `-${log.amount}`} 개
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>
                            {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
