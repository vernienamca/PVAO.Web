using System.Web;
using System.Web.Optimization;

namespace PVAOWeb
{
    public class BundleConfig
    {
        // For more information on bundling, visit https://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            // Use the development version of Modernizr to develop with and learn from. Then, when you're
            // ready for production, use the build tool at https://modernizr.com to pick only the tests you need.
            bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
                    "~/Scripts/modernizr-*"));

            bundles.Add(new ScriptBundle("~/Scripts/jquery").Include(
                    "~/Scripts/plugin.js",
                    "~/Scripts/perfect-scrollbar.min.js",
                    "~/Scripts/chart.js",
                    "~/Scripts/main.js",
                    "~/Scripts/dashboard.js"));

            bundles.Add(new StyleBundle("~/Content/login").Include(
                    "~/Content/css/login.css"));

            bundles.Add(new StyleBundle("~/Content/css").Include(
                    "~/Content/css/perfect-scrollbar.css",
                    "~/Content/css/plugin.css",
                    "~/Content/css/style.css",
                    "~/Content/css/dashboard.css",
                    "~/Content/css/pagination.css"));

            bundles.Add(new ScriptBundle("~/Scripts/api").Include(
                    "~/Scripts/api.js"));

            bundles.Add(new ScriptBundle("~/Scripts/authenticate").Include(
                    "~/Scripts/authenticate.js"));

            bundles.Add(new ScriptBundle("~/Scripts/layout").Include(
                    "~/Scripts/layout.js"));

            bundles.Add(new ScriptBundle("~/Scripts/dashboard").Include(
                    "~/Scripts/dashboard-page.js"));

            bundles.Add(new ScriptBundle("~/Scripts/excelhelper").Include(
                    "~/Scripts/excelhelper.js"));

            bundles.Add(new ScriptBundle("~/Scripts/pdfhelper").Include(
                    "~/Scripts/pdfhelper.js"));

            bundles.Add(new ScriptBundle("~/Scripts/accrued").Include(
                 "~/Scripts/accrued.js"));

            bundles.Add(new ScriptBundle("~/Scripts/overremittance").Include(
                   "~/Scripts/overremittance.js"));

            bundles.Add(new ScriptBundle("~/Scripts/overremittance/forapproval").Include(
                 "~/Scripts/overremittance-for-approval.js"));

            bundles.Add(new ScriptBundle("~/Scripts/administration/user").Include(
                    "~/Scripts/user.js"));

            bundles.Add(new ScriptBundle("~/Scripts/administration/role").Include(
                    "~/Scripts/role.js"));

            bundles.Add(new ScriptBundle("~/Scripts/administration/page").Include(
                    "~/Scripts/page.js"));

            bundles.Add(new ScriptBundle("~/Scripts/administration/user").Include(
                    "~/Scripts/user.js"));

            bundles.Add(new ScriptBundle("~/Scripts/settings").Include(
                    "~/Scripts/settings.js"));

            bundles.Add(new ScriptBundle("~/Scripts/administration/page").Include(
                    "~/Scripts/page.js"));

            bundles.Add(new ScriptBundle("~/Scripts/administration/myprofile").Include(
                    "~/Scripts/myprofile.js"));
        }
    }
}
