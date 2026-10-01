using System.Net;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace ChemistryCafeAPI.Tests.Functional
{
    [TestClass]
    public class MechanismControllerFunctionalTests : BaseFunctionalTests
    {
        [TestMethod]
        public async Task GetMechanisms_Anonymous_IsAllowed()
        {
            var response = await AnonymousClient.GetAsync("/api/mechanisms");
            Assert.AreNotEqual(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [TestMethod]
        public async Task GetMechanismById_Anonymous_IsAllowed()
        {
            var response = await AnonymousClient.GetAsync($"/api/mechanisms/{Guid.NewGuid()}");
            Assert.AreNotEqual(HttpStatusCode.Unauthorized, response.StatusCode);
        }
    }
}
