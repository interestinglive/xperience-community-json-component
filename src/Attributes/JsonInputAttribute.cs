using XperienceCommunity.JsonComponent.Enum;

namespace XperienceCommunity.JsonComponent.Attributes;

[AttributeUsage(AttributeTargets.Property)]
public class JsonInputAttribute(JsonInputType type) : Attribute
{
    public JsonInputType Type { get; set; } = type;


    public string? Label { get; set; }


    public string? Options { get; set; }
}
