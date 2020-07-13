let commands = [];
let pagination = {
  current: 0,
  perPage: 20,
};
let sorting = {
  column: "name",
  order: "asc",
};
let $select;
let $search;
let $pagination;
let $rows;

const formattedPerms = {
  0: "Everyone",
  6: "Moderator",
  7: "Admin",
};

const init = function () {
  $select = document.querySelector("select");
  $search = document.querySelector("input");
  $pagination = document.querySelector("#pagination");
  $rows = document.querySelector("table tbody");
  $select.addEventListener("change", onFilter, false);
  $search.addEventListener("change", onFilter, false);
  $search.addEventListener("keyup", onFilter, false);
  document.querySelector("table thead").addEventListener("click", onSort, false);

  render();

  fetch("https://api.sxbot.pw/api/commands")
    .then((response) => response.json())
    .then((json) => {
      // Setup commands
      commands = json.map((cmd) => {
        cmd.permissionLevel = typeof formattedPerms[cmd.permissionLevel] !== "undefined" ? formattedPerms[cmd.permissionLevel] : "-";
        return cmd;
      });

      // Setup dropdown
      let selectHTML = '<option value="">Select category</option>';
      commands
        .map((cmd) => cmd.category)
        .filter((category, index, self) => self.indexOf(category) === index)
        .sort((a, b) => a.localeCompare(b))
        .forEach((category) => {
          selectHTML += `<option value="${category}">${category}</option>`;
        });
      $select.innerHTML = selectHTML;
    })
    .then(render);
};

const onSort = function (e) {
  e.preventDefault();
  pagination.current = 0;
  if (e.target.dataset && e.target.dataset.sort) {
    let reverse = sorting.order === "asc" ? "desc" : "asc";
    sorting.order = sorting.column == e.target.dataset.sort ? reverse : "asc";
    sorting.column = e.target.dataset.sort;
  }
  render();
};

const onFilter = function () {
  pagination.current = 0;
  render();
};

const onPage = function (pageNum) {
  pagination.current = parseInt(pageNum, 10);
  render();
};

const render = function () {
  let rows = [...commands];
  let selectValue = $select.value;
  let searchValue = $search.value;

  // Filter category
  if (selectValue.length > 0) {
    rows = rows.filter((cmd) => cmd.category === selectValue);
  }

  // Filter search
  if (searchValue.length > 0) {
    rows = rows.filter((cmd) => cmd.name.toLowerCase().indexOf(searchValue.toLowerCase()) > -1 || cmd.description.toLowerCase().indexOf(searchValue.toLowerCase()) > -1);
  }

  // Sort by column
  rows = rows.sort((a, b) => a[sorting.column].localeCompare(b[sorting.column]));
  if (sorting.order === "desc") {
    rows = rows.reverse();
  }

  // Render sorting
  document.querySelectorAll("table thead th").forEach((th) => {
    th.className = "";
    if (th.dataset.sort === sorting.column) {
      th.classList.add("sort");
      th.classList.add(sorting.order);
    }
  });

  // Render pagination
  $pagination.innerHTML = "";
  if (rows.length > pagination.perPage) {
    let pages = Math.ceil(rows.length / pagination.perPage);
    rows = rows.slice(pagination.current * pagination.perPage, pagination.current * pagination.perPage + pagination.perPage);
    for (let p = 0; p < pages; p++) {
      let $page = document.createElement("a");
      if (p === pagination.current) {
        $page.classList.add("selected");
      }
      $page.innerText = p + 1;
      $page.dataset.index = p;
      $page.href = "#";
      $page.addEventListener("click", function (e) {
        e.preventDefault();
        onPage(this.dataset.index);
      });
      $pagination.appendChild($page);
    }
  }

  // Render rows
  let rowsHTML = "";
  rows.forEach((cmd) => {
    rowsHTML += `
      <tr>
        <td>${cmd.name}</td>
        <td>${cmd.description}</td>
        <td>${cmd.category}</td>
        <td>${cmd.permissionLevel}</td>
      </tr>
    `;
  });
  $rows.innerHTML = rowsHTML;
};

window.addEventListener("load", init, false);
