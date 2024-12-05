import React from 'react';
import { FormComponentProps } from '@kentico/xperience-admin-base';
import {
    Button,
    ButtonColor,
    ButtonSize,
    FormItemWrapper,
    Headline,
    HeadlineSize,
    Input,
    MenuItem,
    Select,
    Spacing
} from '@kentico/xperience-admin-components';

/** Corresponds with the C# class JsonInput */
interface JsonInput {
    propertyName: string;
    label: string;
    type: number;
    options: string | undefined;
}

/** Corresponds with the C# class JsonInputType */
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
    errorMessage: string | null;
}

export const JsonFormComponent = (props: JsonFormComponentClientProperties) => {
    const jsonObjects: any[] = props.value ? JSON.parse(props.value) : [];

    const save = () => {
        if (props.onChange) {
            props.onChange(JSON.stringify(jsonObjects));
        }
    };

    /**
     * Handler for input change event. Updates a JSON objects property and saves the field value.
     */
    const updateJsonObject = (value: string | undefined, input: JsonInput, jsonObject: any) => {
        jsonObject[input.propertyName] = value;
        save();
    };

    /**
     * Handler for new JSON object button. Inserts empty JSON object into array and re-renders the field.
     */
    const insertObject = () => {
        jsonObjects.push({});
        save();
    };

    /**
     * Handler for the delete JSON object button. Deletes the object at the provided {@link index} and re-renders the field.
     */
    const deleteObject = (index: number) => {
        jsonObjects.splice(index, 1);
        save();
    };

    /**
     * Returns an array of {@link MenuItem}s generated from the provided inputs {@link JsonInput.options}.
     */
    const getDropdownOptions = (input: JsonInput) => {
        const options = input.options?.split('|');
        return options?.map(o => {
            const optionSplit = o.split(';');

            return <MenuItem primaryLabel={optionSplit[1]} value={optionSplit[0]} />
        });
    }

    /**
     * Returns an input element for the specified {@link input} and {@link jsonObject}.
     */
    const getInput = (input: JsonInput, jsonObject: any): JSX.Element => {
        const propertyValue = jsonObject[input.propertyName];
        const handler = (e: React.ChangeEvent<HTMLInputElement>) => updateJsonObject(e.target.value, input, jsonObject);
        switch (input.type) {
            case JsonInputType.Dropdown:
                return <Select
                    value={propertyValue ?? undefined}
                    label={input.label}
                    onChange={(val) => updateJsonObject(val, input, jsonObject)}
                    clearable={true}
                    clearButtonTooltip='Clear'>
                    {getDropdownOptions(input)}
                </Select>
            case JsonInputType.Number:
                return <Input
                    type='number'
                    label={input.label}
                    value={propertyValue}
                    onChange={handler} />
            default:
            case JsonInputType.Text:
                 return <Input
                    type='text'
                    label={input.label}
                    value={propertyValue}
                    onChange={handler} />
        }
    };

    /**
     * Converts each JSON object in the values array into a div containing inputs for each property.
     */
    const getObjectContainers = (): JSX.Element[] => {
        const jsonObjectsAsContainers: JSX.Element[] = [];

        // Loop through individual objects in value array
        jsonObjects.forEach((o, index) => {
            if (!props.inputs) {
                return;
            }

            const inputElements = props.inputs.map(i => getInput(i, o));
            const containerContent = insertBetween(<br />, inputElements);
            // Add header to beginning of content
            containerContent.unshift(getContainerHeader(index));
            jsonObjectsAsContainers.push(<div>{containerContent}</div>)
        });

        return jsonObjectsAsContainers;
    };

    /**
     * Gets the header for a JSON objects container, including the item number and delete button.
     */
    const getContainerHeader = (index: number) => {
        const deleteButton = <Button
            icon='xp-bin'
            title='Delete'
            borderless={true}
            size={ButtonSize.S}
            color={ButtonColor.Quinary}
            onClick={() => deleteObject(index)} />

        return <Headline
            size={HeadlineSize.S}
            spacingBottom={Spacing.S}
            spacingTop={Spacing.S}>
            {deleteButton} {'Item ' + (index + 1)}
        </Headline>
    };

    /**
     * Inserts the {@link separator} element between each element in the provided {@link elements} array.
     */
    const insertBetween = (separator: JSX.Element, elements: JSX.Element[]) =>
        elements.flatMap((x) => [separator, x]).slice(1);

    if (props.errorMessage) {
        return <FormItemWrapper
            label={props.label}
            explanationText={props.explanationText}
            invalid={true}
            validationMessage={props.errorMessage}
            children={null}
            markAsRequired={props.required}
            labelIcon={props.tooltip ? 'xp-i-circle' : undefined}
            labelIconTooltip={props.tooltip} />
    }

    return <FormItemWrapper
        label={props.label}
        explanationText={props.explanationText}
        invalid={props.invalid}
        validationMessage={props.validationMessage}
        markAsRequired={props.required}
        labelIcon={props.tooltip ? 'xp-i-circle' : undefined}
        labelIconTooltip={props.tooltip}>

        {getObjectContainers()}
        <br/>
        <Button
            label='New'
            icon='xp-plus'
            title='Add new JSON item'
            onClick={insertObject} />
    </FormItemWrapper>
};
