/* August — Account page
   Renders from the same localStorage profile the auth modal writes.
   Orders are static prototype data in account.html. */
document.addEventListener("DOMContentLoaded", () => {
  const page = document.querySelector(".account-page");
  if (!page) return;

  const gate = page.querySelector("[data-account-signed-out]");
  const dash = page.querySelector("[data-account-signed-in]");

  const load = () => {
    try {
      return JSON.parse(localStorage.getItem("august_user"));
    } catch {
      return null;
    }
  };

  const monthYear = (ts) => {
    if (!ts) return "September 2026";
    return new Date(ts).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const set = (sel, text) => {
    const el = page.querySelector(sel);
    if (el) el.textContent = text;
  };

  const render = () => {
    const user = load();
    if (gate) gate.hidden = !!user;
    if (dash) dash.hidden = !user;
    if (!user) return;

    set("[data-account-first]", user.name.split(" ")[0]);
    set("[data-account-email]", user.email);
    set("[data-account-name]", user.name);
    set("[data-account-email-2]", user.email);
    set("[data-account-since]", monthYear(user.createdAt));
  };

  render();
  window.addEventListener("august:profile-changed", render);
});
