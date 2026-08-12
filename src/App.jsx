import React, { useState, useEffect } from 'react';
import { 
  Package, AlertTriangle, Plus, ArrowUpRight, ArrowDownRight, 
  Search, Filter, RefreshCw, Database, History, Trash2, CheckCircle2, X, PlusCircle, Building2, ShieldAlert
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from './lib/supabase';

const TEST_INITIAL_ITEMS = [
  { id: '1', item_code: 'AGY-TEST-001', name: '안티그래비티 AI 센서 모듈 v1', category: '전자부품', stock_quantity: 150, safety_stock: 30, unit_price: 45000, warehouse_location: '창고 A-12', status: 'NORMAL' },
  { id: '2', item_code: 'AGY-TEST-002', name: '고성능 임베디드 코어 제어판', category: '핵심부품', stock_quantity: 8, safety_stock: 15, unit_price: 120000, warehouse_location: '창고 B-03', status: 'LOW_STOCK' },
  { id: '3', item_code: 'AGY-TEST-003', name: '초고속 데이터 전송 케이블 2m', category: '소모품', stock_quantity: 500, safety_stock: 100, unit_price: 8500, warehouse_location: '창고 A-05', status: 'NORMAL' },
  { id: '4', item_code: 'AGY-TEST-004', name: '지능형 모터 드라이버 가이드', category: '기계부품', stock_quantity: 3, safety_stock: 10, unit_price: 89000, warehouse_location: '창고 C-01', status: 'LOW_STOCK' },
  { id: '5', item_code: 'AGY-TEST-005', name: '알루미늄 프레임 거치대 (대형)', category: '외장재', stock_quantity: 85, safety_stock: 20, unit_price: 35000, warehouse_location: '창고 A-08', status: 'NORMAL' },
];

const TEST_WAREHOUSES = [
  { id: 'w1', name: '제1 메인 물류센터', location: '경기도 용인시 기흥구', manager_contact: '010-1234-5678' },
  { id: 'w2', name: '제2 남부 수도권 창고', location: '인천광역시 서구 물류단지', manager_contact: '010-9876-5432' }
];

export default function App() {
  const [items, setItems] = useState(TEST_INITIAL_ITEMS);
  const [warehouses, setWarehouses] = useState(TEST_WAREHOUSES);
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [loading, setLoading] = useState(false);

  // Modals
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Stock Form
  const [transactionType, setTransactionType] = useState('INBOUND');
  const [changeQty, setChangeQty] = useState(1);
  const [notes, setNotes] = useState('');

  // New Item Form
  const [newItem, setNewItem] = useState({
    item_code: '',
    name: '',
    category: '전자부품',
    stock_quantity: 20,
    safety_stock: 10,
    unit_price: 50000,
    warehouse_location: '창고 A-01'
  });

  // Fetch Items from Supabase (test_inventory_items)
  const fetchTestItems = async () => {
    if (!isSupabaseConfigured || !supabase) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('test_inventory_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        setItems(data);
      }
    } catch (err) {
      console.error('Supabase test items fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Transactions from Supabase (test_inventory_transactions)
  const fetchTransactions = async () => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { data, error } = await supabase
        .from('test_inventory_transactions')
        .select('*, test_inventory_items(name, item_code)')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        setTransactions(data);
      }
    } catch (err) {
      console.error('Fetch transactions error:', err);
    }
  };

  useEffect(() => {
    fetchTestItems();

    if (isSupabaseConfigured && supabase) {
      const channel = supabase
        .channel('public:test_inventory_items')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'test_inventory_items' }, () => {
          fetchTestItems();
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
    if (!selectedItem) return;

    const amount = Number(changeQty);
    let newQty = selectedItem.stock_quantity;
    if (transactionType === 'INBOUND') {
      newQty += amount;
    } else if (transactionType === 'OUTBOUND') {
      newQty = Math.max(0, newQty - amount);
    } else {
      newQty = amount; // ADJUSTMENT
    }

    const newStatus = newQty < selectedItem.safety_stock ? 'LOW_STOCK' : 'NORMAL';

    // Local State Update
    setItems(prev => prev.map(item => item.id === selectedItem.id ? { ...item, stock_quantity: newQty, status: newStatus } : item));

    const newTransaction = {
      id: Date.now().toString(),
      item_id: selectedItem.id,
      test_inventory_items: { name: selectedItem.name, item_code: selectedItem.item_code },
      transaction_type: transactionType,
      quantity: amount,
      unit_price: selectedItem.unit_price,
      handler_name: '안티그래비티 에이전트',
      notes: notes || (transactionType === 'INBOUND' ? '테스트 입고' : '테스트 출고'),
      created_at: new Date().toISOString()
    };
    setTransactions(prev => [newTransaction, ...prev]);

    // Supabase DB Update
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('test_inventory_items')
          .update({ stock_quantity: newQty, status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', selectedItem.id);

        await supabase
          .from('test_inventory_transactions')
          .insert({
            item_id: selectedItem.id,
            transaction_type: transactionType,
            quantity: amount,
            unit_price: selectedItem.unit_price,
            notes: notes || '안티그래비티 테스트 입출고'
          });
      } catch (err) {
        console.error('Supabase update failed:', err);
      }
    }

    setIsStockModalOpen(false);
    setSelectedItem(null);
    setChangeQty(1);
    setNotes('');
  };

  // Add Item
  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.item_code || !newItem.name) return;

    const stockQty = Number(newItem.stock_quantity);
    const safetyQty = Number(newItem.safety_stock);
    const status = stockQty < safetyQty ? 'LOW_STOCK' : 'NORMAL';

    const itemData = {
      item_code: newItem.item_code.toUpperCase(),
      name: newItem.name,
      category: newItem.category,
      stock_quantity: stockQty,
      safety_stock: safetyQty,
      unit_price: Number(newItem.unit_price),
      warehouse_location: newItem.warehouse_location,
      status
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('test_inventory_items')
        .insert([itemData])
        .select();

      if (error) {
        alert(`Supabase 항목 추가 오류: ${error.message}`);
      } else if (data && data[0]) {
        setItems(prev => [data[0], ...prev]);
      }
    } else {
      setItems(prev => [{ ...itemData, id: Date.now().toString() }, ...prev]);
    }

    setIsAddItemModalOpen(false);
    setNewItem({
      item_code: '',
      name: '',
      category: '전자부품',
      stock_quantity: 20,
      safety_stock: 10,
      unit_price: 50000,
      warehouse_location: '창고 A-01'
    });
  };

  // Delete Item
  const handleDeleteItem = async (id, name) => {
    if (!confirm(`'${name}' 테스트 제품을 삭제하시겠습니까?`)) return;
    setItems(prev => prev.filter(i => i.id !== id));
    if (isSupabaseConfigured && supabase) {
      await supabase.from('test_inventory_items').delete().eq('id', id);
    }
  };

  // Filtering
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.includes(searchTerm) || item.item_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalStock = items.reduce((acc, i) => acc + (i.stock_quantity || 0), 0);
  const lowStockItems = items.filter(i => (i.stock_quantity || 0) < (i.safety_stock || 0)).length;
  const totalValuation = items.reduce((acc, i) => acc + ((i.stock_quantity || 0) * (i.unit_price || 0)), 0);
  const categories = ['ALL', ...Array.from(new Set(items.map(i => i.category)))];

  return (
    <div style={{ backgroundColor: '#0b0f19', color: '#f3f4f6', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header Banner */}
      <header style={{ borderBottom: '1px solid #1f293d', backgroundColor: '#0d1322', padding: '1.1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(6, 182, 212, 0.4)' }}>
            <Package size={24} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#fff' }}>안티그래비티 바이브코딩 테스트 재고 앱</h1>
              <span style={{ background: 'rgba(6, 182, 212, 0.2)', border: '1px solid rgba(6, 182, 212, 0.4)', color: '#22d3ee', fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 12 }}>v2.5 TEST</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#9ca3af', margin: 0 }}>신규 테이블 연동 테스트: test_inventory_items & test_inventory_transactions</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            onClick={() => { fetchTransactions(); setIsLogsModalOpen(true); }}
            style={{ background: '#1f293d', border: '1px solid #374151', color: '#e5e7eb', padding: '0.5rem 0.9rem', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}
          >
            <History size={16} /> 입출고 내역
          </button>

          <div style={{ 
            background: isSupabaseConfigured ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)', 
            border: isSupabaseConfigured ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)', 
            color: isSupabaseConfigured ? '#10b981' : '#f59e0b', 
            padding: '0.45rem 0.85rem', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' 
          }}>
            <Database size={14} /> 
            {isSupabaseConfigured ? 'Supabase 신규 테이블 Live 연결' : 'Mock Local Mode (test_inventory_items)'}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem' }}>

        {/* Warehouse Overview Info Box */}
        <div style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))', border: '1px solid #1f293d', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Building2 size={20} color="#06b6d4" />
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>연동 창고: {warehouses.map(w => w.name).join(', ')}</span>
              <span style={{ fontSize: '0.78rem', color: '#9ca3af', marginLeft: '1rem' }}>| 관리 위치: 경기도 용인 / 인천 서구</span>
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontFamily: 'monospace' }}>TABLES: test_inventory_items, test_inventory_transactions</span>
        </div>
        
        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          <div style={{ background: '#111827', border: '1px solid #1f293d', borderRadius: 12, padding: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '0.4rem' }}>총 테스트 재고 수량</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
              {totalStock.toLocaleString()} <span style={{ fontSize: '1rem', color: '#6b7280', fontWeight: 400 }}>개</span>
            </div>
          </div>

          <div style={{ background: '#111827', border: lowStockItems > 0 ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid #1f293d', borderRadius: 12, padding: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', color: lowStockItems > 0 ? '#f87171' : '#9ca3af', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlertTriangle size={16} /> 안전재고 부족 경고
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: lowStockItems > 0 ? '#ef4444' : '#fff' }}>
              {lowStockItems} <span style={{ fontSize: '1rem', color: '#6b7280', fontWeight: 400 }}>품목 경고</span>
            </div>
          </div>

          <div style={{ background: '#111827', border: '1px solid #1f293d', borderRadius: 12, padding: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '0.4rem' }}>총 재고 자산 평가액</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#60a5fa' }}>
              ₩{totalValuation.toLocaleString()}
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
                placeholder="제품명 또는 코드 검색 (예: AGY-TEST-001)..."
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
              onClick={() => fetchTestItems()}
              style={{ background: '#1f293d', border: '1px solid #374151', color: '#9ca3af', padding: '0.55rem 0.85rem', borderRadius: 8, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <RefreshCw size={15} className={loading ? 'spin' : ''} /> 동기화
            </button>
            <button
              onClick={() => setIsAddItemModalOpen(true)}
              style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', color: '#fff', border: 'none', padding: '0.55rem 1.1rem', borderRadius: 8, fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)' }}
            >
              <PlusCircle size={16} /> 신규 재고 품목 추가
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ background: '#111827', border: '1px solid #1f293d', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid #1f293d', color: '#9ca3af' }}>
                <th style={{ padding: '0.85rem 1.25rem' }}>품목 코드</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>품목명</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>카테고리</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>보관 창고</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>현재 재고량</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>단가</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>상태</th>
                <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                    등록된 테스트 재고품이 없습니다.
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => {
                  const isLowStock = (item.stock_quantity || 0) < (item.safety_stock || 0);
                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', backgroundColor: isLowStock ? 'rgba(239, 68, 68, 0.04)' : 'transparent' }}>
                      <td style={{ padding: '1rem 1.25rem', fontFamily: 'monospace', color: '#38bdf8', fontWeight: 600 }}>{item.item_code}</td>
                      <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: '#fff' }}>{item.name}</td>
                      <td style={{ padding: '1rem 1.25rem', color: '#9ca3af' }}>{item.category}</td>
                      <td style={{ padding: '1rem 1.25rem', color: '#cbd5e1', fontSize: '0.85rem' }}>{item.warehouse_location || '창고 미지정'}</td>
                      <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: isLowStock ? '#ef4444' : '#fff' }}>
                        {item.stock_quantity} 개 <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 400 }}>(안전: {item.safety_stock})</span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', color: '#e5e7eb' }}>₩{(item.unit_price || 0).toLocaleString()}</td>
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
                            onClick={() => { setSelectedItem(item); setIsStockModalOpen(true); }}
                            style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                          >
                            입출고
                          </button>
                          <button 
                            onClick={() => handleDeleteItem(item.id, item.name)}
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
        {isStockModalOpen && selectedItem && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: '#111827', border: '1px solid #1f293d', borderRadius: 16, width: 440, padding: '1.75rem', color: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>테스트 재고 변동</h3>
                <button onClick={() => setIsStockModalOpen(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}><X size={20} /></button>
              </div>
              <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.85rem', color: '#9ca3af' }}>{selectedItem.name} ({selectedItem.item_code})</p>

              <form onSubmit={handleStockUpdate}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  <button
                    type="button"
                    onClick={() => setTransactionType('INBOUND')}
                    style={{ flex: 1, padding: '0.65rem', borderRadius: 8, border: '1px solid', borderColor: transactionType === 'INBOUND' ? '#10b981' : '#1f293d', background: transactionType === 'INBOUND' ? 'rgba(16, 185, 129, 0.15)' : '#090d16', color: transactionType === 'INBOUND' ? '#10b981' : '#9ca3af', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                  >
                    <ArrowUpRight size={16} /> 입고 (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransactionType('OUTBOUND')}
                    style={{ flex: 1, padding: '0.65rem', borderRadius: 8, border: '1px solid', borderColor: transactionType === 'OUTBOUND' ? '#ef4444' : '#1f293d', background: transactionType === 'OUTBOUND' ? 'rgba(239, 68, 68, 0.15)' : '#090d16', color: transactionType === 'OUTBOUND' ? '#ef4444' : '#9ca3af', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                  >
                    <ArrowDownRight size={16} /> 출고 (-)
                  </button>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '0.4rem' }}>수량</label>
                  <input
                    type="number"
                    min="1"
                    value={changeQty}
                    onChange={e => setChangeQty(e.target.value)}
                    style={{ width: '100%', background: '#090d16', border: '1px solid #1f293d', borderRadius: 8, padding: '0.6rem 1rem', color: '#fff', fontSize: '1rem', outline: 'none' }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '0.4rem' }}>테스트 사유 / 메모</label>
                  <input
                    type="text"
                    placeholder="예: 안티그래비티 바이브코딩 테스트 입고"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
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
                    style={{ background: transactionType === 'INBOUND' ? '#10b981' : '#ef4444', color: '#fff', border: 'none', padding: '0.55rem 1.25rem', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
                  >
                    저장하기
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add Item */}
        {isAddItemModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: '#111827', border: '1px solid #1f293d', borderRadius: 16, width: 480, padding: '1.75rem', color: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>신규 테스트 재고 추가</h3>
                <button onClick={() => setIsAddItemModalOpen(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}><X size={20} /></button>
              </div>

              <form onSubmit={handleAddItem}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#9ca3af', marginBottom: '0.4rem' }}>품목 코드</label>
                    <input
                      type="text"
                      placeholder="AGY-TEST-006"
                      required
                      value={newItem.item_code}
                      onChange={e => setNewItem({ ...newItem, item_code: e.target.value })}
                      style={{ width: '100%', background: '#090d16', border: '1px solid #1f293d', borderRadius: 8, padding: '0.55rem 0.85rem', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#9ca3af', marginBottom: '0.4rem' }}>카테고리</label>
                    <input
                      type="text"
                      placeholder="전자부품"
                      required
                      value={newItem.category}
                      onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                      style={{ width: '100%', background: '#090d16', border: '1px solid #1f293d', borderRadius: 8, padding: '0.55rem 0.85rem', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#9ca3af', marginBottom: '0.4rem' }}>품목명</label>
                  <input
                    type="text"
                    placeholder="예: 안티그래비티 신형 고속 프로세서 모듈"
                    required
                    value={newItem.name}
                    onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                    style={{ width: '100%', background: '#090d16', border: '1px solid #1f293d', borderRadius: 8, padding: '0.55rem 0.85rem', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.4rem' }}>초기 수량</label>
                    <input
                      type="number"
                      min="0"
                      value={newItem.stock_quantity}
                      onChange={e => setNewItem({ ...newItem, stock_quantity: e.target.value })}
                      style={{ width: '100%', background: '#090d16', border: '1px solid #1f293d', borderRadius: 8, padding: '0.55rem 0.75rem', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.4rem' }}>안전 재고</label>
                    <input
                      type="number"
                      min="0"
                      value={newItem.safety_stock}
                      onChange={e => setNewItem({ ...newItem, safety_stock: e.target.value })}
                      style={{ width: '100%', background: '#090d16', border: '1px solid #1f293d', borderRadius: 8, padding: '0.55rem 0.75rem', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.4rem' }}>단가(원)</label>
                    <input
                      type="number"
                      min="0"
                      value={newItem.unit_price}
                      onChange={e => setNewItem({ ...newItem, unit_price: e.target.value })}
                      style={{ width: '100%', background: '#090d16', border: '1px solid #1f293d', borderRadius: 8, padding: '0.55rem 0.75rem', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.4rem' }}>보관 위치</label>
                    <input
                      type="text"
                      placeholder="창고 A-01"
                      value={newItem.warehouse_location}
                      onChange={e => setNewItem({ ...newItem, warehouse_location: e.target.value })}
                      style={{ width: '100%', background: '#090d16', border: '1px solid #1f293d', borderRadius: 8, padding: '0.55rem 0.75rem', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setIsAddItemModalOpen(false)}
                    style={{ background: 'transparent', border: '1px solid #1f293d', color: '#9ca3af', padding: '0.55rem 1rem', borderRadius: 8, cursor: 'pointer' }}
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', color: '#fff', border: 'none', padding: '0.55rem 1.25rem', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
                  >
                    추가 완료
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
                  <History size={20} color="#06b6d4" /> 최근 입출고 트랜잭션 기록
                </h3>
                <button onClick={() => setIsLogsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}><X size={20} /></button>
              </div>

              <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.5rem' }}>
                {transactions.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem 0' }}>입출고 트랜잭션 이력이 없습니다.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {transactions.map((tx, idx) => (
                      <div key={tx.id || idx} style={{ background: '#090d16', border: '1px solid #1f293d', borderRadius: 8, padding: '0.85rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ 
                            background: tx.transaction_type === 'INBOUND' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: tx.transaction_type === 'INBOUND' ? '#10b981' : '#f87171',
                            padding: '0.25rem 0.6rem', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700
                          }}>
                            {tx.transaction_type === 'INBOUND' ? '+ 입고' : '- 출고'}
                          </span>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>
                              {tx.test_inventory_items?.name || '품목'} <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>({tx.test_inventory_items?.item_code})</span>
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>{tx.notes || '메모 없음'} | 담당: {tx.handler_name || '에이전트'}</div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 700, color: tx.transaction_type === 'INBOUND' ? '#10b981' : '#f87171' }}>
                            {tx.transaction_type === 'INBOUND' ? `+${tx.quantity}` : `-${tx.quantity}`} 개
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>
                            {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
