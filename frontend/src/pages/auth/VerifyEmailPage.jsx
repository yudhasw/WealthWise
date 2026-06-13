import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState(location.state?.email || "");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!email) {
      setErrorMessage("Mohon masukkan alamat email Anda.");
      return;
    }

    if (code.length !== 6) {
      setErrorMessage("Kode verifikasi harus terdiri dari 6 digit.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post("/email/verify-code", { email, code });

      setSuccessMessage(
        response.data?.message ||
          "Email berhasil diverifikasi! Mengalihkan ke halaman login...",
      );

      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Kode verifikasi tidak valid atau sudah kadaluarsa.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!email) {
      setErrorMessage("Mohon masukkan alamat email Anda.");
      return;
    }

    setIsResending(true);

    try {
      const response = await api.post("/email/resend-code", { email });

      setSuccessMessage(
        response.data?.message ||
          "Kode verifikasi baru telah dikirim ke email Anda.",
      );

      setCooldown(60);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Gagal mengirim ulang kode verifikasi. Silakan coba lagi.",
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#121417] font-sans antialiased text-gray-200">
      {/* LEFT SIDE: Visual/Branding (3/8 atau 37.5%) */}
      <div className="relative hidden lg:block lg:w-[37.5%] overflow-hidden">
        <img
          className="absolute inset-0 h-full w-full object-cover opacity-40"
          src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80"
          alt="Branding Background"
        />
        <div className="absolute inset-0 bg-[#047857]/30 mix-blend-multiply"></div>

        {/* APP LOGO */}
        <div className="absolute top-0 left-0 p-12 z-20">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-[#047857] flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">W</span>
            </div>
            <span className="text-[#047857] text-2xl font-bold tracking-tight">
              WealthWise
            </span>
          </div>
        </div>

        {/* BRANDING CONTENT */}
        <div className="relative z-10 flex h-full flex-col justify-end p-16">
          <h1 className="text-5xl font-bold leading-[1.1] text-white">
            Almost <br />
            <span className="text-[#047857]">there</span>. <br />
            One step left.
          </h1>
          <p className="mt-6 text-gray-300 max-w-sm leading-relaxed">
            Verify your email address to start managing your financial
            future with WealthWise.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Verify Email Form (5/8 atau 62.5%) */}
      <div className="flex flex-1 flex-col justify-center items-center px-8 py-12 lg:w-[62.5%]">
        <div className="w-full max-w-[420px]">
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Verifikasi Email Anda
            </h2>
            <p className="mt-2 text-sm text-[#047857] font-medium uppercase tracking-wider">
              Masukkan kode 6 digit yang telah kami kirim ke email Anda.
            </p>
          </div>

          {/* Kotak Notifikasi Error & Sukses */}
          {errorMessage && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg text-sm font-medium">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="mb-6 p-3 bg-[#047857]/20 border border-[#047857]/50 text-emerald-400 rounded-lg text-sm font-medium">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-lg border-0 bg-white/5 py-3 px-4 text-white ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-[#047857] outline-none transition-all"
                placeholder="name@company.com"
              />
            </div>

            {/* Input Kode Verifikasi */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Kode verifikasi
              </label>
              <input
                type="text"
                required
                maxLength={6}
                inputMode="numeric"
                pattern="[0-9]*"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                className="block w-full rounded-lg border-0 bg-white/5 py-3 px-4 text-center text-2xl tracking-[0.5em] text-white ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-[#047857] outline-none transition-all"
                placeholder="------"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-[#047857] py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/20 hover:bg-[#035e44] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Memverifikasi..." : "Verifikasi"}
            </button>
          </form>

          {/* Resend Code */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Tidak menerima kode?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending || cooldown > 0}
                className="font-bold text-[#047857] hover:text-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-[#047857]"
              >
                {cooldown > 0
                  ? `Kirim ulang (${cooldown}s)`
                  : isResending
                    ? "Mengirim..."
                    : "Kirim ulang kode"}
              </button>
            </p>
          </div>

          {/* Back to Login */}
          <div className="mt-8">
            <div className="rounded-xl bg-[#047857]/10 p-4 flex items-center gap-4 border border-[#047857]/20">
              <div className="bg-[#047857] rounded-full p-1.5">
                <svg
                  className="h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-sm text-emerald-100">
                Sudah verifikasi?
                <Link
                  to="/login"
                  className="underline font-bold text-white hover:text-emerald-300 transition-colors ml-1"
                >
                  Masuk ke akun
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
