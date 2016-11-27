'use strict';

function KimsListe() {

  // Get element from DOM
  this.partNumber = document.getElementById('partNumber');
  this.partName = document.getElementById('partName');
  this.materialType = document.getElementById('materialType');
  this.partSize = document.getElementById('partSize');
  this.partLength = document.getElementById('partLength');
  this.addBtn = document.getElementById('addBtn');
  this.cncProductsList = document.getElementById('cncProductsList');

  this.initFirebase();
  this.loadCncProducts();

  // save cncProduct when the button 'tilføj' is clicked
  this.addBtn.addEventListener('click', this.saveCncProduct.bind(this));
}

// Sets up shortcuts to Firebase features.
KimsListe.prototype.initFirebase = function () {
  // Shortcuts to Firebase SDK features.
  this.db = firebase.database();
  // Create references to database 
  this.dbRefCncProducts = this.db.ref('cncProducts');
};


// Loads cncProducts and listens for upcoming ones.
KimsListe.prototype.loadCncProducts = function () {
  // Make sure we remove all previous listeners.
  this.dbRefCncProducts.off();
  // Loads all cncProducts and listen for new ones.
  var setAllCncProducts = function (data) {
    var key = data.key;
    var val = data.val();
    this.displayCncProduct(key, val.partNumber, val.partName, val.materialType, val.partSize, val.partLength);
  }.bind(this);
  this.dbRefCncProducts.on('child_added', setAllCncProducts);
  this.dbRefCncProducts.on('child_changed', setAllCncProducts);
};

// Template for cncProduct.
KimsListe.CNCPRODUCT_TEMPLATE =
  '<tr class="cncProduct-container">' +
  '<td class="partNumber"></td>' +
  '<td class="partName"></td>' +
  '<td class="materialType"></td>' +
  '<td class="partSize"></td>' +
  '<td class="partLength"></td>' +
  '</tr>';

// displaying cncProducts from database on the screan
KimsListe.prototype.displayCncProduct = function (key, partNumber, partName, materialType, partSize, partLength) {
  var tr = document.getElementById(key);
  // If an element for that cncProduct does not exists create one.
  if (!tr) {
     tr = document.createElement('tr');
    tr.innerHTML = KimsListe.CNCPRODUCT_TEMPLATE;
    tr.setAttribute('id', key);
    this.cncProductsList.appendChild(tr);
  }

  tr.querySelector('.partNumber').textContent = partNumber;
  tr.querySelector('.partName').textContent = partName;
  tr.querySelector('.materialType').textContent = materialType;
  tr.querySelector('.partSize').textContent = partSize;
  tr.querySelector('.partLength').textContent = partLength;

  // Show the cncProduct fading-in.
  setTimeout(function () {
    tr.classList.add('visible')
  }, 1);
  this.cncProductsList.scrollTop = this.cncProductsList.scrollHeight;
  this.partNumber.focus();
};


// writing a new product to database
KimsListe.prototype.saveCncProduct = function (e) {
  e.preventDefault();
  // Check that the user entered a product.
  if (this.partNumber.value !== "" & this.partName.value !== "" & this.materialType.value !== "" & this.partSize.value !== "" & this.partLength.value !== "") {

    // Add a new product entry to the Firebase Database.Using push give us a uniq key for each product.
    this.dbRefCncProducts.push({
      partNumber: this.partNumber.value,
      partName: this.partName.value,
      materialType: this.materialType.value,
      partSize: this.partSize.value,
      partLength: this.partLength.value
    }).then(function () {
      // Clear form text fields
      this.resetForm();
      console.log('saved to the database');
    }.bind(this)).catch(function (error) {
      console.error('Error writing new cncProduct to Firebase Database', error);
    });
  } else {
    console.log('fill up all fields to save new product');
  }
}

// resets form fields values
KimsListe.prototype.resetForm = function () {
  this.partNumber.value = '';
  this.partName.value = '';
  this.materialType.value = '';
  this.partSize.value = '';
  this.partLength.value = '';
}



// // Sync database changes
// db.ref().on('value', function (snapshot) {
//   // baza.innerText = JSON.stringify(snapshot.val(), null, 3); 
//   addRows(snapshot);
// });

// var tbody = document.getElementById("tbody");

// dbRefCncProducts.once('value').then(function (snapshot) {
//   addRows(snapshot);
// });


// // Sync List  on add
// dbRefCncProducts.on('child_added', function (snapshot) {
//   addRows(snapshot);

//   // var li = document.createElement('li');
//   // li.innerText = snap.val();
//   // li.id = snap.key;
//   // ulList.appendChild(li);
// });



// // Sync List  on change
// dbRefProduct.on('child_changed', function (snap) {
//   var liChanged = document.getElementById(snap.key);
//   liChanged.innerText = snap.val();
// });

// // Sync List  on remove
// dbRefProduct.on('child_removed', function (snap) {
//   var liToRemove = document.getElementById(snap.key);
//   liToRemove.remove();
// });




// var button = document.createElement('button');
//   var textNode = document.createTextNode('Click Me!');
//   button.appendChild(textNode);
//   button.className = 'mdl-button mdl-js-button mdl-js-ripple-effect';
//   componentHandler.upgradeElement(button);
//   document.getElementById('container').appendChild(button);


window.onload = function () {
  window.kimsListe = new KimsListe();
};