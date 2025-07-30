let items = [];
let selectedItems = [];

function showAddItem() {
  document.getElementById('add-item-section').classList.remove('hidden');
  document.getElementById('order-list-section').classList.add('hidden');
}

function showOrderList() {
  document.getElementById('order-list-section').classList.remove('hidden');
  document.getElementById('add-item-section').classList.add('hidden');
  renderItems();
}

function addItem() {
  var name = document.getElementById('item-name').value.trim();
  var price = parseInt(document.getElementById('item-price').value.trim());
  var options = document.getElementById('item-options').value.split(',').map(function(opt) {
    return opt.trim();
  });

  if (name && price) {
    items.push({ name: name, price: price, options: options });
    alert("تمت الإضافة");
    document.getElementById('item-name').value = '';
    document.getElementById('item-price').value = '';
    document.getElementById('item-options').value = '';
  }
}

function renderItems(list) {
  if (!list) list = items;
  var container = document.getElementById('items-list');
  container.innerHTML = '';

  if (list.length === 0) {
    container.innerHTML = '<p>لا توجد نتائج</p>';
    return;
  }

  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = "item" + i;
    var box = document.createElement('div');
    box.className = 'item-box';
    box.innerHTML =
      '<input type="checkbox" id="' + id + '" onchange="toggleItem(' + i + ', this.checked)">' +
      '<label for="' + id + '">' + item.name + ' - ' + item.price.toLocaleString() + ' ل.ل</label>';
    container.appendChild(box);
  }
}

function toggleItem(index, checked) {
  var item = items[index];
  if (checked) {
    selectedItems.push({ name: item.name, price: item.price, options: item.options, quantity: 1, selectedOptions: [] });
  } else {
    selectedItems = selectedItems.filter(function(i) { return i.name !== item.name; });
  }
  renderSelected();
}

function renderSelected() {
  var container = document.getElementById('selected-items');
  container.innerHTML = '';

  for (var i = 0; i < selectedItems.length; i++) {
    var item = selectedItems[i];
    var optionsHtml = '';
    for (var j = 0; j < item.options.length; j++) {
      var opt = item.options[j];
      optionsHtml += '<label><input type="checkbox" onchange="toggleOption(' + i + ', \'' + opt + '\', this.checked)"> ' + opt + '</label><br>';
    }

    var div = document.createElement('div');
    div.className = 'selected-item';
    div.innerHTML =
      '<strong>' + item.name + '</strong> - ' + item.price.toLocaleString() + ' ل.ل<br>' +
      '<label>الكمية: <input type="number" min="1" value="' + item.quantity + '" onchange="changeQty(' + i + ', this.value)"></label><br>' +
      '<div>الخصائص:<br>' + optionsHtml + '</div>' +
      '<button class="delete-btn" onclick="removeItem(' + i + ')">حذف</button>';
    container.appendChild(div);
  }

  var total = selectedItems.reduce(function(sum, item) {
    return sum + item.price * item.quantity;
  }, 0);
  document.getElementById('total-price').innerText = 'المجموع الكلي: ' + total.toLocaleString() + ' ل.ل';
}

function toggleOption(index, option, checked) {
  var opts = selectedItems[index].selectedOptions;
  if (checked) {
    opts.push(option);
  } else {
    selectedItems[index].selectedOptions = opts.filter(function(o) { return o !== option; });
  }
}

function changeQty(index, val) {
  selectedItems[index].quantity = parseInt(val);
  renderSelected();
}

function removeItem(index) {
  selectedItems.splice(index, 1);
  renderSelected();
}

function prepareOrder() {
  if (selectedItems.length === 0) {
    alert("يرجى اختيار صنف واحد على الأقل");
    return;
  }

  var data = encodeURIComponent(JSON.stringify(selectedItems));
  var url = window.location.origin + window.location.pathname + '?order=' + data;
  document.getElementById('order-link').value = url;
  document.getElementById('link-section').classList.remove('hidden');
}

function copyLink() {
  var input = document.getElementById('order-link');
  input.select();
  document.execCommand('copy');
  alert("تم نسخ الرابط ✅");
}

function openLink() {
  var url = document.getElementById('order-link').value;
  window.open(url, "_blank");
}

function loadFromUrl() {
  var params = new URLSearchParams(window.location.search);
  if (params.has('order')) {
    try {
      selectedItems = JSON.parse(decodeURIComponent(params.get('order')));
      showOrderList();
      renderSelected();
    } catch (e) {
      console.error("خطأ في قراءة الرابط");
    }
  }
}

window.onload = loadFromUrl;