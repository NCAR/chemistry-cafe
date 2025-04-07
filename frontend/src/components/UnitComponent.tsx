import React, { memo, useLayoutEffect, useState } from "react";

type UnitComponentProps = {
    units: string
}

/**
 * Renders a unit value as represented in the v1 configuration into 
 */
export const UnitComponent = memo(({ units }: UnitComponentProps): React.JSX.Element => {
    const [renderedComponents, setRenderedComponents] = useState<Array<string | React.JSX.Element>>([]);

    useLayoutEffect(() => {
        const unitList = units.split(/\s+/); // Splits by any amount of whitespace between units

        let components: Array<string | React.JSX.Element> = [];
        unitList.forEach((unit, index) => {
            const [unitString, superscript]: string[] = unit.split(/(-?[0-9]+)/); // Separates unit from string
            components.push(unitString);
            if (superscript) {
                const superscriptComponent = (
                    <sup key={`${unit}-${index}`}>
                        {superscript}
                    </sup>
                )
                components.push(superscriptComponent);
            }
            components.push(" ");
        });
        setRenderedComponents(components);
    }, [units]);

    return (
        <p>
            {renderedComponents}
        </p>
    )
})