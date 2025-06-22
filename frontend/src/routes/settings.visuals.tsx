import { useDebouncedCallback } from "@react-hookz/web";
import { createFileRoute } from "@tanstack/react-router";

import { useSettings, useUpdateSetting } from "@/components/auth";
import { themeColors, themeNames, themeParser } from "@/components/themes";
import { Button } from "@/ui/button";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/ui/carousel";
import { ColorPicker } from "@/ui/color-picker";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Switch } from "@/ui/switch";
import { cn } from "@/utils";

export const Route = createFileRoute("/settings/visuals")({
    component: RouteComponent,
});

function ColorOverride(props: {
    name: string;
    value: string;
    onChange: (value: string) => void;
    onReset: () => void;
}) {
    /**************************************************************************/
    /* Render */
    return (
        <div className="flex max-w-96 items-center gap-2">
            <ColorPicker
                id={props.name}
                value={props.value}
                onChange={props.onChange}
            />

            <Label
                htmlFor={props.name}
                className="m-0"
            >
                {props.name} Color Override
            </Label>

            <div className="grow" />

            <Button
                size="custom"
                variant="default"
                className="px-3 py-1 text-sm"
                tooltip={null}
                onClick={props.onReset}
            >
                Reset
            </Button>
        </div>
    );
}

function Theme() {
    /**************************************************************************/
    /* State */
    const settings = useSettings();
    const updateSettings = useUpdateSetting();

    const parsedThemeName = themeParser.parse(settings.visualTheme);

    // Primary
    const primary =
        settings.visualThemePrimaryOverride || themeColors[parsedThemeName]["--primary"];

    const updatePrimary = useDebouncedCallback(
        (value: string) => {
            updateSettings("visualThemePrimaryOverride", value);
        },
        [updateSettings],
        500
    );

    // Secondary
    const secondary =
        settings.visualThemeSecondaryOverride || themeColors[parsedThemeName]["--secondary"];

    const updateSecondary = useDebouncedCallback(
        (value: string) => {
            updateSettings("visualThemeSecondaryOverride", value);
        },
        [updateSettings],
        500
    );

    // Background
    const background =
        settings.visualThemeBackgroundOverride || themeColors[parsedThemeName]["--background"];

    const updateBackground = useDebouncedCallback(
        (value: string) => {
            updateSettings("visualThemeBackgroundOverride", value);
        },
        [updateSettings],
        500
    );

    // Text
    const text = settings.visualThemeTextOverride || themeColors[parsedThemeName]["--text"];

    const updateText = useDebouncedCallback(
        (value: string) => {
            updateSettings("visualThemeTextOverride", value);
        },
        [updateSettings],
        500
    );

    // Border
    const border = settings.visualThemeBorderOverride || themeColors[parsedThemeName]["--border"];

    const updateBorder = useDebouncedCallback(
        (value: string) => {
            updateSettings("visualThemeBorderOverride", value);
        },
        [updateSettings],
        1000
    );

    /**************************************************************************/
    /* Render */
    return (
        <div>
            <Label
                htmlFor="theme"
                className="mb-1 pl-2"
            >
                Theme
            </Label>

            <Select
                defaultValue={parsedThemeName}
                onValueChange={(value) => {
                    const parsedValue = themeParser.parse(value);

                    updateSettings("visualTheme", parsedValue);
                }}
            >
                <SelectTrigger className="w-44">
                    <SelectValue placeholder="Select a model" />
                </SelectTrigger>

                <SelectContent>
                    {themeNames.map((themeName) => {
                        return (
                            <SelectItem
                                key={themeName}
                                value={themeName}
                            >
                                {themeName}
                            </SelectItem>
                        );
                    })}
                </SelectContent>
            </Select>

            <div className="mt-2 flex flex-col gap-4 pl-2">
                <ColorOverride
                    name="Primary"
                    value={primary}
                    onChange={updatePrimary}
                    onReset={() => {
                        updateSettings("visualThemePrimaryOverride", "");
                    }}
                />

                <ColorOverride
                    name="Secondary"
                    value={secondary}
                    onChange={updateSecondary}
                    onReset={() => {
                        updateSettings("visualThemeSecondaryOverride", "");
                    }}
                />

                <ColorOverride
                    name="Background"
                    value={background}
                    onChange={updateBackground}
                    onReset={() => {
                        updateSettings("visualThemeBackgroundOverride", "");
                    }}
                />

                <ColorOverride
                    name="Text"
                    value={text}
                    onChange={updateText}
                    onReset={() => {
                        updateSettings("visualThemeTextOverride", "");
                    }}
                />

                <ColorOverride
                    name="Border"
                    value={border}
                    onChange={updateBorder}
                    onReset={() => {
                        updateSettings("visualThemeBorderOverride", "");
                    }}
                />
            </div>
        </div>
    );
}

function StatsForNerds() {
    /**************************************************************************/
    /* State */
    const settings = useSettings();
    const updateSettings = useUpdateSetting();

    /**************************************************************************/
    /* Render */
    return (
        <div className="flex items-center gap-2">
            <Label
                htmlFor="stats"
                className="mb-0 cursor-pointer pl-2 text-lg"
            >
                Stats for Nerds
            </Label>

            <Switch
                id="stats"
                checked={settings.visualStatsForNerds}
                onCheckedChange={(checked) => {
                    updateSettings("visualStatsForNerds", checked);
                }}
            />
        </div>
    );
}

function BranchOrientation() {
    /**************************************************************************/
    /* State */
    const settings = useSettings();
    const updateSettings = useUpdateSetting();

    /**************************************************************************/
    /* Render */
    return (
        <div>
            <Label
                htmlFor="branch"
                className="mb-1 pl-2"
            >
                Branch Orientation
            </Label>

            <Select
                defaultValue={settings.visualBranchVertical ? "vertical" : "horizontal"}
                onValueChange={(value) => {
                    updateSettings("visualBranchVertical", value === "vertical");
                }}
            >
                <SelectTrigger className="w-44">
                    <SelectValue placeholder="Branch Orientation" />
                </SelectTrigger>

                <SelectContent>
                    <SelectItem value="vertical">Vertical</SelectItem>

                    <SelectItem value="horizontal">Horizontal</SelectItem>
                </SelectContent>
            </Select>

            <Carousel
                orientation={settings.visualBranchVertical ? "vertical" : "horizontal"}
                className="my-8 w-full"
                opts={{ startIndex: 0, watchDrag: false }}
            >
                <CarouselContent
                    className={settings.visualBranchVertical ? "py-1 pt-4" : "px-1 pl-4"}
                >
                    <CarouselItem
                        className={cn(
                            "group bg-background hover:bg-background-dark border-border h-fit basis-3/5 cursor-pointer rounded-lg border",
                            settings.visualBranchVertical ? "my-1" : "mx-1"
                        )}
                    >
                        Lorem ipsum dolor sit amet, ei his eirmod utamur, omnis illud dolor et cum,
                        mei cibo mandamus repudiandae ad. Sint probatus ex duo, eu natum autem
                        ancillae duo. Cu oratio evertitur vix, cu recteque honestatis mel. Diam
                        eleifend est id.
                    </CarouselItem>

                    <CarouselItem
                        className={cn(
                            "group bg-background hover:bg-background-dark border-border h-fit basis-3/5 cursor-pointer rounded-lg border",
                            settings.visualBranchVertical ? "my-1" : "mx-1"
                        )}
                    >
                        Suscipit mnesarchum voluptatum ne nec, quaeque equidem prodesset eu pri.
                        Falli liber his ei, cum equidem delicatissimi id. Duo ipsum quaeque
                        contentiones ex, tale impedit explicari ea mei, ex sed summo verear aliquam.
                        Et mel omnis dolores. Quod nobis tincidunt usu in, per agam tincidunt at. Ea
                        sed eirmod eripuit. Ei duis everti vis, eu usu honestatis interpretaris.
                    </CarouselItem>

                    <CarouselItem
                        className={cn(
                            "group bg-background hover:bg-background-dark border-border h-fit basis-3/5 cursor-pointer rounded-lg border",
                            settings.visualBranchVertical ? "my-1" : "mx-1"
                        )}
                    >
                        Vim decore accumsan an, tation animal nusquam ut mel, ad everti scripta
                        nostrud quo. Purto vidisse volumus no vel. His ut putent indoctum
                        adversarium, ex est meis quas illud. Doctus commune instructior ius in.
                    </CarouselItem>
                </CarouselContent>

                <CarouselPrevious tooltip="Previous" />
                <CarouselNext tooltip="Next" />
            </Carousel>
        </div>
    );
}

function RouteComponent() {
    return (
        <div className="pb-8">
            <h1 className="text-4xl font-semibold">Visual Settings</h1>

            <div className="my-4 flex flex-col gap-10">
                <Theme />

                <StatsForNerds />

                <BranchOrientation />
            </div>
        </div>
    );
}
