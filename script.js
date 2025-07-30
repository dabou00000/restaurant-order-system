let items = [];
let selectedItems = [];

function showSection(id) {
  document.querySelectorAll('.section').forEach(section => {
    section.classList.add('hidden');
  });
  document.getElementById(id).classList.remove('hidden');
}

// ➕ إضافة صنف
function addItem() {
  let name = document.getElementById("item-name").value.trim();
  let price = parseInt(document.getElementById("item-price").value.trim());
  let optionsRaw = document.getElementById("item-options").value.trim();

  if (!name || !price) return alert("يرجى إدخال اسم وسعر الصنف");

  let options = optionsRaw ? optionsRaw.split(",").map(op => op.trim()) : [];

  items.push({ name: name, price: price, options: options });
  alert("تمت الإضافة");
  document.getElementById("item-name").value = "";
  document.getElementById("item-price").value = "";
  document.getElementById("item-options").value = "";
  renderItems();
}

// 🔍 البحث
function searchItems(query) {
  let filtered = items.filter(i => i.name.includes(query));
  renderItems(filtered);
}

// 📋 عرض الأصناف
function renderItems(list = items) {
  let listContainer = document.getElementById("list-container");
  if (list.length === 0) {
    listContainer.innerHTML = "<p>لا توجد نتائج</p>";
    return;
  }

  listContainer.innerHTML = "";
  list.forEach((item, index) => {
    let id = "item_" + index;
    let box = document.createElement("div");
    box.className = "item-box";
    box.innerHTML =
      '<input type="checkbox" id="' + id + '" onchange="toggleItem(' + index + ', this.checked)">' +
      '<label for="' + id + '">' + item.name + ' - ' + item.price + ' ل.ل</label>';
    listContainer.appendChild(box);
  });
}

// ✅ عند التحديد
function toggleItem(index, checked) {
  let item = items[index];
  if (checked) {
    selectedItems.push({
      name: item.name,
      price: item.price,
      options: item.options,
      selectedOptions: [],
      quantity: 1
    });
  } else {
    selectedItems = selectedItems.filter(i => i.name !== item.name);
  }
  renderSelected();
}

// 🔁 إعادة العرض
function renderSelected() {
  let container = document.getElementById("selected-preview");
  container.innerHTML = "";

  selectedItems.forEach((item, i) => {
    let div = document.createElement("div");
    div.className = "selected-item";

    let html = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h4>${item.name} - ${item.price} ل.ل</h4>
        <button onclick="removeItem(${i})" style="background-color: red; color: white; border: none; padding: 5px 10px; border-radius: 4px;">❌ delete</button>
      </div>
      الكمية: <input type="number" min="1" value="${item.quantity}" onchange="updateQuantity(${i}, this.value)">
    `;

    // خصائص
    if (item.options.length > 0) {
      html += '<div class="option-box">الخصائص:<br>';
      item.options.forEach((opt, j) => {
        let id = "opt_" + i + "_" + j;
        html += `
          <input type="checkbox" id="${id}" onchange="toggleOption(${i}, '${opt}', this.checked)">
          <label for="${id}">${opt}</label>
        `;
      });
      html += '</div>';
    }

    div.innerHTML = html;
    container.appendChild(div);
  });

  calculateTotal();
}

// ✅ تغيير خصائص الصنف
function toggleOption(index, option, checked) {
  let opts = selectedItems[index].selectedOptions;
  if (checked) {
    if (!opts.includes(option)) opts.push(option);
  } else {
    selectedItems[index].selectedOptions = opts.filter(op => op !== option);
  }
}

// 🖨️ طباعة الطلب
function printOrder() {
  let text = selectedItems.map(item => {
    return item.name + " × " + item.quantity + " = " + (item.price * item.quantity).toLocaleString() + " ل.ل";
  }).join("\n");

  let total = selectedItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  let win = window.open("", "", "width=700,height=600");
  win.document.write("<pre>الطلب:\n" + text + "\n\nالمجموع: " + total.toLocaleString() + " ل.ل</pre>");
  win.print();
}

// 🔗 توليد رابط للزبون
function prepareOrder() {
  const box = document.getElementById("whatsapp-section");
  box.innerHTML = ""; // امسح المحتوى السابق

  // إذا في selectedItems (يعني في زبون حدد طلب)
  if (selectedItems.length > 0) {
    const orderText = selectedItems.map(function(item) {
      const options = item.selectedOptions.join(" - ");
      return item.name + " × " + item.quantity + " = " + (item.price * item.quantity).toLocaleString() + " ل.ل" +
             (options ? "\n➤ الإضافات: " + options : "");
    }).join("\n\n");

    const total = selectedItems.reduce(function(sum, item) {
      return sum + (item.price * item.quantity);
    }, 0);

    const message = encodeURIComponent(orderText + "\n\nالمجموع: " + total.toLocaleString() + " ل.ل");

    box.innerHTML = `
      <hr>
      <input type="text" id="whatsapp-number" placeholder="📱 أدخل رقم واتساب">
      <button onclick="sendToWhatsApp('${message}')">📤 إرسال إلى واتساب</button>
    `;
  } else {
    // إذا ما في طلب مختار: توليد رابط للزبون
    const data = JSON.stringify(items); // نحفظ فقط قائمة الأصناف
    const base = location.href.split("?")[0];
    const link = base + "?order=" + encodeURIComponent(data);

    box.innerHTML = `
      <hr>
      <p>📎 انسخ هذا الرابط وأرسله للزبون:</p>
      <input type="text" value="${link}" readonly style="width:100%; padding:10px; margin-top:10px">
    `;
  }
}