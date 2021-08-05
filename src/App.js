import "./App.css";
import { HeaderComponent } from "./components/HeaderComponent";

function App() {
  return (
    <div className="App">
      <HeaderComponent />
      <div className="container">
        <div className="steps">
          <div className="script">
            <h4>Test Script</h4>
            <textarea id="code"></textarea>
          </div>
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
