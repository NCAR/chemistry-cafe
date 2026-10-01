namespace ChemistryCafeAPI.Options
{
    public class GoogleAuthOptions
    {
        public const string SectionName = "Google";

        public string? ClientId { get; set; }
        public string? ClientSecret { get; set; }

        public bool IsConfigured =>
            !string.IsNullOrWhiteSpace(ClientId) && !string.IsNullOrWhiteSpace(ClientSecret);
    }
}
