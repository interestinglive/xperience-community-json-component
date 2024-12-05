using XperienceCommunity.JsonComponent.Enum;

namespace XperienceCommunity.JsonComponent.Models;
public class JsonInput(string propertyName)
{
    public string PropertyName { get; set; } = propertyName;


    public string? Label { get; set; }


    public JsonInputType Type { get; set; }


    public string? Options { get; set; }
}
