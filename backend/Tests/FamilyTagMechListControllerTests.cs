using Chemistry_Cafe_API.Controllers;
using Chemistry_Cafe_API.Models;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using MySqlConnector;

namespace Chemistry_Cafe_API.Tests
{
    [TestClass]
    public class FamilyTagMechListControllerTests
    {
        FamilyTagMechListController controller = new FamilyTagMechListController(DBConnection.DataSource);


        [TestMethod]
        public async Task Get_retrieves_familytagmechlist()
        {

            var result = await controller.Get() as List<FamilyTagMechList>;

            Assert.IsNotNull(result);
        }

        [TestMethod]
        public async Task Creates_familytagmechlist()
        {
            var familyTagMecList = new FamilyTagMechList
            {
                family_uuid = new Guid("085fd412-376d-4a89-ad43-18047058b635"),
                tag_mechanism_uuid = new Guid("1da51091-b9e8-42c7-911b-8e9f0d274f56"),
                version = "1.0"
            };

            var result = await controller.Create(familyTagMecList);

            var getResult = await controller.Get(result);

            Assert.AreEqual(result, getResult.uuid);
        }

        [TestMethod]
        public async Task Updates_familytagmechlist()
        {
            var familyTagMecList = new FamilyTagMechList
            {
                family_uuid = new Guid("085fd412-376d-4a89-ad43-18047058b635"),
                tag_mechanism_uuid = new Guid("1da51091-b9e8-42c7-911b-8e9f0d274f56"),
                version = "1.0",
                isDel = false
            };

            var result = await controller.Create(familyTagMecList);

            var getResult = await controller.Get(result);

            getResult.version = "Edited";

            await controller.Put(getResult);

            var getEdited = await controller.Get(result);

            await controller.Delete(result);

            Assert.AreEqual(getEdited.version, "Edited");
        }
    }
}
