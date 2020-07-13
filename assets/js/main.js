let commands = [];
let categories = [];
let $select;
let $search;
let $rows;

const formattedPerms = {
  0: "Everyone",
  6: "Moderator",
  7: "Admin",
};

const init = function () {
  $select = document.querySelector("select");
  $search = document.querySelector("input");
  $rows = document.querySelector("table tbody");
  $select.addEventListener("change", run, false);
  $search.addEventListener("change", run, false);
  $search.addEventListener("keyup", run, false);

  run();

  fetch("https://api.sxbot.pw/api/commands")
    .then((response) => response.json())
    .then((json) => {
      // Sort commands
      commands = json.sort((a, b) => a.name.localeCompare(b.name));

      // Setup categories
      categories = [];
      commands.forEach((cmd) => {
        categories.push(cmd.category);
      });
      // Remove duplicates then sort
      categories = Array.from(new Set(categories));
      categories = categories.sort((a, b) => a.localeCompare(b));
    })
    .then(run);
};

const run = function () {
  let rows = [...commands];
  let selectHTML = "";
  let tableHTML = "";
  let selectValue = $select.value;
  let searchValue = $search.value;

  // Setup dropdown
  selectHTML = '<option value="">Select category</option>';
  categories.forEach((category) => {
    let selected = selectValue === category ? "selected" : "";
    selectHTML += `<option value="${category}" ${selected}>${category}</option>`;
  });

  // Filter category
  if (selectValue.length > 0) {
    rows = rows.filter((cmd) => cmd.category === selectValue);
  }

  // Filter search
  if (searchValue.length > 0) {
    rows = rows.filter((cmd) => cmd.name.toLowerCase().indexOf(searchValue.toLowerCase()) > -1 || cmd.description.toLowerCase().indexOf(searchValue.toLowerCase()) > -1);
  }

  rows.forEach((cmd) => {
    tableHTML += `
      <tr>
        <td>${cmd.name}</td>
        <td>${cmd.description}</td>
        <td>${cmd.category}</td>
        <td>${typeof formattedPerms[cmd.permissionLevel] !== "undefined" ? formattedPerms[cmd.permissionLevel] : "-"}</td>
      </tr>
    `;
  });

  $select.innerHTML = selectHTML;
  $rows.innerHTML = tableHTML;
};

window.addEventListener("load", init, false);
