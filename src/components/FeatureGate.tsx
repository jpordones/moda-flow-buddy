import { useState, ReactNode } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradeModal } from "./UpgradeModal";
import { UserPlan } from "@/types/subscription";

interface FeatureGateProps {
  feature: keyof UserPlan;
  featureName: string;
  requiredPlan?: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function FeatureGate({ 
  feature, 
  featureName,
  requiredPlan = "professional",
  children, 
  fallback 
}: FeatureGateProps) {
  const { canUseFeature, currentPlan, loading } = useSubscription();
  const [showModal, setShowModal] = useState(false);

  if (loading) {
    return null;
  }

  const hasAccess = canUseFeature(feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  // If fallback is provided, render it. Otherwise show blocked content with modal trigger
  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <>
      <div onClick={() => setShowModal(true)} className="cursor-pointer">
        {children}
      </div>
      <UpgradeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        feature={featureName}
        requiredPlan={requiredPlan}
        currentPlan={currentPlan?.plan_type}
      />
    </>
  );
}
