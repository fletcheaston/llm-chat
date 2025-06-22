import { ComponentProps } from "react";
import { forwardRef, useMemo, useState } from "react";

import { HexColorPicker } from "react-colorful";

import { cn } from "@//utils";

import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface ColorPickerProps {
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
}

const ColorPicker = forwardRef<
    HTMLInputElement,
    Omit<ComponentProps<"button">, "value" | "onChange" | "onBlur"> & ColorPickerProps
>(({ disabled, value, onChange, onBlur, name, className, ...props }) => {
    const [open, setOpen] = useState(false);

    const parsedValue = useMemo(() => {
        return value || "#FFFFFF";
    }, [value]);

    return (
        <Popover
            onOpenChange={setOpen}
            open={open}
        >
            <PopoverTrigger
                asChild
                disabled={disabled}
                onBlur={onBlur}
            >
                <Button
                    {...props}
                    className={cn("block size-6", className)}
                    name={name}
                    onClick={() => {
                        setOpen(true);
                    }}
                    size="icon"
                    style={{
                        backgroundColor: parsedValue,
                    }}
                    tooltip={null}
                    variant="default"
                >
                    <div />
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-full">
                <HexColorPicker
                    color={parsedValue}
                    onChange={onChange}
                />
            </PopoverContent>
        </Popover>
    );
});
ColorPicker.displayName = "ColorPicker";

export { ColorPicker };
