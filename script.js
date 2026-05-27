// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href && href !== '#' && href.startsWith('#')) {
            const targetEl = document.querySelector(href);
            if (targetEl) {
                e.preventDefault();
                targetEl.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        }
    });
});

console.log("Welcome to Cucumell - Baked with Love!");

// Dynamic loading with Supabase
document.addEventListener('DOMContentLoaded', async () => {
    // Check if credentials are set
    const isConfigured = 
        typeof SUPABASE_URL !== 'undefined' && 
        typeof SUPABASE_ANON_KEY !== 'undefined' && 
        SUPABASE_URL.trim() !== "" && 
        SUPABASE_ANON_KEY.trim() !== "" &&
        !SUPABASE_URL.includes("YOUR_SUPABASE");

    if (!isConfigured) {
        console.log("Supabase no configurado. Cargando catálogo estático por defecto.");
        return;
    }

    try {
        const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        // 1. Fetch settings (WhatsApp number, Instagram link, About text)
        const { data: settingsData, error: settingsError } = await supabaseClient
            .from('settings')
            .select('*');
        
        let whatsappPhone = "59175585905"; // Default fallback
        let instagramUrl = "https://www.instagram.com/cucumell_16/"; // Default fallback
        let whatsappMessageTemplate = "Hola Cucumell! Me gustaría pedir la galleta: *{cookie_name}*";

        if (!settingsError && settingsData) {
            const settingsMap = {};
            settingsData.forEach(item => {
                settingsMap[item.key] = item.value;
            });

            if (settingsMap['whatsapp_phone']) {
                whatsappPhone = settingsMap['whatsapp_phone'].replace(/\D/g, ''); // keep digits only
            }
            if (settingsMap['instagram_url']) {
                instagramUrl = settingsMap['instagram_url'];
                const footerInsta = document.getElementById('footer-instagram');
                if (footerInsta) footerInsta.href = instagramUrl;
            }
            if (settingsMap['about_text']) {
                const aboutTextEl = document.getElementById('about-text');
                if (aboutTextEl) aboutTextEl.textContent = settingsMap['about_text'];
            }
            if (settingsMap['whatsapp_message']) {
                whatsappMessageTemplate = settingsMap['whatsapp_message'];
            }
            if (settingsMap['hero_title']) {
                const el = document.getElementById('hero-title');
                if (el) el.innerHTML = settingsMap['hero_title'];
            }
            if (settingsMap['hero_subtitle']) {
                const el = document.getElementById('hero-subtitle');
                if (el) el.textContent = settingsMap['hero_subtitle'];
            }
            if (settingsMap['catalog_title']) {
                const el = document.getElementById('catalog-title');
                if (el) el.textContent = settingsMap['catalog_title'];
            }
            if (settingsMap['catalog_subtitle']) {
                const el = document.getElementById('catalog-subtitle');
                if (el) el.textContent = settingsMap['catalog_subtitle'];
            }
            if (settingsMap['about_title']) {
                const el = document.getElementById('about-title');
                if (el) el.textContent = settingsMap['about_title'];
            }
        }

        // Update footer WhatsApp link
        const footerWa = document.getElementById('footer-whatsapp');
        if (footerWa) {
            const baseFooterMsg = "Hola! Quisiera más información sobre sus galletas.";
            footerWa.href = `https://api.whatsapp.com/send?phone=${whatsappPhone}&text=${encodeURIComponent(baseFooterMsg)}`;
        }

        // 2. Fetch Cookies catalog
        const { data: cookies, error: cookiesError } = await supabaseClient
            .from('cookies')
            .select('*')
            .order('order_index', { ascending: true });

        if (cookiesError) {
            console.error("Error al cargar cookies de Supabase:", cookiesError);
            return;
        }

        if (cookies && cookies.length > 0) {
            const productGrid = document.getElementById('product-grid');
            if (productGrid) {
                // Clear default HTML products
                productGrid.innerHTML = '';

                cookies.forEach(cookie => {
                    // Build product card
                    const card = document.createElement('div');
                    card.className = 'product-card';

                    // Format message for WhatsApp (replacing name and price)
                    const customMsg = whatsappMessageTemplate
                        .replace('{cookie_name}', cookie.name)
                        .replace('{cookie_price}', cookie.price);
                    const waLink = `https://api.whatsapp.com/send?phone=${whatsappPhone}&text=${encodeURIComponent(customMsg)}`;

                    card.innerHTML = `
                        <div class="card-image">
                            <img src="${cookie.image_url}" alt="${cookie.name}">
                        </div>
                        <h3>${cookie.name}</h3>
                        <p>${cookie.description || ''}</p>
                        <div class="price">${cookie.price}</div>
                        <a href="${waLink}" class="btn btn-secondary" target="_blank">Pedir Ahora</a>
                    `;
                    productGrid.appendChild(card);
                });
            }
        } else {
            console.log("No se encontraron galletas en la base de datos de Supabase. Usando fallback estático.");
        }
    } catch (err) {
        console.error("Excepción al inicializar Supabase o cargar datos:", err);
    }
});
