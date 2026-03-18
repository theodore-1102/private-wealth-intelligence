"use client";

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    window.location.replace("/index.html");
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1 style={{ marginBottom: "12px" }}>Opening dashboard...</h1>
        <p style={{ marginBottom: "16px", color: "#4b5563" }}>
          If you are not redirected automatically, continue below.
        </p>
        <a href="/index.html">Go to the dashboard</a>
      </div>
    </main>
  );
}
