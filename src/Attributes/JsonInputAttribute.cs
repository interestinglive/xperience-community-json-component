using XperienceCommunity.JsonComponent.Enum;

namespace XperienceCommunity.JsonComponent.Attributes;

[AttributeUsage(AttributeTargets.Property)]
public class JsonInputAttribute : Attribute
{
    public JsonInputType Type { get; set; } = JsonInputType.Text;


    public string? Label { get; set; }


    public string? Options { get; set; }
}
