using System.Net;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace ChemistryCafeAPI.Tests.Functional
{
    [TestClass]
    public class SpeciesControllerFunctionalTests : BaseFunctionalTests
    {
        [TestMethod]
        public async Task GetSpecies_Anonymous_IsAllowed()
        {
            var response = await AnonymousClient.GetAsync("/api/species");
            Assert.AreNotEqual(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [TestMethod]
        public async Task GetSpeciesById_Anonymous_IsAllowed()
        {
            var response = await AnonymousClient.GetAsync($"/api/species/{Guid.NewGuid()}");
            Assert.AreNotEqual(HttpStatusCode.Unauthorized, response.StatusCode);
        }
    }
}
