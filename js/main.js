(() => {
  "use strict";

  // ==========================================================================
  // 1. NAVEGACIÓN MÓVIL (Con gestión de foco y accesibilidad)
  // ==========================================================================
  const menuToggle = document.querySelector(".menu-toggle");
  const navMenu = document.querySelector("#nav-menu");

  if (menuToggle && navMenu) {
    const closeMenu = () => {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Abrir menú de navegación");
      navMenu.classList.remove("is-open");
      document.body.classList.remove("menu-open");
      menuToggle.focus(); 
    };

    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Abrir menú de navegación" : "Cerrar menú de navegación");
      navMenu.classList.toggle("is-open", !isOpen);
      document.body.classList.toggle("menu-open", !isOpen);
      
      if (!isOpen) {
        const firstLink = navMenu.querySelector("a");
        if (firstLink) firstLink.focus();
      }
    });

    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && navMenu.classList.contains("is-open")) {
        closeMenu();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 768 && navMenu.classList.contains("is-open")) {
        closeMenu();
      }
    });
  }

  // ==========================================================================
  // 2. FILTRADO DE PROYECTOS (Con transiciones suaves)
  // ==========================================================================
  const filterButtons = document.querySelectorAll("[data-filter]");
  const projectCards = document.querySelectorAll(".project-card[data-category]");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;

      filterButtons.forEach((item) => {
        const isActive = item === button;
        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-pressed", String(isActive));
      });

      projectCards.forEach((card) => {
        const isVisible = filter === "todos" || card.dataset.category === filter;
        
        if (isVisible) {
          card.classList.remove("is-hidden");
          card.removeAttribute("hidden");
        } else {
          card.classList.add("is-hidden");
          // Espera a que termine la transición CSS (300ms) antes de ocultar del DOM
          setTimeout(() => {
            if (!card.classList.contains("is-hidden")) return;
            card.setAttribute("hidden", "true");
          }, 300);
        }
      });
    });
  });

  // ==========================================================================
  // 3. ANIMACIONES AL HACER SCROLL (Intersection Observer)
  // ==========================================================================
  const revealItems = document.querySelectorAll(".reveal");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if ("IntersectionObserver" in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          currentObserver.unobserve(entry.target); // Dejar de observar para ahorrar recursos
        }
      });
    }, { 
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px" // Se activa un poco antes de llegar
    });

    revealItems.forEach((item) => observer.observe(item));
  } else {
    // Fallback para navegadores antiguos o usuarios que prefieren reducir movimiento
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  // ==========================================================================
  // 4. FORMULARIO DE CONTACTO (Integración robusta con Formspree)
  // ==========================================================================
  const form = document.querySelector("#contact-form");
  const formStatus = document.querySelector("#form-status");

  if (form && formStatus) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      // 1. Validación nativa del navegador
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      // 2. Verificación Honeypot (Anti-spam silencioso)
      const honeypot = form.querySelector('input[name="website_url"]');
      if (honeypot && honeypot.value.trim() !== "") {
        console.warn("🚫 Spam detectado (Honeypot activado). Envío cancelado.");
        return;
      }

      // 3. Preparar UI para estado de carga
      const submitBtn = form.querySelector(".submit-button");
      const btnText = submitBtn.querySelector(".btn-text");
      const btnLoader = submitBtn.querySelector(".btn-loader");
      const originalBtnText = btnText.textContent;

      submitBtn.disabled = true;
      btnText.textContent = "Enviando...";
      btnLoader.classList.add("is-active");
      formStatus.textContent = "Procesando tu mensaje...";
      formStatus.className = "form-status";

      try {
        // 4. Enviar a Formspree (URL tomada del atributo action del form)
        const response = await fetch(form.action, {
          method: "POST",
          headers: { 
            "Accept": "application/json"
          },
          body: new FormData(form),
        });

        const data = await response.json();

        if (response.ok) {
          // Éxito
          formStatus.textContent = "✅ ¡Mensaje enviado con éxito! Te contactaré en menos de 24 horas.";
          formStatus.classList.add("success");
          form.reset();
        } else {
          // Error del servidor
          throw new Error(data.error || "Error al enviar el mensaje");
        }

      } catch (error) {
        // Manejo de errores
        console.error("Error al enviar el formulario:", error);
        formStatus.textContent = "❌ Hubo un problema al enviar el mensaje. Por favor, intenta nuevamente o escríbeme directamente al correo.";
        formStatus.classList.add("error");
      } finally {
        // 5. Restaurar UI siempre, haya éxito o error
        submitBtn.disabled = false;
        btnText.textContent = originalBtnText;
        btnLoader.classList.remove("is-active");
      }
    });
  }

  // ==========================================================================
  // 5. RESALTADO DE NAVEGACIÓN ACTIVA AL HACER SCROLL (Scroll Spy)
  // ==========================================================================
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-menu a[href^='#']");

  const activateNavOnScroll = () => {
    const scrollY = window.pageYOffset;

    sections.forEach((section) => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 150; // Ajuste por el header sticky de 78px
      const sectionId = section.getAttribute("id");

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach((link) => {
          link.style.opacity = "0.7"; // Estado inactivo
          if (link.getAttribute("href") === `#${sectionId}`) {
            link.style.opacity = "1"; // Estado activo
            link.style.fontWeight = "600";
          } else {
            link.style.fontWeight = "500";
          }
        });
      }
    });
  };

  // Ejecutar al cargar y al hacer scroll
  window.addEventListener("scroll", activateNavOnScroll);
  activateNavOnScroll(); // Ejecución inicial

  // ==========================================================================
  // 6. ACTUALIZACIÓN DINÁMICA DEL AÑO EN EL FOOTER
  // ==========================================================================
  // Busca el elemento con id="year" o la etiqueta <time> en el footer como fallback
  const yearElement = document.querySelector("#year") || document.querySelector("footer time");
  if (yearElement) {
    yearElement.textContent = String(new Date().getFullYear());
    if (yearElement.tagName === "TIME") {
      yearElement.setAttribute("datetime", String(new Date().getFullYear()));
    }
  }

})();