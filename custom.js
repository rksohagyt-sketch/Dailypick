/* ========================================================
   Daily Pick - Professional Notification Bell & Search Bar
   (সম্পূর্ণ ফাইল: custom.js)
======================================================== */

// ১. ড্রপডাউনের জন্য অ্যানিমেশন সিএসএস যুক্ত করা
const proNotifStyles = `
<style id="custom-pro-notif-style">
    @keyframes dropFade {
        from { opacity: 0; transform: translateY(-8px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .notif-dropdown-anim {
        animation: dropFade 0.25s ease-out forwards;
    }
    .bell-ring-subtle {
        animation: bellShake 3s infinite;
    }
    @keyframes bellShake {
        0%, 100% { transform: rotate(0); }
        5%, 15% { transform: rotate(12deg); }
        10%, 20% { transform: rotate(-12deg); }
        25% { transform: rotate(0); }
    }
</style>
`;
document.head.insertAdjacentHTML('beforeend', proNotifStyles);

// ২. পেজ লোড হলে সার্চ বার এবং নোটিফিকেশন সেটআপ
document.addEventListener('DOMContentLoaded', initProFeatures);
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initProFeatures();
}

function initProFeatures() {
    setupProNotificationBell();
    setupSearchBar();
}

// ৩. লাইভ সার্চ বার ফাংশন (অপরিবর্তিত রাখা হয়েছে)
function setupSearchBar() {
    if (document.getElementById('productSearchInput')) return;

    const grid = document.getElementById('productGrid');
    if (!grid) return;
    const productSection = grid.parentElement;

    const searchWrapper = document.createElement('div');
    searchWrapper.className = 'mb-4 max-w-xl mx-auto';
    searchWrapper.innerHTML = `
        <div class="relative flex items-center">
            <i class="fa-solid fa-magnifying-glass absolute left-3.5 text-gray-400 text-sm"></i>
            <input type="text" id="productSearchInput" oninput="handleProductSearch(this.value)" placeholder="পণ্য খুঁজুন (যেমন: শার্ট, টি-শার্ট, ঘড়ি, হেডফোন)..." class="w-full bg-white border border-gray-200 text-sm pl-10 pr-10 py-2.5 rounded-xl shadow-sm outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition">
            <button id="clearSearchBtn" onclick="clearProductSearch()" class="hidden absolute right-3 text-gray-400 hover:text-gray-600 text-sm p-1">
                <i class="fa-solid fa-circle-xmark text-base"></i>
            </button>
        </div>
        <p id="searchResultCount" class="text-[11px] text-gray-500 mt-1 pl-1 hidden"></p>
    `;

    productSection.insertBefore(searchWrapper, productSection.firstChild);
}

function handleProductSearch(query) {
    const clearBtn = document.getElementById('clearSearchBtn');
    const countText = document.getElementById('searchResultCount');
    const grid = document.getElementById('productGrid');
    if (!grid) return;

    const cleanQuery = query.trim().toLowerCase();

    if (cleanQuery.length > 0) {
        clearBtn.classList.remove('hidden');
    } else {
        clearBtn.classList.add('hidden');
        countText.classList.add('hidden');
        if (typeof renderProducts === 'function') {
            renderProducts();
        }
        return;
    }

    let allProducts = [];
    try {
        allProducts = JSON.parse(localStorage.getItem('dailyPickProducts')) || [];
    } catch(e) {
        allProducts = [];
    }

    const filtered = allProducts.filter(p => {
        const titleMatch = p.title && p.title.toLowerCase().includes(cleanQuery);
        const catMatch = p.category && p.category.toLowerCase().includes(cleanQuery);
        return titleMatch || catMatch;
    });

    countText.classList.remove('hidden');
    countText.innerText = `"${query}" - এর জন্য ${filtered.length} টি পণ্য পাওয়া গেছে`;
    grid.innerHTML = "";

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-gray-200 p-6">
                <i class="fa-solid fa-magnifying-glass text-3xl text-gray-300 mb-2"></i>
                <p class="text-gray-600 font-bold text-sm">কোনো পণ্য খুঁজে পাওয়া যায়নি!</p>
                <p class="text-xs text-gray-400 mt-1">অন্য কোনো নাম দিয়ে সার্চ করে দেখুন।</p>
            </div>
        `;
        return;
    }

    filtered.forEach(p => {
        grid.innerHTML += `
            <div class="bg-white rounded-xl shadow-sm hover:shadow-md transition border overflow-hidden flex flex-col justify-between relative group">
                <button onclick="deleteProduct(${p.id}, event)" title="পণ্য ডিলিট করুন" class="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white w-7 h-7 rounded-full text-xs flex items-center justify-center shadow z-10">
                    <i class="fa-solid fa-trash"></i>
                </button>
                <div>
                    <div class="relative">
                        <img src="${p.img}" alt="${p.title}" class="w-full h-44 object-cover">
                        <span class="absolute top-2 left-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                            ${p.category}
                        </span>
                    </div>
                    <div class="p-3">
                        <h3 class="font-bold text-xs md:text-sm text-gray-800 line-clamp-2 h-9">${p.title}</h3>
                        <div class="flex items-center gap-2 mt-2">
                            <span class="font-extrabold text-sm md:text-base text-indigo-700">৳ ${p.price}</span>
                            ${p.oldPrice ? `<span class="text-gray-400 line-through text-xs">৳ ${p.oldPrice}</span>` : ''}
                        </div>
                    </div>
                </div>
                <div class="p-3 pt-0">
                    <button onclick="openCheckout(${p.id})" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 rounded-lg transition shadow">
                        অর্ডার করুন 🛍️
                    </button>
                </div>
            </div>
        `;
    });
}

function clearProductSearch() {
    const input = document.getElementById('productSearchInput');
    if (input) {
        input.value = "";
        handleProductSearch("");
    }
}

// ৪. প্রফেশনাল নোটিফিকেশন ঘণ্টা এবং ড্রপডাউন বক্স (কোনো অটো পপ-আপ নেই)
function setupProNotificationBell() {
    if (document.getElementById('navBellBtn')) return;

    const helplineBtn = document.querySelector('header a[href*="wa.me"]');
    if (!helplineBtn) return;

    // হেল্পলাইনের ডানে ঘণ্টা বাটন বসানো
    const bellBtn = document.createElement('button');
    bellBtn.id = 'navBellBtn';
    bellBtn.setAttribute('onclick', 'toggleProNotificationDropdown(event)');
    bellBtn.className = 'relative bg-indigo-50 hover:bg-indigo-100 text-indigo-700 w-8 h-8 rounded-lg border border-indigo-200 flex items-center justify-center transition shadow-sm';
    bellBtn.innerHTML = `
        <i class="fa-solid fa-bell text-sm bell-ring-subtle"></i>
        <span id="notifBadgeDot" class="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
            1
        </span>
    `;
    helplineBtn.insertAdjacentElement('afterend', bellBtn);

    // সর্বশেষ প্রোডাক্ট সংগ্রহ
    let storedProducts = [];
    try {
        storedProducts = JSON.parse(localStorage.getItem('dailyPickProducts')) || [];
    } catch (e) {
        storedProducts = [];
    }
    const latestProduct = storedProducts.length > 0 ? storedProducts[0] : null;

    // ড্রপডাউন মেনু বক্স তৈরি
    const dropdown = document.createElement('div');
    dropdown.id = 'proNotifDropdown';
    dropdown.className = 'notif-dropdown-anim hidden fixed top-14 right-4 z-50 w-[92%] max-w-[320px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 text-left';

    dropdown.innerHTML = `
        <div class="flex items-center justify-between border-b pb-2 mb-3">
            <div class="flex items-center gap-1.5 font-bold text-xs text-gray-800">
                <i class="fa-solid fa-bell text-indigo-600"></i>
                <span>নোটিফিকেশন ও বার্তা</span>
            </div>
            <button onclick="closeProNotificationDropdown()" class="text-gray-400 hover:text-gray-600 text-lg leading-none font-bold">
                &times;
            </button>
        </div>

        <div class="space-y-2.5 max-h-[300px] overflow-y-auto">
            ${latestProduct ? `
                <div class="bg-indigo-50/70 hover:bg-indigo-50 border border-indigo-100 p-2.5 rounded-xl transition flex gap-2.5 cursor-pointer" onclick="handleDropdownClick(${latestProduct.id})">
                    <img src="${latestProduct.img}" alt="${latestProduct.title}" class="w-12 h-12 object-cover rounded-lg border flex-shrink-0">
                    <div class="flex-1 min-w-0">
                        <span class="text-[9px] font-bold text-indigo-700 bg-white px-1.5 py-0.5 rounded border border-indigo-200">নতুন স্টক</span>
                        <h4 class="text-xs font-bold text-gray-900 truncate mt-1">${latestProduct.title}</h4>
                        <p class="text-xs font-black text-indigo-700">৳ ${latestProduct.price}</p>
                    </div>
                </div>
            ` : ''}

            <!-- স্থায়ী দরকারি বার্তা -->
            <div class="bg-gray-50 border border-gray-200/80 p-2.5 rounded-xl flex items-start gap-2">
                <i class="fa-solid fa-circle-info text-indigo-600 text-xs mt-0.5"></i>
                <div>
                    <h5 class="text-xs font-bold text-gray-800">নিরাপদ ডেলিভারি</h5>
                    <p class="text-[11px] text-gray-500 leading-tight mt-0.5">
                        প্রতারণা এড়াতে শুধু ডেলিভারি চার্জ অগ্রিম দিয়ে নিশ্চিন্তে ক্যাশ অন ডেলিভারিতে অর্ডার করুন।
                    </p>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(dropdown);

    // ড্রপডাউনের বাইরে চাপ দিলে বন্ধ হয়ে যাওয়া
    document.addEventListener('click', (e) => {
        const drop = document.getElementById('proNotifDropdown');
        const btn = document.getElementById('navBellBtn');
        if (drop && !drop.classList.contains('hidden') && !drop.contains(e.target) && !btn.contains(e.target)) {
            drop.classList.add('hidden');
        }
    });
}

// ঘণ্টা চাপলে ড্রপডাউন টগল হওয়া
function toggleProNotificationDropdown(e) {
    if (e) e.stopPropagation();
    const dropdown = document.getElementById('proNotifDropdown');
    const badge = document.getElementById('notifBadgeDot');

    if (dropdown) {
        dropdown.classList.toggle('hidden');
        // একবার দেখলে লাল ব্যাজ সরে যাবে
        if (badge) {
            badge.style.display = 'none';
        }
    }
}

function closeProNotificationDropdown() {
    const dropdown = document.getElementById('proNotifDropdown');
    if (dropdown) dropdown.classList.add('hidden');
}

// নোটিফিকেশনে ক্লিক করলে সরাসরি চেকআউটে নিয়ে যাওয়া
function handleDropdownClick(productId) {
    closeProNotificationDropdown();
    if (typeof openCheckout === 'function') {
        openCheckout(productId);
    }
}