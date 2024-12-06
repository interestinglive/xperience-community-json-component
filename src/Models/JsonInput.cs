using XperienceCommunity.JsonComponent.Enum;

namespace XperienceCommunity.JsonComponent.Models;

/// <summary>
/// Represents the configuration of a property and its editing control.
/// </summary>
/// <param name="propertyName">The name of the property being edited.</param>
public class JsonInput(string propertyName)
{
    /// <summary>
    /// The name of the property being edited.
    /// </summary>
    public string PropertyName { get; set; } = propertyName;


    /// <summary>
    /// The label displayed for the property during editing.
    /// </summary>
    public string? Label { get; set; }


    /// <summary>
    /// The input used for editing the property value.
    /// </summary>
    public JsonInputType Type { get; set; }


    /// <summary>
    /// A list of options used by inputs like <see cref="JsonInputType.Dropdown"/>. The format of the options are expected to be in the
    /// format "value;text|value;text."
    /// </summary>
    public string? Options { get; set; }
}
