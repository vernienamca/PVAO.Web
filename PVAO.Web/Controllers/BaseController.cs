using System.Configuration;
using System.Web.Mvc;

namespace PVAOWeb.Controllers
{
    public class BaseController : Controller
    {
        protected readonly string WebApiBaseUrl;

        public BaseController()
        {
            WebApiBaseUrl = ConfigurationManager.AppSettings["webApiBaseUrl"];
        }
    }
}