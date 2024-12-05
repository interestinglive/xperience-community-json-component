import React, { useState } from 'react';

import { FormComponentProps } from '@kentico/xperience-admin-base';
import { Button, FormItemWrapper, Input } from '@kentico/xperience-admin-components';

interface JsonInput {
    propertyName: string;
    label: string;
    type: number;
}

enum JsonInputType {
    Text,
    Number,
    Dropdown,
    Checkbox,
    Checkboxes,
    RadioGroup
}

export interface JsonFormComponentClientProperties extends FormComponentProps {
    inputs: JsonInput[] | null;
}

export const JsonFormComponent = (props: JsonFormComponentClientProperties) => {
    const objectSeparator = <hr style={{ margin: '20px 0px' }} />;
    const jsonObjects: any[] = props.value ? JSON.parse(props.value) : [];

    /**
     * Handler for input change event. Updates a JSON objects property and saves the field value.
     */
    const updateJsonObject = (value: string, input: JsonInput, jsonObject: any) => {
        jsonObject[input.propertyName] = value;
        if (props.onChange) {
            props.onChange(JSON.stringify(jsonObjects));
        }
    };

    /**
     * Handler for new JSON object button. Inserts empty JSON object into array and re-renders the field.
     */
    const insertObject = () => {
        jsonObjects.push({});
        if (props.onChange) {
            props.onChange(JSON.stringify(jsonObjects));
        }
    };

    /**
     * Returns an input element for the specified {@link input} and {@link jsonObject}.
     */
    const getInput = (input: JsonInput, jsonObject: any): JSX.Element => {
        const propertyValue = jsonObject[input.propertyName];
        const handler = (e: React.ChangeEvent<HTMLInputElement>) => updateJsonObject(e.target.value, input, jsonObject);
        let element;
        switch (input.type) {
            default:
            case JsonInputType.Text:
                 element = <Input
                    type='text'
                    label={input.label}
                    value={propertyValue}
                    onChange={handler} />
        }

        return element;
    };

    /**
     * Converts each JSON object in the values array into a div containing inputs for each property.
     */
    const getObjectContainers = (): JSX.Element[] => {
        const jsonObjectsAsContainers: JSX.Element[] = [];

        // Loop through individual objects in value array
        jsonObjects.forEach(o => {
            if (!props.inputs) {
                return;
            }

            const inputElements = props.inputs.map(i => getInput(i, o));
            const containerContent = insertBetween(<br/>, inputElements);
            jsonObjectsAsContainers.push(<div>{containerContent}</div>)
        });

        return jsonObjectsAsContainers;
    };

    /**
     * Inserts the {@link separator} element between each element in the provided {@link elements} array.
     */
    const insertBetween = (separator: JSX.Element, elements: JSX.Element[]) =>
        elements.flatMap((x) => [separator, x]).slice(1);
    

    const containers = getObjectContainers();
    return <FormItemWrapper
        label={props.label}
        explanationText={props.explanationText}
        invalid={props.invalid}
        validationMessage={props.validationMessage}
        markAsRequired={props.required}
        labelIcon={props.tooltip ? 'xp-i-circle' : undefined}
        labelIconTooltip={props.tooltip}>

        {insertBetween(objectSeparator, containers)}
        <br/>
        <Button
            label='Add new'
            icon='xp-plus'
            onClick={insertObject} />
    </FormItemWrapper>
};
