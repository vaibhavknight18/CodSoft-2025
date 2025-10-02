import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from "react-router-dom";

/* ===========================
   GLOBAL STYLES
=========================== */
const styles = `
body { 
  margin:0; 
  font-family: 'Segoe UI', Tahoma, sans-serif; 
  background: #f9f9fb; 
}

/* Navbar */
.navbar { 
  display:flex; 
  justify-content:space-between; 
  align-items:center; 
  padding:1rem 2rem; 
  background: linear-gradient(90deg,#4f46e5,#06b6d4); 
  color:white; 
}
.logo { font-weight:bold; font-size:1.3rem; color:white; text-decoration:none; }
.navlink { margin-left:1rem; color:white; text-decoration:none; font-weight:500; }

/* Container (center content) */
.container { 
  max-width:800px; 
  margin:2rem auto; 
  padding:1.5rem; 
  text-align:center; 
}

/* Typography */
.title { font-size:2.4rem; margin:0.5rem 0; color:#333; font-weight:700; }
.subtitle { color:#555; margin-bottom:2rem; font-size:1.1rem; }

/* Buttons */
.actions { display:flex; gap:1rem; justify-content:center; margin-top:1rem; flex-wrap:wrap; }
.btn { 
  padding:0.7rem 1.4rem; 
  border:none; 
  border-radius:8px; 
  cursor:pointer; 
  font-size:1rem; 
  margin-top:0.5rem; 
  transition: all .2s ease; 
}
.btn.primary { background:#4f46e5; color:white; }
.btn.primary:hover { background:#4338ca; transform:scale(1.05); }
.btn.secondary { background:#06b6d4; color:white; }
.btn.secondary:hover { background:#0891b2; transform:scale(1.05); }
.btn.option { display:block; width:100%; margin-top:0.5rem; background:#f3f4f6; border:1px solid #ddd; text-align:center; }
.btn.option:hover { background:#e0e7ff; }

/* Inputs */
.input { 
  width:100%; 
  padding:0.6rem; 
  margin-top:0.6rem; 
  border:1px solid #ccc; 
  border-radius:6px; 
  font-size:1rem; 
}
.input.small { width:70%; display:inline-block; }

/* Card */
.card { 
  background:white; 
  padding:1.2rem; 
  border-radius:12px; 
  margin:1rem auto; 
  box-shadow:0 2px 8px rgba(0,0,0,0.1); 
  text-align:left; 
  max-width:650px;
}

/* Quiz List Card Links */
.link-card { display:block; text-decoration:none; color:inherit; }
.link-card:hover { background:#f3f4f6; }

/* Responsive Fix */
@media (max-width:600px) {
  .title { font-size:1.8rem; }
  .container { padding:1rem; }
  .card { padding:1rem; }
}
`;

/* ===========================
   STORAGE HELPERS
=========================== */
const load = (key, def) => {
  try { return JSON.parse(localStorage.getItem(key)) || def; } 
  catch { return def; }
};
const save = (key, val) => localStorage.setItem(key, JSON.stringify(val));

/* ===========================
   PAGES
=========================== */
function Home() {
  return (
    <div className="container">
      <h1 className="title">🎉 Welcome to Quiz Maker</h1>
      <p className="subtitle">Create quizzes or test yourself instantly!</p>
      <div className="actions">
        <Link to="/create" className="btn primary">Create a Quiz</Link>
        <Link to="/quizzes" className="btn secondary">Take a Quiz</Link>
      </div>
    </div>
  );
}

function CreateQuiz() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([{ q: "", options: ["", "", "", ""], answer: 0 }]);

  function addQuestion() {
    setQuestions([...questions, { q: "", options: ["", "", "", ""], answer: 0 }]);
  }

  function saveQuiz() {
    const quizzes = load("quizzes", []);
    const newQuiz = { id: Date.now().toString(), title, questions };
    quizzes.push(newQuiz);
    save("quizzes", quizzes);
    alert("Quiz saved!");
    navigate("/quizzes");
  }

  return (
    <div className="container">
      <h2 className="title">📝 Create a Quiz</h2>
      <input className="input" placeholder="Quiz Title" value={title} onChange={e=>setTitle(e.target.value)} />
      {questions.map((q, idx)=>(
        <div key={idx} className="card">
          <input className="input" placeholder={`Question ${idx+1}`} value={q.q} 
            onChange={e=>{
              const copy=[...questions]; copy[idx].q=e.target.value; setQuestions(copy);
            }} />
          {q.options.map((opt,oIdx)=>(
            <input key={oIdx} className="input small" placeholder={`Option ${oIdx+1}`} 
              value={opt}
              onChange={e=>{
                const copy=[...questions]; copy[idx].options[oIdx]=e.target.value; setQuestions(copy);
              }} />
          ))}
          <select className="input" value={q.answer}
            onChange={e=>{
              const copy=[...questions]; copy[idx].answer=parseInt(e.target.value); setQuestions(copy);
            }}>
            {q.options.map((_,oIdx)=><option key={oIdx} value={oIdx}>Correct: Option {oIdx+1}</option>)}
          </select>
        </div>
      ))}
      <div className="actions">
        <button onClick={addQuestion} className="btn secondary">+ Add Question</button>
        <button onClick={saveQuiz} className="btn primary">Save Quiz</button>
      </div>
    </div>
  );
}

function QuizList() {
  const quizzes = load("quizzes", []);
  return (
    <div className="container">
      <h2 className="title">📚 Available Quizzes</h2>
      {quizzes.map(q=>(
        <Link to={`/quiz/${q.id}`} key={q.id} className="card link-card">
          <h3>{q.title}</h3>
          <p>{q.questions.length} questions</p>
        </Link>
      ))}
      {!quizzes.length && <p className="subtitle">No quizzes yet. Create one!</p>}
    </div>
  );
}

function TakeQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const quiz = load("quizzes", []).find(q=>q.id===id);
  const [idx,setIdx]=useState(0);
  const [score,setScore]=useState(0);
  const [finished,setFinished]=useState(false);

  if(!quiz) return <div className="container"><p>Quiz not found</p></div>;

  const current=quiz.questions[idx];

  function answer(i){
    if(i===current.answer) setScore(score+1);
    if(idx+1<quiz.questions.length) setIdx(idx+1);
    else setFinished(true);
  }

  return (
    <div className="container">
      <h2 className="title">{quiz.title}</h2>
      {!finished ? (
        <div className="card">
          <h3>{current.q}</h3>
          {current.options.map((opt,i)=>(
            <button key={i} onClick={()=>answer(i)} className="btn option">{opt}</button>
          ))}
        </div>
      ):(
        <div className="card">
          <h3>✅ Finished!</h3>
          <p>You scored {score} / {quiz.questions.length}</p>
          <button className="btn primary" onClick={()=>navigate("/quizzes")}>Back to Quizzes</button>
        </div>
      )}
    </div>
  );
}

/* ===========================
   MAIN APP
=========================== */
export default function App() {
  useEffect(()=>{
    const style=document.createElement("style");
    style.innerHTML=styles;
    document.head.appendChild(style);
  },[]);

  return (
    <Router>
      <nav className="navbar">
        <Link to="/" className="logo">QuizMaker</Link>
        <div>
          <Link to="/" className="navlink">Home</Link>
          <Link to="/create" className="navlink">Create</Link>
          <Link to="/quizzes" className="navlink">Quizzes</Link>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateQuiz />} />
        <Route path="/quizzes" element={<QuizList />} />
        <Route path="/quiz/:id" element={<TakeQuiz />} />
      </Routes>
    </Router>
  );
}
