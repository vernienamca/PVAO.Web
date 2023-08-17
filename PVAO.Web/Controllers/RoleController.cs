using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web.Mvc;
using PVAOWeb.Helpers;
using PVAOWeb.Models;

namespace PVAOWeb.Controllers
{
    public class RoleController : BaseController
    {
        [HttpPost]
        public ActionResult GetRoles(int currentPage, string searchText)
        {
            var pageSize = int.Parse(ConfigurationManager.AppSettings["PageSize"]);

            using (PVAOEntities _dbContext = new PVAOEntities())
            {
                var actualResult = _dbContext.Roles.OrderByDescending(x => x.Id).ToList();

                if (!string.IsNullOrEmpty(searchText))
                    actualResult = actualResult.Where(x => x.RoleName.ToLower().Contains(searchText.ToLower())).ToList();

                var result = actualResult.OrderByDescending(x => x.Id).Skip((currentPage - 1) * pageSize).Take(pageSize).ToList();

                var pager = new Pager(actualResult.Count(), currentPage, pageSize, 6);

                List<object> roles = new List<object>();

                foreach (var item in result)
                {
                    var user = _dbContext.Users.FirstOrDefault(x => x.Id == item.CreatedBy);

                    var data = new
                    {
                        id = item.Id,
                        roleName = item.RoleName,
                        description = item.Description,
                        createdBy = string.Format("{0} {1}", user.FirstName, user.LastName),
                        dateCreated = item.DateCreated.ToString()
                    };

                    roles.Add(data);
                }

                return Json(new { roles, pager }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public ActionResult GetRole(int id)
        {
            using (PVAOEntities _dbContext = new PVAOEntities())
            {
                _dbContext.Configuration.ProxyCreationEnabled = false;

                var result = _dbContext.Roles.Where(x => x.Id == id).ToList();

                List<object> roles = new List<object>();

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

                    var data = new
                    {
                        id = item.Id,
                        roleName = item.RoleName,
                        description = item.Description,
                        createdBy = string.Format("{0} {1}", createdBy.FirstName, createdBy.LastName),
                        dateCreated = item.DateCreated.ToString(),
                        updatedBy = updatedBy,
                        dateUpdated = dateUpdated
                    };

                    roles.Add(data);
                }

                return Json(roles, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public ActionResult SaveChanges(int id, string roleName, string description)
        {
            try
            {
                using (PVAOEntities _dbContext = new PVAOEntities())
                {
                    _dbContext.Configuration.ProxyCreationEnabled = false;

                    if (id != 0)
                    {
                        var role = _dbContext.Roles.Single(x => x.Id == id);

                        if (role != null)
                        {
                            role.RoleName = roleName;
                            role.Description = description;
                            role.UpdatedBy = (int)Session["UserID"];
                            role.DateUpdated = DateTime.Now;
                            _dbContext.SaveChanges();
                        }

                        return Json(role, JsonRequestBehavior.AllowGet);
                    }
                    else
                    {
                        Role role = new Role()
                        {
                            RoleName = roleName,
                            Description = description,
                            CreatedBy = (int)Session["UserID"],
                            DateCreated = DateTime.Now
                        };
                        _dbContext.Roles.Add(role);
                        _dbContext.SaveChanges();

                        return Json(role, JsonRequestBehavior.AllowGet);
                    }
                }
            }
            catch (Exception ex)
            {
                return Json(string.Format("Error occurred. Error details: {0}", ex.Message));
            }
        }

        [HttpPost]
        public ActionResult Delete(int id)
        {
            try
            {
                using (PVAOEntities _dbContext = new PVAOEntities())
                {
                    _dbContext.Configuration.ProxyCreationEnabled = false;

                    int deletionStatus = (int)ResponseStatusEnum.Success;

                    var role = _dbContext.Roles.SingleOrDefault(x => x.Id == id);

                    if (role != null)
                    {
                        if (_dbContext.UserRoles.Where(x => x.RoleId == id).Count() > 0)
                        {
                            deletionStatus = (int)ResponseStatusEnum.InUsed;
                        }
                        else
                        {
                            if (role != null)
                            {
                                _dbContext.Roles.Remove(role);
                                _dbContext.SaveChanges();
                            }
                        }
                    }
                    else
                        deletionStatus = (int)ResponseStatusEnum.Failed;

                    return Json(deletionStatus, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(string.Format("Error occurred. Error details: {0}", ex.Message));
            }
        }
    }
}