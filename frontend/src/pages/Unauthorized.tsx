import React from "react";

const NoAccess: React.FC = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Access Denied</h1>
      <p style={styles.message}>
        You do not have permission to access this page. Contact a UCAR
        administrator.
      </p>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    textAlign: "center" as const,
    backgroundColor: "#f8f9fa",
    color: "#343a40",
  },
  header: {
    fontSize: "2rem",
    marginBottom: "1rem",
  },
  message: {
    fontSize: "1.25rem",
  },
};

export default NoAccess;
