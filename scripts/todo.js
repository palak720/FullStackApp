import { baseUrl } from "./baseUrl.js";

document.getElementById("logout").addEventListener("click", function () {
  localStorage.removeItem("loginData");
  alert("Redirecting to Home Page....");
  window.location.href = "index.html";
});

let loginData = JSON.parse(localStorage.getItem("loginData"));
if (loginData == null) {
  alert("Please Login....");
  window.location.href = "login.html";
}

document.getElementById(
  "user-name"
).textContent = `Welcome, ${loginData.username}`;

let form = document.getElementById("form");
form.addEventListener("submit", function () {
  event.preventDefault();
  let title = form.title.value;
  let deadline = form.deadline.value;
  let priority = form.priority.value;
  let todoObj = {
    title,
    deadline,
    priority,
    status: false,
    userId: loginData.id,
  };
  // console.log(todoObj)

  // push this todo to json server
  fetch(`${baseUrl}/todos`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(todoObj),
  })
    .then(() => {
      alert("Todo Added....");
      loadData()
    })
    .catch((err) => {
      alert("Something went wrong");
      console.log(err);
    });
});

async function getTodos() {
  try {
    let res = await fetch(`${baseUrl}/todos`);
    let data = await res.json();
    let userTodos = data.filter((el,i)=> el.userId == loginData.id)
    return userTodos;
  } catch (err) {
    console.log(err);
    alert("Something went wrong in getting Todos");
  }
}

function displayTodos(arr) {
  let cont = document.getElementById("todo-container");
  cont.innerHTML = "";

  arr.map((el, i) => {
    let card = document.createElement("div");
    card.setAttribute("class", "todo-card");

    let title = document.createElement("h5");
    title.textContent = `Title: ${el.title}`;

    let deadline = document.createElement("h5");
    deadline.textContent = `Deadline: ${el.deadline}`;

    let d = new Date(el.deadline);
    if (d < Date.now() && el.status==false) {
      card.classList.add("pending");
    }
    let priority = document.createElement("h5");
    priority.textContent = `Priority: ${el.priority}`;

    let status = document.createElement("h5");
    status.textContent =
      el.status == true ? "Status: Completed" : "Status: Pending";

    let updateStatusButton = document.createElement("button");
    updateStatusButton.textContent = `Toggle Status`;
    updateStatusButton.addEventListener("click", function () {
      updateStatusFn(el, i);
    });

    let deleteTodoButton = document.createElement("button");
    deleteTodoButton.textContent = `Delete Todo`;
    deleteTodoButton.addEventListener("click", function () {
      deleteTodoFn(el, i);
    });
    card.append(title, priority, deadline, status, updateStatusButton, deleteTodoButton);
    cont.append(card);
  });
}

window.onload = async () => {
  let arr = await getTodos();
  displayTodos(arr);
};

async function loadData() {
  let arr = await getTodos();
  displayTodos(arr);
}
function updateStatusFn(el, i) {
  //console.log("before", el)
  let updatedTodo = { ...el, status: !el.status };
  //console.log("after", updatedTodo)
  let todoId = el.id;
  fetch(`${baseUrl}/todos/${todoId}`, {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(updatedTodo),
  })
    .then(() => {
      alert("Todo Updated....");
      /// reload to get updated data
      // window.location.reload()
      // or else call loadData funtion
      loadData();
    })
    .catch((err) => {
      alert("Something went wrong in updation");
      console.log(err);
    });
}

function deleteTodoFn(el, i) {
  let todoId = el.id;
  fetch(`${baseUrl}/todos/${todoId}`, {
    method: "DELETE",
  })
    .then(() => {
      alert("Todo Deleted....");
      /// reload to get updated data
      // window.location.reload()
      // or else call loadData funtion
      loadData();
    })
    .catch((err) => {
      alert("Something went wrong in updation");
      console.log(err);
    });
}