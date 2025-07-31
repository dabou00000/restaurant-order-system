let items = [];
let selectedItems = [];

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
  let options = optionsInput ? optionsInput.split(",").map(opt => opt.trim()) : [];

  if (name && price) {
    items.push({ name, price, options });
    saveItemsToLocal();
    alert("تمت إضافة الصنف!");
    document.getElementById("item-name").value = "";
    document.getElementById("item-price").value = "";
    document.getElementById("item-options").value = "";
  }
}

function saveItemsToLocal() {
  localStorage.setItem("items", JSON.stringify(items));
}

function loadItemsFromLocal() {
  let stored = localStorage.getItem("items");
  if (stored) {
    items = JSON.parse(stored);
  }
}

function searchItems(query) {
  let filtered = items.filter(item => item.name.toLowerCase().includes(query.toLowerCase()));
  renderItems(filtered);
}

function renderItems(list) {
  let container = document.getElementById("items-list");
  container.innerHTML = "";

  list.forEach((item, index) => {
    let div = document.createElement("div");
    div.className = "item";
    let checkbox = '<input type="checkbox" onchange="toggleItem(' + index + ', this.checked)"> ';
    let label = item.name + " - " + item.price + " ل.ل";
    div.innerHTML = checkbox + label;
    container.appendChild(div);
  });
}

function toggleItem(index, checked) {
  let item = items[index];
  if (checked) {
    selectedItems.push({
      name: item.name,
      price: item.price,
      quantity: 1,
      options: item.options,
      selectedOptions: []
    });
  } else {
    selectedItems = selectedItems.filter(i => i.name !== item.name);
  }
  renderSelected();
}

function renderSelected() {
  let container = document.getElementById("selected-items");
  container.innerHTML = "";

  selectedItems.forEach((item, i) => {
    let div = document.createElement("div");
    div.className = "item";
    let html = item.name + " - " + item.price + " × " +
      '<input type="number" min="1" value="' + item.quantity + '" onchange="changeQty(' + i + ', this.value)">';

    if (item.options.length > 0) {
      html += "<div>الخصائص:<br>";
      item.options.forEach(opt => {
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
    item.selectedOptions = item.selectedOptions.filter(o => o !== val);
  }
}

function calculateTotal() {
  let total = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  document.getElementById("total").innerText = "المجموع الكلي: " + total.toLocaleString() + " ل.ل";
}

function removeItem(index) {
  selectedItems.splice(index, 1);
  renderSelected();
}

function prepareOrder() {
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
        <input type="text" value="${shortUrl}" readonly style="width:90%;">
        <br>
        <a href="${shortUrl}" target="_blank">🌐 فتح الرابط</a>
        <br>
        <a href="https://wa.me/?text=${encodeURIComponent(shortUrl)}" target="_blank">📩 إرسال إلى واتساب</a>
      `;
    })
    .catch(() => {
      alert("فشل اختصار الرابط.");
    });
}

function generateCustomerLink() {
  if (items.length === 0) {
    alert("أضف أصناف أولاً");
    return;
  }

  let data = encodeURIComponent(JSON.stringify(items));
  let url = window.location.origin + window.location.pathname + "?menu=" + data;

  let section = document.getElementById("link-section");
  section.innerHTML = `
    <input type="text" value="${url}" readonly style="width:90%;">
    <br>
    <a href="${url}" target="_blank">🔗 فتح الرابط</a>
  `;
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
    } catch {
      alert("فشل في قراءة القائمة.");
    }
  } else if (params.has("order")) {
    try {
      selectedItems = JSON.parse(decodeURIComponent(params.get("order")));
      document.querySelector(".sidebar").style.display = "none";
      document.getElementById("add-item").style.display = "none";
      document.getElementById("order-section").style.display = "block";
      renderSelected();
    } catch {
      alert("فشل في قراءة الطلب.");
    }
  } else {
    loadItemsFromLocal();
  }
}

window.onload = loadFromURL;