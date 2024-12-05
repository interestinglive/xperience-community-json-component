using XperienceCommunity.JsonComponent.Enum;

namespace XperienceCommunity.JsonComponent.Models;
public class JsonInput
{
    public string? PropertyName { get; set; }


    public string? Label { get; set; }


    public JsonInputType Type { get; set; }


    public string? Options { get; set; }
}
