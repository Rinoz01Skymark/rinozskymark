import { serviceCategories, services } from "./services.js";

let identity = null;
const builtinServices = services.map(service => ({ ...service }));

const state = {
  user: null,
  selectedService: null,
  visibleServices: 12,
  authMode: "login",
  recoveryActive: false,
  inviteToken: null,
  modalTrigger: null,
  pendingService: ""
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function escapeHtml(value = "") {
  return String(value).replace(/[&<>'"]/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  })[character]);
}

function toast(message) {
  const element = $("#toast");
  element.textContent = message;
  element.classList.add("show");
  window.clearTimeout(toast.timeout);
  toast.timeout = window.setTimeout(() => element.classList.remove("show"), 3600);
}

function setStatus(element, message = "", type = "") {
  element.textContent = message;
  element.className = `form-status ${type}`.trim();
}

function openModal(id) {
  state.modalTrigger = document.activeElement;
  const modal = $(`#${id}`);
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  const focusTarget = $("input, button, select, textarea", modal);
  focusTarget?.focus();
}

function closeModal(modal) {
  if (modal.id === "authModal") $("#authPassword").value = "";
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  if (!$(".modal.open")) document.body.classList.remove("modal-open");
  state.modalTrigger?.focus();
}

function renderCategoryStrip() {
  $("#categoryStrip").innerHTML = serviceCategories.map(category => `
    <a href="#services" data-category-link="${escapeHtml(category.name)}">
      <span>${category.icon}</span>${escapeHtml(category.name)}
    </a>
  `).join("");
}

function filteredServices() {
  const query = $("#serviceSearch").value.trim().toLowerCase();
  const category = $("#categoryFilter").value;
  return services.filter(service => {
    const searchable = `${service.title} ${service.category} ${service.description}`.toLowerCase();
    return (!query || searchable.includes(query)) && (!category || service.category === category);
  });
}

function renderServices(reset = false) {
  if (reset) state.visibleServices = 12;
  const filtered = filteredServices();
  const visible = filtered.slice(0, state.visibleServices);
  $("#serviceCount").textContent = `${filtered.length} service${filtered.length === 1 ? "" : "s"} available`;
  $("#serviceGrid").innerHTML = visible.length ? visible.map(service => `
    <button class="service-card" type="button" data-service-id="${service.id}" aria-label="View ${escapeHtml(service.title)} details">
      <span class="service-card__image"><img src="${escapeHtml(service.image)}" alt="${escapeHtml(service.imageAlt)}" loading="lazy" width="600" height="360"></span>
      <span class="service-card__body">
        <span class="tag">${escapeHtml(service.category)}</span>
        <h3>${escapeHtml(service.title)}</h3>
        <p>${escapeHtml(service.description)}</p>
        <span class="service-card__link">Explore service →</span>
      </span>
    </button>
  `).join("") : `<div class="empty-state"><h3>No matching services</h3><p>Try another keyword or browse all categories.</p></div>`;
  $("#loadMoreServices").classList.toggle("hidden", visible.length >= filtered.length);
}

function populateServiceSelects() {
  const previousCategory = $("#categoryFilter").value;
  $$("[data-service-select]").forEach(select => {
    const previous = select.value || (select.id === "requestService" ? state.pendingService : "");
    select.innerHTML = `<option value="">Select a service</option>${serviceCategories.map(category => `
      <optgroup label="${escapeHtml(category.name)}">
        ${services.filter(service => service.category === category.name).map(service => `<option value="${escapeHtml(service.title)}">${escapeHtml(service.title)}</option>`).join("")}
      </optgroup>
    `).join("")}`;
    if ([...select.options].some(option => option.value === previous)) select.value = previous;
  });
  $("#categoryFilter").innerHTML = `<option value="">All service categories</option>${serviceCategories.map(category => `<option>${escapeHtml(category.name)}</option>`).join("")}`;
  $("#categoryFilter").value = previousCategory;
  $("#adminServiceCategory").innerHTML = serviceCategories.map(category => `<option>${escapeHtml(category.name)}</option>`).join("");
}

async function syncDatabaseServices() {
  try {
    const rows = await api("services");
    const combined = new Map(builtinServices.map(service => [service.title.toLowerCase(), service]));
    for (const row of rows) {
      const category = serviceCategories.find(item => item.name === row.category) || serviceCategories[0];
      combined.set(row.title.toLowerCase(), {
        id: `db-${row.id}`,
        title: row.title,
        category: row.category,
        description: row.shortDescription,
        fullDescription: row.fullDescription,
        features: row.features?.length ? row.features : category.features,
        benefits: row.benefits?.length ? row.benefits : category.benefits,
        suitableCustomer: row.suitableCustomer || category.suitable,
        turnaround: row.estimatedTurnaround || "Confirmed after requirements review",
        pricing: row.pricing || "Custom quote",
        image: row.imageUrl || category.image,
        imageAlt: row.imageAlt || category.alt
      });
    }
    services.splice(0, services.length, ...combined.values());
    populateServiceSelects();
    renderServices(true);
  } catch {
  }
}

function showService(service) {
  state.selectedService = service;
  $("#serviceModalImage").src = service.image;
  $("#serviceModalImage").alt = service.imageAlt;
  $("#serviceModalCategory").textContent = service.category;
  $("#serviceModalTitle").textContent = service.title;
  $("#serviceModalDescription").textContent = service.fullDescription;
  $("#serviceModalFeatures").innerHTML = service.features.map(item => `<li>${escapeHtml(item)}</li>`).join("");
  $("#serviceModalBenefits").innerHTML = service.benefits.map(item => `<li>${escapeHtml(item)}</li>`).join("");
  $("#serviceModalSuitable").textContent = service.suitableCustomer;
  $("#modalRequestButton").dataset.serviceTitle = service.title;
  openModal("serviceModal");
}

function authErrorMessage(error) {
  if (error?.name === "MissingIdentityError") return "Customer accounts are not enabled on this site yet. Please contact us on WhatsApp.";
  if (error?.name !== "AuthError") return "Authentication is temporarily unavailable. Please retry or contact us on WhatsApp.";
  if (error.status === 401) return "The email or password is incorrect.";
  if (error.status === 403) return "This action is not currently allowed for the site.";
  if (error.status === 422) return "Please check the information and password requirements.";
  return error.message;
}

function setAuthMode(mode) {
  state.authMode = mode;
  const isSignup = mode === "signup";
  $("#authTitle").textContent = isSignup ? "Create your customer account" : "Welcome back";
  $("#authNameField").classList.toggle("hidden", !isSignup);
  $("#authPhoneField").classList.toggle("hidden", !isSignup);
  $("#authSubmit").textContent = isSignup ? "Create account" : "Sign in";
  $("#authName").required = isSignup;
  $("#authPassword").autocomplete = isSignup ? "new-password" : "current-password";
  $("#authPassword").minLength = isSignup ? 8 : 1;
  $("#forgotPassword").classList.toggle("hidden", isSignup);
  $$("[data-auth-tab]").forEach(button => button.classList.toggle("active", button.dataset.authTab === mode));
  setStatus($("#authStatus"));
}

function hasAdminRole(user) {
  const roles = user?.roles || user?.appMetadata?.roles || [];
  return roles.includes("admin") || user?.role === "admin";
}

async function api(path, options = {}) {
  const response = await fetch(`/api/${path}`, {
    credentials: "same-origin",
    ...options,
    headers: options.body instanceof FormData ? options.headers : { "Content-Type": "application/json", ...options.headers }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || "The request could not be completed.");
    error.status = response.status;
    throw error;
  }
  return data;
}

function updateAuthUi() {
  const signedIn = Boolean(state.user);
  $("#signInButton").classList.toggle("hidden", signedIn);
  $("#signUpButton").classList.toggle("hidden", signedIn);
  $("#logoutButton").classList.toggle("hidden", !signedIn);
  $("#accountButton").classList.toggle("hidden", !signedIn);
  $("#accountButton").textContent = state.user?.name || state.user?.email || "My account";
  $("#requestAuthNotice").classList.toggle("hidden", signedIn);
  $("#requestForm").classList.toggle("hidden", !signedIn);
  $("#dashboardGate").classList.toggle("hidden", signedIn);
  $("#customerDashboard").classList.toggle("active", signedIn);
  $("#adminArea").classList.toggle("hidden", !hasAdminRole(state.user));
  $("#adminServicesArea").classList.toggle("hidden", !hasAdminRole(state.user));
  $("#adminLegacyArea").classList.toggle("hidden", !hasAdminRole(state.user));
  $$("[data-guest-only]").forEach(element => element.classList.toggle("hidden", signedIn));
  $$("[data-member-only]").forEach(element => element.classList.toggle("hidden", !signedIn));
  if (!signedIn) {
    $("#requestHistory").innerHTML = "";
    $("#adminRequests").innerHTML = "";
    $("#adminServiceList").innerHTML = "";
    $("#legacyRecords").innerHTML = "";
    $("#profileForm").reset();
    $("#requestForm").reset();
    $("#legacyHistory").innerHTML = "";
    $$("[data-dashboard-panel]").forEach(panel => panel.classList.toggle("hidden", panel.dataset.dashboardPanel !== "history"));
  }
  if (signedIn) {
    $("#requestEmail").value = state.user.email || "";
    $("#requestName").value = state.user.name || state.user.userMetadata?.full_name || "";
  }
}

async function hydrateUser() {
  state.user = identity ? await identity.getUser() : null;
  updateAuthUi();
  if (state.user) await loadDashboard();
}

async function loadDashboard() {
  try {
    const [account, requests] = await Promise.all([api("me"), api("serviceRequests")]);
    state.user = { ...state.user, ...account.identity };
    const profile = account.profile || {};
    $("#profileName").value = account.account?.name || state.user.name || "";
    $("#profilePhone").value = account.account?.phone || "";
    $("#profileCompany").value = profile.company || account.account?.company || "";
    $("#profileIndustry").value = profile.industry || "";
    $("#profileBusinessType").value = profile.businessType || "";
    $("#profileLocation").value = profile.location || "";
    renderRequests(requests);
    await loadLegacyHistory();
    if (hasAdminRole(state.user)) await Promise.all([loadAdminRequests(), loadAdminServices()]);
  } catch (error) {
    if (error.status === 401) { state.user = null; updateAuthUi(); }
    $("#requestHistory").innerHTML = `<div class="empty-state"><p>${escapeHtml(error.message)}</p></div>`;
    toast(error.message);
  }
}

function statusClass(status = "") {
  if (status === "Completed") return "status--completed";
  if (["In Progress", "Awaiting Customer"].includes(status)) return "status--progress";
  if (status === "Cancelled") return "status--cancelled";
  return "";
}

function renderRequests(requests) {
  const target = $("#requestHistory");
  if (!requests.length) {
    target.innerHTML = `<div class="empty-state"><h3>No service requests yet</h3><p>Your submitted requests and status updates appear here.</p></div>`;
    return;
  }
  target.innerHTML = `<div class="table-wrap"><table><thead><tr><th>Reference</th><th>Service</th><th>Status</th><th>Submitted</th><th>Documents</th></tr></thead><tbody>${requests.map(request => `
    <tr><td>RZ-${String(request.id).padStart(5, "0")}</td><td><strong>${escapeHtml(request.serviceTitle)}</strong><br>${escapeHtml(request.description).slice(0, 80)}</td><td><span class="status ${statusClass(request.status)}">${escapeHtml(request.status)}</span></td><td>${new Date(request.createdAt).toLocaleDateString()}</td><td>${(request.documentNames || []).map((name, index) => `<a href="/api/document?requestId=${request.id}&index=${index}">${escapeHtml(name)}</a>`).join("<br>") || "—"}</td></tr>
  `).join("")}</tbody></table></div>`;
}

async function loadAdminRequests() {
  const requests = await api("adminRequests");
  $("#adminRequests").innerHTML = requests.length ? `<div class="table-wrap"><table><thead><tr><th>Client</th><th>Request</th><th>Status</th><th>Update</th></tr></thead><tbody>${requests.map(request => `
    <tr><td><strong>${escapeHtml(request.name)}</strong><br>${escapeHtml(request.email)}<br>${escapeHtml(request.phone)}</td><td>RZ-${String(request.id).padStart(5, "0")} · ${escapeHtml(request.serviceTitle)}<br>${escapeHtml(request.description).slice(0, 110)}${(request.documentNames || []).length ? `<br>${request.documentNames.map((name, index) => `<a href="/api/document?requestId=${request.id}&index=${index}">${escapeHtml(name)}</a>`).join(" · ")}` : ""}</td><td><span class="status ${statusClass(request.status)}">${escapeHtml(request.status)}</span></td><td><form data-status-form="${request.id}"><select class="select-control" name="status">${["Pending", "Received", "In Progress", "Awaiting Customer", "Completed", "Cancelled"].map(status => `<option${status === request.status ? " selected" : ""}>${status}</option>`).join("")}</select><button class="button button--dark button--small" type="submit">Save</button></form></td></tr>
  `).join("")}</tbody></table></div>` : `<div class="empty-state"><h3>No requests received</h3></div>`;
}

async function loadAdminServices() {
  const rows = await api("services");
  $("#adminServiceList").innerHTML = rows.length ? `<div class="table-wrap"><table><thead><tr><th>Service</th><th>Category</th><th>Status</th></tr></thead><tbody>${rows.map(row => `<tr><td><strong>${escapeHtml(row.title)}</strong><br>${escapeHtml(row.shortDescription)}</td><td>${escapeHtml(row.category)}</td><td><span class="status">${row.active ? "Active" : "Inactive"}</span></td></tr>`).join("")}</tbody></table></div>` : `<div class="empty-state"><p>No database-managed services yet. The built-in catalogue remains visible.</p></div>`;
}

async function loadLegacyHistory() {
  const [bookings, documents] = await Promise.all([api("bookings"), api("documents")]);
  $("#legacyHistory").innerHTML = `<h3>Earlier bookings & document records</h3>${bookings.length || documents.length ? `<div class="table-wrap"><table><thead><tr><th>Record</th><th>Details</th><th>Status</th></tr></thead><tbody>${bookings.map(booking => `<tr><td>Booking #${booking.id}</td><td>${escapeHtml(booking.serviceRequired)}</td><td>${escapeHtml(booking.status)}</td></tr>`).join("")}${documents.map(document => `<tr><td>Document #${document.id}</td><td>${escapeHtml(document.fileName)}</td><td>${escapeHtml(document.status)}</td></tr>`).join("")}</tbody></table></div>` : `<p>No earlier bookings or document records are linked to your verified email.</p>`}`;
}

async function loadLegacyRecords(resource) {
  $("#legacyRecords").textContent = "Loading records…";
  try {
    const rows = await api(resource);
    if (resource === "analytics") {
      $("#legacyRecords").innerHTML = `<h3>${rows.total} service requests</h3><p>${Object.entries(rows.statuses).map(([status, count]) => `${escapeHtml(status)}: ${count}`).join(" · ")}</p>`;
      return;
    }
    $("#legacyRecords").innerHTML = rows.length ? `<div class="table-wrap"><table><thead><tr><th>ID</th><th>Name / Title</th><th>Details</th><th>Status</th></tr></thead><tbody>${rows.map(row => `<tr><td>${row.id}</td><td>${escapeHtml(row.name || row.title || row.clientName || row.fileName || "")}</td><td>${escapeHtml(row.message || row.description || row.excerpt || row.email || row.testimonialText || row.serviceRequired || "")}</td><td>${escapeHtml(row.status || row.category || row.role || (row.published ? "Published" : ""))}</td></tr>`).join("")}</tbody></table></div>` : `<p>No saved records in this section.</p>`;
  } catch (error) { $("#legacyRecords").textContent = error.message; }
}

async function loadApprovedTestimonials() {
  try {
    const testimonials = await api("testimonials");
    if (!testimonials.length) return;
    $("#approvedTestimonials").innerHTML = testimonials.map(item => `<article class="quote-card"><blockquote>${escapeHtml(item.testimonialText)}</blockquote><footer>${escapeHtml(item.clientName)}${item.clientCompany ? ` · ${escapeHtml(item.clientCompany)}` : ""}</footer></article>`).join("");
  } catch { return; }
}

async function submitNetlifyForm(form) {
  const data = new FormData(form);
  const response = await fetch("/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams([...data.entries()].filter(([, value]) => typeof value === "string")).toString()
  });
  if (!response.ok) throw new Error("Your message could not be confirmed.");
}

function bindEvents() {
  $("#menuToggle").addEventListener("click", () => {
    const open = $("#navLinks").classList.toggle("open");
    $("#menuToggle").setAttribute("aria-expanded", String(open));
  });
  $$("#navLinks a").forEach(link => link.addEventListener("click", () => { $("#navLinks").classList.remove("open"); $("#menuToggle").setAttribute("aria-expanded", "false"); }));
  $$("[data-open-auth]").forEach(button => button.addEventListener("click", () => { setAuthMode(button.dataset.openAuth); openModal("authModal"); }));
  $$("[data-close-modal]").forEach(button => button.addEventListener("click", () => closeModal(button.closest(".modal"))));
  $$(".modal").forEach(modal => modal.addEventListener("click", event => { if (event.target === modal) closeModal(modal); }));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") $$(".modal.open").forEach(closeModal);
    const modal = $(".modal.open");
    if (event.key !== "Tab" || !modal) return;
    const controls = $$("a[href], button:not([disabled]), input:not([disabled]), select, textarea", modal).filter(element => element.getClientRects().length);
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  });

  $("#serviceSearch").addEventListener("input", () => renderServices(true));
  $("#categoryFilter").addEventListener("change", () => renderServices(true));
  $("#loadMoreServices").addEventListener("click", () => { state.visibleServices += 12; renderServices(); });
  $("#categoryStrip").addEventListener("click", event => {
    const link = event.target.closest("[data-category-link]");
    if (!link) return;
    $("#categoryFilter").value = link.dataset.categoryLink;
    renderServices(true);
  });
  $("#serviceGrid").addEventListener("click", event => {
    const card = event.target.closest("[data-service-id]");
    if (card) showService(services.find(service => service.id === card.dataset.serviceId));
  });
  $("#modalRequestButton").addEventListener("click", event => {
    closeModal($("#serviceModal"));
    $("#requestService").value = event.currentTarget.dataset.serviceTitle;
    state.pendingService = event.currentTarget.dataset.serviceTitle;
    document.location.hash = "request";
  });

  $$("[data-auth-tab]").forEach(button => button.addEventListener("click", () => setAuthMode(button.dataset.authTab)));
  $("#authForm").addEventListener("submit", async event => {
    event.preventDefault();
    const submit = $("#authSubmit");
    const status = $("#authStatus");
    submit.disabled = true;
    setStatus(status, "Connecting securely…");
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      if (!identity) throw new Error("Authentication unavailable");
      if (state.authMode === "signup") {
        const user = await identity.signup(data.email, data.password, { full_name: data.name, phone: data.phone });
        if (!user.confirmedAt) {
          setStatus(status, "Account created. Check your email to confirm it before signing in.", "success");
          return;
        }
      } else {
        await identity.login(data.email, data.password);
      }
      closeModal($("#authModal"));
      await hydrateUser();
      $("#authForm").reset();
      toast(state.authMode === "signup" ? "Your account is ready." : "Welcome back.");
    } catch (error) {
      setStatus(status, authErrorMessage(error), "error");
    } finally {
      submit.disabled = false;
    }
  });
  $("#forgotPassword").addEventListener("click", async () => {
    const email = $("#authEmail").value;
    if (!email) return setStatus($("#authStatus"), "Enter your email address first.", "error");
    try {
      await identity.requestPasswordRecovery(email);
      setStatus($("#authStatus"), "Password recovery email sent.", "success");
    } catch (error) {
      setStatus($("#authStatus"), authErrorMessage(error), "error");
    }
  });
  $("#resetForm").addEventListener("submit", async event => {
    event.preventDefault();
    const password = new FormData(event.currentTarget).get("password");
    try {
      if (state.inviteToken) {
        await identity.acceptInvite(state.inviteToken, password);
        state.inviteToken = null;
      } else {
        await identity.updateUser({ password });
      }
      state.recoveryActive = false;
      $("#resetPanel").classList.add("hidden");
      toast("Password updated successfully.");
      await hydrateUser();
    } catch (error) {
      setStatus($("#resetStatus"), authErrorMessage(error), "error");
    }
  });
  $("#logoutButton").addEventListener("click", async () => {
    try {
      await identity.logout();
      state.user = null;
      updateAuthUi();
      toast("You are signed out.");
    } catch (error) { toast(authErrorMessage(error)); }
  });
  $("#accountButton").addEventListener("click", () => { document.location.hash = "dashboard"; });

  $("#requestForm").addEventListener("submit", async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const submit = $("button[type='submit']", form);
    const status = $("#requestStatus");
    const files = $("#requestFiles").files;
    if (files.length > 5 || [...files].reduce((total, file) => total + file.size, 0) > 4 * 1024 * 1024) return setStatus(status, "Attach up to 5 files, with a combined size of 4 MB or less.", "error");
    submit.disabled = true;
    setStatus(status, "Submitting your request securely…");
    try {
      const created = await api("serviceRequests", { method: "POST", body: new FormData(form) });
      setStatus(status, `Request RZ-${String(created.id).padStart(5, "0")} received successfully.`, "success");
      form.reset();
      $("#requestEmail").value = state.user.email || "";
      $("#requestName").value = state.user.name || "";
      await loadDashboard();
    } catch (error) {
      setStatus(status, error.message, "error");
    } finally {
      submit.disabled = false;
    }
  });

  $("#profileForm").addEventListener("submit", async event => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      await api("profile", { method: "PATCH", body: JSON.stringify(data) });
      await identity.updateUser({ data: { full_name: data.name, phone: data.phone } });
      setStatus($("#profileStatus"), "Profile updated.", "success");
      await hydrateUser();
    } catch (error) {
      setStatus($("#profileStatus"), error.message, "error");
    }
  });

  $("#adminRequests").addEventListener("submit", async event => {
    const form = event.target.closest("[data-status-form]");
    if (!form) return;
    event.preventDefault();
    try {
      await api(`adminRequests?id=${form.dataset.statusForm}`, { method: "PATCH", body: JSON.stringify({ status: new FormData(form).get("status") }) });
      toast("Request status updated.");
      await Promise.all([loadAdminRequests(), loadDashboard()]);
    } catch (error) {
      toast(error.message);
    }
  });

  $("#adminServiceForm").addEventListener("submit", async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    try {
      await api("services", { method: "POST", body: JSON.stringify({ ...data, fullDescription: data.shortDescription, pricing: "Custom quote" }) });
      setStatus($("#adminServiceStatus"), "Service added to the database catalogue.", "success");
      form.reset();
      await Promise.all([loadAdminServices(), syncDatabaseServices()]);
    } catch (error) {
      setStatus($("#adminServiceStatus"), error.message, "error");
    }
  });

  $$("[data-dashboard-view]").forEach(button => button.addEventListener("click", () => {
    $$("[data-dashboard-panel]").forEach(panel => panel.classList.toggle("hidden", panel.dataset.dashboardPanel !== button.dataset.dashboardView));
  }));
  $$('[data-legacy-resource]').forEach(button => button.addEventListener('click', () => loadLegacyRecords(button.dataset.legacyResource)));

  $("#contactForm").addEventListener("submit", async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const status = $("#contactStatus");
    try {
      try {
        await api("inquiries", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(form))) });
        submitNetlifyForm(form).catch(() => null);
      } catch { await submitNetlifyForm(form); }
      setStatus(status, "Thank you. Your message has been received.", "success");
      form.reset();
    } catch {
      setStatus(status, "We could not confirm the message. Please use WhatsApp for urgent support.", "error");
    }
  });
}

async function init() {
  renderCategoryStrip();
  populateServiceSelects();
  renderServices();
  bindEvents();
  syncDatabaseServices();
  loadApprovedTestimonials();
  try {
    identity = await import("https://esm.sh/@netlify/identity@1.2.0");
    const callback = await identity.handleAuthCallback();
    if (callback?.type === "recovery") {
      state.recoveryActive = true;
      $("#resetPanel").classList.remove("hidden");
      document.location.hash = "dashboard";
      toast("Choose a new password to complete recovery.");
    } else if (callback?.type === "confirmation") {
      toast("Email confirmed. Your account is ready.");
    } else if (callback?.type === "invite") {
      state.inviteToken = callback.token;
      $("#resetTitle").textContent = "Set your account password";
      $("#resetPanel").classList.remove("hidden");
      document.location.hash = "dashboard";
      toast("Set a password to accept your invitation.");
    }
  } catch (error) {
    toast(authErrorMessage(error));
  }
  await hydrateUser();
}

init();
