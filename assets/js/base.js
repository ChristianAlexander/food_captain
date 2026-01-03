// Include phoenix_html to handle method=PUT/DELETE in forms and buttons.
import "phoenix_html";

// Handle flash close
document.querySelectorAll("[role=alert][data-flash]").forEach((el) => {
  el.addEventListener("click", () => {
    el.setAttribute("hidden", "");
  });
});
