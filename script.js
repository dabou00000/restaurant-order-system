let items = [];
let saved = localStorage.getItem("menuItems");
if (saved) {
  items = JSON.parse(saved);
}
let selectedItems = [];

// تحميل البيانات المحفوظة عند بداية التطبيق
loadItemsFromLocal();
console.log("تم تحميل البيانات عند بداية التطبيق:", items); // للتأكد من التحميل

function saveItemsToLocal() {
  localStorage.setItem("menuItems", JSON.stringify(items));
  console.log("تم حفظ البيانات:", items); // للتأكد من الحفظ
  // تحميل البيانات مرة أخرى للتأكد من الحفظ
  loadItemsFromLocal();
  console.log("تم التأكد من الحفظ والتحميل:", items); // للتأكد من الحفظ والتحميل
}

function loadItemsFromLocal() {
  let saved = localStorage.getItem("menuItems");
  if (saved) {
    items = JSON.parse(saved);
    console.log("تم تحميل البيانات:", items); // للتأكد من التحميل
  } else {
    console.log("لا توجد بيانات محفوظة");
  }
  console.log("تم الانتهاء من تحميل البيانات:", items); // للتأكد من الانتهاء
}

function showAddItem() {
  // لا نحتاج لتحميل البيانات المحفوظة هنا لأن البيانات تأتي من الرابط
  document.getElementById("add-item").style.display = "block";
  document.getElementById("order-section").style.display = "none";
  console.log("تم عرض صفحة الإضافة والبيانات:", items); // للتأكد من العرض
  console.log("تم الانتهاء من عرض صفحة الإضافة"); // للتأكد من الانتهاء
}

function showOrders() {
  document.getElementById("add-item").style.display = "none";
  document.getElementById("order-section").style.display = "block";
  // لا نحتاج لتحميل البيانات المحفوظة هنا لأن البيانات تأتي من الرابط
  renderItems(items);
  console.log("تم عرض الطلبات والبيانات:", items); // للتأكد من العرض
  console.log("تم الانتهاء من عرض الطلبات"); // للتأكد من الانتهاء
}

function addItem() {
  let name = document.getElementById("item-name").value;
  let price = parseInt(document.getElementById("item-price").value);
  let optionsInput = document.getElementById("item-options").value;
  let options = optionsInput ? optionsInput.split(",").map(function(opt) { return opt.trim(); }) : [];

  if (name && price) {
    items.push({ name: name, price: price, options: options });
    localStorage.setItem("menuItems", JSON.stringify(items));
    saveItemsToLocal(); // حفظ البيانات فوراً
    alert("تمت إضافة الصنف!");
    document.getElementById("item-name").value = "";
    document.getElementById("item-price").value = "";
    document.getElementById("item-options").value = "";
    // تحميل وعرض البيانات المحفوظة
    loadItemsFromLocal();
    renderItems(items);
    console.log("تم إضافة الصنف والبيانات الجديدة:", items); // للتأكد من الإضافة
    console.log("تم الانتهاء من إضافة الصنف"); // للتأكد من الانتهاء
  }
}

function searchItems(query) {
  // لا نحتاج لتحميل البيانات المحفوظة هنا لأن البيانات تأتي من الرابط
  let filtered = items.filter(function(item) {
    return item.name.toLowerCase().includes(query.toLowerCase());
  });
  renderItems(filtered);
  console.log("تم البحث والنتائج:", filtered); // للتأكد من البحث
  console.log("تم الانتهاء من البحث"); // للتأكد من الانتهاء
}

function renderItems(list) {
  // لا نحتاج لتحميل البيانات المحفوظة هنا لأن البيانات تأتي من الرابط
  let container = document.getElementById("items-list");
  container.innerHTML = "";

  let isCustomer = new URLSearchParams(window.location.search).has("order");

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
  console.log("تم عرض العناصر:", list); // للتأكد من العرض
  console.log("تم الانتهاء من عرض العناصر"); // للتأكد من الانتهاء
}

function deleteItem(index) {
  let confirmDelete = confirm("هل أنت متأكد أنك تريد حذف هذا الصنف نهائيًا؟");
  if (confirmDelete) {
    items.splice(index, 1);
    saveItemsToLocal(); // حفظ البيانات فوراً
    loadItemsFromLocal(); // تحميل البيانات المحفوظة
    renderItems(items);
    console.log("تم حذف الصنف والبيانات الجديدة:", items); // للتأكد من الحذف
    console.log("تم الانتهاء من حذف الصنف"); // للتأكد من الانتهاء
  }
}

function toggleItem(index, checked) {
  // لا نحتاج لتحميل البيانات المحفوظة هنا لأن البيانات تأتي من الرابط
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
  console.log("تم تحديد/إلغاء تحديد العنصر:", item.name, "الحالة:", checked); // للتأكد من التحديد
  console.log("تم الانتهاء من تحديد/إلغاء تحديد العنصر"); // للتأكد من الانتهاء
}

function renderSelected() {
  // لا نحتاج لتحميل البيانات المحفوظة هنا لأن البيانات تأتي من الرابط
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
  console.log("تم عرض العناصر المحددة:", selectedItems); // للتأكد من العرض
  console.log("تم الانتهاء من عرض العناصر المحددة"); // للتأكد من الانتهاء
}

function changeQty(index, value) {
  // لا نحتاج لتحميل البيانات المحفوظة هنا لأن البيانات تأتي من الرابط
  selectedItems[index].quantity = parseInt(value);
  calculateTotal();
  console.log("تم تغيير الكمية:", selectedItems[index].name, "الكمية الجديدة:", value); // للتأكد من التغيير
  console.log("تم الانتهاء من تغيير الكمية"); // للتأكد من الانتهاء
}

function toggleOption(index, el) {
  // لا نحتاج لتحميل البيانات المحفوظة هنا لأن البيانات تأتي من الرابط
  let val = el.value;
  let item = selectedItems[index];
  if (el.checked) {
    item.selectedOptions.push(val);
  } else {
    item.selectedOptions = item.selectedOptions.filter(function(o) { return o !== val; });
  }
  console.log("تم تغيير الخيارات:", item.name, "الخيارات الجديدة:", item.selectedOptions); // للتأكد من التغيير
  console.log("تم الانتهاء من تغيير الخيارات"); // للتأكد من الانتهاء
}

function calculateTotal() {
  // لا نحتاج لتحميل البيانات المحفوظة هنا لأن البيانات تأتي من الرابط
  let total = selectedItems.reduce(function(sum, item) {
    return sum + item.price * item.quantity;
  }, 0);
  document.getElementById("total").innerText = "المجموع الكلي: " + total.toLocaleString() + " ل.ل";
  console.log("تم حساب المجموع:", total); // للتأكد من الحساب
  console.log("تم الانتهاء من حساب المجموع"); // للتأكد من الانتهاء
}

function prepareOrder() {
  loadItemsFromLocal(); // تحميل البيانات المحفوظة قبل توليد الطلب
  if (items.length === 0) {
    alert("أضف أصناف أولاً قبل توليد الرابط.");
    return;
  }

  let data = encodeURIComponent(JSON.stringify(items));
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
  console.log("تم توليد الطلب:", items); // للتأكد من التوليد
  console.log("تم الانتهاء من توليد الطلب"); // للتأكد من الانتهاء
}

function removeItem(index) {
  // لا نحتاج لتحميل البيانات المحفوظة هنا لأن البيانات تأتي من الرابط
  selectedItems.splice(index, 1);
  renderSelected();
  console.log("تم حذف العنصر المحدد والبيانات الجديدة:", selectedItems); // للتأكد من الحذف
  console.log("تم الانتهاء من حذف العنصر المحدد"); // للتأكد من الانتهاء
}

function printOrder() {
  // لا نحتاج لتحميل البيانات المحفوظة هنا لأن البيانات تأتي من الرابط
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
  console.log("تم طباعة الطلب:", selectedItems); // للتأكد من الطباعة
  console.log("تم الانتهاء من طباعة الطلب"); // للتأكد من الانتهاء
}

function generateCustomerLink() {
  loadItemsFromLocal(); // تحميل البيانات المحفوظة قبل توليد الرابط

  if (items.length === 0) {
    alert("أضف أصناف أولاً قبل توليد الرابط.");
    return;
  }

  let data = encodeURIComponent(JSON.stringify(items));
  let longUrl = window.location.origin + window.location.pathname + "?menu=" + data;

  // استخدام fetch لاختصار الرابط
  fetch("https://is.gd/create.php?format=simple&url=" + encodeURIComponent(longUrl))
    .then(response => response.text())
    .then(shortUrl => {
      let section = document.getElementById("link-section");
      section.innerHTML = 
        '<input type="text" value="' + shortUrl + '" readonly style="width:90%;">' +
        '<a href="' + shortUrl + '" target="_blank">🌐 فتح الرابط</a>' +
        '<a href="https://wa.me/?text=' + encodeURIComponent("طلبية جديدة:\n" + shortUrl) + '" target="_blank">📲 إرسال عبر واتساب</a>';
    })
    .catch(error => {
      console.error(error);
      alert("❌ فشل توليد الرابط. حاول لاحقًا.");
    });

  console.log("تم توليد رابط الزبون (menu):", items); // للتأكد من التوليد
  console.log("تم الانتهاء من توليد رابط الزبون");
}

function loadFromURL() {
  let params = new URLSearchParams(window.location.search);
  if (params.has("order")) {
    try {
      let orderData = params.get("order");
      console.log("البيانات الخام من الرابط:", orderData);
      items = JSON.parse(decodeURIComponent(orderData));
      document.querySelector(".sidebar").style.display = "none";
      document.getElementById("add-item").style.display = "none";
      document.getElementById("order-section").style.display = "block";
      renderItems(items);
      console.log("تم تحميل قائمة الأصناف من الرابط order:", items);
    } catch (e) {
      console.error("خطأ في قراءة البيانات:", e);
      alert("فشل في قراءة الطلب.");
    }
  } else {
    loadItemsFromLocal();  // 🟢 تحميل البيانات عند بداية الصفحة
  }
  console.log("تم تحميل من URL والبيانات:", items); // للتأكد من التحميل
  console.log("تم الانتهاء من تحميل URL"); // للتأكد من الانتهاء
}

// هل الرابط يحتوي على طلب من الزبون؟
const urlParams = new URLSearchParams(window.location.search);
const isCustomerView = urlParams.has('order');

// ✅ تحميل الطلب من الرابط أو من التخزين المحلي
window.onload = function () {
  const urlParams = new URLSearchParams(window.location.search);

  if (urlParams.has("menu")) {
    try {
      items = JSON.parse(decodeURIComponent(urlParams.get("menu")));
      renderItems(items);  // عرضها للزبون
      document.querySelector(".sidebar").style.display = "none"; // إخفاء القائمة الجانبية
      document.getElementById("add-item").style.display = "none";
      document.getElementById("order-section").style.display = "block";
    } catch (e) {
      alert("فشل في قراءة القائمة من الرابط.");
    }
  } else {
    loadItemsFromLocal();  // المطعم
    renderItems(items);
  }

  console.log("تم تحميل الصفحة والبيانات:", items); // للتأكد من التحميل
  console.log("تم الانتهاء من تحميل الصفحة"); // للتأكد من الانتهاء
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
      customerLinkBtn.addEventListener("click", generateCustomerLink);
    }
    renderItems(items); // عرض البيانات المحملة
  }
  console.log("تم تحميل DOM والبيانات:", items); // للتأكد من التحميل
  console.log("تم الانتهاء من تحميل DOM"); // للتأكد من الانتهاء
});



function sendToWhatsApp() {
  // لا نحتاج لتحميل البيانات المحفوظة هنا لأن البيانات تأتي من الرابط
  let number = document.getElementById("whatsNumber").value;
  if (!number) {
    alert("الرجاء إدخال رقم الواتساب");
    return;
  }
  
  let message = "مرحباً! أريد طلبية جديدة.";
  let whatsappUrl = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
  console.log("تم إرسال الواتساب إلى:", number); // للتأكد من الإرسال
  console.log("تم الانتهاء من إرسال الواتساب"); // للتأكد من الانتهاء
}
