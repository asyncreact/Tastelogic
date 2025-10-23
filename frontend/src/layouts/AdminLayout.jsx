import Navbar from "../components/NavbarAdmin";

export default function AdminLayout({ children }) {
  return (
    <div>
      <Navbar />
      <main style={{ padding: "20px" }}>{children}</main>
    </div>
  );
}
