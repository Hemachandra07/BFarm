let currentTab = 'overview';

document.addEventListener('DOMContentLoaded', () => {
  loadOverviewStats();
});

function switchTab(tabName) {
  currentTab = tabName;
  document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));

  const targetPane = document.getElementById(`tab-${tabName}`);
  if (targetPane) targetPane.classList.add('active');

  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach(btn => {
    if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(tabName)) {
      btn.classList.add('active');
    }
  });

  const titles = {
    overview: { title: 'Executive Overview', desc: 'Real-time agricultural telemetry, crop disease scans, and market operations' },
    logistics: { title: 'Logistics Requests', desc: 'Manage farm-to-storage and farm-to-market dispatch statuses' },
    diagnoses: { title: 'Diagnosis Feed', desc: 'Real-time crop pathology scans, leaf symptoms, and disease findings' },
    market: { title: 'Mandi Market Prices', desc: 'Live APMC rates across Guntur, Vijayawada, Ongole, Kurnool, and Hyderabad' },
    buyers: { title: 'Buyers & FPOs', desc: 'Verified food processors, retail aggregators, and farmer collective organizations' },
    storage: { title: 'Cold Storage Hubs', desc: 'Temperature-controlled storage facilities, available capacities, and rates' }
  };

  if (titles[tabName]) {
    document.getElementById('tabTitle').innerText = titles[tabName].title;
    document.getElementById('tabDesc').innerText = titles[tabName].desc;
  }

  refreshCurrentTab();
}

function refreshCurrentTab() {
  if (currentTab === 'overview') loadOverviewStats();
  else if (currentTab === 'logistics') loadAllLogistics();
  else if (currentTab === 'diagnoses') loadDiagnosisFeed();
  else if (currentTab === 'market') loadMarketPrices();
  else if (currentTab === 'buyers') loadBuyersAndFpos();
  else if (currentTab === 'storage') loadColdStorage();
}

async function loadOverviewStats() {
  try {
    const res = await fetch('/api/admin/stats');
    const json = await res.json();
    if (json.success && json.data) {
      const d = json.data;
      document.getElementById('statTotalFarmers').innerText = Number(d.totalFarmers).toLocaleString();
      document.getElementById('statTotalDiagnoses').innerText = Number(d.totalDiagnoses).toLocaleString();
      document.getElementById('statTopCrop').innerText = d.topCrop || 'Tomato';
      document.getElementById('statTopDisease').innerText = d.topDisease || 'Early Blight';
      document.getElementById('statMarketSearches').innerText = Number(d.totalMarketSearches).toLocaleString();
      document.getElementById('statStorageRequests').innerText = Number(d.totalStorageRequests).toLocaleString();
      document.getElementById('statLogisticsRequests').innerText = Number(d.totalLogisticsRequests).toLocaleString();

      // Render recent diagnoses
      const diagBody = document.getElementById('recentDiagnosesBody');
      if (d.recentDiagnoses && d.recentDiagnoses.length > 0) {
        diagBody.innerHTML = d.recentDiagnoses.map(item => `
          <tr>
            <td><strong>${item.crop}</strong></td>
            <td>${item.disease}</td>
            <td><span class="badge">${item.confidence}</span></td>
            <td><span class="status-badge ${item.severity === 'High' ? 'CANCELLED' : (item.severity === 'Medium' ? 'PENDING' : 'COMPLETED')}">${item.severity}</span></td>
            <td style="color:#64748b;font-size:12px;">${item.createdAt.substring(0, 16).replace('T', ' ')}</td>
          </tr>
        `).join('');
      } else {
        diagBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No recent diagnoses</td></tr>`;
      }

      // Render recent logistics
      const logBody = document.getElementById('recentLogisticsBody');
      if (d.recentLogisticsRequests && d.recentLogisticsRequests.length > 0) {
        logBody.innerHTML = d.recentLogisticsRequests.map(item => `
          <tr>
            <td><code>${item.referenceNumber}</code></td>
            <td>${item.crop}</td>
            <td>${item.quantity}</td>
            <td><span class="status-badge ${item.status}">${item.status}</span></td>
          </tr>
        `).join('');
      } else {
        logBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No active bookings</td></tr>`;
      }
    }
  } catch (err) {
    console.error('Failed to load stats:', err);
  }
}

async function loadAllLogistics() {
  const tbody = document.getElementById('allLogisticsBody');
  tbody.innerHTML = `<tr><td colspan="8" class="loading">Loading bookings...</td></tr>`;
  try {
    const res = await fetch('/api/admin/requests');
    const json = await res.json();
    if (json.success && json.data) {
      if (json.data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:30px;">No transport requests found.</td></tr>`;
        return;
      }
      tbody.innerHTML = json.data.map(req => `
        <tr>
          <td><strong><code>${req.referenceNumber}</code></strong></td>
          <td>${req.crop}</td>
          <td>${req.quantity} kg</td>
          <td>${req.pickupLocation}</td>
          <td>${req.destination}</td>
          <td>₹${req.estimatedCost}</td>
          <td><span class="status-badge ${req.status}">${req.status}</span></td>
          <td>
            <select class="status-select" onchange="updateLogisticsStatus(${req.id}, this.value)">
              <option value="PENDING" ${req.status === 'PENDING' ? 'selected' : ''}>PENDING</option>
              <option value="CONFIRMED" ${req.status === 'CONFIRMED' ? 'selected' : ''}>CONFIRMED</option>
              <option value="IN_TRANSIT" ${req.status === 'IN_TRANSIT' ? 'selected' : ''}>IN_TRANSIT</option>
              <option value="COMPLETED" ${req.status === 'COMPLETED' ? 'selected' : ''}>COMPLETED</option>
              <option value="CANCELLED" ${req.status === 'CANCELLED' ? 'selected' : ''}>CANCELLED</option>
            </select>
          </td>
        </tr>
      `).join('');
    }
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="8" style="color:red;text-align:center;">Failed to load logistics requests</td></tr>`;
  }
}

async function updateLogisticsStatus(id, newStatus) {
  try {
    const res = await fetch(`/api/admin/requests/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    const json = await res.json();
    if (json.success) {
      alert(`Status updated to ${newStatus}`);
      loadAllLogistics();
    }
  } catch (e) {
    alert('Failed to update status');
  }
}

async function loadDiagnosisFeed() {
  const tbody = document.getElementById('diagnosesFeedBody');
  tbody.innerHTML = `<tr><td colspan="7" class="loading">Loading diagnoses...</td></tr>`;
  try {
    const res = await fetch('/api/diagnosis/history');
    const json = await res.json();
    if (json.success && json.data) {
      tbody.innerHTML = json.data.map(item => `
        <tr>
          <td>#${item.id}</td>
          <td><strong>${item.crop}</strong></td>
          <td>${item.disease}</td>
          <td>${Math.round(item.confidence * 100)}%</td>
          <td><span class="status-badge ${item.severity === 'High' ? 'CANCELLED' : (item.severity === 'Medium' ? 'PENDING' : 'COMPLETED')}">${item.severity}</span></td>
          <td style="max-width:300px;font-size:12px;color:#475569;">${item.findings || '-'}</td>
          <td style="color:#64748b;font-size:12px;">${item.createdAt ? item.createdAt.substring(0, 16).replace('T', ' ') : '-'}</td>
        </tr>
      `).join('');
    }
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="7" style="color:red;text-align:center;">Failed to load diagnoses</td></tr>`;
  }
}

async function loadMarketPrices() {
  const tbody = document.getElementById('marketPricesBody');
  tbody.innerHTML = `<tr><td colspan="7" class="loading">Loading market prices...</td></tr>`;
  try {
    const res = await fetch('/api/market/prices');
    const json = await res.json();
    if (json.success && json.data) {
      tbody.innerHTML = json.data.map(p => `
        <tr>
          <td><strong>${p.crop}</strong></td>
          <td>${p.market}</td>
          <td>${p.district}, ${p.state}</td>
          <td><strong>₹${Number(p.price).toLocaleString()}</strong></td>
          <td>/${p.unit}</td>
          <td><span class="badge" style="color:${p.trend === 'UP' ? '#16a34a' : (p.trend === 'DOWN' ? '#dc2626' : '#64748b')}">${p.trend === 'UP' ? '▲ UP' : (p.trend === 'DOWN' ? '▼ DOWN' : '— STABLE')}</span></td>
          <td style="font-size:12px;color:#64748b;">${p.source}</td>
        </tr>
      `).join('');
    }
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="7" style="color:red;text-align:center;">Failed to load market prices</td></tr>`;
  }
}

async function loadBuyersAndFpos() {
  const buyersTbody = document.getElementById('buyersBody');
  const fposTbody = document.getElementById('fposBody');
  try {
    const [bRes, fRes] = await Promise.all([fetch('/api/buyers'), fetch('/api/fpos')]);
    const bJson = await bRes.json();
    const fJson = await fRes.json();

    if (bJson.success && bJson.data) {
      buyersTbody.innerHTML = bJson.data.map(b => `
        <tr>
          <td><strong>${b.name}</strong> ${b.verified ? '✓' : ''}</td>
          <td>${b.buyerType || 'Wholesaler'}</td>
          <td>${b.location}</td>
          <td>${b.crops}</td>
          <td>₹${b.offeredPrice}/q</td>
          <td><code>${b.phone}</code></td>
        </tr>
      `).join('');
    }

    if (fJson.success && fJson.data) {
      fposTbody.innerHTML = fJson.data.map(f => `
        <tr>
          <td><strong>${f.name}</strong> ${f.verified ? '✓' : ''}</td>
          <td>${f.location} (${f.distanceKm} km)</td>
          <td>${f.memberCount} members</td>
          <td>${f.crops}</td>
          <td><code>${f.phone}</code></td>
        </tr>
      `).join('');
    }
  } catch (e) {
    console.error('Failed to load buyers/FPOs:', e);
  }
}

async function loadColdStorage() {
  const tbody = document.getElementById('coldStorageBody');
  tbody.innerHTML = `<tr><td colspan="7" class="loading">Loading storages...</td></tr>`;
  try {
    const res = await fetch('/api/storage');
    const json = await res.json();
    if (json.success && json.data) {
      tbody.innerHTML = json.data.map(s => `
        <tr>
          <td><strong>${s.name}</strong> ${s.verified ? '✓' : ''}</td>
          <td>${s.location} (${s.distanceKm} km)</td>
          <td>${s.capacity} MT</td>
          <td><strong style="color:#16a34a;">${s.availableCapacity} MT</strong></td>
          <td>${s.supportedCrops}</td>
          <td>₹${s.pricePerDay} ${s.priceUnit}</td>
          <td><code>${s.phone}</code></td>
        </tr>
      `).join('');
    }
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="7" style="color:red;text-align:center;">Failed to load storages</td></tr>`;
  }
}

async function triggerReseed() {
  if (!confirm('Re-seed demo agricultural data?')) return;
  try {
    const res = await fetch('/api/admin/reseed', { method: 'POST' });
    const json = await res.json();
    if (json.success) {
      alert('Demo data successfully re-seeded!');
      refreshCurrentTab();
    }
  } catch (e) {
    alert('Failed to re-seed demo data');
  }
}
