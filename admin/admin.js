// Cucumell Admin Panel - Logic
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Check Configuration
    const isConfigured = 
        typeof SUPABASE_URL !== 'undefined' && 
        typeof SUPABASE_ANON_KEY !== 'undefined' && 
        SUPABASE_URL.trim() !== "" && 
        SUPABASE_ANON_KEY.trim() !== "" &&
        !SUPABASE_URL.includes("YOUR_SUPABASE");

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
    const imageFileInput = document.getElementById('cookie-image-file');
    const imagePreview = document.getElementById('image-preview');
    const imagePlaceholder = document.getElementById('image-placeholder');
    const hiddenImageUrlInput = document.getElementById('cookie-image-url');
    let selectedImageFile = null;

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
                    
                    row.innerHTML = `
                        <td><img src="${cookie.image_url}" class="table-img" alt="${cookie.name}"></td>
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
    const modal = document.getElementById('cookie-modal');
    const modalTitle = document.getElementById('modal-title');
    const cookieForm = document.getElementById('cookie-form');
    
    document.getElementById('add-cookie-btn').addEventListener('click', () => {
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
        document.getElementById('cookie-id').value = '';
        document.getElementById('cookie-image-url').value = '';

        if (id) {
            modalTitle.textContent = "Editar Galleta";
            const cookie = cookiesList.find(c => c.id === id);
            if (cookie) {
                document.getElementById('cookie-id').value = cookie.id;
                document.getElementById('cookie-name').value = cookie.name;
                document.getElementById('cookie-description').value = cookie.description || '';
                document.getElementById('cookie-price').value = cookie.price;
                document.getElementById('cookie-order').value = cookie.order_index;
                document.getElementById('cookie-image-url').value = cookie.image_url;

                imagePreview.src = cookie.image_url;
                imagePreview.style.display = 'block';
                imagePlaceholder.style.display = 'none';
            }
        } else {
            modalTitle.textContent = "Agregar Nueva Galleta";
            // Suggest next order index
            const maxOrder = cookiesList.reduce((max, c) => c.order_index > max ? c.order_index : max, 0);
            document.getElementById('cookie-order').value = maxOrder + 1;
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

        const id = document.getElementById('cookie-id').value;
        const name = document.getElementById('cookie-name').value.trim();
        const description = document.getElementById('cookie-description').value.trim();
        const price = document.getElementById('cookie-price').value.trim();
        const order_index = parseInt(document.getElementById('cookie-order').value);
        let image_url = document.getElementById('cookie-image-url').value;

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
            if (cookie.image_url.includes('/storage/v1/object/public/cookie-images/')) {
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
                    const el = document.getElementById(`setting-${item.key.replace(/_/g, '-')}`);
                    if (el) {
                        el.value = item.value;
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

        const phone = document.getElementById('setting-whatsapp-phone').value.trim().replace(/\D/g, ''); // leave only digits
        const insta = document.getElementById('setting-instagram-url').value.trim();
        const msg = document.getElementById('setting-whatsapp-message').value.trim();
        const about = document.getElementById('setting-about-text').value.trim();

        const updates = [
            { key: 'whatsapp_phone', value: phone },
            { key: 'instagram_url', value: insta },
            { key: 'whatsapp_message', value: msg },
            { key: 'about_text', value: about }
        ];

        try {
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
        }
    });


    // Initial Loads
    await loadCookies();
    await loadSettings();
});
