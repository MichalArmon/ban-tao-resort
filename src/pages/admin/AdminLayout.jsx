import { Outlet } from "react-router-dom";
import PublicNav from "../public/PublicNav";

function AdminLayout() {
  return (
    <>
      <PublicNav sx={{ boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)" }} />
      <main style={{ margin: "120px" }}>
        <Outlet />
      </main>
    </>
  );
}

export default AdminLayout;
