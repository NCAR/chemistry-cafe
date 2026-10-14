using System.Net.Http;
using ChemistryCafeAPI.Models;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace ChemistryCafeAPI.Tests.Functional
{
    [TestClass]
    public abstract class BaseFunctionalTests
    {
        private static readonly TestWebApplicationFactory _factory = new();

        /// <summary>
        /// Mock HTTP client configured without authentication (anonymous).
        /// </summary>
        protected HttpClient AnonymousClient { get; } = _factory.CreateMockClient(isAuthorized: false);

        /// <summary>
        /// Mock HTTP client configured with test authentication headers (authorized).
        /// </summary>
        protected HttpClient AuthorizedClient { get; } = _factory.CreateMockClient(isAuthorized: true);

        /// <summary>
        /// Creates a mock HTTP client for a specific user.
        /// </summary>
        protected HttpClient CreateClient(bool isAuthorized, User user, Role? role = null)
        {
            return _factory.CreateMockClient(isAuthorized, user.Id, role ?? user.Role);
        }

        /// <summary>
        /// Creates a mock HTTP client with a specific role and optional userId.
        /// </summary>
        protected HttpClient CreateClientWithRole(Role role, Guid? userId = null)
        {
            return _factory.CreateMockClient(isAuthorized: true, userId: userId, role: role);
        }

        /// <summary>
        /// Creates a new user in the test database.
        /// </summary>
        protected async Task<User> CreateUserAsync(Role role, string? username = null, string? email = null, Guid? id = null)
        {
            return await _factory.CreateUserAsync(role, username, email, id);
        }

        /// <summary>
        /// Creates a new family in the test database with the specified owner.
        /// </summary>
        protected async Task<Family> CreateFamilyAsync(User owner, string? name = null, string? description = null, Guid? id = null)
        {
            return await _factory.CreateFamilyAsync(owner, name, description, id);
        }
    }
}
