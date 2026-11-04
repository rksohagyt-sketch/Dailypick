/* ========================================================
   Daily Pick - 100% Guaranteed Floating Social Buttons
   (ফাইল: feature.js)
======================================================== */

(function() {
    // ডুপ্লিকেট রোধ করা
    if (document.getElementById('dailyPickSocialButtons')) return;

    // সোশ্যাল মিডিয়া লিংক
    const links = {
        youtube: "https://www.youtube.com/@soDailypick",
        tiktok: "https://www.tiktok.com/@sodailypick",
        facebook: "https://www.facebook.com/share/19efKKoFqZ/"
    };

    // ফ্লোটিং বার তৈরি
    const bar = document.createElement('div');
    bar.id = 'dailyPickSocialButtons';
    
    // একদম ডানপাশে নিচে ফিক্সড স্টাইল (কোনো সিএসএস বা ফ্রেমওয়ার্কের ওপর নির্ভরশীল নয়)
    bar.style.cssText = `
        position: fixed !important;
        bottom: 25px !important;
        right: 15px !important;
        z-index: 999999 !important;
        display: flex !important;
        flex-direction: column !important;
        gap: 12px !important;
        align-items: center !important;
    `;

    bar.innerHTML = `
        <!-- ১. ইউটিউব বাটন -->
        <a href="${links.youtube}" target="_blank" rel="noopener noreferrer" style="
            width: 46px; 
            height: 46px; 
            border-radius: 50%; 
            background-color: #FF0000; 
            color: #ffffff; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-size: 20px; 
            box-shadow: 0 4px 12px rgba(255, 0, 0, 0.4); 
            text-decoration: none;
            transition: transform 0.2s;
        ">
            <i class="fa-brands fa-youtube"></i>
        </a>

        <!-- ২. টিকটক বাটন -->
        <a href="${links.tiktok}" target="_blank" rel="noopener noreferrer" style="
            width: 46px; 
            height: 46px; 
            border-radius: 50%; 
            background-color: #000000; 
            color: #ffffff; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-size: 19px; 
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4); 
            border: 1.5px solid #333333;
            text-decoration: none;
            transition: transform 0.2s;
        ">
            <i class="fa-brands fa-tiktok"></i>
        </a>

        <!-- ৩. ফেসবুক বাটন -->
        <a href="${links.facebook}" target="_blank" rel="noopener noreferrer" style="
            width: 46px; 
            height: 46px; 
            border-radius: 50%; 
            background-color: #1877F2; 
            color: #ffffff; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-size: 20px; 
            box-shadow: 0 4px 12px rgba(24, 119, 242, 0.4); 
            text-decoration: none;
            transition: transform 0.2s;
        ">
            <i class="fa-brands fa-facebook-f"></i>
        </a>
    `;

    // বডিতে যুক্ত করা
    function attachBar() {
        if (document.body) {
            document.body.appendChild(bar);
        } else {
            setTimeout(attachBar, 100);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attachBar);
    } else {
        attachBar();
    }
})();// হোমপেজের সব অর্ডার বাটনকে checkout.html পেজের সাথে লিংক করা
window.openCheckout = function(productId) {
    let products = [];
    try {
        products = JSON.parse(localStorage.getItem('dailyPickProducts')) || [];
    } catch(e) {}
    
    let item = products.find(p => p.id === productId);
    if (item) {
        localStorage.setItem('currentCheckoutProduct', JSON.stringify(item));
        window.location.href = "checkout.html?id=" + productId;
    }
};