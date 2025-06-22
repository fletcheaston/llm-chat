import { useMemo } from "react";

import { BanIcon, PlusIcon } from "lucide-react";

import { LargeLanguageModel } from "@/api";
import { useSettings } from "@/components/auth";
import { llmToName } from "@/components/models";
import { Button } from "@/ui/button";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/ui/select";

export function ModelMultiSelect(props: {
    llms: Array<LargeLanguageModel>;
    setLlms: (value: Array<LargeLanguageModel>) => void;
}) {
    /**************************************************************************/
    /* State */
    const settings = useSettings();

    const unselectedLlms = useMemo(() => {
        return Object.values(LargeLanguageModel).filter((llm) => {
            if (props.llms.includes(llm)) {
                return false;
            }

            if (settings.llmsAvailable.length === 0) {
                return true;
            }

            if (!settings.llmsAvailable.includes(llm)) {
                return false;
            }

            return true;
        });
    }, [props.llms, settings.llmsAvailable]);

    /**************************************************************************/
    /* Render */
    return (
        <div className="grow">
            {props.llms.length > 0 ? (
                <div className="flex flex-wrap gap-1 px-1 py-1 text-sm">
                    {props.llms.map((llm) => {
                        return (
                            <Button
                                key={llm}
                                variant="default"
                                size="custom"
                                className="bg-primary-light hover:bg-primary hover:border-primary border-primary-light text-background-dark h-fit gap-1.5 py-0.5 pr-1 pl-2 text-xs"
                                tooltip={null}
                                onClick={() => {
                                    props.setLlms(props.llms.filter((setLlm) => setLlm !== llm));
                                }}
                            >
                                {llmToName[llm]}

                                <BanIcon />
                            </Button>
                        );
                    })}
                </div>
            ) : null}

            {unselectedLlms.length > 0 ? (
                <div className="flex flex-wrap gap-1 px-1 py-1 text-sm">
                    {unselectedLlms.map((llm) => {
                        return (
                            <Button
                                key={llm}
                                variant="default"
                                size="custom"
                                className="h-fit gap-1.5 py-0.5 pr-1 pl-2 text-xs"
                                tooltip={null}
                                onClick={() => {
                                    props.setLlms([...props.llms, llm]);
                                }}
                            >
                                {llmToName[llm]}

                                <PlusIcon />
                            </Button>
                        );
                    })}
                </div>
            ) : null}
        </div>
    );
}

export function ModelSelect(props: {
    llms: Array<LargeLanguageModel>;
    setLlms: (value: Array<LargeLanguageModel>) => void;
}) {
    /**************************************************************************/
    /* Render */
    return (
        <Select
            value={props.llms[0]}
            onValueChange={(value) => {
                props.setLlms([value as LargeLanguageModel]);
            }}
        >
            <SelectTrigger className="w-fit">
                <SelectValue placeholder="Select a model" />
            </SelectTrigger>

            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Testing</SelectLabel>

                    <SelectItem value={"utils-echo" satisfies LargeLanguageModel}>Echo</SelectItem>

                    <SelectLabel>OpenAI</SelectLabel>

                    <SelectItem value={"openai-gpt-4.1" satisfies LargeLanguageModel}>
                        OpenAI GPT-4.1
                    </SelectItem>

                    <SelectItem value={"openai-gpt-4.1-mini" satisfies LargeLanguageModel}>
                        OpenAI GPT-4.1-mini
                    </SelectItem>

                    <SelectItem value={"openai-gpt-4.1-nano" satisfies LargeLanguageModel}>
                        OpenAI GPT-4.1-nano
                    </SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}
