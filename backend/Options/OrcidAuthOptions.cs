namespace ChemistryCafeAPI.Options
{
    public class OrcidAuthOptions
    {
        public const string SectionName = "Orcid";

        public string? ClientId { get; set; }
        public string? ClientSecret { get; set; }

        public bool IsConfigured =>
            !string.IsNullOrWhiteSpace(ClientId) && !string.IsNullOrWhiteSpace(ClientSecret);
    }
}
