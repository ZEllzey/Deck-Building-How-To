/**
 * Tutorial framework — TOC active state on scroll, smooth in-page navigation.
 * <script src="js/tutorial.js" defer></script>
 */
(function () {
  "use strict";

  var root = document.querySelector("[data-tutorial-root]");
  if (!root) return;

  var toc = root.querySelector(".tutorial-toc");
  if (!toc) return;

  var links = toc.querySelectorAll('a[href^="#"]');
  if (!links.length) return;

  var ids = [];
  links.forEach(function (a) {
    var id = a.getAttribute("href").slice(1);
    if (id) ids.push(id);
  });

  var sections = ids
    .map(function (id) {
      return document.getElementById(id);
    })
    .filter(Boolean);

  function setActive(id) {
    links.forEach(function (a) {
      var href = a.getAttribute("href");
      a.classList.toggle("is-active", href === "#" + id);
    });
  }

  if (!sections.length) return;

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    },
    { rootMargin: "-40% 0px -45% 0px", threshold: 0 }
  );

  sections.forEach(function (el) {
    observer.observe(el);
  });

  // Initial state: first visible section
  setActive(sections[0].id);
})();
