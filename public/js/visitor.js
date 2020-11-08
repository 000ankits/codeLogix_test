function visitorListing(){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let result = JSON.parse(this.responseText);
            populateVisitorListing(result);            
        }
    };
    xhttp.open("GET", "/visitor/listing", true);
    xhttp.send();
    
}

function visitorLog(){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let result = JSON.parse(this.responseText);
            populateVisitorLog(result);
        }
    };
    xhttp.open("GET", "/visitor/log", true);
    xhttp.send();
}

function populateVisitorLog(tableRows){
    document.querySelector("#listingSearchInput").value = ''
    const table = document.querySelector("#visitorLogTable tbody");
    while(table.rows[0]) table.deleteRow(0);
    let serial = 1;
    tableRows.forEach(visitor=>{
        let row = table.insertRow(-1);
        
        let sNo = row.insertCell(0); 
        let name = row.insertCell(1);
        let mobile = row.insertCell(2);
        let address = row.insertCell(3);
        let destination = row.insertCell(4); 
        let lastIn = row.insertCell(5); 
        let lastOut = row.insertCell(6); 

        sNo.innerHTML = serial++
        name.innerHTML = visitor.name
        mobile.innerHTML = visitor.mobile
        address.innerHTML = visitor.address
        destination.innerHTML = visitor.destination
        lastIn.innerHTML = visitor.custintime
        if(visitor.custouttime){
            lastOut.innerHTML = visitor.custouttime
        } else{
            lastOut.innerHTML = `
                <form action = "/visitor/out" method="POST">
                    <input name="logId" value="`+visitor.id+`" hidden>
                    <input name="masterId" value="`+visitor.visitor_id+`" hidden>
                    <button type="submit">Check Out</button>
                </form>`
        }

    })
}

function populateVisitorListing(tableRows){
    document.querySelector("#logSearchInput").value = ''
    document.getElementById("fromDate").value = '';
    document.getElementById("toDate").value = '';
    const table = document.querySelector("#visitorListingTable tbody");
    while(table.rows[0]) table.deleteRow(0);
    let serial = 1;
    tableRows.forEach(visitor=>{
        let row = table.insertRow(-1);
        
        let sNo = row.insertCell(0); 
        let name = row.insertCell(1);
        let mobile = row.insertCell(2);
        let address = row.insertCell(3);
        let destination = row.insertCell(4); 
        let lastIn = row.insertCell(5); 
        let lastOut = row.insertCell(6); 

        sNo.innerHTML = serial++
        name.innerHTML = visitor.name
        mobile.innerHTML = visitor.mobile
        address.innerHTML = visitor.address
        destination.innerHTML = visitor.destination
        lastIn.innerHTML = visitor.custintime
        lastOut.innerHTML = visitor.custouttime

    })
}


// ===================================
// Search Functions
// ===================================

function logSearch(){
    const input = document.querySelector("#logSearchInput").value;
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let result = JSON.parse(this.responseText);
            populateVisitorLog(result);
        }
    };
    xhttp.open("GET", "/visitor/log/search/?logSearchParam="+input, true);
    xhttp.send();
}

function listingSearch(){
    const input = document.querySelector("#listingSearchInput").value;
    fromDate = document.getElementById("fromDate").value;
    toDate = document.getElementById("toDate").value;
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let result = JSON.parse(this.responseText);
            populateVisitorListing(result);
        }
    };
    xhttp.open("GET", "/visitor/listing/search/?listingSearchParam="+input+"&fromDate="+fromDate+"&toDate="+toDate, true);
    xhttp.send();
}


// ===================================
// TAB Functions
// ===================================

function openCity(evt, cityName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " active";

  }

