﻿import React from 'react';
import {
    Checkbox,
    Input,
    MenuItem,
    RadioButton,
    RadioGroup,
    Select,
    RichTextEditor,
    TextArea
} from '@kentico/xperience-admin-components';
import { JsonInput } from './jsonFormComponent';

/** Corresponds with the C# class JsonInputType */
export enum JsonInputType {
    Text,
    Number,
    Dropdown,
    Checkbox,
    RadioGroup,
    MultipleChoice,
    RichTextEditor,
    TextArea
}

interface JsonInputElementProperties {
    /** The configuration of the editing component. */
    input: JsonInput
    /** The JSON object that is being edited by this component. */
    editedObject: any
    /** A function called when the value of the underlying property changes. */
    onUpdate: () => void
    /** If true, the input(s) should be disabled */
    disabled: boolean | undefined
}

/**
 * A React component which represents the editing interface for one property of a JSON object.
 */
export const JsonInputElement = (props: JsonInputElementProperties): JSX.Element => {
    const identifier = crypto.randomUUID();

    /**
     * Handler for input change event. Updates a property on the edited object and triggers the update event.
     */
    const updateEditedObject = (value: any | undefined) => {
        props.editedObject[props.input.propertyName] = value;
        props.onUpdate();
    };

    /**
     * Returns an array of {@link MenuItem}s generated from the current input.
     */
    const getDropdownOptions = () => {
        const options = props.input.options?.split('|');
        return options?.map(o => {
            const optionSplit = o.split(';');

            return <MenuItem primaryLabel={optionSplit[1]} value={optionSplit[0]} />
        });
    };

    /**
     * Returns an array of {@link RadioButton}s generated from the current input.
     */
    const getRadioGroupOptions = () => {
        const options = props.input.options?.split('|');
        return options?.map(o => {
            const optionSplit = o.split(';');

            return <RadioButton disabled={props.disabled} value={optionSplit[0]}>{optionSplit[1]}</RadioButton>
        });
    };

    /**
     * Returns the checkbox elements for a multiple choice input.
     */
    const getMultipleChoiceElements = (): JSX.Element[] => {
        const currentValues: string[] = props.editedObject[props.input.propertyName]?.split('|').filter((v: string) => v !== '') ?? [];
        const options = props.input.options?.split('|');
        const checkboxes = options?.map(o => {
            const optionSplit = o.split(';');

            return <Checkbox
                label={optionSplit[1]}
                checked={currentValues.includes(optionSplit[0])}
                disabled={props.disabled}
                onChange={(_, checked) => {
                    const newValue = updateMultipleChoiceValue(currentValues, optionSplit[0], checked);
                    updateEditedObject(newValue);
                }} />
        });

        return checkboxes ?? [];
    };

    /**
     * Handler for multiple choice input checkbox. Adds or removes a value to the existing array of values and returns the
     * formatted string.
     */
    const updateMultipleChoiceValue = (values: string[], changedValue: string, insert: boolean) => {
        if (insert) {
            values.push(changedValue);
        }
        else {
            values = values.filter(v => v !== changedValue);
        }

        return values.join('|');
    };

    const propertyValue = props.editedObject[props.input.propertyName];
    switch (props.input.type) {
        case JsonInputType.MultipleChoice:
            return <div>
                <label style={{ color: 'rgb(82,82,82)' }}>{props.input.label}</label><br /><br />
                {getMultipleChoiceElements()}
            </div>
        case JsonInputType.RadioGroup:
            return <RadioGroup
                value={propertyValue}
                label={props.input.label}
                name={identifier + '-' + props.input.propertyName}
                disabled={props.disabled}
                onChange={(val) => updateEditedObject(val)}>
                {getRadioGroupOptions()}
            </RadioGroup>
        case JsonInputType.Checkbox:
            return <div><Checkbox
                label={props.input.label}
                checked={propertyValue}
                disabled={props.disabled}
                onChange={(_, checked) => updateEditedObject(checked)} /></div>
        case JsonInputType.Dropdown:
            return <Select
                value={propertyValue}
                label={props.input.label}
                clearable={true}
                clearButtonTooltip='Clear'
                disabled={props.disabled}
                onChange={(val) => updateEditedObject(val)}>
                {getDropdownOptions()}
            </Select>
        case JsonInputType.Number:
            return <Input
                type='number'
                label={props.input.label}
                value={propertyValue}
                disabled={props.disabled}
                onChange={(e) => updateEditedObject(parseInt(e.target.value))} />
        case JsonInputType.RichTextEditor:
            return <RichTextEditor
                label={props.input.label}
                value={propertyValue}
                disabled={props.disabled}
                customConfiguration={{
                    "imageDefaultWidth": 0,
                    "imageResize": true,
                    "imageUpload": false,
                    "imagePaste": false,
                    "imageDefaultMargin": null,
                    "imageMove": true,
                    "imageAddNewLine": false,
                    "toolbarButtons": [
                        "bold",
                        "italic",
                        "underline",
                        "paragraphFormat",
                        "formatOL",
                        "formatUL",
                        "outdent",
                        "indent",
                        "alignLeft",
                        "alignCenter",
                        "alignRight",
                        "html"
                    ],
                    "imageEditButtons": ["imageReplace", "imageAlt", "imageAlign", "imageDisplay", "imageSize", "imageRemove"],
                    
                } }
                onChange={(e) => updateEditedObject(e)} />
        case JsonInputType.TextArea:
            return <TextArea
                label={props.input.label}
                value={propertyValue}
                disabled={props.disabled}
                onChange={(e) => updateEditedObject(e.target.value)} />
        default:
        case JsonInputType.Text:
            return <Input
                type='text'
                label={props.input.label}
                value={propertyValue}
                disabled={props.disabled}
                onChange={(e) => updateEditedObject(e.target.value)} />
    }
}
