
using System;

namespace Chemistry_Cafe_API.Services
{
    public class TimeService
    {
        public string GetCurrentTime()
        {
            return DateTime.Now.ToString("o"); // ISO 8601 format
        }
    }
}