import { HashRouter, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Header from "./Header";

import Batching from "./components/Batching";

function App() {
  return (
    <div className="App">
      <HashRouter>
        <Header />
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route exact path="/batching" element={<Batching />} />
        </Routes>
      </HashRouter>
    </div>
  );
}

export default App;
