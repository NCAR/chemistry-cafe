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
        private async Task<HttpClient> ClientForAsync(Viewer viewer, User owner) => viewer switch
        {
            Viewer.Anonymous => AnonymousClient,
            Viewer.Owner => CreateClient(true, owner),
            Viewer.OtherUser => CreateClient(true, await CreateUserAsync(Role.None)),
            Viewer.Admin => CreateClient(true, await CreateUserAsync(Role.Admin)),
            _ => throw new ArgumentOutOfRangeException(nameof(viewer)),
        };

        [TestMethod]
        [DataRow(Viewer.Anonymous, true, true)]
        [DataRow(Viewer.Anonymous, false, false)]
        [DataRow(Viewer.OtherUser, true, true)]
        [DataRow(Viewer.OtherUser, false, false)]
        [DataRow(Viewer.Owner, true, true)]
        [DataRow(Viewer.Owner, false, true)]
        [DataRow(Viewer.Admin, true, true)]
        [DataRow(Viewer.Admin, false, true)]
        public async Task GetFamilies_AppliesVisibility(Viewer viewer, bool isPublic, bool expectVisible)
        {
            var owner = await CreateUserAsync(Role.None);
            var family = await CreateFamilyAsync(owner, isPublic: isPublic);
            var client = await ClientForAsync(viewer, owner);

            var byId = await client.GetAsync($"/api/families/{family.Id}");
            Assert.AreEqual(expectVisible ? HttpStatusCode.OK : HttpStatusCode.NotFound, byId.StatusCode);

            var list = await client.GetFromJsonAsync<List<FamilyDto>>("/api/families");
            Assert.IsNotNull(list);
            Assert.AreEqual(expectVisible, list.Any(f => f.Id == family.Id));
        }

        [TestMethod]
        public async Task CreateFamily_Anonymous_ReturnsUnauthorized()
        {
            var newFamily = new FamilyDto { Name = "Anon Family", Description = "Desc" };
            var response = await AnonymousClient.PostAsJsonAsync("/api/families", newFamily);
            Assert.AreEqual(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [TestMethod]
        [DataRow(true)]
        [DataRow(false)]
        public async Task CreateFamily_SetsIsPublic(bool isPublic)
        {
            var newFamily = new FamilyDto { Id = Guid.NewGuid(), Name = "New Family", IsPublic = isPublic };
            var post = await AuthorizedClient.PostAsJsonAsync("/api/families", newFamily);
            Assert.AreEqual(HttpStatusCode.Created, post.StatusCode);

            var get = await AnonymousClient.GetAsync($"/api/families/{newFamily.Id}");
            Assert.AreEqual(isPublic ? HttpStatusCode.OK : HttpStatusCode.NotFound, get.StatusCode);
        }

        [TestMethod]
        [DataRow(Viewer.Owner, false, true, HttpStatusCode.NoContent, true)]
        [DataRow(Viewer.Owner, true, false, HttpStatusCode.NoContent, false)]
        [DataRow(Viewer.Admin, false, true, HttpStatusCode.NoContent, true)]
        [DataRow(Viewer.OtherUser, false, true, HttpStatusCode.Forbidden, false)]
        [DataRow(Viewer.Anonymous, false, true, HttpStatusCode.Unauthorized, false)]
        public async Task UpdateFamily_SetsIsPublic(
            Viewer editor, bool startPublic, bool requested, HttpStatusCode expectedStatus, bool expectPublicAfter)
        {
            var owner = await CreateUserAsync(Role.None);
            var family = await CreateFamilyAsync(owner, isPublic: startPublic);
            var client = await ClientForAsync(editor, owner);

            var update = new FamilyDto { Id = family.Id, Name = family.Name, IsPublic = requested };
            var patch = await client.PatchAsJsonAsync($"/api/families/{family.Id}", update);
            Assert.AreEqual(expectedStatus, patch.StatusCode);

            var get = await AnonymousClient.GetAsync($"/api/families/{family.Id}");
            Assert.AreEqual(expectPublicAfter ? HttpStatusCode.OK : HttpStatusCode.NotFound, get.StatusCode);
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
