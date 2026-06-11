import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== passwordConfirmation) {
      setErrorMessage("Passwords do not match. Please try again.");
      return;
    }

    setIsLoading(true);
    setErrors({});
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // Mengirim request pembuatan akun ke API Laravel
      // Laravel biasanya membaca 'password_confirmation' untuk validasi confirmed
      await api.post("/register", {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      setSuccessMessage(
        "Akun berhasil dibuat! Mengalihkan ke halaman verifikasi kode...",
      );

      setTimeout(
        () => navigate("/verify-email", { state: { email } }),
        2000,
      );
    } catch (error) {
      if (error.response && error.response.status === 422) {
        const validationErrors =
          error.response.data.errors || error.response.data;
        setErrors(validationErrors);
      } else {
        setErrorMessage(
          error.response?.data?.message ||
            "Terjadi kesalahan saat mendaftar. Silakan coba lagi.",
        );
      }
    } finally {
      setIsLoading(false);
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
            Curating your <br />
            <span className="text-[#047857]">financial</span> <br />
            legacy.
          </h1>
          <p className="mt-6 text-gray-300 max-w-sm leading-relaxed">
            Experience world-class management with a platform built for your
            financial future.
          </p>

          <div className="mt-10 flex gap-8 border-t border-white/10 pt-10">
            <div>
              <span className="block text-2xl font-bold text-white">$4.2T</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-semibold">
                Assets Managed
              </span>
            </div>
            <div>
              <span className="block text-2xl font-bold text-white">120+</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-semibold">
                Countries
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Register Form (5/8 atau 62.5%) */}
      <div className="flex flex-1 flex-col justify-center items-center px-8 py-12 lg:w-[62.5%]">
        <div className="w-full max-w-[420px]">
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Create an Atelier Account
            </h2>
            <p className="mt-2 text-sm text-[#047857] font-medium uppercase tracking-wider">
              Join wealthwise and begin managing your assets with precision.
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
            {/* Input Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Your name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full rounded-lg border-0 bg-white/5 py-3 px-4 text-white ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-[#047857] outline-none transition-all"
                placeholder="e.g. John Doe"
              />
            </div>

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

            {/* Error jika email sudah digunakan*/}
            {errors.email && (
              <p className="text-red-500 text-xs mt-1 font-medium">
                {errors.email[0]}
              </p>
            )}

            {/* Password Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border-0 bg-white/5 py-3 px-4 text-white ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-[#047857] outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Confirm
                </label>
                <input
                  type="password"
                  required
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className="block w-full rounded-lg border-0 bg-white/5 py-3 px-4 text-white ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-[#047857] outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start py-2">
              <input
                id="terms"
                type="checkbox"
                required
                className="mt-1 h-4 w-4 rounded border-white/10 bg-white/5 text-[#047857] focus:ring-[#047857] focus:ring-offset-0"
              />
              <label htmlFor="terms" className="ml-3 text-sm text-gray-400">
                I agree to the{" "}
                <a
                  href="#"
                  className="text-[#047857] font-semibold hover:underline"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="text-[#047857] font-semibold hover:underline"
                >
                  Privacy Policy
                </a>
                .
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-[#047857] py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/20 hover:bg-[#035e44] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Processing..." : "Sign up"}
            </button>
          </form>

          {/* Member Login Box */}
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
                Already a member?
                {/* React Router Link ke Login */}
                <Link
                  to="/login"
                  className="underline font-bold text-white hover:text-emerald-300 transition-colors ml-1"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
