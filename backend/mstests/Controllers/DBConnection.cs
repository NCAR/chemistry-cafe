using MySqlConnector;
using ChemistryCafeAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace ChemistryCafeAPI.Tests
{
    public class DBConnection
    {
        private static string server = Environment.GetEnvironmentVariable("MYSQL_SERVER") ?? "127.0.0.1";
        private static string user = Environment.GetEnvironmentVariable("MYSQL_USER") ?? "chemistrycafedev";
        private static string password = Environment.GetEnvironmentVariable("MYSQL_PASSWORD") ?? "chemistrycafe";
        private static string database = Environment.GetEnvironmentVariable("MYSQL_DATABASE") ?? "chemistry_db";
        private static string port = "3306"; // Default MySQL port
        private static string connectionString = $"Server={server};Port={port};Database={database};User={user};Password={password};AllowUserVariables=True;UseAffectedRows=False;";
        private static DbContextOptions<ChemistryDbContext> options = new DbContextOptionsBuilder<ChemistryDbContext>()
            .UseMySql(connectionString, ServerVersion.AutoDetect(connectionString))
            .Options;
        public static ChemistryDbContext Context = new ChemistryDbContext(options);
    }
}
