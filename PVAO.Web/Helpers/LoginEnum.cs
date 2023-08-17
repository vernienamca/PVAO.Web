using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Web;

namespace PVAOWeb.Helpers
{
    public class LoginEnum
    {
        public enum ErrorCodes : uint
        {
            [Description("Invalid username or password combination. Please try again.")]
            EDS_ERR_INVALID_LOGIN_NG = 0x00007D01,

            [Description("Your account has expired. Please contact your system administrator.")]
            EDS_ERR_ACCOUNT_EXPIRED_NG = 0x00008D02,

            [Description("Your account has been locked. Please contact your system administrator.")]
            EDS_ERR_LOCKED_OUT_NG = 0x00009D03,

            [Description("Your account is inactive. Please contact your system administrator.")]
            EDS_ACCOUNT_INACTIVE_NG = 0x000010D04,

            [Description("You've reached the maximum login limit. Your account has been locked.")]
            EDS_ERR_MAXLOGIN_LIMIT_NG = 0x00009D05,

            [Description("Your account is currently logged in to another device.")]
            EDS_ERR_LOGGED_IN_NG = 0x00006D06
        }

        public enum LoginStatus
        {
            Success = 1,
            Failed = 0
        }

        public enum UserStatus
        {
            Active = 1,
            Inactive = 2,
            Locked = 3
        }
    }
}