/* ========================================================
   Daily Pick - Secure Admin Protection & PIN Login System
   (সম্পূর্ণ ফাইল: admin.js)
======================================================== */

// 👉 আপনার গোপন অ্যাডমিন পিন (এখানে আপনার পছন্দমতো ৪ সংখ্যার পিন দিতে পারেন)
const SECRET_ADMIN_PIN = "526611"; 

(function() {
    // ১. অ্যাডমিন স্টাইল ও সিকিউরিটি সিএসএস যুক্ত করা
    const adminSecurityStyle = `
    <style id="admin-security-style">
        /* যখন অ্যাডমিন লগইন থাকবে না তখন সব অ্যাডমিন বাটন লুকানো থাকবে */
        body:not(.admin-authenticated) header button[onclick*="openAdminModal"] {
            display: none !important;
        }
        body:not(.admin-authenticated) button[onclick*="deleteProduct"] {
            display: none !important;
        }
        body:not(.admin-authenticated) .custom-rating-badge .fa-pen {
            display: none !important;
        }
    </style>
    `;
    document.head.insertAdjacentHTML('beforeend', adminSecurityStyle);

    // ২. পেজ লোড হলে অ্যাডমিন অবস্থা চেক করা
    document.addEventListener('DOMContentLoaded', initAdminSecurity);
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initAdminSecurity();
    }

    function initAdminSecurity() {
        createAdminLoginModal();
        insertFooterAdminButton();
        checkAdminLoginState();
    }

    // ৩. বর্তমান অ্যাডমিন সেশন চেক করা
    function checkAdminLoginState() {
        const isAdmin = sessionStorage.getItem('dailyPickAdminLoggedIn') === 'true';
        if (isAdmin) {
            document.body.classList.add('admin-authenticated');
            showAdminFloatingBadge();
        } else {
            document.body.classList.remove('admin-authenticated');
            removeAdminFloatingBadge();
        }
    }

    // ৪. ফুটারের নিচে গোপন অ্যাডমিন বাটন বসানো
    function insertFooterAdminButton() {
        if (document.getElementById('footerAdminLockBtn')) return;

        const footerContainer = document.querySelector('footer > div');
        if (footerContainer) {
            const lockLink = document.createElement('div');
            lockLink.id = 'footerAdminLockBtn';
            lockLink.className = 'pt-3 mt-2 border-t border-gray-800';
            lockLink.innerHTML = `
                <button type="button" onclick="triggerAdminLoginPrompt()" class="text-[11px] text-gray-500 hover:text-indigo-400 transition flex items-center justify-center gap-1 mx-auto">
                    <i class="fa-solid fa-lock text-[10px]"></i> অ্যাডমিন প্যানেল
                </button>
            `;
            footerContainer.appendChild(lockLink);
        }
    }

    // ৫. অ্যাডমিন পাসওয়ার্ড/পিন ইনপুট মডাল
    function createAdminLoginModal() {
        if (document.getElementById('adminAuthModal')) return;

        const modal = document.createElement('div');
        modal.id = 'adminAuthModal';
        modal.className = 'fixed inset-0 bg-black/75 z-50 hidden flex items-center justify-center p-4 backdrop-blur-md';

        modal.innerHTML = `
            <div class="bg-white rounded-3xl max-w-xs w-full p-6 text-center shadow-2xl relative border">
                <button onclick="closeAdminAuthModal()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
                
                <div class="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto mb-3 text-xl shadow-inner">
                    <i class="fa-solid fa-user-shield"></i>
                </div>
                
                <h4 class="text-base font-black text-gray-900">অ্যাডমিন ভেরিফিকেশন</h4>
                <p class="text-xs text-gray-500 mt-1 mb-4">পণ্য যোগ ও ডিলিট করতে আপনার গোপন ৪ ডিজিটের পিন লিখুন</p>

                <form onsubmit="verifyAdminPinSubmit(event)" class="space-y-3">
                    <input type="password" id="inputAdminPin" maxlength="6" required placeholder="• • • •" class="w-full text-center text-lg tracking-widest font-black border-2 border-indigo-200 p-2.5 rounded-xl outline-none focus:border-indigo-600 bg-gray-50">
                    
                    <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition">
                        লগইন করুন 🔓
                    </button>
                </form>
            </div>
        `;

        document.body.appendChild(modal);
    }

    // ৬. অ্যাডমিন মোড অ্যাক্টিভ হলে স্ক্রিনের ওপরে ফ্লোটিং বার দেখানো
    function showAdminFloatingBadge() {
        if (document.getElementById('adminActiveBadge')) return;

        const badge = document.createElement('div');
        badge.id = 'adminActiveBadge';
        badge.className = 'fixed top-12 left-4 z-40 bg-indigo-900/95 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-lg border border-indigo-400 flex items-center gap-2 backdrop-blur-sm';
        badge.innerHTML = `
            <span class="w-2 h-2 rounded-full bg-green-400 animate-ping"></span>
            <span>অ্যাডমিন মোড সক্রিয়</span>
            <button onclick="adminLogout()" class="bg-red-600 hover:bg-red-700 text-white px-2 py-0.5 rounded text-[10px] ml-1">
                লগআউট
            </button>
        `;
        document.body.appendChild(badge);
    }

    function removeAdminFloatingBadge() {
        const badge = document.getElementById('adminActiveBadge');
        if (badge) badge.remove();
    }

    // ৭. গ্লোবাল ফাংশনসমূহ
    window.triggerAdminLoginPrompt = function() {
        const isAlreadyLoggedIn = sessionStorage.getItem('dailyPickAdminLoggedIn') === 'true';
        if (isAlreadyLoggedIn) {
            if (typeof openAdminModal === 'function') openAdminModal();
        } else {
            const modal = document.getElementById('adminAuthModal');
            if (modal) {
                modal.classList.remove('hidden');
                document.getElementById('inputAdminPin').value = "";
                document.getElementById('inputAdminPin').focus();
            }
        }
    };

    window.closeAdminAuthModal = function() {
        const modal = document.getElementById('adminAuthModal');
        if (modal) modal.classList.add('hidden');
    };

    window.verifyAdminPinSubmit = function(e) {
        e.preventDefault();
        const pinInput = document.getElementById('inputAdminPin').value.trim();

        if (pinInput === SECRET_ADMIN_PIN) {
            sessionStorage.setItem('dailyPickAdminLoggedIn', 'true');
            checkAdminLoginState();
            closeAdminAuthModal();
            alert("সফলভাবে অ্যাডমিন লগইন হয়েছে! 🎉 এখন আপনি পণ্য যোগ ও পরিচালনা করতে পারবেন।");
            if (typeof openAdminModal === 'function') {
                openAdminModal();
            }
        } else {
            alert("ভুল পিন কোড! শুধুমাত্র অ্যাডমিন প্রবেশ করতে পারবেন। ❌");
            document.getElementById('inputAdminPin').value = "";
        }
    };

    window.adminLogout = function() {
        sessionStorage.removeItem('dailyPickAdminLoggedIn');
        checkAdminLoginState();
        alert("অ্যাডমিন প্যানেল থেকে সফলভাবে লগআউট হয়েছেন।");
        window.location.reload();
    };

    // ৮. সরাসরি openAdminModal চাপলে ইন্টারসেপ্ট করা
    const originalOpenAdminModal = window.openAdminModal;
    window.openAdminModal = function() {
        const isLoggedIn = sessionStorage.getItem('dailyPickAdminLoggedIn') === 'true';
        if (!isLoggedIn) {
            window.triggerAdminLoginPrompt();
            return;
        }
        if (originalOpenAdminModal) originalOpenAdminModal();
    };

    // ৯. কোনো সাধারণ ব্যক্তি যাতে ডিলিট ফাংশন রান করতে না পারে
    const originalDeleteProduct = window.deleteProduct;
    window.deleteProduct = function(id, e) {
        const isLoggedIn = sessionStorage.getItem('dailyPickAdminLoggedIn') === 'true';
        if (!isLoggedIn) {
            alert("অননুমোদিত অ্যাক্সেস! শুধুমাত্র অ্যাডমিন পণ্য ডিলিট করতে পারেন।");
            return;
        }
        if (originalDeleteProduct) originalDeleteProduct(id, e);
    };

})();