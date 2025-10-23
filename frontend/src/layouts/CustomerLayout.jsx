import Navbar from "../components/NavbarCustomer";

export default function CustomerLayout({ children }) {
  return (
    <div>
      <Navbar />
      <main style={{ padding: "20px" }}>{children}</main>
    </div>
  );
}
