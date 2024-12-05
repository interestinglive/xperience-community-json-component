using System.Reflection;

using CMS.Helpers;

using Kentico.Xperience.Admin.Base.FormAnnotations;
using Kentico.Xperience.Admin.Base.Forms;

using XperienceCommunity.JsonComponent.Admin.FormComponents.JsonFormComponent;
using XperienceCommunity.JsonComponent.Attributes;
using XperienceCommunity.JsonComponent.Enum;
using XperienceCommunity.JsonComponent.Models;

[assembly: RegisterFormComponent(
    JsonFormComponent.IDENTIFIER,
    typeof(JsonFormComponent),
    "JSON array")]
namespace XperienceCommunity.JsonComponent.Admin.FormComponents.JsonFormComponent;

public class JsonFormComponentClientProperties : FormComponentClientProperties<string>
{
    public IEnumerable<JsonInput>? Inputs { get; set; }


    public string? ErrorMessage { get; set; }
}


public class JsonFormComponentProperties : FormComponentProperties
{
    [TextInputComponent(Label = "Model namespace")]
    public string? ModelNamespace { get; set; }
}


[ComponentAttribute(typeof(JsonFormComponentAttribute))]
public class JsonFormComponent : FormComponent<JsonFormComponentProperties, JsonFormComponentClientProperties, string>
{
    public const string IDENTIFIER = "XperienceCommunity.JsonFormComponent";


    public override string ClientComponentName => "@xperience-community/json-component/Json";


    protected override Task ConfigureClientProperties(JsonFormComponentClientProperties clientProperties)
    {
        if (!string.IsNullOrEmpty(Properties.ModelNamespace))
        {
            var modelType = GetType(Properties.ModelNamespace);
            if (modelType is null)
            {
                clientProperties.ErrorMessage = $"Could not find type '{Properties.ModelNamespace}'";
            }
            else
            {
                var inputs = GetInputs(modelType);
                if (inputs is null || !inputs.Any())
                {
                    clientProperties.ErrorMessage = "Referenced class contains no JSON properties";
                }

                string? validationErrorMessage = ValidateProperties(modelType, inputs!);
                if (validationErrorMessage is not null)
                {
                    clientProperties.ErrorMessage = validationErrorMessage;
                }

                clientProperties.Inputs = inputs;
            }
        }

        return base.ConfigureClientProperties(clientProperties);
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
