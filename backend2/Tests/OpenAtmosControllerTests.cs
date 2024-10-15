using Chemistry_Cafe_API.Controllers;
using Chemistry_Cafe_API.Models;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using MySqlConnector;

namespace Chemistry_Cafe_API.Tests
{
    [TestClass]
    public class OpenAtmosControllerTests
    {
        readonly MySqlDataSource db = DBConnection.DataSource;
        
        [TestMethod]
        public async Task Get_retrieves_JSON()
        {
            var controller = new OpenAtmosController(db);

            var result = await controller.GetJSON(new Guid("dc6d0d7f-94f1-40d7-a0ae-8c5c7144cc5c"));

            Assert.IsNotNull(result);
        }

        [TestMethod]
        public async Task Get_retrieves_YAML()
        {
            var controller = new OpenAtmosController(db);

            var result = await controller.GetYAML(new Guid("dc6d0d7f-94f1-40d7-a0ae-8c5c7144cc5c"));

            Assert.IsNotNull(result);
        }

    }
}
