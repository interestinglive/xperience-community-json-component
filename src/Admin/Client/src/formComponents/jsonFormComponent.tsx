import React from 'react';
import { FormComponentProps } from '@kentico/xperience-admin-base';
import {
    Button,
    ButtonColor,
    ButtonSize,
    Checkbox,
    FormItemWrapper,
    Headline,
    HeadlineSize,
    Input,
    MenuItem,
    RadioButton,
    RadioGroup,
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
    RadioGroup,
    MultipleChoice
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
    const updateJsonObject = (value: any | undefined, input: JsonInput, jsonObject: any) => {
        jsonObject[input.propertyName] = value;
        save();
    };

    /**
     * Handler for new JSON object button. Inserts empty JSON object into array and re-renders the field.
     */
    const insertObject = () => {
        const jsonObject: any = {};
        props.inputs?.forEach(i => {
            const defaultValue = getDefaultValue(i);
            jsonObject[i.propertyName] = defaultValue;
        });
        jsonObjects.push(jsonObject);
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
    };

    /**
     * Returns an array of {@link RadioButton}s generated from the provided inputs {@link JsonInput.options}.
     */
    const getRadioGroupOptions = (input: JsonInput) => {
        const options = input.options?.split('|');
        return options?.map(o => {
            const optionSplit = o.split(';');

            return <RadioButton disabled={props.disabled} value={optionSplit[0]}>{optionSplit[1]}</RadioButton>
        });
    };

    /**
     * Returns the default value of the provided {@link input}.
     */
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

    /**
     * Returns the checkbox elements for a multiple choice input.
     */
    const getMultipleChoiceElements = (input: JsonInput, jsonObject: any): JSX.Element[] => {
        const currentValues: string[] = jsonObject[input.propertyName]?.split('|').filter((v:string) => v !== '') ?? [];
        const options = input.options?.split('|');
        const checkboxes = options?.map(o => {
            const optionSplit = o.split(';');

            return <Checkbox
                label={optionSplit[1]}
                checked={currentValues.includes(optionSplit[0])}
                disabled={props.disabled}
                onChange={(_, checked) => {
                    const newValue = updateMultipleChoiceValue(currentValues, optionSplit[0], checked);
                    updateJsonObject(newValue, input, jsonObject);
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

    /**
     * Returns an input element for the specified {@link input} and {@link jsonObject}.
     */
    const getInput = (input: JsonInput, jsonObject: any, jsonObjectIndex: number): JSX.Element => {
        const propertyValue = jsonObject[input.propertyName];
        switch (input.type) {
            case JsonInputType.MultipleChoice:
                return <div>
                    <label style={{color:'rgb(82,82,82)'}}>{input.label}</label><br /><br />
                    {getMultipleChoiceElements(input, jsonObject)}
                </div>
            case JsonInputType.RadioGroup:
                return <RadioGroup
                    value={propertyValue}
                    label={input.label}
                    name={jsonObjectIndex + '-' + input.propertyName}
                    disabled={props.disabled}
                    onChange={(val) => updateJsonObject(val, input, jsonObject)}>
                    {getRadioGroupOptions(input)}
                </RadioGroup>
            case JsonInputType.Checkbox:
                return <div><Checkbox
                    label={input.label}
                    checked={propertyValue}
                    disabled={props.disabled}
                    onChange={(_, checked) => updateJsonObject(checked, input, jsonObject)} /></div>
            case JsonInputType.Dropdown:
                return <Select
                    value={propertyValue}
                    label={input.label}
                    clearable={true}
                    clearButtonTooltip='Clear'
                    disabled={props.disabled}
                    onChange={(val) => updateJsonObject(val, input, jsonObject)}>
                    {getDropdownOptions(input)}
                </Select>
            case JsonInputType.Number:
                return <Input
                    type='number'
                    label={input.label}
                    value={propertyValue}
                    disabled={props.disabled}
                    onChange={(e) => updateJsonObject(parseInt(e.target.value), input, jsonObject)} />
            default:
            case JsonInputType.Text:
                return <Input
                    type='text'
                    label={input.label}
                    value={propertyValue}
                    disabled={props.disabled}
                    onChange={(e) => updateJsonObject(e.target.value, input, jsonObject)} />
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

            const inputElements = props.inputs.map(i => getInput(i, o, index));
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
            disabled={props.disabled}
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

    const containers = getObjectContainers();
    return <FormItemWrapper
        label={props.label}
        explanationText={props.explanationText}
        invalid={props.invalid}
        validationMessage={props.validationMessage}
        markAsRequired={props.required}
        labelIcon={props.tooltip ? 'xp-i-circle' : undefined}
        labelIconTooltip={props.tooltip}>

        {containers}
        <br/>
        <Button
            label='New'
            icon='xp-plus'
            title='Add new item'
            disabled={props.disabled}
            onClick={insertObject} />
    </FormItemWrapper>
};
