import "./App.css";
import { Header } from "./components/Header";
import { Snippet } from "./components/Snippet";

function App() {
  return (
    <div className="App">
      <Header />
      <div className="container">
        <div className="steps">
          <Snippet />
          <div className="output">
            <h4>Test Result</h4>
            <textarea id="results"></textarea>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
