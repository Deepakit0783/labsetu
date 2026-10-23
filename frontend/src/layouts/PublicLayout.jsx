import { Outlet } from "react-router-dom";
import Navbar from "../components/customer/Navbar";
import Footer from "../components/customer/Footer";

export default function PublicLayout() {
  return (
    <>
      <div id="top" />
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}