import netlifyIdentity from "netlify-identity-widget";

let initialized = false;

export function initIdentity() {
  if (initialized) return netlifyIdentity;
  // Point the widget at this site's own Identity endpoint so it works on
  // whatever domain the site is actually deployed to (custom domains
  // included), without needing to hardcode a URL.
  netlifyIdentity.init({ APIUrl: `${window.location.origin}/.netlify/identity` });
  initialized = true;
  return netlifyIdentity;
}

export function getCurrentUser() {
  return netlifyIdentity.currentUser();
}

export async function getAuthToken() {
  const user = getCurrentUser();
  if (!user) return null;
  try {
    return await user.jwt();
  } catch {
    return null;
  }
}

export function openLogin() {
  initIdentity();
  netlifyIdentity.open("login");
}

export function logout() {
  netlifyIdentity.logout();
}

export default netlifyIdentity;
