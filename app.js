// --- Book Data ---
let books = [
  { id: 1, title: "Death on the Nile", author: "Agatha Christie", available: true, cover: "https://m.media-amazon.com/images/I/81sFKDbcOcL._UF1000,1000_QL80_.jpg", pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
  { id: 2, title: "The Silent Patient", author: "Alex Michaelides", available: true, cover: "https://m.media-amazon.com/images/I/81JJPDNlxSL.jpg", pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
  { id: 3, title: "Harry Potter", author: "J.K. Rowling", available: true, cover: "https://m.media-amazon.com/images/I/81q77Q39nEL._UF894,1000_QL80_.jpg", pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
  { id: 4, title: "Diary of a Wimpy Kid", author: "Jeff Kinney", available: true, cover: "https://m.media-amazon.com/images/I/91Iw953zmOL.jpg", pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" }
];

// --- LocalStorage State ---
let users = JSON.parse(localStorage.getItem("users")) || [];
let loans = JSON.parse(localStorage.getItem("loans")) || [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

function saveData() {
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("loans", JSON.stringify(loans));
  localStorage.setItem("favorites", JSON.stringify(favorites));
  localStorage.setItem("currentUser", JSON.stringify(currentUser));
}

// --- Navigation ---
function showPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
  if (id === "catalog") renderCatalog();
  if (id === "dashboard") renderDashboard();
  if (id === "home") renderFeatured();
}

// --- Auth ---
function register() {
  let name = document.getElementById("name").value,
      email = document.getElementById("email").value,
      password = document.getElementById("password").value;

  if (users.some(u => u.email === email)) return alert("User already exists!");
  users.push({ id: users.length + 1, name, email, password });
  saveData();
  alert("Registered! Please login.");
}

function login() {
  let email = document.getElementById("email").value,
      password = document.getElementById("password").value;

  let user = users.find(u => u.email === email && u.password === password);
  if (!user) return alert("Invalid login!");
  currentUser = user; saveData();
  alert("Welcome " + user.name);
  showPage("catalog");
}

// --- Catalog ---
function renderCatalog() {
  document.getElementById("books").innerHTML = books.map(book => `
    <div class="bg-gray-800 p-3 rounded-lg text-center">
      <img src="${book.cover}" class="w-32 h-48 mx-auto object-cover rounded">
      <h3 class="mt-2 font-bold text-sm">${book.title}</h3>
      <p class="text-xs text-gray-400">${book.author}</p>
      <p class="text-xs ${book.available ? "text-green-400" : "text-red-400"}">${book.available ? "Available" : "Borrowed"}</p>
      <div class="mt-2 space-x-1 text-xs">
        <button onclick="borrow(${book.id})" class="px-2 py-1 bg-emerald-500 rounded">Borrow</button>
        <button onclick="returnBook(${book.id})" class="px-2 py-1 bg-red-500 rounded">Return</button>
        <button onclick="readBook(${book.id})" class="px-2 py-1 bg-blue-500 rounded">Read</button>
        <button onclick="addFavorite(${book.id})" class="px-2 py-1 bg-pink-500 rounded">❤️</button>
      </div>
    </div>`).join("");
}

// --- Featured Books (Home) ---
function renderFeatured() {
  let featured = books.slice(0, 4);
  document.getElementById("carousel").innerHTML = featured.map(book => `
    <div class="min-w-[150px] bg-gray-800 rounded shadow text-center">
      <img src="${book.cover}" class="w-full h-48 object-cover rounded-t">
      <p class="p-2 font-bold text-sm">${book.title}</p>
    </div>`).join("");
}

// --- Borrow / Return ---
function borrow(id) {
  if (!currentUser) return alert("Login first!");
  let book = books.find(b => b.id === id);
  if (!book.available) return alert("Not available!");

  loans.push({ userId: currentUser.id, bookId: id, returned: false });
  book.available = false; saveData(); renderCatalog();
}

function returnBook(id) {
  let loan = loans.find(l => l.userId === currentUser.id && l.bookId === id && !l.returned);
  if (!loan) return;
  loan.returned = true; books.find(b => b.id === id).available = true;
  saveData(); renderCatalog(); renderDashboard();
}

// --- Favorites + Dashboard ---
function addFavorite(id) {
  if (!favorites.includes(id)) favorites.push(id);
  saveData(); renderDashboard();
}

function renderDashboard() {
  if (!currentUser) return alert("Login first!");

  let userLoans = loans.filter(l => l.userId === currentUser.id && !l.returned);
  document.getElementById("loans").innerHTML = userLoans.length
    ? userLoans.map(l => `<p>${books.find(b => b.id === l.bookId).title}</p>`).join("")
    : "<p>No active loans.</p>";

  document.getElementById("favorites").innerHTML = favorites.length
    ? favorites.map(fid => `<p>❤️ ${books.find(b => b.id === fid).title}</p>`).join("")
    : "<p>No favorites.</p>";
}

// --- PDF Modal ---
function readBook(id) {
  document.getElementById("pdfFrame").src = books.find(b => b.id === id).pdfUrl;
  document.getElementById("pdfModal").classList.remove("hidden");
}
function closeModal() { document.getElementById("pdfModal").classList.add("hidden"); }

// --- Initialize ---
renderFeatured();
renderCatalog();
