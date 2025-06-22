import { ComponentProps } from "react";

import { cn } from "@/utils";

function Skeleton({ className, ...props }: ComponentProps<"div">) {
    return (
        <div
            data-slot="skeleton"
            className={cn("bg-background-dark animate-pulse rounded-md", className)}
            {...props}
        />
    );
}

export { Skeleton };
