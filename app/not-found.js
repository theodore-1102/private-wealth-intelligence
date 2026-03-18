export default function NotFound() {
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
        <h1 style={{ marginBottom: "12px" }}>Page not found</h1>
        <p style={{ marginBottom: "16px", color: "#4b5563" }}>
          The page you requested does not exist.
        </p>
        <a href="/index.html">Return to the dashboard</a>
      </div>
    </main>
  );
}
