import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import Header from "../../components/Header";
import api from "../../api/axios";
import { Bell, User } from "lucide-react";

// ── Edit Modal ────────────────────────────────────────────────────
function EditModal({ title, subtitle, onClose, onSave, saving, children }) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-2xl">
        <h2 className="text-xl font-bold text-gray-900 text-center mb-1">
          {title}
        </h2>
        <p className="text-gray-500 text-sm text-center mb-6">{subtitle}</p>
        <div className="flex flex-col gap-4">{children}</div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="flex-1 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-sm disabled:opacity-50 transition-colors"
          >
            {saving ? "Menyimpan..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal Input ───────────────────────────────────────────────────
function ModalInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  autoComplete,
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full bg-gray-100 text-gray-800 text-sm px-4 py-3 rounded-xl border border-transparent outline-none focus:border-emerald-500 focus:bg-white transition-all"
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

// ── Settings Row ──────────────────────────────────────────────────
function SettingsRow({ label, display, onEdit }) {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-0">
      <span className="w-28 text-gray-900 font-bold text-sm shrink-0">
        {label}
      </span>
      <span className="flex-1 text-gray-500 text-sm">{display}</span>
      {onEdit && (
        <button
          onClick={onEdit}
          className="text-gray-300 hover:text-emerald-600 transition-colors p-1 shrink-0"
        >
          <svg
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function EditProfilePage() {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [modal, setModal] = useState(null); // 'name' | 'email' | 'password'
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState({});

  const [nameVal, setNameVal] = useState("");
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });

  const memberYear = profile?.member_since?.split(" ")?.[1] ?? "—";

  useEffect(() => {
    api
      .get("/profile")
      .then((res) => {
        const p = res.data.data;
        setProfile(p);
        setNameVal(p.name);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const openModal = (type) => {
    setModalError({});
    if (type === "name") setNameVal(profile?.name ?? "");
    if (type === "password") setPwForm({ current: "", next: "", confirm: "" });
    setModal(type);
  };

  const closeModal = () => setModal(null);

  const handleSaveName = async () => {
    setSaving(true);
    setModalError({});
    try {
      const res = await api.put("/profile", {
        name: nameVal,
        email: profile.email,
      });
      setProfile((p) => ({ ...p, name: res.data.data.name }));
      closeModal();
    } catch (err) {
      setModalError(
        err.response?.data?.errors ?? { general: ["Gagal menyimpan."] },
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async () => {
    setSaving(true);
    setModalError({});
    try {
      await api.put("/profile/password", {
        current_password: pwForm.current,
        password: pwForm.next,
        password_confirmation: pwForm.confirm,
      });
      closeModal();
    } catch (err) {
      setModalError(
        err.response?.data?.errors ?? { general: ["Gagal menyimpan."] },
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout isLoading={isLoading}>
      <Header
        title="Edit Profile"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Profile", to: "/profile" },
          { label: "Edit Profile" },
        ]}
        rightSection={
          <div className="flex items-center gap-5">
            <Link
              to="/notifications"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Bell size={18} />
            </Link>
            <Link
              to="/profile"
              className="w-10 h-10 rounded-full bg-[#1F2937] border border-white/10 flex items-center justify-center hover:bg-[#374151] transition"
            >
              <User size={18} className="text-[#F4B183]" />
            </Link>
          </div>
        }
      />

      {/* PROFILE HERO */}
      <div className="bg-white rounded-xl p-7 mb-4 border border-gray-100 shadow-sm">
        <div className="flex items-start gap-5">
          <div>
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h2 className="text-2xl font-black text-gray-900">
                {profile?.name ?? "—"}
              </h2>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Wealth Management Client since {memberYear}
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link
                to="/profile/edit"
                className="bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors"
              >
                Edit Profile
              </Link>
              <button className="border-2 border-gray-200 text-gray-600 text-sm font-bold px-5 py-2.5 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-colors">
                Share Portfolio
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PROFILE SETTINGS CARD */}
      <div className="bg-white rounded-xl px-7 pt-6 pb-2 mt-6 border border-gray-100 shadow-sm">
        <h3 className="text-gray-900 font-black text-base mb-1">
          Profile Settings
        </h3>
        <SettingsRow
          label="Full Name"
          display={profile?.name ?? "—"}
          onEdit={() => openModal("name")}
        />
        <SettingsRow label="Email" display={profile?.email ?? "—"} />
        <SettingsRow
          label="Password"
          display="● ● ● ● ● ● ● ●"
          onEdit={() => openModal("password")}
        />
      </div>

      {/* ── MODALS ─────────────────────────────────────────────── */}
      {modal === "name" && (
        <EditModal
          title="Full Name"
          subtitle="Enter your full name to update your account information."
          onClose={closeModal}
          onSave={handleSaveName}
          saving={saving}
        >
          <ModalInput
            label="Full Name"
            value={nameVal}
            onChange={(e) => setNameVal(e.target.value)}
            placeholder="Nama lengkap Anda"
            error={modalError.name?.[0] ?? modalError.general?.[0]}
            autoComplete="name"
          />
        </EditModal>
      )}

      {modal === "password" && (
        <EditModal
          title="Password"
          subtitle="Enter your old password and create a new one"
          onClose={closeModal}
          onSave={handleSavePassword}
          saving={saving}
        >
          <ModalInput
            label="Old Password"
            type="password"
            value={pwForm.current}
            onChange={(e) =>
              setPwForm((p) => ({ ...p, current: e.target.value }))
            }
            placeholder="Enter your password"
            error={modalError.current_password?.[0]}
            autoComplete="current-password"
          />
          <ModalInput
            label="Password"
            type="password"
            value={pwForm.next}
            onChange={(e) => setPwForm((p) => ({ ...p, next: e.target.value }))}
            placeholder="Enter new password"
            error={modalError.password?.[0]}
            autoComplete="new-password"
          />
          <ModalInput
            label="Confirm Password"
            type="password"
            value={pwForm.confirm}
            onChange={(e) =>
              setPwForm((p) => ({ ...p, confirm: e.target.value }))
            }
            placeholder="Re-enter new password"
            error={modalError.general?.[0]}
            autoComplete="new-password"
          />
        </EditModal>
      )}
    </MainLayout>
  );
}
