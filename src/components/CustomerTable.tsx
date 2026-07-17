import { useEffect, useRef, useState } from "react";
import type { CustomerData } from "@/api/pdfService";
import {
  fetchCustomers,
  deleteCustomer,
} from "@/api/pdfService";
import CustomerDetailDialog from "./CustomerDetailDialog";
import { MoreVertical, Eye, Pencil, Trash2, FileText, Share2, Copy, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

/* ------------------------------------------------------------------ */
/* Styles / constants                                                   */
/* ------------------------------------------------------------------ */
const BRAND       = "#a10018";
const BRAND_MID   = "#f5c6ce";
const BRAND_LIGHT = "#fdf0f2";

type Row = CustomerData & { _id?: string };

/* ------------------------------------------------------------------ */
/* Vertical-dots menu                                                   */
/* ------------------------------------------------------------------ */
interface MenuProps {
  onView:    () => void;
  onPreview: () => void;
  onEdit:    () => void;
  onDelete:  () => void;
  onShare:   () => void;
}

function MoreMenu({ onView, onPreview, onEdit, onDelete, onShare }: MenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  /* Close when clicking outside */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const item = (label: string, icon: React.ReactNode, color: string, cb: () => void) => (
    <button
      key={label}
      onClick={() => { setOpen(false); cb(); }}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        width: "100%", padding: "9px 16px",
        background: "none", border: "none", cursor: "pointer",
        fontSize: 13, color,
        fontFamily: "'Montserrat', sans-serif", fontWeight: 500,
        textAlign: "left",
        transition: "background 0.15s",
      }}
      onMouseEnter={e => (e.currentTarget.style.background = BRAND_LIGHT)}
      onMouseLeave={e => (e.currentTarget.style.background = "none")}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        title="More options"
        style={{
          background: open ? BRAND_LIGHT : "none",
          border: `1.5px solid ${open ? BRAND_MID : "transparent"}`,
          borderRadius: 6, width: 32, height: 32,
          cursor: "pointer", color: open ? BRAND : "#9a6070",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.15s",
        }}
      >
        <MoreVertical size={16} />
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute", right: 0, top: 36, zIndex: 200,
          background: "#fff", borderRadius: 10, minWidth: 160,
          boxShadow: "0 8px 32px rgba(161,0,24,0.14), 0 2px 8px rgba(0,0,0,0.08)",
          border: `1.5px solid ${BRAND_MID}`,
          overflow: "hidden",
        }}>
          {item("View",    <Eye      size={15} />, "#1a6fb5", onView)}
          <div style={{ height: 1, background: BRAND_MID, margin: "0 10px" }} />
          {item("Preview", <FileText size={15} />, "#7a4500", onPreview)}
          <div style={{ height: 1, background: BRAND_MID, margin: "0 10px" }} />
          {item("Edit",    <Pencil   size={15} />, "#2a7a2a", onEdit)}
          <div style={{ height: 1, background: BRAND_MID, margin: "0 10px" }} />
          {item("Delete",  <Trash2   size={15} />, BRAND,     onDelete)}
          <div style={{ height: 1, background: BRAND_MID, margin: "0 10px" }} />
          {item("Share",   <Share2   size={15} />, "#7a4500", onShare)}
        </div>
         
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                       */
/* ------------------------------------------------------------------ */
interface TableProps {
  onEdit?: (customer: Row) => void;
}

export default function CustomerTable({ onEdit }: TableProps) {
  const [rows,        setRows]        = useState<Row[]>([]);
  const [detail,      setDetail]      = useState<Row | null>(null);
  const [deleting,    setDeleting]    = useState<string | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareTarget, setShareTarget] = useState<Row | null>(null);
  const [dialogMode, setDialogMode] = useState<"share" | "preview">("share");
  const [selectedTemplateId, setSelectedTemplateId] = useState<"template1" | "template2">("template1");
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);

  const load = async () => {
    try {
      const response = await fetchCustomers();
      setRows(response.data || []);
    } catch (err) {
      console.error("Failed to fetch customers", err);
    }
  };

  useEffect(() => { load(); }, []);

  const normalizeTemplateId = (rawTemplateId?: string | number): "template1" | "template2" => {
    const normalized = String(rawTemplateId ?? "").trim().toLowerCase();
    return normalized === "2" || normalized === "template2" ? "template2" : "template1";
  };

  const buildPreviewLink = (c: Row, templateId: "template1" | "template2") => {
    if (!c._id) return "";
    return `${window.location.origin}/preview/${c._id}?templateId=${encodeURIComponent(templateId)}`;
  };

  const openShareDialog = (c: Row) => {
    const template = normalizeTemplateId(c.templateId);
    setShareTarget(c);
    setDialogMode("share");
    setSelectedTemplateId(template);
    setShareLink(buildPreviewLink(c, template));
    setCopied(false);
    setShareDialogOpen(true);
  };

  const openPreviewDialog = (c: Row) => {
    const template = normalizeTemplateId(c.templateId);
    setShareTarget(c);
    setDialogMode("preview");
    setSelectedTemplateId(template);
    setShareLink(buildPreviewLink(c, template));
    setCopied(false);
    setShareDialogOpen(true);
  };

  const updateTemplateSelection = (value: string) => {
    const template = value === "template2" ? "template2" : "template1";
    setSelectedTemplateId(template);
    if (shareTarget) {
      setShareLink(buildPreviewLink(shareTarget, template));
      setCopied(false);
    }
  };

  const handleCopyShareLink = async () => {
    if (!shareLink) return;
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
  };

  /* ---------- Preview ---------- */
  const handlePreview = async (c: Row) => {
    if (!c._id) return;
    openPreviewDialog(c);
  };
const handleShare = async (c: Row) => {
  if (!c._id) return;
  openShareDialog(c);
};
  /* ---------- Delete ---------- */
  const handleDelete = async (c: Row) => {
    if (!c._id) { alert("Cannot delete: record has no ID."); return; }
    if (!window.confirm(`Delete quotation for "${c.customerName}"? This cannot be undone.`)) return;
    setDeleting(c._id);
    try {
      await deleteCustomer(c._id);
      setRows(r => r.filter(x => x._id !== c._id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error deleting record");
    } finally {
      setDeleting(null);
    }
  };

  /* ---------- Edit — navigate to form with pre-filled data ---------- */
  const handleEdit = (c: Row) => {
    onEdit?.(c);
  };

  /* ---------------------------------------------------------------- */
  /* Render                                                            */
  /* ---------------------------------------------------------------- */
  return (
    <>
      {/* Detail / edit popup */}
      {detail && (
        <CustomerDetailDialog
          customer={detail}
          onClose={() => setDetail(null)}
        />
      )}

      <div style={{
        overflowX: "auto",
        borderRadius: 12,
        border: `1.5px solid ${BRAND_MID}`,
        boxShadow: "0 4px 24px rgba(161,0,24,0.07)",
        background: "#fff",
        fontFamily: "'Cormorant Garamond', Georgia, serif",
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: BRAND }}>
              {["Customer", "Event Type", "Package", "Date", "Total (₹)", "Advance (₹)", "Balance (₹)", ""].map(h => (
                <th key={h} style={{
                  padding: "11px 14px", color: "#fff", textAlign: "left",
                  fontFamily: "'Montserrat', sans-serif", fontWeight: 600, fontSize: 11,
                  letterSpacing: "0.06em", textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: "32px", textAlign: "center", color: "#b08090", fontSize: 14, fontStyle: "italic" }}>
                  No quotations saved yet.
                </td>
              </tr>
            )}
            {rows.map((row, i) => {
              const balance = (row as unknown as Record<string, number>)["balanceAmount"] ?? (row.total - (row.advancePaid ?? 0));
              const isDel   = deleting   === (row._id ?? row.customerName);

              return (
                <tr
                  key={row._id ?? row.customerName + row.eventDate}
                  style={{
                    background: i % 2 === 0 ? "#fff" : BRAND_LIGHT,
                    borderBottom: `1px solid ${BRAND_MID}`,
                    opacity: isDel ? 0.4 : 1,
                    transition: "opacity 0.2s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#fce8ec")}
                  onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? "#fff" : BRAND_LIGHT)}
                >
                  {/* Customer name — clickable to open detail */}
                  <td style={{ padding: "10px 14px", fontWeight: 600, color: BRAND, cursor: "pointer" }}
                      onClick={() => setDetail(row)}>
                    {row.customerName}
                  </td>
                  <td style={{ padding: "10px 14px", color: "#4a2030" }}>{row.eventType}</td>
                  <td style={{ padding: "10px 14px", color: "#4a2030" }}>{row.packageName}</td>
                  <td style={{ padding: "10px 14px", color: "#4a2030", whiteSpace: "nowrap" }}>
                    {row.eventDate ? new Date(row.eventDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                  </td>
                  <td style={{ padding: "10px 14px", color: "#2a0008", fontWeight: 600 }}>
                    {Number(row.total).toLocaleString("en-IN")}
                  </td>
                  <td style={{ padding: "10px 14px", color: "#2a7a2a" }}>
                    {Number(row.advancePaid ?? 0).toLocaleString("en-IN")}
                  </td>
                  <td style={{ padding: "10px 14px", color: balance > 0 ? BRAND : "#2a7a2a", fontWeight: 600 }}>
                    {Number(balance).toLocaleString("en-IN")}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: "8px 14px", whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                      {/* Download button (hidden for now) */}
                      {/*
                      <button
                        onClick={() => handleDownload(row)}
                        title="Download PDF"
                        style={{
                          display: "flex", alignItems: "center", gap: 5,
                          padding: "5px 11px", borderRadius: 6,
                          border: `1.5px solid ${BRAND}`,
                          background: BRAND,
                          color: "#fff",
                          cursor: "pointer",
                          fontSize: 12, fontFamily: "'Montserrat', sans-serif", fontWeight: 600,
                          letterSpacing: "0.04em", transition: "all 0.15s",
                        }}
                      >
                        PDF
                      </button>
                      */}

                      <button
                        onClick={() => openShareDialog(row)}
                        title="Share"
                        style={{
                          display: "flex", alignItems: "center", gap: 5,
                          padding: "5px 11px", borderRadius: 6,
                          border: `1.5px solid ${BRAND}`,
                          background: BRAND,
                          color: "#fff",
                          cursor: "pointer",
                          fontSize: 12, fontFamily: "'Montserrat', sans-serif", fontWeight: 600,
                          letterSpacing: "0.04em", transition: "all 0.15s",
                        }}
                      >
                        <Share2 size={13} />
                        Share
                      </button>

                      {/* Vertical dots menu */}
                      <MoreMenu
                        onView={()    => setDetail(row)}
                        onPreview={() => handlePreview(row)}
                        onEdit={()    => handleEdit(row)}
                        onDelete={()  => handleDelete(row)}
                        onShare={()   => handleShare(row)}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-[560px] border-[#f5c6ce]">
          <DialogHeader>
            <DialogTitle className="text-[#a10018]">
              {dialogMode === "share" ? "Share Quotation Link" : "Preview Quotation"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "share"
                ? "Choose template and copy the preview link to share with customer."
                : "Choose template and open the preview based on selected template."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold tracking-wider uppercase text-[#a10018]">Template</p>
              <Select value={selectedTemplateId} onValueChange={updateTemplateSelection}>
                <SelectTrigger className="w-full border-[#e0c0c5]">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="template1">Template 1</SelectItem>
                  <SelectItem value="template2">Template 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold tracking-wider uppercase text-[#a10018]">Share Link</p>
              <div className="flex gap-2">
                <Input value={shareLink} readOnly className="border-[#e0c0c5]" />
                <Button type="button" onClick={handleCopyShareLink} className="bg-[#a10018] hover:bg-[#8a0014]">
                  <Copy className="size-4" />
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShareDialogOpen(false)}>
              Close
            </Button>
            {dialogMode === "share" && (
              <Button
                type="button"
                className="bg-[#a10018] hover:bg-[#8a0014]"
                onClick={() => {
                  if (!shareLink) return;
                  window.open(shareLink, "_blank", "noopener,noreferrer");
                }}
              >
                <ExternalLink className="size-4" />
                Open Link
              </Button>
            )}
            {dialogMode === "preview" && (
              <Button
                type="button"
                className="bg-[#a10018] hover:bg-[#8a0014]"
                onClick={() => {
                  if (!shareLink) return;
                  window.open(shareLink, "_blank", "noopener,noreferrer");
                }}
              >
                <ExternalLink className="size-4" />
                Open Preview
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}