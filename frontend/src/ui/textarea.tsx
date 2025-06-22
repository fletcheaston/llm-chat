import { ComponentProps } from "react";

import { cn } from "@/utils";

function Textarea({ className, ...props }: ComponentProps<"textarea">) {
    return (
        <textarea
            data-slot="textarea"
            rows={1}
            className={cn(
                "placeholder:text-text-dark flex field-sizing-content min-h-12 w-full resize-none text-sm font-medium transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            {...props}
        />
    );
}

export { Textarea };
