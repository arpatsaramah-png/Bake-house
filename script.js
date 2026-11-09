/* =====================================================
   BAKE HOUSE - JAVASCRIPT & SUPABASE INTEGRATION
   สำหรับ: arpatsara.mah@tsn.thai-tech.ac.th
===================================================== */

/* ================= DEFAULT PRODUCT DATA (FALLBACK) ================= */
let products = [
    {
        id: 1,
        name: "Butter Croissant",
        category: "Croissant",
        price: 65,
        image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=85",
        description: "ครัวซองต์เนยสด หอมกรอบนอก นุ่มด้านใน ผลิตด้วยเนยฝรั่งเศสแท้",
        rating: 5,
        best: true
    },
    {
        id: 2,
        name: "Milk Bread",
        category: "Bread",
        price: 55,
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=85",
        description: "ขนมปังนมสด เนื้อนุ่มฟู หอมกลิ่นนมฮอกไกโด",
        rating: 5,
        best: true
    },
    {
        id: 3,
        name: "Chocolate Cake",
        category: "Cake",
        price: 350,
        image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=85",
        description: "เค้กช็อกโกแลตเนื้อนุ่ม รสชาติเข้มข้น ดาร์กช็อกโกแลตแท้",
        rating: 5,
        best: true
    },
    {
        id: 4,
        name: "Chocolate Cookie",
        category: "Cookie",
        price: 45,
        image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=85",
        description: "คุกกี้ช็อกโกแลตชิป หอมเนยและช็อกโกแลต กรอบนอกนุ่มใน",
        rating: 5,
        best: true
    },
    {
        id: 5,
        name: "Chocolate Croissant",
        category: "Croissant",
        price: 75,
        image: "https://images.unsplash.com/photo-1623334044303-241021148842?auto=format&fit=crop&w=800&q=85",
        description: "ครัวซองต์สอดไส้ช็อกโกแลตเข้มข้น หอมละมุน",
        rating: 5
    },
    {
        id: 6,
        name: "Almond Croissant",
        category: "Croissant",
        price: 85,
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=85",
        description: "ครัวซองต์อัลมอนด์กรอบ หอมมัน โรยอัลมอนด์สไลซ์แน่นๆ",
        rating: 5
    },
    {
        id: 7,
        name: "Strawberry Cake",
        category: "Cake",
        price: 380,
        image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=85",
        description: "เค้กสตรอว์เบอร์รีครีมสด หวานละมุน สตรอว์เบอร์รีสดลูกโต",
        rating: 5
    },
    {
        id: 8,
        name: "Vanilla Cake",
        category: "Cake",
        price: 320,
        image: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=800&q=85",
        description: "เค้กวานิลลาหอมละมุน กลิ่นมาดากัสการ์วานิลลาแท้",
        rating: 5
    },
    {
        id: 9,
        name: "Birthday Cake",
        category: "Cake",
        price: 450,
        image: "https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?auto=format&fit=crop&w=800&q=85",
        description: "เค้กวันเกิดดีไซน์สวยสำหรับโอกาสพิเศษ",
        rating: 5
    },
    {
        id: 10,
        name: "Butter Cookie",
        category: "Cookie",
        price: 40,
        image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=85",
        description: "คุกกี้เนยสด หอมกรอบ ละลายในปาก",
        rating: 5
    },
    {
        id: 11,
        name: "Matcha Cookie",
        category: "Cookie",
        price: 50,
        image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=85",
        description: "คุกกี้ชาเขียวมัทฉะอุจิแท้ หอมกลิ่นชาเขียวเข้มข้น",
        rating: 5
    },
    {
        id: 12,
        name: "Brownie",
        category: "Bakery",
        price: 55,
        image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476e?auto=format&fit=crop&w=800&q=85",
        description: "บราวนี่ช็อกโกแลตฟัดจ์ เนื้อหนึบเข้มข้น ดาร์กช็อก 70%",
        rating: 5
    },
    {
        id: 13,
        name: "Muffin",
        category: "Bakery",
        price: 45,
        image: "https://images.unsplash.com/photo-1558304970-abd589baebe5?auto=format&fit=crop&w=800&q=85",
        description: "มัฟฟินบลูเบอร์รีเนื้อนุ่ม หอมอบใหม่จากเตา",
        rating: 5
    },
    {
        id: 14,
        name: "Danish",
        category: "Bakery",
        price: 65,
        image: "https://images.unsplash.com/photo-1623334044303-241021148842?auto=format&fit=crop&w=800&q=85",
        description: "เดนิชเพสตรี้ผลไม้ แป้งกรอบนอกนุ่มใน คัสตาร์ดหอมหวาน",
        rating: 5
    },
    {
        id: 15,
        name: "Macaron",
        category: "Bakery",
        price: 60,
        image: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&w=800&q=85",
        description: "มาการองฝรั่งเศสหลากหลายรสชาติ สีสันสวยงาม ไส้แน่น",
        rating: 5
    },
    {
        id: 16,
        name: "Chocolate Bread",
        category: "Bread",
        price: 60,
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=85",
        description: "ขนมปังช็อกโกแลตนุ่มหนึบ สอดไส้ลาวาเข้มข้น",
        rating: 5
    },
    {
        id: 17,
        name: "Cream Bread",
        category: "Bread",
        price: 60,
        image: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=800&q=85",
        description: "ขนมปังไส้ครีมคัสตาร์ด เนื้อนุ่ม ไส้ครีมหอมละมุน",
        rating: 5
    }
];

/* ================= CART & DISCOUNT STATE ================= */
let cart = JSON.parse(localStorage.getItem("bake_house_cart") || "[]");
let appliedDiscount = 0;
let appliedCouponCode = "";
let uploadedSlipBase64 = "";

/* ================= INITIAL LOAD ================= */
document.addEventListener("DOMContentLoaded", async function () {
    if (typeof loadSystemConfig === "function") {
        await loadSystemConfig();
    }

    // โหลดสินค้าจาก Supabase DB (หากเชื่อมต่อแล้ว)
    if (typeof getDbProducts === "function") {
        const dbProducts = await getDbProducts();
        if (dbProducts && dbProducts.length > 0) {
            products = dbProducts;
            console.log(`📦 Loaded ${products.length} products from Supabase DB`);
        }
    }

    renderBestProducts();
    renderProducts();
    updateCart();
    checkDatabaseStatusBadge();
});

/* ================= DATABASE STATUS BADGE ================= */
function checkDatabaseStatusBadge() {
    const badge = document.getElementById("dbStatusBadge");
    if (!badge) return;

    if (typeof isSupabaseConfigured === "function" && isSupabaseConfigured()) {
        badge.innerHTML = `<span class="db-dot"></span> Supabase Connected`;
        badge.title = "เชื่อมต่อ Supabase Database สำเร็จ (ผ่าน Vercel Cloud Config)";
    } else {
        badge.innerHTML = `<span class="db-dot warning"></span> Demo Mode (Local)`;
        badge.title = "ยังไม่ได้ตั้งค่า Vercel Environment Variables (ทำงานผ่าน Local Demo Mode)";
    }
}

/* ================= PRODUCT CARD ================= */
function createProductCard(product) {
    return `
        <div class="product-card" data-id="${product.id}">
            <div class="product-image">
                ${product.best ? `<span class="product-badge">BEST SELLER</span>` : ""}
                <img
                    src="${product.image}"
                    alt="${product.name}"
                    loading="lazy"
                >
            </div>
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3>${product.name}</h3>
                <p class="product-description">${product.description || ""}</p>
                <div class="product-bottom">
                    <span class="price">฿${product.price}</span>
                    <button class="add-btn" onclick="addToCart(${product.id}); event.stopPropagation();">
                        + Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `;
}

/* ================= BEST PRODUCTS ================= */
function renderBestProducts() {
    const container = document.getElementById("bestProducts");
    if (!container) return;
    const bestProducts = products.filter(product => product.best);
    container.innerHTML = bestProducts.map(createProductCard).join("");
}

/* ================= ALL PRODUCTS ================= */
function renderProducts(list = products) {
    const container = document.getElementById("productGrid");
    if (!container) return;

    if (list.length === 0) {
        container.innerHTML = `
            <p style="grid-column:1/-1; text-align:center; padding:50px; color:#8A7A72;">
                🔍 ไม่พบสินค้าที่ค้นหา
            </p>
        `;
        return;
    }

    container.innerHTML = list.map(createProductCard).join("");
}

/* ================= FILTER ================= */
function filterProducts(category, button) {
    document.querySelectorAll(".category-btn").forEach(btn => btn.classList.remove("active"));
    if (button) button.classList.add("active");

    const searchInput = document.getElementById("searchInput");
    if (searchInput) searchInput.value = "";

    if (category === "All") {
        renderProducts(products);
    } else {
        const filtered = products.filter(product => product.category === category);
        renderProducts(filtered);
    }
}

/* ================= SEARCH ================= */
function searchProducts() {
    const searchInput = document.getElementById("searchInput");
    if (!searchInput) return;

    const keyword = searchInput.value.toLowerCase().trim();
    const result = products.filter(product =>
        product.name.toLowerCase().includes(keyword) ||
        product.category.toLowerCase().includes(keyword) ||
        (product.description && product.description.toLowerCase().includes(keyword))
    );
    renderProducts(result);
}

function focusSearch() {
    const shop = document.getElementById("shop");
    if (shop) shop.scrollIntoView({ behavior: "smooth" });

    setTimeout(() => {
        const searchInput = document.getElementById("searchInput");
        if (searchInput) searchInput.focus();
    }, 600);
}

/* ================= ADD TO CART ================= */
function addToCart(productId, quantity = 1) {
    const product = products.find(item => item.id === productId);
    if (!product) return;

    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: Number(product.price),
            image: product.image,
            category: product.category,
            quantity: quantity
        });
    }

    saveCartState();
    updateCart();
    showToast(`🥐 ${product.name} เพิ่มลงตะกร้าแล้ว!`);
}

function saveCartState() {
    localStorage.setItem("bake_house_cart", JSON.stringify(cart));
}

/* ================= UPDATE CART BADGE ================= */
function updateCart() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountEl = document.getElementById("cartCount");
    if (cartCountEl) {
        cartCountEl.textContent = count;
    }
}

/* ================= OPEN CART ================= */
function openCart() {
    renderCart();
    const modal = document.getElementById("cartModal");
    if (modal) modal.classList.add("show");
}

/* ================= RENDER CART ================= */
function renderCart() {
    const container = document.getElementById("cartItems");
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:40px 10px; color:#8A7A72;">
                <div style="font-size:50px;">🛒</div>
                <p style="margin-top:10px;">ยังไม่มีสินค้าในตะกร้า</p>
                <button class="btn outline-btn" style="margin-top:15px; padding:6px 18px; font-size:13px;" onclick="closeModal('cartModal')">
                    เลือกซื้อเบเกอรี่
                </button>
            </div>
        `;
        document.getElementById("subtotal").textContent = "฿0";
        document.getElementById("shipping").textContent = "฿0";
        document.getElementById("total").textContent = "฿0";
        const discountRow = document.getElementById("discountRow");
        if (discountRow) discountRow.style.display = "none";
        return;
    }

    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}">
            <div>
                <h4>${item.name}</h4>
                <small>฿${item.price} / ชิ้น</small>
                <div class="cart-quantity">
                    <button onclick="changeQuantity(${item.id}, -1)">−</button>
                    <span>${item.quantity}</span>
                    <button onclick="changeQuantity(${item.id}, 1)">+</button>
                </div>
            </div>
            <div>
                <strong>฿${item.price * item.quantity}</strong>
                <br>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">ลบ</button>
            </div>
        </div>
    `).join("");

    calculateTotal();
}

/* ================= CHANGE QUANTITY ================= */
function changeQuantity(productId, amount) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;

    item.quantity += amount;
    if (item.quantity <= 0) {
        cart = cart.filter(item => item.id !== productId);
    }

    saveCartState();
    updateCart();
    renderCart();
}

/* ================= REMOVE FROM CART ================= */
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCartState();
    updateCart();
    renderCart();
}

/* ================= CALCULATE TOTAL & COUPON ================= */
function calculateTotal() {
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = subtotal > 0 ? 40 : 0;
    const finalTotal = Math.max(0, subtotal + shipping - appliedDiscount);

    document.getElementById("subtotal").textContent = `฿${subtotal}`;
    document.getElementById("shipping").textContent = `฿${shipping}`;
    document.getElementById("total").textContent = `฿${finalTotal}`;

    // แสดงส่วนลด (ถ้ามี)
    const discountRow = document.getElementById("discountRow");
    const discountAmountEl = document.getElementById("discountAmount");
    if (discountRow && discountAmountEl) {
        if (appliedDiscount > 0) {
            discountRow.style.display = "flex";
            discountAmountEl.textContent = `-฿${appliedDiscount}`;
        } else {
            discountRow.style.display = "none";
        }
    }
}

/* ================= APPLY COUPON ================= */
function applyCoupon() {
    const input = document.getElementById("couponInput");
    if (!input) return;

    const code = input.value.trim().toUpperCase();
    if (!code) {
        showToast("กรุณากรอกโค้ดส่วนลด");
        return;
    }

    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    if (subtotal === 0) {
        showToast("ไม่มีสินค้าในตะกร้า");
        return;
    }

    // ตรวจสอบโค้ดส่วนลด
    if (code === "WELCOME10") {
        appliedDiscount = Math.round(subtotal * 0.10);
        appliedCouponCode = code;
        showToast(`🎉 ใช้โค้ด ${code} สำเร็จ! ลด 10% (-฿${appliedDiscount})`);
    } else if (code === "BAKE20") {
        if (subtotal < 300) {
            showToast("⚠️ โค้ด BAKE20 ใช้ได้เมื่อสั่งซื้อครบ ฿300 ขึ้นไป");
            return;
        }
        appliedDiscount = Math.round(subtotal * 0.20);
        appliedCouponCode = code;
        showToast(`🎉 ใช้โค้ด ${code} สำเร็จ! ลด 20% (-฿${appliedDiscount})`);
    } else if (code === "DISCOUNT50") {
        if (subtotal < 250) {
            showToast("⚠️ โค้ด DISCOUNT50 ใช้ได้เมื่อสั่งซื้อครบ ฿250 ขึ้นไป");
            return;
        }
        appliedDiscount = 50;
        appliedCouponCode = code;
        showToast(`🎉 ใช้โค้ด ${code} สำเร็จ! ลด ฿50`);
    } else {
        showToast("❌ โค้ดส่วนลดไม่ถูกต้องหรือหมดอายุ");
        return;
    }

    calculateTotal();
}

/* ================= CHECKOUT ================= */
function openCheckout() {
    if (cart.length === 0) {
        showToast("กรุณาเพิ่มสินค้าลงตะกร้าก่อน");
        return;
    }

    closeModal("cartModal");

    const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = 40;
    const finalTotal = Math.max(0, subtotal + shipping - appliedDiscount);

    document.getElementById("checkoutItems").textContent = itemCount;
    document.getElementById("checkoutTotal").textContent = `฿${finalTotal}`;

    // ตั้งค่าข้อมูลธนาคาร / PromptPay ในหน้าสั่งซื้อ
    updatePaymentDisplay();

    const checkoutModal = document.getElementById("checkoutModal");
    if (checkoutModal) checkoutModal.classList.add("show");
}

/* ================= PAYMENT METHOD TOGGLE ================= */
function selectPaymentMethod(method) {
    document.querySelectorAll(".payment-card").forEach(c => c.classList.remove("active"));
    const selectedRadio = document.querySelector(`input[name="payment"][value="${method}"]`);
    if (selectedRadio) {
        selectedRadio.checked = true;
        const parentCard = selectedRadio.closest(".payment-card");
        if (parentCard) parentCard.classList.add("active");
    }

    const promptpayBox = document.getElementById("promptpayDetails");
    const transferBox = document.getElementById("transferDetails");
    const codBox = document.getElementById("codDetails");

    if (promptpayBox) promptpayBox.style.display = method === "promptpay" ? "block" : "none";
    if (transferBox) transferBox.style.display = method === "transfer" ? "block" : "none";
    if (codBox) codBox.style.display = method === "cod" ? "block" : "none";
}

function updatePaymentDisplay() {
    const config = typeof BAKE_HOUSE_CONFIG !== "undefined" ? BAKE_HOUSE_CONFIG : {};
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const total = Math.max(0, subtotal + 40 - appliedDiscount);

    // PromptPay QR image (ผ่าน PromptPay QR API Generator)
    const promptpayImg = document.getElementById("promptpayQrImg");
    if (promptpayImg && config.promptPayNumber) {
        // ใช้ PromptPay QR generator สาธารณะ
        promptpayImg.src = `https://promptpay.io/${config.promptPayNumber}/${total}.png`;
    }

    const ppNumberEl = document.getElementById("promptpayNumberText");
    if (ppNumberEl) ppNumberEl.textContent = config.promptPayNumber || "0812345678";

    const bankInfoEl = document.getElementById("bankInfoText");
    if (bankInfoEl) {
        bankInfoEl.innerHTML = `<strong>${config.bankName || "ธนาคารกสิกรไทย"}</strong><br>เลขบัญชี: <b>${config.bankAccount || "123-4-56789-0"}</b><br>ชื่อบัญชี: ${config.accountName || "BAKE HOUSE"}`;
    }
}

/* ================= SLIP IMAGE UPLOAD ================= */
function handleSlipUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
        showToast("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        uploadedSlipBase64 = e.target.result;
        const preview = document.getElementById("slipPreview");
        if (preview) {
            preview.src = uploadedSlipBase64;
            preview.style.display = "block";
        }
        showToast("แนบสลิปเรียบร้อยแล้ว ✓");
    };
    reader.readAsDataURL(file);
}

/* ================= PLACE ORDER (SAVE TO SUPABASE) ================= */
async function placeOrder(event) {
    event.preventDefault();

    const name = document.getElementById("customerName").value.trim();
    const phone = document.getElementById("customerPhone").value.trim();
    const address = document.getElementById("customerAddress").value.trim();
    const province = document.getElementById("customerProvince") ? document.getElementById("customerProvince").value.trim() : "";
    const postalCode = document.getElementById("customerPostal") ? document.getElementById("customerPostal").value.trim() : "";
    const email = document.getElementById("customerEmail") ? document.getElementById("customerEmail").value.trim() : "";
    const notes = document.getElementById("orderNotes") ? document.getElementById("orderNotes").value.trim() : "";

    const paymentMethodEl = document.querySelector('input[name="payment"]:checked');
    const paymentMethod = paymentMethodEl ? paymentMethodEl.value : "transfer";

    if (!name || !phone || !address) {
        showToast("กรุณากรอกข้อมูลชื่อ เบอร์โทร และที่อยู่จัดส่งให้ครบถ้วน");
        return;
    }

    // คำนวณยอดเงิน
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shippingFee = 40;
    const totalAmount = Math.max(0, subtotal + shippingFee - appliedDiscount);

    // สร้างรหัสคำสั่งซื้อ เช่น BH261108-9842
    const now = new Date();
    const datePart = now.getFullYear().toString().slice(-2) +
                     String(now.getMonth() + 1).padStart(2, "0") +
                     String(now.getDate()).padStart(2, "0");
    const randPart = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `BH${datePart}-${randPart}`;

    const orderData = {
        orderNumber: orderNumber,
        name: name,
        phone: phone,
        email: email,
        address: address,
        province: province,
        postalCode: postalCode,
        items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
        subtotal: subtotal,
        shippingFee: shippingFee,
        discount: appliedDiscount,
        couponCode: appliedCouponCode,
        totalAmount: totalAmount,
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod === "cod" ? "pending" : (uploadedSlipBase64 ? "paid" : "pending"),
        orderStatus: "pending",
        slipUrl: uploadedSlipBase64 ? uploadedSlipBase64 : "",
        notes: notes
    };

    const submitBtn = event.target.querySelector("button[type='submit']") || event.target.querySelector(".checkout-btn");
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "⏳ กำลังบันทึกคำสั่งซื้อ...";
    }

    try {
        // บันทึกลง Supabase Database & ซิงก์ Google Sheets
        if (typeof saveDbOrder === "function") {
            await saveDbOrder(orderData);
        }

        // แสดงผลหน้าสำเร็จ
        document.getElementById("orderNumber").textContent = orderNumber;
        const successTotal = document.getElementById("successTotalAmount");
        if (successTotal) successTotal.textContent = `฿${totalAmount}`;

        closeModal("checkoutModal");
        document.getElementById("successModal").classList.add("show");

        // ล้างตะกร้าและสถานะ
        cart = [];
        appliedDiscount = 0;
        appliedCouponCode = "";
        uploadedSlipBase64 = "";
        saveCartState();
        updateCart();
        event.target.reset();

        showToast("✨ สั่งซื้อสำเร็จ! บันทึกข้อมูลลงระบบเรียบร้อย");
    } catch (err) {
        console.error("Order error:", err);
        showToast("เกิดข้อผิดพลาดในการบันทึกคำสั่งซื้อ กรุณาลองใหม่อีกครั้ง");
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "PLACE ORDER";
        }
    }
}

/* ================= ORDER TRACKING ================= */
function openTrackingModal() {
    const modal = document.getElementById("trackingModal");
    if (modal) {
        modal.classList.add("show");
        const input = document.getElementById("trackingInput");
        if (input) input.focus();
    }
}

async function searchTracking() {
    const input = document.getElementById("trackingInput");
    const container = document.getElementById("trackingResults");
    if (!input || !container) return;

    const query = input.value.trim();
    if (!query) {
        showToast("กรุณากรอกรหัสคำสั่งซื้อ หรือ เบอร์โทรศัพท์");
        return;
    }

    container.innerHTML = `<div style="text-align:center; padding:30px; color:#8A7A72;">⏳ กำลังค้นหาข้อมูลจากฐานข้อมูล...</div>`;

    try {
        let results = [];
        if (typeof trackDbOrder === "function") {
            results = await trackDbOrder(query);
        }

        if (!results || results.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding:30px; color:#8A7A72;">
                    <div style="font-size:40px;">🔍</div>
                    <p style="margin-top:10px;">ไม่พบคำสั่งซื้อที่ตรงกับ "<b>${query}</b>"</p>
                    <small>กรุณาตรวจสอบรหัสคำสั่งซื้อ (เช่น BH261108-xxxx) หรือเบอร์โทรศัพท์ที่ใช้สั่งซื้อ</small>
                </div>
            `;
            return;
        }

        container.innerHTML = results.map(renderTrackingCard).join("");
    } catch (err) {
        container.innerHTML = `<p style="text-align:center; color:#dc3545;">เกิดข้อผิดพลาดในการค้นหา: ${err.message}</p>`;
    }
}

function renderTrackingCard(order) {
    const orderNo = order.order_number || order.orderNumber;
    const status = (order.order_status || order.orderStatus || "pending").toLowerCase();
    const dateStr = order.created_at ? new Date(order.created_at).toLocaleString("th-TH") : "วันนี้";
    const total = order.total_amount || order.totalAmount || 0;

    // Timeline progress mapping
    const steps = [
        { key: "pending", name: "รับออเดอร์แล้ว", desc: "ทางร้านได้รับข้อมูลคำสั่งซื้อแล้ว" },
        { key: "confirmed", name: "ยืนยันออเดอร์", desc: "ตรวจสอบยอดชำระเงินเรียบร้อย" },
        { key: "baking", name: "กำลังอบสดใหม่ 🥐", desc: "เชฟกำลังอบเบเกอรี่ร้อนๆ จากเตา" },
        { key: "delivering", name: "กำลังจัดส่ง 🛵", desc: "ขนส่งกำลังนำความอร่อยไปส่งให้คุณ" },
        { key: "completed", name: "จัดส่งสำเร็จ ✓", desc: "ส่งมอบสินค้าเรียบร้อย ขอให้อร่อยนะคะ!" }
    ];

    const currentStepIndex = steps.findIndex(s => s.key === status);
    const activeIndex = currentStepIndex >= 0 ? currentStepIndex : 0;

    let itemsList = "";
    if (Array.isArray(order.items)) {
        itemsList = order.items.map(it => `<li>${it.name} x ${it.quantity} (฿${it.price * it.quantity})</li>`).join("");
    }

    return `
        <div style="background:white; border-radius:15px; padding:20px; margin-bottom:20px; box-shadow:0 4px 15px rgba(62,41,32,0.06); border:1px solid #EADBCE;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #F5E8D5; padding-bottom:12px; margin-bottom:15px;">
                <div>
                    <h3 style="color:var(--dark-brown); margin:0; font-size:17px;">รหัส: ${orderNo}</h3>
                    <small style="color:var(--gray);">${dateStr}</small>
                </div>
                <span class="status-badge status-${status}">${translateOrderStatusTh(status)}</span>
            </div>

            <div class="timeline">
                ${steps.map((step, idx) => {
                    const isDone = idx < activeIndex;
                    const isCurrent = idx === activeIndex;
                    const cls = isCurrent ? "timeline-step active current" : (isDone ? "timeline-step active" : "timeline-step");
                    return `
                        <div class="${cls}">
                            <div class="timeline-dot">${isDone ? "✓" : (idx + 1)}</div>
                            <div class="timeline-content">
                                <h4>${step.name}</h4>
                                <p>${step.desc}</p>
                            </div>
                        </div>
                    `;
                }).join("")}
            </div>

            <div style="background:#FFF8EE; border-radius:10px; padding:12px 16px; margin-top:15px; font-size:13px;">
                <p style="margin:0 0 6px;"><b>ผู้รับ:</b> ${order.customer_name || order.name} (${order.customer_phone || order.phone})</p>
                <p style="margin:0 0 6px;"><b>ที่อยู่:</b> ${order.customer_address || order.address}</p>
                <ul style="margin:0 0 8px; padding-left:20px;">${itemsList}</ul>
                <div style="display:flex; justify-content:space-between; font-weight:600; color:var(--brown); font-size:15px; border-top:1px dashed #D9B98C; padding-top:8px;">
                    <span>ยอดสุทธิ</span>
                    <span>฿${total}</span>
                </div>
            </div>
        </div>
    `;
}

function translateOrderStatusTh(status) {
    if (status === "confirmed") return "ยืนยันออเดอร์แล้ว";
    if (status === "baking") return "กำลังอบสดใหม่";
    if (status === "delivering") return "กำลังจัดส่ง";
    if (status === "completed") return "จัดส่งสำเร็จ";
    if (status === "cancelled") return "ยกเลิกแล้ว";
    return "รอดำเนินการ";
}

/* ================= CONTACT FORM ================= */
async function sendMessage(event) {
    event.preventDefault();

    const form = event.target;
    const name = form.querySelector("input[name='name']") ? form.querySelector("input[name='name']").value : form.querySelectorAll("input")[0].value;
    const email = form.querySelector("input[name='email']") ? form.querySelector("input[name='email']").value : form.querySelectorAll("input")[1].value;
    const message = form.querySelector("textarea").value;

    if (!name || !email || !message) {
        showToast("กรุณากรอกข้อมูลให้ครบทุกช่อง");
        return;
    }

    const contactData = { name, email, message };

    try {
        if (typeof saveDbContact === "function") {
            await saveDbContact(contactData);
        }
        showToast("✨ ส่งข้อความเรียบร้อยแล้ว ขอบคุณที่ติดต่อ BAKE HOUSE");
        form.reset();
    } catch (e) {
        showToast("ส่งข้อความสำเร็จ");
        form.reset();
    }
}

/* ================= PRODUCT DETAIL MODAL ================= */
function openProductDetail(productId) {
    const product = products.find(item => item.id === productId);
    if (!product) return;

    const stars = "★".repeat(Math.round(product.rating || 5));
    const detailBox = document.getElementById("productDetail");
    if (!detailBox) return;

    detailBox.innerHTML = `
        <div class="detail-grid">
            <div class="detail-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="detail-info">
                <span class="product-category">${product.category}</span>
                <h2>${product.name}</h2>
                <div class="rating" style="color:#C99458; margin:5px 0;">${stars}</div>
                <div class="detail-price">฿${product.price}</div>
                <p>${product.description || ""}</p>
                <div class="quantity-box">
                    <button onclick="detailQuantity(-1)">−</button>
                    <span id="detailQuantity">1</span>
                    <button onclick="detailQuantity(1)">+</button>
                </div>
                <button class="btn primary-btn" onclick="addDetailToCart(${product.id})">
                    🛒 ADD TO CART
                </button>
            </div>
        </div>
    `;

    selectedQuantity = 1;
    const modal = document.getElementById("productModal");
    if (modal) modal.classList.add("show");
}

let selectedQuantity = 1;
function detailQuantity(amount) {
    selectedQuantity += amount;
    if (selectedQuantity < 1) selectedQuantity = 1;
    const el = document.getElementById("detailQuantity");
    if (el) el.textContent = selectedQuantity;
}

function addDetailToCart(productId) {
    addToCart(productId, selectedQuantity);
    selectedQuantity = 1;
    closeModal("productModal");
}

/* ================= PROMOTION & MODALS ================= */
function showPromotion(name) {
    showToast(`🎁 โปรโมชั่น "${name}" สามารถกดสั่งซื้อหรือใส่โค้ดส่วนลดได้เลย`);
}

function openLogin() {
    const modal = document.getElementById("loginModal");
    if (modal) modal.classList.add("show");
}

function login(event) {
    event.preventDefault();
    const email = event.target.querySelector("input[type='email']").value;
    closeModal("loginModal");
    showToast(`👤 เข้าสู่ระบบสำเร็จ ยินดีต้อนรับ ${email}`);

    // อัปเดตปุ่ม Login ใน header
    const loginBtn = document.querySelector(".login-btn");
    if (loginBtn) {
        loginBtn.innerHTML = `👤 ${email.split("@")[0]}`;
        loginBtn.onclick = () => {
            if (confirm("ต้องการออกจากระบบหรือไม่?")) {
                loginBtn.innerHTML = "👤 Login";
                loginBtn.onclick = openLogin;
                showToast("ออกจากระบบแล้ว");
            }
        };
    }
}

function toggleMenu() {
    const navbar = document.getElementById("navbar");
    if (navbar) navbar.classList.toggle("active");
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove("show");
}

document.addEventListener("click", function(event) {
    if (event.target.classList.contains("modal")) {
        event.target.classList.remove("show");
    }
});

/* ================= TOAST NOTIFICATION ================= */
function showToast(message) {
    const oldToast = document.querySelector(".toast");
    if (oldToast) oldToast.remove();

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    toast.style.cssText = `
        position:fixed;
        bottom:25px;
        right:25px;
        z-index:9999;
        background:#3E2920;
        color:white;
        padding:14px 22px;
        border-radius:30px;
        box-shadow:0 10px 30px rgba(0,0,0,.25);
        font-size:14px;
        display:flex;
        align-items:center;
        gap:8px;
        animation:toastIn .3s ease;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(10px)";
        toast.style.transition = "0.3s";
        setTimeout(() => toast.remove(), 300);
    }, 2800);
}

/* ================= CARD CLICK FOR DETAIL ================= */
document.addEventListener("click", function(event) {
    const card = event.target.closest(".product-card");
    if (!card) return;
    if (event.target.closest(".add-btn")) return;

    const id = Number(card.getAttribute("data-id"));
    if (id) {
        openProductDetail(id);
    }
});
