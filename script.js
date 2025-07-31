
let items = [];
let selectedItems = [];

function saveItemsToLocal() {
  localStorage.setItem("menuItems", JSON.stringify(items));
}

function loadItemsFromLocal() {
  let saved = localStorage.getItem("menuItems");
  if (saved) {
    items = JSON.parse(saved);
  }
}

function showAddItem() {
  document.getElementById("add-item").style.display = "block";
  document.getElementById("order-section").style.display = "none";
}

function showOrders() {
  document.getElementById("add-item").style.display = "none";
  document.getElementById("order-section").style.display = "block";
  renderItems(items);
}

function addItem() {
  let name = document.getElementById("item-name").value;
  let price = parseInt(document.getElementById("item-price").value);
  let optionsInput = document.getElementById("item-options").value;
  let options = optionsInput ? optionsInput.split(",").map(function(opt) { return opt.trim(); }) : [];

  if (name && price) {
    items.push({ name: name, price: price, options: options });
localStorage.setItem("items", JSON.stringify(items));    alert("تمت إضافة الصنف!");
    document.getElementById("item-name").value = "";
    document.getElementById("item-price").value = "";
    document.getElementById("item-options").value = "";
  }
}

function searchItems(query) {
  let filtered = items.filter(function(item) {
    return item.name.toLowerCase().includes(query.toLowerCase());
  });
  renderItems(filtered);
}

function renderItems(list) {
  let container = document.getElementById("items-list");
  container.innerHTML = "";

  let isCustomer = new URLSearchParams(window.location.search).has("menu") || 
                   new URLSearchParams(window.location.search).has("order");

  list.forEach(function(item, index) {
    let div = document.createElement("div");
    div.className = "item";

    let checkbox = '<input type="checkbox" onchange="toggleItem(' + index + ', this.checked)"> ';
    let label = item.name + " - " + item.price + " ل.ل";
    
    let deleteBtn = "";
    if (!isCustomer) {
      deleteBtn = '<span class="delete-btn" onclick="deleteItem(' + index + ')">🗑 حذف نهائي</span>';
    }

    div.innerHTML = checkbox + label + " " + deleteBtn;
    container.appendChild(div);
  });
}
function deleteItem(index) {
  let confirmDelete = confirm("هل أنت متأكد أنك تريد حذف هذا الصنف نهائيًا؟");
  if (confirmDelete) {
    items.splice(index, 1);
    localStorage.setItem("items", JSON.stringify(items)); // إذا كنت تستخدم التخزين
    renderItems(items);
  }
}

function toggleItem(index, checked) {
  let item = items[index];
  if (checked) {
    let selection = {
      name: item.name,
      price: item.price,
      quantity: 1,
      options: item.options,
      selectedOptions: []
    };
    selectedItems.push(selection);
  } else {
    selectedItems = selectedItems.filter(function(i) { return i.name !== item.name; });
  }
  renderSelected();
}

function renderSelected() {
  let container = document.getElementById("selected-items");
  container.innerHTML = "";

  selectedItems.forEach(function(item, i) {
    let div = document.createElement("div");
    div.className = "item";
    let html = item.name + " - " + item.price + " × " +
      '<input type="number" min="1" value="' + item.quantity + '" onchange="changeQty(' + i + ', this.value)">';

    if (item.options.length > 0) {
      html += "<div>الخصائص:<br>";
      item.options.forEach(function(opt) {
        let checked = item.selectedOptions.includes(opt) ? "checked" : "";
        html += '<label><input type="checkbox" value="' + opt + '" ' + checked +
                ' onchange="toggleOption(' + i + ', this)"> ' + opt + '</label> ';
      });
      html += "</div>";
    }

    html += '<span class="delete-btn" onclick="removeItem(' + i + ')">✖ حذف</span>';

    div.innerHTML = html;
    container.appendChild(div);
  });

  calculateTotal();
}

function changeQty(index, value) {
  selectedItems[index].quantity = parseInt(value);
  calculateTotal();
}

function toggleOption(index, el) {
  let val = el.value;
  let item = selectedItems[index];
  if (el.checked) {
    item.selectedOptions.push(val);
  } else {
    item.selectedOptions = item.selectedOptions.filter(function(o) { return o !== val; });
  }
}

function calculateTotal() {
  let total = selectedItems.reduce(function(sum, item) {
    return sum + item.price * item.quantity;
  }, 0);
  document.getElementById("total").innerText = "المجموع الكلي: " + total.toLocaleString() + " ل.ل";
}


function prepareOrder() {
  if (selectedItems.length === 0) {
    alert("الرجاء تحديد صنف واحد على الأقل");
    return;
  }

  let data = encodeURIComponent(JSON.stringify(selectedItems));
  let longUrl = window.location.origin + window.location.pathname + "?order=" + data;

  // اختصار باستخدام clck.ru تلقائيًا
  fetch("https://clck.ru/--?url=" + encodeURIComponent(longUrl))
    .then(response => response.text())
    .then(shortUrl => {
      let section = document.getElementById("link-section");
      section.innerHTML = `
        <div style="margin-top: 10px;">
          <input type="text" value="${shortUrl}" readonly style="width: 90%; padding: 8px; border-radius: 6px; border: 1px solid #ccc;">
        </div>
        <div style="margin-top: 10px;">
          <a href="${shortUrl}" target="_blank" style="color: #0066cc; font-weight: bold; text-decoration: none;">🌐 فتح الرابط</a>
        </div>
        <div style="margin-top: 10px;">
          <a href="https://wa.me/?text=${encodeURIComponent(shortUrl)}" target="_blank" style="background-color: #25D366; color: white; padding: 10px 15px; border-radius: 6px; font-weight: bold; text-decoration: none;">📩 إرسال إلى واتساب</a>
        </div>
      `;
    })
    .catch(error => {
      console.error(error);
      alert("❌ فشل اختصار الرابط. حاول لاحقًا.");
    });
}

function removeItem(index) {
  selectedItems.splice(index, 1);
  renderSelected();
}

function printOrder() {
  let win = window.open('', '', 'width=700,height=500');
  let html = selectedItems.map(function(item) {
    return item.name + " × " + item.quantity + " = " + (item.price * item.quantity).toLocaleString() + " ل.ل";
  }).join("\n");

  let total = selectedItems.reduce(function(sum, item) {
    return sum + item.price * item.quantity;
  }, 0);

  html += "\nالمجموع: " + total.toLocaleString() + " ل.ل";

  win.document.write("<pre>" + html + "</pre>");
  win.print();
}

function generateCustomerLink() {
  if (items.length === 0) {
    alert("أضف أصناف أولاً قبل توليد الرابط.");
    return;
  }

  let data = encodeURIComponent(JSON.stringify(items));
let longUrl = window.location.origin + window.location.pathname + "?order=" + data;
getShortLink(longUrl, function(shortUrl) {
  let section = document.getElementById("link-section");
  section.innerHTML = 
    '<input type="text" value="' + shortUrl + '" readonly style="width:90%;">' +
    '<a href="' + shortUrl + '" target="_blank">🌐 فتح الرابط</a>' +
    '<a href="https://wa.me/?text=' + encodeURIComponent("طلبية جديدة:\n" + shortUrl) + '" target="_blank">📲 إرسال عبر واتساب</a>';
});
  let section = document.getElementById("link-section");
  section.innerHTML = '<input type="text" value="' + url + '" id="copy-link" readonly style="width:90%;">' +
                      
                      '<a href="' + url + '" target="_blank">🔗 فتح الرابط</a>';
}

function loadFromURL() {
  let params = new URLSearchParams(window.location.search);
  if (params.has("menu")) {
    try {
      items = JSON.parse(decodeURIComponent(params.get("menu")));
      document.querySelector(".sidebar").style.display = "none";
      document.getElementById("add-item").style.display = "none";
      document.getElementById("order-section").style.display = "block";
      renderItems(items);
    } catch (e) {
      alert("فشل في قراءة القائمة.");
    }
  } else if (params.has("order")) {
    try {
      selectedItems = JSON.parse(decodeURIComponent(params.get("order")));
      document.querySelector(".sidebar").style.display = "none";
      document.getElementById("add-item").style.display = "none";
      document.getElementById("order-section").style.display = "block";
      renderSelected();
    } catch (e) {
      alert("فشل في قراءة الطلب.");
    }
  } else {
    loadItemsFromLocal();  // 🟢 تحميل البيانات عند بداية الصفحة
  }
}


// هل الرابط يحتوي على طلب من الزبون؟
const urlParams = new URLSearchParams(window.location.search);
const isCustomerView = urlParams.has('order');

// ✅ تحميل الطلب من الرابط أو من التخزين المحلي
window.onload = function () {
  if (isCustomerView) {
    loadFromURL(); // الزبون: تحميل الطلب من الرابط
  } else {
    loadItemsFromLocal(); // المطعم: تحميل الأصناف من التخزين المحلي
  }
};

// ✅ تنفيذ عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", function () {
  const addItemSection = document.getElementById("add-item");
  const addItemBtn = document.querySelector("button[onclick='showAddItem()']");
  const customerLinkBtn = document.getElementById("generate-customer-link");

  if (isCustomerView) {
    // ✅ الزبون: إخفاء الأدوات الخاصة بالمطعم
    if (addItemSection) addItemSection.style.display = "none";
    if (addItemBtn) addItemBtn.style.display = "none";
    if (customerLinkBtn) customerLinkBtn.style.display = "none";

    // ✅ عرض واجهة الطلب والحقول
    document.getElementById("order-section").style.display = "block";
    document.getElementById("customer-info").style.display = "block";
  } else {
    // صاحب المطعم: تفعيل زر توليد الرابط
    if (customerLinkBtn) {
      customerLinkBtn.addEventListener("click", prepareOrder);
    }
  }
});
function generateCustomerLink() {
  if (selectedItems.length === 0) {
    alert("الرجاء تحديد صنف واحد على الأقل");
    return;
  }

  let data = encodeURIComponent(JSON.stringify(selectedItems));
  let longUrl = window.location.origin + window.location.pathname + "?order=" + data;

  fetch("https://is.gd/create.php?format=simple&url=" + encodeURIComponent(longUrl))
    .then(response => response.text())
    .then(shortUrl => {
      let section = document.getElementById("link-section");
      section.innerHTML = `
        <div style="margin-top: 10px;">
          <input type="text" value="${shortUrl}" readonly style="width: 90%; padding: 8px; border-radius: 6px; border: 1px solid #ccc; font-size:14px;">
        </div>
        <div style="margin-top: 10px;">
          <a href="${shortUrl}" target="_blank" style="color: #0066cc; font-weight: bold; text-decoration: none;">🌐 فتح الرابط</a>
        </div>
        <div style="margin-top: 10px;">
          <a href="https://wa.me/?text=${encodeURIComponent(shortUrl)}" target="_blank" style="background-color: #25D366; color: white; padding: 10px 15px; border-radius: 6px; font-weight: bold; text-decoration: none; display: inline-block;">📩 إرسال إلى واتساب</a>
        </div>
      `;
    })
    .catch(error => {
      console.error(error);
      alert("❌ فشل توليد الرابط. حاول لاحقًا.");
    });
}
