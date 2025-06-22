import { ReactNode } from "react";

import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import diff from "highlight.js/lib/languages/diff";
import java from "highlight.js/lib/languages/java";
import javascript from "highlight.js/lib/languages/javascript";
import markdown from "highlight.js/lib/languages/markdown";
import plaintext from "highlight.js/lib/languages/plaintext";
import python from "highlight.js/lib/languages/python";
import shell from "highlight.js/lib/languages/shell";
import sql from "highlight.js/lib/languages/sql";
import typescript from "highlight.js/lib/languages/typescript";
import "highlight.js/styles/atom-one-dark-reasonable.min.css";
import parse from "html-react-parser";
import { ClipboardCopyIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/ui/button";
import { cn } from "@/utils";

const languages = {
    bash,
    diff,
    java,
    javascript,
    markdown,
    plaintext,
    python,
    shell,
    sql,
    typescript,
} as const;

Object.entries(languages).forEach(([name, definition]) => hljs.registerLanguage(name, definition));

type Language = keyof typeof languages;

export const classNameToLanguage: Record<string, Language> = {
    bash: "bash",
    "language-bash": "bash",
    diff: "diff",
    "language-diff": "diff",
    java: "java",
    "language-java": "java",
    js: "javascript",
    javascript: "javascript",
    "language-js": "javascript",
    "language-javascript": "javascript",
    md: "markdown",
    "language-md": "markdown",
    plaintext: "plaintext",
    "language-plaintext": "plaintext",
    text: "plaintext",
    "language-text": "plaintext",
    py: "python",
    py2: "python",
    py3: "python",
    python: "python",
    python2: "python",
    python3: "python",
    "language-python": "python",
    "language-python2": "python",
    "language-python3": "python",
    shell: "shell",
    "language-shell": "shell",
    sql: "sql",
    "language-sql": "sql",
    ts: "typescript",
    "language-typescript": "typescript",
};

function highlightCode(code: string, language: Language): ReactNode {
    return parse(hljs.highlight(code, { language }).value);
}

function getIndexWidth(count: number) {
    if (count < 100) return "min-w-[32px]";
    if (count < 1000) return "min-w-[48px]";

    return "min-w-[60px]";
}

export function CodeBlock(props: { content: string; language: Language }) {
    /**************************************************************************/
    /* State */
    const rows = [...Array(props.content.trim().split("\n").length)];
    const width = getIndexWidth(rows.length);

    /**************************************************************************/
    /* Render */
    return (
        <div className="border-background-light rounded border-x-2 border-b-2">
            <div className="bg-background-light flex items-center py-0.5 pr-2 pl-4">
                <p>{props.language}</p>

                <div className="grow" />

                <Button
                    tooltip="Copy to clipboard"
                    className="text-text hover:text-background hover:bg-primary-light size-6 py-0 pr-1.5 pl-1.5"
                    onClick={async () => {
                        await navigator.clipboard.writeText(props.content);

                        toast.dismiss();
                        toast.success("Copied code to clipboard!", { duration: 2500 });
                    }}
                >
                    <ClipboardCopyIcon
                        width={20}
                        height={20}
                    />
                </Button>
            </div>

            <code className="rounded text-sm leading-6">
                <div className="flex gap-x-2 overflow-x-clip">
                    <div
                        className={cn(
                            "border-border text-text-dark flex-shrink-0 border-r pr-2 text-right select-none",
                            width
                        )}
                    >
                        {rows.map((_, index) => {
                            return <div key={index}>{index + 1}</div>;
                        })}
                    </div>

                    <div className="w-full overflow-x-auto border-0 whitespace-pre outline-0">
                        {highlightCode(props.content, props.language)}
                    </div>
                </div>
            </code>
        </div>
    );
}
