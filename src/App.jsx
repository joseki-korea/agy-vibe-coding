import React, { useState, useEffect, useCallback } from 'react';
import { 
  Package, AlertTriangle,
  Search, Filter, RefreshCw, Database, Trash2, CheckCircle2, PlusCircle, BarChart3, PieChart, LogIn, LogOut
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from './lib/supabase';

const TEST_INITIAL_ITEMS = [
  { id: '1', item_code: 'AGY-TEST-001', name: '안티그래비티 AI 센서 모듈 v1', category: '전자부품', stock_quantity: 150, safety_stock: 30, unit_price: 45000, warehouse_location: '창고 A-12', status: 'NORMAL' },
  { id: '2', item_code: 'AGY-TEST-002', name: '고성능 임베디드 코어 제어판', category: '핵심부품', stock_quantity: 8, safety_stock: 15, unit_price: 120000, warehouse_location: '창고 B-03', status: 'LOW_STOCK' },
  { id: '3', item_code: 'AGY-TEST-003', name: '초고속 데이터 전송 케이블 2m', category: '소모품', stock_quantity: 500, safety_stock: 100, unit_price: 8500, warehouse_location: '창고 A-05', status: 'NORMAL' },
  { id: '4', item_code: 'AGY-TEST-004', name: '지능형 모터 드라이버 가이드', category: '기계부품', stock_quantity: 3, safety_stock: 10, unit_price: 89000, warehouse_location: '창고 C-01', status: 'LOW_STOCK' },
  { id: '5', item_code: 'AGY-TEST-005', name: '알루미늄 프레임 거치대 (대형)', category: '외장재', stock_quantity: 85, safety_stock: 20, unit_price: 35000, warehouse_location: '창고 A-08', status: 'NORMAL' },
];

const COLOR_PALETTE = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899'];

export default function App() {
  const [items, setItems] = useState(TEST_INITIAL_ITEMS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL'); // 'ALL' | 'LOW_STOCK' | 'NORMAL'
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMessage, setAuthMessage] = useState('');

  // Modals
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Form State
  const [transactionType, setTransactionType] = useState('INBOUND');
  const [changeQty, setChangeQty] = useState(1);
  const [newItem, setNewItem] = useState({
    item_code: '', name: '', category: '전자부품', stock_quantity: 20, safety_stock: 10, unit_price: 50000, warehouse_location: '창고 A-01'
  });

  const fetchTestItems = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase || !session) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from('test_inventory_items').select('*').order('created_at', { ascending: false });
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
    if (session) fetchTestItems();
    else if (isSupabaseConfigured) setItems([]);
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

  const handleStockUpdate = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    const amount = Number(changeQty);
    let newQty = transactionType === 'INBOUND' ? selectedItem.stock_quantity + amount : Math.max(0, selectedItem.stock_quantity - amount);
    const newStatus = newQty < selectedItem.safety_stock ? 'LOW_STOCK' : 'NORMAL';

    if (isSupabaseConfigured && supabase) {
      if (!session) return setAuthMessage('입출고 처리는 로그인이 필요합니다.');
      const { error } = await supabase.rpc('adjust_inventory_stock', {
        target_item_id: selectedItem.id,
        movement_type: transactionType,
        movement_quantity: amount,
        movement_notes: null,
      });
      if (error) return setAuthMessage(error.message);
      await fetchTestItems();
    } else {
      setItems(prev => prev.map(i => i.id === selectedItem.id ? { ...i, stock_quantity: newQty, status: newStatus } : i));
    }

    setIsStockModalOpen(false);
    setSelectedItem(null);
    setChangeQty(1);
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.item_code || !newItem.name) return;

    const qty = Number(newItem.stock_quantity);
    const safety = Number(newItem.safety_stock);
    const itemData = {
      item_code: newItem.item_code.toUpperCase(),
      name: newItem.name,
      category: newItem.category,
      stock_quantity: qty,
      safety_stock: safety,
      unit_price: Number(newItem.unit_price),
      warehouse_location: newItem.warehouse_location,
      status: qty < safety ? 'LOW_STOCK' : 'NORMAL'
    };

    if (isSupabaseConfigured && supabase) {
      if (!session) return setAuthMessage('품목 등록은 로그인이 필요합니다.');
      const { data, error } = await supabase.from('test_inventory_items').insert([itemData]).select();
      if (error) return setAuthMessage(error.message);
      if (data && data[0]) setItems(prev => [data[0], ...prev]);
    } else {
      setItems(prev => [{ ...itemData, id: Date.now().toString() }, ...prev]);
    }

    setIsAddItemModalOpen(false);
    setNewItem({ item_code: '', name: '', category: '전자부품', stock_quantity: 20, safety_stock: 10, unit_price: 50000, warehouse_location: '창고 A-01' });
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

  // Filter Logic
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.includes(searchTerm) || item.item_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const isLow = (item.stock_quantity || 0) < (item.safety_stock || 0);
    const matchesStatus = selectedStatusFilter === 'ALL' 
      || (selectedStatusFilter === 'LOW_STOCK' && isLow)
      || (selectedStatusFilter === 'NORMAL' && !isLow);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalStock = items.reduce((acc, i) => acc + (i.stock_quantity || 0), 0);
  const lowStockItems = items.filter(i => (i.stock_quantity || 0) < (i.safety_stock || 0)).length;
  const totalValuation = items.reduce((acc, i) => acc + ((i.stock_quantity || 0) * (i.unit_price || 0)), 0);

  // Category Distribution Bar Chart Math
  const categoryMap = {};
  items.forEach(i => {
    const cat = i.category || '기타';
    categoryMap[cat] = (categoryMap[cat] || 0) + (i.stock_quantity || 0);
  });
  const categoryList = Object.keys(categoryMap).map((catName, idx) => ({
    name: catName,
    count: categoryMap[catName],
    percentage: totalStock > 0 ? Math.round((categoryMap[catName] / totalStock) * 100) : 0,
    color: COLOR_PALETTE[idx % COLOR_PALETTE.length]
  })).sort((a, b) => b.count - a.count);

  const categories = ['ALL', ...Array.from(new Set(items.map(i => i.category)))];

  const clearAllFilters = () => {
    setSelectedCategory('ALL');
    setSelectedStatusFilter('ALL');
    setSearchTerm('');
  };

  return (
    <div style={{ backgroundColor: '#0b0f19', color: '#f3f4f6', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid #1f293d', backgroundColor: '#0d1322', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarChart3 size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#fff' }}>인터랙티브 차트 재고 대시보드</h1>
            <p style={{ fontSize: '0.78rem', color: '#06b6d4', margin: 0 }}>차트 시각화를 클릭하여 원하는 데이터만 즉시 필터링하세요</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: isSupabaseConfigured ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)', border: isSupabaseConfigured ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)', color: isSupabaseConfigured ? '#10b981' : '#f59e0b', padding: '0.4rem 0.85rem', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Database size={14} /> {isSupabaseConfigured ? 'Supabase Live Connected' : 'Local Mock Mode'}
          </div>
          {isSupabaseConfigured && (session ? (
            <button onClick={() => supabase.auth.signOut()} style={{ background: '#1f293d', border: '1px solid #374151', color: '#e5e7eb', padding: '0.4rem 0.75rem', borderRadius: 8, cursor: 'pointer', display: 'flex', gap: 5 }}>
              <LogOut size={15} /> 로그아웃
            </button>
          ) : (
            <span style={{ color: '#f59e0b', fontSize: '0.8rem' }}>읽기·수정 전 로그인 필요</span>
          ))}
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem' }}>

        {isSupabaseConfigured && !session && (
          <section style={{ background: '#111827', border: '1px solid #374151', borderRadius: 14, padding: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontWeight: 700 }}><LogIn size={18} /> Supabase 이메일 로그인</div>
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

        {/* Interactive Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          <div 
            onClick={clearAllFilters}
            style={{ 
              background: selectedStatusFilter === 'ALL' && selectedCategory === 'ALL' ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(17, 24, 39, 0.95))' : '#111827', 
              border: selectedStatusFilter === 'ALL' && selectedCategory === 'ALL' ? '2px solid #06b6d4' : '1px solid #1f293d', 
              borderRadius: 14, padding: '1.25rem 1.5rem', cursor: 'pointer', transition: 'all 0.2s' 
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.88rem', color: '#9ca3af', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Package size={16} color="#3b82f6" /> 전체 보유 재고</span>
              <span style={{ fontSize: '0.72rem', color: '#3b82f6', background: 'rgba(59,130,246,0.15)', padding: '0.15rem 0.5rem', borderRadius: 10 }}>클릭 시 전체보기</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>{totalStock.toLocaleString()} <span style={{ fontSize: '1rem', color: '#6b7280' }}>개</span></div>
            <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '0.4rem' }}>총 {items.length}개 품목 관리 중</div>
          </div>

          <div 
            onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'LOW_STOCK' ? 'ALL' : 'LOW_STOCK')}
            style={{ 
              background: selectedStatusFilter === 'LOW_STOCK' ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(17, 24, 39, 0.95))' : '#111827', 
              border: selectedStatusFilter === 'LOW_STOCK' ? '2px solid #ef4444' : (lowStockItems > 0 ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid #1f293d'), 
              borderRadius: 14, padding: '1.25rem 1.5rem', cursor: 'pointer', transition: 'all 0.2s' 
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.88rem', color: lowStockItems > 0 ? '#f87171' : '#9ca3af', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertTriangle size={16} color="#ef4444" /> 안전재고 부족 품목
              </span>
              <span style={{ fontSize: '0.72rem', color: '#ef4444', background: 'rgba(239,68,68,0.15)', padding: '0.15rem 0.5rem', borderRadius: 10 }}>클릭 시 필터</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: lowStockItems > 0 ? '#ef4444' : '#fff' }}>{lowStockItems} <span style={{ fontSize: '1rem', color: '#6b7280' }}>개 경고</span></div>
            <div style={{ fontSize: '0.78rem', color: '#f87171', marginTop: '0.4rem' }}>재고 보충 필요 상품만 모아보기</div>
          </div>

          <div style={{ background: '#111827', border: '1px solid #1f293d', borderRadius: 14, padding: '1.25rem 1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.88rem', color: '#9ca3af', fontWeight: 600 }}>총 재고 자산 평가액</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#60a5fa' }}>₩{totalValuation.toLocaleString()}</div>
            <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '0.4rem' }}>보유 자산 합산 금액</div>
          </div>
        </div>

        {/* Visual Category Distribution Bar Chart Box */}
        <div style={{ background: '#111827', border: '1px solid #1f293d', borderRadius: 14, padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PieChart size={20} color="#06b6d4" /> 카테고리별 재고 분포 (막대 클릭 시 자동 필터링)
            </div>
            {selectedCategory !== 'ALL' && (
              <button onClick={() => setSelectedCategory('ALL')} style={{ background: '#1f293d', border: '1px solid #374151', color: '#9ca3af', padding: '0.35rem 0.75rem', borderRadius: 6, fontSize: '0.78rem', cursor: 'pointer' }}>
                카테고리 필터 해제
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {categoryList.map(cat => {
              const isSelected = selectedCategory === cat.name;
              return (
                <div 
                  key={cat.name} 
                  onClick={() => setSelectedCategory(isSelected ? 'ALL' : cat.name)}
                  style={{ 
                    cursor: 'pointer', padding: '0.5rem 0.75rem', borderRadius: 8, transition: 'all 0.2s',
                    background: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                    border: isSelected ? '1px solid #3b82f6' : '1px solid transparent'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 600, color: isSelected ? '#38bdf8' : '#fff' }}>
                      {cat.name} {isSelected && <span style={{ fontSize: '0.75rem', color: '#06b6d4' }}>(선택됨)</span>}
                    </span>
                    <span style={{ color: '#9ca3af', fontFamily: 'monospace' }}>{cat.count.toLocaleString()} 개 ({cat.percentage}%)</span>
                  </div>
                  <div style={{ height: 8, background: 'rgba(255, 255, 255, 0.06)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${cat.percentage}%`, background: cat.color, borderRadius: 4, transition: 'width 0.4s ease' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Filter Pill */}
        {(selectedCategory !== 'ALL' || selectedStatusFilter !== 'ALL' || searchTerm !== '') && (
          <div style={{ background: 'rgba(6, 182, 212, 0.12)', border: '1px solid rgba(6, 182, 212, 0.3)', padding: '0.66rem 1.25rem', borderRadius: 10, marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#22d3ee', fontSize: '0.88rem' }}>
            <span>
              <Filter size={15} style={{ display: 'inline', marginRight: 6 }} /> 현재 필터: 
              {selectedCategory !== 'ALL' && <strong> [카테고리: {selectedCategory}]</strong>}
              {selectedStatusFilter !== 'ALL' && <strong> [상태: {selectedStatusFilter === 'LOW_STOCK' ? '재고부족' : '정상'}]</strong>}
              {searchTerm !== '' && <strong> [검색어: "{searchTerm}"]</strong>}
            </span>
            <button onClick={clearAllFilters} style={{ background: 'transparent', border: '1px solid #06b6d4', color: '#06b6d4', padding: '0.25rem 0.65rem', borderRadius: 6, fontSize: '0.75rem', cursor: 'pointer' }}>
              전체 초기화
            </button>
          </div>
        )}

        {/* Toolbar */}
        <div style={{ background: '#111827', border: '1px solid #1f293d', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flex: 1, minWidth: 280 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} color="#6b7280" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="제품명 또는 코드 검색..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ width: '100%', background: '#090d16', border: '1px solid #1f293d', borderRadius: 8, padding: '0.55rem 1rem 0.55rem 2.4rem', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>

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

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={fetchTestItems} style={{ background: '#1f293d', border: '1px solid #374151', color: '#9ca3af', padding: '0.55rem 0.85rem', borderRadius: 8, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <RefreshCw size={15} className={loading ? 'spin' : ''} /> 새로고침
            </button>
            <button onClick={() => setIsAddItemModalOpen(true)} style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', color: '#fff', border: 'none', padding: '0.55rem 1.1rem', borderRadius: 8, fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <PlusCircle size={16} /> 신규 품목 추가
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div style={{ background: '#111827', border: '1px solid #1f293d', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid #1f293d', color: '#9ca3af' }}>
                <th style={{ padding: '0.85rem 1.25rem' }}>품목 코드</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>품목명</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>카테고리</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>보관 위치</th>
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
                    필터 조건에 일치하는 품목이 없습니다.
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
                      <td style={{ padding: '1rem 1.25rem', color: '#cbd5e1', fontSize: '0.85rem' }}>{item.warehouse_location}</td>
                      <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: isLowStock ? '#ef4444' : '#fff' }}>
                        {item.stock_quantity} 개 <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 400 }}>(안전: {item.safety_stock})</span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', color: '#e5e7eb' }}>₩{(item.unit_price || 0).toLocaleString()}</td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        {isLowStock ? (
                          <span onClick={() => setSelectedStatusFilter('LOW_STOCK')} style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '0.25rem 0.65rem', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }} title="클릭하여 재고부족 품목만 필터링">
                            <AlertTriangle size={12} /> 재고 부족
                          </span>
                        ) : (
                          <span onClick={() => setSelectedStatusFilter('NORMAL')} style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', padding: '0.25rem 0.65rem', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }} title="클릭하여 정상 품목만 필터링">
                            <CheckCircle2 size={12} /> 정상
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button onClick={() => { setSelectedItem(item); setIsStockModalOpen(true); }} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                            입출고
                          </button>
                          <button onClick={() => handleDeleteItem(item.id, item.name)} style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '0.4rem 0.6rem', borderRadius: 6, fontSize: '0.8rem', cursor: 'pointer' }}>
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

        {/* Modal: Stock */}
        {isStockModalOpen && selectedItem && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: '#111827', border: '1px solid #1f293d', borderRadius: 16, width: 440, padding: '1.75rem', color: '#fff' }}>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>재고 수량 변동</h3>
              <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.85rem', color: '#9ca3af' }}>{selectedItem.name} ({selectedItem.item_code})</p>

              <form onSubmit={handleStockUpdate}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <button type="button" onClick={() => setTransactionType('INBOUND')} style={{ flex: 1, padding: '0.65rem', borderRadius: 8, border: '1px solid', borderColor: transactionType === 'INBOUND' ? '#10b981' : '#1f293d', background: transactionType === 'INBOUND' ? 'rgba(16, 185, 129, 0.15)' : '#090d16', color: transactionType === 'INBOUND' ? '#10b981' : '#9ca3af', fontWeight: 600, cursor: 'pointer' }}>+ 입고</button>
                  <button type="button" onClick={() => setTransactionType('OUTBOUND')} style={{ flex: 1, padding: '0.65rem', borderRadius: 8, border: '1px solid', borderColor: transactionType === 'OUTBOUND' ? '#ef4444' : '#1f293d', background: transactionType === 'OUTBOUND' ? 'rgba(239, 68, 68, 0.15)' : '#090d16', color: transactionType === 'OUTBOUND' ? '#ef4444' : '#9ca3af', fontWeight: 600, cursor: 'pointer' }}>- 출고</button>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '0.4rem' }}>수량</label>
                  <input type="number" min="1" value={changeQty} onChange={e => setChangeQty(e.target.value)} style={{ width: '100%', background: '#090d16', border: '1px solid #1f293d', borderRadius: 8, padding: '0.6rem 1rem', color: '#fff', fontSize: '1rem', outline: 'none' }} />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <button type="button" onClick={() => setIsStockModalOpen(false)} style={{ background: 'transparent', border: '1px solid #1f293d', color: '#9ca3af', padding: '0.55rem 1rem', borderRadius: 8, cursor: 'pointer' }}>취소</button>
                  <button type="submit" style={{ background: '#06b6d4', color: '#fff', border: 'none', padding: '0.55rem 1.25rem', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>저장하기</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add Item */}
        {isAddItemModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: '#111827', border: '1px solid #1f293d', borderRadius: 16, width: 480, padding: '1.75rem', color: '#fff' }}>
              <h3 style={{ margin: '0 0 1.25rem 0' }}>신규 품목 등록</h3>
              <form onSubmit={handleAddItem}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#9ca3af', marginBottom: '0.4rem' }}>품목 코드</label>
                    <input type="text" placeholder="AGY-TEST-006" required value={newItem.item_code} onChange={e => setNewItem({ ...newItem, item_code: e.target.value })} style={{ width: '100%', background: '#090d16', border: '1px solid #1f293d', borderRadius: 8, padding: '0.55rem 0.85rem', color: '#fff', fontSize: '0.9rem', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#9ca3af', marginBottom: '0.4rem' }}>카테고리</label>
                    <input type="text" placeholder="전자부품" required value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })} style={{ width: '100%', background: '#090d16', border: '1px solid #1f293d', borderRadius: 8, padding: '0.55rem 0.85rem', color: '#fff', fontSize: '0.9rem', outline: 'none' }} />
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#9ca3af', marginBottom: '0.4rem' }}>품목명</label>
                  <input type="text" placeholder="예: 안티그래비티 신형 센서 모듈" required value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} style={{ width: '100%', background: '#090d16', border: '1px solid #1f293d', borderRadius: 8, padding: '0.55rem 0.85rem', color: '#fff', fontSize: '0.9rem', outline: 'none' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.4rem' }}>초기 수량</label>
                    <input type="number" min="0" value={newItem.stock_quantity} onChange={e => setNewItem({ ...newItem, stock_quantity: e.target.value })} style={{ width: '100%', background: '#090d16', border: '1px solid #1f293d', borderRadius: 8, padding: '0.55rem 0.75rem', color: '#fff', fontSize: '0.9rem', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.4rem' }}>안전 재고</label>
                    <input type="number" min="0" value={newItem.safety_stock} onChange={e => setNewItem({ ...newItem, safety_stock: e.target.value })} style={{ width: '100%', background: '#090d16', border: '1px solid #1f293d', borderRadius: 8, padding: '0.55rem 0.75rem', color: '#fff', fontSize: '0.9rem', outline: 'none' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <button type="button" onClick={() => setIsAddItemModalOpen(false)} style={{ background: 'transparent', border: '1px solid #1f293d', color: '#9ca3af', padding: '0.55rem 1rem', borderRadius: 8, cursor: 'pointer' }}>취소</button>
                  <button type="submit" style={{ background: '#06b6d4', color: '#fff', border: 'none', padding: '0.55rem 1.25rem', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>등록 완료</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <footer style={{ marginTop: '3rem', borderTop: '1px solid #1f293d', paddingTop: '1.5rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.82rem' }}>
          Created by <strong style={{ color: '#c084fc' }}>Solucionemos (솔루시오네모스)</strong> | Powered by Antigravity AI Engine
        </footer>
      </main>
    </div>
  );
}
