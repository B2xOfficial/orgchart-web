import { useEffect, useRef, useState } from "react";
import { OrgChart } from "d3-org-chart";
import * as d3 from "d3";

const API_BASE = import.meta.env.VITE_API_URL;

export default function App() {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;

    async function load() {
      try {
        setError(null);

        if (!API_BASE) {
          throw new Error(
            "Missing VITE_API_URL. Add it in Vercel → Settings → Environment Variables, then redeploy."
          );
        }

        const res = await fetch(`${API_BASE}/api/orgchart`);
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();

        // Clean container on re-renders
        d3.select(el).selectAll("*").remove();

        const chart = new OrgChart()
          .container(el)
          .data(data)
          .nodeWidth(() => 340)
          .nodeHeight(() => 120)
          .childrenMargin(() => 50)
          .compactMarginBetween(() => 40)
          .compactMarginPair(() => 30)
          .nodeContent((d) => {
            const {
              label,
              department,
              location,
              salary,
              comboCode,
              vacant,
            } = d.data;

            const vacText = vacant ? "VACANT" : "";
            const vacColor = vacant ? "#b00020" : "#2e7d32";

            return `
              <div style="border:1px solid #ddd;border-radius:12px;padding:12px;background:#fff;
                          box-shadow:0 1px 4px rgba(0,0,0,0.08);font-family:Arial;width:320px;">
                <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start;">
                  <div style="font-size:14px;font-weight:700;line-height:1.2;">${label}</div>
                  <div style="font-size:11px;font-weight:700;color:${vacColor};">${vacText}</div>
                </div>
                <div style="font-size:12px;color:#444;margin-top:8px;">Dept: ${department ?? ""}</div>
                <div style="font-size:12px;color:#444;">Location: ${location ?? ""}</div>
                <div style="font-size:12px;color:#444;">Salary: ${salary ?? ""}</div>
                <div style="font-size:11px;color:#777;margin-top:8px;">Combo: ${comboCode ?? ""}</div>
              </div>
            `;
          })
          .render();

        chart.fit();
        chartInstance.current = chart;
      } catch (e) {
        console.error(e);
        setError(e.message);
      }
    }

    load();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Org Chart</h2>

      {error && (
        <div style={{ color: "red", marginBottom: 10 }}>
          Error: {error}
        </div>
      )}

      <div ref={chartRef} style={{ height: "80vh", width: "100%" }} />
    </div>
  );
}
