// Tutorial website framework: TOC active state + smooth hash navigation.
(function () {
  "use strict";

  var root = document.querySelector("[data-tutorial-root]");
  if (!root) return;

  var toc = root.querySelector(".toc");
  if (!toc) return;

  var links = toc.querySelectorAll('a[href^="#"]');
  if (!links.length) return;

  var ids = [];
  links.forEach(function (a) {
    var href = a.getAttribute("href");
    if (!href) return;
    var id = href.slice(1);
    if (id) ids.push(id);
  });

  var sections = ids
    .map(function (id) {
      return document.getElementById(id);
    })
    .filter(Boolean);

  if (!sections.length) return;

  function setActive(id) {
    links.forEach(function (a) {
      a.classList.toggle("is-active", a.getAttribute("href") === "#" + id);
    });
  }

  // Keep TOC in sync with scroll position.
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { rootMargin: "-40% 0px -45% 0px", threshold: 0 }
  );

  sections.forEach(function (el) {
    observer.observe(el);
  });

  // Optional: smooth-scroll when clicking TOC.
  toc.addEventListener("click", function (e) {
    var target = e.target;
    if (!(target instanceof HTMLAnchorElement)) return;
    var href = target.getAttribute("href");
    if (!href || !href.startsWith("#")) return;
    var id = href.slice(1);
    var el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    history.pushState(null, "", href);
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  setActive(sections[0].id);
})();

