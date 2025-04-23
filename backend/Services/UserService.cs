using ChemistryCafeAPI.Models;
using Microsoft.EntityFrameworkCore;

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
            return await _context.Users.ToListAsync();
        }

        /// <summary>
        /// Retrieves a user with their database ID
        /// </summary>
        /// <param name="id">ID of the user</param>
        /// <returns>Tracked user object if found</returns>
        public async Task<User?> GetUserByIdAsync(Guid id)
        {
            return await _context.Users.SingleOrDefaultAsync(u => u.Id == id);
        }

        /// <summary>
        /// Retrieves a user with their Google NameID
        /// </summary>
        /// <param name="id">Google ID of the user</param>
        /// <returns>Tracked user object if found</returns>
        public async Task<User?> GetUserByGoogleIdAsync(string id)
        {
            return await _context.Users.SingleOrDefaultAsync(u => u.GoogleId == id);
        }

        /// <summary>
        /// Retrieves a user via their email
        /// </summary>
        /// <param name="email">Email of the user</param>
        /// <returns>Tracked user object if found</returns>
        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return await _context.Users.SingleOrDefaultAsync(u => u.Email == email);
        }

        /// <summary>
        /// Creates a user in the database if they don't exist.
        /// Otherwise, returns the existing user.
        /// </summary>
        /// <param name="googleID"></param>
        /// <param name="email"></param>
        /// <returns>Tracked user object</returns>
        public async Task<User> SignIn(string googleID, string email)
        {
            var user = await _context.Users.SingleOrDefaultAsync(u => u.GoogleId == googleID);
            if (user == null)
            {
                user = new User();
                user.Id = Guid.NewGuid();
                user.Username = email;
                user.Role = "unverified";
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

        /// <summary>
        /// Updates a given user's information.
        /// Only admins are allowed to update other user's information and their roles
        /// </summary>
        /// <param name="user">User information specified by principal (currently logged in) user</param>
        /// <param name="nameIdentifier">ID of the principal user</param>
        /// <returns>Result of the transaction</returns>
        public async Task<QueryResult> UpdateUserAsync(User user, string nameIdentifier)
        {
            Guid userId;
            bool validGuid = Guid.TryParse(nameIdentifier, out userId);
            if (!validGuid)
            {
                return QueryResult.ParseError;
            }

            var loggedInUser = await GetUserByIdAsync(userId);
            if (loggedInUser == null)
            {
                return QueryResult.NotFound;
            }

            var existingUser = await GetUserByIdAsync(user.Id);
            if (existingUser == null)
            {
                return QueryResult.NotFound;
            }

            if (loggedInUser.Id != user.Id && loggedInUser.Role != "admin")
            {
                return QueryResult.NoAccess;
            }

            if (loggedInUser.Role == "admin")
            {
                existingUser.Role = user.Role;
            }
            existingUser.Username = user.Username;
            existingUser.Email = user.Email;
            await _context.SaveChangesAsync();
            return QueryResult.Success;
        }

        /// <summary>
        /// Deletes a specified user.
        /// Fails when the principal user is not the specified user or am admin 
        /// </summary>
        /// <param name="id">ID of the user to delete</param>
        /// <param name="nameIdentifier">ID of the principal user</param>
        /// <returns>Result of the transaction</returns>
        public async Task<QueryResult> DeleteUserAsync(Guid id, string nameIdentifier)
        {
            Guid userId;
            bool validGuid = Guid.TryParse(nameIdentifier, out userId);
            if (!validGuid)
            {
                return QueryResult.ParseError;
            }

            var loggedInUser = await GetUserByIdAsync(userId);
            if (loggedInUser == null)
            {
                return QueryResult.NotFound;
            }

            if (loggedInUser.Id != id && loggedInUser.Role != "admin")
            {
                return QueryResult.NoAccess;
            }

            await _context.Users.Where(u => u.Id == id).ExecuteDeleteAsync();
            return QueryResult.Success;
        }
    }
}
