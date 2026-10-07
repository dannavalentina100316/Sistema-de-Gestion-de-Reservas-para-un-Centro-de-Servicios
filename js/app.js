document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "http://localhost:3000/api";

    // Elementos Globales
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const errorMessage = document.getElementById("error-message");
    const modelsGrid = document.getElementById("models-grid");

    // ==========================================================================
    // 1. AUTENTICACIÓN (LOGIN & REGISTRO)
    // ==========================================================================
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();

            if (!email || !password) {
                showError("Por favor, completa todos los campos.");
                return;
            }

            try {
                const response = await fetch(`${API_URL}/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.error || "Credenciales inválidas");

                alert("¡Inicio de sesión exitoso!");
                window.location.href = "dashboard.html";
            } catch (error) {
                showError(error.message);
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const name = document.getElementById("name").value.trim();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();

            if (!name || !email || !password) {
                showError("Todos los campos son obligatorios.");
                return;
            }

            if (password.length < 6) {
                showError("La contraseña debe tener al menos 6 caracteres.");
                return;
            }

            try {
                const response = await fetch(`${API_URL}/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, password })
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.error || "Error en el registro");

                alert("¡Registro exitoso! Redirigiendo al login...");
                window.location.href = "index.html";
            } catch (error) {
                showError(error.message);
            }
        });
    }

    function showError(message) {
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.style.display = "block";
            setTimeout(() => { errorMessage.style.display = "none"; }, 3000);
        }
    }

    // ==========================================================================
    // 2. CATÁLOGO DEL DASHBOARD
    // ==========================================================================
    if (modelsGrid) {
        const motorcycles = {
            TVS: [
                { name: "Apache RTR 200", type: "Deportiva", price: "$14.990.000", image: "https://images.unsplash.com/photo-1558980664-10e7170b5df9?auto=format&fit=crop&w=900&q=80" },
                { name: "Raider 125", type: "Urbana", price: "$9.490.000", image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=900&q=80" }
            ],
            Victory: [
                { name: "Venom 250", type: "Street", price: "$13.990.000", image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=80" }
            ]
        };

        function renderModels(brand) {
            const models = motorcycles[brand] || [];
            const title = document.getElementById("models-title");
            if (title) title.textContent = `Motos ${brand}`;

            modelsGrid.innerHTML = models.map(m => `
                <article class="model-card">
                    <div class="model-image" style="background-image: url('${m.image}')"></div>
                    <div class="model-content">
                        <span class="model-type">${m.type}</span>
                        <h4>${m.name}</h4>
                        <strong>${m.price}</strong>
                        <button type="button">Ver moto</button>
                    </div>
                </article>
            `).join("");
        }

        renderModels("TVS");
    }

    // ==========================================================================
    // 3. HUS-04: GESTIÓN DE USUARIOS
    // ==========================================================================
    const userTableBody = document.getElementById("userTableBody");
    if (userTableBody) {
        let users = [
            { id: 1, name: "Carlos Pérez", email: "carlos@motonea.com", role: "Administrador", status: "Activo", createdAt: "2026-01-15" },
            { id: 2, name: "Ana Gómez", email: "ana@motonea.com", role: "Técnico", status: "Pendiente", createdAt: "2026-02-10" },
            { id: 3, name: "Juan Rodríguez", email: "juan@motonea.com", role: "Cliente", status: "Inactivo", createdAt: "2026-03-01" }
        ];

        let userToDeleteId = null;
        const userSearchInput = document.getElementById("userSearchInput");
        const userRoleFilter = document.getElementById("userRoleFilter");
        const userStatusFilter = document.getElementById("userStatusFilter");
        const userModal = document.getElementById("userModal");
        const userForm = document.getElementById("userForm");
        const deleteUserModal = document.getElementById("deleteUserModal");

        function renderUsers() {
            const search = userSearchInput.value.toLowerCase();
            const role = userRoleFilter.value;
            const status = userStatusFilter.value;

            const filtered = users.filter(u => {
                const matchesSearch = u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search);
                const matchesRole = role === "" || u.role === role;
                const matchesStatus = status === "" || u.status === status;
                return matchesSearch && matchesRole && matchesStatus;
            });

            userTableBody.innerHTML = filtered.map(u => `
                <tr>
                    <td><strong>${u.name}</strong></td>
                    <td>${u.email}</td>
                    <td>${u.role}</td>
                    <td><span class="status-badge ${u.status.toLowerCase()}">${u.status}</span></td>
                    <td>${u.createdAt}</td>
                    <td>
                        <button class="btn-action-edit" onclick="openEditUserModal(${u.id})">Editar</button>
                        <button class="btn-action-delete" onclick="openDeleteUserModal(${u.id})">Eliminar</button>
                    </td>
                </tr>
            `).join("");
        }

        document.getElementById("btnOpenUserModal")?.addEventListener("click", () => {
            userForm.reset();
            document.getElementById("userId").value = "";
            document.getElementById("userModalTitle").textContent = "Nuevo usuario";
            userModal.classList.remove("hidden");
        });

        document.getElementById("btnCloseUserModal")?.addEventListener("click", () => userModal.classList.add("hidden"));
        document.getElementById("btnCancelUserModal")?.addEventListener("click", () => userModal.classList.add("hidden"));

        window.openEditUserModal = function(id) {
            const u = users.find(item => item.id === id);
            if (!u) return;
            document.getElementById("userId").value = u.id;
            document.getElementById("userName").value = u.name;
            document.getElementById("userEmail").value = u.email;
            document.getElementById("userRole").value = u.role;
            document.getElementById("userStatus").value = u.status;
            document.getElementById("userModalTitle").textContent = "Editar usuario";
            userModal.classList.remove("hidden");
        };

        userForm?.addEventListener("submit", (e) => {
            e.preventDefault();
            const id = document.getElementById("userId").value;
            const name = document.getElementById("userName").value.trim();
            const email = document.getElementById("userEmail").value.trim();
            const role = document.getElementById("userRole").value;
            const status = document.getElementById("userStatus").value;

            if (id) {
                const idx = users.findIndex(u => u.id == id);
                if (idx !== -1) users[idx] = { ...users[idx], name, email, role, status };
            } else {
                users.push({ id: Date.now(), name, email, role, status, createdAt: new Date().toISOString().split('T')[0] });
            }

            userModal.classList.add("hidden");
            renderUsers();
        });

        window.openDeleteUserModal = function(id) {
            userToDeleteId = id;
            deleteUserModal.classList.remove("hidden");
        };

        document.getElementById("btnCancelDeleteUser")?.addEventListener("click", () => deleteUserModal.classList.add("hidden"));
        document.getElementById("btnConfirmDeleteUser")?.addEventListener("click", () => {
            if (userToDeleteId) {
                users = users.filter(u => u.id !== userToDeleteId);
                userToDeleteId = null;
                renderUsers();
            }
            deleteUserModal.classList.add("hidden");
        });

        userSearchInput?.addEventListener("input", renderUsers);
        userRoleFilter?.addEventListener("change", renderUsers);
        userStatusFilter?.addEventListener("change", renderUsers);

        renderUsers();
    }

    // ==========================================================================
    // 4. HUS-05: GESTIÓN DE SERVICIOS
    // ==========================================================================
    const servicesGrid = document.getElementById("servicesGrid");
    if (servicesGrid) {
        let services = [
            {
                id: 1,
                name: "Corte de cabello y barba",
                category: "Estética",
                price: 30000,
                duration: 45,
                status: "Disponible",
                image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80"
            },
            {
                id: 2,
                name: "Mantenimiento Preventivo Moto",
                category: "Taller",
                price: 80000,
                duration: 90,
                status: "Disponible",
                image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80"
            }
        ];

        let serviceToDeleteId = null;
        const serviceSearchInput = document.getElementById("serviceSearchInput");
        const serviceStatusFilter = document.getElementById("serviceStatusFilter");
        const serviceModal = document.getElementById("serviceModal");
        const serviceForm = document.getElementById("serviceForm");
        const deleteServiceModal = document.getElementById("deleteServiceModal");

        function renderServices() {
            const search = serviceSearchInput.value.toLowerCase();
            const status = serviceStatusFilter.value;

            const filtered = services.filter(s => {
                const matchesSearch = s.name.toLowerCase().includes(search);
                const matchesStatus = status === "" || s.status === status;
                return matchesSearch && matchesStatus;
            });

            servicesGrid.innerHTML = filtered.map(s => `
                <article class="service-card">
                    <div class="service-card-img" style="background-image: url('${s.image || 'https://via.placeholder.com/300x180?text=Servicio'}')"></div>
                    <div class="service-card-body">
                        <h3 class="service-card-title">${s.name}</h3>
                        <p><strong>Duración:</strong> ${s.duration} min</p>
                        <p><strong>Precio:</strong> $${s.price.toLocaleString('es-CO')}</p>
                        <p>
                            <span class="service-status-dot ${s.status === 'Disponible' ? 'disponible' : 'no-disponible'}"></span>
                            <strong>Estado:</strong> ${s.status}
                        </p>
                        <div style="margin-top: 10px;">
                            <button class="btn-action-edit" onclick="openEditServiceModal(${s.id})">Editar</button>
                            <button class="btn-action-delete" onclick="openDeleteServiceModal(${s.id})">Eliminar</button>
                        </div>
                    </div>
                </article>
            `).join("");
        }

        document.getElementById("btnOpenServiceModal")?.addEventListener("click", () => {
            serviceForm.reset();
            document.getElementById("serviceId").value = "";
            document.getElementById("serviceModalTitle").textContent = "Nuevo Servicio";
            serviceModal.classList.remove("hidden");
        });

        document.getElementById("btnCloseServiceModal")?.addEventListener("click", () => serviceModal.classList.add("hidden"));
        document.getElementById("btnCancelServiceModal")?.addEventListener("click", () => serviceModal.classList.add("hidden"));

        window.openEditServiceModal = function(id) {
            const s = services.find(item => item.id === id);
            if (!s) return;
            document.getElementById("serviceId").value = s.id;
            document.getElementById("serviceName").value = s.name;
            document.getElementById("serviceCategory").value = s.category || "";
            document.getElementById("servicePrice").value = s.price;
            document.getElementById("serviceDuration").value = s.duration;
            document.getElementById("serviceImage").value = s.image || "";
            document.getElementById("serviceStatus").value = s.status;
            document.getElementById("serviceModalTitle").textContent = "Editar Servicio";
            serviceModal.classList.remove("hidden");
        };

        serviceForm?.addEventListener("submit", (e) => {
            e.preventDefault();
            const id = document.getElementById("serviceId").value;
            const name = document.getElementById("serviceName").value.trim();
            const category = document.getElementById("serviceCategory").value.trim();
            const price = parseFloat(document.getElementById("servicePrice").value);
            const duration = parseInt(document.getElementById("serviceDuration").value);
            const image = document.getElementById("serviceImage").value.trim();
            const status = document.getElementById("serviceStatus").value;

            if (id) {
                const idx = services.findIndex(s => s.id == id);
                if (idx !== -1) services[idx] = { ...services[idx], name, category, price, duration, image, status };
            } else {
                services.push({ id: Date.now(), name, category, price, duration, image, status });
            }

            serviceModal.classList.add("hidden");
            renderServices();
        });

        window.openDeleteServiceModal = function(id) {
            serviceToDeleteId = id;
            deleteServiceModal.classList.remove("hidden");
        };

        document.getElementById("btnCancelDeleteService")?.addEventListener("click", () => deleteServiceModal.classList.add("hidden"));
        document.getElementById("btnConfirmDeleteService")?.addEventListener("click", () => {
            if (serviceToDeleteId) {
                services = services.filter(s => s.id !== serviceToDeleteId);
                serviceToDeleteId = null;
                renderServices();
            }
            deleteServiceModal.classList.add("hidden");
        });

        serviceSearchInput?.addEventListener("input", renderServices);
        serviceStatusFilter?.addEventListener("change", renderServices);

        renderServices();
    }
});