﻿using MySqlConnector;

namespace Chemistry_Cafe_API.Tests
{
    public class DBConnection
    {
        private static string server = Environment.GetEnvironmentVariable("MYSQL_SERVER") ?? "localhost";
        private static string user = System.Environment.GetEnvironmentVariable("MYSQL_USER") ?? "admin";
        private static string password = System.Environment.GetEnvironmentVariable("MYSQL_PASSWORD") ?? "admin";
        private static string database = System.Environment.GetEnvironmentVariable("MYSQL_DATABASE") ?? "default";
        private static string port = "3306"; // Default MySQL port

        public static MySqlDataSource DataSource = new MySqlDataSource(
            $"Server={server};Port={port};Database={database};User={user};Password={password}"
        );
    }
}