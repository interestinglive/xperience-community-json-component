using XperienceCommunity.JsonComponent;

using Kentico.Xperience.Admin.Base;

[assembly: CMS.RegisterModule(typeof(JsonComponentModule))]
namespace XperienceCommunity.JsonComponent;

internal class JsonComponentModule : AdminModule
{
    public JsonComponentModule() : base(nameof(JsonComponentModule))
    {
    }


    protected override void OnInit()
    {
        base.OnInit();

        RegisterClientModule("xperience-community", "json-component");
    }
}
