import { useState } from "react";
import CustomerForm from "./CustomerForm";
import CustomerTable from "./CustomerTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CustomerData } from "@/api/pdfService";

type EditData = CustomerData & { _id?: string };

// const SERVER = "https://quotation-management-be.onrender.com";
const SERVER = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function Dashboard() {
  const [tab, setTab] = useState("new");
  const [refresh, setRefresh] = useState(0);
  const [editData, setEditData] = useState<EditData | undefined>(undefined);

  const handleEdit = (customer: EditData) => {
    setEditData(customer);
    setTab("new");
  };

  const handleSaved = () => {
    setEditData(undefined);
    setRefresh((r) => r + 1);
    setTab("saved");
  };

  return (
    <div className="h-screen overflow-hidden bg-[#f7f4f5] flex flex-col">
      
      {/* Header */}
      <header className="w-full bg-white/90 backdrop-blur border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto h-[10vh] flex items-center justify-between">
          
          {/* Logo + Brand */}
          <div className="flex items-center gap-3">
            {/* Circle icon — served from Express /uploads */}
            <div className="h-16 w-16 rounded-full overflow-hidden shadow-sm border border-red-100 bg-[#9b0015] flex-shrink-0 flex items-center justify-center p-2">
              <img
                src={`${SERVER}/uploads/white.png`}
                alt="Yours Bigday"
                className="h-full w-full object-cover"
              />
            </div>

            {/* Text-logo image — hidden via onError if file is missing */}
            {/* <img
              src={`${SERVER}/uploads/logo-text.png`}
              alt="Yours Bigday"
              className="h-9 w-auto object-contain"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            /> */}

            <div className="leading-tight">
              <h1 className="text-[22px] font-light tracking-wide text-[#9b0015]">
                YOURS BIGDAY
              </h1>
              <p className="text-[13px] text-gray-500 tracking-[3px] lowercase">
                studio
              </p>
            </div>
          </div>

          {/* Right Text */}
          <div className="hidden md:block text-sm text-gray-500">
            Quotation Management
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-7xl mx-auto bg-white rounded-3xl shadow-md border border-gray-200 overflow-hidden flex flex-col">
          
          <Tabs
            value={tab}
            onValueChange={(v) => {
              setTab(v);

              if (v === "new" && !editData) {
                setEditData(undefined);
              }
            }}
            className="h-full flex flex-col"
          >
            
            {/* Tabs */}
            <div className="border-b bg-[#faf7f8] px-4 md:px-6 py-4">
              <TabsList className="grid grid-cols-2 w-full max-w-md bg-[#f1e8ea] rounded-xl p-1">
                
                <TabsTrigger
                  value="new"
                  className="rounded-lg text-sm data-[state=active]:bg-[#9b0015] data-[state=active]:text-white"
                >
                  {editData ? "Edit Quotation" : "New Quotation"}
                </TabsTrigger>

                <TabsTrigger
                  value="saved"
                  className="rounded-lg text-sm data-[state=active]:bg-[#9b0015] data-[state=active]:text-white"
                >
                  Saved Quotations
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden p-4 md:p-6 flex flex-col min-h-0">
              
              <TabsContent value="new" className="mt-0 flex-1 flex flex-col min-h-0">
                <CustomerForm
                  key={editData?._id ?? "new"}
                  editData={editData}
                  onSaved={handleSaved}
                />
              </TabsContent>

              <TabsContent value="saved" className="mt-0 flex-1 overflow-auto">
                <CustomerTable
                  key={refresh}
                  onEdit={handleEdit}
                />
              </TabsContent>

            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}