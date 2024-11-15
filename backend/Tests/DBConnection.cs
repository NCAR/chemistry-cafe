using MySqlConnector;

namespace Chemistry_Cafe_API.Tests
{
    public class DBConnection
    {
        private static string server = "mysql";
        private static string user = System.Environment.GetEnvironmentVariable("MYSQL_USER") ?? "defaultUser";
        private static string password = System.Environment.GetEnvironmentVariable("MYSQL_PASSWORD") ?? "defaultPassword";
        private static string database = System.Environment.GetEnvironmentVariable("MYSQL_DATABASE") ?? "defaultDatabase";
        private static string port = "3306"; // Default MySQL port

        public static MySqlDataSource DataSource = new MySqlDataSource(
            $"Server={server};User ID={user};Password={password};Port={port};Database={database}"
        );
    }
}