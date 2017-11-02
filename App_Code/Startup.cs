using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(Angular.Startup))]
namespace Angular
{
    public partial class Startup {
        public void Configuration(IAppBuilder app) {
            ConfigureAuth(app);
        }
    }
}
