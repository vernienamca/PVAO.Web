using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web.Mvc;
using PVAOWeb.Helpers;
using PVAOWeb.Models;

namespace PVAOWeb.Controllers
{
    public class PageController : BaseController
    {
        [HttpPost]
        public ActionResult GetPages(int currentPage, string searchText)
        {
            var pageSize = int.Parse(ConfigurationManager.AppSettings["PageSize"].ToString());

            using (PVAOEntities _dbContext = new PVAOEntities())
            {
                var actualResult = _dbContext.Pages.Where(w => w.UrlPath != "/").OrderByDescending(x => x.Id).ToList();

                if (!string.IsNullOrEmpty(searchText))
                    actualResult = actualResult.Where(x => x.PageName.ToLower().Contains(searchText.ToLower())).ToList();

                var result = actualResult.OrderByDescending(x => x.Id).Skip((currentPage - 1) * pageSize).Take(pageSize).ToList();

                var pager = new Pager(actualResult.Count(), currentPage, pageSize, 6);

                List<object> pages = new List<object>();

                foreach (var item in result)
                {
                    var data = new
                    {
                        id = item.Id,
                        pageName = item.PageName,
                        description = item.Description,
                        urlPath = item.UrlPath,
                        icon = item.Icon,
                        status = item.Active ? "Active" : "Inactive",
                        dateCreated = item.DateCreated.ToString()
                    };

                    pages.Add(data);
                }

                return Json(new { pages, pager }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public ActionResult GetPage(int id)
        {
            using (PVAOEntities _dbContext = new PVAOEntities())
            {
                _dbContext.Configuration.ProxyCreationEnabled = false;

                var result = _dbContext.Pages.Where(x => x.Id == id).ToList();

                List<object> pages = new List<object>();

                foreach (var item in result)
                {
                    var data = new
                    {
                        id = item.Id,
                        pageName = item.PageName,
                        description = item.Description,
                        urlPath = item.UrlPath,
                        accessibleByAll = item.AccessibleByAll,
                        active = item.Active
                    };

                    pages.Add(data);
                }

                return Json(pages, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public ActionResult SaveChanges(int id, string pageName, string description, string urlPath, bool accessibleByAll = false, bool active = false)
        {
            try
            {
                using (PVAOEntities _dbContext = new PVAOEntities())
                {
                    _dbContext.Configuration.ProxyCreationEnabled = false;

                    var page = _dbContext.Pages.Single(x => x.Id == id);

                    if (page != null)
                    {
                        page.PageName = pageName;
                        page.Description = description;
                        page.UrlPath = urlPath;
                        page.AccessibleByAll = accessibleByAll;
                        page.Active = active;
                        _dbContext.SaveChanges();
                    }

                    return Json(page, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(string.Format("Error occurred. Error details: {0}", ex.Message));
            }
        }

        [HttpPost]
        public ActionResult GetPageAccess(int pageId, string searchText)
        {
            using (PVAOEntities _dbContext = new PVAOEntities())
            {
                var actualResult = (from pac in _dbContext.PageAccesses
                                   where pac.PageId == pageId
                                   join rol in _dbContext.Roles on pac.RoleId equals rol.Id
                                   select new
                                   {
                                       pac.Id,
                                       pac.RoleId,
                                       rol.RoleName,
                                       pac.CanCreate,
                                       pac.CanRead,
                                       pac.CanUpdate,
                                       pac.CanDelete
                                   }).ToList();

                if (!string.IsNullOrEmpty(searchText))
                    actualResult = actualResult.Where(x => x.RoleName.ToLower().Contains(searchText.ToLower())).ToList();

                List<object> pageAccess = new List<object>();

                foreach (var item in actualResult)
                {
                    var data = new
                    {
                        id = item.Id,
                        roleId = item.RoleId,
                        roleName = item.RoleName,
                        canCreate = item.CanCreate,
                        canRead = item.CanRead,
                        canUpdate = item.CanUpdate,
                        canDelete = item.CanDelete
                    };

                    pageAccess.Add(data);
                }

                return Json(new { pageAccess }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public ActionResult GetRoles(int currentPage, int[] addedRoles, string searchText)
        {
            var pageSize = int.Parse(ConfigurationManager.AppSettings["PageSize"].ToString());

            using (PVAOEntities _dbContext = new PVAOEntities())
            {
                var actualResult = _dbContext.Roles.ToList();

                if (!string.IsNullOrEmpty(searchText))
                    actualResult = actualResult.Where(x => x.RoleName.ToLower().Contains(searchText.ToLower()) || x.Description.ToLower().Contains(searchText.ToLower())).ToList();

                var result = actualResult.OrderByDescending(x => x.Id).Skip((currentPage - 1) * pageSize).Take(pageSize).ToList();

                var pager = new Pager(actualResult.Count(), currentPage, pageSize, 6);

                List<object> roles = new List<object>();

                foreach (var item in result)
                {
                    var data = new
                    {
                        id = item.Id,
                        roleName = item.RoleName,
                        description = item.Description,
                        status = addedRoles != null ? addedRoles.Contains(item.Id) ? 1 : 0 : 0
                    };

                    roles.Add(data);
                }

                return Json(new { roles, pager }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public ActionResult RemovePageAccess(int pageId, int[] ids)
        {
            try
            {
                using (PVAOEntities _dbContext = new PVAOEntities())
                {
                    var pageAccess = _dbContext.PageAccesses.Where(x => x.PageId == pageId && !ids.Contains(x.Id)).ToList();

                    if (pageAccess != null)
                    {
                        _dbContext.PageAccesses.RemoveRange(pageAccess);
                        _dbContext.SaveChanges();
                    }

                    return Json(pageAccess, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(string.Format("Error occurred. Error details: {0}", ex.Message));
            }
        }

        [HttpPost]
        public ActionResult SavePageAccess(int pageAccessId, int pageId, int roleId, bool canCreate = false, bool canRead = false, bool canUpdate = false, bool canDelete = false)
        {
            try
            {
                using (PVAOEntities _dbContext = new PVAOEntities())
                {
                    _dbContext.Configuration.ProxyCreationEnabled = false;

                    if (pageAccessId != 0)
                    {
                        var pageAccess = _dbContext.PageAccesses.Single(x => x.Id == pageAccessId);

                        if (pageAccess != null)
                        {
                            pageAccess.CanCreate = canCreate;
                            pageAccess.CanRead = canRead;
                            pageAccess.CanUpdate = canUpdate;
                            pageAccess.CanDelete = canDelete;
                            pageAccess.UpdatedBy = (int)Session["UserID"];
                            pageAccess.DateUpdated = DateTime.Now;
                            _dbContext.SaveChanges();
                        }

                        return Json(pageAccess, JsonRequestBehavior.AllowGet);
                    }
                    else
                    {
                        PageAccess pageAccess = new PageAccess()
                        {
                            PageId = pageId,
                            RoleId = roleId,
                            CanCreate = canCreate,
                            CanRead = canRead,
                            CanUpdate = canUpdate,
                            CanDelete = canDelete,
                            CreatedBy = (int)Session["UserID"],
                            DateCreated = DateTime.Now
                        };
                        _dbContext.PageAccesses.Add(pageAccess);
                        _dbContext.SaveChanges();

                        return Json(pageAccess, JsonRequestBehavior.AllowGet);
                    }
                }
            }
            catch (Exception ex)
            {
                return Json(string.Format("Error occurred. Error details: {0}", ex.Message));
            }
        }
    }
}