import { ComponentProps } from "react";

import { cn } from "@/utils";

function Input({ className, type, ...props }: ComponentProps<"input">) {
    return (
        <input
            type={type}
            data-slot="input"
            className={cn(
                "file:text-foreground text-primary-light placeholder:text-text-dark border-border flex w-full min-w-0 rounded-md border bg-transparent px-2 py-1.5 text-sm font-medium transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                className
            )}
            {...props}
        />
    );
}

export { Input };
