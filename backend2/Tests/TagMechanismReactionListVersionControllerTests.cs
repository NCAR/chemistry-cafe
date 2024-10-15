using Chemistry_Cafe_API.Controllers;
using Chemistry_Cafe_API.Models;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using MySqlConnector;

namespace Chemistry_Cafe_API.Tests
{
    [TestClass]
    public class TagMechanismReactionListVersionControllerTests
    {
        readonly MySqlDataSource db = DBConnection.DataSource;
        
        [TestMethod]
        public async Task Get_retrieves_TagMechanismReactionListVersion()
        {
            var controller = new TagMechanismReactionListVersionController(db);

            var result = await controller.Get() as List<TagMechanismReactionListVersion>;

            Assert.IsNotNull(result);
        }

        [TestMethod]
        public async Task Creates_TagMechanismReactionListVersion()
        {
            var controller = new TagMechanismReactionListVersionController(db);

            var familyTagMecList = new TagMechanismReactionListVersion
            {
                tag_mechanism_uuid = new Guid("02114e61-a4a6-48c0-9f99-3de4d20ab750"),
                reaction_uuid = new Guid("367f4b94-14f5-404e-86ee-1d5f799edcd7"),
                frozen_version = "1.0",
                user_uuid = new Guid("04c5db32-65e1-44ba-8b29-1cbfd5383789"),
                action = "test",
                datetime = DateTime.Now,
                isDel = false
            };

            var result = await controller.Create(familyTagMecList);

            var getResult = await controller.Get(result);

            Assert.AreEqual(result, getResult.uuid);
        }

        [TestMethod]
        public async Task Updates_TagMechanismReactionListVersion()
        {
            var controller = new TagMechanismReactionListVersionController(db);

            var familyTagMecList = new TagMechanismReactionListVersion
            {
                tag_mechanism_uuid = new Guid("02114e61-a4a6-48c0-9f99-3de4d20ab750"),
                reaction_uuid = new Guid("367f4b94-14f5-404e-86ee-1d5f799edcd7"),
                frozen_version = "1.0",
                user_uuid = new Guid("04c5db32-65e1-44ba-8b29-1cbfd5383789"),
                action = "test",
                datetime = DateTime.Now,
                isDel = false
            };

            var result = await controller.Create(familyTagMecList);

            var getResult = await controller.Get(result);

            getResult.action = "Edited";

            await controller.Put(getResult);

            var getEdited = await controller.Get(result);

            await controller.Delete(result);

            Assert.AreEqual(getEdited.action, "Edited");
        }
    }
}
