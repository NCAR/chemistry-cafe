using System.Net;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace ChemistryCafeAPI.Tests.Functional
{
    [TestClass]
    public class OrcidOAuthControllerFunctionalTests : BaseFunctionalTests
    {
        [TestMethod]
        public async Task Login_Anonymous_IsAllowed()
        {
            // Anonymous requests should be allowed to access login without requiring authorization (returns challenge/redirect, not 401)
            var response = await AnonymousClient.GetAsync("/auth/orcid/login");
            Assert.AreNotEqual(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [TestMethod]
        public async Task Authenticate_Anonymous_IsAllowed()
        {
            // Endpoint is marked [AllowAnonymous], so unauthenticated request reaches controller (returns redirect to frontend, not 401)
            var response = await AnonymousClient.GetAsync("/auth/orcid/authenticate");
            Assert.AreNotEqual(HttpStatusCode.Unauthorized, response.StatusCode);
        }
    }
}
