import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchCustomerById, previewQuotation } from "@/api/pdfService";

const BRAND = "#a10018";

export default function QuotationPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const [html, setHtml]       = useState<string | null>(null);
  const [error, setError]     = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setError("No quotation ID was provided in the link.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const customer = await fetchCustomerById(id);
        const previewHtml = await previewQuotation(customer.data);
        if (!cancelled) setHtml(previewHtml);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load this quotation.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [id]);

  /* ---------- Loading state ---------- */
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 16,
        background: "#fdf0f2", fontFamily: "'Montserrat', sans-serif",
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: "50%",
          border: `4px solid ${BRAND}33`, borderTopColor: BRAND,
          animation: "qp-spin 0.8s linear infinite",
        }} />
        <p style={{ color: "#7a4500", fontSize: 14, margin: 0 }}>
          Loading quotation preview…
        </p>
        <style>{`@keyframes qp-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* ---------- Error state ---------- */
  if (error) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 8,
        fontFamily: "'Montserrat', sans-serif", textAlign: "center", padding: 24,
      }}>
        <p style={{ color: BRAND, fontWeight: 600, fontSize: 15 }}>
          This quotation link doesn't work.
        </p>
        <p style={{ color: "#9a6070", fontSize: 13 }}>{error}</p>
      </div>
    );
  }

  /* ---------- Loaded HTML (full document from BE) ---------- */
  return (
    <iframe
      title="Quotation Preview"
      srcDoc={html ?? ""}
      style={{ width: "100vw", height: "100vh", border: "none", display: "block" }}
    />
  );
}