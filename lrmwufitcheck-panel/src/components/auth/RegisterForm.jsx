import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Link,
  useNavigate,
  useOutletContext,
  useSearchParams,
  useParams,
} from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Building, Loader2 } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { registerSchema } from "../../utils/validation";

export default function RegisterForm() {
  const navigate = useNavigate();
  const { tenantCodename } = useParams();
  const [searchParams] = useSearchParams();
  const { servicesDown, healthChecking } = useOutletContext() || {};
  const {
    register: registerUser,
    registerTenantOwner,
    isLoading,
    setPendingVerification,
    setTenant,
  } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullname: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data) => {
    setError(null);

    const result = await registerUser(data);

    if (result.success) {
      // If the backend auto-logged in the user (no verification needed),
      // redirect directly to the app
      if (result.autoLoggedIn) {
        navigate("/chat");
        return;
      }
      if (result.emailVerificationNeeded) {
        setPendingVerification({ type: "email", email: data.email });
        navigate("/verify-email");
        return;
      }
      if (result.mobileVerificationNeeded) {
        setPendingVerification({ type: "mobile", email: data.email });
        navigate("/verify-mobile");
        return;
      }
      // No verification needed and no auto-login, go to login
      navigate("/login");
    } else {
      setError(result.error || "Registration failed");
    }
  };

  const togglePassword = () => setShowPassword(!showPassword);
  const toggleConfirmPassword = () =>
    setShowConfirmPassword(!showConfirmPassword);

  const userIcon = (
    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
  );
  const mailIcon = (
    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
  );
  const lockIcon = (
    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
  );
  const buildingIcon = (
    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
  );
  const eyeIconPassword = showPassword ? (
    <EyeOff className="w-5 h-5" />
  ) : (
    <Eye className="w-5 h-5" />
  );
  const eyeIconConfirm = showConfirmPassword ? (
    <EyeOff className="w-5 h-5" />
  ) : (
    <Eye className="w-5 h-5" />
  );
  const loaderIcon = <Loader2 className="w-4 h-4 animate-spin" />;
  const registerTitle = "Create Account";
  const submitLabel = "Create Account";

  const headerSection = (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        {registerTitle}
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mt-1">
        Get started with your free account.
      </p>
    </div>
  );

  const errorSection = error && (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
      {error}
    </div>
  );

  const fullnameField = (
    <div>
      <label
        htmlFor="fullname"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        Full Name
      </label>
      <div className="relative">
        {userIcon}
        <input
          id="fullname"
          type="text"
          {...register("fullname")}
          className="input-field pl-10"
          placeholder="John Doe"
        />
      </div>
      {errors.fullname && (
        <p className="text-red-500 text-sm mt-1">{errors.fullname.message}</p>
      )}
    </div>
  );

  const emailField = (
    <div>
      <label
        htmlFor="email"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        Email
      </label>
      <div className="relative">
        {mailIcon}
        <input
          id="email"
          type="email"
          {...register("email")}
          className={`input-field pl-10`}
          placeholder="you@example.com"
        />
      </div>
      {errors.email && (
        <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
      )}
    </div>
  );

  const passwordField = (
    <div>
      <label
        htmlFor="password"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        Password
      </label>
      <div className="relative">
        {lockIcon}
        <input
          id="password"
          type={showPassword ? "text" : "password"}
          {...register("password")}
          className="input-field pl-10 pr-10"
          placeholder="Create a password"
        />
        <button
          type="button"
          onClick={togglePassword}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {eyeIconPassword}
        </button>
      </div>
      {errors.password && (
        <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
      )}
    </div>
  );

  const confirmPasswordField = (
    <div>
      <label
        htmlFor="confirmPassword"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        Confirm Password
      </label>
      <div className="relative">
        {lockIcon}
        <input
          id="confirmPassword"
          type={showConfirmPassword ? "text" : "password"}
          {...register("confirmPassword")}
          className="input-field pl-10 pr-10"
          placeholder="Confirm your password"
        />
        <button
          type="button"
          onClick={toggleConfirmPassword}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {eyeIconConfirm}
        </button>
      </div>
      {errors.confirmPassword && (
        <p className="text-red-500 text-sm mt-1">
          {errors.confirmPassword.message}
        </p>
      )}
    </div>
  );

  const isDisabled = isLoading || (servicesDown && !healthChecking);

  const submitButton = (
    <button
      type="submit"
      disabled={isDisabled}
      className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <>{loaderIcon} Creating account...</>
      ) : servicesDown ? (
        "Services Unavailable"
      ) : (
        submitLabel
      )}
    </button>
  );

  const signinLink = (
    <p className="text-center text-sm text-gray-600 dark:text-gray-400">
      Already have an account?{" "}
      <Link
        to={"/login"}
        className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
      >
        Sign in
      </Link>
    </p>
  );

  return (
    <div className="space-y-6">
      {headerSection}
      {errorSection}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {fullnameField}
        {emailField}
        {passwordField}
        {confirmPasswordField}
        {submitButton}
      </form>
      {signinLink}
    </div>
  );
}
