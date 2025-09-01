// --- Book Data ---
let books = [
  { id: 1, title: "Death on the Nile", author: "Agatha Christie", category: "Mystery", available: true, cover: "https://m.media-amazon.com/images/I/81sFKDbcOcL._UF1000,1000_QL80_.jpg", pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
  { id: 2, title: "The Silent Patient", author: "Alex Michaelides", category: "Thriller", available: true, cover: "https://m.media-amazon.com/images/I/81JJPDNlxSL.jpg", pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
  { id: 3, title: "Harry Potter", author: "J.K. Rowling", category: "Fantasy", available: true, cover: "https://m.media-amazon.com/images/I/81q77Q39nEL._UF894,1000_QL80_.jpg", pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
  { id: 4, title: "Diary of a Wimpy Kid", author: "Jeff Kinney", category: "Comedy", available: true, cover: "https://m.media-amazon.com/images/I/91Iw953zmOL.jpg", pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" }
];

// --- LocalStorage state ---
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

// --- Page navigation ---
function showPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
  if (id === "catalog") renderCatalog();
  if (id === "dashboard") renderDashboard();
  if (id === "home") renderCarousel();
}

// --- Auth ---
function register() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  if (users.find(u => u.email === email)) {
    document.getElementById("authMsg").innerText = "⚠️ User already exists!";
    return;
  }
  const user = { id: users.length + 1, name, email, password };
  users.push(user);
  saveData();
  document.getElementById("authMsg").innerText = "✅ Registered! Now login.";
}

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    document.getElementById("authMsg").innerText = "❌ Invalid credentials!";
    return;
  }
  currentUser = user;
  saveData();
  alert("✅ Logged in as " + user.name);
  showPage("catalog");
}

// --- Catalog ---
function renderCatalog() {
  let sort = document.getElementById("sort")?.value || "";
  let sortedBooks = [...books];
  if (sort) sortedBooks.sort((a, b) => a[sort].localeCompare(b[sort]));

  const container = document.getElementById("books");
  container.innerHTML = sortedBooks.map(book => `
    <div class="bg-gray-800 p-3 rounded-lg shadow-lg hover:scale-105 transition">
      <div class="w-32 h-48 mx-auto overflow-hidden">
        <img src="${book.cover}" class="w-full h-full object-cover">
      </div>
      <h3 class="mt-3 font-bold text-sm">${book.title}</h3>
      <p class="text-xs text-gray-400">${book.author}</p>
      <p class="text-xs ${book.available ? "text-green-400" : "text-red-400"}">${book.available ? "Available" : "Borrowed"}</p>
      <div class="mt-2 space-x-1">
        <button onclick="borrow(${book.id})" class="px-2 py-1 bg-emerald-500 text-xs rounded">Borrow</button>
        <button onclick="returnBook(${book.id})" class="px-2 py-1 bg-red-500 text-xs rounded">Return</button>
        <button onclick="renewBook(${book.id})" class="px-2 py-1 bg-yellow-500 text-xs rounded">Renew</button>
        <button onclick="readBook(${book.id})" class="px-2 py-1 bg-blue-500 text-xs rounded">Read</button>
        <button onclick="addFavorite(${book.id})" class="px-2 py-1 bg-pink-500 text-xs rounded">❤️</button>
      </div>
    </div>
  `).join("");
}

// --- Carousel (Home Featured) ---
function renderCarousel() {
  const container = document.getElementById("carousel");
  const featuredBooks = books.slice(0, 4);
  container.innerHTML = featuredBooks.map(book => `
    <div class="min-w-[150px] bg-gray-800 rounded-lg shadow hover:scale-105 transition">
      <img src="${book.cover}" class="w-full h-48 object-cover rounded-t">
      <div class="p-2 text-center">
        <p class="font-bold text-sm">${book.title}</p>
        <button onclick="readBook(${book.id})" class="mt-2 px-2 py-1 bg-blue-500 text-xs rounded">Read</button>
      </div>
    </div>
  `).join("");
}

// --- Borrow / Return / Renew ---
function borrow(id) {
  if (!currentUser) return alert("⚠️ Login first!");
  const book = books.find(b => b.id === id);
  if (!book.available) return alert("❌ Not available!");
  loans.push({ userId: currentUser.id, bookId: id, returned: false });
  book.available = false;
  saveData(); renderCatalog();
  alert("✅ Borrowed: " + book.title);
}

function returnBook(id) {
  const loan = loans.find(l => l.userId === currentUser.id && l.bookId === id && !l.returned);
  if (!loan) return alert("⚠️ No active loan.");
  loan.returned = true;
  const book = books.find(b => b.id === id); book.available = true;
  saveData(); renderCatalog(); renderDashboard();
  alert("✅ Returned.");
}

function renewBook(id) {
  const loan = loans.find(l => l.userId === currentUser.id && l.bookId === id && !l.returned);
  if (!loan) return alert("⚠️ No active loan.");
  alert("🔄 Renewed! (simulated, +15 days)");
}

// --- Favorites ---
function addFavorite(id) {
  if (!favorites.includes(id)) favorites.push(id);
  saveData(); renderDashboard();
  alert("❤️ Added to favorites");
}

// --- Dashboard ---
function renderDashboard() {
  if (!currentUser) return alert("⚠️ Login first!");
  const userLoans = loans.filter(l => l.userId === currentUser.id && !l.returned);

  document.getElementById("loans").innerHTML = `
    <h3 class="font-bold mb-2">Loans</h3>
    ${userLoans.length === 0 ? "<p>No active loans.</p>" : userLoans.map(l => {
      const book = books.find(b => b.id === l.bookId);
      return `<div class="mb-2 p-2 bg-gray-800 rounded">
        ${book.title}
        <button onclick="returnBook(${book.id})" class="ml-2 px-2 bg-red-500 text-xs rounded">Return</button>
        <button onclick="renewBook(${book.id})" class="ml-2 px-2 bg-yellow-500 text-xs rounded">Renew</button>
      </div>`;
    }).join("")}
  `;

  document.getElementById("favorites").innerHTML = `
    <h3 class="font-bold mb-2">Favorites</h3>
    ${favorites.length === 0 ? "<p>No favorites.</p>" : favorites.map(fid => {
      const book = books.find(b => b.id === fid);
      return `<p>❤️ ${book.title}</p>`;
    }).join("")}
  `;
}

// --- PDF Modal ---
function readBook(id) {
  const book = books.find(b => b.id === id);
  document.getElementById("pdfFrame").src = book.pdfUrl;
  document.getElementById("pdfModal").classList.remove("hidden");
}
function closeModal() { document.getElementById("pdfModal").classList.add("hidden"); }

// Init
renderCarousel();
renderCatalog();
