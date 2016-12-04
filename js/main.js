(function () {

    var config = {
        apiKey: "AIzaSyC_m6VaHDvrIRr3IlDPoMTKPZYE64NEGkw",
        authDomain: "kimsliste-ccf6a.firebaseapp.com",
        databaseURL: "https://kimsliste-ccf6a.firebaseio.com",
        storageBucket: "kimsliste-ccf6a.appspot.com",
        messagingSenderId: "404181812683"
    };
    firebase.initializeApp(config);


    // get elements
    var tbody = document.getElementById('cncProductsList');
    var partNumber = document.getElementById('partNumber');
    var partName = document.getElementById('partName');
    var materialType = document.getElementById('materialType');
    var partSize = document.getElementById('partSize');
    var partLength = document.getElementById('partLength');
    var addBtn = document.getElementById('addBtn');
    var resetBtn = document.getElementById('resetBtn');

    addBtn.addEventListener('click', addToDatabase);
    resetBtn.addEventListener('click', resetForm);

    tbody.addEventListener('click', function (e) {

        // deleting product from database 
        if (e.target.className === 'deleteBtn') {
            var key = e.target.parentNode.id;
            console.log('delete key', key);
            deleteProductFromDatabase(key);
        }
        // editing data of produkt
        // po kliknieciu w pole td odpalic edycje tego pola i po nacisnieciu entera poslac wpis do bazy
        if (e.target.className !== 'deleteBtn') {
            var trKey = e.target.parentNode.id;
            var tdClass = e.target.className;
            var tdTextContent = e.target.textContent;
            updateProduct(trKey, tdClass, tdTextContent);
        }
    });

    function updateProduct(productKey, entryKey, entryValue) {
        // console.log("update ", productKey, entryKey, entryValue);
        var newEntryValue = prompt(entryKey, entryValue);
        if (newEntryValue === null) { // if user click CANCEL
            newEntryValue = entryValue;
        }

        return firebase.database().ref().child('cncProducts').child(productKey).child(entryKey)
            .set(newEntryValue)
            .then(function () {
                console.log('updated to the database');
            });
    }


    // create database references
    var dbRefList = firebase.database().ref().child('cncProducts');

    var CNCPRODUCT_TEMPLATE =
        '<tr class="cncProduct-container">' +
        '<td class="partNumber"></td>' +
        '<td class="partName"></td>' +
        '<td class="materialType"></td>' +
        '<td class="partSize"></td>' +
        '<td class="partLength"></td>' +
        '<button class="deleteBtn">DELETE</button></td>' +
        '</tr>';

    // updates html list after product is added to database
    dbRefList.on('child_added', function (snap) {
        var tr = document.createElement('tr');
        tr.innerHTML = CNCPRODUCT_TEMPLATE;
        tr.id = snap.key;
        snap.forEach(function (childSnapshot) {
            tr.querySelector('.' + childSnapshot.key).textContent = childSnapshot.val();
        });
        tbody.appendChild(tr);
    });

    // updates html list after editing
    dbRefList.on('child_changed', function (snap) {
        var trChanged = document.getElementById(snap.key);
        snap.forEach(function (childSnapshot) {
            trChanged.querySelector('.' + childSnapshot.key).textContent = childSnapshot.val();
            console.log('child-changed', childSnapshot.key);
        });
    });

    // removes product from html list after deleting from database
    dbRefList.on('child_removed', function (snap) {
        var trToRemove = document.getElementById(snap.key);
        trToRemove.remove();
    });


    // adding a new product to database
    function addToDatabase() {
        // Check all fields in form
        // TODO obgadac
        // console.log(partNumber.value !== "", partName.value !== "", materialType.value !== "", partSize.value !== "", partLength.value !== "");
        // console.log('test ', testForm);

        // TODO validating a form with regExp. !!!

        if (partNumber.value === " " || partName.value === " " || materialType.value === " " || partSize.value === " " || partLength.value === " ") {
            console.log('...ups - entry correct values');
            return;
        }

        if (partNumber.value !== "" && partName.value !== "" && materialType.value !== "" && partSize.value !== "" && partLength.value !== "") {
            // Add a new product entry to the Firebase Database. Using push give us a uniq key for each product.
            dbRefList.push({
                partNumber: partNumber.value,
                partName: partName.value,
                materialType: materialType.value,
                partSize: partSize.value,
                partLength: partLength.value
            }).then(function () {
                // Clear form text fields
                resetForm();
                partNumber.focus();
                console.log('saved to the database');
            });
        } else {
            console.log('fill up all fields to save new product');
        }
    }

    // deleting product from database
    function deleteProductFromDatabase(key) {
        if (window.confirm("Vil Du fjerne dette produkt?")) {
            var trRef = dbRefList.child(key);
            trRef.remove();
        }
    }



    // resets form fields values
    function resetForm() {
        partNumber.value = '';
        partName.value = '';
        materialType.value = '';
        partSize.value = '';
        partLength.value = '';

        // partNumber.focus();
    }


    // CZEMU TO NIE DZIALA !!!
    // function testForm() {
    //     if (partNumber.value === "" || partName.value === "" || materialType.value === "" || partSize.value === "" || partLength.value === "") {
    //         return false;
    //     }
    //     return true;
    // };

}());