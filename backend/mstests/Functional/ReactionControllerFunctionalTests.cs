using System.Net;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace ChemistryCafeAPI.Tests.Functional
{
    [TestClass]
    public class ReactionControllerFunctionalTests : BaseFunctionalTests
    {
        [TestMethod]
        public async Task GetReactions_Anonymous_IsAllowed()
        {
            var response = await AnonymousClient.GetAsync("/api/reactions");
            Assert.AreNotEqual(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [TestMethod]
        public async Task GetReactionById_Anonymous_IsAllowed()
        {
            var response = await AnonymousClient.GetAsync($"/api/reactions/{Guid.NewGuid()}");
            Assert.AreNotEqual(HttpStatusCode.Unauthorized, response.StatusCode);
        }
    }
}
