import {
    ExternalLink,
    InfoIcon,
    LightbulbIcon,
    MegaphoneIcon,
    OctagonAlertIcon,
    TriangleAlertIcon,
} from "lucide-react";
import ReactMarkdown, { Components } from "react-markdown";
import rehypeMathJaxSvg from "rehype-mathjax";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkEmoji from "remark-emoji";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRemoveComments from "remark-remove-comments";

import { cn } from "@/utils";

import { CodeBlock, classNameToLanguage } from "./highlight-code";

const components: Components = {
    h1: (props) => {
        const { className, node, ...rest } = props;

        return (
            <h1
                className={cn("my-4 text-4xl font-semibold", className)}
                {...rest}
            />
        );
    },
    h2: (props) => {
        const { className, node, ...rest } = props;

        return (
            <h2
                className={cn("my-2 text-3xl font-semibold", className)}
                {...rest}
            />
        );
    },
    h3: (props) => {
        const { className, node, ...rest } = props;

        return (
            <h3
                className={cn("my-2 text-2xl font-semibold", className)}
                {...rest}
            />
        );
    },
    h4: (props) => {
        const { className, node, ...rest } = props;

        return (
            <h4
                className={cn("my-2 text-xl font-semibold", className)}
                {...rest}
            />
        );
    },
    h5: (props) => {
        const { className, node, ...rest } = props;

        return (
            <h5
                className={cn("my-2 text-lg font-semibold", className)}
                {...rest}
            />
        );
    },
    h6: (props) => {
        const { className, node, ...rest } = props;

        return (
            <h6
                className={cn("my-2 text-base font-semibold", className)}
                {...rest}
            />
        );
    },
    ul: (props) => {
        const { className, node, ...rest } = props;

        return (
            <ul
                className={cn(
                    "marker:text-text list-outside list-disc pl-3 marker:content-['⁃']",
                    className
                )}
                {...rest}
            />
        );
    },
    blockquote: (props) => {
        const { className, node, ...rest } = props;

        return (
            <blockquote
                className={cn(
                    "[&>p]:border-background-light [&>blockquote]:border-background-light [&>blockquote]:border-l-4 [&>blockquote]:pl-3 [&>p]:border-l-4 [&>p]:pl-3",
                    className
                )}
                {...rest}
            />
        );
    },
    p: (props) => {
        const { className, node, children, ...rest } = props;

        if (typeof children === "string") {
            if (children.startsWith("[!NOTE]")) {
                return (
                    <div className="flex items-start border-l-4 border-l-sky-500 pl-1">
                        <InfoIcon
                            width={20}
                            height={20}
                            className="mt-1 mr-1 text-sky-500"
                        />

                        <p
                            className={className}
                            {...rest}
                        >
                            {children.replace("[!NOTE]", "")}
                        </p>
                    </div>
                );
            }

            if (children.startsWith("[!TIP]")) {
                return (
                    <div className="flex items-start border-l-4 border-l-emerald-600 pl-1">
                        <LightbulbIcon
                            width={20}
                            height={20}
                            className="mt-1 mr-1 text-emerald-600"
                        />

                        <p
                            className={className}
                            {...rest}
                        >
                            {children.replace("[!TIP]", "")}
                        </p>
                    </div>
                );
            }

            if (children.startsWith("[!IMPORTANT]")) {
                return (
                    <div className="flex items-start border-l-4 border-l-purple-600 pl-1">
                        <MegaphoneIcon
                            width={20}
                            height={20}
                            className="mt-1 mr-1 text-purple-600"
                        />

                        <p
                            className={className}
                            {...rest}
                        >
                            {children.replace("[!IMPORTANT]", "")}
                        </p>
                    </div>
                );
            }

            if (children.startsWith("[!WARNING]")) {
                return (
                    <div className="flex items-start border-l-4 border-l-amber-500 pl-1">
                        <TriangleAlertIcon
                            width={20}
                            height={20}
                            className="mt-1 mr-1 text-amber-500"
                        />

                        <p
                            className={className}
                            {...rest}
                        >
                            {children.replace("[!WARNING]", "")}
                        </p>
                    </div>
                );
            }

            if (children.startsWith("[!CAUTION]")) {
                return (
                    <div className="flex items-start border-l-4 border-l-rose-700 pl-1">
                        <OctagonAlertIcon
                            width={20}
                            height={20}
                            className="mt-1 mr-1 text-rose-700"
                        />

                        <p
                            className={className}
                            {...rest}
                        >
                            {children.replace("[!CAUTION]", "")}
                        </p>
                    </div>
                );
            }
        }

        return (
            <p
                className={className}
                {...rest}
            >
                {children}
            </p>
        );
    },
    ol: (props) => {
        const { className, node, ...rest } = props;

        return (
            <ol
                className={cn(
                    "marker:text-text list-inside list-decimal marker:content-[counter]",
                    className
                )}
                {...rest}
            />
        );
    },
    li: (props) => {
        const { className, node, ...rest } = props;

        return (
            <li
                className={cn("pl-2", className)}
                {...rest}
            />
        );
    },
    a: (props) => {
        const { className, node, children, href, ...rest } = props;

        const external = href?.startsWith("http");
        const textLink = typeof children === "string";

        return (
            <a
                className={cn(
                    "group hover:text-primary text-primary-light visited:text-secondary-light hover:visited:text-secondary inline-flex items-center font-medium underline",
                    className
                )}
                href={href}
                target={external ? "_blank" : ""}
                rel={external ? "noreferrer" : ""}
                {...rest}
            >
                {children}

                {external && textLink ? (
                    <ExternalLink
                        width={10}
                        height={10}
                        className="mb-2 ml-0.5"
                    />
                ) : null}
            </a>
        );
    },
    table: (props) => {
        const { className, node, ...rest } = props;

        return (
            <div className="overflow-x-auto">
                <table
                    className={cn(
                        "border-background-light [&_td]:border-background-light [&_th]:border-background-light my-2 border-collapse border [&_td]:border [&_td]:px-2 [&_td]:py-0.5 [&_th]:border [&_th]:px-2 [&_th]:text-nowrap",
                        className
                    )}
                    {...rest}
                />
            </div>
        );
    },
    kbd: (props) => {
        const { className, node, ...rest } = props;

        return (
            <kbd
                className={cn("bg-background-light mx-1 rounded px-1 py-0.5", className)}
                {...rest}
            />
        );
    },
    pre: (props) => {
        const { className, node, lang = "", ...rest } = props;

        const language = classNameToLanguage[lang];

        if (language) {
            const { children } = props;

            if (typeof children === "string") {
                return (
                    <CodeBlock
                        content={children}
                        language={language}
                    />
                );
            }
        }

        return (
            <pre
                className={cn("bg-background-dark my-2 overflow-x-auto rounded", className)}
                {...rest}
            />
        );
    },
    code: (props) => {
        const { className = "", node, ...rest } = props;

        const language = classNameToLanguage[className];

        if (language) {
            const { children } = props;

            if (typeof children === "string") {
                return (
                    <CodeBlock
                        content={children}
                        language={language}
                    />
                );
            }
        }

        return (
            <code
                className={cn("bg-background-light rounded px-1 py-0.5", className)}
                {...rest}
            />
        );
    },
    img: (props) => {
        const { className, node, alt, ...rest } = props;

        return (
            <figure className="my-4 w-fit">
                <img
                    className={cn("rounded", className)}
                    alt={alt}
                    {...rest}
                />

                <figcaption className="text-text-dark text-center text-sm">
                    <i>{alt}</i>
                </figcaption>
            </figure>
        );
    },
    hr: (props) => {
        const { className, node, ...rest } = props;

        return (
            <hr
                className={cn("border-background-light my-4", className)}
                {...rest}
            />
        );
    },
};

export function Markdown(props: { content: string }) {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath, remarkRemoveComments, remarkEmoji]}
            rehypePlugins={[rehypeMathJaxSvg, rehypeRaw, rehypeSanitize]}
            components={components}
        >
            {props.content}
        </ReactMarkdown>
    );
}
