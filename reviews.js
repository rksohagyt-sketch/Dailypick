/* ========================================================
   Daily Pick - 100% Real Reviews & Custom Product Rating
   (ফাইল: reviews.js)
======================================================== */

// ১. কোনো ডামি বা মিথ্যা রিভিউ থাকবে না (একদম খালি থাকবে)
let customerReviews = JSON.parse(localStorage.getItem('dailyPickReviews')) || [];
let selectedStarRating = 5;

// পেজ লোড হলে চালু হওয়া
document.addEventListener('DOMContentLoaded', initHonestReviewSystem);
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initHonestReviewSystem();
}

function initHonestReviewSystem() {
    injectCustomRatingBadge();
    createReviewsSection();
    createReviewSubmitModal();
    checkAutoReviewUrl();
}

// ২. প্রতিটি প্রোডাক্টের ওপর রেটিং ব্যাজ এবং নিজে লিখে দেওয়ার বাটন (✏️)
function injectCustomRatingBadge() {
    const productCards = document.querySelectorAll('#productGrid > div');
    
    // লোকাল প্রোডাক্ট লোড
    let products = [];
    try {
        products = JSON.parse(localStorage.getItem('dailyPickProducts')) || [];
    } catch(e) {}

    productCards.forEach((card, index) => {
        if (card.querySelector('.custom-rating-badge')) return;

        const imgWrapper = card.querySelector('.relative');
        if (imgWrapper) {
            // প্রোডাক্টের আইডি বা ইনডেক্স দিয়ে নির্দিষ্ট রেটিং আনা
            const pId = products[index] ? products[index].id : index;
            const savedRating = localStorage.getItem(`product_rating_${pId}`) || "৫.০";

            const badge = document.createElement('div');
            badge.className = 'custom-rating-badge absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm text-yellow-400 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow cursor-pointer';
            badge.title = "রেটিং পরিবর্তন করতে ক্লিক করুন";
            badge.onclick = (e) => {
                e.stopPropagation();
                changeProductRating(pId, badge);
            };

            badge.innerHTML = `
                <i class="fa-solid fa-star text-[9px]"></i> 
                <span class="rating-text">${savedRating}</span>
                <i class="fa-solid fa-pen text-[8px] text-gray-300 ml-0.5 hover:text-white"></i>
            `;
            imgWrapper.appendChild(badge);
        }
    });
}

// ৩. আপনি নিজে রেটিং লিখে দেওয়ার ফাংশন
function changeProductRating(productId, badgeElement) {
    const currentVal = badgeElement.querySelector('.rating-text').innerText;
    const newRating = prompt("এই প্রোডাক্টের রেটিং কত দেখাতে চান? (যেমন: ৪.৮, ৪.৯, ৫.০):", currentVal);

    if (newRating !== null && newRating.trim() !== "") {
        const cleanRating = newRating.trim();
        localStorage.setItem(`product_rating_${productId}`, cleanRating);
        badgeElement.querySelector('.rating-text').innerText = cleanRating;
        alert(`রেটিং সফলভাবে "${cleanRating}" সেট করা হয়েছে! ⭐`);
    }
}

// ৪. কাস্টমার রিভিউ সেকশন (কোনো মিথ্যা রিভিউ নেই)
function createReviewsSection() {
    if (document.getElementById('customerReviewSection')) return;

    const targetElement = document.getElementById('socialVideoHub') || document.querySelector('footer');
    if (!targetElement) return;

    const reviewSection = document.createElement('section');
    reviewSection.id = 'customerReviewSection';
    reviewSection.className = 'max-w-6xl mx-auto px-4 py-8';

    reviewSection.innerHTML = `
        <div class="bg-white border border-gray-200/80 rounded-3xl p-6 md:p-8 shadow-sm">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5 mb-6">
                <div>
                    <span class="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full mb-2">
                        ⭐ আসল কাস্টমার সন্তুষ্টি
                    </span>
                    <h3 class="text-xl md:text-2xl font-black text-gray-900">
                        গ্রাহকদের বাস্তব অভিজ্ঞতা 💬
                    </h3>
                    <p class="text-xs text-gray-500 mt-1">পণ্য হাতে পাওয়ার পর সম্মানিত ক্রেতাদের দেওয়া সরাসরি রিভিউ</p>
                </div>
                <button onclick="openReviewModal()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2 self-start md:self-auto">
                    <i class="fa-solid fa-pen-to-square"></i> পণ্য হাতে পেয়েছেন? রিভিউ দিন
                </button>
            </div>

            <!-- রিভিউ তালিকা -->
            <div id="reviewCardsGrid" class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <!-- রিয়েল রিভিউ এখানে আসবে -->
            </div>
        </div>
    `;

    targetElement.parentNode.insertBefore(reviewSection, targetElement);
    renderHonestReviews();
}

// রিভিউ রেন্ডার
function renderHonestReviews() {
    const grid = document.getElementById('reviewCardsGrid');
    if (!grid) return;
    grid.innerHTML = "";

    // যদি কোনো রিভিউ না থাকে (শুরুর অবস্থায়)
    if (customerReviews.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full py-10 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300 p-6">
                <i class="fa-solid fa-shield-heart text-3xl text-indigo-400 mb-2"></i>
                <h4 class="font-bold text-sm text-gray-800">এখনো কোনো কাস্টমার রিভিউ যুক্ত হয়নি</h4>
                <p class="text-xs text-gray-500 mt-1">
                    আমরা কোনো মিথ্যা রিভিউ দেখাই না। পণ্য হাতে পাওয়ার পর আপনিই প্রথম সৎ রিভিউ দিয়ে আমাদের উৎসাহিত করুন!
                </p>
                <button onclick="openReviewModal()" class="mt-3 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition">
                    রিভিউ যোগ করুন ✍️
                </button>
            </div>
        `;
        return;
    }

    // আসল রিভিউগুলো কার্ড আকারে দেখানো
    customerReviews.forEach((r, idx) => {
        let starsHtml = "";
        for (let i = 1; i <= 5; i++) {
            starsHtml += `<i class="fa-solid fa-star ${i <= r.rating ? 'text-yellow-400' : 'text-gray-300'} text-xs"></i>`;
        }

        grid.innerHTML += `
            <div class="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col justify-between hover:shadow-sm transition relative">
                <!-- ডিলিট বাটন (যদি কোনো স্প্যাম রিভিউ আসে) -->
                <button onclick="deleteReviewItem(${r.id})" title="রিভিউ মুছে ফেলুন" class="absolute top-3 right-3 text-gray-300 hover:text-red-500 text-xs">
                    <i class="fa-solid fa-trash"></i>
                </button>
                <div>
                    <div class="flex items-center gap-1 mb-2">${starsHtml}</div>
                    <p class="text-xs text-gray-700 leading-relaxed mb-3 italic">
                        "${r.comment}"
                    </p>
                </div>
                <div class="border-t pt-2.5 flex items-center justify-between text-xs">
                    <div>
                        <h5 class="font-bold text-gray-900">${r.name}</h5>
                        <p class="text-[10px] text-gray-400">${r.city} • <span class="text-indigo-600 font-semibold">${r.product}</span></p>
                    </div>
                    <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                        ${r.name.charAt(0)}
                    </div>
                </div>
            </div>
        `;
    });
}

// ৫. রিভিউ দেওয়ার ফরম মডাল
function createReviewSubmitModal() {
    if (document.getElementById('reviewSubmitModal')) return;

    const modal = document.createElement('div');
    modal.id = 'reviewSubmitModal';
    modal.className = 'fixed inset-0 bg-black/60 z-50 hidden flex items-center justify-center p-4 backdrop-blur-sm';

    modal.innerHTML = `
        <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border">
            <button onclick="closeReviewModal()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
            
            <div class="text-center mb-4">
                <span class="w-10 h-10 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center mx-auto mb-2 text-lg">
                    <i class="fa-solid fa-star"></i>
                </span>
                <h4 class="text-base font-bold text-gray-900">আপনার সৎ মতামত দিন</h4>
                <p class="text-xs text-gray-500">পণ্যটি আপনার কেমন লেগেছে তা জানিয়ে অন্য ক্রেতাদের সাহায্য করুন</p>
            </div>

            <form onsubmit="handleReviewSubmit(event)" class="space-y-3">
                <div class="text-center py-2 bg-gray-50 rounded-xl border">
                    <p class="text-[11px] font-bold text-gray-500 mb-1">রেটিং নির্বাচন করুন:</p>
                    <div id="starPicker" class="flex justify-center gap-2 text-2xl text-yellow-400 cursor-pointer">
                        <i class="fa-solid fa-star" onclick="setReviewRating(1)"></i>
                        <i class="fa-solid fa-star" onclick="setReviewRating(2)"></i>
                        <i class="fa-solid fa-star" onclick="setReviewRating(3)"></i>
                        <i class="fa-solid fa-star" onclick="setReviewRating(4)"></i>
                        <i class="fa-solid fa-star" onclick="setReviewRating(5)"></i>
                    </div>
                </div>

                <div>
                    <label class="block text-xs font-bold text-gray-700 mb-1">আপনার নাম *</label>
                    <input type="text" id="revName" required placeholder="যেমন: মো: আরিফ" class="w-full text-xs border p-2.5 rounded-xl outline-none focus:border-indigo-600">
                </div>

                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="block text-xs font-bold text-gray-700 mb-1">জেলা / থানা *</label>
                        <input type="text" id="revCity" required placeholder="যেমন: মিরপুর, ঢাকা" class="w-full text-xs border p-2.5 rounded-xl outline-none focus:border-indigo-600">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-gray-700 mb-1">কোন পণ্যটি কিনেছেন? *</label>
                        <input type="text" id="revProduct" required placeholder="যেমন: টি-শার্ট / ঘড়ি" class="w-full text-xs border p-2.5 rounded-xl outline-none focus:border-indigo-600">
                    </div>
                </div>

                <div>
                    <label class="block text-xs font-bold text-gray-700 mb-1">আপনার অভিজ্ঞতা লিখুন *</label>
                    <textarea id="revComment" required rows="3" placeholder="পণ্যের কোয়ালিটি ও ডেলিভারি কেমন ছিল লিখুন..." class="w-full text-xs border p-2.5 rounded-xl outline-none focus:border-indigo-600"></textarea>
                </div>

                <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-xs shadow-md transition">
                    রিভিউ সাবমিট করুন 🚀
                </button>
            </form>
        </div>
    `;

    document.body.appendChild(modal);
}

function setReviewRating(star) {
    selectedStarRating = star;
    const stars = document.querySelectorAll('#starPicker i');
    stars.forEach((s, idx) => {
        s.className = idx < star ? "fa-solid fa-star text-yellow-400" : "fa-solid fa-star text-gray-300";
    });
}

function openReviewModal() {
    const modal = document.getElementById('reviewSubmitModal');
    if (modal) modal.classList.remove('hidden');
}

function closeReviewModal() {
    const modal = document.getElementById('reviewSubmitModal');
    if (modal) modal.classList.add('hidden');
}

function handleReviewSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('revName').value.trim();
    const city = document.getElementById('revCity').value.trim();
    const product = document.getElementById('revProduct').value.trim();
    const comment = document.getElementById('revComment').value.trim();

    const newRev = {
        id: Date.now(),
        name,
        city,
        product,
        rating: selectedStarRating,
        comment
    };

    customerReviews.unshift(newRev);
    localStorage.setItem('dailyPickReviews', JSON.stringify(customerReviews));

    renderHonestReviews();
    closeReviewModal();
    alert("ধন্যবাদ! আপনার রিভিউটি সফলভাবে সাইটে যুক্ত হয়েছে! ⭐");
    e.target.reset();
    setReviewRating(5);
}

// রিভিউ ডিলিট করার সুবিধা
function deleteReviewItem(id) {
    if (confirm("আপনি কি নিশ্চিত এই রিভিউটি মুছে ফেলতে চান?")) {
        customerReviews = customerReviews.filter(r => r.id !== id);
        localStorage.setItem('dailyPickReviews', JSON.stringify(customerReviews));
        renderHonestReviews();
    }
}

function checkAutoReviewUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('review') === 'true') {
        setTimeout(openReviewModal, 800);
    }
}