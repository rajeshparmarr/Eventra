import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, verifyOTP } = useContext(AuthContext);
  const navigate = useNavigate();

  // Demo credentials
  const demoUser = {
    email: "user@eventra.com",
    password: "password123",
  };

  const demoAdmin = {
    email: "admin@eventra.com",
    password: "password123",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!showOTP) {
        const data = await login(email, password);
        if (data.role === "admin") navigate("/admin");
        else navigate("/dashboard");
      } else {
        const data = await verifyOTP(email, otp);
        if (data.role === "admin") navigate("/admin");
        else navigate("/dashboard");
      }
    } catch (err) {
      if (err.needsVerification) {
        setShowOTP(true);
        setError(
          "Account not verified. A new OTP has been sent to your email."
        );
      } else {
        setError(err.message || err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
          Welcome Back
        </h2>
        <p className="text-gray-500">Sign in to your Eventra account</p>
      </div>

      {/* Demo Credentials Row */}
      {!showOTP && (
        <div className="flex gap-4 mb-6 text-left">
          {/* User */}
          <div className="flex-1 border rounded-lg p-3 text-sm text-gray-600">
            <p className="font-medium text-gray-800">User</p>
            <p className="mt-1">user@eventra.com</p>
            <p>password123</p>
            <button
              type="button"
              onClick={() => {
                setEmail(demoUser.email);
                setPassword(demoUser.password);
              }}
              className="mt-2 w-full text-sm border border-gray-300 py-1.5 rounded-md transition  bg-gray-900 text-white font-semibold hover:bg-black"
            >
              Use
            </button>
          </div>

          {/* Admin */}
          <div className="flex-1 border rounded-lg p-3 text-sm text-gray-600">
            <p className="font-medium text-gray-800">Admin</p>
            <p className="mt-1">admin@eventra.com</p>
            <p>password123</p>
            <button
              type="button"
              onClick={() => {
                setEmail(demoAdmin.email);
                setPassword(demoAdmin.password);
              }}
              className="mt-2 w-full text-sm border border-gray-300 py-1.5 rounded-md transition  bg-gray-900 text-white font-semibold hover:bg-black"
            >
              Use
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-center border border-red-100">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {!showOTP ? (
          <>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-700 focus:border-gray-700"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-700 focus:border-gray-700"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </>
        ) : (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Verification Code
            </label>
            <input
              type="text"
              required
              placeholder="Enter 6-digit code"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-center text-lg font-semibold focus:ring-2 focus:ring-gray-700"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength="6"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-900 text-white font-semibold py-3 rounded-lg hover:bg-black transition"
        >
          {loading
            ? "Processing..."
            : showOTP
            ? "Verify and Sign In"
            : "Sign In"}
        </button>
      </form>

      {/* Footer */}
      <p className="text-center mt-6 text-gray-600">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="text-gray-900 font-semibold hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default Login;