using System.Reflection;

using Kentico.Xperience.Admin.Base.FormAnnotations;
using Kentico.Xperience.Admin.Base.Forms;

using XperienceCommunity.JsonComponent.Admin.FormComponents.JsonFormComponent;
using XperienceCommunity.JsonComponent.Attributes;
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
                if (!inputs.Any())
                {
                    clientProperties.ErrorMessage = "Referenced class contains no JSON properties";
                }

                clientProperties.Inputs = inputs;
            }
        }

        return base.ConfigureClientProperties(clientProperties);
    }


    private static IEnumerable<JsonInput> GetInputs(Type modelType)
    {
        var properties = modelType.GetProperties().Where(p => Attribute.IsDefined(p, typeof(JsonInputAttribute)));
        return properties.Select(prop =>
        {
            var jsonInputAttribute = prop.GetCustomAttribute<JsonInputAttribute>()!;

            // TODO: Validate input type and prop value type

            return new JsonInput()
            {
                PropertyName = prop.Name,
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
