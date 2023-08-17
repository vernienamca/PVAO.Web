using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using PVAOWeb.Helpers;
using PVAOWeb.Models;

namespace PVAOWeb.Controllers
{
    public class UserController : BaseController
    {
        [HttpPost]
        public ActionResult GetUsers(int currentPage, string searchText)
        {
            var pageSize = int.Parse(ConfigurationManager.AppSettings["PageSize"].ToString());

            using (PVAOEntities _dbContext = new PVAOEntities())
            {
                var result = _dbContext.Users.OrderByDescending(x => x.Id).Skip((currentPage - 1) * pageSize).Take(pageSize).ToList();

                if (!string.IsNullOrEmpty(searchText))
                    result = result.Where(x => x.LastName.ToLower().Contains(searchText) || x.FirstName.ToLower().Contains(searchText) || x.EmailAddress.ToLower().Contains(searchText)).ToList();

                var pager = new Pager(_dbContext.Users.Count(), currentPage, pageSize, 6);

                List<object> users = new List<object>();

                foreach (var item in result)
                {
                    var user = _dbContext.Users.FirstOrDefault(x => x.Id == item.CreatedBy);

                    var data = new
                    {
                        id = item.Id,
                        name = string.Format("{0} {1}", item.FirstName, item.LastName),
                        emailAddress = item.EmailAddress,
                        userStatus = Enum.GetName(typeof(LoginEnum.UserStatus), item.UserStatus),
                        expirationDate = item.ExpirationDate.ToString(),
                        createdBy = string.Format("{0} {1}", user.FirstName, user.LastName),
                        dateCreated = item.DateCreated.ToString()
                    };

                    users.Add(data);
                }

                return Json(new { users, pager }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public ActionResult GetUser(int id)
        {
            using (PVAOEntities _dbContext = new PVAOEntities())
            {
                _dbContext.Configuration.ProxyCreationEnabled = false;

                var result = _dbContext.Users.Where(x => x.Id == id).ToList();

                var settings = _dbContext.Settings.FirstOrDefault(x => x.Id == 1);

                List<object> users = new List<object>();

                foreach (var item in result)
                {
                    string avatarPath = ConfigurationManager.AppSettings["AvatarPath"].ToString();

                    var createdBy = _dbContext.Users.FirstOrDefault(x => x.Id == item.CreatedBy);
                    string updatedBy = "n/a";
                    string dateUpdated = "n/a";

                    if (item.UpdatedBy != null)
                    {
                        var user = _dbContext.Users.FirstOrDefault(x => x.Id == item.UpdatedBy);

                        updatedBy = string.Format("{0} {1}", user.FirstName, user.LastName);
                        dateUpdated = item.DateUpdated.ToString();
                    }

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
                        fileName = item.AvatarUrl,
                        avatarUrl = string.Format(@"{0}{1}", avatarPath.Replace("~", string.Empty), item.AvatarUrl != null || item.AvatarUrl != string.Empty ? item.AvatarUrl : "no-image-available.jpg"),
                        expirationDate = item.ExpirationDate.ToString(),
                        createdBy = string.Format("{0} {1}", createdBy.FirstName, createdBy.LastName),
                        dateCreated = item.DateCreated.ToString(),
                        maxSignOnAttempts = settings.MaxSignOnAttempts,
                        updatedBy = updatedBy,
                        dateUpdated = dateUpdated
                    };

                    users.Add(data);
                }

                return Json(users, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public ActionResult SaveChanges()
        {
            bool success = false;

            try
            {
                using (PVAOEntities _dbContext = new PVAOEntities())
                {
                    string avatarPath = ConfigurationManager.AppSettings["AvatarPath"].ToString();

                    string fileName = "no-image-available.jpg";

                    if (Request.Files.Count > 0)
                    {
                        //  Get all files from Request object  
                        HttpFileCollectionBase files = Request.Files;

                        for (int i = 0; i < files.Count; i++)
                        {
                            HttpPostedFileBase file = files[i];

                            fileName = Request.Form["fileName"];

                            file.SaveAs(Path.Combine(Server.MapPath(avatarPath), Request.Form["fileName"]));
                        }
                    }

                    string lastName = Request.Form["lastName"];
                    string firstName = Request.Form["firstName"];
                    string emailAddress = Request.Form["emailAddress"];
                    string phone = Request.Form["phone"];
                    string username = Request.Form["username"];
                    string password = Request.Form["password"];
                    int userStatus = int.Parse(Request.Form["userStatus"]);
                    string[] splittedDate = Request.Form["expirationDate"].Split('-');
                    DateTime expirationDate = DateTime.Parse(string.Format("{0}/{1}/{2}", splittedDate[1], splittedDate[0], splittedDate[2]));
                    string address = Request.Form["address"];

                    if (Request.Form["id"] != "AddUser")
                    {
                        int id = int.Parse(Request.Form["id"]);

                        var user = _dbContext.Users.SingleOrDefault(x => x.Id == id);

                        if (user != null)
                        {
                            if (user.AvatarUrl != Request.Form["fileName"])
                            {
                                string filePath = Path.Combine(Server.MapPath(avatarPath), user.AvatarUrl);

                                if (System.IO.File.Exists(filePath))
                                {
                                    System.IO.File.Delete(filePath);
                                }
                            } 

                            user.LastName = lastName;
                            user.FirstName = firstName;
                            user.UserName = username;

                            if (user.Password != password)
                                user.Password = M3EncryptionKit.AESencryption.Encrypt(password);

                            user.EmailAddress = emailAddress;
                            user.PhoneNumber = phone;
                            user.Address = address;
                            user.AvatarUrl = Request.Form["fileName"];
                            user.UserStatus = userStatus;
                            user.ExpirationDate = expirationDate;
                            user.UpdatedBy = (int)Session["UserID"];
                            user.DateUpdated = DateTime.Now;
                            _dbContext.SaveChanges();
                        }
                    } 
                    else
                    {
                        var settings = _dbContext.Settings.FirstOrDefault(x => x.Id == 1);

                        User user = new User()
                        {
                            LastName = lastName,
                            FirstName = firstName,
                            UserName = username,
                            Password = M3EncryptionKit.AESencryption.Encrypt(password),
                            EmailAddress = emailAddress,
                            PhoneNumber = phone,
                            Address = address,
                            AvatarUrl = fileName,
                            UserStatus = userStatus,
                            ExpirationDate = expirationDate.AddDays(settings.ExpiresIn),
                            CreatedBy = (int)Session["UserID"],
                            DateCreated = DateTime.Now
                        };
                        _dbContext.Users.Add(user);
                        _dbContext.SaveChanges();
                    }

                    success = true;
                }
            }
            catch (Exception ex)
            {
                return Json(string.Format("Error occurred. Error details: {0}", ex.Message));
            }
  
            return Json(new { status = success ? (int)ResponseStatusEnum.Success : (int)ResponseStatusEnum.Failed }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult GetUserRoles(int userId, string searchText)
        {
            using (PVAOEntities _dbContext = new PVAOEntities())
            {
                var actualResult = (from usr in _dbContext.UserRoles
                                    where usr.UserId == userId
                                    join rol in _dbContext.Roles on usr.RoleId equals rol.Id
                                    select new
                                    {
                                        usr.Id,
                                        usr.RoleId,
                                        rol.RoleName
                                    }).ToList();

                if (!string.IsNullOrEmpty(searchText))
                    actualResult = actualResult.Where(x => x.RoleName.ToLower().Contains(searchText.ToLower())).ToList();

                List<object> userRoles = new List<object>();

                foreach (var item in actualResult)
                {
                    var data = new
                    {
                        id = item.Id,
                        roleId = item.RoleId,
                        roleName = item.RoleName
                    };

                    userRoles.Add(data);
                }

                return Json(new { userRoles }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public ActionResult RemoveUserRoles(int userId, int[] ids)
        {
            try
            {
                using (PVAOEntities _dbContext = new PVAOEntities())
                {
                    var userRoles = _dbContext.UserRoles.Where(x => x.UserId == userId && !ids.Contains(x.RoleId)).ToList();

                    if (userRoles != null)
                    {
                        _dbContext.UserRoles.RemoveRange(userRoles);
                        _dbContext.SaveChanges();
                    }

                    return Json(userRoles, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(string.Format("Error occurred. Error details: {0}", ex.Message));
            }
        }

        [HttpPost]
        public ActionResult SaveUserRoles(int userRoleId, int roleId, int userId)
        {
            try
            {
                using (PVAOEntities _dbContext = new PVAOEntities())
                {
                    _dbContext.Configuration.ProxyCreationEnabled = false;

                    if (userRoleId != 0)
                    {
                        var userRole = _dbContext.UserRoles.Single(x => x.Id == userRoleId);

                        if (userRole != null)
                        {
                            userRole.UpdatedBy = (int)Session["UserID"];
                            userRole.DateUpdated = DateTime.Now;
                            _dbContext.SaveChanges();
                        }

                        return Json(userRole, JsonRequestBehavior.AllowGet);
                    }
                    else
                    {
                        UserRole userRole = new UserRole()
                        {
                            RoleId = roleId,
                            UserId = userId,
                            CreatedBy = (int)Session["UserID"],
                            DateCreated = DateTime.Now
                        };
                        _dbContext.UserRoles.Add(userRole);
                        _dbContext.SaveChanges();

                        return Json(userRole, JsonRequestBehavior.AllowGet);
                    }
                }
            }
            catch (Exception ex)
            {
                return Json(string.Format("Error occurred. Error details: {0}", ex.Message));
            }
        }

        [HttpGet]
        public ActionResult GetMyProfile()
        {
            int userId = (int)Session["UserID"];

            using (PVAOEntities _dbContext = new PVAOEntities())
            {
                _dbContext.Configuration.ProxyCreationEnabled = false;

                var result = _dbContext.Users.Where(x => x.Id == userId).ToList();

                var settings = _dbContext.Settings.FirstOrDefault(x => x.Id == 1);

                List<object> users = new List<object>();

                foreach (var item in result)
                {
                    string avatarPath = ConfigurationManager.AppSettings["AvatarPath"].ToString();

                    var createdBy = _dbContext.Users.FirstOrDefault(x => x.Id == item.CreatedBy);
                    string updatedBy = "n/a";
                    string dateUpdated = "n/a";

                    if (item.UpdatedBy != null)
                    {
                        var user = _dbContext.Users.FirstOrDefault(x => x.Id == item.UpdatedBy);

                        updatedBy = string.Format("{0} {1}", user.FirstName, user.LastName);
                        dateUpdated = item.DateUpdated.ToString();
                    }

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
                        fileName = item.AvatarUrl,
                        avatarUrl = string.Format(@"{0}{1}", avatarPath.Replace("~", string.Empty), item.AvatarUrl != null || item.AvatarUrl != string.Empty ? item.AvatarUrl : "no-image-available.jpg"),
                        expirationDate = item.ExpirationDate.ToString(),
                        createdBy = string.Format("{0} {1}", createdBy.FirstName, createdBy.LastName),
                        dateCreated = item.DateCreated.ToString(),
                        maxSignOnAttempts = settings.MaxSignOnAttempts,
                        updatedBy = updatedBy,
                        dateUpdated = dateUpdated
                    };

                    users.Add(data);
                }

                return Json(users, JsonRequestBehavior.AllowGet);
            }
        }
    }
}