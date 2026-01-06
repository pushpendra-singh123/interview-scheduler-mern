import "./index.css";
import SlotList from "./pages/SlotList";

function App() {
  return (
    <div className="app-container">
      <div className="app-header">
        <h1 className="app-title">Interview Scheduler</h1>
        <div className="app-sub">Book an available interview slot</div>
      </div>
      <div className="card">
        <SlotList />
      </div>
    </div>
  );
}

export default App;
