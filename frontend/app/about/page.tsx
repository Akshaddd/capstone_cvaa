export default function AboutPage() {
  return (
    <>
      <style>{`
        .about-wrap { max-width: 760px; margin: 0 auto; padding: 48px 24px 80px; }
        .page-header { margin-bottom: 40px; }
        .page-header h1 { font-family: 'DM Serif Display', Georgia, serif; font-size: 36px; font-weight: 400; letter-spacing: -0.02em; color: #1D1D1F; margin-bottom: 8px; }
        .page-header p { font-size: 15px; color: #6E6E73; }
        .card { background: white; border-radius: 20px; padding: 32px; border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 2px 12px rgba(0,0,0,0.04); margin-bottom: 20px; }
        .card h2 { font-size: 19px; font-weight: 600; letter-spacing: -0.02em; color: #1D1D1F; margin-bottom: 12px; }
        .card p { font-size: 15px; color: #6E6E73; line-height: 1.7; margin-bottom: 12px; }
        .card p:last-child { margin-bottom: 0; }
        .tech-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 12px; margin-top: 16px; }
        .tech-item { background: #F5F5F7; border-radius: 12px; padding: 16px; }
        .tech-name { font-size: 14px; font-weight: 600; color: #1D1D1F; margin-bottom: 4px; }
        .tech-desc { font-size: 13px; color: #86868B; }
        .team-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin-top: 16px; }
        .team-item { background: #F5F5F7; border-radius: 12px; padding: 16px; text-align: center; }
        .team-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #007AFF, #5856D6); display: flex; align-items: center; justify-content: center; color: white; font-size: 16px; font-weight: 600; margin: 0 auto 10px; }
        .team-name { font-size: 14px; font-weight: 600; color: #1D1D1F; margin-bottom: 2px; }
        .team-role { font-size: 12px; color: #86868B; }
        .dsapt-link { color: #007AFF; text-decoration: none; border-bottom: 1px solid rgba(0,122,255,0.3); }
        .dsapt-link:hover { border-color: #007AFF; }
        @media (max-width: 600px) { .tech-grid { grid-template-columns: 1fr; } .team-grid { grid-template-columns: repeat(2,1fr); } }
      `}</style>

      <div className="about-wrap">
        <div className="page-header">
          <h1>About</h1>
          <p>Learn about the project, the technology, and the team</p>
        </div>

        {/* Project */}
        <div className="card">
          <h2>The Project</h2>
          <p>
            The DSAPT Accessibility Scanner is a proof-of-concept system developed at 
            La Trobe University in collaboration with DITRDCA. It uses computer vision 
            to automatically assess accessibility features and barriers within public 
            transport infrastructure.
          </p>
          <p>
            The system detects key accessibility elements relevant to the{" "}
            <a className="dsapt-link" href="https://www.legislation.gov.au/Details/F2011L01302" target="_blank" rel="noopener noreferrer">
              Disability Standards for Accessible Public Transport (DSAPT)
            </a>{" "}
            and generates structured reports that map detected features to specific standard clauses.
          </p>
          <p>
            The goal is to demonstrate how automated accessibility assessment could reduce 
            the cost, effort, and inconsistency of current manual auditing practices — 
            particularly as operators prepare for the 2025 DSAPT reporting reforms.
          </p>
        </div>

        {/* Tech Stack */}
        <div className="card">
          <h2>Technology Stack</h2>
          <p>Built with modern, lightweight tools to ensure the system runs on standard hardware at low cost.</p>
          <div className="tech-grid">
            {[
              { name: "YOLOv11", desc: "Computer vision model for object detection" },
              { name: "FastAPI", desc: "Python backend with automatic API documentation" },
              { name: "Next.js", desc: "React frontend framework for the web interface" },
              { name: "Docker", desc: "Containerisation for consistent deployments" },
              { name: "Ultralytics", desc: "YOLOv11 training and inference library" },
              { name: "Roboflow", desc: "Dataset management and model training" },
            ].map((t, i) => (
              <div key={i} className="tech-item">
                <p className="tech-name">{t.name}</p>
                <p className="tech-desc">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="card">
          <h2>The Team</h2>
          <p>Built by a team of La Trobe University students as part of a capstone project.</p>
          <div className="team-grid">
            {[
              { name: "Pasan", role: "Scrum Master · Backend", initial: "P" },
              { name: "Pragna", role: "Frontend · UI Design", initial: "Pr" },
              { name: "Rui", role: "Security · CI/CD", initial: "R" },
              { name: "Nadil", role: "ML · Model Training", initial: "N" },
              { name: "Akshad", role: "Backend · Reports", initial: "A" },
            ].map((m, i) => (
              <div key={i} className="team-item">
                <div className="team-avatar">{m.initial}</div>
                <p className="team-name">{m.name}</p>
                <p className="team-role">{m.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* DSAPT */}
        <div className="card">
          <h2>About DSAPT</h2>
          <p>
            The Disability Standards for Accessible Public Transport (DSAPT) set out 
            the requirements that operators and providers of public transport must meet 
            to ensure their services are accessible to people with disability.
          </p>
          <p>
            From 2025, operators will be required to report on the accessibility features 
            of their networks and identify any barriers. This scanner is designed to help 
            operators meet those requirements more efficiently.
          </p>
        </div>
      </div>
    </>
  );
}
