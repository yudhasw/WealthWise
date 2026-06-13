import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setNeedsVerification(false);

    try {
      const response = await api.post("/login", { email, password });
      localStorage.setItem("wealthwise_token", response.data.access_token);
      navigate("/dashboard");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Login failed. Please check your credentials.",
      );

      if (error.response?.status === 403) {
        setNeedsVerification(true);
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

      {/* RIGHT SIDE: Login Form (5/8 atau 62.5%) */}
      <div className="flex flex-1 flex-col justify-center items-center px-8 py-12 lg:w-[62.5%]">
        <div className="w-full max-w-[380px]">
          <div className="mb-10">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-[#047857] font-medium uppercase tracking-wider">
              Please enter your credentials to access your atelier.
            </p>
          </div>

          {/* Kotak Notifikasi Error */}
          {errorMessage && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg text-sm text-center">
              {errorMessage}
              {needsVerification && (
                <div className="mt-2">
                  <Link
                    to="/verify-email"
                    state={{ email }}
                    className="font-bold text-[#047857] hover:text-emerald-400 transition-colors underline"
                  >
                    Verifikasi email sekarang
                  </Link>
                </div>
              )}
            </div>
          )}

          <div className="mt-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Input Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full rounded-lg border-0 bg-white/5 py-3 px-4 text-white ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-[#047857] transition-all outline-none"
                  placeholder="name@company.com"
                />
              </div>

              {/* Input Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Password
                  </label>
                  <a
                    href="#"
                    className="text-sm font-semibold text-[#047857] hover:text-emerald-400 transition-colors"
                  >
                    Forgot?
                  </a>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full rounded-lg border-0 bg-white/5 py-3 px-4 text-white ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-[#047857] transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>

              {/* Remember Me */}
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/10 bg-white/5 text-[#047857] focus:ring-[#047857] focus:ring-offset-0"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-3 block text-sm text-gray-400"
                >
                  Keep me logged in
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-lg bg-[#047857] py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/20 hover:bg-[#035e44] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Authenticating..." : "Log in to your account"}
              </button>
            </form>

            {/* SOCIAL LOGINS */}
            <div className="mt-10">
              <p className="mt-10 text-center text-sm text-gray-500">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-bold text-[#047857] hover:text-emerald-400 transition-colors"
                >
                  Sign up for free
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
