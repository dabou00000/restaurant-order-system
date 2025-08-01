let items = [];
let selectedItems = [];

function showAddItemForm() {
  const content = document.getElementById("main-content");
  content.innerHTML = `
    <h2>CAVE RESTAURANT</h2>
    <h3>إضافة صنف جديد</h3>
    <input type="text" id="item-name" placeholder="اسم الصنف">
    <input type="number" id="item-price" placeholder="السعر باللبناني">
    <button onclick="addItem()">💾 حفظ الصنف</button>
  `;
}

function addItem() {
  const name = document.getElementById("item-name").value;
  const price = parseInt(document.getElementById("item-price").value);
  if (name && price > 0) {
    items.push({ name: name, price: price });
    alert("تمت إضافة الصنف بنجاح!");
  } else {
    alert("يرجى إدخال اسم وسعر صحيح.");
  }
}

function showOrderInterface() {
  const content = document.getElementById("main-content");
  content.innerHTML = `
    <h2>CAVE RESTAURANT</h2>
    <h3>قائمة الطلبات</h3>
    <input type="text" id="search-box" oninput="filterItems()" placeholder="ابحث عن صنف...">
    <div id="items-list"></div>
    <div class="selected-items" id="selected-items">
      <h3>الطلب الحالي</h3>
      <div id="order-preview"></div>
      <div class="total-display" id="total-display">المجموع الكلي: 0 ل.ل</div>
      
      <div class="customer-info">
        <h4>معلومات الزبون</h4>
        <input type="text" id="customer-name" placeholder="اسم الزبون" class="customer-input">
        <input type="text" id="customer-address" placeholder="عنوان الزبون" class="customer-input">
      </div>
      
      <button onclick="printOrder()">🖨️ طباعة الطلبية</button>
      <button onclick="sendWhatsAppOrder()" class="whatsapp-btn">📱 إرسال عبر واتساب</button>
    </div>
  `;
  renderItems();
}

function filterItems() {
  const search = document.getElementById("search-box").value.toLowerCase();
  const filtered = items.filter(i => i.name.toLowerCase().includes(search));
  renderItems(filtered);
}

function renderItems(list = items) {
  const listContainer = document.getElementById("items-list");
  listContainer.innerHTML = "";

  if (list.length === 0) {
    listContainer.innerHTML = "<p>لا توجد نتائج</p>";
    return;
  }

  list.forEach((item, index) => {
   const id = `item-${index}`;
    const box = document.createElement("div");
    box.className = "item-box";
    box.innerHTML = `
      <input type="checkbox" id="${id}" onchange="toggleItem(${index}, this.checked)">
      <label for="${id}">${item.name} - ${item.price} ل.ل</label>
    `;
    listContainer.appendChild(box);
  });
}

function toggleItem(index, checked) {
  const item = items[index];
  if (checked) {
    selectedItems.push({ ...item, quantity: 1 });
  } else {
    selectedItems = selectedItems.filter(i => i.name !== item.name);
  }
  renderSelected();
}

function renderSelected() {
  const container = document.getElementById("order-preview");
  container.innerHTML = "";

  selectedItems.forEach((item, idx) => {
    const row = document.createElement("div");
    row.innerHTML = `
      ${item.name} - ${item.price} ل.ل ×
      <input type="number" min="1" value="${item.quantity}" onchange="updateQty(${idx}, this.value)">
    `;
    container.appendChild(row);
  });

  calculateTotal();
}

function updateQty(index, value) {
  selectedItems[index].quantity = parseInt(value);
  calculateTotal();
}

function calculateTotal() {
  let total = 0;
  selectedItems.forEach(item => {
    total += item.price * item.quantity;
  });
  document.getElementById("total-display").innerText = "المجموع الكلي: " + total.toLocaleString() + " ل.ل";
}

function printOrder() {
  const customerName = document.getElementById("customer-name")?.value || "غير محدد";
  const customerAddress = document.getElementById("customer-address")?.value || "غير محدد";
  
  let content = `CAVE RESTAURANT\n`;
  content += `═══════════════════\n\n`;
  content += `اسم الزبون: ${customerName}\n`;
  content += `العنوان: ${customerAddress}\n`;
  content += `═══════════════════\n\n`;
  
  content += selectedItems.map(item =>
    item.name + " × " + item.quantity + " = " + (item.price * item.quantity).toLocaleString() + " ل.ل"
  ).join("\n");

  let total = selectedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  content += "\n\n═══════════════════\n";
  content += "المجموع: " + total.toLocaleString() + " ل.ل";

  let win = window.open("", "", "height=700,width=900");
  win.document.write(`
  <html>
    <head>
      <style>
        body {
          font-size: 22px;
          font-family: 'Arial', sans-serif;
          direction: rtl;
          padding: 20px;
          text-align: center;
        }
        .restaurant-name {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 20px;
        }
        .divider {
          border-top: 2px solid #000;
          margin: 15px 0;
        }
      </style>
    </head>
    <body>
      <pre>${content}</pre>
    </body>
  </html>
`);
  win.print();
}

function sendWhatsAppOrder() {
  const customerName = document.getElementById("customer-name")?.value || "غير محدد";
  const customerAddress = document.getElementById("customer-address")?.value || "غير محدد";
  
  if (selectedItems.length === 0) {
    alert("يرجى اختيار أصناف للطلب أولاً");
    return;
  }
  
  if (!customerName || customerName === "غير محدد") {
    alert("يرجى إدخال اسم الزبون");
    return;
  }
  
  if (!customerAddress || customerAddress === "غير محدد") {
    alert("يرجى إدخال عنوان الزبون");
    return;
  }
  
  let message = `🍽️ *CAVE RESTAURANT* 🍽️\n\n`;
  message += `🧍 *اسم الزبون:* ${customerName}\n`;
  message += `🏠 *العنوان:* ${customerAddress}\n\n`;
  message += `📋 *تفاصيل الطلب:*\n`;
  message += `═══════════════════\n\n`;
  
  selectedItems.forEach(item => {
    message += `🍽️ ${item.name}\n`;
    message += `🔢 الكمية: ${item.quantity}\n`;
    message += `💰 السعر: ${(item.price * item.quantity).toLocaleString()} ل.ل\n\n`;
  });
  
  let total = selectedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  message += `═══════════════════\n`;
  message += `💰 *المجموع الكلي: ${total.toLocaleString()} ل.ل* 💰\n\n`;
  message += `شكراً لطلبكم من CAVE RESTAURANT! 🎉`;
  
  // رقم الواتساب - يمكن تغييره حسب الحاجة
  const phoneNumber = "96170000000"; // استبدل برقم صاحب المطعم الفعلي
  
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
}