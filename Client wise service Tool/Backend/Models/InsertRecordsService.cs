using System;
using System.Collections.Generic;

namespace PuffinRecon.API.Models
{
    public class InsertRecordsRequest
    {
        /// <summary>List of journey names to insert. Pass all 51 to insert everything.</summary>
        public List<string> Journeys { get; set; } = new();

        /// <summary>The mobile number to use for sms_mobile and mobile columns.</summary>
        public string MobileNumber { get; set; } = string.Empty;

        /// <summary>1 = Arabic, 2 = English</summary>
        public int PreferredLanguage { get; set; } = 1;
    }

    public class InsertRecordsResult
    {
        public int RowsInserted { get; set; }
        public DateTime InsertedAt { get; set; }
        public List<string> Journeys { get; set; } = new();
    }
}