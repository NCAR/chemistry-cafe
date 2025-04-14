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
        public enum Result 
        {
            Success,
            NotFound, 
            Forbidden
        }

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

        public async Task<User?> GetUserByGoogleIdAsync(string id)
        {
            return await _context.Users.SingleOrDefaultAsync(u => u.GoogleId == id);
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
                await _context.SaveChangesAsync();
            }
            else
            {
                user.Email = email;
            }
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<UserService.Result> UpdateUserAsync(User user)
        {
            var existingUser = await GetUserByIdAsync(user.Id);
            if (existingUser == null)
            {
                return UserService.Result.NotFound;
            }
            if (existingUser.Role != "admin")
            {
                return UserService.Result.Forbidden;
            }
            existingUser.Username = user.Username;
            existingUser.Role = user.Role;
            existingUser.Email = user.Email;
            await _context.SaveChangesAsync();
            return UserService.Result.Success;
        }

        public async Task DeleteUserAsync(Guid id)
        {
            await _context.Users.Where(u => u.Id == id).ExecuteDeleteAsync();
        }
    }
}
