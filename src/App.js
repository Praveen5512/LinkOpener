import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Home";

import Batching from "./components/Batching";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/LinkOpener" element={<Home />} />
          <Route path="/LinkOpener/batching" element={<Batching />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
