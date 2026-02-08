import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import DeepScan from "./pages/DeepScan";
import DeepScanUI from "./pages/DeepScanUI";
import Report from "./pages/Report";
import AppNavbar from "./components/AppNavbar";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <AppNavbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/scan" element={<DeepScan />} />
        <Route path="/report" element={<Report />} />
        <Route path="/loading" element={<DeepScanUI />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;