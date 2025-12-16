export default function Planner() {
  return (
    <div className="page">
      <div className="form-box">
        <h1>Plan Your Session</h1>
        <p>Enter details to create your study plan</p>

        <form>
          <div className="group">
            <label>No. of Subjects</label>
            <input type="number" min="1" required />
          </div>

          <div className="group">
            <label>Subjects (comma separated)</label>
            <input type="text" placeholder="Math, History, Science" required />
          </div>

          <div className="group">
            <label>Exam Date</label>
            <input type="date" required />
          </div>

          <div className="group">
            <label>Hours per Day</label>
            <input type="number" min="1" max="16" required />
          </div>

          <div className="group">
            <label>Difficulty Level</label>
            <input type="range" min="1" max="5" />
          </div>

          <div className="group">
            <label>Revision Days Before Exam</label>
            <input type="number" min="0" />
          </div>

          <div className="group">
            <label>Pomodoro Slot (minutes)</label>
            <input type="number" min="10" />
          </div>

          <div className="group">
            <label>Rest Days per Week</label>
            <input type="number" min="0" max="7" />
          </div>

          <button className="submit">Generate Schedule</button>
        </form>
      </div>
    </div>
  );
}
