using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using PVAOWeb.Helpers;
using PVAOWeb.Models;

namespace ZLiahona.Controllers
{
    public class SettingsController : Controller
    {
        [AuthenticateUser]
        public ActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public ActionResult GetSettings()
        {
            using (PVAOEntities _dbContext = new PVAOEntities())
            {
                _dbContext.Configuration.ProxyCreationEnabled = false;

                var result = _dbContext.Settings.Where(x => x.Id == 1).ToList();

                List<object> settings = new List<object>();

                foreach (var item in result)
                {
                    var createdBy = _dbContext.Users.FirstOrDefault(x => x.Id == item.CreatedBy);
                    string updatedBy = "n/a";
                    string dateUpdated = "n/a";

                    if (item.UpdatedBy != null)
                    {
                        var user = _dbContext.Users.FirstOrDefault(x => x.Id == item.UpdatedBy);

                        updatedBy = string.Format("{0} {1}", user.FirstName, user.LastName);
                        dateUpdated = item.DateUpdated.ToString();
                    }

                    var company = _dbContext.Companies.FirstOrDefault(x => x.Id == item.Id);

                    var data = new
                    {
                        id = item.Id,
                        companyName = company.CompanyName,
                        address = company.Address,
                        emailAddress = company.EmailAddress,
                        phoneNumber = company.PhoneNumber,
                        mobileNumber = company.MobileNumber,
                        aboutUs = company.AboutUs,
                        facebook = company.Facebook,
                        fromEmail = item.FromEmail,
                        fromName = item.FromName,
                        serverName = item.ServerName,
                        smtpPort = item.SMTPPort,
                        username = item.Username,
                        password = item.Password,
                        enableSSL = item.EnableSSL,
                        maxSignOnAttempts = item.MaxSignOnAttempts,
                        expiresIn = item.ExpiresIn,
                        minPasswordLength = item.MinPasswordLength,
                        minSpecialCharacters = item.MinSpecialCharacters,
                        enforcePasswordHistory = item.EnforcePasswordHistory,
                        createdBy = string.Format("{0} {1}", createdBy.FirstName, createdBy.LastName),
                        dateCreated = item.DateCreated.ToString(),
                        updatedBy = updatedBy,
                        dateUpdated = dateUpdated
                    };

                    settings.Add(data);
                }

                return Json(settings, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public ActionResult SaveChanges(int id, string companyName, string address, string emailAddress, string phoneNumber, string mobileNumber, string aboutUs, string facebook, string fromEmail, string fromName, string serverName, int smtpPort, string username, string password, 
            bool enableSSL, int maxSignOnAttempts = 0, int expiresIn = 0, int minPasswordLength = 0, int minSpecialCharacters = 0, int enforcePasswordHistory = 5)
        {
            try
            {
                using (PVAOEntities _dbContext = new PVAOEntities())
                {
                    _dbContext.Configuration.ProxyCreationEnabled = false;

                    var company = _dbContext.Companies.Single(x => x.Id == id);

                    if (company != null)
                    {
                        company.CompanyName = companyName;
                        company.Address = address;
                        company.EmailAddress = emailAddress;
                        company.PhoneNumber = phoneNumber;
                        company.MobileNumber = mobileNumber;
                        company.AboutUs = aboutUs;
                        company.Facebook = facebook;
                        _dbContext.SaveChanges();
                    }


                    var settings = _dbContext.Settings.Single(x => x.Id == id);

                    if (settings != null)
                    {
                        settings.FromEmail = fromEmail;
                        settings.FromName = fromName;
                        settings.ServerName = serverName;
                        settings.SMTPPort = smtpPort;
                        settings.Username = username;
                        settings.Password = password;
                        settings.EnableSSL = enableSSL;
                        settings.MaxSignOnAttempts = maxSignOnAttempts;
                        settings.ExpiresIn = expiresIn;
                        settings.MinPasswordLength = minPasswordLength;
                        settings.MinSpecialCharacters = minSpecialCharacters;
                        settings.EnforcePasswordHistory = enforcePasswordHistory;
                        settings.UpdatedBy = (int)Session["UserID"];
                        settings.DateUpdated = DateTime.Now;
                        _dbContext.SaveChanges();
                    }

                    return Json(settings, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(string.Format("Error occurred. Error details: {0}", ex.Message));
            }
        }
    }
}