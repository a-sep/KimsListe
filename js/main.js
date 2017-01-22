"use strict";
(function KimsListe() {



    // testing database:
    let config = {
        apiKey: "AIzaSyC_m6VaHDvrIRr3IlDPoMTKPZYE64NEGkw",
        authDomain: "kimsliste-ccf6a.firebaseapp.com",
        databaseURL: "https://kimsliste-ccf6a.firebaseio.com",
        storageBucket: "kimsliste-ccf6a.appspot.com",
        messagingSenderId: "404181812683"
    };
    firebase.initializeApp(config);

// create database references
    let dbRefList = firebase.database().ref().child('cncProducts');

// get elements
    let partNumber = document.getElementById('partNumber');
    let partName = document.getElementById('partName');
    let materialType = document.getElementById('materialType');
    let partSize = document.getElementById('partSize');
    let partLength = document.getElementById('partLength');
    let partInfo = document.getElementById('partInfo');
    let addBtn = document.getElementById('addBtn');
    let searchBtn = document.getElementById('searchBtn');
    let resetBtn = document.getElementById('resetBtn');
    let tbody = document.getElementById('cncProductsList');
    let trSorting = document.getElementById('trSorting');

    addBtn.addEventListener('click', addToDatabase);
    resetBtn.addEventListener('click', resetForm);
    searchBtn.addEventListener('click', function () {
        findEntryByColumn(sortingByColumnValue);
    });

    // partNumber.addEventListener('keyup', findProductUsingInput);


    // editing and deleting
    tbody.addEventListener('click', (e) => {
        // deleting product from database
        if (e.target.className === 'deleteBtn') {
            let key = e.target.parentNode.id;
            deleteProductFromDatabase(key);
        }
        // editing data of product
        if (e.target.className !== 'deleteBtn') {
            let trKey = e.target.parentNode.id;
            let tdClass = e.target.className;
            let tdTextContent = e.target.textContent;
            updateProduct(trKey, tdClass, tdTextContent);
        }
    });

    let sortingByColumnValue = 'partName';
    findEntryByColumn(sortingByColumnValue); // shows all products on start sorted by name

    trSorting.addEventListener('click', (e) => {
        // sortingByColumnValue = e.target.textContent;
        switch (e.target.textContent) {
            case 'Varenummer':
                sortingByColumnValue = 'partNumber';
                break;
            case 'Varenavn':
                sortingByColumnValue = 'partName';
                break;
            case 'Material':
                sortingByColumnValue = 'materialType';
                break;
            case 'Diameter (mm)':
                sortingByColumnValue = 'partSize';
                break;
            case 'Længde (mm)':
                sortingByColumnValue = 'partLength';
                break;
        }
        findEntryByColumn(sortingByColumnValue);
        return sortingByColumnValue;
    });

    // findEntryByColumn(sortingByColumnValue); // shows all products on start

    function updateProduct(productKey, entryKey, entryValue) {
        // console.log("update ", productKey, entryKey, entryValue);
        // for at show correct message in prompt box while editing use switch.
        let message;
        switch (entryKey) {
            case 'partNumber':
                message = 'Varenummer';
                break;
            case 'partName':
                message = 'Varenavn';
                break;
            case 'materialType':
                message = 'Material';
                break;
            case 'partSize':
                message = 'Diameter (mm)';
                break;
            case 'partLength':
                message = 'Længde (mm)';
                break;
            case 'partInfo':
                message = 'Bemærkning';
                break;
            default:
                message = 'default message from switch statment...';
        }
        let newEntryValue = prompt(message, entryValue);
        if (newEntryValue === null) { // if user click CANCEL
            newEntryValue = entryValue;
        }
        return firebase.database().ref().child('cncProducts').child(productKey).child(entryKey)
            .set(newEntryValue)
            .then(function () {
                console.log('updated to the database');
                findEntryByColumn(sortingByColumnValue);
            });
    }


    function findEntryByColumn(sortingByColumnValue) {
        clear();
        dbRefList.orderByChild(sortingByColumnValue).once('value', gotData, errorData);
    }

    function findProductUsingInput(event) {
        console.log('find input', event.key, partNumber.value, 'content', partNumber.textContent);
        clear();
        // TODO pobrana tablice przeszukac po stronie klienta i wynik zapisac do nowej tablicy,
        dbRefList.orderByChild(sortingByColumnValue).startAt(partNumber.value).once('value', gotData, errorData);
    }

    function clear() {
        // remove all tr from tbody (clear list in html)
        while (tbody.lastChild) {
            tbody.removeChild(tbody.lastChild);
        }
    }

    function gotData(snap) {
        snap.forEach(function (childSnapshot) {
            let tr = document.createElement('tr');
            tr.innerHTML = CNCPRODUCT_TEMPLATE;
            tr.id = childSnapshot.key;
            childSnapshot.forEach(function (tdValue) {
                tr.querySelector('.' + tdValue.key).textContent = tdValue.val();
            });
            tbody.appendChild(tr);
        });
    }

    function errorData(err) {
        console.log(err);
    }


    let CNCPRODUCT_TEMPLATE =
        '<tr class="cncProduct-container">' +
        '<td class="partNumber"></td>' +
        '<td class="partName"></td>' +
        '<td class="materialType"></td>' +
        '<td class="partSize"></td>' +
        '<td class="partLength"></td>' +
        '<td class="partInfo"></td>' +
        '<button class="deleteBtn">DELETE</button></td>' +
        '</tr>';


// adding a new product to database
    function addToDatabase() {
        // Check all fields in form

        if (testForm()) {
            // Add a new product entry to the Firebase Database. Using push give us a uniq key for each product.
            dbRefList.push({
                partNumber: partNumber.value,
                partName: partName.value,
                materialType: materialType.value,
                partSize: partSize.value,
                partLength: partLength.value,
                partInfo: partInfo.value
            }).then(function () {
                // Clear form text fields
                resetForm();
                partNumber.focus();
                console.log('saved to the database');
                findEntryByColumn(sortingByColumnValue);
            });
        } else {
            console.log('...ups - enter correct values');
        }
    }


// deleting product from database
    function deleteProductFromDatabase(key) {
        if (window.confirm("Vil Du fjerne dette produkt?")) {
            let trRef = dbRefList.child(key);
            trRef.remove();
            findEntryByColumn(sortingByColumnValue);
        }
    }

// resets form fields values
    function resetForm() {
        partNumber.value = '';
        partName.value = '';
        materialType.value = '';
        partSize.value = '';
        partLength.value = '';
        partInfo.value = '';
    }

    function testForm() {
        // TODO validating a form with regExp. !!!
        // 'info' field is not required to fill up
        if (partNumber.value === " " || partName.value === " " || materialType.value === " " || partSize.value === " " || partLength.value === " ") {
            return false;
        }

        if (partNumber.value === "" || partName.value === "" || materialType.value === "" || partSize.value === "" || partLength.value === "") {
            return false;
        }
        return true;
    }


})();
