using ChemistryCafeAPI.Models;
using System.Data.Common;
using MySqlConnector;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication;
using Microsoft.IdentityModel.Protocols.Configuration;
using System.Security.Claims;
using System;

namespace ChemistryCafeAPI.Services
{
    public class UserService
    {
        private readonly ChemistryDbContext _context;

        public UserService(ChemistryDbContext context)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<User>> GetUsersAsync()
        {
            // Log the SQL query
            var users = _context.Users;
            Console.WriteLine($"SQL Query: {users.ToQueryString()}");

            // Execute query and log results
            var result = await users.ToListAsync();
            Console.WriteLine($"Number of users found: {result.Count}");
            if (result.Any())
            {
                Console.WriteLine("First user properties:");
                foreach (var prop in result.First().GetType().GetProperties())
                {
                    Console.WriteLine($"{prop.Name}: {prop.GetValue(result.First())}");
                }
            }

            return result;
        }

        public async Task<User?> GetUserByIdAsync(Guid id)
        {
            return await _context.Users.SingleOrDefaultAsync(u => u.Id == id);
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return await _context.Users.SingleOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User> SignIn(string googleID, string email)
        {
            var user = await _context.Users.SingleOrDefaultAsync(u => u.GoogleId == googleID);
            if (user == null)
            {
                user = new User();
                user.Id = Guid.NewGuid();
                user.Username = email;
                user.Role = "admin";
                user.Email = email;
                user.CreatedDate = DateTime.UtcNow;
                user.GoogleId = googleID;
                _context.Users.Add(user);
            }
            else
            {
                user.Email = email;
            }
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task UpdateUserAsync(User user)
        {
            var existingUser = await GetUserByIdAsync(user.Id);
            if (existingUser == null)
            {
                throw new KeyNotFoundException($"User with Id {user.Id} not found.");
            }
            existingUser.Username = user.Username;
            existingUser.Role = user.Role;
            existingUser.Email = user.Email;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteUserAsync(Guid id)
        {
            await _context.Users.Where(u => u.Id == id).ExecuteDeleteAsync();
        }
    }
}
