# Usage guide

## How it works

This form component stores serialized JSON in the database, as an array of objects defined by your code. Editors can add as many objects to this array as needed by clicking the __New__ button at the bottom of the list:

![New button](/images/newbutton.png)

Each object can be deleted by clicking the __Delete__ button next to the items heading:

![Delete button](/images/deletebutton.png)

The data saved to field contains the property names and values, e.g.

```json
[{"MyStringProperty":"A","MyIntProperty":1},{"MyStringProperty":"B","MyIntProperty":2}]
```

Because there is a model backing this data structure, you can retrieve the object listing as a strongly-typed enumerable for easy display on the live site:

```cs
var users = JsonConvert.DeserializeObject<IEnumerable<UserModel>>(page.UserListing);
```

## Creating a model

The JSON form component can be used with any arbitrary C# class containing public properties. Only properties decorated with the `[JsonInput]` attribute will be displayed in the Xperience by Kentico administration and stored in the database. The default input for editing properties in the UI is a text box, but you can specify the input type and other properties in the attribute constructor:

- __Type__: The type of input to display when editing the property value. Values can be found in [`JsonInputType`](/src/Enum/JsonInputType.cs)
- __Label__: The label to display in the editing form. If not provided, the property name is displayed
- __Options__: Used with inputs that display a selection, such as `JsonInputType.Dropdown`. The format for the options is "value;text|value;text," e.g. "A;User A|B; User B"

```cs
//JsonInput examples

[JsonInput]
public string Name { get; set; }

[JsonInput(Type = JsonInputType.Checkbox, Label = "Show on live site?")]
public bool ShowOnLiveSite { get; set; }

[JsonInput(Type = JsonInputType.Dropdown, Options = "1;Dave|2;Petr")]
public string User { get; set; }
```

## Example

Your manager decides that the articles on your site should list when and why the article has been edited for transparency. Adding a new field on the Article content type allows editors to add these notes directly from the __Content__ tab.

1. Create a new model that contains properties related to the article history:

```cs
namespace DancingGoat;
public class ArticleEdit
{
    [JsonInput(Label = "Edit date (mm/dd/yyyy)")]
    public string EditDate { get; set; }

    [JsonInput(
        Type = JsonInputType.Dropdown,
        Label = "Edited by",
        Options = "jason@site.com;Jason|amanda@site.com;Amanda")]
    public string EditedBy { get; set; }

    [JsonInput(
        Type = JsonInputType.Dropdown,
        Label = "Edit reason",
        Options = "pricechange;Price change|newcontent;New content|review;Quality review")]
    public string EditReason { get; set; }

    [JsonInput(Type = JsonInputType.Checkbox, Label = "Show on live site?")]
    public bool ShowOnLiveSite { get; set; }
}
```

2. Edit the Article content type and add a new "ArticleEdits" field with the data type "Long text"
3. Select the "JSON array" form component and in the "Model class" property, add the namespace and class of your model:

![Component properties](/images/componentproperties.png)

4. When editors publish a new version of the article, they click the "New" button in the ArticleEdits field and supply the proper data:

![Administration example](/images/editingsample.png)

5. When developers prepare a view model for an article, retrieve the value of this field, deserialize it, and pass it to the view:

```cs
var edits = JsonConvert.DeserializeObject<IEnumerable<ArticleEdit>>(articlePage.ArticleEdits);
```

6. In the Article view, list the recent edits at the bottom of the page:

```html
@if (Model.Edits is not null && Model.Edits.Any())
{
    <div class="row">
        @foreach (var edit in viewModel.edits)
        {
            if (!edit.ShowOnLiveSite) continue;

            <div>Edited on @edit.EditDate by <a href="@Url.ActionLink("List", "Editors")">@@@edit.EditedBy</a> (@edit.EditReason)</div>
        }
    </div>
}
```

![Live site example](/images/livesitesample.png)
