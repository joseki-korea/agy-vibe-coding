import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart3, Database, LogIn, LogOut
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import DashboardStats from './components/DashboardStats';
import AnalyticsCharts from './components/AnalyticsCharts';
import InventoryInsights from './components/InventoryInsights';
import InventoryToolbar from './components/InventoryToolbar';
import InventoryTable from './components/InventoryTable';
import StockModal from './components/StockModal';
import AddItemModal from './components/AddItemModal';

const TEST_INITIAL_ITEMS = [
  { id: '1', item_code: 'AGY-TEST-001', name: '안티그래비티 AI 센서 모듈 v1', category: '전자부품', stock_quantity: 150, safety_stock: 30, unit_price: 45000, warehouse_location: '창고 A-12', status: 'NORMAL' },
  { id: '2', item_code: 'AGY-TEST-002', name: '고성능 임베디드 코어 제어판', category: '핵심부품', stock_quantity: 8, safety_stock: 15, unit_price: 120000, warehouse_location: '창고 B-03', status: 'LOW_STOCK' },
  { id: '3', item_code: 'AGY-TEST-003', name: '초고속 데이터 전송 케이블 2m', category: '소모품', stock_quantity: 500, safety_stock: 100, unit_price: 8500, warehouse_location: '창고 A-05', status: 'NORMAL' },
  { id: '4', item_code: 'AGY-TEST-004', name: '지능형 모터 드라이버 가이드', category: '기계부품', stock_quantity: 3, safety_stock: 10, unit_price: 89000, warehouse_location: '창고 C-01', status: 'LOW_STOCK' },
  { id: '5', item_code: 'AGY-TEST-005', name: '알루미늄 프레임 거치대 (대형)', category: '외장재', stock_quantity: 85, safety_stock: 20, unit_price: 35000, warehouse_location: '창고 A-08', status: 'NORMAL' },
  { id: '6', item_code: 'AGY-TEST-006', name: '고정밀 냉각 팬 120mm', category: '소모품', stock_quantity: 0, safety_stock: 25, unit_price: 15000, warehouse_location: '창고 B-01', status: 'OUT_OF_STOCK' },
];

export default function App() {
  const [items, setItems] = useState(TEST_INITIAL_ITEMS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL'); // 'ALL' | 'NORMAL' | 'LOW_STOCK' | 'OUT_OF_STOCK'
  const [selectedLocation, setSelectedLocation] = useState('ALL');
  const [sortBy, setSortBy] = useState('default');

  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMessage, setAuthMessage] = useState('');

  // Modals
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [initialStockType, setInitialStockType] = useState('INBOUND');

  const fetchTestItems = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase || !session) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('test_inventory_items')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return undefined;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchTestItems();
    } else if (isSupabaseConfigured) {
      setItems([]);
    }
  }, [session, fetchTestItems]);

  const handleAuth = async (mode) => {
    if (!supabase || !authEmail || authPassword.length < 6) {
      setAuthMessage('이메일과 6자 이상의 비밀번호를 입력하세요.');
      return;
    }
    setLoading(true);
    const result = mode === 'signup'
      ? await supabase.auth.signUp({ email: authEmail, password: authPassword })
      : await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
    setLoading(false);
    setAuthMessage(result.error
      ? result.error.message
      : mode === 'signup' && !result.data.session
        ? '확인 이메일을 열어 가입을 완료하세요.'
        : '로그인되었습니다.');
  };

  const handleStockUpdate = async ({ item, transactionType, quantity, notes }) => {
    const amount = Number(quantity);
    const curQty = Number(item.stock_quantity) || 0;
    const safety = Number(item.safety_stock) || 0;
    const newQty = transactionType === 'INBOUND' ? curQty + amount : Math.max(0, curQty - amount);
    const newStatus = newQty === 0 ? 'OUT_OF_STOCK' : (newQty < safety ? 'LOW_STOCK' : 'NORMAL');

    if (isSupabaseConfigured && supabase) {
      if (!session) return setAuthMessage('입출고 처리는 로그인이 필요합니다.');
      const { error } = await supabase.rpc('adjust_inventory_stock', {
        target_item_id: item.id,
        movement_type: transactionType,
        movement_quantity: amount,
        movement_notes: notes,
      });
      if (error) return setAuthMessage(error.message);
      await fetchTestItems();
    } else {
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, stock_quantity: newQty, status: newStatus } : i));
    }

    setIsStockModalOpen(false);
    setSelectedItem(null);
  };

  const handleAddItem = async (itemData) => {
    const qty = Number(itemData.stock_quantity) || 0;
    const safety = Number(itemData.safety_stock) || 0;
    const status = qty === 0 ? 'OUT_OF_STOCK' : (qty < safety ? 'LOW_STOCK' : 'NORMAL');

    const newItemPayload = {
      ...itemData,
      status
    };

    if (isSupabaseConfigured && supabase) {
      if (!session) return setAuthMessage('품목 등록은 로그인이 필요합니다.');
      const { data, error } = await supabase.from('test_inventory_items').insert([newItemPayload]).select();
      if (error) return setAuthMessage(error.message);
      if (data && data[0]) setItems(prev => [data[0], ...prev]);
    } else {
      setItems(prev => [{ ...newItemPayload, id: Date.now().toString() }, ...prev]);
    }

    setIsAddItemModalOpen(false);
  };

  const handleDeleteItem = async (id, name) => {
    if (!confirm(`'${name}' 상품을 삭제하시겠습니까?`)) return;
    if (isSupabaseConfigured && supabase) {
      if (!session) return setAuthMessage('품목 삭제는 로그인이 필요합니다.');
      const { error } = await supabase.from('test_inventory_items').delete().eq('id', id);
      if (error) return setAuthMessage(error.message);
    }
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const openStockModal = (item, type = 'INBOUND') => {
    setSelectedItem(item);
    setInitialStockType(type);
    setIsStockModalOpen(true);
  };

  // Filter & Sort Logic
  const filteredItems = items.filter(item => {
    const s = searchTerm.toLowerCase();
    const matchesSearch = (item.name || '').toLowerCase().includes(s) ||
      (item.item_code || '').toLowerCase().includes(s) ||
      (item.warehouse_location || '').toLowerCase().includes(s);
    
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesLocation = selectedLocation === 'ALL' || item.warehouse_location === selectedLocation;

    const qty = Number(item.stock_quantity) || 0;
    const safety = Number(item.safety_stock) || 0;
    const isOut = qty === 0;
    const isLow = !isOut && qty < safety;
    const isNormal = qty >= safety;

    let matchesStatus = true;
    if (selectedStatusFilter === 'NORMAL') matchesStatus = isNormal;
    else if (selectedStatusFilter === 'LOW_STOCK') matchesStatus = isLow;
    else if (selectedStatusFilter === 'OUT_OF_STOCK') matchesStatus = isOut;

    return matchesSearch && matchesCategory && matchesLocation && matchesStatus;
  });

  // Sort
  const sortedItems = [...filteredItems].sort((a, b) => {
    const qtyA = Number(a.stock_quantity) || 0;
    const qtyB = Number(b.stock_quantity) || 0;
    const priceA = Number(a.unit_price) || 0;
    const priceB = Number(b.unit_price) || 0;
    const valA = qtyA * priceA;
    const valB = qtyB * priceB;

    if (sortBy === 'stock_desc') return qtyB - qtyA;
    if (sortBy === 'stock_asc') return qtyA - qtyB;
    if (sortBy === 'val_desc') return valB - valA;
    if (sortBy === 'price_desc') return priceB - priceA;
    if (sortBy === 'name_asc') return (a.name || '').localeCompare(b.name || '');
    return 0; // default
  });

  const categories = ['ALL', ...Array.from(new Set(items.map(i => i.category || '기타')))];
  const locations = ['ALL', ...Array.from(new Set(items.map(i => i.warehouse_location || '미지정')))];

  const clearAllFilters = () => {
    setSelectedCategory('ALL');
    setSelectedStatusFilter('ALL');
    setSelectedLocation('ALL');
    setSearchTerm('');
    setSortBy('default');
  };

  const hasActiveFilters = selectedCategory !== 'ALL' || selectedStatusFilter !== 'ALL' || selectedLocation !== 'ALL' || searchTerm !== '' || sortBy !== 'default';

  // CSV Export
  const handleExportCSV = () => {
    if (items.length === 0) return;
    const headers = ['품목코드', '품목명', '카테고리', '보관위치', '현재재고', '안전재고', '단가', '총평가액', '상태'];
    const rows = sortedItems.map(i => {
      const qty = Number(i.stock_quantity) || 0;
      const safety = Number(i.safety_stock) || 0;
      const price = Number(i.unit_price) || 0;
      const val = qty * price;
      const statusText = qty === 0 ? '품절' : (qty < safety ? '재고부족' : '정상');
      return [
        `"${i.item_code || ''}"`,
        `"${(i.name || '').replace(/"/g, '""')}"`,
        `"${i.category || ''}"`,
        `"${i.warehouse_location || ''}"`,
        qty,
        safety,
        price,
        val,
        `"${statusText}"`
      ].join(',');
    });
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `재고현황_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ backgroundColor: '#0b0f19', color: '#f3f4f6', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid #1f293d', backgroundColor: '#0d1322', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarChart3 size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#fff' }}>인터랙티브 재고 통계 대시보드</h1>
            <p style={{ fontSize: '0.78rem', color: '#06b6d4', margin: 0 }}>실시간 재고 지표 모니터링 · 다차원 통계 분석 · 안전재고 알림 시스템</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: isSupabaseConfigured ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)', border: isSupabaseConfigured ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)', color: isSupabaseConfigured ? '#10b981' : '#f59e0b', padding: '0.4rem 0.85rem', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Database size={14} /> {isSupabaseConfigured ? 'Supabase Live Connected' : 'Local Mock Mode'}
          </div>
          {isSupabaseConfigured && (session ? (
            <button onClick={() => supabase.auth.signOut()} style={{ background: '#1f293d', border: '1px solid #374151', color: '#e5e7eb', padding: '0.4rem 0.75rem', borderRadius: 8, cursor: 'pointer', display: 'flex', gap: 5, alignItems: 'center' }}>
              <LogOut size={15} /> 로그아웃
            </button>
          ) : (
            <span style={{ color: '#f59e0b', fontSize: '0.8rem' }}>읽기·수정 전 로그인 필요</span>
          ))}
        </div>
      </header>

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '1.75rem 1.5rem' }}>
        {/* Auth Notice if Supabase Connected */}
        {isSupabaseConfigured && !session && (
          <section style={{ background: '#111827', border: '1px solid #374151', borderRadius: 14, padding: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontWeight: 700 }}>
              <LogIn size={18} /> Supabase 이메일 로그인
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <input type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} placeholder="email@example.com" style={{ flex: 1, minWidth: 220, background: '#090d16', border: '1px solid #374151', borderRadius: 8, padding: '0.6rem', color: '#fff' }} />
              <input type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} placeholder="비밀번호 6자 이상" style={{ flex: 1, minWidth: 180, background: '#090d16', border: '1px solid #374151', borderRadius: 8, padding: '0.6rem', color: '#fff' }} />
              <button onClick={() => handleAuth('signin')} disabled={loading} style={{ background: '#3b82f6', color: '#fff', border: 0, borderRadius: 8, padding: '0.6rem 1rem', cursor: 'pointer' }}>로그인</button>
              <button onClick={() => handleAuth('signup')} disabled={loading} style={{ background: '#1f293d', color: '#fff', border: '1px solid #374151', borderRadius: 8, padding: '0.6rem 1rem', cursor: 'pointer' }}>회원가입</button>
            </div>
            {authMessage && <p style={{ margin: '0.75rem 0 0', color: '#fbbf24', fontSize: '0.85rem' }}>{authMessage}</p>}
          </section>
        )}

        {session && authMessage && (
          <div role="status" style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.35)', color: '#fbbf24', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>{authMessage}</span>
            <button onClick={() => setAuthMessage('')} aria-label="메시지 닫기" style={{ background: 'transparent', border: 0, color: '#fbbf24', cursor: 'pointer' }}>×</button>
          </div>
        )}

        {/* 1. Extended KPI Summary Cards */}
        <DashboardStats
          items={items}
          selectedStatusFilter={selectedStatusFilter}
          setSelectedStatusFilter={setSelectedStatusFilter}
          selectedCategory={selectedCategory}
          clearAllFilters={clearAllFilters}
        />

        {/* 2. Interactive Analytics Chart Panels */}
        <AnalyticsCharts
          items={items}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          selectedStatusFilter={selectedStatusFilter}
          setSelectedStatusFilter={setSelectedStatusFilter}
        />

        {/* 3. High-value Assets & Urgent Restock Insights */}
        <InventoryInsights
          items={items}
          onOpenStockModal={(item, type) => openStockModal(item, type)}
          onSelectItemSearch={(name) => setSearchTerm(name)}
        />

        {/* 4. Filter & Search Toolbar */}
        <InventoryToolbar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
          selectedStatusFilter={selectedStatusFilter}
          setSelectedStatusFilter={setSelectedStatusFilter}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          locations={locations}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onRefresh={fetchTestItems}
          loading={loading}
          onOpenAddItemModal={() => setIsAddItemModalOpen(true)}
          onExportCSV={handleExportCSV}
          clearAllFilters={clearAllFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* 5. Inventory Data Table */}
        <InventoryTable
          items={sortedItems}
          onOpenStockModal={(item) => openStockModal(item, 'INBOUND')}
          onDeleteItem={handleDeleteItem}
          onStatusClick={(status) => setSelectedStatusFilter(status)}
          clearAllFilters={clearAllFilters}
        />

        {/* Modals */}
        <StockModal
          isOpen={isStockModalOpen}
          onClose={() => { setIsStockModalOpen(false); setSelectedItem(null); }}
          item={selectedItem}
          initialType={initialStockType}
          onSubmit={handleStockUpdate}
        />

        <AddItemModal
          isOpen={isAddItemModalOpen}
          onClose={() => setIsAddItemModalOpen(false)}
          onSubmit={handleAddItem}
        />

        {/* Footer */}
        <footer style={{ marginTop: '3rem', borderTop: '1px solid #1f293d', paddingTop: '1.5rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.82rem' }}>
          Created by <strong style={{ color: '#c084fc' }}>Solucionemos (솔루시오네모스)</strong> | Powered by Antigravity AI Engine
        </footer>
      </main>
    </div>
  );
}
