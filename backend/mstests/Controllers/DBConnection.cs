using MySqlConnector;
using ChemistryCafeAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace ChemistryCafeAPI.Tests
{
    public class DBConnection
    {
        private static string server = "localhost";
        private static string user = "chemistrycafedev";
        private static string password = "chemistrycafe";
        private static string database = "chemistry_db";
        private static string port = "3306"; // Default MySQL port
        private static string connectionString = $"Server={server};Port={port};Database={database};User={user};Password={password};AllowUserVariables=True;UseAffectedRows=False;";
        private static DbContextOptions<ChemistryDbContext> options = new DbContextOptionsBuilder<ChemistryDbContext>()
            .UseMySql(connectionString, ServerVersion.AutoDetect(connectionString))
            .Options;
        public static MySqlDataSource DataSource = new MySqlDataSource(connectionString);
        public static ChemistryDbContext Context = new ChemistryDbContext(options);
    }
}
