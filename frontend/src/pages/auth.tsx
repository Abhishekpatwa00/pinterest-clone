import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, X } from "lucide-react";
import { apiReq } from "@/lib/apiReq";
import { useNavigate } from "react-router";
import { userAuthStore } from "@/lib/authStore";

export const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userName, setUserName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const { setCurrentUser } = userAuthStore();

  const handleSubmit = async (e: FormEvent) => {

    e.preventDefault();
    

    const formData = new FormData(e.target as HTMLFormElement)
    const data = Object.fromEntries(formData as any)
    console.log(data)
   

    try {
      const endpoint = isSignUp ? `/auth/register` : "/auth/login";
      const user = await apiReq.post(endpoint, data);
      setCurrentUser(user.data) 
      navigate("/")
    } catch(err) {
      console.log("Error in user auth", err);
    }
  };

  

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-muted/30">
      <div className="relative w-full max-w-[440px] bg-card border border-border/80 shadow-lg rounded-3xl p-8 sm:p-10 flex flex-col items-center">
        {/* Close / Return home button */}
        <Link
          to="/"
          className="absolute top-5 right-5 text-muted-foreground hover:text-foreground p-1.5 rounded-full hover:bg-muted transition-colors"
          aria-label="Back to home"
        >
          <X className="w-5 h-5" />
        </Link>

        {/* Logo */}
        <div className="mb-3">
          <img
            src="/general/logo.png"
            alt="Pinterest Logo"
            className="w-10 h-10 object-contain"
          />
        </div>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-center text-foreground">
          {isSignUp ? "Welcome to Pinterest" : "Welcome back"}
        </h1>
        <p className="text-sm text-muted-foreground text-center mt-1.5 mb-6">
          {isSignUp ? "Find new ideas to try" : "Log in to see your personalized feed"}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3.5">
          {/* Username input (only when signing up) */}
          {isSignUp && (
            <div className="flex flex-col gap-1">
              <label htmlFor="auth-username" className="text-xs font-medium text-muted-foreground ml-1">
                Username
              </label>
              <input
                id="auth-username"
                name="userName"
                type="text"
                placeholder="Username"
                autoComplete="username"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full h-11 px-4 text-sm rounded-2xl border border-border bg-background focus:ring-2 focus:ring-ring focus:border-foreground outline-none transition-all placeholder:text-muted-foreground/60"
              />
            </div>
          )}

          {/* Display Name input (only when signing up) */}
          {isSignUp && (
            <div className="flex flex-col gap-1">
              <label htmlFor="auth-displayname" className="text-xs font-medium text-muted-foreground ml-1">
                Display Name
              </label>
              <input
                id="auth-displayname"
                name="displayName"
                type="text"
                placeholder="Display name"
                autoComplete="name"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full h-11 px-4 text-sm rounded-2xl border border-border bg-background focus:ring-2 focus:ring-ring focus:border-foreground outline-none transition-all placeholder:text-muted-foreground/60"
              />
            </div>
          )}

          {/* Email input */}
          <div className="flex flex-col gap-1">
            <label htmlFor="auth-email" className="text-xs font-medium text-muted-foreground ml-1">
              Email
            </label>
            <input
              id="auth-email"
              name="email"
              type="email"
              placeholder="Email address"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-4 text-sm rounded-2xl border border-border bg-background focus:ring-2 focus:ring-ring focus:border-foreground outline-none transition-all placeholder:text-muted-foreground/60"
            />
          </div>

          {/* Password input */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between ml-1">
              <label htmlFor="auth-password" className="text-xs font-medium text-muted-foreground">
                Password
              </label>
              {!isSignUp && (
                <button
                  type="button"
                  className="text-xs font-semibold text-foreground/80 hover:text-foreground hover:underline cursor-pointer"
                >
                  Forgot your password?
                </button>
              )}
            </div>
            <div className="relative">
              <input
                id="auth-password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder={isSignUp ? "Create a password" : "Enter your password"}
                autoComplete={isSignUp ? "new-password" : "current-password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 pl-4 pr-11 text-sm rounded-2xl border border-border bg-background focus:ring-2 focus:ring-ring focus:border-foreground outline-none transition-all placeholder:text-muted-foreground/60"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 transition-colors cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

        
          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-11 mt-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors shadow-sm cursor-pointer"
          >
            {isSignUp ? "Continue" : "Log in"}
          </Button>

          {/* Divider */}
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground font-semibold">OR</span>
            </div>
          </div>

          {/* Google Social Login */}
          <button
            type="button"
            className="w-full h-11 flex items-center justify-center gap-3 rounded-full border border-border bg-background hover:bg-muted/60 text-sm font-semibold text-foreground transition-all cursor-pointer shadow-xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            Continue with Google
          </button>
        </form>

        {/* Toggle between Login and Signup */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          {isSignUp ? "Already a member?" : "Not on Pinterest yet?"}{" "}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-semibold text-foreground hover:underline cursor-pointer"
          >
            {isSignUp ? "Log in" : "Sign up"}
          </button>
        </div>

        {/* Terms and Privacy policy */}
        <p className="mt-6 text-[11px] text-center text-muted-foreground/80 leading-relaxed px-4">
          By continuing, you agree to Pinterest&apos;s{" "}
          <span className="underline cursor-pointer hover:text-foreground">Terms of Service</span> and acknowledge that you&apos;ve read our{" "}
          <span className="underline cursor-pointer hover:text-foreground">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
};
