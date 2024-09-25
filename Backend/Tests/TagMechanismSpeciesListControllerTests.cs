using Chemistry_Cafe_API.Controllers;
using Chemistry_Cafe_API.Models;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using MySqlConnector;

namespace Chemistry_Cafe_API.Tests
{
    [TestClass]
    public class TagMechanismSpeciesListControllerTests
    {
        readonly MySqlDataSource db = DBConnection.DataSource;
        
        [TestMethod]
        public async Task Get_retrieves_tagmechanismspecieslist()
        {
            var controller = new TagMechanismSpeciesListController(db);

            var result = await controller.Get() as List<TagMechanismSpeciesList>;

            Assert.IsNotNull(result);
        }

        [TestMethod]
        public async Task Creates_tagmechanismspecieslist()
        {
            var controller = new TagMechanismSpeciesListController(db);

            var tagMechanismSpeciesList = new TagMechanismSpeciesList
            {
                tag_mechanism_uuid = new Guid("02114e61-a4a6-48c0-9f99-3de4d20ab750"),
                species_uuid = new Guid("739289cd-1396-41f8-a3e5-415f6b1ccd07"),
                version = "1.0",
                isDel = false
            };

            var result = await controller.Create(tagMechanismSpeciesList) ;

            var getResult = await controller.Get(result);

            Assert.AreEqual(result, getResult.uuid);
        }

        [TestMethod]
        public async Task Updates_tagmechanismspecieslist()
        {
            var controller = new TagMechanismSpeciesListController(db);

            var tagMechanismSpeciesList = new TagMechanismSpeciesList
            {
                tag_mechanism_uuid = new Guid("02114e61-a4a6-48c0-9f99-3de4d20ab750"),
                species_uuid = new Guid("739289cd-1396-41f8-a3e5-415f6b1ccd07"),
                version = "1.0",
                isDel = false
            };

            var result = await controller.Create(tagMechanismSpeciesList);

            var getResult = await controller.Get(result);

            getResult.version = "Edited";

            await controller.Put(getResult);

            var getEditedResult = await controller.Get(result);

            await controller.Delete(result);

            Assert.AreEqual(getEditedResult.version, "Edited");
        }
    }
}
