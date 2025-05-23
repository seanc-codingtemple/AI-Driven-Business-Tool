import React, { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../Provider/Provider";
import toast from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const Login = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleForm = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/token/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: email,
                    password: password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                let errorMessage = `Login failed (${response.status})`;
                if (data && data.detail) {
                    errorMessage = data.detail;
                } else if (
                    data &&
                    typeof data === "object" &&
                    Object.keys(data).length > 0
                ) {
                    errorMessage = Object.entries(data)
                        .map(
                            ([key, value]) =>
                                `${key}: ${
                                    Array.isArray(value)
                                        ? value.join(", ")
                                        : value
                                }`
                        )
                        .join("; ");
                }
                throw new Error(errorMessage);
            }

            if (data.access && data.refresh) {
                console.log(
                    "LOGIN SUCCESSFUL. Access Token Received:",
                    data.access
                );
                console.log(
                    "LOGIN SUCCESSFUL. Refresh Token Received:",
                    data.refresh
                );
                localStorage.setItem("accessToken", data.access);
                localStorage.setItem("refreshToken", data.refresh);
                console.log(
                    "LOGIN: Value set to localStorage 'accessToken':",
                    data.access
                );
                console.log(
                    "LOGIN: Value retrieved from localStorage 'accessToken' IMMEDIATELY:",
                    localStorage.getItem("accessToken")
                );

                toast.success("Login successful!");

                setTimeout(() => {
                    const from =
                        location.state?.from?.pathname || "/business-form";
                    navigate(from, { replace: true });
                }, 100);
            } else {
                console.error(
                    "LOGIN: Tokens 'access' or 'refresh' not found in server response data:",
                    data
                );
                throw new Error(
                    "Login successful, but tokens not received from server."
                );
            }
        } catch (err) {
            console.error("Login error:", err);
            toast.error(
                err.message || "An unexpected error occurred during login."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center">
            <div className="card bg-base-100 w-full md:max-w-lg max-w-sm rounded-lg py-10 shrink-0 shadow-2xl shadow-sky-300 border border-sky-200 my-4">
                <h2 className="text-2xl font-semibold text-center">
                    Login to your account
                </h2>
                {/* Use the new handleForm */}
                <form onSubmit={handleForm} className="card-body">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Email</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            placeholder="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input input-bordered"
                            required
                        />
                    </div>

                    <div className="form-control">
                        <label className="label" htmlFor="password">
                            <span className="label-text">Password</span>
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input input-bordered"
                            required
                        />
                        {/* <label className="label">
              <Link
                // onClick={forgetPassword} // Update or remove if context is gone
                to={'/forgetPassword'} // Link can stay, page needs implementation
                className="label-text-alt link link-hover"
              >
                Forgot password?
              </Link>
            </label> */}
                    </div>

                    <div className="form-control mt-6">
                        <button
                            type="submit"
                            className="btn btn-ghost bg-sky-500 text-white hover:text-slate-950"
                            disabled={loading}
                        >
                            {loading ? "Logging In..." : "Login"}
                        </button>
                    </div>
                </form>

                <h2 className="font-normal text-center">
                    Don’t Have An Account?{" "}
                    <Link className="text-sky-500" to={"/auth/register"}>
                        Register
                    </Link>
                </h2>
                {/* Google Sign-In button - needs separate logic */}
                {/* <button onClick={handleGoogleSignIn} className="btn w-56 mx-auto mt-4" disabled={loading}> ... </button> */}
            </div>
        </div>
    );
};

export default Login;
