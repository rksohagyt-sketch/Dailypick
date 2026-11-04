/* ========================================================
   Daily Pick - Real-Time Offer Timer & Auto-Banner Expiry
   (সম্পূর্ণ ফাইল: timer.js)
======================================================== */

(function() {
    // ১. আগের পুরোনো ডামি টাইমার বন্ধ করা
    let highestId = window.setInterval(() => {}, 0);
    while (highestId--) {
        window.clearInterval(highestId);
    }

    // অফারের ডিফল্ট সময়কাল: ২৪ ঘণ্টা (মিলিসেকেন্ডে)
    const OFFER_DURATION = 24 * 60 * 60 * 1000; 

    // ২. লোকাল স্টোরেজ থেকে আসল শেষ সময় (Timestamp) সংগ্রহ
    function getOfferEndTime() {
        let savedEndTime = localStorage.getItem('dailyPickTimerEnd');
        if (!savedEndTime) {
            // প্রথমবার চালু হলে বর্তমান সময় থেকে ২৪ ঘণ্টা পরের সময় নির্ধারণ
            let newEndTime = Date.now() + OFFER_DURATION;
            localStorage.setItem('dailyPickTimerEnd', newEndTime);
            return newEndTime;
        }
        return parseInt(savedEndTime);
    }

    // ৩. অফার শেষ হয়ে গেলে ব্যানার পরিবর্তন কিন্তু প্রোডাক্ট তালিকায় রাখা
    function handleOfferExpired() {
        let products = [];
        try {
            products = JSON.parse(localStorage.getItem('dailyPickProducts')) || [];
        } catch(e) { products = []; }

        // Daily Pick ফ্ল্যাগ সরানো কিন্তু প্রোডাক্টটি লিস্টেই থাকবে
        let updated = false;
        products.forEach(p => {
            if (p.isDailyPick) {
                p.isDailyPick = false;
                updated = true;
            }
        });

        if (updated) {
            localStorage.setItem('dailyPickProducts', JSON.stringify(products));
        }

        // হিরো ব্যানার পরিবর্তন
        const hero = document.getElementById('heroSection');
        if (hero) {
            hero.innerHTML = `
                <div class="bg-gradient-to-r from-gray-900 via-indigo-950 to-gray-900 rounded-3xl p-6 md:p-8 text-white text-center shadow-xl border border-gray-800">
                    <span class="inline-flex items-center gap-1.5 bg-red-500/20 text-red-400 text-xs font-bold px-3 py-1 rounded-full border border-red-500/30 mb-2">
                        ⌛ অফার সমাপ্ত
                    </span>
                    <h2 class="text-xl md:text-2xl font-black mt-1">আজকের স্পেশাল ডিলের সময় শেষ হয়েছে!</h2>
                    <p class="text-xs md:text-sm text-gray-400 mt-1.5 max-w-md mx-auto">
                        পরবর্তী ধামাকা অফার খুব শীঘ্রই আসছে। আপনি নিচের তালিকা থেকে আপনার পছন্দের পণ্যগুলো স্বাভাবিক মূল্যে অর্ডার করতে পারেন।
                    </p>
                    <div class="mt-4 flex justify-center gap-2">
                        <button onclick="document.getElementById('productGrid').scrollIntoView({behavior: 'smooth'})" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow transition">
                            সব পণ্য দেখুন 🛍️
                        </button>
                    </div>
                </div>
            `;
        }

        // প্রোডাক্ট লিস্ট আপডেট করা (পণ্য ঠিকই লিস্টে থাকবে)
        if (typeof renderProducts === 'function') {
            renderProducts();
        }
    }

    // ৪. প্রতি সেকেন্ডে আসল সময়ের হিসাব ও টাইমার আপডেট
    function updateRealCountdown() {
        const endTime = getOfferEndTime();
        const now = Date.now();
        const remaining = endTime - now;

        const countdownElem = document.getElementById('countdown');

        // অফারের সময় শেষ হয়ে গেলে
        if (remaining <= 0) {
            if (countdownElem) {
                countdownElem.innerText = "00:00:00";
            }
            handleOfferExpired();
            return;
        }

        // ঘণ্টা, মিনিট ও সেকেন্ড নিখুঁতভাবে বের করা
        let hours = Math.floor(remaining / (1000 * 60 * 60));
        let mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        let secs = Math.floor((remaining % (1000 * 60)) / 1000);

        const formatted = 
            `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

        if (countdownElem) {
            countdownElem.innerText = formatted;
        }
    }

    // ৫. অ্যাডমিন যখনই কোনো নতুন Daily Pick সেট করবে, টাইমার নতুন করে ২৪ ঘণ্টা শুরু হবে
    const originalSave = window.saveNewProduct;
    if (typeof originalSave === 'function') {
        window.saveNewProduct = function() {
            const isDaily = document.getElementById('adminIsDailyPick')?.checked;
            if (isDaily) {
                // নতুন অফারের জন্য আবার নতুন ২৪ ঘণ্টা সেট
                localStorage.setItem('dailyPickTimerEnd', Date.now() + OFFER_DURATION);
            }
            originalSave();
        };
    }

    // পেজ লোড হলে প্রতি ১ সেকেন্ড পরপর টাইমার রান করা
    setInterval(updateRealCountdown, 1000);
    updateRealCountdown();

})();