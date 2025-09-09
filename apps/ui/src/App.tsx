import { Route, Routes } from "react-router-dom";
import { PrivateRoute } from "./components/PrivateRoute";
import { HomePage } from "./pages/HomePage.tsx";
import { LoginPage } from "./pages/LoginPage.tsx";

export default function App() {
  return (
    <>
      {/* Live region for screen reader announcements */}
      <div
        id="live-region"
        aria-live="polite"
        aria-atomic="true"
        className="live-region"
      />

      <div className="container-app">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<HomePage />} />
          </Route>
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </div>
    </>
  );
}
