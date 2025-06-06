let btn = document.querySelector("#btn");
let sidebar = document.querySelector(".sidebar");

function setActiveLink() {
  const links = document.querySelectorAll(".nav_list li a");
  const currentURL = window.location.pathname.split("/").pop();

  links.forEach(link => {
    link.classList.remove("active");
    if (link.getAttribute("href") === currentURL) {
      link.classList.add("active");
    }
  });
}

setActiveLink();

// to toggle navbar when user click outside of the sidebar
document.addEventListener("click", (event) => {
  if (sidebar.classList.contains("active") && !sidebar.contains(event.target)) {
    sidebar.classList.remove("active");
  }
});

btn.onclick = function () {
  sidebar.classList.toggle("active");
};