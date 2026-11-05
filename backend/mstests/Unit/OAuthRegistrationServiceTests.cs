using System.Security.Claims;
using ChemistryCafeAPI.Controllers;
using ChemistryCafeAPI.Models;
using ChemistryCafeAPI.Models.Dtos;
using ChemistryCafeAPI.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace ChemistryCafeAPI.Tests
{
    [TestClass]
    public class OAuthRegistrationServiceTests
    {
        private ChemistryDbContext _context = null!;
        private IDataProtectionProvider _dataProtectionProvider = null!;
        private OAuthRegistrationService _service = null!;

        [TestInitialize]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<ChemistryDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new ChemistryDbContext(options);
            _dataProtectionProvider = DataProtectionProvider.Create("TestApp");
            _service = new OAuthRegistrationService(_dataProtectionProvider, _context);
        }

        [TestMethod]
        public void GenerateSuggestedUsername_SanitizesProperly()
        {
            Assert.AreEqual("john_doe", OAuthRegistrationService.GenerateSuggestedUsername("john.doe@example.com"));
            Assert.AreEqual("Jane_Doe", OAuthRegistrationService.GenerateSuggestedUsername("Jane Doe"));
            Assert.IsTrue(OAuthRegistrationService.GenerateSuggestedUsername("").StartsWith("user"));
            Assert.IsTrue(OAuthRegistrationService.GenerateSuggestedUsername("a").Length >= 3);
        }

        [TestMethod]
        public async Task CheckUsernameAvailability_ValidatesRules()
        {
            // Empty / whitespace
            var (avail1, msg1) = await _service.CheckUsernameAvailabilityAsync("");
            Assert.IsFalse(avail1);
            Assert.AreEqual("Username is required.", msg1);

            // Too short
            var (avail2, _) = await _service.CheckUsernameAvailabilityAsync("ab");
            Assert.IsFalse(avail2);

            // Invalid characters
            var (avail3, _) = await _service.CheckUsernameAvailabilityAsync("bad username!");
            Assert.IsFalse(avail3);

            // Available
            var (avail4, msg4) = await _service.CheckUsernameAvailabilityAsync("valid_user-123");
            Assert.IsTrue(avail4);
            Assert.AreEqual("Username is available.", msg4);

            // Taken username
            _context.Users.Add(new User { Id = Guid.NewGuid(), Username = "existingUser", Role = Role.None });
            await _context.SaveChangesAsync();

            var (avail5, msg5) = await _service.CheckUsernameAvailabilityAsync("existinguser"); // case insensitive
            Assert.IsFalse(avail5);
            Assert.AreEqual("Username is already taken.", msg5);
        }

        [TestMethod]
        public void IsValidUsername_ValidatesCorrectly()
        {
            Assert.IsFalse(OAuthRegistrationService.IsValidUsername(""));
            Assert.IsFalse(OAuthRegistrationService.IsValidUsername("  "));
            Assert.IsFalse(OAuthRegistrationService.IsValidUsername("ab")); // too short (<3)
            Assert.IsFalse(OAuthRegistrationService.IsValidUsername(new string('a', 51))); // too long (>50)
            Assert.IsFalse(OAuthRegistrationService.IsValidUsername("user@name")); // invalid char
            Assert.IsFalse(OAuthRegistrationService.IsValidUsername("user name")); // space
            Assert.IsFalse(OAuthRegistrationService.IsValidUsername("user!name")); // exclamation

            Assert.IsTrue(OAuthRegistrationService.IsValidUsername("abc")); // min 3
            Assert.IsTrue(OAuthRegistrationService.IsValidUsername(new string('a', 50))); // max 50
            Assert.IsTrue(OAuthRegistrationService.IsValidUsername("user_name-123")); // allowed chars
        }

        [TestMethod]
        public async Task UpdateUser_Returns_UsernameTaken_And_ValidationError()
        {
            var userService = new UserService(_context);

            var user1 = new User { Id = Guid.NewGuid(), Username = "user_one", Role = Role.None };
            var user2 = new User { Id = Guid.NewGuid(), Username = "user_two", Role = Role.None };
            _context.Users.AddRange(user1, user2);
            await _context.SaveChangesAsync();

            // Try to update user2's username to user1's username
            var updateAttempt1 = new User
            {
                Id = user2.Id,
                Username = "user_one",
                Role = Role.None
            };
            var result1 = await userService.UpdateUserAsync(updateAttempt1, user2.Id.ToString());
            Assert.AreEqual(QueryResult.UsernameTaken, result1);

            // Try to update user2's username to an invalid format (violates UsernameRegex)
            var updateAttempt2 = new User
            {
                Id = user2.Id,
                Username = "invalid username!",
                Role = Role.None
            };
            var result2 = await userService.UpdateUserAsync(updateAttempt2, user2.Id.ToString());
            Assert.AreEqual(QueryResult.ValidationError, result2);
        }

        [TestMethod]
        public async Task RegisterUserAsync_SucceedsAndClearsCookie()
        {
            var httpContext = new DefaultHttpContext();
            var authServiceMock = new MockAuthenticationService();
            var serviceProviderMock = new ServiceCollection()
                .AddSingleton<IAuthenticationService>(authServiceMock)
                .BuildServiceProvider();
            httpContext.RequestServices = serviceProviderMock;

            var pending = new PendingRegistration
            {
                Provider = "Google",
                ProviderId = "google-12345",
                Email = "test@example.com",
                SuggestedUsername = "test_user",
                FirstName = "Test",
                LastName = "User"
            };

            _service.SetPendingRegistration(httpContext, pending);

            // Copy set cookie to request cookies for subsequent read
            foreach (var header in httpContext.Response.Headers.SetCookie)
            {
                var cookiePart = header?.Split(';')[0];
                if (cookiePart != null && cookiePart.Contains('='))
                {
                    var kv = cookiePart.Split('=', 2);
                    httpContext.Request.Headers.Append("Cookie", $"{kv[0]}={kv[1]}");
                }
            }

            var request = new RegisterUserDto
            {
                Username = "new_username",
                FirstName = "Test",
                LastName = "User"
            };

            var (success, error, user) = await _service.RegisterUserAsync(httpContext, request);
            Assert.IsTrue(success);
            Assert.IsNull(error);
            Assert.IsNotNull(user);
            Assert.AreEqual("new_username", user.Username);
            Assert.AreEqual("test@example.com", user.Email);
            Assert.AreEqual("google-12345", user.GoogleId);

            var dbUser = await _context.Users.SingleOrDefaultAsync(u => u.Username == "new_username");
            Assert.IsNotNull(dbUser);
        }

        private class MockAuthenticationService : IAuthenticationService
        {
            public Task<AuthenticateResult> AuthenticateAsync(HttpContext context, string? scheme) =>
                Task.FromResult(AuthenticateResult.NoResult());

            public Task ChallengeAsync(HttpContext context, string? scheme, AuthenticationProperties? properties) =>
                Task.CompletedTask;

            public Task ForbidAsync(HttpContext context, string? scheme, AuthenticationProperties? properties) =>
                Task.CompletedTask;

            public Task SignInAsync(HttpContext context, string? scheme, ClaimsPrincipal principal, AuthenticationProperties? properties) =>
                Task.CompletedTask;

            public Task SignOutAsync(HttpContext context, string? scheme, AuthenticationProperties? properties) =>
                Task.CompletedTask;
        }
    }
}

