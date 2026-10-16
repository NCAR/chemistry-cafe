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
        public async Task Preferences_Anonymous_ReturnsUnauthorized()
        {
            var getResponse = await AnonymousClient.GetAsync("/api/users/me/preferences");
            Assert.AreEqual(HttpStatusCode.Unauthorized, getResponse.StatusCode);

            var preferences = new UserPreferences { TroeRateUnits = RateUnits.SI };
            var putResponse = await AnonymousClient.PutAsJsonAsync("/api/users/me/preferences", preferences);
            Assert.AreEqual(HttpStatusCode.Unauthorized, putResponse.StatusCode);
        }

        [TestMethod]
        public async Task GetPreferences_NoSavedPreferences_ReturnsNoContent()
        {
            var user = await CreateUserAsync(Role.None);
            var client = CreateClient(true, user);

            var response = await client.GetAsync("/api/users/me/preferences");
            Assert.AreEqual(HttpStatusCode.NoContent, response.StatusCode);
        }

        [TestMethod]
        public async Task GetPreferences_UnknownUser_ReturnsNotFound()
        {
            var client = CreateClientWithRole(Role.None, Guid.NewGuid());

            var response = await client.GetAsync("/api/users/me/preferences");
            Assert.AreEqual(HttpStatusCode.NotFound, response.StatusCode);
        }

        [TestMethod]
        public async Task SavePreferences_CreatesThenUpdates()
        {
            var user = await CreateUserAsync(Role.None);
            var client = CreateClient(true, user);

            var created = await client.PutAsJsonAsync("/api/users/me/preferences",
                new UserPreferences { TroeRateUnits = RateUnits.SI, TunnelingRateUnits = RateUnits.SI });
            Assert.AreEqual(HttpStatusCode.OK, created.StatusCode);
            var saved = await client.GetFromJsonAsync<UserPreferences>("/api/users/me/preferences");
            Assert.AreEqual(user.Id, saved!.UserId);
            Assert.AreEqual(RateUnits.SI, saved.TroeRateUnits);
            Assert.AreEqual(RateUnits.SI, saved.TunnelingRateUnits);
            Assert.AreEqual(RateUnits.Molecule, saved.ArrheniusRateUnits);

            var updated = await client.PutAsJsonAsync("/api/users/me/preferences", new UserPreferences
            {
                ArrheniusRateUnits = RateUnits.SI,
                BranchedRateUnits = RateUnits.SI,
                TaylorSeriesRateUnits = RateUnits.SI,
                TernaryChemicalActivationRateUnits = RateUnits.SI,
            });
            Assert.AreEqual(HttpStatusCode.OK, updated.StatusCode);
            saved = await client.GetFromJsonAsync<UserPreferences>("/api/users/me/preferences");
            Assert.AreEqual(RateUnits.SI, saved!.ArrheniusRateUnits);
            Assert.AreEqual(RateUnits.SI, saved.BranchedRateUnits);
            Assert.AreEqual(RateUnits.SI, saved.TaylorSeriesRateUnits);
            Assert.AreEqual(RateUnits.SI, saved.TernaryChemicalActivationRateUnits);
            Assert.AreEqual(RateUnits.Molecule, saved.TroeRateUnits);
            Assert.AreEqual(RateUnits.Molecule, saved.TunnelingRateUnits);
        }

        [TestMethod]
        public async Task SavePreferences_IgnoresUserIdInBody()
        {
            var user = await CreateUserAsync(Role.None);
            var otherUser = await CreateUserAsync(Role.None);
            var client = CreateClient(true, user);

            var response = await client.PutAsJsonAsync("/api/users/me/preferences",
                new UserPreferences { UserId = otherUser.Id, TroeRateUnits = RateUnits.SI });
            Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);

            var otherClient = CreateClient(true, otherUser);
            var otherResponse = await otherClient.GetAsync("/api/users/me/preferences");
            Assert.AreEqual(HttpStatusCode.NoContent, otherResponse.StatusCode);
        }

        [TestMethod]
        public async Task SavePreferences_SerializesRateUnitsAsString()
        {
            var user = await CreateUserAsync(Role.None);
            var client = CreateClient(true, user);

            var content = new StringContent("{\"troeRateUnits\":\"SI\"}", System.Text.Encoding.UTF8, "application/json");
            var response = await client.PutAsync("/api/users/me/preferences", content);
            Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);

            var body = await response.Content.ReadAsStringAsync();
            StringAssert.Contains(body, "\"troeRateUnits\":\"SI\"");
            StringAssert.Contains(body, "\"arrheniusRateUnits\":\"Molecule\"");
        }

        [TestMethod]
        public async Task Logout_Anonymous_IsAllowed()
        {
            var response = await AnonymousClient.GetAsync("/api/users/logout");
            Assert.AreNotEqual(HttpStatusCode.Unauthorized, response.StatusCode);
        }
    }
}
