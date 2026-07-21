import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import SelectPage from "./pages/SelectPage";
import AiSetPage from "./pages/AiSetPage";
import CoachSetPage from "./pages/CoachSetPage";
import CoachViewPage from "./pages/CoachVeiwPage";


const App = () => {
  return (
    <>
      <Navbar />

      <div className="h-screen">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/select" element={<SelectPage />} />
          <Route path="/ai-set" element={<AiSetPage />} />
          <Route path="/coach-set" element={<CoachSetPage />} />
          <Route path="/coach-view" element={<CoachViewPage />} />
        </Routes>
      </div>
    </>
  );
};

export default App;