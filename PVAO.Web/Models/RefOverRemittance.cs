//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace PVAOWeb.Models
{
    using System;
    using System.Collections.Generic;
    
    public partial class RefOverRemittance
    {
        public int Id { get; set; }
        public string ClaimNumber { get; set; }
        public string BenefitStatus { get; set; }
        public string VDMSNumber { get; set; }
        public string PensionerName { get; set; }
        public int Status { get; set; }
        public System.DateTime DateComputed { get; set; }
        public int ComputedBy { get; set; }
        public Nullable<System.DateTime> DateSubmitted { get; set; }
        public Nullable<int> SubmittedBy { get; set; }
        public Nullable<int> ApprovedRejectedBy { get; set; }
        public Nullable<System.DateTime> ApprovedRejectedDate { get; set; }
        public string Remarks { get; set; }
    }
}
