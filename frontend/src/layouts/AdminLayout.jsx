// src/layouts/AdminLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";

export default function AdminLayout() {
  return (
    <>
      <AdminNavbar />
      <main className="admin-main">
        <Outlet />
      </main>
    </>
  );
}
