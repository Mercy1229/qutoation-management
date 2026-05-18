import { type ReactNode, useState } from "react";
import { useForm, Controller, useFieldArray, type Control, type FieldErrors, type UseFormWatch } from "react-hook-form";
import type { CustomerData } from "@/api/pdfService";
import { saveCustomer, updateCustomer } from "@/api/pdfService";

type EditData = CustomerData & { _id?: string };

const steps = ["Customer Details", "Event Details", "Deliverables & Pricing"];

type EventService = { service: string; cameras: number | string };
type EventItem = { eventName: string; venueName: string; venueLocation: string; date: string; startTime: string; endTime: string; crowdStrength: number | string; services: EventService[] };
type VideoDeliverable = { name: string; qty: number | string; eventName: string };
type PhotoDeliverable = { name: string; qty: number | string; photosCount: number | string; eventName: string };
type FormValues = {
  customerName: string; eventType: string; eventDate: string; location: string;
  brideName: string; groomName: string; notes: string;
  events: EventItem[];
  videoDeliverables: VideoDeliverable[];
  photoDeliverables: PhotoDeliverable[];
  totalPackage: number | string;
  discount: number | string;
};

// Shared input className
const inputCls = "w-full px-3 py-2 border-[1.5px] border-[#e0c0c5] rounded-lg text-sm text-[#2a0008] bg-white outline-none transition-colors focus:border-[#a10018] font-serif box-border";
const labelCls = "block text-[11px] font-semibold text-[#a10018] tracking-widest uppercase mb-1.5 font-sans";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-4">
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center mb-8 gap-0">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold font-sans transition-all
              ${i <= current ? "bg-[#a10018] border-[2.5px] border-[#a10018] text-white" : "bg-[#e8d0d4] border-[2.5px] border-[#e8d0d4] text-[#b08090]"}
              ${i === current ? "shadow-[0_0_0_4px_rgba(161,0,24,0.13)]" : ""}
            `}>
              {i < current ? "✓" : i + 1}
            </div>
            <span className={`text-[10px] font-semibold tracking-wide uppercase font-sans whitespace-nowrap text-center max-w-[90px]
              ${i <= current ? "text-[#a10018]" : "text-[#b08090]"}`}>
              {s}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`h-0.5 w-14 mb-5 transition-all ${i < current ? "bg-[#a10018]" : "bg-[#e8d0d4]"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function Step1({ control, errors }: { control: Control<FormValues>; errors: FieldErrors<FormValues> }) {
  return (
    <div>
      <div className="">
        <div className="col-span-2 md:col-span-1">
          <Field label="Client Name *">
            <Controller name="customerName" control={control} rules={{ required: "Required" }}
              render={({ field }) => (
                <input {...field} className={`${inputCls} ${errors.customerName ? "border-[#a10018]" : ""}`} placeholder="Full name" />
              )} />
            {errors.customerName && <span className="text-[#a10018] text-[11px] mt-1 block">{errors.customerName.message}</span>}
          </Field>
        </div>

        <div className="col-span-2 md:col-span-1">
          <Field label="Event Type">
            <Controller name="eventType" control={control}
              render={({ field }) => (
                <select {...field} className={`${inputCls} cursor-pointer`}>
                  <option value="">Select event type</option>
                  {["Wedding", "Engagement", "Reception", "Baby Shower", "Birthday", "Corporate", "Other"].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              )} />
          </Field>
        </div>

        <div className="col-span-2 md:col-span-1">
          <Field label="Event Date">
            <Controller name="eventDate" control={control}
              render={({ field }) => <input type="date" {...field} className={inputCls} />} />
          </Field>
        </div>

        <div className="col-span-2 md:col-span-1">
          <Field label="Location">
            <Controller name="location" control={control}
              render={({ field }) => <input {...field} className={inputCls} placeholder="City / Venue city" />} />
          </Field>
        </div>

        <div className="col-span-2 md:col-span-1">
          <Field label="Bride's Name">
            <Controller name="brideName" control={control}
              render={({ field }) => <input {...field} className={inputCls} placeholder="Bride's full name" />} />
          </Field>
        </div>

        <div className="col-span-2 md:col-span-1">
          <Field label="Groom's Name">
            <Controller name="groomName" control={control}
              render={({ field }) => <input {...field} className={inputCls} placeholder="Groom's full name" />} />
          </Field>
        </div>
      </div>

      <Field label="Notes / Special Instructions">
        <Controller name="notes" control={control}
          render={({ field }) => <textarea {...field} rows={3} className={`${inputCls} resize-y`} placeholder="Any special requests..." />} />
      </Field>
    </div>
  );
}

function ServicesTable({ control, eventIndex }: { control: Control<FormValues>; eventIndex: number }) {
  const { fields, append, remove } = useFieldArray({ control, name: `events.${eventIndex}.services` });
  const serviceOptions = ["CANDID PHOTOGRAPHY", "CANDID VIDEOGRAPHY", "TRADITIONAL VIDEOGRAPHY", "TRADITIONAL PHOTOGRAPHY", "DRONE COVERAGE", "ALBUM DESIGN", "HIGHLIGHT VIDEO", "TEASER VIDEO"];

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-white/30">
              <th className="px-2.5 py-2 text-[#2a0008] text-left text-[11px] font-semibold font-sans w-10">S.No</th>
              <th className="px-2.5 py-2 text-[#2a0008] text-left text-[11px] font-semibold font-sans">Service</th>
              <th className="px-2.5 py-2 text-[#2a0008] text-center text-[11px] font-semibold font-sans w-24">Cameras</th>
              <th className="w-9 "></th>
            </tr >
          </thead>
          <tbody>
            {fields.map((item, si) => (
              <tr key={item.id} className={`border-b border-[#f5c6ce]  bg-[#fdf0f2]`}>
                <td className="px-2.5 py-1.5 text-[#2a0008] font-semibold">{si + 1}</td>
                <td className="px-2 py-1.5">
                  <Controller name={`events.${eventIndex}.services.${si}.service`} control={control}
                    render={({ field }) => (
                      <select {...field} className="w-full px-2 py-1.5 border border-[#e0c0c5] rounded-md text-[12px] text-[#2a0008] bg-white outline-none focus:border-[#a10018] cursor-pointer">
                        {serviceOptions.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    )} />
                </td>
                <td className="px-2 py-1.5 text-center">
                  <Controller name={`events.${eventIndex}.services.${si}.cameras`} control={control}
                    render={({ field }) => (
                      <input type="number" min={1} {...field} className="w-16 px-2 py-1.5 border border-[#e0c0c5] rounded-md text-[12px] text-[#2a0008] bg-white text-center outline-none focus:border-[#a10018]" />
                    )} />
                </td>
                <td className="px-1 py-1.5 text-center">
                  {fields.length > 1 && (
                    <button type="button" onClick={() => remove(si)}
                      className="text-[#b08090] hover:text-[#a10018] text-lg bg-transparent border-none cursor-pointer leading-none">
                      ×
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        onClick={() => append({ service: "CANDID PHOTOGRAPHY", cameras: 1 })}
        className="mt-2 px-4 py-1.5 border border-[#a10018] rounded-md bg-transparent text-[#a10018] text-[12px] font-semibold font-sans tracking-wide cursor-pointer hover:bg-[#fdf0f2] transition-colors"
      >
        + Add Service
      </button>
    </div>
  );
}
function Step2({ control }: { control: Control<FormValues> }) {
  const { fields, append, remove } = useFieldArray({ control, name: "events" });

  return (
    <div>
      {fields.map((item, index) => (
        <div key={item.id} className="rounded-xl mb-5 overflow-hidden border-[1.5px] border-[#f5c6ce]">
          {/* Event header — full brand color */}
          <div className="bg-[#a10018] px-5 py-3 flex justify-between items-center">
            <span className="text-[13px] font-bold text-white font-sans tracking-wide uppercase">
              Event {index + 1}
            </span>
            {fields.length > 1 && (
              <button type="button" onClick={() => remove(index)}
                className="text-white/70 hover:text-white text-xl bg-transparent border-none cursor-pointer leading-none px-1">
                ×
              </button>
            )}
          </div>

          {/* Event body — light brand tint */}
          <div className="bg-[#fdf0f2] px-5 py-4">
            <div className="">
              <Field label="Event Name">
                <Controller name={`events.${index}.eventName`} control={control}
                  render={({ field }) => (
                    <select {...field} className={`${inputCls} cursor-pointer`}>
                      <option value="">Select event</option>
                      {["Engagement", "Wedding", "Reception", "Haldi", "Mehndi", "Sangeet", "Other"].map(e => (
                        <option key={e} value={e}>{e}</option>
                      ))}
                    </select>
                  )} />
              </Field>

              <Field label="Venue Name">
                <Controller name={`events.${index}.venueName`} control={control}
                  render={({ field }) => <input {...field} className={inputCls} placeholder="e.g. ITC Grand" />} />
              </Field>

              <Field label="Venue Location">
                <Controller name={`events.${index}.venueLocation`} control={control}
                  render={({ field }) => <input {...field} className={inputCls} placeholder="City / Address" />} />
              </Field>

              <Field label="Date">
                <Controller name={`events.${index}.date`} control={control}
                  render={({ field }) => <input type="date" {...field} className={inputCls} />} />
              </Field>

              <Field label="Start Time">
                <Controller name={`events.${index}.startTime`} control={control}
                  render={({ field }) => <input type="time" {...field} className={inputCls} />} />
              </Field>

              <Field label="End Time">
                <Controller name={`events.${index}.endTime`} control={control}
                  render={({ field }) => <input type="time" {...field} className={inputCls} />} />
              </Field>

              <Field label="Crowd Strength">
                <Controller name={`events.${index}.crowdStrength`} control={control}
                  render={({ field }) => <input type="number" {...field} className={inputCls} placeholder="e.g. 300" />} />
              </Field>
            </div>

            {/* Services sub-section — darker brand strip */}
            <div className="mt-2">
              <div className="bg-[#a10018] rounded-t-lg px-3 py-2">
                <span className="text-[11px] font-bold text-white font-sans tracking-widest uppercase">Services</span>
              </div>
              <div className="rounded-b-lg px-3 py-3 border-[1.5px] border-t-0 border-[#f5c6ce]">
                <ServicesTable control={control} eventIndex={index} />
              </div>
            </div>
          </div>
        </div>
      ))}

      <button type="button"
        onClick={() => append({ eventName: "", venueName: "", venueLocation: "", date: "", startTime: "", endTime: "", crowdStrength: "", services: [{ service: "CANDID PHOTOGRAPHY", cameras: 1 }] })}
        className="w-full py-2.5 border-[1.5px] border-dashed border-[#a10018] rounded-lg bg-[#fdf0f2] text-[#a10018] font-sans font-semibold text-[13px] cursor-pointer tracking-wide hover:bg-[#f5c6ce]/40 transition-colors">
        + Add Another Event
      </button>
    </div>
  );
}

function Step3({ control, watch }: { control: Control<FormValues>; watch: UseFormWatch<FormValues> }) {
  const { fields: videoFields, append: appendVideo, remove: removeVideo } = useFieldArray({ control, name: "videoDeliverables" });
  const { fields: photoFields, append: appendPhoto, remove: removePhoto } = useFieldArray({ control, name: "photoDeliverables" });

 const totalPackage = Number(watch("totalPackage")) || 0;

// discount entered as percentage
const discountPercentage = Number(watch("discount")) || 0;

// calculate discount amount
const discountAmount = (totalPackage * discountPercentage) / 100;

// final package value
const packageValue = Math.max(0, totalPackage - discountAmount);
  const events = watch("events") || [];
  const eventNames = events.map((e: EventItem) => e.eventName).filter(Boolean);

  const theadCls = "px-2.5 py-2 text-white text-left text-[11px] font-semibold font-sans";

  return (
    <div>
      {/* Video Deliverables */}
      <div className="mb-7">
        <div className="flex justify-between items-center mb-2.5">
          <h3 className="text-[13px] font-bold text-[#a10018] font-sans tracking-wide uppercase m-0">Video Deliverables</h3>
          <button type="button" onClick={() => appendVideo({ name: "", qty: 1, eventName: "" })}
            className="px-3.5 py-1.5 border border-[#a10018] rounded-md bg-transparent text-[#a10018] text-[12px] font-semibold font-sans cursor-pointer hover:bg-[#fdf0f2] transition-colors">
            + Add
          </button>
        </div>
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-[#a10018]">
              <th className={theadCls}>Video Deliverables</th>
              <th className={`${theadCls} text-center w-16`}>Qty</th>
              <th className={theadCls}>Event Name</th>
              <th className="w-9"></th>
            </tr>
          </thead>
          <tbody>
            {videoFields.map((item, i) => (
              <tr key={item.id} className={`border-b border-[#f5c6ce] ${i % 2 === 0 ? "bg-white" : "bg-[#fdf0f2]"}`}>
                <td className="px-2 py-1.5">
                  <Controller name={`videoDeliverables.${i}.name`} control={control}
                    render={({ field }) => <input {...field} className={`${inputCls} py-1.5 text-[12px]`} placeholder="e.g. TRADITIONAL VIDEO" />} />
                </td>
                <td className="px-2 py-1.5 text-center">
                  <Controller name={`videoDeliverables.${i}.qty`} control={control}
                    render={({ field }) => <input type="number" min={1} {...field} className="w-14 px-2 py-1.5 border border-[#e0c0c5] rounded-md text-[12px] text-[#2a0008] text-center outline-none focus:border-[#a10018]" />} />
                </td>
                <td className="px-2 py-1.5">
                  <Controller name={`videoDeliverables.${i}.eventName`} control={control}
                    render={({ field }) => (
                      <select {...field} className={`${inputCls} py-1.5 text-[12px] cursor-pointer`}>
                        <option value="">Select event</option>
                        {eventNames.map(e => <option key={e} value={e}>{e}</option>)}
                      </select>
                    )} />
                </td>
                <td className="text-center">
                  <button type="button" onClick={() => removeVideo(i)} className="text-[#b08090] hover:text-[#a10018] text-lg bg-transparent border-none cursor-pointer">×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {videoFields.length === 0 && <p className="text-center text-[#b08090] text-[13px] py-3">No video deliverables added.</p>}
      </div>

      {/* Photo Deliverables */}
      <div className="mb-7">
        <div className="flex justify-between items-center mb-2.5">
          <h3 className="text-[13px] font-bold text-[#a10018] font-sans tracking-wide uppercase m-0">Photo Deliverables</h3>
          <button type="button" onClick={() => appendPhoto({ name: "", qty: 1, photosCount: "", eventName: "" })}
            className="px-3.5 py-1.5 border border-[#a10018] rounded-md bg-transparent text-[#a10018] text-[12px] font-semibold font-sans cursor-pointer hover:bg-[#fdf0f2] transition-colors">
            + Add
          </button>
        </div>
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-[#a10018]">
              <th className={theadCls}>Photo Deliverables</th>
              <th className={`${theadCls} text-center w-16`}>Qty</th>
              <th className={`${theadCls} text-center w-24`}>Photos Count</th>
              <th className={theadCls}>Event Name</th>
              <th className="w-9"></th>
            </tr>
          </thead>
          <tbody>
            {photoFields.map((item, i) => (
              <tr key={item.id} className={`border-b border-[#f5c6ce] ${i % 2 === 0 ? "bg-white" : "bg-[#fdf0f2]"}`}>
                <td className="px-2 py-1.5">
                  <Controller name={`photoDeliverables.${i}.name`} control={control}
                    render={({ field }) => <input {...field} className={`${inputCls} py-1.5 text-[12px]`} placeholder="e.g. WEDDING ALBUM" />} />
                </td>
                <td className="px-2 py-1.5 text-center">
                  <Controller name={`photoDeliverables.${i}.qty`} control={control}
                    render={({ field }) => <input type="number" min={1} {...field} className="w-14 px-2 py-1.5 border border-[#e0c0c5] rounded-md text-[12px] text-[#2a0008] text-center outline-none focus:border-[#a10018]" />} />
                </td>
                <td className="px-2 py-1.5 text-center">
                  <Controller name={`photoDeliverables.${i}.photosCount`} control={control}
                    render={({ field }) => <input type="number" {...field} className="w-20 px-2 py-1.5 border border-[#e0c0c5] rounded-md text-[12px] text-[#2a0008] text-center outline-none focus:border-[#a10018]" placeholder="e.g. 500" />} />
                </td>
                <td className="px-2 py-1.5">
                  <Controller name={`photoDeliverables.${i}.eventName`} control={control}
                    render={({ field }) => (
                      <select {...field} className={`${inputCls} py-1.5 text-[12px] cursor-pointer`}>
                        <option value="">Select event</option>
                        {eventNames.map(e => <option key={e} value={e}>{e}</option>)}
                      </select>
                    )} />
                </td>
                <td className="text-center">
                  <button type="button" onClick={() => removePhoto(i)} className="text-[#b08090] hover:text-[#a10018] text-lg bg-transparent border-none cursor-pointer">×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {photoFields.length === 0 && <p className="text-center text-[#b08090] text-[13px] py-3">No photo deliverables added.</p>}
      </div>

      {/* Pricing */}
      <div className="border-2 border-[#f5c6ce] rounded-xl p-5 bg-[#fffbfc]">
        <h3 className="text-[13px] font-bold text-[#a10018] font-sans tracking-wide uppercase mb-4 m-0">Package Pricing</h3>
        <div className="grid grid-cols-2 gap-x-5 mb-5">
          <Field label="Total Package (₹)">
            <Controller name="totalPackage" control={control}
              render={({ field }) => <input type="number" {...field} className={`${inputCls} font-semibold`} placeholder="e.g. 751000" />} />
          </Field>
          <Field label="Discount (₹)">
            <Controller name="discount" control={control}
              render={({ field }) => <input type="number" {...field} className={inputCls} placeholder="e.g. 191000" />} />
          </Field>
        </div>
        <div className="bg-white border-[1.5px] border-[#f5c6ce] rounded-xl p-5 space-y-3">
         {[
  {
    label: "Total Package",
    value: totalPackage,
    suffix: "INR",
    highlight: false,
  },
  {
    label: "Discount",
    value: `${discountPercentage}%`,
    suffix: "",
    highlight: false,
  },
  {
    label: "Discount Amount",
    value: Number(discountAmount).toLocaleString("en-IN"),
    suffix: "INR",
    highlight: false,
  },
  {
    label: "Package Value",
    value: Number(packageValue).toLocaleString("en-IN"),
    suffix: "INR",
    highlight: true,
  },
].map(({ label, value, suffix, highlight }) => (
  <div key={label} className="flex items-center justify-between">
    <span
      className={`font-sans font-bold tracking-widest uppercase text-[11px] ${
        highlight ? "text-[#a10018]" : "text-[#6a3040]"
      }`}
    >
      {label}
    </span>

    <div className="flex items-center gap-2">
      <span
        className={`font-serif font-semibold ${
          highlight
            ? "text-[#a10018] text-xl"
            : "text-[#4a2030] text-base"
        }`}
      >
        {typeof value === "number"
          ? value.toLocaleString("en-IN")
          : value}
      </span>

      {suffix && (
        <span className="text-[12px] text-[#a08090] font-sans font-semibold">
          {suffix}
        </span>
      )}
    </div>
  </div>
))}
        </div>
      </div>
    </div>
  );
}

export default function CustomerForm({ onSaved, editData }: { onSaved?: () => void; editData?: EditData }) {
  const isEdit = Boolean(editData?._id);
  const [currentStep, setCurrentStep] = useState(0);

  const toDateInput = (d?: string) => {
    if (!d) return "";
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? "" : dt.toISOString().slice(0, 10);
  };

  const { control, handleSubmit, trigger, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: editData ? {
      customerName:      editData.customerName ?? "",
      eventType:         editData.eventType ?? "",
      eventDate:         toDateInput(editData.eventDate),
      location:          editData.location ?? "",
      brideName:         editData.brideName ?? "",
      groomName:         editData.groomName ?? "",
      notes:             editData.notes ?? "",
      events:            editData.events?.map(ev => ({
        ...ev,
        date:          toDateInput(ev.date),
        crowdStrength: ev.crowdStrength ?? "",
        services:      ev.services ?? [{ service: "CANDID PHOTOGRAPHY", cameras: 1 }],
      })) ?? [{ eventName: "", venueName: "", venueLocation: "", date: "", startTime: "", endTime: "", crowdStrength: "", services: [{ service: "CANDID PHOTOGRAPHY", cameras: 1 }] }],
      videoDeliverables: editData.videoDeliverables ?? [{ name: "TRADITIONAL VIDEO", qty: 1, eventName: "" }],
      photoDeliverables: editData.photoDeliverables ?? [{ name: "WEDDING ALBUM", qty: 1, photosCount: "", eventName: "" }],
      totalPackage:      editData.totalPackage ?? "",
      discount:          editData.discount ?? "",
    } : {
      customerName: "", eventType: "", eventDate: "", location: "",
      brideName: "", groomName: "", notes: "",
      events: [{ eventName: "", venueName: "", venueLocation: "", date: "", startTime: "", endTime: "", crowdStrength: "", services: [{ service: "CANDID PHOTOGRAPHY", cameras: 1 }] }],
      videoDeliverables: [{ name: "TRADITIONAL VIDEO", qty: 1, eventName: "" }],
      photoDeliverables: [{ name: "WEDDING ALBUM", qty: 1, photosCount: "", eventName: "" }],
      totalPackage: "", discount: "",
    }
  });

  const stepFields: Record<number, (keyof FormValues)[]> = {
    0: ["customerName", "eventType", "eventDate", "location", "brideName", "groomName", "notes"],
    1: ["events"],
    2: ["videoDeliverables", "photoDeliverables", "totalPackage", "discount"],
  };

  const handleNext = async () => {
    const valid = await trigger(stepFields[currentStep]);
    if (valid) setCurrentStep(s => Math.min(s + 1, steps.length - 1));
  };

  const handlePrimaryAction = () => {
    if (currentStep === steps.length - 1) {
      void handleSubmit(onSubmit)();
      return;
    }
    void handleNext();
  };

  const handleBack = () => setCurrentStep(s => Math.max(s - 1, 0));

  const onSubmit = async (data: FormValues) => {
    try {
      const totalPackageNum = Math.max(0, Number(data.totalPackage) || 0);
      const discountNum     = Math.max(0, Number(data.discount) || 0);
      const total           = Math.max(0, totalPackageNum - discountNum);
      const eventDate       = data.eventDate || data.events?.[0]?.date || "";

      const payload: CustomerData = {
        customerName: data.customerName,
        eventType:    data.eventType || "Other",
        packageName:  data.eventType  || "Custom Package",
        eventDate,
        location:     data.location,
        brideName:    data.brideName,
        groomName:    data.groomName,
        notes:        data.notes,
        events: data.events.map(ev => ({
          eventName: ev.eventName, venueName: ev.venueName, venueLocation: ev.venueLocation,
          date: ev.date, startTime: ev.startTime, endTime: ev.endTime,
          crowdStrength: Number(ev.crowdStrength) || 0,
          services: ev.services.map(s => ({ service: s.service, cameras: Number(s.cameras) || 1 })),
        })),
        videoDeliverables: data.videoDeliverables.map(v => ({ name: v.name, qty: Number(v.qty) || 1, eventName: v.eventName })),
        photoDeliverables: data.photoDeliverables.map(p => ({ name: p.name, qty: Number(p.qty) || 1, photosCount: Number(p.photosCount) || 0, eventName: p.eventName })),
        totalPackage: totalPackageNum,
        discount:     discountNum,
        total,
      };

      if (isEdit && editData?._id) {
        await updateCustomer(editData._id, payload);
      } else {
        await saveCustomer(payload);
      }

      onSaved?.();
      alert(isEdit ? "Quotation updated successfully!" : "Quotation saved successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error saving quotation");
    }
  };

  return (
    <div className="font-serif flex flex-col h-full min-h-0 w-full max-w-[1080px] mx-auto">
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div className="bg-[#a10018] px-6 py-2.5 rounded-t-xl flex items-center justify-between shrink-0">
        <div className="text-[15px] font-semibold text-white font-serif tracking-wide">
          {isEdit ? "Edit Quotation" : "New Quotation"}
          <span className="text-[11px] text-white/65 font-sans ml-2.5 tracking-widest uppercase font-normal">
            Photography & Films
          </span>
        </div>
        <div className="px-2.5 py-1 border border-white/35 rounded-full text-white font-sans text-[10px] tracking-widest uppercase">
          Step {currentStep + 1} / {steps.length}
        </div>
      </div>

      {/* Body */}
      <div className="border-[1.5px] border-[#f5c6ce] border-t-0 rounded-b-xl bg-white flex flex-col flex-1 min-h-0">
        <div className="px-7 pt-4 shrink-0">
          <StepIndicator current={currentStep} />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-7">
            {currentStep === 0 && <Step1 control={control} errors={errors} />}
            {currentStep === 1 && <Step2 control={control} />}
            {currentStep === 2 && <Step3 control={control} watch={watch} />}
          </div>

          {/* Nav */}
          <div className="flex justify-between gap-3 px-7 py-3.5 border-t border-[#f5c6ce] bg-white shrink-0 rounded-b-xl">
            <button
              type="button" onClick={handleBack} disabled={currentStep === 0}
              className={`min-w-[110px] px-3.5 py-2 rounded-lg border-[1.5px] font-sans font-semibold text-[12px] tracking-wide uppercase transition-colors
                ${currentStep === 0
                  ? "border-[#dfcbd0] bg-[#faf5f6] text-[#b8a3a8] cursor-not-allowed"
                  : "border-[#a10018] bg-white text-[#a10018] cursor-pointer hover:bg-[#fdf0f2]"
                }`}
            >
              Back
            </button>

            {/* {currentStep < steps.length - 1 ? ( */}
              <button type="button" onClick={handlePrimaryAction}
                className="min-w-[110px] px-3.5 py-2 rounded-lg border-[1.5px] border-[#a10018] bg-[#a10018] text-white font-sans font-semibold text-[12px] tracking-wide uppercase cursor-pointer hover:bg-[#8a0014] transition-colors">
                {currentStep === steps.length - 1 ? "Save Quotation" : "Next"}
              </button>
            {/* )} */}
          </div>
        </form>
      </div>
    </div>
  );
}