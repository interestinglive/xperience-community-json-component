import React from 'react';
import { FormComponentProps } from '@kentico/xperience-admin-base';
import {
    Button,
    ButtonColor,
    ButtonSize,
    FormItemWrapper,
    Headline,
    HeadlineSize,
    Spacing
} from '@kentico/xperience-admin-components';
import { JsonInputElement, JsonInputType } from './jsonInputElement';

interface JsonFormComponentClientProperties extends FormComponentProps {
    inputs: JsonInput[] | null;
    errorMessage: string | null;
}

/** Corresponds with the C# class JsonInput */
export interface JsonInput {
    propertyName: string;
    label: string;
    type: number;
    options: string | undefined;
}

export const JsonFormComponent = (props: JsonFormComponentClientProperties) => {
    const jsonObjects: any[] = props.value ? JSON.parse(props.value) : [];

    const save = () => {
        if (props.onChange) {
            props.onChange(JSON.stringify(jsonObjects));
        }
    };

    const insertObject = () => {
        const jsonObject: any = {};
        props.inputs?.forEach(i => {
            const defaultValue = getDefaultValue(i);
            jsonObject[i.propertyName] = defaultValue;
        });
        jsonObjects.push(jsonObject);
        save();
    };

    const deleteObject = (index: number) => {
        jsonObjects.splice(index, 1);
        save();
    };

    // Swap with the previous element.
    const moveUp = (index: number) => {
        if (index === 0) return;
        const temp = jsonObjects[index - 1];
        jsonObjects[index - 1] = jsonObjects[index];
        jsonObjects[index] = temp;
        save();
    };

    // Swap with the next element.
    const moveDown = (index: number) => {
        if (index === jsonObjects.length - 1) return;
        const temp = jsonObjects[index + 1];
        jsonObjects[index + 1] = jsonObjects[index];
        jsonObjects[index] = temp;
        save();
    };

    const getDefaultValue = (input: JsonInput) => {
        switch (input.type) {
            case JsonInputType.Checkbox:
                return false;
            case JsonInputType.Number:
                return 0;
            default:
            case JsonInputType.Text:
            case JsonInputType.Dropdown:
            case JsonInputType.RadioGroup:
            case JsonInputType.MultipleChoice:
                return '';
        }
    };

    const getObjectContainers = (): JSX.Element[] => {
        const jsonObjectsAsContainers: JSX.Element[] = [];

        jsonObjects.forEach((o, index) => {
            if (!props.inputs) return;

            const inputElements = props.inputs.map(i => (
                <JsonInputElement
                    key={i.propertyName}
                    disabled={props.disabled}
                    input={i}
                    editedObject={o}
                    onUpdate={save} />
            ));
            const containerContent = insertBetween(<br />, inputElements);
            containerContent.unshift(getContainerHeader(index));
            jsonObjectsAsContainers.push(<div key={index}>{containerContent}</div>);
        });

        return jsonObjectsAsContainers;
    };

    // Updated header: includes Move Up, Move Down, and Delete buttons.
    const getContainerHeader = (index: number) => {
        const moveUpButton = index > 0 && (
            <Button
                icon='xp-arrow-up'
                title='Move Up'
                borderless={true}
                size={ButtonSize.S}
                disabled={props.disabled}
                color={ButtonColor.Quinary}
                onClick={() => moveUp(index)} />
        );

        const moveDownButton = index < jsonObjects.length - 1 && (
            <Button
                icon='xp-arrow-down'
                title='Move Down'
                borderless={true}
                size={ButtonSize.S}
                disabled={props.disabled}
                color={ButtonColor.Quinary}
                onClick={() => moveDown(index)} />
        );

        const deleteButton = (
            <Button
                icon='xp-bin'
                title='Delete'
                borderless={true}
                size={ButtonSize.S}
                disabled={props.disabled}
                color={ButtonColor.Quinary}
                onClick={() => deleteObject(index)} />
        );

        return (
            <Headline
                size={HeadlineSize.S}
                spacingBottom={Spacing.S}
                spacingTop={Spacing.S}>
                {moveUpButton} {moveDownButton} {deleteButton} {'Item ' + (index + 1)}
            </Headline>
        );
    };

    const insertBetween = (separator: JSX.Element, elements: JSX.Element[]) =>
        elements.flatMap((x) => [separator, x]).slice(1);

    if (props.errorMessage) {
        return (
            <FormItemWrapper
                label={props.label}
                explanationText={props.explanationText}
                invalid={true}
                validationMessage={props.errorMessage}
                children={null}
                markAsRequired={props.required}
                labelIcon={props.tooltip ? 'xp-i-circle' : undefined}
                labelIconTooltip={props.tooltip} />
        );
    }

    const containers = getObjectContainers();
    return (
        <FormItemWrapper
            label={props.label}
            explanationText={props.explanationText}
            invalid={props.invalid}
            validationMessage={props.validationMessage}
            markAsRequired={props.required}
            labelIcon={props.tooltip ? 'xp-i-circle' : undefined}
            labelIconTooltip={props.tooltip}>
            {containers}
            <br />
            <Button
                label='New'
                icon='xp-plus'
                title='Add new item'
                disabled={props.disabled}
                onClick={insertObject} />
        </FormItemWrapper>
    );
};
