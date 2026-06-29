import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Link,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { loginSchema } from "../../utils/validation";

const LOGIN_ERROR_MESSAGES = {
  WrongPassword: "Incorrect password. Please try again.",
  UserNotFound: "No account found with this email address.",
  UserLoginWithoutCredentials: "Please provide both email and password.",
  UserTenantParameterMissing: "Your account is not associated with a tenant.",
  UserTenantMismatch: "Your account does not belong to this tenant.",
  UserTenantNotFound: "The tenant could not be found.",
};

const LOGIN_MESSAGE_KEYS = {
  errMsg_PasswordDoesntMatch: "Incorrect password. Please try again.",
  errMsg_DefaultPasswordCantBeUsedInProdMode:
    "The default password cannot be used in production mode. Please contact your administrator to set a new password.",
  errMsg_UserNotFound: "No account found with this email address.",
  errMsg_ThisAccountISDeleted: "This account has been permanently deleted.",
  errMsg_UserCanNotLoginWithoutCredentials:
    "Please provide both email and password.",
};

function getLoginErrorMessage(errCode, message) {
  if (errCode && LOGIN_ERROR_MESSAGES[errCode])
    return LOGIN_ERROR_MESSAGES[errCode];
  if (message && LOGIN_MESSAGE_KEYS[message])
    return LOGIN_MESSAGE_KEYS[message];
  return message || "Invalid email or password. Please try again.";
}

export default function LoginForm() {
  const navigate = useNavigate();
  const { tenantCodename } = useParams();
  const { servicesDown, healthChecking } = useOutletContext() || {};
  const { login, isLoading, setPendingVerification } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    setError(null);
    const result = await login(data.email, data.password);

    if (result.success) {
      if (result.needs2FA) {
        navigate("/2fa");
        return;
      }
      navigate("/chat");
    } else {
      if (result.errCode === "EmailVerificationNeeded") {
        setPendingVerification({
          type: "email",
          email: data.email || data.identifier,
        });
        navigate("/verify-email");
        return;
      }
      if (result.errCode === "MobileVerificationNeeded") {
        setPendingVerification({
          type: "mobile",
          email: data.email || data.identifier,
        });
        navigate("/verify-mobile");
        return;
      }
      setError(getLoginErrorMessage(result.errCode, result.error));
    }
  };

  const togglePassword = () => setShowPassword(!showPassword);

  const emailIcon = (
    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
  );
  const lockIcon = (
    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
  );
  const eyeIcon = showPassword ? (
    <EyeOff className="w-5 h-5" />
  ) : (
    <Eye className="w-5 h-5" />
  );
  const loaderIcon = <Loader2 className="w-4 h-4 animate-spin" />;

  const headerSection = (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        Sign In
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mt-1">
        Welcome back! Please enter your credentials.
      </p>
    </div>
  );

  const errorSection = error && (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
      {error}
    </div>
  );

  const identifierField = (
    <div>
      <label
        htmlFor="email"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        Email
      </label>
      <div className="relative">
        {emailIcon}
        <input
          id="email"
          type="email"
          {...register("email")}
          className="input-field pl-10"
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
          placeholder="Enter your password"
        />
        <button
          type="button"
          onClick={togglePassword}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {eyeIcon}
        </button>
      </div>
      {errors.password && (
        <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
      )}
    </div>
  );

  const forgotPasswordLink = (
    <div className="flex justify-end">
      <Link
        to={"/forgot-password"}
        className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
      >
        Forgot password?
      </Link>
    </div>
  );

  const isDisabled = isLoading || (servicesDown && !healthChecking);

  // Preview-only convenience: auto-fill the form with the superadmin
  // credentials defined in userSettings. The literals below are emitted into
  // the bundle, so the branch is gated by `import.meta.env.MODE === 'test'`
  // — Vite replaces MODE at build time, leaving the entire block to be
  // dead-code-eliminated in stage/prod.
  const superadminAutofillButton =
    import.meta.env.MODE === "test" ? (
      <button
        type="button"
        onClick={() => {
          setValue("email", "admin@fitcheck.com", { shouldValidate: true });
          setValue("password", "superadmin", { shouldValidate: true });
        }}
        className="btn-secondary w-full text-sm"
      >
        Login as Superadmin (preview)
      </button>
    ) : null;

  const submitButton = (
    <button
      type="submit"
      disabled={isDisabled}
      className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <>{loaderIcon} Signing in...</>
      ) : servicesDown ? (
        "Services Unavailable"
      ) : (
        "Sign In"
      )}
    </button>
  );

  const signupLink = (
    <p className="text-center text-sm text-gray-600 dark:text-gray-400">
      Don't have an account?{" "}
      <Link
        to={"/register"}
        className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
      >
        Sign up
      </Link>
    </p>
  );

  return (
    <div className="space-y-6">
      {headerSection}
      {errorSection}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {identifierField}
        {passwordField}
        {forgotPasswordLink}
        {submitButton}
        {superadminAutofillButton}
      </form>
      {signupLink}
    </div>
  );
}
