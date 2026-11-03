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
        private async Task<HttpClient> ClientForAsync(Viewer viewer, User owner, Family? family = null) => viewer switch
        {
            Viewer.Anonymous => AnonymousClient,
            Viewer.Owner => CreateClient(true, owner),
            Viewer.OtherUser => CreateClient(true, await CreateUserAsync(Role.None)),
            Viewer.Admin => CreateClient(true, await CreateUserAsync(Role.Admin)),
            Viewer.ContributorViewer => await CreateContributorClient(family, ContributorRole.Viewer),
            Viewer.ContributorEditor => await CreateContributorClient(family, ContributorRole.Editor),
            _ => throw new ArgumentOutOfRangeException(nameof(viewer)),
        };

        private async Task<HttpClient> CreateContributorClient(Family? family, ContributorRole role)
        {
            var user = await CreateUserAsync(Role.None);
            if (family != null)
            {
                await AddContributorAsync(family.Id, user, role);
            }
            return CreateClient(true, user);
        }

        [TestMethod]
        [DataRow(Viewer.Anonymous, true, true)]
        [DataRow(Viewer.Anonymous, false, false)]
        [DataRow(Viewer.OtherUser, true, true)]
        [DataRow(Viewer.OtherUser, false, false)]
        [DataRow(Viewer.Owner, true, true)]
        [DataRow(Viewer.Owner, false, true)]
        [DataRow(Viewer.Admin, true, true)]
        [DataRow(Viewer.Admin, false, true)]
        [DataRow(Viewer.ContributorViewer, false, true)]
        [DataRow(Viewer.ContributorEditor, false, true)]
        public async Task GetFamilies_AppliesVisibility(Viewer viewer, bool isPublic, bool expectVisible)
        {
            var owner = await CreateUserAsync(Role.None);
            var family = await CreateFamilyAsync(owner, isPublic: isPublic);
            var client = await ClientForAsync(viewer, owner, family);

            var byId = await client.GetAsync($"/api/families/{family.Id}");
            Assert.AreEqual(expectVisible ? HttpStatusCode.OK : HttpStatusCode.NotFound, byId.StatusCode);

            var list = await client.GetFromJsonAsync<List<FamilyDto>>("/api/families");
            Assert.IsNotNull(list);
            Assert.AreEqual(expectVisible, list.Any(f => f.Id == family.Id));
        }

        [TestMethod]
        public async Task GetFamily_DoesNotIncludeOwnerEmail()
        {
            var owner = await CreateUserAsync(Role.None, "owner_with_email", "owner@email.com");
            var family = await CreateFamilyAsync(owner, isPublic: true);
            var client = CreateClient(true, owner);

            var response = await client.GetAsync($"/api/families/{family.Id}");
            Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);

            var familyDto = await response.Content.ReadFromJsonAsync<FamilyDto>();
            Assert.IsNotNull(familyDto);
            Assert.IsNotNull(familyDto.Owner);
            Assert.AreEqual("owner_with_email", familyDto.Owner.Username);
            Assert.AreEqual(owner.Id, familyDto.Owner.Id);

            // Verify anonymous request to public family list does not leak owner email
            var anonResponse = await AnonymousClient.GetAsync($"/api/families/{family.Id}");
            Assert.AreEqual(HttpStatusCode.OK, anonResponse.StatusCode);
            var rawJson = await anonResponse.Content.ReadAsStringAsync();
            Assert.IsFalse(rawJson.Contains("owner@email.com"));
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
        [DataRow(Viewer.ContributorEditor, false, true, HttpStatusCode.Forbidden, false)]
        [DataRow(Viewer.ContributorViewer, false, true, HttpStatusCode.Forbidden, false)]
        [DataRow(Viewer.OtherUser, false, true, HttpStatusCode.Forbidden, false)]
        [DataRow(Viewer.Anonymous, false, true, HttpStatusCode.Unauthorized, false)]
        public async Task UpdateFamily_SetsIsPublic(
            Viewer editor, bool startPublic, bool requested, HttpStatusCode expectedStatus, bool expectPublicAfter)
        {
            var owner = await CreateUserAsync(Role.None);
            var family = await CreateFamilyAsync(owner, isPublic: startPublic);
            var client = await ClientForAsync(editor, owner, family);

            var update = new FamilyDto { Id = family.Id, Name = family.Name, IsPublic = requested };
            var patch = await client.PatchAsJsonAsync($"/api/families/{family.Id}", update);
            Assert.AreEqual(expectedStatus, patch.StatusCode);

            var get = await AnonymousClient.GetAsync($"/api/families/{family.Id}");
            Assert.AreEqual(expectPublicAfter ? HttpStatusCode.OK : HttpStatusCode.NotFound, get.StatusCode);
        }

        [TestMethod]
        public async Task UpdateFamily_ContributorEditor_CanUpdateFamilyContent_WhenIsPublicUnchanged()
        {
            var owner = await CreateUserAsync(Role.None);
            var family = await CreateFamilyAsync(owner, isPublic: false);
            var client = await ClientForAsync(Viewer.ContributorEditor, owner, family);

            var update = new FamilyDto
            {
                Id = family.Id,
                Name = "Updated By Editor",
                Description = "Updated Desc",
                IsPublic = false // unchanged
            };
            var patch = await client.PatchAsJsonAsync($"/api/families/{family.Id}", update);
            Assert.AreEqual(HttpStatusCode.NoContent, patch.StatusCode);

            var verifyClient = CreateClient(true, owner);
            var get = await verifyClient.GetFromJsonAsync<FamilyDto>($"/api/families/{family.Id}");
            Assert.IsNotNull(get);
            Assert.AreEqual("Updated By Editor", get.Name);
        }

        [TestMethod]
        [DataRow(Viewer.ContributorEditor)]
        [DataRow(Viewer.ContributorViewer)]
        public async Task DeleteFamily_Contributor_ReturnsForbidden(Viewer viewer)
        {
            var owner = await CreateUserAsync(Role.None);
            var family = await CreateFamilyAsync(owner);
            var client = await ClientForAsync(viewer, owner, family);

            var response = await client.DeleteAsync($"/api/families/{family.Id}");
            Assert.AreEqual(HttpStatusCode.Forbidden, response.StatusCode);
        }

        [TestMethod]
        // Private family: only Owner, Admin, Contributor (Editor/Viewer) allowed
        [DataRow(Viewer.Owner, false, HttpStatusCode.OK)]
        [DataRow(Viewer.Admin, false, HttpStatusCode.OK)]
        [DataRow(Viewer.ContributorEditor, false, HttpStatusCode.OK)]
        [DataRow(Viewer.ContributorViewer, false, HttpStatusCode.OK)]
        [DataRow(Viewer.OtherUser, false, HttpStatusCode.Forbidden)]
        [DataRow(Viewer.Anonymous, false, HttpStatusCode.Unauthorized)]
        // Public family: STILL only Owner, Admin, Contributor (Editor/Viewer) allowed
        [DataRow(Viewer.Owner, true, HttpStatusCode.OK)]
        [DataRow(Viewer.Admin, true, HttpStatusCode.OK)]
        [DataRow(Viewer.ContributorEditor, true, HttpStatusCode.OK)]
        [DataRow(Viewer.ContributorViewer, true, HttpStatusCode.OK)]
        [DataRow(Viewer.OtherUser, true, HttpStatusCode.Forbidden)]
        [DataRow(Viewer.Anonymous, true, HttpStatusCode.Unauthorized)]
        public async Task GetContributors_AuthorizationMatrix(
            Viewer viewer, bool isPublic, HttpStatusCode expectedStatus)
        {
            var owner = await CreateUserAsync(Role.None, "owner_user", "owner@example.com");
            var family = await CreateFamilyAsync(owner, isPublic: isPublic);
            var contributorUser = await CreateUserAsync(Role.None, "existing_contrib", "contrib@example.com");
            await AddContributorAsync(family.Id, contributorUser, ContributorRole.Editor);

            var client = await ClientForAsync(viewer, owner, family);
            var response = await client.GetAsync($"/api/families/{family.Id}/contributors");
            Assert.AreEqual(expectedStatus, response.StatusCode);

            if (expectedStatus == HttpStatusCode.OK)
            {
                var contributors = await response.Content.ReadFromJsonAsync<List<FamilyContributorDto>>();
                Assert.IsNotNull(contributors);
                Assert.IsTrue(contributors.Count >= 2);
                Assert.IsTrue(contributors.Any(c => c.UserId == owner.Id && c.Role == ContributorRole.Owner));
                Assert.IsTrue(contributors.Any(c => c.UserId == contributorUser.Id && c.Role == ContributorRole.Editor));
            }
        }

        [TestMethod]
        public async Task GetContributors_Anonymous_ReturnsUnauthorized()
        {
            var response = await AnonymousClient.GetAsync($"/api/families/{Guid.NewGuid()}/contributors");
            Assert.AreEqual(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [TestMethod]
        public async Task GetContributors_NonOwner_ReturnsForbidden()
        {
            var owner = await CreateUserAsync(Role.None);
            var family = await CreateFamilyAsync(owner);
            var otherUser = await CreateUserAsync(Role.None);
            var client = CreateClient(true, otherUser);

            var response = await client.GetAsync($"/api/families/{family.Id}/contributors");
            Assert.AreEqual(HttpStatusCode.Forbidden, response.StatusCode);
        }

        [TestMethod]
        public async Task GetContributors_Owner_ReturnsContributors()
        {
            var owner = await CreateUserAsync(Role.None, "owner_user", "owner@example.com");
            var family = await CreateFamilyAsync(owner);
            var contributorUser = await CreateUserAsync(Role.None, "contrib_user", "contrib@example.com");
            await AddContributorAsync(family.Id, contributorUser, ContributorRole.Editor);

            var client = CreateClient(true, owner);
            var response = await client.GetAsync($"/api/families/{family.Id}/contributors");
            Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);

            var contributors = await response.Content.ReadFromJsonAsync<List<FamilyContributorDto>>();
            Assert.IsNotNull(contributors);
            // Returns both the owner and the contributor
            Assert.AreEqual(2, contributors.Count);
            Assert.AreEqual(owner.Id, contributors[0].UserId);
            Assert.AreEqual(ContributorRole.Owner, contributors[0].Role);
            Assert.AreEqual("owner@example.com", contributors[0].Email);
            Assert.AreEqual(contributorUser.Id, contributors[1].UserId);
            Assert.AreEqual(ContributorRole.Editor, contributors[1].Role);
            Assert.AreEqual("contrib@example.com", contributors[1].Email);
        }

        [TestMethod]
        public async Task GetContributors_Contributor_ReturnsContributors()
        {
            var owner = await CreateUserAsync(Role.None, "owner_user", "owner@example.com");
            var family = await CreateFamilyAsync(owner);
            var contributorUser = await CreateUserAsync(Role.None, "contrib_user", "contrib@example.com");
            await AddContributorAsync(family.Id, contributorUser, ContributorRole.Viewer);

            var client = CreateClient(true, contributorUser);
            var response = await client.GetAsync($"/api/families/{family.Id}/contributors");
            Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);

            var contributors = await response.Content.ReadFromJsonAsync<List<FamilyContributorDto>>();
            Assert.IsNotNull(contributors);
            Assert.AreEqual(2, contributors.Count);
            Assert.AreEqual(owner.Id, contributors[0].UserId);
            Assert.AreEqual(ContributorRole.Owner, contributors[0].Role);
            Assert.AreEqual(contributorUser.Id, contributors[1].UserId);
        }

        [TestMethod]
        public async Task AddContributor_Anonymous_ReturnsUnauthorized()
        {
            var response = await AnonymousClient.PostAsJsonAsync($"/api/families/{Guid.NewGuid()}/contributors", new AddFamilyContributorDto
            {
                Email = "someone@example.com",
                Role = ContributorRole.Viewer
            });
            Assert.AreEqual(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [TestMethod]
        public async Task AddContributor_NonOwner_ReturnsForbidden()
        {
            var owner = await CreateUserAsync(Role.None);
            var family = await CreateFamilyAsync(owner);
            var otherUser = await CreateUserAsync(Role.None);
            var client = CreateClient(true, otherUser);

            var response = await client.PostAsJsonAsync($"/api/families/{family.Id}/contributors", new AddFamilyContributorDto
            {
                Email = "someone@example.com",
                Role = ContributorRole.Viewer
            });
            Assert.AreEqual(HttpStatusCode.Forbidden, response.StatusCode);
        }

        [TestMethod]
        public async Task AddContributor_ByEmail_Success()
        {
            var owner = await CreateUserAsync(Role.None);
            var family = await CreateFamilyAsync(owner);
            var contributorUser = await CreateUserAsync(Role.None, "user_to_add", "user_to_add@example.com");

            var client = CreateClient(true, owner);
            var response = await client.PostAsJsonAsync($"/api/families/{family.Id}/contributors", new AddFamilyContributorDto
            {
                Email = "user_to_add@example.com",
                Role = ContributorRole.Editor
            });
            Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);

            var created = await response.Content.ReadFromJsonAsync<FamilyContributorDto>();
            Assert.IsNotNull(created);
            Assert.AreEqual(contributorUser.Id, created.UserId);
            Assert.AreEqual(ContributorRole.Editor, created.Role);
            Assert.AreEqual("user_to_add@example.com", created.Email);
        }

        [TestMethod]
        public async Task AddContributor_ByUserId_Success()
        {
            var owner = await CreateUserAsync(Role.None);
            var family = await CreateFamilyAsync(owner);
            var contributorUser = await CreateUserAsync(Role.None, "user_by_id", "user_by_id@example.com");

            var client = CreateClient(true, owner);
            var response = await client.PostAsJsonAsync($"/api/families/{family.Id}/contributors", new AddFamilyContributorDto
            {
                UserId = contributorUser.Id,
                Role = ContributorRole.Viewer
            });
            Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);

            var created = await response.Content.ReadFromJsonAsync<FamilyContributorDto>();
            Assert.IsNotNull(created);
            Assert.AreEqual(contributorUser.Id, created.UserId);
            Assert.AreEqual(ContributorRole.Viewer, created.Role);
        }

        [TestMethod]
        public async Task AddContributor_UpdatesExistingRole_Success()
        {
            var owner = await CreateUserAsync(Role.None);
            var family = await CreateFamilyAsync(owner);
            var contributorUser = await CreateUserAsync(Role.None, "user_role_update", "user_role_update@example.com");
            await AddContributorAsync(family.Id, contributorUser, ContributorRole.Viewer);

            var client = CreateClient(true, owner);
            var response = await client.PostAsJsonAsync($"/api/families/{family.Id}/contributors", new AddFamilyContributorDto
            {
                UserId = contributorUser.Id,
                Role = ContributorRole.Editor
            });
            Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);

            var updated = await response.Content.ReadFromJsonAsync<FamilyContributorDto>();
            Assert.IsNotNull(updated);
            Assert.AreEqual(ContributorRole.Editor, updated.Role);
        }

        [TestMethod]
        public async Task AddContributor_OwnerAddingSelf_ReturnsBadRequest()
        {
            var owner = await CreateUserAsync(Role.None, "self_owner", "self_owner@example.com");
            var family = await CreateFamilyAsync(owner);

            var client = CreateClient(true, owner);
            var response = await client.PostAsJsonAsync($"/api/families/{family.Id}/contributors", new AddFamilyContributorDto
            {
                UserId = owner.Id,
                Role = ContributorRole.Editor
            });
            Assert.AreEqual(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [TestMethod]
        public async Task AddContributor_UserNotFound_ReturnsNotFound()
        {
            var owner = await CreateUserAsync(Role.None);
            var family = await CreateFamilyAsync(owner);

            var client = CreateClient(true, owner);
            var response = await client.PostAsJsonAsync($"/api/families/{family.Id}/contributors", new AddFamilyContributorDto
            {
                Email = "nonexistent_email_never_logged_in@example.com",
                Role = ContributorRole.Viewer
            });
            Assert.AreEqual(HttpStatusCode.NotFound, response.StatusCode);
        }

        [TestMethod]
        public async Task DeleteContributor_Anonymous_ReturnsUnauthorized()
        {
            var response = await AnonymousClient.DeleteAsync($"/api/families/{Guid.NewGuid()}/contributors/{Guid.NewGuid()}");
            Assert.AreEqual(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [TestMethod]
        public async Task DeleteContributor_NonOwner_ReturnsForbidden()
        {
            var owner = await CreateUserAsync(Role.None);
            var family = await CreateFamilyAsync(owner);
            var contributorUser = await CreateUserAsync(Role.None);
            await AddContributorAsync(family.Id, contributorUser, ContributorRole.Viewer);

            var otherUser = await CreateUserAsync(Role.None);
            var client = CreateClient(true, otherUser);

            var response = await client.DeleteAsync($"/api/families/{family.Id}/contributors/{contributorUser.Id}");
            Assert.AreEqual(HttpStatusCode.Forbidden, response.StatusCode);
        }

        [TestMethod]
        public async Task DeleteContributor_Owner_Success()
        {
            var owner = await CreateUserAsync(Role.None);
            var family = await CreateFamilyAsync(owner);
            var contributorUser = await CreateUserAsync(Role.None);
            await AddContributorAsync(family.Id, contributorUser, ContributorRole.Viewer);

            var client = CreateClient(true, owner);
            var response = await client.DeleteAsync($"/api/families/{family.Id}/contributors/{contributorUser.Id}");
            Assert.AreEqual(HttpStatusCode.NoContent, response.StatusCode);

            // Verify contributor is gone (only owner remains)
            var getResponse = await client.GetAsync($"/api/families/{family.Id}/contributors");
            var contributors = await getResponse.Content.ReadFromJsonAsync<List<FamilyContributorDto>>();
            Assert.IsNotNull(contributors);
            Assert.AreEqual(1, contributors.Count);
            Assert.AreEqual(owner.Id, contributors[0].UserId);
            Assert.AreEqual(ContributorRole.Owner, contributors[0].Role);
            Assert.IsFalse(contributors.Any(c => c.UserId == contributorUser.Id));
        }

        [TestMethod]
        public async Task DeleteContributor_NotFound_ReturnsNotFound()
        {
            var owner = await CreateUserAsync(Role.None);
            var family = await CreateFamilyAsync(owner);

            var client = CreateClient(true, owner);
            var response = await client.DeleteAsync($"/api/families/{family.Id}/contributors/{Guid.NewGuid()}");
            Assert.AreEqual(HttpStatusCode.NotFound, response.StatusCode);
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
