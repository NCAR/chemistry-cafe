using Chemistry_Cafe_API.Models;
using System.Data.Common;
using MySqlConnector;
using Microsoft.EntityFrameworkCore;

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

        public async Task<User> CreateUserAsync(User user)
        {
            user.Id = Guid.NewGuid();
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task UpdateUserAsync(User user)
        {
            var existingUser = await GetUserByIdAsync(user.Id);
            if (existingUser == null)
            {
                throw new KeyNotFoundException($"User with ID {user.Id} not found.");
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
