// src/pages/reports/ReportsPage.jsx
import React, { useState, useEffect } from 'react';
import Sidebar, { SIDEBAR_WIDTH } from '../../components/Sidebar';
import Appbar from '../../components/Appbar';
import {
  getDailyReport,
  getWeeklyReport,
  getMonthlyReport,
  getSalesReports,
  getLowStockReports,
  getTopSellingReports,
  getPurchaseReports,
  getCustomerReports,
  getTotalSalesReports,
} from '../../services/reportService';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  Calendar,
  Filter,
  RefreshCw,
  FileText,
  AlertTriangle,
} from 'lucide-react';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('overview'); // overview, daily, weekly, monthly, sales, low-stock, top-selling, purchases, customers
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_WIDTH);
  const [loading, setLoading] = useState(false);

  // States សម្រាប់ទិន្នន័យ
  const [overview, setOverview] = useState({ total_sales: 0, total_orders: 0, total_customers: 0 });
  const [reportData, setReportData] = useState([]);
  
  // Filter States
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'overview') {
        const res = await getTotalSalesReports();
        setOverview(res || {});
      } else if (activeTab === 'daily') {
        const res = await getDailyReport({ date: selectedDate });
        setReportData(res || []);
      } else if (activeTab === 'weekly') {
        const res = await getWeeklyReport({ start_date: startDate, end_date: endDate });
        setReportData(res || []);
      } else if (activeTab === 'monthly') {
        const res = await getMonthlyReport({ year: selectedYear });
        setReportData(res || []);
      } else if (activeTab === 'sales') {
        const res = await getSalesReports({ start_date: startDate, end_date: endDate });
        setReportData(res || []);
      } else if (activeTab === 'low-stock') {
        const res = await getLowStockReports({ limit_stock: 10 });
        setReportData(res || []);
      } else if (activeTab === 'top-selling') {
        const res = await getTopSellingReports({ limit: 10 });
        setReportData(res || []);
      } else if (activeTab === 'purchases') {
        const res = await getPurchaseReports({ start_date: startDate, end_date: endDate });
        setReportData(res || []);
      } else if (activeTab === 'customers') {
        const res = await getCustomerReports();
        setReportData(res || []);
      }
    } catch (err) {
      console.error('Error loading report data:', err);
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = {
    background: 'white',
    padding: '20px',
    borderRadius: '14px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  };

  const navButtonStyle = (tabName) => ({
    padding: '10px 16px',
    borderRadius: '10px',
    border: 'none',
    background: activeTab === tabName ? '#0f766e' : '#ffffff',
    color: activeTab === tabName ? '#ffffff' : '#334155',
    fontWeight: '700',
    fontSize: '13px',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
    transition: '0.2s',
    whiteSpace: 'nowrap',
  });

  return (
    <div style={{ display: 'flex', width: '100vw', minHeight: '100vh', background: '#f1f5f9', fontFamily: "'Plus Jakarta Sans', 'Noto Sans Khmer', sans-serif", color: '#0f172a' }}>
      <Sidebar onCollapseChange={(_, width) => setSidebarWidth(width)} />

      <div style={{ marginLeft: `${sidebarWidth}px`, flex: 1, display: 'flex', flexDirection: 'column', transition: 'margin-left .24s cubic-bezier(.4,0,.2,1)', minWidth: 0 }}>
        <Appbar />

        <div style={{ padding: '28px 30px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '700' }}>📊 មជ្ឈមណ្ឌលរបាយការណ៍ (Reports Dashboard)</h2>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13.5px' }}>វិភាគទិន្នន័យ ការលក់ ស្តុក និងហិរញ្ញវត្ថុរបស់ហាង</p>
            </div>
            <button onClick={fetchData} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>
              <RefreshCw size={15} /> ផ្ទុកទិន្នន័យឡើងវិញ
            </button>
          </div>

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '20px' }}>
            <button style={navButtonStyle('overview')} onClick={() => setActiveTab('overview')}>សង្ខេបទូទៅ</button>
            <button style={navButtonStyle('daily')} onClick={() => setActiveTab('daily')}>ប្រចាំថ្ងៃ</button>
            <button style={navButtonStyle('weekly')} onClick={() => setActiveTab('weekly')}>ប្រចាំសប្តាហ៍</button>
            <button style={navButtonStyle('monthly')} onClick={() => setActiveTab('monthly')}>ប្រចាំខែ</button>
            <button style={navButtonStyle('sales')} onClick={() => setActiveTab('sales')}>ការលក់ (Sales)</button>
            <button style={navButtonStyle('top-selling')} onClick={() => setActiveTab('top-selling')}>លក់ដាច់ជាងគេ</button>
            <button style={navButtonStyle('low-stock')} onClick={() => setActiveTab('low-stock')}>ជិតអស់ស្តុក</button>
            <button style={navButtonStyle('purchases')} onClick={() => setActiveTab('purchases')}>ការទិញចូល (Purchases)</button>
            <button style={navButtonStyle('customers')} onClick={() => setActiveTab('customers')}>អតិថិជន (Customers)</button>
          </div>

          {/* 🟢 1. OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div style={cardStyle}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#dcfce7', color: '#16a34a', display: 'grid', placeItems: 'center' }}><DollarSign size={24} /></div>
                  <div>
                    <div style={{ fontSize: '12.5px', color: '#64748b', fontWeight: '500' }}>ចំណូលសរុប (Total Sales)</div>
                    <div style={{ fontSize: '22px', fontWeight: '800', color: '#16a34a' }}>${Number(overview.total_sales || 0).toFixed(2)}</div>
                  </div>
                </div>
                <div style={cardStyle}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#e0f2fe', color: '#0284c7', display: 'grid', placeItems: 'center' }}><ShoppingCart size={24} /></div>
                  <div>
                    <div style={{ fontSize: '12.5px', color: '#64748b', fontWeight: '500' }}>វិក្កយបត្រសរុប (Orders)</div>
                    <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a' }}>{overview.total_orders || 0} ដង</div>
                  </div>
                </div>
                <div style={cardStyle}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fef3c7', color: '#d97706', display: 'grid', placeItems: 'center' }}><Users size={24} /></div>
                  <div>
                    <div style={{ fontSize: '12.5px', color: '#64748b', fontWeight: '500' }}>អតិថិជនសរុប (Customers)</div>
                    <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a' }}>{overview.total_customers || 0} នាក់</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 🟢 2. TABLE VIEW FOR OTHER TABS */}
          {activeTab !== 'overview' && (
            <div style={{ background: 'white', borderRadius: '16px', overflowX: 'auto', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
              {loading ? (
                <div style={{ padding: '50px', textAlign: 'center', color: '#64748b' }}>កំពុងទាញយកទិន្នន័យ...</div>
              ) : reportData.length === 0 ? (
                <div style={{ padding: '50px', textAlign: 'center', color: '#64748b' }}>មិនមានទិន្នន័យសម្រាប់បង្ហាញទេ</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '12px', textTransform: 'uppercase' }}>
                      <th style={{ padding: '14px 18px' }}>#</th>
                      <th style={{ padding: '14px 18px' }}>
                        {activeTab === 'customers' ? 'ឈ្មោះអតិថិជន' : activeTab.includes('stock') || activeTab.includes('selling') ? 'ឈ្មោះទំនិញ' : 'ព័ត៌មានវិក្កយបត្រ / ការទិញ'}
                      </th>
                      <th style={{ padding: '14px 16px' }}>
                        {activeTab === 'customers' ? 'ចំនួនដងទិញ' : activeTab === 'low-stock' ? 'ស្តុកនៅសល់' : activeTab === 'top-selling' ? 'ចំនួនលក់សរុប' : 'ទឹកប្រាក់សរុប'}
                      </th>
                      <th style={{ padding: '14px 16px' }}>កាលបរិច្ឆេទ / ព័ត៌មានបន្ថែម</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((item, idx) => (
                      <tr key={item.id || idx} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '13.5px' }}>
                        <td style={{ padding: '14px 18px', fontWeight: '700', color: '#64748b' }}>{idx + 1}</td>
                        <td style={{ padding: '14px 18px', fontWeight: '600', color: '#0f172a' }}>
                          {activeTab === 'customers' ? item.name : activeTab.includes('stock') || activeTab.includes('selling') ? (item.name || item.product_name) : `វិក្កយបត្រ #${item.id} (${item.customer?.name || 'អតិថិជនទូទៅ'})`}
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: '700', color: '#16a34a' }}>
                          {activeTab === 'customers' ? `${item.orders_count || 0} ដង` : activeTab === 'low-stock' ? `${item.stock_quantity || 0} ឯកតា` : activeTab === 'top-selling' ? `${item.total_quantity_sold || 0} ឯកតា` : `$${Number(item.total_amount || 0).toFixed(2)}`}
                        </td>
                        <td style={{ padding: '14px 16px', color: '#64748b' }}>
                          {activeTab === 'customers' ? `ចំណាយសរុប: $${Number(item.orders_sum_total_amount || 0).toFixed(2)}` : new Date(item.created_at || Date.now()).toLocaleString('km-KH')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}