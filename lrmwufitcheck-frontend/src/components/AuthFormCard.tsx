import * as React from "react";

interface AuthFormCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const AuthFormCard: React.FC<AuthFormCardProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="flex flex-col items-center mb-6">
        <img src="/logo.svg" alt="FitCheck" className="h-10 w-auto mb-4" />
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground text-center mt-1">
          {description}
        </p>
      </div>
      {children}
    </div>
  );
};

export default AuthFormCard;
