import { ComponentProps } from "react";

import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "@/utils";

function Switch({ className, ...props }: ComponentProps<typeof SwitchPrimitive.Root>) {
    return (
        <SwitchPrimitive.Root
            data-slot="switch"
            className={cn(
                "peer data-[state=checked]:bg-primary-light data-[state=unchecked]:bg-text inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full shadow-xs transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            {...props}
        >
            <SwitchPrimitive.Thumb
                data-slot="switch-thumb"
                className={cn(
                    "bg-background-light data-[state=checked]:bg-text pointer-events-none block size-4.5 rounded-full ring-0 transition-all data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0.5"
                )}
            />
        </SwitchPrimitive.Root>
    );
}

export { Switch };
