"use client";

import { Card, Button, Input, Badge } from "@/components/ui";
import { useProperty, useVerifyProperty, useActivateProperty } from "@/lib/hooks";
import { useState } from "react";
import { useAccount } from "wagmi";

export function AdminPanel({ address, landlordProperties }: { address?: string; landlordProperties?: bigint[] }) {
  const [selectedId, setSelectedId] = useState<string>("");
  const [propertyId, setPropertyId] = useState<string>("");
  const { data: property } = useProperty(propertyId ? BigInt(propertyId) : BigInt(0));
  const status = property && property.status !== undefined ? Number(property.status) : undefined;
  // extract landlord from returned struct (may be tuple/object depending on the hook)
  const landlordAddr: string | undefined = property ? (property as any).landlord : undefined;
  const { address: connected } = useAccount();
  const isLandlord = connected && landlordAddr ? connected.toLowerCase() === (landlordAddr as string).toLowerCase() : false;
  const { verifyProperty, isPending: isVerifying, isConfirming: isVerifyingConfirm, isSuccess: isVerified } = useVerifyProperty();
  const { activateProperty, isPending: isActivating, isConfirming: isActivatingConfirm, isSuccess: isActivated } = useActivateProperty();

  return (
    <Card title="Admin Property Controls" icon="🛠" className="mb-8">
      <div className="space-y-4">
        <Input
          label="Property ID"
          value={propertyId}
          onChange={e => setPropertyId(e.target.value)}
          type="number"
          min="0"
        />
        {property && (
          <div className="space-y-2">
            <div>
              <span className="font-mono text-xs text-white/40">Status: </span>
              <Badge color="blue">{status !== undefined ? status : "N/A"}</Badge>
            </div>
            <div>
              <Button
                onClick={() => verifyProperty(BigInt(propertyId))}
                loading={isVerifying || isVerifyingConfirm}
                disabled={isVerified || status !== 0}
                className="mr-2"
              >
                Verify Property
              </Button>
              <Button
                onClick={() => activateProperty(BigInt(propertyId))}
                loading={isActivating || isActivatingConfirm}
                disabled={isActivated || status !== 1 || !isLandlord}
                title={!isLandlord ? "Only the landlord (owner) can activate this property" : undefined}
              >
                Activate Property
              </Button>
              {!isLandlord && (
                <p className="text-[12px] text-white/30 mt-2">Only the landlord (owner) may activate the property. Current owner: <span className="font-mono">{landlordAddr ?? "N/A"}</span></p>
              )}
            </div>
            {isVerified && <Badge color="green">Verified!</Badge>}
            {isActivated && <Badge color="green">Activated!</Badge>}
          </div>
        )}
      </div>
    </Card>
  );
}