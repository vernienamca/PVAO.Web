using System.Web.Mvc;
using PVAOWeb.Helpers;

namespace PVAOWeb.Controllers
{
    public class AdministrationController : BaseController
    {
        [AuthenticateUser]
        public ActionResult Roles()
        {
            return View();
        }

        [AuthenticateUser]
        public ActionResult Pages()
        {
            return View();
        }

        [AuthenticateUser]
        public ActionResult Users()
        {
            return View();
        }

        [AuthenticateUser]
        public ActionResult AddRole()
        {
            return View();
        }

        [AuthenticateUser]
        public ActionResult AddPage()
        {
            return View();
        }

        [AuthenticateUser]
        public ActionResult AddUser()
        {
            return View();
        }

        [AuthenticateUser]
        public ActionResult MyProfile()
        {
            return View();
        }
    }
}