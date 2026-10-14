using System.Net;
using System.Net.Http.Json;
using ChemistryCafeAPI.Models;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace ChemistryCafeAPI.Tests.Functional
{
    [TestClass]
    public class UsersControllerFunctionalTests : BaseFunctionalTests
    {
        [TestMethod]
        public async Task GetUsers_Anonymous_ReturnsUnauthorized()
        {
            var response = await AnonymousClient.GetAsync("/api/users");
            Assert.AreEqual(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [TestMethod]
        public async Task GetUsers_Authorized_ReturnsForbidden()
        {
            var response = await CreateClientWithRole(Role.None).GetAsync("/api/users");
            Assert.AreEqual(HttpStatusCode.Forbidden, response.StatusCode);
        }

        [TestMethod]
        public async Task GetUsers_Admin_IsAllowed()
        {
            var response = await CreateClientWithRole(Role.Admin).GetAsync("/api/users");
            Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
        }

        [TestMethod]
        public async Task GetUserById_Anonymous_IsAllowed()
        {
            var response = await AnonymousClient.GetAsync($"/api/users/id/{TestWebApplicationFactory.TestUserId}");
            Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
        }

        [TestMethod]
        public async Task GetUserByEmail_Anonymous_IsAllowed()
        {
            var response = await AnonymousClient.GetAsync("/api/users/email/testuser@example.com");
            Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
        }

        [TestMethod]
        public async Task WhoAmI_Anonymous_ReturnsUnauthorized()
        {
            var response = await AnonymousClient.GetAsync("/api/users/whoami");
            Assert.AreEqual(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [TestMethod]
        public async Task WhoAmI_Authorized_IsAllowed()
        {
            var response = await AuthorizedClient.GetAsync("/api/users/whoami");
            Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
        }

        [TestMethod]
        public async Task WhoAmI_WithRoleNone_IsAllowed()
        {
            var client = CreateClientWithRole(Role.None);
            var response = await client.GetAsync("/api/users/whoami");
            Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
        }

        [TestMethod]
        public async Task UpdateUser_Anonymous_ReturnsUnauthorized()
        {
            var user = new User
            {
                Id = TestWebApplicationFactory.TestUserId,
                Username = "testuser",
                Email = "testuser@example.com"
            };
            var response = await AnonymousClient.PutAsJsonAsync($"/api/users/{TestWebApplicationFactory.TestUserId}", user);
            Assert.AreEqual(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [TestMethod]
        public async Task UpdateUser_Authorized_IsAllowed()
        {
            var user = new User
            {
                Id = TestWebApplicationFactory.TestUserId,
                Username = "testuser",
                Email = "testuser@example.com"
            };
            var response = await AuthorizedClient.PutAsJsonAsync($"/api/users/{TestWebApplicationFactory.TestUserId}", user);
            Assert.AreEqual(HttpStatusCode.NoContent, response.StatusCode);
        }

        [TestMethod]
        public async Task UpdateUser_NonAdmin_ReturnsForbidden()
        {
            var targetUser = await CreateUserAsync(Role.None);
            var anotherUser = await CreateUserAsync(Role.None);
            var client = CreateClient(true, anotherUser, Role.None);

            var updatedUser = new User
            {
                Id = targetUser.Id,
                Username = "updated_username",
                Email = targetUser.Email
            };
            var response = await client.PutAsJsonAsync($"/api/users/{targetUser.Id}", updatedUser);
            Assert.AreEqual(HttpStatusCode.Forbidden, response.StatusCode);
        }

        [TestMethod]
        public async Task UpdateUser_Admin_IsAllowed()
        {
            var targetUser = await CreateUserAsync(Role.None);
            var adminUser = await CreateUserAsync(Role.Admin);
            var client = CreateClient(true, adminUser, Role.Admin);

            var updatedUser = new User
            {
                Id = targetUser.Id,
                Username = "updated_by_admin",
                Email = targetUser.Email
            };
            var response = await client.PutAsJsonAsync($"/api/users/{targetUser.Id}", updatedUser);
            Assert.AreEqual(HttpStatusCode.NoContent, response.StatusCode);
        }

        [TestMethod]
        public async Task DeleteUser_Anonymous_ReturnsUnauthorized()
        {
            var response = await AnonymousClient.DeleteAsync($"/api/users/{TestWebApplicationFactory.TestUserId}");
            Assert.AreEqual(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [TestMethod]
        public async Task DeleteUser_Authorized_IsAllowed()
        {
            var response = await AuthorizedClient.DeleteAsync($"/api/users/{TestWebApplicationFactory.TestUserId}");
            Assert.AreEqual(HttpStatusCode.NoContent, response.StatusCode);
        }

        [TestMethod]
        public async Task DeleteUser_NonAdmin_ReturnsForbidden()
        {
            var secondUser = await CreateUserAsync(Role.None);
            var client = CreateClient(true, secondUser, Role.None);
            var response = await client.DeleteAsync($"/api/users/{TestWebApplicationFactory.TestUserId}");
            Assert.AreEqual(HttpStatusCode.Forbidden, response.StatusCode);
        }

        [TestMethod]
        public async Task Logout_Anonymous_IsAllowed()
        {
            var response = await AnonymousClient.GetAsync("/api/users/logout");
            Assert.AreNotEqual(HttpStatusCode.Unauthorized, response.StatusCode);
        }
    }
}
