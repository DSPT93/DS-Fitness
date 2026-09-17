import { useEffect, useState } from "react";
import identity, { initIdentity } from "./identity";

// Tracks the signed-in Netlify Identity user (undefined while unknown, null
// when signed out). Shared by any page that gates content behind Identity
// (Admin, Members).
export function useIdentityUser() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const onInit = (u) => setUser(u ?? null);
    const onLogin = (u) => {
      setUser(u);
      identity.close();
    };
    const onLogout = () => setUser(null);

    identity.on("init", onInit);
    identity.on("login", onLogin);
    identity.on("logout", onLogout);
    initIdentity();

    // The widget's `init` event depends on reaching this site's Identity
    // endpoint. If that's slow, unreachable, or Identity isn't enabled yet,
    // fall back to whatever the widget already knows rather than leaving
    // the page stuck on "Loading..." forever.
    const fallback = setTimeout(() => {
      setUser((current) => (current === undefined ? identity.currentUser() ?? null : current));
    }, 2000);

    return () => {
      clearTimeout(fallback);
      identity.off("init", onInit);
      identity.off("login", onLogin);
      identity.off("logout", onLogout);
    };
  }, []);

  return user;
}
