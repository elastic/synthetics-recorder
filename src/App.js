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
        <div className="recorder-table">
          <h4>Action Logger</h4>
          <table style={{ textAlign: "center" }} id="records">
            <thead>
              <tr>
                <th>Command</th>
                <th>Target</th>
                <th>Value</th>
              </tr>
            </thead>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
