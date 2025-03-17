using Chemistry_Cafe_API.Models;
using System.Data.Common;
using MySqlConnector;
using Microsoft.EntityFrameworkCore;
using System;

namespace Chemistry_Cafe_API.Services
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
            return await _context.Users.ToListAsync();
        }

        public async Task<User?> GetUserByIdAsync(Guid id)
        {
            return await _context.Users.SingleOrDefaultAsync(u => u.Id == id);
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return await _context.Users.SingleOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User> SignIn(string googleID, string email) {
            var user = await _context.Users.SingleOrDefaultAsync(u => u.GoogleId == googleID);
            if (user == null) {
                user = new User();
                user.Id = Guid.NewGuid();
                user.Username = email;
                user.Role = "admin";
                user.Email = email; 
                user.CreatedDate = DateTime.UtcNow;
                user.GoogleId = googleID;
                _context.Users.Add(user);
            } else {
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
