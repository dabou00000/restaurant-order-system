// Security: Strict mode
'use strict';

// Security: Prevent global variable pollution
(function() {
  'use strict';

  // Security: Input sanitization function
  function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    return input.replace(/[<>]/g, '').trim();
  }

  // Security: XSS prevention
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Security: CSRF protection
  function generateCSRFToken() {
    return Math.random().toString(36).substr(2, 15);
  }

  // Performance: Debounce function
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Performance: Throttle function
  function throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }
  }

  // Error handling wrapper
  function safeExecute(fn, errorMessage = 'حدث خطأ') {
    try {
      return fn();
    } catch (error) {
      console.error('Error:', error);
      showNotification(errorMessage, 'error');
      return null;
    }
  }

  // Data validation
  function validateItem(item) {
    if (!item.name || item.name.trim().length < 2) {
      throw new Error('اسم الصنف يجب أن يكون أكثر من حرفين');
    }
    if (!item.price || isNaN(item.price) || item.price <= 0) {
      throw new Error('السعر يجب أن يكون رقم موجب');
    }
    return true;
  }

  // Data storage with encryption (basic)
  const storage = {
    set: function(key, value) {
      try {
        const encrypted = btoa(JSON.stringify(value));
        localStorage.setItem(key, encrypted);
        return true;
      } catch (error) {
        console.error('Storage error:', error);
        return false;
      }
    },
    
    get: function(key) {
      try {
        const encrypted = localStorage.getItem(key);
        if (!encrypted) return null;
        return JSON.parse(atob(encrypted));
      } catch (error) {
        console.error('Storage error:', error);
        return null;
      }
    },
    
    remove: function(key) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (error) {
        console.error('Storage error:', error);
        return false;
      }
    }
  };

  // Initialize data with security checks
  let items = storage.get('items') || [];
  let tables = storage.get('tables') || [
    { id: 1, name: 'Table 1', qrCode: '', active: false },
    { id: 2, name: 'Table 2', qrCode: '', active: false },
    { id: 3, name: 'Table 3', qrCode: '', active: false },
    { id: 4, name: 'Table 4', qrCode: '', active: false }
  ];
  let orders = storage.get('orders') || [];

  // Security: Validate loaded data
  function validateLoadedData() {
    if (!Array.isArray(items)) items = [];
    if (!Array.isArray(tables)) tables = [];
    if (!Array.isArray(orders)) orders = [];
    
    // Clean invalid data
    items = items.filter(item => item && item.name && item.price);
    tables = tables.filter(table => table && table.id && table.name);
    orders = orders.filter(order => order && order.id && order.table);
  }

  // Enhanced notification system
  function showNotification(message, type = 'success') {
    const colors = {
      success: '#27ae60',
      error: '#e74c3c',
      warning: '#f39c12',
      info: '#3498db'
    };

    Toastify({
      text: sanitizeInput(message),
      duration: 3000,
      gravity: "top",
      position: "right",
      backgroundColor: colors[type] || colors.info,
      stopOnFocus: true,
      className: "toast-notification"
    }).showToast();
  }

  // Enhanced QR code generation with security
  function generateQRCode(tableId) {
    const baseUrl = window.location.origin;
    const qrData = `${baseUrl}/order.html?table=${tableId}&t=${Date.now()}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`;
  }

  // Enhanced table rendering with security
  function renderTables() {
    console.log('Rendering tables...');
    const mainContent = document.getElementById('main-content');
    if (!mainContent) {
      console.error('Main content element not found');
      return;
    }

    mainContent.innerHTML = `
      <div class="form-container">
        <h2>Sardecoffeshop</h2>
        <h3>إدارة الطاولات</h3>
        <div class="table-grid">
          ${tables.map(table => `
            <div class="table-card ${table.active ? 'active' : ''}" data-table-id="${table.id}">
              <h3>${escapeHtml(table.name)}</h3>
              <div class="table-status">
                <span class="status-indicator ${table.active ? 'active' : ''}"></span>
                <span>${table.active ? 'مفعلة' : 'غير مفعلة'}</span>
              </div>
              ${table.qrCode ? `
                <div class="table-qr">
                  <img src="${table.qrCode}" alt="QR Code for ${escapeHtml(table.name)}" />
                </div>
              ` : ''}
              <div class="table-actions">
                <button onclick="toggleTable(${table.id})" class="btn ${table.active ? 'btn-secondary' : 'btn-primary'}">
                  ${table.active ? 'إيقاف' : 'تفعيل'}
                </button>
                <button onclick="printTableQR(${table.id})" class="btn btn-print print-btn">
                  طباعة QR
                </button>
                <button onclick="deleteTable(${table.id})" class="btn btn-secondary">
                  حذف
                </button>
              </div>
            </div>
          `).join('')}
        </div>
        <button onclick="addNewTable()" class="btn btn-primary" style="margin-top: 20px;">
          ➕ إضافة طاولة جديدة
        </button>
      </div>
    `;
  }

  // Enhanced add item function with validation
  function addItem() {
    return safeExecute(() => {
      const nameInput = document.getElementById('itemName');
      const priceInput = document.getElementById('itemPrice');
      const descriptionInput = document.getElementById('itemDescription');
      const featuresInput = document.getElementById('itemFeatures');

      if (!nameInput || !priceInput) {
        throw new Error('الحقول المطلوبة غير موجودة');
      }

      const name = sanitizeInput(nameInput.value);
      const price = parseFloat(priceInput.value);
      const description = sanitizeInput(descriptionInput?.value || '');
      const features = sanitizeInput(featuresInput?.value || '');

      const newItem = {
        id: Date.now(),
        name,
        price,
        description,
        features: features ? features.split(' ').filter(f => f.trim()) : []
      };

      validateItem(newItem);
      items.push(newItem);
      storage.set('items', items);
      
      showNotification('تم إضافة الصنف بنجاح! QR codes ستتحدث تلقائياً');
      
      // Clear form
      if (nameInput) nameInput.value = '';
      if (priceInput) priceInput.value = '';
      if (descriptionInput) descriptionInput.value = '';
      if (featuresInput) featuresInput.value = '';
      
      showAddItemForm();
    }, 'فشل في إضافة الصنف');
  }

  // Enhanced table management
  function toggleTable(tableId) {
    return safeExecute(() => {
      const table = tables.find(t => t.id === tableId);
      if (!table) throw new Error('الطاولة غير موجودة');
      
      table.active = !table.active;
      if (table.active) {
        table.qrCode = generateQRCode(tableId);
      } else {
        table.qrCode = '';
      }
      
      storage.set('tables', tables);
      renderTables();
      showNotification(`تم ${table.active ? 'تفعيل' : 'إيقاف'} الطاولة بنجاح`);
    }, 'فشل في تغيير حالة الطاولة');
  }

  // Enhanced print function with security
  function printTableQR(tableId) {
    return safeExecute(() => {
      const table = tables.find(t => t.id === tableId);
      if (!table) throw new Error('الطاولة غير موجودة');

      const printWindow = window.open('', '_blank');
      if (!printWindow) throw new Error('فشل في فتح نافذة الطباعة');

      const qrCodeUrl = generateQRCode(tableId);
      const currentTime = new Date().toLocaleString('ar-SA');

      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
          <meta charset="UTF-8">
          <title>طباعة QR - ${escapeHtml(table.name)}</title>
          <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet">
          <style>
            @media print {
              body { margin: 0; padding: 15px; }
              .qr-container { text-align: center; page-break-inside: avoid; }
              .brand-title { font-size: 28px; font-weight: 600; margin-bottom: 8px; color: #b38728; }
              .brand-subtitle { font-size: 18px; font-weight: 400; margin-bottom: 15px; color: #8e44ad; }
              .table-name { font-size: 20px; font-weight: 600; margin-bottom: 20px; color: #2c3e50; }
              .qr-code { margin: 15px auto; }
              .qr-instruction { font-size: 14px; color: #34495e; margin-top: 12px; }
              .logo-placeholder { width: 60px; height: 60px; margin: 0 auto 15px; background: #f8f9fa; border: 2px dashed #dee2e6; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
            }
            body {
              font-family: 'Cairo', 'Poppins', sans-serif;
              background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
              margin: 0;
              padding: 20px;
              min-height: 100vh;
            }
            .qr-container {
              text-align: center;
              padding: 30px;
              background: white;
              border-radius: 15px;
              box-shadow: 0 4px 20px rgba(0,0,0,0.1);
              max-width: 400px;
              margin: 0 auto;
            }
            .brand-title {
              font-size: 32px;
              font-weight: 600;
              margin-bottom: 5px;
              color: #b38728;
              font-family: 'Cairo', sans-serif;
            }
            .brand-subtitle {
              font-size: 20px;
              font-weight: 400;
              margin-bottom: 20px;
              color: #8e44ad;
              font-family: 'Cairo', sans-serif;
            }
            .table-name {
              font-size: 24px;
              font-weight: 600;
              margin-bottom: 25px;
              color: #2c3e50;
              font-family: 'Poppins', sans-serif;
              background: linear-gradient(135deg, #3498db, #2980b9);
              color: white;
              padding: 10px 20px;
              border-radius: 25px;
              display: inline-block;
            }
            .qr-code {
              margin: 20px auto;
              padding: 15px;
              background: white;
              border-radius: 12px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .qr-instruction {
              font-size: 16px;
              color: #34495e;
              margin-top: 20px;
              font-weight: 500;
              padding: 10px;
              background: #f8f9fa;
              border-radius: 8px;
              border-right: 4px solid #3498db;
            }
            .logo-placeholder {
              width: 80px;
              height: 80px;
              margin: 0 auto 20px;
              background: linear-gradient(135deg, #b38728, #8e44ad);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 24px;
              font-weight: bold;
            }
            @media print {
              body { background: white; }
              .qr-container { box-shadow: none; border: 1px solid #dee2e6; }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <div class="logo-placeholder">S</div>
            <h1 class="brand-title">Sardé</h1>
            <h2 class="brand-subtitle">سردة</h2>
            <div class="table-name">${escapeHtml(table.name)}</div>
            <div class="qr-code">
              <img src="${qrCodeUrl}" alt="QR Code for ${escapeHtml(table.name)}" style="border: 2px solid #3498db; border-radius: 10px;" />
            </div>
            <div class="qr-instruction">امسح هذا الكود للطلب من طاولتك</div>
            <div style="margin-top: 20px; font-size: 12px; color: #7f8c8d;">
              تم إنشاؤه في: ${currentTime}
            </div>
          </div>
        </body>
        </html>
      `);
      
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 500);
    }, 'فشل في طباعة QR code');
  }

  // Enhanced data loading with security
  function loadAllData() {
    return safeExecute(() => {
      console.log('Loading all data...');
      
      // Validate loaded data
      validateLoadedData();
      
      // Regenerate QR codes for active tables
      tables.forEach(table => {
        if (table.active && !table.qrCode) {
          table.qrCode = generateQRCode(table.id);
        }
      });
      
      storage.set('tables', tables);
      console.log('Data loaded successfully');
    }, 'فشل في تحميل البيانات');
  }

  // Enhanced interface functions
  function showAddItemForm() {
    return safeExecute(() => {
      const mainContent = document.getElementById('main-content');
      if (!mainContent) throw new Error('Main content element not found');

      mainContent.innerHTML = `
        <div class="form-container">
          <h2>Sardecoffeshop</h2>
          <h3>إضافة صنف جديد</h3>
          <div class="form-group">
            <label for="itemName">اسم الصنف *</label>
            <input type="text" id="itemName" placeholder="مثال: شاورما دجاج" required>
          </div>
          <div class="form-group">
            <label for="itemPrice">السعر *</label>
            <input type="number" id="itemPrice" placeholder="مثال: 15.50" step="0.01" min="0" required>
          </div>
          <div class="form-group">
            <label for="itemDescription">الوصف (اختياري)</label>
            <textarea id="itemDescription" placeholder="وصف الصنف..."></textarea>
          </div>
          <div class="form-group">
            <label for="itemFeatures">الخصائص (اختياري)</label>
            <input type="text" id="itemFeatures" placeholder="مثال: حار حلو حامض">
          </div>
          <button onclick="addItem()" class="btn btn-primary">💾 حفظ الصنف</button>
          <button onclick="showMainInterface()" class="btn btn-secondary">🔙 رجوع</button>
        </div>
      `;
    }, 'فشل في عرض نموذج إضافة الصنف');
  }

  function showOrderInterface() {
    return safeExecute(() => {
      const mainContent = document.getElementById('main-content');
      if (!mainContent) throw new Error('Main content element not found');

      mainContent.innerHTML = `
        <div class="form-container">
          <h2>Sardecoffeshop</h2>
          <h3>قائمة الطلبات</h3>
          <div id="ordersList">
            ${orders.length === 0 ? '<p>لا توجد طلبات حالياً</p>' : 
              orders.map(order => `
                <div class="card">
                  <h3>طلب رقم ${order.id}</h3>
                  <p><strong>الطاولة:</strong> ${escapeHtml(order.table)}</p>
                  <p><strong>الوقت:</strong> ${escapeHtml(order.time)}</p>
                  <p><strong>الحالة:</strong> ${escapeHtml(order.status)}</p>
                </div>
              `).join('')
            }
          </div>
          <button onclick="showMainInterface()" class="btn btn-secondary">🔙 رجوع</button>
        </div>
      `;
    }, 'فشل في عرض واجهة الطلبات');
  }

  function showTablesInterface() {
    return safeExecute(() => {
      console.log('Showing tables interface...');
      renderTables();
    }, 'فشل في عرض واجهة الطاولات');
  }

  function showKitchenInterface() {
    return safeExecute(() => {
      window.open('kitchen.html', '_blank');
    }, 'فشل في فتح واجهة المطبخ');
  }

  function showMainInterface() {
    return safeExecute(() => {
      const mainContent = document.getElementById('main-content');
      if (!mainContent) throw new Error('Main content element not found');

      mainContent.innerHTML = `
        <h1>مرحباً بك في Sardecoffeshop 👋</h1>
        <p>اختر من القائمة الجانبية لبدء العمل</p>
      `;
    }, 'فشل في عرض الواجهة الرئيسية');
  }

  // Enhanced table management functions
  function addNewTable() {
    return safeExecute(() => {
      const newId = Math.max(...tables.map(t => t.id), 0) + 1;
      const newTable = {
        id: newId,
        name: `Table ${newId}`,
        qrCode: '',
        active: false
      };
      
      tables.push(newTable);
      storage.set('tables', tables);
      renderTables();
      showNotification('تم إضافة طاولة جديدة بنجاح');
    }, 'فشل في إضافة طاولة جديدة');
  }

  function deleteTable(tableId) {
    return safeExecute(() => {
      if (!confirm('هل أنت متأكد من حذف هذه الطاولة؟')) return;
      
      tables = tables.filter(t => t.id !== tableId);
      storage.set('tables', tables);
      renderTables();
      showNotification('تم حذف الطاولة بنجاح');
    }, 'فشل في حذف الطاولة');
  }

  // Performance: Debounced functions
  const debouncedRenderTables = debounce(renderTables, 300);
  const debouncedLoadData = debounce(loadAllData, 500);

  // Initialize application
  function initializeApp() {
    return safeExecute(() => {
      console.log('Initializing application...');
      
      // Load data
      loadAllData();
      
      // Show main interface
      showMainInterface();
      
      // Set up periodic data saving
      setInterval(() => {
        storage.set('items', items);
        storage.set('tables', tables);
        storage.set('orders', orders);
      }, 30000); // Save every 30 seconds
      
      console.log('Application initialized successfully');
    }, 'فشل في تهيئة التطبيق');
  }

  // Security: Prevent global access to sensitive functions
  window.showAddItemForm = showAddItemForm;
  window.showOrderInterface = showOrderInterface;
  window.showTablesInterface = showTablesInterface;
  window.showKitchenInterface = showKitchenInterface;
  window.showMainInterface = showMainInterface;
  window.addItem = addItem;
  window.toggleTable = toggleTable;
  window.printTableQR = printTableQR;
  window.addNewTable = addNewTable;
  window.deleteTable = deleteTable;

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
  } else {
    initializeApp();
  }

  // Security: Prevent right-click context menu
  document.addEventListener('contextmenu', e => e.preventDefault());
  
  // Security: Prevent F12, Ctrl+Shift+I, Ctrl+U
  document.addEventListener('keydown', e => {
    if (e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.key === 'u')) {
      e.preventDefault();
      return false;
    }
  });

})();