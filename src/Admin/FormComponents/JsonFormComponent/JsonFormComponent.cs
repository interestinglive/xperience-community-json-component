using System.Reflection;

using Kentico.Xperience.Admin.Base.FormAnnotations;
using Kentico.Xperience.Admin.Base.Forms;

using Microsoft.AspNetCore.Mvc.ViewFeatures;

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
            var modelType = GetType(Properties.ModelNamespace) ??
                throw new InvalidOperationException($"Could not find type '{Properties.ModelNamespace}'");
            clientProperties.Inputs = GetInputs(modelType);
        }

        return base.ConfigureClientProperties(clientProperties);
    }


    private static IEnumerable<JsonInput> GetInputs(Type modelType) =>
        modelType.GetProperties().Select(prop =>
        {
            var jsonInputAttribute = prop.GetCustomAttribute<JsonInputAttribute>() ??
                new JsonInputAttribute(JsonInputType.Text);

            return new JsonInput()
            {
                InputType = jsonInputAttribute.Type,
                PropertyName = prop.Name,
                Label = jsonInputAttribute.Label ?? prop.Name
            };
        });


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
