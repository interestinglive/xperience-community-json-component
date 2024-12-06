using XperienceCommunity.JsonComponent.Enum;

namespace XperienceCommunity.JsonComponent.Attributes;

/// <summary>
/// An attribute that defines a property as editable in the administration UI.
/// </summary>
[AttributeUsage(AttributeTargets.Property)]
public class JsonInputAttribute : Attribute
{
    /// <summary>
    /// The input used for editing the property value.
    /// </summary>
    public JsonInputType Type { get; set; } = JsonInputType.Text;


    /// <summary>
    /// An optional label for the property during editing. If not provided, the property name is displayed.
    /// </summary>
    public string? Label { get; set; }


    /// <summary>
    /// A list of options used by inputs like <see cref="JsonInputType.Dropdown"/>. The format of the options are expected to be in the
    /// format "value;text|value;text."
    /// </summary>
    public string? Options { get; set; }
}
