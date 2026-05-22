const NotFound = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      fontFamily: "Arial, sans-serif",
      color: "#333",
    }}
  >
    <h1 style={{ fontSize: "4rem", margin: "0" }}>404</h1>
    <p style={{ fontSize: "1.5rem", margin: "10px 0" }}>Page not found</p>
    <a
      href="/"
      style={{
        textDecoration: "none",
        color: "#007bff",
        fontSize: "1.2rem",
        border: "1px solid #007bff",
        padding: "10px 20px",
        borderRadius: "5px",
      }}
    >
      Go Home
    </a>
  </div>
);

export default NotFound;
