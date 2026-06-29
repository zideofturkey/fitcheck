import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import EmailVerificationForm from "../components/auth/EmailVerificationForm";
import MobileVerificationForm from "../components/auth/MobileVerificationForm";

/**
 * VerifyPage - Email/Mobile verification page
 * Routes to the appropriate verification form based on URL parameter or pending verification
 */
export default function VerifyPage() {
  const { type } = useParams();
  const navigate = useNavigate();
  const { pendingVerification } = useAuthStore();

  const verificationType = type || pendingVerification?.type;

  useEffect(() => {
    if (!verificationType && !pendingVerification) {
      navigate("/login");
    }
  }, [verificationType, pendingVerification, navigate]);

  if (verificationType === "email") {
    return <EmailVerificationForm />;
  }

  if (verificationType === "mobile") {
    return <MobileVerificationForm />;
  }

  // Default to email if pending verification exists but type is unclear
  if (pendingVerification) {
    return pendingVerification.type === "mobile" ? (
      <MobileVerificationForm />
    ) : (
      <EmailVerificationForm />
    );
  }

  // No verification configured or type not recognized
  return (
    <div className="text-center space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        Verification
      </h2>
      <p className="text-gray-600 dark:text-gray-400">
        No verification is required or the verification type is not recognized.
      </p>
      <button onClick={() => navigate("/login")} className="btn-primary">
        Go to Login
      </button>
    </div>
  );
}
