using System.Web.Mvc;
using PVAOWeb.Helpers;

namespace PVAOWeb.Controllers
{
    public class DashboardController : BaseController
    {
        [AuthenticateUser]
        public ActionResult Index()
        {
            return View();
        }
    }
}