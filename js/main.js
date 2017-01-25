"use strict";
(function KimsListe() {

    // Initialize Firebase


    // // testing database:
    const config = {
        apiKey: "AIzaSyC_m6VaHDvrIRr3IlDPoMTKPZYE64NEGkw",
        authDomain: "kimsliste-ccf6a.firebaseapp.com",
        databaseURL: "https://kimsliste-ccf6a.firebaseio.com",
        storageBucket: "kimsliste-ccf6a.appspot.com",
        messagingSenderId: "404181812683"
    };
    firebase.initializeApp(config);

// create database references
    const dbRefList = firebase.database().ref().child('cncProducts');

// get elements
    const partNumber = document.getElementById('partNumber');
    const partName = document.getElementById('partName');
    const materialType = document.getElementById('materialType');
    const partSize = document.getElementById('partSize');
    const partLength = document.getElementById('partLength');
    const partInfo = document.getElementById('partInfo');
    const addBtn = document.getElementById('addBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    const resetBtn = document.getElementById('resetBtn');
    const tbody = document.getElementById('cncProductsList');
    const trSorting = document.getElementById('trSorting');


    addBtn.addEventListener('click', addToDatabase);
    resetBtn.addEventListener('click', resetForm);
    refreshBtn.addEventListener('click', function () {
        findEntryByColumn(sortingByColumnValue);
    });

    // partNumber.addEventListener('keyup', findProductUsingInput);

    function findProductUsingInput(event) {
        console.log('find input', event.key, partNumber.value, 'content', partNumber.textContent);
        clear();
        // TODO pobrana tablice przeszukac po stronie klienta i wynik zapisac do nowej tablicy,
        dbRefList.orderByChild(sortingByColumnValue).startAt(partNumber.value).once('value', gotData, errorData);
    }

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
        '<td class="partInfo">---</td>' +
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
        partInfo.value = '---';
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


    // **************************************** LOGIN PART *******************************************************
    // get elements
    const txtEmail = document.getElementById('txtEmail');
    const txtPassword = document.getElementById('txtPassword');
    const btnLogIn = document.getElementById('btnLogIn');
    const btnSignUp = document.getElementById('btnSignUp');
    const btnLogOut = document.getElementById('btnLogOut');
    const loginForm = document.getElementById('loginForm');
    const logoutForm = document.getElementById('logoutForm');
    let userEmail = document.getElementById('userEmail');

    // Add login event
    btnLogIn.addEventListener('click', e => {
        // get email and password
        const email = txtEmail.value;
        const pass = txtPassword.value;
        const auth = firebase.auth();

        const promise = auth.signInWithEmailAndPassword(email, pass);
        promise.catch(e => console.log(e.message));
    });

    // Add signup event
    btnSignUp.addEventListener('click', e => {
        // get email and password
        const email = txtEmail.value;
        const pass = txtPassword.value;
        const auth = firebase.auth();

        const promise = auth.createUserWithEmailAndPassword(email, pass);
        promise.catch(e => console.log(e.message));

        alert('Kontakt Artur for at oprette ny "user account"');
    });

    // Add logout event
    btnLogOut.addEventListener('click', e => {
        firebase.auth().signOut();
    });

    // Add a real time listener
    firebase.auth().onAuthStateChanged(firebaseUser => {
        if (firebaseUser) {
            console.log(firebaseUser);
            logoutForm.classList.remove('hide');
            loginForm.classList.add('hide');
            findEntryByColumn(sortingByColumnValue); // show all entry from databaase if user is logged in
            userEmail.textContent = 'Logged in as ' + firebaseUser.email;
        } else {
            console.log('not logged in');
            loginForm.classList.remove('hide');
            logoutForm.classList.add('hide');
            clear();
        }
    });

})();
