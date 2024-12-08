document.querySelector("form").addEventListener("input", function () {
  saveFormData();
});

document.addEventListener("DOMContentLoaded", function () {
  loadFormData();

  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
    document.querySelector(".container").classList.add("dark-mode");
    document
      .querySelectorAll(".form-control")
      .forEach((el) => el.classList.add("dark-mode"));
    document.querySelector(".btn").classList.add("dark-mode");
    document.querySelector(".receipt-container").classList.add("dark-mode");
    document.querySelector("#themeSwitch").checked = true;
  }
});

document.addEventListener("DOMContentLoaded", function () {
  loadFormData();

  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
    document.querySelector(".container").classList.add("dark-mode");
    document
      .querySelectorAll(".form-control")
      .forEach((el) => el.classList.add("dark-mode"));
    document.querySelector(".btn").classList.add("dark-mode");
    document.querySelector(".receipt-container").classList.add("dark-mode");
    document.querySelector("#themeSwitch").checked = true;
  }
});

document.querySelector("#themeSwitch").addEventListener("change", function () {
  if (this.checked) {
    document.body.classList.add("dark-mode");
    document.querySelector(".container").classList.add("dark-mode");
    document
      .querySelectorAll(".form-control")
      .forEach((el) => el.classList.add("dark-mode"));
    document.querySelector(".btn").classList.add("dark-mode");
    document.querySelector(".receipt-container").classList.add("dark-mode");
    localStorage.setItem("theme", "dark");
  } else {
    document.body.classList.remove("dark-mode");
    document.querySelector(".container").classList.remove("dark-mode");
    document
      .querySelectorAll(".form-control")
      .forEach((el) => el.classList.remove("dark-mode"));
    document.querySelector(".btn").classList.remove("dark-mode");
    document.querySelector(".receipt-container").classList.remove("dark-mode");
    localStorage.setItem("theme", "light");
  }
});

function showNotification(message, type = "info") {
  toastr[type](message);
}

function updatePeopleInputs() {
  var numPeople = parseInt(
    document.querySelector('input[name="numPeople"]').value
  );
  var container = document.getElementById("peopleInputs");

  if (numPeople > 15) {
    showNotification("The number of people cannot exceed 15.", "warning");
    document.querySelector('input[name="numPeople"]').value = 15;
    numPeople = 15;
  }

  var existingValues = {};
  document
    .querySelectorAll("#peopleInputs .form-group")
    .forEach(function (inputDiv) {
      var nameInput = inputDiv.querySelector('input[name$="Name"]');
      var daysInput = inputDiv.querySelector('input[name$="Days"]');
      if (nameInput && daysInput) {
        existingValues[nameInput.name] = nameInput.value;
        existingValues[daysInput.name] = daysInput.value;
      }
    });

  container.innerHTML = "";

  for (var i = 0; i < numPeople; i++) {
    var personDiv = document.createElement("div");
    personDiv.className = "form-group";
    personDiv.innerHTML = `
            <label for="person${i}Name">Person ${i + 1} Name</label>
            <input type="text" class="form-control" name="person${i}Name" id="person${i}Name" placeholder="Name" value="${
      existingValues[`person${i}Name`] || ""
    }">
            
            <label for="person${i}Days">Days Staying</label>
            <input type="number" class="form-control" name="person${i}Days" id="person${i}Days" placeholder="Days" value="${
      existingValues[`person${i}Days`] || ""
    }">
        `;
    container.appendChild(personDiv);
  }

  saveFormData();
}


function calcBill() {
    const previousReading = parseFloat(
      document.querySelector('input[name="previousReading"]').value
    );
    const currentReading = parseFloat(
      document.querySelector('input[name="currentReading"]').value
    );
    const ratePerKwh = parseFloat(
      document.querySelector('input[name="ratePerKwh"]').value
    );
    const startDate = document.querySelector('input[name="startDate"]').value;
    const endDate = document.querySelector('input[name="endDate"]').value;
    const numPeople = parseInt(
      document.querySelector('input[name="numPeople"]').value
    );
  
    if (
      isNaN(previousReading) ||
      isNaN(currentReading) ||
      isNaN(ratePerKwh) ||
      previousReading <= 0 ||
      currentReading <= 0 ||
      ratePerKwh <= 0
    ) {
      showNotification("All readings and rate per kWh must be greater than 0.");
      return;
    }

    if (!startDate || !endDate || new Date(startDate) > new Date(endDate)) {
      showNotification(
        "Start Date must be before End Date and both dates must be provided."
      );
      return;
    }
  
    const totalUnits = currentReading - previousReading;
    if (totalUnits < 0) {
      showNotification(
        "Current reading must be greater than or equal to previous reading."
      );
      return;
    }
  
    const billAmount = totalUnits * ratePerKwh;
    const roundedBillAmount = parseFloat(billAmount.toFixed(2));
  
    const peopleInputs = Array.from(
      document.querySelectorAll("#peopleInputs .form-group")
    ).map((div, index) => {
      const nameInput = div.querySelector('input[name$="Name"]');
      const daysInput = div.querySelector('input[name$="Days"]');
  
      const name = nameInput
        ? nameInput.value.trim()
        : `Person ${String.fromCharCode(65 + index)}`;
      const days = daysInput ? parseFloat(daysInput.value) || 0 : 0;
  
      return { name, days };
    });
  
    const totalDays = peopleInputs.reduce((sum, person) => sum + person.days, 0);
  
    if (totalDays <= 0) {
      showNotification(
        "Total days stayed by all persons must be greater than 0."
      );
      return;
    }
  
    let details = `
                  Start Date: ${startDate}<br>
                  End Date: ${endDate}<br><br>
                  Previous Reading: ${previousReading}<br>
                  Current Reading: ${currentReading}<br><br>
                  Total kWh Consumed: ${totalUnits} kWh<br>
                  Rate per kWh: ${ratePerKwh} ₱<br><br>
              `;
  
    peopleInputs.forEach((person) => {
      const personShare = parseFloat(
        ((person.days / totalDays) * roundedBillAmount).toFixed(2)
      );
      details += `${person.name} (${person.days} days): ₱${personShare.toFixed(
        2
      )}<br>`;
    });
  
    details += `<br>Total Bill: ₱${roundedBillAmount.toFixed(2)}<br>`;
    document.getElementById("billDetails").innerHTML = details;
    showNotification("Bill calculated!");
  
    const billData = {
      previousReading,
      currentReading,
      ratePerKwh,
      numPeople,
      people: peopleInputs.map((person) => ({
          name: person.name,
          days: person.days,
      })),
      totalUnits,
      totalBill: roundedBillAmount,
  };
    
    console.log("Sending data to PHP:", billData);

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "process_bill.php", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {  
          if (xhr.status === 200) {
              console.log(xhr.responseText);  
              const response = JSON.parse(xhr.responseText);  
              if (response.status === "success") {
                  showNotification("Bill data saved to MySQL!", "success");
              } else {
                  showNotification("Error saving bill data: " + response.message, "error");
              }
          } else {
              console.error("Error:", xhr.statusText);  
              showNotification("Error occurred during request. Status: " + xhr.status, "error");
          }
      }
  };
  

    // Send the data JSON
    xhr.send(JSON.stringify({ billData: billData }));
        saveFormData(); 
  }
      
  

function saveFormData() {
  var formData = {};

  document
    .querySelectorAll('form input:not([name^="person"])')
    .forEach(function (el) {
      if (el.name) {
        formData[el.name] = el.value;
      }
    });

  var peopleData = {};
  document
    .querySelectorAll("#peopleInputs .form-group")
    .forEach(function (div) {
      var nameInput = div.querySelector('input[name$="Name"]');
      var daysInput = div.querySelector('input[name$="Days"]');
      if (nameInput && daysInput) {
        peopleData[nameInput.name] = nameInput.value;
        peopleData[daysInput.name] = daysInput.value;
      }
    });

  const inputs = document.querySelectorAll(".form-control");

  inputs.forEach((input) => {
    formData[input.name] = input.value;
  });

  Object.assign(formData, peopleData);

  localStorage.setItem("formData", JSON.stringify(formData));
}

function loadFormData() {
  const savedData = localStorage.getItem("formData");
  var formData = JSON.parse(localStorage.getItem("formData") || "{}");
  if (formData) {
    Object.keys(formData).forEach(function (key) {
      var el = document.querySelector(`[name="${key}"]`);
      if (el) {
        el.value = formData[key];
      }
    });

    updatePeopleInputs();
  }
  if (savedData) {
    const formData = JSON.parse(savedData);
    const inputs = document.querySelectorAll(".form-control");

    inputs.forEach((input) => {
      if (formData[input.name] !== undefined) {
        input.value = formData[input.name];
      }
    });

    if (formData["numPeople"]) {
      document.querySelector('input[name="numPeople"]').value =
        formData["numPeople"];
      updatePeopleInputs();
    }
  }
}
