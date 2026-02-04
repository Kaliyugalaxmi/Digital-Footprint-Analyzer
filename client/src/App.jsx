import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import DeepScan from "./pages/DeepScan";
import DeepScanUI from "./pages/DeepScanUI";
import AppNavbar from "./components/AppNavbar";

function App() {
  return (
    <BrowserRouter>
      <AppNavbar /> {/* Navbar shown on all pages */}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/scan" element={<DeepScan />} />
        <Route path="/loading" element={<DeepScanUI />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
