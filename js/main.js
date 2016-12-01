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

    addBtn.addEventListener('click', addToDatabase);


    var CNCPRODUCT_TEMPLATE =
        '<tr class="cncProduct-container">' +
        '<td class="partNumber"></td>' +
        '<td class="partName"></td>' +
        '<td class="materialType"></td>' +
        '<td class="partSize"></td>' +
        '<td class="partLength"></td>' +
        '<td><button class="editBtn">EDIT</button>' +
        '<button class="deleteBtn">DELETE</button></td>' +
        '</tr>';


    // create database references
    var dbRefList = firebase.database().ref().child('cncProducts');

    // updates html list when product is added to database
    dbRefList.on('child_added', function (snap) {
        var tr = document.createElement('tr');
        tr.innerHTML = CNCPRODUCT_TEMPLATE;
        tr.id = snap.key;
        snap.forEach(function (childSnapshot) {
            var td = document.createElement('td');
            // td.className = childSnapshot.key;
            // td.innerText = childSnapshot.val();
            // tr.querySelector('.' + childSnapshot.key).textContent = childSnapshot.val();
            tr.querySelector('.' + childSnapshot.key).textContent = childSnapshot.val();
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
        tr.querySelector('.deleteBtn').addEventListener('click', function () {
            deleteProductFromDatabase(snap);
        });
        tr.querySelector('.editBtn').addEventListener('click', editProductFromDatabase);

    });

    // updates html list when editing
    dbRefList.on('child_changed', function (snap) {
        var trChanged = document.getElementById(snap.key);
        snap.forEach(function (childSnapshot) {
            var td = document.getElementsByClassName(childSnapshot.key);
            td.innerText = childSnapshot.val();
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
    function deleteProductFromDatabase(snap) {

        if (window.confirm("Vil Du fjerne dette produkt?")) {
            var trRef = dbRefList.child(snap.key);
            trRef.remove();
        }
    }

    // editing product from database
    function editProductFromDatabase() {
        console.log('edit');
    }

    // resets form fields values
    function resetForm() {
        partNumber.value = '';
        partName.value = '';
        materialType.value = '';
        partSize.value = '';
        partLength.value = '';
    }


    // CZEMU TO NIE DZIALA !!!
    function testForm() {
        if (partNumber.value === "" || partName.value === "" || materialType.value === "" || partSize.value === "" || partLength.value === "") {
            return false;
        }
        return true;
    };



}());