using ChemistryCafeAPI.Models;
using ChemistryCafeAPI.Models.Dto;
using ChemistryCafeAPI.Services;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace ChemistryCafeAPI.Tests
{
    /// <summary>
    /// Runs the family visibility rule against MySQL. The functional tests use
    /// the InMemory provider, which does not translate queries to SQL.
    /// </summary>
    [TestClass]
    public class FamilyServiceVisibilityTests
    {
        private static User _owner = null!;
        private static User _otherUser = null!;
        private static User _contributorViewer = null!;
        private static User _contributorEditor = null!;
        private static Guid _publicId;
        private static Guid _privateId;

        [ClassInitialize]
        public static void ClassInit(TestContext context)
        {
            using ChemistryDbContext ctx = DBConnection.NewContext();
            var userService = new UserService(ctx);
            _owner = userService.SignInGoogle("visibility-owner-google-id", "visibility-owner@fake-website.com").Result;
            _otherUser = userService.SignInGoogle("visibility-other-google-id", "visibility-other@fake-website.com").Result;
            _contributorViewer = userService.SignInGoogle("visibility-contrib-viewer-google-id", "contrib-viewer@fake-website.com").Result;
            _contributorEditor = userService.SignInGoogle("visibility-contrib-editor-google-id", "contrib-editor@fake-website.com").Result;

            _publicId = CreateFamily("VisibilityPublic", isPublic: true);
            _privateId = CreateFamily("VisibilityPrivate", isPublic: false);

            var familyService = new FamilyService(ctx, userService);
            familyService.AddOrUpdateContributorAsync(_privateId, _contributorViewer.Id, null, ContributorRole.Viewer, _owner.Id.ToString()).Wait();
            familyService.AddOrUpdateContributorAsync(_privateId, _contributorEditor.Id, null, ContributorRole.Editor, _owner.Id.ToString()).Wait();
        }

        [ClassCleanup]
        public static void ClassCleanup()
        {
            using ChemistryDbContext ctx = DBConnection.NewContext();
            var familyService = new FamilyService(ctx);
            foreach (Guid id in new[] { _publicId, _privateId })
            {
                familyService.DeleteFamilyAsync(id, _owner.Id.ToString()).Wait();
            }
        }

        private static Guid CreateFamily(string name, bool isPublic)
        {
            using ChemistryDbContext ctx = DBConnection.NewContext();
            ctx.Attach(_owner);
            var dto = new FamilyDto { Id = Guid.NewGuid(), Name = name, IsPublic = isPublic };
            var (result, _) = new FamilyService(ctx).CreateFamilyAsync(dto, _owner).Result;
            Assert.AreEqual(QueryResult.Success, result);
            return dto.Id;
        }

        [TestMethod]
        [DataRow(Viewer.Anonymous, false)]
        [DataRow(Viewer.OtherUser, false)]
        [DataRow(Viewer.Owner, true)]
        [DataRow(Viewer.Admin, true)]
        [DataRow(Viewer.ContributorViewer, true)]
        [DataRow(Viewer.ContributorEditor, true)]
        public async Task Queries_ApplyVisibility(Viewer viewer, bool expectPrivateVisible)
        {
            User? user = viewer switch
            {
                Viewer.Anonymous => null,
                Viewer.Owner => _owner,
                Viewer.OtherUser => _otherUser,
                Viewer.Admin => new User { Id = Guid.NewGuid(), Role = Role.Admin },
                Viewer.ContributorViewer => _contributorViewer,
                Viewer.ContributorEditor => _contributorEditor,
                _ => throw new ArgumentOutOfRangeException(nameof(viewer)),
            };
            using ChemistryDbContext ctx = DBConnection.NewContext();
            var service = new FamilyService(ctx);

            var ids = (await service.GetFamiliesAsync(false, user)).Select(f => f.Id).ToList();
            CollectionAssert.Contains(ids, _publicId);
            Assert.AreEqual(expectPrivateVisible, ids.Contains(_privateId));
            Assert.AreEqual(expectPrivateVisible, await service.GetFamilyAsync(_privateId, user) != null);
        }
    }
}
