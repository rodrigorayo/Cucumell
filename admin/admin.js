// Cucumell Admin Panel - Logic
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Check Configuration
    const isConfigured = 
        typeof SUPABASE_URL !== 'undefined' && 
        typeof SUPABASE_ANON_KEY !== 'undefined' && 
        SUPABASE_URL.trim() !== "" && 
        SUPABASE_ANON_KEY.trim() !== "" &&
        !SUPABASE_URL.includes("YOUR_SUPABASE");

    const loadingState = document.getElementById('catalog-loading');

    if (typeof supabase === 'undefined') {
        if (loadingState) {
            loadingState.innerHTML = `
                <div style="color: var(--accent-color); padding: 25px; text-align: center; border: 1px solid var(--border-color); background: #fff; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                    <h3 style="font-family: var(--font-accent); font-size: 1.3rem; margin-bottom: 10px; color: var(--accent-color);">⚠️ Error de Conexión</h3>
                    <p style="margin-bottom: 10px;">No se pudo cargar la librería de Supabase desde el servidor CDN.</p>
                    <p style="font-size: 0.85rem; color: #666;">Por favor, recarga la página presionando <strong>Ctrl + F5</strong> o <strong>Ctrl + Shift + R</strong> para limpiar la caché de tu navegador. Si el problema persiste, es posible que la conexión a internet sea inestable.</p>
                </div>
            `;
        }
        alert("No se pudo conectar con Supabase. Por favor revisa tu conexión o limpia la caché de tu navegador (Ctrl+F5).");
        return;
    }

    if (!isConfigured) {
        alert("Supabase no está configurado. Por favor edita config.js.");
        window.location.href = 'login.html';
        return;
    }

    // 2. Initialize Supabase
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // 3. Authentication Session Check
    let currentSession = null;
    try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        if (error || !session) {
            window.location.href = 'login.html';
            return;
        }
        currentSession = session;
        document.getElementById('user-email').textContent = session.user.email;
    } catch (err) {
        console.error("Auth check failed:", err);
        window.location.href = 'login.html';
        return;
    }

    // 4. Logout Handler
    document.getElementById('logout-btn').addEventListener('click', async () => {
        const { error } = await supabaseClient.auth.signOut();
        if (error) {
            alert("Error al cerrar sesión: " + error.message);
        } else {
            window.location.href = 'login.html';
        }
    });

    // 5. Tab Menu System
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            // Toggle buttons
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Toggle panels
            tabPanels.forEach(panel => {
                if (panel.id === targetTab) {
                    panel.classList.add('active');
                } else {
                    panel.classList.remove('active');
                }
            });
        });
    });

    // 6. Image Upload Selector and Preview
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const imageFileInput = document.getElementById('galleta-image-file');
    const imagePreview = document.getElementById('image-preview');
    const imagePlaceholder = document.getElementById('image-placeholder');
    const hiddenImageUrlInput = document.getElementById('galleta-image-url');
    let selectedImageFile = null;

    // Hero image uploader elements
    const heroImageUploader = document.getElementById('setting-hero-image-uploader');
    const heroImagePreviewContainer = document.getElementById('setting-hero-image-preview-container');
    const heroImageFileInput = document.getElementById('setting-hero-image-file');
    const heroImagePreview = document.getElementById('setting-hero-image-preview');
    const heroImagePlaceholder = document.getElementById('setting-hero-image-placeholder');
    const hiddenHeroImageUrlInput = document.getElementById('setting-hero-image-url');
    let selectedHeroImageFile = null;

    if (heroImageUploader && heroImageFileInput) {
        heroImageUploader.addEventListener('click', () => {
            heroImageFileInput.click();
        });

        heroImageFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                selectedHeroImageFile = file;
                const reader = new FileReader();
                reader.onload = (event) => {
                    heroImagePreview.src = event.target.result;
                    heroImagePreview.style.display = 'block';
                    heroImagePlaceholder.style.display = 'none';
                };
                reader.readAsDataURL(file);
            }
        });

        // Drag and drop for hero image
        heroImageUploader.addEventListener('dragover', (e) => {
            e.preventDefault();
            heroImageUploader.style.borderColor = 'var(--accent-color)';
            heroImageUploader.style.background = '#faf7f2';
        });

        heroImageUploader.addEventListener('dragleave', () => {
            heroImageUploader.style.borderColor = 'var(--secondary-color)';
            heroImageUploader.style.background = '#fff';
        });

        heroImageUploader.addEventListener('drop', (e) => {
            e.preventDefault();
            heroImageUploader.style.borderColor = 'var(--secondary-color)';
            heroImageUploader.style.background = '#fff';
            
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                heroImageFileInput.files = e.dataTransfer.files;
                selectedHeroImageFile = file;
                
                const reader = new FileReader();
                reader.onload = (event) => {
                    heroImagePreview.src = event.target.result;
                    heroImagePreview.style.display = 'block';
                    heroImagePlaceholder.style.display = 'none';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Price inputs selection logic (dynamic addition of second price)
    const priceInput1 = document.getElementById('price-input-1');
    const priceInput2 = document.getElementById('price-input-2');
    const priceContainer2 = document.getElementById('price-container-2');
    const addSecondPriceBtn = document.getElementById('add-second-price-btn');
    const removeSecondPriceBtn = document.getElementById('remove-second-price-btn');

    addSecondPriceBtn.addEventListener('click', () => {
        priceContainer2.style.display = 'grid';
        addSecondPriceBtn.style.display = 'none';
        priceInput2.required = true;
    });

    removeSecondPriceBtn.addEventListener('click', () => {
        priceContainer2.style.display = 'none';
        addSecondPriceBtn.style.display = 'inline-flex';
        priceInput2.value = '';
        priceInput2.required = false;
    });

    imagePreviewContainer.addEventListener('click', () => {
        imageFileInput.click();
    });

    imageFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            selectedImageFile = file;
            const reader = new FileReader();
            reader.onload = (event) => {
                imagePreview.src = event.target.result;
                imagePreview.style.display = 'block';
                imagePlaceholder.style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
    });

    // Drag and Drop implementation for uploader
    imagePreviewContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        imagePreviewContainer.style.borderColor = 'var(--accent-color)';
        imagePreviewContainer.style.background = '#faf7f2';
    });

    imagePreviewContainer.addEventListener('dragleave', () => {
        imagePreviewContainer.style.borderColor = 'var(--secondary-color)';
        imagePreviewContainer.style.background = '#fff';
    });

    imagePreviewContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        imagePreviewContainer.style.borderColor = 'var(--secondary-color)';
        imagePreviewContainer.style.background = '#fff';
        
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            imageFileInput.files = e.dataTransfer.files;
            selectedImageFile = file;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                imagePreview.src = event.target.result;
                imagePreview.style.display = 'block';
                imagePlaceholder.style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
    });

    // =====================================================================
    // COOKIES CATALOG CRUD
    // =====================================================================
    let cookiesList = [];

    // Fetch and render
    async function loadCookies() {
        const loadingState = document.getElementById('catalog-loading');
        const cookiesTable = document.getElementById('cookies-table');
        const emptyState = document.getElementById('catalog-empty');
        const tableBody = document.getElementById('cookies-table-body');

        loadingState.style.display = 'block';
        cookiesTable.style.display = 'none';
        emptyState.style.display = 'none';
        tableBody.innerHTML = '';

        try {
            const { data: cookies, error } = await supabaseClient
                .from('cookies')
                .select('*')
                .order('order_index', { ascending: true });

            loadingState.style.display = 'none';

            if (error) {
                alert("Error al cargar galletas: " + error.message);
                return;
            }

            cookiesList = cookies || [];

            if (cookiesList.length === 0) {
                emptyState.style.display = 'block';
            } else {
                cookiesTable.style.display = 'table';
                cookiesList.forEach(cookie => {
                    const row = document.createElement('tr');
                    
                    const displayImgUrl = (cookie.image_url && typeof cookie.image_url === 'string' && !cookie.image_url.startsWith('http') && !cookie.image_url.startsWith('/')) 
                        ? `../${cookie.image_url}` 
                        : (cookie.image_url || '');

                    row.innerHTML = `
                        <td><img src="${displayImgUrl}" class="table-img" alt="${cookie.name}"></td>
                        <td style="font-weight: bold;">${cookie.name}</td>
                        <td style="font-style: italic; color: #555;">${cookie.description || ''}</td>
                        <td style="font-family: var(--font-accent); font-weight: bold; color: var(--accent-color);">${cookie.price}</td>
                        <td>${cookie.order_index}</td>
                        <td>
                            <div class="actions-cell">
                                <button class="btn btn-secondary btn-sm edit-btn" data-id="${cookie.id}">Editar</button>
                                <button class="btn btn-danger btn-sm delete-btn" data-id="${cookie.id}">Eliminar</button>
                            </div>
                        </td>
                    `;
                    tableBody.appendChild(row);
                });

                // Attach Action Listeners
                document.querySelectorAll('.edit-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const id = btn.getAttribute('data-id');
                        openCookieModal(id);
                    });
                });

                document.querySelectorAll('.delete-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const id = btn.getAttribute('data-id');
                        deleteCookie(id);
                    });
                });
            }
        } catch (err) {
            console.error("loadCookies exception:", err);
            loadingState.style.display = 'none';
        }
    }

    // Modal control
    const modal = document.getElementById('galleta-modal');
    const modalTitle = document.getElementById('modal-title');
    const cookieForm = document.getElementById('galleta-form');
    
    document.getElementById('add-galleta-btn').addEventListener('click', () => {
        openCookieModal(null); // Add mode
    });

    document.getElementById('modal-close-btn').addEventListener('click', closeCookieModal);
    document.getElementById('modal-cancel-btn').addEventListener('click', closeCookieModal);

    function openCookieModal(id = null) {
        cookieForm.reset();
        selectedImageFile = null;
        imagePreview.src = '';
        imagePreview.style.display = 'none';
        imagePlaceholder.style.display = 'block';
        document.getElementById('galleta-id').value = '';
        document.getElementById('galleta-image-url').value = '';

        if (id) {
            modalTitle.textContent = "Editar Galleta";
            const cookie = cookiesList.find(c => c.id === id);
            if (cookie) {
                document.getElementById('galleta-id').value = cookie.id;
                document.getElementById('galleta-name').value = cookie.name;
                document.getElementById('galleta-description').value = cookie.description || '';
                document.getElementById('galleta-order').value = cookie.order_index;
                document.getElementById('galleta-image-url').value = cookie.image_url;

                // Parse price string to inputs
                if (cookie.price.includes('|')) {
                    const parts = cookie.price.split('|');
                    const p1 = parseFloat(parts[0].replace("Bs.", "").replace(/[^0-9.]/g, ''));
                    const p2 = parseFloat(parts[1].replace("Bs.", "").replace(/[^0-9.]/g, ''));
                    
                    // Sort them ascending for representation
                    const sortedPrices = [p1, p2].sort((a, b) => a - b);

                    priceInput1.value = isNaN(sortedPrices[0]) ? '' : sortedPrices[0];
                    priceInput2.value = isNaN(sortedPrices[1]) ? '' : sortedPrices[1];
                    
                    // Show second price container, hide "+" button
                    priceContainer2.style.display = 'grid';
                    addSecondPriceBtn.style.display = 'none';
                    priceInput2.required = true;
                } else {
                    const p = parseFloat(cookie.price.replace("Bs.", "").replace(/[^0-9.]/g, ''));
                    priceInput1.value = isNaN(p) ? '' : p;
                    priceInput2.value = '';
                    
                    // Hide second price container, show "+" button
                    priceContainer2.style.display = 'none';
                    addSecondPriceBtn.style.display = 'inline-flex';
                    priceInput2.required = false;
                }

                if (cookie.image_url) {
                    imagePreview.src = cookie.image_url;
                    imagePreview.style.display = 'block';
                    imagePlaceholder.style.display = 'none';
                } else {
                    imagePreview.src = '';
                    imagePreview.style.display = 'none';
                    imagePlaceholder.style.display = 'block';
                }
            }
        } else {
            modalTitle.textContent = "Agregar Nueva Galleta";
            // Suggest next order index
            const maxOrder = cookiesList.reduce((max, c) => c.order_index > max ? c.order_index : max, 0);
            document.getElementById('galleta-order').value = maxOrder + 1;
            
            priceInput1.value = '';
            priceInput2.value = '';
            priceContainer2.style.display = 'none';
            addSecondPriceBtn.style.display = 'inline-flex';
            priceInput2.required = false;
        }

        modal.style.display = 'flex';
    }

    function closeCookieModal() {
        modal.style.display = 'none';
    }

    // Form submit (Insert / Update)
    cookieForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = document.getElementById('modal-submit-btn');
        const spinner = document.getElementById('modal-spinner');
        const btnText = submitBtn.querySelector('span');

        const id = document.getElementById('galleta-id').value;
        const name = document.getElementById('galleta-name').value.trim();
        const description = document.getElementById('galleta-description').value.trim();
        const order_index = parseInt(document.getElementById('galleta-order').value);
        let image_url = document.getElementById('galleta-image-url').value;

        // Assemble price string
        let price = '';
        const p1 = parseFloat(priceInput1.value);
        const p2Str = priceInput2.value.trim();
        
        if (p2Str === '') {
            if (isNaN(p1)) {
                alert("Por favor ingresa un precio válido.");
                return;
            }
            price = `Bs. ${p1.toFixed(2)}`;
        } else {
            const p2 = parseFloat(p2Str);
            if (isNaN(p1) || isNaN(p2)) {
                alert("Por favor ingresa valores numéricos válidos en ambos precios.");
                return;
            }
            // Sort ascending as requested!
            const sorted = [p1, p2].sort((a, b) => a - b);
            price = `Bs. ${sorted[0].toFixed(2)} | Bs. ${sorted[1].toFixed(2)}`;
        }

        // Image validation
        if (!selectedImageFile && !image_url) {
            alert("Por favor selecciona una foto para la galleta.");
            return;
        }

        // Show loading state
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        spinner.style.display = 'inline-block';

        try {
            // Upload photo if a new file is chosen
            if (selectedImageFile) {
                // Sanitize file name extension
                const ext = selectedImageFile.name.split('.').pop();
                const cleanName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;

                const { data: uploadData, error: uploadError } = await supabaseClient.storage
                    .from('cookie-images')
                    .upload(cleanName, selectedImageFile);

                if (uploadError) {
                    throw new Error("Error al subir la imagen: " + uploadError.message);
                }

                // Retrieve public URL
                const { data: { publicUrl } } = supabaseClient.storage
                    .from('cookie-images')
                    .getPublicUrl(cleanName);
                
                image_url = publicUrl;
            }

            const cookieData = {
                name,
                description,
                price,
                order_index,
                image_url
            };

            let error = null;

            if (id) {
                // Update mode
                const { error: updateError } = await supabaseClient
                    .from('cookies')
                    .update(cookieData)
                    .eq('id', id);
                error = updateError;
            } else {
                // Insert mode
                const { error: insertError } = await supabaseClient
                    .from('cookies')
                    .insert(cookieData);
                error = insertError;
            }

            if (error) {
                throw new Error("Error al guardar en la base de datos: " + error.message);
            }

            // Clean up and refresh
            closeCookieModal();
            loadCookies();
        } catch (err) {
            alert(err.message);
        } finally {
            submitBtn.disabled = false;
            btnText.style.display = 'inline-block';
            spinner.style.display = 'none';
        }
    });

    // Delete item
    async function deleteCookie(id) {
        const cookie = cookiesList.find(c => c.id === id);
        if (!cookie) return;

        const confirmDelete = confirm(`¿Estás seguro de que deseas eliminar la galleta "${cookie.name}"?`);
        if (!confirmDelete) return;

        try {
            // Delete record
            const { error: dbError } = await supabaseClient
                .from('cookies')
                .delete()
                .eq('id', id);

            if (dbError) throw dbError;

            // Optional: try to clean up image from storage if it belongs to our bucket
            if (cookie.image_url && typeof cookie.image_url === 'string' && cookie.image_url.includes('/storage/v1/object/public/cookie-images/')) {
                const pathParts = cookie.image_url.split('/cookie-images/');
                if (pathParts.length > 1) {
                    const fileName = pathParts[1];
                    await supabaseClient.storage.from('cookie-images').remove([fileName]);
                }
            }

            loadCookies();
        } catch (err) {
            alert("Error al eliminar: " + err.message);
        }
    }

     // =====================================================================
    // STORE CONFIGURATION
    // =====================================================================
    const settingsForm = document.getElementById('settings-form');
    const settingsStatus = document.getElementById('settings-status');
    const whatsappNumInput = document.getElementById('setting-whatsapp-number');

    if (whatsappNumInput) {
        whatsappNumInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, ''); // Strip non-digits
        });
    }

    async function loadSettings() {
        try {
            const { data, error } = await supabaseClient
                .from('settings')
                .select('*');

            if (error) {
                console.error("Error al cargar configuraciones:", error);
                return;
            }

            if (data) {
                data.forEach(item => {
                    if (item.key === 'whatsapp_phone') {
                        const phone = item.value.trim();
                        const codes = ["591", "54", "56", "57", "52", "51", "34", "1"];
                        let matchedCode = "591"; // default
                        let restNumber = phone;
                        for (const code of codes) {
                            if (phone.startsWith(code)) {
                                matchedCode = code;
                                restNumber = phone.substring(code.length);
                                break;
                            }
                        }
                        const codeEl = document.getElementById('setting-whatsapp-code');
                        const numberEl = document.getElementById('setting-whatsapp-number');
                        if (codeEl) codeEl.value = matchedCode;
                        if (numberEl) numberEl.value = restNumber;
                    } else if (item.key === 'hero_image') {
                        if (hiddenHeroImageUrlInput) hiddenHeroImageUrlInput.value = item.value;
                        if (heroImagePreview && item.value) {
                            const displayImgUrl = (item.value && typeof item.value === 'string' && !item.value.startsWith('http') && !item.value.startsWith('/')) 
                                ? `../${item.value}` 
                                : item.value;
                            heroImagePreview.src = displayImgUrl;
                            heroImagePreview.style.display = 'block';
                            if (heroImagePlaceholder) heroImagePlaceholder.style.display = 'none';
                        }
                    } else {
                        const el = document.getElementById(`setting-${item.key.replace(/_/g, '-')}`);
                        if (el) {
                            el.value = item.value;
                        }
                    }
                });
            }
        } catch (err) {
            console.error("loadSettings exception:", err);
        }
    }

    settingsForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        settingsStatus.textContent = "Guardando...";
        settingsStatus.className = "status-msg";
        
        const saveBtn = document.getElementById('save-settings-btn');
        if (saveBtn) saveBtn.disabled = true;

        const code = document.getElementById('setting-whatsapp-code').value;
        const num = document.getElementById('setting-whatsapp-number').value.trim().replace(/\D/g, ''); // digits only
        const phone = code + num;
        const insta = document.getElementById('setting-instagram-url').value.trim();
        const msg = document.getElementById('setting-whatsapp-message').value.trim();
        const about = document.getElementById('setting-about-text').value.trim();
        
        const heroTitle = document.getElementById('setting-hero-title').value.trim();
        const heroSubtitle = document.getElementById('setting-hero-subtitle').value.trim();
        const catalogTitle = document.getElementById('setting-catalog-title').value.trim();
        const catalogSubtitle = document.getElementById('setting-catalog-subtitle').value.trim();
        const aboutTitle = document.getElementById('setting-about-title').value.trim();
        
        let heroImageUrl = hiddenHeroImageUrlInput ? hiddenHeroImageUrlInput.value : '';

        try {
            // Upload new hero image if selected
            if (selectedHeroImageFile) {
                const ext = selectedHeroImageFile.name.split('.').pop();
                const cleanName = `hero-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;

                const { data: uploadData, error: uploadError } = await supabaseClient.storage
                    .from('cookie-images')
                    .upload(cleanName, selectedHeroImageFile);

                if (uploadError) {
                    throw new Error("Error al subir la imagen de portada: " + uploadError.message);
                }

                // Retrieve public URL
                const { data: { publicUrl } } = supabaseClient.storage
                    .from('cookie-images')
                    .getPublicUrl(cleanName);
                
                heroImageUrl = publicUrl;
                if (hiddenHeroImageUrlInput) hiddenHeroImageUrlInput.value = heroImageUrl;
                selectedHeroImageFile = null; // Reset selection after success
            }

            const updates = [
                { key: 'whatsapp_phone', value: phone },
                { key: 'instagram_url', value: insta },
                { key: 'whatsapp_message', value: msg },
                { key: 'about_text', value: about },
                { key: 'hero_title', value: heroTitle },
                { key: 'hero_subtitle', value: heroSubtitle },
                { key: 'catalog_title', value: catalogTitle },
                { key: 'catalog_subtitle', value: catalogSubtitle },
                { key: 'about_title', value: aboutTitle },
                { key: 'hero_image', value: heroImageUrl }
            ];

            const { error } = await supabaseClient
                .from('settings')
                .upsert(updates);

            if (error) throw error;

            settingsStatus.textContent = "✓ ¡Configuración guardada!";
            settingsStatus.className = "status-msg success";
            
            // Clean message after 3 seconds
            setTimeout(() => {
                settingsStatus.textContent = "";
            }, 3000);
        } catch (err) {
            settingsStatus.textContent = "✗ Error: " + err.message;
            settingsStatus.className = "status-msg error";
        } finally {
            if (saveBtn) saveBtn.disabled = false;
        }
    });


    // Initial Loads
    await loadCookies();
    await loadSettings();
});
