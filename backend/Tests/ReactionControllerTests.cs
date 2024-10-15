﻿using Chemistry_Cafe_API.Controllers;
using Chemistry_Cafe_API.Models;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using MySqlConnector;

namespace Chemistry_Cafe_API.Tests
{
    [TestClass]
    public class ReactionControllerTests
    {
        ReactionController controller = new ReactionController(DBConnection.DataSource);

        [TestMethod]
        public async Task Get_retrieves_reaction()
        {
            var result = await controller.Get() as List<Reaction>;

            Assert.IsNotNull(result);
        }

        [TestMethod]
        public async Task Creates_reaction()
        {
            var result = await controller.Create("Test") ;

            var getResult = await controller.Get(result);

            Assert.AreEqual(result, getResult.uuid);
        }

        [TestMethod]
        public async Task Updates_reaction()
        {
            var result = await controller.Create("Test");

            var getResult = await controller.Get(result);

            getResult.type = "Edited";

            await controller.Put(getResult);

            var getEditedResult = await controller.Get(result);

            await controller.Delete(result);

            Assert.AreEqual(getEditedResult.type, "Edited");
        }
    }
}
