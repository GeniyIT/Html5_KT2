let db;
let request = window.indexedDB.open("myDB", 1);

request.onerror = function(event) {
  console.log("Не получилось открыть БД");
};

request.onsuccess = function(event) {
  db = request.result;
  updateTable();
};

request.onupgradeneeded = function(event) {
  let db = event.target.result;
  let objectStore = db.createObjectStore("tableName", { keyPath: "id", autoIncrement: true });
  objectStore.createIndex("column1", "column1", { unique: false });
  objectStore.createIndex("column2", "column2", { unique: false });
};

// Function to update the table
function updateTable() {
  let transaction = db.transaction(["tableName"], "readonly");
  let objectStore = transaction.objectStore("tableName");
  let table = document.getElementById("myTable");
  table.innerHTML = '';

  objectStore.openCursor().onsuccess = function(event) {
    let cursor = event.target.result;
    if (cursor) {
      let row = table.insertRow();
      row.insertCell(0).textContent = cursor.value.id;
      row.insertCell(1).textContent = cursor.value.column1;
      row.insertCell(2).textContent = cursor.value.column2;

      let editButtonCell = row.insertCell();
      addEditButton(editButtonCell, cursor.value.id);

      let deleteButtonCell = row.insertCell();
      addDeleteButton(deleteButtonCell, cursor.value.id);

      cursor.continue();
    }
  };
}

// Function to save a new item to the database
function saveItem() {
  let valueColumn1 = document.getElementById("input1").value;
  let valueColumn2 = document.getElementById("input2").value;

  let transaction = db.transaction(["tableName"], "readwrite");
  let objectStore = transaction.objectStore("tableName");
  let newItem = { column1: valueColumn1, column2: valueColumn2 };

  let request = objectStore.add(newItem);
  request.onsuccess = function(event) {
    alert("Запись добавлена");
    updateTable();
  };

  request.onerror = function(event) {
    alert("Не получилось добавить запись");
  };
}

// Function to update an existing item
function updateItem(key) {
  let valueColumn1 = prompt("Введите новое значение для колонки 1:");
  let valueColumn2 = prompt("Введите новое значение для колонки 2:");

  let transaction = db.transaction(["tableName"], "readwrite");
  let objectStore = transaction.objectStore("tableName");

  let request = objectStore.get(key);
  request.onsuccess = function(event) {
    let data = event.target.result;
    if (data) {
      data.column1 = valueColumn1 || data.column1;
      data.column2 = valueColumn2 || data.column2;

      let updateRequest = objectStore.put(data);
      updateRequest.onsuccess = function(event) {
        alert("Запись успешно обновлена");
        updateTable();
      };
    }
  };
}

// Function to delete an existing item
function deleteItem(key) {
  let transaction = db.transaction(["tableName"], "readwrite");
  let objectStore = transaction.objectStore("tableName");

  let request = objectStore.delete(key);
  request.onsuccess = function(event) {
    alert("Запись успешно удалена");
    updateTable();
  };

  request.onerror = function(event) {
    alert("Не получилось удалить запись");
  };
}

// Function to add an "Изменить" button
function addEditButton(row, key) {
  let button = document.createElement("button");
  button.innerText = "Изменить";
  button.onclick = function() {
    updateItem(key);
  };
  row.appendChild(button);
}

// Function to add a "Удалить" button
function addDeleteButton(row, key) {
  let button = document.createElement("button");
  button.innerText = "Удалить";
  button.onclick = function() {
    deleteItem(key);
  };
  button.classList.add("deleteButton");
  row.appendChild(button);
}
