import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axiosClient";
import { toast } from "react-toastify";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);
      const [pRes, rRes] = await Promise.all([
        api.get("/api/projects"),
        api.get("/api/insights/project-risk"),
      ]);
      setProjects(pRes.data || []);
      setRisks(rRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const riskMap = new Map(
    risks.map((r) => [Number(r.project_id), r])
  );

  if (loading) return <div className="theme-text-primary">Loading projects...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold theme-text-primary">Projects</h1>

      <div className="theme-bg-secondary rounded-xl theme-shadow-md p-4 overflow-x-auto border theme-border-light">
        <table className="min-w-full text-xs">
          <thead>
            <tr className="border-b theme-border-light theme-bg-tertiary">
              <th className="text-left py-2 px-2 theme-text-secondary">Name</th>
              <th className="text-left py-2 px-2 theme-text-secondary">Budget</th>
              <th className="text-left py-2 px-2 theme-text-secondary">Actual Cost</th>
              <th className="text-left py-2 px-2 theme-text-secondary">Status</th>
              <th className="text-left py-2 px-2 theme-text-secondary">Progress</th>
              <th className="text-left py-2 px-2 theme-text-secondary">Risk</th>
              <th className="text-left py-2 px-2"></th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => {
              const r = riskMap.get(p.id);
              return (
                <tr key={p.id} className="border-b theme-border-light last:border-b-0">
                  <td className="py-2 px-2 theme-text-primary">{p.name}</td>
                  <td className="py-2 px-2 theme-text-primary">₹{p.budget}</td>
                  <td className="py-2 px-2 theme-text-primary">₹{p.actual_cost}</td>
                  <td className="py-2 px-2 theme-text-secondary">{p.status}</td>
                  <td className="py-2 px-2 theme-text-secondary">
                    {p.actual_progress ?? 0}% / {p.planned_progress ?? 0}%
                  </td>
                  <td className="py-2 px-2">
                    {r ? (
                      <span
                        className={
                          r.risk_level === "High" || r.risk_level === "Critical"
                            ? "text-red-500 font-semibold"
                            : "text-amber-500"
                        }
                      >
                        {r.risk_level} ({r.risk_score})
                      </span>
                    ) : (
                      <span className="theme-text-muted text-xs">
                        Not calculated
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-2 text-right">
                    <Link
                      to={`/projects/${p.id}`}
                      className="text-xs theme-text-accent hover:underline"
                    >
                      Details
                    </Link>
                  </td>
                </tr>
              );
            })}
            {projects.length === 0 && (
              <tr>
                <td colSpan={7} className="py-4 text-center theme-text-muted">
                  No projects yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
