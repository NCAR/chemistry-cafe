namespace ChemistryCafeAPI.Options
{
    public class UrlOptions
    {
        public const string SectionName = "Urls";

        public string FrontendHost { get; set; } = "http://localhost:5173";
        public string BackendBaseUrl { get; set; } = "/";
    }
}
