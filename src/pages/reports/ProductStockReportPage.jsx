// src/pages/reports/ProductStockReportPage.jsx
import React, { useState, useEffect } from 'react';
import Sidebar, { SIDEBAR_WIDTH } from '../../components/Sidebar';
import Appbar from '../../components/Appbar';
import { getLowStockReports, getTopSellingReports } from '../../services/reportService';
import { AlertTriangle, Award, RefreshCw, Package } from 'lucide-react';

export default function ProductStockReportPage() {
  const [tab, setTab] = useState('low-stock'); // 'low-stock' ឬ 'top-selling'
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_WIDTH);

  useEffect(() => {
    fetchData();
  }, [tab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      let res;
      if (tab === 'low-stock') {
        res = await getLowStockReports();
      } else {
        res = await getTopSellingReports();
      }
      setDataList(res?.data || []);
    } catch (err) {
      console.error('Error fetching product report:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', width: '100vw', minHeight: '100vh', background: '#f1f5f9', fontFamily: "'Plus Jakarta Sans', 'Noto Sans Khmer', sans-serif", color: '#0f172a' }}>
      <Sidebar onCollapseChange={(_, width) => setSidebarWidth(width)} />

      <div style={{ marginLeft: `${sidebarWidth}px`, flex: 1, display: 'flex', flexDirection: 'column', transition: 'margin-left .24s cubic-bezier(.4,0,.2,1)', minWidth: 0 }}>
        <Appbar />

        <div style={{ padding: '28px 30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '700' }}>📦 របាយការណ៍ស្តុក និងទំនិញ (Product Reports)</h2>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13.5px' }}>តាមដានទំនិញជិតអស់ក្នុងស្តុក និងទំនិញលក់ដាច់ជាងគេ</p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ display: 'flex', background: '#e2e8f0', padding: '4px', borderRadius: '10px' }}>
                <button
                  onClick={() => setTab('low-stock')}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: tab === 'low-stock' ? '#dc2626' : 'transparent', color: tab === 'low-stock' ? 'white' : '#475569', fontWeight: '700', fontSize: '12.5px', cursor: 'pointer' }}
                >
                  ជិតអស់ស្តុក (Low Stock)
                </button>
                <button
                  onClick={() => setTab('top-selling')}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: tab === 'top-selling' ? '#16a34a' : 'transparent', color: tab === 'top-selling' ? 'white' : '#475569', fontWeight: '700', fontSize: '12.5px', cursor: 'pointer' }}
                >
                  លក់ដាច់ជាងគេ (Top Selling)
                </button>
              </div>

              <button onClick={fetchData} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>
                <RefreshCw size={15} /> Refresh
              </button>
            </div>
          </div>

          {/* Table */}
          <div style={{ background: 'white', borderRadius: '16px', overflowX: 'auto', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>កំពុងទាញយកទិន្នន័យ...</div>
            ) : dataList.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>មិនមានទិន្នន័យទេ</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '12px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '14px 18px' }}>#</th>
                    <th style={{ padding: '14px 18px' }}>ឈ្មោះទំនិញ</th>
                    <th style={{ padding: '14px 16px' }}>{tab === 'low-stock' ? 'ស្តុកនៅសល់' : 'ចំនួនលក់សរុប'}</th>
                  </tr>
                </thead>
                <tbody>
                  {dataList.map((item, idx) => (
                    <tr key={item.id || idx} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '13.5px' }}>
                      <td style={{ padding: '14px 18px', fontWeight: '700', color: '#64748b' }}>{idx + 1}</td>
                      <td style={{ padding: '14px 18px', fontWeight: '600', color: '#0f172a' }}>{item.name || item.product_name || `Product ID: ${item.product_id}`}</td>
                      <td style={{ padding: '14px 16px', fontWeight: '700', color: tab === 'low-stock' ? '#dc2626' : '#16a34a' }}>
                        {item.stock !== undefined ? `${item.stock} ឯកតា` : `${item.total_sold} ដង`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}