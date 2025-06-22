import { ReactNode } from "react";

import { CopyIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/ui/button";

export function CopyButton(props: { value: string }) {
    /**************************************************************************/
    /* Render */
    return (
        <Button
            size="custom"
            className="hover:bg-primary-light hover:text-background-dark size-7 rounded"
            tooltip="Copy message"
            onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();

                navigator.clipboard.writeText(props.value).then(() => {
                    toast.dismiss();
                    toast.success("Copied to clipboard!", { duration: 1500 });
                });
            }}
        >
            <CopyIcon
                height={10}
                width={10}
            />
        </Button>
    );
}

export function ActionButton(props: {
    onClick: (() => void) | null;
    tooltip: string;
    children: ReactNode;
}) {
    /**************************************************************************/
    /* Render */
    return (
        <Button
            size="custom"
            className="hover:bg-primary-light hover:text-background-dark size-7 rounded"
            tooltip={props.tooltip}
            disabled={props.onClick === null}
            onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();

                if (props.onClick) {
                    props.onClick();
                }
            }}
        >
            {props.children}
        </Button>
    );
}
