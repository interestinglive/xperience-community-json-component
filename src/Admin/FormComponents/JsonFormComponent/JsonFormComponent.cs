using System.Reflection;

using CMS.Helpers;

using Kentico.Xperience.Admin.Base.FormAnnotations;
using Kentico.Xperience.Admin.Base.Forms;

using Microsoft.AspNetCore.Mvc;

using XperienceCommunity.JsonComponent.Admin.FormComponents.JsonFormComponent;
using XperienceCommunity.JsonComponent.Attributes;
using XperienceCommunity.JsonComponent.Enum;
using XperienceCommunity.JsonComponent.Models;

[assembly: RegisterFormComponent(
    JsonFormComponent.IDENTIFIER,
    typeof(JsonFormComponent),
    "JSON array")]
namespace XperienceCommunity.JsonComponent.Admin.FormComponents.JsonFormComponent;

/// <summary>
/// A UI form component which stores an array of objects as serialized JSON.
/// </summary>
[ComponentAttribute(typeof(JsonFormComponentAttribute))]
public class JsonFormComponent : FormComponent<JsonFormComponentProperties, JsonFormComponentClientProperties, string>
{
    public const string IDENTIFIER = "XperienceCommunity.JsonFormComponent";


    public override string ClientComponentName => "@xperience-community/json-component/Json";


    protected override async Task ConfigureClientProperties(JsonFormComponentClientProperties clientProperties)
    {
        await base.ConfigureClientProperties(clientProperties);
        if (string.IsNullOrEmpty(Properties.ModelClass))
        {
            clientProperties.ErrorMessage = "Model class not set";

            return;
        }

        var modelType = GetType(Properties.ModelClass);
        if (modelType is null)
        {
            clientProperties.ErrorMessage = $"Could not find type '{Properties.ModelClass}'";

            return;
        }

        clientProperties.Inputs = GetInputs(modelType);
        if (!clientProperties.Inputs.Any())
        {
            clientProperties.ErrorMessage = "Referenced class contains no JSON properties";

            return;
        }

        clientProperties.ErrorMessage = ValidateProperties(modelType, clientProperties.Inputs);
    }


    [FormComponentCommand(CommandName = "GetListingConfiguration")]
    public async Task<IActionResult> GetListingConfiguration(/* parameters as needed */)
    {
        var config = new
        {
            // configuration properties
        };

        // If your logic is synchronous, wrap it:
        return await Task.FromResult(new JsonResult(config));
    }
    [FormComponentCommand(CommandName = "GetMultiSourceAssetPanelProperties")]
    public async Task<IActionResult> GetMultiSourceAssetPanelProperties(/* parameters as needed */)
    {
        var response =
            new
            {
                assetPanelEnabled = false,
                imageExtensions = "bmp;gif;ico;png;wmf;jpg;jpeg;tiff;tif;webp;svg;avif;jfif;jfi;jif;jpe;dib"
            };

        return await Task.FromResult(new JsonResult(response));
    }

    private static string? ValidateProperties(Type modelType, IEnumerable<JsonInput> inputs)
    {
        foreach (var input in inputs)
        {
            var relatedProperty = modelType.GetProperty(input.PropertyName);
            if (relatedProperty is null)
            {
                continue;
            }

            var propType = relatedProperty.PropertyType;
            bool hasError = ((input.Type == JsonInputType.Text
                    || input.Type == JsonInputType.Dropdown
                    || input.Type == JsonInputType.RadioGroup) && propType != typeof(string))
                || ((input.Type == JsonInputType.Number) && propType != typeof(int))
                || ((input.Type == JsonInputType.Checkbox) && propType != typeof(bool));
            if (hasError)
            {
                return $"Input type '{input.Type.ToStringRepresentation()}' not compatible with property '{input.PropertyName}'";
            }
        }

        return null;
    }


    private static IEnumerable<JsonInput> GetInputs(Type modelType)
    {
        var properties = modelType.GetProperties().Where(p => Attribute.IsDefined(p, typeof(JsonInputAttribute)));
        return properties.Select(prop =>
        {
            var jsonInputAttribute = prop.GetCustomAttribute<JsonInputAttribute>()!;

            return new JsonInput(prop.Name)
            {
                Type = jsonInputAttribute.Type,
                Label = jsonInputAttribute.Label ?? prop.Name,
                Options = jsonInputAttribute.Options
            };
        });
    }


    private static Type? GetType(string typeName)
    {
        var type = Type.GetType(typeName);
        if (type != null)
        {
            return type;
        }

        foreach (var a in AppDomain.CurrentDomain.GetAssemblies())
        {
            type = a.GetType(typeName);
            if (type != null)
            {
                return type;
            }
        }

        return null;
    }
}


/// <summary>
/// Properties for the JSON React component.
/// </summary>
public class JsonFormComponentClientProperties : FormComponentClientProperties<string>
{
    /// <summary>
    /// The configuration for a JSON property and its input control.
    /// </summary>
    public IEnumerable<JsonInput>? Inputs { get; set; }


    /// <summary>
    /// The error encountered while processing the component properties, if any.
    /// </summary>
    public string? ErrorMessage { get; set; }
}


/// <summary>
/// Properties for <see cref="JsonFormComponent"/>.
/// </summary>
public class JsonFormComponentProperties : FormComponentProperties
{
    /// <summary>
    /// The fully-qualified name of the type to edit in the administration.
    /// </summary>
    [TextInputComponent(Label = "Model class")]
    public string? ModelClass { get; set; }
}
