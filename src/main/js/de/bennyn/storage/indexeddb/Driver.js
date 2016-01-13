window.de = window.de || {};
window.de.bennyn = window.de.bennyn || {};
window.de.bennyn.storage = window.de.bennyn.storage || {};
window.de.bennyn.storage.indexeddb = window.de.bennyn.storage.indexeddb || {};

window.de.bennyn.storage.indexeddb.Driver = function (database) {
  this.iDBDatabase = database;
  // IDBFactory
  this.api = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
};

window.de.bennyn.storage.indexeddb.Driver.prototype.get = function (collection, key, successCallback, errorCallback) {
  var transaction = this.iDBDatabase.transaction(collection, 'readonly');
  var objectStore = transaction.objectStore(collection);
  var request = objectStore.get(key);

  request.onsuccess = function (event) {
    successCallback(event.target.result);
  };

  request.onerror = function (event) {
    errorCallback(event.target.result);
  };
};

window.de.bennyn.storage.indexeddb.Driver.prototype.getAll = function (collection, successCallback, errorCallback) {
  var transaction = this.iDBDatabase.transaction(collection, 'readonly');
  var objectStore = transaction.objectStore(collection);
  var result = [];

  var cursor = objectStore.openCursor();

  cursor.onsuccess = function (event) {
    var cursor = event.target.result;
    if (cursor) {
      result.push(cursor.value);
      cursor.continue();
    } else {
      successCallback(result);
    }
  };

  cursor.onerror = function (event) {
    errorCallback(event.target.result);
  };
};

window.de.bennyn.storage.indexeddb.Driver.prototype.put = function (collection, object, successCallback, errorCallback) {
  var transaction = this.iDBDatabase.transaction(collection, 'readwrite');
  var objectStore = transaction.objectStore(collection);

  var request = objectStore.put(object);

  request.onsuccess = function (event) {
    successCallback(event.target.result);
  };

  request.onerror = function (event) {
    errorCallback(event.target.result);
  };
};

window.de.bennyn.storage.indexeddb.Driver.prototype.deleteCollection = function (collection, key, successCallback, errorCallback) {
  var transaction = this.iDBDatabase.transaction(collection, 'readwrite');
  var objectStore = transaction.objectStore(collection);

  var request = objectStore.delete(key);

  request.onsuccess = function (event) {
    successCallback(event.target.result);
  };

  request.onerror = function (event) {
    errorCallback(event.target.result);
  };
};

window.de.bennyn.storage.indexeddb.Driver.prototype.delete = function (name) {
  this.iDBDatabase.close();

  var request = this.api.deleteDatabase(name);

  request.onsuccess = function (event) {
    successCallback(event.target.result);
  };

  request.onerror = function (event) {
    errorCallback(event.target.result);
  };
};

/**
 * 
 * @param {object} schema Database comfiguration including object store configuration
 * @param {number} schema.version Version of database schema
 * @param {object} schema.objectStores Object store configuration
 * @param {string} schema.name Database name
 * @param {function} createSuccess Success callback function
 * @param {function} createFailed Error callback function
 * @returns {undefined}
 */
window.de.bennyn.storage.indexeddb.Driver.create = function (schema, createSuccess, createFailed) {
  try {

    // IDBOpenDBRequest
    var request = this.api.open(schema.name, schema.version);
  } catch (error) {
    createFailed(error);
  }

  request.onsuccess = function (event) {
    createSuccess(new window.de.bennyn.storage.indexeddb.Driver(request.result));
  };

  request.onerror = request.onblocked = function (event) {
    createFailed(event.target);
  };

  request.onupgradeneeded = function (event) {
    var database = event.target.result;
    for (var name in schema.objectStores) {
      if (!database.objectStoreNames.contains(name)) {
        var optionalParameters = schema.objectStores[name];
        request.result.createObjectStore(name, optionalParameters);
      }
    }
  };
};