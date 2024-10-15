using Chemistry_Cafe_API.Controllers;
using Chemistry_Cafe_API.Models;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using MySqlConnector;

namespace Chemistry_Cafe_API.Tests
{
    [TestClass]
    public class PropertyVersionControllerTests
    {
        PropertyVersionController controller = new PropertyVersionController(DBConnection.DataSource);

        [TestMethod]
        public async Task Get_retrieves_propertyversion()
        {
            var result = await controller.Get() as List<PropertyVersion>;

            Assert.IsNotNull(result);
        }

        [TestMethod]
        public async Task Creates_propertyversion()
        {
            var propertyVersion = new PropertyVersion
            {
                parent_property_uuid = new Guid("343115be-8937-431d-bf65-ede6c2d815a7"),
                frozen_version = "1.0",
                tag_mechanism_uuid = new Guid("228c026a-c29e-4e7e-b5b8-772c82a22a40"),
                property_type = new Guid("b1f0efbc-1757-4d15-a199-66cf5f73d279"),
                user_uuid = new Guid("070465a1-5f3e-42eb-9373-fed864a75cf5"),
                string_value = "Test Property"
            };

            var result = await controller.Create(propertyVersion);

            var getResult = await controller.Get(result);

            Assert.AreEqual(result, getResult.uuid);
        }

        [TestMethod]
        public async Task Updates_propertyversion()
        {
            var propertyVersion = new PropertyVersion
            {
                parent_property_uuid = new Guid("343115be-8937-431d-bf65-ede6c2d815a7"),
                frozen_version = "1.0",
                tag_mechanism_uuid = new Guid("228c026a-c29e-4e7e-b5b8-772c82a22a40"),
                property_type = new Guid("b1f0efbc-1757-4d15-a199-66cf5f73d279"),
                user_uuid = new Guid("070465a1-5f3e-42eb-9373-fed864a75cf5"),
                string_value = "Test Property",
                isDel = false
            };

            var result = await controller.Create(propertyVersion);

            var getResult = await controller.Get(result);

            getResult.string_value = "Edited";

            await controller.Put(getResult);

            var getEditedResult = await controller.Get(result);

            await controller.Delete(result);

            Assert.AreEqual(getEditedResult.string_value, "Edited");
        }
    }
}
