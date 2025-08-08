// Security: Strict mode
'use strict';

// Global variables
let items = [];
let tables = [];
let orders = [];
let serviceRequests = [];
let currentInterface = 'auth';
let selectedTable = null;
let currentUser = null;

// Default users (in production, this should be in a secure database)
const defaultUsers = [
  {
    username: 'admin',
    password: 'admin123', // في الإنتاج، يجب تشفير كلمات المرور
    role: 'admin',
    name: 'مدير النظام'
  },
  {
    username: 'kitchen',
    password: 'kitchen123',
    role: 'kitchen',
    name: 'مشرف المطبخ'
  },
  {
    username: 'staff',
    password: 'staff123',
    role: 'staff',
    name: 'موظف'
  }
];

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
  // Check if user is logged in
  checkAuth();
  
  // Hide loading screen after 2 seconds
  setTimeout(() => {
    document.getElementById('loading-screen').style.display = 'none';
    if (!currentUser) {
      showAuthInterface();
    } else {
      showAppropriateInterface();
    }
  }, 2000);
  
  // Load data
  loadAllData();
  
  // Authentication Functions
function handleLogin(event) {
  event.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  const user = defaultUsers.find(u => u.username === username && u.password === password);
  
  if (user) {
    // Store user info in localStorage (in production, use secure session management)
    localStorage.setItem('currentUser', JSON.stringify({
      username: user.username,
      role: user.role,
      name: user.name
    }));
    
    currentUser = user;
    showNotification('مرحباً بك في النظام! 👋', 'success');
    showAppropriateInterface();
  } else {
    showAuthError('اسم المستخدم أو كلمة المرور غير صحيحة');
  }
}

function checkAuth() {
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    try {
      currentUser = JSON.parse(savedUser);
    } catch (error) {
      console.error('Error parsing saved user:', error);
      localStorage.removeItem('currentUser');
    }
  }
}

function logout() {
  localStorage.removeItem('currentUser');
  currentUser = null;
  showAuthInterface();
  showNotification('تم تسجيل الخروج بنجاح', 'info');
}

function showAuthInterface() {
  currentInterface = 'auth';
  hideAllInterfaces();
  document.getElementById('auth-interface').style.display = 'flex';
}

function showAuthError(message) {
  const errorDiv = document.getElementById('auth-error');
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
  
  setTimeout(() => {
    errorDiv.style.display = 'none';
  }, 5000);
}

function showAppropriateInterface() {
  if (!currentUser) {
    showAuthInterface();
    return;
  }
  
  switch (currentUser.role) {
    case 'admin':
      showAdminInterface();
      break;
    case 'kitchen':
      showKitchenInterface();
      break;
    case 'staff':
      showCustomerInterface();
      break;
    default:
      showAuthInterface();
  }
}

function showResetPassword() {
  // في الإنتاج، يجب إضافة نظام إعادة تعيين كلمة المرور
  showNotification('هذه الميزة غير متوفرة حالياً', 'info');
}

// Reports Functions
function showReportsInterface() {
  console.log('Showing reports interface');
  currentInterface = 'reports';
  
  const content = `
    <div class="reports-container">
      <div class="reports-header">
        <h2>التقارير والإحصائيات</h2>
        <p>تحليل شامل لأداء المطعم</p>
      </div>
      
      <div class="date-filter">
        <button onclick="updateReports('today')" class="active">اليوم</button>
        <button onclick="updateReports('week')">الأسبوع</button>
        <button onclick="updateReports('month')">الشهر</button>
      </div>
      
      <div class="reports-grid">
        <!-- Sales Report -->
        <div class="report-card">
          <h3>تقرير المبيعات</h3>
          <div class="stat-grid">
            <div class="stat-box">
              <div class="stat-value" id="totalSales">0</div>
              <div class="stat-label">إجمالي المبيعات</div>
            </div>
            <div class="stat-box">
              <div class="stat-value" id="totalOrders">0</div>
              <div class="stat-label">عدد الطلبات</div>
            </div>
            <div class="stat-box">
              <div class="stat-value" id="avgOrderValue">0</div>
              <div class="stat-label">متوسط قيمة الطلب</div>
            </div>
            <div class="stat-box">
              <div class="stat-value" id="activeOrders">0</div>
              <div class="stat-label">طلبات نشطة</div>
            </div>
          </div>
          <div class="chart-container">
            <canvas id="salesChart"></canvas>
          </div>
        </div>
        
        <!-- Items Report -->
        <div class="report-card">
          <h3>تقرير الأصناف</h3>
          <div class="stat-grid">
            <div class="stat-box">
              <div class="stat-value" id="totalItems">0</div>
              <div class="stat-label">عدد الأصناف</div>
            </div>
            <div class="stat-box">
              <div class="stat-value" id="topSellingItems">0</div>
              <div class="stat-label">الأصناف الأكثر مبيعاً</div>
            </div>
          </div>
          <div class="chart-container">
            <canvas id="itemsChart"></canvas>
          </div>
        </div>
        
        <!-- Tables Report -->
        <div class="report-card">
          <h3>تقرير الطاولات</h3>
          <div class="stat-grid">
            <div class="stat-box">
              <div class="stat-value" id="activeTables">0</div>
              <div class="stat-label">الطاولات النشطة</div>
            </div>
            <div class="stat-box">
              <div class="stat-value" id="avgTableTime">0</div>
              <div class="stat-label">متوسط وقت الطاولة</div>
            </div>
          </div>
          <div class="chart-container">
            <canvas id="tablesChart"></canvas>
          </div>
        </div>
        
        <!-- Service Report -->
        <div class="report-card">
          <h3>تقرير الخدمة</h3>
          <div class="stat-grid">
            <div class="stat-box">
              <div class="stat-value" id="serviceRequests">0</div>
              <div class="stat-label">طلبات الخدمة</div>
            </div>
            <div class="stat-box">
              <div class="stat-value" id="avgResponseTime">0</div>
              <div class="stat-label">متوسط وقت الاستجابة</div>
            </div>
          </div>
          <div class="chart-container">
            <canvas id="serviceChart"></canvas>
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.getElementById('main-content').innerHTML = content;
  initializeCharts();
  updateReports('today');
}

function updateReports(period) {
  // تحديث الفترة النشطة في التصفية
  document.querySelectorAll('.date-filter button').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`.date-filter button[onclick*="${period}"]`).classList.add('active');
  
  // حساب الإحصائيات
  const stats = calculateStats(period);
  
  // تحديث الإحصائيات
  document.getElementById('totalSales').textContent = stats.totalSales.toFixed(2) + ' د.ك';
  document.getElementById('totalOrders').textContent = stats.totalOrders;
  document.getElementById('avgOrderValue').textContent = stats.avgOrderValue.toFixed(2) + ' د.ك';
  document.getElementById('activeOrders').textContent = stats.activeOrders;
  document.getElementById('totalItems').textContent = items.length;
  document.getElementById('topSellingItems').textContent = stats.topItems;
  document.getElementById('activeTables').textContent = stats.activeTables;
  document.getElementById('avgTableTime').textContent = stats.avgTableTime + ' دقيقة';
  document.getElementById('serviceRequests').textContent = stats.serviceRequests;
  document.getElementById('avgResponseTime').textContent = stats.avgResponseTime + ' دقيقة';
  
  // تحديث الرسوم البيانية
  updateCharts(stats);
}

function calculateStats(period) {
  // في الإنتاج، هذه البيانات ستأتي من قاعدة البيانات
  return {
    totalSales: 1250.75,
    totalOrders: 45,
    avgOrderValue: 27.79,
    activeOrders: 8,
    topItems: 5,
    activeTables: 12,
    avgTableTime: 45,
    serviceRequests: 15,
    avgResponseTime: 5,
    salesData: [300, 450, 320, 280, 390, 250, 180],
    itemsData: {
      labels: ['قهوة', 'شاي', 'عصير', 'كيك', 'سندويش'],
      data: [30, 25, 20, 15, 10]
    },
    tablesData: {
      labels: ['1', '2', '3', '4', '5'],
      data: [15, 12, 18, 8, 20]
    },
    serviceData: {
      labels: ['8ص', '10ص', '12م', '2م', '4م', '6م', '8م'],
      data: [2, 4, 8, 6, 3, 5, 2]
    }
  };
}

function initializeCharts() {
  // Sales Chart
  new Chart(document.getElementById('salesChart'), {
    type: 'line',
    data: {
      labels: ['8ص', '10ص', '12م', '2م', '4م', '6م', '8م'],
      datasets: [{
        label: 'المبيعات (د.ك)',
        data: [300, 450, 320, 280, 390, 250, 180],
        borderColor: '#667eea',
        tension: 0.4,
        fill: true,
        backgroundColor: 'rgba(102, 126, 234, 0.1)'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
  
  // Items Chart
  new Chart(document.getElementById('itemsChart'), {
    type: 'bar',
    data: {
      labels: ['قهوة', 'شاي', 'عصير', 'كيك', 'سندويش'],
      datasets: [{
        label: 'المبيعات',
        data: [30, 25, 20, 15, 10],
        backgroundColor: '#667eea'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
  
  // Tables Chart
  new Chart(document.getElementById('tablesChart'), {
    type: 'bar',
    data: {
      labels: ['1', '2', '3', '4', '5'],
      datasets: [{
        label: 'عدد الطلبات',
        data: [15, 12, 18, 8, 20],
        backgroundColor: '#667eea'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
  
  // Service Chart
  new Chart(document.getElementById('serviceChart'), {
    type: 'line',
    data: {
      labels: ['8ص', '10ص', '12م', '2م', '4م', '6م', '8م'],
      datasets: [{
        label: 'طلبات الخدمة',
        data: [2, 4, 8, 6, 3, 5, 2],
        borderColor: '#667eea',
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

function updateCharts(stats) {
  // تحديث البيانات في الرسوم البيانية
  const charts = {
    salesChart: {
      data: stats.salesData
    },
    itemsChart: {
      labels: stats.itemsData.labels,
      data: stats.itemsData.data
    },
    tablesChart: {
      labels: stats.tablesData.labels,
      data: stats.tablesData.data
    },
    serviceChart: {
      data: stats.serviceData.data
    }
  };
  
  Object.keys(charts).forEach(chartId => {
    const chart = Chart.getChart(chartId);
    if (chart) {
      if (charts[chartId].labels) {
        chart.data.labels = charts[chartId].labels;
      }
      chart.data.datasets[0].data = charts[chartId].data;
      chart.update();
    }
  });
}

// Inventory Functions
function showInventoryInterface() {
  console.log('Showing inventory interface');
  currentInterface = 'inventory';
  
  const content = `
    <div class="inventory-container">
      <div class="inventory-header">
        <h2>إدارة المخزون والموردين</h2>
        <p>مراقبة المخزون وإدارة الموردين</p>
      </div>
      
      <div class="inventory-tabs">
        <button onclick="showInventoryTab('stock')" class="inventory-tab active">📦 المخزون</button>
        <button onclick="showInventoryTab('suppliers')" class="inventory-tab">🏢 الموردين</button>
        <button onclick="showInventoryTab('alerts')" class="inventory-tab">⚠️ التنبيهات</button>
        <button onclick="showInventoryTab('orders')" class="inventory-tab">📋 أوامر الشراء</button>
      </div>
      
      <div id="inventory-content">
        <!-- Stock Tab Content -->
        <div id="stock-tab" class="inventory-grid">
          <div class="inventory-card">
            <h3>المخزون الحالي</h3>
            <div id="stock-items">
              <!-- Stock items will be loaded here -->
            </div>
          </div>
          
          <div class="inventory-card">
            <h3>إحصائيات المخزون</h3>
            <div class="stat-grid">
              <div class="stat-box">
                <div class="stat-value" id="totalItems">0</div>
                <div class="stat-label">إجمالي الأصناف</div>
              </div>
              <div class="stat-box">
                <div class="stat-value" id="lowStockItems">0</div>
                <div class="stat-label">أصناف منخفضة</div>
              </div>
              <div class="stat-box">
                <div class="stat-value" id="outOfStockItems">0</div>
                <div class="stat-label">أصناف نافدة</div>
              </div>
              <div class="stat-box">
                <div class="stat-value" id="totalValue">0</div>
                <div class="stat-label">قيمة المخزون</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Suppliers Tab Content -->
        <div id="suppliers-tab" style="display: none;">
          <div id="suppliers-list">
            <!-- Suppliers will be loaded here -->
          </div>
        </div>
        
        <!-- Alerts Tab Content -->
        <div id="alerts-tab" style="display: none;">
          <div class="inventory-card">
            <h3>تنبيهات المخزون</h3>
            <div id="stock-alerts">
              <!-- Alerts will be loaded here -->
            </div>
          </div>
        </div>
        
        <!-- Orders Tab Content -->
        <div id="orders-tab" style="display: none;">
          <div class="inventory-card">
            <h3>أوامر الشراء</h3>
            <div id="purchase-orders">
              <!-- Purchase orders will be loaded here -->
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.getElementById('main-content').innerHTML = content;
  loadInventoryData();
}

function showInventoryTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.inventory-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Show selected tab
  document.querySelector(`.inventory-tab[onclick*="${tabName}"]`).classList.add('active');
  
  // Hide all tab content
  document.getElementById('stock-tab').style.display = 'none';
  document.getElementById('suppliers-tab').style.display = 'none';
  document.getElementById('alerts-tab').style.display = 'none';
  document.getElementById('orders-tab').style.display = 'none';
  
  // Show selected tab content
  document.getElementById(`${tabName}-tab`).style.display = 'grid';
  
  // Load specific data
  switch(tabName) {
    case 'stock':
      loadStockData();
      break;
    case 'suppliers':
      loadSuppliersData();
      break;
    case 'alerts':
      loadAlertsData();
      break;
    case 'orders':
      loadOrdersData();
      break;
  }
}

function loadInventoryData() {
  loadStockData();
}

function loadStockData() {
  // Sample stock data
  const stockItems = [
    { name: 'قهوة عربية', quantity: 50, unit: 'كيلو', minLevel: 10, price: 15.00, supplier: 'مورد القهوة' },
    { name: 'شاي أسود', quantity: 25, unit: 'كيلو', minLevel: 5, price: 8.50, supplier: 'مورد الشاي' },
    { name: 'حليب', quantity: 8, unit: 'لتر', minLevel: 20, price: 2.50, supplier: 'مورد الألبان' },
    { name: 'سكر', quantity: 30, unit: 'كيلو', minLevel: 10, price: 1.20, supplier: 'مورد السكر' },
    { name: 'دقيق', quantity: 0, unit: 'كيلو', minLevel: 15, price: 3.00, supplier: 'مورد الدقيق' }
  ];
  
  const stockContainer = document.getElementById('stock-items');
  if (!stockContainer) return;
  
  stockContainer.innerHTML = stockItems.map(item => {
    const isLow = item.quantity <= item.minLevel && item.quantity > 0;
    const isOut = item.quantity === 0;
    const statusClass = isOut ? 'out' : (isLow ? 'low' : '');
    
    return `
      <div class="stock-item ${statusClass}">
        <div class="stock-info">
          <div class="stock-name">${item.name}</div>
          <div class="stock-details">
            الكمية: ${item.quantity} ${item.unit} | السعر: ${item.price} د.ك | المورد: ${item.supplier}
          </div>
        </div>
        <div class="stock-actions">
          <button onclick="addStock('${item.name}')" class="stock-btn primary">إضافة</button>
          <button onclick="editStock('${item.name}')" class="stock-btn secondary">تعديل</button>
        </div>
      </div>
    `;
  }).join('');
  
  // Update statistics
  updateStockStats(stockItems);
}

function updateStockStats(stockItems) {
  const totalItems = stockItems.length;
  const lowStockItems = stockItems.filter(item => item.quantity <= item.minLevel && item.quantity > 0).length;
  const outOfStockItems = stockItems.filter(item => item.quantity === 0).length;
  const totalValue = stockItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  
  document.getElementById('totalItems').textContent = totalItems;
  document.getElementById('lowStockItems').textContent = lowStockItems;
  document.getElementById('outOfStockItems').textContent = outOfStockItems;
  document.getElementById('totalValue').textContent = totalValue.toFixed(2) + ' د.ك';
}

function loadSuppliersData() {
  const suppliers = [
    {
      name: 'مورد القهوة',
      phone: '+965 12345678',
      email: 'coffee@supplier.com',
      status: 'active',
      items: ['قهوة عربية', 'قهوة تركية', 'قهوة إسبريسو']
    },
    {
      name: 'مورد الشاي',
      phone: '+965 87654321',
      email: 'tea@supplier.com',
      status: 'active',
      items: ['شاي أسود', 'شاي أخضر', 'شاي أعشاب']
    },
    {
      name: 'مورد الألبان',
      phone: '+965 11223344',
      email: 'dairy@supplier.com',
      status: 'inactive',
      items: ['حليب', 'جبن', 'زبدة']
    }
  ];
  
  const suppliersContainer = document.getElementById('suppliers-list');
  if (!suppliersContainer) return;
  
  suppliersContainer.innerHTML = suppliers.map(supplier => `
    <div class="supplier-card">
      <div class="supplier-header">
        <div class="supplier-name">${supplier.name}</div>
        <div class="supplier-status ${supplier.status}">
          ${supplier.status === 'active' ? 'نشط' : 'غير نشط'}
        </div>
      </div>
      <div class="supplier-details">
        الهاتف: ${supplier.phone}<br>
        البريد الإلكتروني: ${supplier.email}
      </div>
      <div class="supplier-items">
        ${supplier.items.map(item => `<span class="supplier-item">${item}</span>`).join('')}
      </div>
    </div>
  `).join('');
}

function loadAlertsData() {
  const alerts = [
    { type: 'low', item: 'حليب', message: 'الكمية منخفضة (8 لتر)', action: 'طلب من المورد' },
    { type: 'out', item: 'دقيق', message: 'نفذ من المخزون', action: 'طلب عاجل' },
    { type: 'low', item: 'سكر', message: 'الكمية منخفضة (30 كيلو)', action: 'طلب من المورد' }
  ];
  
  const alertsContainer = document.getElementById('stock-alerts');
  if (!alertsContainer) return;
  
  alertsContainer.innerHTML = alerts.map(alert => `
    <div class="stock-item ${alert.type}">
      <div class="stock-info">
        <div class="stock-name">${alert.item}</div>
        <div class="stock-details">${alert.message}</div>
      </div>
      <div class="stock-actions">
        <button onclick="handleAlert('${alert.item}')" class="stock-btn primary">${alert.action}</button>
      </div>
    </div>
  `).join('');
}

function loadOrdersData() {
  const orders = [
    { id: 'PO-001', supplier: 'مورد القهوة', items: ['قهوة عربية', 'قهوة تركية'], status: 'pending', date: '2024-01-15' },
    { id: 'PO-002', supplier: 'مورد الألبان', items: ['حليب', 'جبن'], status: 'delivered', date: '2024-01-10' }
  ];
  
  const ordersContainer = document.getElementById('purchase-orders');
  if (!ordersContainer) return;
  
  ordersContainer.innerHTML = orders.map(order => `
    <div class="stock-item">
      <div class="stock-info">
        <div class="stock-name">${order.id} - ${order.supplier}</div>
        <div class="stock-details">
          التاريخ: ${order.date} | الحالة: ${order.status === 'pending' ? 'في الانتظار' : 'تم التوصيل'}
        </div>
      </div>
      <div class="stock-actions">
        <button onclick="viewOrder('${order.id}')" class="stock-btn secondary">عرض التفاصيل</button>
      </div>
    </div>
  `).join('');
}

function addStock(itemName) {
  const quantity = prompt(`أدخل الكمية المضافة لـ ${itemName}:`);
  if (quantity && !isNaN(quantity)) {
    showNotification(`تم إضافة ${quantity} وحدة لـ ${itemName}`, 'success');
    loadStockData(); // Refresh data
  }
}

function editStock(itemName) {
  showNotification(`تعديل ${itemName} - هذه الميزة قيد التطوير`, 'info');
}

function handleAlert(itemName) {
  showNotification(`تم إرسال طلب للمورد بخصوص ${itemName}`, 'success');
}

function viewOrder(orderId) {
  showNotification(`عرض تفاصيل الطلب ${orderId} - هذه الميزة قيد التطوير`, 'info');
}

// Initialize PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => console.log('SW registered'))
      .catch(error => console.log('SW registration failed'));
  }
});

// Data Management Functions
function loadAllData() {
  console.log('Loading all data...');
  
  // Load items
  const savedItems = localStorage.getItem('items');
  if (savedItems) {
    try {
      items = JSON.parse(savedItems);
      console.log('Items loaded:', items.length);
    } catch (error) {
      console.error('Error loading items:', error);
      items = [];
    }
  }
  
  // Load tables
  const savedTables = localStorage.getItem('tables');
  if (savedTables) {
    try {
      tables = JSON.parse(savedTables);
      console.log('Tables loaded:', tables.length);
    } catch (error) {
      console.error('Error loading tables:', error);
      tables = [];
    }
  }
  
  // Initialize default tables if none exist
  if (tables.length === 0) {
    for (let i = 1; i <= 10; i++) {
      tables.push({
        id: i,
        name: `Table ${i}`,
        active: false,
        qrCode: generateQRCode(i)
      });
    }
    saveData('tables', tables);
  }
  
  // Load orders
  const savedOrders = localStorage.getItem('orders');
  if (savedOrders) {
    try {
      orders = JSON.parse(savedOrders);
      console.log('Orders loaded:', orders.length);
    } catch (error) {
      console.error('Error loading orders:', error);
      orders = [];
    }
  }
  
  // Load service requests
  const savedServiceRequests = localStorage.getItem('serviceRequests');
  if (savedServiceRequests) {
    try {
      serviceRequests = JSON.parse(savedServiceRequests);
      console.log('Service requests loaded:', serviceRequests.length);
    } catch (error) {
      console.error('Error loading service requests:', error);
      serviceRequests = [];
    }
  }
}

function saveData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    console.log(`${key} saved successfully`);
  } catch (error) {
    console.error(`Error saving ${key}:`, error);
    showNotification(`خطأ في حفظ ${key}`, 'error');
  }
}

// Interface Management
function updateUserInfo() {
  if (currentUser) {
    // تحديث اسم المستخدم
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
      userNameElement.textContent = currentUser.name;
    }
    
    // تحديث شارة الصلاحية
    const roleBadgeElement = document.getElementById('userRoleBadge');
    if (roleBadgeElement) {
      const roleText = {
        admin: 'مدير',
        kitchen: 'مطبخ',
        staff: 'موظف'
      }[currentUser.role] || currentUser.role;
      
      roleBadgeElement.textContent = roleText;
      roleBadgeElement.className = `role-badge role-${currentUser.role}`;
    }
    
    // إخفاء/إظهار الأزرار حسب الصلاحية
    document.querySelectorAll('[data-role]').forEach(button => {
      const allowedRoles = button.getAttribute('data-role').split(',');
      button.style.display = allowedRoles.includes(currentUser.role) ? 'block' : 'none';
    });
  }
}

function showAdminInterface() {
  console.log('Showing admin interface');
  currentInterface = 'admin';
  hideAllInterfaces();
  document.getElementById('admin-interface').style.display = 'flex';
  document.getElementById('main-content').innerHTML = `
    <h1>مرحباً بك في Sardecoffeshop 👋</h1>
    <p>اختر من القائمة الجانبية لبدء العمل</p>
  `;
  updateUserInfo();
}

function showKitchenInterface() {
  console.log('Showing kitchen interface');
  currentInterface = 'kitchen';
  hideAllInterfaces();
  document.getElementById('kitchen-interface').style.display = 'flex';
  renderKitchenOrders();
  updateKitchenStats();
}

function showCustomerInterface() {
  console.log('Showing customer interface');
  currentInterface = 'customer';
  hideAllInterfaces();
  document.getElementById('customer-interface').style.display = 'block';
  loadMenuItems();
}

function hideAllInterfaces() {
  document.getElementById('admin-interface').style.display = 'none';
  document.getElementById('kitchen-interface').style.display = 'none';
  document.getElementById('customer-interface').style.display = 'none';
  document.getElementById('notifications-interface').style.display = 'none';
}

// Item Management
function showAddItemForm() {
  console.log('Showing add item form');
  const content = `
    <div class="form-container">
      <h2>إضافة صنف جديد</h2>
      <h3>أضف صنف جديد لقائمة الطعام</h3>
      
      <form onsubmit="addItem(event)">
        <div class="form-group">
          <label>اسم الصنف</label>
          <input type="text" id="itemName" required placeholder="مثال: قهوة عربية">
        </div>
        
        <div class="form-group">
          <label>السعر (د.ك)</label>
          <input type="number" id="itemPrice" required min="0" step="0.01" placeholder="1.50">
        </div>
        
        <div class="form-group">
          <label>الوصف (اختياري)</label>
          <textarea id="itemDescription" placeholder="وصف مختصر للصنف"></textarea>
        </div>
        
        <div class="form-group">
          <label>الخصائص (اختياري)</label>
          <input type="text" id="itemFeatures" placeholder="حار، بارد، سكر إضافي (فصل بفاصلة)">
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <button type="submit" class="btn btn-primary">إضافة الصنف</button>
          <button type="button" onclick="showItemsList()" class="btn btn-secondary" style="margin-right: 15px;">إلغاء</button>
        </div>
      </form>
    </div>
  `;
  
  document.getElementById('main-content').innerHTML = content;
}

function addItem(event) {
  event.preventDefault();
  
  const name = document.getElementById('itemName').value.trim();
  const price = parseFloat(document.getElementById('itemPrice').value);
  const description = document.getElementById('itemDescription').value.trim();
  const featuresText = document.getElementById('itemFeatures').value.trim();
  
  if (!name || !price || price <= 0) {
    showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
    return;
  }
  
  const features = featuresText ? featuresText.split(',').map(f => f.trim()).filter(f => f) : [];
  
  const newItem = {
    id: Date.now(),
    name: name,
    price: price,
    description: description,
    features: features,
    active: true
  };
  
  items.push(newItem);
  saveData('items', items);
  
  showNotification('تم إضافة الصنف بنجاح! 🎉', 'success');
  showItemsList();
}

function showItemsList() {
  console.log('Showing items list');
  
  if (items.length === 0) {
    document.getElementById('main-content').innerHTML = `
      <div class="form-container">
        <h2>قائمة الأصناف</h2>
        <div class="no-items">لا توجد أصناف مضافة بعد</div>
        <div style="text-align: center; margin-top: 30px;">
          <button onclick="showAddItemForm()" class="btn btn-primary">إضافة أول صنف</button>
        </div>
      </div>
    `;
    return;
  }
  
  const itemsHtml = items.map(item => `
    <div class="card">
      <h3>${item.name}</h3>
      <p><strong>السعر:</strong> ${item.price} د.ك</p>
      ${item.description ? `<p><strong>الوصف:</strong> ${item.description}</p>` : ''}
      ${item.features && item.features.length > 0 ? `<p><strong>الخصائص:</strong> ${item.features.join(', ')}</p>` : ''}
      <div style="text-align: center; margin-top: 20px;">
        <button onclick="editItem(${item.id})" class="btn btn-primary">تعديل</button>
        <button onclick="deleteItem(${item.id})" class="btn btn-secondary" style="margin-right: 10px;">حذف</button>
      </div>
    </div>
  `).join('');
  
  document.getElementById('main-content').innerHTML = `
    <h1>قائمة الأصناف</h1>
    <div style="text-align: center; margin-bottom: 30px;">
      <button onclick="showAddItemForm()" class="btn btn-primary">إضافة صنف جديد</button>
    </div>
    <div class="table-grid">
      ${itemsHtml}
    </div>
  `;
}

function deleteItem(itemId) {
  if (confirm('هل أنت متأكد من حذف هذا الصنف؟')) {
    items = items.filter(item => item.id !== itemId);
    saveData('items', items);
    showNotification('تم حذف الصنف بنجاح', 'success');
    showItemsList();
  }
}

// Table Management
function showTablesInterface() {
  console.log('Showing tables interface');
  renderTables();
}

function renderTables() {
  console.log('Rendering tables...');
  
  const tablesHtml = tables.map(table => `
    <div class="table-card ${table.active ? 'active' : ''}">
      <h3>${table.name}</h3>
      <div class="table-qr" style="text-align: center; margin: 20px 0;">
        <img src="${table.qrCode}" alt="QR Code for ${table.name}" style="max-width: 150px; border-radius: 10px;">
      </div>
      <div class="table-actions">
        <button onclick="toggleTable(${table.id})" class="btn ${table.active ? 'btn-secondary' : 'btn-primary'}">
          ${table.active ? 'إلغاء تفعيل' : 'تفعيل'}
        </button>
        <button onclick="printTableQR(${table.id})" class="btn btn-print">طباعة QR</button>
        <button onclick="deleteTable(${table.id})" class="btn btn-secondary">حذف</button>
      </div>
    </div>
  `).join('');
  
  document.getElementById('main-content').innerHTML = `
    <h1>إدارة الطاولات</h1>
    <div style="text-align: center; margin-bottom: 30px;">
      <button onclick="addNewTable()" class="btn btn-primary">إضافة طاولة جديدة</button>
    </div>
    <div class="table-grid">
      ${tablesHtml}
    </div>
  `;
}

function toggleTable(tableId) {
  const table = tables.find(t => t.id === tableId);
  if (table) {
    table.active = !table.active;
    saveData('tables', tables);
    showNotification(`تم ${table.active ? 'تفعيل' : 'إلغاء تفعيل'} ${table.name}`, 'success');
    renderTables();
  }
}

function addNewTable() {
  const tableNumber = tables.length + 1;
  const newTable = {
    id: Date.now(),
    name: `Table ${tableNumber}`,
    active: false,
    qrCode: generateQRCode(tableNumber)
  };
  
  tables.push(newTable);
  saveData('tables', tables);
  showNotification('تم إضافة طاولة جديدة بنجاح!', 'success');
  renderTables();
}

function deleteTable(tableId) {
  if (confirm('هل أنت متأكد من حذف هذه الطاولة؟')) {
    tables = tables.filter(t => t.id !== tableId);
    saveData('tables', tables);
    showNotification('تم حذف الطاولة بنجاح', 'success');
    renderTables();
  }
}

// QR Code Management
function generateQRCode(tableNumber) {
  const baseUrl = window.location.origin + window.location.pathname;
  const orderUrl = `${baseUrl}?table=${tableNumber}&mode=order`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(orderUrl)}`;
  console.log(`Generated QR for table ${tableNumber}:`, qrUrl);
  return qrUrl;
}

function printTableQR(tableId) {
  const table = tables.find(t => t.id === tableId);
  if (!table) return;
  
  document.getElementById('table-name').textContent = table.name;
  document.getElementById('qr-code-container').innerHTML = `
    <img src="${table.qrCode}" alt="QR Code" style="width: 200px; height: 200px; margin: 20px 0;">
  `;
  
  document.getElementById('print-modal').style.display = 'flex';
}

function printQR() {
  window.print();
}

function closePrintModal() {
  document.getElementById('print-modal').style.display = 'none';
}

// Order Management
function showOrderInterface() {
  console.log('Showing orders interface');
  renderOrders();
}

function renderOrders() {
  if (orders.length === 0) {
    document.getElementById('main-content').innerHTML = `
      <div class="form-container">
        <h2>قائمة الطلبات</h2>
        <div class="no-orders">لا توجد طلبات حالياً</div>
      </div>
    `;
    return;
  }
  
  const ordersHtml = orders.map(order => `
    <div class="card">
      <h3>طلب من ${order.table ? `طاولة ${order.table}` : 'غير محدد'}</h3>
      <p><strong>الوقت:</strong> ${order.time}</p>
      ${order.customerName ? `<p><strong>اسم العميل:</strong> ${order.customerName}</p>` : ''}
      <p><strong>الأصناف:</strong></p>
      <ul>
        ${order.items.map(item => `
          <li>${item.name} - الكمية: ${item.quantity} - السعر: ${(item.price * item.quantity).toFixed(2)} د.ك</li>
        `).join('')}
      </ul>
      ${order.notes ? `<p><strong>ملاحظات:</strong> ${order.notes}</p>` : ''}
      <p><strong>إجمالي السعر:</strong> ${order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)} د.ك</p>
      <div style="text-align: center; margin-top: 20px;">
        <button onclick="completeOrder(${order.id})" class="btn btn-primary">إكمال الطلب</button>
        <button onclick="deleteOrder(${order.id})" class="btn btn-secondary" style="margin-right: 10px;">حذف الطلب</button>
      </div>
    </div>
  `).join('');
  
  document.getElementById('main-content').innerHTML = `
    <h1>قائمة الطلبات</h1>
    <div class="table-grid">
      ${ordersHtml}
    </div>
  `;
}

function completeOrder(orderId) {
  orders = orders.filter(order => order.id !== orderId);
  saveData('orders', orders);
  showNotification('تم إكمال الطلب بنجاح!', 'success');
  renderOrders();
}

function deleteOrder(orderId) {
  if (confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
    orders = orders.filter(order => order.id !== orderId);
    saveData('orders', orders);
    showNotification('تم حذف الطلب', 'success');
    renderOrders();
  }
}

// Kitchen Interface Functions
function renderKitchenOrders() {
  const activeOrders = orders.filter(order => order.status !== 'completed');
  const ordersContainer = document.getElementById('ordersGrid');
  
  if (activeOrders.length === 0) {
    ordersContainer.innerHTML = '<div class="no-orders">لا توجد طلبات نشطة حالياً</div>';
    return;
  }
  
  const ordersHtml = activeOrders.map(order => `
    <div class="order-card">
      <div class="order-header">
        <h3>طلب من ${order.table ? `طاولة ${order.table}` : 'غير محدد'}</h3>
        <div class="order-time">${order.time}</div>
      </div>
      
      <div class="order-items">
        <h4>الأصناف المطلوبة:</h4>
        <ul>
          ${order.items.map(item => `
            <li>
              <span class="item-name">${item.name}</span>
              <span class="item-quantity">×${item.quantity}</span>
            </li>
          `).join('')}
        </ul>
      </div>
      
      ${order.notes ? `
        <div class="order-notes">
          <h4>ملاحظات خاصة:</h4>
          <p>${order.notes}</p>
        </div>
      ` : ''}
      
      <div class="order-actions">
        <button onclick="markOrderComplete(${order.id})" class="complete-btn">
          ✅ إكمال الطلب
        </button>
      </div>
    </div>
  `).join('');
  
  ordersContainer.innerHTML = ordersHtml;
}

function markOrderComplete(orderId) {
  const orderIndex = orders.findIndex(order => order.id === orderId);
  if (orderIndex !== -1) {
    const order = orders[orderIndex];
    order.status = 'completed';
    saveData('orders', orders);
    showNotification('تم إكمال الطلب بنجاح!', 'success');
    
    // Add notification for completion
    addNotification(
      `انتهاء طلب من المطبخ`,
      `تم إكمال طلب طاولة ${order.table} بنجاح`,
      'kitchen',
      'low'
    );
    
    renderKitchenOrders();
    updateKitchenStats();
  }
}

function updateKitchenStats() {
  const activeOrdersCount = orders.filter(order => order.status !== 'completed').length;
  const completedOrdersCount = orders.filter(order => order.status === 'completed').length;
  const serviceRequestsCount = serviceRequests.length;
  
  document.getElementById('activeOrders').textContent = `${activeOrdersCount} طلب نشط`;
  document.getElementById('completedOrders').textContent = `${completedOrdersCount} طلب مكتمل`;
  document.getElementById('serviceRequests').textContent = `${serviceRequestsCount} طلب خدمة`;
}

// Customer Interface Functions
function selectTable() {
  const tableSelector = document.getElementById('tableSelector');
  selectedTable = tableSelector.value;
  
  if (selectedTable) {
    document.getElementById('tableInfo').innerHTML = `
      <span>طاولة ${selectedTable}</span>
      <select id="tableSelector" onchange="selectTable()" style="margin-right: 15px;">
        <option value="">تغيير الطاولة</option>
        <option value="1" ${selectedTable === '1' ? 'selected' : ''}>طاولة 1</option>
        <option value="2" ${selectedTable === '2' ? 'selected' : ''}>طاولة 2</option>
        <option value="3" ${selectedTable === '3' ? 'selected' : ''}>طاولة 3</option>
        <option value="4" ${selectedTable === '4' ? 'selected' : ''}>طاولة 4</option>
        <option value="5" ${selectedTable === '5' ? 'selected' : ''}>طاولة 5</option>
      </select>
    `;
    loadMenuItems();
  }
}

function loadMenuItems() {
  const menuContainer = document.getElementById('menuItems');
  
  if (!selectedTable) {
    menuContainer.innerHTML = '<div class="no-items">اختر طاولة أولاً لعرض القائمة</div>';
    return;
  }
  
  if (items.length === 0) {
    menuContainer.innerHTML = '<div class="no-items">لا توجد أصناف متاحة حالياً</div>';
    return;
  }
  
  menuContainer.innerHTML = items.map(item => `
    <div class="customer-item-box">
      <div class="item-info">
        <input type="checkbox" id="item-${item.id}" onchange="toggleItem(${item.id})">
        <label for="item-${item.id}">
          <span class="item-name">${item.name}</span>
          <span class="item-price">${item.price} د.ك</span>
        </label>
      </div>
      ${item.description ? `<div class="item-description">${item.description}</div>` : ''}
    </div>
  `).join('');
  
  updateSelectedItemsDisplay();
}

function toggleItem(itemId) {
  const checkbox = document.getElementById(`item-${itemId}`);
  const item = items.find(i => i.id === itemId);
  
  if (!item) return;
  
  let selectedItems = JSON.parse(localStorage.getItem('selectedItems') || '[]');
  
  if (checkbox.checked) {
    selectedItems.push({
      ...item,
      quantity: 1
    });
  } else {
    selectedItems = selectedItems.filter(i => i.id !== itemId);
  }
  
  localStorage.setItem('selectedItems', JSON.stringify(selectedItems));
  updateSelectedItemsDisplay();
}

function updateQuantity(itemId, change) {
  let selectedItems = JSON.parse(localStorage.getItem('selectedItems') || '[]');
  const item = selectedItems.find(i => i.id === itemId);
  
  if (item) {
    item.quantity = Math.max(1, (item.quantity || 1) + change);
    localStorage.setItem('selectedItems', JSON.stringify(selectedItems));
    updateSelectedItemsDisplay();
  }
}

function updateSelectedItemsDisplay() {
  const selectedItems = JSON.parse(localStorage.getItem('selectedItems') || '[]');
  const container = document.getElementById('selectedItems');
  
  if (selectedItems.length === 0) {
    container.innerHTML = '<div class="empty-order">لم تختر أي أصناف بعد</div>';
    return;
  }
  
  const total = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  container.innerHTML = `
    <div class="selected-items">
      ${selectedItems.map(item => `
        <div class="order-item-row">
          <div class="item-details">
            <div class="item-name">${item.name}</div>
          </div>
          <div class="quantity-controls">
            <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
            <span class="qty-display">${item.quantity}</span>
            <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
          </div>
        </div>
      `).join('')}
      <div class="total-display">المجموع: ${total.toFixed(2)} د.ك</div>
    </div>
  `;
}

// Order and Service Functions
function sendOrder() {
  const selectedItems = JSON.parse(localStorage.getItem('selectedItems') || '[]');
  const customerName = document.getElementById('customerName').value;
  const orderNotes = document.getElementById('orderNotes').value;
  
  if (selectedItems.length === 0) {
    showNotification('يرجى اختيار أصناف أولاً', 'warning');
    return;
  }
  
  if (!selectedTable) {
    showNotification('يرجى اختيار طاولة أولاً', 'warning');
    return;
  }
  
  const order = {
    id: Date.now(),
    table: selectedTable,
    items: selectedItems,
    customerName: customerName,
    notes: orderNotes,
    status: 'new',
    time: new Date().toLocaleString('ar-SA')
  };
  
  orders.push(order);
  saveData('orders', orders);
  
  // Clear selected items
  localStorage.removeItem('selectedItems');
  
  // Reset form
  document.getElementById('customerName').value = '';
  document.getElementById('orderNotes').value = '';
  
  // Uncheck all checkboxes
  document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
  
  // Update display
  updateSelectedItemsDisplay();
  
  showNotification('تم إرسال طلبك بنجاح! 🎉', 'success');
  
  // Add notification for kitchen
  addNotification(
    `طلب جديد من طاولة ${selectedTable}`,
    `تم استلام طلب جديد يحتوي على ${selectedItems.length} أصناف من طاولة ${selectedTable}`,
    'orders',
    'high'
  );
}

function requestService() {
  if (!selectedTable) {
    showNotification('يرجى اختيار طاولة أولاً', 'warning');
    return;
  }
  
  const customerName = document.getElementById('customerName').value || 'عميل';
  const serviceRequest = {
    id: Date.now(),
    table: selectedTable,
    customerName: customerName,
    type: 'service',
    time: new Date().toLocaleString('ar-SA')
  };
  
  serviceRequests.push(serviceRequest);
  saveData('serviceRequests', serviceRequests);
  
  showNotification('تم إرسال طلب الخدمة بنجاح! 🔔', 'success');
  
  // Add notification for staff
  addNotification(
    `طلب خدمة من طاولة ${selectedTable}`,
    `العميل ${customerName} يطلب خدمة من طاولة ${selectedTable}`,
    'service',
    'medium'
  );
}

// Notifications System Functions
let notifications = [];
let currentFilter = 'all';
let notificationSettings = {
  soundEnabled: true,
  desktopNotifications: true,
  autoRefresh: true
};

function showNotificationsInterface() {
  currentInterface = 'notifications';
  hideAllInterfaces();
  document.getElementById('notifications-interface').style.display = 'block';
  
  // Load notifications data
  loadNotificationsData();
  
  // Update last update time
  document.getElementById('notificationsLastUpdate').textContent = 'الآن';
  
  // Start auto-refresh if enabled
  if (notificationSettings.autoRefresh) {
    startNotificationsAutoRefresh();
  }
}

function loadNotificationsData() {
  // Load notifications from localStorage
  const savedNotifications = localStorage.getItem('notifications');
  if (savedNotifications) {
    try {
      notifications = JSON.parse(savedNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
      notifications = [];
    }
  }
  
  // Generate sample notifications if empty
  if (notifications.length === 0) {
    generateSampleNotifications();
  }
  
  // Update statistics
  updateNotificationsStats();
  
  // Render notifications
  renderNotifications();
  
  // Load settings
  loadNotificationSettings();
}

function generateSampleNotifications() {
  const sampleNotifications = [
    {
      id: 1,
      title: 'طلب جديد من طاولة 3',
      message: 'تم استلام طلب جديد يحتوي على 4 أصناف من طاولة 3',
      type: 'orders',
      time: new Date(Date.now() - 5 * 60 * 1000).toLocaleString('ar-SA'),
      read: false,
      priority: 'high'
    },
    {
      id: 2,
      title: 'طلب خدمة من طاولة 1',
      message: 'العميل يطلب منديل إضافي وملعقة',
      type: 'service',
      time: new Date(Date.now() - 10 * 60 * 1000).toLocaleString('ar-SA'),
      read: false,
      priority: 'medium'
    },
    {
      id: 3,
      title: 'انتهاء طلب من المطبخ',
      message: 'تم إكمال طلب طاولة 2 بنجاح',
      type: 'kitchen',
      time: new Date(Date.now() - 15 * 60 * 1000).toLocaleString('ar-SA'),
      read: true,
      priority: 'low'
    },
    {
      id: 4,
      title: 'تنبيه مخزون منخفض',
      message: 'كمية القهوة منخفضة، يرجى إعادة الطلب',
      type: 'inventory',
      time: new Date(Date.now() - 30 * 60 * 1000).toLocaleString('ar-SA'),
      read: false,
      priority: 'high'
    },
    {
      id: 5,
      title: 'تحديث النظام',
      message: 'تم تحديث النظام بنجاح إلى الإصدار الجديد',
      type: 'system',
      time: new Date(Date.now() - 60 * 60 * 1000).toLocaleString('ar-SA'),
      read: true,
      priority: 'low'
    }
  ];
  
  notifications = sampleNotifications;
  saveNotificationsData();
}

function renderNotifications() {
  const notificationsList = document.getElementById('notificationsList');
  
  if (notifications.length === 0) {
    notificationsList.innerHTML = '<div class="no-notifications">لا توجد إشعارات حالياً</div>';
    return;
  }
  
  // Filter notifications based on current filter
  let filteredNotifications = notifications;
  if (currentFilter !== 'all') {
    filteredNotifications = notifications.filter(n => n.type === currentFilter);
  }
  
  if (filteredNotifications.length === 0) {
    notificationsList.innerHTML = '<div class="no-notifications">لا توجد إشعارات في هذا التصنيف</div>';
    return;
  }
  
  // Sort by time (newest first)
  filteredNotifications.sort((a, b) => new Date(b.time) - new Date(a.time));
  
  const notificationsHTML = filteredNotifications.map(notification => `
    <div class="notification-item ${notification.read ? '' : 'unread'}" data-id="${notification.id}">
      <div class="notification-header">
        <div>
          <div class="notification-title">${notification.title}</div>
          <div class="notification-time">${notification.time}</div>
        </div>
        <div class="notification-type ${notification.type}">${getNotificationTypeText(notification.type)}</div>
      </div>
      <div class="notification-message">${notification.message}</div>
      <div class="notification-meta">
        <span>الأولوية: ${getPriorityText(notification.priority)}</span>
        <span>${notification.read ? 'مقروء' : 'جديد'}</span>
      </div>
      <div class="notification-actions">
        ${!notification.read ? `<button onclick="markAsRead(${notification.id})" class="notification-btn primary">✅ تحديد كمقروء</button>` : ''}
        <button onclick="deleteNotification(${notification.id})" class="notification-btn danger">🗑️ حذف</button>
        <button onclick="viewNotificationDetails(${notification.id})" class="notification-btn">👁️ تفاصيل</button>
      </div>
    </div>
  `).join('');
  
  notificationsList.innerHTML = notificationsHTML;
}

function getNotificationTypeText(type) {
  const typeTexts = {
    orders: 'طلب طعام',
    service: 'طلب خدمة',
    kitchen: 'المطبخ',
    inventory: 'المخزون',
    system: 'النظام'
  };
  return typeTexts[type] || type;
}

function getPriorityText(priority) {
  const priorityTexts = {
    high: 'عالية',
    medium: 'متوسطة',
    low: 'منخفضة'
  };
  return priorityTexts[priority] || priority;
}

function filterNotifications(filter) {
  currentFilter = filter;
  
  // Update active filter button
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  
  // Re-render notifications
  renderNotifications();
}

function searchNotifications() {
  const searchTerm = document.getElementById('notificationSearch').value.toLowerCase();
  
  // Filter notifications based on search term
  const filteredNotifications = notifications.filter(notification => 
    notification.title.toLowerCase().includes(searchTerm) ||
    notification.message.toLowerCase().includes(searchTerm) ||
    getNotificationTypeText(notification.type).toLowerCase().includes(searchTerm)
  );
  
  // Update display
  const notificationsList = document.getElementById('notificationsList');
  
  if (filteredNotifications.length === 0) {
    notificationsList.innerHTML = '<div class="no-notifications">لا توجد نتائج للبحث</div>';
    return;
  }
  
  const notificationsHTML = filteredNotifications.map(notification => `
    <div class="notification-item ${notification.read ? '' : 'unread'}" data-id="${notification.id}">
      <div class="notification-header">
        <div>
          <div class="notification-title">${notification.title}</div>
          <div class="notification-time">${notification.time}</div>
        </div>
        <div class="notification-type ${notification.type}">${getNotificationTypeText(notification.type)}</div>
      </div>
      <div class="notification-message">${notification.message}</div>
      <div class="notification-meta">
        <span>الأولوية: ${getPriorityText(notification.priority)}</span>
        <span>${notification.read ? 'مقروء' : 'جديد'}</span>
      </div>
      <div class="notification-actions">
        ${!notification.read ? `<button onclick="markAsRead(${notification.id})" class="notification-btn primary">✅ تحديد كمقروء</button>` : ''}
        <button onclick="deleteNotification(${notification.id})" class="notification-btn danger">🗑️ حذف</button>
        <button onclick="viewNotificationDetails(${notification.id})" class="notification-btn">👁️ تفاصيل</button>
      </div>
    </div>
  `).join('');
  
  notificationsList.innerHTML = notificationsHTML;
}

function markAsRead(notificationId) {
  const notification = notifications.find(n => n.id === notificationId);
  if (notification) {
    notification.read = true;
    saveNotificationsData();
    updateNotificationsStats();
    renderNotifications();
    showNotification('تم تحديد الإشعار كمقروء', 'success');
  }
}

function markAllAsRead() {
  notifications.forEach(notification => {
    notification.read = true;
  });
  saveNotificationsData();
  updateNotificationsStats();
  renderNotifications();
  showNotification('تم تحديد جميع الإشعارات كمقروءة', 'success');
}

function deleteNotification(notificationId) {
  notifications = notifications.filter(n => n.id !== notificationId);
  saveNotificationsData();
  updateNotificationsStats();
  renderNotifications();
  showNotification('تم حذف الإشعار بنجاح', 'success');
}

function clearAllNotifications() {
  if (confirm('هل أنت متأكد من حذف جميع الإشعارات؟')) {
    notifications = [];
    saveNotificationsData();
    updateNotificationsStats();
    renderNotifications();
    showNotification('تم حذف جميع الإشعارات', 'success');
  }
}

function viewNotificationDetails(notificationId) {
  const notification = notifications.find(n => n.id === notificationId);
  if (notification) {
    alert(`تفاصيل الإشعار:\n\nالعنوان: ${notification.title}\nالرسالة: ${notification.message}\nالنوع: ${getNotificationTypeText(notification.type)}\nالوقت: ${notification.time}\nالأولوية: ${getPriorityText(notification.priority)}`);
  }
}

function exportNotifications() {
  const dataStr = JSON.stringify(notifications, null, 2);
  const dataBlob = new Blob([dataStr], {type: 'application/json'});
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `notifications_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
  showNotification('تم تصدير الإشعارات بنجاح', 'success');
}

function updateNotificationsStats() {
  const unreadCount = notifications.filter(n => !n.read).length;
  const totalCount = notifications.length;
  const activeAlerts = notifications.filter(n => n.type === 'inventory' && !n.read).length;
  
  document.getElementById('unreadNotifications').textContent = `${unreadCount} إشعارات جديدة`;
  document.getElementById('totalNotifications').textContent = `${totalCount} إجمالي الإشعارات`;
  document.getElementById('activeAlerts').textContent = `${activeAlerts} تنبيهات نشطة`;
}

function saveNotificationsData() {
  localStorage.setItem('notifications', JSON.stringify(notifications));
}

function loadNotificationSettings() {
  const savedSettings = localStorage.getItem('notificationSettings');
  if (savedSettings) {
    try {
      notificationSettings = JSON.parse(savedSettings);
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  }
  
  // Update checkboxes
  document.getElementById('soundEnabled').checked = notificationSettings.soundEnabled;
  document.getElementById('desktopNotifications').checked = notificationSettings.desktopNotifications;
  document.getElementById('autoRefresh').checked = notificationSettings.autoRefresh;
}

function saveNotificationSettings() {
  notificationSettings.soundEnabled = document.getElementById('soundEnabled').checked;
  notificationSettings.desktopNotifications = document.getElementById('desktopNotifications').checked;
  notificationSettings.autoRefresh = document.getElementById('autoRefresh').checked;
  
  localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
  
  if (notificationSettings.autoRefresh) {
    startNotificationsAutoRefresh();
  } else {
    stopNotificationsAutoRefresh();
  }
  
  showNotification('تم حفظ إعدادات الإشعارات', 'success');
}

function startNotificationsAutoRefresh() {
  // Clear existing interval
  if (window.notificationsInterval) {
    clearInterval(window.notificationsInterval);
  }
  
  // Start new interval (refresh every 30 seconds)
  window.notificationsInterval = setInterval(() => {
    if (currentInterface === 'notifications') {
      loadNotificationsData();
      document.getElementById('notificationsLastUpdate').textContent = 'الآن';
    }
  }, 30000);
}

function stopNotificationsAutoRefresh() {
  if (window.notificationsInterval) {
    clearInterval(window.notificationsInterval);
    window.notificationsInterval = null;
  }
}

// Add event listeners for settings changes
document.addEventListener('DOMContentLoaded', function() {
  // Add event listeners for notification settings
  const soundCheckbox = document.getElementById('soundEnabled');
  const desktopCheckbox = document.getElementById('desktopNotifications');
  const autoRefreshCheckbox = document.getElementById('autoRefresh');
  
  if (soundCheckbox) {
    soundCheckbox.addEventListener('change', saveNotificationSettings);
  }
  if (desktopCheckbox) {
    desktopCheckbox.addEventListener('change', saveNotificationSettings);
  }
  if (autoRefreshCheckbox) {
    autoRefreshCheckbox.addEventListener('change', saveNotificationSettings);
  }
});

// Function to add new notification (can be called from other parts of the system)
function addNotification(title, message, type = 'system', priority = 'medium') {
  const newNotification = {
    id: Date.now(),
    title: title,
    message: message,
    type: type,
    time: new Date().toLocaleString('ar-SA'),
    read: false,
    priority: priority
  };
  
  notifications.unshift(newNotification); // Add to beginning
  saveNotificationsData();
  
  // Update stats if notifications interface is active
  if (currentInterface === 'notifications') {
    updateNotificationsStats();
    renderNotifications();
  }
  
  // Show desktop notification if enabled
  if (notificationSettings.desktopNotifications && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico'
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, {
            body: message,
            icon: '/favicon.ico'
          });
        }
      });
    }
  }
  
  // Play sound if enabled
  if (notificationSettings.soundEnabled) {
    playNotificationSound();
  }
}

function playNotificationSound() {
  // Create a simple notification sound
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
  oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.3);
}

// Utility Functions
function showNotification(message, type = 'success') {
  const colors = {
    success: '#27ae60',
    error: '#e74c3c',
    warning: '#f39c12',
    info: '#667eea'
  };
  
  Toastify({
    text: message,
    duration: 3000,
    gravity: "top",
    position: "right",
    backgroundColor: colors[type] || colors.info,
    stopOnFocus: true,
    className: "toast-notification"
  }).showToast();
}

// Check URL parameters for direct access
window.onload = function() {
  const urlParams = new URLSearchParams(window.location.search);
  const tableParam = urlParams.get('table');
  const modeParam = urlParams.get('mode');
  
  if (modeParam === 'order' && tableParam) {
    // Direct customer access via QR code
    selectedTable = tableParam;
    setTimeout(() => {
      document.getElementById('loading-screen').style.display = 'none';
      showCustomerInterface();
      document.getElementById('tableSelector').value = tableParam;
      selectTable();
    }, 2000);
  } else {
    // Normal admin access
    setTimeout(() => {
      document.getElementById('loading-screen').style.display = 'none';
      showAdminInterface();
    }, 2000);
  }
  
  loadAllData();
};

// Error handling
window.addEventListener('error', function(e) {
  console.error('Global error:', e.error);
  showNotification('حدث خطأ في النظام', 'error');
});

// Performance monitoring
window.addEventListener('load', function() {
  if ('performance' in window) {
    const perfData = performance.getEntriesByType('navigation')[0];
    console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
  }
});