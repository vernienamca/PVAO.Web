using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net.Mail;
using System.Web.Mvc;
using PVAOWeb.Helpers;
using PVAOWeb.Models;
using static PVAOWeb.Helpers.LoginEnum;

namespace PVAOWeb.Controllers
{
    public class AccountController : BaseController
    {
        // GET: Account
        public ActionResult Login()
        {
            return View();
        }

        public ActionResult ForgotPassword()
        {
            return View();
        }

        public ActionResult ResetPassword()
        {
            return View();
        }

        [HttpPost]
        public ActionResult InjectUserSession(int authUserId)
        {
            Session["UserID"] = authUserId;

            return Json(new { status = Session["UserID"] != null ? (int)ResponseStatusEnum.Success : (int)ResponseStatusEnum.Failed }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult Authenticate(string username, string password)
        {
            try
            {
                using (PVAOEntities _dbContext = new PVAOEntities())
                {
                    int loginStatus = (int)LoginStatus.Failed;

                    ErrorCodes errorCode = ErrorCodes.EDS_ERR_INVALID_LOGIN_NG;

                    User userModel = new User();

                    var settings = _dbContext.Settings.FirstOrDefault(x => x.Id == 1);

                    var user = _dbContext.Users.Where(x => x.UserName.Equals(username)).FirstOrDefault();

                    if (user != null)
                    {
                        if (user.UserStatus != (int)UserStatus.Inactive)
                        {
                            if (user.UserStatus != (int)UserStatus.Locked)
                            {
                                if (DateTime.Today <= user.ExpirationDate)
                                {
                                    if (user.SignOnAttempts <= settings.MaxSignOnAttempts)
                                    {
                                        if (M3EncryptionKit.AESencryption.Encrypt(password) == user.Password)
                                        {
                                            userModel.Id = user.Id;

                                            Session["UserID"] = user.Id;

                                            loginStatus = (int)LoginStatus.Success;
                                        }
                                        else
                                        {
                                            var signOnAttempts = _dbContext.Users.Single(x => x.Id == user.Id);

                                            signOnAttempts.SignOnAttempts = signOnAttempts.SignOnAttempts + 1;
                                            _dbContext.SaveChanges();

                                            errorCode = ErrorCodes.EDS_ERR_INVALID_LOGIN_NG;
                                        }
                                    }
                                    else
                                    {
                                        var lockAccount = _dbContext.Users.Single(x => x.Id == user.Id);

                                        lockAccount.UserStatus = (int)UserStatus.Locked;
                                        _dbContext.SaveChanges();

                                        errorCode = ErrorCodes.EDS_ERR_MAXLOGIN_LIMIT_NG;
                                    }
                                }
                                else
                                    errorCode = ErrorCodes.EDS_ERR_ACCOUNT_EXPIRED_NG;
                            }
                            else
                                errorCode = ErrorCodes.EDS_ERR_LOCKED_OUT_NG;
                        }
                        else
                            errorCode = ErrorCodes.EDS_ACCOUNT_INACTIVE_NG;
                    }
                    else
                        errorCode = ErrorCodes.EDS_ERR_INVALID_LOGIN_NG;

                    if (loginStatus != (int)LoginStatus.Failed)
                        return Json(new { loginStatus = (int)LoginStatus.Success, id = userModel.Id }, JsonRequestBehavior.AllowGet);
                    else
                        return Json(new { loginStatus = (int)LoginStatus.Failed, errorCode }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(string.Format("Error occurred. Error details: {0}", ex.Message));
            }
        }

        //[AuthenticateUser]
        [HttpGet]
        public ActionResult GetCurrentUser()
        {
            using (PVAOEntities _dbContext = new PVAOEntities())
            {
                List<object> users = new List<object>();

                if (Session["UserID"] != null)
                {
                    int userId = (int)Session["UserID"];

                    _dbContext.Configuration.ProxyCreationEnabled = false;

                    var result = _dbContext.Users.Where(x => x.Id == userId).ToList();

                    foreach (var item in result)
                    {
                        string avatarPath = ConfigurationManager.AppSettings["AvatarPath"].ToString();

                        var data = new
                        {
                            id = item.Id,
                            lastName = item.LastName,
                            firstName = item.FirstName,
                            userName = item.UserName,
                            password = item.Password,
                            emailAddress = item.EmailAddress,
                            phoneNumber = item.PhoneNumber,
                            address = item.Address,
                            userStatus = item.UserStatus,
                            avatarUrl = string.Format(@"{0}{1}", avatarPath.Replace("~", string.Empty), item.AvatarUrl != null || item.AvatarUrl != string.Empty ? item.AvatarUrl : "no-image-available.jpg")
                        };

                        users.Add(data);
                    }
                }
                else
                    RedirectToAction("Login", "Account");

                return Json(users, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public ActionResult SendForgotPasswordLink(string emailAddress)
        {
            string message = "Your password reset request was successful. Please check your e-mail to get the reset password link.";
            bool success = true;

            try
            {
                using (PVAOEntities _dbContext = new PVAOEntities())
                {
                    _dbContext.Configuration.ProxyCreationEnabled = false;

                    var user = _dbContext.Users.FirstOrDefault(x => x.EmailAddress.Equals(emailAddress));

                    if (user != null)
                    {
                        var settings = _dbContext.Settings.FirstOrDefault(x => x.Id == 1);

                        user.PasswordToken = Guid.NewGuid().ToString();
                        _dbContext.SaveChanges();

                        string resetPasswordLink = string.Format("http://admin.zliahonarealty.com/Account/ResetPassword?token={0}", user.PasswordToken);

                        MailMessage mail = new MailMessage();
                        mail.From = new MailAddress(settings.FromEmail);
                        mail.To.Add(new MailAddress(user.EmailAddress));
                        mail.Subject = "Reset your password | PVAO";
                        mail.Body = "<font style=\"font-family:Arial, Helvetica, sans-serif;\">Hi  " + string.Format("{0} {1}", user.FirstName, user.LastName) + ",<br /><br />" +
                                "Tap the button below to reset your account password. If you didn't request a new password, you can safely delete this email.<br /><br />" +
                                "<a href=" + resetPasswordLink + " style=\"background-color: #3f51b5;border: none; color: white;width: 300px;padding: 15px 32px;text-align: center;text-decoration: none;" +
                                "display: inline-block;font-size: 15px;margin: 4px 2px;cursor: pointer;font-family: Helvetica, Arial, sans-serif;\">Reset Password</a><br><br>" +
                                "If that doesn't work, copy and paste the following link in your browser.<br />" +
                                resetPasswordLink + "<br /><br />" +
                                settings.FromName + "<br /><br/><br />" +
                                "<i>This is an automatically generated email, please do not reply.</font><br>";
                        mail.IsBodyHtml = true;

                        SmtpClient client = new SmtpClient();
                        client.Send(mail);
                    }
                    else
                    {
                        message = "We couldn't find your account based on the e-mail address you provided.";

                        success = false;
                    }
                }
            }
            catch (Exception ex)
            {
                success = false;

                return Json(string.Format("Error occurred. Error details: {0}", ex.Message));
            }

            return Json(new { status = success, message}, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult ValidateToken(string token)
        {
            bool success = true;

            using (PVAOEntities _dbContext = new PVAOEntities())
            {
                _dbContext.Configuration.ProxyCreationEnabled = false;

                var settings = _dbContext.Settings.Where(x => x.Id == 1).ToList();

                var user = _dbContext.Users.Where(x => x.PasswordToken.Equals(token)).ToList();

                if (user.Count() == 0)
                    success = false;

                return Json(new { status = success, userId = user.Count() > 0 ? user.FirstOrDefault().Id : 0, settings }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public ActionResult GetPasswordHistory(int userId, int enforcedHistory)
        {
            try
            {
                using (PVAOEntities _dbContext = new PVAOEntities())
                {
                    var passwordHistory = _dbContext.PasswordHistories.Where(x => x.UserID == userId).OrderByDescending(x => x.Id).Take(enforcedHistory);

                    List<object> history = new List<object>();

                    foreach (var item in passwordHistory)
                    {
                        var data = new
                        {
                            id = item.Id,
                            userId = item.UserID,
                            password = item.Password,
                            dateAdded = item.DateCreated
                        };

                        history.Add(data);
                    }

                    return Json(history, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        [HttpPost]
        public ActionResult ChangePassword(int userId, string newPassword)
        {
            try
            {
                using (PVAOEntities _dbContext = new PVAOEntities())
                {
                    _dbContext.Configuration.ProxyCreationEnabled = false;

                    var user = _dbContext.Users.FirstOrDefault(x => x.Id == userId);

                    if (user != null)
                    {
                        user.Password = M3EncryptionKit.AESencryption.Encrypt(newPassword);
                        user.PasswordToken = null;
                        _dbContext.SaveChanges();

                        PasswordHistory history = new PasswordHistory()
                        {
                            UserID = userId,
                            Password = newPassword,
                            DateCreated = DateTime.Now
                        };
                        _dbContext.PasswordHistories.Add(history);
                        _dbContext.SaveChanges();
                    }

                    return Json(new { status = (user != null) ? (int)ResponseStatusEnum.Success : (int)ResponseStatusEnum.Failed }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(string.Format("Error occurred. Error details: {0}", ex.Message));
            }
        }

        [HttpPost]
        public ActionResult Logout()
        {
            Session.Clear();
            Session.Abandon();
            Session.RemoveAll();

            return Json("Logout", JsonRequestBehavior.AllowGet);
        }
    }
}