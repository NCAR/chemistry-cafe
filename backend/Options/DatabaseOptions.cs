namespace ChemistryCafeAPI.Options
{
    public class DatabaseOptions
    {
        public const string SectionName = "Database";

        public string Server { get; set; } = "localhost";
        public string Port { get; set; } = "3306";
        public string User { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Database { get; set; } = string.Empty;

        public string ConnectionString =>
            $"Server={Server};Port={Port};Database={Database};User={User};Password={Password};AllowUserVariables=True;UseAffectedRows=False;";
    }
}
