import { Outlet } from "react-router-dom";
import GuestNav from "./GuestNav";

function GuestLayout() {
  return (
    <>
      <GuestNav />
      <main style={{ marginTop: 80 }}>
        <Outlet />
      </main>
    </>
  );
}

export default GuestLayout;
