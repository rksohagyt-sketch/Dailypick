// LocalStorage থেকে প্রোডাক্ট লোড (ডেমো প্রোডাক্ট বাদ দেওয়া হয়েছে)
let products = JSON.parse(localStorage.getItem('dailyPickProducts')) || [];
let selectedProduct = null;
let selectedVariant = "";
let uploadedImageBase64 = "";

// Image Preview from Local File/Gallery
function previewSelectedImage(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        
        // ছবি সাইজ অপটিমাইজ করে স্টোরেজে রাখার ব্যবস্থা
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const maxDim = 600; // ছবি হালকা রাখার জন্য ম্যাক্স সাইজ
                let width = img.width;
                let height = img.height;
                if (width > height) {
                    if (width > maxDim) {
                        height = Math.round((height * maxDim) / width);
                        width = maxDim;
                    }
                } else {
                    if (height > maxDim) {
                        width = Math.round((width * maxDim) / height);
                        height = maxDim;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                uploadedImageBase64 = canvas.toDataURL('image/jpeg', 0.7);
                document.getElementById('imagePreview').src = uploadedImageBase64;
                document.getElementById('imagePreviewContainer').classList.remove('hidden');
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// Render Products Grid
function renderProducts(filter = 'all') {
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    grid.innerHTML = "";

    const filtered = filter === 'all' ? products : products.filter(p => p.category === filter);

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-gray-300 p-6">
                <i class="fa-solid fa-box-open text-4xl text-gray-300 mb-2"></i>
                <p class="text-gray-500 font-semibold text-sm">বর্তমানে কোনো পণ্য যুক্ত করা নেই।</p>
                <p class="text-xs text-gray-400 mt-1">ওপরে "প্রোডাক্ট অ্যাড করুন" বাটনে ক্লিক করে আপনার গ্যালারি থেকে নতুন পণ্য যোগ করুন।</p>
            </div>
        `;
        return;
    }

    filtered.forEach(p => {
        grid.innerHTML += `
            <div class="bg-white rounded-xl shadow-sm hover:shadow-md transition border overflow-hidden flex flex-col justify-between relative group">
                <!-- Delete Button -->
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

// Render Hero Section (Today's Daily Pick)
function renderHeroSection() {
    const hero = document.getElementById('heroSection');
    if (!hero) return;

    // Daily pick হিসেবে সিলেক্ট করা প্রোডাক্ট খোঁজা, না পেলে প্রথম প্রোডাক্ট নেওয়া
    let dailyProduct = products.find(p => p.isDailyPick) || products[0];

    if (!dailyProduct) {
        hero.innerHTML = `
            <div class="bg-gradient-to-r from-indigo-900 to-gray-900 rounded-2xl p-6 text-white text-center shadow-lg">
                <span class="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">Daily Pick</span>
                <h2 class="text-xl font-bold mt-2">আপনার পছন্দের পণ্য শপ করতে স্বাগতম!</h2>
                <p class="text-xs text-gray-300 mt-1">প্রোডাক্ট অ্যাড করার সময় "Daily Pick" সিলেক্ট করলে তা এখানে বড় আকারে ডিসপ্লে হবে।</p>
            </div>
        `;
        return;
    }

    hero.innerHTML = `
        <div class="hero-card rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div class="space-y-3 md:w-1/2">
                <span class="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    🔥 আজকের সেরা ডিল (Daily Pick)
                </span>
                <h1 class="text-2xl md:text-3xl font-extrabold leading-snug">${dailyProduct.title}</h1>
                
                <div class="flex items-center gap-2 pt-1 text-sm font-semibold text-yellow-400">
                    <i class="fa-regular fa-clock"></i> অফার শেষ হতে বাকি: 
                    <span id="countdown" class="bg-black/40 px-2 py-0.5 rounded text-white tracking-widest font-mono">08:45:12</span>
                </div>

                <div class="flex items-baseline gap-3 pt-2">
                    <span class="text-3xl font-black text-yellow-400">৳ ${dailyProduct.price}</span>
                    ${dailyProduct.oldPrice ? `<span class="text-gray-400 line-through text-lg">৳ ${dailyProduct.oldPrice}</span>` : ''}
                </div>

                <button onclick="openCheckout(${dailyProduct.id})" class="w-full sm:w-auto bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-6 py-3 rounded-xl shadow-lg transition transform hover:-translate-y-0.5">
                    আজকের পিক অর্ডার করুন 🚀
                </button>
            </div>
            <div class="md:w-1/2 flex justify-center">
                <img src="${dailyProduct.img}" alt="${dailyProduct.title}" class="rounded-xl max-h-64 object-cover shadow-2xl border-2 border-indigo-500/30">
            </div>
        </div>
    `;
}

// Category Filter
function filterCategory(cat) {
    document.querySelectorAll('.cat-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`btn-${cat}`);
    if (activeBtn) activeBtn.classList.add('active');
    renderProducts(cat);
}

// Open Checkout Modal
function openCheckout(productId) {
    selectedProduct = products.find(p => p.id === productId);
    if (!selectedProduct) return;

    document.getElementById('modalProductImg').src = selectedProduct.img;
    document.getElementById('modalProductTitle').innerText = selectedProduct.title;
    document.getElementById('modalProductPrice').innerText = selectedProduct.price;
    document.getElementById('summaryProductPrice').innerText = selectedProduct.price;

    const variantSec = document.getElementById('variantSection');
    const variantOptions = document.getElementById('variantOptions');
    variantOptions.innerHTML = "";

    if (selectedProduct.variants && selectedProduct.variants.length > 0) {
        variantSec.classList.remove('hidden');
        selectedVariant = selectedProduct.variants[0];
        selectedProduct.variants.forEach((v, idx) => {
            variantOptions.innerHTML += `
                <button type="button" class="border px-3 py-1 rounded text-xs cursor-pointer ${idx === 0 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-50'}" onclick="selectVariant(this, '${v}')">
                    ${v}
                </button>
            `;
        });
    } else {
        variantSec.classList.add('hidden');
        selectedVariant = "Default";
    }

    updateSummary();
    document.getElementById('checkoutModal').classList.remove('hidden');
}

function selectVariant(element, val) {
    selectedVariant = val;
    const parent = element.parentElement;
    Array.from(parent.children).forEach(child => {
        child.className = "border px-3 py-1 rounded text-xs cursor-pointer bg-gray-50";
    });
    element.className = "border px-3 py-1 rounded text-xs cursor-pointer bg-indigo-600 text-white border-indigo-600";
}

function updateSummary() {
    if (!selectedProduct) return;
    const deliveryFee = parseInt(document.querySelector('input[name="deliveryArea"]:checked').value);
    document.getElementById('advDeliveryFee').innerText = deliveryFee;
    document.getElementById('summaryAdvance').innerText = deliveryFee;
    document.getElementById('summaryDue').innerText = selectedProduct.price;
}

function closeCheckoutModal() {
    document.getElementById('checkoutModal').classList.add('hidden');
}

// Submit Order -> WhatsApp
function handleOrderSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const address = document.getElementById('custAddress').value.trim();
    const deliveryFee = document.querySelector('input[name="deliveryArea"]:checked').value;
    const areaName = deliveryFee === "80" ? "ঢাকার ভেতরে" : "ঢাকার বাইরে";
    const payMethod = document.getElementById('payMethod').value;
    const senderNum = document.getElementById('senderNum').value.trim();
    const trxId = document.getElementById('trxId').value.trim();

    const message = 
`🛍️ *নতুন অর্ডার রিকোয়েস্ট - Daily Pick*
----------------------------------
📦 *পণ্য:* ${selectedProduct.title}
🏷️ *সাইজ/কালার:* ${selectedVariant}
💰 *পণ্যের মূল্য:* ৳${selectedProduct.price}

👤 *কাস্টমার তথ্য:*
• নাম: ${name}
• মোবাইল: ${phone}
• ঠিকানা: ${address}
• এরিয়া: ${areaName} (ডেলিভারি চার্জ: ৳${deliveryFee})

💳 *অগ্রিম পেমেন্ট (ডেলিভারি চার্জ):*
• মেথড: ${payMethod}
• প্রেরক নম্বর: ${senderNum}
• TrxID: ${trxId}
• পেইড ডেলিভারি ফি: ৳${deliveryFee}

💵 *ক্যাশ অন ডেলিভারিতে বাকি প্রাপ্য:* ৳${selectedProduct.price}
----------------------------------
অনুগ্রহ করে অর্ডারটি দ্রুত কনফার্ম করুন!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/8801321636400?text=${encodedMessage}`;

    window.open(whatsappURL, '_blank');
    closeCheckoutModal();
}

// Copy Payment Number
function copyNumber(num) {
    navigator.clipboard.writeText(num).then(() => {
        alert("পেমেন্ট নম্বর (" + num + ") কপি হয়েছে!");
    });
}

// Delete Product
function deleteProduct(id, e) {
    e.stopPropagation();
    if (confirm("আপনি কি এই প্রোডাক্টটি মুছে ফেলতে চান?")) {
        products = products.filter(p => p.id !== id);
        localStorage.setItem('dailyPickProducts', JSON.stringify(products));
        renderHeroSection();
        renderProducts();
    }
}

// Admin Panel Logic
function openAdminModal() {
    document.getElementById('adminModal').classList.remove('hidden');
}

function closeAdminModal() {
    document.getElementById('adminModal').classList.add('hidden');
    document.getElementById('imagePreviewContainer').classList.add('hidden');
    uploadedImageBase64 = "";
}

function handleProductAdd(e) {
    e.preventDefault();
    if (!uploadedImageBase64) {
        alert("অনুগ্রহ করে গ্যালারি থেকে একটি ছবি নির্বাচন করুন!");
        return;
    }

    const title = document.getElementById('adminTitle').value.trim();
    const category = document.getElementById('adminCategory').value;
    const price = parseInt(document.getElementById('adminPrice').value);
    const oldPrice = document.getElementById('adminOldPrice').value ? parseInt(document.getElementById('adminOldPrice').value) : null;
    const rawVariants = document.getElementById('adminVariants').value.trim();
    const isDailyPick = document.getElementById('adminIsDailyPick').checked;
    const variants = rawVariants ? rawVariants.split(',').map(s => s.trim()) : [];

    // যদি নতুন প্রোডাক্টটিকে Daily Pick বানানো হয়, বাকিগুলোর Daily Pick ফ্ল্যাগ সরানো হবে
    if (isDailyPick) {
        products.forEach(p => p.isDailyPick = false);
    }

    const newProduct = {
        id: Date.now(),
        title,
        category,
        price,
        oldPrice,
        img: uploadedImageBase64,
        variants,
        isDailyPick
    };

    products.unshift(newProduct);
    localStorage.setItem('dailyPickProducts', JSON.stringify(products));
    
    renderHeroSection();
    renderProducts();
    closeAdminModal();
    alert("আপনার নিজস্ব প্রোডাক্ট সফলভাবে যুক্ত হয়েছে! 🎉");
    e.target.reset();
}

// Initial Run
renderHeroSection();
renderProducts();

// Fake Timer
let time = 31512;
setInterval(() => {
    if (time > 0) time--;
    let hours = Math.floor(time / 3600);
    let mins = Math.floor((time % 3600) / 60);
    let secs = time % 60;
    const timerElem = document.getElementById('countdown');
    if (timerElem) {
        timerElem.innerText = `${String(hours).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
    }
}, 1000);