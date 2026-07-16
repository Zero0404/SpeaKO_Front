import { BrowserRouter, Routes, Route } from "react-router-dom";
// import SelectPage from "./pages/SelectPage";
// import AiSetPage from "./pages/AiSetPage";
import Navbar from "./components/Navbar";

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<SelectPage />} />
        
//         <Route path="/ai-set" element={<AiSetPage />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

function App() {
  return (
    <BrowserRouter>
      <Navbar />
    </BrowserRouter>
  );
}

export default App;