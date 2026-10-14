using System.Net;
using System.Net.Http.Json;
using ChemistryCafeAPI.Models;
using ChemistryCafeAPI.Models.Dto;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace ChemistryCafeAPI.Tests.Functional
{
    [TestClass]
    public class FamilyControllerFunctionalTests : BaseFunctionalTests
    {
        [TestMethod]
        public async Task GetFamilies_Anonymous_IsAllowed()
        {
            var response = await AnonymousClient.GetAsync("/api/families");
            Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
        }

        [TestMethod]
        public async Task GetFamilyById_Anonymous_IsAllowed()
        {
            var response = await AnonymousClient.GetAsync($"/api/families/{TestWebApplicationFactory.TestFamilyId}");
            Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
        }

        [TestMethod]
        public async Task CreateFamily_Anonymous_ReturnsUnauthorized()
        {
            var newFamily = new FamilyDto { Name = "Anon Family", Description = "Desc" };
            var response = await AnonymousClient.PostAsJsonAsync("/api/families", newFamily);
            Assert.AreEqual(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [TestMethod]
        public async Task CreateFamily_Authorized_IsAllowed()
        {
            var newFamily = new FamilyDto { Name = "Auth Family", Description = "Desc" };
            var response = await AuthorizedClient.PostAsJsonAsync("/api/families", newFamily);
            Assert.AreEqual(HttpStatusCode.Created, response.StatusCode);
        }

        [TestMethod]
        public async Task UpdateFamily_Anonymous_ReturnsUnauthorized()
        {
            var updateFamily = new FamilyDto { Id = TestWebApplicationFactory.TestFamilyId, Name = "Updated Family", Description = "Desc" };
            var response = await AnonymousClient.PatchAsJsonAsync($"/api/families/{TestWebApplicationFactory.TestFamilyId}", updateFamily);
            Assert.AreEqual(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [TestMethod]
        public async Task UpdateFamily_Authorized_IsAllowed()
        {
            var updateFamily = new FamilyDto { Id = TestWebApplicationFactory.TestFamilyId, Name = "Updated Family", Description = "Desc" };
            var response = await AuthorizedClient.PatchAsJsonAsync($"/api/families/{TestWebApplicationFactory.TestFamilyId}", updateFamily);
            Assert.AreEqual(HttpStatusCode.NoContent, response.StatusCode);
        }

        [TestMethod]
        public async Task UpdateFamily_NonOwnerNonAdmin_ReturnsForbidden()
        {
            var owner = await CreateUserAsync(Role.None);
            var family = await CreateFamilyAsync(owner);

            var anotherUser = await CreateUserAsync(Role.None);
            var client = CreateClient(true, anotherUser);

            var updateFamily = new FamilyDto { Id = family.Id, Name = "Updated Family", Description = "Desc" };
            var response = await client.PatchAsJsonAsync($"/api/families/{family.Id}", updateFamily);
            Assert.AreEqual(HttpStatusCode.Forbidden, response.StatusCode);
        }

        [TestMethod]
        public async Task UpdateFamily_AdminNonOwner_IsAllowed()
        {
            var owner = await CreateUserAsync(Role.None);
            var family = await CreateFamilyAsync(owner);

            var adminUser = await CreateUserAsync(Role.Admin);
            var client = CreateClient(true, adminUser);

            var updateFamily = new FamilyDto { Id = family.Id, Name = "Updated Family", Description = "Desc" };
            var response = await client.PatchAsJsonAsync($"/api/families/{family.Id}", updateFamily);
            Assert.AreEqual(HttpStatusCode.NoContent, response.StatusCode);
        }

        [TestMethod]
        public async Task DeleteFamily_Anonymous_ReturnsUnauthorized()
        {
            var response = await AnonymousClient.DeleteAsync($"/api/families/{TestWebApplicationFactory.TestFamilyId}");
            Assert.AreEqual(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [TestMethod]
        public async Task DeleteFamily_Authorized_IsAllowed()
        {
            var response = await AuthorizedClient.DeleteAsync($"/api/families/{TestWebApplicationFactory.TestFamilyId}");
            Assert.AreEqual(HttpStatusCode.NoContent, response.StatusCode);
        }

        [TestMethod]
        public async Task DeleteFamily_NonOwnerNonAdmin_ReturnsForbidden()
        {
            var owner = await CreateUserAsync(Role.None);
            var family = await CreateFamilyAsync(owner);

            var anotherUser = await CreateUserAsync(Role.None);
            var client = CreateClient(true, anotherUser);

            var response = await client.DeleteAsync($"/api/families/{family.Id}");
            Assert.AreEqual(HttpStatusCode.Forbidden, response.StatusCode);
        }

        [TestMethod]
        public async Task DeleteFamily_AdminNonOwner_IsAllowed()
        {
            var owner = await CreateUserAsync(Role.None);
            var family = await CreateFamilyAsync(owner);

            var adminUser = await CreateUserAsync(Role.Admin);
            var client = CreateClient(true, adminUser);

            var response = await client.DeleteAsync($"/api/families/{family.Id}");
            Assert.AreEqual(HttpStatusCode.NoContent, response.StatusCode);
        }
    }
}
