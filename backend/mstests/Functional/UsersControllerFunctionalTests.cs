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
        public async Task GetUsers_Anonymous_IsAllowed()
        {
            var response = await AnonymousClient.GetAsync("/api/users");
            Assert.AreNotEqual(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [TestMethod]
        public async Task GetUserById_Anonymous_IsAllowed()
        {
            var response = await AnonymousClient.GetAsync($"/api/users/id/{TestWebApplicationFactory.TestUserId}");
            Assert.AreNotEqual(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [TestMethod]
        public async Task GetUserByEmail_Anonymous_IsAllowed()
        {
            var response = await AnonymousClient.GetAsync("/api/users/email/testuser@example.com");
            Assert.AreNotEqual(HttpStatusCode.Unauthorized, response.StatusCode);
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
            Assert.AreNotEqual(HttpStatusCode.Unauthorized, response.StatusCode);
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
            Assert.AreNotEqual(HttpStatusCode.Unauthorized, response.StatusCode);
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
            var response = await AuthorizedClient.DeleteAsync($"/api/users/{Guid.NewGuid()}");
            Assert.AreNotEqual(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [TestMethod]
        public async Task Logout_Anonymous_IsAllowed()
        {
            var response = await AnonymousClient.GetAsync("/api/users/logout");
            Assert.AreNotEqual(HttpStatusCode.Unauthorized, response.StatusCode);
        }
    }
}
