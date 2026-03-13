import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import GlassCard from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Loader2, FileText, X } from "lucide-react";
import { toast } from "sonner";
import axiosInterceptor from "@/api/axiosInterceptor";
import { motion, AnimatePresence } from "framer-motion";
import JoditEditor from "jodit-react";

export default function EmailTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({ subject: "", html_body: "" });
  const editor = useRef(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await axiosInterceptor.get("auth/email-templates/");
      setTemplates(res.data);
    } catch {
      toast.error("Failed to load email templates");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (tpl) => {
    setSelected(tpl);
    setEditData({ subject: tpl.subject, html_body: tpl.html_body });
  };

  const closeModal = () => {
    setSelected(null);
    setEditData({ subject: "", html_body: "" });
  };

  const handleSave = async () => {
    if (!editData.subject.trim()) {
      return toast.error("Subject cannot be empty");
    }
    setSaving(true);
    try {
      const res = await axiosInterceptor.patch(
        `auth/email-templates/${selected.slug}/`,
        editData
      );
      toast.success("Template saved successfully");
      setTemplates((prev) =>
        prev.map((t) => (t.slug === res.data.slug ? res.data : t))
      );
      closeModal();
    } catch {
      toast.error("Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout role="admin" title="Settings" currentPage="Settings">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-2xl bg-[#1e1b4b] text-[#8b5cf6] border border-[#2e2b5e]">
              <Mail className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Email Templates</h2>
              <p className="text-sm text-slate-400">
                Customize the emails sent to your members
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#8b5cf6]" />
            </div>
          ) : (
            <div className="grid gap-4">
              {templates.map((tpl) => (
                <GlassCard
                  key={tpl.slug}
                  className="p-5 cursor-pointer hover:border-[#8b5cf6]/40 transition-all group bg-[#0f172a]/60 border-[#1e293b]"
                  onClick={() => openModal(tpl)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-[#1e293b] text-slate-300 group-hover:text-[#8b5cf6] transition-colors">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">
                          {tpl.name}
                        </h3>
                        <p className="text-sm text-slate-400">
                          Subject: {tpl.subject}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 bg-[#1e293b] px-4 py-1.5 rounded-full font-mono font-medium">
                      {tpl.slug}
                    </span>
                  </div>
                </GlassCard>
              ))}

              {templates.length === 0 && (
                <p className="text-center text-slate-500 py-12">
                  No email templates found.
                </p>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Editor Modal */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={closeModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col z-10"
              style={{ maxHeight: "90vh" }}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
                <h2 className="text-xl font-bold text-gray-900">
                  Edit Template
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-gray-600 rounded-full"
                  onClick={closeModal}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto bg-gray-50 flex-1 space-y-4">
                <Input
                  value={selected.name}
                  disabled
                  className="bg-white border-gray-200 text-gray-700 font-medium opacity-70 h-11"
                />

                <Input
                  value={editData.subject}
                  onChange={(e) =>
                    setEditData({ ...editData, subject: e.target.value })
                  }
                  className="bg-white border-gray-200 text-gray-900 focus:ring-amber-500 focus:border-amber-500 h-11"
                  placeholder="Email Subject"
                />

                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden text-black">
                  <JoditEditor
                    ref={editor}
                    value={editData.html_body}
                    config={{
                      readonly: false,
                      height: 400,
                      toolbarAdaptive: false,
                      buttons: [
                        "bold", "italic", "underline", "strikethrough", "eraser",
                        "|", "ul", "ol",
                        "|", "font", "fontsize", "brush", "paragraph",
                        "|", "superscript", "subscript",
                        "|", "align", "undo", "redo",
                        "|", "hr", "link", "image", "video", "source"
                      ],
                    }}
                    onBlur={(newContent) =>
                      setEditData({ ...editData, html_body: newContent })
                    }
                  />
                </div>
                
                {/* Available Variables Notice */}
                <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4">
                  <p className="text-xs text-blue-800 font-semibold mb-2">Available Variables (Do not modify syntax):</p>
                  <div className="flex flex-wrap gap-2">
                    {selected.slug === "member_welcome" && (
                      ["{{MemberName}}", "{{MemberEmail}}", "{{TemporaryPassword}}", "{{LoginURL}}", "{{SupportEmail}}", "{{SupportPhone}}", "{{Year}}"].map(v => (
                        <span key={v} className="bg-white border border-blue-200 text-blue-600 px-2 py-1 rounded text-xs font-mono">{v}</span>
                      ))
                    )}
                    {selected.slug === "password_reset" && (
                      ["{{user.username}}", "{{reset_link}}", "{{SupportEmail}}", "{{Year}}"].map(v => (
                        <span key={v} className="bg-white border border-blue-200 text-blue-600 px-2 py-1 rounded text-xs font-mono">{v}</span>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-white">
                <Button
                  variant="outline"
                  onClick={closeModal}
                  className="border-gray-200 text-gray-700 hover:bg-gray-50 uppercase font-semibold text-sm px-6 rounded-lg"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-[#9d6029] hover:bg-[#834f21] text-white uppercase font-semibold text-sm px-8 rounded-lg"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Update"
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
