using System.Net;
using System.Net.Http.Json;
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
            Assert.AreNotEqual(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [TestMethod]
        public async Task GetFamilyById_Anonymous_IsAllowed()
        {
            var response = await AnonymousClient.GetAsync($"/api/families/{TestWebApplicationFactory.TestFamilyId}");
            Assert.AreNotEqual(HttpStatusCode.Unauthorized, response.StatusCode);
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
            Assert.AreNotEqual(HttpStatusCode.Unauthorized, response.StatusCode);
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
            Assert.AreNotEqual(HttpStatusCode.Unauthorized, response.StatusCode);
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
            var response = await AuthorizedClient.DeleteAsync($"/api/families/{Guid.NewGuid()}");
            Assert.AreNotEqual(HttpStatusCode.Unauthorized, response.StatusCode);
        }
    }
}
