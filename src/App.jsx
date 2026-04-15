import { HashRouter, Routes, Route } from "react-router-dom";
import UnifiedHome from "./pages/UnifiedHome";
import CreateLeader from "./pages/CreateLeader";
import LeaderDashboard from "./pages/LeaderDashboard";
import RaidSignup from "./pages/RaidSignup";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<UnifiedHome />} />
        <Route path="/create" element={<CreateLeader />} />
        <Route path="/leader/:shareId" element={<LeaderDashboard />} />
        <Route path="/r/:shareId" element={<RaidSignup />} />
      </Routes>
    </HashRouter>
  );
}
