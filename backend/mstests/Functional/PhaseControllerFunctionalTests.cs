using System.Net;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace ChemistryCafeAPI.Tests.Functional
{
    [TestClass]
    public class PhaseControllerFunctionalTests : BaseFunctionalTests
    {
        [TestMethod]
        public async Task GetPhases_Anonymous_IsAllowed()
        {
            var response = await AnonymousClient.GetAsync("/api/phases");
            Assert.AreNotEqual(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [TestMethod]
        public async Task GetPhaseById_Anonymous_IsAllowed()
        {
            var response = await AnonymousClient.GetAsync($"/api/phases/{Guid.NewGuid()}");
            Assert.AreNotEqual(HttpStatusCode.Unauthorized, response.StatusCode);
        }
    }
}
