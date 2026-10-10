"use client";
import { useEffect } from "react";

// Sets body[data-tenant="colt"] so palette overrides reach portal-rendered
// widgets (ChatWidget, DiscordGate) that escape the .colt-shell wrapper.
export default function BodyTenantMarker() {
  useEffect(() => {
    document.body.dataset.tenant = "colt";
    return () => { delete document.body.dataset.tenant; };
  }, []);
  return null;
}
