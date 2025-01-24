import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/core/redux/hooks";
import type { RootState } from "@/core/redux/store";

const withPermission = <P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission: string
): React.FC<P> => {
  const WithPermission: React.FC<P> = (props) => {
    const router = useRouter();
    const currentRole = useAppSelector(
      (state: RootState) => state.user.currentRole
    );
    const [hasPermission, setHasPermission] = useState(false);

    useEffect(() => {
      if (currentRole) {
        const permissionExists = currentRole.permissions.includes(
          requiredPermission
        );
        setHasPermission(permissionExists);

        if (!permissionExists) {
          router.push("/permission-denied");
        }
      }
    }, [currentRole, requiredPermission, router]);

    if (!hasPermission) return null;

    return <Component {...props} />;
  };

  return WithPermission;
};

export default withPermission;
