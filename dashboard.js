/* ========================================================
   Daily Pick - Admin Redirect to dashboard.html & Visitors
   (সম্পূর্ণ ফাইল: dashboard.js)
======================================================== */

(function() {
    // ১. ভিজিটর গণনা
    if (!sessionStorage.getItem('dailyPickSessionVisited')) {
        sessionStorage.setItem('dailyPickSessionVisited', 'true');
        let visitors = parseInt(localStorage.getItem('dailyPickVisitorCount') || "0");
        visitors += 1;
        localStorage.setItem('dailyPickVisitorCount', visitors.toString());
    }

    // ২. হোমপেজে অ্যাডমিন বাটন তৈরি (সরাসরি dashboard.html-এ নিয়ে যাবে)
    function setupAdminDashboardRedirect() {
        const isAdmin = sessionStorage.getItem('dailyPickAdminLoggedIn') === 'true';
        const existingBadge = document.getElementById('adminActiveBadge');
        if (existingBadge) existingBadge.style.display = 'none';

        if (!isAdmin) {
            const currentBtn = document.getElementById('unifiedAdminButton');
            if (currentBtn) currentBtn.remove();
            return;
        }

        if (document.getElementById('unifiedAdminButton')) return;

        const unifiedBtn = document.createElement('div');
        unifiedBtn.id = 'unifiedAdminButton';
        unifiedBtn.className = 'fixed top-12 left-3 z-40 flex items-center bg-gray-900/95 text-white rounded-full shadow-2xl border border-indigo-500/60 backdrop-blur-md p-1 pl-3 text-xs font-bold';

        unifiedBtn.innerHTML = `
            <span class="w-2 h-2 rounded-full bg-green-400 animate-ping mr-1"></span>
            
            <!-- আলাদা dashboard.html পেজে নিয়ে যাওয়ার বাটন -->
            <a href="dashboard.html" class="hover:text-yellow-400 flex items-center gap-1.5 transition pr-2 text-xs">
                <i class="fa-solid fa-chart-line text-yellow-400"></i>
                <span>ড্যাশবোর্ড পেজ</span>
            </a>

            <span class="text-gray-600 font-normal">|</span>

            <button onclick="adminLogout()" title="লগআউট" class="hover:text-red-400 text-gray-300 transition pl-2 pr-2.5 flex items-center gap-1 text-xs">
                <i class="fa-solid fa-right-from-bracket text-red-400"></i>
                <span>লগআউট</span>
            </button>
        `;

        document.body.appendChild(unifiedBtn);
    }
    setInterval(setupAdminDashboardRedirect, 800);

    // গ্লোবাল ড্যাশবোর্ড ওপেন
    window.openSalesDashboard = function() {
        window.location.href = "dashboard.html";
    };
})();