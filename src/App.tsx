import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import QuotationPreviewPage from "./components/preview";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/preview/:id" element={<QuotationPreviewPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;