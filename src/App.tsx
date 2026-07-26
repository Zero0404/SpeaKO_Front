import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import SelectPage from "./pages/SelectPage";

import AiSetPage from "./pages/AiSetPage";
import AiLoading from './pages/AiLoading';

import CoachSetPage from "./pages/CoachSetPage";
import CoachViewPage from "./pages/CoachVeiwPage";
import CoachLoadingPage from "./pages/CoachLoading";

import FeedbackFileUploadPage from "./pages/FeedbackFileUploadPage";
import { FeedbackLoadingPage } from "./pages/FeedbackLoadingPage";

import MyPage from "./pages/MyPage";


const App = () => {
  return (
    <>
      <Navbar />

      <div className="h-screen">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/select" element={<SelectPage />} />

          <Route path="/ai-set" element={<AiSetPage />} />
          <Route path="/ai-loading" element={<AiLoading isOpen={true} />} />

          <Route path="/coach-set" element={<CoachSetPage />} />
          <Route path="/coach-loading" element={<CoachLoadingPage />} />  
          <Route path="/coach-view" element={<CoachViewPage />} />

          <Route path="/feedback-fileupload" element={<FeedbackFileUploadPage />} />
          <Route path="/feedback-loading" element={<FeedbackLoadingPage />} />

          <Route path="/mypage" element={<MyPage />} />
          </Routes>

      </div>
    </>
  );
};

export default App;