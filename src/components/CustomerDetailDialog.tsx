import type { CustomerData } from "@/api/pdfService";

function fmt(n?: number | string) {
  return Number(n || 0).toLocaleString("en-IN");
}

function fmtDate(d?: string) {
  if (!d) return "—";
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? d : dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="text-[11px] font-bold text-[#a10018] tracking-widest uppercase border-b-2 border-[#f5c6ce] pb-1.5 mb-3 font-serif">
        {title}
      </div>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="flex gap-2 mb-1.5 text-sm">
      <span className="min-w-[140px] text-[#9a6070] font-serif text-[11px] font-semibold uppercase tracking-wide pt-0.5">
        {label}
      </span>
      <span className="text-[#2a0008] font-serif text-sm font-medium">
        {value || "—"}
      </span>
    </div>
  );
}

interface Props {
  customer: CustomerData & { _id?: string };
  onClose: () => void;
}

export default function CustomerDetailDialog({ customer: c, onClose }: Props) {
  const total    = c.total ?? 0;
  const discount = c.discount ?? 0;
  const pkg      = c.totalPackage ?? 0;
  const balance  = (c as unknown as Record<string, number>)["balanceAmount"] ?? (total - (c.advancePaid ?? 0));

  const pricingRows = [
    { label: "Total Package",  value: `₹ ${fmt(pkg)}`,          highlight: false },
    { label: "Discount",       value: `₹ ${fmt(discount)}`,     highlight: false },
    { label: "Package Value",  value: `₹ ${fmt(total)}`,        highlight: true  },
    { label: "Advance Paid",   value: `₹ ${fmt(c.advancePaid)}`,highlight: false },
    { label: "Balance",        value: `₹ ${fmt(balance)}`,      highlight: true  },
  ];

  return (
    /* Backdrop */
    <div
      onClick={onClose}
      className="fixed inset-0 z-[1000] bg-[rgba(30,0,10,0.45)] flex items-center justify-center p-4"
    >
      {/* Panel */}
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl font-serif"
      >
        {/* Header */}
        <div className="bg-[#a10018] px-7 py-[18px] rounded-t-2xl flex justify-between items-center">
          <div>
            <div className="text-lg font-semibold text-white tracking-wide">
              {c.customerName}
            </div>
            <div className="text-[11px] text-white/70 mt-0.5 tracking-widest uppercase">
              Quotation Details
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-white/15 border-none text-white w-[34px] h-[34px] rounded-full cursor-pointer text-lg leading-[34px] text-center hover:bg-white/25 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-7 py-6">

          {/* Customer Details */}
          <Section title="Customer Details">
            <div className="grid grid-cols-2 gap-x-6">
              <Row label="Customer Name" value={c.customerName} />
              <Row label="Event Type"    value={c.eventType} />
              <Row label="Event Date"    value={fmtDate(c.eventDate)} />
              <Row label="Location"      value={c.location} />
              <Row label="Bride"         value={c.brideName} />
              <Row label="Groom"         value={c.groomName} />
            </div>
            {c.notes && <Row label="Notes" value={c.notes} />}
          </Section>

          {/* Events */}
          {c.events && c.events.length > 0 && (
            <Section title="Events">
              {c.events.map((ev, i) => (
                <div
                  key={i}
                  className={`border-[1.5px] border-[#f5c6ce] rounded-xl p-4 mb-3 ${i % 2 === 0 ? "bg-[#fdf0f2]" : "bg-white"}`}
                >
                  <div className="font-bold text-[#a10018] text-[13px] tracking-wide mb-2 uppercase">
                    Event {i + 1} — {ev.eventName || "Unnamed"}
                  </div>
                  <div className="grid grid-cols-2 gap-x-6">
                    <Row label="Venue"    value={ev.venueName} />
                    <Row label="Location" value={ev.venueLocation} />
                    <Row label="Date"     value={fmtDate(ev.date)} />
                    <Row label="Start"    value={ev.startTime} />
                    <Row label="End"      value={ev.endTime} />
                    <Row label="Crowd"    value={String(ev.crowdStrength || "—")} />
                  </div>

                  {ev.services && ev.services.length > 0 && (
                    <div className="mt-3">
                      <div className="text-[11px] font-bold text-[#9a6070] tracking-widest uppercase mb-1.5">
                        Services
                      </div>
                      <table className="w-full border-collapse text-xs">
                        <thead>
                          <tr className="bg-[#a10018]">
                            <th className="px-2.5 py-1.5 text-white text-left font-semibold text-[11px]">Service</th>
                            <th className="px-2.5 py-1.5 text-white text-center font-semibold text-[11px] w-20">Cameras</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ev.services.map((s, si) => (
                            <tr
                              key={si}
                              className={`border-b border-[#f5c6ce] ${si % 2 === 0 ? "bg-white" : "bg-[#fdf0f2]"}`}
                            >
                              <td className="px-2.5 py-1.5 text-[#2a0008]">{s.service}</td>
                              <td className="px-2.5 py-1.5 text-center text-[#2a0008]">{s.cameras}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </Section>
          )}

          {/* Video Deliverables */}
          {c.videoDeliverables && c.videoDeliverables.length > 0 && (
            <Section title="Video Deliverables">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-[#a10018]">
                    <th className="px-2.5 py-1.5 text-white text-left font-semibold text-[11px]">Name</th>
                    <th className="px-2.5 py-1.5 text-white text-center font-semibold text-[11px] w-14">Qty</th>
                    <th className="px-2.5 py-1.5 text-white text-left font-semibold text-[11px]">Event</th>
                  </tr>
                </thead>
                <tbody>
                  {c.videoDeliverables.map((v, i) => (
                    <tr key={i} className={`border-b border-[#f5c6ce] ${i % 2 === 0 ? "bg-white" : "bg-[#fdf0f2]"}`}>
                      <td className="px-2.5 py-1.5">{v.name}</td>
                      <td className="px-2.5 py-1.5 text-center">{v.qty}</td>
                      <td className="px-2.5 py-1.5">{v.eventName || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          )}

          {/* Photo Deliverables */}
          {c.photoDeliverables && c.photoDeliverables.length > 0 && (
            <Section title="Photo Deliverables">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-[#a10018]">
                    <th className="px-2.5 py-1.5 text-white text-left font-semibold text-[11px]">Name</th>
                    <th className="px-2.5 py-1.5 text-white text-center font-semibold text-[11px] w-14">Qty</th>
                    <th className="px-2.5 py-1.5 text-white text-center font-semibold text-[11px] w-20">Photos</th>
                    <th className="px-2.5 py-1.5 text-white text-left font-semibold text-[11px]">Event</th>
                  </tr>
                </thead>
                <tbody>
                  {c.photoDeliverables.map((p, i) => (
                    <tr key={i} className={`border-b border-[#f5c6ce] ${i % 2 === 0 ? "bg-white" : "bg-[#fdf0f2]"}`}>
                      <td className="px-2.5 py-1.5">{p.name}</td>
                      <td className="px-2.5 py-1.5 text-center">{p.qty}</td>
                      <td className="px-2.5 py-1.5 text-center">{p.photosCount || "—"}</td>
                      <td className="px-2.5 py-1.5">{p.eventName || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          )}

          {/* Pricing Summary */}
          <Section title="Pricing Summary">
            <div className="border-[1.5px] border-[#f5c6ce] rounded-xl p-5 bg-[#fdf0f2] space-y-2">
              {pricingRows.map(({ label, value, highlight }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className={`text-[11px] font-bold tracking-widest uppercase font-serif ${highlight ? "text-[#a10018]" : "text-[#6a3040]"}`}>
                    {label}
                  </span>
                  <span className={`font-serif font-semibold ${highlight ? "text-[#a10018] text-lg" : "text-[#4a2030] text-sm"}`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </Section>

        </div>
      </div>
    </div>
  );
}